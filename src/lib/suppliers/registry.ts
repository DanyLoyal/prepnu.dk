import { ManualAdapter } from "./manual-adapter";
import { BigBuyAdapter } from "./bigbuy-adapter";
import { CJDropshippingAdapter } from "./cj-dropshipping-adapter";
import type { SupplierAdapter } from "./types";

/**
 * Slår en adapter op ud fra Supplier.type i databasen.
 * AMAZON_AFFILIATE har bevidst ingen adapter her — den leverandørtype viser kun et
 * eksternt affiliate-link på produktsiden og har hverken "Læg i kurv" eller
 * placeOrder (se produktside-komponenten), jf. beslutningen om ikke at automatisere
 * bestilling fra Amazon.
 */
const adapters: Record<string, SupplierAdapter> = {
  MANUAL: new ManualAdapter(),
  BIGBUY: new BigBuyAdapter(),
  CJ_DROPSHIPPING: new CJDropshippingAdapter(),
};

export function getSupplierAdapter(supplierType: string): SupplierAdapter {
  const adapter = adapters[supplierType];
  if (!adapter) {
    throw new Error(`Ingen adapter registreret for leverandørtype: ${supplierType}`);
  }
  return adapter;
}
