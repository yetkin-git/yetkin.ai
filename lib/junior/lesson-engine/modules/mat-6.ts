import { tactileRulesForLesson } from "@/lib/junior/activity-source";
import { JUNIOR_LIVE_TUTOR_TEACHER, JUNIOR_LIVE_TUTOR_WELCOME } from "@/lib/junior/live-tutor-policy";
import {
  MAT_6_CANONICAL_TITLE,
  MAT_6_HERO_FOCUS,
  MAT_6_HERO_QUESTION,
} from "@/lib/junior/pilot-engine/mat-6.choreography";
import { getPilotTimelineForLesson } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import type { JuniorLessonBlueprint } from "@/lib/junior/lesson-engine/types";

const MAT_6_TACTILE = tactileRulesForLesson("jr_06_mat-2");

/**
 * `jr_06_mat-2` çipleri filmin üç işini söyler.
 * Bölünebilme roketleri ve «Rakamları toplamı» çipi bu derse girmez.
 */
export const JR_06_MAT_2_BLUEPRINT: JuniorLessonBlueprint = {
  lessonKey: "jr_06_mat-2",
  title: MAT_6_CANONICAL_TITLE,
  grade: 6,
  subject: "Matematik",
  content: {
    lessonKey: "jr_06_mat-2",
    title: MAT_6_CANONICAL_TITLE,
    mebCode: "MAT.6.1.3",
    heroQuestion: MAT_6_HERO_QUESTION,
    heroFocus: MAT_6_HERO_FOCUS,
    conceptSummary:
      "Asal sayı 1'den büyüktür ve yalnız 1 ile kendisine bölünür. 1 asal değildir. 2 tek çift asaldır. 9, 3 çarpı 3 olduğu için asal değildir. 12'nin çarpan ağacı 2 çarpı 2 çarpı 3'tür.",
    outcomes: [
      "Asal sayı 1'den büyüktür ve yalnız 1 ile kendisine bölünür.",
      "1 asal değildir. 2 tek çift asal sayıdır. 9 asal değildir.",
      "12, 2 çarpı 2 çarpı 3 olarak çarpan ağacına ayrılır.",
    ],
  },
  badge: {
    icon: "🌳",
    chipLabel: "🏅 Asal Çarpan Dedektifi",
    modalTitle: "Asal Çarpan Dedektifi Rozeti",
    modalSubtitle: "Tanımı, 1-2-9 özel durumlarını ve 12'nin ağacını doğru kurdun.",
    thirdStepLabel: "3. Asal Ağaç",
  },
  tutor: {
    teacherName: JUNIOR_LIVE_TUTOR_TEACHER,
    welcomeMessage: JUNIOR_LIVE_TUTOR_WELCOME,
    quickChips: [
      { id: "define", emoji: "🔢", label: "Asal sayıyı bir örnekle açıklar mısın?" },
      { id: "one", emoji: "🚫", label: "1 neden asal değildir?" },
      { id: "tree", emoji: "🌳", label: "12'nin çarpan ağacını birlikte kuralım." },
    ],
  },
  simulations: [],
  tactileRules: MAT_6_TACTILE ?? {
    matchTargets: {},
    gapAnswers: {},
    rocketRules: {},
  },
  resolveTimeline: () => getPilotTimelineForLesson("jr_06_mat-2"),
};

/** @deprecated Yanlış numara. `JR_06_MAT_2_BLUEPRINT` kullan. */
export const JR_06_MAT_6_BLUEPRINT = JR_06_MAT_2_BLUEPRINT;
