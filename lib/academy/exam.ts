import { parseSha256Hex, sha256Hex } from "@/lib/kernel/crypto/sha256";
import type {
  AcademyExamAnswer,
  AcademyExamPublicQuestion,
  AcademyExamQuestion,
} from "@/lib/academy/types";

/** S58-A — ustalık belgesi barajı. */
export const ACADEMY_EXAM_PASS_SCORE = 70 as const;

/** Sıralı ders anahtarları mührü — SKU müfredatının içerik özeti (SHA-256). */
export const ACADEMY_CURRICULUM_SEAL_VERSION = "yetkin-rail.academy.curriculum.v1" as const;

/** SHA256 payload sürümü — vatandaş yüzünde de aynı sicil. D2.2: curriculumSeal eklendi. */
export const ACADEMY_CERTIFICATE_PAYLOAD_VERSION = "yetkin-rail.academy.certificate.v2" as const;

/** Hash'e giren alanlar — kimlik değeri gösterilmez, kapsama dürüst söylenir. */
export const ACADEMY_CERTIFICATE_HASHED_FIELDS = [
  "vatandaş kimliği",
  "kurs kimliği",
  "sınav denemesi",
  "puan",
  "basım anı",
  "müfredat mühürü",
] as const;

export function parseAcademyCertificateHash(raw: string): string | null {
  return parseSha256Hex(raw);
}

export function parseAcademyExamQuestions(raw: string): AcademyExamQuestion[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Müfredat sınavı soru taşımaz.");
  }
  return parsed.map((item, index) => {
    if (
      !item ||
      typeof item !== "object" ||
      typeof (item as { id?: unknown }).id !== "string" ||
      typeof (item as { prompt?: unknown }).prompt !== "string" ||
      !Array.isArray((item as { choices?: unknown }).choices) ||
      typeof (item as { correctIndex?: unknown }).correctIndex !== "number"
    ) {
      throw new Error(`Sınav sorusu geçersiz: ${index}`);
    }
    const question = item as AcademyExamQuestion;
    if (question.choices.length < 2) {
      throw new Error("Sınav sorusu en az iki şık ister.");
    }
    if (
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex >= question.choices.length
    ) {
      throw new Error("Sınav doğru şık indeksi geçersiz.");
    }
    return {
      id: question.id,
      prompt: question.prompt,
      choices: question.choices.map((choice) => String(choice)),
      correctIndex: question.correctIndex,
    };
  });
}

export function serializeAcademyExamQuestions(questions: AcademyExamQuestion[]): string {
  return JSON.stringify(questions);
}

export function toPublicAcademyExamQuestions(
  questions: AcademyExamQuestion[],
): AcademyExamPublicQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    choices: question.choices,
  }));
}

export function parseAcademyExamAnswers(raw: string): AcademyExamAnswer[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Sınav cevapları geçersiz.");
  }
  return parsed.map((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      typeof (item as { questionId?: unknown }).questionId !== "string" ||
      typeof (item as { choiceIndex?: unknown }).choiceIndex !== "number"
    ) {
      throw new Error("Sınav cevabı geçersiz.");
    }
    return {
      questionId: (item as AcademyExamAnswer).questionId,
      choiceIndex: (item as AcademyExamAnswer).choiceIndex,
    };
  });
}

export function serializeAcademyExamAnswers(answers: AcademyExamAnswer[]): string {
  return JSON.stringify(answers);
}

/**
 * Tam sayı yüzde: floor((doğru * 100) / toplam). Float yok.
 */
export function gradeAcademyExam(
  questions: AcademyExamQuestion[],
  answers: AcademyExamAnswer[],
): { score: number; correctCount: number; total: number } {
  const byId = new Map(answers.map((answer) => [answer.questionId, answer.choiceIndex]));
  let correctCount = 0;
  for (const question of questions) {
    if (byId.get(question.id) === question.correctIndex) {
      correctCount += 1;
    }
  }
  const total = questions.length;
  const score = Math.trunc((correctCount * 100) / total);
  return { score, correctCount, total };
}

export function computeAcademyCurriculumSeal(orderedLessonKeys: readonly string[]): string {
  if (orderedLessonKeys.length === 0) {
    throw new Error("Müfredat mühürü boş ders listesinden basılmaz.");
  }
  return sha256Hex([ACADEMY_CURRICULUM_SEAL_VERSION, ...orderedLessonKeys].join("\n"));
}

export function academyCertificateHashPayload(input: {
  userId: string;
  courseId: string;
  attemptId: string;
  score: number;
  issuedAt: Date;
  curriculumSeal: string;
}): string {
  return [
    ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
    input.userId,
    input.courseId,
    input.attemptId,
    String(input.score),
    input.issuedAt.toISOString(),
    input.curriculumSeal,
  ].join("\n");
}

export function computeAcademyCertificateHash(input: {
  userId: string;
  courseId: string;
  attemptId: string;
  score: number;
  issuedAt: Date;
  curriculumSeal: string;
}): string {
  return sha256Hex(academyCertificateHashPayload(input));
}

export function verifyAcademyCertificateHash(input: {
  userId: string;
  courseId: string;
  attemptId: string;
  score: number;
  issuedAt: Date;
  curriculumSeal: string;
  certificateHash: string;
}): boolean {
  return computeAcademyCertificateHash(input) === input.certificateHash;
}
