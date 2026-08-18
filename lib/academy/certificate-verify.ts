import type { AcademyCertificateRecord, AcademyStore } from "@/lib/academy/types";
import { academyCurriculumSealForSlug } from "@/lib/academy/curriculum";
import {
  ACADEMY_CERTIFICATE_HASHED_FIELDS,
  ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
  ACADEMY_EXAM_PASS_SCORE,
  parseAcademyCertificateHash,
  verifyAcademyCertificateHash,
} from "@/lib/academy/exam";

export type AcademyCertificateSealStatus = "valid" | "mismatch" | "incomplete";

export type PublicAcademyCertificateView = {
  title: string;
  courseTitle: string;
  courseSlug: string | null;
  score: number | null;
  issuedAt: Date;
  certificateHash: string;
  curriculumSeal: string | null;
  algorithm: "SHA256";
  payloadVersion: typeof ACADEMY_CERTIFICATE_PAYLOAD_VERSION;
  hashedFields: typeof ACADEMY_CERTIFICATE_HASHED_FIELDS;
  sealStatus: AcademyCertificateSealStatus;
  passScore: typeof ACADEMY_EXAM_PASS_SCORE;
};

export type PublicAcademyCertificateResolution =
  | { status: "invalid-format" }
  | { status: "missing" }
  | { status: "found"; view: PublicAcademyCertificateView };

function publicHash(certificate: AcademyCertificateRecord): string | null {
  return parseAcademyCertificateHash(certificate.certificateHash ?? certificate.serialKey ?? "");
}

function sealStatusFor(
  certificate: AcademyCertificateRecord,
  courseSlug: string | null,
): AcademyCertificateSealStatus {
  const storedHash = publicHash(certificate);
  const curriculumSeal =
    parseAcademyCertificateHash(certificate.curriculumSeal ?? "") ??
    (courseSlug ? academyCurriculumSealForSlug(courseSlug) : null);
  if (
    !storedHash ||
    certificate.attemptId == null ||
    certificate.score == null ||
    !curriculumSeal
  ) {
    return "incomplete";
  }
  const matches = verifyAcademyCertificateHash({
    userId: certificate.userId,
    courseId: certificate.courseId,
    attemptId: certificate.attemptId,
    score: certificate.score,
    issuedAt: certificate.issuedAt,
    curriculumSeal,
    certificateHash: storedHash,
  });
  return matches ? "valid" : "mismatch";
}

/**
 * Kamuya açık doğrulama. userId / attemptId / purchaseId sızmaz.
 * Hash yeniden hesaplanır; sicilde yoksa uydurma "geçerli" basılmaz.
 */
export async function resolvePublicAcademyCertificate(
  academy: AcademyStore,
  rawHash: string,
): Promise<PublicAcademyCertificateResolution> {
  const hash = parseAcademyCertificateHash(rawHash);
  if (!hash) {
    return { status: "invalid-format" };
  }
  const certificate = await academy.getCertificateByHash(hash);
  if (!certificate) {
    return { status: "missing" };
  }
  const course = await academy.getCourse(certificate.courseId);
  const displayedHash = publicHash(certificate) ?? hash;
  const curriculumSeal =
    parseAcademyCertificateHash(certificate.curriculumSeal ?? "") ??
    (course?.slug ? academyCurriculumSealForSlug(course.slug) : null);
  return {
    status: "found",
    view: {
      title: certificate.title,
      courseTitle: course?.title ?? certificate.title,
      courseSlug: course?.slug ?? null,
      score: certificate.score,
      issuedAt: certificate.issuedAt,
      certificateHash: displayedHash,
      curriculumSeal,
      algorithm: "SHA256",
      payloadVersion: ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
      hashedFields: ACADEMY_CERTIFICATE_HASHED_FIELDS,
      sealStatus: sealStatusFor(certificate, course?.slug ?? null),
      passScore: ACADEMY_EXAM_PASS_SCORE,
    },
  };
}

/** JSON teli: Date → ISO. userId / attemptId / purchaseId bu nesnede yoktur. */
export function toPublicAcademyCertificateWire(view: PublicAcademyCertificateView) {
  return {
    title: view.title,
    courseTitle: view.courseTitle,
    courseSlug: view.courseSlug,
    score: view.score,
    issuedAt: view.issuedAt.toISOString(),
    certificateHash: view.certificateHash,
    curriculumSeal: view.curriculumSeal,
    algorithm: view.algorithm,
    payloadVersion: view.payloadVersion,
    hashedFields: [...view.hashedFields],
    sealStatus: view.sealStatus,
    passScore: view.passScore,
  };
}
