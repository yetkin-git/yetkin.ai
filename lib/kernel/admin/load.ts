import "server-only";

import { isSuperAdminUser } from "@/lib/kernel/auth/super-admin";
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";
import type {
  AdminCatalogBoard,
  SealedCatalogEntry,
  SealedPriceDecision,
} from "@/lib/kernel/admin/types";

const LEDGER_PREVIEW_LIMIT = 24;

const CATALOG_SELECT = {
  id: true,
  moduleKey: true,
  unitKey: true,
  unitType: true,
  amountMinor: true,
  currencyCode: true,
  isActive: true,
  minMinor: true,
  maxMinor: true,
  description: true,
  updatedBy: true,
  updatedAt: true,
} as const;

/**
 * PriceCatalogEntry tek Prisma okuması — tüm satırlar (aktif + kapalı).
 * Checkout tek-birim portu burayı çağırmaz; Super Admin tahtası çağırır.
 */
async function findPriceCatalogEntries(): Promise<SealedCatalogEntry[]> {
  const prisma = getPrisma();
  const rows = await prisma.priceCatalogEntry.findMany({
    orderBy: [{ moduleKey: "asc" }, { unitKey: "asc" }],
    select: CATALOG_SELECT,
  });
  return rows.map((row) => ({
    id: row.id,
    moduleKey: row.moduleKey,
    unitKey: row.unitKey,
    unitType: row.unitType,
    amountMinor: toAmountMinor(row.amountMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
    isActive: row.isActive,
    minMinor: row.minMinor == null ? null : toAmountMinor(row.minMinor),
    maxMinor: row.maxMinor == null ? null : toAmountMinor(row.maxMinor),
    description: row.description,
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt,
  }));
}

async function findPriceDecisions(): Promise<SealedPriceDecision[]> {
  const prisma = getPrisma();
  const rows = await prisma.priceCatalogDecisionLedger.findMany({
    orderBy: { createdAt: "desc" },
    take: LEDGER_PREVIEW_LIMIT,
  });
  return rows.map((row) => ({
    id: row.id,
    catalogEntryId: row.catalogEntryId,
    moduleKey: row.moduleKey,
    unitKey: row.unitKey,
    unitType: row.unitType,
    reasonCode: row.reasonCode,
    reason: row.reason,
    oldMinor: toAmountMinor(row.oldMinor),
    newMinor: toAmountMinor(row.newMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
    actorUserId: row.actorUserId,
    createdAt: row.createdAt,
  }));
}

/**
 * Super Admin fiyat sicili.
 * userId oturumdan gelmelidir; SUPER_ADMIN_USER_ID eşleşmezse Prisma çağrılmaz.
 * DATABASE_URL yoksa veya Prisma patlarsa unavailable — sahte fiyat yok.
 */
export async function loadAdminCatalogBoard(userId: string): Promise<AdminCatalogBoard> {
  if (!isSupabaseUserId(userId) || !isSuperAdminUser(userId)) {
    return { access: "forbidden" };
  }
  if (!process.env.DATABASE_URL?.trim()) {
    return { access: "unavailable" };
  }

  try {
    const [entries, decisions] = await Promise.all([
      findPriceCatalogEntries(),
      findPriceDecisions(),
    ]);
    return { access: "ok", entries, decisions };
  } catch {
    return { access: "unavailable" };
  }
}
