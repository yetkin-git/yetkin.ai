import { describe, expect, it } from "vitest";
import { ACADEMY_MATCH_WHISTLE_MAX } from "@/lib/academy/production-standard";
import { JUNIOR_FEN_LESSONS } from "@/lib/junior/content/fen";
import { JUNIOR_ING_LESSONS } from "@/lib/junior/content/ing";
import { JUNIOR_MAT_LESSONS } from "@/lib/junior/content/mat";
import { JUNIOR_MAT_5 } from "@/lib/junior/content/mat/1";
import { JUNIOR_AUDIO_MANIFEST } from "@/lib/junior/audio-manifest.generated";
import { juniorSealedScenarioCount } from "../../packages/junior-content/src/sealed-roster";
import { JUNIOR_ELECTIVE_SLUGS } from "@/lib/junior/limits";
import { JUNIOR_SOSYAL_LESSONS } from "@/lib/junior/content/sosyal";
import { JUNIOR_TURKCE_LESSONS } from "@/lib/junior/content/turkce";
import { academyBakeVoiceModelId } from "@/lib/kernel/ai/model-roles";
import { juniorTeacherForLesson } from "@/lib/junior/voice";
import {
  JUNIOR_CATALOG_NARRATOR_VOICE,
  JUNIOR_CHILD_VOICE_PEER_GUARD,
  JUNIOR_CHILD_VOICE_PROMPT,
  JUNIOR_VOICE_DESIGN,
  isGeminiDesignedVoiceId,
  juniorDesignedVoiceIdFromReceipt,
  juniorVoiceDesignCreateBody,
  juniorVoiceDesignPromptHash,
  juniorVoiceDesignTranscript,
} from "@/lib/junior/voice-design";

describe("Junior çocuk ses tasarımı", () => {
  it("voicePrompt CEO cümlesini ve 5-8 akran kilidini taşır; TTS systemInstruction gövdesine basılmaz", () => {
    expect(JUNIOR_VOICE_DESIGN.voicePrompt.startsWith(JUNIOR_CHILD_VOICE_PROMPT)).toBe(true);
    expect(JUNIOR_VOICE_DESIGN.voicePrompt).toContain(JUNIOR_CHILD_VOICE_PEER_GUARD);
    expect(JUNIOR_VOICE_DESIGN.voicePrompt).toContain("10-to-12-year-old");
    expect(JUNIOR_VOICE_DESIGN.voicePrompt).toContain("grades 5-8");
    expect(JUNIOR_VOICE_DESIGN.voicePrompt).toContain("Not a baby");
    expect(JUNIOR_VOICE_DESIGN.systemInstruction).toBe(JUNIOR_VOICE_DESIGN.voicePrompt);
    expect(JUNIOR_VOICE_DESIGN.turnStyle.length).toBeLessThan(80);

    const body = juniorVoiceDesignCreateBody();
    expect(body.store).toBe(true);
    expect(body.voice.type).toBe("prompted");
    expect(body.voice.model).toBe(academyBakeVoiceModelId());
    expect(body.voice.language_code).toBe("tr-TR");
    expect(body.voice.prompted.input).toBe(JUNIOR_VOICE_DESIGN.voicePrompt);
    expect(JSON.stringify(body)).not.toContain("systemInstruction");
    expect(body.voice.prompted.input).toContain("Not a baby, toddler, or squeaky cartoon voice");
  });

  it("kayıtlı voice_ kimliğini komut özeti uyuşursa kabul eder", () => {
    const hash = juniorVoiceDesignPromptHash();
    const model = academyBakeVoiceModelId();
    expect(
      juniorDesignedVoiceIdFromReceipt({
        v: 1,
        model,
        voiceId: "voice_juniorAkran1",
        promptHash: hash,
        displayName: JUNIOR_VOICE_DESIGN.displayName,
      }),
    ).toBe("voice_juniorAkran1");
    expect(JUNIOR_CATALOG_NARRATOR_VOICE).toBe("Fenrir");
    expect(juniorTeacherForLesson("jr_06_fen-1").voice).toBe(JUNIOR_CATALOG_NARRATOR_VOICE);
    expect(juniorTeacherForLesson("jr_06_mat-1").voice).toBe(JUNIOR_CATALOG_NARRATOR_VOICE);
    expect(isGeminiDesignedVoiceId(JUNIOR_CATALOG_NARRATOR_VOICE)).toBe(false);
    expect(isGeminiDesignedVoiceId("Charon")).toBe(false);
    expect(
      juniorDesignedVoiceIdFromReceipt({
        v: 1,
        model,
        voiceId: "Charon",
        promptHash: hash,
        displayName: JUNIOR_VOICE_DESIGN.displayName,
      }),
    ).toBeNull();
    expect(
      juniorDesignedVoiceIdFromReceipt({
        v: 1,
        model,
        voiceId: "voice_juniorAkran1",
        promptHash: "eski",
        displayName: JUNIOR_VOICE_DESIGN.displayName,
      }),
    ).toBeNull();
  });

  it("jr_06_mat-1 transkripti bölünebilmeyi okur, yönetmen katmanını okumaz", () => {
    const transcript = juniorVoiceDesignTranscript(JUNIOR_MAT_5.listenText);
    expect(transcript).toContain("kalansız");
    expect(transcript).not.toContain("[pause]");
    expect(transcript).not.toContain("# AUDIO PROFILE");
    expect(transcript).not.toContain("DIRECTOR'S NOTES");
    expect(transcript).not.toContain("systemInstruction");
  });

  it("mühürlü dersler kurs kurs düdük tavanının altında kalır", () => {
    const courses = [JUNIOR_MAT_LESSONS, JUNIOR_FEN_LESSONS, JUNIOR_TURKCE_LESSONS, JUNIOR_SOSYAL_LESSONS, JUNIOR_ING_LESSONS];
    const total = courses.reduce((sum, lessons) => sum + lessons.length, 0);
    const electiveAudio = Object.keys(JUNIOR_AUDIO_MANIFEST).filter((key) =>
      JUNIOR_ELECTIVE_SLUGS.some((slug) => key.startsWith(`${slug}-`)),
    );
    expect(electiveAudio).toHaveLength(JUNIOR_ELECTIVE_SLUGS.length * 2);
    expect(total + electiveAudio.length).toBe(Object.keys(JUNIOR_AUDIO_MANIFEST).length);
    expect(juniorSealedScenarioCount()).toBeGreaterThanOrEqual(total);
    expect(JUNIOR_MAT_LESSONS[0]?.key).toBe("jr_06_mat-1");
    for (const lessons of courses) {
      expect(lessons.length + 1).toBeLessThanOrEqual(ACADEMY_MATCH_WHISTLE_MAX);
    }
  });
});
