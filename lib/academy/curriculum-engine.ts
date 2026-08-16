import { randomUUID } from "node:crypto";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import {
  academyLessonByKey,
  curriculumForCourseSlug,
  isAcademyCurriculumComplete,
  nextAcademyLessonKey,
  type AcademyLessonSeed,
} from "@/lib/academy/curriculum";
import type {
  AcademyCertificateRecord,
  AcademyLessonCompletionRecord,
  AcademyPurchaseRecord,
  AcademyStore,
} from "@/lib/academy/types";

export type AcademyCurriculumPorts = {
  academy: AcademyStore;
};

export type AcademyCurriculumLessonView = AcademyLessonSeed & {
  completed: boolean;
  open: boolean;
};

export type AcademyCurriculumPlayerView = {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  purchaseId: string;
  lessons: AcademyCurriculumLessonView[];
  completedCount: number;
  totalCount: number;
  curriculumComplete: boolean;
  nextLessonKey: string | null;
  certificate: AcademyCertificateRecord | null;
};

function requireSettledPurchase(
  purchase: AcademyPurchaseRecord | null,
): AcademyPurchaseRecord {
  if (!purchase || purchase.status !== "SETTLED") {
    throw new ForbiddenError("Satın alma mühürlenmeden ders içeriği açılmaz.");
  }
  return purchase;
}

export async function loadAcademyCurriculumPlayer(
  ports: AcademyCurriculumPorts,
  command: { courseId: string; userId: string },
): Promise<AcademyCurriculumPlayerView> {
  const course = await ports.academy.getCourse(command.courseId);
  if (!course) {
    throw new ForbiddenError("Kurs bulunamadı.");
  }
  const lessons = curriculumForCourseSlug(course.slug);
  if (lessons.length === 0) {
    throw new ForbiddenError("Müfredat tohumu yok.");
  }
  const purchase = requireSettledPurchase(
    await ports.academy.getPurchaseByUserAndCourse(command.userId, course.id),
  );
  const completions = await ports.academy.listLessonCompletionsByPurchase(purchase.id);
  const completedKeys = completions.map((row) => row.lessonKey);
  const done = new Set(completedKeys);
  const nextKey = nextAcademyLessonKey(course.slug, completedKeys);
  const certificate = await ports.academy.getCertificateByUserAndCourse(
    command.userId,
    course.id,
  );
  return {
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    purchaseId: purchase.id,
    lessons: lessons.map((lesson) => ({
      ...lesson,
      completed: done.has(lesson.key),
      open: lesson.key === nextKey || done.has(lesson.key),
    })),
    completedCount: lessons.filter((lesson) => done.has(lesson.key)).length,
    totalCount: lessons.length,
    curriculumComplete: isAcademyCurriculumComplete(course.slug, completedKeys),
    nextLessonKey: nextKey,
    certificate,
  };
}

export async function completeAcademyLesson(
  ports: AcademyCurriculumPorts,
  command: { courseId: string; userId: string; lessonKey: string; now?: Date },
): Promise<{ applied: boolean; completion: AcademyLessonCompletionRecord; player: AcademyCurriculumPlayerView }> {
  const course = await ports.academy.getCourse(command.courseId);
  if (!course) {
    throw new ForbiddenError("Kurs bulunamadı.");
  }
  const lesson = academyLessonByKey(course.slug, command.lessonKey);
  if (!lesson) {
    throw new ForbiddenError("Ders müfredatta yok.");
  }
  const purchase = requireSettledPurchase(
    await ports.academy.getPurchaseByUserAndCourse(command.userId, course.id),
  );
  const existing = await ports.academy.getLessonCompletion(purchase.id, lesson.key);
  if (existing) {
    return {
      applied: false,
      completion: existing,
      player: await loadAcademyCurriculumPlayer(ports, command),
    };
  }
  const completions = await ports.academy.listLessonCompletionsByPurchase(purchase.id);
  const nextKey = nextAcademyLessonKey(
    course.slug,
    completions.map((row) => row.lessonKey),
  );
  if (nextKey !== lesson.key) {
    throw new ForbiddenError("Sıradaki ders açık. Atlanan ders tamamlanmaz.");
  }
  const now = command.now ?? new Date();
  const completion = await ports.academy.insertLessonCompletion({
    id: randomUUID(),
    userId: command.userId,
    courseId: course.id,
    purchaseId: purchase.id,
    lessonKey: lesson.key,
    completedAt: now,
    createdAt: now,
  });
  return {
    applied: true,
    completion,
    player: await loadAcademyCurriculumPlayer(ports, command),
  };
}

export async function completeAcademyCurriculum(
  ports: AcademyCurriculumPorts,
  command: { courseId: string; userId: string; now?: Date },
): Promise<AcademyCurriculumPlayerView> {
  let player = await loadAcademyCurriculumPlayer(ports, command);
  while (player.nextLessonKey) {
    const result = await completeAcademyLesson(ports, {
      courseId: command.courseId,
      userId: command.userId,
      lessonKey: player.nextLessonKey,
      now: command.now,
    });
    player = result.player;
  }
  return player;
}

export async function assertAcademyCurriculumComplete(
  ports: AcademyCurriculumPorts,
  command: { courseId: string; userId: string; courseSlug: string },
): Promise<void> {
  const purchase = requireSettledPurchase(
    await ports.academy.getPurchaseByUserAndCourse(command.userId, command.courseId),
  );
  const completions = await ports.academy.listLessonCompletionsByPurchase(purchase.id);
  if (
    !isAcademyCurriculumComplete(
      command.courseSlug,
      completions.map((row) => row.lessonKey),
    )
  ) {
    throw new ForbiddenError("Sınav kapısı müfredat tamamlanınca açılır.");
  }
}
