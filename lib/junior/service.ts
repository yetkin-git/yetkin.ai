import "server-only";

import { startOfEuropeIstanbulDay } from "@/lib/kernel/ai/budget-shield";
import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";
import { juniorCourseShelves, juniorLessonAccess, juniorLessonByKey } from "@/lib/junior/catalog";
import {
  JUNIOR_AUDIO_MAX_BYTES,
  JUNIOR_AUDIO_MIME_TYPES,
  JUNIOR_AUDIO_MIN_BYTES,
  JUNIOR_PRACTICE_XP,
  JUNIOR_PROFILE_CAP,
  JUNIOR_TELL_MAX_SEC,
  JUNIOR_TELL_MIN_SEC,
  JUNIOR_TELL_XP,
  JUNIOR_TELLS_PER_DAY,
  JUNIOR_TEXT_MAX,
  JUNIOR_TEXT_MIN,
  juniorAudioDecodedBytes,
  normalizeJuniorMime,
} from "@/lib/junior/limits";
import type { JuniorStore } from "@/lib/junior/ports";
import {
  juniorProfileCreateSchema,
  juniorProfileFieldError,
  normalizeJuniorNickname,
} from "@/lib/junior/profile-rules";
import { gradeJuniorPractice, publicJuniorPractice } from "@/lib/junior/practice";
import {
  juniorInlineAudio,
  juniorTellModelId,
  juniorTellSystemPrompt,
  juniorTellUserText,
  JUNIOR_TELL_ROLE,
  parseJuniorTellJson,
  unsureJuniorTell,
  wipeAudioCarrier,
} from "@/lib/junior/tell";
import type {
  JuniorCourseShelf,
  JuniorFeedback,
  JuniorPracticeAnswer,
  JuniorPracticeItem,
  JuniorProfileView,
  JuniorTellMode,
  JuniorXpView,
} from "@/lib/junior/types";
import { awardJuniorXp, juniorBadges, nextJuniorPoints, xpUsedSince } from "@/lib/junior/xp-rules";

export type JuniorFail = {
  ok: false;
  status: 400 | 403 | 404 | 413 | 429 | 503;
  error: string;
};

export type JuniorOk<T extends Record<string, unknown>> = { ok: true; data: T };

export type JuniorHome = {
  profiles: JuniorProfileView[];
  selected: JuniorProfileView | null;
  xp: JuniorXpView;
  courses: JuniorCourseShelf[];
};

type InvokeTell = (
  input: InvokeLlmInput,
  deps?: InvokeLlmDeps,
) => Promise<LlmGatewayResult | null>;

function toProfileView(row: {
  id: string;
  nickname: string;
  grade: number;
  birthYear: number;
  selected: boolean;
}): JuniorProfileView {
  return {
    id: row.id,
    nickname: row.nickname,
    grade: row.grade,
    birthYear: row.birthYear,
    selected: row.selected,
  };
}

export async function readJuniorHome(store: JuniorStore, userId: string): Promise<JuniorHome> {
  const profiles = await store.listProfiles(userId);
  const views = profiles.map(toProfileView);
  const selected = views.find((row) => row.selected) ?? views[0] ?? null;
  const xpRow = selected ? await store.getXp(userId, selected.id) : null;
  return {
    profiles: views,
    selected,
    xp: { points: xpRow?.points ?? 0, badges: xpRow?.badges ?? [] },
    courses: juniorCourseShelves(),
  };
}

export async function createJuniorProfile(
  store: JuniorStore,
  userId: string,
  input: unknown,
  now = new Date(),
): Promise<JuniorOk<{ profile: JuniorProfileView }> | JuniorFail> {
  const fieldError = juniorProfileFieldError(input, now);
  if (fieldError) {
    return { ok: false, status: 400, error: fieldError };
  }
  const parsed = juniorProfileCreateSchema.parse(input);
  const nickname = normalizeJuniorNickname(parsed.nickname);
  if (!nickname) {
    return { ok: false, status: 400, error: "Takma ad iki ile yirmi harf arasında olsun." };
  }
  const existing = await store.listProfiles(userId);
  if (existing.length >= JUNIOR_PROFILE_CAP) {
    return { ok: false, status: 400, error: "Bu hesapta en fazla dört çocuk profili durur." };
  }
  const taken = existing.some(
    (row) => row.nickname.toLocaleLowerCase("tr") === nickname.toLocaleLowerCase("tr"),
  );
  if (taken) {
    return { ok: false, status: 400, error: "Bu takma ad zaten var. Başka bir ad seç." };
  }
  const created = await store.insertProfile({
    userId,
    nickname,
    grade: parsed.grade,
    birthYear: parsed.birthYear,
    consentAt: now,
    selected: existing.length === 0,
  });
  return { ok: true, data: { profile: toProfileView(created) } };
}

export async function selectJuniorProfile(
  store: JuniorStore,
  userId: string,
  profileId: string,
): Promise<JuniorOk<{ profile: JuniorProfileView }> | JuniorFail> {
  const selected = await store.selectProfile(userId, profileId);
  if (!selected) {
    return { ok: false, status: 404, error: "Bu profil senin hesabında yok." };
  }
  return { ok: true, data: { profile: toProfileView(selected) } };
}

