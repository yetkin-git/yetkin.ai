import "server-only";

import { ForbiddenError, NotFoundError } from "@/lib/kernel/http/errors";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import {
  canonicalAcademyProofOfWorkHash,
  getAcademyProofOfWork,
} from "@/lib/academy/proof-of-work";
import {
  academyCurriculumSealForSlug,
  academyLessonByKey,
  curriculumForCourseSlug,
  isAcademyCurriculumComplete,
} from "@/lib/academy/curriculum";
import {
  hasAcademyArtifactAccess,
  hasUnlimitedAcademyAccess,
  resolveAcademyArtifactPurchase,
  type AcademyActor,
} from "@/lib/academy/access";
import { resolveAcademyCourseFromSeed } from "@/lib/academy/published-catalog";
import { buildAcademyLessonNote } from "@/archived/lib/academy-studio/lesson-note";
import { renderAcademyLessonNotesPdf } from "@/archived/lib/academy-studio/lesson-note-pdf";
import {
  academyCurriculumPdfFilename,
  academyLessonPdfFilename,
} from "@/lib/academy/lesson-note-paths";
import { canonicalAcademyCurriculumProofHash } from "@/lib/academy/proof-of-work-verify";
import type { AcademyStore } from "@/lib/academy/types";

export type AcademyLessonNotePorts = {
  academy: AcademyStore;
};

function actorOf(command: { userId: string; email?: string | null }): AcademyActor {
  return { userId: command.userId, email: command.email };
}

function proofHashForLesson(purchaseId: string, lessonKey: string): string | null {
  return getAcademyProofOfWork(purchaseId, lessonKey)?.hash ?? canonicalAcademyProofOfWorkHash(lessonKey, sha256Hex);
}

export async function loadAcademyLessonNotePdf(
  ports: AcademyLessonNotePorts,
  command: {
    courseId: string;
    userId: string;
    email?: string | null;
    lessonKey?: string | null;
  },
): Promise<{ bytes: Uint8Array; filename: string }> {
  const actor = actorOf(command);
  const course =
    (await ports.academy.getCourse(command.courseId)) ??
    (await ports.academy.getCourseBySlug(command.courseId)) ??
    resolveAcademyCourseFromSeed(command.courseId);
  if (!course) {
    throw new NotFoundError("Kurs bulunamadı.");
  }
  const purchase = await resolveAcademyArtifactPurchase(ports.academy, actor, course.id);
  if (!hasAcademyArtifactAccess(purchase, actor) || !purchase || purchase.status !== "SETTLED") {
    throw new ForbiddenError("Ders notu satın alma kaydı ister.");
  }
  const unlimited = hasUnlimitedAcademyAccess(actor);
  const completions = await ports.academy.listLessonCompletionsByPurchase(purchase.id);
  const done = new Set(completions.map((row) => row.lessonKey));
  const seal = academyCurriculumSealForSlug(course.slug);
  const lessons = curriculumForCourseSlug(course.slug);

  if (command.lessonKey) {
    if (!academyLessonByKey(course.slug, command.lessonKey)) {
      throw new ForbiddenError("Ders müfredatta yok.");
    }
    // Vatandaş: tamamlanmadan not yok. Super Admin lab: sınav kapısı gibi bypass.
    if (!unlimited && !done.has(command.lessonKey)) {
      throw new ForbiddenError("Ders tamamlanmadan not basılmaz.");
    }
    const hash = proofHashForLesson(purchase.id, command.lessonKey);
    if (!hash) {
      throw new ForbiddenError("İş kanıtı özeti yok.");
    }
    const note = buildAcademyLessonNote({
      courseSlug: course.slug,
      courseTitle: course.title,
      lessonKey: command.lessonKey,
      proofOfWorkHash: hash,
      curriculumSeal: seal,
    });
    if (!note) {
      throw new ForbiddenError("Ders notu tohumu yok.");
    }
    return {
      bytes: renderAcademyLessonNotesPdf([note]),
      filename: academyLessonPdfFilename(command.lessonKey),
    };
  }

  if (!unlimited && !isAcademyCurriculumComplete(course.slug, [...done])) {
    throw new ForbiddenError("Müfredat tamamlanmadan toplu not basılmaz.");
  }
  const notes = lessons.map((lesson) => {
    const hash = proofHashForLesson(purchase.id, lesson.key);
    if (!hash) {
      throw new ForbiddenError("İş kanıtı özeti yok.");
    }
    const note = buildAcademyLessonNote({
      courseSlug: course.slug,
      courseTitle: course.title,
      lessonKey: lesson.key,
      proofOfWorkHash: hash,
      curriculumSeal: seal,
    });
    if (!note) {
      throw new ForbiddenError("Ders notu tohumu yok.");
    }
    return note;
  });
  return {
    bytes: renderAcademyLessonNotesPdf(notes, {
      curriculumProofHash: canonicalAcademyCurriculumProofHash(course.slug),
    }),
    filename: academyCurriculumPdfFilename(course.slug),
  };
}
