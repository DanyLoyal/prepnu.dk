import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { VAT_RATE } from "@/lib/pricing/markup";

async function createOrderFromSession(session: Stripe.Checkout.Session) {
  const existing = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
  if (existing) return;

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name ?? session.collected_information?.shipping_details?.name;
  const shippingAddress = session.collected_information?.shipping_details?.address;

  if (!customerEmail || !customerName || !shippingAddress?.line1 || !shippingAddress.postal_code || !shippingAddress.city) {
    throw new Error(`Checkout session ${session.id} completed without required customer/shipping details`);
  }

  const shippingAddressLine1 = shippingAddress.line1;
  const shippingPostalCode = shippingAddress.postal_code;
  const shippingCity = shippingAddress.city;

  const shippingOre = session.shipping_cost?.amount_total ?? 0;
  const subtotalOre = lineItems.data.reduce(
    (sum, item) => sum + (item.amount_subtotal ?? 0),
    0,
  );
  const vatOre = Math.round(subtotalOre * VAT_RATE / (1 + VAT_RATE));
  const totalOre = subtotalOre + shippingOre;
  const ageVerified = session.metadata?.ageVerified === "true";

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
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
        shippingCountry: shippingAddress.country ?? "DK",
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
          orderId: order.id,
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
  });
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
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: "PAID", requiresAction: false },
      });
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
