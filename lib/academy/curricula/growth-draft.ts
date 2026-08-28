import { academyLessonDraft, type AcademyLessonDraft } from "@/lib/academy/curricula/types";

export type AcademyGrowthLessonSpec = {
  key: string;
  order: number;
  title: string;
  intro: string;
  trap: string;
  analogy: string;
  vaka: string;
  conclusion: string;
};

/**
 * Büyüme SKU dersi — beş perde, vaka, mentor bağlacı.
 * Stüdyo repliği gövdeye girmez; compass / pedagoji mühürde örülür.
 */
export function academyGrowthLesson(spec: AcademyGrowthLessonSpec): AcademyLessonDraft {
  const development = `${spec.trap}

Buraya dikkat... bu adımda acele etmek sessiz hata doğurur; gürültü kopmaz, fiş bozulur.

Bunu günlük hayattan bir örnekle ele alırsak... ${spec.analogy}

Kırılma anı tam olarak bu adımda yaşanıyor. ${spec.vaka}

Vaka: ${spec.vaka}`;
  return academyLessonDraft(
    spec.key,
    spec.order,
    spec.title,
    spec.intro,
    development,
    spec.conclusion,
  );
}

export function academyGrowthLessons(
  specs: readonly AcademyGrowthLessonSpec[],
): AcademyLessonDraft[] {
  return specs.map(academyGrowthLesson);
}
