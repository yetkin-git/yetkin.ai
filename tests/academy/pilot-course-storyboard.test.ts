import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { ACADEMY_CATALOG_SEEDS } from "@/lib/academy/catalog-seed";
import { publishedCoursesFromSeed } from "@/lib/academy/published-catalog";
import { ACADEMY_COURSE_TITLES, ACADEMY_CANON_SKU_SLUGS } from "@/lib/academy/course-titles";
import {
  ACADEMY_GROWTH_LESSON_COUNT,
  ACADEMY_GROWTH_SKU_SLUGS,
  ACADEMY_PILOT_SKU_LESSON_COUNT,
  ACADEMY_PILOT_SKU_SLUG,
} from "@/lib/academy/pilot-sku";
import { academyExamPoolForSlug } from "@/lib/academy/exam-pools";

describe("Amiral Ders — compact ingest SKU", () => {
  it("vitrin tohumu ingest edilmiş SKU taşır; hayalet slug basılmaz", () => {
    expect(Object.keys(ACADEMY_COURSE_TITLES)).toEqual([...ACADEMY_CANON_SKU_SLUGS]);
    expect(ACADEMY_COURSE_TITLES["01_office_ai"]).toContain("Ofiste Yapay Zekâ");
    expect(ACADEMY_COURSE_TITLES["02_ecommerce_ai"]).toContain("E-Ticaret");
    expect([...ACADEMY_GROWTH_SKU_SLUGS]).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(ACADEMY_CATALOG_SEEDS.map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(publishedCoursesFromSeed().map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(ACADEMY_PILOT_SKU_SLUG).toBeNull();
    expect(ACADEMY_PILOT_SKU_LESSON_COUNT).toBe(0);
    expect(ACADEMY_GROWTH_LESSON_COUNT).toBe(6);
    expect(curriculumForCourseSlug("sample-course")).toEqual([]);
    expect(academyExamPoolForSlug("sample-course")).toEqual([]);
    expect(academyExamPoolForSlug("01_office_ai").length).toBeGreaterThanOrEqual(30);
    expect(academyExamPoolForSlug("02_ecommerce_ai").length).toBeGreaterThanOrEqual(30);
    expect(academyExamPoolForSlug("03_social_media_ai").length).toBeGreaterThanOrEqual(30);
    expect(academyExamPoolForSlug("04_chatbot_nocode").length).toBeGreaterThanOrEqual(30);
    expect(academyExamPoolForSlug("05_prompt_practice").length).toBeGreaterThanOrEqual(30);
    expect(curriculumForCourseSlug("01_office_ai")).toHaveLength(6);
    expect(curriculumForCourseSlug("02_ecommerce_ai")).toHaveLength(6);
    expect(curriculumForCourseSlug("03_social_media_ai")).toHaveLength(6);
    expect(curriculumForCourseSlug("04_chatbot_nocode")).toHaveLength(6);
    expect(curriculumForCourseSlug("05_prompt_practice")).toHaveLength(6);
  });
});
