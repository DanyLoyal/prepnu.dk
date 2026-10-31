import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type MarkupType, type RoundingRule } from "../src/generated/prisma/client";
import { computeSellingPriceOre } from "../src/lib/pricing/markup";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface SeedProduct {
  slug: string;
  name: string;
  description: string;
  specs: Record<string, string>;
  weightGrams: number;
  costPriceOre: number;
  markupType?: MarkupType;
  markupValue?: number;
  roundingRule?: RoundingRule;
  stock: number;
  requiresAgeCheck?: boolean;
  images?: string[];
  compliance?: {
    ceMarked?: boolean;
    manufacturer?: string;
    gpsrResponsible?: string;
    safetyWarnings?: string;
    foodIngredients?: string;
    foodAllergens?: string;
    foodShelfLife?: string;
  };
  /** Sæt false for at demonstrere compliance-gate (produkt kan ikke publiceres). */
  complianceOk?: boolean;
}

interface SeedCategory {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  products: SeedProduct[];
}

const PLACEHOLDER_IMAGE = (seed: string) =>
  `https://placehold.co/800x800?text=${encodeURIComponent(seed)}`;

const categories: SeedCategory[] = [
  {
    slug: "hygiejne-og-papir",
    name: "Hygiejne og papir",
    description: "Toiletpapir, køkkenrulle, vådservietter og sæbe til hverdag og krise.",
    sortOrder: 1,
    products: [
      {
        slug: "toiletpapir-kasse-48-ruller",
        name: "Toiletpapir, kasse á 48 ruller",
        description:
          "3-lags toiletpapir i storkasse. Holdbart ved tør opbevaring og ideelt til langtidslagring i beredskabslageret.",
        specs: { Lag: "3", "Ruller pr. kasse": "48", Materiale: "100% cellulose" },
        weightGrams: 9500,
        costPriceOre: 14900,
        stock: 120,
        compliance: {},
        complianceOk: true,
      },
      {
        slug: "koekkenrulle-kasse-24-stk",
        name: "Køkkenrulle, kasse á 24 ruller",
        description: "Ekstra absorberende køkkenrulle, praktisk til oprydning og hygiejne i en nødsituation.",
        specs: { "Ruller pr. kasse": "24", Lag: "2" },
        weightGrams: 7200,
        costPriceOre: 12900,
        stock: 95,
        complianceOk: true,
      },
      {
        slug: "vaadservietter-10x80-stk",
        name: "Vådservietter, pakke med 10x80 stk",
        description: "Parfumefrie vådservietter til personlig hygiejne når der ikke er adgang til rindende vand.",
        specs: { Antal: "800 stk (10x80)", Parfume: "Nej" },
        weightGrams: 4800,
        costPriceOre: 17900,
        stock: 80,
        complianceOk: true,
      },
      {
        slug: "haandsaebe-flydende-5l",
        name: "Håndsæbe, flydende, 5 liter dunk",
        description: "Mild flydende håndsæbe i stor dunk til genopfyldning af sæbepumper.",
        specs: { Volumen: "5 L", pH: "5,5 (hudneutral)" },
        weightGrams: 5100,
        costPriceOre: 9900,
        stock: 60,
        complianceOk: true,
      },
      {
        slug: "engangshandsker-nitril-100-stk",
        name: "Engangshandsker, nitril, 100 stk",
        description: "Pudderfri nitrilhandsker i æske med 100 stk, str. M. Velegnet til hygiejne og førstehjælp.",
        specs: { Materiale: "Nitril", Antal: "100", Størrelse: "M" },
        weightGrams: 950,
        costPriceOre: 6900,
        stock: 150,
        complianceOk: true,
      },
    ],
  },
  {
    slug: "toerlager-og-noedmad",
    name: "Tørlager og nødmad",
    description: "Frysetørret mad, konserves, ris, pasta, havregryn og nødrationer med lang holdbarhed.",
    sortOrder: 2,
    products: [
      {
        slug: "frysetoerret-pastaret-4-portioner",
        name: "Frysetørret pastaret med kød, 4 portioner",
        description: "Færdigret der tilberedes ved blot at tilsætte kogende vand. 25 års holdbarhed uåbnet.",
        specs: { Portioner: "4", Tilberedning: "Tilsæt kogende vand, vent 10 min", Holdbarhed: "25 år" },
        weightGrams: 170,
        costPriceOre: 9900,
        stock: 200,
        compliance: {
          foodIngredients: "Pasta, tørret kød, grøntsager, krydderier",
          foodAllergens: "Gluten",
          foodShelfLife: "25 år uåbnet, køligt og tørt",
        },
        complianceOk: true,
      },
      {
        slug: "noedration-2400-kcal",
        name: "Nødration, 2.400 kcal (24-timers)",
        description: "Kompakt energibarre-baseret nødration designet til 24 timers energibehov. Kræver ikke tilberedning.",
        specs: { Energi: "2.400 kcal", Holdbarhed: "5 år", Tilberedning: "Kræver ikke vand eller varme" },
        weightGrams: 500,
        costPriceOre: 6900,
        stock: 250,
        compliance: {
          foodIngredients: "Hvedemel, vegetabilsk fedt, sukker, vitaminer",
          foodAllergens: "Gluten, kan indeholde spor af nødder",
          foodShelfLife: "5 år uåbnet",
        },
        complianceOk: true,
      },
      {
        slug: "ris-parboiled-5kg",
        name: "Ris, parboiled, 5 kg sæk",
        description: "Langtidsholdbar parboiled ris i vakuumpakket sæk, velegnet til beredskabslager.",
        specs: { Vægt: "5 kg", Type: "Parboiled" },
        weightGrams: 5000,
        costPriceOre: 7900,
        stock: 140,
        compliance: {
          foodIngredients: "100% ris",
          foodAllergens: "Ingen kendte allergener",
          foodShelfLife: "2 år uåbnet, tørt og mørkt",
        },
        complianceOk: true,
      },
      {
        slug: "havregryn-3kg",
        name: "Havregryn, 3 kg sæk",
        description: "Grove havregryn, velegnet til hurtig og mættende morgenmad i en krisesituation.",
        specs: { Vægt: "3 kg" },
        weightGrams: 3000,
        costPriceOre: 4900,
        stock: 160,
        compliance: {
          foodIngredients: "100% havregryn",
          foodAllergens: "Gluten, kan indeholde spor af nødder",
          foodShelfLife: "18 måneder uåbnet",
        },
        complianceOk: true,
      },
      {
        slug: "konserves-boenner-daase-6-pak",
        name: "Konserves, bønner i tomat, 6-pak dåser",
        description: "Færdigretter på dåse der kan spises kolde eller varmes. Lang holdbarhed uden køling.",
        specs: { Antal: "6 dåser á 400 g" },
        weightGrams: 2600,
        costPriceOre: 8900,
        stock: 130,
        compliance: {
          foodIngredients: "Hvide bønner, tomatsauce, krydderier",
          foodAllergens: "Ingen kendte allergener",
          foodShelfLife: "3 år uåbnet",
        },
        complianceOk: true,
      },
    ],
  },
  {
    slug: "vand",
    name: "Vand",
    description: "Vanddunke, filtre og rensetabletter til rent drikkevand uanset forsyning.",
    sortOrder: 3,
    products: [
      {
        slug: "vanddunk-20l-bpa-fri",
        name: "Vanddunk, 20 liter, BPA-fri",
        description: "Robust foldbar vanddunk i fødevaregodkendt plast med tappehane. BPA-fri.",
        specs: { Volumen: "20 L", Materiale: "BPA-fri HDPE" },
        weightGrams: 900,
        costPriceOre: 12900,
        stock: 110,
        complianceOk: true,
      },
      {
        slug: "vandfilter-sugeroer",
        name: "Vandfilter, sugerør-type",
        description: "Kompakt personligt vandfilter der fjerner bakterier og parasitter fra op til 1.000 liter vand.",
        specs: { Kapacitet: "1.000 L", Filtrering: "0,2 mikron" },
        weightGrams: 60,
        costPriceOre: 14900,
        stock: 180,
        complianceOk: true,
      },
      {
        slug: "vandrensningstabletter-50-stk",
        name: "Vandrensningstabletter, 50 stk",
        description: "Klortabletter til hurtig rensning af drikkevand. En tablet renser op til 1 liter vand.",
        specs: { Antal: "50 stk", Dosering: "1 tablet pr. liter" },
        weightGrams: 100,
        costPriceOre: 8900,
        stock: 200,
        complianceOk: true,
      },
      {
        slug: "foldbar-vanddunk-10l",
        name: "Foldbar vanddunk, 10 liter",
        description: "Letvægts foldbar vanddunk til opbevaring og transport af drikkevand. Fylder minimalt tom.",
        specs: { Volumen: "10 L" },
        weightGrams: 300,
        costPriceOre: 8900,
        stock: 140,
        complianceOk: true,
      },
      {
        slug: "keramisk-vandfilter-til-toende",
        name: "Keramisk vandfilter til tønde",
        description: "To-delt keramisk gravitationsfilter til montering på egen beholder. Fjerner bakterier, cyster og mikroplast.",
        specs: { Kapacitet: "ca. 1.500 L pr. filter", Filterelementer: "2 stk inkluderet" },
        weightGrams: 2200,
        costPriceOre: 34900,
        stock: 45,
        complianceOk: true,
      },
    ],
  },
  {
    slug: "stroem",
    name: "Strøm",
    description: "Generatorer, powerstations, solpaneler og powerbanks til strøm uden for nettet.",
    sortOrder: 4,
    products: [
      {
        slug: "generator-benzin-2000w",
        name: "Generator, benzin, 2000W",
        description:
          "Bærbar benzingenerator med 2000W effekt, velegnet til nødstrøm i hjemmet. Kræver korrekt ventilation ved brug.",
        specs: { Effekt: "2.000 W", Brændstof: "Benzin", Tankvolumen: "4,2 L" },
        weightGrams: 21000,
        costPriceOre: 189900,
        stock: 15,
        requiresAgeCheck: true,
        compliance: {
          // Bevidst ufuldstændig for at demonstrere compliance-gaten i admin.
          ceMarked: undefined,
        },
        complianceOk: false,
      },
      {
        slug: "powerstation-1000wh-solar-input",
        name: "Powerstation, 1000Wh, med solpanel-input",
        description: "Genopladelig powerstation med 1000Wh kapacitet og flere udtag. Kan oplades via solpanel, bil eller stikkontakt.",
        specs: { Kapacitet: "1.000 Wh", Udtag: "2x AC, 2x USB-C, 2x USB-A" },
        weightGrams: 11000,
        costPriceOre: 349900,
        stock: 20,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
      {
        slug: "solpanel-foldbart-100w",
        name: "Solpanel, foldbart, 100W",
        description: "Letvægts foldbart solpanel til opladning af powerstations og powerbanks i felten.",
        specs: { Effekt: "100 W", Udgang: "USB-C og DC" },
        weightGrams: 3400,
        costPriceOre: 99900,
        stock: 30,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
      {
        slug: "powerbank-20000mah-solar",
        name: "Powerbank, 20.000 mAh, med solcelle",
        description: "Robust powerbank med indbygget solcelle til nødopladning af telefon og mindre udstyr.",
        specs: { Kapacitet: "20.000 mAh", Solcelle: "Ja" },
        weightGrams: 450,
        costPriceOre: 29900,
        stock: 85,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
      {
        slug: "powerbank-50000mah",
        name: "Powerbank, 50.000 mAh",
        description: "Høj-kapacitet powerbank der kan oplade telefoner flere gange eller mindre elektronik.",
        specs: { Kapacitet: "50.000 mAh", Udtag: "2x USB-A, 1x USB-C" },
        weightGrams: 980,
        costPriceOre: 44900,
        stock: 55,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
    ],
  },
  {
    slug: "varme",
    name: "Varme",
    description: "Gasvarmere, petroleumsovne, varmetæpper, sovesposer og brænde.",
    sortOrder: 5,
    products: [
      {
        slug: "gasvarmer-keramisk-campinggas",
        name: "Gasvarmer, keramisk, til campinggas",
        description: "Keramisk katalytisk gasvarmer til brug med standard campinggaspatroner. Kun til udendørs/ventileret brug.",
        specs: { Brændstof: "Campinggas (butan/propan)", Effekt: "ca. 1.500 W" },
        weightGrams: 1200,
        costPriceOre: 29900,
        stock: 40,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]", safetyWarnings: "Må kun bruges i ventilerede rum. Ikke til brug i sovende rum." },
        complianceOk: true,
      },
      {
        slug: "petroleumsovn-3l-tank",
        name: "Petroleumsovn, 3 liter tank",
        description: "Petroleumsovn til nødopvarmning, 3 liter tank giver flere timers drift. Kræver ventilation.",
        specs: { Tankvolumen: "3 L", Driftstid: "ca. 10 timer" },
        weightGrams: 4200,
        costPriceOre: 54900,
        stock: 18,
        requiresAgeCheck: true,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]", safetyWarnings: "Må kun bruges i ventilerede rum." },
        complianceOk: true,
      },
      {
        slug: "varmetaeppe-noedsituation-10-pak",
        name: "Varmetæppe til nødsituation, 10-pak",
        description: "Kompakte termiske nødtæpper der reflekterer op til 90% af kropsvarmen. Pakket enkeltvis.",
        specs: { Antal: "10 stk", Mål: "210x130 cm pr. stk" },
        weightGrams: 600,
        costPriceOre: 8900,
        stock: 120,
        complianceOk: true,
      },
      {
        slug: "sovepose-minus-15",
        name: "Sovepose, -15°C",
        description: "Trevejs-sovepose til ekstreme temperaturer ned til -15°C. Velegnet til beredskab og vinterture.",
        specs: { Temperaturområde: "ned til -15°C", Materiale: "Polyester/dun-imitation" },
        weightGrams: 1800,
        costPriceOre: 44900,
        stock: 50,
        complianceOk: true,
      },
      {
        slug: "braende-netto-20kg",
        name: "Brænde, nettosæk 20 kg",
        description: "Tørret kløvet brænde i nettosæk, klar til brug i brændeovn eller udendørs bålsted.",
        specs: { Vægt: "20 kg", Fugtighed: "under 20%" },
        weightGrams: 20000,
        costPriceOre: 7900,
        stock: 200,
        complianceOk: true,
      },
    ],
  },
  {
    slug: "kommunikation-og-lys",
    name: "Kommunikation og lys",
    description: "Nødradioer, batterier, opladere, pandelamper og lygter.",
    sortOrder: 6,
    products: [
      {
        slug: "noedradio-haandsving-sol",
        name: "Nødradio, håndsving/sol, med lommelygte",
        description: "Multifunktions nødradio der oplades via håndsving, solceller eller USB. Indbygget lommelygte og powerbank-funktion.",
        specs: { Opladning: "Håndsving, sol, USB", Radio: "AM/FM/NOAA" },
        weightGrams: 450,
        costPriceOre: 29900,
        stock: 70,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
      {
        slug: "pandelampe-usb-c-genopladelig",
        name: "Pandelampe, USB-C genopladelig, 500 lumen",
        description: "Letvægts pandelampe med flere lysstyrker og rødt nødlys. Genoplades via USB-C.",
        specs: { Lysstyrke: "500 lumen", Batteritid: "op til 20 timer på lavt blus" },
        weightGrams: 90,
        costPriceOre: 19900,
        stock: 100,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
      {
        slug: "led-lommelygte-1000-lumen",
        name: "LED-lommelygte, genopladelig, 1000 lumen",
        description: "Kraftig genopladelig LED-lommelygte med zoom-funktion og robust aluminiumshus.",
        specs: { Lysstyrke: "1.000 lumen", Opladning: "USB-C" },
        weightGrams: 220,
        costPriceOre: 24900,
        stock: 90,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
      {
        slug: "batterier-aa-20-pak",
        name: "Batterier AA, alkaline, 20-pak",
        description: "Alkaline AA-batterier med lang holdbarhed, velegnet til lommelygter og radioer i beredskabslageret.",
        specs: { Type: "AA (LR6)", Antal: "20 stk", Holdbarhed: "10 år ubrugt" },
        weightGrams: 460,
        costPriceOre: 9900,
        stock: 300,
        complianceOk: true,
      },
      {
        slug: "solcellelampe-til-ophaeng",
        name: "Solcellelampe til ophæng",
        description: "Opladelig solcellelampe med krog, ideel som nødlys i tält, skur eller ved strømafbrydelse.",
        specs: { Opladning: "Solcelle/USB", Lystid: "op til 12 timer" },
        weightGrams: 180,
        costPriceOre: 14900,
        stock: 75,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
    ],
  },
  {
    slug: "foerstehjaelp-og-sikkerhed",
    name: "Førstehjælp og sikkerhed",
    description: "Førstehjælpskasser, røgalarmer, CO-alarmer og brandtæpper.",
    sortOrder: 7,
    products: [
      {
        slug: "foerstehjaelpskasse-stor-din-13169",
        name: "Førstehjælpskasse, stor, DIN 13169",
        description: "Komplet førstehjælpskasse efter DIN 13169-standard til hjem og erhverv. Robust vægmonterbar kasse.",
        specs: { Standard: "DIN 13169", Indhold: "Forbindsstoffer, plastre, saks, handsker m.m." },
        weightGrams: 1400,
        costPriceOre: 24900,
        stock: 60,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
      {
        slug: "roegalarm-10-aars-batteri",
        name: "Røgalarm med 10-års batteri",
        description: "Fotoelektrisk røgalarm med forseglet 10-års batteri — ingen batteriskift, ingen irriterende bip.",
        specs: { Batteri: "Forseglet, 10 år", Type: "Fotoelektrisk" },
        weightGrams: 220,
        costPriceOre: 14900,
        stock: 85,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
      {
        slug: "co-alarm-kulmonoxid",
        name: "CO-alarm (kulmonoxid)",
        description: "Kulmonoxidalarm med digitalt display og lydalarm. Essentiel ved brug af generator, gas eller brændeovn indendørs.",
        specs: { Sensor: "Elektrokemisk", Display: "Digitalt" },
        weightGrams: 200,
        costPriceOre: 19900,
        stock: 70,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
      {
        slug: "brandtaeppe-1x1m",
        name: "Brandtæppe, 1x1 meter",
        description: "Brandtæppe i glasfiber til hurtig kvælning af mindre brande, f.eks. i køkkenet.",
        specs: { Mål: "1x1 m", Materiale: "Glasfiber" },
        weightGrams: 400,
        costPriceOre: 9900,
        stock: 100,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
      {
        slug: "noedkit-forbinding-tourniquet-saks",
        name: "Nødkit med forbinding, tourniquet og saks",
        description: "Kompakt trauma-kit til akutte situationer: elastisk bandage, tourniquet, nødsaks og handsker.",
        specs: { Indhold: "Tourniquet, bandage, saks, handsker" },
        weightGrams: 350,
        costPriceOre: 17900,
        stock: 65,
        compliance: { ceMarked: true, manufacturer: "[UDFYLD]", gpsrResponsible: "[UDFYLD]" },
        complianceOk: true,
      },
    ],
  },
  {
    slug: "faerdige-beredskabspakker",
    name: "Færdige beredskabspakker",
    description: "Samlede pakker til 72 timer, en uge eller hele familien — klar til at stille på hylden.",
    sortOrder: 8,
    products: [
      {
        slug: "72-timers-kit-1-person",
        name: "72-timers kit, 1 person",
        description: "Komplet nødpakke dækker en enkelt persons grundbehov for vand, mad, lys og varme i 72 timer.",
        specs: { Varighed: "72 timer", Personer: "1" },
        weightGrams: 4500,
        costPriceOre: 49900,
        stock: 40,
        compliance: { foodShelfLife: "Se enkeltprodukter" },
        complianceOk: true,
      },
      {
        slug: "1-uges-kit-1-person",
        name: "1-uges kit, 1 person",
        description: "Udvidet nødpakke med mad, vand, lys og varme til en uge for en person.",
        specs: { Varighed: "7 dage", Personer: "1" },
        weightGrams: 12000,
        costPriceOre: 129900,
        stock: 25,
        compliance: { foodShelfLife: "Se enkeltprodukter" },
        complianceOk: true,
      },
      {
        slug: "familiepakke-4-personer-3-dage",
        name: "Familiepakke, 4 personer, 3 dage",
        description: "Dækker en families grundbehov for mad, vand, lys og varme i tre dage.",
        specs: { Varighed: "3 dage", Personer: "4" },
        weightGrams: 15000,
        costPriceOre: 169900,
        stock: 20,
        compliance: { foodShelfLife: "Se enkeltprodukter" },
        complianceOk: true,
      },
      {
        slug: "bilens-noedkit",
        name: "Bilens nødkit",
        description: "Kompakt kit til bilen med varmetæppe, lommelygte, forbinding og nødsignal — til uheld og vintervejr.",
        specs: { Indhold: "Varmetæppe, lommelygte, forbinding, nødsignal" },
        weightGrams: 1800,
        costPriceOre: 39900,
        stock: 55,
        compliance: {},
        complianceOk: true,
      },
      {
        slug: "kaeledyrs-noedkit",
        name: "Kæledyrs-nødkit",
        description: "Nødkit til hund eller kat med foder til 3 dage, vandskål, snor og basal førstehjælp.",
        specs: { Varighed: "3 dage", Målgruppe: "Hund/kat" },
        weightGrams: 2200,
        costPriceOre: 29900,
        stock: 45,
        compliance: {},
        complianceOk: true,
      },
    ],
  },
];

async function main() {
  console.log("Seeder leverandør (manual)...");
  const manualSupplier = await prisma.supplier.upsert({
    where: { id: "supplier-manual" },
    update: {},
    create: {
      id: "supplier-manual",
      type: "MANUAL",
      name: "Manuel bestilling",
      status: "ACTIVE",
    },
  });

  console.log("Seeder kategorier og produkter...");
  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
      },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
      },
    });

    for (const product of category.products) {
      const markupType: MarkupType = product.markupType ?? "PERCENT";
      const markupValue = product.markupValue ?? 35;
      const roundingRule: RoundingRule = product.roundingRule ?? "NINETY_FIVE_OERE";

      const sellingPriceOre = computeSellingPriceOre({
        costPriceOre: product.costPriceOre,
        markupType,
        markupValue,
        roundingRule,
      });

      const createdProduct = await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: {
          slug: product.slug,
          name: product.name,
          description: product.description,
          specs: product.specs,
          weightGrams: product.weightGrams,
          status: product.complianceOk === false ? "DRAFT" : "PUBLISHED",
          categoryId: createdCategory.id,
          supplierId: manualSupplier.id,
          supplierSku: product.slug.toUpperCase(),
          costPriceOre: product.costPriceOre,
          markupType,
          markupValue,
          roundingRule,
          sellingPriceOre,
          stock: product.stock,
          requiresAgeCheck: product.requiresAgeCheck ?? false,
          ceMarked: product.compliance?.ceMarked,
          manufacturer: product.compliance?.manufacturer,
          gpsrResponsible: product.compliance?.gpsrResponsible,
          safetyWarnings: product.compliance?.safetyWarnings,
          foodIngredients: product.compliance?.foodIngredients,
          foodAllergens: product.compliance?.foodAllergens,
          foodShelfLife: product.compliance?.foodShelfLife,
          complianceOk: product.complianceOk ?? true,
        },
      });

      const existingImage = await prisma.productImage.findFirst({
        where: { productId: createdProduct.id },
      });
      if (!existingImage) {
        await prisma.productImage.create({
          data: {
            productId: createdProduct.id,
            url: PLACEHOLDER_IMAGE(product.name),
            alt: product.name,
            sortOrder: 0,
          },
        });
      }
    }
  }

  console.log("Seeder fragtpriser...");
  await prisma.shippingRate.deleteMany({});
  await prisma.shippingRate.createMany({
    data: [
      { carrier: "GLS", name: "GLS Pakkeshop", priceOre: 3900, freeShippingOverOre: 79900, sortOrder: 1 },
      { carrier: "POSTNORD", name: "PostNord hjemlevering", priceOre: 4900, freeShippingOverOre: 79900, sortOrder: 2 },
      { carrier: "DAO", name: "DAO Pakkeshop", priceOre: 3500, freeShippingOverOre: 79900, sortOrder: 3 },
    ],
  });

  console.log("Seeder butiksindstillinger...");
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      shopName: "Beredskab",
      cvr: "[UDFYLD]",
      address: "[UDFYLD]",
      contactEmail: "kontakt@[UDFYLD].dk",
      freeShippingOverOre: 79900,
      defaultMarkupType: "PERCENT",
      defaultMarkupValue: 35,
      minimumMarginPercent: 10,
    },
  });

  console.log("Seeder beredskabsberegner-preset...");
  await prisma.calculatorPreset.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      waterLitersPerDay: 3,
      kcalPerDay: 2000,
      heatCategorySlug: "varme",
      lightCategorySlug: "kommunikation-og-lys",
      waterCategorySlug: "vand",
      foodCategorySlug: "toerlager-og-noedmad",
      firstAidCategorySlug: "foerstehjaelp-og-sikkerhed",
      batteriesPerPersonPerWeek: 2,
    },
  });

  console.log("Seed færdig.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
