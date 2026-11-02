import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().trim().url("Skal være en gyldig URL"),
  alt: z.string().trim().optional(),
});

export const productSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug er påkrævet")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Kun små bogstaver, tal og bindestreger"),
  name: z.string().trim().min(1, "Navn er påkrævet"),
  description: z.string().trim().min(1, "Beskrivelse er påkrævet"),
  categoryId: z.string().min(1, "Vælg en kategori"),
  supplierId: z.string().min(1, "Vælg en leverandør"),
  supplierSku: z.string().trim().min(1, "SKU er påkrævet"),
  weightGrams: z.coerce.number().int().min(0).optional(),
  costPriceOre: z.coerce.number().int().min(0, "Kostpris skal være 0 eller mere"),
  markupType: z.enum(["PERCENT", "FIXED"]),
  markupValue: z.coerce.number().min(0),
  roundingRule: z.enum(["NONE", "NEAREST_WHOLE", "NINETY_FIVE_OERE"]),
  stock: z.coerce.number().int().min(0),
  status: z.enum(["DRAFT", "PUBLISHED", "PAUSED"]),
  requiresAgeCheck: z.boolean().default(false),
  affiliateUrl: z.string().trim().url().optional().or(z.literal("")),
  specs: z.string().trim().optional(),

  ceMarked: z.boolean().optional(),
  manufacturer: z.string().trim().optional(),
  gpsrResponsible: z.string().trim().optional(),
  safetyWarnings: z.string().trim().optional(),
  foodIngredients: z.string().trim().optional(),
  foodAllergens: z.string().trim().optional(),
  foodShelfLife: z.string().trim().optional(),
  complianceOk: z.boolean().default(false),

  images: z.array(productImageSchema).default([]),
}).refine((data) => data.status !== "PUBLISHED" || data.complianceOk, {
  message: "Produktet kan ikke publiceres før compliance-felterne er bekræftet udfyldt",
  path: ["status"],
});

export type ProductFormValues = z.infer<typeof productSchema>;
