/**
 * Tohum müfredat — CMS yok. Gövde yalnız SETTLED satın alma sonrası API/sayfada açılır.
 * Müze `[slug]/curriculum` kopyalanmaz. Ders metinleri `lib/academy/curricula/`.
 * Pedagoji / pusula / diyagram fabrikası bu dosyadan import edilmez.
 */

import { CURRICULUM_DRAFTS_BY_SLUG, type AcademyLessonDraft } from "@/lib/academy/curricula";
import { computeAcademyCurriculumSeal } from "@/lib/academy/exam";
import { composeCompactLessonBody, composePedagogicalLessonBody } from "@/lib/academy/lesson-body";
import {
  attachAcademyLessonVisuals,
  type AcademyLessonMediaFields,
  type AcademyLessonVisualCopy,
} from "@/lib/academy/lesson-media";
import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";
import { ACADEMY_GROWTH_LESSON_VISUALS } from "@/lib/academy/growth-visuals";

export type AcademyLessonSeed = {
  key: string;
  order: number;
  title: string;
  body: string;
} & AcademyLessonMediaFields;

/** Vitrin özeti — gövde yok. SETTLED kilidi yalnız body için durur. */
export type AcademyCurriculumOutlineItem = {
  order: number;
  title: string;
};

const LESSON_VISUALS: Record<string, AcademyLessonVisualCopy> = {
  "python-temel-1": {
    diagramKey: "py-print-hello",
    diagramTitle: "İlk program",
    diagramCaption: "print çağrısı çıktıya yazar.",
    videoTitle: "Merhaba dünya",
    videoCaption: "Tırnak ve parantez birlikte durur.",
    durationSec: 6,
  },
  "python-temel-2": {
    diagramKey: "py-vars-types",
    diagramTitle: "Değişken ve tip",
    diagramCaption: "Etiket + tip + değer sözleşmesi.",
    videoTitle: "type() ile kontrol",
    videoCaption: "Metin tutar çarpılmaz.",
    durationSec: 7,
  },
  "python-temel-3": {
    diagramKey: "py-control-flow",
    diagramTitle: "Kontrol akışı",
    diagramCaption: "Koşul doğruysa dal çalışır.",
    videoTitle: "if / else",
    videoCaption: "= atama, == karşılaştırma.",
    durationSec: 5,
  },
  "python-temel-4": {
    diagramKey: "py-loops",
    diagramTitle: "Döngüler",
    diagramCaption: "Tekrarlayan işi bir kez yaz.",
    videoTitle: "for + range",
    videoCaption: "Toplamı biriktir.",
    durationSec: 6,
  },
  "python-temel-5": {
    diagramKey: "py-functions",
    diagramTitle: "Fonksiyonlar",
    diagramCaption: "def alır, return verir.",
    videoTitle: "Yeniden kullanım",
    videoCaption: "Kuruş dönüşümü örnek.",
    durationSec: 7,
  },
  "python-temel-6": {
    diagramKey: "py-interactive",
    diagramTitle: "Etkileşimli betik",
    diagramCaption: "Girdi doğrulanır, sonuç yazılır.",
    videoTitle: "try / except",
    videoCaption: "«üç» yazılınca çökmez.",
    durationSec: 8,
  },
  ...ACADEMY_GROWTH_LESSON_VISUALS,
};

function emptyLessonMedia<T extends { key: string }>(lesson: T): T & AcademyLessonMediaFields {
  return {
    ...lesson,
    diagrams: [],
    microVideos: [],
  };
}

function draftProse(lesson: AcademyLessonDraft): string {
  return [lesson.intro, lesson.development, lesson.conclusion]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join("\n\n");
}

