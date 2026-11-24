/**
 * YetkinCV vaka bankası ve puan hesabı.
 * Doğru şık istemciye gitmez. Puan, akademi sınav motoruyla aynı tam sayı yüzde formülüdür.
 * CV metni saklanmaz; kamu kartı yalnız kapalı sözlükten üretilen sinyali taşır.
 * Sahte ilan, sahte şirket ve sahte logo yoktur.
 */

import { z } from "zod";
import { parseSha256Hex, sha256Hex } from "@/lib/kernel/crypto/sha256";
import { yetkinCvBankForVertical } from "@/lib/career/yetkincv-bank";
import {
  YETKINCV_ROLES,
  YETKINCV_VERTICALS,
  type YetkinCvCardView,
  type YetkinCvPublicQuestion,
  type YetkinCvRoleId,
  type YetkinCvVerticalId,
} from "@/lib/career/yetkincv-options";

export {
  YETKINCV_ROLES,
  YETKINCV_VERTICALS,
  type YetkinCvCardView,
  type YetkinCvPublicQuestion,
  type YetkinCvRoleId,
  type YetkinCvVerticalId,
} from "@/lib/career/yetkincv-options";

export const YETKINCV_PASS_SCORE = 70 as const;
export const YETKINCV_PAYLOAD_VERSION = "yetkin-rail.career.yetkincv.v1" as const;
export const YETKINCV_CATALOG_MODULE = "career" as const;
export const YETKINCV_CATALOG_UNIT = "yetkincv-exam" as const;
export const YETKINCV_SITTING_MS = 45 * 60 * 1000;
export const YETKINCV_CV_MIN = 40 as const;
export const YETKINCV_CV_MAX = 6000 as const;
/** Serbest kariyer oturumunda dikeyden seçilen soru sayısı. */
export const YETKINCV_SESSION_SIZE = 8 as const;
/** Aynı dikeyde 30 gün içinde azami deneme. */
export const YETKINCV_MAX_ATTEMPTS = 3 as const;
export const YETKINCV_ATTEMPT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
/** Dikey bankasında asgari soru. */
export const YETKINCV_BANK_MIN = 12 as const;
/**
 * Tek teslimde kabul edilen azami cevap.
 *
 * Kurumsal yol, ilanın seçtiği **tüm** becerilerin sorularını sorar; bu sayı banka
 * büyüklüğüne bağlıdır (bugün 12). Cap tam 12 iken bankaya bir soru eklemek
 * teslimi sessizce "Cevap listesi geçersiz." ile kırardı. Başlık payı bırakılır ve
 * `tests/career/reaudit-p0-seals.test.ts` bank ≤ cap ilişkisini kilitler.
 */
export const YETKINCV_SUBMIT_ANSWERS_MAX = 16 as const;

export type YetkinCvQuestion = {
  id: string;
  kind: "choice" | "case";
  skillId: string;
  skillLabel: string;
  prompt: string;
  choices: readonly string[];
  correctIndex: number;
};

export type YetkinCvAnswer = {
  questionId: string;
  choiceIndex: number;
};

export type YetkinCvSkillScore = {
  id: string;
  label: string;
  score: number;
  correct: number;
  total: number;
};

export type YetkinCvSwotInput = {
  score: number;
  passed: boolean;
  roleLabel: string;
  verticalLabel: string;
  practiceHref: string;
  verifyHref: string | null;
  strongSkills: readonly string[];
  gapSkills: readonly string[];
  cvSignals: readonly string[];
};

/** Soru kimliği → görüntülenen şık sırasının orijinal indeksleri. */
export type YetkinCvChoiceOrder = Record<string, number[]>;

type Axis = { id: string; label: string; needles: readonly string[] };

