import Image from "next/image";
import Link from "next/link";
import { formatDkk } from "@/lib/pricing/markup";
import { Badge } from "@/components/ui/badge";
import type { ProductCardData } from "@/lib/catalog";

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];
  const inStock = product.stock > 0;

  return (
    <Link
      href={`/produkt/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
    >
      <div className="relative aspect-square bg-stone-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
        {!inStock ? (
          <div className="absolute left-2 top-2">
            <Badge tone="dark">Udsolgt</Badge>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-stone-500">
          {product.category.name}
        </p>
        <h3 className="heading-font font-semibold text-olive-900 group-hover:text-orange-600">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-lg font-semibold text-olive-950">
            {formatDkk(product.sellingPriceOre)}
          </p>
          {inStock ? (
            <span className="text-xs font-medium text-emerald-700">På lager</span>
          ) : (
            <span className="text-xs font-medium text-stone-400">Ikke på lager</span>
          )}
        </div>
      </div>
    </Link>
  );
}
