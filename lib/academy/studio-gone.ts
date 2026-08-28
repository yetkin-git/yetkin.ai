/**
 * Akademi stüdyo kenarı — listen / discussion / reviews / pdf HTTP 410.
 * Motor `archived/lib/academy-studio/`; canlı oynatıcı bu yüzeyi import etmez.
 */

export const ACADEMY_STUDIO_GONE = {
  listen: "Dersi dinle kapalı.",
  discussion: "Ders tartışması kapalı.",
  reviews: "Ders değerlendirmesi kapalı.",
  pdf: "Ders notu PDF kapalı.",
  revisions: "Müfredat revizyon kuyruğu kapalı.",
} as const;
