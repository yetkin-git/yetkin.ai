export type JuniorProfileView = {
  id: string;
  nickname: string;
  grade: number;
  birthYear: number | null;
  selected: boolean;
  selectedElectives: string[];
  gradeSwitchRights: number;
};

export type JuniorPlanView = {
  status: "NONE" | "ACTIVE";
  electiveQuota: number;
  expiresAt: string | null;
  gradeSwitchRights: number;
};

/** Çizilmiş SVG sahne kimlikleri. Mühür, atanmamış kimliği geçirmez. */
export const JUNIOR_VECTOR_SCENES = [
  "fraction",
  "fraction-sum",
  "exponent",
  "ops-order",
  "distribute",
  "number-ops",
  "sets",
  "number-line",
  "decimal",
  "ratio",
  "algebra",
  "chart",
  "angles",
  "area",
  "circle",
  "prism",
  "force",
  "speed",
  "friction",
  "planets",
  "eclipse",
  "body",
  "blood",
  "particles",
  "sound",
  "circuit",
  "mirror",
  "meaning",
  "word-tree",
  "affix",
  "book",
  "main-idea",
  "support-idea",
  "place",
  "culture",
  "globe",
  "grid",
  "history",
  "caravan",
  "assembly",
  "clock",
  "tray",
  "skyline",
  "weather",
  "fair",
  "badge",
  "shelf",
  "holiday",
  "recycle",
  "ballot",
  "family",
  "universe",
  "world",
  "rules",
  "elective",
] as const;

export type JuniorVectorScene = (typeof JUNIOR_VECTOR_SCENES)[number];

/** Vektör oynatıcının on iki adımı. Seçmeli ders şablonu bu diziyi taşır. */
export type JuniorPlayerSteps = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export type JuniorLessonScript = {
  key: string;
  title: string;
  teaser: string;
  listenText: string;
  outcomes: readonly string[];
  scene: JuniorVectorScene;
  steps?: JuniorPlayerSteps;
  mebNote: string;
  lifeUse: string;
  /** Veliye kısa özet. Çocuk anlatımının kopyası değildir. Arşivi olan konuda durur. */
  parentNote?: string;
};

export type JuniorCourseTrack = "core" | "elective";

export const JUNIOR_PERSONAL_CURRICULUM_TAG = "Kişiye Özel Müfredat";
/** Seçmeli raf. Yıllık müfredat cümlesi bu etikette durmaz. */
export const JUNIOR_ELECTIVE_NOT_YEAR_TAG = "İki konu taslak · yıllık müfredat değil";
export const JUNIOR_ELECTIVE_TAG = "Seçmeli Ders";
export const JUNIOR_ELECTIVE_CATEGORY = "Seçmeli Dersler";

/** Vektör oynatıcı adım sayısı. Seçmeli ders şablonu bu kadar adım taşır. */
export const JUNIOR_VECTOR_STEP_COUNT = 12;

/** Maarif ders etiketleri. Kart ve raf aynı diziyi okur. */
export const JUNIOR_MAARIF_SKILL_TAGS = [
  "Sözlü Anlatım Odaklı",
  "Beceri Temelli Öğrenme",
  "AI Destekli Birebir Dönüt",
] as const;

export type JuniorLessonStatus = "done" | "going" | "fresh" | "preparing";

export type JuniorLessonCard = {
  key: string;
  title: string;
  teaser: string;
  access: "free" | "locked";
  thisWeek: boolean;
  status: JuniorLessonStatus;
  /** Ölçülmüş ses 180 sn altındadır. Yeşil tam ders rozeti basılmaz. */
  narrationShort?: boolean;
  /** MEB haftası ve çıktı adı. Takvim şeridinde olmayan konuda yoktur. */
  weekHeading?: string;
  /** 2018 kalıntısı. Raf rozeti MEB penceresinden almaz. */
  archiveLabel?: string;
  /** Ücretsiz ilk ders etiketi. Arşiv rafı başlığı üretmez. */
  starterLabel?: string;
  /** MEB tema kodu. Arşiv konusunda yoktur. */
  unitCode?: string;
  /** Katalogdaki ünite sırası. 1’den başlar. */
  unitIndex?: number;
  /** Vitrin ünite adı. İngilizce tema kodları Türkçe etikete çevrilir. */
  unitTitle?: string;
  /**
   * `plan` / `unit-split` saati ve kamu dizininde olmayan tema.
   * Resmi MEB saati bu alanda yazılmaz.
   */
  curriculumLabel?: string;
  /** Kilitli kaset 180 saniyenin altındaysa. Depo anahtarı bu yazının yerine geçmez. */
  shortTopicLabel?: string;
};

export type JuniorCourseShelf = {
  slug: string;
  title: string;
  subject: string;
  grade: number;
  track: JuniorCourseTrack;
  labels: readonly string[];
  lessons: JuniorLessonCard[];
  /** Saatli çıktılardan gövdesi yazılmış olanlar. Kablar bu sayıya girmez. */
  outcomeWritten?: number;
  outcomeTotal?: number;
};

export type JuniorXpView = {
  points: number;
  badges: string[];
};

export type JuniorPracticeChoice = {
  id: string;
  kind: "choice";
  /** Kavram, uygulama veya beceri. Eski kayıtlarda boş kalabilir. */
  level?: "concept" | "apply" | "skill";
  prompt: string;
  choices: string[];
};

export type JuniorPracticeMatch = {
  id: string;
  kind: "match";
  prompt: string;
  left: { id: string; label: string }[];
  right: { id: string; label: string }[];
};

export type JuniorPracticeItem = JuniorPracticeChoice | JuniorPracticeMatch;

export type JuniorPracticeAnswer = {
  id: string;
  choiceIndex?: number;
  matches?: Record<string, string>;
  cloze?: string;
  /** Çoklu boşluk doldurma yanıtları (boşluk kimliği -> öğrenci cevabı). */
  clozes?: Record<string, string>;
  /** Sıralama etkinliğinde karo kimliklerinin öğrenci sırası. */
  order?: string[];
  /** Dedektif bulmacasında sayı kartlarının yerleştirildiği roket kimlikleri. */
  placements?: Record<string, string>;
};

export type JuniorTellMode = "speak" | "write";

export type JuniorFeedback = {
  praised: string;
  missing: string;
  advice: string;
  score: number;
  xpAwarded: number;
  points: number;
  badges: string[];
};
