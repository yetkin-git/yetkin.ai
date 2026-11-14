/**
 * YetkinHibe profil türü — bireysel KOBİ, danışman/ajans B2B ve freelancer pazaryeri akışı.
 * Bütçe hesaplayıcısına dokunmaz. Oda kapalıdır (`DRON_KAYIT`); bu modül yalnız tür ve yardımcılardır.
 */

export type GrantProfileMode = "individual" | "agency" | "freelancer";

export type GrantAgencyClientInfo = {
  companyName: string;
  taxNumber: string;
};

export type GrantFreelancerProfileInfo = {
  expertiseAreas: string;
  tubitakKosgebExperience: string;
  iban: string;
  payoutAccountName: string;
};

export const GRANT_PROFILE_MODE_STORAGE_KEY = "yetkin-hibe-profile-mode";

const VALID_MODES: readonly GrantProfileMode[] = ["individual", "agency", "freelancer"];

export function parseGrantProfileModeParam(raw: string | undefined): GrantProfileMode {
  if (raw === "agency") return "agency";
  if (raw === "freelancer") return "freelancer";
  return "individual";
}

export function isAgencyMode(mode: GrantProfileMode): boolean {
  return mode === "agency";
}

export function isFreelancerMode(mode: GrantProfileMode): boolean {
  return mode === "freelancer";
}

export function readStoredGrantProfileMode(): GrantProfileMode | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(GRANT_PROFILE_MODE_STORAGE_KEY);
    if (VALID_MODES.includes(stored as GrantProfileMode)) return stored as GrantProfileMode;
  } catch {
    /* localStorage erişilemez — varsayılan akışa dön */
  }
  return null;
}

export function persistGrantProfileMode(mode: GrantProfileMode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GRANT_PROFILE_MODE_STORAGE_KEY, mode);
  } catch {
    /* sessiz — tercih kalıcı olmayabilir */
  }
}
