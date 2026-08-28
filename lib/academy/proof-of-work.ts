/**
 * Fail-closed iş kanıtı — pratik simülasyon tohumu, doğrulama, SHA-256 bağ.
 *
 * Client-safe: GEMINI / node:crypto yok. Özet `academyProofOfWorkHash` ile
 * sunucuda `sha256Hex` geçirilerek basılır. Ders tamamlama satırı kalıcı
 * sicildir; süreç `Map` yalnız aynı süreçte hız için durur.
 */

import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";
import type { AcademyLessonCompletionRecord } from "@/lib/academy/types";

export const ACADEMY_PROOF_OF_WORK_VERSION = "yetkin-rail.academy.proof-of-work.v1" as const;
export const ACADEMY_CURRICULUM_PROOF_VERSION = "yetkin-rail.academy.proof-of-work-curriculum.v1" as const;
export const ACADEMY_PROOF_OF_WORK_HASH_PATTERN = /^[a-f0-9]{64}$/;
export const ACADEMY_PROOF_INTEGRITY_KIND = "sha256-task-digest" as const;

export const ACADEMY_PROOF_KINDS = ["amount-kurus", "prompt-pack", "param-lock"] as const;
export type AcademyProofKind = (typeof ACADEMY_PROOF_KINDS)[number];

export type AcademyProofToken = {
  id: string;
  label: string;
};

export type AcademyProofSlot = {
  id: string;
  label: string;
  correctTokenId: string;
};

type AcademyAmountTask = {
  kind: "amount-kurus";
  lessonKey: string;
  brief: string;
  displayAmount: string;
  expectedAmountMinor: number;
  expectedCurrency: "TRY";
};

type AcademyPromptPackTask = {
  kind: "prompt-pack";
  lessonKey: string;
  brief: string;
  requiredPhrases: readonly string[];
  forbiddenPhrases: readonly string[];
  slots: readonly AcademyProofSlot[];
  tokens: readonly AcademyProofToken[];
};

type AcademyParamLockTask = {
  kind: "param-lock";
  lessonKey: string;
  brief: string;
  slots: readonly AcademyProofSlot[];
  tokens: readonly AcademyProofToken[];
};

export type AcademyInteractiveTask = AcademyAmountTask | AcademyPromptPackTask | AcademyParamLockTask;

export type AcademyProofSubmission =
  | { kind: "amount-kurus"; amountText: string; currencyText: string }
  | { kind: "prompt-pack"; prompt: string; slots: Record<string, string> }
  | { kind: "param-lock"; slots: Record<string, string> };

export type AcademyProofSuccessParams =
  | {
      kind: "amount-kurus";
      amountMinor: number;
      currencyCode: "TRY";
      unit: "kurus";
    }
  | {
      kind: "prompt-pack";
      requiredHits: readonly string[];
      slotMap: Record<string, string>;
    }
  | {
      kind: "param-lock";
      slotMap: Record<string, string>;
    };

export type AcademyProofJudgement =
  | { ok: true; task: AcademyInteractiveTask; success: AcademyProofSuccessParams }
  | { ok: false; reason: string };

export type AcademyProofOfWorkBinding = {
  purchaseId: string;
  lessonKey: string;
  hash: string;
  success: AcademyProofSuccessParams;
};

const PARAM_DISTRACTORS: readonly AcademyProofToken[] = [
  { id: "d-float", label: "float lira" },
  { id: "d-cms", label: "CMS yayın" },
  { id: "d-green", label: "yeşil aspekt" },
  { id: "d-exec", label: "sunucuda exec" },
  { id: "d-xp", label: "XP rozeti" },
  { id: "d-vgen", label: "VIDEO_GEN lab" },
];

