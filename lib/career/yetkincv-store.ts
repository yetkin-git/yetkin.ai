import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { parseSha256Hex } from "@/lib/kernel/crypto/sha256";
import { signCareerSealHmac, verifyCareerSealHmac } from "@/lib/career/seal-hmac";
import {
  computeYetkinCvHash,
  gradeYetkinCvExam,
  readYetkinCvChoiceOrder,
  toYetkinCvCardView,
  toYetkinCvSwotInput,
  yetkinCvBuildChoiceOrder,
  yetkinCvDigest,
  yetkinCvPickSessionQuestions,
  yetkinCvPublicQuestions,
  yetkinCvQuestions,
  yetkinCvQuestionsByIds,
  yetkinCvQuestionsForSkills,
  yetkinCvRemapAnswers,
  yetkinCvSignals,
  yetkinCvSkillBreakdown,
  yetkinCvSkillSeal,
  YETKINCV_ATTEMPT_WINDOW_MS,
  YETKINCV_MAX_ATTEMPTS,
  YETKINCV_SESSION_SIZE,
  YETKINCV_SITTING_MS,
  type YetkinCvAnswer,
  type YetkinCvCardView,
  type YetkinCvChoiceOrder,
  type YetkinCvPublicQuestion,
  type YetkinCvSwotInput,
  type YetkinCvRoleId,
  type YetkinCvSkillScore,
  type YetkinCvVerticalId,
} from "@/lib/career/yetkincv";

export type YetkinCvStartResult = {
  sittingId: string;
  expiresAt: string;
  questions: YetkinCvPublicQuestion[];
};

function isUniqueConflict(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002");
}

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
  const now = input.now ?? new Date();
  const prisma = getPrisma();

  // Serbest kariyer sınavında 30 gün / 3 deneme. Kurumsal `skillIds` yolu ayrıdır.
  //
  // Sayaç **yalnız serbest** oturumları sayar: kurumsal başvuru oturumları aynı
  // `verticalKey` altında yazıldığı için eskiden kullanıcının ücretsiz sınav hakkını
  // sessizce tüketiyordu (3 şirket başvurusu = ücretsiz sınav hakkı bitti). İlişkili
  // kurumsal başvurusu olan satırlar bu kovaya girmez.
  if (!input.skillIds) {
    const since = new Date(now.getTime() - YETKINCV_ATTEMPT_WINDOW_MS);
    const attempts = await prisma.yetkinCvSitting.count({
      where: {
        userId: input.userId,
        verticalKey: input.verticalId,
        createdAt: { gte: since },
        kurumsalApplication: { is: null },
      },
    });
    if (attempts >= YETKINCV_MAX_ATTEMPTS) {
      throw new BadRequestError(
        `Bu uzmanlıkta 30 gün içinde en fazla ${YETKINCV_MAX_ATTEMPTS} deneme yapılabilir.`,
      );
    }
  }

  const questions = input.skillIds
    ? yetkinCvQuestionsForSkills(input.verticalId, input.skillIds)
    : yetkinCvPickSessionQuestions(
        bank,
        YETKINCV_SESSION_SIZE,
        `${input.userId}:${input.verticalId}:${now.toISOString()}`,
      );
  if (!questions || questions.length === 0) {
    throw new BadRequestError("Seçilen yetkinliğin vaka sorusu yok.");
  }

  const sitting = await prisma.yetkinCvSitting.create({
    data: {
      userId: input.userId,
      roleKey: input.roleId,
      verticalKey: input.verticalId,
      cvDigest: yetkinCvDigest(input.cvText),
      cvSignals: yetkinCvSignals(input.cvText),
      questionIds: questions.map((question) => question.id),
      choiceOrder: {},
      expiresAt: new Date(now.getTime() + YETKINCV_SITTING_MS),
    },
    select: { id: true, expiresAt: true },
  });

  const choiceOrder: YetkinCvChoiceOrder = yetkinCvBuildChoiceOrder(questions, sitting.id);
  await prisma.yetkinCvSitting.update({
    where: { id: sitting.id },
    data: { choiceOrder },
  });

  return {
    sittingId: sitting.id,
    expiresAt: sitting.expiresAt.toISOString(),
    questions: yetkinCvPublicQuestions(questions, choiceOrder),
  };
}

