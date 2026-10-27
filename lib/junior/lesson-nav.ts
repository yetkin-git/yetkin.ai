/**
 * Önceki / sonraki konu.
 * Sıra, ders rafının hafta aralığıdır. Dosya numarası komşu sayılmaz.
 * Zincir fırınlanmış derslerdir. Açık kapı her zaman girer.
 * 1. tema devamı (`jr_06_mat-2`, `jr_06_mat-3`) kilitli olsa da sonraki konu düğmesine girer.
 * Sesi fırınlanmamış anahtar düğmeye girmez.
 * Bu dosya `server-only` değildir; ders gövdesini taşımaz.
 */

/** MEB 1. tema sırası. Ücretsiz kapı `jr_06_mat-1`; devamı kilitli sayfaya gider. */
const THEME_ONE_CHAIN_KEYS = new Set(["jr_06_mat-1", "jr_06_mat-2", "jr_06_mat-3"]);

import type { JuniorCourseSlug } from "@yetkin/junior-content";
import { juniorCourseSlugFromLessonKey } from "@/lib/junior/human-titles";
import { JUNIOR_LESSON_FACE } from "@/lib/junior/lesson-face";
import { JUNIOR_PILOT_SLUGS } from "@/lib/junior/limits";
import { juniorLessonMediaIsPublicPreview } from "@/lib/junior/media-visibility";
import { juniorLessonHasBakedAudio } from "@/lib/junior/voice";
import { juniorLessonWeekSpan } from "@/lib/junior/week";

export type JuniorNavLesson = { key: string; title: string };

function pilotSlug(slug: string): JuniorCourseSlug | null {
  return (JUNIOR_PILOT_SLUGS as readonly string[]).includes(slug) ? (slug as JuniorCourseSlug) : null;
}

/** Raf düğmesi: mühürlü ses var. Açık kapı veya 1. tema devamı. */
function onNavChain(lessonKey: string): boolean {
  if (!juniorLessonHasBakedAudio(lessonKey)) {
    return false;
  }
  return juniorLessonMediaIsPublicPreview(lessonKey) || THEME_ONE_CHAIN_KEYS.has(lessonKey);
}

function buildNavChains(): Map<string, JuniorNavLesson[]> {
  const grouped = new Map<string, { key: string; title: string; index: number }[]>();
  for (let index = 0; index < JUNIOR_LESSON_FACE.length; index += 1) {
    const row = JUNIOR_LESSON_FACE[index];
    if (!row || !onNavChain(row.key)) {
      continue;
    }
    const slug = juniorCourseSlugFromLessonKey(row.key);
    if (!slug) {
      continue;
    }
    const bucket = grouped.get(slug) ?? [];
    bucket.push({ key: row.key, title: row.title, index });
    grouped.set(slug, bucket);
  }
  const chains = new Map<string, JuniorNavLesson[]>();
  for (const [slug, rows] of grouped) {
    const pilot = pilotSlug(slug);
    const ranked = [...rows].sort((left, right) => {
      const leftSpan = pilot ? juniorLessonWeekSpan(pilot, left.key) : null;
      const rightSpan = pilot ? juniorLessonWeekSpan(pilot, right.key) : null;
      const leftWeek = leftSpan?.startWeek ?? Number.POSITIVE_INFINITY;
      const rightWeek = rightSpan?.startWeek ?? Number.POSITIVE_INFINITY;
      if (leftWeek !== rightWeek) {
        return leftWeek - rightWeek;
      }
      const leftEnd = leftSpan?.endWeek ?? Number.POSITIVE_INFINITY;
      const rightEnd = rightSpan?.endWeek ?? Number.POSITIVE_INFINITY;
      if (leftEnd !== rightEnd) {
        return leftEnd - rightEnd;
      }
      return left.index - right.index;
    });
    chains.set(
      slug,
      ranked.map((row) => ({ key: row.key, title: row.title })),
    );
  }
  return chains;
}

const NAV_CHAINS = buildNavChains();

/** Aynı rafın hafta sırasındaki açık ve fırınlanmış konular. */
export function juniorNavChain(slug: string): readonly JuniorNavLesson[] {
  return NAV_CHAINS.get(slug) ?? [];
}

function juniorSubjectNeighbor(lessonKey: string, offset: -1 | 1): JuniorNavLesson | null {
  const slug = juniorCourseSlugFromLessonKey(lessonKey);
  if (!slug) {
    return null;
  }
  const chain = juniorNavChain(slug);
  const index = chain.findIndex((row) => row.key === lessonKey);
  if (index < 0) {
    return null;
  }
  return chain[index + offset] ?? null;
}

/** Aynı branştaki bir önceki açık konu. Branşın ilk açık dersinde boş kalır. */
export function juniorPrevLesson(lessonKey: string): JuniorNavLesson | null {
  return juniorSubjectNeighbor(lessonKey, -1);
}

/** Aynı branştaki bir sonraki açık konu. Branşın son açık dersinde boş kalır. */
export function juniorNextLesson(lessonKey: string): JuniorNavLesson | null {
  return juniorSubjectNeighbor(lessonKey, 1);
}

/** Ders sayfası düğmeleri. Kilitli konu zincirde değildir; her iki uç boş kalır. */
export function juniorLessonChain(lessonKey: string): {
  prevLesson: JuniorNavLesson | null;
  nextLesson: JuniorNavLesson | null;
} {
  return {
    prevLesson: juniorPrevLesson(lessonKey),
    nextLesson: juniorNextLesson(lessonKey),
  };
}
