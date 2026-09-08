/**
 * Çalışan oda sicili — tek SSOT.
 * Motor sicili dört dikeydir (dashboard, academy, career, freelancer).
 * Kamu vitrin / sol menü üç odadır (Panel, Akademi, Kariyer).
 * Freelancer kamu yüzeyi `FREELANCER_PUBLIC_SURFACE_LOCKED` ile kenar 410;
 * `lib/freelancer` silinmez. Donmuş odalar `archived/` + kenar 410.
 * eslint.config.mjs, scripts/verify-boundaries.ts ve vitest.aliases bu dosyadan türer.
 * 5. çalışan oda ürün kararı olmadan eklenmez.
 */

export const VERTICAL_ROOMS = [
  { id: "dashboard", path: "/dashboard", label: "Panel", blurb: "Genel bakış" },
  { id: "academy", path: "/academy", label: "Akademi", blurb: "Kurs, ödeme onayı, sertifika" },
  { id: "career", path: "/career", label: "Kariyer", blurb: "Doğrulanmış Rozet ve Teklif Kapısı" },
  { id: "freelancer", path: "/freelancer", label: "Freelancer", blurb: "Arka plan · modül pasif" },
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