const AMOUNT_TASKS: Record<string, Omit<AcademyAmountTask, "kind" | "lessonKey">> = {
  "rail-temel-1": {
    brief: "Eğitim kartındaki 690,00 ₺ fiyatını tek cüzdan satırına kuruş ve TRY olarak yaz. Float lira yok.",
    displayAmount: "690,00 ₺",
    expectedAmountMinor: 69_000,
    expectedCurrency: "TRY",
  },
  "rail-temel-2": {
    brief: "15 dakikalık fiyat sabitlemesi 690,00 ₺ tutuyor. Sabitlenen tutarı kuruş ve TRY yaz. Süre dolmuş 689 yok.",
    displayAmount: "690,00 ₺",
    expectedAmountMinor: 69_000,
    expectedCurrency: "TRY",
  },
  "python-bi-1": {
    brief: "Rapor satırındaki 184,50 ₺ tutarı kuruş tamsayı ve TRY. Float ortalama yok.",
    displayAmount: "184,50 ₺",
    expectedAmountMinor: 18_450,
    expectedCurrency: "TRY",
  },
  "fintek-ob-2": {
    brief: "Ürün sırasındaki 0,99 ₺ mikro-iş kalemi tutarını kuruş tamsayı ve TRY yaz. Kıdem tutarı ezmez; kayıt hatasız durur.",
    displayAmount: "0,99 ₺",
    expectedAmountMinor: 99,
    expectedCurrency: "TRY",
  },
};

const PROMPT_PACK_TASKS: Record<string, Omit<AcademyPromptPackTask, "kind" | "lessonKey">> = {
  "yz-icerik-1": {
    brief:
      "Müşteri: «tek beyaz koşu ayakkabısı yeter» ve «her renk ayrı kare, 12 renk». Çelişkiyi kilitlere bırak; kutuya yalnız netleşmiş ayakkabı tarifini yaz. Orta değer yok.",
    requiredPhrases: ["beyaz koşu ayakkabısı", "düz açık gri zemin", "üç çeyrek"],
    forbiddenPhrases: ["12 renk", "7 kare"],
    slots: [
      { id: "brief", label: "brief", correctTokenId: "tok-brief" },
      { id: "conflict", label: "çelişki", correctTokenId: "tok-closed" },
      { id: "produce", label: "üretim", correctTokenId: "tok-stop" },
    ],
    tokens: seededShuffle(
      [
        { id: "tok-brief", label: "sözleşme; sayı yoksa dur" },
        { id: "tok-closed", label: "fail-closed dur" },
        { id: "tok-stop", label: "üretme" },
        { id: "tok-mid", label: "7 kare uydur" },
        { id: "tok-go", label: "hemen bas" },
      ],
      "yz-icerik-1",
    ),
  },
  "yz-icerik-2": {
    brief:
      "Müşteri ticari kullanım, coğrafya ve süre yazmamış. Ayakkabı karesi için tarifi yaz; hak UNSET ise kilitlere üretme bırak. Nike uydurma yok.",
    requiredPhrases: ["ticari kullanım", "koşu ayakkabısı", "stok taban"],
    forbiddenPhrases: ["nike"],
    slots: [
      { id: "rights", label: "hak anı", correctTokenId: "tok-release" },
      { id: "produce", label: "üretim", correctTokenId: "tok-stop" },
      { id: "brand", label: "üçüncü taraf marka", correctTokenId: "tok-drop" },
    ],
    tokens: seededShuffle(
      [
        { id: "tok-release", label: "RELEASE; üretimde hak yok" },
        { id: "tok-stop", label: "üretme" },
        { id: "tok-drop", label: "briefte yoksa düşer" },
        { id: "tok-mix", label: "stok + kendi kare tek paket" },
        { id: "tok-go", label: "hemen bas" },
      ],
      "yz-icerik-2",
    ),
  },
  "yz-icerik-3": {
    brief:
      "Onaylı ayakkabı işi. Kutuya eksiksiz Türkçe tarifi yaz: hedef, istenmeyen, ızgara, palet. «Güzel yap» yok. Eksik parametreyi kilitlere bırak.",
    requiredPhrases: ["tek beyaz koşu ayakkabısı", "açık gri", "2048"],
    forbiddenPhrases: ["güzel yap", "güzel ayakkabı"],
    slots: [
      { id: "pack", label: "paket", correctTokenId: "tok-pack" },
      { id: "decision", label: "karar", correctTokenId: "tok-ok" },
      { id: "secret", label: "tarife girmez", correctTokenId: "tok-secret" },
    ],
    tokens: seededShuffle(
      [
        { id: "tok-pack", label: "hedef + istenmeyen + ızgara + palet" },
        { id: "tok-ok", label: "müşteri onayından sonra" },
        { id: "tok-secret", label: "anahtar, kimlik, bakiye yok" },
        { id: "tok-exec", label: "DevLabs exec" },
        { id: "tok-nice", label: "güzel yap" },
      ],
      "yz-icerik-3",
    ),
  },
  "yz-icerik-4": {
    brief:
      "Müşteri «daha lüks» diyor; palet briefe uyuyor. Tarife ölçülebilir kusur dilini yaz. Tur ve kapsam kilitlerini doğru bırak.",
    requiredPhrases: ["ölçülebilir kusur", "iki tur"],
    forbiddenPhrases: ["daha lüks"],
    slots: [
      { id: "cap", label: "varsayılan tur", correctTokenId: "tok-two" },
      { id: "like", label: "beğenmedim", correctTokenId: "tok-keep" },
      { id: "scope", label: "kapsam şişmesi", correctTokenId: "tok-new" },
    ],
    tokens: seededShuffle(
      [
        { id: "tok-two", label: "2 tur" },
        { id: "tok-keep", label: "tur tüketmez" },
        { id: "tok-new", label: "yeni brief" },
        { id: "tok-free", label: "üçüncü tur ücretsiz" },
        { id: "tok-drop", label: "sessiz tur düş" },
      ],
      "yz-icerik-4",
    ),
  },
  "yz-icerik-5": {
    brief:
      "Teslim tarifi yaz: dosya adı kosu-ayakkabi-on.avif ve her kare için SHA-256. Sohbet dökümü teslim değil. Kilitleri doldur.",
    requiredPhrases: ["kosu-ayakkabi-on.avif", "sha-256"],
    forbiddenPhrases: ["dosyalar yukarıda"],
    slots: [
      { id: "delivery", label: "teslim", correctTokenId: "tok-hash" },
      { id: "name", label: "ad kuralı", correctTokenId: "tok-name" },
      { id: "fee", label: "akademi bedeli", correctTokenId: "tok-fee" },
    ],
    tokens: seededShuffle(
      [
        { id: "tok-hash", label: "URL, dosya listesi, SHA-256" },
        { id: "tok-name", label: "is-anahtari.uzanti" },
        { id: "tok-fee", label: "emanete girmez" },
        { id: "tok-chat", label: "sohbet dökümü teslim" },
        { id: "tok-rel", label: "hash yokken RELEASE" },
      ],
      "yz-icerik-5",
    ),
  },
};

