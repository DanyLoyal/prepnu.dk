"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart/store";
import { formatDkk } from "@/lib/pricing/markup";

interface CartProduct {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  sellingPriceOre: number;
  stock: number;
  requiresAgeCheck: boolean;
}

export default function CartPage() {
  const { items, setQuantity, removeItem } = useCartStore();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(items.length > 0);
  const [ageVerified, setAgeVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: items.map((item) => item.productId) }),
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, [items]);

  const rows = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((row): row is { productId: string; quantity: number; product: CartProduct } => row !== null);

  const subtotalOre = rows.reduce((sum, row) => sum + row.product.sellingPriceOre * row.quantity, 0);
  const requiresAgeCheck = rows.some((row) => row.product.requiresAgeCheck);

  async function goToCheckout() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          ageVerified,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Noget gik galt");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Noget gik galt, prøv igen");
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-stone-600">Indlæser kurv...</div>;
  }

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="heading-font text-2xl font-semibold text-olive-950">Din kurv er tom</h1>
        <Link href="/" className="mt-4 inline-flex text-orange-600 hover:underline">
          Fortsæt med at handle
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="heading-font text-3xl font-semibold text-olive-950">Kurv</h1>

      <ul className="mt-6 divide-y divide-stone-200">
        {rows.map((row) => (
          <li key={row.productId} className="flex items-center gap-4 py-4">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-stone-100">
              {row.product.imageUrl ? (
                <Image src={row.product.imageUrl} alt={row.product.name} fill className="object-cover" />
              ) : null}
            </div>
            <div className="flex-1">
              <Link href={`/produkt/${row.product.slug}`} className="font-semibold text-olive-900 hover:text-orange-600">
                {row.product.name}
              </Link>
              <p className="text-sm text-stone-600">{formatDkk(row.product.sellingPriceOre)} / stk</p>
            </div>
            <input
              type="number"
              min={1}
              max={row.product.stock}
              value={row.quantity}
              onChange={(e) => setQuantity(row.productId, Number(e.target.value))}
              className="w-16 rounded border border-stone-300 px-2 py-1 text-center"
            />
            <p className="w-24 text-right font-semibold text-olive-950">
              {formatDkk(row.product.sellingPriceOre * row.quantity)}
            </p>
            <button
              type="button"
              onClick={() => removeItem(row.productId)}
              className="text-sm text-stone-500 hover:text-red-600"
            >
              Fjern
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-lg font-semibold text-olive-950">
            <span>Subtotal</span>
            <span>{formatDkk(subtotalOre)}</span>
          </div>
          <p className="text-sm text-stone-600">Fragt beregnes ved betaling.</p>

          {requiresAgeCheck ? (
            <label className="flex items-start gap-2 rounded border border-orange-300 bg-orange-50 p-3 text-sm text-orange-800">
              <input
                type="checkbox"
                checked={ageVerified}
                onChange={(e) => setAgeVerified(e.target.checked)}
                className="mt-0.5"
              />
              Jeg bekræfter, at jeg er fyldt 18 år.
            </label>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="button"
            disabled={submitting || (requiresAgeCheck && !ageVerified)}
            onClick={goToCheckout}
            className="w-full rounded bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Sender..." : "Gå til betaling"}
          </button>
        </div>
      </div>
    </div>
  );
}
