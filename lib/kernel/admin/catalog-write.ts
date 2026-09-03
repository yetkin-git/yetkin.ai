import { z } from "zod";
import type { SessionUser } from "@/lib/kernel/auth/ids";
import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import { SUPER_ADMIN_FORBIDDEN, assertSuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { NotFoundError, BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { assertHoldBps } from "@/lib/kernel/pricing/hold-bps";
import {
  assertCatalogWriteAmountWithinBand,
} from "@/lib/kernel/pricing/catalog-band";
import {
  PRICE_DECISION_REASON_CODES,
  type PriceDecisionReasonCode,
} from "@/lib/kernel/pricing/price-decision-codes";
import type { PriceCatalogEntrySnapshot } from "@/lib/kernel/pricing/catalog";
import { CATALOG_WRITE_PATH, type SealedCatalogEntry } from "@/lib/kernel/admin/types";

export { CATALOG_WRITE_PATH };

export const CATALOG_PATCH_UNAUTHORIZED = "Oturum gerekli.";
export const CATALOG_PATCH_FORBIDDEN = SUPER_ADMIN_FORBIDDEN;
export const CATALOG_PATCH_INVALID_BODY = "Katalog güncelleme gövdesi geçersiz.";
export const CATALOG_PATCH_NOT_FOUND = "Katalog satırı bulunamadı.";
export const CATALOG_PATCH_REASON_REQUIRED =
  "Fiyat güncellemesi gerekçe kodu ve açıklama ister. Sessiz zam yok.";

export type CatalogWriteStore = {
  findById(id: string): Promise<SealedCatalogEntry | null>;
  findByModuleUnit(moduleKey: string, unitKey: string): Promise<SealedCatalogEntry | null>;
  updateAmount(input: {
    id: string;
    amountMinor: number;
    updatedBy: string;
    reasonCode: PriceDecisionReasonCode;
    reason: string;
    previousAmountMinor: number;
    moduleKey: string;
    unitKey: string;
    unitType: SealedCatalogEntry["unitType"];
    currencyCode: SealedCatalogEntry["currencyCode"];
  }): Promise<SealedCatalogEntry>;
};

export type CatalogPatchCommand = {
  actorUserId: string;
  actorEmail?: string | null;
  id?: string;
  moduleKey?: string;
  unitKey?: string;
  amountMinor: number;
  reasonCode: PriceDecisionReasonCode;
  reason: string;
};

export const catalogPatchBodySchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    moduleKey: z.string().trim().min(1).optional(),
    unitKey: z.string().trim().min(1).optional(),
    amountMinor: z.number(),
    reasonCode: z.enum(PRICE_DECISION_REASON_CODES),
    reason: z.string().trim().min(8).max(500),
  })
  .strict()
  .refine((row) => Boolean(row.id) || Boolean(row.moduleKey && row.unitKey), {
    message: CATALOG_PATCH_INVALID_BODY,
  });

function toCatalogSnapshot(entry: SealedCatalogEntry): PriceCatalogEntrySnapshot {
  return {
    id: entry.id,
    moduleKey: entry.moduleKey,
    unitKey: entry.unitKey,
    unitType: entry.unitType,
    amountMinor: entry.amountMinor,
    currencyCode: entry.currencyCode,
    isActive: entry.isActive,
    minMinor: entry.minMinor,
    maxMinor: entry.maxMinor,
  };
}

function sealCatalogAmount(entry: SealedCatalogEntry, raw: number): number {
  try {
    const amountMinor = toAmountMinor(raw);
    if (entry.unitType === "BPS") {
      return assertHoldBps(amountMinor);
    }
    return assertCatalogWriteAmountWithinBand(amountMinor, toCatalogSnapshot(entry));
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError(
      error instanceof Error ? error.message : CATALOG_PATCH_INVALID_BODY,
    );
  }
}

export async function patchCatalogAmount(
  store: CatalogWriteStore,
  command: CatalogPatchCommand,
): Promise<SealedCatalogEntry> {
  assertSuperAdminActor({ id: command.actorUserId, email: command.actorEmail });

  const entry = command.id
    ? await store.findById(command.id)
    : command.moduleKey && command.unitKey
      ? await store.findByModuleUnit(command.moduleKey, command.unitKey)
      : null;

  if (!entry) {
    throw new NotFoundError(CATALOG_PATCH_NOT_FOUND);
  }

  const amountMinor = sealCatalogAmount(entry, command.amountMinor);
  return store.updateAmount({
    id: entry.id,
    amountMinor,
    updatedBy: command.actorUserId,
    reasonCode: command.reasonCode,
    reason: command.reason,
    previousAmountMinor: entry.amountMinor,
    moduleKey: entry.moduleKey,
    unitKey: entry.unitKey,
    unitType: entry.unitType,
    currencyCode: entry.currencyCode,
  });
}

export async function runCatalogPatch(input: {
  session: SessionUser | null;
  body: unknown;
  getStore: () => CatalogWriteStore;
}) {
  try {
    if (!input.session) {
      throw new AuthRequiredError(CATALOG_PATCH_UNAUTHORIZED);
    }
    assertSuperAdminActor(input.session);
    const parsed = catalogPatchBodySchema.safeParse(input.body);
    if (!parsed.success) {
      const reasonIssue = parsed.error.issues.some(
        (issue) => issue.path[0] === "reasonCode" || issue.path[0] === "reason",
      );
      return jsonFail(
        reasonIssue ? CATALOG_PATCH_REASON_REQUIRED : CATALOG_PATCH_INVALID_BODY,
        400,
      );
    }
    const entry = await patchCatalogAmount(input.getStore(), {
      actorUserId: input.session.id,
      actorEmail: input.session.email,
      id: parsed.data.id,
      moduleKey: parsed.data.moduleKey,
      unitKey: parsed.data.unitKey,
      amountMinor: parsed.data.amountMinor,
      reasonCode: parsed.data.reasonCode,
      reason: parsed.data.reason,
    });
    return jsonOk({
      entry: {
        id: entry.id,
        moduleKey: entry.moduleKey,
        unitKey: entry.unitKey,
        unitType: entry.unitType,
        amountMinor: entry.amountMinor,
        currencyCode: entry.currencyCode,
        isActive: entry.isActive,
        minMinor: entry.minMinor,
        maxMinor: entry.maxMinor,
        description: entry.description,
        updatedBy: entry.updatedBy,
        updatedAt: entry.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
