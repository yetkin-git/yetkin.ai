import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_CATALOG_SEEDS } from "@/lib/academy/catalog-seed";
import { ACADEMY_CATALOG_PRICE_MINOR, academyCatalogPriceFitsPaytrBand } from "@/lib/academy/catalog-pricing";
import { ACADEMY_COURSE_LEVEL_BY_SLUG } from "@/lib/academy/course-level";
import { ACADEMY_CATALOG_SUMMARIES } from "@/lib/academy/catalog-summaries";
import { ACADEMY_COURSE_TITLES } from "@/lib/academy/course-titles";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { ACADEMY_EXAM_POOL_MAX, ACADEMY_EXAM_POOL_MIN } from "@/lib/academy/exam-duration";
import {
  CHATBOT_NOCODE_EXAM_QUESTIONS,
  ECOMMERCE_AI_EXAM_QUESTIONS,
  PROMPT_PRACTICE_EXAM_QUESTIONS,
  SOCIAL_MEDIA_AI_EXAM_QUESTIONS,
  academyExamPoolForSlug,
} from "@/lib/academy/exam-pools";
import { parseAcademyExamQuestions, serializeAcademyExamQuestions } from "@/lib/academy/exam";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { ACADEMY_CANON_SKU_SLUGS, ACADEMY_CATALOG_LAYER_BY_SLUG } from "@/lib/kernel/catalog-ids";

const ROOT = process.cwd();
const MASTERY = join(ROOT, "docs", "curriculum", "02_ecommerce_ai_mastery.md");

