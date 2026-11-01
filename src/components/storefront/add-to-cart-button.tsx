"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart/store";

export function AddToCartButton({ productId, inStock }: { productId: string; inStock: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  if (!inStock) {
    return (
      <button
        type="button"
        disabled
        className="mt-6 w-full rounded bg-stone-200 px-6 py-3 font-semibold text-stone-500"
      >
        Ikke på lager
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        addItem(productId, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="mt-6 w-full rounded bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
    >
      {added ? "Lagt i kurv ✓" : "Læg i kurv"}
    </button>
  );
}
