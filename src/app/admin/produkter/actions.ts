"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeSellingPriceOre } from "@/lib/pricing/markup";
import { productSchema } from "@/lib/validation/product.schema";

export interface ProductActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function emptyToUndefined(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function parseProductForm(formData: FormData) {
  let images: { url: string; alt?: string }[] = [];
  const imagesRaw = formData.get("imagesJson");
  if (typeof imagesRaw === "string" && imagesRaw.trim() !== "") {
    try {
      const parsed = JSON.parse(imagesRaw);
      if (Array.isArray(parsed)) {
        images = parsed.filter(
          (img): img is { url: string; alt?: string } =>
            typeof img === "object" && img !== null && typeof img.url === "string" && img.url.trim() !== "",
        );
      }
    } catch {
      // Ignorer ugyldig JSON — billedlisten bliver tom, valideres ikke som fatal fejl.
    }
  }

  return productSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    supplierId: formData.get("supplierId"),
    supplierSku: formData.get("supplierSku"),
    weightGrams: emptyToUndefined(formData.get("weightGrams")),
    costPriceOre: formData.get("costPriceOre"),
    markupType: formData.get("markupType"),
    markupValue: formData.get("markupValue"),
    roundingRule: formData.get("roundingRule"),
    stock: formData.get("stock"),
    status: formData.get("status"),
    requiresAgeCheck: formData.get("requiresAgeCheck") === "on",
    affiliateUrl: formData.get("affiliateUrl") ?? "",
    specs: emptyToUndefined(formData.get("specs")),
    ceMarked: formData.get("ceMarked") === "on",
    manufacturer: emptyToUndefined(formData.get("manufacturer")),
    gpsrResponsible: emptyToUndefined(formData.get("gpsrResponsible")),
    safetyWarnings: emptyToUndefined(formData.get("safetyWarnings")),
    foodIngredients: emptyToUndefined(formData.get("foodIngredients")),
    foodAllergens: emptyToUndefined(formData.get("foodAllergens")),
    foodShelfLife: emptyToUndefined(formData.get("foodShelfLife")),
    complianceOk: formData.get("complianceOk") === "on",
    images,
  });
}

function toSpecsJson(specsText: string | undefined): Record<string, string> | undefined {
  if (!specsText) return undefined;
  const entries: [string, string][] = [];
  for (const line of specsText.split("\n")) {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) continue;
    entries.push([key.trim(), rest.join(":").trim()]);
  }
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export async function createProduct(
  _prevState: ProductActionState | undefined,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: "Udfyld felterne korrekt.", fieldErrors: flattenZodErrors(parsed.error) };
  }
  const data = parsed.data;

  const sellingPriceOre = computeSellingPriceOre({
    costPriceOre: data.costPriceOre,
    markupType: data.markupType,
    markupValue: data.markupValue,
    roundingRule: data.roundingRule,
  });

  let createdProductId: string;
  try {
    const product = await prisma.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        specs: toSpecsJson(data.specs),
        weightGrams: data.weightGrams,
        status: data.status,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        supplierSku: data.supplierSku,
        costPriceOre: data.costPriceOre,
        markupType: data.markupType,
        markupValue: data.markupValue,
        roundingRule: data.roundingRule,
        sellingPriceOre,
        stock: data.stock,
        requiresAgeCheck: data.requiresAgeCheck,
        affiliateUrl: data.affiliateUrl || undefined,
        ceMarked: data.ceMarked,
        manufacturer: data.manufacturer,
        gpsrResponsible: data.gpsrResponsible,
        safetyWarnings: data.safetyWarnings,
        foodIngredients: data.foodIngredients,
        foodAllergens: data.foodAllergens,
        foodShelfLife: data.foodShelfLife,
        complianceOk: data.complianceOk,
        images: {
          create: data.images.map((image, index) => ({
            url: image.url,
            alt: image.alt,
            sortOrder: index,
          })),
        },
      },
    });
    createdProductId = product.id;
  } catch (error) {
    return { error: toFriendlyError(error) };
  }

  revalidatePath("/admin/produkter");
  redirect(`/admin/produkter/${createdProductId}`);
}

export async function updateProduct(
  productId: string,
  _prevState: ProductActionState | undefined,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: "Udfyld felterne korrekt.", fieldErrors: flattenZodErrors(parsed.error) };
  }
  const data = parsed.data;

  const sellingPriceOre = computeSellingPriceOre({
    costPriceOre: data.costPriceOre,
    markupType: data.markupType,
    markupValue: data.markupValue,
    roundingRule: data.roundingRule,
  });

  try {
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId } }),
      prisma.product.update({
        where: { id: productId },
        data: {
          slug: data.slug,
          name: data.name,
          description: data.description,
          specs: toSpecsJson(data.specs),
          weightGrams: data.weightGrams,
          status: data.status,
          categoryId: data.categoryId,
          supplierId: data.supplierId,
          supplierSku: data.supplierSku,
          costPriceOre: data.costPriceOre,
          markupType: data.markupType,
          markupValue: data.markupValue,
          roundingRule: data.roundingRule,
          sellingPriceOre,
          stock: data.stock,
          requiresAgeCheck: data.requiresAgeCheck,
          affiliateUrl: data.affiliateUrl || undefined,
          ceMarked: data.ceMarked,
          manufacturer: data.manufacturer,
          gpsrResponsible: data.gpsrResponsible,
          safetyWarnings: data.safetyWarnings,
          foodIngredients: data.foodIngredients,
          foodAllergens: data.foodAllergens,
          foodShelfLife: data.foodShelfLife,
          complianceOk: data.complianceOk,
          images: {
            create: data.images.map((image, index) => ({
              url: image.url,
              alt: image.alt,
              sortOrder: index,
            })),
          },
        },
      }),
    ]);
  } catch (error) {
    return { error: toFriendlyError(error) };
  }

  revalidatePath("/admin/produkter");
  revalidatePath(`/admin/produkter/${productId}`);
  return {};
}

export async function deleteProduct(productId: string): Promise<void> {
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/produkter");
  redirect("/admin/produkter");
}

function flattenZodErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function toFriendlyError(error: unknown): string {
  if (error instanceof Error && error.message.includes("Unique constraint")) {
    return "Slug eller SKU er allerede i brug af et andet produkt.";
  }
  return "Produktet kunne ikke gemmes. Prøv igen.";
}
