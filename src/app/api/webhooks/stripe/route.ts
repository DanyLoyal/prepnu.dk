import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { VAT_RATE } from "@/lib/pricing/markup";
import { getSupplierAdapter } from "@/lib/suppliers/registry";
import type { OrderPayload } from "@/lib/suppliers/types";

async function placeSupplierOrders(
  orderId: string,
  lineItems: Stripe.ApiList<Stripe.LineItem>,
  shipping: OrderPayload["shipping"],
) {
  const alreadyPlaced = await prisma.supplierOrder.findFirst({ where: { orderId } });
  if (alreadyPlaced) return;

  const productIds = lineItems.data
    .map((item) => item.metadata?.productId)
    .filter((id): id is string => !!id);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { supplier: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const bySupplier = new Map<
    string,
    { supplierType: string; lines: { supplierSku: string; quantity: number }[] }
  >();

  for (const item of lineItems.data) {
    const productId = item.metadata?.productId;
    const product = productId ? productMap.get(productId) : undefined;
    if (!product || !item.quantity) continue;

    const group = bySupplier.get(product.supplierId) ?? {
      supplierType: product.supplier.type,
      lines: [],
    };
    group.lines.push({ supplierSku: product.supplierSku, quantity: item.quantity });
    bySupplier.set(product.supplierId, group);
  }

  for (const [supplierId, group] of bySupplier) {
    const supplierOrder = await prisma.supplierOrder.create({
      data: { orderId, supplierId, status: "AFVENTER" },
    });

    try {
      const adapter = getSupplierAdapter(group.supplierType);
      const result = await adapter.placeOrder({
        orderId,
        lines: group.lines,
        shipping,
      });

      // ManualAdapter opretter ikke en rigtig ekstern ordre — den skal blive i
      // AFVENTER til en admin har bestilt hos leverandøren manuelt, jf. kommentar
      // i manual-adapter.ts.
      const status = group.supplierType === "MANUAL" ? "AFVENTER" : "BESTILT";

      await prisma.supplierOrder.update({
        where: { id: supplierOrder.id },
        data: { status, supplierOrderRef: result.supplierOrderRef },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.supplierOrder.update({
        where: { id: supplierOrder.id },
        data: { status: "FEJLET", lastErrorText: message },
      });
      await prisma.order.update({ where: { id: orderId }, data: { requiresAction: true } });
      await prisma.supplier
        .update({
          where: { id: supplierId },
          data: { lastErrorAt: new Date(), lastErrorText: message, status: "ERROR" },
        })
        .catch(() => {});
    }
  }
}

function extractCustomerAndShipping(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name ?? session.collected_information?.shipping_details?.name;
  const shippingAddress = session.collected_information?.shipping_details?.address;

  if (!customerEmail || !customerName || !shippingAddress?.line1 || !shippingAddress.postal_code || !shippingAddress.city) {
    throw new Error(`Checkout session ${session.id} mangler påkrævede kunde-/leveringsoplysninger`);
  }

  return {
    customerEmail,
    customerName,
    shippingAddress,
    shippingAddressLine1: shippingAddress.line1,
    shippingPostalCode: shippingAddress.postal_code,
    shippingCity: shippingAddress.city,
    shippingCountry: shippingAddress.country ?? "DK",
  };
}

async function fulfillPaidOrder(orderId: string, session: Stripe.Checkout.Session) {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
  const { customerEmail, customerName, shippingAddress, shippingAddressLine1, shippingPostalCode, shippingCity, shippingCountry } =
    extractCustomerAndShipping(session);

  await placeSupplierOrders(orderId, lineItems, {
    name: customerName,
    addressLine1: shippingAddressLine1,
    addressLine2: shippingAddress.line2 ?? undefined,
    postalCode: shippingPostalCode,
    city: shippingCity,
    country: shippingCountry,
    phone: session.customer_details?.phone ?? undefined,
    email: customerEmail,
  });
}

async function createOrderFromSession(session: Stripe.Checkout.Session) {
  const existing = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
  if (existing) return;

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

  const {
    customerEmail,
    customerName,
    shippingAddress,
    shippingAddressLine1,
    shippingPostalCode,
    shippingCity,
    shippingCountry,
  } = extractCustomerAndShipping(session);

  const shippingOre = session.shipping_cost?.amount_total ?? 0;
  const subtotalOre = lineItems.data.reduce(
    (sum, item) => sum + (item.amount_subtotal ?? 0),
    0,
  );
  const vatOre = Math.round(subtotalOre * VAT_RATE / (1 + VAT_RATE));
  const totalOre = subtotalOre + shippingOre;
  const ageVerified = session.metadata?.ageVerified === "true";

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        status: session.payment_status === "paid" ? "PAID" : "REQUIRES_ACTION",
        requiresAction: session.payment_status !== "paid",
        customerEmail,
        customerName,
        shippingAddressLine1,
        shippingAddressLine2: shippingAddress.line2 ?? undefined,
        shippingPostalCode,
        shippingCity,
        shippingCountry,
        subtotalOre,
        shippingOre,
        vatOre,
        totalOre,
        ageVerified,
      },
    });

    for (const item of lineItems.data) {
      const productId = item.metadata?.productId;
      if (!productId || !item.quantity) continue;

      await tx.orderLine.create({
        data: {
          orderId: createdOrder.id,
          productId,
          quantity: item.quantity,
          unitPriceOre: item.price?.unit_amount ?? 0,
        },
      });

      await tx.product.updateMany({
        where: { id: productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return createdOrder;
  });

  // Leverandørbestilling sker uden for DB-transaktionen, da den involverer
  // eksterne HTTP-kald der ikke bør holde en åben transaktion.
  if (order.status === "PAID") {
    await fulfillPaidOrder(order.id, session);
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Invalid signature: ${message}` }, { status: 400 });
  }

  const alreadyProcessed = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: event.id },
  });
  if (alreadyProcessed) {
    return NextResponse.json({ received: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await createOrderFromSession(session);
      break;
    }

    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const order = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID", requiresAction: false },
        });
        await fulfillPaidOrder(order.id, session);
      }
      break;
    }

    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: "CANCELLED" },
      });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string" ? charge.payment_intent : undefined;
      if (paymentIntentId) {
        await prisma.order.updateMany({
          where: { stripePaymentIntentId: paymentIntentId },
          data: {
            status: charge.amount_refunded >= charge.amount ? "REFUNDED" : "PARTIALLY_REFUNDED",
          },
        });
      }
      break;
    }

    default:
      break;
  }

  await prisma.webhookEvent.create({
    data: { stripeEventId: event.id, type: event.type },
  });

  return NextResponse.json({ received: true });
}
