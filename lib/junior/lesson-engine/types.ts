import type { JuniorHintKind } from "@/lib/junior/content-rules";
import type { JuniorLiveTutorQuickChip } from "@/lib/junior/live-tutor-policy";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * Konuya özel interaktif simülasyon kimlikleri.
 * `jr_06_mat-1` pilotu: marble, balance. chicken ve egg bu derste açılmaz.
 * `jr_06_mat-1..4` katalog dışıdır; kamu adresi 404 döner. Şablon kodu durur.
 */
export type JuniorSimulationModeId =
  | "marble"
  | "balance"
  | "chicken"
  | "egg"
  | "exponent-tower"
  | "ops-priority"
  | "distribute-area"
  | "problem-steps";

export type JuniorSimulationTabSpec = {
  id: JuniorSimulationModeId;
  label: string;
  activeClass: string;
  summary?: string;
};

export type JuniorLessonBadgeSpec = {
  /** Madalyon emojisi (örn. 🕵️‍♂️, 🚀, ⚙️, 📐, 🧭, 🏅). */
  icon: string;
  /** QuickTools sağ ray rozet etiketi (örn. "🏅 Bölünebilme Dedektifi"). */
  chipLabel: string;
  /** Kutlama popup ana başlığı. */
  modalTitle: string;
  /** Kutlama popup alt açıklaması. */
  modalSubtitle: string;
  /** 3. etkinlik rozet etiketi (örn. "3. Dedektif Bulmacası" veya "3. Sıraya Diz"). */
  thirdStepLabel: string;
};

export type JuniorTactileExplanations = {
  match?: string;
  cloze?: string;
  puzzle?: string;
};

export type JuniorTactileActivityRules = {
  /** Eşleştirme sol → sağ hedef haritası. */
  matchTargets?: Readonly<Record<string, string>>;
  /** Boşluk doldurma gapId → kabul edilen cevaplar. */
  gapAnswers?: Readonly<Record<string, readonly string[]>>;
  /** Dedektif / kategori bulmacası tileId → kabul edilen roket/hedef kimlikleri. */
  rocketRules?: Readonly<Record<string, readonly string[]>>;
  /** Misafir önizlemede kart açıklaması. Sunucu notu `activity-source` içindedir. */
  explanations?: JuniorTactileExplanations;
};

/** Ders notu sekmesi. Mühürlü senaryosu olan ders bu alanı okumaz. */
export type JuniorLessonNotesSpec = {
  example: string;
  warning: string;
  recap: readonly string[];
  hint: JuniorHintKind;
  lifeUse: string;
};

export type JuniorLessonTutorSpec = {
  teacherName: string;
  welcomeMessage?: string;
  quickChips: readonly JuniorLiveTutorQuickChip[];
};

export type JuniorLessonContentSpec = {
  lessonKey: string;
  title: string;
  mebCode: string;
  heroQuestion: string;
  heroFocus: string;
  conceptSummary: string;
  outcomes: readonly string[];
};

/**
 * `JuniorLessonEngine` için ders şablonu (Boilerplate) tanımı.
 * Canlı şablon kayıt defterine girer. `jr_06_mat-1..4` karantinadadır; kamu adresi açılmaz.
 */
export type JuniorLessonBlueprint = {
  lessonKey: string;
  /** Sahte kazanım kodu taşıyan taslak. Kayıt defterine girmez. */
  quarantined?: boolean;
  title: string;
  grade: 6;
  subject: "Matematik" | "Fen Bilimleri" | "Türkçe" | "İngilizce" | "Sosyal Bilgiler";
  content: JuniorLessonContentSpec;
  badge: JuniorLessonBadgeSpec;
  tutor: JuniorLessonTutorSpec;
  simulations: readonly JuniorSimulationTabSpec[];
  tactileRules?: JuniorTactileActivityRules;
  /** Katalog senaryosu yokken ders notu sekmesinin kopyası. */
  notes?: JuniorLessonNotesSpec;
  /** Pilot/grafik timeline çözümleyicisi. */
  resolveTimeline?: () => TimelineJSON | null;
};
