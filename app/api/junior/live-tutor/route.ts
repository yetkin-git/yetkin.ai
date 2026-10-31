import { z } from "zod";
import { getSession } from "@/lib/kernel/auth/session";
import { canonicalJuniorLessonKey } from "@/lib/junior/lesson-key-alias";
import { isJuniorProfileClosed } from "@/lib/junior/guardian-notice";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import {
  answerJuniorLiveTutor,
  juniorLiveTutorRequestSchema,
} from "@/lib/junior/live-tutor";
import { authorizeJuniorLiveTutor } from "@/lib/junior/live-tutor-access";
import { isJuniorPlanActive } from "@/lib/junior/plan";
import {
  evaluateJuniorGuestPilotTrialQuiz,
  evaluateJuniorGuestPilotTrialTell,
} from "@/lib/junior/service";
import { wipeAudioCarrier } from "@/lib/junior/tell";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

const trialTellSchema = z
  .object({
    trialMode: z.literal("tell"),
    lessonKey: z.string().trim().min(1).max(80).transform(canonicalJuniorLessonKey),
    mode: z.enum(["speak", "write"]).optional(),
    text: z.string().trim().min(1).max(600).optional(),
    audioBase64: z.string().max(1_200_000).optional(),
    mimeType: z.string().max(80).optional(),
    durationSec: z.number().finite().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.mode === "write" && (!data.text || data.text.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["text"],
        message: "Yazılı anlatış metni gerekli.",
      });
    }
  });

const trialQuizSchema = z
  .object({
    trialMode: z.literal("quiz"),
    lessonKey: z.string().trim().min(1).max(80).transform(canonicalJuniorLessonKey),
    answers: z
      .array(
        z
          .object({
            id: z.string().trim().min(1).max(40),
            choiceIndex: z.number().int().min(0).max(8).optional(),
          })
          .strict(),
      )
      .max(16),
  })
  .strict();

/**
 * Selim Öğretmen canlı ders koçu.
 * Kenar `public` kalır: misafir deneme anahtarları (`jr_06_mat-1..3`) yerel yanıt alır.
 * Oturumlu model çağrısı `authorizeJuniorLiveTutor` içinden geçer:
 * `canEnterJunior` + `juniorLessonAccess` + seçmeli kota. Paket yoksa 403.
 */
export const auth = "public" as const;

