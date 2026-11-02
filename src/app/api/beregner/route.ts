import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { computeBeredskabNeeds } from "@/lib/calculator/beredskab";

const inputSchema = z.object({
  adults: z.coerce.number().int().min(0).max(50),
  children: z.coerce.number().int().min(0).max(50),
  days: z.coerce.number().int().min(1).max(90),
});

export interface BeregnerResultItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  unitPriceOre: number;
  quantity: number;
  categoryLabel: string;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldigt input" }, { status: 400 });
  }

  const preset = await prisma.calculatorPreset.findUnique({ where: { id: "default" } });
  if (!preset) {
    return NextResponse.json({ error: "Beregneren er ikke konfigureret endnu" }, { status: 500 });
  }

  const needs = computeBeredskabNeeds(parsed.data, preset);
  const usedProductIds = new Set<string>();
  const items: BeregnerResultItem[] = [];

  for (const need of needs) {
    const candidates = await prisma.product.findMany({
      where: {
        category: { slug: need.categorySlug },
        status: "PUBLISHED",
        stock: { gt: 0 },
      },
      orderBy: { sellingPriceOre: "asc" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      take: 10,
    });

    const product = candidates.find((candidate) => !usedProductIds.has(candidate.id)) ?? candidates[0];
    if (!product) continue;

    usedProductIds.add(product.id);
    items.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.images[0]?.url ?? null,
      unitPriceOre: product.sellingPriceOre,
      quantity: need.quantity,
      categoryLabel: need.label,
    });
  }

  const totalOre = items.reduce((sum, item) => sum + item.unitPriceOre * item.quantity, 0);

  return NextResponse.json({ items, totalOre });
}
