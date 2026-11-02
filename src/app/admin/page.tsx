import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDkk } from "@/lib/pricing/markup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangleIcon, PackageIcon, TruckIcon } from "@/components/icons";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/lib/admin/labels";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboardPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    revenueThisMonth,
    ordersToday,
    ordersRequiringAction,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { totalOre: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { requiresAction: true } }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
      take: 8,
      select: { id: true, name: true, stock: true, slug: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        customerName: true,
        totalOre: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    { label: "Omsætning (måned)", value: formatDkk(revenueThisMonth._sum.totalOre ?? 0) },
    { label: "Ordrer i dag", value: String(ordersToday) },
    { label: "Kræver handling", value: String(ordersRequiringAction), warn: ordersRequiringAction > 0 },
    { label: "Lav lagerstatus", value: String(lowStockProducts.length), warn: lowStockProducts.length > 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-font text-2xl font-semibold text-olive-950">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-500">Overblik over butikkens drift lige nu.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{stat.label}</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                stat.warn ? "text-amber-600" : "text-olive-950"
              }`}
            >
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Seneste ordrer</CardTitle>
            <Link href="/admin/ordrer" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
              Se alle →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <p className="px-5 py-6 text-sm text-stone-500">Ingen ordrer endnu.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-5 py-3">
                        <Link href={`/admin/ordrer/${order.id}`} className="font-medium text-olive-900 hover:text-orange-600">
                          {order.customerName}
                        </Link>
                        <p className="text-xs text-stone-500">
                          {order.createdAt.toLocaleDateString("da-DK")}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={ORDER_STATUS_TONES[order.status]}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-olive-950">
                        {formatDkk(order.totalOre)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <PackageIcon className="h-4 w-4 text-amber-600" />
            <CardTitle>Lav lagerstatus</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockProducts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-stone-500">Alt ser fint ud på lager.</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {lowStockProducts.map((product) => (
                  <li key={product.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <Link href={`/admin/produkter/${product.id}`} className="font-medium text-olive-900 hover:text-orange-600">
                      {product.name}
                    </Link>
                    <Badge tone={product.stock === 0 ? "danger" : "warning"}>
                      {product.stock} stk
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {ordersRequiringAction > 0 ? (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangleIcon className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              <strong>{ordersRequiringAction}</strong> ordre(r) kræver din opmærksomhed — f.eks. en
              fejlet leverandørbestilling.{" "}
              <Link href="/admin/ordrer?kraeverHandling=1" className="font-semibold underline">
                Se dem her
              </Link>
              .
            </p>
          </div>
        </Card>
      ) : null}

      <Card className="p-5">
        <div className="flex items-center gap-2 text-stone-500">
          <TruckIcon className="h-4 w-4" />
          <p className="text-sm">
            Husk at tjekke leverandørstatus under{" "}
            <Link href="/admin/leverandoerer" className="font-semibold text-orange-600 hover:text-orange-700">
              Leverandører
            </Link>{" "}
            efter en synkronisering.
          </p>
        </div>
      </Card>
    </div>
  );
}
