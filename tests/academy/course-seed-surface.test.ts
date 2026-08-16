import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_COURSE_SEEDS,
  ACADEMY_SEED_CURRENCY,
  ACADEMY_SEED_MODULE_KEY,
} from "@/lib/academy/seed";
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
  it("iki yayında teknik kurs taşır; fiyat kurs satırında değil katalog birimindedir", () => {
    expect(ACADEMY_COURSE_SEEDS).toHaveLength(2);
    expect(ACADEMY_SEED_MODULE_KEY).toBe(ACADEMY_MODULE_KEY);
    expect(ACADEMY_SEED_CURRENCY).toBe("TRY");
    const slugs = ACADEMY_COURSE_SEEDS.map((row) => row.slug);
    expect(slugs).toContain("rail-temel");
    expect(slugs).toContain("rayli-sinyal-emniyet");
    for (const row of ACADEMY_COURSE_SEEDS) {
      expect(row.catalogUnitKey.startsWith("course:")).toBe(true);
      expect(row.seedAmountMinor).toBeGreaterThan(0);
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
    const load = readSrc("lib/academy/load.ts");
    const list = readSrc("components/academy/course-list.tsx");
    const detail = readSrc("app/academy/[slug]/page.tsx");

    expect(page).toContain("loadPublishedCourses");
    expect(page).toContain("SEN_VOICE");
    expect(page).not.toContain("ACADEMY_SHOWCASE");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain("Canlı sicil");
    expect(load).toContain("listPublishedCourses");
    expect(load).toContain("ACADEMY_MODULE_KEY");
    expect(load).toContain("course.catalogUnitKey");
    expect(load).toContain("findActiveEntry");
    expect(list).toContain("ACADEMY_SHOWCASE");
    expect(list).toContain("/academy/${course.slug}");
    expect(list).toContain("courses.length === 0");
    expect(detail).toContain("loadCourseBySlug");
    expect(detail).toContain("PurchaseButton");
    expect(detail).toContain("ExamPanel");
    expect(detail).toContain("/oyna");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).toContain("CurriculumPlayer");
    expect(readSrc("lib/academy/index.ts")).toContain("curriculum");
  });
});