const TASK_CACHE = new Map<string, AcademyInteractiveTask>();
const proofs = new Map<string, AcademyProofOfWorkBinding>();

function proofBindKey(purchaseId: string, lessonKey: string): string {
  return `${purchaseId}:${lessonKey}`;
}

function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const copy = [...items];
  let state = hashSeed(seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = state % (index + 1);
    const current = copy[index]!;
    copy[index] = copy[swap]!;
    copy[swap] = current;
  }
  return copy;
}

function foldTr(text: string): string {
  return text.toLocaleLowerCase("tr-TR").replace(/\s+/gu, " ").trim();
}

function sortedSlotMap(slots: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(slots)
      .map(([key, value]) => [key.trim(), value.trim()] as const)
      .filter(([key, value]) => key.length > 0 && value.length > 0)
      .sort(([left], [right]) => left.localeCompare(right, "tr")),
  );
}

function parseKurusInput(raw: string): number | null {
  const trimmed = raw.trim().replace(/[_\s]/gu, "");
  if (!/^[0-9]+$/u.test(trimmed)) {
    return null;
  }
  const amount = Number(trimmed);
  if (!Number.isInteger(amount) || amount < 0) {
    return null;
  }
  return amount;
}

function buildParamLock(lessonKey: string): AcademyParamLockTask {
  const practice = LESSON_PRACTICE[lessonKey];
  if (!practice) {
    throw new Error(`İş kanıtı pratik yok: ${lessonKey}`);
  }
  const slots = practice.params.map((row, index) => ({
    id: `s${index + 1}`,
    label: row.label,
    correctTokenId: `t${index + 1}`,
  }));
  const correct = practice.params.map((row, index) => ({
    id: `t${index + 1}`,
    label: row.value,
  }));
  const taken = new Set(correct.map((token) => token.label));
  const distractors = PARAM_DISTRACTORS.filter((token) => !taken.has(token.label)).slice(0, 3);
  return {
    kind: "param-lock",
    lessonKey,
    brief: "Kilitli kutulara doğru parametreyi bırak. Yanlış kayıt kapıyı açmaz.",
    slots,
    tokens: seededShuffle([...correct, ...distractors], lessonKey),
  };
}