describe("13 kanon katalog ve 02_ecommerce_ai ingest", () => {
  it("kanon 13 SKU dondurulur; vitrin yalnız ingest edilmiş alt kümedir", () => {
    expect([...ACADEMY_CANON_SKU_SLUGS]).toHaveLength(13);
    expect(Object.keys(ACADEMY_COURSE_TITLES)).toEqual([...ACADEMY_CANON_SKU_SLUGS]);
    expect([...ACADEMY_GROWTH_SKU_SLUGS]).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    expect(ACADEMY_CATALOG_SEEDS.map((row) => row.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    for (const slug of ACADEMY_GROWTH_SKU_SLUGS) {
      expect(ACADEMY_CANON_SKU_SLUGS).toContain(slug);
    }
    expect(ACADEMY_CANON_SKU_SLUGS.filter((slug) => ACADEMY_CATALOG_LAYER_BY_SLUG[slug] === 1)).toHaveLength(5);
    expect(ACADEMY_CANON_SKU_SLUGS.filter((slug) => ACADEMY_CATALOG_LAYER_BY_SLUG[slug] === 2)).toHaveLength(5);
    expect(ACADEMY_CANON_SKU_SLUGS.filter((slug) => ACADEMY_CATALOG_LAYER_BY_SLUG[slug] === 3)).toHaveLength(3);
  });

  it("13 SKU fiyat, özet ve seviye sicili PayTR bandına sığar", () => {
    for (const slug of ACADEMY_CANON_SKU_SLUGS) {
      expect(ACADEMY_CATALOG_PRICE_MINOR[slug]).toBeGreaterThan(0);
      expect(academyCatalogPriceFitsPaytrBand(ACADEMY_CATALOG_PRICE_MINOR[slug])).toBe(true);
      expect(ACADEMY_CATALOG_SUMMARIES[slug].length).toBeGreaterThan(40);
      expect(ACADEMY_COURSE_LEVEL_BY_SLUG[slug].length).toBeGreaterThan(0);
    }
  });

  it("02_ecommerce_ai 30 soruluk havuz AcademyExamQuestion şemasını geçer", () => {
    expect(ECOMMERCE_AI_EXAM_QUESTIONS).toHaveLength(ACADEMY_EXAM_POOL_MIN);
    expect(ECOMMERCE_AI_EXAM_QUESTIONS.length).toBeLessThanOrEqual(ACADEMY_EXAM_POOL_MAX);
    const parsed = parseAcademyExamQuestions(serializeAcademyExamQuestions(ECOMMERCE_AI_EXAM_QUESTIONS));
    expect(parsed).toHaveLength(30);
    const ids = new Set(parsed.map((row) => row.id));
    expect(ids.size).toBe(30);
    for (let i = 1; i <= 30; i += 1) {
      expect(ids.has(`q_ec_${i}`)).toBe(true);
    }
    for (const question of parsed) {
      expect(question.choices).toHaveLength(4);
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(4);
    }
    expect(academyExamPoolForSlug("01_office_ai")).toHaveLength(30);
    expect(academyExamPoolForSlug("CURR-OFFICE-AI-101")).toHaveLength(30);
    expect(readFileSync(join(ROOT, "lib/academy/exam-pools.ts"), "utf8")).not.toContain(
      "AI_TEMEL_QUESTIONS",
    );
    expect(readFileSync(join(ROOT, "lib/academy/exam-pools.ts"), "utf8")).not.toContain(
      "UX_TEMEL_QUESTIONS",
    );
    expect(readFileSync(join(ROOT, "lib/academy/exam-pools-growth.ts"), "utf8")).not.toContain(
      "AI_TEMEL_QUESTIONS",
    );
  });

  it("02_ecommerce_ai compact müfredat 6 bölüm basar; mastery YAML frontmatter taşır", () => {
    const lessons = curriculumForCourseSlug("02_ecommerce_ai");
    expect(lessons).toHaveLength(6);
    expect(lessons[0]?.key).toBe("02_ecommerce_ai-1");
    expect(lessons[0]?.body.length).toBeGreaterThan(200);
    expect(lessons[5]?.key).toBe("02_ecommerce_ai-6");
    expect(existsSync(MASTERY)).toBe(true);
    const mastery = readFileSync(MASTERY, "utf8");
    expect(mastery.startsWith("---")).toBe(true);
    expect(mastery).toContain('slug: "02_ecommerce_ai"');
    expect(mastery).toContain('moduleCode: "CURR-ECOMMERCE-AI-102"');
    expect(mastery).toContain('format: "compact"');
    expect(mastery).toContain("poolRef:");
    expect(mastery).toContain("q_ec_");
  });

  it("Katman 1 (03–05) compact müfredat 6 bölüm ve 30 soruluk havuz taşır", () => {
    const layer1 = [
      {
        slug: "03_social_media_ai",
        mastery: "03_social_media_factory.md",
        moduleCode: "CURR-SOCIAL-MEDIA-AI-103",
        prefix: "q_sm_",
        pool: SOCIAL_MEDIA_AI_EXAM_QUESTIONS,
      },
      {
        slug: "04_chatbot_nocode",
        mastery: "04_chatbot_mastery.md",
        moduleCode: "CURR-CHATBOT-NOCODE-104",
        prefix: "q_bot_",
        pool: CHATBOT_NOCODE_EXAM_QUESTIONS,
      },
      {
        slug: "05_prompt_practice",
        mastery: "05_prompt_engineering_mastery.md",
        moduleCode: "CURR-PROMPT-PRACTICE-105",
        prefix: "q_pr_",
        pool: PROMPT_PRACTICE_EXAM_QUESTIONS,
      },
    ] as const;
    for (const row of layer1) {
      expect(row.pool).toHaveLength(ACADEMY_EXAM_POOL_MIN);
      expect(row.pool.length).toBeLessThanOrEqual(ACADEMY_EXAM_POOL_MAX);
      const parsed = parseAcademyExamQuestions(serializeAcademyExamQuestions(row.pool));
      expect(parsed, row.slug).toHaveLength(30);
      const ids = new Set(parsed.map((question) => question.id));
      expect(ids.size, row.slug).toBe(30);
      for (let i = 1; i <= 30; i += 1) {
        expect(ids.has(`${row.prefix}${i}`), `${row.slug}:${row.prefix}${i}`).toBe(true);
      }
      expect(academyExamPoolForSlug(row.slug), row.slug).toHaveLength(30);
      expect(academyExamPoolForSlug(row.moduleCode), row.moduleCode).toHaveLength(30);
      const lessons = curriculumForCourseSlug(row.slug);
      expect(lessons, row.slug).toHaveLength(6);
      expect(lessons[0]?.key).toBe(`${row.slug}-1`);
      expect(lessons[0]?.body.length, row.slug).toBeGreaterThan(200);
      const masteryPath = join(ROOT, "docs", "curriculum", row.mastery);
      expect(existsSync(masteryPath), row.mastery).toBe(true);
      const mastery = readFileSync(masteryPath, "utf8");
      expect(mastery.startsWith("---"), row.mastery).toBe(true);
      expect(mastery).toContain(`slug: "${row.slug}"`);
      expect(mastery).toContain(`moduleCode: "${row.moduleCode}"`);
      expect(mastery).toContain('format: "compact"');
    }
  });
});
