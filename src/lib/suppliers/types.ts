export interface SupplierProduct {
  supplierSku: string;
  name: string;
  description?: string;
  costPriceOre: number;
  stock: number;
  images?: string[];
}

export interface OrderPayloadLine {
  supplierSku: string;
  quantity: number;
}

export interface OrderPayload {
  orderId: string;
  lines: OrderPayloadLine[];
  shipping: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    postalCode: string;
    city: string;
    country: string;
    phone?: string;
    email?: string;
  };
}

export interface SupplierOrderResult {
  supplierOrderRef: string;
  raw?: unknown;
}

export interface TrackingInfo {
  trackingNumber: string;
  trackingUrl?: string;
  carrier?: string;
  deliveredAt?: Date;
}

export interface SupplierAdapter {
  id: string;
  syncProducts(): Promise<SupplierProduct[]>;
  getStock(sku: string): Promise<number>;
  placeOrder(order: OrderPayload): Promise<SupplierOrderResult>;
  getTracking(supplierOrderId: string): Promise<TrackingInfo | null>;
}

/** Fejl kastet af en adapter når leverandøren afviser eller ikke kan nås. */
export class SupplierAdapterError extends Error {
  constructor(
    public readonly supplierId: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(`[${supplierId}] ${message}`);
    this.name = "SupplierAdapterError";
  }
}
