import type { GrantProfileMode } from "@/lib/yetkinhibe/grant-profile-mode";

/** Eski bütçe hesaplayıcısının varsayılan danışmanlık tavanı — tam lira. Faz 2'ye kadar yalnız URL okur. */
export const DEFAULT_CONSULTING_CAP_TRY = 100_000;

/** Korunan kokpitteki proje sekmesi. */
const WIZARD_PATH = "/panel/hibe";

export function buildGrantWizardHref(params: {
  grantId?: string;
  consultingCap?: number;
  mode?: GrantProfileMode;
  idea?: string;
}): string {
  const search = new URLSearchParams();
  search.set("sekme", "proje");
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