const CV_AXES: readonly Axis[] = [
  { id: "stock", label: "stok ve sipariş", needles: ["stok", "sipariş", "kargo", "iade"] },
  { id: "channel", label: "pazaryeri", needles: ["pazaryeri", "trendyol", "hepsiburada", "n11"] },
  { id: "grant", label: "hibe dosyası", needles: ["hibe", "kosgeb", "tübitak", "tubitak", "uygunluk"] },
  { id: "budget", label: "bütçe", needles: ["bütçe", "butce", "maliyet", "harcama"] },
  { id: "ads", label: "reklam", needles: ["reklam", "kampanya", "dönüşüm", "donusum"] },
  { id: "content", label: "içerik", needles: ["içerik", "icerik", "sosyal medya", "metin"] },
  { id: "sheet", label: "tablo", needles: ["excel", "tablo", "rapor", "e-posta", "eposta"] },
  { id: "privacy", label: "veri gizliliği", needles: ["kvkk", "kişisel veri", "kisisel veri", "maske"] },
  { id: "software", label: "yazılım", needles: ["api", "test", "prompt", "otomasyon", "yazılım", "yazilim"] },
];

function fnv1a(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Deterministik Fisher–Yates. Aynı seed aynı sırayı üretir. */
export function yetkinCvShuffleIndices(length: number, seed: string): number[] {
  const order = Array.from({ length }, (_, index) => index);
  let state = fnv1a(seed) || 1;
  for (let i = length - 1; i > 0; i -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    const tmp = order[i]!;
    order[i] = order[j]!;
    order[j] = tmp;
  }
  return order;
}

export function yetkinCvBuildChoiceOrder(
  questions: readonly YetkinCvQuestion[],
  sittingSeed: string,
): YetkinCvChoiceOrder {
  const order: YetkinCvChoiceOrder = {};
  for (const question of questions) {
    order[question.id] = yetkinCvShuffleIndices(
      question.choices.length,
      `${sittingSeed}:${question.id}:choices`,
    );
  }
  return order;
}

export function yetkinCvApplyChoiceOrder(
  choices: readonly string[],
  order: readonly number[],
): string[] {
  return order.map((index) => choices[index] ?? "");
}

/** Görüntülenen şık indeksini bankadaki orijinal indekse çevirir. */
export function yetkinCvRemapDisplayedChoice(
  displayedIndex: number,
  order: readonly number[] | undefined,
): number | null {
  if (!order || order.length === 0) {
    return displayedIndex;
  }
  if (!Number.isInteger(displayedIndex) || displayedIndex < 0 || displayedIndex >= order.length) {
    return null;
  }
  const original = order[displayedIndex];
  return typeof original === "number" ? original : null;
}

export function yetkinCvRemapAnswers(
  answers: readonly YetkinCvAnswer[],
  choiceOrder: YetkinCvChoiceOrder,
): YetkinCvAnswer[] | null {
  const remapped: YetkinCvAnswer[] = [];
  for (const answer of answers) {
    const order = choiceOrder[answer.questionId];
    const original = yetkinCvRemapDisplayedChoice(answer.choiceIndex, order);
    if (original === null) {
      return null;
    }
    remapped.push({ questionId: answer.questionId, choiceIndex: original });
  }
  return remapped;
}

export function yetkinCvPickSessionQuestions(
  bank: readonly YetkinCvQuestion[],
  count: number,
  seed: string,
): YetkinCvQuestion[] {
  if (bank.length === 0 || count <= 0) {
    return [];
  }
  const take = Math.min(count, bank.length);
  const order = yetkinCvShuffleIndices(bank.length, `${seed}:pick`);
  return order.slice(0, take).map((index) => bank[index]!);
}

export function yetkinCvCorrectIndexDistribution(
  questions: readonly YetkinCvQuestion[],
): { counts: number[]; maxShare: number } {
  const counts = [0, 0, 0, 0];
  for (const question of questions) {
    const index = question.correctIndex;
    if (index >= 0 && index <= 3) {
      counts[index] = (counts[index] ?? 0) + 1;
    }
  }
  const total = questions.length || 1;
  return { counts, maxShare: Math.max(...counts) / total };
}

export function yetkinCvRole(id: string): (typeof YETKINCV_ROLES)[number] | null {
  return YETKINCV_ROLES.find((row) => row.id === id) ?? null;
}

export function yetkinCvVertical(id: string): (typeof YETKINCV_VERTICALS)[number] | null {
  return YETKINCV_VERTICALS.find((row) => row.id === id) ?? null;
}

export function yetkinCvPracticeHref(verticalId: string): string {
  return yetkinCvVertical(verticalId)?.practiceHref ?? "/tezgah";
}

export function yetkinCvQuestions(verticalId: string): readonly YetkinCvQuestion[] | null {
  const vertical = yetkinCvVertical(verticalId);
  if (!vertical) {
    return null;
  }
  const bank = yetkinCvBankForVertical(vertical.id);
  return bank ?? null;
}

export function yetkinCvPublicQuestions(
  questions: readonly YetkinCvQuestion[],
  choiceOrder?: YetkinCvChoiceOrder | null,
): YetkinCvPublicQuestion[] {
  return questions.map((question) => {
    const order = choiceOrder?.[question.id];
    return {
      id: question.id,
      kind: question.kind,
      skillLabel: question.skillLabel,
      prompt: question.prompt,
      choices: order ? yetkinCvApplyChoiceOrder(question.choices, order) : [...question.choices],
    };
  });
}

export function yetkinCvQuestionsByIds(
  verticalId: string,
  ids: readonly string[],
): YetkinCvQuestion[] | null {
  const bank = yetkinCvQuestions(verticalId);
  if (!bank || ids.length === 0) {
    return null;
  }
  const byId = new Map(bank.map((question) => [question.id, question]));
  const picked: YetkinCvQuestion[] = [];
  for (const id of ids) {
    const question = byId.get(id);
    if (!question || picked.some((row) => row.id === id)) {
      return null;
    }
    picked.push(question);
  }
  return picked;
}

/** Dikeyin gerçek alt testleri. Doğru şık bu listede yoktur. */
export function yetkinCvSkillCatalog(verticalId: string): { key: string; label: string }[] | null {
  const bank = yetkinCvQuestions(verticalId);
  if (!bank) {
    return null;
  }
  const skills: { key: string; label: string }[] = [];
  for (const question of bank) {
    if (skills.some((row) => row.key === question.skillId)) {
      continue;
    }
    skills.push({ key: question.skillId, label: question.skillLabel });
  }
  return skills;
}

/** İlanın seçtiği becerilerin soruları. Bankada olmayan anahtar soru üretmez. */
export function yetkinCvQuestionsForSkills(
  verticalId: string,
  skillIds: readonly string[],
): YetkinCvQuestion[] | null {
  const bank = yetkinCvQuestions(verticalId);
  if (!bank || skillIds.length === 0) {
    return null;
  }
  const wanted = new Set(skillIds);
  if (wanted.size !== skillIds.length) {
    return null;
  }
  const picked = bank.filter((question) => wanted.has(question.skillId));
  const covered = new Set(picked.map((question) => question.skillId));
  for (const skillId of wanted) {
    if (!covered.has(skillId)) {
      return null;
    }
  }
  return picked;
}

/**
 * Tam sayı yüzde: floor((doğru * 100) / toplam).
 * `gradeAcademyExam` ile aynı formül. API mühürlemeden önce motor puanıyla karşılaştırır.
 */
export function gradeYetkinCvExam(
  questions: readonly YetkinCvQuestion[],
  answers: readonly YetkinCvAnswer[],
): { score: number; correctCount: number; total: number } {
  const byId = new Map(answers.map((answer) => [answer.questionId, answer.choiceIndex]));
  let correctCount = 0;
  for (const question of questions) {
    if (byId.get(question.id) === question.correctIndex) {
      correctCount += 1;
    }
  }
  const total = questions.length;
  const score = total === 0 ? 0 : Math.trunc((correctCount * 100) / total);
  return { score, correctCount, total };
}

export function yetkinCvSkillBreakdown(
  questions: readonly YetkinCvQuestion[],
  answers: readonly YetkinCvAnswer[],
): YetkinCvSkillScore[] {
  const byId = new Map(answers.map((answer) => [answer.questionId, answer.choiceIndex]));
  const buckets = new Map<string, YetkinCvSkillScore>();
  for (const question of questions) {
    const current = buckets.get(question.skillId) ?? {
      id: question.skillId,
      label: question.skillLabel,
      score: 0,
      correct: 0,
      total: 0,
    };
    current.total += 1;
    if (byId.get(question.id) === question.correctIndex) {
      current.correct += 1;
    }
    buckets.set(question.skillId, current);
  }
  return [...buckets.values()].map((row) => ({
    ...row,
    score: row.total === 0 ? 0 : Math.trunc((row.correct * 100) / row.total),
  }));
}

export function normalizeYetkinCvText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export function yetkinCvDigest(normalized: string): string {
  return sha256Hex(normalized);
}

export function yetkinCvSignals(normalized: string): string[] {
  const haystack = normalized.toLocaleLowerCase("tr");
  const hits: string[] = [];
  for (const axis of CV_AXES) {
    if (axis.needles.some((needle) => haystack.includes(needle))) {
      hits.push(axis.label);
    }
  }
  return hits.slice(0, 6);
}

export function yetkinCvSkillSeal(skills: readonly YetkinCvSkillScore[]): string {
  return skills.map((row) => `${row.id}:${row.score}:${row.correct}/${row.total}`).join("|");
}

export function yetkinCvHashPayload(input: {
  userId: string;
  sittingId: string;
  roleId: string;
  verticalId: string;
  score: number;
  issuedAt: Date;
  cvDigest: string;
  skillSeal: string;
}): string {
  return [
    YETKINCV_PAYLOAD_VERSION,
    input.userId,
    input.sittingId,
    input.roleId,
    input.verticalId,
    String(input.score),
    input.issuedAt.toISOString(),
    input.cvDigest,
    input.skillSeal,
  ].join("\n");
}

export function computeYetkinCvHash(input: {
  userId: string;
  sittingId: string;
  roleId: string;
  verticalId: string;
  score: number;
  issuedAt: Date;
  cvDigest: string;
  skillSeal: string;
}): string {
  return sha256Hex(yetkinCvHashPayload(input));
}

export function yetkinCvVerifyPath(hash: string): string | null {
  const parsed = parseSha256Hex(hash);
  if (!parsed) {
    return null;
  }
  return `/vize/${parsed}`;
}

export function toYetkinCvSwotInput(input: {
  score: number;
  roleId: string;
  verticalId: string;
  skills: readonly Pick<YetkinCvSkillScore, "label" | "score">[];
  certificateHash: string;
  cvSignals: readonly string[];
}): YetkinCvSwotInput | null {
  const role = yetkinCvRole(input.roleId);
  const vertical = yetkinCvVertical(input.verticalId);
  if (!role || !vertical) {
    return null;
  }
  if (!Number.isInteger(input.score) || input.score < 0 || input.score > 100) {
    return null;
  }
  return {
    score: input.score,
    passed: input.score >= YETKINCV_PASS_SCORE,
    roleLabel: role.label,
    verticalLabel: vertical.label,
    practiceHref: vertical.practiceHref,
    verifyHref: input.score >= YETKINCV_PASS_SCORE ? yetkinCvVerifyPath(input.certificateHash) : null,
    strongSkills: input.skills.filter((row) => row.score >= YETKINCV_PASS_SCORE).map((row) => row.label),
    gapSkills: input.skills.filter((row) => row.score < YETKINCV_PASS_SCORE).map((row) => row.label),
    cvSignals: input.cvSignals.filter((row) => row.trim().length > 0).slice(0, 6),
  };
}

export function toYetkinCvCardView(input: {
  score: number;
  roleId: string;
  verticalId: string;
  skills: readonly YetkinCvSkillScore[];
  certificateHash: string;
  issuedAt: Date;
}): YetkinCvCardView | null {
  const role = yetkinCvRole(input.roleId);
  const vertical = yetkinCvVertical(input.verticalId);
  const verifyPath = yetkinCvVerifyPath(input.certificateHash);
  if (!role || !vertical || !verifyPath) {
    return null;
  }
  if (!Number.isInteger(input.score) || input.score < 0 || input.score > 100) {
    return null;
  }
  return {
    score: input.score,
    passed: input.score >= YETKINCV_PASS_SCORE,
    roleLabel: role.label,
    verticalLabel: vertical.label,
    skills: input.skills.map((row) => ({ id: row.id, label: row.label, score: row.score })),
    certificateHash: parseSha256Hex(input.certificateHash) ?? input.certificateHash,
    verifyPath,
    issuedAt: input.issuedAt.toISOString(),
  };
}

export type YetkinCvStartInput = {
  roleId: YetkinCvRoleId;
  verticalId: YetkinCvVerticalId;
  cvText: string;
};

export type YetkinCvSubmitInput = {
  sittingId: string;
  answers: YetkinCvAnswer[];
};

const yetkinCvRoleIds = YETKINCV_ROLES.map((row) => row.id) as [YetkinCvRoleId, ...YetkinCvRoleId[]];
const yetkinCvVerticalIds = YETKINCV_VERTICALS.map((row) => row.id) as [
  YetkinCvVerticalId,
  ...YetkinCvVerticalId[],
];

/**
 * `action` yalnız yönlendirme anahtarıdır: rota onu okuyup `start`/`submit` dalına girer.
 * Şema `strictObject` olduğu için anahtar burada **açıkça** kabul edilmezse istemcinin
 * gönderdiği gövde tamamen reddedilir (sınav hiç açılmaz). Değeri doğrulanır, yok sayılmaz.
 */
export const yetkinCvStartSchema = z.strictObject({
  action: z.literal("start").optional(),
  roleId: z.enum(yetkinCvRoleIds),
  verticalId: z.enum(yetkinCvVerticalIds),
  cvText: z.string(),
});

export const yetkinCvSubmitSchema = z.strictObject({
  action: z.literal("submit").optional(),
  sittingId: z
    .string()
    .trim()
    .regex(/^[a-z0-9_-]{8,40}$/i, "Sınav oturumu bulunamadı."),
  answers: z
    .array(
      z.strictObject({
        questionId: z.string().min(1),
        choiceIndex: z.number().int().min(0).max(7),
      }),
    )
    .min(1)
    .max(YETKINCV_SUBMIT_ANSWERS_MAX),
});

export function parseYetkinCvStart(raw: unknown): { ok: true; value: YetkinCvStartInput } | { ok: false; error: string } {
  const parsed = yetkinCvStartSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Hedef pozisyon ve uzmanlık listeden seçilir." };
  }
  const role = yetkinCvRole(parsed.data.roleId);
  const vertical = yetkinCvVertical(parsed.data.verticalId);
  if (!role || !vertical) {
    return { ok: false, error: "Hedef pozisyon ve uzmanlık listeden seçilir." };
  }
  const cvText = normalizeYetkinCvText(parsed.data.cvText);
  if (cvText.length < YETKINCV_CV_MIN) {
    return { ok: false, error: "CV özeti en az 40 karakter olmalı." };
  }
  if (cvText.length > YETKINCV_CV_MAX) {
    return { ok: false, error: "CV özeti 6000 karakteri aşamaz." };
  }
  return { ok: true, value: { roleId: role.id, verticalId: vertical.id, cvText } };
}

