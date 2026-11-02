"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FieldGroup, FieldError, FieldHint } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrashIcon, PlusIcon } from "@/components/icons";
import { computeSellingPriceOre, formatDkk } from "@/lib/pricing/markup";
import type { ProductActionState } from "@/app/admin/produkter/actions";

interface ImageRow {
  url: string;
  alt: string;
}

export interface ProductFormDefaults {
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  supplierId: string;
  supplierSku: string;
  weightGrams: string;
  costPriceOre: number;
  markupType: "PERCENT" | "FIXED";
  markupValue: string;
  roundingRule: "NONE" | "NEAREST_WHOLE" | "NINETY_FIVE_OERE";
  stock: number;
  status: "DRAFT" | "PUBLISHED" | "PAUSED";
  requiresAgeCheck: boolean;
  affiliateUrl: string;
  specs: string;
  ceMarked: boolean;
  manufacturer: string;
  gpsrResponsible: string;
  safetyWarnings: string;
  foodIngredients: string;
  foodAllergens: string;
  foodShelfLife: string;
  complianceOk: boolean;
  images: ImageRow[];
}

const emptyDefaults: ProductFormDefaults = {
  slug: "",
  name: "",
  description: "",
  categoryId: "",
  supplierId: "",
  supplierSku: "",
  weightGrams: "",
  costPriceOre: 0,
  markupType: "PERCENT",
  markupValue: "35",
  roundingRule: "NINETY_FIVE_OERE",
  stock: 0,
  status: "DRAFT",
  requiresAgeCheck: false,
  affiliateUrl: "",
  specs: "",
  ceMarked: false,
  manufacturer: "",
  gpsrResponsible: "",
  safetyWarnings: "",
  foodIngredients: "",
  foodAllergens: "",
  foodShelfLife: "",
  complianceOk: false,
  images: [],
};

