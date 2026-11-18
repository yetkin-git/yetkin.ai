import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { parseSha256Hex } from "@/lib/kernel/crypto/sha256";
import {
  computeYetkinCvHash,
  gradeYetkinCvExam,
  toYetkinCvCardView,
  toYetkinCvSwotInput,
  yetkinCvDigest,
  yetkinCvQuestions,
  yetkinCvQuestionsByIds,
  yetkinCvQuestionsForSkills,
  yetkinCvSignals,
  yetkinCvSkillBreakdown,
  yetkinCvSkillSeal,
  YETKINCV_SITTING_MS,
  type YetkinCvAnswer,
  type YetkinCvCardView,
  type YetkinCvPublicQuestion,
  type YetkinCvSwotInput,
  type YetkinCvRoleId,
  type YetkinCvSkillScore,
  type YetkinCvVerticalId,
  yetkinCvPublicQuestions,
} from "@/lib/career/yetkincv";

export type YetkinCvStartResult = {
  sittingId: string;
  expiresAt: string;
  questions: YetkinCvPublicQuestion[];
};

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((row): row is string => typeof row === "string" && row.trim().length > 0);
}

function readSkills(value: unknown): YetkinCvSkillScore[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const skills: YetkinCvSkillScore[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const item = row as {
      id?: unknown;
      label?: unknown;
      score?: unknown;
      correct?: unknown;
      total?: unknown;
    };
    if (typeof item.id !== "string" || typeof item.label !== "string") {
      continue;
    }
    if (
      typeof item.score !== "number" ||
      typeof item.correct !== "number" ||
      typeof item.total !== "number"
    ) {
      continue;
    }
    skills.push({
      id: item.id,
      label: item.label,
      score: item.score,
      correct: item.correct,
      total: item.total,
    });
  }
  return skills;
}

function cardFromRow(row: {
  score: number;
  roleKey: string;
  verticalKey: string;
  skillBreakdown: unknown;
  certificateHash: string;
  issuedAt: Date;
}): YetkinCvCardView | null {
  return toYetkinCvCardView({
    score: row.score,
    roleId: row.roleKey,
    verticalId: row.verticalKey,
    skills: readSkills(row.skillBreakdown),
    certificateHash: row.certificateHash,
    issuedAt: row.issuedAt,
  });
}

export async function startYetkinCvSitting(input: {
  userId: string;
  roleId: YetkinCvRoleId;
  verticalId: YetkinCvVerticalId;
  cvText: string;
  /** Verilirse oturum yalnız bu alt testlerin gerçek sorularını taşır. */
  skillIds?: readonly string[];
  now?: Date;
}): Promise<YetkinCvStartResult> {
  const bank = yetkinCvQuestions(input.verticalId);
  if (!bank) {
    throw new BadRequestError("Uzmanlık listeden seçilir.");
  }
  const questions = input.skillIds
    ? yetkinCvQuestionsForSkills(input.verticalId, input.skillIds)
    : bank;
  if (!questions || questions.length === 0) {
    throw new BadRequestError("Seçilen yetkinliğin vaka sorusu yok.");
  }
  const now = input.now ?? new Date();
  const prisma = getPrisma();
  const sitting = await prisma.yetkinCvSitting.create({
    data: {
      userId: input.userId,
      roleKey: input.roleId,
      verticalKey: input.verticalId,
      cvDigest: yetkinCvDigest(input.cvText),
      cvSignals: yetkinCvSignals(input.cvText),
      questionIds: questions.map((question) => question.id),
      expiresAt: new Date(now.getTime() + YETKINCV_SITTING_MS),
    },
    select: { id: true, expiresAt: true },
  });
  return {
    sittingId: sitting.id,
    expiresAt: sitting.expiresAt.toISOString(),
    questions: yetkinCvPublicQuestions(questions),
  };
}

