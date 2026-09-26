import "server-only";

import { z } from "zod";
import { isAcademyFreePreviewLessonKey } from "@/lib/academy/purchase-path";
import { academyCourseSlugFromLessonKey } from "@/lib/academy/pilot-sku";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import {
  ACADEMY_LESSON_ASSISTANT_FAIL,
  ACADEMY_LESSON_ASSISTANT_LIMIT,
  ACADEMY_LESSON_ASSISTANT_MODEL,
  ACADEMY_LESSON_ASSISTANT_OFF_TOPIC,
  ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
  academyLessonAssistantReplyStaysOnLesson,
  academyLessonAssistantSystemPrompt,
  isAcademyLessonAssistantOffTopic,
  scrubAcademyLessonAssistantReply,
} from "@/lib/academy/lesson-assistant-policy";
import { loadAcademySpokenScriptProse } from "@/lib/academy/spoken-scripts";
import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { consumeHttpRateLimit } from "@/lib/kernel/security/http-rate-limit";

export {
  ACADEMY_LESSON_ASSISTANT_MODEL,
  ACADEMY_LESSON_ASSISTANT_PATH,
  ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
} from "@/lib/academy/lesson-assistant-policy";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60_000;

export const lessonAssistantRequestSchema = z.object({
  courseSlug: z.string().trim().min(1).max(80),
  lessonKey: z.string().trim().min(1).max(120),
  currentTimeSec: z.number().finite().min(0).max(60 * 60),
  question: z.string().trim().min(1).max(500),
});

export type LessonAssistantRequest = z.infer<typeof lessonAssistantRequestSchema>;

export type LessonAssistantQuota = {
  allowed: boolean;
  remaining: number;
  limit: number;
};

export type LessonAssistantResult =
  | { ok: true; reply: string; remaining: number; limit: number; source: "redirect" | "llm" | "fail-safe" }
  | { ok: false; error: string; status: 400 | 403 | 404 | 429; remaining: number; limit: number };

export type AnswerLessonAssistantDeps = InvokeLlmDeps & {
  consumeQuota?: (userId: string, lessonKey: string) => Promise<LessonAssistantQuota>;
  loadLessonText?: (courseSlug: string, lessonKey: string) => { title: string; text: string } | null;
  invoke?: typeof invokeLlm;
};

export function academyLessonAssistantActiveLine(lessonKey: string, currentTimeSec: number): string {
  const timings = loadAcademySealedAudioTimings(lessonKey);
  const piece = timings?.pieces.find(
    (row) => currentTimeSec >= row.start && currentTimeSec <= row.end,
  );
  return piece?.text ?? "";
}

export function loadAcademyLessonAssistantText(
  courseSlug: string,
  lessonKey: string,
): { title: string; text: string } | null {
  const owner = academyCourseSlugFromLessonKey(lessonKey);
  if (!owner || owner !== courseSlug) {
    return null;
  }
  const lesson = curriculumForCourseSlug(courseSlug).find((row) => row.key === lessonKey);
  const spoken = loadAcademySpokenScriptProse(lessonKey).trim();
  const text = spoken || lesson?.body?.trim() || "";
  if (!text) {
    return null;
  }
  return { title: lesson?.title ?? lessonKey, text };
}

async function consumeLessonQuota(userId: string, lessonKey: string): Promise<LessonAssistantQuota> {
  const decision = await consumeHttpRateLimit(`${userId}:${lessonKey}`, {
    keyPrefix: "academy-lesson-ask",
    limit: ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
    windowMs: THIRTY_DAYS_MS,
  });
  return {
    allowed: decision.allowed,
    remaining: decision.remaining,
    limit: decision.limit,
  };
}

export const ACADEMY_LESSON_ASSISTANT_LOCKED = "Satın alma mühürlenmeden ders içeriği açılmaz.";

export async function answerAcademyLessonAssistant(
  input: {
    userId: string;
    courseSlug: string;
    lessonKey: string;
    currentTimeSec: number;
    question: string;
    /** Kilitli ders için ticari lisans. Hazırlık şeridi bu bayrağı istemez. */
    commercialEnrolment?: boolean;
  },
  deps: AnswerLessonAssistantDeps = {},
): Promise<LessonAssistantResult> {
  const parsed = lessonAssistantRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Soruyu kısa ve net yaz.",
      status: 400,
      remaining: ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
      limit: ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
    };
  }

  if (
    !isAcademyFreePreviewLessonKey(parsed.data.lessonKey) &&
    input.commercialEnrolment !== true
  ) {
    return {
      ok: false,
      error: ACADEMY_LESSON_ASSISTANT_LOCKED,
      status: 403,
      remaining: ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
      limit: ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
    };
  }

  const load = deps.loadLessonText ?? loadAcademyLessonAssistantText;
  const lesson = load(parsed.data.courseSlug, parsed.data.lessonKey);
  if (!lesson) {
    return {
      ok: false,
      error: "Bu dersin metni henüz yok.",
      status: 404,
      remaining: ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
      limit: ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
    };
  }

  const consume = deps.consumeQuota ?? consumeLessonQuota;
  const slot = await consume(input.userId, parsed.data.lessonKey);
  if (!slot.allowed) {
    return {
      ok: false,
      error: ACADEMY_LESSON_ASSISTANT_LIMIT,
      status: 429,
      remaining: 0,
      limit: slot.limit,
    };
  }

  const activeLine = academyLessonAssistantActiveLine(parsed.data.lessonKey, parsed.data.currentTimeSec);
  const corpus = `${lesson.title}\n${activeLine}\n${lesson.text}`;
  if (isAcademyLessonAssistantOffTopic(parsed.data.question, corpus)) {
    return {
      ok: true,
      reply: ACADEMY_LESSON_ASSISTANT_OFF_TOPIC,
      remaining: slot.remaining,
      limit: slot.limit,
      source: "redirect",
    };
  }

  const invoke = deps.invoke ?? invokeLlm;
  const llm = await invoke(
    {
      provider: "gemini",
      model: ACADEMY_LESSON_ASSISTANT_MODEL,
      system: academyLessonAssistantSystemPrompt({
        lessonTitle: lesson.title,
        currentTimeSec: parsed.data.currentTimeSec,
        activeLine,
        lessonText: lesson.text,
      }),
      user: parsed.data.question,
      temperature: 0.3,
      maxOutputTokens: 400,
      billing: {
        userId: input.userId,
        source: AI_TOKEN_SOURCES.ACADEMY,
        recordUsage: true,
      },
    },
    deps,
  );

  const reply = scrubAcademyLessonAssistantReply(llm?.text?.trim() ?? "");
  if (reply && !academyLessonAssistantReplyStaysOnLesson(reply, corpus)) {
    return {
      ok: true,
      reply: ACADEMY_LESSON_ASSISTANT_OFF_TOPIC,
      remaining: slot.remaining,
      limit: slot.limit,
      source: "redirect",
    };
  }
  if (!reply) {
    return {
      ok: true,
      reply: ACADEMY_LESSON_ASSISTANT_FAIL,
      remaining: slot.remaining,
      limit: slot.limit,
      source: "fail-safe",
    };
  }

  return {
    ok: true,
    reply,
    remaining: slot.remaining,
    limit: slot.limit,
    source: "llm",
  };
}
