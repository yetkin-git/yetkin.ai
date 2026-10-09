import "server-only";

import { startOfEuropeIstanbulDay } from "@/lib/kernel/ai/budget-shield";
import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";
import { juniorTellPassed, stampJuniorLessonStatus } from "@/lib/junior/chain";
import {
  JUNIOR_GUARDIAN_NOTICE,
  JUNIOR_NOTICE_UNSEALED_ERROR,
  JUNIOR_NOTICE_VERSION_ERROR,
  JUNIOR_PROFILE_CLOSED_ERROR,
  isJuniorNoticeUsable,
  isJuniorProfileClosed,
  juniorLessonConsentBlock,
  type JuniorGuardianNotice,
} from "@/lib/junior/guardian-notice";
import {
  juniorCourseShelves,
  juniorLessonAccess,
  juniorLessonAccessForPlan,
  juniorLessonByKey,
  juniorShelvesForGrade,
  stampJuniorPlanAccess,
  type JuniorPlanAccess,
} from "@/lib/junior/catalog";
import { juniorPlanCoversLesson } from "@/lib/junior/enter";
import { juniorProductionSealGaps } from "@/lib/junior/production-seal";
import { canEnterJunior, type JuniorActor } from "@/lib/kernel/security/junior-gate";
import {
  JUNIOR_AUDIO_MAX_BYTES,
  JUNIOR_AUDIO_MIME_TYPES,
  JUNIOR_AUDIO_MIN_BYTES,
  JUNIOR_ELECTIVE_QUOTA,
  JUNIOR_GRADE_SWITCH_EXHAUSTED,
  JUNIOR_GRADE_SWITCH_RIGHTS,
  JUNIOR_PAID_ACTION_ERROR,
  JUNIOR_PILOT_GRADE,
  JUNIOR_PILOT_SHELF_LINE,
  JUNIOR_PRACTICE_XP,
  JUNIOR_PROFILE_CAP,
  JUNIOR_QUIZ_PASS_SCORE,
  JUNIOR_QUIZ_PREPARING_LABEL,
  JUNIOR_QUIZ_XP,
  JUNIOR_TELL_MAX_SEC,
  JUNIOR_TELL_MIN_SEC,
  JUNIOR_TELL_XP,
  JUNIOR_TELLS_PER_DAY,
  JUNIOR_TEXT_MAX,
  JUNIOR_TEXT_MIN,
  juniorAudioDecodedBytes,
  normalizeJuniorMime,
} from "@/lib/junior/limits";
import { isJuniorPlanActive } from "@/lib/junior/plan";
import type { JuniorStore } from "@/lib/junior/ports";
import {
  juniorGradeSwitchSchema,
  juniorGuardianYearError,
  juniorProfileConsentUpdateSchema,
  juniorProfileCreateSchema,
  juniorProfileCreateSealedSchema,
  juniorProfileFieldError,
  normalizeJuniorNickname,
} from "@/lib/junior/profile-rules";
import { gradeJuniorPractice, publicJuniorPractice } from "@/lib/junior/practice";
import { juniorTellGuides } from "@/lib/junior/quiz";
import { buildJuniorWeeklyReport, type JuniorWeeklyReport } from "@/lib/junior/report";
import { gradeJuniorTopicQuiz, publicJuniorTopicQuiz } from "@/lib/junior/topic-quiz";
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
  JuniorPracticeChoice,
  JuniorPlanView,
  JuniorPracticeItem,
  JuniorProfileView,
  JuniorTellMode,
  JuniorVectorScene,
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
  weeklyReport: JuniorWeeklyReport | null;
  plan: JuniorPlanView;
};

type InvokeTell = (
  input: InvokeLlmInput,
  deps?: InvokeLlmDeps,
) => Promise<LlmGatewayResult | null>;

function toProfileView(row: {
  id: string;
  nickname: string;
  grade: number;
  birthYear: number | null;
  selected: boolean;
  selectedElectives: string[];
  gradeSwitchRights: number;
}): JuniorProfileView {
  return {
    id: row.id,
    nickname: row.nickname,
    grade: row.grade,
    birthYear: row.birthYear,
    selected: row.selected,
    selectedElectives: [...row.selectedElectives],
    gradeSwitchRights: row.gradeSwitchRights,
  };
}

function planView(
  subscription: {
    status: string;
    electiveQuota: number;
    expiresAt: Date | null;
    gradeSwitchRights?: number;
  } | null,
  now: Date,
): JuniorPlanView {
  const active = isJuniorPlanActive(subscription, now);
  return {
    status: active ? "ACTIVE" : "NONE",
    electiveQuota: subscription?.electiveQuota ?? JUNIOR_ELECTIVE_QUOTA,
    expiresAt: active && subscription?.expiresAt ? subscription.expiresAt.toISOString() : null,
    gradeSwitchRights: active ? (subscription?.gradeSwitchRights ?? 0) : 0,
  };
}

