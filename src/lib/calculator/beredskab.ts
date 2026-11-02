import type { CalculatorPresetModel as CalculatorPreset } from "@/generated/prisma/models";

export interface BeredskabInput {
  adults: number;
  children: number;
  days: number;
}

export interface BeredskabCategoryNeed {
  categorySlug: string;
  label: string;
  quantity: number;
}

// Pakkelisten tager udgangspunkt i konfigurerbare rater (CalculatorPreset),
// men der er ingen "liter/kcal pr. stk."-felt på Product endnu, så vi
// omsætter totalbehovet til et antal standardenheder med disse grove,
// dokumenterede antagelser. Admin kan stadig justere raterne i Indstillinger.
const ASSUMED_LITERS_PER_WATER_UNIT = 10; // typisk vanddunk/filter-kapacitet
const ASSUMED_KCAL_PER_FOOD_UNIT = 2000; // typisk nødration/pose pr. "stk"
const ASSUMED_BATTERIES_PER_PACK = 20;

export function computeBeredskabNeeds(
  input: BeredskabInput,
  preset: Pick<
    CalculatorPreset,
    | "waterLitersPerDay"
    | "kcalPerDay"
    | "batteriesPerPersonPerWeek"
    | "heatCategorySlug"
    | "lightCategorySlug"
    | "waterCategorySlug"
    | "foodCategorySlug"
    | "firstAidCategorySlug"
  >,
): BeredskabCategoryNeed[] {
  const adults = Math.max(0, Math.floor(input.adults));
  const children = Math.max(0, Math.floor(input.children));
  const days = Math.max(1, Math.floor(input.days));
  const people = adults + children;

  if (people === 0) return [];

  const needs: BeredskabCategoryNeed[] = [];

  if (preset.waterCategorySlug) {
    const totalLiters = people * Number(preset.waterLitersPerDay) * days;
    needs.push({
      categorySlug: preset.waterCategorySlug,
      label: "Vand",
      quantity: Math.ceil(totalLiters / ASSUMED_LITERS_PER_WATER_UNIT),
    });
  }

  if (preset.foodCategorySlug) {
    const totalKcal = people * preset.kcalPerDay * days;
    needs.push({
      categorySlug: preset.foodCategorySlug,
      label: "Nødmad",
      quantity: Math.ceil(totalKcal / ASSUMED_KCAL_PER_FOOD_UNIT),
    });
  }

  if (preset.heatCategorySlug) {
    needs.push({
      categorySlug: preset.heatCategorySlug,
      label: "Varme",
      quantity: Math.max(1, Math.ceil(days / 7)),
    });
  }

  if (preset.lightCategorySlug) {
    needs.push({
      categorySlug: preset.lightCategorySlug,
      label: "Lys og kommunikation",
      quantity: Math.max(1, Math.ceil(people / 2)),
    });

    const totalBatteries = people * preset.batteriesPerPersonPerWeek * (days / 7);
    needs.push({
      categorySlug: preset.lightCategorySlug,
      label: "Batterier",
      quantity: Math.max(1, Math.ceil(totalBatteries / ASSUMED_BATTERIES_PER_PACK)),
    });
  }

  if (preset.firstAidCategorySlug) {
    needs.push({
      categorySlug: preset.firstAidCategorySlug,
      label: "Førstehjælp",
      quantity: Math.max(1, Math.ceil(people / 4)),
    });
  }

  return needs;
}
