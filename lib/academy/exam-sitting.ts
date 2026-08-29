import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import type {
  AcademyExamAnswer,
  AcademyExamPublicQuestion,
  AcademyExamQuestion,
  AcademyExamSittingItem,
  AcademyExamSittingRecord,
} from "@/lib/academy/types";
import {
  ACADEMY_EXAM_DRAW_COUNT,
  ACADEMY_EXAM_SUBMIT_GRACE_MS,
} from "@/lib/academy/exam-duration";

export type { AcademyExamSittingItem };

export {
  ACADEMY_EXAM_DRAW_COUNT,
  ACADEMY_EXAM_DURATION_MS,
  ACADEMY_EXAM_POOL_MAX,
  ACADEMY_EXAM_POOL_MIN,
  ACADEMY_EXAM_SUBMIT_GRACE_MS,
  formatAcademyExamRemaining,
} from "@/lib/academy/exam-duration";

const ACADEMY_EXAM_SITTING_VERSION = "yetkin-rail.academy.exam-sitting.v1" as const;
/** Sürüm dizesi MAC anahtarı değildir. Üretimde env; laboratuvarda ayrı sabit. */
const ACADEMY_EXAM_SITTING_MAC_FALLBACK = "yetkin-rail.academy.exam-sitting.mac.v1" as const;

function sittingMacKey(): string {
  const env = process.env.ACADEMY_EXAM_SITTING_SECRET?.trim() ?? "";
  if (env.length >= 16) {
    return env;
  }
  // Vercel `npm run build` NODE_ENV=production iken prebuild Vitest koşar; canlı süreç değildir.
  if (process.env.NODE_ENV === "production" && process.env.VITEST !== "true") {
    throw new Error("Sınav oturumu sırrı yok.");
  }
  return ACADEMY_EXAM_SITTING_MAC_FALLBACK;
}

export type AcademyExamRandInt = (maxExclusive: number) => number;

export type AcademyExamSitting = {
  userId: string;
  courseId: string;
  examId: string;
  startedAt: Date;
  expiresAt: Date;
  items: AcademyExamSittingItem[];
  /** Tek kullanımlık oturum kimliği — anti-replay. */
  jti: string;
  /** Dikey kapı — rail-temel hariç mühürlü iş kanıtı ders anahtarı. */
  proofLessonKey?: string | null;
};

type SittingPayload = {
  v: 1;
  u: string;
  c: string;
  e: string;
  iat: number;
  exp: number;
  jti: string;
  q: Array<{ id: string; p: number[] }>;
  pk?: string;
};

export function cloneAcademyExamSittingItems(
  items: readonly AcademyExamSittingItem[],
): AcademyExamSittingItem[] {
  return items.map((item) => ({ id: item.id, permutation: [...item.permutation] }));
}

export function serializeAcademyExamSittingItems(
  items: readonly AcademyExamSittingItem[],
): string {
  return JSON.stringify(items.map((item) => ({ id: item.id, p: item.permutation })));
}

export function parseAcademyExamSittingItems(raw: string): AcademyExamSittingItem[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return null;
  }
  const items: AcademyExamSittingItem[] = [];
  for (const row of parsed) {
    if (
      !row ||
      typeof row !== "object" ||
      typeof (row as { id?: unknown }).id !== "string" ||
      !Array.isArray((row as { p?: unknown }).p) ||
      !(row as { p: unknown[] }).p.every((index) => Number.isInteger(index))
    ) {
      return null;
    }
    items.push({
      id: (row as { id: string }).id,
      permutation: (row as { p: number[] }).p.map((index) => Number(index)),
    });
  }
  return items;
}

export function academyExamSittingItemsEqual(
  left: readonly AcademyExamSittingItem[],
  right: readonly AcademyExamSittingItem[],
): boolean {
  return serializeAcademyExamSittingItems(left) === serializeAcademyExamSittingItems(right);
}

/**
 * Sunucu sicili jetonla örtüşür ve henüz tüketilmemiştir.
 * Tüketim AcademyStore.consumeExamSitting ile atomiktir (çok örnek).
 */
export function academyExamSittingMayConsume(
  row: AcademyExamSittingRecord,
  input: {
    userId: string;
    courseId: string;
    examId: string;
    items: readonly AcademyExamSittingItem[];
  },
): boolean {
  if (row.consumedAt) {
    return false;
  }
  if (row.userId !== input.userId || row.courseId !== input.courseId || row.examId !== input.examId) {
    return false;
  }
  return academyExamSittingItemsEqual(row.items, input.items);
}

/** Vitest izolasyonu — süreç haritası yoktur; bellek deposu test başına yenidir. */
export function resetAcademyExamSittingConsumptionsForTests(): void {
  /* AcademyStore.consumeExamSitting */
}

