/**
 * Kategori C (REVİZYON_TALEBİ) kuyruğu, ders sürümü ve tohum güncelleme günlüğü.
 *
 * OPERASYONEL DONDURMA (dürüst sınır):
 * - Sicil süreç içi bellektir (`Map` / dizi). Prisma klasörü / kalıcı tablo yoktur.
 * - Pod restart veya çok örnek (multi-instance) → kuyruk ve seedLog kaybolur / bölünür.
 * - Onay yalnız sürüm etiketi bump + `academy.seed.revision.approved` günlüğü basar;
 *   tohum dosyası (`lib/academy/curricula/*`) ve müfredat mührü bu yoldan yazılmaz.
 * - Gerçek müfredat değişikliği kod PR + ops seed SQL ile gelir; bu kuyruk CMS değildir.
 */

import { randomUUID } from "node:crypto";
import type { SessionUser } from "@/lib/kernel/auth/ids";
import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import { SUPER_ADMIN_FORBIDDEN, assertSuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { ConflictError, NotFoundError } from "@/lib/kernel/http/errors";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  ACADEMY_REVIEW_REVISION_TAG,
  type AcademyReviewDecision,
} from "@/archived/lib/academy-studio/moderation";
import type { AcademyReviewStars } from "@/archived/lib/academy-studio/reviews";
import { academyCurriculumRevisionApproveSchema } from "@/lib/academy/schemas";
import { ACADEMY_LESSON_CONTENT_VERSION_BASE } from "@/lib/academy/curriculum-revision-paths";

export {
  ACADEMY_CURRICULUM_REVISIONS_API,
  ACADEMY_CURRICULUM_REVISIONS_PATH,
  ACADEMY_LESSON_CONTENT_VERSION_BASE,
} from "@/lib/academy/curriculum-revision-paths";

export const REVISION_APPROVE_UNAUTHORIZED = "Oturum gerekli.";
export const REVISION_APPROVE_FORBIDDEN = SUPER_ADMIN_FORBIDDEN;
export const REVISION_APPROVE_INVALID_BODY = "Revizyon onay gövdesi geçersiz.";
export const REVISION_APPROVE_NOT_FOUND = "Revizyon talebi bulunamadı.";
export const REVISION_APPROVE_ALREADY = "Bu revizyon zaten onaylandı.";

export type AcademyCurriculumRevisionStatus = "PENDING" | "APPROVED";

export type AcademyCurriculumRevisionRecord = {
  id: string;
  reviewId: string;
  userId: string;
  courseId: string;
  courseSlug: string;
  lessonKey: string | null;
  stars: AcademyReviewStars;
  comment: string;
  tag: typeof ACADEMY_REVIEW_REVISION_TAG;
  status: AcademyCurriculumRevisionStatus;
  createdAt: Date;
  approvedAt: Date | null;
  approvedBy: string | null;
  fromVersion: string | null;
  toVersion: string | null;
};

export type AcademySeedUpdateLogEntry = {
  id: string;
  reviewId: string;
  revisionId: string;
  courseId: string;
  courseSlug: string;
  lessonKey: string | null;
  fromVersion: string;
  toVersion: string;
  tag: typeof ACADEMY_REVIEW_REVISION_TAG;
  note: string;
  approvedBy: string;
  createdAt: Date;
};

export type EnqueueAcademyCurriculumRevisionInput = {
  reviewId: string;
  userId: string;
  courseId: string;
  courseSlug: string;
  lessonKey: string | null;
  stars: AcademyReviewStars;
  comment: string;
  decision: AcademyReviewDecision;
};

const revisions = new Map<string, AcademyCurriculumRevisionRecord>();
const reviewIndex = new Map<string, string>();
const lessonVersions = new Map<string, string>();
const courseVersions = new Map<string, string>();
const seedLog: AcademySeedUpdateLogEntry[] = [];

export function parseAcademyContentVersion(value: string): { major: number; minor: number } | null {
  const match = /^v(\d+)\.(\d+)$/u.exec(value.trim());
  if (!match) {
    return null;
  }
  return { major: Number(match[1]), minor: Number(match[2]) };
}

export function formatAcademyContentVersion(major: number, minor: number): string {
  return `v${major}.${minor}`;
}

export function bumpAcademyContentVersion(current: string): string {
  const parsed = parseAcademyContentVersion(current);
  if (!parsed) {
    return formatAcademyContentVersion(1, 1);
  }
  return formatAcademyContentVersion(parsed.major, parsed.minor + 1);
}

function versionKey(lessonKey: string | null, courseId: string): { kind: "lesson" | "course"; key: string } {
  if (lessonKey) {
    return { kind: "lesson", key: lessonKey };
  }
  return { kind: "course", key: courseId };
}

export function getAcademyLessonContentVersion(lessonKey: string): string {
  return lessonVersions.get(lessonKey) ?? ACADEMY_LESSON_CONTENT_VERSION_BASE;
}

export function getAcademyCourseContentVersion(courseId: string): string {
  return courseVersions.get(courseId) ?? ACADEMY_LESSON_CONTENT_VERSION_BASE;
}

export function peekAcademyTargetContentVersion(lessonKey: string | null, courseId: string): string {
  const target = versionKey(lessonKey, courseId);
  return target.kind === "lesson"
    ? getAcademyLessonContentVersion(target.key)
    : getAcademyCourseContentVersion(target.key);
}

function writeTargetContentVersion(lessonKey: string | null, courseId: string, version: string): void {
  const target = versionKey(lessonKey, courseId);
  if (target.kind === "lesson") {
    lessonVersions.set(target.key, version);
    return;
  }
  courseVersions.set(target.key, version);
}

