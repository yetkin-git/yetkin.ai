import "server-only";

import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { loadAcademyExamGateStatus } from "@/lib/academy/exam-engine";
import {
  buildUnlimitedSeedCurriculumPlayer,
  loadAcademyCurriculumPlayer,
} from "@/lib/academy/curriculum-engine";
import type { AcademyCurriculumPlayerView } from "@/lib/academy/curriculum-engine";
import { resolvePublicAcademyCertificate } from "@/lib/academy/certificate-verify";
import type { PublicAcademyCertificateResolution, PublicAcademyCertificateView } from "@/lib/academy/certificate-verify";
import {
  resolvePublicAcademyProofOfWork,
  type PublicAcademyProofView,
} from "@/lib/academy/proof-of-work-verify";
import {
  academyPathwayMasteryHashMap,
  resolvePublicAcademyPathwayMastery,
} from "@/lib/academy/level-pathway-mastery";
import {
  academyCompletedSlugsFromCertificates,
  academyPathwayNextSlug,
  academyProgressionBridgeView,
  buildAcademyPathwayCatalog,
  type AcademyPathwayMasteryView,
  type AcademyPathwayView,
  type AcademyProgressionBridgeView,
} from "@/lib/academy/level-pathway";
import { loadIdentityBoard } from "@/lib/kernel/identity/load";
import type {
  AcademyCourseRecord,
  AcademyCourseWithPrice,
  AcademyCertificateRecord,
  AcademyPurchaseRecord,
} from "@/lib/academy/types";
import type { AcademyCourseLevel } from "@/lib/academy/course-level";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import {
  overlaySeedCatalogPrice,
  publishedCoursesFromSeed,
  resolveAcademyCourseFromSeed,
} from "@/lib/academy/published-catalog";
import {
  createAcademyGrantPurchase,
  hasAcademyPlayerAccess,
  hasUnlimitedAcademyAccess,
  resolveAcademyArtifactPurchase,
  resolveSettledAcademyPurchase,
  type AcademyActor,
} from "@/lib/academy/access";
import type { AcademyContinueBoard } from "@/lib/academy/continue-board";
import type { AcademyCatalogLearnerBoard } from "@/lib/academy/catalog-learner";
import {
  loadAcademyCatalogLearnerBoard,
  loadAcademyContinueBoard,
  loadPublishedCourses,
  publishedLessonCount,
} from "@/lib/academy/load-catalog";

export type { AcademyCourseWithPrice };
export type { AcademyContinueBoard };
export type { AcademyCatalogLearnerBoard };
export {
  loadAcademyCatalogLearnerBoard,
  loadAcademyContinueBoard,
  loadPublishedCourses,
  publishedLessonCount,
};

export async function loadCourseBySlug(slug: string): Promise<{
  course: AcademyCourseWithPrice;
} | null> {
  const seeded = resolveAcademyCourseFromSeed(slug);
  if (!seeded) {
    return null;
  }
  try {
    const ports = createPrismaAcademyPorts();
    const course =
      (await ports.academy.getCourseBySlug(slug)) ??
      (await ports.academy.getCourse(seeded.id));
    if (course) {
      return { course: overlaySeedCatalogPrice(await enrichCourse(ports, course)) };
    }
  } catch {
    // Tohum vitrini DB bağlanmasa da Amiral Ders'i basar.
  }
  const priced = publishedCoursesFromSeed().find((row) => row.slug === seeded.slug);
  return priced ? { course: priced } : null;
}

export async function loadCertificatesForUser(
  userId: string,
): Promise<AcademyCertificateRecord[] | null> {
  try {
    const ports = createPrismaAcademyPorts();
    return await ports.academy.listCertificatesForUser(userId);
  } catch {
    return null;
  }
}

export async function loadPurchaseForUserCourse(
  userId: string,
  courseId: string,
  email?: string | null,
): Promise<AcademyPurchaseRecord | null> {
  const actor: AcademyActor = { userId, email };
  try {
    const ports = createPrismaAcademyPorts();
    return await resolveSettledAcademyPurchase(ports.academy, actor, courseId, {
      persistGrant: hasUnlimitedAcademyAccess(actor),
    });
  } catch {
    return hasUnlimitedAcademyAccess(actor) ? createAcademyGrantPurchase(userId, courseId) : null;
  }
}