export function shuffleCopy<T>(
  items: readonly T[],
  randInt: AcademyExamRandInt = randomInt,
): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    const left = next[i];
    const right = next[j];
    if (left === undefined || right === undefined) {
      continue;
    }
    next[i] = right;
    next[j] = left;
  }
  return next;
}

export function identityPermutation(length: number): number[] {
  return Array.from({ length }, (_, index) => index);
}

/**
 * Şıkları karıştırır; doğru indeks yeni sıraya taşınır.
 * `permutation[newIndex] = oldIndex`.
 */
export function shuffleAcademyExamChoices(
  question: AcademyExamQuestion,
  randInt: AcademyExamRandInt = randomInt,
): { question: AcademyExamQuestion; permutation: number[] } {
  const permutation = shuffleCopy(identityPermutation(question.choices.length), randInt);
  const choices = permutation.map((oldIndex) => question.choices[oldIndex] ?? "");
  const correctIndex = permutation.indexOf(question.correctIndex);
  return {
    permutation,
    question: {
      id: question.id,
      prompt: question.prompt,
      choices,
      correctIndex: correctIndex < 0 ? 0 : correctIndex,
    },
  };
}

export function applyAcademyExamPermutation(
  question: AcademyExamQuestion,
  permutation: readonly number[],
): AcademyExamQuestion {
  if (permutation.length !== question.choices.length) {
    throw new Error("Sınav şık permütasyonu geçersiz.");
  }
  const seen = new Set(permutation);
  if (seen.size !== permutation.length) {
    throw new Error("Sınav şık permütasyonu tekrarlı.");
  }
  for (const index of permutation) {
    if (!Number.isInteger(index) || index < 0 || index >= question.choices.length) {
      throw new Error("Sınav şık permütasyonu sınır dışı.");
    }
  }
  const choices = permutation.map((oldIndex) => question.choices[oldIndex] ?? "");
  const correctIndex = permutation.indexOf(question.correctIndex);
  if (correctIndex < 0) {
    throw new Error("Sınav doğru şık permütasyonda yok.");
  }
  return {
    id: question.id,
    prompt: question.prompt,
    choices,
    correctIndex,
  };
}

/**
 * Havuzdan rastgele `count` soru çeker, her birinin şıklarını karıştırır.
 */
export function drawAcademyExamQuestions(
  pool: readonly AcademyExamQuestion[],
  count: number = ACADEMY_EXAM_DRAW_COUNT,
  randInt: AcademyExamRandInt = randomInt,
): { questions: AcademyExamQuestion[]; items: AcademyExamSittingItem[] } {
  if (pool.length === 0) {
    throw new Error("Müfredat sınavı soru taşımaz.");
  }
  const take = Math.min(count, pool.length);
  const picked = shuffleCopy(pool, randInt).slice(0, take);
  return materializeDrawnQuestions(picked, randInt);
}

/**
 * En az bir mühürlü soruyu oturuma kilitler (iş kanıtı MCQ); kalanı rastgele doldurur.
 */
export function drawAcademyExamQuestionsPinned(
  pool: readonly AcademyExamQuestion[],
  pinIds: readonly string[],
  count: number = ACADEMY_EXAM_DRAW_COUNT,
  randInt: AcademyExamRandInt = randomInt,
): { questions: AcademyExamQuestion[]; items: AcademyExamSittingItem[] } {
  if (pool.length === 0) {
    throw new Error("Müfredat sınavı soru taşımaz.");
  }
  const byId = new Map(pool.map((question) => [question.id, question]));
  const pinned: AcademyExamQuestion[] = [];
  const seen = new Set<string>();
  for (const id of pinIds) {
    const row = byId.get(id);
    if (!row || seen.has(row.id)) {
      continue;
    }
    pinned.push(row);
    seen.add(row.id);
  }
  const rest = pool.filter((question) => !seen.has(question.id));
  const take = Math.min(count, pool.length);
  const need = Math.max(0, take - pinned.length);
  const picked = shuffleCopy([...pinned, ...shuffleCopy(rest, randInt).slice(0, need)], randInt);
  return materializeDrawnQuestions(picked, randInt);
}

function materializeDrawnQuestions(
  picked: readonly AcademyExamQuestion[],
  randInt: AcademyExamRandInt,
): { questions: AcademyExamQuestion[]; items: AcademyExamSittingItem[] } {
  const questions: AcademyExamQuestion[] = [];
  const items: AcademyExamSittingItem[] = [];
  for (const row of picked) {
    const shuffled = shuffleAcademyExamChoices(row, randInt);
    questions.push(shuffled.question);
    items.push({ id: row.id, permutation: shuffled.permutation });
  }
  return { questions, items };
}

