import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug, getFeaturedProducts, getProductsForCategory } from "@/lib/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";

// Kategorier og lagerstatus skal altid være aktuelle — ingen statisk cache.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const featuredProducts = await getFeaturedProducts(4);

  const packagesCategory = await getCategoryBySlug("faerdige-beredskabspakker");
  const packageProducts = packagesCategory
    ? await getProductsForCategory(packagesCategory.id, {})
    : [];

  return (
    <div>
      <section className="bg-olive-900 text-stone-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="heading-font text-sm uppercase tracking-widest text-orange-400">
              Dansk beredskabsudstyr
            </p>
            <h1 className="heading-font mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              Vær forberedt, uden panik.
            </h1>
            <p className="mt-4 max-w-md text-stone-200">
              Nødmad, vand, strøm, varme og førstehjælp samlet på ét sted.
              Brug beredskabsberegneren og få en færdig pakkeliste til din
              husstand på under et minut.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/beredskabsberegner"
                className="rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold text-olive-950 transition hover:bg-orange-400"
              >
                Beregn din beredskabspakke
              </Link>
              <Link
                href="/kategori/faerdige-beredskabspakker"
                className="rounded-md border border-stone-200/30 px-6 py-3 text-sm font-semibold text-stone-50 transition hover:border-orange-400 hover:text-orange-400"
              >
                Se færdige pakker
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-olive-700 bg-olive-950/60 p-6">
            <p className="heading-font text-sm uppercase tracking-wide text-orange-400">
              Beredskabsberegner
            </p>
            <p className="mt-2 text-sm text-stone-300">
              Antal voksne, børn, kæledyr og dage — få en anbefalet
              pakkeliste med vand, mad, varme, lys og batterier.
              &quot;Læg alt i kurven&quot; på ét klik.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="heading-font text-2xl font-semibold text-olive-950">
          Kategorier
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/kategori/${category.slug}`}
              className="rounded-lg border border-stone-200 bg-white p-5 transition hover:border-orange-400 hover:shadow-sm"
            >
              <h3 className="heading-font font-semibold text-olive-900">
                {category.name}
              </h3>
              {category.description ? (
                <p className="mt-2 text-sm text-stone-600">
                  {category.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="heading-font text-2xl font-semibold text-olive-950">
          Bestsellere
        </h2>
        <div className="mt-6">
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      {packagesCategory ? (
        <section className="bg-stone-100 py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-baseline justify-between">
              <h2 className="heading-font text-2xl font-semibold text-olive-950">
                Færdige pakker
              </h2>
              <Link
                href={`/kategori/${packagesCategory.slug}`}
                className="text-sm font-semibold text-orange-600 hover:text-orange-500"
              >
                Se alle →
              </Link>
            </div>
            <p className="mt-2 max-w-2xl text-stone-600">
              {packagesCategory.description}
            </p>
            <div className="mt-6">
              <ProductGrid products={packageProducts} />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
