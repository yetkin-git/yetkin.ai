import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { academyInstructorBySlug, academyInstructorHonorific } from "@/lib/academy/instructors";
import { isAcademyLessonBedSealed } from "@/lib/academy/lesson-audio";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import {
  ACADEMY_EC102_BED_SPEECH_GAIN,
  academyBedSpeechGainForLesson,
} from "@/lib/academy/lesson-bed-duck";
import { loadAcademyLessonPlaybackCues, hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { loadAcademyTeleprompterFlow } from "@/lib/academy/lesson-teleprompter-flow";
import { academyLessonWarmupVeoAssetKey } from "@/lib/academy/lesson-veo";
import { hasAcademyLessonVisualStage } from "@/lib/academy/lesson-visual-stage";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import {
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

const SLUG = "02_ecommerce_ai";

describe("02_ecommerce_ai gövde ve cue — ses mührü fırın sonrası", () => {
  it("konuşma gövdesi ve cue durur; karaoke ses dosyası mühürlenmeden açılmaz", () => {
    const lessons = curriculumForCourseSlug(SLUG);
    expect(lessons).toHaveLength(6);
    expect(lessons[0]?.body).toContain("Merhaba, ben Kaan");
    expect(lessons[0]?.body).toContain("Şimdi vitrinin başına beraber geçelim");
    expect(lessons[0]?.body).not.toContain("Gel, vitrinin");
    expect(lessons[0]?.body).not.toContain("Kaan Usta");
    expect(lessons[0]?.body).not.toContain("Merhaba, ben Selin");
    expect(lessons[0]?.body).not.toContain("Merhaba, ben Deniz");
    expect(isAcademySpokenScriptLessonKey(`${SLUG}-1`)).toBe(false);
    expect(loadAcademySpokenScriptProse(`${SLUG}-1`)).toContain("Merhaba, ben Kaan");
    expect(hasAcademyLessonCues(`${SLUG}-1`)).toBe(true);
    expect(hasAcademyLessonVisualStage(`${SLUG}-1`)).toBe(true);
    expect(isAcademyLessonAudioSealed(SLUG, `${SLUG}-1`)).toBe(true);
    expect(academyCitizenPlayerLayer(SLUG, `${SLUG}-1`).kind).toBe("article+karaoke");
    expect(academyInstructorBySlug(SLUG).name).toBe("Kaan");
    expect(academyInstructorBySlug(SLUG).greetingLead).toBe("Merhaba, ben Kaan");
    expect(academyInstructorHonorific(academyInstructorBySlug(SLUG))).toBe("Kaan Bey");
    expect(academyInstructorBySlug(SLUG).voice).toBe("Puck");
    expect(academyInstructorBySlug(SLUG).gender).toBe("erkek");
    expect(isAcademyLessonBedSealed(SLUG, `${SLUG}-1`)).toBe(true);
    expect(academyBedSpeechGainForLesson(`${SLUG}-1`)).toBe(ACADEMY_EC102_BED_SPEECH_GAIN);
    expect(academyLessonWarmupVeoAssetKey(`${SLUG}-1`)).toBe("02_ecommerce_ai-listing-warmup");
    const cues = loadAcademyLessonPlaybackCues(`${SLUG}-1`);
    const duration = loadAcademySealedAudioTimings(`${SLUG}-1`)?.durationSec ?? 0;
    expect(cues.at(-1)?.end).toBeCloseTo(duration, 3);
    for (let index = 1; index < cues.length; index += 1) {
      expect(cues[index]!.start).toBeGreaterThanOrEqual(cues[index - 1]!.end);
    }
  });

  it("PttAVM ekranda durur; TTS okuması Pe te te A Ve Me olur", () => {
    const screen = loadAcademyLessonPlaybackCues(`${SLUG}-1`)
      .flatMap((cue) => cue.paragraphs ?? [])
      .join("\n");
    const spoken = loadAcademySpokenScriptMarkdownParagraphs(`${SLUG}-1`).join("\n");
    const captions = loadAcademyTeleprompterFlow(`${SLUG}-1`)
      .map((line) => line.text)
      .join("\n");
    expect(screen).toContain("PttAVM");
    expect(screen).not.toContain("Pe te te A Ve Me");
    expect(screen).not.toContain("Piti avm");
    expect(spoken.match(/Pe te te A Ve Me/gu)).toHaveLength(3);
    expect(spoken).not.toContain("PttAVM");
    expect(spoken).not.toContain("Piti avm");
    expect(captions).toContain("PttAVM");
    expect(captions).not.toContain("Pe te te A Ve Me");
    expect(captions).not.toContain("Piti avm");
  });
});