export function materializeAcademyExamSitting(
  pool: readonly AcademyExamQuestion[],
  items: readonly AcademyExamSittingItem[],
): AcademyExamQuestion[] {
  const byId = new Map(pool.map((question) => [question.id, question]));
  return items.map((item) => {
    const source = byId.get(item.id);
    if (!source) {
      throw new Error("Sınav oturumu mühürlü havuzla örtüşmüyor.");
    }
    return applyAcademyExamPermutation(source, item.permutation);
  });
}

function sittingMac(body: string): string {
  return createHmac("sha256", sittingMacKey())
    .update(ACADEMY_EXAM_SITTING_VERSION)
    .update(".")
    .update(body)
    .digest("base64url");
}

function encodePayload(payload: SittingPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function sealAcademyExamSitting(sitting: AcademyExamSitting): string {
  const jti = sitting.jti.trim() || randomUUID();
  const payload: SittingPayload = {
    v: 1,
    u: sitting.userId,
    c: sitting.courseId,
    e: sitting.examId,
    iat: sitting.startedAt.getTime(),
    exp: sitting.expiresAt.getTime(),
    jti,
    q: sitting.items.map((item) => ({ id: item.id, p: item.permutation })),
    ...(sitting.proofLessonKey ? { pk: sitting.proofLessonKey } : {}),
  };
  const body = encodePayload(payload);
  return `${body}.${sittingMac(body)}`;
}

export function openAcademyExamSitting(token: string): AcademyExamSitting | null {
  const trimmed = token.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0 || dot === trimmed.length - 1) {
    return null;
  }
  const body = trimmed.slice(0, dot);
  const mac = trimmed.slice(dot + 1);
  const expected = sittingMac(body);
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    (parsed as SittingPayload).v !== 1 ||
    typeof (parsed as SittingPayload).u !== "string" ||
    typeof (parsed as SittingPayload).c !== "string" ||
    typeof (parsed as SittingPayload).e !== "string" ||
    typeof (parsed as SittingPayload).iat !== "number" ||
    typeof (parsed as SittingPayload).exp !== "number" ||
    typeof (parsed as SittingPayload).jti !== "string" ||
    !(parsed as SittingPayload).jti.trim() ||
    !Array.isArray((parsed as SittingPayload).q) ||
    ((parsed as SittingPayload).pk !== undefined && typeof (parsed as SittingPayload).pk !== "string")
  ) {
    return null;
  }
  const payload = parsed as SittingPayload;
  const items: AcademyExamSittingItem[] = [];
  for (const row of payload.q) {
    if (
      !row ||
      typeof row.id !== "string" ||
      !Array.isArray(row.p) ||
      !row.p.every((index) => Number.isInteger(index))
    ) {
      return null;
    }
    items.push({ id: row.id, permutation: row.p.map((index) => Number(index)) });
  }
  if (items.length === 0) {
    return null;
  }
  return {
    userId: payload.u,
    courseId: payload.c,
    examId: payload.e,
    startedAt: new Date(payload.iat),
    expiresAt: new Date(payload.exp),
    jti: payload.jti.trim(),
    items,
    proofLessonKey: payload.pk?.trim() ? payload.pk.trim() : null,
  };
}

export function academyExamSittingExpired(
  sitting: AcademyExamSitting,
  now: Date,
  graceMs: number = ACADEMY_EXAM_SUBMIT_GRACE_MS,
): boolean {
  return now.getTime() > sitting.expiresAt.getTime() + graceMs;
}

/**
 * Karışık şıklı kamu sorularını mühürlü havuzdaki doğru metne göre cevaplar.
 * Ops ve test oturumu bu eşlemeyi kullanır; orijinal indeks şık sırasına bağlı değildir.
 */
export function academyExamAnswersFromPublicQuestions(
  publicQuestions: readonly Pick<AcademyExamPublicQuestion, "id" | "choices">[],
  pool: readonly AcademyExamQuestion[],
): AcademyExamAnswer[] {
  const byId = new Map(pool.map((question) => [question.id, question]));
  return publicQuestions.map((question) => {
    const seeded = byId.get(question.id);
    if (!seeded) {
      throw new Error(`Sınav sorusu tohumda yok: ${question.id}`);
    }
    const correctText = seeded.choices[seeded.correctIndex];
    const choiceIndex = question.choices.indexOf(correctText ?? "");
    if (choiceIndex < 0) {
      throw new Error(`Sınav doğru şık oturumda yok: ${question.id}`);
    }
    return { questionId: question.id, choiceIndex };
  });
}

export function publicQuestionsFromSitting(
  questions: readonly AcademyExamQuestion[],
): AcademyExamPublicQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    choices: question.choices,
  }));
}
