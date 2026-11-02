import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug, getFeaturedProducts, getProductsForCategory } from "@/lib/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";
import { LinkButton } from "@/components/ui/button";
import {
  DropletIcon,
  FlameIcon,
  BoltIcon,
  FirstAidIcon,
  RadioIcon,
  LayersIcon,
  ClockIcon,
  LockIcon,
  RotateIcon,
  ArrowRightIcon,
} from "@/components/icons";

// Kategorier og lagerstatus skal altid være aktuelle — ingen statisk cache.
export const dynamic = "force-dynamic";

const categoryIcons: Record<string, typeof DropletIcon> = {
  "toerlager-og-noedmad": FlameIcon,
  vand: DropletIcon,
  stroem: BoltIcon,
  varme: FlameIcon,
  "kommunikation-og-lys": RadioIcon,
  "foerstehjaelp-og-sikkerhed": FirstAidIcon,
  "faerdige-beredskabspakker": LayersIcon,
  "hygiejne-og-papir": LayersIcon,
};

const trustStrip = [
  { icon: ClockIcon, text: "Afsendt inden 1-3 hverdage" },
  { icon: LockIcon, text: "Sikker betaling via Stripe" },
  { icon: RotateIcon, text: "14 dages fortrydelsesret" },
];

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
      <section className="bg-grid-fade bg-olive-950 text-stone-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="heading-font text-sm uppercase tracking-widest text-orange-400">
              Dansk beredskabsudstyr
            </p>
            <h1 className="heading-font mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              Vær forberedt, uden panik.
            </h1>
            <p className="mt-4 max-w-md text-stone-300">
              Nødmad, vand, strøm, varme og førstehjælp samlet på ét sted.
              Brug beredskabsberegneren og få en færdig pakkeliste til din
              husstand på under et minut.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <LinkButton href="/beredskabsberegner" size="lg">
                Beregn din beredskabspakke
                <ArrowRightIcon className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/kategori/faerdige-beredskabspakker" variant="outline-light" size="lg">
                Se færdige pakker
              </LinkButton>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-stone-300">
              {trustStrip.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.text} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-orange-400" />
                    {item.text}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-olive-700 bg-olive-900/70 p-6 backdrop-blur-sm">
            <p className="heading-font text-sm uppercase tracking-wide text-orange-400">
              Beredskabsberegner
            </p>
            <p className="mt-2 text-sm text-stone-300">
              Antal voksne, børn og dage — få en anbefalet pakkeliste med vand,
              mad, varme, lys og batterier. &quot;Læg alt i kurven&quot; på ét klik.
            </p>
            <ol className="mt-5 space-y-3 text-sm">
              {["Angiv husstandens størrelse", "Få en beregnet pakkeliste", "Læg alt i kurven samlet"].map(
                (step, index) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-olive-950">
                      {index + 1}
                    </span>
                    <span className="text-stone-200">{step}</span>
                  </li>
                ),
              )}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="heading-font text-2xl font-semibold text-olive-950">
          Kategorier
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category.slug] ?? LayersIcon;
            return (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className="group rounded-xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-olive-50 text-olive-700 group-hover:bg-orange-50 group-hover:text-orange-600">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="heading-font mt-3 font-semibold text-olive-900">
                  {category.name}
                </h3>
                {category.description ? (
                  <p className="mt-1.5 text-sm text-stone-500">
                    {category.description}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="heading-font text-2xl font-semibold text-olive-950">
          Bestsellere
        </h2>
        <div className="mt-6">
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      {packagesCategory ? (
        <section className="bg-stone-100 py-16">
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
