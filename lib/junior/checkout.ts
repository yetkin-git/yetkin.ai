import "server-only";

import { juniorPaytrLiveSaleOpen } from "@/lib/junior/paytr";
import {
  juniorElectiveSaveSchema,
  normalizeElectiveSelection,
  type JuniorSubscriptionRow,
} from "@/lib/junior/plan";
import type { JuniorStore } from "@/lib/junior/ports";
import type { JuniorProfileView } from "@/lib/junior/types";

type JuniorFail = {
  ok: false;
  status: 400 | 403 | 404 | 413 | 429 | 503;
  error: string;
};

type JuniorOk<T extends Record<string, unknown>> = { ok: true; data: T };

function toProfileView(row: {
  id: string;
  nickname: string;
  grade: number;
  birthYear: number | null;
  selected: boolean;
  selectedElectives: string[];
  gradeSwitchRights: number;
}): JuniorProfileView {
  return {
    id: row.id,
    nickname: row.nickname,
    grade: row.grade,
    birthYear: row.birthYear,
    selected: row.selected,
    selectedElectives: [...row.selectedElectives],
    gradeSwitchRights: row.gradeSwitchRights,
  };
}

export async function saveJuniorElectives(
  store: JuniorStore,
  userId: string,
  input: unknown,
): Promise<JuniorOk<{ profile: JuniorProfileView }> | JuniorFail> {
  const parsed = juniorElectiveSaveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "En fazla üç seçmeli ders seçilir." };
  }
  const normalized = normalizeElectiveSelection(parsed.data.slugs);
  if (!normalized.ok) {
    return { ok: false, status: 400, error: normalized.error };
  }
  const saved = await store.setSelectedElectives(userId, parsed.data.profileId, normalized.slugs);
  if (!saved) {
    return { ok: false, status: 404, error: "Bu profil senin hesabında yok." };
  }
  return { ok: true, data: { profile: toProfileView(saved) } };
}

export const JUNIOR_CHECKOUT_NOT_CONFIGURED = "not_configured";

/**
 * Gerçek PayTR mağaza hattı bağlanana kadar kasa kapalıdır.
 * Deneme kartı, PAN, CVC ve TCKN bu yoldan okunmaz.
 * `merchantId: "000000"` ve sandbox üçlüsü satışı açmaz.
 */
export async function completeJuniorCheckout(
  _store: JuniorStore,
  _userId: string,
  _input: unknown,
  _now = new Date(),
  _context?: { email?: string; userIp?: string },
): Promise<
  | JuniorOk<{
      status: "ACTIVE";
      electiveQuota: number;
      alreadyActive: boolean;
      expiresAt: string;
      merchantOid: string;
      iframeUrl: string;
      embedIframe: boolean;
    }>
  | JuniorFail
> {
  if (!juniorPaytrLiveSaleOpen()) {
    return { ok: false, status: 503, error: JUNIOR_CHECKOUT_NOT_CONFIGURED };
  }
  return { ok: false, status: 503, error: JUNIOR_CHECKOUT_NOT_CONFIGURED };
}

export type { JuniorSubscriptionRow };
