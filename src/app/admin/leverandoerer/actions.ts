"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSupplierAdapter } from "@/lib/suppliers/registry";

export interface SupplierActionState {
  error?: string;
  success?: string;
}

export async function syncSupplier(supplierId: string): Promise<SupplierActionState> {
  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) return { error: "Leverandøren findes ikke." };

  try {
    const adapter = getSupplierAdapter(supplier.type);
    const products = await adapter.syncProducts();
    await prisma.supplier.update({
      where: { id: supplierId },
      data: { lastSyncAt: new Date(), lastErrorAt: null, lastErrorText: null, status: "ACTIVE" },
    });
    revalidatePath("/admin/leverandoerer");
    return { success: `Synkroniseret: ${products.length} produkter fundet hos leverandøren.` };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ukendt fejl";
    await prisma.supplier.update({
      where: { id: supplierId },
      data: { lastErrorAt: new Date(), lastErrorText: message, status: "ERROR" },
    });
    revalidatePath("/admin/leverandoerer");
    return { error: `Synkronisering mislykkedes: ${message}` };
  }
}

export async function updateSupplier(
  supplierId: string,
  _prevState: SupplierActionState | undefined,
  formData: FormData,
): Promise<SupplierActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const status = String(formData.get("status") ?? "ACTIVE");
  const apiBaseUrl = String(formData.get("apiBaseUrl") ?? "").trim();

  if (!name) return { error: "Navn er påkrævet." };
  if (!["ACTIVE", "PAUSED", "ERROR"].includes(status)) return { error: "Ugyldig status." };

  await prisma.supplier.update({
    where: { id: supplierId },
    data: { name, status: status as "ACTIVE" | "PAUSED" | "ERROR", apiBaseUrl: apiBaseUrl || null },
  });

  revalidatePath("/admin/leverandoerer");
  return { success: "Leverandør opdateret." };
}

export async function createSupplier(
  _prevState: SupplierActionState | undefined,
  formData: FormData,
): Promise<SupplierActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");

  if (!name) return { error: "Navn er påkrævet." };
  if (!["MANUAL", "BIGBUY", "CJ_DROPSHIPPING", "AMAZON_AFFILIATE"].includes(type)) {
    return { error: "Ugyldig leverandørtype." };
  }

  await prisma.supplier.create({
    data: { name, type: type as "MANUAL" | "BIGBUY" | "CJ_DROPSHIPPING" | "AMAZON_AFFILIATE" },
  });

  revalidatePath("/admin/leverandoerer");
  return { success: "Leverandør oprettet." };
}
