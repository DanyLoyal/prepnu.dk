import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDkk } from "@/lib/pricing/markup";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangleIcon } from "@/components/icons";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/lib/admin/labels";
import type { OrderStatus } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Ordrer" };
export const dynamic = "force-dynamic";

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; kraeverHandling?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const { status, kraeverHandling } = await searchParams;

  const orders = await prisma.order.findMany({
    where: {
      ...(status && status !== "ALLE" ? { status: status as OrderStatus } : {}),
      ...(kraeverHandling === "1" ? { requiresAction: true } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-font text-2xl font-semibold text-olive-950">Ordrer</h1>
        <p className="mt-1 text-sm text-stone-500">{orders.length} ordrer vist</p>
      </div>

      <Card className="p-4">
        <form className="flex flex-wrap items-end gap-3" method="get">
          <select name="status" defaultValue={status ?? "ALLE"} className="rounded-md border border-stone-300 px-3 py-2 text-sm">
            <option value="ALLE">Alle statusser</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input type="checkbox" name="kraeverHandling" value="1" defaultChecked={kraeverHandling === "1"} className="h-4 w-4" />
            Kun ordrer der kræver handling
          </label>
          <button type="submit" className="rounded-md bg-olive-900 px-4 py-2 text-sm font-semibold text-stone-50 hover:bg-olive-800">
            Filtrér
          </button>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3">Dato</th>
              <th className="px-5 py-3">Kunde</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-stone-50">
                <td className="px-5 py-3 text-stone-600">{order.createdAt.toLocaleDateString("da-DK")}</td>
                <td className="px-5 py-3">
                  <Link href={`/admin/ordrer/${order.id}`} className="font-medium text-olive-900 hover:text-orange-600">
                    {order.customerName}
                  </Link>
                  <p className="text-xs text-stone-500">{order.customerEmail}</p>
                </td>
                <td className="px-5 py-3 font-medium text-olive-950">{formatDkk(order.totalOre)}</td>
                <td className="px-5 py-3">
                  <Badge tone={ORDER_STATUS_TONES[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                </td>
                <td className="px-5 py-3">
                  {order.requiresAction ? <AlertTriangleIcon className="h-4 w-4 text-amber-600" /> : null}
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-stone-500">
                  Ingen ordrer matcher filteret.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