function buildTask(lessonKey: string): AcademyInteractiveTask {
  const amount = AMOUNT_TASKS[lessonKey];
  if (amount) {
    return { kind: "amount-kurus", lessonKey, ...amount };
  }
  const prompt = PROMPT_PACK_TASKS[lessonKey];
  if (prompt) {
    return { kind: "prompt-pack", lessonKey, ...prompt };
  }
  return buildParamLock(lessonKey);
}

export function academyInteractiveTaskByKey(lessonKey: string): AcademyInteractiveTask | null {
  if (!LESSON_PRACTICE[lessonKey]) {
    return null;
  }
  const cached = TASK_CACHE.get(lessonKey);
  if (cached) {
    return cached;
  }
  const task = buildTask(lessonKey);
  TASK_CACHE.set(lessonKey, task);
  return task;
}

export function listAcademyInteractiveTaskKeys(): readonly string[] {
  return Object.keys(LESSON_PRACTICE).sort((left, right) => left.localeCompare(right));
}

export function slotsMatch(task: AcademyPromptPackTask | AcademyParamLockTask, slots: Record<string, string>): boolean {
  const submitted = sortedSlotMap(slots);
  if (Object.keys(submitted).length !== task.slots.length) {
    return false;
  }
  return task.slots.every((slot) => submitted[slot.id] === slot.correctTokenId);
}

export function evaluateAcademyProofSubmission(
  lessonKey: string,
  submission: AcademyProofSubmission | null | undefined,
): AcademyProofJudgement {
  const task = academyInteractiveTaskByKey(lessonKey);
  if (!task) {
    return { ok: false, reason: "tohum-yok" };
  }
  if (!submission || submission.kind !== task.kind) {
    return { ok: false, reason: "tur-uyusmaz" };
  }
  if (task.kind === "amount-kurus" && submission.kind === "amount-kurus") {
    const amountMinor = parseKurusInput(submission.amountText);
    const currencyCode = submission.currencyText.trim().toUpperCase();
    if (amountMinor !== task.expectedAmountMinor || currencyCode !== task.expectedCurrency) {
      return { ok: false, reason: "tutar-yanlis" };
    }
    return {
      ok: true,
      task,
      success: {
        kind: "amount-kurus",
        amountMinor,
        currencyCode: "TRY",
        unit: "kurus",
      },
    };
  }
  if (task.kind === "prompt-pack" && submission.kind === "prompt-pack") {
    const folded = foldTr(submission.prompt);
    if (folded.length < 12) {
      return { ok: false, reason: "tarif-kisa" };
    }
    const requiredHits = task.requiredPhrases.filter((phrase) => folded.includes(foldTr(phrase)));
    if (requiredHits.length !== task.requiredPhrases.length) {
      return { ok: false, reason: "tarif-eksik" };
    }
    if (task.forbiddenPhrases.some((phrase) => folded.includes(foldTr(phrase)))) {
      return { ok: false, reason: "tarif-yasak" };
    }
    if (!slotsMatch(task, submission.slots)) {
      return { ok: false, reason: "kilit-yanlis" };
    }
    return {
      ok: true,
      task,
      success: {
        kind: "prompt-pack",
        requiredHits: [...task.requiredPhrases],
        slotMap: sortedSlotMap(submission.slots),
      },
    };
  }
  if (task.kind === "param-lock" && submission.kind === "param-lock") {
    if (!slotsMatch(task, submission.slots)) {
      return { ok: false, reason: "kilit-yanlis" };
    }
    return {
      ok: true,
      task,
      success: {
        kind: "param-lock",
        slotMap: sortedSlotMap(submission.slots),
      },
    };
  }
  return { ok: false, reason: "tur-uyusmaz" };
}

