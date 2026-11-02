/**
 * Et-gangs-import af en håndplukket, relevant delmængde af CJ Dropshippings
 * katalog til beredskabs-kategorierne. Ikke en generel sync-mekanisme — det
 * bygges som admin-værktøj senere (se CJDropshippingAdapter.syncProducts()
 * for den automatiserede variant, som pt. ikke er skalerbar nok til et fuldt
 * katalog-sync pga. CJ's søgebaserede produktliste).
 *
 * Kør: npx tsx scripts/import-cj-products.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { computeSellingPriceOre } from "../src/lib/pricing/markup";
import { getSslConfig } from "../src/lib/db-ssl";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(),
});
const prisma = new PrismaClient({ adapter });

// ANTAGELSE: CJ's listV2 priser er i USD. Der findes ingen live valutakurs-
// integration endnu, så denne kurs er et manuelt snapshot (ca. nov. 2026) med
// et forsigtigt tillæg for at undgå at underprissætte ved kursudsving. Bør
// erstattes af en rigtig valutakurs-kilde eller admin-justerbar indstilling.
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
  complianceOk?: boolean;
}

const products: ImportProduct[] = [
  {
    categorySlug: "kommunikation-og-lys",
    slug: "pandelampe-led-haandsfri-10w",
    name: "Pandelampe LED 10W, håndfri, genopladelig (USB-C)",
    description:
      "Kraftig pandelampe med 10W LED, 4000mAh genopladeligt batteri og USB-C opladning. Håndfri lys til camping, vandring og nødsituationer hvor strømmen er gået.",
    specs: { Lyskilde: "LED 10W", Batteri: "4000mAh", Opladning: "USB-C" },
    costPriceOre: usdToOre(6.88),
    stock: 8572,
    supplierSku: "CJSD3191818",
    imageUrl: "https://cf.cjdropshipping.com/693289f7-dee2-45a7-b951-7989f323ccaa.jpg",
  },
  {
    categorySlug: "kommunikation-og-lys",
    slug: "lommelygte-led-xhp70-opladelig",
    name: "LED Lommelygte XHP70.2, høj lysstyrke, genopladelig",
    description:
      "Kraftig taktisk LED-lommelygte med XHP70.2-pære og USB-genopladning. Robust og holdbar — ideel til beredskab, vandring og nødsituationer.",
    specs: { Lyskilde: "LED XHP70.2", Opladning: "USB" },
    costPriceOre: usdToOre(5.15),
    stock: 1_607_030,
    supplierSku: "CJJZHWSD00051",
    imageUrl: "https://cf.cjdropshipping.com/20190926/1612577980946.jpg",
  },
  {
    categorySlug: "stroem",
    slug: "powerbank-solar-kompakt",
    name: "Solcelle Powerbank, kompakt",
    description:
      "Bærbar powerbank med indbygget solcelle til opladning af telefon og småelektronik, selv uden adgang til strøm. Velegnet til beredskabslager og udendørsbrug.",
    specs: { Opladning: "Solcelle + USB" },
    costPriceOre: usdToOre(4.94),
    stock: 81_002,
    supplierSku: "CJXFLPDC00059",
    imageUrl: "https://cf.cjdropshipping.com/20200710/5060236584639.jpg",
  },
  {
    categorySlug: "varme",
    slug: "sovepose-flannel-camping",
    name: "Sovepose, flannel, camping",
    description:
      "Varm og komfortabel sovepose i flannel til camping og nødsituationer. God isolering og nemt at pakke sammen.",
    specs: { Materiale: "Flannel" },
    costPriceOre: usdToOre(25.87),
    stock: 28_292,
    supplierSku: "CJYD2072697",
    imageUrl:
      "https://oss-cf.cjdropshipping.com/product/2024/07/01/06/c3a055ec-d2b1-4786-af69-1819727cef68.jpg",
  },
  {
    categorySlug: "vand",
    slug: "noedvandfilter-baerbar",
    name: "Nødvandfilter, bærbart",
    description:
      "Kompakt vandfilter til rensning af drikkevand i nødsituationer eller på vandreture. Filtrerer bakterier og urenheder direkte fra kilden.",
    specs: { Type: "Bærbart sugerørsfilter" },
    costPriceOre: usdToOre(4.78),
    stock: 46_582,
    supplierSku: "CJYD2051646",
    imageUrl: "https://cf.cjdropshipping.com/quick/product/00cc483e-d541-413c-953d-4debfccfdbea.jpg",
  },
  {
    categorySlug: "foerstehjaelp-og-sikkerhed",
    slug: "overlevelseskit-125-dele",
    name: "Overlevelseskit, 125 dele",
    description:
      "Omfattende nødkit med værktøj og førstehjælpsudstyr til SOS-situationer, vandreture, jagt og katastrofeberedskab. 125 dele i ét kompakt kit.",
    specs: { Antal_dele: "125" },
    costPriceOre: usdToOre(49.88),
    stock: 193,
    supplierSku: "CJLY2347058",
    imageUrl: "https://cf.cjdropshipping.com/9f95a51e-f83e-48b0-a8d5-e4df5674191f.jpg",
  },
  {
    // ANTAGELSE: gaskomfur er en forbrændings-/gasenhed i samme kategori som
    // "generator/varmekilde" i planens compliance-note. Sættes bevidst til
    // DRAFT (complianceOk: false) indtil CE-mærkning/producent/sikkerheds-
    // advarsler er udfyldt — ikke noget kode håndhæver dette endnu, men det
    // bør ikke sælges uden compliance-gennemgang.
    categorySlug: "varme",
    slug: "campingkomfur-foldbart-gas",
    name: "Campingkomfur, foldbart, gas",
    description: "Bærbart foldbart gaskomfur til udendørs madlavning. Kompakt og let at medbringe.",
    specs: { Type: "Foldbart gaskomfur" },
    costPriceOre: usdToOre(32.0),
    stock: 25_000,
    supplierSku: "CJJT2052346",
    imageUrl:
      "https://oss-cf.cjdropshipping.com/product/2024/06/03/05/96d3a08b-dc04-45f2-94fd-03eb7b7aa661_trans.jpeg",
    complianceOk: false,
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
      markupValue: 45,
      roundingRule: "NEAREST_WHOLE",
    });

    const complianceOk = p.complianceOk ?? true;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        costPriceOre: p.costPriceOre,
        sellingPriceOre,
        stock: p.stock,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        specs: p.specs,
        status: complianceOk ? "PUBLISHED" : "DRAFT",
        categoryId: category.id,
        supplierId: supplier.id,
        supplierSku: p.supplierSku,
        costPriceOre: p.costPriceOre,
        markupType: "PERCENT",
        markupValue: 45,
        roundingRule: "NEAREST_WHOLE",
        sellingPriceOre,
        stock: p.stock,
        complianceOk,
      },
    });

    const existingImage = await prisma.productImage.findFirst({ where: { productId: product.id } });
    if (!existingImage) {
      await prisma.productImage.create({
        data: { productId: product.id, url: p.imageUrl, alt: p.name, sortOrder: 0 },
      });
    }

    console.log(
      `${complianceOk ? "✓ PUBLISHED" : "○ DRAFT     "} ${p.slug} — kostpris ${(p.costPriceOre / 100).toFixed(2)} kr, salgspris ${(sellingPriceOre / 100).toFixed(2)} kr`,
    );
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
