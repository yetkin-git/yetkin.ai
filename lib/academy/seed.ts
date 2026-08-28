import { academyExamPoolForSlug } from "@/lib/academy/exam-pools";
import {
  ACADEMY_CATALOG_SEEDS,
  academyCatalogSeedMatch,
  type AcademyCatalogSeed,
} from "@/lib/academy/catalog-seed";
import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";
import type { AcademyExamQuestion, AcademyExamRecord } from "@/lib/academy/types";
import {
  academyInteractiveTaskByKey,
  listAcademyInteractiveTaskKeys,
} from "@/lib/academy/proof-of-work";

export type {
  AcademyCatalogExamMeta,
  AcademyCatalogSeed,
} from "@/lib/academy/catalog-seed";
export {
  ACADEMY_CATALOG_SEEDS,
  ACADEMY_LEGACY_PURGE_CATALOG_UNITS,
  ACADEMY_LEGACY_PURGE_COURSE_IDS,
  ACADEMY_SEED_CATALOG_UNITS,
  ACADEMY_SEED_COURSE_IDS,
  ACADEMY_SEED_CURRENCY,
  ACADEMY_SEED_MODULE_KEY,
  academyCatalogSeedMatch,
  academyTrendScore,
} from "@/lib/academy/catalog-seed";

/**
 * Tam kurs tohumu — kart sicili + sınav şıkları.
 * Katalog BFF `catalog-seed` okur; bu dosya oyna/sınav/SQL yolundadır.
 */
export type AcademyCourseSeed = Omit<AcademyCatalogSeed, "exam"> & {
  exam: AcademyCatalogSeed["exam"] & { questions: AcademyExamQuestion[] };
};

const LESSON_KEY_PREFIX: Record<AcademyCourseTitleSlug, string> = {
  "python-temel": "python-temel-",
  "fullstack-temel": "fullstack-temel-",
  "ai-temel": "ai-temel-",
  "ux-temel": "ux-temel-",
};

const SEED_STAMP = new Date("2026-08-21T15:00:00.000Z");

function workProofExamQuestions(slug: AcademyCourseTitleSlug): AcademyExamQuestion[] {
  const prefix = LESSON_KEY_PREFIX[slug];
  const questions: AcademyExamQuestion[] = [];
  for (const lessonKey of listAcademyInteractiveTaskKeys()) {
    if (!lessonKey.startsWith(prefix)) {
      continue;
    }
    const task = academyInteractiveTaskByKey(lessonKey);
    if (!task) {
      continue;
    }
    if (task.kind === "amount-kurus") {
      questions.push({
        id: `q_pow_${lessonKey}`,
        prompt: `İş kanıtı (kuruş): ${task.brief} Sunucu hangi kaydı kabul eder?`,
        choices: [
          "Float lira ve yaklaşık tutar",
          `${task.expectedAmountMinor} kuruş ve TRY`,
          "Emanet hold satırı",
          "İkinci profil bakiyesi",
        ],
        correctIndex: 1,
      });
      continue;
    }
    if (task.kind === "prompt-pack") {
      questions.push({
        id: `q_pow_${lessonKey}`,
        prompt: `İş kanıtı (tarif paketi): ${task.brief} Fail-closed karar hangisi?`,
        choices: [
          "Orta değer uydurulur, üretim başlar",
          "Gerekli cümleler yazılır, yasak düşer, kilitler doğru token ister",
          "Beğeni tur tüketir",
          "Super Admin tarifi geçer",
        ],
        correctIndex: 1,
      });
      continue;
    }
    questions.push({
      id: `q_pow_${lessonKey}`,
      prompt: `İş kanıtı (parametre): ${task.brief} Kapı ne zaman açılır?`,
      choices: [
        "Yaklaşık etiket yeter",
        "Her kilit doğru token ile durunca",
        "Boş kilit yorum hakkı doğurur",
        "İstemci kendi kendine geçer",
      ],
      correctIndex: 1,
    });
  }
  return questions;
}

export function academyExamQuestionsForSlug(slug: AcademyCourseTitleSlug): AcademyExamQuestion[] {
  const proof = workProofExamQuestions(slug);
  const pool = academyExamPoolForSlug(slug);
  const seen = new Set(proof.map((row) => row.id));
  const rest = pool.filter((row) => !seen.has(row.id));
  return [...proof, ...rest].slice(0, 32);
}

function attachExamQuestions(row: AcademyCatalogSeed): AcademyCourseSeed {
  return {
    ...row,
    exam: {
      ...row.exam,
      questions: academyExamQuestionsForSlug(row.slug),
    },
  };
}

export const ACADEMY_COURSE_SEEDS: readonly AcademyCourseSeed[] =
  ACADEMY_CATALOG_SEEDS.map(attachExamQuestions);

export function academyCourseSeedBySlug(slug: string): AcademyCourseSeed | undefined {
  return ACADEMY_COURSE_SEEDS.find((row) => row.slug === slug);
}

export function academyExamRecordFromSeed(row: AcademyCourseSeed): AcademyExamRecord {
  return {
    id: row.exam.id,
    courseId: row.id,
    title: row.exam.title,
    passScore: row.exam.passScore,
    questions: row.exam.questions.map((question) => ({ ...question })),
    createdAt: SEED_STAMP,
    updatedAt: SEED_STAMP,
  };
}

/** Sınav/oyna BFF — katalog grafı bu fonksiyonu import etmez. */
export function resolveAcademyExamFromSeed(courseId: string): AcademyExamRecord | null {
  const catalog = academyCatalogSeedMatch(courseId);
  if (!catalog) {
    return null;
  }
  return academyExamRecordFromSeed(attachExamQuestions(catalog));
}
