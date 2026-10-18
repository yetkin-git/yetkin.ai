import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { JUNIOR_AUDIO_MANIFEST } from "@/lib/junior/audio-manifest.generated";
import { carryJuniorLessonStatus, juniorLessonStatus, stampJuniorLessonStatus } from "@/lib/junior/chain";
import { juniorTopicCardFace } from "@/lib/junior/topic-face";
import {
  juniorCourseBySlug,
  juniorCourseShelves,
  juniorElectiveCategory,
  juniorElectiveLessonsSharePlayerContract,
  juniorFreeLessonKeys,
  juniorLessonAccess,
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
} from "@/lib/junior/limits";
import { JUNIOR_PLAN_CODE, JUNIOR_POS_PROVIDER, juniorPlanExpiry } from "@/lib/junior/plan";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import { createJuniorProfile, submitJuniorQuiz, submitJuniorTell } from "@/lib/junior/service";
import { juniorTopicEndQuestions } from "@/lib/junior/quiz";
import {
  isJuniorTopicQuizReady,
  juniorTopicQuizAnswers,
  publicJuniorTopicQuiz,
} from "@/lib/junior/topic-quiz";
import {
  JUNIOR_HINT_BOX,
  JUNIOR_HINT_BOX_PRINCIPLE,
  JUNIOR_LESSON_SECTIONS,
  JUNIOR_TEACHER_CUES,
  JUNIOR_TELL_CLOSE,
  juniorTeacherCueStem,
  juniorColdGreeting,
  juniorHintKindFromCaption,
  juniorWarningHasHarshPhrase,
  startsWithJuniorWarmOpening,
} from "@/lib/junior/content-rules";
import { juniorLessonNote } from "@/lib/junior/lesson-note";
import {
  JUNIOR_BAKE_ATEMPO,
  JUNIOR_BAKED_AUDIO_KEYS,
  JUNIOR_BGM_AMBIENT_VOLUME,
  JUNIOR_BGM_PUBLIC_PATH,
  JUNIOR_BGM_SPEECH_VOLUME,
  juniorBgmSrc,
  juniorLessonAudioPublicPath,
  juniorLessonAudioSrc,
  juniorLessonHasBakedAudio,
  JUNIOR_BED_LAYER,
  JUNIOR_HINT_EFFECTS,
  JUNIOR_TTS_MODEL_ID,
  juniorHintEffectForMoment,
  juniorTeacherForLesson,
  juniorTeacherSelfIntro,
} from "@/lib/junior/voice";
import { ACADEMY_SEALED_MEDIA_MODEL } from "@/lib/kernel/ai/model-roles";
import { assertJuniorProductionSeal, juniorBakedAudioSealed, juniorProductionSealGaps } from "@/lib/junior/production-seal";
import { juniorLessonChain, juniorNavChain, juniorNextLesson, juniorPrevLesson } from "@/lib/junior/lesson-nav";
import { juniorActiveLessonKeys, juniorLessonWeekHeading, juniorSchoolWeek, juniorShelfWeekHeading } from "@/lib/junior/week";
import type { LlmGatewayResult } from "@/lib/kernel/ai/types";

const JUNIOR_FIXTURE_PRICE_MINOR = 549_900;
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
    listPriceMinor: JUNIOR_FIXTURE_PRICE_MINOR,
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
    {
      nickname: "Ege",
      grade: 6,
      birthYear: 2015,
      consent: true,
      consentVersion: "junior-notice-2026-10-09",
      guardianBirthYear: 1990,
    },
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
  it("altı seçmeli raf kişiye özel etiketi ve on iki adımı taşır", () => {
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
        JUNIOR_QUIZ_PREPARING_LABEL,
        JUNIOR_PERSONAL_CURRICULUM_TAG,
        JUNIOR_ELECTIVE_TAG,
        ...JUNIOR_MAARIF_SKILL_TAGS,
      ]);
      expect(course.lessons.every((lesson) => lesson.status === "preparing")).toBe(true);
      expect(course.grade).toBe(6);
      expect(course.lessons[0]?.access).toBe("free");
      expect(course.lessons[1]?.access).toBe("locked");
      const lesson = juniorLessonByKey(course.lessons[0]?.key ?? "");
      expect(lesson?.scene).toBe("elective");
      expect(lesson?.steps).toHaveLength(12);
      expect(lesson?.listenText).not.toContain("Kavramsal Anlayış");
      expect(lesson?.listenText).not.toContain("İfade Gücü");
      expect(lesson?.mebNote).not.toContain("Kavramsal Anlayış");
      expect(lesson?.lifeUse.length).toBeGreaterThan(40);
    }
    const chosen = juniorPersonalizedShelves(["jr_06_ing", "yok"], NOW);
    expect(chosen.filter((course) => course.track === "core")).toHaveLength(5);
    expect(chosen.filter((course) => course.track === "elective").map((course) => course.slug)).toEqual([
      "jr_06_ing",
    ]);
    expect(juniorPersonalizedShelves([], NOW).every((course) => course.track === "core")).toBe(true);
    expect(juniorPersonalizedShelves(null, NOW)).toHaveLength(shelves.length);
  });
});

