import "server-only";

import { z } from "zod";
import { juniorBookletCopy } from "@/lib/junior/booklet";
import { juniorScenarioIfPresent } from "@/lib/junior/content-source";
import {
  JUNIOR_LIVE_TUTOR_FAIL,
  JUNIOR_LIVE_TUTOR_LIMIT,
  JUNIOR_LIVE_TUTOR_MAX_HISTORY,
  JUNIOR_LIVE_TUTOR_MAX_MESSAGE_CHARS,
  JUNIOR_LIVE_TUTOR_MODEL,
  JUNIOR_LIVE_TUTOR_OFF_TOPIC,
  JUNIOR_LIVE_TUTOR_QUESTION_LIMIT,
  JUNIOR_LIVE_TUTOR_TEACHER,
  isJuniorLiveTutorOffTopic,
  juniorLiveTutorReplyStaysOnLesson,
  juniorLiveTutorSystemPrompt,
  resolveJuniorLiveTutorLocalReply,
  scrubJuniorLiveTutorReply,
  type JuniorLiveTutorPromptContext,
} from "@/lib/junior/live-tutor-policy";
import {
  peekJuniorLessonBlueprint,
  resolveJuniorEngineTimeline,
} from "@/lib/junior/lesson-engine/registry";
import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import type { LlmChatTurn } from "@/lib/kernel/ai/types";
import { consumeHttpRateLimit } from "@/lib/kernel/security/http-rate-limit";

const ONE_DAY_MS = 24 * 60 * 60_000;

const historyTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(JUNIOR_LIVE_TUTOR_MAX_MESSAGE_CHARS),
});

export const juniorLiveTutorRequestSchema = z.object({
  lessonKey: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(JUNIOR_LIVE_TUTOR_MAX_MESSAGE_CHARS),
  history: z.array(historyTurnSchema).max(JUNIOR_LIVE_TUTOR_MAX_HISTORY).optional(),
  activeSceneTitle: z.string().trim().max(160).optional(),
  activeSceneSubtitle: z.string().trim().max(200).optional(),
  cueIndex: z.number().int().min(0).max(200).optional(),
});

export type JuniorLiveTutorRequest = z.infer<typeof juniorLiveTutorRequestSchema>;

export type JuniorLiveTutorQuota = {
  allowed: boolean;
  remaining: number;
  limit: number;
};

export type JuniorLiveTutorResult =
  | {
      ok: true;
      reply: string;
      remaining: number;
      limit: number;
      source: "local" | "llm" | "redirect" | "fail-safe";
    }
  | { ok: false; error: string; status: 400 | 404 | 429; remaining: number; limit: number };

export type AnswerJuniorLiveTutorDeps = InvokeLlmDeps & {
  consumeQuota?: (userId: string, lessonKey: string) => Promise<JuniorLiveTutorQuota>;
  invoke?: typeof invokeLlm;
  /** true ise LLM çağrılmaz; yerel / fail-safe yanıt döner (misafir önizleme). */
  localOnly?: boolean;
};

async function consumeTutorQuota(userId: string, lessonKey: string): Promise<JuniorLiveTutorQuota> {
  const decision = await consumeHttpRateLimit(`${userId}:${lessonKey}`, {
    keyPrefix: "junior-live-tutor",
    limit: JUNIOR_LIVE_TUTOR_QUESTION_LIMIT,
    windowMs: ONE_DAY_MS,
  });
  return {
    allowed: decision.allowed,
    remaining: decision.remaining,
    limit: decision.limit,
  };
}

function clipDigest(parts: readonly string[], max = 480): string {
  const joined = parts.map((p) => p.trim()).filter(Boolean).join(" ");
  if (joined.length <= max) {
    return joined;
  }
  return `${joined.slice(0, max - 1).trimEnd()}…`;
}

export function loadJuniorLiveTutorContext(
  lessonKey: string,
  scene: { activeSceneTitle?: string; activeSceneSubtitle?: string; cueIndex?: number },
): JuniorLiveTutorPromptContext | null {
  const scenario = juniorScenarioIfPresent(lessonKey);
  const booklet = juniorBookletCopy(lessonKey);
  const blueprint = peekJuniorLessonBlueprint(lessonKey);
  const timeline = resolveJuniorEngineTimeline(lessonKey);
  if (!scenario && !timeline && !booklet.concept) {
    return null;
  }

  const cue =
    typeof scene.cueIndex === "number" && timeline
      ? timeline.cues[scene.cueIndex]
      : undefined;
  const chapter =
    cue && timeline ? timeline.chapters.find((ch) => ch.id === cue.chapterId) : undefined;

  const activeSceneTitle =
    scene.activeSceneTitle?.trim() ||
    chapter?.title ||
    timeline?.title ||
    scenario?.title ||
    lessonKey;
  const activeSceneSubtitle = scene.activeSceneSubtitle?.trim() || "";

  return {
    lessonKey,
    lessonTitle: timeline?.title ?? scenario?.title ?? blueprint?.title ?? lessonKey,
    teacherName: timeline?.teacher.name ?? JUNIOR_LIVE_TUTOR_TEACHER.replace(" Öğretmen", ""),
    activeSceneTitle,
    activeSceneSubtitle,
    conceptSeal: scenario?.conceptSeal?.trim() || blueprint?.content.conceptSummary || "",
    notesDigest: clipDigest([
      booklet.heroQuestion,
      booklet.heroFocus,
      booklet.concept,
      booklet.example,
      booklet.warning,
      ...(booklet.recap ?? []),
    ]),
    outcomesDigest: clipDigest(scenario?.outcomes ?? blueprint?.content.outcomes ?? []),
  };
}

