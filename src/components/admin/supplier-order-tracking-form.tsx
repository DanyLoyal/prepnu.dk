"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldGroup } from "@/components/ui/field";
import { SUPPLIER_ORDER_STATUS_LABELS } from "@/lib/admin/labels";
import { updateSupplierOrderTracking, type OrderActionState } from "@/app/admin/ordrer/actions";

export function SupplierOrderTrackingForm({
  supplierOrderId,
  orderId,
  defaults,
}: {
  supplierOrderId: string;
  orderId: string;
  defaults: { status: string; supplierOrderRef: string; trackingNumber: string; trackingUrl: string };
}) {
  const action = updateSupplierOrderTracking.bind(null, supplierOrderId, orderId) as (
    state: OrderActionState | undefined,
    formData: FormData,
  ) => Promise<OrderActionState>;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <FieldGroup>
        <Label htmlFor={`status-${supplierOrderId}`}>Status</Label>
        <Select id={`status-${supplierOrderId}`} name="status" defaultValue={defaults.status}>
          {Object.entries(SUPPLIER_ORDER_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor={`ref-${supplierOrderId}`}>Leverandørens ordrenummer</Label>
        <Input id={`ref-${supplierOrderId}`} name="supplierOrderRef" defaultValue={defaults.supplierOrderRef} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor={`tn-${supplierOrderId}`}>Trackingnummer</Label>
        <Input id={`tn-${supplierOrderId}`} name="trackingNumber" defaultValue={defaults.trackingNumber} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor={`tu-${supplierOrderId}`}>Tracking-URL</Label>
        <Input id={`tu-${supplierOrderId}`} name="trackingUrl" type="url" defaultValue={defaults.trackingUrl} />
      </FieldGroup>
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Gemmer..." : "Gem leverandørordre"}
        </Button>
        {state?.success ? <span className="text-sm text-emerald-600">{state.success}</span> : null}
        {state?.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
      </div>
    </form>
  );
}
