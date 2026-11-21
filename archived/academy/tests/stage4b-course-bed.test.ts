import { describe, expect, it } from "vitest";
import { BOT104_LESSON_KEYS } from "@/lib/academy/curricula/bot-104/spoken-body";
import { PR105_LESSON_KEYS } from "@/lib/academy/curricula/pr-105/spoken-body";
import { SM103_LESSON_KEYS } from "@/lib/academy/curricula/sm-103/spoken-body";
import {
  ACADEMY_STAGE4B_BED_SPEECH_DB,
  ACADEMY_STAGE4B_BED_SPEECH_GAIN,
  academyBedDbToLinear,
  academyBedSpeechGainForLesson,
  academyLessonBedPromptForLesson,
  academyStage4bBedTheme,
} from "@/lib/academy/lesson-bed-duck";

describe("Aşama 4-B kurs yatakları", () => {
  it("üç eğitim ayrı tema okur ve konuşma altında −22 dB durur", () => {
    expect(academyStage4bBedTheme("05_prompt_practice-1")).toBe("deep-focus-ambient");
    expect(academyStage4bBedTheme("03_social_media_ai-3")).toBe("studio-lofi-downtempo");
    expect(academyStage4bBedTheme("04_chatbot_nocode-6")).toBe("tech-modular-ambient");
    expect(academyStage4bBedTheme("02_ecommerce_ai-1")).toBeNull();

    const prompts = [
      academyLessonBedPromptForLesson(PR105_LESSON_KEYS[0]),
      academyLessonBedPromptForLesson(SM103_LESSON_KEYS[0]),
      academyLessonBedPromptForLesson(BOT104_LESSON_KEYS[0]),
    ];
    expect(new Set(prompts).size).toBe(3);
    for (const prompt of prompts) {
      expect(prompt).toMatch(/no vocals/i);
      expect(prompt).toContain("44.1 kHz stereo");
    }
    expect(prompts[0]).toMatch(/Deep focus ambient/i);
    expect(prompts[1]).toMatch(/lo-fi downtempo/i);
    expect(prompts[2]).toMatch(/Tech modular/i);

    expect(ACADEMY_STAGE4B_BED_SPEECH_DB).toBe(-22);
    expect(ACADEMY_STAGE4B_BED_SPEECH_GAIN).toBe(academyBedDbToLinear(-22));
    for (const key of [...PR105_LESSON_KEYS, ...SM103_LESSON_KEYS, ...BOT104_LESSON_KEYS]) {
      expect(academyBedSpeechGainForLesson(key)).toBe(ACADEMY_STAGE4B_BED_SPEECH_GAIN);
    }
    expect(academyBedSpeechGainForLesson("01_office_ai-1")).not.toBe(ACADEMY_STAGE4B_BED_SPEECH_GAIN);
  });
});
