/**
 * Anden runde af håndplukket CJ Dropshipping-import, se import-cj-products.ts
 * for kontekst. Denne runde dækker hygiejne-og-papir (første rigtige produkt
 * i den kategori) samt to ekstra kommunikation-og-lys-produkter.
 *
 * Søgning efter rigtige mad-/nødrations-, vandopbevarings- og
 * førstehjælpsforbrugsvarer (bandage, gauze, tourniquet, vandrensningstabs)
 * gav intet brugbart i CJ's katalog — det er ikke et søgeords-problem, CJ
 * har bare ikke den slags i sortimentet. De kategorier mangler stadig en
 * reel leverandør.
 *
 * Kør: npx tsx scripts/import-cj-products-round2.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { computeSellingPriceOre } from "../src/lib/pricing/markup";
import { getSslConfig } from "../src/lib/db-ssl";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl: getSslConfig() });
const prisma = new PrismaClient({ adapter });

const USD_TO_DKK = 6.8;
function usdToOre(usd: number): number {
  return Math.round(usd * USD_TO_DKK * 100);
}

interface ImportProduct {
  categorySlug: string;
  slug: string;
  name: string;
  description: string;
  specs: Record<string, string>;
  costPriceOre: number;
  stock: number;
  supplierSku: string;
  imageUrl: string;
}

const products: ImportProduct[] = [
  {
    categorySlug: "kommunikation-og-lys",
    slug: "walkie-talkie-baofeng-uv5r",
    name: "Walkie-talkie Baofeng UV-5R, dual-band",
    description:
      "Robust håndholdt walkie-talkie fra Baofeng (UV-5R) med dual-band VHF/UHF-modtagelse. Velegnet til kommunikation i familien eller gruppen under nødsituationer, hvor mobilnettet er nede.",
    specs: { Model: "Baofeng UV-5R", Frekvens: "VHF/UHF dual-band" },
    costPriceOre: usdToOre(23.15),
    stock: 200_004,
    supplierSku: "CJMD1086424",
    imageUrl: "https://cf.cjdropshipping.com/1618804365409.jpg",
  },
  {
    categorySlug: "kommunikation-og-lys",
    slug: "campinglygte-led-magnetisk-genopladelig",
    name: "Campinglygte LED, magnetisk, genopladelig",
    description:
      "Genopladelig LED-campinglygte med magnetisk fod til ophæng i telt eller på metaloverflader. Kompakt nødlys til strømafbrydelser og udendørsbrug.",
    specs: { Opladning: "USB Type-C", Type: "Magnetisk campinglygte" },
    costPriceOre: usdToOre(5.84),
    stock: 9048,
    supplierSku: "CJSD3161143",
    imageUrl: "https://cf.cjdropshipping.com/d22bd8b1-815f-416e-b982-a2ee476b161a.jpg",
  },
  {
    categorySlug: "hygiejne-og-papir",
    slug: "engangshandsker-nitril-pulverfri",
    name: "Engangshandsker, nitril, pulverfri",
    description:
      "Boks med pulverfri engangshandsker i nitril. Velegnet til førstehjælp, rengøring og hygiejne i nødsituationer, hvor rent vand og sæbe ikke altid er tilgængeligt.",
    specs: { Materiale: "Nitril", Type: "Pulverfri" },
    costPriceOre: usdToOre(2.89),
    stock: 360_000,
    supplierSku: "CJST1130524",
    imageUrl: "https://cf.cjdropshipping.com/1621098783284.jpg",
  },
];

async function main() {
  const supplier = await prisma.supplier.upsert({
    where: { id: "supplier-cj-dropshipping" },
    update: {},
    create: {
      id: "supplier-cj-dropshipping",
      type: "CJ_DROPSHIPPING",
      name: "CJ Dropshipping",
      status: "ACTIVE",
      apiBaseUrl: process.env.CJ_DROPSHIPPING_API_BASE_URL,
    },
  });

  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    if (!category) {
      console.error(`Kategori ikke fundet: ${p.categorySlug}, springer ${p.slug} over`);
      continue;
    }

    const sellingPriceOre = computeSellingPriceOre({
      costPriceOre: p.costPriceOre,
      markupType: "PERCENT",
      markupValue: 35,
      roundingRule: "NINETY_FIVE_OERE",
    });

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { costPriceOre: p.costPriceOre, sellingPriceOre, stock: p.stock },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        specs: p.specs,
        status: "PUBLISHED",
        categoryId: category.id,
        supplierId: supplier.id,
        supplierSku: p.supplierSku,
        costPriceOre: p.costPriceOre,
        markupType: "PERCENT",
        markupValue: 35,
        roundingRule: "NINETY_FIVE_OERE",
        sellingPriceOre,
        stock: p.stock,
        complianceOk: true,
      },
    });

    const existingImage = await prisma.productImage.findFirst({ where: { productId: product.id } });
    if (!existingImage) {
      await prisma.productImage.create({
        data: { productId: product.id, url: p.imageUrl, alt: p.name, sortOrder: 0 },
      });
    }

    console.log(
      `✓ ${p.slug} — kostpris ${(p.costPriceOre / 100).toFixed(2)} kr, salgspris ${(sellingPriceOre / 100).toFixed(2)} kr`,
    );
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