export function parseYetkinCvSubmit(
  raw: unknown,
): { ok: true; value: YetkinCvSubmitInput } | { ok: false; error: string } {
  const parsed = yetkinCvSubmitSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.path[0] === "sittingId") {
      return { ok: false, error: "Sınav oturumu bulunamadı." };
    }
    if (issue?.path[0] === "answers") {
      if (issue.path.length > 1) {
        return { ok: false, error: issue.message.includes("choiceIndex") ? "Şık indeksi geçersiz." : "Cevap satırı geçersiz." };
      }
      return { ok: false, error: "Cevap listesi geçersiz." };
    }
    return { ok: false, error: "İstek gövdesi okunamadı." };
  }
  return {
    ok: true,
    value: {
      sittingId: parsed.data.sittingId,
      answers: parsed.data.answers.map((row) => ({
        questionId: row.questionId,
        choiceIndex: row.choiceIndex,
      })),
    },
  };
}

export function readYetkinCvChoiceOrder(value: unknown): YetkinCvChoiceOrder {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const order: YetkinCvChoiceOrder = {};
  for (const [key, row] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(row) || row.length === 0) {
      continue;
    }
    if (!row.every((item) => typeof item === "number" && Number.isInteger(item))) {
      continue;
    }
    order[key] = row as number[];
  }
  return order;
}