describe("Junior ders notu", () => {
  it("okul cümlesi ile günlük kullanımı tek anlatımda birleştirir", () => {
    const lesson = juniorLessonByKey("jr_06_mat-5");
    expect(lesson).not.toBeNull();
    if (!lesson) {
      return;
    }
    expect(lesson.parentNote).toContain("çarpan");
    expect(lesson.lifeUse).not.toContain("Sevgili çocuklar merhaba!");
    expect(lesson.listenText).toContain("kalansız");
    expect(lesson.listenText).not.toContain("Girişteki sahneyi aklında tut");
    expect(lesson.listenText).not.toContain("Aynı örneği yavaşça");
    expect(lesson.listenText.startsWith("Merhaba sevgili çocuklar!")).toBe(true);
    expect(lesson.listenText.toLocaleLowerCase("tr-TR")).toContain("sevgili arkadaşım");
    expect(lesson.listenText.toLocaleLowerCase("tr-TR")).toContain(
      "işte tam bu noktada dikkat etmen gereken kilit nokta",
    );
    expect(lesson.listenText).toContain("Tebrikler çocuklar! Harika bir iş çıkardık.");
    expect(lesson.steps?.every((step) => !step.endsWith("Tebrikler çocuklar! Harika bir iş çıkardık."))).toBe(
      true,
    );
    expect(lesson.listenText).not.toContain("yüksek sesle say");
    expect(lesson.steps).toHaveLength(12);
    expect(lesson.steps?.[2]).toContain("kalansız");
    expect(lesson.listenText).toContain(juniorTeacherSelfIntro("jr_06_mat-5"));
    expect(lesson.listenText).toContain("Ben Matematik öğretmenin Selim.");
    expect(startsWithJuniorWarmOpening(lesson.mebNote)).toBe(true);
    expect(juniorColdGreeting(lesson.mebNote)).toBe(false);
    expect(lesson.mebNote).not.toContain(`${juniorTeacherCueStem(JUNIOR_TEACHER_CUES[0])}:`);
    expect(lesson.mebNote).not.toContain(`${juniorTeacherCueStem(JUNIOR_TEACHER_CUES[1])}:`);
    expect(lesson.mebNote).not.toContain(JUNIOR_TEACHER_CUES[0]);
    expect(lesson.mebNote).not.toContain(JUNIOR_TEACHER_CUES[1]);
    expect(lesson.listenText).not.toContain("…");
    expect(lesson.listenText).not.toContain("Çizime dönünce");
    expect(lesson.listenText).not.toContain("Önce sıcak merhaba");
    expect(lesson.listenText).toContain("Bugün Neler Öğrendik?");
    const note = juniorLessonNote(lesson.mebNote, lesson.lifeUse);
    expect(note).toContain("kalansız");
    expect(note).not.toContain("mutfakta");
    expect(note.split(JUNIOR_TELL_CLOSE)).toHaveLength(2);
    const closeAt = note.lastIndexOf(JUNIOR_TELL_CLOSE);
    expect(note.indexOf("kalansız")).toBeLessThan(closeAt);
    expect(note.slice(closeAt)).toBe(JUNIOR_TELL_CLOSE);
  });
});

