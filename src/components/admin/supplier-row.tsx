"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, FieldGroup, Label } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { SUPPLIER_STATUS_LABELS, SUPPLIER_STATUS_TONES, SUPPLIER_TYPE_LABELS } from "@/lib/admin/labels";
import { syncSupplier, updateSupplier, type SupplierActionState } from "@/app/admin/leverandoerer/actions";
import type { SupplierModel } from "@/generated/prisma/models";

export function SupplierRow({ supplier }: { supplier: SupplierModel }) {
  const [editing, setEditing] = useState(false);
  const [syncState, setSyncState] = useState<SupplierActionState | null>(null);
  const [syncing, startSync] = useTransition();

  const boundUpdate = updateSupplier.bind(null, supplier.id) as (
    state: SupplierActionState | undefined,
    formData: FormData,
  ) => Promise<SupplierActionState>;
  const [updateState, updateAction, updatePending] = useActionState(boundUpdate, undefined);

  return (
    <div className="rounded-lg border border-stone-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-olive-950">{supplier.name}</p>
          <p className="text-xs text-stone-500">{SUPPLIER_TYPE_LABELS[supplier.type]}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={SUPPLIER_STATUS_TONES[supplier.status]}>{SUPPLIER_STATUS_LABELS[supplier.status]}</Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={syncing}
            onClick={() =>
              startSync(async () => {
                const result = await syncSupplier(supplier.id);
                setSyncState(result);
              })
            }
          >
            {syncing ? "Synkroniserer..." : "Synkroniser nu"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing((v) => !v)}>
            {editing ? "Luk" : "Rediger"}
          </Button>
        </div>
      </div>

      {supplier.lastSyncAt ? (
        <p className="mt-2 text-xs text-stone-500">
          Sidste synkronisering: {supplier.lastSyncAt.toLocaleString("da-DK")}
        </p>
      ) : null}
      {supplier.lastErrorText ? (
        <p className="mt-1 text-xs text-red-600">{supplier.lastErrorText}</p>
      ) : null}
      {syncState ? (
        <p className={`mt-1 text-xs ${syncState.error ? "text-red-600" : "text-emerald-600"}`}>
          {syncState.error ?? syncState.success}
        </p>
      ) : null}

      {editing ? (
        <form action={updateAction} className="mt-4 grid gap-3 border-t border-stone-200 pt-4 sm:grid-cols-3">
          <FieldGroup>
            <Label htmlFor={`name-${supplier.id}`}>Navn</Label>
            <Input id={`name-${supplier.id}`} name="name" defaultValue={supplier.name} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor={`status-${supplier.id}`}>Status</Label>
            <Select id={`status-${supplier.id}`} name="status" defaultValue={supplier.status}>
              <option value="ACTIVE">Aktiv</option>
              <option value="PAUSED">Pauset</option>
              <option value="ERROR">Fejl</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor={`url-${supplier.id}`}>API base-URL</Label>
            <Input id={`url-${supplier.id}`} name="apiBaseUrl" defaultValue={supplier.apiBaseUrl ?? ""} />
          </FieldGroup>
          <div className="sm:col-span-3 flex items-center gap-3">
            <Button type="submit" size="sm" disabled={updatePending}>
              {updatePending ? "Gemmer..." : "Gem"}
            </Button>
            {updateState?.success ? <span className="text-sm text-emerald-600">{updateState.success}</span> : null}
            {updateState?.error ? <span className="text-sm text-red-600">{updateState.error}</span> : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
