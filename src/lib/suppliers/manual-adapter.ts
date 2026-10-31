import type {
  OrderPayload,
  SupplierAdapter,
  SupplierOrderResult,
  SupplierProduct,
  TrackingInfo,
} from "./types";

/**
 * Leverandør hvor bestilling foregår manuelt af butiksejeren.
 * placeOrder opretter ikke et eksternt kald — ordren lander i admin som
 * "Afventer bestilling hos leverandør", og tracking/ordrenummer indtastes manuelt.
 */
export class ManualAdapter implements SupplierAdapter {
  id = "manual";

  async syncProducts(): Promise<SupplierProduct[]> {
    // Manuelle leverandører har ingen API at synkronisere fra.
    return [];
  }

  async getStock(): Promise<number> {
    // Lager styres manuelt af admin i produktkortet.
    throw new Error("ManualAdapter understøtter ikke automatisk lageropslag");
  }

  async placeOrder(order: OrderPayload): Promise<SupplierOrderResult> {
    return {
      supplierOrderRef: `MANUAL-${order.orderId}`,
    };
  }

  async getTracking(): Promise<TrackingInfo | null> {
    // Tracking indtastes manuelt af admin og læses direkte fra SupplierOrder i DB.
    return null;
  }
}
