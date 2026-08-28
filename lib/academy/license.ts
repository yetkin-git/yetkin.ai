/**
 * Akademi seviye lisansı — 365 gün. SETTLED satırının settledAt ânından okunur.
 * Kolon yok; nakit debit anahtarı ilk satışta durur, yenileme ayrı anahtar taşır.
 */

export const ACADEMY_LICENSE_DURATION = "365_DAYS" as const;

export type AcademyLicenseDuration = typeof ACADEMY_LICENSE_DURATION;

export const ACADEMY_LICENSE_DURATION_MS = 365 * 24 * 60 * 60 * 1_000;

export type AcademyLicenseSnapshot = {
  licenseDuration: AcademyLicenseDuration;
  licenseExpiresAt: Date;
  active: boolean;
};

export function academyLicenseExpiresAt(settledAt: Date): Date {
  return new Date(settledAt.getTime() + ACADEMY_LICENSE_DURATION_MS);
}

export function isAcademyLicenseActive(settledAt: Date, now: Date = new Date()): boolean {
  return now.getTime() < academyLicenseExpiresAt(settledAt).getTime();
}

export function academyLicenseSnapshot(
  settledAt: Date,
  now: Date = new Date(),
): AcademyLicenseSnapshot {
  const licenseExpiresAt = academyLicenseExpiresAt(settledAt);
  return {
    licenseDuration: ACADEMY_LICENSE_DURATION,
    licenseExpiresAt,
    active: now.getTime() < licenseExpiresAt.getTime(),
  };
}
