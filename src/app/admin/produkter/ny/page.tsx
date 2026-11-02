import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/app/admin/produkter/actions";

export const metadata: Metadata = { title: "Nyt produkt" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, suppliers] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="heading-font text-2xl font-semibold text-olive-950">Nyt produkt</h1>
        <p className="mt-1 text-sm text-stone-500">Udfyld felterne og gem for at oprette produktet.</p>
      </div>
      <ProductForm
        action={createProduct}
        categories={categories}
        suppliers={suppliers}
        submitLabel="Opret produkt"
      />
    </div>
  );
}
