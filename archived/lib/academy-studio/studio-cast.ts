/**
 * Stüdyo pusulası + Koray ara soru montajı.
 * Canlı oynatıcı / müfredat taslağı bu dosyayı import etmez (Faz 3 arşiv grafı).
 */

import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";
import {
  ACADEMY_COMPASS_ANCHOR,
  academyAudienceCompassForLesson,
  academyFieldAskNeedles,
  academyFieldAsksForSlug,
  academyPreviousLessonKey,
  ACADEMY_LESSON_COMPASS,
  ACADEMY_MODERATOR_RECAP_SPARK,
} from "@/archived/lib/academy-studio/field-voice";
import {
  ACADEMY_INSTRUCTOR_ASK_REPLY,
  ACADEMY_INSTRUCTOR_HANDBACK_LEAD,
  ACADEMY_INSTRUCTOR_PARAMS_REPLY,
  ACADEMY_INSTRUCTOR_RECAP_REPLY,
  ACADEMY_INSTRUCTOR_VAKA_REPLY,
  ACADEMY_INSTRUCTORS_BY_VOICE,
  ACADEMY_INSTRUCTOR_VOICE_BY_SLUG,
  ACADEMY_MODERATOR_CLOSE_TAIL,
  ACADEMY_MODERATOR_OPEN_LEAD,
  ACADEMY_MODERATOR_OPEN_TAIL,
  academyFirstLessonIntroForSlug,
  academyInstructorBySlug,
  academyInstructorDativeHonorific,
  academyInstructorHonorific,
  academyLessonMiddleOpenForSlug,
} from "@/lib/academy/instructors";
import {
  ACADEMY_MODERATOR_SUMMARY_LEAD,
  ACADEMY_MODERATOR_SUMMARY_RECAP,
  academyModeratorSummaryConfirm,
} from "@/archived/lib/academy-studio/mentor-voice";

const ACADEMY_INSTRUCTOR_STUDIO_LEADS = [
  ACADEMY_INSTRUCTOR_HANDBACK_LEAD,
  ACADEMY_INSTRUCTOR_RECAP_REPLY,
  ACADEMY_INSTRUCTOR_ASK_REPLY,
  ACADEMY_INSTRUCTOR_VAKA_REPLY,
  ACADEMY_INSTRUCTOR_PARAMS_REPLY,
] as const;

export function academyModeratorRecapForLesson(slug: string, lessonKey: string): string | null {
  const previousKey = academyPreviousLessonKey(lessonKey);
  if (!previousKey) {
    return null;
  }
  const previous = ACADEMY_LESSON_COMPASS[previousKey];
  if (!previous) {
    return null;
  }
  const honorific = academyInstructorHonorific(academyInstructorBySlug(slug));
  const job = previous.job.replace(/^Bu derste /u, "");
  const spark = ACADEMY_MODERATOR_RECAP_SPARK[lessonKey]?.trim();
  const sparkText = spark ? ` ${spark}` : "";
  return `${ACADEMY_MODERATOR_SUMMARY_LEAD} ${ACADEMY_MODERATOR_SUMMARY_RECAP}: ${job}${sparkText} ${academyModeratorSummaryConfirm(honorific)}`;
}

export function academyModeratorRecapExchangeForLesson(
  slug: string,
  lessonKey: string,
): string | null {
  const recap = academyModeratorRecapForLesson(slug, lessonKey);
  if (!recap) {
    return null;
  }
  return `${recap}\n${ACADEMY_INSTRUCTOR_RECAP_REPLY}`;
}

export function academyModeratorAskForSlug(slug: string): string {
  return `${academyInstructorHonorific(academyInstructorBySlug(slug))}, ${academyFieldAsksForSlug(slug).gelisme}`;
}

export function academyModeratorAskExchangeForSlug(slug: string): string {
  return `${academyModeratorAskForSlug(slug)}\n${ACADEMY_INSTRUCTOR_ASK_REPLY}`;
}

export function academyModeratorVakaAskForSlug(slug: string): string {
  return academyFieldAsksForSlug(slug).vaka;
}

export function academyModeratorParamsAskForSlug(slug: string): string {
  return academyFieldAsksForSlug(slug).params;
}

