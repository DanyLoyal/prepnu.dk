"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup } from "@/components/ui/field";
import { formatDkk } from "@/lib/pricing/markup";
import { useCartStore } from "@/lib/cart/store";
import type { BeregnerResultItem } from "@/app/api/beregner/route";

export function CalculatorForm() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ items: BeregnerResultItem[]; totalOre: number } | null>(null);
  const [added, setAdded] = useState(false);

  async function calculate() {
    setLoading(true);
    setError(null);
    setAdded(false);
    try {
      const res = await fetch("/api/beregner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adults, children, days }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Noget gik galt");
        setResult(null);
        return;
      }
      setResult(data);
    } catch {
      setError("Noget gik galt, prøv igen");
    } finally {
      setLoading(false);
    }
  }

  function addAllToCart() {
    if (!result) return;
    for (const item of result.items) {
      addItem(item.productId, item.quantity);
    }
    setAdded(true);
    setTimeout(() => router.push("/kurv"), 700);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <Card className="p-6">
        <div className="space-y-5">
          <FieldGroup>
            <Label htmlFor="adults">Voksne</Label>
            <Input id="adults" type="number" min={0} max={20} value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="children">Børn</Label>
            <Input id="children" type="number" min={0} max={20} value={children} onChange={(e) => setChildren(Number(e.target.value))} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="days">Antal dage</Label>
            <Input id="days" type="number" min={1} max={90} value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </FieldGroup>
          <Button type="button" className="w-full" size="lg" disabled={loading || adults + children === 0} onClick={calculate}>
            {loading ? "Beregner..." : "Beregn pakkeliste"}
          </Button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </Card>

      <div>
        {!result ? (
          <Card className="flex h-full items-center justify-center p-10 text-center text-stone-500">
            Udfyld husstanden til venstre og tryk &quot;Beregn pakkeliste&quot;.
          </Card>
        ) : result.items.length === 0 ? (
          <Card className="p-10 text-center text-stone-500">
            Vi har ikke nok produkter på lager til at anbefale en pakkeliste lige nu.
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Din anbefalede pakkeliste</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-stone-100">
                {result.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-4 px-5 py-4">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-stone-100">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wide text-stone-500">{item.categoryLabel}</p>
                      <p className="font-medium text-olive-950">{item.name}</p>
                    </div>
                    <p className="text-sm text-stone-600">x{item.quantity}</p>
                    <p className="w-24 text-right font-semibold text-olive-950">
                      {formatDkk(item.unitPriceOre * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4">
                <p className="text-lg font-semibold text-olive-950">
                  Samlet: {formatDkk(result.totalOre)}
                </p>
                <Button type="button" onClick={addAllToCart} disabled={added}>
                  {added ? "Lagt i kurv ✓" : "Læg alt i kurven"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
