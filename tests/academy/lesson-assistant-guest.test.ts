import { describe, expect, it } from "vitest";
import {
  ACADEMY_LESSON_ASSISTANT_GUEST_LIMIT_ERROR,
  ACADEMY_LESSON_ASSISTANT_LOCKED,
  answerAcademyLessonAssistant,
} from "@/lib/academy/lesson-assistant";
import {
  ACADEMY_LESSON_ASSISTANT_GUEST_LIMIT,
  ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
} from "@/lib/academy/lesson-assistant-policy";
import { academyCourseOffersFreePreview } from "@/lib/kernel/catalog-ids/free-preview";

/**
 * Anonim ders asistanı (P0). Ücretsiz ders önizlemesinde 401 yerine çalışan asistan:
 * - yalnız ücretsiz kapı dersi açılır (kilitli ders aynı saf kararla 403),
 * - kova istemci IP'sidir ve günlüktür (3 soru),
 * - kimlikli kullanıcı kendi 5 soruluk ders kotasını korur.
 */
describe("anonim ders asistanı kotası", () => {
  const freeLesson = "01_office_ai-1";

  it("ücretsiz kapı dersi tanınır; ikinci ders kilitlidir", () => {
    expect(academyCourseOffersFreePreview("01_office_ai")).toBe(true);
    expect(ACADEMY_LESSON_ASSISTANT_GUEST_LIMIT).toBe(3);
    expect(ACADEMY_LESSON_ASSISTANT_GUEST_LIMIT).toBeLessThan(
      ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT,
    );
  });

  it("anonim ziyaretçi ücretsiz derste cevap alır; kova guestId'dir", async () => {
    const buckets: string[] = [];
    const result = await answerAcademyLessonAssistant(
      {
        userId: "guest:req",
        guestId: "203.0.113.7",
        courseSlug: "01_office_ai",
        lessonKey: freeLesson,
        currentTimeSec: 12,
        question: "Bu satırda ne yaptık?",
      },
      {
        loadLessonText: () => ({
          title: "Temiz veri",
          text: "Düzensiz Excel tablosunu onaylı panele koy ve üç satırı kontrol et.",
        }),
        consumeGuestQuota: async (guestId, lessonKey) => {
          buckets.push(`${guestId}:${lessonKey}`);
          return { allowed: true, remaining: 2, limit: ACADEMY_LESSON_ASSISTANT_GUEST_LIMIT };
        },
        invoke: async () => ({
          text: "Tabloyu panele koydun. Çok haklısın, adım adım bakalım.",
          model: "test-model",
          provider: "gemini",
          usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        }),
      },
    );
    expect(buckets).toEqual([`203.0.113.7:${freeLesson}`]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.limit).toBe(ACADEMY_LESSON_ASSISTANT_GUEST_LIMIT);
    }
  });

  it("anonim ziyaretçi kilitli dersi soramaz (403) ve metin yüklenmez", async () => {
    let loaded = 0;
    const locked = await answerAcademyLessonAssistant(
      {
        userId: "guest:req",
        guestId: "203.0.113.7",
        courseSlug: "01_office_ai",
        lessonKey: "01_office_ai-2",
        currentTimeSec: 4,
        question: "Bu satırda ne yaptık?",
      },
      {
        loadLessonText: () => {
          loaded += 1;
          return { title: "Gizli", text: "Bu metin yüklenmemeli." };
        },
      },
    );
    expect(locked.ok).toBe(false);
    if (!locked.ok) {
      expect(locked.status).toBe(403);
      expect(locked.error).toBe(ACADEMY_LESSON_ASSISTANT_LOCKED);
    }
    expect(loaded).toBe(0);
  });

  it("günlük üç soru dolunca 429 ve anonim metni basılır", async () => {
    const blocked = await answerAcademyLessonAssistant(
      {
        userId: "guest:req",
        guestId: "203.0.113.7",
        courseSlug: "01_office_ai",
        lessonKey: freeLesson,
        currentTimeSec: 4,
        question: "Bu satırda ne yaptık?",
      },
      {
        loadLessonText: () => ({ title: "Tablo", text: "Üç satırı onaylı panele koy." }),
        consumeGuestQuota: async () => ({
          allowed: false,
          remaining: 0,
          limit: ACADEMY_LESSON_ASSISTANT_GUEST_LIMIT,
        }),
      },
    );
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.status).toBe(429);
      expect(blocked.error).toBe(ACADEMY_LESSON_ASSISTANT_GUEST_LIMIT_ERROR);
      expect(blocked.error).toContain("üç soru");
    }
  });

  it("kimlikli kullanıcı 5 soruluk kendi kotasını okur", async () => {
    const usage: string[] = [];
    const result = await answerAcademyLessonAssistant(
      {
        userId: "u1",
        courseSlug: "01_office_ai",
        lessonKey: freeLesson,
        currentTimeSec: 4,
        question: "Bu satırda ne yaptık?",
      },
      {
        loadLessonText: () => ({ title: "Tablo", text: "Üç satırı onaylı panele koy." }),
        consumeQuota: async (userId) => {
          usage.push(userId);
          return { allowed: true, remaining: 4, limit: ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT };
        },
        consumeGuestQuota: async () => {
          usage.push("guest-kova-çağrıldı");
          return { allowed: false, remaining: 0, limit: 0 };
        },
        invoke: async () => ({
          text: "Üç satırı panele koydun. Çok haklısın, adım adım bakalım.",
          model: "test-model",
          provider: "gemini",
          usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        }),
      },
    );
    expect(usage).toEqual(["u1"]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.limit).toBe(ACADEMY_LESSON_ASSISTANT_QUESTION_LIMIT);
    }
  });
});
