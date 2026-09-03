import { randomUUID } from "node:crypto";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { AuthRequiredError, sessionUserNotInDatabaseMessage } from "@/lib/kernel/auth/require-session";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import {
  academyLessonByKey,
  academyCurriculumSealForSlug,
  curriculumForCourseSlug,
  isAcademyCurriculumComplete,
  nextAcademyLessonKey,
  type AcademyLessonSeed,
} from "@/lib/academy/curriculum";
import { ACADEMY_LESSON_CONTENT_VERSION_BASE } from "@/lib/academy/curriculum-revision-paths";
import {
  academyCanonicalProofSubmission,
  academyCurriculumProofCanonicalJson,
  academyLessonProofHashList,
  academyProofOfWorkCanonicalJson,
  academyProofOfWorkHash,
  attachAcademyProofOfWorkHash,
  bindAcademyProofOfWork,
  canonicalAcademyProofOfWorkHash,
  evaluateAcademyProofSubmission,
  isAcademyWorkTasksComplete,
  type AcademyProofSubmission,
} from "@/lib/academy/proof-of-work";
import {
  createAcademyGrantPurchase,
  hasUnlimitedAcademyAccess,
  resolveSettledAcademyPurchase,
  type AcademyActor,
} from "@/lib/academy/access";
import { resolveAcademyCourseFromSeed } from "@/lib/academy/published-catalog";
import type {
  AcademyCertificateRecord,
  AcademyCourseRecord,
  AcademyLessonCompletionRecord,
  AcademyPurchaseRecord,
  AcademyStore,
} from "@/lib/academy/types";
import { isPrismaForeignKeyViolation, isPrismaUniqueViolation } from "@/lib/kernel/db-errors";

export type AcademyCurriculumPorts = {
  academy: AcademyStore;
};

export type AcademyCurriculumLessonView = AcademyLessonSeed & {
  completed: boolean;
  open: boolean;
  contentVersion: string;
  proofOfWorkHash: string | null;
  completedAt: Date | null;
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
  workTasksComplete: boolean;
  curriculumProofHash: string | null;
  nextLessonKey: string | null;
  certificate: AcademyCertificateRecord | null;
};

function toCurriculumLessonView(
  lesson: AcademyLessonSeed,
  extra: {
    completed: boolean;
    open: boolean;
    proofOfWorkHash?: string | null;
    completedAt?: Date | null;
  },
): AcademyCurriculumLessonView {
  return {
    ...lesson,
    completed: extra.completed,
    open: extra.open,
    proofOfWorkHash: extra.proofOfWorkHash ?? null,
    completedAt: extra.completedAt ?? null,
    contentVersion: ACADEMY_LESSON_CONTENT_VERSION_BASE,
  };
}

function actorOf(command: { userId: string; email?: string | null }): AcademyActor {
  return { userId: command.userId, email: command.email };
}

/** Prisma yokken Super Admin oynatıcı gövdesi — sıra kilidi açık, ilerleme yok. */
export function buildUnlimitedSeedCurriculumPlayer(
  course: Pick<AcademyCourseRecord, "id" | "slug" | "title">,
  userId: string,
): AcademyCurriculumPlayerView {
  const lessons = curriculumForCourseSlug(course.slug);
  const purchase = createAcademyGrantPurchase(userId, course.id);
  return {
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    purchaseId: purchase.id,
    lessons: lessons.map((lesson) =>
      toCurriculumLessonView(lesson, {
        completed: false,
        open: true,
      }),
    ),
    completedCount: 0,
    totalCount: lessons.length,
    curriculumComplete: false,
    workTasksComplete: false,
    curriculumProofHash: null,
    nextLessonKey: nextAcademyLessonKey(course.slug, []),
    certificate: null,
  };
}

async function resolveLiveAcademyCourse(
  store: AcademyStore,
  idOrSlug: string,
): Promise<AcademyCourseRecord | null> {
  const byId = await store.getCourse(idOrSlug);
  if (byId) {
    return byId;
  }
  const bySlug = await store.getCourseBySlug(idOrSlug);
  if (bySlug) {
    return bySlug;
  }
  const seed = resolveAcademyCourseFromSeed(idOrSlug);
  if (!seed) {
    return null;
  }
  if (seed.id !== idOrSlug) {
    const bySeedId = await store.getCourse(seed.id);
    if (bySeedId) {
      return bySeedId;
    }
  }
  return store.getCourseBySlug(seed.slug);
}

async function persistSeedAcademyCourse(
  store: AcademyStore,
  seed: AcademyCourseRecord,
): Promise<AcademyCourseRecord> {
  try {
    return await store.insertCourse(seed);
  } catch (error) {
    const existing = (await store.getCourse(seed.id)) ?? (await store.getCourseBySlug(seed.slug));
    if (existing) {
      return existing;
    }
    throw error;
  }
}

