import { describe, expect, it, vi } from "vitest";
import { answerJuniorLiveTutor, loadJuniorLiveTutorContext } from "@/lib/junior/live-tutor";
import {
  isJuniorLiveTutorOffTopic,
  juniorLiveTutorSystemPrompt,
  resolveJuniorLiveTutorLocalReply,
  JUNIOR_LIVE_TUTOR_OFF_TOPIC,
  JUNIOR_LIVE_TUTOR_QUICK_CHIPS,
} from "@/lib/junior/live-tutor-policy";

describe("junior live tutor policy", () => {
  it("exposes three quick suggestion chips", () => {
    expect(JUNIOR_LIVE_TUTOR_QUICK_CHIPS).toHaveLength(3);
    expect(JUNIOR_LIVE_TUTOR_QUICK_CHIPS.map((c) => c.id)).toEqual([
      "example",
      "digit-sum",
      "ask-one",
    ]);
  });

  it("blocks off-topic chatter", () => {
    expect(isJuniorLiveTutorOffTopic("Bugün hava durumu nasıl?", "çarpan kat bölünebilme")).toBe(
      true,
    );
    expect(isJuniorLiveTutorOffTopic("Rakamları toplamı kuralını anlayamadım.", "rakam toplamı 3 9")).toBe(
      false,
    );
  });

  it("builds a socratic system prompt with active scene", () => {
    const prompt = juniorLiveTutorSystemPrompt({
      lessonKey: "jr_06_mat-5",
      lessonTitle: "Çarpanlar, Katlar ve Bölünebilme",
      teacherName: "Selim",
      activeSceneTitle: "Son Basamak Dedektifleri: 2, 5 ve 10",
      activeSceneSubtitle: "Büyüteçle sadece birler basamağına bak!",
      conceptSeal: "7 dedektif kuralı",
      notesDigest: "Çarpan kalansız böler",
      outcomesDigest: "Son basamak",
    });
    expect(prompt).toContain("Sokratik");
    expect(prompt).toContain("Son Basamak Dedektifleri");
    expect(prompt).toContain("Doğrudan cevabı verme");
  });

  it("resolves local pedagogical replies for quick chips", () => {
    const example = resolveJuniorLiveTutorLocalReply(
      "Bu kuralı bir örnekle açıklar mısın?",
      { activeSceneTitle: "Son Basamak Dedektifleri", activeSceneSubtitle: "" },
    );
    expect(example).toContain("24");
    const digit = resolveJuniorLiveTutorLocalReply("Rakamları toplamı kuralını anlayamadım.", {
      activeSceneTitle: "Rakam Toplama",
      activeSceneSubtitle: "",
    });
    expect(digit).toMatch(/3|9/);
  });
});

describe("junior live tutor answer", () => {
  it("loads mat-5 sealed context", () => {
    const ctx = loadJuniorLiveTutorContext("jr_06_mat-5", {
      activeSceneTitle: "Son Basamak Dedektifleri",
      cueIndex: 0,
    });
    expect(ctx).not.toBeNull();
    expect(ctx?.lessonKey).toBe("jr_06_mat-5");
    expect(ctx?.teacherName).toBe("Selim");
    expect(ctx?.conceptSeal.length).toBeGreaterThan(10);
  });

  it("returns local socratic reply when localOnly", async () => {
    const result = await answerJuniorLiveTutor(
      {
        userId: "guest:test",
        lessonKey: "jr_06_mat-5",
        message: "Bana bununla ilgili 1 soru sor!",
        activeSceneTitle: "Son Basamak Dedektifleri",
      },
      {
        localOnly: true,
        consumeQuota: async () => ({ allowed: true, remaining: 11, limit: 12 }),
        invoke: vi.fn(),
      },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).toBe("local");
      expect(result.reply).toMatch(/15|soru/i);
    }
  });

  it("redirects off-topic questions", async () => {
    const result = await answerJuniorLiveTutor(
      {
        userId: "guest:test",
        lessonKey: "jr_06_mat-5",
        message: "Futbol skorunu söyle",
      },
      {
        localOnly: true,
        consumeQuota: async () => ({ allowed: true, remaining: 11, limit: 12 }),
      },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.reply).toBe(JUNIOR_LIVE_TUTOR_OFF_TOPIC);
      expect(result.source).toBe("redirect");
    }
  });
});
