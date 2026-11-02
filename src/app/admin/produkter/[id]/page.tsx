import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct, deleteProduct } from "@/app/admin/produkter/actions";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Rediger produkt" };
export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

function specsToText(specs: unknown): string {
  if (!specs || typeof specs !== "object") return "";
  return Object.entries(specs as Record<string, string>)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories, suppliers] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, product.id) as (
    state: Awaited<ReturnType<typeof updateProduct>> | undefined,
    formData: FormData,
  ) => Promise<Awaited<ReturnType<typeof updateProduct>>>;
  const boundDelete = deleteProduct.bind(null, product.id);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-2xl font-semibold text-olive-950">{product.name}</h1>
          <p className="mt-1 text-sm text-stone-500">Slug: {product.slug}</p>
        </div>
        <form action={boundDelete}>
          <Button type="submit" variant="danger" size="sm">
            <TrashIcon className="h-4 w-4" />
            Slet produkt
          </Button>
        </form>
      </div>

      <ProductForm
        action={boundUpdate}
        categories={categories}
        suppliers={suppliers}
        submitLabel="Gem ændringer"
        defaults={{
          slug: product.slug,
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          supplierId: product.supplierId,
          supplierSku: product.supplierSku,
          weightGrams: product.weightGrams ? String(product.weightGrams) : "",
          costPriceOre: product.costPriceOre,
          markupType: product.markupType,
          markupValue: String(product.markupValue),
          roundingRule: product.roundingRule,
          stock: product.stock,
          status: product.status,
          requiresAgeCheck: product.requiresAgeCheck,
          affiliateUrl: product.affiliateUrl ?? "",
          specs: specsToText(product.specs),
          ceMarked: product.ceMarked ?? false,
          manufacturer: product.manufacturer ?? "",
          gpsrResponsible: product.gpsrResponsible ?? "",
          safetyWarnings: product.safetyWarnings ?? "",
          foodIngredients: product.foodIngredients ?? "",
          foodAllergens: product.foodAllergens ?? "",
          foodShelfLife: product.foodShelfLife ?? "",
          complianceOk: product.complianceOk,
          images: product.images.map((image) => ({ url: image.url, alt: image.alt ?? "" })),
        }}
      />
    </div>
  );
}
