import { expect, test } from "@playwright/test";
import {
  E2E_STUDIO_IMAGE_FLOOR,
  E2E_STUDIO_START_MINOR,
  E2E_STUDIO_TEXT_FLOOR,
  runStudioCashJourney,
  runStudioImageCatalogMissingJourney,
  STUDIO_IMAGE_CATALOG_MISSING,
} from "../helpers/studio-cash-journey";

test.describe("O11 Studio LLM Debit yüzeyi", () => {
  test("şerit LLM Debit mühürler; üretim oturumsuz 401; oda girişe döner", async ({
    page,
    request,
  }) => {
    const home = await page.goto("/");
    expect(home?.status()).toBeLessThan(400);
    await expect(page.getByText("Üretim anında bakiyeden transfer (LLM Debit).")).toBeVisible();
    await expect(page.getByText("jeton bakiyenizden düşülür")).toHaveCount(0);

    const studio = await page.goto("/studio");
    expect(studio?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/(giris|login)\/?/);

    const generate = await request.post("/api/studio/generate", {
      data: { prompt: "Bir slogan üret." },
      headers: { "content-type": "application/json" },
    });
    expect(generate.status()).toBe(401);
    const generateBody = (await generate.json()) as { ok?: boolean; error?: string };
    expect(generateBody.ok).toBe(false);
    expect(generateBody.error).toBe("Oturum gerekli.");

    const image = await request.post("/api/studio/images", {
      data: { prompt: "Mühürlü görsel." },
      headers: { "content-type": "application/json" },
    });
    expect(image.status()).toBe(401);
  });

  test("bellek nakit yolu: LLM Debit + artifact; 413 tavanında debit yok", async () => {
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

  test("katalog yokken vatandaş 4xx; debit ve gümrük yok", async () => {
    const missing = await runStudioImageCatalogMissingJourney();
    expect(missing.status).toBeGreaterThanOrEqual(400);
    expect(missing.status).toBeLessThan(500);
    expect(missing.error).toBe(STUDIO_IMAGE_CATALOG_MISSING);
    expect(missing.providerCalls).toBe(0);
    expect(missing.assetCount).toBe(0);
    expect(missing.balanceMinor).toBe(E2E_STUDIO_START_MINOR);
  });
});
