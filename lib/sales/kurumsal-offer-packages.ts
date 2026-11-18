/** Kurumsal teklif formunun paket anahtarları. Tahsilat bu listeden başlamaz. */

export const KURUMSAL_OFFER_PACKAGES = [
  { value: "team-seat", label: "KOBİ ekip rozeti (5+ koltuk)" },
  { value: "agency", label: "E-ticaret ajans paketi (10 mağaza)" },
  { value: "job-screening-pack", label: "Kurumsal İlan ve Otomatik Aday Eleme Paketi" },
  { value: "iso-auditor", label: "ISO ve Kalite Doküman Denetçisi (ön talep)" },
  { value: "company-brain", label: "Şirket Beyni (ön talep)" },
] as const;

export type KurumsalOfferPackageKey = (typeof KURUMSAL_OFFER_PACKAGES)[number]["value"];

export function isKurumsalOfferPackage(value: string): value is KurumsalOfferPackageKey {
  return KURUMSAL_OFFER_PACKAGES.some((row) => row.value === value);
}
