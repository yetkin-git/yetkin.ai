import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { ACADEMY_SEALED_AUDIO_DURATION_SEC } from "@/lib/academy/lesson-audio";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { resolveAcademyLessonPlayerAudioSrc } from "@/lib/academy/lesson-playback";
import {
  ACADEMY_GROWTH_SKU_SLUGS,
  ACADEMY_MEDIA_SEALED_AUDIO,
  ACADEMY_MEDIA_SEALED_SKU_SLUGS,
  ACADEMY_TTS_REBAKE_QUEUE,
  ACADEMY_TTS_REVOKED_CASSETTES,
  academyCourseSaleOpen,
  academyMediaSealedWavCount,
  isAcademyLessonAudioOnRebakeQueue,
  isAcademyLessonAudioSealed,
  isAcademyTtsCassetteRevoked,
} from "@/lib/academy/pilot-sku";
import {
  academyLessonAudioObjectPath,
  academyMediaReleaseCacheKey,
} from "@/lib/academy/media-release-seal";

const ROOT = process.cwd();
const OFF201 = "01_office_ai_ileri";

describe("akademi medya mühür sicili — 01_office_ai 8 kaset + OFF-201 6 kaset", () => {
  it("ses mührü 14 dersi taşır; üretim kuyruğu boş; bake allowlist 6 SKU durur", () => {
    expect(ACADEMY_MEDIA_SEALED_SKU_SLUGS).toEqual([
      "01_office_ai",
      "01_office_ai_ileri",
      "02_ecommerce_ai",
      "03_social_media_ai",
      "04_chatbot_nocode",
      "05_prompt_practice",
    ]);
    expect(ACADEMY_MEDIA_SEALED_AUDIO).toEqual({
      "01_office_ai": [
        "01_office_ai-1",
        "01_office_ai-2",
        "01_office_ai-3",
        "01_office_ai-5",
        "01_office_ai-6",
        "01_office_ai-g1",
        "01_office_ai-w1",
        "01_office_ai-k1",
      ],
      "01_office_ai_ileri": [
        "01_office_ai_ileri-1",
        "01_office_ai_ileri-2",
        "01_office_ai_ileri-3",
        "01_office_ai_ileri-4",
        "01_office_ai_ileri-5",
        "01_office_ai_ileri-6",
      ],
    });
    expect(ACADEMY_TTS_REVOKED_CASSETTES).toEqual({});
    expect(ACADEMY_TTS_REBAKE_QUEUE).toEqual({});
    expect(academyMediaSealedWavCount()).toBe(14);
    expect(academyCourseSaleOpen("01_office_ai")).toBe(true);
    expect(academyCourseSaleOpen("01_office_ai_ileri")).toBe(false);
    expect([...ACADEMY_GROWTH_SKU_SLUGS]).toEqual(["01_office_ai"]);
    expect(academyLessonAudioObjectPath("sample-course", "sample-course-1")).toBe(
      "academy/audio/sample-course/sample-course-1.wav",
    );
    expect(academyMediaReleaseCacheKey("sample-course", "sample-course-1")).toBe(
      "media-release:sample-course:sample-course-1",
    );
  });

  it("OFF-201 altı kaset vatandaş karaoke katmanında mühürlü süreyi taşır", () => {
    const rows = [
      ["01_office_ai_ileri-1", 532.798, false],
      ["01_office_ai_ileri-2", 641.229, false],
      ["01_office_ai_ileri-3", 690.602, false],
      ["01_office_ai_ileri-4", 763.174, false],
      ["01_office_ai_ileri-5", 840.464, false],
      ["01_office_ai_ileri-6", 793.186, false],
    ] as const;
    for (const [lessonKey, durationSec, rebake] of rows) {
      const minutes = durationSec / 60;
      expect(minutes, lessonKey).toBeGreaterThanOrEqual(5);
      const timings = loadAcademySealedAudioTimings(lessonKey);
      expect(timings?.durationSec, lessonKey).toBe(durationSec);
      expect(timings?.pieces.at(-1)?.end, lessonKey).toBe(durationSec);
      expect(ACADEMY_SEALED_AUDIO_DURATION_SEC[lessonKey]).toBe(Math.round(durationSec));
      const revoked = rebake;
      expect(isAcademyTtsCassetteRevoked(lessonKey)).toBe(revoked);
      expect(isAcademyLessonAudioSealed(OFF201, lessonKey)).toBe(!rebake);
      expect(isAcademyLessonAudioOnRebakeQueue(OFF201, lessonKey)).toBe(rebake);
      if (rebake) {
        expect(academyCitizenPlayerLayer(OFF201, lessonKey).kind).toBe("article");
        expect(resolveAcademyLessonPlayerAudioSrc(OFF201, lessonKey, undefined)).toBeUndefined();
        continue;
      }
      const layer = academyCitizenPlayerLayer(OFF201, lessonKey);
      expect(layer.kind, lessonKey).toBe("article+karaoke");
      if (layer.kind !== "article+karaoke") {
        continue;
      }
      expect(layer.durationSec, lessonKey).toBe(Math.round(durationSec));
      expect(layer.cues.length, lessonKey).toBeGreaterThan(0);
      expect(layer.audioSrc, lessonKey).toContain(
        `/media/academy/audio/${OFF201}/${lessonKey}.mp3`,
      );
      expect(resolveAcademyLessonPlayerAudioSrc(OFF201, lessonKey, undefined), lessonKey).toContain(
        `/media/academy/audio/${OFF201}/${lessonKey}.mp3`,
      );
      expect(
        existsSync(join(ROOT, "public/media/academy/audio", OFF201, `${lessonKey}.mp3`)),
        lessonKey,
      ).toBe(true);
    }
  });
});