/** Oynatıcı / müfredat API — tohum id, canlı slug veya DB satırı. */
export async function lookupAcademyCurriculumCourse(
  store: AcademyStore,
  idOrSlug: string,
): Promise<AcademyCourseRecord | null> {
  return (await resolveLiveAcademyCourse(store, idOrSlug)) ?? resolveAcademyCourseFromSeed(idOrSlug);
}

async function requireCourse(
  store: AcademyStore,
  courseId: string,
): Promise<AcademyCourseRecord> {
  const course = await lookupAcademyCurriculumCourse(store, courseId);
  if (!course) {
    throw new ForbiddenError("Kurs bulunamadı.");
  }
  return course;
}

/** Bağış / tamamlama yazımı — slug-id çakışmasında canlı satır; yoksa tohumu basar. */
async function requireWritableCourse(
  store: AcademyStore,
  courseId: string,
): Promise<AcademyCourseRecord> {
  const live = await resolveLiveAcademyCourse(store, courseId);
  if (live) {
    return live;
  }
  const seed = resolveAcademyCourseFromSeed(courseId);
  if (!seed) {
    throw new ForbiddenError("Kurs bulunamadı.");
  }
  return persistSeedAcademyCourse(store, seed);
}

async function requireSettledPurchase(
  store: AcademyStore,
  actor: AcademyActor,
  courseId: string,
  persistGrant = false,
): Promise<AcademyPurchaseRecord> {
  const purchase = await resolveSettledAcademyPurchase(store, actor, courseId, { persistGrant });
  if (!purchase || purchase.status !== "SETTLED") {
    throw new ForbiddenError("Satın alma mühürlenmeden ders içeriği açılmaz.");
  }
  return purchase;
}

export async function loadAcademyCurriculumPlayer(
  ports: AcademyCurriculumPorts,
  command: { courseId: string; userId: string; email?: string | null },
): Promise<AcademyCurriculumPlayerView> {
  const actor = actorOf(command);
  const unlimited = hasUnlimitedAcademyAccess(actor);
  const course = unlimited
    ? await requireWritableCourse(ports.academy, command.courseId)
    : await requireCourse(ports.academy, command.courseId);
  const lessons = curriculumForCourseSlug(course.slug);
  if (lessons.length === 0) {
    throw new ForbiddenError("Müfredat tohumu yok.");
  }
  const purchase = await requireSettledPurchase(
    ports.academy,
    actor,
    course.id,
    unlimited,
  );
  const completions = (
    await ports.academy.listLessonCompletionsByPurchase(purchase.id)
  ).map(attachAcademyProofOfWorkHash);
  const completedKeys = completions.map((row) => row.lessonKey);
  const done = new Set(completedKeys);
  const byKey = new Map(completions.map((row) => [row.lessonKey, row]));
  const nextKey = nextAcademyLessonKey(course.slug, completedKeys);
  const certificate = await ports.academy.getCertificateByUserAndCourse(
    command.userId,
    course.id,
  );
  const curriculumComplete = isAcademyCurriculumComplete(course.slug, completedKeys);
  const workTasksComplete =
    curriculumComplete &&
    isAcademyWorkTasksComplete(
      lessons.map((lesson) => lesson.key),
      completions,
    );
  const lessonKeys = lessons.map((lesson) => lesson.key);
  const lessonHashes = academyLessonProofHashList(lessonKeys, sha256Hex);
  const seal = academyCurriculumSealForSlug(course.slug);
  const curriculumProofHash =
    workTasksComplete && lessonHashes && seal
      ? academyProofOfWorkHash(
          academyCurriculumProofCanonicalJson({
            slug: course.slug,
            lessonHashes,
            curriculumSeal: seal,
          }),
          sha256Hex,
        )
      : null;
  return {
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    purchaseId: purchase.id,
    lessons: lessons.map((lesson) => {
      const row = byKey.get(lesson.key);
      const completed = done.has(lesson.key);
      return toCurriculumLessonView(lesson, {
        completed,
        open: unlimited || lesson.key === nextKey || completed,
        proofOfWorkHash: completed
          ? (row && "proofOfWorkHash" in row ? row.proofOfWorkHash : null) ??
            canonicalAcademyProofOfWorkHash(lesson.key, sha256Hex)
          : null,
        completedAt: row?.completedAt ?? null,
      });
    }),
    completedCount: lessons.filter((lesson) => done.has(lesson.key)).length,
    totalCount: lessons.length,
    curriculumComplete,
    workTasksComplete,
    curriculumProofHash,
    nextLessonKey: nextKey,
    certificate,
  };
}

function sealLessonProof(
  purchaseId: string,
  lessonKey: string,
  proof: AcademyProofSubmission | undefined,
): string {
  const submitted = proof ?? academyCanonicalProofSubmission(lessonKey) ?? undefined;
  if (!submitted) {
    throw new ForbiddenError("İş kanıtı olmadan ders kapanmaz.");
  }
  const judged = evaluateAcademyProofSubmission(lessonKey, submitted);
  if (!judged.ok) {
    throw new ForbiddenError("İş kanıtı doğrulanmadı.");
  }
  const hash = academyProofOfWorkHash(
    academyProofOfWorkCanonicalJson({ lessonKey, success: judged.success }),
    sha256Hex,
  );
  bindAcademyProofOfWork({
    purchaseId,
    lessonKey,
    hash,
    success: judged.success,
  });
  return hash;
}