export function academyModeratorVakaAskExchange(slug: string): string {
  return `${academyModeratorVakaAskForSlug(slug)}\n${ACADEMY_INSTRUCTOR_VAKA_REPLY}`;
}

export function academyModeratorParamsAskExchange(slug: string): string {
  return `${academyModeratorParamsAskForSlug(slug)}\n${ACADEMY_INSTRUCTOR_PARAMS_REPLY}`;
}

/** Gelişme perdesine Koray ara sorusu + vaka geçişi. İkinci çağrı no-op. */
export function academyDevelopmentWithModeratorAsks(slug: string, development: string): string {
  const trimmed = development.trim();
  if (!trimmed) {
    throw new Error("Gelişme perdesi yok.");
  }
  const ask = academyModeratorAskExchangeForSlug(slug);
  if (trimmed.includes(academyModeratorAskForSlug(slug))) {
    return trimmed;
  }
  const vakaAsk = academyModeratorVakaAskForSlug(slug);
  const vakaAt = trimmed.search(/\n\nVaka:/u);
  if (vakaAt === -1) {
    return `${ask}\n\n${trimmed}`;
  }
  const before = trimmed.slice(0, vakaAt).trim();
  const after = trimmed.slice(vakaAt).trim();
  if (after.includes(vakaAsk)) {
    return `${ask}\n\n${trimmed}`;
  }
  return `${ask}\n\n${before}\n\n${academyModeratorVakaAskExchange(slug)}\n\n${after}`;
}

export function isAcademyModeratorProse(text: string): boolean {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return false;
  }
  if (
    trimmed.includes(ACADEMY_MODERATOR_OPEN_LEAD) ||
    trimmed.includes(ACADEMY_MODERATOR_CLOSE_TAIL) ||
    (trimmed.includes(ACADEMY_MODERATOR_OPEN_TAIL) && trimmed.includes(ACADEMY_MODERATOR_OPEN_LEAD)) ||
    trimmed.includes("bu anlatım için çok teşekkür ediyoruz") ||
    (trimmed.includes(ACADEMY_MODERATOR_SUMMARY_LEAD) && trimmed.includes("Doğru mu anlıyorum ")) ||
    trimmed.includes("yayınımıza canlı katılan bir öğrencimizin bu bölümde bir sorusu var") ||
    trimmed.includes("bu bölümde canlı yayın soru süremiz doldu")
  ) {
    return true;
  }
  return academyFieldAskNeedles().some((needle) => trimmed.includes(needle));
}

