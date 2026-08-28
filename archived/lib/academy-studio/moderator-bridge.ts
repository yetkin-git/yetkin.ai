/**
 * Bölüm (ders) geçişinde Moderatör Koray Sokratik köprüsü.
 * Müfredat kilidi / nextLessonKey SSOT kalır; bu katman yalnızca pekiştirme UX'idir.
 */

import { ACADEMY_LESSON_COMPASS } from "@/archived/lib/academy-studio/field-voice";
import { ACADEMY_INSTRUCTOR_RECAP_REPLY } from "@/lib/academy/instructors";

/** SEN_VOICE şablonu — önceki bölüm özeti + teyit. */
export const ACADEMY_MODERATOR_BRIDGE_TEMPLATE =
  "Bir önceki bölümde [önceki_konu] başlığını ele alıp temel çıkarım olarak [ana_fikir] noktasına vardık, hocam doğru mu anlamışız?" as const;

export type AcademyModeratorBridgeDecision = "confirm" | "reinforce" | "skip";

export type AcademyModeratorBridgeLesson = {
  key: string;
  title: string;
};

export type AcademyModeratorBridgePayload = {
  fromLessonKey: string;
  toLessonKey: string;
  previousTitle: string;
  mainIdea: string;
  nextTitle: string;
  message: string;
  startListen: boolean;
};

export type AcademyModeratorBridgeLogEntry = {
  id: string;
  speaker: "moderator" | "instructor" | "citizen";
  text: string;
  at: number;
};

/** Pusuladan ana fikir; TTS job cümlesini köprü şablonuna sığdırır. */
export function academyLessonMainIdea(lessonKey: string): string {
  const job = ACADEMY_LESSON_COMPASS[lessonKey]?.job;
  if (!job) {
    return "masadaki işi dürüstçe bitirmeyi";
  }
  return job
    .replace(/^Bu derste /u, "")
    .replace(/\s+konuşuyoruz\.?$/u, "")
    .trim();
}

export function academyModeratorBridgeMessage(previousTitle: string, mainIdea: string): string {
  const topic = previousTitle.trim() || "önceki bölüm";
  const idea = mainIdea.trim() || "masadaki işi dürüstçe bitirmeyi";
  return `Bir önceki bölümde ${topic} başlığını ele alıp temel çıkarım olarak ${idea} noktasına vardık, hocam doğru mu anlamışız?`;
}

/**
 * Sıradaki derse geçişte köprü üretir. Aynı ders / eksik başlık → null (sessiz geç).
 */
export function buildAcademyModeratorBridge(input: {
  fromLesson: AcademyModeratorBridgeLesson;
  toLesson: AcademyModeratorBridgeLesson;
  startListen: boolean;
}): AcademyModeratorBridgePayload | null {
  const fromKey = input.fromLesson.key.trim();
  const toKey = input.toLesson.key.trim();
  if (!fromKey || !toKey || fromKey === toKey) {
    return null;
  }
  const previousTitle = input.fromLesson.title.trim();
  if (!previousTitle) {
    return null;
  }
  const mainIdea = academyLessonMainIdea(fromKey);
  return {
    fromLessonKey: fromKey,
    toLessonKey: toKey,
    previousTitle,
    mainIdea,
    nextTitle: input.toLesson.title.trim() || toKey,
    message: academyModeratorBridgeMessage(previousTitle, mainIdea),
    startListen: input.startListen,
  };
}

export function academyModeratorBridgeInstructorReply(): string {
  return ACADEMY_INSTRUCTOR_RECAP_REPLY;
}

export function appendAcademyModeratorBridgeLog(
  log: readonly AcademyModeratorBridgeLogEntry[],
  entry: Omit<AcademyModeratorBridgeLogEntry, "id" | "at"> & { id?: string; at?: number },
): AcademyModeratorBridgeLogEntry[] {
  const at = entry.at ?? Date.now();
  const id = entry.id ?? `bridge-${at}-${log.length}`;
  return [...log, { id, speaker: entry.speaker, text: entry.text, at }];
}
