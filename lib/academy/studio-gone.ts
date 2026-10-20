/**
 * Akademi stüdyo artığı — hop dışı BFF. Motor arşivde.
 * Akademi odası kenarda açıktır; bu uçlar kendi 410 mesajını basar.
 * Donmuş oda yakalayıcısı `app/api/_gone` bu listeyi karşılamaz.
 */

export const ACADEMY_STUDIO_GONE = {
  listen: "Dersi dinle kapalı.",
  discussion: "Ders tartışması kapalı.",
  reviews: "Ders değerlendirmesi kapalı.",
  pdf: "Ders notu PDF kapalı.",
  revisions: "Müfredat revizyon kuyruğu kapalı.",
} as const;

export const ACADEMY_STUDIO_CLOSED_ROUTES = [
  {
    path: "/api/academy/generateSpeech",
    file: "app/api/academy/generateSpeech/route.ts",
    message: ACADEMY_STUDIO_GONE.listen,
  },
  {
    path: "/api/academy/discussion",
    file: "app/api/academy/discussion/route.ts",
    message: ACADEMY_STUDIO_GONE.discussion,
  },
  {
    path: "/api/academy/reviews",
    file: "app/api/academy/reviews/route.ts",
    message: ACADEMY_STUDIO_GONE.reviews,
  },
  {
    path: "/api/academy/courses/[id]/listen",
    file: "app/api/academy/courses/[id]/listen/route.ts",
    message: ACADEMY_STUDIO_GONE.listen,
  },
  {
    path: "/api/academy/courses/[id]/pdf",
    file: "app/api/academy/courses/[id]/pdf/route.ts",
    message: ACADEMY_STUDIO_GONE.pdf,
  },
  {
    path: "/api/admin/curriculum-revisions",
    file: "app/api/(kernel)/admin/curriculum-revisions/route.ts",
    message: ACADEMY_STUDIO_GONE.revisions,
  },
] as const;
