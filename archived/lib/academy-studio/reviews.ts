/**
 * Mühürlü ders/kurs değerlendirmesi. Sicil süreç belleğidir.
 * AI yanıt `archived/lib/academy-studio/reviews-engine.ts` içinde üretilir; burası mühürlü yedek.
 */

import { randomUUID } from "node:crypto";
import {
  ACADEMY_MODERATOR,
  academyInstructorHonorific,
  type AcademyInstructor,
} from "@/lib/academy/instructors";
import {
  ACADEMY_REVIEW_DECISION_B,
  ACADEMY_REVIEW_DECISION_C,
  type AcademyReviewDecision,
} from "@/archived/lib/academy-studio/moderation";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

export const ACADEMY_REVIEW_STARS_MIN = 1;
export const ACADEMY_REVIEW_STARS_MAX = 5;
export const ACADEMY_REVIEW_COMMENT_MAX = 800;
export const ACADEMY_REVIEW_REPLY_MAX = 420;

export type AcademyReviewStars = 1 | 2 | 3 | 4 | 5;

export type AcademyReviewRecord = {
  id: string;
  userId: string;
  courseId: string;
  purchaseId: string;
  lessonKey: string | null;
  stars: AcademyReviewStars;
  comment: string;
  decision: AcademyReviewDecision | null;
  moderatorReply: string;
  repliedAt: Date;
  createdAt: Date;
};

const reviews = new Map<string, AcademyReviewRecord>();

function reviewKey(purchaseId: string, lessonKey: string | null): string {
  return `${purchaseId}:${lessonKey ?? "course"}`;
}

export function isAcademyReviewStars(value: number): value is AcademyReviewStars {
  return (
    Number.isInteger(value) &&
    value >= ACADEMY_REVIEW_STARS_MIN &&
    value <= ACADEMY_REVIEW_STARS_MAX
  );
}

export function sealedAcademyReviewReply(input: {
  stars: AcademyReviewStars;
  comment: string;
  instructor: AcademyInstructor;
}): string {
  const honorific = academyInstructorHonorific(input.instructor);
  const host = ACADEMY_MODERATOR.name;
  if (input.stars >= 4) {
    return `${host}: Teşekkürler, bu mühür bize güç verdi. ${honorific} de masada aynı heyecanı duydu. Yorumun stüdyoda duruyor.`;
  }
  if (input.stars <= 2) {
    return `${honorific}: Haklısın, bu nokta masada daha net durmalıydı. Bir sonraki basımda aynı yeri açık açık düzelteceğiz. Teşekkürler, kaçırmadın.`;
  }
  return `${host}: Karışık bir not, anlıyorum. ${honorific} ile bu bölümü bir tur daha sadeleştireceğiz. Yorumun kayda geçti.`;
}

export function sealedAcademyReviewDecisionReply(input: {
  decision: AcademyReviewDecision;
  instructor: AcademyInstructor;
  correction?: string | null;
}): string {
  const honorific = academyInstructorHonorific(input.instructor);
  const host = ACADEMY_MODERATOR.name;
  if (input.decision === ACADEMY_REVIEW_DECISION_B) {
    return `${host}: ${ACADEMY_SEN.review.outOfScope}`;
  }
  if (input.decision === ACADEMY_REVIEW_DECISION_C) {
    return ACADEMY_SEN.review.revisionQueued;
  }
  const correction =
    input.correction?.replace(/\s+/gu, " ").trim() || ACADEMY_SEN.review.misconceptionDefault;
  return `${host}: Bu noktada yanılgı sık olur. ${honorific} masada şöyle netleştiriyor: ${correction}`;
}

export function clipAcademyReviewReply(text: string): string {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (trimmed.length <= ACADEMY_REVIEW_REPLY_MAX) {
    return trimmed;
  }
  return `${trimmed.slice(0, ACADEMY_REVIEW_REPLY_MAX - 1).trim()}…`;
}

export function getAcademyReview(
  purchaseId: string,
  lessonKey: string | null,
): AcademyReviewRecord | null {
  const row = reviews.get(reviewKey(purchaseId, lessonKey));
  return row ? { ...row } : null;
}

export function insertAcademyReview(
  input: Omit<AcademyReviewRecord, "id" | "createdAt" | "repliedAt" | "decision"> & {
    id?: string;
    createdAt?: Date;
    repliedAt?: Date;
    decision?: AcademyReviewDecision | null;
  },
): AcademyReviewRecord {
  const existing = reviews.get(reviewKey(input.purchaseId, input.lessonKey));
  if (existing) {
    return { ...existing };
  }
  const now = input.createdAt ?? new Date();
  const row: AcademyReviewRecord = {
    id: input.id ?? randomUUID(),
    userId: input.userId,
    courseId: input.courseId,
    purchaseId: input.purchaseId,
    lessonKey: input.lessonKey,
    stars: input.stars,
    comment: input.comment,
    decision: input.decision ?? null,
    moderatorReply: clipAcademyReviewReply(input.moderatorReply),
    repliedAt: input.repliedAt ?? now,
    createdAt: now,
  };
  reviews.set(reviewKey(row.purchaseId, row.lessonKey), row);
  return { ...row };
}

export function listAcademyReviewsByCourse(courseId: string): AcademyReviewRecord[] {
  return [...reviews.values()]
    .filter((row) => row.courseId === courseId)
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .map((row) => ({ ...row }));
}

export function listAcademyReviewsByLesson(courseId: string, lessonKey: string): AcademyReviewRecord[] {
  return listAcademyReviewsByCourse(courseId).filter((row) => row.lessonKey === lessonKey);
}

export function resetAcademyReviewsForTests(): void {
  reviews.clear();
}
