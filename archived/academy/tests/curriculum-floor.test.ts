import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  academyCurriculumFloorViolations,
  academyLiveCurriculumFloorViolations,
  type AcademyCurriculumFloorCourse,
} from "@/lib/academy/curriculum-floor";
import { ACADEMY_AI_LESSON_SPOKEN_WORD_MIN } from "@/lib/academy/production-standard";

const ROOT = process.cwd();

function words(count: number): string {
  return Array.from({ length: count }, () => "kelime").join(" ");
}

function course(
  label: string,
  lengths: readonly number[],
): AcademyCurriculumFloorCourse {
  return {
    label,
    sections: lengths.map((length, index) => ({
      lessonKey: `${label}-${index + 1}`,
      title: `Ders ${index + 1}`,
      contentMarkdown: words(length),
    })),
  };
}

describe("akademi ders ve kelime muhafızı", () => {
  it("600 kelimenin altındaki tek ders ve 6'dan az bölüm fail-closed üretir", () => {
    const shortLesson = academyCurriculumFloorViolations([
      course("kisa", [600, 600, 600, 600, 600, 599]),
    ]);
    expect(shortLesson.some((line) => line.includes("599 kelime") && line.includes("Fail-closed"))).toBe(
      true,
    );

    const shortCourse = academyCurriculumFloorViolations([
      course("bes", [600, 600, 600, 600, 600]),
    ]);
    expect(shortCourse.some((line) => line.includes("ders sayısı 5") && line.includes("Fail-closed"))).toBe(
      true,
    );

    const emptySkeleton = academyCurriculumFloorViolations([course("iskelet", [])]);
    expect(emptySkeleton).toEqual([]);

    const held = academyCurriculumFloorViolations([
      course("tam", Array.from({ length: 6 }, () => ACADEMY_AI_LESSON_SPOKEN_WORD_MIN)),
    ]);
    expect(held).toEqual([]);
  });

  it("yazılmış canlı eğitimler tabanı tutar ve prebuild bu taramayı koşar", () => {
    expect(academyLiveCurriculumFloorViolations()).toEqual([]);
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const curriculumScript = pkg.scripts["verify:academy-curriculum"] ?? "";
    const prebuild = pkg.scripts["verify:prebuild"] ?? "";
    expect(curriculumScript).toBe("tsx scripts/verify-academy-curriculum.ts");
    expect(prebuild).toContain("verify:academy-curriculum");
    const publicSizeAt = prebuild.indexOf("verify:public-size");
    const curriculumAt = prebuild.indexOf("verify:academy-curriculum");
    expect(curriculumAt).toBeGreaterThan(publicSizeAt);
  });
});
