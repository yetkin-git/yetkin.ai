import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { loadAcademyLessonExam } from "@/lib/academy/lesson-exams";
import { OFFICE_AI_EXAM_QUESTIONS } from "@/lib/academy/exam-pools";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

const SLUG = "01_office_ai";
const ROOT = process.cwd();

describe("ders sonu kendini dene — notsuz 3 soru", () => {
  it("9 ders mini sınavı oynatıcıya bağlıdır; mühür havuzuna karışmaz", () => {
    const keys = curriculumLessonKeysForSlug(SLUG);
    expect(keys).toHaveLength(9);
    for (const key of keys) {
      const exam = loadAcademyLessonExam(key);
      expect(exam, key).not.toBeNull();
      expect(exam!.questions).toHaveLength(3);
      expect(exam!.passScore).toBe(70);
      expect(exam!.questions.every((row) => row.id.startsWith("q_off_l"))).toBe(true);
    }
    expect(OFFICE_AI_EXAM_QUESTIONS.every((row) => !row.id.startsWith("q_off_l"))).toBe(true);
    expect(ACADEMY_SEN.player.selfCheckTitle).toBe("Ders Sonu Kendini Dene (Notsuz, 3 Soru)");
    expect(ACADEMY_SEN.player.selfCheckLead).toMatch(/sunucuya gitmez/u);
    expect(ACADEMY_SEN.player.selfCheckLead).toMatch(/mühür basmaz/u);
  });

  it("çalışma sekmeleri notsuz öz-değerlendirme panelini basar", () => {
    const tabs = readFileSync(join(ROOT, "components/academy/lesson-study-tabs.tsx"), "utf8");
    const selfCheck = readFileSync(join(ROOT, "components/academy/lesson-self-check.tsx"), "utf8");
    expect(tabs).toContain("LessonSelfCheck");
    expect(tabs).toContain('"self-check"');
    expect(tabs).toContain("data-academy-study-panel=\"self-check\"");
    expect(readFileSync(join(ROOT, "lib/academy/curricula/types.ts"), "utf8")).toContain(
      "Ses Gözde (Callirrhoe); vitrin/rozet adı «Eğitmen»",
    );
    expect(selfCheck).toContain("loadAcademyLessonExam");
    expect(selfCheck).toContain("data-academy-self-check-ungraded");
    expect(selfCheck).toContain("data-academy-self-check-submit");
    expect(selfCheck).not.toMatch(/fetch\(/u);
    expect(selfCheck).not.toMatch(/academyExamStartGateHref/u);
  });
});
