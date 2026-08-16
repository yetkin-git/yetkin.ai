import { randomUUID } from "node:crypto";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { resolvePlatformTreasuryUserId } from "@/lib/kernel/escrow/engine";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import {
  createCheckoutPriceLock,
  requireOpenCheckoutPriceLock,
} from "@/lib/kernel/pricing/lock-engine";
import type { CheckoutPriceLockStore } from "@/lib/kernel/pricing/lock-store";
import type { CheckoutPriceLockSnapshot } from "@/lib/kernel/pricing/price-lock";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import type {
  AcademyCertificateRecord,
  AcademyCourseRecord,
  AcademyPurchaseRecord,
  AcademyStore,
} from "@/lib/academy/types";

export type AcademyPurchaseWritePorts = {
  ledger: LedgerStore;
  locks: CheckoutPriceLockStore;
  academy: AcademyStore;
};

export type AcademyEnginePorts = {
  ledger: LedgerStore;
  catalog: PriceCatalogStore;
  locks: CheckoutPriceLockStore;
  academy: AcademyStore;
  /**
   * Debit + hazine credit + purchase insert + kilit consume tek atomik birim.
   * Prisma: `$transaction`. Bellek: aynı store (kimlik).
   */
  runPurchaseAtomic?: <T>(work: (tx: AcademyPurchaseWritePorts) => Promise<T>) => Promise<T>;
};

export type LockAcademyCourseCommand = {
  courseId: string;
  userId: string;
  now?: Date;
};

export type PurchaseAcademyCourseCommand = {
  courseId: string;
  userId: string;
  lockId?: string;
  platformUserId?: string;
  now?: Date;
};

export type AcademyPurchaseResult = {
  applied: boolean;
  course: AcademyCourseRecord;
  purchase: AcademyPurchaseRecord;
  certificate: AcademyCertificateRecord | null;
  lock: CheckoutPriceLockSnapshot;
};

function academyDebitKey(userId: string, courseId: string): string {
  return `academy-purchase-debit:${userId}:${courseId}`;
}

function academyCreditKey(userId: string, courseId: string): string {
  return `academy-purchase-credit:${userId}:${courseId}`;
}

async function requirePublishedCourse(
  store: AcademyStore,
  courseId: string,
): Promise<AcademyCourseRecord> {
  const course = await store.getCourse(courseId);
  if (!course) {
    throw new Error("Kurs bulunamadı.");
  }
  if (!course.isPublished) {
    throw new Error("Kurs satışa kapalı.");
  }
  return course;
}

export async function lockAcademyCoursePrice(
  ports: AcademyEnginePorts,
  command: LockAcademyCourseCommand,
): Promise<{ course: AcademyCourseRecord; lock: CheckoutPriceLockSnapshot }> {
  const course = await requirePublishedCourse(ports.academy, command.courseId);
  const lock = await createCheckoutPriceLock(
    { catalog: ports.catalog, locks: ports.locks },
    {
      userId: command.userId,
      moduleKey: ACADEMY_MODULE_KEY,
      unitKey: course.catalogUnitKey,
      now: command.now,
    },
  );
  return { course, lock };
}

async function withAcademyPurchase<T>(
  ports: AcademyEnginePorts,
  work: (tx: AcademyPurchaseWritePorts) => Promise<T>,
): Promise<T> {
  if (ports.runPurchaseAtomic) {
    return ports.runPurchaseAtomic(work);
  }
  return work({ ledger: ports.ledger, locks: ports.locks, academy: ports.academy });
}

export async function purchaseAcademyCourse(
  ports: AcademyEnginePorts,
  command: PurchaseAcademyCourseCommand,
): Promise<AcademyPurchaseResult> {
  const course = await requirePublishedCourse(ports.academy, command.courseId);
  const existing = await ports.academy.getPurchaseByUserAndCourse(command.userId, course.id);
  if (existing) {
    const certificate = await ports.academy.getCertificateByPurchaseId(existing.id);
    const lock = await ports.locks.findById(existing.priceLockId);
    if (lock && !lock.consumedAt) {
      await ports.locks.markConsumed(lock.id, command.now ?? new Date());
    }
    return {
      applied: false,
      course,
      purchase: existing,
      certificate,
      lock: lock ?? {
        id: existing.priceLockId,
        userId: command.userId,
        lockKey: `${ACADEMY_MODULE_KEY}:${course.catalogUnitKey}`,
        moduleKey: ACADEMY_MODULE_KEY,
        unitKey: course.catalogUnitKey,
        amountMinor: existing.amountMinor,
        currencyCode: existing.currencyCode,
        catalogMinor: existing.amountMinor,
        expiresAt: existing.settledAt,
        consumedAt: existing.settledAt,
      },
    };
  }

  const now = command.now ?? new Date();
  const platformUserId = command.platformUserId ?? resolvePlatformTreasuryUserId();
  if (platformUserId === command.userId) {
    throw new Error("Platform hazinesi alıcı ile çakışamaz.");
  }

  return withAcademyPurchase(ports, async (tx) => {
    const raced = await tx.academy.getPurchaseByUserAndCourse(command.userId, course.id);
    if (raced) {
      const certificate = await tx.academy.getCertificateByPurchaseId(raced.id);
      const racedLock = await tx.locks.findById(raced.priceLockId);
      return {
        applied: false,
        course,
        purchase: raced,
        certificate,
        lock: racedLock ?? {
          id: raced.priceLockId,
          userId: command.userId,
          lockKey: `${ACADEMY_MODULE_KEY}:${course.catalogUnitKey}`,
          moduleKey: ACADEMY_MODULE_KEY,
          unitKey: course.catalogUnitKey,
          amountMinor: raced.amountMinor,
          currencyCode: raced.currencyCode,
          catalogMinor: raced.amountMinor,
          expiresAt: raced.settledAt,
          consumedAt: raced.settledAt,
        },
      };
    }

    const openLock = await requireOpenCheckoutPriceLock(
      { locks: tx.locks },
      {
        userId: command.userId,
        moduleKey: ACADEMY_MODULE_KEY,
        unitKey: course.catalogUnitKey,
        lockId: command.lockId,
        now,
      },
    );
    const debitMinor = toPositiveAmountMinor(openLock.amountMinor);

    await appendLedgerEntry(tx.ledger, {
      userId: command.userId,
      currencyCode: openLock.currencyCode,
      amountMinor: debitMinor,
      direction: "DEBIT",
      label: "Akademi kurs satın alma",
      purpose: "academy-purchase",
      idempotencyKey: academyDebitKey(command.userId, course.id),
    });

    await appendLedgerEntry(tx.ledger, {
      userId: platformUserId,
      currencyCode: openLock.currencyCode,
      amountMinor: debitMinor,
      direction: "CREDIT",
      label: "Akademi kurs settlement",
      purpose: "academy-settlement",
      idempotencyKey: academyCreditKey(command.userId, course.id),
    });

    const purchase = await tx.academy.insertPurchase({
      id: randomUUID(),
      userId: command.userId,
      courseId: course.id,
      priceLockId: openLock.id,
      amountMinor: debitMinor,
      currencyCode: openLock.currencyCode,
      status: "SETTLED",
      settledAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await tx.locks.markConsumed(openLock.id, now);

    return { applied: true, course, purchase, certificate: null, lock: openLock };
  });
}
