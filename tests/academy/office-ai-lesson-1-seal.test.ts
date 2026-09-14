import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ACADEMY_BED_BREATH_GAIN,
  ACADEMY_BED_BREATH_MAX_SEC,
  ACADEMY_BED_BREATH_MIN_SEC,
  ACADEMY_BED_OUTRO_FADE_SEC,
  ACADEMY_BED_OUTRO_HOLD_SEC,
  ACADEMY_BED_OUTRO_PEAK_GAIN,
  ACADEMY_BED_SPEECH_GAIN,
  academyBedDuckGain,
  academyBedIsSpeech,
} from "@/lib/academy/lesson-bed-duck";
import { isAcademyLessonBedSealed } from "@/lib/academy/lesson-audio";
import { loadAcademyLessonExam } from "@/lib/academy/lesson-exams";
import { academyExamQuestionsForSlug } from "@/lib/academy/seed";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";

const ROOT = process.cwd();
const PIECES = [
  { start: 0, end: 40 },
  { start: 50, end: 80 },
] as const;

describe("01_office_ai-1 mühür bağları — punchcard, Lyria ducking, sınav oturumu", () => {
  it("Lyria ducking konuşmada dipte, 3–5 sn nefes payında yükselir", () => {
    expect(ACADEMY_BED_BREATH_MIN_SEC).toBe(3);
    expect(ACADEMY_BED_BREATH_MAX_SEC).toBe(5);
    expect(academyBedIsSpeech(10, PIECES)).toBe(true);
    expect(academyBedIsSpeech(45, PIECES)).toBe(false);
    expect(academyBedDuckGain(20, PIECES)).toBe(ACADEMY_BED_SPEECH_GAIN);
    expect(academyBedDuckGain(46, PIECES)).toBe(ACADEMY_BED_BREATH_GAIN);
    expect(academyBedDuckGain(40.2, PIECES)).toBeGreaterThan(ACADEMY_BED_SPEECH_GAIN);
    expect(academyBedDuckGain(40.2, PIECES)).toBeLessThan(ACADEMY_BED_BREATH_GAIN);
    const lift = [{ start: 2, end: 30, cueId: "cue-01" }] as const;
    expect(academyBedDuckGain(10, lift)).toBe(ACADEMY_BED_SPEECH_GAIN);
    expect(academyBedDuckGain(0.5, lift)).toBe(ACADEMY_BED_BREATH_GAIN);
    expect(academyBedDuckGain(2, lift)).toBe(ACADEMY_BED_BREATH_GAIN);
    const summary = [{ start: 100, end: 145, cueId: "cue-07" }] as const;
    expect(academyBedDuckGain(120, summary)).toBe(ACADEMY_BED_BREATH_GAIN);
    const close = [{ start: 2, end: 100, cueId: "cue-08" }] as const;
    expect(academyBedDuckGain(50, close)).toBe(ACADEMY_BED_SPEECH_GAIN);
    expect(academyBedDuckGain(98.5, close)).toBeGreaterThan(ACADEMY_BED_SPEECH_GAIN);
    expect(academyBedDuckGain(98.5, close)).toBeLessThan(ACADEMY_BED_BREATH_GAIN);
    expect(ACADEMY_BED_OUTRO_PEAK_GAIN).toBe(0.7);
    expect(ACADEMY_BED_OUTRO_HOLD_SEC).toBe(3);
    expect(ACADEMY_BED_OUTRO_FADE_SEC).toBe(1.5);
    expect(academyBedDuckGain(100, close)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(101.5, close)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(103.75, close)).toBeGreaterThan(0);
    expect(academyBedDuckGain(103.75, close)).toBeLessThan(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(104.5, close)).toBe(0);
    expect(isAcademyLessonBedSealed("01_office_ai", "01_office_ai-1")).toBe(true);
    const player = readFileSync(join(ROOT, "components/academy/lesson-media-player.tsx"), "utf8");
    expect(player).toContain('data-academy-bed={bedSrc ? "lyria" : undefined}');
    expect(player).toContain("data-academy-bed-outro");
    expect(player).toContain("academyBedDuckGain");
    expect(player).toContain("academyBedOutroTailSec");
    expect(player).toContain("academyLessonBedPlaybackSrc");
    const bake = readFileSync(join(ROOT, "scripts/generate-academy-lesson-bed.ts"), "utf8");
    expect(bake).toContain("lyria-3.5");
    expect(bake).toContain("--confirm-gemini-spend");
  });

  it("mini sınav baraj 70 ile AcademyExamSitting havuzuna pinlenir", () => {
    const exam = loadAcademyLessonExam("01_office_ai-1");
    expect(exam?.passScore).toBe(70);
    expect(exam?.passScore).toBe(ACADEMY_EXAM_PASS_SCORE);
    expect(exam?.questions.map((row) => row.id)).toEqual(["q_off_l1_1", "q_off_l1_2", "q_off_l1_3"]);
    const seeded = academyExamQuestionsForSlug("01_office_ai");
    expect(seeded.map((row) => row.id)).toEqual(
      expect.arrayContaining(["q_off_l1_1", "q_off_l1_2", "q_off_l1_3"]),
    );
    const engine = readFileSync(join(ROOT, "lib/academy/exam-engine.ts"), "utf8");
    expect(engine).toContain("q_off_l1_");
    expect(engine).toContain("drawAcademyExamQuestionsPinned");
    expect(engine).toContain("computeAcademyCertificateHash");
    const examPanel = readFileSync(join(ROOT, "components/academy/exam-panel.tsx"), "utf8");
    expect(examPanel).toContain("/academy/dogrula/${");
    expect(readFileSync(join(ROOT, "apps/rail-is/src/screens/AcademyPlayerScreen.tsx"), "utf8")).toContain(
      "dron-academy-punchcards",
    );
    expect(readFileSync(join(ROOT, "apps/rail-is/src/ui/academy-punchcards.ts"), "utf8")).toContain(
      "DRON_PUNCHCARD_MAX_WORDS = 3",
    );
    expect(readFileSync(join(ROOT, "apps/rail-is/src/ui/academy-punchcards.ts"), "utf8")).toContain(
      'label: "DÜZENSİZ TABLO"',
    );
  });
});
