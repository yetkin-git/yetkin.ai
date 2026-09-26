import { describe, expect, it } from "vitest";
import {
  ACADEMY_LESSON_ASSISTANT_LOCKED,
  answerAcademyLessonAssistant,
} from "@/lib/academy/lesson-assistant";
import {
  ACADEMY_LESSON_ASSISTANT_MODEL,
  ACADEMY_LESSON_ASSISTANT_OFF_TOPIC,
  ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
  academyLessonAssistantSystemPrompt,
  isAcademyLessonAssistantOffTopic,
} from "@/lib/academy/lesson-assistant-policy";

describe("canlı ders asistanı", () => {
  it("ders dışı soruyu reddeder ve kotayı yer", async () => {
    let calls = 0;
    const result = await answerAcademyLessonAssistant(
      {
        userId: "u1",
        courseSlug: "01_office_ai",
        lessonKey: "01_office_ai-1",
        currentTimeSec: 12,
        question: "Bugün hava durumu nasıl?",
        commercialEnrolment: true,
      },
      {
        loadLessonText: () => ({ title: "Tablo", text: "Üç satırı onaylı panele koy." }),
        consumeQuota: async () => ({ allowed: true, remaining: 4, limit: 5 }),
        invoke: async () => {
          calls += 1;
          return null;
        },
      },
    );
    expect(isAcademyLessonAssistantOffTopic("Bugün hava durumu nasıl?", "Üç satırı onaylı panele koy.")).toBe(true);
    expect(
      isAcademyLessonAssistantOffTopic("Python'da liste nasıl sıralanır?", "Üç satırı onaylı panele koy."),
    ).toBe(true);
    expect(isAcademyLessonAssistantOffTopic("Bu satırda ne yaptık?", "Üç satırı onaylı panele koy.")).toBe(
      false,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.reply).toBe(ACADEMY_LESSON_ASSISTANT_OFF_TOPIC);
      expect(result.remaining).toBe(4);
      expect(result.source).toBe("redirect");
    }
    expect(calls).toBe(0);
  });

  it("beş sorudan sonra durur ve tam metni sistem istemine koyar", async () => {
    const blocked = await answerAcademyLessonAssistant(
      {
        userId: "u1",
        courseSlug: "01_office_ai",
        lessonKey: "01_office_ai-1",
        currentTimeSec: 4,
        question: "Bu satırda ne yaptık?",
        commercialEnrolment: true,
      },
      {
        loadLessonText: () => ({ title: "Tablo", text: "Üç satırı onaylı panele koy." }),
        consumeQuota: async () => ({
          allowed: false,
          remaining: 0,
          limit: ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
        }),
      },
    );
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.status).toBe(429);
    }

    let system = "";
    const answered = await answerAcademyLessonAssistant(
      {
        userId: "u1",
        courseSlug: "01_office_ai",
        lessonKey: "01_office_ai-1",
        currentTimeSec: 4,
        question: "Bu satırda ne yaptık?",
        commercialEnrolment: true,
      },
      {
        loadLessonText: () => ({ title: "Tablo", text: "Üç satırı onaylı panele koy." }),
        consumeQuota: async () => ({ allowed: true, remaining: 4, limit: 5 }),
        invoke: async (input) => {
          system = input.system;
          expect(input.model).toBe(ACADEMY_LESSON_ASSISTANT_MODEL);
          return {
            text: "Üç satırı panele koydun. Çok haklısın, adım adım bakalım.",
            model: ACADEMY_LESSON_ASSISTANT_MODEL,
            provider: "gemini",
            usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
          };
        },
      },
    );
    expect(system).toContain("Üç satırı onaylı panele koy.");
    expect(system).toContain("bulunduğu saniye: 4");
    expect(answered.ok).toBe(true);
  });

  it("satın alma yoksa kilitli ders metnini yüklemez", async () => {
    let loaded = 0;
    const locked = await answerAcademyLessonAssistant(
      {
        userId: "u1",
        courseSlug: "01_office_ai",
        lessonKey: "01_office_ai-1",
        currentTimeSec: 4,
        question: "Bu satırda ne yaptık?",
        commercialEnrolment: false,
      },
      {
        loadLessonText: () => {
          loaded += 1;
          return { title: "Tablo", text: "Üç satırı onaylı panele koy." };
        },
      },
    );
    expect(locked.ok).toBe(false);
    if (!locked.ok) {
      expect(locked.status).toBe(403);
      expect(locked.error).toBe(ACADEMY_LESSON_ASSISTANT_LOCKED);
    }
    expect(loaded).toBe(0);

    const prep = await answerAcademyLessonAssistant(
      {
        userId: "u1",
        courseSlug: "01_office_ai",
        lessonKey: "01_office_ai-0",
        currentTimeSec: 1,
        question: "Bugün hava durumu nasıl?",
      },
      {
        loadLessonText: () => ({ title: "Başlamadan önce", text: "Dosyayı aç." }),
        consumeQuota: async () => ({ allowed: true, remaining: 4, limit: 5 }),
      },
    );
    expect(prep.ok).toBe(true);
  });

  it("sistem istemi sen dili ve ders dışı kapıyı taşır", () => {
    const prompt = academyLessonAssistantSystemPrompt({
      lessonTitle: "Tablo",
      currentTimeSec: 3.2,
      activeLine: "Onaylı paneli aç.",
      lessonText: "Maskeli üç satır.",
    });
    expect(prompt).toContain("sen diye konuş");
    expect(prompt).toContain(ACADEMY_LESSON_ASSISTANT_OFF_TOPIC);
    expect(prompt).toContain("Onaylı paneli aç.");
  });
});
