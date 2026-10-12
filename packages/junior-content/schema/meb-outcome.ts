import { z } from "zod";

/** 2026-2027 6. sınıf çekirdek dersleri. Seçmeliler bu pakette yoktur. */
export const JUNIOR_COURSE_SLUGS = [
  "jr_06_mat",
  "jr_06_fen",
  "jr_06_turkce",
  "jr_06_ing_main",
  "jr_06_sosyal",
] as const;

export const juniorCourseSlugSchema = z.enum(JUNIOR_COURSE_SLUGS);

export type JuniorCourseSlug = z.infer<typeof juniorCourseSlugSchema>;

/**
 * Saat kaynağı.
 * `meb` onaylı rapordaki resmi saat.
 * `unit-split` ünite toplamının çıktılara bölünmüş planlama payı.
 * `plan` çerçeve satırı yeniden ölçülmediği için konan pay.
 * `unverified` fiil cümlesi raporda ayrı düşmeyen kod.
 */
export const hoursBasisSchema = z.enum(["meb", "unit-split", "plan", "unverified"]);

export const mebOutcomeSchema = z.object({
  schoolYear: z.literal("2026-2027"),
  grade: z.literal(6),
  course: juniorCourseSlugSchema,
  themeCode: z.string().min(1),
  themeTitle: z.string().min(1),
  outcomeCode: z.string().min(1),
  outcomeTitle: z.string().min(1),
  hours: z.number().int().nonnegative(),
  hoursBasis: hoursBasisSchema,
  /** Süreç bileşeni veya gövde açık. Saat dolsa da kapsama listesinde kalır. */
  processOpen: z.boolean(),
});

export type MebOutcome = z.infer<typeof mebOutcomeSchema>;

export const mebCourseFileSchema = z.object({
  schoolYear: z.literal("2026-2027"),
  grade: z.literal(6),
  course: juniorCourseSlugSchema,
  weeklyHours: z.number().int().positive(),
  programHours: z.number().int().positive(),
  hoursNote: z.string().min(1),
  outcomes: z.array(mebOutcomeSchema).min(1),
});

export type MebCourseFile = z.infer<typeof mebCourseFileSchema>;
