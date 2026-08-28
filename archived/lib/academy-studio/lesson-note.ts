/**
 * Duru ders notu — görsel etiket / şema / mikro-video yok.
 * Giriş / Kod Örneği / Çalışma Mantığı / Uygulama düzyazısı + pratik görev. Client-safe.
 */

import { academyInteractiveTaskByKey, type AcademyProofKind } from "@/lib/academy/proof-of-work";
import {
  ACADEMY_LESSON_ACT_HEADINGS,
  classifyAcademyLessonChunk,
  parseAcademyLessonActText,
  splitAcademyLessonChunks,
  type AcademyLessonAct,
  type AcademyLessonParamRow,
} from "@/lib/academy/lesson-body";
import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";
import { academyInstructorBySlug } from "@/lib/academy/instructors";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import { academyLessonByKey, curriculumForCourseSlug } from "@/lib/academy/curriculum";

export type AcademyLessonNoteSection = {
  act: AcademyLessonAct;
  heading: string;
  prose: string;
};

export type AcademyLessonNotePractice = {
  kind: AcademyProofKind;
  brief: string;
  params: readonly AcademyLessonParamRow[];
  example: string;
};

export type AcademyLessonNote = {
  courseTitle: string;
  courseSlug: string;
  lessonKey: string;
  lessonTitle: string;
  instructorName: string;
  level: string | null;
  sections: readonly AcademyLessonNoteSection[];
  practice: AcademyLessonNotePractice;
  curriculumSeal: string | null;
  proofOfWorkHash: string;
};

function collapseProse(text: string): string {
  return text.replace(/\s+/gu, " ").trim();
}

function practiceExample(kind: AcademyProofKind, practice: (typeof LESSON_PRACTICE)[string]): string {
  if (kind === "amount-kurus") {
    const amount = practice.params.find((row) => /tutar|kuruş/iu.test(row.label))?.value ?? "kuruş tamsayı";
    return `Kuruş kaydı: ${amount} · TRY. Float lira yok.`;
  }
  if (kind === "prompt-pack") {
    return `YZ Türkçe tarif örneği: ${practice.steps[0] ?? practice.code.source.slice(0, 180)}`;
  }
  return practice.params.map((row) => `${row.label}: ${row.value}`).join(" · ");
}

export function plainAcademyLessonSections(body: string): AcademyLessonNoteSection[] {
  const buckets: Record<AcademyLessonAct, string[]> = {
    giris: [],
    syntax: [],
    mantik: [],
    uygulama: [],
  };
  let current: AcademyLessonAct = "giris";
  for (const chunk of splitAcademyLessonChunks(body)) {
    const segment = classifyAcademyLessonChunk(chunk);
    if (segment.kind !== "text") {
      continue;
    }
    const parsed = parseAcademyLessonActText(segment.text);
    if (parsed.act) {
      current = parsed.act;
    }
    const prose = collapseProse(parsed.act ? parsed.body : segment.text);
    if (prose) {
      buckets[current].push(prose);
    }
  }
  return (Object.keys(ACADEMY_LESSON_ACT_HEADINGS) as AcademyLessonAct[])
    .map((act) => ({
      act,
      heading: ACADEMY_LESSON_ACT_HEADINGS[act],
      prose: buckets[act].join("\n\n"),
    }))
    .filter((section) => section.prose.length > 0);
}

export function buildAcademyLessonNotePractice(lessonKey: string): AcademyLessonNotePractice | null {
  const practice = LESSON_PRACTICE[lessonKey];
  const task = academyInteractiveTaskByKey(lessonKey);
  if (!practice || !task) {
    return null;
  }
  return {
    kind: task.kind,
    brief: task.brief,
    params: practice.params,
    example: practiceExample(task.kind, practice),
  };
}

export function buildAcademyLessonNote(input: {
  courseSlug: string;
  courseTitle: string;
  lessonKey: string;
  proofOfWorkHash: string;
  curriculumSeal: string | null;
}): AcademyLessonNote | null {
  const lesson = academyLessonByKey(input.courseSlug, input.lessonKey);
  const practice = buildAcademyLessonNotePractice(input.lessonKey);
  if (!lesson || !practice) {
    return null;
  }
  const instructor = academyInstructorBySlug(input.courseSlug);
  return {
    courseTitle: input.courseTitle,
    courseSlug: input.courseSlug,
    lessonKey: lesson.key,
    lessonTitle: lesson.title,
    instructorName: instructor.name,
    level: academyCourseLevelBySlug(input.courseSlug),
    sections: plainAcademyLessonSections(lesson.body),
    practice,
    curriculumSeal: input.curriculumSeal,
    proofOfWorkHash: input.proofOfWorkHash,
  };
}

export function academyLessonKeysForCourse(slug: string): readonly string[] {
  return curriculumForCourseSlug(slug).map((lesson) => lesson.key);
}
