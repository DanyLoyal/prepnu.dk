import { SORT_OPTIONS, type SortKey } from "@/lib/catalog";

interface ProductFiltersProps {
  action: string;
  hiddenFields?: Record<string, string>;
  values: {
    minPriceKr?: number;
    maxPriceKr?: number;
    inStockOnly?: boolean;
    sort?: SortKey;
  };
}

export function ProductFilters({ action, hiddenFields, values }: ProductFiltersProps) {
  return (
    <form
      action={action}
      method="get"
      className="flex flex-wrap items-end gap-4 rounded-lg border border-stone-200 bg-white p-4"
    >
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}

      <label className="flex flex-col text-sm text-stone-600">
        Min. pris (kr.)
        <input
          type="number"
          name="minPris"
          min={0}
          step={1}
          defaultValue={values.minPriceKr}
          className="mt-1 w-28 rounded border border-stone-300 px-2 py-1.5"
        />
      </label>

      <label className="flex flex-col text-sm text-stone-600">
        Max. pris (kr.)
        <input
          type="number"
          name="maxPris"
          min={0}
          step={1}
          defaultValue={values.maxPriceKr}
          className="mt-1 w-28 rounded border border-stone-300 px-2 py-1.5"
        />
      </label>

      <label className="flex items-center gap-2 pb-1.5 text-sm text-stone-600">
        <input
          type="checkbox"
          name="paaLager"
          value="1"
          defaultChecked={values.inStockOnly}
          className="h-4 w-4 rounded border-stone-300"
        />
        Kun på lager
      </label>

      <label className="flex flex-col text-sm text-stone-600">
        Sortér
        <select
          name="sortering"
          defaultValue={values.sort ?? "navn-az"}
          className="mt-1 rounded border border-stone-300 px-2 py-1.5"
        >
          {Object.entries(SORT_OPTIONS).map(([key, option]) => (
            <option key={key} value={key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-md bg-olive-900 px-4 py-2 text-sm font-semibold text-stone-50 transition hover:bg-olive-800"
      >
        Filtrér
      </button>
    </form>
  );
}
