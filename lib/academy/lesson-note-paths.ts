import { ACADEMY_STAMP_SURFACE_PATH } from "@/lib/kernel/passport/types";
import { ACADEMY_PROOF_OF_WORK_HASH_PATTERN } from "@/lib/academy/proof-of-work";

export function academyLessonPdfFilename(lessonKey: string): string {
  return `ders-notu-${lessonKey.trim()}.pdf`;
}

export function academyCurriculumPdfFilename(slug: string): string {
  return `mufredat-notu-${slug.trim()}.pdf`;
}

export function academyLessonPdfPath(courseId: string, lessonKey: string): string {
  return `/api/academy/courses/${courseId}/pdf?lessonKey=${encodeURIComponent(lessonKey)}`;
}

export function academyCurriculumPdfPath(courseId: string): string {
  return `/api/academy/courses/${courseId}/pdf`;
}

export function academyProofHashPreview(hash: string): string {
  const trimmed = hash.trim().toLowerCase();
  if (trimmed.length < 16) {
    return trimmed;
  }
  return `${trimmed.slice(0, 8)}…${trimmed.slice(-8)}`;
}

export function academyVerifyPath(hash: string): string {
  const trimmed = hash.trim().toLowerCase();
  return `${ACADEMY_STAMP_SURFACE_PATH}/dogrula/${trimmed}`;
}

export function academyVerifyUrl(hash: string, origin?: string): string {
  const path = academyVerifyPath(hash);
  const base = origin?.trim().replace(/\/$/u, "");
  if (base) {
    return `${base}${path}`;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
}

export function isAcademyVerifyHash(hash: string): boolean {
  return ACADEMY_PROOF_OF_WORK_HASH_PATTERN.test(hash.trim().toLowerCase());
}