async function readJuniorLiveTutorEntitlement(userId: string): Promise<{
  planActive: boolean;
  selectedElectives: readonly string[];
  profileId: string | null;
}> {
  const store = createPrismaJuniorStore();
  const [subscription, profiles] = await Promise.all([
    store.getSubscription(userId),
    store.listProfiles(userId),
  ]);
  const open = profiles.filter((row) => !isJuniorProfileClosed(row));
  const selected = open.find((row) => row.selected) ?? open[0] ?? null;
  return {
    planActive: isJuniorPlanActive(subscription, new Date()),
    selectedElectives: selected?.selectedElectives ?? [],
    profileId: selected?.id ?? null,
  };
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const burst = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.llmIp);
    if (!burst.allowed) {
      return rateLimitedJsonResponse(burst, request);
    }

    const rawBody: unknown = await request.json().catch(() => ({}));
    const session = await getSession(request);
    const userId = session?.id ?? `guest:${requestId}`;

    if (
      rawBody &&
      typeof rawBody === "object" &&
      "trialMode" in rawBody &&
      (rawBody as { trialMode?: unknown }).trialMode === "tell"
    ) {
      try {
        const parsedTell = trialTellSchema.safeParse(rawBody);
        if (!parsedTell.success) {
          return jsonFail("Anlatış gönderilemedi. Süreyi kontrol et.", 400, requestId, request);
        }
        const tellOutcome = await evaluateJuniorGuestPilotTrialTell({
          userId,
          lessonKey: parsedTell.data.lessonKey,
          mode: parsedTell.data.mode,
          text: parsedTell.data.text,
          audioBase64: parsedTell.data.audioBase64,
          mimeType: parsedTell.data.mimeType,
          durationSec: parsedTell.data.durationSec,
        });
        if (!tellOutcome.ok) {
          return jsonFail(tellOutcome.error, tellOutcome.status, requestId, request);
        }
        return jsonOk(tellOutcome.data, 200, requestId, request);
      } finally {
        if (rawBody && typeof rawBody === "object") {
          wipeAudioCarrier(rawBody as { audioBase64?: string });
        }
      }
    }

    if (
      rawBody &&
      typeof rawBody === "object" &&
      "trialMode" in rawBody &&
      (rawBody as { trialMode?: unknown }).trialMode === "quiz"
    ) {
      const parsedQuiz = trialQuizSchema.safeParse(rawBody);
      if (!parsedQuiz.success) {
        return jsonFail("Cevaplar okunamadı.", 400, requestId, request);
      }
      const quizOutcome = evaluateJuniorGuestPilotTrialQuiz({
        lessonKey: parsedQuiz.data.lessonKey,
        answers: parsedQuiz.data.answers,
      });
      if (!quizOutcome.ok) {
        return jsonFail(quizOutcome.error, quizOutcome.status, requestId, request);
      }
      return jsonOk(quizOutcome.data, 200, requestId, request);
    }

    const parsed = juniorLiveTutorRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return jsonFail("Soru gövdesi geçersiz.", 400, requestId, request);
    }

    if (session) {
      const userBurst = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.llmUser, session.id);
      if (!userBurst.allowed) {
        return rateLimitedJsonResponse(userBurst, request);
      }
    }

    const entitlement = session
      ? await readJuniorLiveTutorEntitlement(session.id)
      : { planActive: false, selectedElectives: [] as const, profileId: null };
    const access = authorizeJuniorLiveTutor({
      actor: session
        ? {
            id: session.id,
            email: session.email,
            emailConfirmedAt: session.emailConfirmedAt ?? null,
          }
        : null,
      lessonKey: parsed.data.lessonKey,
      planActive: entitlement.planActive,
      selectedElectives: entitlement.selectedElectives,
      profileId: entitlement.profileId,
    });
    if (!access.ok) {
      logEvent({
        level: "warn",
        event: "junior.live_tutor.denied",
        requestId,
        userId: session?.id,
        route: "/api/junior/live-tutor",
        status: access.status,
        reason: access.status === 403 ? "plan" : "missing",
      });
      return jsonFail(access.error, access.status, requestId, request);
    }

    const result = await answerJuniorLiveTutor(
      {
        userId,
        lessonKey: parsed.data.lessonKey,
        message: parsed.data.message,
        history: parsed.data.history,
        activeSceneTitle: parsed.data.activeSceneTitle,
        activeSceneSubtitle: parsed.data.activeSceneSubtitle,
        cueIndex: parsed.data.cueIndex,
      },
      {
        localOnly: access.mode === "guest-local",
        modelAllowed: access.mode === "model",
      },
    );

    if (!result.ok) {
      logEvent({
        level: result.status === 429 ? "warn" : "error",
        event: "junior.live_tutor.denied",
        requestId,
        userId: session?.id,
        route: "/api/junior/live-tutor",
        status: result.status,
        reason: result.status === 429 ? "quota" : "invalid",
      });
      return jsonFail(result.error, result.status, requestId, request);
    }

    logEvent({
      level: result.source === "fail-safe" ? "warn" : "info",
      event: "junior.live_tutor.ok",
      requestId,
      userId: session?.id,
      route: "/api/junior/live-tutor",
      status: 200,
      reason: result.source,
    });
    return jsonOk(
      {
        reply: result.reply,
        remaining: result.remaining,
        limit: result.limit,
        source: result.source,
        guest: access.mode === "guest-local",
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "junior.live_tutor.failed",
      requestId,
      route: "/api/junior/live-tutor",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