export function ProductForm({
  action,
  categories,
  suppliers,
  defaults,
  submitLabel,
}: {
  action: (state: ProductActionState | undefined, formData: FormData) => Promise<ProductActionState>;
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  defaults?: Partial<ProductFormDefaults>;
  submitLabel: string;
}) {
  const initial = { ...emptyDefaults, ...defaults };
  const [state, formAction, pending] = useActionState(action, undefined);

  const [costPriceKr, setCostPriceKr] = useState(String(initial.costPriceOre / 100));
  const [markupType, setMarkupType] = useState(initial.markupType);
  const [markupValue, setMarkupValue] = useState(initial.markupValue);
  const [roundingRule, setRoundingRule] = useState(initial.roundingRule);
  const [status, setStatus] = useState(initial.status);
  const [images, setImages] = useState<ImageRow[]>(initial.images.length > 0 ? initial.images : [{ url: "", alt: "" }]);

  const previewPriceOre = useMemo(() => {
    const costOre = Math.round((Number(costPriceKr) || 0) * 100);
    const value = Number(markupValue) || 0;
    try {
      return computeSellingPriceOre({
        costPriceOre: costOre,
        markupType,
        markupValue: value,
        roundingRule,
      });
    } catch {
      return 0;
    }
  }, [costPriceKr, markupType, markupValue, roundingRule]);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Grundinformation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="name">Navn</Label>
            <Input id="name" name="name" defaultValue={initial.name} required />
            {state?.fieldErrors?.name ? <FieldError>{state.fieldErrors.name}</FieldError> : null}
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" name="slug" defaultValue={initial.slug} required />
            {state?.fieldErrors?.slug ? <FieldError>{state.fieldErrors.slug}</FieldError> : null}
          </FieldGroup>
          <FieldGroup className="sm:col-span-2">
            <Label htmlFor="description">Beskrivelse</Label>
            <Textarea id="description" name="description" rows={4} defaultValue={initial.description} required />
            {state?.fieldErrors?.description ? <FieldError>{state.fieldErrors.description}</FieldError> : null}
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="categoryId">Kategori</Label>
            <Select id="categoryId" name="categoryId" defaultValue={initial.categoryId} required>
              <option value="">Vælg kategori...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            {state?.fieldErrors?.categoryId ? <FieldError>{state.fieldErrors.categoryId}</FieldError> : null}
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="DRAFT">Kladde</option>
              <option value="PUBLISHED">Publiceret</option>
              <option value="PAUSED">Pauset</option>
            </Select>
            {state?.fieldErrors?.status ? <FieldError>{state.fieldErrors.status}</FieldError> : null}
          </FieldGroup>
          <FieldGroup className="sm:col-span-2">
            <Label htmlFor="specs">Specifikationer (en pr. linje: &quot;Felt: Værdi&quot;)</Label>
            <Textarea id="specs" name="specs" rows={4} defaultValue={initial.specs} placeholder={"Volumen: 20 L\nMateriale: BPA-fri HDPE"} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="weightGrams">Vægt (gram)</Label>
            <Input id="weightGrams" name="weightGrams" type="number" min={0} defaultValue={initial.weightGrams} />
          </FieldGroup>
          <FieldGroup className="flex flex-row items-center gap-2 pt-6">
            <input
              id="requiresAgeCheck"
              name="requiresAgeCheck"
              type="checkbox"
              defaultChecked={initial.requiresAgeCheck}
              className="h-4 w-4 rounded border-stone-300"
            />
            <Label htmlFor="requiresAgeCheck" className="mb-0">
              Kræver 18+ bekræftelse ved checkout
            </Label>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leverandør og lager</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="supplierId">Leverandør</Label>
            <Select id="supplierId" name="supplierId" defaultValue={initial.supplierId} required>
              <option value="">Vælg leverandør...</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </Select>
            {state?.fieldErrors?.supplierId ? <FieldError>{state.fieldErrors.supplierId}</FieldError> : null}
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="supplierSku">Leverandør-SKU</Label>
            <Input id="supplierSku" name="supplierSku" defaultValue={initial.supplierSku} required />
            {state?.fieldErrors?.supplierSku ? <FieldError>{state.fieldErrors.supplierSku}</FieldError> : null}
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="stock">Lagerantal</Label>
            <Input id="stock" name="stock" type="number" min={0} defaultValue={initial.stock} required />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="affiliateUrl">Affiliate-link (kun Amazon-affiliate)</Label>
            <Input id="affiliateUrl" name="affiliateUrl" type="url" defaultValue={initial.affiliateUrl} />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prissætning</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="costPriceKr">Kostpris (kr., ekskl. moms)</Label>
            <Input
              id="costPriceKr"
              type="number"
              min={0}
              step={0.01}
              value={costPriceKr}
              onChange={(e) => setCostPriceKr(e.target.value)}
            />
            <input type="hidden" name="costPriceOre" value={Math.round((Number(costPriceKr) || 0) * 100)} />
            {state?.fieldErrors?.costPriceOre ? <FieldError>{state.fieldErrors.costPriceOre}</FieldError> : null}
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="markupType">Avancetype</Label>
            <Select
              id="markupType"
              name="markupType"
              value={markupType}
              onChange={(e) => setMarkupType(e.target.value as typeof markupType)}
            >
              <option value="PERCENT">Procent</option>
              <option value="FIXED">Fast beløb (kr.)</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="markupValue">
              Avanceværdi {markupType === "PERCENT" ? "(%)" : "(kr.)"}
            </Label>
            <Input
              id="markupValue"
              name="markupValue"
              type="number"
              min={0}
              step={0.01}
              value={markupValue}
              onChange={(e) => setMarkupValue(e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="roundingRule">Afrunding</Label>
            <Select
              id="roundingRule"
              name="roundingRule"
              value={roundingRule}
              onChange={(e) => setRoundingRule(e.target.value as typeof roundingRule)}
            >
              <option value="NONE">Ingen</option>
              <option value="NEAREST_WHOLE">Nærmeste hele krone</option>
              <option value="NINETY_FIVE_OERE">Nærmeste X,95 kr.</option>
            </Select>
          </FieldGroup>
          <div className="sm:col-span-2 rounded-md bg-olive-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-olive-700">
              Beregnet udsalgspris (inkl. 25% moms)
            </p>
            <p className="mt-1 text-xl font-semibold text-olive-950">{formatDkk(previewPriceOre)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billeder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {images.map((image, index) => (
            <div key={index} className="flex gap-3">
              <Input
                placeholder="Billede-URL"
                value={image.url}
                onChange={(e) =>
                  setImages((prev) => prev.map((img, i) => (i === index ? { ...img, url: e.target.value } : img)))
                }
              />
              <Input
                placeholder="Alt-tekst"
                value={image.alt}
                onChange={(e) =>
                  setImages((prev) => prev.map((img, i) => (i === index ? { ...img, alt: e.target.value } : img)))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                aria-label="Fjern billede"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setImages((prev) => [...prev, { url: "", alt: "" }])}>
            <PlusIcon className="h-4 w-4" />
            Tilføj billede
          </Button>
          <input
            type="hidden"
            name="imagesJson"
            value={JSON.stringify(images.filter((img) => img.url.trim() !== ""))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance (GPSR/CE/fødevarer)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FieldHint className="sm:col-span-2">
            Et produkt kan ikke publiceres før disse felter er udfyldt og bekræftet nedenfor.
          </FieldHint>
          <FieldGroup>
            <Label htmlFor="manufacturer">Producent</Label>
            <Input id="manufacturer" name="manufacturer" defaultValue={initial.manufacturer} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="gpsrResponsible">GPSR-ansvarlig</Label>
            <Input id="gpsrResponsible" name="gpsrResponsible" defaultValue={initial.gpsrResponsible} />
          </FieldGroup>
          <FieldGroup className="sm:col-span-2">
            <Label htmlFor="safetyWarnings">Sikkerhedsadvarsler</Label>
            <Textarea id="safetyWarnings" name="safetyWarnings" rows={2} defaultValue={initial.safetyWarnings} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="foodIngredients">Ingredienser (fødevarer)</Label>
            <Input id="foodIngredients" name="foodIngredients" defaultValue={initial.foodIngredients} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="foodAllergens">Allergener (fødevarer)</Label>
            <Input id="foodAllergens" name="foodAllergens" defaultValue={initial.foodAllergens} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="foodShelfLife">Holdbarhed (fødevarer)</Label>
            <Input id="foodShelfLife" name="foodShelfLife" defaultValue={initial.foodShelfLife} />
          </FieldGroup>
          <FieldGroup className="flex flex-row items-center gap-2 pt-6">
            <input
              id="ceMarked"
              name="ceMarked"
              type="checkbox"
              defaultChecked={initial.ceMarked}
              className="h-4 w-4 rounded border-stone-300"
            />
            <Label htmlFor="ceMarked" className="mb-0">
              CE-mærket
            </Label>
          </FieldGroup>
          <FieldGroup className="flex flex-row items-center gap-2 pt-6 sm:col-span-2">
            <input
              id="complianceOk"
              name="complianceOk"
              type="checkbox"
              defaultChecked={initial.complianceOk}
              className="h-4 w-4 rounded border-stone-300"
            />
            <Label htmlFor="complianceOk" className="mb-0">
              Jeg bekræfter at compliance-oplysningerne er korrekte og fuldstændige
            </Label>
          </FieldGroup>
          {state?.fieldErrors?.status?.includes("compliance") ? (
            <FieldError className="sm:col-span-2">{state.fieldErrors.status}</FieldError>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Gemmer..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
