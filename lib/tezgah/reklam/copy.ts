/**
 * Reklam paketinin kodda kilitli parçaları. Model bunları yazmaz.
 * İlgi alanları sektör sözlüğünden gelir. Amaç çağrısı üç cümleden biridir.
 * Bütçe dağılımı ve A/B varyant açıları kod mühürüdür; ROAS/CTR/CPC vaadi yoktur.
 */

import type { DukkanSectorId } from "@/lib/tezgah/dukkan/copy";

export const REKLAM_FILE_STEM = "reklam-paketi" as const;
export const REKLAM_GOOGLE_CSV_FILENAME = "google-ads-kampanya.csv" as const;
export const REKLAM_META_CSV_FILENAME = "meta-ads-kampanya.csv" as const;

export const REKLAM_GOOGLE_TITLE_MAX = 30;
export const REKLAM_GOOGLE_DESCRIPTION_MAX = 90;
export const REKLAM_META_HEADLINE_MAX = 40;
export const REKLAM_META_PRIMARY_MAX = 125;

/** Soğuk test / yeniden pazarlama / kazanan ölçekleme — kod sabiti. */
export const REKLAM_BUDGET_COLD_PCT = 60;
export const REKLAM_BUDGET_REMARKETING_PCT = 25;
export const REKLAM_BUDGET_SCALE_PCT = 15;

export const REKLAM_AIMS = [
  { id: "whatsapp", label: "WhatsApp mesajı" },
  { id: "call", label: "Telefon araması" },
  { id: "visit", label: "Mağaza ziyareti" },
] as const;

export type ReklamAim = (typeof REKLAM_AIMS)[number]["id"];

export const REKLAM_AIM_CTA: Record<ReklamAim, string> = {
  whatsapp: "WhatsApp’tan yazın",
  call: "Hemen arayın",
  visit: "Mağazaya uğrayın",
};

export const REKLAM_DISCLAIMER =
  "Bu paket yayınlanmış kampanya değildir; erişim, tıklama ve satış sayısı vaadi yoktur.";

export const REKLAM_VARIANTS = [
  {
    id: "A",
    angle: "Sorun & Çözüm Açısı",
    heading: "Varyant A — Sorun & Çözüm",
  },
  {
    id: "B",
    angle: "Güven & Uzmanlık Açısı",
    heading: "Varyant B — Güven & Uzmanlık",
  },
  {
    id: "C",
    angle: "Net Teklif & Hızlı Aksiyon Açısı",
    heading: "Varyant C — Net Teklif & Hızlı Aksiyon",
  },
] as const;

export type ReklamVariantId = (typeof REKLAM_VARIANTS)[number]["id"];

export const REKLAM_SECTOR_INTERESTS = {
  eticaret: ["e-ticaret", "butik", "online alışveriş"],
  klinik: ["klinik randevusu", "sağlık", "diş sağlığı"],
  restoran: ["yerel yemek", "kafe", "mahalle restoranı"],
  hukuk: ["mali müşavir", "hukuk", "danışmanlık"],
  insaat: ["inşaat", "mimarlık", "proje keşfi"],
  egitim: ["eğitim", "kurs", "akademi"],
  guzellik: ["güzellik", "bakım", "kuaför"],
  oto: ["oto servis", "araç bakımı", "lastik"],
  emlak: ["emlak", "konut", "portföy"],
  servis: ["teknik servis", "ev tamiri", "arıza"],
  lojistik: ["nakliye", "lojistik", "sevkiyat"],
  yazilim: ["yazılım", "ajans", "dijital hizmet"],
} as const satisfies Record<DukkanSectorId, readonly string[]>;

export type ReklamBudgetSplit = {
  coldTestPct: typeof REKLAM_BUDGET_COLD_PCT;
  remarketingPct: typeof REKLAM_BUDGET_REMARKETING_PCT;
  scalePct: typeof REKLAM_BUDGET_SCALE_PCT;
  totalBudgetTl: number | null;
  coldTestTl: number | null;
  remarketingTl: number | null;
  scaleTl: number | null;
};

/** Bütçe varsa tutarları kod hesaplar; yoksa yalnız yüzde. Tutar uydurulmaz. */
export function allocateReklamBudget(totalBudgetTl: number | null): ReklamBudgetSplit {
  const base = {
    coldTestPct: REKLAM_BUDGET_COLD_PCT,
    remarketingPct: REKLAM_BUDGET_REMARKETING_PCT,
    scalePct: REKLAM_BUDGET_SCALE_PCT,
  } as const;
  if (totalBudgetTl == null || !Number.isFinite(totalBudgetTl) || totalBudgetTl < 1) {
    return {
      ...base,
      totalBudgetTl: null,
      coldTestTl: null,
      remarketingTl: null,
      scaleTl: null,
    };
  }
  const total = Math.floor(totalBudgetTl);
  const coldTestTl = Math.floor((total * REKLAM_BUDGET_COLD_PCT) / 100);
  const remarketingTl = Math.floor((total * REKLAM_BUDGET_REMARKETING_PCT) / 100);
  const scaleTl = total - coldTestTl - remarketingTl;
  return {
    ...base,
    totalBudgetTl: total,
    coldTestTl,
    remarketingTl,
    scaleTl,
  };
}