export async function loadArtifactPurchaseForUserCourse(
  userId: string,
  courseId: string,
  email?: string | null,
): Promise<AcademyPurchaseRecord | null> {
  const actor: AcademyActor = { userId, email };
  try {
    const ports = createPrismaAcademyPorts();
    return await resolveAcademyArtifactPurchase(ports.academy, actor, courseId);
  } catch {
    return hasUnlimitedAcademyAccess(actor) ? createAcademyGrantPurchase(userId, courseId) : null;
  }
}

/** Kapı meta — oturum/timer yok; sınav yalnız kullanıcı Başla deyince açılır. */
export async function loadExamGateForUserCourse(
  userId: string,
  courseId: string,
  email?: string | null,
): Promise<{
  examTitle: string;
  passScore: number;
  certificate: AcademyCertificateRecord | null;
  durationMs: number;
} | null> {
  try {
    const ports = createPrismaAcademyPorts();
    const view = await loadAcademyExamGateStatus(ports, courseId, userId, undefined, email);
    if (!view) {
      return null;
    }
    return {
      examTitle: view.exam.title,
      passScore: view.exam.passScore,
      certificate: view.certificate,
      durationMs: view.durationMs,
    };
  } catch {
    return null;
  }
}

export async function loadCurriculumPlayerForUser(
  userId: string,
  courseId: string,
  email?: string | null,
): Promise<AcademyCurriculumPlayerView | null> {
  const actor: AcademyActor = { userId, email };
  try {
    const ports = createPrismaAcademyPorts();
    return await loadAcademyCurriculumPlayer(ports, { courseId, userId, email });
  } catch {
    if (!hasUnlimitedAcademyAccess(actor)) {
      return null;
    }
    const seeded = resolveAcademyCourseFromSeed(courseId);
    return seeded ? buildUnlimitedSeedCurriculumPlayer(seeded, userId) : null;
  }
}

/** Oynatıcı render katmanı — `loadAcademyCurriculumPlayer` + Super Admin tohum yedeği. */
export const loadAcademyCurriculum = loadCurriculumPlayerForUser;

export async function loadPublicCertificateByHash(
  rawHash: string,
): Promise<PublicAcademyCertificateResolution | null> {
  try {
    const ports = createPrismaAcademyPorts();
    return await resolvePublicAcademyCertificate(ports.academy, rawHash);
  } catch {
    return null;
  }
}

export type AcademyPublicVerifyResolution =
  | { status: "invalid-format" }
  | { status: "missing" }
  | { status: "found"; kind: "certificate"; view: PublicAcademyCertificateView }
  | { status: "found"; kind: "proof"; view: PublicAcademyProofView }
  | { status: "found"; kind: "pathway-mastery"; view: AcademyPathwayMasteryView };

export async function loadPublicAcademyVerifyByHash(
  rawHash: string,
): Promise<AcademyPublicVerifyResolution | null> {
  const proof = resolvePublicAcademyProofOfWork(rawHash);
  const pathwayMastery = resolvePublicAcademyPathwayMastery(rawHash);
  try {
    const ports = createPrismaAcademyPorts();
    const certificate = await resolvePublicAcademyCertificate(ports.academy, rawHash);
    if (certificate.status === "invalid-format") {
      return { status: "invalid-format" };
    }
    if (certificate.status === "found") {
      return { status: "found", kind: "certificate", view: certificate.view };
    }
    if (proof.status === "found") {
      return { status: "found", kind: "proof", view: proof.view };
    }
    if (pathwayMastery) {
      return { status: "found", kind: "pathway-mastery", view: pathwayMastery };
    }
    return { status: "missing" };
  } catch {
    if (proof.status === "invalid-format" && !pathwayMastery) {
      return { status: "invalid-format" };
    }
    if (proof.status === "found") {
      return { status: "found", kind: "proof", view: proof.view };
    }
    if (pathwayMastery) {
      return { status: "found", kind: "pathway-mastery", view: pathwayMastery };
    }
    return null;
  }
}

