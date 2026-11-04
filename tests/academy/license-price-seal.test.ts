import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { purchaseAcademyCourse } from "@/lib/academy/engine";
import {
  ACADEMY_LICENSE_PRICE_MISMATCH,
  ACADEMY_LICENSE_PRICE_MISSING,
  sealAcademyLicenseAmount,
} from "@/lib/academy/license-price-seal";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { createMemoryAcademyStore, memoryCourse } from "../helpers/memory-academy";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const ROOT = process.cwd();
const BUYER = "buyer-seal";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const COURSE_PRICE = 89_000;

function world() {
  const course = memoryCourse();
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: 200_000 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const catalog = createMemoryPriceCatalogStore([
    {
      moduleKey: ACADEMY_MODULE_KEY,
      unitKey: course.catalogUnitKey,
      amountMinor: COURSE_PRICE,
    },
  ]);
  const locks = createMemoryCheckoutPriceLockStore();
  const academy = createMemoryAcademyStore();
  return { course, ledger, catalog, locks, academy };
}

describe("lisans fiyat mührü", () => {
  it("aktif katalog kuruşu dışında tutarı kabul etmez", () => {
    expect(sealAcademyLicenseAmount(COURSE_PRICE, COURSE_PRICE)).toEqual({
      ok: true,
      amountMinor: COURSE_PRICE,
    });
    expect(sealAcademyLicenseAmount(1_000, COURSE_PRICE)).toEqual({
      ok: false,
      message: ACADEMY_LICENSE_PRICE_MISMATCH,
    });
    expect(sealAcademyLicenseAmount(COURSE_PRICE, null)).toEqual({
      ok: false,
      message: ACADEMY_LICENSE_PRICE_MISSING,
    });
    expect(sealAcademyLicenseAmount(COURSE_PRICE, 0)).toEqual({
      ok: false,
      message: ACADEMY_LICENSE_PRICE_MISSING,
    });
  });

  it("kilit katalogdan sapınca lisans düşümü ve defter satırı yazılmaz", async () => {
    const ports = world();
    await ports.academy.insertCourse(ports.course);
    const locked = await ports.locks.upsertLock({
      id: "lock-stale",
      userId: BUYER,
      lockKey: `${ACADEMY_MODULE_KEY}:${ports.course.catalogUnitKey}`,
      moduleKey: ACADEMY_MODULE_KEY,
      unitKey: ports.course.catalogUnitKey,
      amountMinor: toAmountMinor(1_000),
      currencyCode: SETTLEMENT_CURRENCY,
      catalogMinor: toAmountMinor(1_000),
      expiresAt: new Date("2026-12-01T00:00:00.000Z"),
      consumedAt: null,
    });

    await expect(
      purchaseAcademyCourse(ports, {
        courseId: ports.course.id,
        userId: BUYER,
        lockId: locked.id,
        platformUserId: PLATFORM,
        now: new Date("2026-08-14T00:01:00.000Z"),
      }),
    ).rejects.toThrow(ACADEMY_LICENSE_PRICE_MISMATCH);

    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(200_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
    expect(await ports.academy.getPurchaseByUserAndCourse(BUYER, ports.course.id)).toBeNull();
    expect((await ports.locks.findById(locked.id))?.consumedAt).toBeNull();
  });

  it("aktif katalog satırı yokken lisans düşülmez", async () => {
    const ports = world();
    await ports.academy.insertCourse(ports.course);
    ports.catalog.seed({
      moduleKey: ACADEMY_MODULE_KEY,
      unitKey: ports.course.catalogUnitKey,
      amountMinor: COURSE_PRICE,
      isActive: false,
    });
    const locked = await ports.locks.upsertLock({
      id: "lock-seed",
      userId: BUYER,
      lockKey: `${ACADEMY_MODULE_KEY}:${ports.course.catalogUnitKey}`,
      moduleKey: ACADEMY_MODULE_KEY,
      unitKey: ports.course.catalogUnitKey,
      amountMinor: toAmountMinor(COURSE_PRICE),
      currencyCode: SETTLEMENT_CURRENCY,
      catalogMinor: toAmountMinor(COURSE_PRICE),
      expiresAt: new Date("2026-12-01T00:00:00.000Z"),
      consumedAt: null,
    });

    await expect(
      purchaseAcademyCourse(ports, {
        courseId: ports.course.id,
        userId: BUYER,
        lockId: locked.id,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(ACADEMY_LICENSE_PRICE_MISSING);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(200_000);
  });

  it("yükleme rotası mühürden önce iframe ve sipariş açmaz", () => {
    const route = readFileSync(join(ROOT, "app/api/(kernel)/wallet/top-up/route.ts"), "utf8");
    const sealAt = route.indexOf("sealAcademyLicenseAmount");
    const createAt = route.indexOf("paymentOrder.create");
    const checkoutAt = route.indexOf("paytrPaymentProvider.beginCheckout");
    expect(route).toContain("readActiveAcademyLicenseAmountMinor");
    expect(sealAt).toBeGreaterThan(0);
    expect(createAt).toBeGreaterThan(sealAt);
    expect(checkoutAt).toBeGreaterThan(sealAt);
    expect(route).toContain("jsonFail(sealed.message, 400");
    const purchase = readFileSync(join(ROOT, "components/academy/purchase-button.tsx"), "utf8");
    expect(purchase).toContain("Lisans kasası katalog kuruşunu yollar.");
    const modal = readFileSync(join(ROOT, "components/kernel/quick-top-up-modal.tsx"), "utf8");
    expect(modal).toContain("lockSuggestedAmount ? requiredMinor : suggested");
    expect(modal).toContain("courseSlug");
  });
});
