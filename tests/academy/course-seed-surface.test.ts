import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_COURSE_SEEDS,
  ACADEMY_SEED_CURRENCY,
  ACADEMY_SEED_MODULE_KEY,
} from "@/lib/academy/seed";
import {
  isAcademyCourseLevel,
  resolveAcademySeedMoney,
} from "@/lib/academy/course-level";
import {
  ACADEMY_EXAM_PASS_SCORE,
  gradeAcademyExam,
  parseAcademyExamQuestions,
  serializeAcademyExamQuestions,
} from "@/lib/academy/exam";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";

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

function extractDollarBlob(sql: string, tag: string): string {
  const open = `$${tag}$`;
  const start = sql.indexOf(open);
  expect(start).toBeGreaterThanOrEqual(0);
  const end = sql.indexOf(open, start + open.length);
  expect(end).toBeGreaterThan(start);
  return sql.slice(start + open.length, end);
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

  it("dört büyüme SKU tohumu taşır; sınav havuzu ≥10 soru, fiyat kurs satırında değil katalog birimindedir", () => {
    expect(ACADEMY_COURSE_SEEDS).toHaveLength(4);
    expect(ACADEMY_SEED_MODULE_KEY).toBe(ACADEMY_MODULE_KEY);
    expect(ACADEMY_SEED_CURRENCY).toBe("TRY");
    const slugs = ACADEMY_COURSE_SEEDS.map((row) => row.slug);
    expect(slugs).toEqual(["python-temel", "fullstack-temel", "ai-temel", "ux-temel"]);
    expect(slugs).not.toContain("rail-temel");
    expect(slugs).not.toContain("yz-icerik-gorsel-uretim");
    const pythonTemel = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "python-temel");
    expect(pythonTemel?.title).toBe("Python ile Sıfırdan Programlama ve Problem Çözme");
    expect(pythonTemel?.seedAmountMinor).toBeGreaterThan(0);
    expect(Number.isInteger(pythonTemel?.seedAmountMinor)).toBe(true);
    expect(pythonTemel?.seedMinMinor).toBeLessThanOrEqual(pythonTemel!.seedAmountMinor);
    expect(pythonTemel?.seedMaxMinor).toBeGreaterThanOrEqual(pythonTemel!.seedAmountMinor);
    expect(pythonTemel?.trendScore).toBe(1);
    expect(pythonTemel?.catalogSortOrder).toBe(1);
    expect(pythonTemel?.exam.questions.length).toBeGreaterThanOrEqual(10);
    expect(pythonTemel?.exam.passScore).toBe(ACADEMY_EXAM_PASS_SCORE);
    expect(pythonTemel?.exam.questions.some((q) => q.correctIndex === 1)).toBe(true);
    for (const row of ACADEMY_COURSE_SEEDS) {
      expect(row.catalogUnitKey.startsWith("course:")).toBe(true);
      expect(row.seedAmountMinor).toBeGreaterThan(0);
      expect(Number.isInteger(row.seedAmountMinor)).toBe(true);
      expect(row.seedMinMinor).toBeLessThanOrEqual(row.seedAmountMinor);
      expect(row.seedMaxMinor).toBeGreaterThanOrEqual(row.seedAmountMinor);
      expect(row.level.trim().length).toBeGreaterThan(0);
      expect(row.globalRank).toBeGreaterThan(0);
      expect(row.localRank).toBeGreaterThan(0);
      expect(row.trendScore).toBe(row.globalRank * row.localRank);
      expect(row.catalogSortOrder).toBeGreaterThan(0);
      expect(Number.isInteger(row.catalogSortOrder)).toBe(true);
      expect(row.exam.passScore).toBe(ACADEMY_EXAM_PASS_SCORE);
      expect(row.exam.questions.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("ops SQL sicil anahtarları, tutarlar ve müfredat JSON ile hizalıdır", () => {
    const sql = academySeedSql();
    expect(sql).toMatch(/ON CONFLICT \(module_key, unit_key\) DO UPDATE/);
    expect(sql).toMatch(/price_catalog_entries\.updated_by IS NOT NULL/);
    expect(sql).toMatch(/THEN price_catalog_entries\.amount_minor/);
    expect(sql).toMatch(/updated_by = price_catalog_entries\.updated_by/);
    expect(sql).toMatch(/ON CONFLICT \(id\) DO UPDATE/);
    expect(sql).toMatch(/ON CONFLICT \(course_id\) DO UPDATE/);
    expect(sql).not.toMatch(/INSERT INTO public\.academy_purchases/i);
    expect(sql).not.toMatch(/INSERT INTO public\.academy_certificates/i);
    expect(sql).not.toMatch(/INSERT INTO public\.users/i);
    expect(sql).not.toMatch(/INSERT INTO public\.career_visa_stamps/i);
    expect(sql).toContain("'academy'");

    for (const row of ACADEMY_COURSE_SEEDS) {
      expect(sql).toContain(row.id);
      expect(sql).toContain(row.slug);
      expect(sql).toContain(row.title);
      expect(sql).toContain(row.summary);
      expect(sql).toContain(row.catalogUnitKey);
      expect(sql).toContain(row.catalogEntryId);
      expect(sql).toContain(String(row.seedAmountMinor));
      expect(sql).toContain(String(row.seedMinMinor));
      expect(sql).toContain(String(row.seedMaxMinor));
      expect(sql).toContain(row.exam.id);
      expect(sql).toContain(row.exam.title);
      const blob = extractDollarBlob(sql, row.exam.id);
      expect(blob).toBe(serializeAcademyExamQuestions(row.exam.questions));
      const parsed = parseAcademyExamQuestions(blob);
      expect(parsed).toHaveLength(row.exam.questions.length);
      const perfect = row.exam.questions.map((question) => ({
        questionId: question.id,
        choiceIndex: question.correctIndex,
      }));
      expect(gradeAcademyExam(parsed, perfect).score).toBe(100);
    }
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
    expect(page).not.toContain("ACADEMY_SHOWCASE");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain(
      "Onaylı Eğitimler · Piyasa değerine göre dinamik fiyat · Tekil Masterclass veya çoklu modül · Eğitim veya Doğrudan Sınav/Vize · Baraj 70+ · Mühürlü Ustalık Belgesi",
    );
    expect(readSrc("lib/copy/sen-voice/academy.ts")).not.toContain("₺690");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).not.toContain("₺990");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).not.toContain("₺1.490");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).not.toContain("Canlı sicil");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain("Piyasa Talep Skoru");
    expect(load).toContain("listPublishedCourses");
    expect(readSrc("lib/academy/prisma-store.ts")).toContain("orderAcademyCatalogByCurriculum");
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
    expect(list).toContain("ACADEMY_SEN");
    expect(list).toContain("CourseCard");
    expect(list).toContain('surface = "catalog"');
    expect(readSrc("components/academy/course-card.tsx")).toContain("resolveAcademyCatalogCardCta");
    expect(readSrc("lib/academy/storefront-cta.ts")).toContain("/academy/${input.slug}");
    expect(readSrc("components/academy/course-card.tsx")).not.toContain("MarketPopularityBadge");
    expect(readSrc("components/academy/course-card.tsx")).toContain('hit="card"');
    expect(readSrc("components/academy/level-pathway.tsx")).not.toContain("MarketPopularityBadge");
    expect(existsSync(join(ROOT, "components/academy/filter-bar.tsx"))).toBe(false);
    expect(readSrc("components/showcase/listing-card.tsx")).toContain("justify-end");
    expect(list).toContain("courses.length === 0");
    expect(detail).toContain("loadCourseBySlug");
    expect(detail).toContain("PurchaseButton");
    expect(detail).toContain("ExamStartGate");
    expect(detail).not.toContain("ExamPanel");
    expect(detail).toContain("libraryGuarantee");
    expect(detail).toContain("trainingHref");
    expect(detail).not.toContain("examHref");
    expect(detail).not.toContain("?gate=exam");
    expect(readSrc("lib/academy/purchase-path.ts")).toContain("Eğitimi Satın Al & Öğren");
    expect(readSrc("lib/academy/purchase-path.ts")).toContain("Doğrudan Sınava Gir & Vize Al");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("ExamPanel");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("role=\"dialog\"");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("data-academy-exam-exit");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain("Müfredat Sınavına Başla");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain(
      "Bu sınav ${minutes} dakikadır ve baraj puanı ${passScore}'tir. Başla butonuna bastığında süren başlar.",
    );
    expect(detail).toContain("/oyna");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).toContain("CurriculumPlayer");
    expect(readSrc("lib/academy/index.ts")).toContain("curriculum");
  });
});