export function readJuniorLesson(lessonKey: string):
  | { access: "free"; title: string; courseTitle: string; script: string; practice: JuniorPracticeItem[] }
  | { access: "locked"; title: string; courseTitle: string; teaser: string }
  | { access: "missing" } {
  const lesson = juniorLessonByKey(lessonKey);
  if (!lesson) {
    return { access: "missing" };
  }
  const courseTitle = juniorCourseShelves().find((course) =>
    course.lessons.some((row) => row.key === lesson.key),
  )?.title ?? "6. Sınıf";
  if (juniorLessonAccess(lesson.key) !== "free") {
    return { access: "locked", title: lesson.title, courseTitle, teaser: lesson.teaser };
  }
  return {
    access: "free",
    title: lesson.title,
    courseTitle,
    script: lesson.listenText,
    practice: publicJuniorPractice(lesson.key),
  };
}

export async function submitJuniorTell(
  store: JuniorStore,
  input: {
    userId: string;
    profileId: string;
    lessonKey: string;
    mode: JuniorTellMode;
    text?: string;
    audioBase64?: string;
    mimeType?: string;
    durationSec?: number;
    now?: Date;
  },
  deps: { invoke?: InvokeTell } = {},
): Promise<JuniorOk<JuniorFeedback> | JuniorFail> {
  const audioCarrier = { audioBase64: input.audioBase64 ?? "" };
  const inline = input.mode === "speak" && input.audioBase64
    ? juniorInlineAudio({
        mimeType: normalizeJuniorMime(input.mimeType ?? ""),
        dataBase64: input.audioBase64,
      })
    : null;
  try {
    const gate = await gateLesson(store, input.userId, input.profileId, input.lessonKey);
    if (!gate.ok) {
      return gate;
    }
    const now = input.now ?? new Date();
    const prior = await store.listProgress(input.userId, input.profileId);
    const day = startOfEuropeIstanbulDay(now);
    const tellsToday = prior.filter(
      (row) => row.mode !== "practice" && row.createdAt >= day,
    ).length;
    if (tellsToday >= JUNIOR_TELLS_PER_DAY) {
      return { ok: false, status: 429, error: "Bugün sekiz anlatışın doldu. Yarın yine gel." };
    }
    const clipError = validateTellClip(input);
    if (clipError) {
      return clipError;
    }
    const lesson = gate.lesson;
    const invoke = deps.invoke ?? invokeLlm;
    const llm = await invoke({
      provider: "gemini",
      role: JUNIOR_TELL_ROLE,
      model: juniorTellModelId(),
      system: juniorTellSystemPrompt({
        title: lesson.title,
        outcomes: lesson.outcomes,
        birthYear: gate.profile.birthYear,
        now,
      }),
      user: juniorTellUserText({ mode: input.mode, text: input.text }),
      inlineMedia: inline ? [inline] : undefined,
      temperature: 0.2,
      maxOutputTokens: 400,
      responseJson: true,
      rateLimit: {
        identifier: input.userId,
        scope: "junior-tell",
        limit: JUNIOR_TELLS_PER_DAY,
        windowMs: 60 * 60 * 1000,
      },
      billing: {
        userId: input.userId,
        source: AI_TOKEN_SOURCES.JUNIOR,
        recordUsage: true,
      },
    });
    const reading = llm ? parseJuniorTellJson(llm.text) ?? unsureJuniorTell() : null;
    if (!reading) {
      return {
        ok: false,
        status: 503,
        error: "Şu an dinleyemedim. Biraz sonra yeniden dene.",
      };
    }
    return commitFeedback(store, {
      userId: input.userId,
      profileId: input.profileId,
      lessonKey: input.lessonKey,
      mode: input.mode,
      reading,
      prior,
      now,
      base: JUNIOR_TELL_XP,
    });
  } finally {
    wipeAudioCarrier(audioCarrier);
    wipeAudioCarrier(inline);
    input.audioBase64 = "";
  }
}

export async function submitJuniorPractice(
  store: JuniorStore,
  input: {
    userId: string;
    profileId: string;
    lessonKey: string;
    answers: readonly JuniorPracticeAnswer[];
    now?: Date;
  },
): Promise<JuniorOk<JuniorFeedback & { correct: number; total: number; notes: { id: string; ok: boolean; explanation: string }[] }> | JuniorFail> {
  const gate = await gateLesson(store, input.userId, input.profileId, input.lessonKey);
  if (!gate.ok) {
    return gate;
  }
  const graded = gradeJuniorPractice(input.lessonKey, input.answers);
  if (!graded) {
    return { ok: false, status: 404, error: "Bu derste pekiştirme sorusu yok." };
  }
  const now = input.now ?? new Date();
  const prior = await store.listProgress(input.userId, input.profileId);
  const reading = {
    onTopic: true,
    praised: graded.correct === graded.total ? "Harika anlattın." : "Bir kısmını bildin.",
    missing:
      graded.correct === graded.total
        ? "Eksik kalan nokta yok."
        : "Eksik kalan noktayı sorunun altındaki cümlede gör.",
    advice: "Doğru cümleyi bir kez kendi sözünle tekrar et.",
    score: graded.score,
  };
  const saved = await commitFeedback(store, {
    userId: input.userId,
    profileId: input.profileId,
    lessonKey: input.lessonKey,
    mode: "practice",
    reading,
    prior,
    now,
    base: JUNIOR_PRACTICE_XP,
  });
  if (!saved.ok) {
    return saved;
  }
  return {
    ok: true,
    data: {
      ...saved.data,
      correct: graded.correct,
      total: graded.total,
      notes: graded.notes,
    },
  };
}

