import { strict as assert } from "node:assert";
import { z } from "zod";
import type { SessionUser } from "@/lib/kernel/auth/ids";
import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import { SUPER_ADMIN_FORBIDDEN, assertSuperAdminUserId } from "@/lib/kernel/auth/super-admin";
import { NotFoundError } from "@/lib/kernel/http/errors";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { assertHoldBps, HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";
import { CATALOG_WRITE_PATH, type SealedCatalogEntry } from "@/lib/kernel/admin/types";

export { CATALOG_WRITE_PATH };

export const CATALOG_PATCH_UNAUTHORIZED = "Oturum gerekli.";
export const CATALOG_PATCH_FORBIDDEN = SUPER_ADMIN_FORBIDDEN;
export const CATALOG_PATCH_INVALID_BODY = "Katalog güncelleme gövdesi geçersiz.";
export const CATALOG_PATCH_NOT_FOUND = "Katalog satırı bulunamadı.";

export type CatalogWriteStore = {
  findById(id: string): Promise<SealedCatalogEntry | null>;
  findByModuleUnit(moduleKey: string, unitKey: string): Promise<SealedCatalogEntry | null>;
  updateAmount(input: {
    id: string;
    amountMinor: number;
    updatedBy: string;
  }): Promise<SealedCatalogEntry>;
};

export type CatalogPatchCommand = {
  actorUserId: string;
  id?: string;
  moduleKey?: string;
  unitKey?: string;
  amountMinor: number;
};

export const catalogPatchBodySchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    moduleKey: z.string().trim().min(1).optional(),
    unitKey: z.string().trim().min(1).optional(),
    amountMinor: z.number(),
  })
  .strict()
  .refine((row) => Boolean(row.id) || Boolean(row.moduleKey && row.unitKey), {
    message: CATALOG_PATCH_INVALID_BODY,
  });

function sealCatalogAmount(unitType: SealedCatalogEntry["unitType"], raw: number): number {
  const amountMinor = toAmountMinor(raw);
  if (unitType === "BPS") {
    const holdBps = assertHoldBps(amountMinor);
    assert.ok(
      holdBps >= HOLD_BPS_MIN && holdBps <= HOLD_BPS_MAX,
      `Hold bps ${HOLD_BPS_MIN}–${HOLD_BPS_MAX} tavanı aşılamaz.`,
    );
    return holdBps;
  }
  return amountMinor;
}

export async function patchCatalogAmount(
  store: CatalogWriteStore,
  command: CatalogPatchCommand,
): Promise<SealedCatalogEntry> {
  assertSuperAdminUserId(command.actorUserId);

  const entry = command.id
    ? await store.findById(command.id)
    : command.moduleKey && command.unitKey
      ? await store.findByModuleUnit(command.moduleKey, command.unitKey)
      : null;

  if (!entry) {
    throw new NotFoundError(CATALOG_PATCH_NOT_FOUND);
  }

  const amountMinor = sealCatalogAmount(entry.unitType, command.amountMinor);
  return store.updateAmount({
    id: entry.id,
    amountMinor,
    updatedBy: command.actorUserId,
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
    assertSuperAdminUserId(input.session.id);
    const parsed = catalogPatchBodySchema.safeParse(input.body);
    if (!parsed.success) {
      return jsonFail(CATALOG_PATCH_INVALID_BODY, 400);
    }
    const entry = await patchCatalogAmount(input.getStore(), {
      actorUserId: input.session.id,
      id: parsed.data.id,
      moduleKey: parsed.data.moduleKey,
      unitKey: parsed.data.unitKey,
      amountMinor: parsed.data.amountMinor,
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