describe("Junior müfredat zinciri", () => {
  it("4 Ekim 2026 okulun 3. haftasıdır ve rozet takvim aralığındadır", () => {
    expect(juniorSchoolWeek(NOW)).toBe(3);
    expect(juniorSchoolWeek(new Date("2026-09-14T08:00:00+03:00"))).toBe(1);
    expect(juniorSchoolWeek(new Date("2026-09-13T21:00:00+03:00"))).toBe(null);
    expect(juniorActiveLessonKeys("jr_06_mat", NOW)).toEqual(["jr_06_mat-6", "jr_06_mat-7"]);
    expect(juniorActiveLessonKeys("jr_06_fen", NOW)).toEqual(["jr_06_fen-2"]);
    expect(juniorActiveLessonKeys("jr_06_mat", new Date("2026-11-16T12:00:00+03:00"))).toEqual([]);
    const shelves = juniorCourseShelves(NOW);
    expect(shelves.map((course) => course.subject)).toEqual([
      "Matematik",
      "Fen Bilimleri",
      "Türkçe",
      "İngilizce",
      "Sosyal Bilgiler",
      "İngilizce",
      "Almanca",
      "Fransızca",
      "Siyer",
      "Bilgisayar Bilimi",
      "Arapça",
    ]);
    for (const course of shelves) {
      expect(course.grade).toBe(6);
      expect(course.lessons[0]?.status).toBe(course.track === "elective" ? "preparing" : "fresh");
      expect(
        course.lessons.every((lesson) => lesson.status === (course.track === "elective" ? "preparing" : "fresh")),
      ).toBe(true);
      if (course.track === "elective") {
        expect(course.lessons.every((lesson) => lesson.thisWeek === false)).toBe(true);
      }
    }
    const mat = shelves.find((course) => course.slug === "jr_06_mat");
    const fen = shelves.find((course) => course.slug === "jr_06_fen");
    expect(mat?.lessons.filter((lesson) => lesson.thisWeek).map((lesson) => lesson.key)).toEqual([
      "jr_06_mat-6",
      "jr_06_mat-7",
    ]);
    expect(mat?.lessons[0]?.key).toBe("jr_06_mat-5");
    expect(mat?.lessons[0]?.archiveLabel).toBeUndefined();
    expect(mat?.lessons[0]?.unitTitle).toBe("Sayılar ve nicelikler");
    expect(mat?.lessons[0]?.starterLabel).toBeUndefined();
    expect(mat?.lessons.find((lesson) => lesson.key === JUNIOR_FREE_LESSON_KEY)?.starterLabel).toBe(
      "Ücretsiz ilk ders",
    );
    expect(juniorLessonWeekHeading("jr_06_mat", "jr_06_mat-6")).toBe("3. Hafta: Asal sayı ve asal çarpan");
    expect(juniorLessonWeekHeading("jr_06_mat", "jr_06_mat-7")).toBe("3. Hafta: Ortak kat ve ortak bölen");
    expect(mat?.lessons.find((lesson) => lesson.key === "jr_06_mat-6")?.weekHeading).toBe(
      "3. Hafta: Asal sayı ve asal çarpan",
    );
    expect(mat?.lessons.find((lesson) => lesson.key === "jr_06_mat-7")?.weekHeading).toBe(
      "3. Hafta (B Bölümü): Ortak kat ve ortak bölen",
    );
    expect(mat?.lessons.find((lesson) => lesson.key === "jr_06_mat-14")?.weekHeading).toBe(
      "4. Hafta: Ondalık gösterimin basamak değeri",
    );
    const matKeys = mat?.lessons.map((lesson) => lesson.key) ?? [];
    const week3a = matKeys.indexOf("jr_06_mat-6");
    const week3b = matKeys.indexOf("jr_06_mat-7");
    const week4 = matKeys.indexOf("jr_06_mat-14");
    const week7 = matKeys.indexOf("jr_06_mat-11");
    expect(week3a).toBeGreaterThanOrEqual(0);
    expect(week3b).toBe(week3a + 1);
    expect(week4).toBe(week3b + 1);
    expect(week7).toBeGreaterThan(week4);
    const matHeadings = mat?.lessons.map((lesson) => lesson.weekHeading).filter((heading) => heading) ?? [];
    expect(new Set(matHeadings).size).toBe(matHeadings.length);
    expect(juniorShelfWeekHeading(3, "Asal sayı ve asal çarpan")).toBe("3. Hafta: Asal sayı ve asal çarpan");
    expect(fen?.lessons.filter((lesson) => lesson.thisWeek).map((lesson) => lesson.key)).toEqual(["jr_06_fen-2"]);
    expect(fen?.lessons[2]?.thisWeek).toBe(false);
    expect(fen?.lessons).toHaveLength(27);
  });

  it("anlatış geçilmeden konu testi kilitli kalır; baraj dersi tamamlar", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    await seedActivePlan(store);
    expect(isJuniorTopicQuizReady("jr_06_ing_main-1")).toBe(true);
    expect(isJuniorTopicQuizReady("jr_06_sosyal-20")).toBe(true);
    await store.setSelectedElectives(PARENT, profile.id, ["jr_06_kod"]);
    const preparing = await submitJuniorQuiz(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_kod-1",
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
      answers: juniorTopicQuizAnswers(JUNIOR_FREE_LESSON_KEY, 2) ?? [],
    });
    expect(short.ok).toBe(true);
    if (short.ok) {
      expect(short.data.completed).toBe(false);
      expect(short.data.score).toBe(67);
      const served = juniorTopicEndQuestions(JUNIOR_FREE_LESSON_KEY);
      const miss = short.data.notes.find((note) => !note.ok);
      const missKey = served.find((row) => row.id === miss?.id);
      expect(miss?.answer).toBe(missKey ? missKey.options[missKey.correctAnswerIndex] : "");
      expect(short.data.notes.filter((note) => note.ok).every((note) => note.answer === undefined)).toBe(true);
    }
    expect(juniorLessonStatus(await store.listProgress(PARENT, profile.id), JUNIOR_FREE_LESSON_KEY)).toBe(
      "going",
    );

    const done = await submitJuniorQuiz(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      now: NOW,
      answers: juniorTopicQuizAnswers(JUNIOR_FREE_LESSON_KEY, JUNIOR_QUIZ_MIN_ITEMS) ?? [],
    });
    expect(done.ok).toBe(true);
    if (done.ok) {
      expect(done.data.completed).toBe(true);
      expect(done.data.total).toBe(JUNIOR_QUIZ_MIN_ITEMS);
      expect(done.data.praised).toBe("Tamamlandı.");
    }
    const rows = await store.listProgress(PARENT, profile.id);
    expect(rows.some((row) => row.mode === "quiz" && row.praised === "Tamamlandı.")).toBe(true);
    expect(juniorLessonStatus(rows, JUNIOR_FREE_LESSON_KEY)).toBe("done");
    const shelves = stampJuniorLessonStatus(juniorCourseShelves(NOW), rows);
    expect(shelves[0]?.lessons.find((lesson) => lesson.key === JUNIOR_FREE_LESSON_KEY)?.status).toBe("done");
    expect(shelves[0]?.lessons.find((lesson) => lesson.key === "jr_06_mat-6")?.thisWeek).toBe(true);
    expect(shelves[0]?.lessons[3]?.thisWeek).toBe(false);
  });
});

