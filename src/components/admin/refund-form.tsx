"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup } from "@/components/ui/field";
import { refundOrder, type OrderActionState } from "@/app/admin/ordrer/actions";

export function RefundForm({ orderId, maxKr }: { orderId: string; maxKr: number }) {
  const action = refundOrder.bind(null, orderId) as (
    state: OrderActionState | undefined,
    formData: FormData,
  ) => Promise<OrderActionState>;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <FieldGroup>
        <Label htmlFor="amountKr">Beløb (kr.) — tom for fuld refundering</Label>
        <Input id="amountKr" name="amountKr" type="number" min={0} max={maxKr} step={0.01} placeholder={String(maxKr)} className="w-48" />
      </FieldGroup>
      <Button type="submit" variant="danger" size="sm" disabled={pending}>
        {pending ? "Refunderer..." : "Refunder"}
      </Button>
      {state?.success ? <span className="text-sm text-emerald-600">{state.success}</span> : null}
      {state?.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
    </form>
  );
}
