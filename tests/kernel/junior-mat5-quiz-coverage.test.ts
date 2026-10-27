import { describe, expect, it } from "vitest";
import { JUNIOR_MAT_QUIZ_5 } from "@/lib/junior/quiz/mat/1";
import { discoveryPromptsForLesson, MAT5_DISCOVERY_PROMPTS } from "@/lib/junior/discovery";
import {
  JUNIOR_FREE_LESSON_KEY,
  JUNIOR_QUIZ_CONTROL_LABEL,
  JUNIOR_TELL_UNHEARD_ERROR,
  juniorPaidActionError,
  juniorQuizControlLabel,
} from "@/lib/junior/limits";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import { juniorTopicEndQuestions } from "@/lib/junior/quiz";
import {
  createJuniorProfile,
  evaluateJuniorGuestPilotTrialQuiz,
  evaluateJuniorGuestPilotTrialTell,
  submitJuniorQuiz,
  submitJuniorTell,
} from "@/lib/junior/service";

describe("jr_06_mat-1 ölçme kapsamı (Görev Paketi #02)", () => {
  it("anlatılan yedi kuralın her biri en az bir soruyla ölçülür", () => {
    const text = JUNIOR_MAT_QUIZ_5.questions.map((q) => `${q.question} ${q.explanation}`).join("\n");
    for (const rule of ["2", "3", "4", "5", "6", "9", "10"]) {
      expect(text, `${rule} kuralı`).toContain(rule);
    }
    expect(JUNIOR_MAT_QUIZ_5.questions.length).toBeGreaterThanOrEqual(7);
  });

  it("kaynakta doğru şık hep aynı konumda değildir", () => {
    const positions = new Set(JUNIOR_MAT_QUIZ_5.questions.map((q) => q.correctAnswerIndex));
    expect(positions.size).toBeGreaterThanOrEqual(3);
  });

  it("yayınlanan (karıştırılmış) paket de kapsamı korur", () => {
    const served = juniorTopicEndQuestions("jr_06_mat-1");
    expect(served.length).toBe(JUNIOR_MAT_QUIZ_5.questions.length);
    expect(served.every((q) => q.options.length === 4)).toBe(true);
  });

  it("keşif katmanı yedi kural için yönlendirici ipucu taşır", () => {
    expect(discoveryPromptsForLesson("jr_06_mat-1")).toBe(MAT5_DISCOVERY_PROMPTS);
    expect(MAT5_DISCOVERY_PROMPTS.length).toBeGreaterThanOrEqual(6);
    for (const prompt of MAT5_DISCOVERY_PROMPTS) {
      expect(prompt.prompt.length).toBeGreaterThan(10);
      expect(prompt.hint.length).toBeGreaterThan(5);
      expect(prompt.reveal.length).toBeGreaterThan(10);
    }
    expect(discoveryPromptsForLesson("jr_06_mat-2")).toEqual([]);
  });

  it("quiz etiketi 8 soruluk SSOT ile uyumludur ve dinamik soru sayısını basar", () => {
    expect(JUNIOR_QUIZ_CONTROL_LABEL).toBe("Hızlı Konu Kontrolü (8 Soru)");
    expect(juniorQuizControlLabel(8)).toBe("Hızlı Konu Kontrolü (8 Soru)");
    expect(juniorQuizControlLabel(3)).toBe("Hızlı Konu Kontrolü (3 Soru)");
    expect(juniorQuizControlLabel(null)).toBe("Hızlı Konu Kontrolü (8 Soru)");
  });

  it("jr_06_mat-1 ücretsiz pilot dersinde 1 defalık Dinle-Anlat ve Test deneme hakkı açıktır", async () => {
    const audio = Buffer.alloc(10_000, 7).toString("base64");
    const guestTell = await evaluateJuniorGuestPilotTrialTell(
      {
        userId: "guest:1",
        lessonKey: JUNIOR_FREE_LESSON_KEY,
        audioBase64: audio,
        mimeType: "audio/webm",
        durationSec: 20,
      },
      {
        invoke: async () => ({
          text: JSON.stringify({
            onTopic: true,
            praised: "24 ve 30 kurallarını çok net anlattın.",
            missing: "116 için son iki basamağı da söyle.",
            advice: "Şimdi 8 soruluk testi çöz.",
            score: 85,
          }),
          model: "gemini-3.8-live",
          provider: "gemini",
          usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        }),
      },
    );
    const silent = await evaluateJuniorGuestPilotTrialTell(
      {
        userId: "guest:silent",
        lessonKey: JUNIOR_FREE_LESSON_KEY,
        audioBase64: audio,
        mimeType: "audio/webm",
        durationSec: 20,
      },
      { invoke: async () => null },
    );
    expect(silent.ok).toBe(false);
    if (!silent.ok) {
      expect(silent.error).toBe(JUNIOR_TELL_UNHEARD_ERROR);
      expect(JSON.stringify(silent)).not.toContain("85");
    }

    expect(guestTell.ok).toBe(true);
    if (guestTell.ok) {
      expect(guestTell.data.trial).toBe(true);
      expect(guestTell.data.score).toBe(85);
    }

    const served = juniorTopicEndQuestions(JUNIOR_FREE_LESSON_KEY);
    const guestQuiz = evaluateJuniorGuestPilotTrialQuiz({
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      answers: served.map((q) => ({ id: q.id, choiceIndex: q.correctAnswerIndex })),
    });
    expect(guestQuiz.ok).toBe(true);
    if (guestQuiz.ok) {
      expect(guestQuiz.data.trial).toBe(true);
      expect(guestQuiz.data.correct).toBe(8);
      expect(guestQuiz.data.total).toBe(8);
      expect(guestQuiz.data.score).toBe(100);
      expect(guestQuiz.data.completed).toBe(true);
    }

    // Oturumlu ama paketsiz veli profilinde 1. sesli anlatış ve 1. test ücretsiz açılır; 2. deneme paket ister.
    const store = createMemoryJuniorStore();
    const now = new Date("2026-10-05T12:00:00+03:00");
    const created = await createJuniorProfile(
      store,
      "free-parent",
      {
        nickname: "Deniz",
        grade: 6,
        birthYear: 2015,
        consent: true,
        consentVersion: "junior-notice-2026-10-09",
        guardianBirthYear: 1990,
      },
      now,
    );
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    const firstTell = await submitJuniorTell(
      store,
      {
        userId: "free-parent",
        profileId: created.data.profile.id,
        lessonKey: JUNIOR_FREE_LESSON_KEY,
        mode: "speak",
        audioBase64: Buffer.alloc(10_000, 7).toString("base64"),
        mimeType: "audio/webm",
        durationSec: 20,
        now,
      },
      {
        invoke: async () => ({
          text: JSON.stringify({
            onTopic: true,
            praised: "Harika anlattın.",
            missing: "Eksik kalan nokta yok.",
            advice: "Testi çöz.",
            score: 85,
          }),
          model: "gemini-3.8-live",
          provider: "gemini",
          usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        }),
      },
    );
    expect(firstTell.ok).toBe(true);

    const secondTell = await submitJuniorTell(
      store,
      {
        userId: "free-parent",
        profileId: created.data.profile.id,
        lessonKey: JUNIOR_FREE_LESSON_KEY,
        mode: "speak",
        audioBase64: Buffer.alloc(10_000, 7).toString("base64"),
        mimeType: "audio/webm",
        durationSec: 20,
        now,
      },
    );
    expect(secondTell.ok).toBe(false);
    if (!secondTell.ok) {
      expect(secondTell.error).toBe(juniorPaidActionError(served.length));
    }

    const firstQuiz = await submitJuniorQuiz(store, {
      userId: "free-parent",
      profileId: created.data.profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      answers: served.map((q) => ({ id: q.id, choiceIndex: q.correctAnswerIndex })),
      now,
    });
    expect(firstQuiz.ok).toBe(true);
  });
});
