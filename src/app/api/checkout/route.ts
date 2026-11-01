import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const items: CheckoutItemInput[] = Array.isArray(body?.items)
    ? body.items
        .filter(
          (item: unknown): item is CheckoutItemInput =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as CheckoutItemInput).productId === "string" &&
            Number.isInteger((item as CheckoutItemInput).quantity) &&
            (item as CheckoutItemInput).quantity > 0,
        )
    : [];
  const ageVerified = body?.ageVerified === true;

  if (items.length === 0) {
    return NextResponse.json({ error: "Kurven er tom" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) }, status: "PUBLISHED" },
  });

  const lineItems: {
    productId: string;
    name: string;
    quantity: number;
    unitPriceOre: number;
  }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: "Et produkt findes ikke længere" }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `${product.name} har ikke nok på lager` },
        { status: 400 },
      );
    }
    lineItems.push({
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      unitPriceOre: product.sellingPriceOre,
    });
  }

  const requiresAgeCheck = products.some((p) => p.requiresAgeCheck);
  if (requiresAgeCheck && !ageVerified) {
    return NextResponse.json(
      { error: "Aldersbekræftelse (18+) er påkrævet for en eller flere varer i kurven" },
      { status: 400 },
    );
  }

  const subtotalOre = lineItems.reduce((sum, item) => sum + item.unitPriceOre * item.quantity, 0);

  const shippingRates = await prisma.shippingRate.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const storeSettings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  const freeShippingThresholdOre = storeSettings?.freeShippingOverOre ?? null;

  if (shippingRates.length === 0) {
    return NextResponse.json({ error: "Ingen fragtmuligheder er konfigureret" }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "da",
    shipping_address_collection: { allowed_countries: ["DK"] },
    phone_number_collection: { enabled: true },
    line_items: lineItems.map((item) => ({
      quantity: item.quantity,
      metadata: { productId: item.productId },
      price_data: {
        currency: "dkk",
        unit_amount: item.unitPriceOre,
        product_data: { name: item.name },
      },
    })),
    shipping_options: shippingRates.map((rate) => {
      const threshold = rate.freeShippingOverOre ?? freeShippingThresholdOre;
      const isFree = threshold !== null && subtotalOre >= threshold;
      return {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: `${rate.carrier} – ${rate.name}`,
          fixed_amount: { amount: isFree ? 0 : rate.priceOre, currency: "dkk" },
        },
      };
    }),
    metadata: { ageVerified: String(ageVerified) },
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Kunne ikke oprette betaling" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
