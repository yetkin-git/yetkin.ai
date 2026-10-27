/**
 * Yazılmış senaryo numaraları. Müfredat dışı arşiv (legacy-2018) bu listede yoktur.
 * Vitrin bu listenin tamamını basmaz; sesi fırınlanmış kesişim `lib/junior/content-source.ts` içindedir.
 */

export type SealedCourseRoster = {
  dir: "mat" | "fen" | "turkce" | "ing" | "sosyal";
  prefix: string;
  quizDir: "mat" | "fen" | "turkce" | "ing" | "sosyal";
  slug: "jr_06_mat" | "jr_06_fen" | "jr_06_turkce" | "jr_06_ing_main" | "jr_06_sosyal";
  meb: "mat" | "fen" | "turkce" | "ing" | "sosyal";
  numbers: readonly number[];
};

export const JUNIOR_SEALED_ROSTER: readonly SealedCourseRoster[] = [
  {
    dir: "mat",
    prefix: "jr_06_mat",
    quizDir: "mat",
    slug: "jr_06_mat",
    meb: "mat",
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
  },
  {
    dir: "fen",
    prefix: "jr_06_fen",
    quizDir: "fen",
    slug: "jr_06_fen",
    meb: "fen",
    numbers: [1, 2, 9, 10, 12, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
  },
  {
    dir: "turkce",
    prefix: "jr_06_turkce",
    quizDir: "turkce",
    slug: "jr_06_turkce",
    meb: "turkce",
    numbers: Array.from({ length: 20 }, (_, index) => index + 1),
  },
  {
    dir: "ing",
    prefix: "jr_06_ing_main",
    quizDir: "ing",
    slug: "jr_06_ing_main",
    meb: "ing",
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 20],
  },
  {
    dir: "sosyal",
    prefix: "jr_06_sosyal",
    quizDir: "sosyal",
    slug: "jr_06_sosyal",
    meb: "sosyal",
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26],
  },
];

export function juniorSealedScenarioCount(): number {
  return JUNIOR_SEALED_ROSTER.reduce((total, course) => total + course.numbers.length, 0);
}
