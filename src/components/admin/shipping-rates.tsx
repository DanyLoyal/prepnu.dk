"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { TrashIcon } from "@/components/icons";
import { formatDkk } from "@/lib/pricing/markup";
import { createShippingRate, toggleShippingRate, deleteShippingRate } from "@/app/admin/indstillinger/actions";
import type { ShippingRateModel } from "@/generated/prisma/models";

export function ShippingRatesList({ rates }: { rates: ShippingRateModel[] }) {
  const [state, formAction, pending] = useActionState(createShippingRate, undefined);

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-stone-100">
        {rates.map((rate) => (
          <li key={rate.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-olive-950">
                {rate.carrier} — {rate.name}
              </p>
              <p className="text-xs text-stone-500">
                {formatDkk(rate.priceOre)}
                {rate.freeShippingOverOre ? ` · fri fragt over ${formatDkk(rate.freeShippingOverOre)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={rate.active ? "success" : "neutral"}>{rate.active ? "Aktiv" : "Inaktiv"}</Badge>
              <form action={() => toggleShippingRate(rate.id, !rate.active)}>
                <Button type="submit" variant="outline" size="sm">
                  {rate.active ? "Deaktiver" : "Aktiver"}
                </Button>
              </form>
              <form action={() => deleteShippingRate(rate.id)}>
                <Button type="submit" variant="ghost" size="sm" aria-label="Slet fragtmulighed">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </li>
        ))}
        {rates.length === 0 ? <li className="py-3 text-sm text-stone-500">Ingen fragtmuligheder endnu.</li> : null}
      </ul>

      <form action={formAction} className="flex flex-wrap items-end gap-3 border-t border-stone-200 pt-4">
        <FieldGroup>
          <Label htmlFor="carrier">Transportør</Label>
          <Input id="carrier" name="carrier" placeholder="GLS" className="w-32" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="rateName">Navn</Label>
          <Input id="rateName" name="name" placeholder="Pakkeshop" className="w-44" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="priceKr">Pris (kr.)</Label>
          <Input id="priceKr" name="priceKr" type="number" step={0.01} min={0} className="w-28" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="freeShippingOverKr">Fri fragt over (kr.)</Label>
          <Input id="freeShippingOverKr" name="freeShippingOverKr" type="number" min={0} className="w-36" />
        </FieldGroup>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Tilføjer..." : "Tilføj"}
        </Button>
        {state?.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
      </form>
    </div>
  );
}
