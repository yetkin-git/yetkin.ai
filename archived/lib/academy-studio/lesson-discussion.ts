/**
 * Ders tartışması — herkese açık okuma, kayıtlı yazma.
 * Sicil süreç belleğidir (mühürlü değerlendirme ile aynı kalıp).
 * Client-safe: Prisma yok.
 */

import { randomUUID } from "node:crypto";

export const ACADEMY_DISCUSSION_BODY_MAX = 800;
export const ACADEMY_DISCUSSION_LIST_MAX = 40;
export const ACADEMY_DISCUSSION_AUTHOR_LABEL = "Katılımcı";

export type AcademyLessonCommentRecord = {
  id: string;
  courseId: string;
  lessonKey: string;
  userId: string;
  body: string;
  createdAt: Date;
};

export type AcademyDiscussionPublicItem = {
  id: string;
  kind: "review" | "comment";
  stars: number | null;
  body: string;
  authorLabel: string;
  createdAt: string;
  reply: string | null;
};

const comments = new Map<string, AcademyLessonCommentRecord>();

function commentKey(courseId: string, lessonKey: string, id: string): string {
  return `${courseId}:${lessonKey}:${id}`;
}

export function insertAcademyLessonComment(
  input: Omit<AcademyLessonCommentRecord, "id" | "createdAt"> & {
    id?: string;
    createdAt?: Date;
  },
): AcademyLessonCommentRecord {
  const row: AcademyLessonCommentRecord = {
    id: input.id ?? randomUUID(),
    courseId: input.courseId,
    lessonKey: input.lessonKey,
    userId: input.userId,
    body: input.body.replace(/\s+/gu, " ").trim(),
    createdAt: input.createdAt ?? new Date(),
  };
  comments.set(commentKey(row.courseId, row.lessonKey, row.id), row);
  return { ...row };
}

export function listAcademyLessonComments(courseId: string, lessonKey: string): AcademyLessonCommentRecord[] {
  return [...comments.values()]
    .filter((row) => row.courseId === courseId && row.lessonKey === lessonKey)
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, ACADEMY_DISCUSSION_LIST_MAX)
    .map((row) => ({ ...row }));
}

export function toPublicAcademyDiscussionComment(row: AcademyLessonCommentRecord): AcademyDiscussionPublicItem {
  return {
    id: row.id,
    kind: "comment",
    stars: null,
    body: row.body,
    authorLabel: ACADEMY_DISCUSSION_AUTHOR_LABEL,
    createdAt: row.createdAt.toISOString(),
    reply: null,
  };
}

export function toPublicAcademyDiscussionReview(input: {
  id: string;
  stars: number;
  comment: string;
  createdAt: Date;
  moderatorReply?: string | null;
}): AcademyDiscussionPublicItem {
  return {
    id: input.id,
    kind: "review",
    stars: input.stars,
    body: input.comment,
    authorLabel: ACADEMY_DISCUSSION_AUTHOR_LABEL,
    createdAt: input.createdAt.toISOString(),
    reply: input.moderatorReply?.trim() ? input.moderatorReply : null,
  };
}

export function resetAcademyLessonDiscussionForTests(): void {
  comments.clear();
}