export async function completeAcademyLesson(
  ports: AcademyCurriculumPorts,
  command: {
    courseId: string;
    userId: string;
    lessonKey: string;
    email?: string | null;
    now?: Date;
    proof?: AcademyProofSubmission;
  },
): Promise<{ applied: boolean; completion: AcademyLessonCompletionRecord; player: AcademyCurriculumPlayerView }> {
  const actor = actorOf(command);
  const unlimited = hasUnlimitedAcademyAccess(actor);
  const course = await requireWritableCourse(ports.academy, command.courseId);
  const lesson = academyLessonByKey(course.slug, command.lessonKey);
  if (!lesson) {
    throw new ForbiddenError("Ders müfredatta yok.");
  }
  const purchase = await requireSettledPurchase(ports.academy, actor, course.id, true);
  const existingRaw = await ports.academy.getLessonCompletion(purchase.id, lesson.key);
  const existing = existingRaw ? attachAcademyProofOfWorkHash(existingRaw) : null;
  if (existing?.proofOfWorkHash) {
    return {
      applied: false,
      completion: existing,
      player: await loadAcademyCurriculumPlayer(ports, { ...command, courseId: course.id }),
    };
  }
  if (!existing) {
    const completions = await ports.academy.listLessonCompletionsByPurchase(purchase.id);
    const nextKey = nextAcademyLessonKey(
      course.slug,
      completions.map((row) => row.lessonKey),
    );
    if (!unlimited && nextKey !== lesson.key) {
      throw new ForbiddenError("Sıradaki ders açık. Atlanan ders tamamlanmaz.");
    }
  }
  const hash = sealLessonProof(purchase.id, lesson.key, command.proof);
  const now = command.now ?? new Date();
  let completion: AcademyLessonCompletionRecord;
  try {
    completion = await ports.academy.insertLessonCompletion({
      id: existing?.id ?? randomUUID(),
      userId: command.userId,
      courseId: course.id,
      purchaseId: purchase.id,
      lessonKey: lesson.key,
      proofOfWorkHash: hash,
      completedAt: existing?.completedAt ?? now,
      createdAt: existing?.createdAt ?? now,
    });
  } catch (error) {
    if (isPrismaForeignKeyViolation(error)) {
      throw new AuthRequiredError(sessionUserNotInDatabaseMessage());
    }
    const raced = await ports.academy.getLessonCompletion(purchase.id, lesson.key);
    if (raced && (isPrismaUniqueViolation(error) || raced.lessonKey === lesson.key)) {
      return {
        applied: false,
        completion: attachAcademyProofOfWorkHash(raced),
        player: await loadAcademyCurriculumPlayer(ports, { ...command, courseId: course.id }),
      };
    }
    throw error;
  }
  return {
    applied: true,
    completion: attachAcademyProofOfWorkHash(completion),
    player: await loadAcademyCurriculumPlayer(ports, { ...command, courseId: course.id }),
  };
}

export async function completeAcademyCurriculum(
  ports: AcademyCurriculumPorts,
  command: { courseId: string; userId: string; email?: string | null; now?: Date },
): Promise<AcademyCurriculumPlayerView> {
  let player = await loadAcademyCurriculumPlayer(ports, command);
  while (player.nextLessonKey) {
    const proof = academyCanonicalProofSubmission(player.nextLessonKey);
    if (!proof) {
      throw new ForbiddenError("İş kanıtı tohumu yok.");
    }
    const result = await completeAcademyLesson(ports, {
      courseId: command.courseId,
      userId: command.userId,
      email: command.email,
      lessonKey: player.nextLessonKey,
      now: command.now,
      proof,
    });
    player = result.player;
  }
  return player;
}

export async function assertAcademyCurriculumComplete(
  ports: AcademyCurriculumPorts,
  command: { courseId: string; userId: string; courseSlug: string; email?: string | null },
): Promise<void> {
  const actor = actorOf(command);
  if (hasUnlimitedAcademyAccess(actor)) {
    return;
  }
  const purchase = await requireSettledPurchase(ports.academy, actor, command.courseId);
  const completions = (
    await ports.academy.listLessonCompletionsByPurchase(purchase.id)
  ).map(attachAcademyProofOfWorkHash);
  if (
    !isAcademyCurriculumComplete(
      command.courseSlug,
      completions.map((row) => row.lessonKey),
    )
  ) {
    throw new ForbiddenError("Sınav kapısı müfredat tamamlanınca açılır.");
  }
  if (
    !isAcademyWorkTasksComplete(
      curriculumForCourseSlug(command.courseSlug).map((lesson) => lesson.key),
      completions,
    )
  ) {
    throw new ForbiddenError("Bölüm iş görevleri tamamlanmadan sınav kapısı kapalı.");
  }
}
