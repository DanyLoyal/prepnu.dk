"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface SettingsActionState {
  error?: string;
  success?: string;
}

export async function updateStoreSettings(
  _prevState: SettingsActionState | undefined,
  formData: FormData,
): Promise<SettingsActionState> {
  const shopName = String(formData.get("shopName") ?? "").trim();
  const cvr = String(formData.get("cvr") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const freeShippingOverKr = String(formData.get("freeShippingOverKr") ?? "").trim();
  const defaultMarkupType = String(formData.get("defaultMarkupType") ?? "PERCENT");
  const defaultMarkupValue = Number(formData.get("defaultMarkupValue") ?? 0);
  const minimumMarginPercent = Number(formData.get("minimumMarginPercent") ?? 0);

  if (!shopName) return { error: "Butiksnavn er påkrævet." };

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {
      shopName,
      cvr: cvr || null,
      address: address || null,
      contactEmail: contactEmail || null,
      freeShippingOverOre: freeShippingOverKr ? Math.round(Number(freeShippingOverKr) * 100) : null,
      defaultMarkupType: defaultMarkupType as "PERCENT" | "FIXED",
      defaultMarkupValue,
      minimumMarginPercent,
    },
    create: {
      id: "default",
      shopName,
      cvr: cvr || null,
      address: address || null,
      contactEmail: contactEmail || null,
      freeShippingOverOre: freeShippingOverKr ? Math.round(Number(freeShippingOverKr) * 100) : null,
      defaultMarkupType: defaultMarkupType as "PERCENT" | "FIXED",
      defaultMarkupValue,
      minimumMarginPercent,
    },
  });

  revalidatePath("/admin/indstillinger");
  return { success: "Butiksindstillinger gemt." };
}

export async function updateCalculatorPreset(
  _prevState: SettingsActionState | undefined,
  formData: FormData,
): Promise<SettingsActionState> {
  const data = {
    waterLitersPerDay: Number(formData.get("waterLitersPerDay") ?? 3),
    kcalPerDay: Number(formData.get("kcalPerDay") ?? 2000),
    heatCategorySlug: String(formData.get("heatCategorySlug") ?? "") || null,
    lightCategorySlug: String(formData.get("lightCategorySlug") ?? "") || null,
    waterCategorySlug: String(formData.get("waterCategorySlug") ?? "") || null,
    foodCategorySlug: String(formData.get("foodCategorySlug") ?? "") || null,
    firstAidCategorySlug: String(formData.get("firstAidCategorySlug") ?? "") || null,
    batteriesPerPersonPerWeek: Number(formData.get("batteriesPerPersonPerWeek") ?? 2),
  };

  await prisma.calculatorPreset.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  revalidatePath("/admin/indstillinger");
  revalidatePath("/beredskabsberegner");
  return { success: "Beregner-indstillinger gemt." };
}

export async function createShippingRate(
  _prevState: SettingsActionState | undefined,
  formData: FormData,
): Promise<SettingsActionState> {
  const carrier = String(formData.get("carrier") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const priceKr = Number(formData.get("priceKr") ?? 0);
  const freeShippingOverKr = String(formData.get("freeShippingOverKr") ?? "").trim();

  if (!carrier || !name) return { error: "Transportør og navn er påkrævet." };

  await prisma.shippingRate.create({
    data: {
      carrier,
      name,
      priceOre: Math.round(priceKr * 100),
      freeShippingOverOre: freeShippingOverKr ? Math.round(Number(freeShippingOverKr) * 100) : null,
    },
  });

  revalidatePath("/admin/indstillinger");
  return { success: "Fragtmulighed tilføjet." };
}

export async function toggleShippingRate(id: string, active: boolean): Promise<void> {
  await prisma.shippingRate.update({ where: { id }, data: { active } });
  revalidatePath("/admin/indstillinger");
}

export async function deleteShippingRate(id: string): Promise<void> {
  await prisma.shippingRate.delete({ where: { id } });
  revalidatePath("/admin/indstillinger");
}
