import { describe, expect, it } from "vitest";
import { officeAiMasteryModule } from "@/lib/academy/curricula/office_ai";
import {
  academyCourseSealedDurationMinutes,
  academyCourseSealedDurationSec,
} from "@/lib/academy/lesson-audio";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import {
  ACADEMY_AI_LESSON_DURATION_MAX_SEC,
  ACADEMY_AI_LESSON_DURATION_MIN_SEC,
  isAcademyAiCourseDurationMinutes,
} from "@/lib/academy/production-standard";
import { loadAcademySpokenScriptProse } from "@/lib/academy/spoken-scripts";

const SLUG = "01_office_ai";

describe("mühürlü süre bandı ve kurs SSOT", () => {
  it("kurs süresi timings toplamından türetilir; el yazması 73.32 yoktur", () => {
    const sec = academyCourseSealedDurationSec(SLUG);
    const minutes = academyCourseSealedDurationMinutes(SLUG);
    expect(sec).toBeGreaterThan(0);
    expect(minutes).toBe(Math.round((sec / 60) * 100) / 100);
    expect(officeAiMasteryModule.estimatedTotalMinutes).toBe(minutes);
    expect(isAcademyAiCourseDurationMinutes(minutes)).toBe(true);
    expect(ACADEMY_AI_LESSON_DURATION_MIN_SEC).toBe(420);
    expect(ACADEMY_AI_LESSON_DURATION_MAX_SEC).toBe(720);
  });

  it("k1 ve 6 konuşma metni bant uzatmasını taşır", () => {
    const k1 = loadAcademySpokenScriptProse("01_office_ai-k1");
    const capstone = loadAcademySpokenScriptProse("01_office_ai-6");
    expect(k1).toMatch(/MASKELİ TELEFON/u);
    expect(k1).toMatch(/MASKELİ MAAŞ/u);
    expect(capstone).toMatch(/yinelenen bir takvim bloğu/u);
  });

  it("9 kaset timings okunur; underBand boş, tüm dersler 420–720 yeşilindedir", () => {
    const keys = curriculumLessonKeysForSlug(SLUG);
    expect(keys).toHaveLength(8);
    const underBand: string[] = [];
    const overBand: string[] = [];
    for (const key of keys) {
      const timings = loadAcademySealedAudioTimings(key);
      expect(timings, key).not.toBeNull();
      expect(timings!.durationSec).toBeGreaterThan(0);
      if (timings!.durationSec < ACADEMY_AI_LESSON_DURATION_MIN_SEC) {
        underBand.push(key);
      }
      if (timings!.durationSec > ACADEMY_AI_LESSON_DURATION_MAX_SEC) {
        overBand.push(key);
      }
    }
    expect(underBand).toEqual([]);
    expect(overBand).toEqual([]);
  });
});
