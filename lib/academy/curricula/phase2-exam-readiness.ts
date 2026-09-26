/**
 * Faz 2 sınav arayüzü denetimi.
 * OFF-201 kurs havuzu 30–40 soru, mini sınav ders başı en az 3, baraj 70 (A4).
 * Öğretmen ve veli havuzu bu turda boş kalır.
 * OFF-101 havuzu ve `q_off_l*` mini sınavları bu dosyada değişmez.
 */

import { academyExamPoolForSlug } from "@/lib/academy/exam-pools";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { ACADEMY_EXAM_DRAW_COUNT, ACADEMY_EXAM_POOL_MAX, ACADEMY_EXAM_POOL_MIN } from "@/lib/academy/exam-duration";
import { loadAcademyLessonExam } from "@/lib/academy/lesson-exams";
import { OFF_201_EXAM_PASS_SCORE, OFF_201_EXAM_POOL_MAX, OFF_201_EXAM_POOL_MIN } from "@/lib/academy/curricula/office_ai/off-201";
import { PARENT_TEACHER_AI_EXAM_PASS_SCORE } from "@/lib/academy/curricula/parent_teacher_ai/planned";
import { curriculumLessonKeysForSlug, phase2DraftLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import type { AcademyExamQuestion } from "@/lib/academy/types";

export const PHASE2_EXAM_INTERFACE = {
  courseQuestionShape: "AcademyExamQuestion",
  coursePoolMin: ACADEMY_EXAM_POOL_MIN,
  coursePoolMax: ACADEMY_EXAM_POOL_MAX,
  courseDrawCount: ACADEMY_EXAM_DRAW_COUNT,
  lessonExamMinQuestions: 3,
  lessonExamPassScore: 70,
  off201PassScore: OFF_201_EXAM_PASS_SCORE,
  off201PoolMin: OFF_201_EXAM_POOL_MIN,
  off201PoolMax: OFF_201_EXAM_POOL_MAX,
  parentTeacherPassScore: PARENT_TEACHER_AI_EXAM_PASS_SCORE,
} as const;

const PHASE2_SLUGS = ["parent_teacher_ai"] as const;

export type Phase2ExamGap = {
  slug: string;
  coursePoolCount: number;
  lessonExamKeys: readonly string[];
  missingLessonExamKeys: readonly string[];
};

export function phase2ExamGaps(): readonly Phase2ExamGap[] {
  return PHASE2_SLUGS.map((slug) => {
    const keys = phase2DraftLessonKeysForSlug(slug);
    const lessonExamKeys = keys.filter((key) => loadAcademyLessonExam(key) != null);
    return {
      slug,
      coursePoolCount: academyExamPoolForSlug(slug).length,
      lessonExamKeys,
      missingLessonExamKeys: keys.filter((key) => !lessonExamKeys.includes(key)),
    };
  });
}

function questionReady(question: AcademyExamQuestion): boolean {
  return (
    question.id.trim().length > 0 &&
    question.prompt.trim().length > 0 &&
    question.choices.length === 4 &&
    Number.isInteger(question.correctIndex) &&
    question.correctIndex >= 0 &&
    question.correctIndex < question.choices.length
  );
}

/**
 * OFF-201 sınav katmanı gömülmeye hazırdır. Puan `ACADEMY_EXAM_PASS_SCORE` ile aynıdır.
 * Öğretmen ve veli sorusu bu turda yazılmaz.
 */
export function assertPhase2ExamInterfacesReadyForText(): void {
  if (PHASE2_EXAM_INTERFACE.coursePoolMin !== 30 || PHASE2_EXAM_INTERFACE.coursePoolMax !== 50) {
    throw new Error("Kurs sonu havuz bandı 30–50 değildir.");
  }
  if (PHASE2_EXAM_INTERFACE.off201PoolMin !== 30 || PHASE2_EXAM_INTERFACE.off201PoolMax !== 50) {
    throw new Error("OFF-201 havuz bandı ofis bandından sapmıştır.");
  }
  if (PHASE2_EXAM_INTERFACE.off201PassScore !== 70 || PHASE2_EXAM_INTERFACE.off201PassScore !== ACADEMY_EXAM_PASS_SCORE) {
    throw new Error("OFF-201 barajı A4 sınav barajından sapmıştır.");
  }
  if (PHASE2_EXAM_INTERFACE.parentTeacherPassScore !== null) {
    throw new Error("Öğretmen ve veli barajı bu turda kilitlenemez.");
  }
  if (PHASE2_EXAM_INTERFACE.lessonExamPassScore !== 70 || PHASE2_EXAM_INTERFACE.lessonExamMinQuestions !== 3) {
    throw new Error("Mini sınav arayüzü baraj 70 ve en az 3 soru ister.");
  }

  const officePool = academyExamPoolForSlug("01_office_ai");
  if (officePool.length < ACADEMY_EXAM_POOL_MIN || officePool.length > ACADEMY_EXAM_POOL_MAX) {
    throw new Error("OFF-101 sınav havuzu bandın dışına çıkmış.");
  }
  if (!officePool.every(questionReady)) {
    throw new Error("OFF-101 sınav sorusu dört şık şeklini bozmuş.");
  }
  for (const question of officePool) {
    if (question.id.startsWith("q_off_l")) {
      throw new Error(`OFF-101 havuzuna mini sınav sızmış: ${question.id}`);
    }
  }

  const off201Pool = academyExamPoolForSlug("01_office_ai_ileri");
  if (off201Pool.length < 30 || off201Pool.length > 40) {
    throw new Error(`OFF-201 kurs havuzu 30–40 aralığında olmalıdır (${off201Pool.length}).`);
  }
  if (off201Pool.length < OFF_201_EXAM_POOL_MIN || off201Pool.length > OFF_201_EXAM_POOL_MAX) {
    throw new Error("OFF-201 havuzu ofis bandının dışına çıkmış.");
  }
  if (!off201Pool.every(questionReady)) {
    throw new Error("OFF-201 sınav sorusu dört şık şeklini bozmuş.");
  }
  if (academyExamPoolForSlug("OFF-201").length !== off201Pool.length) {
    throw new Error("OFF-201 modül kodu havuzu slug havuzundan sapmış.");
  }
  const off201Ids = new Set<string>();
  for (const question of off201Pool) {
    if (off201Ids.has(question.id)) {
      throw new Error(`OFF-201 tekrarlayan soru: ${question.id}`);
    }
    off201Ids.add(question.id);
    if (question.id.startsWith("q_off_l") || question.id.startsWith("q_off201_l")) {
      throw new Error(`OFF-201 havuzuna mini sınav sızmış: ${question.id}`);
    }
  }

  const off201Keys = curriculumLessonKeysForSlug("01_office_ai_ileri");
  if (off201Keys.length !== 6) {
    throw new Error("OFF-201 ders anahtarı 6 değildir.");
  }
  for (const key of off201Keys) {
    const exam = loadAcademyLessonExam(key);
    if (!exam || exam.lessonKey !== key || exam.questions.length < PHASE2_EXAM_INTERFACE.lessonExamMinQuestions) {
      throw new Error(`OFF-201 mini sınav eksik: ${key}`);
    }
    if (exam.passScore !== ACADEMY_EXAM_PASS_SCORE) {
      throw new Error(`OFF-201 mini sınav A4 barajına bağlı değil: ${key}`);
    }
    for (const question of exam.questions) {
      if (!questionReady(question) || off201Ids.has(question.id)) {
        throw new Error(`OFF-201 mini sınav sorusu havuza karışmış veya şekli bozuk: ${question.id}`);
      }
    }
  }

  const parentGap = phase2ExamGaps().find((gap) => gap.slug === "parent_teacher_ai");
  if (!parentGap || parentGap.coursePoolCount !== 0 || parentGap.lessonExamKeys.length !== 0) {
    throw new Error("Öğretmen ve veli sınavı bu turda boş kalmalıdır.");
  }
  const parentKeys = phase2DraftLessonKeysForSlug("parent_teacher_ai");
  if (parentGap.missingLessonExamKeys.length !== parentKeys.length) {
    throw new Error("Öğretmen ve veli mini sınav boşluğu sapmış.");
  }
  for (const key of parentKeys) {
    if (loadAcademyLessonExam(key) != null) {
      throw new Error(`Öğretmen ve veli ders anahtarı mini sınav dosyasına bağlanmış: ${key}`);
    }
  }
}