function normalizeHistory(history: JuniorLiveTutorRequest["history"]): LlmChatTurn[] {
  if (!history?.length) {
    return [];
  }
  return history.map((turn) => ({ role: turn.role, content: turn.content }));
}

function corpusFromContext(ctx: JuniorLiveTutorPromptContext): string {
  return [
    ctx.lessonTitle,
    ctx.activeSceneTitle,
    ctx.activeSceneSubtitle,
    ctx.conceptSeal,
    ctx.notesDigest,
    ctx.outcomesDigest,
  ].join("\n");
}

export async function answerJuniorLiveTutor(
  input: {
    userId: string;
    lessonKey: string;
    message: string;
    history?: JuniorLiveTutorRequest["history"];
    activeSceneTitle?: string;
    activeSceneSubtitle?: string;
    cueIndex?: number;
  },
  deps: AnswerJuniorLiveTutorDeps = {},
): Promise<JuniorLiveTutorResult> {
  const parsed = juniorLiveTutorRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Soruyu kısa ve net yaz.",
      status: 400,
      remaining: JUNIOR_LIVE_TUTOR_QUESTION_LIMIT,
      limit: JUNIOR_LIVE_TUTOR_QUESTION_LIMIT,
    };
  }

  const ctx = loadJuniorLiveTutorContext(parsed.data.lessonKey, {
    activeSceneTitle: parsed.data.activeSceneTitle,
    activeSceneSubtitle: parsed.data.activeSceneSubtitle,
    cueIndex: parsed.data.cueIndex,
  });
  if (!ctx) {
    return {
      ok: false,
      error: "Bu dersin koç bağlamı henüz yok.",
      status: 404,
      remaining: JUNIOR_LIVE_TUTOR_QUESTION_LIMIT,
      limit: JUNIOR_LIVE_TUTOR_QUESTION_LIMIT,
    };
  }

  const consume = deps.consumeQuota ?? consumeTutorQuota;
  const slot = await consume(input.userId, parsed.data.lessonKey);
  if (!slot.allowed) {
    return {
      ok: false,
      error: JUNIOR_LIVE_TUTOR_LIMIT,
      status: 429,
      remaining: 0,
      limit: slot.limit,
    };
  }

  const corpus = corpusFromContext(ctx);
  if (isJuniorLiveTutorOffTopic(parsed.data.message, corpus)) {
    return {
      ok: true,
      reply: JUNIOR_LIVE_TUTOR_OFF_TOPIC,
      remaining: slot.remaining,
      limit: slot.limit,
      source: "redirect",
    };
  }

  const local = resolveJuniorLiveTutorLocalReply(parsed.data.message, ctx);
  if (deps.localOnly) {
    return {
      ok: true,
      reply:
        local ??
        `Şu an «${ctx.activeSceneTitle}» sahnesindesin. Hangi kurala bakıyorsun — son basamak mı, rakam toplamı mı? Birini seç, birlikte ilerleyelim.`,
      remaining: slot.remaining,
      limit: slot.limit,
      source: local ? "local" : "fail-safe",
    };
  }

  const invoke = deps.invoke ?? invokeLlm;
  const llm = await invoke(
    {
      provider: "gemini",
      model: JUNIOR_LIVE_TUTOR_MODEL,
      system: juniorLiveTutorSystemPrompt(ctx),
      user: parsed.data.message,
      history: normalizeHistory(parsed.data.history),
      temperature: 0.45,
      maxOutputTokens: 280,
      billing: {
        userId: input.userId,
        source: AI_TOKEN_SOURCES.JUNIOR,
        recordUsage: true,
      },
    },
    deps,
  );

  const reply = scrubJuniorLiveTutorReply(llm?.text?.trim() ?? "");
  if (reply && !juniorLiveTutorReplyStaysOnLesson(reply, corpus)) {
    return {
      ok: true,
      reply: JUNIOR_LIVE_TUTOR_OFF_TOPIC,
      remaining: slot.remaining,
      limit: slot.limit,
      source: "redirect",
    };
  }
  if (!reply) {
    return {
      ok: true,
      reply: local ?? JUNIOR_LIVE_TUTOR_FAIL,
      remaining: slot.remaining,
      limit: slot.limit,
      source: local ? "local" : "fail-safe",
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
