"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import { Button } from "@/components/ui/button";
import { CheckIcon, CartIcon } from "@/components/icons";

export function AddToCartButton({ productId, inStock }: { productId: string; inStock: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  if (!inStock) {
    return (
      <Button type="button" disabled className="mt-6 w-full" size="lg">
        Ikke på lager
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="lg"
      className="mt-6 w-full"
      onClick={() => {
        addItem(productId, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? (
        <>
          <CheckIcon className="h-4 w-4" />
          Lagt i kurv
        </>
      ) : (
        <>
          <CartIcon className="h-4 w-4" />
          Læg i kurv
        </>
      )}
    </Button>
  );
}
