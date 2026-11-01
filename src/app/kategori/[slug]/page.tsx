import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCategoryBySlug,
  getProductsForCategory,
  parseFilterSearchParams,
} from "@/lib/catalog";
import { ProductFilters } from "@/components/storefront/product-filters";
import { ProductGrid } from "@/components/storefront/product-grid";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const filters = parseFilterSearchParams(resolvedSearchParams);
  const products = await getProductsForCategory(category.id, filters);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="heading-font text-3xl font-semibold text-olive-950">
        {category.name}
      </h1>
      {category.description ? (
        <p className="mt-2 max-w-2xl text-stone-600">{category.description}</p>
      ) : null}

      <div className="mt-6">
        <ProductFilters action={`/kategori/${category.slug}`} values={filters} />
      </div>

      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
