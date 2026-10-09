import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  juniorCatalogLessonKeys,
  juniorCourseByLessonKey,
  juniorLessonByKey,
} from "@/lib/junior/catalog";
import {
  JUNIOR_COURSE_TITLES,
  juniorCourseTitleBySlug,
  juniorCourseTitleFromLessonKey,
  juniorLessonTitleByKey,
} from "@/lib/junior/human-titles";

describe("Junior insanî başlık sözlüğü", () => {
  it("çekirdek ders kodlarını sınıf başlığına bağlar", () => {
    expect(juniorCourseTitleBySlug("jr_06_mat")).toBe("6. Sınıf Matematik");
    expect(juniorCourseTitleBySlug("jr_06_fen")).toBe("6. Sınıf Fen Bilimleri");
    expect(juniorCourseTitleBySlug("jr_06_turkce")).toBe("6. Sınıf Türkçe");
    expect(juniorCourseTitleBySlug("jr_06_sosyal")).toBe("6. Sınıf Sosyal Bilgiler");
    expect(juniorCourseTitleBySlug("jr_06_ing_main")).toBe("6. Sınıf İngilizce");
    expect(JUNIOR_COURSE_TITLES.jr_06_ing_main).toBe("6. Sınıf İngilizce");
  });

  it("katalogdaki her ders anahtarının başlığı sözlükle aynıdır", () => {
    const keys = juniorCatalogLessonKeys();
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      const lesson = juniorLessonByKey(key);
      const course = juniorCourseByLessonKey(key);
      expect(lesson).not.toBeNull();
      expect(course).not.toBeNull();
      expect(juniorLessonTitleByKey(key)).toBe(lesson?.title);
      expect(juniorCourseTitleFromLessonKey(key)).toBe(course?.title);
      expect(juniorCourseTitleBySlug(course?.slug ?? "")).toBe(course?.title);
      expect(juniorLessonTitleByKey(key)).not.toMatch(/^jr_/);
      expect(juniorCourseTitleFromLessonKey(key)).not.toMatch(/^jr_/);
    }
  });

  it("ders sayfası slug'ı rozet ve ekmek kırıntısına ham basmaz", () => {
    const page = readFileSync(join(process.cwd(), "app/junior/ders/[lessonKey]/page.tsx"), "utf8");
    expect(page).toContain("juniorCourseTitleFromLessonKey");
    expect(page).toContain("BreadcrumbPageLabel");
    expect(page).toContain("{courseLabel}");
    expect(page).toContain("label={lesson.title}");
    expect(page).not.toContain("{lesson.courseTitle}");
    expect(page).not.toContain(">{lessonKey}<");
  });
});
