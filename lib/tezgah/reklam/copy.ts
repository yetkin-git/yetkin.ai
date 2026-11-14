/**
 * Reklam paketinin kodda kilitli parçaları. Model bunları yazmaz.
 * İlgi alanları sektör sözlüğünden gelir. Amaç çağrısı üç cümleden biridir.
 */

import type { DukkanSectorId } from "@/lib/tezgah/dukkan/copy";

export const REKLAM_FILE_STEM = "reklam-paketi" as const;

export const REKLAM_GOOGLE_TITLE_MAX = 30;
export const REKLAM_GOOGLE_DESCRIPTION_MAX = 90;

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

export const REKLAM_SECTOR_INTERESTS = {
  restoran: ["yerel yemek", "kafe", "mahalle restoranı"],
  kuafor: ["kuaför", "güzellik", "bakım"],
  servis: ["teknik servis", "ev tamiri", "arıza"],
  klinik: ["diş sağlığı", "klinik randevusu", "sağlık"],
  emlak: ["emlak", "konut", "danışmanlık"],
  magaza: ["yerel alışveriş", "mahalle mağazası", "vitrin"],
} as const satisfies Record<DukkanSectorId, readonly string[]>;
