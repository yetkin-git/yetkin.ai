import { describe, expect, it } from "vitest";
import { juniorLessonStatus, stampJuniorLessonStatus } from "@/lib/junior/chain";
import {
  juniorCourseShelves,
  juniorElectiveCategory,
  juniorElectiveLessonsSharePlayerContract,
  juniorLessonByKey,
  juniorPersonalizedShelves,
} from "@/lib/junior/catalog";
import {
  JUNIOR_ELECTIVE_CATEGORY,
  JUNIOR_ELECTIVE_TAG,
  JUNIOR_MAARIF_SKILL_TAGS,
  JUNIOR_PERSONAL_CURRICULUM_TAG,
} from "@/lib/junior/types";
import {
  JUNIOR_ELECTIVE_QUOTA,
  JUNIOR_FREE_LESSON_KEY,
  JUNIOR_QUIZ_MIN_ITEMS,
  JUNIOR_QUIZ_PREPARING_LABEL,
  JUNIOR_YEARLY_LIST_PRICE_MINOR,
} from "@/lib/junior/limits";
import { JUNIOR_PLAN_CODE, JUNIOR_POS_PROVIDER, juniorPlanExpiry } from "@/lib/junior/plan";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import { createJuniorProfile, submitJuniorQuiz, submitJuniorTell } from "@/lib/junior/service";
import {
  juniorTopicQuizAnswers,
  publicJuniorTopicQuiz,
} from "@/lib/junior/topic-quiz";
import { juniorLessonNote } from "@/lib/junior/lesson-note";
import { juniorSchoolWeek } from "@/lib/junior/week";
import type { LlmGatewayResult } from "@/lib/kernel/ai/types";

const NOW = new Date("2026-10-04T12:00:00+03:00");
const PARENT = "parent-a";

function told(score: number): LlmGatewayResult {
  return {
    text: JSON.stringify({
      onTopic: true,
      praised: "Payın üstte olduğunu söyledin.",
      missing: "Paydanın bütünü böldüğünü de ekle.",
      advice: "Pay üstte, payda altta. Bunu bir kez daha anlat.",
      score,
    }),
    model: "gemini-3.8-live",
    provider: "gemini",
    usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
  };
}

async function seedActivePlan(store: ReturnType<typeof createMemoryJuniorStore>) {
  await store.saveActiveSubscription({
    userId: PARENT,
    status: "ACTIVE",
    planCode: JUNIOR_PLAN_CODE,
    listPriceMinor: JUNIOR_YEARLY_LIST_PRICE_MINOR,
    currencyCode: "TRY",
    provider: JUNIOR_POS_PROVIDER,
    providerRef: "JRSEEDED01",
    cardLast4: "0000",
    invoiceName: "Ayse Yilmaz",
    invoiceTckn: "10000000146",
    invoicePhone: "5551112233",
    invoiceAddress: "Ataturk Mahallesi Deneme Sokak No 1",
    electiveQuota: JUNIOR_ELECTIVE_QUOTA,
    gradeSwitchRights: 1,
    activatedAt: NOW,
    expiresAt: juniorPlanExpiry(NOW),
  });
}

async function openProfile(store: ReturnType<typeof createMemoryJuniorStore>) {
  const created = await createJuniorProfile(
    store,
    PARENT,
    { nickname: "Ege", grade: 6, birthYear: 2015, consent: true },
    NOW,
  );
  if (!created.ok) {
    throw new Error(created.error);
  }
  return created.data.profile;
}

async function narrate(store: ReturnType<typeof createMemoryJuniorStore>, profileId: string, score: number) {
  return submitJuniorTell(
    store,
    {
      userId: PARENT,
      profileId,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      mode: "write",
      text: "Kesir bir bütünün eşit parçasıdır. Pay üstte, payda altta durur.",
      now: NOW,
    },
    { invoke: async () => told(score) },
  );
}

describe("Junior seçmeli ders kataloğu", () => {
  it("altı seçmeli raf kişiye özel etiketi ve dokuz adımı taşır", () => {
    const shelves = juniorCourseShelves(NOW);
    const electives = shelves.filter((course) => course.track === "elective");
    expect(electives.map((course) => course.title)).toEqual([
      "Seçmeli İngilizce (Pratik & Konuşma)",
      "Almanca",
      "Fransızca",
      "Siyer-i Nebi",
      "Bilgisayar Bilimi / Kodlama",
      "Seçmeli Arapça",
    ]);
    expect(JUNIOR_PERSONAL_CURRICULUM_TAG).toBe("Kişiye Özel Müfredat");
    expect(JUNIOR_ELECTIVE_TAG).toBe("Seçmeli Ders");
    expect(JUNIOR_ELECTIVE_CATEGORY).toBe("Seçmeli Dersler");
    expect(juniorElectiveCategory().title).toBe("Seçmeli Dersler");
    expect(juniorElectiveCategory().courses.map((course) => course.title)).toEqual(electives.map((course) => course.title));
    expect(juniorElectiveLessonsSharePlayerContract()).toBe(true);
    for (const course of electives) {
      expect(course.labels).toEqual([
        JUNIOR_PERSONAL_CURRICULUM_TAG,
        JUNIOR_ELECTIVE_TAG,
        ...JUNIOR_MAARIF_SKILL_TAGS,
      ]);
      expect(course.grade).toBe(6);
      expect(course.lessons[0]?.access).toBe("free");
      expect(course.lessons[1]?.access).toBe("locked");
      const lesson = juniorLessonByKey(course.lessons[0]?.key ?? "");
      expect(lesson?.scene).toBe("elective");
      expect(lesson?.steps).toHaveLength(9);
      expect(lesson?.listenText).toContain("Kavramsal Anlayış");
      expect(lesson?.listenText).toContain("İfade Gücü");
      expect(lesson?.mebNote).toContain("Kavramsal Anlayış");
      expect(lesson?.lifeUse.length).toBeGreaterThan(40);
    }
    const chosen = juniorPersonalizedShelves(["jr_06_ing", "yok"], NOW);
    expect(chosen.filter((course) => course.track === "core")).toHaveLength(4);
    expect(chosen.filter((course) => course.track === "elective").map((course) => course.slug)).toEqual([
      "jr_06_ing",
    ]);
    expect(juniorPersonalizedShelves([], NOW).every((course) => course.track === "core")).toBe(true);
    expect(juniorPersonalizedShelves(null, NOW)).toHaveLength(shelves.length);
  });
});

