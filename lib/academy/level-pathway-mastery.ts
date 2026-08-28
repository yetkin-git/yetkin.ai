/**
 * Tam Kapsam Ustalık Mührü — adayın dikey halkalarını sicilden okur.
 * userId kamu görünümüne çıkmaz.
 */

import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import { academyCourseTitleBySlug } from "@/lib/academy/course-titles";
import { parseSha256Hex, sha256Hex } from "@/lib/kernel/crypto/sha256";
import {
  ACADEMY_LEVEL_PATHWAYS,
  academyPathwayBySlug,
  academyPathwayIsMastered,
  academyPathwayRingSlugs,
  canonicalAcademyPathwayMasteryHash,
  type AcademyPathwayDefinition,
  type AcademyPathwayMasteryView,
} from "@/lib/academy/level-pathway";
import { canonicalAcademyCurriculumProofHash } from "@/lib/academy/proof-of-work-verify";
import type { AcademyStore } from "@/lib/academy/types";

export type AcademyPathwayMasteryPort = Pick<
  AcademyStore,
  "getCourseBySlug" | "getCertificateByUserAndCourse"
>;

function masteryViewForPathway(
  pathway: AcademyPathwayDefinition,
  masteryHash: string,
): AcademyPathwayMasteryView {
  return {
    pathwayId: pathway.id,
    pathwayTitle: pathway.title,
    masteryHash,
    rings: academyPathwayRingSlugs(pathway).map((slug) => ({
      slug,
      title: academyCourseTitleBySlug(slug) ?? slug,
      level: academyCourseLevelBySlug(slug) ?? "Temel",
    })),
  };
}

export function academyPathwayProofHashMap(): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  for (const pathway of ACADEMY_LEVEL_PATHWAYS) {
    for (const slug of academyPathwayRingSlugs(pathway)) {
      map[slug] = canonicalAcademyCurriculumProofHash(slug);
    }
  }
  return map;
}

export function academyPathwayMasteryHashMap(): Record<string, string | null> {
  const proofs = academyPathwayProofHashMap();
  const map: Record<string, string | null> = {};
  for (const pathway of ACADEMY_LEVEL_PATHWAYS) {
    map[pathway.id] = canonicalAcademyPathwayMasteryHash(pathway, proofs, sha256Hex);
  }
  return map;
}

export function resolvePublicAcademyPathwayMastery(rawHash: string): AcademyPathwayMasteryView | null {
  const hash = parseSha256Hex(rawHash);
  if (!hash) {
    return null;
  }
  const proofs = academyPathwayProofHashMap();
  for (const pathway of ACADEMY_LEVEL_PATHWAYS) {
    const masteryHash = canonicalAcademyPathwayMasteryHash(pathway, proofs, sha256Hex);
    if (masteryHash === hash) {
      return masteryViewForPathway(pathway, masteryHash);
    }
  }
  return null;
}

export async function resolveAcademyPathwayMastery(input: {
  academy: AcademyPathwayMasteryPort;
  userId: string;
  courseSlug: string;
}): Promise<AcademyPathwayMasteryView | null> {
  const pathway = academyPathwayBySlug(input.courseSlug);
  if (!pathway) {
    return null;
  }
  const completed = new Set<string>();
  for (const slug of academyPathwayRingSlugs(pathway)) {
    const course = await input.academy.getCourseBySlug(slug);
    const certificate = course
      ? await input.academy.getCertificateByUserAndCourse(input.userId, course.id)
      : null;
    if (certificate && !certificate.revokedAt) {
      completed.add(slug);
    }
  }
  if (!academyPathwayIsMastered(pathway, completed)) {
    return null;
  }
  const masteryHash = canonicalAcademyPathwayMasteryHash(pathway, academyPathwayProofHashMap(), sha256Hex);
  if (!masteryHash) {
    return null;
  }
  return masteryViewForPathway(pathway, masteryHash);
}