describe("Junior Sosyal Bilgiler ve öğretmen mührü", () => {
  it("beşinci çekirdek ders Sosyal Bilgiler konularını SEN çerçevesi ve dört bölümle taşır", () => {
    const course = juniorCourseBySlug("jr_06_sosyal");
    expect(course?.lessons).toHaveLength(24);
    const first = course?.lessons[0];
    const second = course?.lessons[1];
    expect(first?.title).toBe("Değerlerimiz ve toplumdaki roller");
    expect(second?.title).toBe("Toplumsal uyum ve yardımlaşma");
    expect(first?.scene).toBe("place");
    expect(second?.scene).toBe("culture");
    expect(course?.lessons[8]?.scene).toBe("grid");
    expect(course?.lessons[4]?.scene).toBe("history");
    expect(course?.lessons[7]?.scene).toBe("caravan");
    expect(course?.lessons.find((lesson) => lesson.key === "jr_06_sosyal-18")?.scene).toBe("assembly");
    expect(JUNIOR_LESSON_SECTIONS).toEqual(["Kavram", "Örnek", "Kritik Uyarı", "Günlük Kullanım"]);
    for (const lesson of course?.lessons ?? []) {
      expect(lesson.steps).toHaveLength(12);
      expect(startsWithJuniorWarmOpening(lesson.listenText)).toBe(true);
      expect(juniorColdGreeting(lesson.listenText)).toBe(false);
      expect(lesson.listenText).not.toContain(`${juniorTeacherCueStem(JUNIOR_TEACHER_CUES[0])}:`);
      expect(lesson.listenText).not.toContain(`${juniorTeacherCueStem(JUNIOR_TEACHER_CUES[1])}:`);
      expect(lesson.listenText).not.toContain(JUNIOR_TEACHER_CUES[0]);
      expect(lesson.listenText).not.toContain(JUNIOR_TEACHER_CUES[1]);
      expect(lesson.listenText).not.toContain("…");
      expect(lesson.listenText).not.toContain("...");
      expect(lesson.listenText).not.toContain("Çizime dönünce");
      expect(lesson.listenText).not.toContain("Aynı yeri iki türlü");
      expect(lesson.listenText).toContain("Bugün Neler Öğrendik?");
      expect(lesson.listenText.endsWith(JUNIOR_TELL_CLOSE)).toBe(true);
      expect(lesson.listenText).not.toMatch(/(^|[^\p{L}])siz(?:in|e|de|den|ler(?:e)?)?(?=[^\p{L}]|$)/u);
      expect(lesson.lifeUse.length).toBeGreaterThan(40);
      expect(lesson.mebNote).not.toContain("Kavramsal Anlayış");
      expect(juniorWarningHasHarshPhrase(lesson.listenText)).toBe(false);
      expect(
        lesson.listenText.includes("Tuzaklara Düşme!") || lesson.listenText.includes("Altın İpucu!"),
      ).toBe(true);
    }
    const teacher = juniorTeacherForLesson("jr_06_sosyal-1");
    expect(teacher.name).toBe("Murat");
    expect(teacher.voice).toBe("Achird");
    expect(teacher.tone).toBe("Erkek / Samimi hikâye anlatıcısı");
    expect(teacher.subject).toBe("Sosyal Bilgiler");
    expect(teacher.model).toBe(ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS);
    expect(JUNIOR_TTS_MODEL_ID).toBe(ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS);
    expect(JUNIOR_BED_LAYER.model).toBe(ACADEMY_SEALED_MEDIA_MODEL.MUSIC_GEN);
    expect(JUNIOR_BED_LAYER.vocal).toBe(false);
    expect(JUNIOR_BED_LAYER.sampleRateHz).toBe(44_100);
    expect(JUNIOR_BED_LAYER.channels).toBe(2);
    expect(JUNIOR_BED_LAYER.callsExternalApi).toBe(false);
    expect(JUNIOR_BED_LAYER.producer).toBe("scripts/bake-junior-bgm-light-learning.ts");
    expect(JUNIOR_BGM_PUBLIC_PATH).toBe("/media/junior/audio/bgm-light-learning.mp3");
    expect(juniorBgmSrc()).toBe(JUNIOR_BGM_PUBLIC_PATH);
    expect(JUNIOR_BGM_SPEECH_VOLUME).toBeGreaterThanOrEqual(0.15);
    expect(JUNIOR_BGM_SPEECH_VOLUME).toBeLessThanOrEqual(0.2);
    expect(JUNIOR_BGM_AMBIENT_VOLUME).toBeGreaterThanOrEqual(0.1);
    expect(JUNIOR_BGM_AMBIENT_VOLUME).toBeLessThanOrEqual(0.15);
    expect(JUNIOR_BGM_AMBIENT_VOLUME).toBeLessThan(JUNIOR_BGM_SPEECH_VOLUME);
    expect(first?.listenText).toContain("Tuzaklara Düşme!");
    expect(second?.listenText).toContain("Altın İpucu!");
  });
});

