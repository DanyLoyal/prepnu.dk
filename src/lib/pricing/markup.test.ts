import { describe, expect, it } from "vitest";
import { computeMarginPercent, computeSellingPriceOre, formatDkk } from "./markup";

describe("computeSellingPriceOre", () => {
  it("lægger procentavance og moms til, og runder til ,95 øre", () => {
    const priceOre = computeSellingPriceOre({
      costPriceOre: 10000,
      markupType: "PERCENT",
      markupValue: 35,
      roundingRule: "NINETY_FIVE_OERE",
    });

    // 100 kr * 1.35 = 135, * 1.25 moms = 168,75 -> rundes til 168,95
    expect(priceOre).toBe(16895);
  });

  it("afrunder til nærmeste hele krone når roundingRule er NEAREST_WHOLE", () => {
    const priceOre = computeSellingPriceOre({
      costPriceOre: 10000,
      markupType: "PERCENT",
      markupValue: 35,
      roundingRule: "NEAREST_WHOLE",
    });

    expect(priceOre).toBe(16900);
  });

  it("understøtter fast avance i DKK", () => {
    const priceOre = computeSellingPriceOre({
      costPriceOre: 10000,
      markupType: "FIXED",
      markupValue: 50, // 50 kr fast avance
      roundingRule: "NONE",
    });

    // (100 + 50) * 1.25 moms = 187,5 kr
    expect(priceOre).toBe(18750);
  });

  it("lægger fragtomkostning til kostprisen før avance", () => {
    const priceOre = computeSellingPriceOre({
      costPriceOre: 10000,
      shippingCostOre: 2000,
      markupType: "PERCENT",
      markupValue: 0,
      roundingRule: "NONE",
    });

    // (100 + 20) * 1.25 moms = 150 kr
    expect(priceOre).toBe(15000);
  });
});

describe("computeMarginPercent", () => {
  it("beregner avance som procent af udsalgspris ekskl. moms", () => {
    const margin = computeMarginPercent(10000, 16895);
    expect(margin).toBeCloseTo(26.01, 1);
  });
});

describe("formatDkk", () => {
  it("formatterer øre som dansk kroneformat", () => {
    expect(formatDkk(129900)).toBe("1.299,00 kr.");
  });
});
