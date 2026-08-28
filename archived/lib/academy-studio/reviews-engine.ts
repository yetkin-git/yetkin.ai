import "server-only";

import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { BadRequestError, ForbiddenError } from "@/lib/kernel/http/errors";
import { logEvent } from "@/lib/kernel/observability/log";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import { enqueueAcademyCurriculumRevision } from "@/archived/lib/academy-studio/curriculum-revisions";
import { academyInstructorBySlug } from "@/lib/academy/instructors";
import {
  academyModeratorPolicyMessage,
  classifyAcademyReviewDecision,
  isAcademyCitizenTextClean,
  isAcademyReviewDecision,
  type AcademyReviewDecision,
} from "@/archived/lib/academy-studio/moderation";
import {
  clipAcademyReviewReply,
  getAcademyReview,
  insertAcademyReview,
  sealedAcademyReviewDecisionReply,
  sealedAcademyReviewReply,
  type AcademyReviewRecord,
  type AcademyReviewStars,
} from "@/archived/lib/academy-studio/reviews";
import { resolveSettledAcademyPurchase, type AcademyActor } from "@/lib/academy/access";
import type { AcademyStore } from "@/lib/academy/types";
import { YETKIN_BRAND } from "@/lib/copy/brand";

export type AcademyReviewPorts = {
  academy: AcademyStore;
};

export type SubmitAcademyReviewCommand = {
  userId: string;
  email?: string | null;
  courseId: string;
  lessonKey?: string;
  stars: AcademyReviewStars;
  comment: string;
};

const REVIEW_SYSTEM =
  `${YETKIN_BRAND} Akademi stüdyosunda Moderatör Koray veya dersin eğitmeni olarak kısa, samimi Türkçe yanıt yaz. Övgüye teşekkür et. Eleştiriye yapıcı düzeltme sözü ver. Metne İngilizce ekleme. En fazla 3 cümle.`;

const DECISION_SYSTEM =
  `${YETKIN_BRAND} Akademi yorum süzgeci. Yalnız JSON döndür. Metne İngilizce ekleme. Kategoriler: A = KULLANICI_YANILGISI (vatandaş konuyu yanlış anlamış), B = KAPSAM_DISI (konu Orta/İleri müfredatta), C = REVIZYON_TALEBI (haklı hata veya eksiklik). Övgü veya karar yoksa category boş string. Şekil: {"category":"A"|"B"|"C"|"","correction":"..."}. correction yalnız A için 1-2 Türkçe cümle (konunun doğrusu); B ve C için boş string.`;

const LETTER_TO_DECISION = {
  A: "KULLANICI_YANILGISI",
  B: "KAPSAM_DISI",
  C: "REVİZYON_TALEBİ",
} as const satisfies Record<"A" | "B" | "C", AcademyReviewDecision>;