describe("Junior ders notu", () => {
  it("okul cümlesi ile günlük kullanımı tek anlatımda birleştirir", () => {
    const lesson = juniorLessonByKey("jr_06_mat-1");
    expect(lesson).not.toBeNull();
    if (!lesson) {
      return;
    }
    const note = juniorLessonNote(lesson.mebNote, lesson.lifeUse);
    expect(note).toContain("eşit parçalarından");
    expect(note).toContain("mutfakta");
    expect(note.match(/Aferin size!/g)).toHaveLength(1);
    const closeAt = note.lastIndexOf("Aferin size!");
    expect(note.indexOf("mutfakta")).toBeLessThan(closeAt);
    expect(note.slice(closeAt)).toBe(
      "Aferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!",
    );
  });
});

describe("Junior müfredat zinciri", () => {
  it("4 Ekim 2026 okulun 3. haftasıdır ve rozet ikinci konudadır", () => {
    expect(juniorSchoolWeek(NOW)).toBe(3);
    expect(juniorSchoolWeek(new Date("2026-09-14T08:00:00+03:00"))).toBe(1);
    expect(juniorSchoolWeek(new Date("2026-09-13T21:00:00+03:00"))).toBe(null);
    const shelves = juniorCourseShelves(NOW);
    expect(shelves.map((course) => course.subject)).toEqual([
      "Matematik",
      "Fen Bilimleri",
      "Türkçe",
      "İngilizce",
      "İngilizce",
      "Almanca",
      "Fransızca",
      "Siyer",
      "Bilgisayar Bilimi",
      "Arapça",
    ]);
    for (const course of shelves) {
      expect(course.grade).toBe(6);
      expect(course.lessons[0]?.thisWeek).toBe(false);
      expect(course.lessons[0]?.status).toBe("fresh");
      expect(course.lessons[1]?.thisWeek).toBe(true);
    }
  });

  it("anlatış geçilmeden konu testi kilitli kalır; baraj dersi tamamlar", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    await seedActivePlan(store);
    const preparing = await submitJuniorQuiz(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_ing_main-1",
      now: NOW,
      answers: [],
    });
    expect(preparing.ok).toBe(false);
    if (!preparing.ok) {
      expect(preparing.error).toBe(JUNIOR_QUIZ_PREPARING_LABEL);
    }
    const items = publicJuniorTopicQuiz(JUNIOR_FREE_LESSON_KEY);
    expect(items.length).toBeGreaterThanOrEqual(JUNIOR_QUIZ_MIN_ITEMS);
    expect(JSON.stringify(items)).not.toContain("correctIndex");

    const locked = await submitJuniorQuiz(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      now: NOW,
      answers: juniorTopicQuizAnswers(JUNIOR_FREE_LESSON_KEY, 10) ?? [],
    });
    expect(locked.ok).toBe(false);

    const low = await narrate(store, profile.id, 40);
    expect(low.ok).toBe(true);
    const stillLocked = await submitJuniorQuiz(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      now: NOW,
      answers: juniorTopicQuizAnswers(JUNIOR_FREE_LESSON_KEY, 10) ?? [],
    });
    expect(stillLocked.ok).toBe(false);

    const passed = await narrate(store, profile.id, 80);
    expect(passed.ok).toBe(true);
    const short = await submitJuniorQuiz(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      now: NOW,
      answers: juniorTopicQuizAnswers(JUNIOR_FREE_LESSON_KEY, 6) ?? [],
    });
    expect(short.ok).toBe(true);
    if (short.ok) {
      expect(short.data.completed).toBe(false);
      expect(short.data.score).toBe(60);
    }
    expect(juniorLessonStatus(await store.listProgress(PARENT, profile.id), JUNIOR_FREE_LESSON_KEY)).toBe(
      "going",
    );

    const done = await submitJuniorQuiz(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      now: NOW,
      answers: juniorTopicQuizAnswers(JUNIOR_FREE_LESSON_KEY, 7) ?? [],
    });
    expect(done.ok).toBe(true);
    if (done.ok) {
      expect(done.data.completed).toBe(true);
      expect(done.data.total).toBeGreaterThanOrEqual(10);
      expect(done.data.praised).toBe("Tamamlandı.");
    }
    const rows = await store.listProgress(PARENT, profile.id);
    expect(rows.some((row) => row.mode === "quiz" && row.praised === "Tamamlandı.")).toBe(true);
    expect(juniorLessonStatus(rows, JUNIOR_FREE_LESSON_KEY)).toBe("done");
    const shelves = stampJuniorLessonStatus(juniorCourseShelves(NOW), rows);
    expect(shelves[0]?.lessons[0]?.status).toBe("done");
    expect(shelves[0]?.lessons[1]?.thisWeek).toBe(true);
  });
});
