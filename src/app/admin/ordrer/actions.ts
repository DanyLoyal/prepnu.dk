"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type { SupplierOrderStatus } from "@/generated/prisma/enums";

export interface OrderActionState {
  error?: string;
  success?: string;
}

export async function updateSupplierOrderTracking(
  supplierOrderId: string,
  orderId: string,
  _prevState: OrderActionState | undefined,
  formData: FormData,
): Promise<OrderActionState> {
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const trackingUrl = String(formData.get("trackingUrl") ?? "").trim();
  const supplierOrderRef = String(formData.get("supplierOrderRef") ?? "").trim();
  const status = String(formData.get("status") ?? "");

  const validStatuses: SupplierOrderStatus[] = ["AFVENTER", "BESTILT", "AFSENDT", "LEVERET", "FEJLET", "ANNULLERET"];
  if (!validStatuses.includes(status as SupplierOrderStatus)) {
    return { error: "Ugyldig status" };
  }

  await prisma.supplierOrder.update({
    where: { id: supplierOrderId },
    data: {
      trackingNumber: trackingNumber || null,
      trackingUrl: trackingUrl || null,
      supplierOrderRef: supplierOrderRef || null,
      status: status as SupplierOrderStatus,
    },
  });

  revalidatePath(`/admin/ordrer/${orderId}`);
  return { success: "Leverandørordre opdateret." };
}

export async function markOrderResolved(orderId: string): Promise<void> {
  await prisma.order.update({ where: { id: orderId }, data: { requiresAction: false } });
  revalidatePath(`/admin/ordrer/${orderId}`);
  revalidatePath("/admin/ordrer");
}

export async function refundOrder(
  orderId: string,
  _prevState: OrderActionState | undefined,
  formData: FormData,
): Promise<OrderActionState> {
  const amountKrRaw = String(formData.get("amountKr") ?? "").trim();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Ordren findes ikke." };
  if (!order.stripePaymentIntentId) return { error: "Ordren har ingen betaling at refundere." };

  const amountOre = amountKrRaw ? Math.round(Number(amountKrRaw) * 100) : undefined;
  if (amountKrRaw && (!Number.isFinite(amountOre) || (amountOre ?? 0) <= 0)) {
    return { error: "Angiv et gyldigt beløb." };
  }

  try {
    await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      ...(amountOre ? { amount: amountOre } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ukendt fejl";
    return { error: `Stripe-refundering mislykkedes: ${message}` };
  }

  const isFullRefund = !amountOre || amountOre >= order.totalOre;
  await prisma.order.update({
    where: { id: orderId },
    data: { status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED" },
  });

  revalidatePath(`/admin/ordrer/${orderId}`);
  revalidatePath("/admin/ordrer");
  return { success: "Refundering gennemført." };
}
