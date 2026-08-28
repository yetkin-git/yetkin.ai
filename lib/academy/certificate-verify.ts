import type { AcademyPathwayMasteryView } from "@/lib/academy/level-pathway";
import { resolveAcademyPathwayMastery } from "@/lib/academy/level-pathway-mastery";
import { academyCurriculumSealForSlug } from "@/lib/academy/curriculum";
import type { AcademyCertificateRecord, AcademyStore } from "@/lib/academy/types";
import {
  ACADEMY_CERTIFICATE_HASHED_FIELDS,
  ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
  ACADEMY_EXAM_PASS_SCORE,
  parseAcademyCertificateHash,
  verifyAcademyCertificateHash,
} from "@/lib/academy/exam";

export const ACADEMY_CERTIFICATE_INTEGRITY_KIND = "sha256-content-digest" as const;

export type AcademyCertificateSealStatus = "valid" | "mismatch" | "incomplete" | "revoked";

export type PublicAcademyCertificateView = {
  title: string;
  courseTitle: string;
  courseSlug: string | null;
  score: number | null;
  issuedAt: Date;
  revokedAt: Date | null;
  certificateHash: string;
  curriculumSeal: string | null;
  algorithm: "SHA256";
  integrityKind: typeof ACADEMY_CERTIFICATE_INTEGRITY_KIND;
  payloadVersion: typeof ACADEMY_CERTIFICATE_PAYLOAD_VERSION;
  hashedFields: typeof ACADEMY_CERTIFICATE_HASHED_FIELDS;
  sealStatus: AcademyCertificateSealStatus;
  passScore: typeof ACADEMY_EXAM_PASS_SCORE;
  pathwayMastery: AcademyPathwayMasteryView | null;
  hashSubjectKind: "person-certificate";
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
  if (!matches) {
    return "mismatch";
  }
  if (certificate.revokedAt) {
    return "revoked";
  }
  return "valid";
}

/**
 * Kamuya açık doğrulama. userId / attemptId / purchaseId sızmaz.
 * Hash yeniden hesaplanır; sicilde yoksa uydurma "geçerli" basılmaz.
 */
export type AcademyPublicCertificatePort = Pick<AcademyStore, "getCertificateByHash" | "getCourse"> &
  Partial<Pick<AcademyStore, "getCourseBySlug" | "getCertificateByUserAndCourse">>;

export async function resolvePublicAcademyCertificate(
  academy: AcademyPublicCertificatePort,
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
  const pathwayMastery =
    course?.slug && academy.getCourseBySlug && academy.getCertificateByUserAndCourse
      ? await resolveAcademyPathwayMastery({
          academy: {
            getCourseBySlug: academy.getCourseBySlug,
            getCertificateByUserAndCourse: academy.getCertificateByUserAndCourse,
          },
          userId: certificate.userId,
          courseSlug: course.slug,
        })
      : null;
  return {
    status: "found",
    view: {
      title: certificate.title,
      courseTitle: course?.title ?? certificate.title,
      courseSlug: course?.slug ?? null,
      score: certificate.score,
      issuedAt: certificate.issuedAt,
      revokedAt: certificate.revokedAt,
      certificateHash: displayedHash,
      curriculumSeal,
      algorithm: "SHA256",
      integrityKind: ACADEMY_CERTIFICATE_INTEGRITY_KIND,
      payloadVersion: ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
      hashedFields: ACADEMY_CERTIFICATE_HASHED_FIELDS,
      sealStatus: sealStatusFor(certificate, course?.slug ?? null),
      passScore: ACADEMY_EXAM_PASS_SCORE,
      pathwayMastery,
      hashSubjectKind: "person-certificate",
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
    revokedAt: view.revokedAt ? view.revokedAt.toISOString() : null,
    certificateHash: view.certificateHash,
    curriculumSeal: view.curriculumSeal,
    algorithm: view.algorithm,
    integrityKind: view.integrityKind,
    payloadVersion: view.payloadVersion,
    hashedFields: [...view.hashedFields],
    sealStatus: view.sealStatus,
    passScore: view.passScore,
  };
}
