import { describe, expect, it } from "vitest";
import { shouldAutoAdvanceAfterListenEnded } from "@/lib/academy/lesson-advance";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { composeAcademyLessonBlocks } from "@/lib/academy/lesson-media";
import {
  ACADEMY_LESSON_LISTEN_PLAYBACK_RATE,
  ACADEMY_LISTEN_FALLBACK_AUDIO_MAX_SEC,
  ACADEMY_LISTEN_FALLBACK_KIND_LOCAL,
  ACADEMY_LISTEN_MIN_MS_PER_WORD,
  academyLessonListenPreparedTurns,
  academyListenReadingDurationSec,
  academyListenSlicesReadingDurationSec,
  academyListenWordCount,
  formatAcademyListenTextDurationHeader,
  isAcademyListenFallbackFullAudio,
  isAcademyListenQuotaReason,
  isAcademyListenShortFallbackPart,
  parseAcademyListenTextDurationHeader,
} from "@/archived/lib/academy-studio/lesson-listen";
import {
  academyListenScriptDurationSec,
  buildAcademyLessonListenScript,
} from "@/archived/lib/academy-studio/lesson-listen-script";

function humanReadingSec(words: number, playbackRate: number): number {
  return (words * ACADEMY_LISTEN_MIN_MS_PER_WORD) / 1000 / playbackRate;
}

describe("dersi dinle fallback metin saati", () => {
  it("okuma süresi kelime × 420 ms / playbackRate hesabıdır", () => {
    expect(ACADEMY_LESSON_LISTEN_PLAYBACK_RATE).toBe(0.94);
    expect(ACADEMY_LISTEN_MIN_MS_PER_WORD).toBe(420);
    expect(academyListenWordCount("bir iki üç dört")).toBe(4);
    expect(academyListenReadingDurationSec("bir iki üç dört")).toBeCloseTo(humanReadingSec(4, 0.94), 5);
    expect(academyListenReadingDurationSec("bir iki üç dört")).not.toBeCloseTo(4 / 0.94, 5);
    expect(
      academyListenSlicesReadingDurationSec([
        { text: "bir iki", speaker: "instructor" },
        { text: "üç", speaker: "moderator" },
      ]),
    ).toBeCloseTo(humanReadingSec(2, 0.94) + humanReadingSec(1, 1), 5);
    expect(formatAcademyListenTextDurationHeader(12.34)).toBe("12.3");
    expect(parseAcademyListenTextDurationHeader("142.6")).toBe(142.6);
  });

  it("python-temel-1 okuma süresi 10:07 kaseti değil, insani okuma bandındadır", () => {
    const lesson = curriculumForCourseSlug("python-temel")[0]!;
    expect(lesson.key).toBe("python-temel-1");
    const prepared = academyLessonListenPreparedTurns(lesson.title, lesson.body, "python-temel");
    const sliceSec = academyListenSlicesReadingDurationSec(prepared);
    const script = buildAcademyLessonListenScript({
      lessonKey: lesson.key,
      title: lesson.title,
      body: lesson.body,
      courseSlug: "python-temel",
      blocks: composeAcademyLessonBlocks(lesson),
    });
    const scriptSec = academyListenScriptDurationSec(script);
    // Taslak-only gövde (Faz 2: ısınma/pusula fabrikası yok) — 10:07 kaseti hâlâ yasak.
    expect(sliceSec).toBeGreaterThanOrEqual(3 * 60);
    expect(sliceSec).toBeLessThanOrEqual(4 * 60 + 20);
    expect(scriptSec).toBeGreaterThanOrEqual(3 * 60);
    expect(scriptSec).toBeLessThanOrEqual(4 * 60 + 20);
    expect(sliceSec).toBeLessThan(10 * 60);
    expect(Math.abs(scriptSec - sliceSec)).toBeLessThan(45);
  });

  it("kısa sessiz WAV ve 7sn birleşik tampon fallback saatini açar", () => {
    expect(isAcademyListenShortFallbackPart(0.7)).toBe(true);
    expect(isAcademyListenShortFallbackPart(ACADEMY_LISTEN_FALLBACK_AUDIO_MAX_SEC + 0.1)).toBe(false);
    expect(isAcademyListenFallbackFullAudio(7, 180)).toBe(true);
    expect(isAcademyListenFallbackFullAudio(180, 180)).toBe(false);
  });

  it("kota düşüşünde fallback başlığı local-voice değerini taşır; stüdyo WAV yoktur, Okuma Modu açılır", () => {
    expect(ACADEMY_LISTEN_FALLBACK_KIND_LOCAL).toBe("local-voice");
    expect(isAcademyListenQuotaReason("gemini-quota")).toBe(true);
    expect(isAcademyListenQuotaReason("gemini-timeout")).toBe(false);
  });

  it("fallback seste otomatik ders geçişini keser", () => {
    expect(
      shouldAutoAdvanceAfterListenEnded({ autoAdvanceEnabled: true, fallback: false }),
    ).toBe(true);
    expect(
      shouldAutoAdvanceAfterListenEnded({ autoAdvanceEnabled: true, fallback: true }),
    ).toBe(false);
    expect(
      shouldAutoAdvanceAfterListenEnded({ autoAdvanceEnabled: false, fallback: false }),
    ).toBe(false);
  });
});
