import "server-only";

import { BadRequestError, ForbiddenError } from "@/lib/kernel/http/errors";
import { logEvent } from "@/lib/kernel/observability/log";
import { academyModeratorPolicyMessage, isAcademyCitizenTextClean } from "@/archived/lib/academy-studio/moderation";
import {
  insertAcademyLessonComment,
  toPublicAcademyDiscussionComment,
  type AcademyDiscussionPublicItem,
  type AcademyLessonCommentRecord,
} from "@/archived/lib/academy-studio/lesson-discussion";
import { hasAcademyPlayerAccess, resolveSettledAcademyPurchase, type AcademyActor } from "@/lib/academy/access";
import type { AcademyStore } from "@/lib/academy/types";

export type AcademyDiscussionPorts = {
  academy: AcademyStore;
};

export type SubmitAcademyLessonCommentCommand = {
  userId: string;
  email?: string | null;
  courseId: string;
  lessonKey: string;
  body: string;
};

export async function assertAcademyDiscussionWriteAccess(
  ports: AcademyDiscussionPorts,
  command: Pick<SubmitAcademyLessonCommentCommand, "userId" | "email" | "courseId">,
): Promise<void> {
  const actor: AcademyActor = { userId: command.userId, email: command.email };
  const course =
    (await ports.academy.getCourse(command.courseId)) ??
    (await ports.academy.getCourseBySlug(command.courseId));
  if (!course) {
    throw new ForbiddenError("Kurs bulunamadı.");
  }
  const purchase = await resolveSettledAcademyPurchase(ports.academy, actor, course.id);
  if (!hasAcademyPlayerAccess(purchase, actor)) {
    throw new ForbiddenError("Kaydolmadan yorum yazılmaz.");
  }
}

export async function submitAcademyLessonComment(
  ports: AcademyDiscussionPorts,
  command: SubmitAcademyLessonCommentCommand,
): Promise<{ comment: AcademyLessonCommentRecord; item: AcademyDiscussionPublicItem }> {
  await assertAcademyDiscussionWriteAccess(ports, command);
  const trimmed = command.body.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    throw new BadRequestError("Yorum boş olamaz.");
  }
  if (!isAcademyCitizenTextClean(trimmed)) {
    logEvent({
      level: "warn",
      event: "academy.moderation.rejected",
      action: "question",
      reason: "policy-violation",
      route: "academy.discussion",
      userId: command.userId,
    });
    throw new BadRequestError(academyModeratorPolicyMessage("question"));
  }
  const comment = insertAcademyLessonComment({
    courseId: command.courseId,
    lessonKey: command.lessonKey,
    userId: command.userId,
    body: trimmed,
  });
  return { comment, item: toPublicAcademyDiscussionComment(comment) };
}