/** Koray cümlesi + eğitmen yanıtı aynı paragraftaysa iki satıra ayır. */
export function splitAcademyStudioDialogue(
  text: string,
): { moderator: string; instructor: string } | null {
  const collapsed = text.replace(/\s+/gu, " ").trim();
  if (!collapsed) {
    return null;
  }
  for (const lead of ACADEMY_INSTRUCTOR_STUDIO_LEADS) {
    const at = collapsed.indexOf(lead);
    if (at > 0 && isAcademyModeratorProse(collapsed.slice(0, at))) {
      return {
        moderator: collapsed.slice(0, at).trim(),
        instructor: collapsed.slice(at).trim(),
      };
    }
  }
  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

/** TTS Puck span’leri — açılış, ara soru, vaka, parametre, kapanış. */
export function academyModeratorSpeechPatterns(): RegExp[] {
  const honorifics = Object.values(ACADEMY_INSTRUCTORS_BY_VOICE)
    .map((row) => escapeRegExp(academyInstructorHonorific(row)))
    .join("|");
  const datives = Object.values(ACADEMY_INSTRUCTORS_BY_VOICE)
    .map((row) => escapeRegExp(academyInstructorDativeHonorific(row)))
    .join("|");
  const slugs = Object.keys(ACADEMY_INSTRUCTOR_VOICE_BY_SLUG) as AcademyCourseTitleSlug[];
  const gelisme = [...new Set(slugs.map((slug) => academyFieldAsksForSlug(slug).gelisme))]
    .map((body) => escapeRegExp(body))
    .join("|");
  const vaka = [...new Set(slugs.map((slug) => academyFieldAsksForSlug(slug).vaka))]
    .map((body) => escapeRegExp(body))
    .join("|");
  const params = [...new Set(slugs.map((slug) => academyFieldAsksForSlug(slug).params))]
    .map((body) => escapeRegExp(body))
    .join("|");
  return [
    new RegExp(
      `${escapeRegExp(ACADEMY_MODERATOR_OPEN_LEAD)}[\\s\\S]*?${escapeRegExp(ACADEMY_MODERATOR_OPEN_TAIL)}`,
      "gu",
    ),
    new RegExp(
      `${escapeRegExp(ACADEMY_MODERATOR_SUMMARY_LEAD)}[\\s\\S]*?Doğru mu anlıyorum (?:${honorifics})\\?`,
      "gu",
    ),
    new RegExp(`(?:${honorifics}), (?:${gelisme})`, "gu"),
    new RegExp(`(?:${vaka})`, "gu"),
    new RegExp(`(?:${params})`, "gu"),
    new RegExp(
      `(?:${datives}) bu anlatım için çok teşekkür ediyoruz\\. ${escapeRegExp(ACADEMY_MODERATOR_CLOSE_TAIL)}`,
      "gu",
    ),
  ];
}

export function collectAcademyModeratorSpeechSpans(
  spoken: string,
): Array<{ start: number; end: number }> {
  const spans: Array<{ start: number; end: number }> = [];
  for (const pattern of academyModeratorSpeechPatterns()) {
    pattern.lastIndex = 0;
    let match = pattern.exec(spoken);
    while (match) {
      spans.push({ start: match.index, end: match.index + match[0].length });
      match = pattern.exec(spoken);
    }
  }
  return spans
    .sort((left, right) => left.start - right.start)
    .filter((span, index, list) => {
      if (index === 0) {
        return true;
      }
      return span.start >= list[index - 1]!.end;
    });
}

/** Görsel stüdyo kartı — moderatör ile eğitmen yanıtı ayrı satır. */
export function academyStudioProseLines(text: string): string[] {
  const parts = text
    .split(/\n+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const lines: string[] = [];
  for (const part of parts) {
    const split = splitAcademyStudioDialogue(part);
    if (split) {
      lines.push(split.moderator);
      lines.push(split.instructor);
      continue;
    }
    lines.push(part);
  }
  return lines;
}

/** Giriş / Problem — selamdan sonra hedef kitle pusulası. */
export function academyIntroWithAudienceCompass(
  slug: string,
  lessonKey: string,
  intro: string,
): string {
  const compass = academyAudienceCompassForLesson(lessonKey);
  if (intro.includes(ACADEMY_COMPASS_ANCHOR)) {
    return intro;
  }
  const greeting = academyLessonMiddleOpenForSlug(slug);
  const firstOpen = academyFirstLessonIntroForSlug(slug);
  const recap = academyModeratorRecapExchangeForLesson(slug, lessonKey);
  const trimmed = intro.trim();
  if (trimmed.includes(ACADEMY_MODERATOR_SUMMARY_LEAD)) {
    if (trimmed.startsWith(firstOpen) || trimmed.includes(ACADEMY_MODERATOR_OPEN_LEAD)) {
      const parts = trimmed.split(/\n\n+/u);
      if (parts.length >= 2) {
        return [parts[0], compass, ...parts.slice(1)].join("\n\n");
      }
      return `${trimmed}\n\n${compass}`;
    }
    if (trimmed.startsWith(greeting)) {
      const rest = trimmed.slice(greeting.length).trim();
      return rest ? `${greeting}\n\n${compass}\n\n${rest}` : `${greeting}\n\n${compass}`;
    }
    return `${compass}\n\n${trimmed}`;
  }
  if (trimmed.startsWith(firstOpen) || trimmed.includes(ACADEMY_MODERATOR_OPEN_LEAD)) {
    const parts = trimmed.split(/\n\n+/u);
    if (parts.length >= 2) {
      return [parts[0], compass, ...parts.slice(1)].join("\n\n");
    }
    return `${trimmed}\n\n${compass}`;
  }
  if (trimmed.startsWith(greeting)) {
    const rest = trimmed.slice(greeting.length).trim();
    const head = recap ? `${recap}\n\n${greeting}` : greeting;
    return rest ? `${head}\n\n${compass}\n\n${rest}` : `${head}\n\n${compass}`;
  }
  return recap ? `${recap}\n\n${compass}\n\n${trimmed}` : `${compass}\n\n${trimmed}`;
}
