import { describe, expect, it } from "vitest";
import { PRICE_LOCK_GRACE_MS } from "@/lib/kernel/pricing/price-lock";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "buyer-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const COURSE_PRICE = 25_000;

function world(buyerBalance = 100_000) {
  const course = memoryCourse();
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: buyerBalance },
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

describe("akademi satın alma (anında settlement)", () => {
  it("fiyat kilidi + debit: alıcı düşer, hazine alır, sertifika basılmaz, emanet yoktur", async () => {
    const ports = world();
    await ports.academy.insertCourse(ports.course);

    const locked = await lockAcademyCoursePrice(ports, {
      courseId: ports.course.id,
      userId: BUYER,
      now: new Date("2026-08-14T00:00:00.000Z"),
    });
    expect(locked.lock.amountMinor).toBe(COURSE_PRICE);
    expect(locked.lock.consumedAt).toBeNull();

    const result = await purchaseAcademyCourse(ports, {
      courseId: ports.course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
      now: new Date("2026-08-14T00:01:00.000Z"),
    });

    expect(result.applied).toBe(true);
    expect(result.purchase.status).toBe("SETTLED");
    expect(result.purchase.amountMinor).toBe(COURSE_PRICE);
    expect(result.certificate).toBeNull();
    expect(await ports.academy.getCertificateByPurchaseId(result.purchase.id)).toBeNull();
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(75_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(COURSE_PRICE);

    const consumed = await ports.locks.findById(locked.lock.id);
    expect(consumed?.consumedAt).not.toBeNull();

    const again = await purchaseAcademyCourse(ports, {
      courseId: ports.course.id,
      userId: BUYER,
      platformUserId: PLATFORM,
    });
    expect(again.applied).toBe(false);
    expect(again.purchase.id).toBe(result.purchase.id);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(75_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(COURSE_PRICE);
  });

  it("süresi dolmuş kilitle debit yok", async () => {
    const ports = world();
    await ports.academy.insertCourse(ports.course);
    const now = new Date("2026-08-14T00:00:00.000Z");
    const locked = await lockAcademyCoursePrice(ports, {
      courseId: ports.course.id,
      userId: BUYER,
      now,
    });
    await expect(
      purchaseAcademyCourse(ports, {
        courseId: ports.course.id,
        userId: BUYER,
        lockId: locked.lock.id,
        platformUserId: PLATFORM,
        now: new Date(now.getTime() + PRICE_LOCK_GRACE_MS),
      }),
    ).rejects.toThrow(/süresi doldu|geçerli fiyat kilidi/);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(100_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
    expect(await ports.academy.getPurchaseByUserAndCourse(BUYER, ports.course.id)).toBeNull();
  });

  it("kilit yokken satın alma açılmaz", async () => {
    const ports = world();
    await ports.academy.insertCourse(ports.course);
    await expect(
      purchaseAcademyCourse(ports, {
        courseId: ports.course.id,
        userId: BUYER,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(/fiyat kilidi/i);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(100_000);
  });

  it("yetersiz bakiyede settlement yazılmaz", async () => {
    const ports = world(1_000);
    await ports.academy.insertCourse(ports.course);
    const locked = await lockAcademyCoursePrice(ports, {
      courseId: ports.course.id,
      userId: BUYER,
    });
    await expect(
      purchaseAcademyCourse(ports, {
        courseId: ports.course.id,
        userId: BUYER,
        lockId: locked.lock.id,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow();
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(1_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
    expect(await ports.academy.getPurchaseByUserAndCourse(BUYER, ports.course.id)).toBeNull();
  });

  it("365 gün dolunca lisans yenilenir; aktif lisansa ikinci debit yok", async () => {
    const ports = world();
    await ports.academy.insertCourse(ports.course);
    const firstLock = await lockAcademyCoursePrice(ports, {
      courseId: ports.course.id,
      userId: BUYER,
      now: new Date("2025-08-01T00:00:00.000Z"),
    });
    const first = await purchaseAcademyCourse(ports, {
      courseId: ports.course.id,
      userId: BUYER,
      lockId: firstLock.lock.id,
      platformUserId: PLATFORM,
      now: new Date("2025-08-01T00:01:00.000Z"),
      level: "Temel",
    });
    expect(first.applied).toBe(true);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(75_000);

    const again = await purchaseAcademyCourse(ports, {
      courseId: ports.course.id,
      userId: BUYER,
      platformUserId: PLATFORM,
      now: new Date("2025-08-02T00:00:00.000Z"),
    });
    expect(again.applied).toBe(false);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(75_000);

    await expect(
      purchaseAcademyCourse(ports, {
        courseId: ports.course.id,
        userId: BUYER,
        platformUserId: PLATFORM,
        now: new Date("2026-08-02T00:00:00.000Z"),
        level: "İleri",
      }),
    ).rejects.toThrow(/başka bir seviyede/);

    const renewLock = await lockAcademyCoursePrice(ports, {
      courseId: ports.course.id,
      userId: BUYER,
      now: new Date("2026-08-02T00:00:00.000Z"),
    });
    const renewed = await purchaseAcademyCourse(ports, {
      courseId: ports.course.id,
      userId: BUYER,
      lockId: renewLock.lock.id,
      platformUserId: PLATFORM,
      now: new Date("2026-08-02T00:01:00.000Z"),
      level: "Temel",
    });
    expect(renewed.applied).toBe(true);
    expect(renewed.purchase.id).toBe(first.purchase.id);
    expect(ports.ledger.snapshot(BUYER).amountMinor).toBe(50_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(50_000);
  });
});