describe("Junior İngilizce ve öğretmen mührü", () => {
  it("dördüncü çekirdek ders İngilizce konularını SEN çerçevesi ve dört bölümle taşır", () => {
    const course = juniorCourseBySlug("jr_06_ing_main");
    expect(course?.lessons).toHaveLength(14);
    const first = course?.lessons[0];
    const second = course?.lessons[1];
    expect(first?.title).toBe("Daily routines ve saati söylemek");
    expect(second?.title).toBe("Family Life: ailem ve have got");
    expect(first?.scene).toBe("clock");
    expect(second?.scene).toBe("family");
    expect(course?.lessons.map((lesson) => lesson.scene)).toEqual([
      "clock",
      "family",
      "tray",
      "clock",
      "skyline",
      "universe",
      "weather",
      "weather",
      "universe",
      "world",
      "holiday",
      "shelf",
      "recycle",
      "rules",
    ]);
    for (const lesson of course?.lessons ?? []) {
      expect(lesson.steps).toHaveLength(12);
      expect(startsWithJuniorWarmOpening(lesson.listenText)).toBe(true);
      expect(juniorColdGreeting(lesson.listenText)).toBe(false);
      expect(lesson.listenText).not.toContain(`${juniorTeacherCueStem(JUNIOR_TEACHER_CUES[0])}:`);
      expect(lesson.listenText).not.toContain(`${juniorTeacherCueStem(JUNIOR_TEACHER_CUES[1])}:`);
      expect(lesson.listenText).not.toContain(JUNIOR_TEACHER_CUES[0]);
      expect(lesson.listenText).not.toContain(JUNIOR_TEACHER_CUES[1]);
      expect(lesson.listenText).not.toContain("…");
      expect(lesson.listenText).not.toContain("...");
      expect(lesson.listenText).not.toContain("Çizime dönünce");
      expect(lesson.listenText).not.toContain("Aynı yeri iki türlü");
      expect(lesson.listenText).toContain("Bugün Neler Öğrendik?");
      expect(lesson.listenText.endsWith(JUNIOR_TELL_CLOSE)).toBe(true);
      expect(lesson.listenText).not.toContain("siz");
      expect(lesson.lifeUse.length).toBeGreaterThan(40);
      expect(lesson.mebNote).not.toContain("Kavramsal Anlayış");
      expect(juniorWarningHasHarshPhrase(lesson.listenText)).toBe(false);
      expect(
        lesson.listenText.includes("Tuzaklara Düşme!") || lesson.listenText.includes("Altın İpucu!"),
      ).toBe(true);
    }
    const teacher = juniorTeacherForLesson("jr_06_ing_main-1");
    expect(teacher.name).toBe("Selin");
    expect(teacher.voice).toBe("Kore");
    expect(teacher.tone).toBe("Kadın / Dinamik ve çift dilli");
    expect(teacher.subject).toBe("İngilizce");
    expect(teacher.model).toBe(ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS);
    expect(first?.listenText).toContain("Altın İpucu!");
    expect(second?.listenText).toContain("Altın İpucu!");
  });
});

