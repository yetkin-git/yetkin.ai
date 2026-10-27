import {
  JUNIOR_LIVE_TUTOR_QUICK_CHIPS,
  JUNIOR_LIVE_TUTOR_TEACHER,
  JUNIOR_LIVE_TUTOR_WELCOME,
} from "@/lib/junior/live-tutor-policy";
import {
  MAT_5_CANONICAL_TITLE,
  MAT_5_HERO_FOCUS,
  MAT_5_HERO_QUESTION,
} from "@/lib/junior/pilot-engine/mat-1.choreography";
import { getPilotTimelineForLesson } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import { tactileRulesForLesson } from "@/lib/junior/activity-source";
import type { JuniorLessonBlueprint, JuniorSimulationTabSpec } from "../types";

/** `jr_06_mat-1` pilotu: bilye ve terazi. Tavuk ve yumurta bu derste açılmaz. */
export const MAT_5_SIMULATION_TABS: readonly JuniorSimulationTabSpec[] = [
  {
    id: "marble",
    label: "🔮 Bilye Dağıtımı",
    activeClass: "border-cyan-500 bg-cyan-50 text-cyan-950",
    summary: "12 bilyeyi kutulara eşit paylaştırarak çarpan ve kalan ilişkisini keşfet.",
  },
  {
    id: "balance",
    label: "⚖️ Bölünebilme Terazisi",
    activeClass: "border-violet-500 bg-violet-50 text-violet-950",
    summary: "Sayı ve bölen ağırlıklarını kefelere koy; kalansız bölünmede dengeyi yakala.",
  },
] as const;

/**
 * `jr_06_mat-1`: Çarpanlar, katlar ve MAT.6.1.2'nin yedi kuralı (2, 3, 4, 5, 6, 9, 10).
 */
const MAT_5_TACTILE = tactileRulesForLesson("jr_06_mat-1");

export const JR_06_MAT_1_BLUEPRINT: JuniorLessonBlueprint = {
  lessonKey: "jr_06_mat-1",
  title: MAT_5_CANONICAL_TITLE,
  grade: 6,
  subject: "Matematik",
  content: {
    lessonKey: "jr_06_mat-1",
    title: MAT_5_CANONICAL_TITLE,
    mebCode: "MAT.6.1.1 / MAT.6.1.2 (2, 3, 4, 5, 6, 9, 10)",
    heroQuestion: MAT_5_HERO_QUESTION,
    heroFocus: MAT_5_HERO_FOCUS,
    conceptSummary:
      "Çarpan sayıya eşit ya da küçük kalansız bölendir; kat sayıya eşit ya da büyük çarpımdır. Bu kapsülde 2, 3, 4, 5, 6, 9 ve 10 kuralları vardır. 4'te son iki basamak yeter çünkü 100, 4'e tam bölünür. 6, hem 2 hem 3 ister.",
    outcomes: [
      "Çarpan ≤ sayı, kat ≥ sayı. Sayının kendisi hem çarpandır hem kattır.",
      "Son Basamak Dedektifleri (2, 5, 10): Birler basamağına bak!",
      "Son İki Basamak Dedektifi (4): 100, 4'e tam bölündüğü için son iki basamak yeter.",
      "Rakam Toplamı Dedektifleri (3, 9): Rakamları topla, kata bak!",
      "Çifte Koşul Dedektifi (6): Hem 2'ye hem 3'e aynı anda bölünmeli.",
    ],
  },
  badge: {
    icon: "🕵️‍♂️",
    chipLabel: "🏅 Bölünebilme Dedektifi",
    modalTitle: "Bölünebilme Dedektifi Rozeti",
    modalSubtitle: "2, 4, 5, 10, 3, 9 ve 6 çifte koşul görevlerini kusursuz çözdün!",
    thirdStepLabel: "3. Dedektif Bulmacası",
  },
  tutor: {
    teacherName: JUNIOR_LIVE_TUTOR_TEACHER,
    welcomeMessage: JUNIOR_LIVE_TUTOR_WELCOME,
    quickChips: JUNIOR_LIVE_TUTOR_QUICK_CHIPS,
  },
  simulations: MAT_5_SIMULATION_TABS,
  tactileRules: MAT_5_TACTILE ?? {
    matchTargets: {},
    gapAnswers: {},
    rocketRules: {},
  },
  resolveTimeline: () => getPilotTimelineForLesson("jr_06_mat-1"),
};

/** @deprecated Yanlış numara. `JR_06_MAT_1_BLUEPRINT` kullan. */
export const JR_06_MAT_5_BLUEPRINT = JR_06_MAT_1_BLUEPRINT;
