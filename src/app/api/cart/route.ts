import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const productIds = Array.isArray(body?.productIds) ? body.productIds.filter((id: unknown) => typeof id === "string") : [];

  if (productIds.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "PUBLISHED" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.images[0]?.url ?? null,
      sellingPriceOre: product.sellingPriceOre,
      stock: product.stock,
      requiresAgeCheck: product.requiresAgeCheck,
    })),
  });
}
