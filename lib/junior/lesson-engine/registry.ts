import {
  JUNIOR_LIVE_TUTOR_QUICK_CHIPS,
  JUNIOR_LIVE_TUTOR_TEACHER,
  JUNIOR_LIVE_TUTOR_WELCOME,
} from "@/lib/junior/live-tutor-policy";
import { getPilotTimelineForLesson } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import {
  JR_06_MAT_1_BLUEPRINT,
  JR_06_MAT_2_BLUEPRINT,
  JR_06_MAT_3_BLUEPRINT,
  JR_06_MAT_4_BLUEPRINT,
  JR_06_MAT_5_BLUEPRINT,
  MAT_5_SIMULATION_TABS,
} from "./modules/mat-1-to-5";
import type { JuniorLessonBlueprint, JuniorTactileActivityRules } from "./types";

const BLUEPRINT_REGISTRY = new Map<string, JuniorLessonBlueprint>([
  [JR_06_MAT_1_BLUEPRINT.lessonKey, JR_06_MAT_1_BLUEPRINT],
  [JR_06_MAT_2_BLUEPRINT.lessonKey, JR_06_MAT_2_BLUEPRINT],
  [JR_06_MAT_3_BLUEPRINT.lessonKey, JR_06_MAT_3_BLUEPRINT],
  [JR_06_MAT_4_BLUEPRINT.lessonKey, JR_06_MAT_4_BLUEPRINT],
  [JR_06_MAT_5_BLUEPRINT.lessonKey, JR_06_MAT_5_BLUEPRINT],
]);

function defaultSubjectFromKey(lessonKey: string): JuniorLessonBlueprint["subject"] {
  if (lessonKey.startsWith("jr_06_fen")) return "Fen Bilimleri";
  if (lessonKey.startsWith("jr_06_turkce")) return "Türkçe";
  if (lessonKey.startsWith("jr_06_ing")) return "İngilizce";
  if (lessonKey.startsWith("jr_06_sosyal")) return "Sosyal Bilgiler";
  return "Matematik";
}

function buildFallbackBlueprint(lessonKey: string): JuniorLessonBlueprint {
  const subject = defaultSubjectFromKey(lessonKey);
  return {
    lessonKey,
    title: lessonKey,
    grade: 6,
    subject,
    content: {
      lessonKey,
      title: lessonKey,
      mebCode: "MEB.6",
      heroQuestion: "Bu konunun temel kuralını günlük yaşamda nasıl kullanırız?",
      heroFocus: "Kavram, örnek ve altın ipucu adımlarıyla konuyu keşfetme.",
      conceptSummary: "Adım adım görsel sahne ve interaktif etkinliklerle konuyu pekiştirir.",
      outcomes: [],
    },
    badge: {
      icon: "🏅",
      chipLabel: "🏅 Süper Kaşif",
      modalTitle: "Süper Kaşif Rozeti",
      modalSubtitle: "Tüm etkinlikleri ve bulmacaları hatasız tamamladın!",
      thirdStepLabel: "3. Sıraya Diz",
    },
    tutor: {
      teacherName: JUNIOR_LIVE_TUTOR_TEACHER,
      welcomeMessage: JUNIOR_LIVE_TUTOR_WELCOME,
      quickChips: JUNIOR_LIVE_TUTOR_QUICK_CHIPS,
    },
    simulations: lessonKey.startsWith("jr_06_mat") ? MAT_5_SIMULATION_TABS : [],
    resolveTimeline: () => getPilotTimelineForLesson(lessonKey),
  };
}

/**
 * Yeni bir 6. sınıf ders şablonunu çalışma zamanında kayıt defterine ekler veya günceller.
 */
export function registerJuniorLessonBlueprint(blueprint: JuniorLessonBlueprint): void {
  BLUEPRINT_REGISTRY.set(blueprint.lessonKey, blueprint);
}

/** Kayıtlı şablon. Fallback üretmez; katalog dışı anahtarlarda `null`. */
export function peekJuniorLessonBlueprint(lessonKey: string): JuniorLessonBlueprint | null {
  return BLUEPRINT_REGISTRY.get(lessonKey) ?? null;
}

/** Kayıt defterinde gerçek şablon var. Fallback «Süper Kaşif» kabuğa girmez. */
export function hasJuniorLessonBlueprint(lessonKey: string): boolean {
  return BLUEPRINT_REGISTRY.has(lessonKey);
}

/**
 * Dokunsal etkinlik kuralları. Kayıtlı ders kendi haritasını kullanır;
 * eksik parça `jr_06_mat-5` altın standart kurallarına düşer.
 */
export function resolveJuniorTactileRules(lessonKey: string): JuniorTactileActivityRules {
  const registered = BLUEPRINT_REGISTRY.get(lessonKey)?.tactileRules;
  const gold = JR_06_MAT_5_BLUEPRINT.tactileRules;
  return {
    matchTargets: registered?.matchTargets ?? gold?.matchTargets ?? {},
    gapAnswers: registered?.gapAnswers ?? gold?.gapAnswers ?? {},
    rocketRules: registered?.rocketRules ?? gold?.rocketRules ?? {},
    explanations: registered?.explanations,
  };
}

/**
 * Verilen `lessonKey` için `JuniorLessonBlueprint` döner.
 * Kayıtlı özel şablon yoksa standart `Süper Kaşif` şablonuna düşer.
 */
export function getJuniorLessonBlueprint(lessonKey: string): JuniorLessonBlueprint {
  return BLUEPRINT_REGISTRY.get(lessonKey) ?? buildFallbackBlueprint(lessonKey);
}

/**
 * Kayıtlı 6. sınıf matematik seri üretim şablonlarını (`jr_06_mat-1..5`) listeler.
 */
export function listJuniorMatLessonBlueprints(): readonly JuniorLessonBlueprint[] {
  return [
    JR_06_MAT_1_BLUEPRINT,
    JR_06_MAT_2_BLUEPRINT,
    JR_06_MAT_3_BLUEPRINT,
    JR_06_MAT_4_BLUEPRINT,
    JR_06_MAT_5_BLUEPRINT,
  ];
}

/**
 * Dersin pilot/grafik timeline nesnesini önce resmi pilot yükleyiciden,
 * yoksa `JuniorLessonBlueprint.resolveTimeline` kancasından çözümler.
 */
export function resolveJuniorEngineTimeline(lessonKey: string): TimelineJSON | null {
  const official = getPilotTimelineForLesson(lessonKey);
  if (official) {
    return official;
  }
  const blueprint = BLUEPRINT_REGISTRY.get(lessonKey);
  return blueprint?.resolveTimeline?.() ?? null;
}
