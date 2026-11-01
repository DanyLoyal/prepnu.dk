import type {
  OrderPayload,
  SupplierAdapter,
  SupplierOrderResult,
  SupplierProduct,
  TrackingInfo,
} from "./types";
import { SupplierAdapterError } from "./types";

const BASE_URL = process.env.BIGBUY_API_BASE_URL ?? "https://api.sandbox.bigbuy.eu";
const API_KEY = process.env.BIGBUY_API_KEY;
// ANTAGELSE: BigBuys eksempel-carriers (gls, correos, seur, dachser m.fl.) er primært
// spanske/europæiske speditører — hvilke af dem der reelt leverer til Danmark er ikke
// verificeret uden en levende BigBuy-konto. "gls" er valgt som standard da GLS også
// opererer i Danmark, men listen bør krydstjekkes mod GET /rest/shipping/carriers.json.
const DEFAULT_CARRIERS = [{ name: "gls" }];
// ANTAGELSE: paymentMethod afhænger af hvilken betalingsaftale butikkens BigBuy-
// distributørkonto har (kontosaldo/bankoverførsel) — "moneybox" (kontosaldo) er valgt
// som fornuftigt standardgæt, men bør bekræftes med BigBuy ved kontooprettelse.
const PAYMENT_METHOD = process.env.BIGBUY_PAYMENT_METHOD ?? "moneybox";
// ANTAGELSE: dansk sprogstøtte (isoCode "da") er ikke bekræftet i brugerguiden —
// "en" bruges som sikkert fallback for produkttekster.
const ISO_CODE = "en";

async function bigbuyFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_KEY) {
    throw new SupplierAdapterError("bigbuy", "BIGBUY_API_KEY er ikke konfigureret");
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new SupplierAdapterError("bigbuy", `HTTP ${res.status} på ${path}: ${body}`);
  }
  return res.json() as Promise<T>;
}

interface BigBuyTaxonomy {
  id: number;
}

interface BigBuyProduct {
  id: number;
  sku: string;
  wholesalePrice: number;
  active: number;
}

interface BigBuyProductInformation {
  id: number;
  sku: string;
  name: string;
  description: string;
}

interface BigBuyStockEntry {
  id: number;
  sku: string;
  stocks: { quantity: number }[];
}

interface BigBuyProductImages {
  id: number;
  images: { url: string }[];
}

function totalStock(entry: BigBuyStockEntry | undefined): number {
  if (!entry) return 0;
  return entry.stocks.reduce((sum, s) => sum + s.quantity, 0);
}

async function syncTaxonomy(taxonomyId: number): Promise<SupplierProduct[]> {
  const [products, information, stock, images] = await Promise.all([
    bigbuyFetch<BigBuyProduct[]>(`/rest/catalog/products.json?parentTaxonomy=${taxonomyId}`),
    bigbuyFetch<BigBuyProductInformation[]>(
      `/rest/catalog/productsinformation.json?isoCode=${ISO_CODE}&parentTaxonomy=${taxonomyId}`,
    ),
    bigbuyFetch<BigBuyStockEntry[]>(
      `/rest/catalog/productsstockbyhandlingdays.json?parentTaxonomy=${taxonomyId}`,
    ),
    bigbuyFetch<BigBuyProductImages[]>(
      `/rest/catalog/productsimages.json?parentTaxonomy=${taxonomyId}`,
    ),
  ]);

  const infoBySku = new Map(information.map((i) => [i.sku, i]));
  const stockBySku = new Map(stock.map((s) => [s.sku, s]));
  const imagesById = new Map(images.map((i) => [i.id, i.images.map((img) => img.url)]));

  return products
    .filter((p) => p.active === 1)
    .map((p) => ({
      supplierSku: p.sku,
      name: infoBySku.get(p.sku)?.name ?? p.sku,
      description: infoBySku.get(p.sku)?.description,
      costPriceOre: Math.round(p.wholesalePrice * 100),
      stock: totalStock(stockBySku.get(p.sku)),
      images: imagesById.get(p.id),
    }));
}

