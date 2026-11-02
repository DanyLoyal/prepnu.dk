import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDkk } from "@/lib/pricing/markup";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { PlusIcon } from "@/components/icons";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_TONES } from "@/lib/admin/labels";
import type { ProductStatus } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Produkter" };
export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const { q, status } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(status && status !== "ALLE" ? { status: status as ProductStatus } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { category: true, supplier: true },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-2xl font-semibold text-olive-950">Produkter</h1>
          <p className="mt-1 text-sm text-stone-500">{products.length} produkter vist</p>
        </div>
        <LinkButton href="/admin/produkter/ny">
          <PlusIcon className="h-4 w-4" />
          Nyt produkt
        </LinkButton>
      </div>

      <Card className="p-4">
        <form className="flex flex-wrap items-end gap-3" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Søg på navn..."
            className="w-64 rounded-md border border-stone-300 px-3 py-2 text-sm"
          />
          <select
            name="status"
            defaultValue={status ?? "ALLE"}
            className="rounded-md border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="ALLE">Alle statusser</option>
            <option value="DRAFT">Kladde</option>
            <option value="PUBLISHED">Publiceret</option>
            <option value="PAUSED">Pauset</option>
          </select>
          <button type="submit" className="rounded-md bg-olive-900 px-4 py-2 text-sm font-semibold text-stone-50 hover:bg-olive-800">
            Filtrér
          </button>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3">Navn</th>
              <th className="px-5 py-3">Kategori</th>
              <th className="px-5 py-3">Leverandør</th>
              <th className="px-5 py-3">Pris</th>
              <th className="px-5 py-3">Lager</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50">
                <td className="px-5 py-3">
                  <Link href={`/admin/produkter/${product.id}`} className="font-medium text-olive-900 hover:text-orange-600">
                    {product.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-stone-600">{product.category.name}</td>
                <td className="px-5 py-3 text-stone-600">{product.supplier.name}</td>
                <td className="px-5 py-3 font-medium text-olive-950">{formatDkk(product.sellingPriceOre)}</td>
                <td className="px-5 py-3">
                  <Badge tone={product.stock === 0 ? "danger" : product.stock <= 5 ? "warning" : "neutral"}>
                    {product.stock} stk
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={PRODUCT_STATUS_TONES[product.status]}>{PRODUCT_STATUS_LABELS[product.status]}</Badge>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-stone-500">
                  Ingen produkter matcher søgningen.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