describe("Junior gelişimsel ipucu kutusu", () => {
  it("uyarı başlığı neşelidir ve alkış ile chime dış API çağırmaz", () => {
    expect(JUNIOR_HINT_BOX.trap.title).toBe("💡 Dikkat Noktası");
    expect(JUNIOR_HINT_BOX.gold.title).toBe("⭐ Altın İpucu");
    expect(JUNIOR_HINT_BOX_PRINCIPLE).toContain("cesaretlendirilir");
    expect(JUNIOR_HINT_BOX_PRINCIPLE).toContain("Anladım!");
    expect(juniorHintKindFromCaption("Tuzaklara Düşme! Eşit parça şarttır.")).toBe("trap");
    expect(juniorHintKindFromCaption("Dikkat Noktası! Eşit parça şarttır.")).toBe("trap");
    expect(juniorHintKindFromCaption("Altın İpucu! İlk harf seçimi belirler.")).toBe("gold");
    expect(juniorHintKindFromCaption("⭐ Altın İpucu İlk harf seçimi belirler.")).toBe("gold");
    expect(juniorHintEffectForMoment("box-open")).toBe(JUNIOR_HINT_EFFECTS.chime);
    expect(juniorHintEffectForMoment("grasped")).toBe(JUNIOR_HINT_EFFECTS.applause);
    expect(JUNIOR_HINT_EFFECTS.chime.callsExternalApi).toBe(false);
    expect(JUNIOR_HINT_EFFECTS.applause.callsExternalApi).toBe(false);
    const lessons = juniorCourseShelves(NOW).flatMap((course) => course.lessons);
    expect(lessons.length).toBeGreaterThan(10);
    for (const card of lessons) {
      const lesson = juniorLessonByKey(card.key);
      expect(lesson).not.toBeNull();
      if (!lesson) {
        continue;
      }
      expect(juniorWarningHasHarshPhrase(lesson.listenText)).toBe(false);
      expect(juniorWarningHasHarshPhrase(lesson.mebNote)).toBe(false);
      expect(juniorWarningHasHarshPhrase(lesson.lifeUse)).toBe(false);
      expect(
        lesson.listenText.includes("Tuzaklara Düşme!") || lesson.listenText.includes("Altın İpucu!"),
      ).toBe(true);
    }
  });
});

describe("Junior konu kartı ilerleme yüzü", () => {
  it("mağaza damgasını tamamlandı, devam, ücretsiz ve kilit rozetine bağlar", () => {
    const done = stampJuniorLessonStatus(juniorCourseShelves(NOW), [
      { lessonKey: JUNIOR_FREE_LESSON_KEY, mode: "quiz", score: 80 },
    ]);
    const going = stampJuniorLessonStatus(juniorCourseShelves(NOW), [
      { lessonKey: JUNIOR_FREE_LESSON_KEY, mode: "speak", score: 80 },
    ]);
    // Kapı dersi (güncel hafta) mat kartında arşiv başının yerinde değil; indeksi katalogdan okunur.
    const gateAt = done[0]!.lessons.findIndex((lesson) => lesson.key === JUNIOR_FREE_LESSON_KEY);
    expect(gateAt).toBeGreaterThan(0);
    expect(juniorTopicCardFace(done[0]!.lessons[gateAt]!, true)).toEqual({
      badge: "Tamamlandı ✅",
      tone: "emerald",
      action: "Tekrar Et",
      destination: "lesson",
    });
    expect(juniorTopicCardFace(going[0]!.lessons[gateAt]!, true)).toMatchObject({
      badge: "Devam Et 🔄",
      action: "Devam Et",
      destination: "lesson",
    });
    expect(juniorTopicCardFace(done[0]!.lessons[gateAt + 1]!, false)).toMatchObject({
      badge: "Kilitli",
      action: null,
      destination: "locked",
    });
    expect(juniorTopicCardFace({ access: "free", status: "fresh" }, true)).toMatchObject({
      badge: "Ücretsiz Başla",
      action: "Ücretsiz Başla",
      destination: "lesson",
    });
    expect(juniorTopicCardFace({ access: "free", status: "preparing" }, true)).toMatchObject({
      badge: JUNIOR_QUIZ_PREPARING_LABEL,
      action: "Taslağı gör",
      destination: "lesson",
    });
    expect(juniorTopicCardFace({ access: "locked", status: "preparing" }, false)).toMatchObject({
      badge: "Kilitli",
      action: null,
      destination: "locked",
    });
    expect(juniorTopicCardFace({ access: "free", status: "fresh" }, false)).toMatchObject({
      badge: "Başla",
      action: "Başla",
      destination: "lesson",
    });
    const carried = carryJuniorLessonStatus(
      done.map((course) => ({
        ...course,
        lessons: course.lessons.map((lesson) => ({ ...lesson, access: "free" as const, status: "fresh" as const })),
      })),
      done,
    );
    expect(carried[0]?.lessons[gateAt]?.status).toBe("done");
    expect(carried[0]?.lessons[gateAt]?.access).toBe("free");
    expect(carried[0]?.lessons[gateAt + 1]?.status).toBe("fresh");
  });
});

