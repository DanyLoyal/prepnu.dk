import type {
  OrderStatus,
  SupplierOrderStatus,
  SupplierStatus,
  SupplierType,
  ProductStatus,
} from "@/generated/prisma/enums";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Afventer betaling",
  PAID: "Betalt",
  REQUIRES_ACTION: "Kræver handling",
  REFUNDED: "Refunderet",
  PARTIALLY_REFUNDED: "Delvist refunderet",
  CANCELLED: "Annulleret",
};

export const ORDER_STATUS_TONES: Record<OrderStatus, "neutral" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "neutral",
  PAID: "success",
  REQUIRES_ACTION: "warning",
  REFUNDED: "info",
  PARTIALLY_REFUNDED: "info",
  CANCELLED: "danger",
};

export const SUPPLIER_ORDER_STATUS_LABELS: Record<SupplierOrderStatus, string> = {
  AFVENTER: "Afventer bestilling",
  BESTILT: "Bestilt hos leverandør",
  AFSENDT: "Afsendt",
  LEVERET: "Leveret",
  FEJLET: "Fejlet",
  ANNULLERET: "Annulleret",
};

export const SUPPLIER_ORDER_STATUS_TONES: Record<
  SupplierOrderStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  AFVENTER: "neutral",
  BESTILT: "info",
  AFSENDT: "info",
  LEVERET: "success",
  FEJLET: "danger",
  ANNULLERET: "danger",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: "Kladde",
  PUBLISHED: "Publiceret",
  PAUSED: "Pauset",
};

export const PRODUCT_STATUS_TONES: Record<ProductStatus, "neutral" | "success" | "warning" | "danger" | "info"> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  PAUSED: "warning",
};

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  MANUAL: "Manuel bestilling",
  BIGBUY: "BigBuy",
  CJ_DROPSHIPPING: "CJ Dropshipping",
  AMAZON_AFFILIATE: "Amazon (affiliate)",
};

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  ACTIVE: "Aktiv",
  PAUSED: "Pauset",
  ERROR: "Fejl",
};

export const SUPPLIER_STATUS_TONES: Record<SupplierStatus, "neutral" | "success" | "warning" | "danger" | "info"> = {
  ACTIVE: "success",
  PAUSED: "neutral",
  ERROR: "danger",
};