/** Alıştırma çiti — fabrika challenge yok; taslaktaki Vaka veya son paragraf. */
function draftExercise(lesson: AcademyLessonDraft): string {
  const haystack = [lesson.development, lesson.conclusion, lesson.intro].join("\n");
  const vaka = haystack.match(/Vaka:\s*([^\n]+)/u);
  if (vaka?.[1]?.trim()) {
    return vaka[1].trim();
  }
  const paras = draftProse(lesson)
    .split(/\n\n+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return paras.at(-1) || lesson.title;
}

function sealCurriculumLessons(
  _slug: string,
  lessons: readonly AcademyLessonDraft[],
): readonly AcademyLessonSeed[] {
  return lessons.map((lesson) => {
    const visual = LESSON_VISUALS[lesson.key];
    const practice = LESSON_PRACTICE[lesson.key];
    if (lesson.format === "compact") {
      const sealed = {
        key: lesson.key,
        order: lesson.order,
        title: lesson.title,
        body: composeCompactLessonBody(draftProse(lesson), practice ?? null),
      };
      return visual ? attachAcademyLessonVisuals(sealed, visual) : emptyLessonMedia(sealed);
    }
    if (!visual) {
      throw new Error(`Akademi görsel yuvası yok: ${lesson.key}`);
    }
    if (!practice) {
      throw new Error(`Akademi pratik yuvası yok: ${lesson.key}`);
    }
    if (!lesson.intro.trim() || !lesson.development.trim() || !lesson.conclusion.trim()) {
      throw new Error(`Akademi pedagoji perdesi yok: ${lesson.key}`);
    }
    return attachAcademyLessonVisuals(
      {
        key: lesson.key,
        order: lesson.order,
        title: lesson.title,
        body: composePedagogicalLessonBody(
          {
            intro: lesson.intro,
            development: lesson.development,
            conclusion: lesson.conclusion,
            exercise: draftExercise(lesson),
          },
          practice,
        ),
      },
      visual,
    );
  });
}

const LESSONS_BY_SLUG: Record<string, readonly AcademyLessonSeed[]> = Object.fromEntries(
  Object.entries(CURRICULUM_DRAFTS_BY_SLUG).map(([slug, drafts]) => [
    slug,
    sealCurriculumLessons(slug, drafts),
  ]),
);

export function curriculumForCourseSlug(slug: string): readonly AcademyLessonSeed[] {
  return LESSONS_BY_SLUG[slug] ?? [];
}

export function curriculumOutlineForCourseSlug(
  slug: string,
): readonly AcademyCurriculumOutlineItem[] {
  return curriculumForCourseSlug(slug).map((lesson) => ({
    order: lesson.order,
    title: lesson.title,
  }));
}

export function academyLessonByKey(
  slug: string,
  lessonKey: string,
): AcademyLessonSeed | null {
  return curriculumForCourseSlug(slug).find((lesson) => lesson.key === lessonKey) ?? null;
}

export function isAcademyCurriculumComplete(
  slug: string,
  completedKeys: readonly string[],
): boolean {
  const lessons = curriculumForCourseSlug(slug);
  if (lessons.length === 0) {
    return false;
  }
  const done = new Set(completedKeys);
  return lessons.every((lesson) => done.has(lesson.key));
}

export function nextAcademyLessonKey(
  slug: string,
  completedKeys: readonly string[],
): string | null {
  const done = new Set(completedKeys);
  const next = curriculumForCourseSlug(slug).find((lesson) => !done.has(lesson.key));
  return next?.key ?? null;
}

/** Tohum sırası — hash bu diziyi yer. Tamamlama tarihi sırası kullanılmaz. */
export function orderedAcademyLessonKeys(slug: string): readonly string[] {
  return curriculumForCourseSlug(slug).map((lesson) => lesson.key);
}

/**
 * Tamamlanan anahtarları müfredat sırasına indirger.
 * SKU dışı veya atlanan anahtar mühüre girmez.
 */
export function orderedCompletedAcademyLessonKeys(
  slug: string,
  completedKeys: readonly string[],
): string[] {
  const done = new Set(completedKeys);
  return orderedAcademyLessonKeys(slug).filter((key) => done.has(key));
}

export function academyCurriculumSealForSlug(slug: string): string | null {
  const keys = orderedAcademyLessonKeys(slug);
  if (keys.length === 0) {
    return null;
  }
  return computeAcademyCurriculumSeal(keys);
}

/**
 * Müfredat %100 değilse mühür basılmaz. Tamamlanmış küme tohum sırasına indirgenir.
 */
export function academyCurriculumSealFromCompletions(
  slug: string,
  completedKeys: readonly string[],
): string | null {
  if (!isAcademyCurriculumComplete(slug, completedKeys)) {
    return null;
  }
  return academyCurriculumSealForSlug(slug);
}
