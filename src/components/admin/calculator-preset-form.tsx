"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldGroup, FieldHint } from "@/components/ui/field";
import { updateCalculatorPreset } from "@/app/admin/indstillinger/actions";

export function CalculatorPresetForm({
  defaults,
  categories,
}: {
  defaults: {
    waterLitersPerDay: string;
    kcalPerDay: string;
    heatCategorySlug: string;
    lightCategorySlug: string;
    waterCategorySlug: string;
    foodCategorySlug: string;
    firstAidCategorySlug: string;
    batteriesPerPersonPerWeek: string;
  };
  categories: { slug: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateCalculatorPreset, undefined);

  const categorySelect = (id: string, label: string, defaultValue: string) => (
    <FieldGroup key={id}>
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} name={id} defaultValue={defaultValue}>
        <option value="">Ingen</option>
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </Select>
    </FieldGroup>
  );

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <FieldHint className="sm:col-span-2">
        Disse rater styrer Beredskabsberegneren og kan justeres uden kodeændringer.
      </FieldHint>
      <FieldGroup>
        <Label htmlFor="waterLitersPerDay">Vand (liter/person/dag)</Label>
        <Input id="waterLitersPerDay" name="waterLitersPerDay" type="number" step={0.1} defaultValue={defaults.waterLitersPerDay} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="kcalPerDay">Energi (kcal/person/dag)</Label>
        <Input id="kcalPerDay" name="kcalPerDay" type="number" defaultValue={defaults.kcalPerDay} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="batteriesPerPersonPerWeek">Batterier/person/uge</Label>
        <Input id="batteriesPerPersonPerWeek" name="batteriesPerPersonPerWeek" type="number" defaultValue={defaults.batteriesPerPersonPerWeek} />
      </FieldGroup>
      <div />
      {categorySelect("waterCategorySlug", "Vand-kategori", defaults.waterCategorySlug)}
      {categorySelect("foodCategorySlug", "Nødmad-kategori", defaults.foodCategorySlug)}
      {categorySelect("heatCategorySlug", "Varme-kategori", defaults.heatCategorySlug)}
      {categorySelect("lightCategorySlug", "Lys/kommunikation-kategori", defaults.lightCategorySlug)}
      {categorySelect("firstAidCategorySlug", "Førstehjælp-kategori", defaults.firstAidCategorySlug)}
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Gemmer..." : "Gem beregner-indstillinger"}
        </Button>
        {state?.success ? <span className="text-sm text-emerald-600">{state.success}</span> : null}
        {state?.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
      </div>
    </form>
  );
}
