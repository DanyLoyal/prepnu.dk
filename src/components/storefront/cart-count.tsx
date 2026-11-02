"use client";

import { useCartStore } from "@/lib/cart/store";

export function CartCount() {
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  if (count === 0) return null;

  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
      {count}
    </span>
  );
}
