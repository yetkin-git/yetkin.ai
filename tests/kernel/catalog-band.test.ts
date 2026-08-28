import { describe, expect, it } from "vitest";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  CATALOG_WRITE_BAND_UNDEFINED,
  assertAmountWithinCatalogBand,
  assertCatalogWriteAmountWithinBand,
} from "@/lib/kernel/pricing/catalog-band";
import type { PriceCatalogEntrySnapshot } from "@/lib/kernel/pricing/catalog";

const MINOR: PriceCatalogEntrySnapshot = {
  id: "cat_minor",
  moduleKey: "studio",
  unitKey: "generation:text",
  unitType: "MINOR",
  amountMinor: toAmountMinor(100),
  currencyCode: "TRY",
  isActive: true,
  minMinor: toAmountMinor(100),
  maxMinor: toAmountMinor(500),
};

describe("katalog taban/tavan bandı", () => {
  it("MINOR band içinde tutarı mühürler", () => {
    expect(assertAmountWithinCatalogBand(200, MINOR)).toBe(200);
    expect(assertCatalogWriteAmountWithinBand(100, MINOR)).toBe(100);
    expect(assertCatalogWriteAmountWithinBand(500, MINOR)).toBe(500);
  });

  it("MINOR taban altı ve tavan üstü throw eder", () => {
    expect(() => assertAmountWithinCatalogBand(99, MINOR)).toThrow(/taban/);
    expect(() => assertAmountWithinCatalogBand(501, MINOR)).toThrow(/tavan/);
  });

  it("yazma yolunda tavan yoksa fail-closed durur", () => {
    const open: PriceCatalogEntrySnapshot = { ...MINOR, maxMinor: null };
    expect(() => assertCatalogWriteAmountWithinBand(150, open)).toThrow(
      CATALOG_WRITE_BAND_UNDEFINED,
    );
  });
});
