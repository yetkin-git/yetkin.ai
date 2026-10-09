import {
  JUNIOR_GUARDIAN_NOTICE_VERSION,
  juniorGuardianNoticeCanonical,
} from "@/lib/copy/junior-guardian-notice";
import { CHECKOUT_LEGAL_CONSENT_VERSION } from "@/lib/kernel/legal/checkout-consent";

/**
 * Çocuk aydınlatması. 6502 kasa sürümü `2026-09-05` ile aynı dize değildir.
 * Metin `lib/copy/junior-guardian-notice.ts` içindedir. Özet o kanonik gövdenin SHA-256 değeridir.
 */
export type JuniorGuardianNotice = {
  version: string;
  sha256: string;
};

/** `juniorGuardianNoticeCanonical()` gövdesinin SHA-256 özeti. Metin değişince bu da değişir. */
export const JUNIOR_GUARDIAN_NOTICE_SHA256 =
  "b5c875b2b40e5b0e1204771b3551cc4ba43d4931a8468d294a343f71e32d88c9" as const;

export const JUNIOR_GUARDIAN_NOTICE: JuniorGuardianNotice = {
  version: JUNIOR_GUARDIAN_NOTICE_VERSION,
  sha256: JUNIOR_GUARDIAN_NOTICE_SHA256,
};

export { juniorGuardianNoticeCanonical };

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