export async function readJuniorHome(
  store: JuniorStore,
  userId: string,
  now = new Date(),
): Promise<JuniorHome> {
  const profiles = await store.listProfiles(userId);
  const views = profiles.map(toProfileView);
  const open = views.filter((row) => !isJuniorProfileClosed(row));
  const selected = open.find((row) => row.selected) ?? open[0] ?? null;
  const xpRow = selected ? await store.getXp(userId, selected.id) : null;
  const progress = selected ? await store.listProgress(userId, selected.id) : [];
  const subscription = await store.getSubscription(userId);
  const plan = planView(subscription, now);
  const electives = selected?.selectedElectives ?? [];
  const access: JuniorPlanAccess = { active: plan.status === "ACTIVE", selectedElectives: electives };
  return {
    profiles: views,
    selected,
    xp: { points: xpRow?.points ?? 0, badges: xpRow?.badges ?? [] },
    courses: stampJuniorLessonStatus(
      stampJuniorPlanAccess(
        juniorShelvesForGrade(selected?.grade ?? JUNIOR_PILOT_GRADE, electives.length > 0 ? electives : null),
        access,
      ),
      progress,
    ),
    weeklyReport: selected
      ? buildJuniorWeeklyReport(progress, {
          profileId: selected.id,
          lessonTitle: (lessonKey) => juniorLessonByKey(lessonKey)?.title ?? "Ders",
        })
      : null,
    plan,
  };
}

export async function createJuniorProfile(
  store: JuniorStore,
  userId: string,
  input: unknown,
  now = new Date(),
  notice: JuniorGuardianNotice | null = JUNIOR_GUARDIAN_NOTICE,
): Promise<JuniorOk<{ profile: JuniorProfileView }> | JuniorFail> {
  const fieldError = juniorProfileFieldError(input, now, notice);
  if (fieldError) {
    return { ok: false, status: 400, error: fieldError };
  }
  const sealed = notice ? juniorProfileCreateSealedSchema.parse(input) : null;
  const parsed = sealed ?? juniorProfileCreateSchema.parse(input);
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
  const created = await store.insertProfile(
    {
      userId,
      nickname,
      grade: parsed.grade,
      birthYear: parsed.birthYear,
      consentAt: now,
      selected: existing.length === 0,
      selectedElectives: [],
      gradeSwitchRights: JUNIOR_GRADE_SWITCH_RIGHTS,
    },
    sealed && notice
      ? {
          consentVersion: notice.version,
          noticeSha256: notice.sha256,
          guardianBirthYear: sealed.guardianBirthYear,
          consentAt: now,
        }
      : null,
  );
  return { ok: true, data: { profile: toProfileView(created) } };
}

export async function confirmJuniorGuardianConsent(
  store: JuniorStore,
  userId: string,
  input: unknown,
  now = new Date(),
  notice: JuniorGuardianNotice | null = JUNIOR_GUARDIAN_NOTICE,
): Promise<JuniorOk<{ profile: JuniorProfileView }> | JuniorFail> {
  if (!notice || !isJuniorNoticeUsable(notice)) {
    return { ok: false, status: 400, error: notice ? JUNIOR_NOTICE_VERSION_ERROR : JUNIOR_NOTICE_UNSEALED_ERROR };
  }
  const parsed = juniorProfileConsentUpdateSchema.safeParse(input);
  if (!parsed.success || parsed.data.consentVersion !== notice.version) {
    return { ok: false, status: 400, error: JUNIOR_NOTICE_VERSION_ERROR };
  }
  const yearError = juniorGuardianYearError(parsed.data.guardianBirthYear, now);
  if (yearError) {
    return { ok: false, status: 400, error: yearError };
  }
  const profile = await store.getProfile(userId, parsed.data.profileId);
  if (!profile) {
    return { ok: false, status: 404, error: "Bu profil senin hesabında yok." };
  }
  if (isJuniorProfileClosed(profile)) {
    return { ok: false, status: 403, error: JUNIOR_PROFILE_CLOSED_ERROR };
  }
  const linked = await store.bindGuardianConsent(userId, profile.id, {
    consentVersion: notice.version,
    noticeSha256: notice.sha256,
    guardianBirthYear: parsed.data.guardianBirthYear,
    consentAt: now,
  });
  if (!linked) {
    return { ok: false, status: 404, error: "Bu profil senin hesabında yok." };
  }
  return { ok: true, data: { profile: toProfileView(linked) } };
}

