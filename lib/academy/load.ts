import "server-only";

import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { loadPublicAcademyExam } from "@/lib/academy/exam-engine";
import { loadAcademyCurriculumPlayer } from "@/lib/academy/curriculum-engine";
import type { AcademyCurriculumPlayerView } from "@/lib/academy/curriculum-engine";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { resolvePublicAcademyCertificate } from "@/lib/academy/certificate-verify";
import type { PublicAcademyCertificateResolution } from "@/lib/academy/certificate-verify";
import type {
  AcademyCertificateRecord,
  AcademyCourseRecord,
  AcademyExamPublicQuestion,
  AcademyPurchaseRecord,
} from "@/lib/academy/types";
import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";

export type AcademyCourseWithPrice = AcademyCourseRecord & {
  priceMinor: AmountMinor | null;
  currencyCode: CurrencyCode;
  purchasable: boolean;
};

export async function loadPublishedCourses(): Promise<AcademyCourseWithPrice[] | null> {
  try {
    const ports = createPrismaAcademyPorts();
    const courses = await ports.academy.listPublishedCourses();
    return Promise.all(courses.map((course) => enrichCourse(ports, course)));
  } catch {
    return null;
  }
}

export async function loadCourseBySlug(slug: string): Promise<{
  course: AcademyCourseWithPrice;
} | null> {
  try {
    const ports = createPrismaAcademyPorts();
    const course = await ports.academy.getCourseBySlug(slug);
    if (!course) {
      return null;
    }
    return { course: await enrichCourse(ports, course) };
  } catch {
    return null;
  }
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
): Promise<AcademyPurchaseRecord | null> {
  try {
    const ports = createPrismaAcademyPorts();
    return await ports.academy.getPurchaseByUserAndCourse(userId, courseId);
  } catch {
    return null;
  }
}

export async function loadExamGateForUserCourse(
  userId: string,
  courseId: string,
): Promise<{
  questions: AcademyExamPublicQuestion[];
  examTitle: string;
  passScore: number;
  certificate: AcademyCertificateRecord | null;
} | null> {
  try {
    const ports = createPrismaAcademyPorts();
    const view = await loadPublicAcademyExam(ports, courseId, userId);
    if (!view) {
      return null;
    }
    return {
      questions: view.questions,
      examTitle: view.exam.title,
      passScore: view.exam.passScore,
      certificate: view.certificate,
    };
  } catch {
    return null;
  }
}

export async function loadCurriculumPlayerForUser(
  userId: string,
  courseId: string,
): Promise<AcademyCurriculumPlayerView | null> {
  try {
    const ports = createPrismaAcademyPorts();
    return await loadAcademyCurriculumPlayer(ports, { courseId, userId });
  } catch {
    return null;
  }
}

export function publishedLessonCount(slug: string): number {
  return curriculumForCourseSlug(slug).length;
}

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

async function enrichCourse(
  ports: ReturnType<typeof createPrismaAcademyPorts>,
  course: AcademyCourseRecord,
): Promise<AcademyCourseWithPrice> {
  const entry = await ports.catalog.findActiveEntry(ACADEMY_MODULE_KEY, course.catalogUnitKey);
  return {
    ...course,
    priceMinor: entry?.amountMinor ?? null,
    currencyCode: entry?.currencyCode ?? SETTLEMENT_CURRENCY,
    purchasable: Boolean(entry) && course.isPublished,
  };
}
