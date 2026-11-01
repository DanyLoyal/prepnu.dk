import type { Metadata } from "next";
import { parseFilterSearchParams, searchProducts } from "@/lib/catalog";
import { ProductFilters } from "@/components/storefront/product-filters";
import { ProductGrid } from "@/components/storefront/product-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Søg",
};

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim() : "";
  const filters = parseFilterSearchParams(resolvedSearchParams);

  const products = query ? await searchProducts(query, filters) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="heading-font text-3xl font-semibold text-olive-950">Søg</h1>

      <form action="/soegning" method="get" className="mt-6 flex max-w-xl gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Søg efter produkter, f.eks. generator eller vand"
          className="flex-1 rounded-md border border-stone-300 px-4 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-orange-500 px-5 py-2 font-semibold text-olive-950 transition hover:bg-orange-400"
        >
          Søg
        </button>
      </form>

      {query ? (
        <>
          <div className="mt-6">
            <ProductFilters action="/soegning" hiddenFields={{ q: query }} values={filters} />
          </div>
          <p className="mt-6 text-sm text-stone-600">
            {products.length} resultat{products.length === 1 ? "" : "er"} for &quot;{query}&quot;
          </p>
          <div className="mt-4">
            <ProductGrid products={products} />
          </div>
        </>
      ) : (
        <p className="mt-8 text-stone-500">Skriv noget for at søge i sortimentet.</p>
      )}
    </div>
  );
}
