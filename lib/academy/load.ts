import "server-only";

import { cache } from "react";
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
import {
  ensurePrismaQueryEngine,
  isPrismaQueryEngineReady,
  withDbReadTimeout,
} from "@/lib/kernel/db";
import { loadWalletBoard } from "@/lib/kernel/ledger/load";
import { loadIdentityBoard } from "@/lib/kernel/identity/load";
import type {
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
  createAcademyAdminBypassPurchase,
  hasAcademyAdminBypass,
  hasAcademyPlayerAccess,
  resolveAcademyArtifactPurchase,
  resolveSettledAcademyPurchase,
  type AcademyActor,
} from "@/lib/academy/access";
import type { AcademyContinueBoard } from "@/lib/academy/continue-board";
import type { AcademyCatalogLearnerBoard } from "@/lib/academy/catalog-learner";
import {
  ACADEMY_CATALOG_READ_TIMEOUT_MS,
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

const ACADEMY_COURSE_OVERLAY_TIMEOUT_MS = 250;

function academySeedBoard(slug: string): { course: AcademyCourseWithPrice } | null {
  const priced = publishedCoursesFromSeed().find((row) => row.slug === slug);
  return priced ? { course: priced } : null;
}

async function academySsrRead<T>(work: () => Promise<T>, label: string): Promise<T> {
  const engineReady = await ensurePrismaQueryEngine();
  if (!engineReady) {
    throw new Error(`db_read_timeout:${label}:warmup_pending`);
  }
  return withDbReadTimeout(work(), ACADEMY_CATALOG_READ_TIMEOUT_MS, label);
}

export const loadCourseBySlug = cache(async function loadCourseBySlug(slug: string): Promise<{
  course: AcademyCourseWithPrice;
} | null> {
  const seeded = resolveAcademyCourseFromSeed(slug);
  if (!seeded) {
    return null;
  }
  const fallback = academySeedBoard(seeded.slug);
  if (!fallback) {
    return null;
  }
  const engineReady = await ensurePrismaQueryEngine();
  if (!engineReady) {
    return fallback;
  }
  try {
    const ports = createPrismaAcademyPorts();
    const [bySlug, byId, entry] = await withDbReadTimeout(
      Promise.all([
        ports.academy.getCourseBySlug(slug),
        ports.academy.getCourse(seeded.id),
        ports.catalog.findActiveEntry(ACADEMY_MODULE_KEY, seeded.catalogUnitKey),
      ]),
      ACADEMY_COURSE_OVERLAY_TIMEOUT_MS,
      "academy.course",
    );
    const course = bySlug ?? byId;
    if (course) {
      return {
        course: overlaySeedCatalogPrice({
          ...course,
          priceMinor: entry?.amountMinor ?? null,
          currencyCode: entry?.currencyCode ?? SETTLEMENT_CURRENCY,
          purchasable: Boolean(entry) && course.isPublished,
        }),
      };
    }
  } catch {
    // Tohum vitrini DB bağlanmasa da Amiral Ders'i basar.
  }
  return fallback;
});

export const loadCertificatesForUser = cache(async function loadCertificatesForUser(
  userId: string,
): Promise<AcademyCertificateRecord[] | null> {
  try {
    const ports = createPrismaAcademyPorts();
    return await academySsrRead(
      () => ports.academy.listCertificatesForUser(userId),
      "academy.certificates",
    );
  } catch {
    return null;
  }
});

export const loadPurchaseForUserCourse = cache(async function loadPurchaseForUserCourse(
  userId: string,
  courseId: string,
  email?: string | null,
): Promise<AcademyPurchaseRecord | null> {
  const actor: AcademyActor = { userId, email };
  if (hasAcademyAdminBypass(actor) && !isPrismaQueryEngineReady()) {
    void ensurePrismaQueryEngine();
    return createAcademyAdminBypassPurchase(userId, courseId);
  }
  try {
    const ports = createPrismaAcademyPorts();
    return await academySsrRead(
      () =>
        resolveSettledAcademyPurchase(ports.academy, actor, courseId, {
          persistGrant: false,
        }),
      "academy.purchase",
    );
  } catch {
    return hasAcademyAdminBypass(actor) ? createAcademyAdminBypassPurchase(userId, courseId) : null;
  }
});

export const loadArtifactPurchaseForUserCourse = cache(async function loadArtifactPurchaseForUserCourse(
  userId: string,
  courseId: string,
  email?: string | null,
): Promise<AcademyPurchaseRecord | null> {
  const actor: AcademyActor = { userId, email };
  try {
    const ports = createPrismaAcademyPorts();
    return await academySsrRead(
      () =>
        resolveAcademyArtifactPurchase(ports.academy, actor, courseId, {
          persistGrant: false,
        }),
      "academy.artifact",
    );
  } catch {
    return hasAcademyAdminBypass(actor)
      ? createAcademyAdminBypassPurchase(userId, courseId)
      : null;
  }
});

/** Kapı meta — oturum/timer yok; sınav yalnız kullanıcı Başla deyince açılır. */
export const loadExamGateForUserCourse = cache(async function loadExamGateForUserCourse(
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
    return await academySsrRead(async () => {
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
    }, "academy.exam-gate");
  } catch {
    return null;
  }
});

