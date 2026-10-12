import { juniorCalendarBundle } from "@yetkin/junior-content/calendar";
import type { JuniorCourseSlug } from "@yetkin/junior-content";

/**
 * İngilizce tema adları katalogda Türkçe durur.
 * Kaynak kod (`themeCode`) MEB dosyasında kalır; bu harita yalnız vitrin etiketidir.
 */
const THEME_LABEL: Record<string, string> = {
  "ENG.6.1": "Sınıf yaşamı",
  "ENG.6.2": "Aile yaşamı",
  "ENG.6.3": "Doğa ve küresel sorunlar",
  "ENG.6.4": "Mahalle ve şehir",
  "ENG.6.5": "Evren ve gelecek",
  "ENG.6.6": "Dünya ve kültür",
  "ENG.6.7": "Kişisel yaşam",
};

export type JuniorLessonUnit = {
  code: string;
  index: number;
  title: string;
};

export type JuniorShelfJump = {
  id: string;
  chip: string;
  heading: string;
  lessonKey: string;
};

type JumpLesson = {
  key: string;
  unitCode?: string;
  unitIndex?: number;
  unitTitle?: string;
  weekHeading?: string;
  archiveLabel?: string;
};

export function juniorCourseUnits(slug: JuniorCourseSlug): JuniorLessonUnit[] {
  const units: JuniorLessonUnit[] = [];
  const seen = new Set<string>();
  for (const outcome of juniorCalendarBundle(slug).outcomes) {
    if (seen.has(outcome.themeCode)) {
      continue;
    }
    seen.add(outcome.themeCode);
    units.push({
      code: outcome.themeCode,
      index: units.length + 1,
      title: THEME_LABEL[outcome.themeCode] ?? outcome.themeTitle,
    });
  }
  return units;
}

/** Takvim şeridindeki temanın ünite etiketi. Arşiv konusu boş döner. */
export function juniorLessonUnit(slug: JuniorCourseSlug, lessonKey: string): JuniorLessonUnit | null {
  const bundle = juniorCalendarBundle(slug);
  const topic = bundle.topics.find((item) => item.lessonKey === lessonKey);
  if (!topic || topic.band !== "tymm" || topic.outcomeCodes.length === 0) {
    return null;
  }
  const outcome = bundle.outcomes.find((item) => topic.outcomeCodes.includes(item.outcomeCode));
  if (!outcome) {
    return null;
  }
  return juniorCourseUnits(slug).find((unit) => unit.code === outcome.themeCode) ?? null;
}

function weekSpan(lessons: readonly JumpLesson[]): string | null {
  const weeks: number[] = [];
  for (const lesson of lessons) {
    const match = lesson.weekHeading?.match(/^(\d+)(?:–(\d+))?/u);
    if (!match?.[1]) {
      continue;
    }
    weeks.push(Number(match[1]));
    if (match[2]) {
      weeks.push(Number(match[2]));
    }
  }
  if (weeks.length === 0) {
    return null;
  }
  const min = Math.min(...weeks);
  const max = Math.max(...weeks);
  return min === max ? `${min}. hafta` : `${min}–${max}. hafta`;
}

function unitDomId(slug: string, code: string): string {
  return `junior-unit-${slug}-${code.replace(/\./gu, "-")}`;
}

/** Katalog sırasındaki ünite ve arşiv durakları. Kart sırası değişmez. */
export function juniorShelfJumpTargets(slug: string, lessons: readonly JumpLesson[]): JuniorShelfJump[] {
  const targets: JuniorShelfJump[] = [];
  const opened = new Set<string>();
  for (const lesson of lessons) {
    const token = lesson.unitCode ?? (lesson.archiveLabel ? "archive" : "");
    if (!token || opened.has(token)) {
      continue;
    }
    opened.add(token);
    if (token === "archive") {
      targets.push({
        id: `junior-archive-${slug}`,
        chip: "Arşiv",
        heading: lesson.archiveLabel ?? "Müfredat dışı / Arşiv",
        lessonKey: lesson.key,
      });
      continue;
    }
    const group = lessons.filter((item) => item.unitCode === lesson.unitCode);
    const span = weekSpan(group);
    const index = lesson.unitIndex ?? targets.length + 1;
    const chip = `${index}. Ünite: ${lesson.unitTitle ?? "Ünite"}`;
    targets.push({
      id: unitDomId(slug, lesson.unitCode ?? token),
      chip,
      heading: span ? `${chip} · ${span}` : chip,
      lessonKey: lesson.key,
    });
  }
  return targets;
}

/** Hafta çubuğu. Aynı başlık bir kez durur; etiket iki noktadan önceki kısımdır. */
export function juniorWeekJumpTargets(slug: string, lessons: readonly JumpLesson[]): JuniorShelfJump[] {
  const targets: JuniorShelfJump[] = [];
  const seen = new Set<string>();
  for (const lesson of lessons) {
    if (!lesson.weekHeading || seen.has(lesson.weekHeading)) {
      continue;
    }
    seen.add(lesson.weekHeading);
    const chip = lesson.weekHeading.split(":")[0]?.trim() || lesson.weekHeading;
    targets.push({
      id: `junior-week-${slug}-${lesson.key}`,
      chip,
      heading: lesson.weekHeading,
      lessonKey: lesson.key,
    });
  }
  return targets;
}
