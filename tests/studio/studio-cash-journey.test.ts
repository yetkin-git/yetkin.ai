import { describe, expect, it } from "vitest";
import {
  E2E_STUDIO_IMAGE_FLOOR,
  E2E_STUDIO_START_MINOR,
  E2E_STUDIO_TEXT_FLOOR,
  runStudioCashJourney,
  runStudioImageCatalogMissingJourney,
  STUDIO_IMAGE_CATALOG_MISSING,
} from "../helpers/studio-cash-journey";

describe("Studio bellek nakit yolu", () => {
  it("LLM Debit + artifact; 413 tavanında debit yok", async () => {
    const journey = await runStudioCashJourney();
    expect(journey.text.generation.status).toBe("SUCCEEDED");
    expect(journey.text.debitMinor).toBe(E2E_STUDIO_TEXT_FLOOR);
    expect(journey.image.asset.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(journey.image.debitMinor).toBe(E2E_STUDIO_IMAGE_FLOOR);
    expect(journey.ceiling.threw).toBe(true);
    expect(journey.ceiling.debitUnchanged).toBe(true);
    expect(journey.ceiling.assetCount).toBe(1);
    expect(journey.ceiling.balanceMinor).toBe(
      E2E_STUDIO_START_MINOR - E2E_STUDIO_TEXT_FLOOR - E2E_STUDIO_IMAGE_FLOOR,
    );
  });

  it("katalog yokken vatandaş 4xx; debit ve gümrük yok", async () => {
    const missing = await runStudioImageCatalogMissingJourney();
    expect(missing.status).toBeGreaterThanOrEqual(400);
    expect(missing.status).toBeLessThan(500);
    expect(missing.error).toBe(STUDIO_IMAGE_CATALOG_MISSING);
    expect(missing.providerCalls).toBe(0);
    expect(missing.assetCount).toBe(0);
    expect(missing.balanceMinor).toBe(E2E_STUDIO_START_MINOR);
  });
});