describe("Junior pilot öğretmen sesi", () => {
  it("beş çekirdek dersin ilk konusu kendi ağzını ve %94 tempoyu taşır", () => {
    expect(JUNIOR_BAKE_ATEMPO).toBe(0.94);
    expect(juniorTeacherForLesson("jr_06_mat-1")).toMatchObject({
      name: "Selim",
      voice: "Fenrir",
      tone: "Erkek / Genç, dinamik ve enerjik",
    });
    expect(juniorTeacherForLesson("jr_06_fen-1")).toMatchObject({
      name: "Deniz",
      voice: "Fenrir",
      tone: "Erkek / Genç, dinamik ve enerjik",
    });
    expect(juniorTeacherForLesson("jr_06_turkce-1")).toMatchObject({
      name: "Elif",
      voice: "Aoede",
      tone: "Kadın / Duru ve anlaşılır",
    });
    expect(juniorTeacherForLesson("jr_06_sosyal-1")).toMatchObject({
      name: "Murat",
      voice: "Achird",
    });
    expect(juniorTeacherForLesson("jr_06_ing_main-1")).toMatchObject({
      name: "Selin",
      voice: "Kore",
    });
    expect(juniorLessonAudioPublicPath("jr_06_mat-5")).toBe("/media/junior/audio/jr_06_mat-5.mp3");
    expect(juniorLessonAudioPublicPath("jr_06_ing_main-1")).toBe(
      "/media/junior/audio/jr_06_ing_main-1.mp3",
    );
    expect(new Set(JUNIOR_BAKED_AUDIO_KEYS)).toEqual(
      new Set(
        juniorCourseShelves(NOW)
          .filter((course) => course.track === "core")
          .flatMap((course) => course.lessons.map((lesson) => lesson.key)),
      ),
    );
    // Ses kaynağı yalnız ücretsiz kümede (açılış konuları ve ilk ders kapısı) açılır; arşiv ve kilitli konu boş kalır.
    const freeKeys = new Set(juniorFreeLessonKeys());
    for (const key of JUNIOR_BAKED_AUDIO_KEYS) {
      if (freeKeys.has(key)) {
        const sha = JUNIOR_AUDIO_MANIFEST[key as keyof typeof JUNIOR_AUDIO_MANIFEST]?.sha256.slice(0, 12);
        expect(juniorLessonAudioSrc(key)).toBe(`${juniorLessonAudioPublicPath(key)}?v=v2-${sha}`);
      } else {
        expect(juniorLessonAudioSrc(key)).toBeNull();
      }
    }
    expect(juniorLessonAudioSrc("jr_06_mat-6")).toBeNull();
    expect(juniorLessonAudioSrc("jr_06_mat-11")).toBeNull();
    expect(juniorLessonAudioSrc("jr_06_fen-2")).toBeNull();
    expect(juniorLessonAudioSrc("jr_06_turkce-2")).toBeNull();
    expect(juniorLessonAudioSrc("jr_06_sosyal-2")).toBeNull();
    expect(juniorLessonAudioSrc("jr_06_ing_main-3")).toBeNull();
    expect(juniorLessonAudioSrc("jr_06_ing-1")).toBeNull();
  });
});

