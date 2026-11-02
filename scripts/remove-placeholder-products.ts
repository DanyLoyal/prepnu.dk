/**
 * Fjerner de oprindelige demo-/placeholder-produkter fra seed.ts (supplier
 * "MANUAL" med placehold.co-billeder og opdigtede priser). Køres kun når der
 * er reelle leverandør-produkter (CJ/BigBuy) til at erstatte dem, så kataloget
 * ikke sælger varer der ikke findes.
 *
 * Sikkerhedstjek: sletter kun hvis ingen OrderLine refererer produktet.
 *
 * Kør: npx tsx scripts/remove-placeholder-products.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getSslConfig } from "../src/lib/db-ssl";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl: getSslConfig() });
const prisma = new PrismaClient({ adapter });

async function main() {
  const placeholderProducts = await prisma.product.findMany({
    where: { supplierId: "supplier-manual" },
    select: { id: true, slug: true },
  });

  for (const product of placeholderProducts) {
    const orderLineCount = await prisma.orderLine.count({ where: { productId: product.id } });
    if (orderLineCount > 0) {
      console.log(`SPRINGER OVER ${product.slug} — har ${orderLineCount} ordrelinje(r), kan ikke slettes sikkert`);
      continue;
    }
    await prisma.product.delete({ where: { id: product.id } });
    console.log(`Slettet: ${product.slug}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