export async function sealYetkinCvSitting(input: {
  userId: string;
  sittingId: string;
  answers: readonly YetkinCvAnswer[];
  /**
   * Akademi sınav motoru. Cevaplar şık sırasına göre orijinale eşlenmiş olmalıdır.
   * Yerel formülle uyuşmazsa mühür basılmaz.
   */
  gradeWithEngine: (
    questions: readonly { id: string; prompt: string; choices: string[]; correctIndex: number }[],
    answers: readonly YetkinCvAnswer[],
  ) => {
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
  const choiceOrder = readYetkinCvChoiceOrder(sitting.choiceOrder);
  const remapped = yetkinCvRemapAnswers(input.answers, choiceOrder);
  if (!remapped) {
    throw new BadRequestError("Şık eşlemesi geçersiz.");
  }
  const graded = gradeYetkinCvExam(questions, remapped);
  const engine = input.gradeWithEngine(
    questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      choices: [...question.choices],
      correctIndex: question.correctIndex,
    })),
    remapped,
  );
  if (graded.score !== engine.score || graded.correctCount !== engine.correctCount) {
    throw new BadRequestError("Sınav motoru puanı uyuşmadı.");
  }
  const skills = yetkinCvSkillBreakdown(questions, remapped);
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
  const hmacSignature = signCareerSealHmac({
    certificateHash,
    userId: sitting.userId,
    sittingId: sitting.id,
    roleKey: sitting.roleKey,
    verticalKey: sitting.verticalKey,
    score: graded.score,
    issuedAt,
  });

  try {
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
        hmacSignature,
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
  } catch (error) {
    // O5: paralel iki submit — P2002'de mevcut mührü idempotent döndür.
    if (!isUniqueConflict(error)) {
      throw error;
    }
    const existing = await prisma.yetkinCvSeal.findUnique({
      where: { sittingId: sitting.id },
    });
    if (!existing) {
      throw new BadRequestError("Mühür kaydı çakıştı. Yeniden dene.");
    }
    const card = cardFromRow(existing);
    if (!card) {
      throw new BadRequestError("Mühür kaydı okunamadı.");
    }
    return card;
  }
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
  /**
   * Faz 3 / §4.3 — kamuya açık yayın mührü açık mı?
   * `false` ise `/vize/[hash]` yalnız **özet** kart basar (puan + temel beceriler)
   * ve 290 TL'lik yayın CTA'sını gösterir. `true` ise tam doğrulanabilir kart,
   * paylaşım rozeti ve dizin görünürlüğü açılır.
   */
  published: boolean;
  /** HMAC imzası (varsa). Eski satırlarda null. */
  hmacSignature: string | null;
  sittingId: string;
  userId: string;
  roleKey: string;
  verticalKey: string;
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
  return {
    ...card,
    cvSignals: readStringList(row.cvSignals),
    published: row.sealedPublication,
    hmacSignature: row.hmacSignature,
    sittingId: row.sittingId,
    userId: row.userId,
    roleKey: row.roleKey,
    verticalKey: row.verticalKey,
  };
}

export type CareerSealVerifyResult = {
  /**
   * Sözleşme: `valid` **yalnız** kriptografik bütünlük sağlandığında true'dur.
   *
   * Önceki sürüm "satır varsa valid" diyordu; bu, HMAC'i uyuşmayan (veya hiç
   * imzalanmamış) bir kaydı üçüncü tarafa "geçerli mühür" diye sunuyordu. İşveren
   * `valid: true` görüp imzayı hiç kontrol etmeyebilir. Artık:
   * - `hmacValid: true`  → `valid: true`
   * - HMAC var ama uyuşmuyor → `valid: false` (bozulmuş/oynanmış kayıt)
   * - HMAC yok (Faz 2 öncesi satır) → `valid: false`, ayrı `signatureState: "legacy"`
   *   ile dürüstçe raporlanır. `hmacSignature` alanı çağırana ayrıca döner.
   */
  valid: boolean;
  issuedAt: string;
  roleKey: string;
  verticalKey: string;
  score: number;
  hmacValid: boolean;
  /** `signed` = imza var ve geçerli, `unsigned` = Faz 2 öncesi satır, `tampered` = imza uyuşmuyor. */
  signatureState: "signed" | "unsigned" | "tampered";
  signature: string | null;
  certificateHash: string;
};

export async function verifyYetkinCvSealByHash(rawHash: string): Promise<CareerSealVerifyResult | null> {
  const seal = await loadPublicYetkinCvByHash(rawHash);
  if (!seal) {
    return null;
  }
  const hmac = verifyCareerSealHmac(
    {
      certificateHash: seal.certificateHash,
      userId: seal.userId,
      sittingId: seal.sittingId,
      roleKey: seal.roleKey,
      verticalKey: seal.verticalKey,
      score: seal.score,
      issuedAt: seal.issuedAt,
    },
    seal.hmacSignature,
  );
  const signatureState: CareerSealVerifyResult["signatureState"] = hmac.valid
    ? "signed"
    : hmac.present
      ? "tampered"
      : "unsigned";
  return {
    // Uydurma "doğrulandı" yok: geçerlilik imzaya bağlıdır.
    valid: hmac.valid,
    issuedAt: seal.issuedAt,
    roleKey: seal.roleKey,
    verticalKey: seal.verticalKey,
    score: seal.score,
    hmacValid: hmac.valid,
    signatureState,
    signature: seal.hmacSignature,
    certificateHash: seal.certificateHash,
  };
}