describe("Junior üretim mühürü", () => {
  it("çekirdek konu beş kapıyı geçer; seçmeli hazırlık rafı geçmez", () => {
    const shelves = juniorCourseShelves(NOW);
    const core = shelves.filter((course) => course.track === "core");
    const electives = shelves.filter((course) => course.track === "elective");
    expect(core).toHaveLength(5);
    expect(electives).toHaveLength(6);
    for (const course of core) {
      for (const card of course.lessons) {
        const lesson = juniorLessonByKey(card.key);
        expect(lesson).not.toBeNull();
        if (!lesson) {
          continue;
        }
        expect(juniorProductionSealGaps(lesson)).toEqual([]);
        expect(() => assertJuniorProductionSeal(lesson)).not.toThrow();
        expect(lesson.listenText).not.toContain("Girişteki sahneyi aklında tut");
        expect(lesson.listenText).not.toContain("Aynı örneği yavaşça");
      }
    }
    for (const course of electives) {
      for (const card of course.lessons) {
        const lesson = juniorLessonByKey(card.key);
        expect(lesson).not.toBeNull();
        if (!lesson) {
          continue;
        }
        expect(card.status).toBe("preparing");
        const gaps = juniorProductionSealGaps(lesson);
        expect(gaps).toEqual(expect.arrayContaining(["audio", "warmup", "quiz"]));
        expect(() => assertJuniorProductionSeal(lesson)).toThrow(/Junior mühürü eksik/);
      }
    }
    const absent = { filePresent: () => false, treePresent: () => true };
    expect(juniorBakedAudioSealed("jr_06_mat-6", absent)).toBe(false);
    expect(juniorProductionSealGaps(juniorLessonByKey("jr_06_mat-6")!, absent)).toContain("audio");
    expect(juniorBakedAudioSealed("jr_06_mat-6", { filePresent: () => false, treePresent: () => false })).toBe(
      true,
    );
    expect(juniorBakedAudioSealed("jr_06_ing-1", { filePresent: () => true, treePresent: () => true })).toBe(false);
    const disk = readFileSync(join(process.cwd(), "lib/junior/production-seal-disk.ts"), "utf8");
    expect(disk).toContain("statSync");
    const bake = readFileSync(join(process.cwd(), "scripts/bake-junior-pilot-tts.ts"), "utf8");
    expect(bake).not.toContain('model !== "gemini-3.8-flash-tts"');
    expect(bake).not.toContain("JUNIOR_BAKE_ATEMPO !== 0.94");
    expect(bake).toContain("academyBakeVoiceModelId");
    expect(bake).toContain("JUNIOR_BAKE_ATEMPO");
    const bed = readFileSync(join(process.cwd(), "scripts/bake-junior-bgm-light-learning.ts"), "utf8");
    expect(bed).not.toContain("sine=frequency");
    expect(bed).toContain("ACADEMY_SEALED_MEDIA_MODEL.MUSIC_GEN");
    expect(bed).toContain("JUNIOR_BED_PROMPT");
  });
});

describe("Junior konu düğmesi", () => {
  it("jr_06_ing_main-20 hafta sırasının ilk açık dersidir; kilitli 17 ye bağlanmaz", () => {
    const ing = juniorCourseShelves(NOW).find((course) => course.slug === "jr_06_ing_main");
    const shelf = ing?.lessons.map((lesson) => lesson.key) ?? [];
    expect(shelf[0]).toBe("jr_06_ing_main-20");
    expect(ing?.lessons[0]?.unitIndex).toBe(1);
    expect(shelf[1]).toBe("jr_06_ing_main-2");
    expect(shelf.indexOf("jr_06_ing_main-17")).toBeGreaterThan(0);
    expect(juniorLessonAccess("jr_06_ing_main-20")).toBe("free");
    expect(juniorLessonAccess("jr_06_ing_main-2")).toBe("locked");
    expect(juniorLessonAccess("jr_06_ing_main-17")).toBe("locked");
    expect(juniorLessonHasBakedAudio("jr_06_ing_main-20")).toBe(true);
    expect(juniorNavChain("jr_06_ing_main")).toEqual([
      { key: "jr_06_ing_main-20", title: "Hak, sorumluluk ve sınıf kuralı" },
    ]);
    expect(juniorLessonChain("jr_06_ing_main-20")).toEqual({
      prevLesson: null,
      nextLesson: null,
    });
    expect(juniorPrevLesson("jr_06_ing_main-17")).toBeNull();
    expect(juniorNextLesson("jr_06_ing_main-17")).toBeNull();
    expect(juniorNextLesson("jr_06_ing_main-20")).toBeNull();
  });

  it("düğme zinciri raf sırasındaki fırınlanmış ve açık derslerle sınırlıdır", () => {
    const shelves = juniorCourseShelves(NOW);
    for (const course of shelves) {
      const shelfKeys = course.lessons.map((lesson) => lesson.key);
      const chain = juniorNavChain(course.slug);
      let cursor = -1;
      for (const row of chain) {
        const at = shelfKeys.indexOf(row.key);
        expect(at, row.key).toBeGreaterThan(cursor);
        cursor = at;
        expect(juniorLessonAccess(row.key), row.key).toBe("free");
        expect(juniorLessonHasBakedAudio(row.key), row.key).toBe(true);
        expect(course.lessons.find((lesson) => lesson.key === row.key)?.access, row.key).toBe("free");
      }
      for (const card of course.lessons) {
        const lockedOrRaw = card.access === "locked" || !juniorLessonHasBakedAudio(card.key);
        if (lockedOrRaw) {
          expect(chain.some((row) => row.key === card.key), card.key).toBe(false);
          expect(juniorPrevLesson(card.key), card.key).toBeNull();
          expect(juniorNextLesson(card.key), card.key).toBeNull();
        }
      }
    }
  });
});
