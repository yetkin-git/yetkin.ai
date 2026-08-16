import { expect, test } from "@playwright/test";
import {
  E2E_ACADEMY_START_MINOR,
  runAcademyCashJourney,
} from "../helpers/academy-cash-journey";

test.describe("O8 akademi nakit & sınav yolculuğu", () => {
  test("katalog kamu; satın alma oturumsuz 401 (Idempotency-Key oturumdan sonra)", async ({
    page,
    request,
  }) => {
    const response = await page.goto("/academy");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Öne çıkan kurslar" })).toBeVisible();

    const live = page.getByText(/Canlı sicil/);
    const empty = page.getByText("Yayında kurs yok");
    const unbound = page.getByText("Liste henüz yüklenemedi");
    await expect(live.or(empty).or(unbound)).toBeVisible();

    const verify = await page.goto("/academy/dogrula/not-a-hash");
    expect(verify?.status()).toBeLessThan(400);
    await expect(page.getByText(/Hash biçimi SHA256/)).toBeVisible();

    const purchase = await request.post("/api/academy/courses/ac_rail_temel/purchase", {
      headers: { "Idempotency-Key": "550e8400-e29b-41d4-a716-446655440000" },
      data: { lockId: "e2e-lock" },
    });
    expect(purchase.status()).toBe(401);
    const purchaseBody = (await purchase.json()) as { ok?: boolean; error?: string };
    expect(purchaseBody.ok).toBe(false);
    expect(purchaseBody.error).toBe("Oturum gerekli.");

    const lock = await request.post("/api/academy/courses/ac_rail_temel/lock");
    expect(lock.status()).toBe(401);

    const curriculum = await request.post("/api/academy/courses/ac_rail_temel/curriculum", {
      data: { lessonKey: "rail-temel-1" },
    });
    expect(curriculum.status()).toBe(401);

    await page.goto("/academy/rail-temel/oyna");
    expect(page.url()).toContain("/login");
  });

  test("bellek nakit yolu: kilit → settlement → sınav → sertifika; replay debit yok", async () => {
    const journey = await runAcademyCashJourney();
    expect(journey.firstApplied).toBe(true);
    expect(journey.replayApplied).toBe(false);
    expect(journey.buyerBalanceAfter).toBe(E2E_ACADEMY_START_MINOR - journey.seedAmountMinor);
    expect(journey.platformBalanceAfter).toBe(journey.seedAmountMinor);
    expect(journey.certificate?.certificateHash).toMatch(/^[a-f0-9]{64}$/);
    expect(journey.certificate?.curriculumSeal).toMatch(/^[a-f0-9]{64}$/);
  });
});
