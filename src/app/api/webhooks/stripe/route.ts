import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

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
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: session.payment_status === "paid" ? "PAID" : "REQUIRES_ACTION",
          requiresAction: session.payment_status !== "paid",
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        },
      });
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