export async function sealYetkinCvSitting(input: {
  userId: string;
  sittingId: string;
  answers: readonly YetkinCvAnswer[];
  /** Akademi sınav motoru. Aynı soru listesinde yerel formülle uyuşmazsa mühür basılmaz. */
  gradeWithEngine: (questions: readonly { id: string; prompt: string; choices: string[]; correctIndex: number }[]) => {
    score: number;
    correctCount: number;
  };
  now?: Date;
}): Promise<YetkinCvCardView> {
  const now = input.now ?? new Date();
  const prisma = getPrisma();
  const sitting = await prisma.yetkinCvSitting.findUnique({
    where: { id: input.sittingId },
    include: { seal: true },
  });
  if (!sitting || sitting.userId !== input.userId) {
    throw new BadRequestError("Sınav oturumu bulunamadı.");
  }
  if (sitting.seal) {
    const card = cardFromRow(sitting.seal);
    if (!card) {
      throw new BadRequestError("Mühür kaydı okunamadı.");
    }
    return card;
  }
  if (sitting.consumedAt) {
    throw new BadRequestError("Bu oturum kapanmış.");
  }
  if (sitting.expiresAt.getTime() < now.getTime()) {
    throw new BadRequestError("Sınav süresi doldu. Yeniden başlat.");
  }
  const ids = readStringList(sitting.questionIds);
  const questions = yetkinCvQuestionsByIds(sitting.verticalKey, ids);
  if (!questions) {
    throw new BadRequestError("Sınav soruları çözülemedi.");
  }
  const graded = gradeYetkinCvExam(questions, input.answers);
  const engine = input.gradeWithEngine(
    questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      choices: [...question.choices],
      correctIndex: question.correctIndex,
    })),
  );
  if (graded.score !== engine.score || graded.correctCount !== engine.correctCount) {
    throw new BadRequestError("Sınav motoru puanı uyuşmadı.");
  }
  const skills = yetkinCvSkillBreakdown(questions, input.answers);
  const skillCorrect = skills.reduce((sum, row) => sum + row.correct, 0);
  if (skillCorrect !== graded.correctCount) {
    throw new BadRequestError("Beceri kırılımı puanla uyuşmadı.");
  }
  const issuedAt = now;
  const certificateHash = computeYetkinCvHash({
    userId: sitting.userId,
    sittingId: sitting.id,
    roleId: sitting.roleKey,
    verticalId: sitting.verticalKey,
    score: graded.score,
    issuedAt,
    cvDigest: sitting.cvDigest.trim().toLowerCase(),
    skillSeal: yetkinCvSkillSeal(skills),
  });
  const seal = await prisma.yetkinCvSeal.create({
    data: {
      userId: sitting.userId,
      sittingId: sitting.id,
      roleKey: sitting.roleKey,
      verticalKey: sitting.verticalKey,
      score: graded.score,
      skillBreakdown: skills,
      cvDigest: sitting.cvDigest,
      cvSignals: sitting.cvSignals ?? [],
      certificateHash,
      issuedAt,
    },
  });
  await prisma.yetkinCvSitting.update({
    where: { id: sitting.id },
    data: { consumedAt: issuedAt },
  });
  const card = cardFromRow(seal);
  if (!card) {
    throw new BadRequestError("Mühür kaydı okunamadı.");
  }
  return card;
}

export async function loadLatestYetkinCvEvidence(userId: string): Promise<YetkinCvSwotInput | null> {
  const prisma = getPrisma();
  const row = await prisma.yetkinCvSeal.findFirst({
    where: { userId },
    orderBy: { issuedAt: "desc" },
  });
  if (!row) {
    return null;
  }
  return toYetkinCvSwotInput({
    score: row.score,
    roleId: row.roleKey,
    verticalId: row.verticalKey,
    skills: readSkills(row.skillBreakdown),
    certificateHash: row.certificateHash,
    cvSignals: readStringList(row.cvSignals),
  });
}

export async function loadLatestYetkinCvCard(userId: string): Promise<YetkinCvCardView | null> {
  const prisma = getPrisma();
  const row = await prisma.yetkinCvSeal.findFirst({
    where: { userId },
    orderBy: { issuedAt: "desc" },
  });
  if (!row) {
    return null;
  }
  return cardFromRow(row);
}

export type PublicYetkinCvSeal = YetkinCvCardView & {
  cvSignals: readonly string[];
};

export async function loadPublicYetkinCvByHash(rawHash: string): Promise<PublicYetkinCvSeal | null> {
  const hash = parseSha256Hex(rawHash);
  if (!hash) {
    return null;
  }
  const prisma = getPrisma();
  const row = await prisma.yetkinCvSeal.findUnique({
    where: { certificateHash: hash },
  });
  if (!row) {
    return null;
  }
  const card = cardFromRow(row);
  if (!card) {
    return null;
  }
  return { ...card, cvSignals: readStringList(row.cvSignals) };
}
