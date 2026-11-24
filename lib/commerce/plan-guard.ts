/**
 * Plan kapısını canlı mağaza satırından okur.
 */

import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import {
  assertCommerceFeature,
  assertStoreCapacity,
  highestCommercePlan,
  normalizeCommercePlan,
  planGateFailure,
  type CommercePlanFeature,
} from "@/lib/commerce/plan-gates";
import { commerceFail, type CommerceFailure } from "@/lib/commerce/types";

export async function enforcePlanFeature(
  userId: string,
  storeId: string,
  feature: CommercePlanFeature,
): Promise<CommerceFailure | null> {
  const row = await getPrisma().commerceStore.findFirst({
    where: { id: storeId, ownerUserId: userId },
    select: { planCode: true },
  });
  if (!row) {
    return commerceFail(404, "Mağaza bulunamadı.");
  }
  const gate = assertCommerceFeature(normalizeCommercePlan(row.planCode), feature);
  if (!gate.ok) {
    return planGateFailure(gate);
  }
  return null;
}

export async function guardAdditionalStore(userId: string): Promise<{ ok: true } | CommerceFailure> {
  const stores = await getPrisma().commerceStore.findMany({
    where: { ownerUserId: userId },
    select: { planCode: true },
  });
  const plan = stores.length === 0 ? "GROWTH" : highestCommercePlan(stores.map((row) => row.planCode));
  const gate = assertStoreCapacity(plan, stores.length);
  if (!gate.ok) {
    return planGateFailure(gate);
  }
  return { ok: true };
}
