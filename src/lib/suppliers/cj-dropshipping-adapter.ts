import type {
  OrderPayload,
  SupplierAdapter,
  SupplierOrderResult,
  SupplierProduct,
  TrackingInfo,
} from "./types";
import { SupplierAdapterError } from "./types";

const BASE_URL = process.env.CJ_DROPSHIPPING_API_BASE_URL ?? "https://developers.cjdropshipping.com";
const API_KEY = process.env.CJ_DROPSHIPPING_API_KEY;

/**
 * Token-cache i process-hukommelse. CJ's getAccessToken må kun kaldes med et vist
 * interval (dokumentationen nævner min. 5 minutter mellem kald for samme konto), og
 * samme nøgle giver samme token igen inden for 24 timer — derfor caches den her i
 * stedet for at hente en ny ved hvert kald. ANTAGELSE: på serverless (Netlify)
 * genstartes denne cache ved cold start, hvilket i værste fald rammer 5-minutters-
 * begrænsningen ved høj trafik af cold starts — en persisteret token-cache (f.eks. i
 * databasen) er en oplagt forbedring hvis det bliver et problem i praksis.
 */
let tokenCache: { accessToken: string; refreshToken: string; expiresAt: number } | null = null;

interface CjResponse<T> {
  code: number;
  result: boolean;
  message: string;
  data: T;
}

async function getAccessToken(): Promise<string> {
  if (!API_KEY) {
    throw new SupplierAdapterError("cj_dropshipping", "CJ_DROPSHIPPING_API_KEY er ikke konfigureret");
  }
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const res = await fetch(`${BASE_URL}/api2.0/v1/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: API_KEY }),
  });
  const body = (await res.json()) as CjResponse<{
    accessToken: string;
    accessTokenExpiryDate: string;
    refreshToken: string;
  }>;
  if (!body.result) {
    throw new SupplierAdapterError("cj_dropshipping", `Login fejlede: ${body.message}`);
  }
  tokenCache = {
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken,
    expiresAt: new Date(body.data.accessTokenExpiryDate).getTime(),
  };
  return tokenCache.accessToken;
}

async function cjFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "CJ-Access-Token": token,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = (await res.json()) as CjResponse<T>;
  if (!body.result) {
    throw new SupplierAdapterError("cj_dropshipping", `HTTP-fejl på ${path}: ${body.message}`);
  }
  return body.data;
}

interface CjProductListItem {
  id: string;
  sku: string;
  nameEn: string;
  sellPrice: string;
  bigImage: string;
  warehouseInventoryNum: number;
}

export class CJDropshippingAdapter implements SupplierAdapter {
  id = "cj_dropshipping";

  /**
   * ANTAGELSE: sellPrice fra CJ er i USD, mens Product.costPriceOre i databasen
   * forudsætter DKK — denne adapter konverterer IKKE valuta. costPriceOre her er
   * reelt "USD-cent", ikke danske øre. Admin skal manuelt korrigere priser, eller
   * der skal tilføjes en rigtig valutakurs-konvertering, før auto-sync bruges til
   * at sætte salgspriser uden opsyn.
   */
  async syncProducts(): Promise<SupplierProduct[]> {
    const products: SupplierProduct[] = [];
    const maxPages = 50; // sikkerhedsgrænse, ~5000 produkter
    for (let page = 1; page <= maxPages; page++) {
      const data = await cjFetch<{ content: { productList: CjProductListItem[] }[] }>(
        `/api2.0/v1/product/listV2?page=${page}&size=100`,
      );
      const items = data.content.flatMap((c) => c.productList ?? []);
      if (items.length === 0) break;
      for (const item of items) {
        products.push({
          supplierSku: item.sku,
          name: item.nameEn,
          costPriceOre: Math.round(parseFloat(item.sellPrice) * 100),
          stock: item.warehouseInventoryNum,
          images: item.bigImage ? [item.bigImage] : undefined,
        });
      }
    }
    return products;
  }

  /**
   * ANTAGELSE: der er ikke fundet et dokumenteret enkelt-SKU-lageropslag i det
   * researchede materiale — keyWord-søgning bruges som tilnærmelse og kan i
   * sjældne tilfælde matche forkert produkt. Bør verificeres mod CJ's
   * lagerbeholdnings-endpoints (sektion "Query Inventory") før produktion.
   */
  async getStock(sku: string): Promise<number> {
    const data = await cjFetch<{ content: { productList: CjProductListItem[] }[] }>(
      `/api2.0/v1/product/listV2?page=1&size=1&keyWord=${encodeURIComponent(sku)}`,
    );
    const item = data.content.flatMap((c) => c.productList ?? [])[0];
    return item?.warehouseInventoryNum ?? 0;
  }

  /**
   * payType=2 (saldobetaling) antager at butikkens CJ-konto er forudfinansieret
   * med tilstrækkelig saldo til at dække ordren automatisk. ANTAGELSE: det fulde
   * forløb for saldobetaling (kurv → bekræft → træk) kunne ikke verificeres i
   * detaljer uden en levende konto — test grundigt i CJ's sandbox/testmiljø
   * (isSandbox) før brug i produktion.
   */
  async placeOrder(order: OrderPayload): Promise<SupplierOrderResult> {
    const data = await cjFetch<{ orderId: string; orderNumber: string }>(
      "/api2.0/v1/shopping/order/createOrderV2",
      {
        method: "POST",
        body: JSON.stringify({
          orderNumber: order.orderId,
          payType: 2,
          shippingCountryCode: order.shipping.country,
          shippingCountry: order.shipping.country,
          shippingProvince: order.shipping.city,
          shippingCity: order.shipping.city,
          shippingZip: order.shipping.postalCode,
          shippingCustomerName: order.shipping.name,
          shippingAddress: order.shipping.addressLine1,
          shippingAddress2: order.shipping.addressLine2,
          shippingPhone: order.shipping.phone,
          email: order.shipping.email,
          fromCountryCode: "CN",
          logisticName: "CJPacket",
          // iossType=3: deklarér under CJ's eget IOSS-nummer. CJ opkræver et
          // håndteringsgebyr for dette, men vi undgår selv at skulle have en
          // EU-IOSS-registrering. Uden IOSS kan danske kunder risikere både
          // dansk moms (allerede opkrævet ved Stripe-checkout) OG dansk told-
          // moms ved levering — se beslutning i commit-besked.
          iossType: 3,
          products: order.lines.map((line) => ({
            sku: line.supplierSku,
            quantity: line.quantity,
          })),
        }),
      },
    );

    return {
      supplierOrderRef: data.orderId,
      raw: data,
    };
  }

  async getTracking(supplierOrderId: string): Promise<TrackingInfo | null> {
    const data = await cjFetch<{
      trackNumber?: string;
      trackingUrl?: string;
      trackingProvider?: string;
    }>(`/api2.0/v1/shopping/order/getOrderDetail?orderId=${encodeURIComponent(supplierOrderId)}`);

    if (!data.trackNumber) return null;
    return {
      trackingNumber: data.trackNumber,
      trackingUrl: data.trackingUrl,
      carrier: data.trackingProvider,
    };
  }
}
