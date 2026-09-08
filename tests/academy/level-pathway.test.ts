import { describe, expect, it } from "vitest";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { ACADEMY_COURSE_TITLES, ACADEMY_CANON_SKU_SLUGS } from "@/lib/academy/course-titles";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { publishedCoursesFromSeed } from "@/lib/academy/published-catalog";
import {
  ACADEMY_LEVEL_PATHWAYS,
  ACADEMY_PATHWAY_MASTERY_VERSION,
  academyCompletedSlugsFromCertificates,
  academyPathwayBySlug,
  academyPathwayCatalogSlugs,
  academyPathwayNextSlug,
  academyProgressionHref,
  buildAcademyPathwayCatalog,
} from "@/lib/academy/level-pathway";
import {
  academyPathwayMasteryHashMap,
} from "@/lib/academy/level-pathway-mastery";
import type { AcademyCertificateRecord } from "@/lib/academy/types";

const BUYER = "pathway-buyer";
const STAMP = new Date("2026-08-22T12:00:00.000Z");

function dummyHash(seed: string): string {
  return sha256Hex(`pathway-cert:${seed}`);
}

function dummyCertificate(courseId: string, revoked = false): AcademyCertificateRecord {
  const hash = dummyHash(courseId);
  return {
    id: `cert-${courseId}`,
    userId: BUYER,
    courseId,
    purchaseId: `pur-${courseId}`,
    attemptId: `att-${courseId}`,
    title: "Ustalık belgesi",
    serialKey: hash,
    certificateHash: hash,
    curriculumSeal: hash,
    score: 80,
    issuedAt: STAMP,
    revokedAt: revoked ? STAMP : null,
    revokeReason: revoked ? "test" : null,
    createdAt: STAMP,
  };
}

describe("03.37 seviye yol haritası", () => {
  it("yayın pathway ve tohum listeleri boştur", () => {
    expect(ACADEMY_LEVEL_PATHWAYS).toEqual([]);
    expect([...academyPathwayCatalogSlugs()]).toEqual([]);
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect([...ACADEMY_GROWTH_SKU_SLUGS]).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(Object.keys(ACADEMY_COURSE_TITLES)).toEqual([...ACADEMY_CANON_SKU_SLUGS]);
    expect(ACADEMY_COURSE_TITLES["01_office_ai"]).toContain("Ofiste Yapay Zekâ");
    expect(academyPathwayBySlug("sample-course")).toBeNull();
    expect(academyPathwayNextSlug("sample-course")).toBeNull();
    expect(academyProgressionHref("sample-course", false)).toBe("/academy/sample-course");
    expect(academyProgressionHref("sample-course", true)).toBe("/academy/sample-course/oyna");
  });

  it("boş katalogda pathway duvarı basılmaz", () => {
    const courses = publishedCoursesFromSeed();
    expect(courses.map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    const views = buildAcademyPathwayCatalog({
      courses,
      completedSlugs: new Set(["sample-course"]),
      masteryHashByPathway: academyPathwayMasteryHashMap(),
      highlightLevel: "Temel",
    });
    expect(views).toEqual([]);
  });

  it("sertifikadan tamamlanan slug kümesi üretir", () => {
    const slugs = academyCompletedSlugsFromCertificates(
      [dummyCertificate("ac_sample"), dummyCertificate("ghost", true)],
      [{ id: "ac_sample", slug: "sample-course" }],
    );
    expect(slugs.has("sample-course")).toBe(true);
    expect(ACADEMY_PATHWAY_MASTERY_VERSION).toBe("yetkin-rail.academy.pathway-mastery.v1");
  });
});
