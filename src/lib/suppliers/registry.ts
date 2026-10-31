import { ManualAdapter } from "./manual-adapter";
import type { SupplierAdapter } from "./types";

/**
 * Slår en adapter op ud fra Supplier.type i databasen.
 * BigBuy/CJ Dropshipping/Amazon-affiliate-adaptere tilføjes i Fase 5.
 */
const adapters: Record<string, SupplierAdapter> = {
  MANUAL: new ManualAdapter(),
};

export function getSupplierAdapter(supplierType: string): SupplierAdapter {
  const adapter = adapters[supplierType];
  if (!adapter) {
    throw new Error(`Ingen adapter registreret for leverandørtype: ${supplierType}`);
  }
  return adapter;
}
