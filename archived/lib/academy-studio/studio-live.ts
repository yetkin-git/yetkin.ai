/**
 * Bölüm bazlı canlı stüdyo — 1 soru hakkı / perde, analog tekrar.
 * Client-safe: GEMINI yok. Hak sicili süreç belleğidir (Prisma halkası kilitli).
 */

import {
  academyInstructorHonorific,
  type AcademyInstructor,
} from "@/lib/academy/instructors";
import { ACADEMY_MODERATOR } from "@/lib/academy/instructors";
import {
  classifyAcademyLessonChunk,
  parseAcademyLessonActText,
  spokenAcademyLessonSegment,
  type AcademyLessonAct,
} from "@/lib/academy/lesson-body";
import {
  academyLessonListenSpeechSlice,
  academyLessonListenTtsInstruction,
  academyModeratorTtsInstruction,
  splitAcademyStudioSpeechTurns,
  splitSpokenTextForTts,
  wrapAcademyLessonTtsPrompt,
  wrapAcademyModeratorTtsPrompt,
  type AcademyLessonListenSpeechSlice,
} from "@/archived/lib/academy-studio/lesson-listen";
import type { AcademyLessonBodyBlock } from "@/lib/academy/lesson-media";

export const ACADEMY_LIVE_ASK_MAX_PER_SECTION = 1;

export const ACADEMY_STUDIO_BEATS = ["repeat", "live-ask", "live-exhausted"] as const;

export type AcademyStudioBeat = (typeof ACADEMY_STUDIO_BEATS)[number];

export type AcademyLiveAskSection = AcademyLessonAct;

export const ACADEMY_MODERATOR_LIVE_ASK_TAIL =
  "yayınımıza canlı katılan bir öğrencimizin bu bölümde bir sorusu var, hemen kendisine kulak verelim...";

export const ACADEMY_MODERATOR_LIVE_ASK_EXHAUSTED_TAIL =
  "bu bölümde canlı yayın soru süremiz doldu. Sonraki bölümde yeni bir sorunuz için mikrofon yeniden açılacak.";

export const ACADEMY_INSTRUCTOR_ANALOGY_LEAD =
  "Durun, aynı noktayı başka bir masadan anlatayım. Şey gibi düşünün: komşu masada aynı iş duruyor. ";

export const ACADEMY_INSTRUCTOR_LIVE_ANSWER_LEAD =
  "Evet, duyuyorum. Soruyu masadaki haliyle açıyorum...";

const liveAskUsed = new Set<string>();

export function isAcademyStudioBeat(value: string): value is AcademyStudioBeat {
  return (ACADEMY_STUDIO_BEATS as readonly string[]).includes(value);
}

export function isAcademyLiveAskSection(value: string): value is AcademyLiveAskSection {
  return value === "giris" || value === "syntax" || value === "mantik" || value === "uygulama";
}

export function academyLiveAskRightKey(
  userId: string,
  courseId: string,
  lessonKey: string,
  section: AcademyLiveAskSection,
): string {
  return `${userId}:${courseId}:${lessonKey}:${section}`;
}

export function hasAcademyLiveAskRight(
  userId: string,
  courseId: string,
  lessonKey: string,
  section: AcademyLiveAskSection,
): boolean {
  return !liveAskUsed.has(academyLiveAskRightKey(userId, courseId, lessonKey, section));
}

/** İlk tüketimde true; aynı bölümde ikinci çağrı false. */
export function consumeAcademyLiveAskRight(
  userId: string,
  courseId: string,
  lessonKey: string,
  section: AcademyLiveAskSection,
): boolean {
  const key = academyLiveAskRightKey(userId, courseId, lessonKey, section);
  if (liveAskUsed.has(key)) {
    return false;
  }
  liveAskUsed.add(key);
  return true;
}

/** Gümrük ihlalinde hakkı iade eder. Silindiyse true. */
export function restoreAcademyLiveAskRight(
  userId: string,
  courseId: string,
  lessonKey: string,
  section: AcademyLiveAskSection,
): boolean {
  return liveAskUsed.delete(academyLiveAskRightKey(userId, courseId, lessonKey, section));
}

export function resetAcademyLiveAskRightsForTests(): void {
  liveAskUsed.clear();
}

export function academyModeratorLiveAskCue(instructor: AcademyInstructor): string {
  return `${academyInstructorHonorific(instructor)}, ${ACADEMY_MODERATOR_LIVE_ASK_TAIL}`;
}

