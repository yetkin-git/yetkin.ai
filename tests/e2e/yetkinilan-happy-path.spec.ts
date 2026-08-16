import { expect, test } from "@playwright/test";
import {
  E2E_PAZARYERI_PRICE_MINOR,
  E2E_PAZARYERI_START_MINOR,
  runPazaryeriDualCashJourney,
} from "../helpers/pazaryeri-cash-journey";

test.describe("O10 Yetkinİlan çift nakit yolu", () => {
  test("katalog kamu; satın alma oturumsuz 401", async ({ page, request }) => {
    const response = await page.goto("/yetkinilan");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Yetkinİlan" })).toBeVisible();
    await expect(page.getByText("anında bakiyeden transfer (Settlement)")).toBeVisible();
    await expect(page.getByText("Emanet korumasında kilit (Escrow Hold)")).toBeVisible();
    await expect(page.getByRole("link", { name: "Tezgâhı yönet" }).first()).toBeVisible();

    const live = page.getByText(/Canlı sicil/);
    const empty = page.getByText("Vitrin henüz boş");
    const unbound = page.getByText("Liste henüz yüklenemedi");
    await expect(live.or(empty).or(unbound)).toBeVisible();

    const lock = await request.post("/api/pazaryeri/products/e2e-product/lock");
    expect(lock.status()).toBe(401);

    const purchase = await request.post("/api/pazaryeri/products/e2e-product/purchase", {
      data: { lockId: "e2e-lock" },
    });
    expect(purchase.status()).toBe(401);
    const purchaseBody = (await purchase.json()) as { ok?: boolean; error?: string };
    expect(purchaseBody.ok).toBe(false);
    expect(purchaseBody.error).toBe("Oturum gerekli.");

    const confirm = await request.post("/api/pazaryeri/orders/e2e-order/confirm");
    expect(confirm.status()).toBe(401);
  });

  test("bellek nakit yolu: dijital SETTLED + hizmet hold → teslim aktarımı", async () => {
    const journey = await runPazaryeriDualCashJourney();
    expect(journey.digital.order.status).toBe("SETTLED");
    expect(journey.digital.order.escrowHoldId).toBeNull();
    expect(journey.digital.replayApplied).toBe(false);
    expect(journey.service.orderAfterPurchase.status).toBe("AWAITING_DELIVERY");
    expect(journey.service.holdAfterPurchase?.status).toBe("PENDING");
    expect(journey.service.orderAfterConfirm.status).toBe("DELIVERED");
    expect(journey.service.holdAfterConfirm?.status).toBe("RELEASED");
    expect(journey.buyerBalanceAfter).toBe(E2E_PAZARYERI_START_MINOR - 2 * E2E_PAZARYERI_PRICE_MINOR);
    expect(journey.sellerBalanceAfter).toBe(18_000);
    expect(journey.platformBalanceAfter).toBe(2_000);
  });
});