export class BigBuyAdapter implements SupplierAdapter {
  id = "bigbuy";

  /**
   * Henter hele kataloget ved først at slå alle 1.-niveau-taksonomier op og så
   * synkronisere hver af dem. Dette er en tung operation (mange kald) og bør
   * køres fra en cron-rute, ikke ved hver sidevisning.
   */
  async syncProducts(): Promise<SupplierProduct[]> {
    const taxonomies = await bigbuyFetch<BigBuyTaxonomy[]>(
      "/rest/catalog/taxonomies.json?firstLevel",
    );
    const results = await Promise.all(taxonomies.map((t) => syncTaxonomy(t.id)));
    return results.flat();
  }

  /**
   * ANTAGELSE: Brugerguiden beskriver intet enkelt-SKU-lageropslag, så dette slår
   * hele kataloget op og filtrerer. Bør ikke kaldes hyppigt — brug syncProducts()
   * fra en cron og læs lager fra databasen i stedet, hvis muligt.
   */
  async getStock(sku: string): Promise<number> {
    const all = await this.syncProducts();
    return all.find((p) => p.supplierSku === sku)?.stock ?? 0;
  }

  async placeOrder(order: OrderPayload): Promise<SupplierOrderResult> {
    const [firstName, ...rest] = order.shipping.name.split(" ");
    const lastName = rest.join(" ") || firstName;

    const body = {
      order: {
        internalReference: order.orderId,
        language: ISO_CODE,
        paymentMethod: PAYMENT_METHOD,
        carriers: DEFAULT_CARRIERS,
        shippingAddress: {
          firstName,
          lastName,
          country: order.shipping.country,
          postcode: order.shipping.postalCode,
          town: order.shipping.city,
          address: [order.shipping.addressLine1, order.shipping.addressLine2]
            .filter(Boolean)
            .join(", "),
          phone: order.shipping.phone ?? "",
          email: order.shipping.email ?? "",
          comment: "",
        },
        products: order.lines.map((line) => ({
          reference: line.supplierSku,
          quantity: line.quantity,
        })),
      },
    };

    const check = await bigbuyFetch<{ errors: unknown[] }>(
      "/rest/order/check/multishipping.json",
      { method: "POST", body: JSON.stringify(body) },
    );
    if (check.errors.length > 0) {
      throw new SupplierAdapterError(
        "bigbuy",
        `Ordre-validering fejlede: ${JSON.stringify(check.errors)}`,
      );
    }

    const created = await bigbuyFetch<{
      orders: { id: string }[];
      errors: unknown[];
    }>("/rest/order/create/multishipping.json", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (created.orders.length === 0) {
      throw new SupplierAdapterError(
        "bigbuy",
        `Ordre blev ikke oprettet: ${JSON.stringify(created.errors)}`,
      );
    }

    return {
      supplierOrderRef: created.orders[0].id,
      raw: created,
    };
  }

  /**
   * ANTAGELSE: Brugerguiden dokumenterer ikke et enkelt tracking-endpoint eller
   * dets felter. Dette forsøger GET /rest/order/{id}.json og læser almindelige
   * feltnavne defensivt — skal verificeres mod en levende konto.
   */
  async getTracking(supplierOrderId: string): Promise<TrackingInfo | null> {
    try {
      const data = await bigbuyFetch<Record<string, unknown>>(
        `/rest/order/${supplierOrderId}.json`,
      );
      const trackingNumber = (data.trackingNumber ?? data.carrierTrackingNumber) as
        | string
        | undefined;
      if (!trackingNumber) return null;
      return {
        trackingNumber,
        trackingUrl: data.trackingUrl as string | undefined,
        carrier: data.carrier as string | undefined,
      };
    } catch {
      return null;
    }
  }
}