export function enqueueAcademyCurriculumRevision(
  input: EnqueueAcademyCurriculumRevisionInput,
): AcademyCurriculumRevisionRecord | null {
  if (input.decision !== ACADEMY_REVIEW_REVISION_TAG) {
    return null;
  }
  const existingId = reviewIndex.get(input.reviewId);
  if (existingId) {
    const row = revisions.get(existingId);
    return row ? { ...row } : null;
  }
  const now = new Date();
  const row: AcademyCurriculumRevisionRecord = {
    id: randomUUID(),
    reviewId: input.reviewId,
    userId: input.userId,
    courseId: input.courseId,
    courseSlug: input.courseSlug,
    lessonKey: input.lessonKey,
    stars: input.stars,
    comment: input.comment,
    tag: ACADEMY_REVIEW_REVISION_TAG,
    status: "PENDING",
    createdAt: now,
    approvedAt: null,
    approvedBy: null,
    fromVersion: null,
    toVersion: null,
  };
  revisions.set(row.id, row);
  reviewIndex.set(row.reviewId, row.id);
  logEvent({
    level: "info",
    event: "academy.curriculum.revision.queued",
    route: "academy.review",
    userId: input.userId,
    action: input.lessonKey ?? "course",
    reason: "in_memory_registry",
  });
  return { ...row };
}

export function listPendingAcademyCurriculumRevisions(): AcademyCurriculumRevisionRecord[] {
  return [...revisions.values()]
    .filter((row) => row.status === "PENDING")
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .map((row) => ({ ...row }));
}

export function listAcademyCurriculumRevisions(): AcademyCurriculumRevisionRecord[] {
  return [...revisions.values()]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .map((row) => ({ ...row }));
}

export function getAcademyCurriculumRevision(id: string): AcademyCurriculumRevisionRecord | null {
  const row = revisions.get(id);
  return row ? { ...row } : null;
}

export function listAcademySeedUpdateLog(): AcademySeedUpdateLogEntry[] {
  return [...seedLog]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .map((row) => ({ ...row }));
}

export function approveAcademyCurriculumRevision(input: {
  revisionId: string;
  approvedBy: string;
  now?: Date;
}): { revision: AcademyCurriculumRevisionRecord; log: AcademySeedUpdateLogEntry } {
  const found = revisions.get(input.revisionId);
  if (!found) {
    throw new NotFoundError(REVISION_APPROVE_NOT_FOUND);
  }
  if (found.status === "APPROVED") {
    throw new ConflictError(REVISION_APPROVE_ALREADY);
  }
  const now = input.now ?? new Date();
  const fromVersion = peekAcademyTargetContentVersion(found.lessonKey, found.courseId);
  const toVersion = bumpAcademyContentVersion(fromVersion);
  writeTargetContentVersion(found.lessonKey, found.courseId, toVersion);
  const next: AcademyCurriculumRevisionRecord = {
    ...found,
    status: "APPROVED",
    approvedAt: now,
    approvedBy: input.approvedBy,
    fromVersion,
    toVersion,
  };
  revisions.set(next.id, next);
  const log: AcademySeedUpdateLogEntry = {
    id: randomUUID(),
    reviewId: next.reviewId,
    revisionId: next.id,
    courseId: next.courseId,
    courseSlug: next.courseSlug,
    lessonKey: next.lessonKey,
    fromVersion,
    toVersion,
    tag: ACADEMY_REVIEW_REVISION_TAG,
    note: `${ACADEMY_REVIEW_REVISION_TAG} onaylandı; tohum sürümü ${fromVersion} → ${toVersion}.`,
    approvedBy: input.approvedBy,
    createdAt: now,
  };
  seedLog.unshift(log);
  logEvent({
    level: "info",
    event: "academy.seed.revision.approved",
    route: "academy.curriculum-revision",
    userId: input.approvedBy,
    action: `${fromVersion}->${toVersion}`,
    reason: next.lessonKey ?? "course",
    // Tohum dosyası / curriculumSeal yazılmaz; yalnız bellek sürüm etiketi + seedLog.
  });
  return { revision: { ...next }, log: { ...log } };
}

export async function runAcademyCurriculumRevisionApprove(input: {
  session: SessionUser | null;
  body: unknown;
}) {
  try {
    if (!input.session) {
      throw new AuthRequiredError(REVISION_APPROVE_UNAUTHORIZED);
    }
    assertSuperAdminActor(input.session);
    const parsed = academyCurriculumRevisionApproveSchema.safeParse(input.body);
    if (!parsed.success) {
      return jsonFail(REVISION_APPROVE_INVALID_BODY, 400);
    }
    const result = approveAcademyCurriculumRevision({
      revisionId: parsed.data.revisionId,
      approvedBy: input.session.id,
    });
    return jsonOk({
      applied: true,
      revision: {
        id: result.revision.id,
        reviewId: result.revision.reviewId,
        courseId: result.revision.courseId,
        courseSlug: result.revision.courseSlug,
        lessonKey: result.revision.lessonKey,
        tag: result.revision.tag,
        status: result.revision.status,
        fromVersion: result.revision.fromVersion,
        toVersion: result.revision.toVersion,
        approvedAt: result.revision.approvedAt?.toISOString() ?? null,
      },
      log: {
        id: result.log.id,
        fromVersion: result.log.fromVersion,
        toVersion: result.log.toVersion,
        note: result.log.note,
        createdAt: result.log.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export function resetAcademyCurriculumRevisionsForTests(): void {
  revisions.clear();
  reviewIndex.clear();
  lessonVersions.clear();
  courseVersions.clear();
  seedLog.length = 0;
}