export async function loadAcademyPathwayCatalog(input: {
  courses: readonly AcademyCourseWithPrice[];
  userId?: string | null;
  highlightLevel: AcademyCourseLevel | null;
}): Promise<AcademyPathwayView[]> {
  const certificates =
    input.userId != null ? ((await loadCertificatesForUser(input.userId)) ?? []) : [];
  const completedSlugs = academyCompletedSlugsFromCertificates(certificates, input.courses);
  let ownedSlugs: Set<string> | undefined;
  if (input.userId) {
    try {
      const ports = createPrismaAcademyPorts();
      const purchases = await ports.academy.listPurchasesForUser(input.userId);
      const idToSlug = new Map(input.courses.map((course) => [course.id, course.slug]));
      ownedSlugs = new Set(
        purchases
          .map((purchase) => idToSlug.get(purchase.courseId))
          .filter((slug): slug is string => Boolean(slug)),
      );
    } catch {
      ownedSlugs = undefined;
    }
  }
  return buildAcademyPathwayCatalog({
    courses: input.courses,
    completedSlugs,
    masteryHashByPathway: academyPathwayMasteryHashMap(),
    highlightLevel: input.highlightLevel,
    ownedSlugs,
  });
}

export async function loadAcademyProgressionForCourse(input: {
  userId: string | null;
  email?: string | null;
  currentSlug: string;
  courses?: readonly { id: string; slug: string }[];
}): Promise<{
  bridge: AcademyProgressionBridgeView;
  mastery: AcademyPathwayMasteryView | null;
}> {
  const courses = input.courses ?? (await loadPublishedCourses());
  const nextSlug = academyPathwayNextSlug(input.currentSlug);
  let nextOwned = false;
  if (input.userId && nextSlug) {
    const next =
      courses.find((course) => course.slug === nextSlug) ??
      (await loadCourseBySlug(nextSlug))?.course ??
      null;
    if (next) {
      const purchase = await loadPurchaseForUserCourse(input.userId, next.id, input.email);
      nextOwned = hasAcademyPlayerAccess(purchase, {
        userId: input.userId,
        email: input.email,
      });
    }
  }
  const certificates =
    input.userId != null ? ((await loadCertificatesForUser(input.userId)) ?? []) : [];
  const completedSlugs = academyCompletedSlugsFromCertificates(certificates, courses);
  const bridge = academyProgressionBridgeView({
    currentSlug: input.currentSlug,
    completedSlugs,
    nextOwned,
  });
  if (!bridge.mastered || !bridge.pathwayId) {
    return { bridge, mastery: null };
  }
  const masteryHash = academyPathwayMasteryHashMap()[bridge.pathwayId] ?? null;
  const mastery = masteryHash ? resolvePublicAcademyPathwayMastery(masteryHash) : null;
  return { bridge, mastery };
}

export async function loadAcademyHolderName(userId: string): Promise<string> {
  const board = await loadIdentityBoard(userId);
  const name = board?.user?.displayName?.trim();
  return name && name.length > 0 ? name : "Aday";
}

async function enrichCourse(
  ports: ReturnType<typeof createPrismaAcademyPorts>,
  course: AcademyCourseRecord,
): Promise<AcademyCourseWithPrice> {
  try {
    const entry = await ports.catalog.findActiveEntry(ACADEMY_MODULE_KEY, course.catalogUnitKey);
    return overlaySeedCatalogPrice({
      ...course,
      priceMinor: entry?.amountMinor ?? null,
      currencyCode: entry?.currencyCode ?? SETTLEMENT_CURRENCY,
      purchasable: Boolean(entry) && course.isPublished,
    });
  } catch {
    return overlaySeedCatalogPrice({
      ...course,
      priceMinor: null,
      currencyCode: SETTLEMENT_CURRENCY,
      purchasable: false,
    });
  }
}
