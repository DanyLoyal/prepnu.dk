import Image from "next/image";
import Link from "next/link";
import { formatDkk } from "@/lib/pricing/markup";
import type { ProductCardData } from "@/lib/catalog";

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];
  const inStock = product.stock > 0;

  return (
    <Link
      href={`/produkt/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white transition hover:border-orange-400 hover:shadow-sm"
    >
      <div className="relative aspect-square bg-stone-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover"
          />
        ) : null}
        {!inStock ? (
          <span className="absolute left-2 top-2 rounded bg-olive-900 px-2 py-1 text-xs font-semibold text-stone-50">
            Udsolgt
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-stone-500">
          {product.category.name}
        </p>
        <h3 className="heading-font font-semibold text-olive-900 group-hover:text-orange-600">
          {product.name}
        </h3>
        <p className="mt-auto pt-2 text-lg font-semibold text-olive-950">
          {formatDkk(product.sellingPriceOre)}
        </p>
        <p className="text-xs text-stone-500">
          {inStock ? "På lager" : "Ikke på lager"}
        </p>
      </div>
    </Link>
  );
}
