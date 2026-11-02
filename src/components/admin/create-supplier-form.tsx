"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, FieldGroup, Label } from "@/components/ui/field";
import { createSupplier } from "@/app/admin/leverandoerer/actions";

export function CreateSupplierForm() {
  const [state, formAction, pending] = useActionState(createSupplier, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <FieldGroup>
        <Label htmlFor="new-supplier-name">Navn</Label>
        <Input id="new-supplier-name" name="name" required className="w-56" />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="new-supplier-type">Type</Label>
        <Select id="new-supplier-type" name="type" defaultValue="MANUAL">
          <option value="MANUAL">Manuel bestilling</option>
          <option value="BIGBUY">BigBuy</option>
          <option value="CJ_DROPSHIPPING">CJ Dropshipping</option>
          <option value="AMAZON_AFFILIATE">Amazon (affiliate)</option>
        </Select>
      </FieldGroup>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Opretter..." : "Tilføj leverandør"}
      </Button>
      {state?.success ? <span className="text-sm text-emerald-600">{state.success}</span> : null}
      {state?.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
    </form>
  );
}
