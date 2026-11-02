import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDkk } from "@/lib/pricing/markup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SupplierOrderTrackingForm } from "@/components/admin/supplier-order-tracking-form";
import { RefundForm } from "@/components/admin/refund-form";
import { markOrderResolved } from "@/app/admin/ordrer/actions";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  SUPPLIER_ORDER_STATUS_LABELS,
  SUPPLIER_ORDER_STATUS_TONES,
} from "@/lib/admin/labels";

export const metadata: Metadata = { title: "Ordredetaljer" };
export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderLines: { include: { product: true } },
      supplierOrders: { include: { supplier: true } },
    },
  });

  if (!order) notFound();

  const boundResolve = markOrderResolved.bind(null, order.id);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-2xl font-semibold text-olive-950">
            Ordre {order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {order.createdAt.toLocaleString("da-DK")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={ORDER_STATUS_TONES[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
          {order.requiresAction ? (
            <form action={boundResolve}>
              <Button type="submit" variant="outline" size="sm">
                Markér som løst
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Varer</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-stone-100">
                {order.orderLines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-5 py-3">{line.product.name}</td>
                    <td className="px-5 py-3 text-stone-500">x{line.quantity}</td>
                    <td className="px-5 py-3 text-right font-medium text-olive-950">
                      {formatDkk(line.unitPriceOre * line.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-stone-200 text-sm">
                <tr>
                  <td className="px-5 py-2 text-stone-500" colSpan={2}>Subtotal</td>
                  <td className="px-5 py-2 text-right">{formatDkk(order.subtotalOre)}</td>
                </tr>
                <tr>
                  <td className="px-5 py-2 text-stone-500" colSpan={2}>Fragt</td>
                  <td className="px-5 py-2 text-right">{formatDkk(order.shippingOre)}</td>
                </tr>
                <tr>
                  <td className="px-5 py-2 text-stone-500" colSpan={2}>Moms (inkl.)</td>
                  <td className="px-5 py-2 text-right">{formatDkk(order.vatOre)}</td>
                </tr>
                <tr className="font-semibold text-olive-950">
                  <td className="px-5 py-2" colSpan={2}>Total</td>
                  <td className="px-5 py-2 text-right">{formatDkk(order.totalOre)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kunde</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-stone-700">
            <p className="font-medium text-olive-950">{order.customerName}</p>
            <p>{order.customerEmail}</p>
            <p className="pt-2">{order.shippingAddressLine1}</p>
            {order.shippingAddressLine2 ? <p>{order.shippingAddressLine2}</p> : null}
            <p>
              {order.shippingPostalCode} {order.shippingCity}
            </p>
            <p>{order.shippingCountry}</p>
            {order.ageVerified ? <Badge tone="info" className="mt-2">18+ bekræftet</Badge> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Refundering</CardTitle>
        </CardHeader>
        <CardContent>
          {order.stripePaymentIntentId ? (
            <RefundForm orderId={order.id} maxKr={order.totalOre / 100} />
          ) : (
            <p className="text-sm text-stone-500">Ordren har ingen tilknyttet betaling at refundere.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leverandørordrer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {order.supplierOrders.length === 0 ? (
            <p className="text-sm text-stone-500">Ingen leverandørordrer er oprettet endnu.</p>
          ) : (
            order.supplierOrders.map((supplierOrder) => (
              <div key={supplierOrder.id} className="rounded-lg border border-stone-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium text-olive-950">{supplierOrder.supplier.name}</p>
                  <Badge tone={SUPPLIER_ORDER_STATUS_TONES[supplierOrder.status]}>
                    {SUPPLIER_ORDER_STATUS_LABELS[supplierOrder.status]}
                  </Badge>
                </div>
                {supplierOrder.lastErrorText ? (
                  <p className="mb-3 rounded bg-red-50 px-3 py-2 text-xs text-red-700">
                    {supplierOrder.lastErrorText}
                  </p>
                ) : null}
                <SupplierOrderTrackingForm
                  supplierOrderId={supplierOrder.id}
                  orderId={order.id}
                  defaults={{
                    status: supplierOrder.status,
                    supplierOrderRef: supplierOrder.supplierOrderRef ?? "",
                    trackingNumber: supplierOrder.trackingNumber ?? "",
                    trackingUrl: supplierOrder.trackingUrl ?? "",
                  }}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
