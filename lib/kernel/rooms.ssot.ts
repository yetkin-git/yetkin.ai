/**
 * Çalışan oda sicili — tek SSOT.
 * Dört oda canlıdır (dashboard kokpit, academy, career, freelancer).
 * Eski ürün-faz numarası sicilde yoktur; ajan kafa karıştırmaz.
 * eslint.config.mjs, scripts/verify-boundaries.ts ve vitest.aliases bu dosyadan türer.
 * 5. çalışan oda ürün kararı olmadan eklenmez.
 */

export const VERTICAL_ROOMS = [
  { id: "dashboard", path: "/dashboard", label: "Anasayfa", blurb: "Genel bakış" },
  { id: "academy", path: "/academy", label: "Akademi", blurb: "Kurs, ödeme onayı, sertifika" },
  { id: "career", path: "/career", label: "Kariyer", blurb: "Mühürden vize ve teklif kapısı" },
  { id: "freelancer", path: "/freelancer", label: "Freelancer", blurb: "İş ilanı, teklif, güvenli ödeme" },
] as const;

export type VerticalRoomId = (typeof VERTICAL_ROOMS)[number]["id"];

/** Donmuş 8 oda — canlı `lib/` tavanı yasak; `archived/` + kenar 410. */
export const FROZEN_DISK_ROOMS = [
  "studio",
  "devlabs",
  "kurumsal",
  "hibe",
  "arena",
  "pazaryeri",
  "junior",
  "social",
] as const;

export type FrozenDiskRoomId = (typeof FROZEN_DISK_ROOMS)[number];
