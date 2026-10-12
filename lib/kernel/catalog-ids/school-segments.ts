import { z } from "zod";

/**
 * Okul segment şeması.
 * Junior ortaokuldur. Young lisedir. Yetişkin Akademi kayıt defterine ikisi de yazılmaz.
 * Doğum yılı penceresinin çalışma zamanı evi Junior profilinde `juniorBirthYearBounds` durur.
 */

export const YOUNG_SUBJECT_IDS = [
  "matematik",
  "fizik",
  "kimya",
  "biyoloji",
  "edebiyat",
  "tarih",
  "cografya",
] as const;

export const youngSubjectSchema = z.enum(YOUNG_SUBJECT_IDS);

export type YoungSubjectId = z.infer<typeof youngSubjectSchema>;

export const YOUNG_SUBJECTS: readonly { id: YoungSubjectId; label: string }[] = [
  { id: "matematik", label: "Matematik" },
  { id: "fizik", label: "Fizik" },
  { id: "kimya", label: "Kimya" },
  { id: "biyoloji", label: "Biyoloji" },
  { id: "edebiyat", label: "Edebiyat" },
  { id: "tarih", label: "Tarih" },
  { id: "cografya", label: "Coğrafya" },
];

export const schoolSegmentSchema = z.enum(["JUNIOR", "YOUNG"]);

export type SchoolSegmentId = z.infer<typeof schoolSegmentSchema>;

export const JUNIOR_SCHOOL_SEGMENT = {
  id: "JUNIOR",
  label: "Ortaokul",
  grades: [5, 6, 7, 8],
  gradeMin: 5,
  gradeMax: 8,
  ageMin: 10,
  ageMax: 14,
} as const;

/**
 * Lise yüzü. Üslup genç yetişkin saygısındadır: analitik, doğrudan, süslü övgüsüz.
 * Kapı `DRON_YOUNG_OPEN`. İçerik kartı bu şemada yoktur.
 */
export const YOUNG_REGISTER_LINE =
  "Yaş grubu 15-18. Üslup analitik, genç yetişkin saygısında, akran rehberliğinde net ve doğrudandır. Süslü övgü kurma. Doğru, eksik ve sonraki adım ayrı cümle olsun." as const;

export const YOUNG_UI_FLAGS = {
  openEnv: "DRON_YOUNG_OPEN",
  address: "sen",
  register: "genc-yetiskin",
} as const;

export const YOUNG_SCHOOL_SEGMENT = {
  id: "YOUNG",
  label: "Lise",
  grades: [9, 10, 11, 12],
  gradeMin: 9,
  gradeMax: 12,
  ageMin: 15,
  ageMax: 18,
  tracks: ["grade", "yks"],
  subjects: YOUNG_SUBJECTS,
  register: YOUNG_REGISTER_LINE,
  ui: YOUNG_UI_FLAGS,
} as const;

const youngSegmentSchema = z.object({
  id: z.literal("YOUNG"),
  gradeMin: z.literal(9),
  gradeMax: z.literal(12),
  ageMin: z.literal(15),
  ageMax: z.literal(18),
  tracks: z.tuple([z.literal("grade"), z.literal("yks")]),
  subjects: z.array(z.object({ id: youngSubjectSchema, label: z.string().min(1) })).length(YOUNG_SUBJECT_IDS.length),
});

youngSegmentSchema.parse(YOUNG_SCHOOL_SEGMENT);

export function schoolSegmentForGrade(grade: number): SchoolSegmentId | null {
  if (!Number.isInteger(grade)) {
    return null;
  }
  if (grade >= JUNIOR_SCHOOL_SEGMENT.gradeMin && grade <= JUNIOR_SCHOOL_SEGMENT.gradeMax) {
    return "JUNIOR";
  }
  if (grade >= YOUNG_SCHOOL_SEGMENT.gradeMin && grade <= YOUNG_SCHOOL_SEGMENT.gradeMax) {
    return "YOUNG";
  }
  return null;
}
