/** Tohum ders taslağı — mühür, şema ve pratik `curriculum.ts` içinde bağlanır. */

export type AcademyLessonDraft = {
  key: string;
  order: number;
  title: string;
  intro: string;
  development: string;
  conclusion: string;
  /** five-act varsayılan; compact = Masterclass / tekil SKU (5 perde zorunlu değil). */
  format?: "five-act" | "compact";
};

export function academyLessonDraft(
  key: string,
  order: number,
  title: string,
  intro: string,
  development: string,
  conclusion: string,
): AcademyLessonDraft {
  return { key, order, title, intro, development, conclusion };
}

/** Tekil Masterclass / kompakt SKU — 5 perde zorunlu değildir. */
export function academyCompactLessonDraft(
  key: string,
  order: number,
  title: string,
  body: string,
): AcademyLessonDraft {
  return {
    key,
    order,
    title,
    intro: body,
    development: "",
    conclusion: "",
    format: "compact",
  };
}

/** Arşiv uyumluluğu — canlı taslak pusula/ara soru basmaz; gövde düz taslaktır. */
export function academyLessonDraftWithStudio(
  _slug: string,
  key: string,
  order: number,
  title: string,
  intro: string,
  development: string,
  conclusion: string,
): AcademyLessonDraft {
  return academyLessonDraft(key, order, title, intro, development, conclusion);
}