export async function eraseJuniorChildProfile(
  store: JuniorStore,
  userId: string,
  profileId: string,
  now = new Date(),
): Promise<JuniorOk<{ erased: true; profileId: string }> | JuniorFail> {
  const profile = await store.getProfile(userId, profileId);
  if (!profile) {
    return { ok: false, status: 404, error: "Bu profil senin hesabında yok." };
  }
  const erased = await store.eraseChildData(userId, profile.id, now);
  if (!erased) {
    return { ok: false, status: 404, error: "Bu profil senin hesabında yok." };
  }
  return { ok: true, data: { erased: true, profileId: erased.profileId } };
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

export async function switchJuniorGrade(
  store: JuniorStore,
  userId: string,
  input: unknown,
  now = new Date(),
): Promise<JuniorOk<{ profile: JuniorProfileView }> | JuniorFail> {
  const parsed = juniorGradeSwitchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "Sınıf seçilemedi." };
  }
  if (parsed.data.grade !== JUNIOR_PILOT_GRADE) {
    return { ok: false, status: 403, error: JUNIOR_PILOT_SHELF_LINE };
  }
  const profile = await store.getProfile(userId, parsed.data.profileId);
  if (!profile) {
    return { ok: false, status: 404, error: "Bu profil senin hesabında yok." };
  }
  if (isJuniorProfileClosed(profile)) {
    return { ok: false, status: 403, error: JUNIOR_PROFILE_CLOSED_ERROR };
  }
  if (profile.grade === parsed.data.grade) {
    return { ok: false, status: 400, error: "Bu sınıf zaten seçili." };
  }
  const subscription = await store.getSubscription(userId);
  if (!isJuniorPlanActive(subscription, now)) {
    return { ok: false, status: 403, error: "Sınıf değiştirmek için yıllık paket açık olsun." };
  }
  if (profile.gradeSwitchRights < 1 || (subscription?.gradeSwitchRights ?? 0) < 1) {
    return { ok: false, status: 403, error: JUNIOR_GRADE_SWITCH_EXHAUSTED };
  }
  const applied = await store.applyGradeSwitch(userId, profile.id, parsed.data.grade);
  if (applied === "exhausted") {
    return { ok: false, status: 403, error: JUNIOR_GRADE_SWITCH_EXHAUSTED };
  }
  if (!applied) {
    return { ok: false, status: 404, error: "Bu profil senin hesabında yok." };
  }
  return { ok: true, data: { profile: toProfileView(applied.profile) } };
}

