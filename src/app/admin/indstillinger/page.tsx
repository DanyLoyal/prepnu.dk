import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { CalculatorPresetForm } from "@/components/admin/calculator-preset-form";
import { ShippingRatesList } from "@/components/admin/shipping-rates";

export const metadata: Metadata = { title: "Indstillinger" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [storeSettings, calculatorPreset, shippingRates, categories] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: "default" } }),
    prisma.calculatorPreset.findUnique({ where: { id: "default" } }),
    prisma.shippingRate.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="heading-font text-2xl font-semibold text-olive-950">Indstillinger</h1>
        <p className="mt-1 text-sm text-stone-500">Butik, fragt og beredskabsberegner.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Butiksoplysninger</CardTitle>
        </CardHeader>
        <CardContent>
          <StoreSettingsForm
            defaults={{
              shopName: storeSettings?.shopName ?? "Beredskab",
              cvr: storeSettings?.cvr ?? "",
              address: storeSettings?.address ?? "",
              contactEmail: storeSettings?.contactEmail ?? "",
              freeShippingOverKr: storeSettings?.freeShippingOverOre
                ? String(storeSettings.freeShippingOverOre / 100)
                : "",
              defaultMarkupType: storeSettings?.defaultMarkupType ?? "PERCENT",
              defaultMarkupValue: storeSettings ? String(storeSettings.defaultMarkupValue) : "35",
              minimumMarginPercent: storeSettings ? String(storeSettings.minimumMarginPercent) : "10",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fragtpriser</CardTitle>
        </CardHeader>
        <CardContent>
          <ShippingRatesList rates={shippingRates} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Beredskabsberegner</CardTitle>
        </CardHeader>
        <CardContent>
          <CalculatorPresetForm
            categories={categories}
            defaults={{
              waterLitersPerDay: calculatorPreset ? String(calculatorPreset.waterLitersPerDay) : "3",
              kcalPerDay: calculatorPreset ? String(calculatorPreset.kcalPerDay) : "2000",
              heatCategorySlug: calculatorPreset?.heatCategorySlug ?? "",
              lightCategorySlug: calculatorPreset?.lightCategorySlug ?? "",
              waterCategorySlug: calculatorPreset?.waterCategorySlug ?? "",
              foodCategorySlug: calculatorPreset?.foodCategorySlug ?? "",
              firstAidCategorySlug: calculatorPreset?.firstAidCategorySlug ?? "",
              batteriesPerPersonPerWeek: calculatorPreset ? String(calculatorPreset.batteriesPerPersonPerWeek) : "2",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
