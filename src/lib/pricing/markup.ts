import type { MarkupType, RoundingRule } from "@/generated/prisma/client";

export const VAT_RATE = 0.25;

interface ComputeSellingPriceInput {
  costPriceOre: number;
  markupType: MarkupType;
  markupValue: number;
  roundingRule: RoundingRule;
  shippingCostOre?: number;
}

/**
 * Udsalgspris (inkl. moms) = (kostpris + fragt) + avance, afrundet efter roundingRule.
 * Avance beregnes på kostpris+fragt eksklusiv moms, moms lægges til bagefter.
 */
export function computeSellingPriceOre({
  costPriceOre,
  markupType,
  markupValue,
  roundingRule,
  shippingCostOre = 0,
}: ComputeSellingPriceInput): number {
  const baseOre = costPriceOre + shippingCostOre;

  const priceBeforeVatOre =
    markupType === "PERCENT"
      ? baseOre * (1 + markupValue / 100)
      : baseOre + markupValue * 100; // markupValue i FIXED er i DKK, konverteres til øre

  const priceWithVatOre = priceBeforeVatOre * (1 + VAT_RATE);

  return applyRounding(priceWithVatOre, roundingRule);
}

function applyRounding(priceOre: number, rule: RoundingRule): number {
  switch (rule) {
    case "NEAREST_WHOLE":
      return Math.round(priceOre / 100) * 100;
    case "NINETY_FIVE_OERE": {
      const wholeKroner = Math.floor(priceOre / 100);
      return wholeKroner * 100 + 95;
    }
    case "NONE":
    default:
      return Math.round(priceOre);
  }
}

/** Avance i procent af udsalgspris ekskl. moms — brugt til minimumsavance-tjek. */
export function computeMarginPercent(costPriceOre: number, sellingPriceOre: number): number {
  const sellingExVatOre = sellingPriceOre / (1 + VAT_RATE);
  if (sellingExVatOre <= 0) return 0;
  return ((sellingExVatOre - costPriceOre) / sellingExVatOre) * 100;
}

export function formatDkk(amountOre: number): string {
  const kroner = amountOre / 100;
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    minimumFractionDigits: amountOre % 100 === 0 ? 0 : 2,
  }).format(kroner);
}
