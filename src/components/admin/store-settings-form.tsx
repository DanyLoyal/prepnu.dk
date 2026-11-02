"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldGroup } from "@/components/ui/field";
import { updateStoreSettings } from "@/app/admin/indstillinger/actions";

export function StoreSettingsForm({
  defaults,
}: {
  defaults: {
    shopName: string;
    cvr: string;
    address: string;
    contactEmail: string;
    freeShippingOverKr: string;
    defaultMarkupType: string;
    defaultMarkupValue: string;
    minimumMarginPercent: string;
  };
}) {
  const [state, formAction, pending] = useActionState(updateStoreSettings, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <FieldGroup>
        <Label htmlFor="shopName">Butiksnavn</Label>
        <Input id="shopName" name="shopName" defaultValue={defaults.shopName} required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="cvr">CVR</Label>
        <Input id="cvr" name="cvr" defaultValue={defaults.cvr} />
      </FieldGroup>
      <FieldGroup className="sm:col-span-2">
        <Label htmlFor="address">Adresse</Label>
        <Input id="address" name="address" defaultValue={defaults.address} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="contactEmail">Kontakt-e-mail</Label>
        <Input id="contactEmail" name="contactEmail" type="email" defaultValue={defaults.contactEmail} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="freeShippingOverKr">Fri fragt over (kr.)</Label>
        <Input id="freeShippingOverKr" name="freeShippingOverKr" type="number" min={0} defaultValue={defaults.freeShippingOverKr} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="defaultMarkupType">Standard avancetype</Label>
        <Select id="defaultMarkupType" name="defaultMarkupType" defaultValue={defaults.defaultMarkupType}>
          <option value="PERCENT">Procent</option>
          <option value="FIXED">Fast beløb (kr.)</option>
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="defaultMarkupValue">Standard avanceværdi</Label>
        <Input id="defaultMarkupValue" name="defaultMarkupValue" type="number" step={0.01} defaultValue={defaults.defaultMarkupValue} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="minimumMarginPercent">Minimumsavance (%)</Label>
        <Input id="minimumMarginPercent" name="minimumMarginPercent" type="number" step={0.01} defaultValue={defaults.minimumMarginPercent} />
      </FieldGroup>
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Gemmer..." : "Gem butiksindstillinger"}
        </Button>
        {state?.success ? <span className="text-sm text-emerald-600">{state.success}</span> : null}
        {state?.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
      </div>
    </form>
  );
}