export function academyCanonicalProofSubmission(lessonKey: string): AcademyProofSubmission | null {
  const task = academyInteractiveTaskByKey(lessonKey);
  if (!task) {
    return null;
  }
  if (task.kind === "amount-kurus") {
    return {
      kind: "amount-kurus",
      amountText: String(task.expectedAmountMinor),
      currencyText: task.expectedCurrency,
    };
  }
  const slots = Object.fromEntries(task.slots.map((slot) => [slot.id, slot.correctTokenId]));
  if (task.kind === "prompt-pack") {
    return {
      kind: "prompt-pack",
      prompt: task.requiredPhrases.join(". "),
      slots,
    };
  }
  return { kind: "param-lock", slots };
}

export function academyProofOfWorkCanonicalJson(input: {
  lessonKey: string;
  success: AcademyProofSuccessParams;
}): string {
  return JSON.stringify({
    v: ACADEMY_PROOF_OF_WORK_VERSION,
    lessonKey: input.lessonKey,
    success: input.success,
  });
}

/** Sunucu özeti. `digest` = `sha256Hex`. İstemci bu kapıyı çağırmaz. */
export function academyProofOfWorkHash(canonicalJson: string, digest: (value: string) => string): string {
  const hash = digest(canonicalJson).trim().toLowerCase();
  if (!ACADEMY_PROOF_OF_WORK_HASH_PATTERN.test(hash)) {
    throw new Error("İş kanıtı özeti SHA-256 değil.");
  }
  return hash;
}

/** Kanonik doğru gönderimin SHA-256 mührü — öğrenci parmak izi değil, görev mührü. */
export function canonicalAcademyProofOfWorkHash(
  lessonKey: string,
  digest: (value: string) => string,
): string | null {
  const proof = academyCanonicalProofSubmission(lessonKey);
  if (!proof) {
    return null;
  }
  const judged = evaluateAcademyProofSubmission(lessonKey, proof);
  if (!judged.ok) {
    return null;
  }
  return academyProofOfWorkHash(
    academyProofOfWorkCanonicalJson({ lessonKey, success: judged.success }),
    digest,
  );
}

export function academyCurriculumProofCanonicalJson(input: {
  slug: string;
  lessonHashes: readonly string[];
  curriculumSeal: string;
}): string {
  return JSON.stringify({
    v: ACADEMY_CURRICULUM_PROOF_VERSION,
    slug: input.slug,
    lessonHashes: input.lessonHashes,
    curriculumSeal: input.curriculumSeal,
  });
}

export function academyLessonProofHashList(
  lessonKeys: readonly string[],
  digest: (value: string) => string,
): string[] | null {
  const hashes: string[] = [];
  for (const lessonKey of lessonKeys) {
    const hash = canonicalAcademyProofOfWorkHash(lessonKey, digest);
    if (!hash) {
      return null;
    }
    hashes.push(hash);
  }
  return hashes;
}

export function bindAcademyProofOfWork(binding: AcademyProofOfWorkBinding): AcademyProofOfWorkBinding {
  if (!ACADEMY_PROOF_OF_WORK_HASH_PATTERN.test(binding.hash)) {
    throw new Error("İş kanıtı özeti SHA-256 değil.");
  }
  const row: AcademyProofOfWorkBinding = {
    purchaseId: binding.purchaseId,
    lessonKey: binding.lessonKey,
    hash: binding.hash,
    success: binding.success,
  };
  proofs.set(proofBindKey(binding.purchaseId, binding.lessonKey), row);
  return row;
}

export function getAcademyProofOfWork(
  purchaseId: string,
  lessonKey: string,
): AcademyProofOfWorkBinding | null {
  return proofs.get(proofBindKey(purchaseId, lessonKey)) ?? null;
}

export function attachAcademyProofOfWorkHash<
  T extends Pick<AcademyLessonCompletionRecord, "purchaseId" | "lessonKey"> & {
    proofOfWorkHash?: string | null;
  },
>(row: T): T {
  const bound = getAcademyProofOfWork(row.purchaseId, row.lessonKey);
  if (!bound) {
    return row;
  }
  return { ...row, proofOfWorkHash: bound.hash };
}

export function isAcademyWorkTasksComplete(
  expectedLessonKeys: readonly string[],
  completions: readonly Pick<AcademyLessonCompletionRecord, "purchaseId" | "lessonKey">[],
): boolean {
  if (expectedLessonKeys.length === 0) {
    return false;
  }
  const done = new Set(completions.map((row) => row.lessonKey));
  return expectedLessonKeys.every((lessonKey) => done.has(lessonKey));
}