export function readJuniorLesson(lessonKey: string, plan: JuniorPlanAccess | null = null):
  | {
      access: "free";
      title: string;
      courseTitle: string;
      script: string;
      scene: JuniorVectorScene;
      steps?: readonly string[];
      mebNote: string;
      lifeUse: string;
      parentNote?: string;
      practice: JuniorPracticeItem[];
      quiz: JuniorPracticeChoice[];
      /** «Hazırım, Sana Anlatayım!» yönlendirme kontrol soruları. */
      tellGuides: string[];
      preparing: boolean;
    }
  | { access: "locked"; title: string; courseTitle: string; teaser: string; preparing: boolean }
  | { access: "missing" } {
  const lesson = juniorLessonByKey(lessonKey);
  if (!lesson) {
    return { access: "missing" };
  }
  const courseTitle = juniorCourseShelves().find((course) =>
    course.lessons.some((row) => row.key === lesson.key),
  )?.title ?? "6. Sınıf";
  const preparing = juniorProductionSealGaps(lesson).length > 0;
  if (juniorLessonAccessForPlan(lesson.key, plan) !== "free") {
    return { access: "locked", title: lesson.title, courseTitle, teaser: lesson.teaser, preparing };
  }
  return {
    access: "free",
    title: lesson.title,
    courseTitle,
    script: lesson.listenText,
    scene: lesson.scene,
    steps: lesson.steps ? [...lesson.steps] : undefined,
    mebNote: lesson.mebNote,
    lifeUse: lesson.lifeUse,
    parentNote: lesson.parentNote,
    practice: publicJuniorPractice(lesson.key),
    quiz: publicJuniorTopicQuiz(lesson.key),
    tellGuides: [...juniorTellGuides(lesson.key)],
    preparing,
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
    actor?: JuniorActor | null;
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
    const gate = await gateLesson(store, input.userId, input.profileId, input.lessonKey, input.actor ?? null);
    if (!gate.ok) {
      return gate;
    }
    const now = input.now ?? new Date();
    const prior = await store.listProgress(input.userId, input.profileId);
    const day = startOfEuropeIstanbulDay(now);
    const tellsToday = prior.filter(
      (row) => (row.mode === "speak" || row.mode === "write") && row.createdAt >= day,
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
        tellGuides: juniorTellGuides(lesson.key),
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
    actor?: JuniorActor | null;
  },
): Promise<JuniorOk<JuniorFeedback & { correct: number; total: number; notes: { id: string; ok: boolean; explanation: string }[] }> | JuniorFail> {
  const gate = await gateLesson(store, input.userId, input.profileId, input.lessonKey, input.actor ?? null);
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

export async function submitJuniorQuiz(
  store: JuniorStore,
  input: {
    userId: string;
    profileId: string;
    lessonKey: string;
    answers: readonly JuniorPracticeAnswer[];
    now?: Date;
    actor?: JuniorActor | null;
  },
): Promise<
  | JuniorOk<
      JuniorFeedback & {
        correct: number;
        total: number;
        completed: boolean;
        notes: { id: string; ok: boolean; explanation: string }[];
      }
    >
  | JuniorFail
> {
  const gate = await gateLesson(store, input.userId, input.profileId, input.lessonKey, input.actor ?? null);
  if (!gate.ok) {
    return gate;
  }
  const now = input.now ?? new Date();
  const prior = await store.listProgress(input.userId, input.profileId);
  const graded = gradeJuniorTopicQuiz(input.lessonKey, input.answers);
  if (!graded) {
    return { ok: false, status: 403, error: JUNIOR_QUIZ_PREPARING_LABEL };
  }
  if (!juniorTellPassed(prior, input.lessonKey)) {
    return {
      ok: false,
      status: 403,
      error: "Konu testi kilitli. Önce dinle ve anlat. Geçer puanı alınca yeniden dene.",
    };
  }
  const completed = graded.score >= JUNIOR_QUIZ_PASS_SCORE;
  const reading = {
    onTopic: true,
    praised: completed ? "Tamamlandı." : "Tuzaklara Düşme! Eksik kalan yeri birlikte görürüz.",
    missing: completed ? "Eksik kalan nokta yok." : "Eksik sorunun cümlesi ipucunu taşıyor.",
    advice: completed
      ? "Bu ders bitti. İstersen sıradaki konuya geç."
      : "Altın İpucu! Eksik cümleyi bir kez daha oku. Sonra testi yeniden çöz.",
    score: graded.score,
  };
  const saved = await commitFeedback(store, {
    userId: input.userId,
    profileId: input.profileId,
    lessonKey: input.lessonKey,
    mode: "quiz",
    reading,
    prior,
    now,
    base: JUNIOR_QUIZ_XP,
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
      completed,
      notes: graded.notes,
    },
  };
}

async function gateLesson(
  store: JuniorStore,
  userId: string,
  profileId: string,
  lessonKey: string,
  actor: JuniorActor | null,
): Promise<
  | { ok: true; lesson: NonNullable<ReturnType<typeof juniorLessonByKey>>; profile: { birthYear: number } }
  | JuniorFail
> {
  const profile = await store.getProfile(userId, profileId);
  if (!profile) {
    return { ok: false, status: 404, error: "Bu profil senin hesabında yok." };
  }
  const consentBlock = juniorLessonConsentBlock(profile, JUNIOR_GUARDIAN_NOTICE);
  if (consentBlock) {
    return { ok: false, status: 403, error: consentBlock };
  }
  const birthYear = profile.birthYear;
  if (birthYear == null) {
    return { ok: false, status: 403, error: JUNIOR_PROFILE_CLOSED_ERROR };
  }
  const subscription = await store.getSubscription(userId);
  const planActive = isJuniorPlanActive(subscription, new Date());
  const access = juniorLessonAccess(lessonKey);
  const planCovers = juniorPlanCoversLesson(lessonKey, planActive, profile.selectedElectives);
  const sessionActor: JuniorActor = actor?.id ? actor : { id: userId };
  const decision = canEnterJunior(sessionActor, lessonKey, {
    intent: "paid-action",
    lessonAccess: access,
    planCovers,
    id: profileId,
  });
  if (access === "missing" || (!decision.allow && decision.reason === "missing")) {
    return { ok: false, status: 404, error: "Bu ders yok." };
  }
  if (!decision.allow) {
    if (access === "locked") {
      return {
        ok: false,
        status: 403,
        error: planActive
          ? "Bu seçmeli ders paket kotanda yok. En fazla üç ders seçilir."
          : "Bu konu veli girişi ve yıllık paket ister.",
      };
    }
    return { ok: false, status: 403, error: JUNIOR_PAID_ACTION_ERROR };
  }
  const lesson = juniorLessonByKey(lessonKey);
  if (!lesson) {
    return { ok: false, status: 404, error: "Bu ders yok." };
  }
  return { ok: true, lesson, profile: { birthYear } };
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
    mode: "speak" | "write" | "practice" | "quiz";
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