async function gateLesson(
  store: JuniorStore,
  userId: string,
  profileId: string,
  lessonKey: string,
): Promise<
  | { ok: true; lesson: NonNullable<ReturnType<typeof juniorLessonByKey>>; profile: { birthYear: number } }
  | JuniorFail
> {
  const profile = await store.getProfile(userId, profileId);
  if (!profile) {
    return { ok: false, status: 404, error: "Bu profil senin hesabında yok." };
  }
  if (!profile.consentAt) {
    return { ok: false, status: 403, error: "Veli onayı olmadan ders açılmaz." };
  }
  const access = juniorLessonAccess(lessonKey);
  if (access === "missing") {
    return { ok: false, status: 404, error: "Bu ders yok." };
  }
  if (access === "locked") {
    return {
      ok: false,
      status: 403,
      error: "Bu konu henüz kapalı. Her dersin ilk konusu ücretsizdir.",
    };
  }
  const lesson = juniorLessonByKey(lessonKey);
  if (!lesson) {
    return { ok: false, status: 404, error: "Bu ders yok." };
  }
  return { ok: true, lesson, profile };
}

function validateTellClip(input: {
  mode: JuniorTellMode;
  text?: string;
  audioBase64?: string;
  mimeType?: string;
  durationSec?: number;
}): JuniorFail | null {
  if (input.mode === "write") {
    const text = input.text?.trim() ?? "";
    if (text.length < JUNIOR_TEXT_MIN || text.length > JUNIOR_TEXT_MAX) {
      return {
        ok: false,
        status: 400,
        error: "Yazarak anlatış en az bir kısa cümle, en fazla bir paragraf olsun.",
      };
    }
    return null;
  }
  const duration = input.durationSec;
  if (typeof duration !== "number" || duration < JUNIOR_TELL_MIN_SEC || duration > JUNIOR_TELL_MAX_SEC) {
    return { ok: false, status: 400, error: "Anlatış on beş ile kırk beş saniye arasında olsun." };
  }
  const mime = normalizeJuniorMime(input.mimeType ?? "");
  if (!(JUNIOR_AUDIO_MIME_TYPES as readonly string[]).includes(mime)) {
    return { ok: false, status: 400, error: "Bu ses biçimi kabul edilmez." };
  }
  const bytes = juniorAudioDecodedBytes(input.audioBase64 ?? "");
  if (bytes === null || bytes < JUNIOR_AUDIO_MIN_BYTES) {
    return { ok: false, status: 400, error: "Ses kaydı çok kısa kaldı. Yeniden anlat." };
  }
  if (bytes > JUNIOR_AUDIO_MAX_BYTES) {
    return { ok: false, status: 413, error: "Ses kaydı çok büyük. Kırk beş saniyeyi geçme." };
  }
  return null;
}

async function commitFeedback(
  store: JuniorStore,
  input: {
    userId: string;
    profileId: string;
    lessonKey: string;
    mode: "speak" | "write" | "practice";
    reading: { praised: string; missing: string; advice: string; score: number };
    prior: { createdAt: Date; xpAwarded: number; lessonKey: string; mode: string; score: number }[];
    now: Date;
    base: number;
  },
): Promise<JuniorOk<JuniorFeedback> | JuniorFail> {
  const day = startOfEuropeIstanbulDay(input.now);
  const usedToday = xpUsedSince(input.prior, day);
  const xpAwarded = awardJuniorXp({
    usedToday,
    score: input.reading.score,
    base: input.base,
  });
  const current = await store.getXp(input.userId, input.profileId);
  const points = nextJuniorPoints(current?.points ?? 0, xpAwarded);
  const progress = {
    userId: input.userId,
    profileId: input.profileId,
    lessonKey: input.lessonKey,
    mode: input.mode,
    praised: input.reading.praised,
    missing: input.reading.missing,
    advice: input.reading.advice,
    score: input.reading.score,
    xpAwarded,
  };
  const badges = juniorBadges([
    ...input.prior.map((row) => ({ lessonKey: row.lessonKey, mode: row.mode, score: row.score })),
    progress,
  ]);
  const saved = await store.recordOutcome({ progress, points, badges });
  return {
    ok: true,
    data: {
      praised: saved.progress.praised,
      missing: saved.progress.missing,
      advice: saved.progress.advice,
      score: saved.progress.score,
      xpAwarded: saved.progress.xpAwarded,
      points: saved.xp.points,
      badges: saved.xp.badges,
    },
  };
}
