import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const SORT_OPTIONS = {
  "navn-az": { label: "Navn (A-Å)", orderBy: { name: "asc" } as const },
  "navn-za": { label: "Navn (Å-A)", orderBy: { name: "desc" } as const },
  "pris-op": { label: "Pris (lav til høj)", orderBy: { sellingPriceOre: "asc" } as const },
  "pris-ned": { label: "Pris (høj til lav)", orderBy: { sellingPriceOre: "desc" } as const },
} satisfies Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput }>;

export type SortKey = keyof typeof SORT_OPTIONS;

export function isSortKey(value: string | undefined): value is SortKey {
  return !!value && value in SORT_OPTIONS;
}

export interface ProductFilterParams {
  minPriceKr?: number;
  maxPriceKr?: number;
  inStockOnly?: boolean;
  sort?: SortKey;
}

export function buildProductWhere(
  filters: ProductFilterParams,
  extra: Prisma.ProductWhereInput = {},
): Prisma.ProductWhereInput {
  const priceFilter: Prisma.IntFilter = {};
  if (filters.minPriceKr !== undefined) priceFilter.gte = Math.round(filters.minPriceKr * 100);
  if (filters.maxPriceKr !== undefined) priceFilter.lte = Math.round(filters.maxPriceKr * 100);

  return {
    status: "PUBLISHED",
    ...(Object.keys(priceFilter).length > 0 ? { sellingPriceOre: priceFilter } : {}),
    ...(filters.inStockOnly ? { stock: { gt: 0 } } : {}),
    ...extra,
  };
}

const productCardInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  category: true,
} satisfies Prisma.ProductInclude;

export type ProductCardData = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>;

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getProductsForCategory(
  categoryId: string,
  filters: ProductFilterParams,
): Promise<ProductCardData[]> {
  const sortKey = filters.sort ?? "navn-az";
  return prisma.product.findMany({
    where: buildProductWhere(filters, { categoryId }),
    orderBy: SORT_OPTIONS[sortKey].orderBy,
    include: productCardInclude,
  });
}

export async function searchProducts(
  query: string,
  filters: ProductFilterParams,
): Promise<ProductCardData[]> {
  const sortKey = filters.sort ?? "navn-az";
  return prisma.product.findMany({
    where: buildProductWhere(filters, {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    }),
    orderBy: SORT_OPTIONS[sortKey].orderBy,
    include: productCardInclude,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      supplier: true,
    },
  });
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string, take = 4) {
  return prisma.product.findMany({
    where: { categoryId, status: "PUBLISHED", id: { not: excludeProductId } },
    include: productCardInclude,
    take,
  });
}

export function parseFilterSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ProductFilterParams {
  const get = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const minPris = get("minPris");
  const maxPris = get("maxPris");
  const sortering = get("sortering");

  return {
    minPriceKr: minPris ? Number(minPris) : undefined,
    maxPriceKr: maxPris ? Number(maxPris) : undefined,
    inStockOnly: get("paaLager") === "1",
    sort: isSortKey(sortering) ? sortering : undefined,
  };
}

export async function getFeaturedProducts(take = 4): Promise<ProductCardData[]> {
  // Ingen salgshistorik endnu — "bestsellere" er pt. de produkter der er
  // oprettet først. Byt til reel salgsstatistik når der findes ordredata.
  return prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
    take,
    include: productCardInclude,
  });
}
