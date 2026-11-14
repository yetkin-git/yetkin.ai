import { DEFAULT_CONSULTING_CAP_TRY } from "@/lib/yetkinhibe/calculate-grant-budget";
import type { GrantProfileMode } from "@/lib/yetkinhibe/grant-profile-mode";

/**
 * Sihirbaz kök yolu oda kökünün altındadır (`/yetkinhibe`, `DRON_KAYIT`).
 * `/hibe/*` dondurulmuş `hibe` kimliğine aittir (`circuit-breakers` FROZEN_DISK_ROOM_CATALOG); bu yola bağlanmaz.
 */
const WIZARD_PATH = "/yetkinhibe/olustur";

export function buildGrantWizardHref(params: {
  grantId?: string;
  consultingCap?: number;
  mode?: GrantProfileMode;
  idea?: string;
}): string {
  const search = new URLSearchParams();
  if (params.grantId) search.set("grantId", params.grantId);
  if (params.consultingCap !== undefined) {
    search.set("consultingCap", String(params.consultingCap));
  }
  if (params.mode === "agency") search.set("mode", "agency");
  if (params.mode === "freelancer") search.set("mode", "freelancer");
  if (params.idea?.trim()) search.set("idea", params.idea.trim());
  const qs = search.toString();
  return qs ? `${WIZARD_PATH}?${qs}` : WIZARD_PATH;
}

export function parseIdeaParam(raw: string | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  return trimmed.length > 2_000 ? trimmed.slice(0, 2_000) : trimmed;
}

export function parseConsultingCapParam(raw: string | undefined): number {
  if (!raw) return DEFAULT_CONSULTING_CAP_TRY;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
    return DEFAULT_CONSULTING_CAP_TRY;
  }
  // Kuruş karşılığı (×100) güvenli tam sayı dışındaysa hesaplayıcı reddeder; URL'den varsayılana dön.
  if (!Number.isSafeInteger(parsed * 100)) {
    return DEFAULT_CONSULTING_CAP_TRY;
  }
  return parsed;
}
