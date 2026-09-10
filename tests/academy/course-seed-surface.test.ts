import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_COURSE_SEEDS,
  ACADEMY_LEGACY_PURGE_CATALOG_UNITS,
  ACADEMY_LEGACY_PURGE_COURSE_IDS,
  ACADEMY_SEED_CURRENCY,
  ACADEMY_SEED_MODULE_KEY,
} from "@/lib/academy/seed";
import { resolveAcademySeedMoney, isAcademyCourseLevel } from "@/lib/academy/course-level";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function academySeedSql(): string {
  const dir = join(ROOT, "supabase", "migrations");
  const file = readdirSync(dir).find((name) => name.endsWith("academy_course_seed.sql"));
  expect(file).toBe("20260814090000_academy_course_seed.sql");
  return readFileSync(join(dir, file!), "utf8");
}

describe("akademi kurs tohumu yüzeyi", () => {
  it("serbest tutar ve seviye etiketi — maktu bant / kapalı enum kilidi yoktur", () => {
    const master = resolveAcademySeedMoney({
      amountMinor: 249_000,
      level: "Masterclass",
    });
    expect(master.amountMinor).toBe(249_000);
    expect(master.minMinor).toBe(1);
    expect(master.maxMinor).toBeGreaterThanOrEqual(249_000);
    expect(isAcademyCourseLevel("Masterclass")).toBe(true);
    expect(isAcademyCourseLevel("Modül-1")).toBe(true);
    expect(isAcademyCourseLevel("")).toBe(false);
  });

  it("mühürlü aktif tohum ingest edilmiş kanon SKU taşır", () => {
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect([...ACADEMY_GROWTH_SKU_SLUGS]).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(ACADEMY_SEED_MODULE_KEY).toBe(ACADEMY_MODULE_KEY);
    expect(ACADEMY_SEED_CURRENCY).toBe("TRY");
    expect(ACADEMY_LEGACY_PURGE_COURSE_IDS).not.toContain("ac_01_office_ai");
    expect(ACADEMY_LEGACY_PURGE_COURSE_IDS).not.toContain("ac_02_ecommerce_ai");
    expect(ACADEMY_LEGACY_PURGE_CATALOG_UNITS).not.toContain("course:01_office_ai");
    expect(ACADEMY_LEGACY_PURGE_CATALOG_UNITS).not.toContain("course:02_ecommerce_ai");
  });

  it("ops SQL amiral kursu basar; hayalet SKU INSERT etmez", () => {
    const sql = academySeedSql();
    expect(sql).toContain("'academy'");
    expect(sql).toMatch(/INSERT INTO public\.academy_courses/i);
    expect(sql).toContain("ac_01_office_ai");
    expect(sql).toContain("01_office_ai");
    expect(sql).toContain("ac_02_ecommerce_ai");
    expect(sql).toContain("02_ecommerce_ai");
    expect(sql).toContain("ac_03_social_media_ai");
    expect(sql).toContain("03_social_media_ai");
    expect(sql).toContain("ac_04_chatbot_nocode");
    expect(sql).toContain("04_chatbot_nocode");
    expect(sql).toContain("ac_05_prompt_practice");
    expect(sql).toContain("05_prompt_practice");
    expect(sql).not.toMatch(/INSERT INTO public\.academy_purchases/i);
    expect(sql).not.toMatch(/INSERT INTO public\.academy_certificates/i);
    expect(sql).toMatch(/UPDATE public\.academy_courses/i);
    expect(sql).toMatch(/is_published = false/i);
    expect(sql).not.toMatch(/DELETE FROM public\.academy_purchases/i);
    expect(sql).not.toMatch(/DELETE FROM public\.academy_certificates/i);
    expect(sql).not.toMatch(/DELETE FROM public\.academy_courses/i);
  });

  it("vitrin loadPublishedCourses ile DB kursunu basar; örnek kart yalnız boş listede kalır", () => {
    const page = readSrc("app/academy/page.tsx");
    const load = readSrc("lib/academy/load-catalog.ts");
    const list = readSrc("components/academy/course-list.tsx");
    const detail = readSrc("app/academy/[slug]/page.tsx");

    expect(page).toContain("loadPublishedCourses");
    expect(page).toContain("load-catalog");
    expect(page).not.toContain("from \"@/lib/academy/curriculum\"");
    expect(page).not.toContain("curriculumForCourseSlug");
    expect(page).toContain("curriculumLessonCountForSlug");
    expect(page).toContain("SEN_VOICE");
    expect(page).not.toContain("overlayStudioGrowthLearnerBoard");
    expect(page).not.toContain("hasUnlimitedAcademyAccess");
    expect(page).not.toContain("ACADEMY_SHOWCASE");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain(
      "Eğitimler · Amiral hat sesli + karaoke · Diğerleri yazılı compact · Test barajı 70+ · Sertifika Kariyer sayfasına işlenir",
    );
    expect(readSrc("lib/copy/sen-voice/academy.ts")).not.toContain("₺690");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).not.toContain("₺990");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).not.toContain("₺1.490");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).not.toContain("Canlı sicil");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain("Piyasa Talep Skoru");
    expect(load).toContain("listPublishedCourses");
    expect(load).toContain("mergePublishedAcademyCatalog");
    expect(readSrc("lib/academy/prisma-store.ts")).toContain("orderAcademyCatalogByCurriculum");
    expect(readSrc("lib/academy/prisma-store.ts")).toContain("filterAcademyGrowthCatalog");
    expect(readSrc("lib/academy/published-catalog.ts")).toContain("orderAcademyCatalogByCurriculum");
    expect(readSrc("lib/academy/published-catalog.ts")).not.toContain("byTrendScoreAsc");
    expect(readSrc("lib/academy/published-catalog.ts")).not.toContain("ACADEMY_SHOWCASE_PINNED_SLUGS");
    expect(readSrc("lib/academy/published-catalog.ts")).toContain("orderAcademyShowcaseCatalog");
    expect(readSrc("lib/academy/published-catalog.ts")).toContain("@/lib/academy/catalog-seed");
    expect(readSrc("lib/academy/published-catalog.ts")).not.toContain("@/lib/academy/seed\"");
    expect(readSrc("lib/academy/published-catalog.ts")).not.toContain("@/lib/academy/exam-pools");
    expect(readSrc("lib/academy/catalog-seed.ts")).not.toContain("@/lib/academy/exam-pools");
    expect(readSrc("lib/academy/load-catalog.ts")).not.toContain("@/lib/academy/exam-pools");
    expect(readSrc("lib/academy/seed.ts")).toContain("@/lib/academy/exam-pools");
    expect(load).toContain("ACADEMY_MODULE_KEY");
    expect(load).toContain("course.catalogUnitKey");
    expect(load).toContain("listActiveEntries");
    expect(load).toContain("ensurePrismaQueryEngine");
    expect(load).toContain("ACADEMY_CATALOG_READ_TIMEOUT_MS");
    expect(load).toContain("withDbReadTimeout");
    const priceLoader = load.slice(
      load.indexOf("loadPublishedCourses"),
      load.indexOf("loadAcademyCatalogLearnerBoard"),
    );
    expect(priceLoader).toContain("listActiveEntries");
    expect(priceLoader).not.toContain("withDbReadTimeout");
    expect(priceLoader).not.toContain("ACADEMY_CATALOG_READ_TIMEOUT_MS");
    expect(list).toContain("ACADEMY_SEN");
    expect(list).toContain("CourseCard");
    expect(list).toContain('surface = "catalog"');
    expect(list).toContain("orderAcademyCatalogByCurriculum");
    expect(list).not.toContain("groupAcademyCatalogBySeries");
    expect(list).toContain("md:grid-cols-3");
    expect(readSrc("components/academy/course-card.tsx")).toContain("resolveAcademyCatalogCardCta");
    expect(readSrc("lib/academy/storefront-cta.ts")).toContain("/academy/${input.slug}");
    expect(readSrc("components/academy/course-card.tsx")).not.toContain("MarketPopularityBadge");
    expect(readSrc("components/academy/course-card.tsx")).toContain('hit="card"');
    expect(readSrc("components/academy/course-card.tsx")).toContain("academyCatalogSummaryBySlug");
    expect(readSrc("components/academy/course-card.tsx")).toContain("academyCourseHasSealedAudio");
    expect(readSrc("components/academy/course-card.tsx")).not.toContain("Temel'den İleri");
    expect(readSrc("lib/academy/catalog-summaries.ts")).toContain("01_office_ai");
    expect(readSrc("lib/academy/catalog-summaries.ts")).not.toContain("6 Ders");
    expect(readSrc("lib/academy/catalog-summaries.ts")).not.toContain("PEDAGOJI.md mühürlü");
    expect(readSrc("lib/academy/catalog-summaries.ts")).not.toContain("12 bölüm");
    expect(readSrc("lib/academy/catalog-summaries.ts")).not.toContain("Temel'den İleri");
    expect(readSrc("lib/academy/published-catalog.ts")).toContain("summary: seed?.summary ?? course.summary");
    expect(readSrc("components/academy/level-pathway.tsx")).not.toContain("MarketPopularityBadge");
    expect(existsSync(join(ROOT, "components/academy/filter-bar.tsx"))).toBe(false);
    expect(readSrc("components/showcase/listing-card.tsx")).toContain("justify-end");
    expect(list).toContain("courses.length === 0");
    expect(detail).toContain("loadCourseBySlug");
    expect(detail).toContain("hasCommercialAcademyEnrolment");
    expect(detail).toContain("hasAccess");
    expect(detail).not.toContain("hasCommercialAcademyEnrolment(purchase) ||");
    expect(detail).toContain("PurchaseButton");
    expect(detail).toContain("ExamStartGate");
    expect(detail).not.toContain("ExamPanel");
    expect(detail).not.toContain("AcademyPilotPath");
    expect(detail).toContain("CurriculumOutcomes");
    expect(detail).toContain("curriculumSyllabusForCourseSlug");
    expect(detail).toContain("AcademyProgressBar");
    expect(detail).toContain("libraryGuarantee");
    expect(detail).toContain("trainingHref");
    expect(detail).not.toContain("examHref");
    expect(detail).not.toContain("?gate=exam");
    expect(readSrc("lib/academy/purchase-path.ts")).toContain("Eğitimi Satın Al & Öğren");
    expect(readSrc("lib/academy/purchase-path.ts")).toContain("Doğrudan teste gir ve yetkinlik kazan");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("ExamPanel");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("role=\"dialog\"");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("data-academy-exam-exit");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("data-academy-exam-gate");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("ACADEMY_EXAM_GATE_ANCHOR");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain("Testi Başlat");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain(
      "Bu test ${minutes} dakika, baraj ${passScore}. Başla deyince süre işler.",
    );
    expect(detail).toContain("/oyna");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).toContain("CurriculumPlayer");
    expect(readSrc("lib/academy/index.ts")).toContain("curriculum");
  });
});

