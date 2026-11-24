import "server-only";

import { createHash } from "node:crypto";
import {
  classifyExistingPaidCommand,
  type PaidCommandRecord,
  type PaidCommandScope,
} from "@/lib/kernel/ai/paid-command";
import { getPrisma } from "@/lib/kernel/db";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import { createPrismaLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { toAmountMinor, toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { classifyPaymentOrderPurpose, PAYMENT_ORDER_PURPOSE } from "@/lib/kernel/payments/order-purpose";
import { TEZGAH_CREDIT_PACK_SIZE } from "@/lib/tezgah/catalog";

export const TEZGAH_PRO_MODULE = "tezgah" as const;
export const TEZGAH_PRO_UNIT = "pro" as const;
export const TEZGAH_CREDIT_UNIT = "credit-pack" as const;
export const TEZGAH_GRANT_UNIT = "grant-dossier" as const;
export const TEZGAH_GENERATE_SCOPE = "tezgah.generate" satisfies PaidCommandScope;
export const TEZGAH_GRANT_SCOPE = "tezgah.grant-dossier" satisfies PaidCommandScope;
export const TEZGAH_PRO_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

export const TEZGAH_PRO_ORDER_PURPOSE = "tezgah-license:pro" as const;
export const TEZGAH_CREDIT_ORDER_PURPOSE = "tezgah-credit:pack" as const;
/** Kart CREDIT'inin ürün tüketimi. Aktivasyonla aynı merchantOid bir kez düşer. */
export const TEZGAH_PRO_DEBIT_PURPOSE = "tezgah-license" as const;

export function tezgahProDebitIdempotencyKey(merchantOid: string): string {
  return `${TEZGAH_PRO_DEBIT_PURPOSE}:${merchantOid}`;
}
export const TEZGAH_GENERATE_DEBIT_PURPOSE = "tezgah-generate" as const;
export const TEZGAH_GRANT_DEBIT_PURPOSE = "tezgah-grant-dossier" as const;

export type TezgahCreditHold = {
  commandKey: string;
  unitMinor: number;
  replay: boolean;
};

type EntitlementReaders = {
  proActive(userId: string, now: Date): Promise<boolean>;
  credits(userId: string): Promise<{ remaining: number; unitMinor: number } | null>;
  catalogAmount(moduleKey: string, unitKey: string): Promise<number | null>;
};

function testRuntime(): boolean {
  return process.env.NODE_ENV === "test" || process.env.VITEST === "true";
}

async function liveCatalogAmount(moduleKey: string, unitKey: string): Promise<number | null> {
  if (testRuntime() || !process.env.DATABASE_URL?.trim()) {
    return null;
  }
  try {
    const entry = await createPrismaPriceCatalogStore().findActiveEntry(moduleKey, unitKey);
    if (!entry || entry.unitType !== "MINOR" || entry.currencyCode !== "TRY" || entry.amountMinor <= 0) {
      return null;
    }
    return entry.amountMinor;
  } catch {
    return null;
  }
}

const liveReaders: EntitlementReaders = {
  async proActive(userId, now) {
    if (testRuntime() || !process.env.DATABASE_URL?.trim()) {
      return false;
    }
    try {
      const row = await getPrisma().tezgahSubscription.findUnique({ where: { userId } });
      return row?.status === "ACTIVE" && row.expiresAt != null && row.expiresAt.getTime() > now.getTime();
    } catch {
      return false;
    }
  },
  async credits(userId) {
    if (testRuntime() || !process.env.DATABASE_URL?.trim()) {
      return null;
    }
    try {
      const row = await getPrisma().tezgahCreditBalance.findUnique({ where: { userId } });
      if (!row || row.remaining <= 0 || row.unitMinor <= 0) {
        return null;
      }
      return { remaining: row.remaining, unitMinor: row.unitMinor };
    } catch {
      return null;
    }
  },
  catalogAmount: liveCatalogAmount,
};

let readers: EntitlementReaders = liveReaders;

export function setTezgahEntitlementReadersForTests(next: Partial<EntitlementReaders> | null): void {
  readers = next ? { ...liveReaders, ...next } : liveReaders;
}

export function resetTezgahEntitlementReadersForTests(): void {
  readers = liveReaders;
}

/** Paket tutarı 10 eşit üretime bölünemezse ücretli kredi kapalıdır. */
export function perCreditMinor(packAmountMinor: number): number | null {
  if (!Number.isInteger(packAmountMinor) || packAmountMinor < TEZGAH_CREDIT_PACK_SIZE) {
    return null;
  }
  if (packAmountMinor % TEZGAH_CREDIT_PACK_SIZE !== 0) {
    return null;
  }
  return packAmountMinor / TEZGAH_CREDIT_PACK_SIZE;
}

export function tezgahRequestHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export async function readTezgahProActive(userId: string, now = new Date()): Promise<boolean> {
  return readers.proActive(userId, now);
}

export async function readTezgahCreditRemaining(
  userId: string,
): Promise<{ remaining: number; unitMinor: number } | null> {
  return readers.credits(userId);
}

export async function readTezgahPackAmount(): Promise<number | null> {
  const amount = await readers.catalogAmount(TEZGAH_PRO_MODULE, TEZGAH_CREDIT_UNIT);
  if (amount == null || perCreditMinor(amount) == null) {
    return null;
  }
  return amount;
}

/**
 * Tek fiyat okuma kapısı. `unitKey` iki biçim kabul eder:
 * - `"pro"`, `"credit-pack"` → `tezgah` modülü.
 * - `"hibe/agency"`, `"hibe/dossier"` → ilk parça modül, kalanı birim.
 *
 * `hibe/dossier` satırı yoksa eski `tezgah/grant-dossier` satırına düşer (geriye dönük uyum).
 * Böylece vitrin, kokpit ve checkout **tek** kaynaktan beslenir (Ş6 / B-09).
 */
export async function readTezgahCatalogAmount(unitKey: string): Promise<number | null> {
  const slash = unitKey.indexOf("/");
  if (slash <= 0) {
    return readers.catalogAmount(TEZGAH_PRO_MODULE, unitKey);
  }
  const moduleKey = unitKey.slice(0, slash);
  const unit = unitKey.slice(slash + 1);
  const live = await readers.catalogAmount(moduleKey, unit);
  if (live != null) {
    return live;
  }
  if (moduleKey === "hibe" && unit === "dossier") {
    return readers.catalogAmount(TEZGAH_PRO_MODULE, TEZGAH_GRANT_UNIT);
  }
  return null;
}

/** Hibe ürün fiyatı — tek kaynak (Ş6). Satır yoksa `null`; tutar uydurulmaz. */
export async function readHibeCatalogAmount(unit: "dossier" | "agency"): Promise<number | null> {
  return readTezgahCatalogAmount(`hibe/${unit}`);
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

function toPaidRecord(row: {
  id: string;
  userId: string;
  scope: string;
  commandKey: string;
  requestHash: string;
  status: string;
  estimatedMinor: number;
  currencyCode: string;
  providerJson: string | null;
  resultId: string | null;
  createdAt: Date;
  updatedAt: Date;
  settledAt: Date | null;
}): PaidCommandRecord {
  return {
    id: row.id,
    userId: row.userId,
    scope: row.scope as PaidCommandScope,
    commandKey: row.commandKey,
    requestHash: row.requestHash,
    status: row.status as PaidCommandRecord["status"],
    estimatedMinor: toAmountMinor(row.estimatedMinor),
    currencyCode: "TRY",
    providerJson: row.providerJson,
    resultId: row.resultId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    settledAt: row.settledAt,
  };
}

export async function beginTezgahCreditHold(input: {
  userId: string;
  commandKey: string;
  requestHash: string;
  unitMinor: number;
  now: Date;
}): Promise<{ ok: true; hold: TezgahCreditHold } | { ok: false; error: string; status: 400 | 429 }> {
  if (testRuntime()) {
    return { ok: false, error: "Ücretli hat test sürecinde kapalı.", status: 429 };
  }
  const prisma = getPrisma();
  const scope = TEZGAH_GENERATE_SCOPE;
  try {
    await prisma.paidCommandReservation.create({
      data: {
        userId: input.userId,
        scope,
        commandKey: input.commandKey,
        requestHash: input.requestHash,
        status: "RESERVED",
        estimatedMinor: input.unitMinor,
        currencyCode: SETTLEMENT_CURRENCY,
        createdAt: input.now,
        updatedAt: input.now,
      },
    });
    return {
      ok: true,
      hold: { commandKey: input.commandKey, unitMinor: input.unitMinor, replay: false },
    };
  } catch (error) {
    if (!isUniqueViolation(error)) {
      return { ok: false, error: "Üretim rezervi yazılamadı.", status: 429 };
    }
  }
  const existing = await prisma.paidCommandReservation.findUnique({
    where: {
      userId_scope_commandKey: {
        userId: input.userId,
        scope,
        commandKey: input.commandKey,
      },
    },
  });
  if (!existing) {
    return { ok: false, error: "Üretim rezervi kilitlenemedi.", status: 429 };
  }
  const classified = classifyExistingPaidCommand(toPaidRecord(existing), input.requestHash);
  if (classified.kind === "conflict") {
    return { ok: false, error: "Bu Idempotency-Key başka bir üretimde.", status: 400 };
  }
  return {
    ok: true,
    hold: {
      commandKey: input.commandKey,
      unitMinor: existing.estimatedMinor,
      replay: classified.kind === "replay",
    },
  };
}

/**
 * Başarısız üretimde kredi hold'unu serbest bırakır.
 * `RESERVED` → `FAILED`. Bakiye henüz düşmediği için sayaç yazılmaz.
 */
export async function releaseTezgahCredit(input: {
  userId: string;
  hold: TezgahCreditHold;
  now?: Date;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.hold.replay) {
    return { ok: true };
  }
  if (testRuntime()) {
    return { ok: true };
  }
  const now = input.now ?? new Date();
  const prisma = getPrisma();
  try {
    await prisma.paidCommandReservation.updateMany({
      where: {
        userId: input.userId,
        scope: TEZGAH_GENERATE_SCOPE,
        commandKey: input.hold.commandKey,
        status: { in: ["RESERVED", "PROVIDER_DONE"] },
      },
      data: { status: "FAILED", updatedAt: now },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Üretim rezervi serbest bırakılamadı." };
  }
}

export async function commitTezgahCredit(input: {
  userId: string;
  hold: TezgahCreditHold;
  now?: Date;
}): Promise<{ ok: true } | { ok: false; error: string; status: 402 }> {
  if (input.hold.replay) {
    return { ok: true };
  }
  const prisma = getPrisma();
  const now = input.now ?? new Date();
  const scope = TEZGAH_GENERATE_SCOPE;
  const where = {
    userId_scope_commandKey: {
      userId: input.userId,
      scope,
      commandKey: input.hold.commandKey,
    },
  };
  const current = await prisma.paidCommandReservation.findUnique({ where });
  if (!current || current.userId !== input.userId) {
    return { ok: false, error: "Üretim rezervi bulunamadı.", status: 402 };
  }
  if (current.status === "SETTLED") {
    return { ok: true };
  }
  if (current.status === "RESERVED") {
    const held = await prisma.$transaction(async (tx) => {
      const fresh = await tx.paidCommandReservation.findUnique({ where });
      if (!fresh || fresh.status !== "RESERVED") {
        return fresh?.status ?? "missing";
      }
      const decremented = await tx.tezgahCreditBalance.updateMany({
        where: { userId: input.userId, remaining: { gt: 0 }, unitMinor: input.hold.unitMinor },
        data: { remaining: { decrement: 1 } },
      });
      if (decremented.count !== 1) {
        return "no-credit";
      }
      await tx.paidCommandReservation.update({
        where,
        data: { status: "PROVIDER_DONE", updatedAt: now },
      });
      return "held";
    });
    if (held === "no-credit") {
      return { ok: false, error: "Üretim kredisi kalmadı.", status: 402 };
    }
  }
  try {
    await appendLedgerEntry(createPrismaLedgerStore(), {
      userId: input.userId,
      currencyCode: "TRY",
      amountMinor: toPositiveAmountMinor(input.hold.unitMinor),
      direction: "DEBIT",
      label: "Tezgâh üretim kredisi",
      purpose: TEZGAH_GENERATE_DEBIT_PURPOSE,
      idempotencyKey: `${TEZGAH_GENERATE_DEBIT_PURPOSE}:${input.userId}:${input.hold.commandKey}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (isInsufficientBalanceError(message)) {
      await prisma.$transaction(async (tx) => {
        await tx.tezgahCreditBalance.updateMany({
          where: { userId: input.userId },
          data: { remaining: { increment: 1 } },
        });
        await tx.paidCommandReservation.updateMany({
          where: {
            userId: input.userId,
            scope,
            commandKey: input.hold.commandKey,
            status: "PROVIDER_DONE",
          },
          data: { status: "RESERVED", updatedAt: now },
        });
      });
      return { ok: false, error: "Cüzdan bakiyesi bu üretim için yetmiyor.", status: 402 };
    }
    throw error;
  }
  await prisma.paidCommandReservation.update({
    where,
    data: { status: "SETTLED", settledAt: now, updatedAt: now },
  });
  return { ok: true };
}

export function tezgahProExpiry(current: Date | null, now: Date): Date {
  const base = current && current.getTime() > now.getTime() ? current : now;
  return new Date(base.getTime() + TEZGAH_PRO_PERIOD_MS);
}

function readOidList(raw: string): string[] {
  if (!raw.trim()) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return [];
  }
}

export async function fulfillTezgahOrder(input: {
  userId: string;
  merchantOid: string;
  purpose: string;
  amountMinor: number;
  currencyCode: string;
  status: string;
  now?: Date;
}): Promise<{ applied: boolean; reason: string }> {
  if (input.status !== "CLEARED" || input.currencyCode !== "TRY") {
    return { applied: false, reason: "not_cleared" };
  }
  const now = input.now ?? new Date();
  if (
    input.purpose === TEZGAH_PRO_ORDER_PURPOSE ||
    classifyPaymentOrderPurpose(input.purpose) === PAYMENT_ORDER_PURPOSE.TEZGAH_PRO
  ) {
    const catalog = await liveCatalogAmount(TEZGAH_PRO_MODULE, TEZGAH_PRO_UNIT);
    if (catalog == null || catalog !== input.amountMinor) {
      return { applied: false, reason: "catalog" };
    }
    const prisma = getPrisma();
    const existing = await prisma.tezgahSubscription.findUnique({ where: { userId: input.userId } });
    const applied = readOidList(existing?.appliedMerchantOids ?? "");
    if (applied.includes(input.merchantOid)) {
      return { applied: false, reason: "already_settled" };
    }
    try {
      await appendLedgerEntry(createPrismaLedgerStore(), {
        userId: input.userId,
        currencyCode: "TRY",
        amountMinor: toPositiveAmountMinor(input.amountMinor),
        direction: "DEBIT",
        label: "Tezgâh Pro",
        purpose: TEZGAH_PRO_DEBIT_PURPOSE,
        idempotencyKey: tezgahProDebitIdempotencyKey(input.merchantOid),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (isInsufficientBalanceError(message)) {
        return { applied: false, reason: "balance" };
      }
      throw error;
    }
    const expiresAt = tezgahProExpiry(existing?.status === "ACTIVE" ? existing.expiresAt : null, now);
    await prisma.tezgahSubscription.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        status: "ACTIVE",
        listPriceMinor: input.amountMinor,
        expiresAt,
        appliedMerchantOids: JSON.stringify([input.merchantOid]),
        createdAt: now,
        updatedAt: now,
      },
      update: {
        status: "ACTIVE",
        listPriceMinor: input.amountMinor,
        expiresAt,
        appliedMerchantOids: JSON.stringify([...applied, input.merchantOid]),
        updatedAt: now,
      },
    });
    return { applied: true, reason: "extended" };
  }
  if (
    input.purpose === PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER ||
    classifyPaymentOrderPurpose(input.purpose) === PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER
  ) {
    const catalog = await readTezgahCatalogAmount("hibe/dossier");
    if (catalog == null || catalog !== input.amountMinor) {
      return { applied: false, reason: "catalog" };
    }
    // Dosya bedeli cüzdana yazılmıştır (`clearSuccessfulPaymentOrder` / claim).
    // Dosya üretimi ayrı komuttur: `generatePaidGrantDossier` DEBIT yazar.
    // Burada ikinci bir defter satırı açılmaz; iade kararı teslimata bağlıdır (Ş3).
    return { applied: true, reason: "clearing_credited" };
  }
  if (
    input.purpose === PAYMENT_ORDER_PURPOSE.HIBE_AGENCY ||
    classifyPaymentOrderPurpose(input.purpose) === PAYMENT_ORDER_PURPOSE.HIBE_AGENCY
  ) {
    const catalog = await readTezgahCatalogAmount("hibe/agency");
    if (catalog == null || catalog !== input.amountMinor) {
      return { applied: false, reason: "catalog" };
    }
    const prisma = getPrisma();
    const existing = await prisma.hibeAgencyPackage.findUnique({ where: { userId: input.userId } });
    const applied = readOidList(existing?.appliedMerchantOids ?? "");
    if (applied.includes(input.merchantOid)) {
      return { applied: false, reason: "already_settled" };
    }
    // Ajans paketi cüzdan bakiyesinden düşmez: `clearing` zaten CREDIT yazdı.
    // Burada yalnız paket hakkı açılır; ikinci CREDIT üretilmez.
    await prisma.hibeAgencyPackage.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        status: "ACTIVE",
        listPriceMinor: input.amountMinor,
        appliedMerchantOids: JSON.stringify([input.merchantOid]),
        activatedAt: now,
        updatedAt: now,
      },
      update: {
        status: "ACTIVE",
        listPriceMinor: input.amountMinor,
        appliedMerchantOids: JSON.stringify([...applied, input.merchantOid]),
        activatedAt: now,
        updatedAt: now,
      },
    });
    return { applied: true, reason: "agency_activated" };
  }
  if (
    input.purpose === TEZGAH_CREDIT_ORDER_PURPOSE ||
    classifyPaymentOrderPurpose(input.purpose) === PAYMENT_ORDER_PURPOSE.TEZGAH_CREDIT
  ) {
    const unit = perCreditMinor(input.amountMinor);
    const catalog = await liveCatalogAmount(TEZGAH_PRO_MODULE, TEZGAH_CREDIT_UNIT);
    if (unit == null || catalog == null || catalog !== input.amountMinor) {
      return { applied: false, reason: unit == null ? "not_divisible" : "catalog" };
    }
    const prisma = getPrisma();
    const existing = await prisma.tezgahCreditBalance.findUnique({ where: { userId: input.userId } });
    const applied = readOidList(existing?.appliedMerchantOids ?? "");
    if (applied.includes(input.merchantOid)) {
      return { applied: false, reason: "already_settled" };
    }
    if (existing && existing.remaining > 0 && existing.unitMinor !== unit) {
      return { applied: false, reason: "unit_mismatch" };
    }
    await prisma.tezgahCreditBalance.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        remaining: TEZGAH_CREDIT_PACK_SIZE,
        unitMinor: unit,
        appliedMerchantOids: JSON.stringify([input.merchantOid]),
        updatedAt: now,
      },
      update: {
        remaining: { increment: TEZGAH_CREDIT_PACK_SIZE },
        unitMinor: unit,
        appliedMerchantOids: JSON.stringify([...applied, input.merchantOid]),
        updatedAt: now,
      },
    });
    return { applied: true, reason: "credited" };
  }
  return { applied: false, reason: "not_tezgah" };
}