function extractJsonObject(text: string): unknown {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  const fenced = trimmed.replace(/^```(?:json)?/iu, "").replace(/```$/u, "").trim();
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }
  try {
    return JSON.parse(fenced.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

export function parseAcademyReviewAiDecision(text: string): {
  decision: AcademyReviewDecision;
  correction: string | null;
} | null {
  const parsed = extractJsonObject(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const row = parsed as Record<string, unknown>;
  const raw =
    typeof row.category === "string"
      ? row.category.trim().toUpperCase()
      : typeof row.decision === "string"
        ? row.decision.trim().toUpperCase()
        : "";
  const letter = raw === "A" || raw === "B" || raw === "C" ? raw : null;
  const mapped = letter
    ? LETTER_TO_DECISION[letter]
    : isAcademyReviewDecision(raw)
      ? raw
      : null;
  if (!mapped) {
    return null;
  }
  const correction =
    mapped === "KULLANICI_YANILGISI" && typeof row.correction === "string"
      ? row.correction.replace(/\s+/gu, " ").trim() || null
      : null;
  return { decision: mapped, correction };
}

async function classifyReviewWithLlm(
  command: SubmitAcademyReviewCommand,
  context: { slug: string; level: string; instructorName: string },
  deps: InvokeLlmDeps,
): Promise<{ decision: AcademyReviewDecision; correction: string | null } | null> {
  const trimmed = command.comment.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return null;
  }
  const generated = await invokeLlm(
    {
      role: "LITE_STREAM",
      system: DECISION_SYSTEM,
      user: `Kurs: ${context.slug}. Seviye: ${context.level}. Eğitmen: ${context.instructorName}. Yıldız: ${command.stars}. Yorum: ${trimmed}`,
      temperature: 0.2,
      maxOutputTokens: 220,
      timeoutMs: 12_000,
      maxAttempts: 1,
      responseJson: true,
      billing: {
        userId: command.userId,
        source: AI_TOKEN_SOURCES.ACADEMY,
        recordUsage: false,
      },
      rateLimit: {
        identifier: command.userId,
        scope: "academy:review-decision",
        limit: 8,
        windowMs: 60_000,
      },
    },
    deps,
  );
  if (!generated?.text) {
    return null;
  }
  return parseAcademyReviewAiDecision(generated.text);
}

export async function submitAcademyReview(
  ports: AcademyReviewPorts,
  command: SubmitAcademyReviewCommand,
  deps: InvokeLlmDeps = {},
): Promise<{ applied: boolean; review: AcademyReviewRecord }> {
  const actor: AcademyActor = { userId: command.userId, email: command.email };
  const course =
    (await ports.academy.getCourse(command.courseId)) ??
    (await ports.academy.getCourseBySlug(command.courseId));
  if (!course) {
    throw new ForbiddenError("Kurs bulunamadı.");
  }
  const purchase = await resolveSettledAcademyPurchase(ports.academy, actor, course.id);
  if (!purchase || purchase.status !== "SETTLED") {
    throw new ForbiddenError("Satın alma mühürlenmeden değerlendirme açılmaz.");
  }
  const lessonKey = command.lessonKey ?? null;
  const existing = getAcademyReview(purchase.id, lessonKey);
  if (existing) {
    return { applied: false, review: existing };
  }
  if (!isAcademyCitizenTextClean(command.comment)) {
    logEvent({
      level: "warn",
      event: "academy.moderation.rejected",
      action: "review",
      reason: "policy-violation",
      route: "academy.review",
      userId: command.userId,
    });
    throw new BadRequestError(academyModeratorPolicyMessage("review"));
  }
  const instructor = academyInstructorBySlug(course.slug);
  const courseLevel = academyCourseLevelBySlug(course.slug);
  const sealedVerdict = classifyAcademyReviewDecision({
    comment: command.comment,
    stars: command.stars,
    courseSlug: course.slug,
    courseLevel,
  });
  const aiVerdict = await classifyReviewWithLlm(
    command,
    {
      slug: course.slug,
      level: courseLevel ?? "—",
      instructorName: instructor.name,
    },
    deps,
  );
  const decision = aiVerdict?.decision ?? sealedVerdict.decision;
  const correction = aiVerdict?.correction ?? sealedVerdict.correction;
  let reply: string;
  if (decision) {
    reply = sealedAcademyReviewDecisionReply({
      decision,
      instructor,
      correction,
    });
    logEvent({
      level: "info",
      event: "academy.review.decision",
      route: "academy.review",
      userId: command.userId,
      action: decision,
      reason: aiVerdict ? "llm" : "sealed",
    });
  } else {
    reply = sealedAcademyReviewReply({
      stars: command.stars,
      comment: command.comment,
      instructor,
    });
    const generated = await invokeLlm(
      {
        role: "LITE_STREAM",
        system: REVIEW_SYSTEM,
        user: `Eğitmen: ${instructor.name}. Yıldız: ${command.stars}. Yorum: ${command.comment || "(boş)"}`,
        temperature: 0.4,
        maxOutputTokens: 180,
        timeoutMs: 12_000,
        maxAttempts: 1,
        billing: {
          userId: command.userId,
          source: AI_TOKEN_SOURCES.ACADEMY,
          recordUsage: false,
        },
        rateLimit: {
          identifier: command.userId,
          scope: "academy:review",
          limit: 8,
          windowMs: 60_000,
        },
      },
      deps,
    );
    if (generated?.text) {
      reply = clipAcademyReviewReply(generated.text);
    }
  }
  const review = insertAcademyReview({
    userId: command.userId,
    courseId: course.id,
    purchaseId: purchase.id,
    lessonKey,
    stars: command.stars,
    comment: command.comment,
    decision,
    moderatorReply: reply,
  });
  if (decision === "REVİZYON_TALEBİ") {
    enqueueAcademyCurriculumRevision({
      reviewId: review.id,
      userId: command.userId,
      courseId: course.id,
      courseSlug: course.slug,
      lessonKey,
      stars: command.stars,
      comment: command.comment,
      decision,
    });
  }
  return { applied: true, review };
}
