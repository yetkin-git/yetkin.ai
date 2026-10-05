import { CHECKOUT_LEGAL_CONSENT_VERSION } from "@/lib/kernel/legal/checkout-consent";

/**
 * Çocuk aydınlatması. 6502 kasa sürümü `2026-09-05` ile aynı dize değildir.
 * Hukuk metni `lib/copy` altında mühürlenene kadar null kalır. Sahte sürüm basılmaz.
 */
export type JuniorGuardianNotice = {
  version: string;
  sha256: string;
};

export const JUNIOR_GUARDIAN_NOTICE: JuniorGuardianNotice | null = null;

/** Kapanan çocuk profilinin sabit takma adı. Doğum yılı bu adla birlikte boşalır. */
export const JUNIOR_CLOSED_PROFILE_NICKNAME = "Kapalı";

export const JUNIOR_PROFILE_CLOSED_ERROR = "Bu çocuk profili kapatıldı.";

export const JUNIOR_CONSENT_REQUIRED_ERROR = "Veli onayı olmadan ders açılmaz.";

export const JUNIOR_NOTICE_UNSEALED_ERROR =
  "Aydınlatma metni mühürlenmeden sürüm veya veli doğum yılı yazılmaz.";

export const JUNIOR_NOTICE_VERSION_ERROR = "Bu aydınlatma sürümü yürürlükte değil.";

export const JUNIOR_GUARDIAN_YEAR_ERROR = "Veli doğum yılı, 18 yaş beyanına uymuyor.";

const NOTICE_VERSION_RE = /^junior-notice-\d{4}-\d{2}-\d{2}$/;
const NOTICE_SHA_RE = /^[0-9a-f]{64}$/;

export function isJuniorNoticeUsable(notice: JuniorGuardianNotice): boolean {
  return (
    notice.version !== CHECKOUT_LEGAL_CONSENT_VERSION &&
    NOTICE_VERSION_RE.test(notice.version) &&
    NOTICE_SHA_RE.test(notice.sha256)
  );
}

/** Beyan. Kimlik doğrulaması değildir. Üst sınır içinde bulunulan yıl eksi 18. */
export function guardianBirthYearBounds(now = new Date()): { min: number; max: number } {
  const year = now.getFullYear();
  return { min: year - 100, max: year - 18 };
}

export function isJuniorProfileClosed(profile: { birthYear: number | null }): boolean {
  return profile.birthYear == null;
}

/**
 * Sürümlü metin yokken kapı `consentAt` ile durur.
 * Metin mühürlüyse aktif rıza sürümü o metinle aynı olmalıdır.
 */
export function juniorLessonConsentBlock(
  profile: {
    consentAt: Date | null;
    birthYear: number | null;
    activeConsentVersion: string | null;
  },
  notice: JuniorGuardianNotice | null,
): string | null {
  if (profile.birthYear == null) {
    return JUNIOR_PROFILE_CLOSED_ERROR;
  }
  if (!profile.consentAt) {
    return JUNIOR_CONSENT_REQUIRED_ERROR;
  }
  if (!notice) {
    return null;
  }
  if (!isJuniorNoticeUsable(notice) || profile.activeConsentVersion !== notice.version) {
    return JUNIOR_CONSENT_REQUIRED_ERROR;
  }
  return null;
}
