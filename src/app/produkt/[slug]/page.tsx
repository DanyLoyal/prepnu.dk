import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { formatDkk } from "@/lib/pricing/markup";
import { ProductGrid } from "@/components/storefront/product-grid";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);
  const specs = (product.specs ?? {}) as Record<string, string>;
  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm text-stone-500">
        <Link href={`/kategori/${product.category.slug}`} className="hover:text-orange-600">
          {product.category.name}
        </Link>
      </nav>

      <div className="mt-4 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt ?? product.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>
          {product.images.length > 1 ? (
            <div className="mt-3 flex gap-2">
              {product.images.map((image) => (
                <div
                  key={image.id}
                  className="relative h-16 w-16 overflow-hidden rounded border border-stone-200 bg-stone-100"
                >
                  <Image src={image.url} alt={image.alt ?? product.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h1 className="heading-font text-3xl font-semibold text-olive-950">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-semibold text-olive-900">
            {formatDkk(product.sellingPriceOre)}
          </p>
          <p className="mt-1 text-sm text-stone-600">Pris inkl. 25% moms</p>

          <p
            className={`mt-4 inline-flex rounded px-3 py-1 text-sm font-semibold ${
              inStock ? "bg-stone-100 text-olive-800" : "bg-stone-200 text-stone-600"
            }`}
          >
            {inStock ? `På lager (${product.stock} stk)` : "Ikke på lager"}
          </p>

          <p className="mt-6 text-stone-700">{product.description}</p>

          {product.requiresAgeCheck ? (
            <p className="mt-4 rounded border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
              Dette produkt kræver aldersbekræftelse (18+) ved checkout.
            </p>
          ) : null}

          <p className="mt-6 text-sm text-stone-600">
            Forventet afsendt inden 1-3 hverdage efter bestilling.
          </p>

          {Object.keys(specs).length > 0 ? (
            <table className="mt-8 w-full text-sm">
              <tbody>
                {Object.entries(specs).map(([key, value]) => (
                  <tr key={key} className="border-b border-stone-200">
                    <td className="py-2 pr-4 font-medium text-stone-600">{key}</td>
                    <td className="py-2 text-stone-800">{value}</td>
                  </tr>
                ))}
                {product.weightGrams ? (
                  <tr className="border-b border-stone-200">
                    <td className="py-2 pr-4 font-medium text-stone-600">Vægt</td>
                    <td className="py-2 text-stone-800">
                      {(product.weightGrams / 1000).toLocaleString("da-DK")} kg
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="mt-16">
          <h2 className="heading-font text-2xl font-semibold text-olive-950">
            Relaterede produkter
          </h2>
          <div className="mt-6">
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