export function academyModeratorLiveAskExhaustedCue(instructor: AcademyInstructor): string {
  return `${academyInstructorHonorific(instructor)}, ${ACADEMY_MODERATOR_LIVE_ASK_EXHAUSTED_TAIL}`;
}

export function academyInstructorLiveAnswerSpoken(question: string): string {
  const trimmed = question.replace(/\s+/gu, " ").trim();
  const body = trimmed
    ? `${trimmed} Aynı kural, başka bir örnek: yazılı olmayan iş komşu masada da yürümez.`
    : "Aynı kural, başka bir örnek: yazılı olmayan iş komşu masada da yürümez.";
  return `${ACADEMY_INSTRUCTOR_LIVE_ANSWER_LEAD} ${body}`.replace(/\s+/gu, " ").trim();
}

export function academyLessonActAtBlockIndex(
  blocks: readonly AcademyLessonBodyBlock[],
  index: number | null,
): AcademyLessonAct {
  let act: AcademyLessonAct = "giris";
  if (blocks.length === 0) {
    return act;
  }
  const end =
    index == null ? blocks.length - 1 : Math.min(Math.max(0, index), blocks.length - 1);
  for (let cursor = 0; cursor <= end; cursor += 1) {
    const block = blocks[cursor];
    if (block?.kind !== "text") {
      continue;
    }
    const parsed = parseAcademyLessonActText(block.text);
    if (parsed.act) {
      act = parsed.act;
    }
  }
  return act;
}

export function academySectionInstructorTail(
  body: string,
  section: AcademyLessonAct,
): string {
  const chunks = body.replace(/\r\n/g, "\n").split(/\n\n+/u);
  let current: AcademyLessonAct | null = null;
  const instructorTurns: string[] = [];
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) {
      continue;
    }
    const parsed = parseAcademyLessonActText(trimmed);
    if (parsed.act) {
      current = parsed.act;
    }
    if (current !== section) {
      continue;
    }
    const spoken = spokenAcademyLessonSegment(classifyAcademyLessonChunk(trimmed));
    if (!spoken) {
      continue;
    }
    for (const turn of splitAcademyStudioSpeechTurns(spoken)) {
      if (turn.speaker === "instructor") {
        instructorTurns.push(turn.text);
      }
    }
  }
  const last = instructorTurns.at(-1)?.trim() ?? "";
  return last;
}

export function academyRepeatInstructorSpoken(body: string, section: AcademyLessonAct): string {
  const tail = academySectionInstructorTail(body, section);
  if (!tail) {
    return ACADEMY_INSTRUCTOR_ANALOGY_LEAD.trim();
  }
  return `${ACADEMY_INSTRUCTOR_ANALOGY_LEAD}${tail}`.replace(/\s+/gu, " ").trim();
}

export function academyStudioBeatSpeechSlices(input: {
  beat: AcademyStudioBeat;
  instructor: AcademyInstructor;
  body: string;
  section: AcademyLiveAskSection;
  question?: string;
  skipModeratorCue?: boolean;
}): AcademyLessonListenSpeechSlice[] {
  const slices: AcademyLessonListenSpeechSlice[] = [];
  function push(
    speaker: "moderator" | "instructor",
    text: string,
    wrap: (slice: string, name: string) => string,
  ) {
    const name = speaker === "moderator" ? ACADEMY_MODERATOR.name : input.instructor.name;
    const voiceName = speaker === "moderator" ? ACADEMY_MODERATOR.voice : input.instructor.voice;
    const instruction =
      speaker === "moderator"
        ? academyModeratorTtsInstruction(name)
        : academyLessonListenTtsInstruction(name);
    for (const chunk of splitSpokenTextForTts(text)) {
      slices.push(
        academyLessonListenSpeechSlice({
          speaker,
          voiceName,
          text: wrap(chunk, name),
          instruction,
        }),
      );
    }
  }
  if (input.beat === "repeat") {
    push("instructor", academyRepeatInstructorSpoken(input.body, input.section), wrapAcademyLessonTtsPrompt);
    return slices;
  }
  if (input.beat === "live-exhausted") {
    push(
      "moderator",
      academyModeratorLiveAskExhaustedCue(input.instructor),
      wrapAcademyModeratorTtsPrompt,
    );
    return slices;
  }
  if (!input.skipModeratorCue) {
    push("moderator", academyModeratorLiveAskCue(input.instructor), wrapAcademyModeratorTtsPrompt);
  }
  const question = input.question?.replace(/\s+/gu, " ").trim() ?? "";
  if (question) {
    push("instructor", academyInstructorLiveAnswerSpoken(question), wrapAcademyLessonTtsPrompt);
  }
  return slices;
}