export const loadCurriculumPlayerForUser = cache(async function loadCurriculumPlayerForUser(
  userId: string,
  courseId: string,
  email?: string | null,
): Promise<AcademyCurriculumPlayerView | null> {
  const actor: AcademyActor = { userId, email };
  if (hasAcademyAdminBypass(actor) && !isPrismaQueryEngineReady()) {
    void ensurePrismaQueryEngine();
    const seeded = resolveAcademyCourseFromSeed(courseId);
    return seeded ? buildUnlimitedSeedCurriculumPlayer(seeded, userId) : null;
  }
  try {
    return await academySsrRead(async () => {
      const ports = createPrismaAcademyPorts();
      return await loadAcademyCurriculumPlayer(ports, { courseId, userId, email });
    }, "academy.player");
  } catch {
    if (!hasAcademyAdminBypass(actor)) {
      return null;
    }
    const seeded = resolveAcademyCourseFromSeed(courseId);
    return seeded ? buildUnlimitedSeedCurriculumPlayer(seeded, userId) : null;
  }
});

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

export const loadAcademyProgressionForCourse = cache(async function loadAcademyProgressionForCourse(input: {
  userId: string | null;
  email?: string | null;
  currentSlug: string;
  courses?: readonly { id: string; slug: string }[];
}): Promise<{
  bridge: AcademyProgressionBridgeView;
  mastery: AcademyPathwayMasteryView | null;
}> {
  const courses = input.courses ?? publishedCoursesFromSeed();
  const nextSlug = academyPathwayNextSlug(input.currentSlug);
  const next = nextSlug ? (courses.find((course) => course.slug === nextSlug) ?? null) : null;
  const [nextOwned, certificates] = await Promise.all([
    (async () => {
      if (!input.userId || !next) {
        return false;
      }
      const purchase = await loadPurchaseForUserCourse(input.userId, next.id, input.email);
      return hasAcademyPlayerAccess(purchase, {
        userId: input.userId,
        email: input.email,
      });
    })(),
    input.userId != null ? loadCertificatesForUser(input.userId) : Promise.resolve(null),
  ]);
  const completedSlugs = academyCompletedSlugsFromCertificates(certificates ?? [], courses);
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
});

export const loadAcademyHolderName = cache(async function loadAcademyHolderName(
  userId: string,
): Promise<string> {
  try {
    const board = await withDbReadTimeout(
      loadIdentityBoard(userId),
      ACADEMY_CATALOG_READ_TIMEOUT_MS,
      "academy.holder",
    );
    const name = board?.user?.displayName?.trim();
    return name && name.length > 0 ? name : "Aday";
  } catch {
    return "Aday";
  }
});

export const loadAcademyWalletBoard = cache(async function loadAcademyWalletBoard(
  userId: string,
) {
  try {
    return await withDbReadTimeout(
      loadWalletBoard(userId),
      ACADEMY_CATALOG_READ_TIMEOUT_MS,
      "academy.wallet",
    );
  } catch {
    return null;
  }
});

