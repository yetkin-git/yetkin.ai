import type { JuniorCourseSlug, MebCourseFile, MebOutcome } from "../schema/meb-outcome";
import type { SchoolWeek, TopicCalendar } from "../schema/topic";
import { activeLessonKeys, placeTopics, type StripTopic } from "./place";
import { buildSchoolWeeks } from "./school-weeks";

export type PlannedShell = {
  key: string;
  title: string;
  teaser: string;
  outcomeCodes: readonly string[];
};

export type CoursePlan = {
  file: MebCourseFile;
  topics: TopicCalendar[];
  shells: PlannedShell[];
};

const WEEKS = buildSchoolWeeks();
const TEACH_WEEKS = WEEKS.filter((week) => week.kind === "teach").length;
if (TEACH_WEEKS !== 34) {
  throw new Error(`Öğretim haftası ${TEACH_WEEKS}. Plan 34 haftaya göre kuruludur.`);
}

type OutcomeDraft = {
  themeCode: string;
  themeTitle: string;
  outcomeCode: string;
  outcomeTitle: string;
  hours: number;
  hoursBasis: MebOutcome["hoursBasis"];
  processOpen?: boolean;
};

function courseFile(
  course: JuniorCourseSlug,
  weeklyHours: number,
  programHours: number,
  hoursNote: string,
  drafts: readonly OutcomeDraft[],
): MebCourseFile {
  return {
    schoolYear: "2026-2027",
    grade: 6,
    course,
    weeklyHours,
    programHours,
    hoursNote,
    outcomes: drafts.map((draft) => ({
      schoolYear: "2026-2027" as const,
      grade: 6 as const,
      course,
      themeCode: draft.themeCode,
      themeTitle: draft.themeTitle,
      outcomeCode: draft.outcomeCode,
      outcomeTitle: draft.outcomeTitle,
      hours: draft.hours,
      hoursBasis: draft.hoursBasis,
      processOpen: draft.processOpen ?? false,
    })),
  };
}

function shell(key: string, title: string, codes: readonly string[]): PlannedShell {
  return {
    key,
    title,
    teaser: `Bu kab ${codes.join(", ")} çıktısı için taslaktır. Anlatım, soru ve ses henüz yazılmadı.`,
    outcomeCodes: codes,
  };
}

function strip(
  lessonKey: string,
  hours: number,
  outcomeCodes: readonly string[],
  extra?: { shell?: boolean; title?: string },
): StripTopic {
  return {
    lessonKey,
    hours,
    outcomeCodes,
    band: "tymm",
    shell: extra?.shell,
    title: extra?.title,
  };
}

function parked(lessonKey: string, band: StripTopic["band"], outcomeCodes: readonly string[] = []): StripTopic {
  return { lessonKey, hours: 0, outcomeCodes, band };
}

/** Saat bütçesine girmez. Kart rozeti bu hafta aralığını okur. */
function anchored(
  lessonKey: string,
  outcomeCodes: readonly string[],
  startWeek: number,
  endWeek: number,
  hours = 0,
): StripTopic {
  return { lessonKey, hours, outcomeCodes, band: "tymm", startWeek, endWeek, pinned: true };
}

function sumHours(topics: readonly StripTopic[]): number {
  return topics.reduce((total, topic) => total + topic.hours, 0);
}

function buildCourse(
  file: MebCourseFile,
  ordered: readonly StripTopic[],
  shells: readonly PlannedShell[],
  expectedHours: number,
): CoursePlan {
  const hours = sumHours(ordered);
  if (hours !== expectedHours) {
    throw new Error(`${file.course} konu saati ${hours}, beklenen ${expectedHours}.`);
  }
  if (hours > file.programHours) {
    throw new Error(`${file.course} konu saati program tavanını aşıyor.`);
  }
  const topics = placeTopics(ordered, file.weeklyHours, WEEKS);
  return { file, topics, shells: [...shells] };
}

const MAT_THEMES = {
  numbers: ["MAT.6.1", "Sayılar ve nicelikler"],
  algebra: ["MAT.6.2", "Cebir"],
  geometry: ["MAT.6.3", "Geometri"],
  measure: ["MAT.6.4", "Ölçme"],
  data: ["MAT.6.5", "Veri"],
  chance: ["MAT.6.6", "Olasılık"],
} as const;

function matOutcome(
  theme: keyof typeof MAT_THEMES,
  code: string,
  title: string,
  hours: number,
  basis: MebOutcome["hoursBasis"],
  processOpen = false,
): OutcomeDraft {
  const [themeCode, themeTitle] = MAT_THEMES[theme];
  return { themeCode, themeTitle, outcomeCode: code, outcomeTitle: title, hours, hoursBasis: basis, processOpen };
}

const MAT_OUTCOMES: OutcomeDraft[] = [
  matOutcome("numbers", "MAT.6.1.1", "Çarpan ve kat", 5, "meb"),
  matOutcome("numbers", "MAT.6.1.2", "2, 3, 4, 5, 6, 9 ve 10 ile bölünebilme", 5, "meb"),
  matOutcome("numbers", "MAT.6.1.3", "Asal sayı ve asal çarpan", 2, "meb"),
  matOutcome("numbers", "MAT.6.1.4", "Ortak kat ve ortak bölen", 3, "meb"),
  matOutcome("numbers", "MAT.6.1.5", "Ondalık gösterimin basamak değeri", 5, "plan"),
  matOutcome("numbers", "MAT.6.1.6", "Kesir ile bölme, sonlu ve devirli ondalık", 5, "plan", true),
  matOutcome("numbers", "MAT.6.1.7", "Kesir, ondalık ve yüzde ile dört işlem", 8, "plan"),
  matOutcome("numbers", "MAT.6.1.8", "Standart uzunluk ölçü birimleri", 5, "plan", true),
  matOutcome("algebra", "MAT.6.2.1", "Bilinmeyen nicelik ve cebirsel ifade", 5, "plan"),
  matOutcome("algebra", "MAT.6.2.2", "Sayı ve şekil örüntüsü", 5, "plan", true),
  matOutcome("algebra", "MAT.6.2.3", "Cebirsel ifadede algoritma", 5, "plan", true),
  matOutcome("geometry", "MAT.6.3.1", "İki paralel doğru ve bir kesenin açıları", 5, "plan", true),
  matOutcome("geometry", "MAT.6.3.2", "İki kesenin oluşturduğu dörtgenler", 5, "plan", true),
  matOutcome("geometry", "MAT.6.3.3", "Köşegenleri birbirini ortalayan dörtgenler", 5, "plan", true),
  matOutcome("geometry", "MAT.6.3.4", "Üçgen ve dörtgenlerin açı problemleri", 5, "plan", true),
  matOutcome("measure", "MAT.6.4.1", "Uzunluk ve alan ölçü birimleri", 5, "plan"),
  matOutcome("measure", "MAT.6.4.2", "Paralelkenar ve üçgenin alan bağıntısı", 5, "plan"),
  matOutcome("measure", "MAT.6.4.3", "Alanla modellenen gerçek yaşam problemi", 10, "plan"),
  matOutcome("measure", "MAT.6.4.4", "Çember uzunluğu ile çap", 5, "plan", true),
  matOutcome("measure", "MAT.6.4.5", "Çember uzunluğu problemleri", 5, "plan", true),
  matOutcome("measure", "MAT.6.4.6", "Merkez açı ve gördüğü yay", 5, "plan", true),
  matOutcome("data", "MAT.6.5.1", "Kategorik veya kesikli veriyle araştırma", 8, "plan"),
  matOutcome("data", "MAT.6.5.2", "Başkasının istatistiksel yorumunu tartışma", 5, "plan", true),
  matOutcome("chance", "MAT.6.6.1", "Gözleme dayalı olasılık", 5, "plan", true),
];

const MAT_SHELLS: PlannedShell[] = [];

const MAT_ORDER: StripTopic[] = [
  strip("jr_06_mat-1", 10, ["MAT.6.1.1", "MAT.6.1.2"]),
  strip("jr_06_mat-2", 2, ["MAT.6.1.3"]),
  strip("jr_06_mat-3", 3, ["MAT.6.1.4"]),
  strip("jr_06_mat-4", 5, ["MAT.6.1.5"]),
  strip("jr_06_mat-5", 5, ["MAT.6.1.6"]),
  strip("jr_06_mat-7", 2, ["MAT.6.1.7"]),
  strip("jr_06_mat-8", 2, ["MAT.6.1.7"]),
  strip("jr_06_mat-9", 2, ["MAT.6.1.7"]),
  strip("jr_06_mat-10", 2, ["MAT.6.1.7"]),
  strip("jr_06_mat-6", 5, ["MAT.6.1.8"]),
  strip("jr_06_mat-11", 5, ["MAT.6.2.1"]),
  strip("jr_06_mat-12", 5, ["MAT.6.2.2"]),
  strip("jr_06_mat-13", 5, ["MAT.6.2.3"]),
  strip("jr_06_mat-14", 5, ["MAT.6.3.1"]),
  strip("jr_06_mat-15", 5, ["MAT.6.3.2"]),
  strip("jr_06_mat-16", 5, ["MAT.6.3.3"]),
  strip("jr_06_mat-17", 5, ["MAT.6.3.4"]),
  strip("jr_06_mat-18", 5, ["MAT.6.4.1", "MAT.6.4.3"]),
  strip("jr_06_mat-19", 5, ["MAT.6.4.2", "MAT.6.4.3"]),
  strip("jr_06_mat-20", 5, ["MAT.6.4.4"]),
  strip("jr_06_mat-21", 5, ["MAT.6.4.5"]),
  strip("jr_06_mat-22", 5, ["MAT.6.4.6"]),
  strip("jr_06_mat-23", 4, ["MAT.6.5.1"]),
  strip("jr_06_mat-24", 4, ["MAT.6.5.1"]),
  strip("jr_06_mat-25", 5, ["MAT.6.5.2"]),
  strip("jr_06_mat-26", 5, ["MAT.6.6.1"]),
];

function fenOutcome(
  themeCode: string,
  themeTitle: string,
  outcomeCode: string,
  outcomeTitle: string,
  hours: number,
  processOpen = false,
  basis: MebOutcome["hoursBasis"] = "unit-split",
): OutcomeDraft {
  return { themeCode, themeTitle, outcomeCode, outcomeTitle, hours, hoursBasis: basis, processOpen };
}

const FEN_OUTCOMES: OutcomeDraft[] = [
  fenOutcome("FB.6.1", "Güneş sistemi ve tutulmalar", "FB.6.1.1", "Gezegenler", 3),
  fenOutcome("FB.6.1", "Güneş sistemi ve tutulmalar", "FB.6.1.2", "Gezegen modeli", 3, true),
  fenOutcome("FB.6.1", "Güneş sistemi ve tutulmalar", "FB.6.1.3", "Güneş ve Ay tutulması", 3),
  fenOutcome("FB.6.1", "Güneş sistemi ve tutulmalar", "FB.6.1.4", "Tutulma modeli", 3, true),
  fenOutcome("FB.6.2", "Kuvvetin etkisinde hareket", "FB.6.2.1", "Bileşke kuvvet", 5),
  fenOutcome("FB.6.2", "Kuvvetin etkisinde hareket", "FB.6.2.2", "Alınan yol ve yer değiştirme", 5, true, "unverified"),
  fenOutcome("FB.6.2", "Kuvvetin etkisinde hareket", "FB.6.2.3", "Sabit sürat", 4),
  fenOutcome("FB.6.3", "Canlılarda sistemler", "FB.6.3.1", "Üreme", 3, true),
  fenOutcome("FB.6.3", "Canlılarda sistemler", "FB.6.3.2", "Büyüme", 3, true),
  fenOutcome("FB.6.3", "Canlılarda sistemler", "FB.6.3.3", "Çimlenme", 3, true),
  fenOutcome("FB.6.3", "Canlılarda sistemler", "FB.6.3.4", "İnsan üreme organları", 2, true),
  fenOutcome("FB.6.3", "Canlılarda sistemler", "FB.6.3.5", "Canlılarda üreme ve büyüme", 2, true),
  fenOutcome("FB.6.3", "Canlılarda sistemler", "FB.6.3.6", "Sinir sistemi", 2),
  fenOutcome("FB.6.3", "Canlılarda sistemler", "FB.6.3.7", "İç salgı", 3, true),
  fenOutcome("FB.6.3", "Canlılarda sistemler", "FB.6.3.8", "Ergenlik", 2, true),
  fenOutcome("FB.6.3", "Canlılarda sistemler", "FB.6.3.9", "Sistem sağlığı", 2),
  fenOutcome("FB.6.4", "Işığın yansıması ve renkler", "FB.6.4.1", "Yansıma", 4, true),
  fenOutcome("FB.6.4", "Işığın yansıması ve renkler", "FB.6.4.2", "Normal", 3, true),
  fenOutcome("FB.6.4", "Işığın yansıması ve renkler", "FB.6.4.3", "Ayna çeşitleri", 3, true),
  fenOutcome("FB.6.4", "Işığın yansıması ve renkler", "FB.6.4.4", "Soğurulma", 3, true),
  fenOutcome("FB.6.4", "Işığın yansıması ve renkler", "FB.6.4.5", "Beyaz ışık", 3, true),
  fenOutcome("FB.6.4", "Işığın yansıması ve renkler", "FB.6.4.6", "Renk", 3, true),
  fenOutcome("FB.6.4", "Işığın yansıması ve renkler", "FB.6.4.7", "Güneş enerjisi", 3, true),
  fenOutcome("FB.6.5", "Maddenin ayırt edici özellikleri", "FB.6.5.1", "Genleşme", 6, true),
  fenOutcome("FB.6.5", "Maddenin ayırt edici özellikleri", "FB.6.5.2", "Erime, donma ve kaynama", 6, true),
  fenOutcome("FB.6.5", "Maddenin ayırt edici özellikleri", "FB.6.5.3", "Yoğunluk", 5),
  fenOutcome("FB.6.5", "Maddenin ayırt edici özellikleri", "FB.6.5.4", "Tümdengelim", 5, true),
  fenOutcome("FB.6.5", "Maddenin ayırt edici özellikleri", "FB.6.5.5", "Buzun yoğunluğu", 5, true),
  fenOutcome("FB.6.5", "Maddenin ayırt edici özellikleri", "FB.6.5.6", "Madde modeli", 5, true),
  fenOutcome("FB.6.6", "Elektriğin iletimi ve direnç", "FB.6.6.1", "İletken ve yalıtkan", 6),
  fenOutcome("FB.6.6", "Elektriğin iletimi ve direnç", "FB.6.6.2", "Ampul parlaklığının değişkenleri", 6, true),
  fenOutcome("FB.6.6", "Elektriğin iletimi ve direnç", "FB.6.6.3", "Direnç", 6),
  fenOutcome("FB.6.7", "Sürdürülebilir yaşam ve etkileşim", "FB.6.7.1", "Biyoçeşitlilik", 5, true),
  fenOutcome("FB.6.7", "Sürdürülebilir yaşam ve etkileşim", "FB.6.7.2", "Biyoçeşitliliğe yönelik tehditler", 5, true),
  fenOutcome("FB.6.7", "Sürdürülebilir yaşam ve etkileşim", "FB.6.7.3", "Yakıt", 4, true),
  fenOutcome("FB.6.7", "Sürdürülebilir yaşam ve etkileşim", "FB.6.7.4", "Çevre problemi", 4, true),
];

/** 21–38 senaryoya döndü. Kab listesi boş. FB.6.2.2 `unverified` etiketi kazanım satırında durur. */
const FEN_SHELLS: PlannedShell[] = [];

const FEN_ORDER: StripTopic[] = [
  strip("jr_06_fen-1", 6, ["FB.6.1.1", "FB.6.1.2"]),
  strip("jr_06_fen-2", 6, ["FB.6.1.3", "FB.6.1.4"]),
  strip("jr_06_fen-9", 5, ["FB.6.2.1"]),
  strip("jr_06_fen-21", 5, ["FB.6.2.2"]),
  strip("jr_06_fen-10", 4, ["FB.6.2.3"]),
  strip("jr_06_fen-22", 3, ["FB.6.3.1"]),
  strip("jr_06_fen-23", 3, ["FB.6.3.2"]),
  strip("jr_06_fen-24", 3, ["FB.6.3.3"]),
  strip("jr_06_fen-25", 2, ["FB.6.3.4"]),
  strip("jr_06_fen-26", 2, ["FB.6.3.5"]),
  strip("jr_06_fen-16", 2, ["FB.6.3.6"]),
  strip("jr_06_fen-27", 3, ["FB.6.3.7"]),
  strip("jr_06_fen-28", 2, ["FB.6.3.8"]),
  strip("jr_06_fen-18", 2, ["FB.6.3.9"]),
  strip("jr_06_fen-29", 7, ["FB.6.4.1", "FB.6.4.2"]),
  strip("jr_06_fen-30", 3, ["FB.6.4.3"]),
  strip("jr_06_fen-31", 6, ["FB.6.4.4", "FB.6.4.5"]),
  strip("jr_06_fen-32", 6, ["FB.6.4.6", "FB.6.4.7"]),
  strip("jr_06_fen-33", 6, ["FB.6.5.1"]),
  strip("jr_06_fen-34", 6, ["FB.6.5.2"]),
  strip("jr_06_fen-12", 10, ["FB.6.5.3", "FB.6.5.6"]),
  strip("jr_06_fen-35", 10, ["FB.6.5.4", "FB.6.5.5"]),
  strip("jr_06_fen-19", 6, ["FB.6.6.1"]),
  strip("jr_06_fen-36", 6, ["FB.6.6.2"]),
  strip("jr_06_fen-20", 6, ["FB.6.6.3"]),
  strip("jr_06_fen-37", 10, ["FB.6.7.1", "FB.6.7.2"]),
  strip("jr_06_fen-38", 8, ["FB.6.7.3", "FB.6.7.4"]),
];

function sosyalOutcome(area: string, title: string, code: string, name: string, hours: number, processOpen = false): OutcomeDraft {
  return {
    themeCode: area,
    themeTitle: title,
    outcomeCode: code,
    outcomeTitle: name,
    hours,
    hoursBasis: "unit-split",
    processOpen,
  };
}

const SOSYAL_OUTCOMES: OutcomeDraft[] = [
  sosyalOutcome("SB.6.1", "Birlikte yaşamak", "SB.6.1.1", "Grup ve rolün zamanla değişmesi", 6),
  sosyalOutcome("SB.6.1", "Birlikte yaşamak", "SB.6.1.2", "Kültürel bağ ve millî değer", 5),
  sosyalOutcome("SB.6.1", "Birlikte yaşamak", "SB.6.1.3", "Toplumsal sorunu müzakere", 5, true),
  sosyalOutcome("SB.6.2", "Yeryüzünde yaşam", "SB.6.2.1", "Ülke, kıta ve okyanus konumu", 6),
  sosyalOutcome("SB.6.2", "Yeryüzünde yaşam", "SB.6.2.2", "Doğal ve beşerî çevre ilişkisi", 6),
  sosyalOutcome("SB.6.2", "Yeryüzünde yaşam", "SB.6.2.3", "Türk dünyasıyla kültürel iş birliği", 6, true),
  sosyalOutcome("SB.6.3", "Ortak miras", "SB.6.3.1", "Türkistan'daki ilk Türk devletlerinin katkısı", 6),
  sosyalOutcome("SB.6.3", "Ortak miras", "SB.6.3.2", "VII–XIII. yüzyıl İslam medeniyetinin ortak mirası", 6, true),
  sosyalOutcome("SB.6.3", "Ortak miras", "SB.6.3.3", "İslamiyet'in kabulüyle sosyal ve kültürel değişim", 5),
  sosyalOutcome("SB.6.3", "Ortak miras", "SB.6.3.4", "XI–XIII. yüzyıl, Anadolu'nun Türkleşmesi ve İslamlaşması", 5),
  sosyalOutcome("SB.6.4", "Yönetim ve vatandaşlık", "SB.6.4.1", "Yönetimin karar alma süreci", 6),
  sosyalOutcome("SB.6.4", "Yönetim ve vatandaşlık", "SB.6.4.2", "Temel hak ve sorumluluk", 6),
  sosyalOutcome("SB.6.4", "Yönetim ve vatandaşlık", "SB.6.4.3", "Dijitalleşmenin vatandaşlık haklarına etkisi", 6, true),
  sosyalOutcome("SB.6.5", "Ekonomi", "SB.6.5.1", "Kaynaklar ve ekonomik faaliyet", 6),
  sosyalOutcome("SB.6.5", "Ekonomi", "SB.6.5.2", "Ekonomik faaliyet ve meslek", 6),
  sosyalOutcome("SB.6.5", "Ekonomi", "SB.6.5.3", "Yatırım ve pazarlama proje önerisi", 6, true),
  sosyalOutcome("SB.6.6", "Teknoloji ve sosyal bilimler", "SB.6.6.1", "Ulaşım ve iletişimin kültürel etkileşimi", 6),
  sosyalOutcome("SB.6.6", "Teknoloji ve sosyal bilimler", "SB.6.6.2", "Telif ve patent", 5, true),
];

/** 21–26 senaryoya döndü. Kab listesi boş. processOpen kazanım satırında durur. */
const SOSYAL_SHELLS: PlannedShell[] = [];

const SOSYAL_ORDER: StripTopic[] = [
  strip("jr_06_sosyal-1", 11, ["SB.6.1.1", "SB.6.1.2"]),
  strip("jr_06_sosyal-21", 5, ["SB.6.1.3"]),
  strip("jr_06_sosyal-9", 6, ["SB.6.2.1"]),
  strip("jr_06_sosyal-10", 3, ["SB.6.2.2"]),
  strip("jr_06_sosyal-11", 3, ["SB.6.2.2"]),
  strip("jr_06_sosyal-22", 6, ["SB.6.2.3"]),
  strip("jr_06_sosyal-5", 6, ["SB.6.3.1"]),
  strip("jr_06_sosyal-23", 6, ["SB.6.3.2"]),
  strip("jr_06_sosyal-7", 10, ["SB.6.3.3", "SB.6.3.4"]),
  strip("jr_06_sosyal-16", 3, ["SB.6.4.1"]),
  strip("jr_06_sosyal-18", 3, ["SB.6.4.1"]),
  strip("jr_06_sosyal-4", 3, ["SB.6.4.2"]),
  strip("jr_06_sosyal-17", 3, ["SB.6.4.2"]),
  strip("jr_06_sosyal-24", 6, ["SB.6.4.3"]),
  strip("jr_06_sosyal-12", 6, ["SB.6.5.1"]),
  strip("jr_06_sosyal-15", 6, ["SB.6.5.2"]),
  strip("jr_06_sosyal-25", 6, ["SB.6.5.3"]),
  strip("jr_06_sosyal-8", 3, ["SB.6.6.1"]),
  strip("jr_06_sosyal-20", 3, ["SB.6.6.1"]),
  strip("jr_06_sosyal-26", 5, ["SB.6.6.2"]),
  parked("jr_06_sosyal-2", "tymm", ["SB.6.1.1"]),
  parked("jr_06_sosyal-3", "tymm", ["SB.6.1.1"]),
  parked("jr_06_sosyal-6", "tymm", ["SB.6.3.2"]),
  parked("jr_06_sosyal-13", "tymm", ["SB.6.5.1"]),
];

const TURKCE_THEME_ROWS = [
  ["T.6.1", "Dilimizin Zenginliği"],
  ["T.6.2", "Bağımsızlık Yolu"],
  ["T.6.3", "Farklı Dünyalar"],
  ["T.6.4", "İletişim ve Sosyal İlişkiler"],
  ["T.6.5", "Bilim ve Teknoloji"],
  ["T.6.6", "Lider Ruhlar"],
] as const;

const TURKCE_THEMES: OutcomeDraft[] = TURKCE_THEME_ROWS.map(([themeCode, themeTitle]) => ({
  themeCode,
  themeTitle,
  outcomeCode: themeCode,
  outcomeTitle: themeTitle,
  hours: TEACH_WEEKS,
  hoursBasis: "plan" as const,
  processOpen: true,
}));

/**
 * Beceri soneki saati 0 olan binicidir. Tema saatiyle toplanmaz.
 * .O okuma ve söz varlığı, .C cümle ve ek, .Y yazım ve noktalama.
 * Dinleme ve konuşma için sonek yoktur.
 */
const TURKCE_SKILL_ROWS = [
  ["T.6.1", "O", "Okuma ve söz varlığı"],
  ["T.6.2", "O", "Okuma ve söz varlığı"],
  ["T.6.3", "O", "Okuma ve söz varlığı"],
  ["T.6.4", "C", "Cümle ve ek"],
  ["T.6.5", "Y", "Yazım ve noktalama"],
  ["T.6.6", "Y", "Yazım ve noktalama"],
] as const;

const TURKCE_SKILLS: OutcomeDraft[] = TURKCE_SKILL_ROWS.map(([themeCode, suffix, outcomeTitle]) => {
  const theme = TURKCE_THEMES.find((row) => row.themeCode === themeCode);
  if (!theme) {
    throw new Error(`Türkçe beceri teması yok: ${themeCode}`);
  }
  return {
    themeCode,
    themeTitle: theme.themeTitle,
    outcomeCode: `${themeCode}.${suffix}`,
    outcomeTitle,
    hours: 0,
    hoursBasis: "plan" as const,
    processOpen: false,
  };
});

const TURKCE_SHELLS: PlannedShell[] = TURKCE_THEMES.map((theme, index) =>
  shell(`jr_06_turkce-${21 + index}`, theme.themeTitle, [theme.outcomeCode]),
);

/**
 * 20 uydu tema haftasına yapışır ve tema saatini taşır. Tema kabının saati 0'dır.
 * Söz varlığı Dilimizin Zenginliği'nde açılır. Paragraf ve metin türü Bağımsızlık Yolu'nda okunur.
 * Yorum ve anlatım Farklı Dünyalar'da durur. Cümle ilişkisi ile kök-ek İletişim'dedir.
 * Yazım Bilim ve Teknoloji'de, noktalama Lider Ruhlar'da uygulanır.
 * Beceri soneki uydunun çıktı listesine biner. Sandık saati 0 ve shell kalır.
 */
const TURKCE_SATELLITES: readonly { n: number; code: string; start: number; end: number; hours: number }[] = [
  { n: 1, code: "T.6.1", start: 1, end: 3, hours: 7 },
  { n: 2, code: "T.6.1", start: 1, end: 3, hours: 7 },
  { n: 3, code: "T.6.1", start: 4, end: 6, hours: 7 },
  { n: 4, code: "T.6.1", start: 4, end: 6, hours: 7 },
  { n: 13, code: "T.6.1", start: 4, end: 6, hours: 6 },
  { n: 8, code: "T.6.2", start: 7, end: 8, hours: 9 },
  { n: 9, code: "T.6.2", start: 8, end: 9, hours: 9 },
  { n: 10, code: "T.6.2", start: 11, end: 12, hours: 8 },
  { n: 12, code: "T.6.2", start: 12, end: 13, hours: 8 },
  { n: 5, code: "T.6.3", start: 13, end: 14, hours: 12 },
  { n: 7, code: "T.6.3", start: 15, end: 16, hours: 11 },
  { n: 11, code: "T.6.3", start: 17, end: 18, hours: 11 },
  { n: 6, code: "T.6.4", start: 22, end: 24, hours: 9 },
  { n: 14, code: "T.6.4", start: 23, end: 25, hours: 9 },
  { n: 15, code: "T.6.4", start: 24, end: 25, hours: 8 },
  { n: 16, code: "T.6.4", start: 25, end: 27, hours: 8 },
  { n: 17, code: "T.6.5", start: 28, end: 30, hours: 17 },
  { n: 18, code: "T.6.5", start: 31, end: 33, hours: 17 },
  { n: 19, code: "T.6.6", start: 34, end: 36, hours: 17 },
  { n: 20, code: "T.6.6", start: 37, end: 40, hours: 17 },
];

const TURKCE_TEACH = new Set(WEEKS.filter((week) => week.kind === "teach").map((week) => week.week));
if (TURKCE_SATELLITES.length !== 20 || new Set(TURKCE_SATELLITES.map((row) => row.n)).size !== 20) {
  throw new Error("Türkçe uydu listesi 1–20 arasını bir kez kapsamalı.");
}
for (const row of TURKCE_SATELLITES) {
  if (row.n < 1 || row.n > 20 || row.start > row.end || !TURKCE_TEACH.has(row.start) || !TURKCE_TEACH.has(row.end)) {
    throw new Error(`Türkçe uydu ${row.n} haftası öğretim haftası değil.`);
  }
}

const TURKCE_ORDER: StripTopic[] = [
  ...TURKCE_SHELLS.map((item) => strip(item.key, 0, item.outcomeCodes, { shell: true, title: item.title })),
  ...[...TURKCE_SATELLITES]
    .sort((left, right) => left.n - right.n)
    .map((row) => {
      const skill = TURKCE_SKILLS.find((item) => item.themeCode === row.code);
      if (!skill) {
        throw new Error(`Türkçe uydu ${row.n} beceri soneki yok.`);
      }
      return anchored(`jr_06_turkce-${row.n}`, [row.code, skill.outcomeCode], row.start, row.end, row.hours);
    }),
];

const ING_THEME_ROWS = [
  ["ENG.6.1", "Classroom Life"],
  ["ENG.6.2", "Family Life"],
  ["ENG.6.3", "Life in Nature and Global Problems"],
  ["ENG.6.4", "Life in the Neighbourhood and City"],
  ["ENG.6.5", "Life in the Universe and Future"],
  ["ENG.6.6", "Life in the World and Culture"],
  ["ENG.6.7", "Personal Life"],
] as const;

const ING_THEMES: OutcomeDraft[] = ING_THEME_ROWS.map(([themeCode, themeTitle], index) => ({
  themeCode,
  themeTitle,
  outcomeCode: themeCode,
  outcomeTitle: themeTitle,
  hours: index < 4 ? 15 : 14,
  hoursBasis: "plan" as const,
  processOpen: true,
}));

const ING_GRAMMAR: OutcomeDraft[] = ING_THEMES.map((theme) => ({
  themeCode: theme.themeCode,
  themeTitle: theme.themeTitle,
  outcomeCode: `${theme.themeCode}.G1`,
  outcomeTitle: `${theme.themeTitle} dil bilgisi`,
  hours: 0,
  hoursBasis: "plan" as const,
  processOpen: false,
}));

/**
 * On dört uydu tema haftasına yapışır ve o temanın saatini taşır.
 * Yedi temanın saati uydudadır. Kab (`-21`…`-27`) saat 0 ve hafta 0 ile temanın sandığıdır.
 * G1 satırı, saati olan taşıyıcının çıktı koduna bağlanır.
 * Sınıf kuralı Classroom Life'ta açılır. Aile Family Life'tadır.
 * Hava ve çevre Nature'dadır. Şehir ve yer edatı Neighbourhood'tadır.
 * Evren Universe'tedir. Kültür World and Culture'tadır.
 * Rutin, yiyecek ve duygu Personal Life'tadır.
 * Ara tatil ve sınav haftası rozet ucu değildir.
 */
const ING_SATELLITES: readonly { n: number; theme: string; start: number; end: number; hours: number }[] = [
  { n: 20, theme: "ENG.6.1", start: 1, end: 5, hours: 15 },
  { n: 2, theme: "ENG.6.2", start: 6, end: 8, hours: 8 },
  { n: 4, theme: "ENG.6.2", start: 9, end: 11, hours: 7 },
  { n: 7, theme: "ENG.6.3", start: 12, end: 14, hours: 8 },
  { n: 17, theme: "ENG.6.3", start: 15, end: 16, hours: 7 },
  { n: 5, theme: "ENG.6.4", start: 17, end: 18, hours: 8 },
  { n: 16, theme: "ENG.6.4", start: 22, end: 24, hours: 7 },
  { n: 6, theme: "ENG.6.5", start: 25, end: 28, hours: 7 },
  { n: 9, theme: "ENG.6.5", start: 29, end: 31, hours: 7 },
  { n: 10, theme: "ENG.6.6", start: 32, end: 33, hours: 7 },
  { n: 11, theme: "ENG.6.6", start: 34, end: 34, hours: 7 },
  { n: 1, theme: "ENG.6.7", start: 35, end: 36, hours: 5 },
  { n: 3, theme: "ENG.6.7", start: 37, end: 38, hours: 5 },
  { n: 8, theme: "ENG.6.7", start: 40, end: 40, hours: 4 },
];

const ING_SHELLS: PlannedShell[] = ING_THEMES.map((theme, index) => {
  const hasSatellite = ING_SATELLITES.some((row) => row.theme === theme.themeCode);
  const codes = hasSatellite ? [theme.outcomeCode] : [theme.outcomeCode, `${theme.themeCode}.G1`];
  return shell(`jr_06_ing_main-${21 + index}`, theme.themeTitle, codes);
});

const ING_TEACH = new Set(WEEKS.filter((week) => week.kind === "teach").map((week) => week.week));
const ING_THEME_CODES = new Set(ING_THEMES.map((theme) => theme.themeCode));
if (ING_SATELLITES.length !== 14 || new Set(ING_SATELLITES.map((row) => row.n)).size !== 14) {
  throw new Error("İngilizce uydu listesi on dört konuyu bir kez kapsamalı.");
}
for (const row of ING_SATELLITES) {
  if (
    !ING_THEME_CODES.has(row.theme) ||
    row.start > row.end ||
    !ING_TEACH.has(row.start) ||
    !ING_TEACH.has(row.end)
  ) {
    throw new Error(`İngilizce uydu ${row.n} haftası öğretim haftası değil.`);
  }
}

const ING_ORDER: StripTopic[] = [
  ...ING_SHELLS.map((item, index) => {
    const theme = ING_THEMES[index]!;
    const hasSatellite = ING_SATELLITES.some((row) => row.theme === theme.themeCode);
    return strip(item.key, hasSatellite ? 0 : theme.hours, item.outcomeCodes, { shell: true, title: item.title });
  }),
  ...[...ING_SATELLITES]
    .sort((left, right) => left.n - right.n)
    .map((row) =>
      anchored(`jr_06_ing_main-${row.n}`, [row.theme, `${row.theme}.G1`], row.start, row.end, row.hours),
    ),
];

export function buildJuniorContentPlan(): {
  weeks: SchoolWeek[];
  courses: Record<JuniorCourseSlug, CoursePlan>;
} {
  const courses = {
    jr_06_mat: buildCourse(
      courseFile(
        "jr_06_mat",
        5,
        190,
        "MAT.6.1.1–MAT.6.1.4 saatleri onaylı rapordaki yıllık plandandır. Diğer matematik saatleri planlama payıdır. Çerçeve tavanı 38 hafta × 5 saattir.",
        MAT_OUTCOMES,
      ),
      MAT_ORDER,
      MAT_SHELLS,
      116,
    ),
    jr_06_fen: buildCourse(
      courseFile(
        "jr_06_fen",
        4,
        144,
        "Ünite saatleri onaylı rapordaki 2026 fen tablosudur (12+14+22+22+32+18+18). Çıktı payı ünite içinde bölünmüştür. FB.6.2.2 fiil cümlesi doğrulanmamıştır. Program tavanı 144 saattir; 6 saati okul temelli planlamadır.",
        FEN_OUTCOMES,
      ),
      FEN_ORDER,
      FEN_SHELLS,
      138,
    ),
    jr_06_sosyal: buildCourse(
      courseFile(
        "jr_06_sosyal",
        3,
        108,
        "Alan saatleri onaylı rapordaki ikincil derlemedir (16+18+22+18+18+11) ve çerçeve PDF'sinden yeniden ölçülmemiştir.",
        SOSYAL_OUTCOMES,
      ),
      SOSYAL_ORDER,
      SOSYAL_SHELLS,
      103,
    ),
    jr_06_turkce: buildCourse(
      courseFile(
        "jr_06_turkce",
        6,
        6 * TEACH_WEEKS,
        "Tema saati çerçeve planından yeniden ölçülmedi. Altı tema, 6 saatlik haftalık payın öğretim haftalarına eşit bölünmüş planıdır. Saat yazılı uydu derslerdedir. Tema kabının saati 0'dır. .O, .C ve .Y soneklerinin kendi saati yoktur; saati olan uydunun koduna bağlanır. Kart rozeti tema haftasına bağlanır.",
        [...TURKCE_THEMES, ...TURKCE_SKILLS],
      ),
      TURKCE_ORDER,
      TURKCE_SHELLS,
      6 * TEACH_WEEKS,
    ),
    jr_06_ing_main: buildCourse(
      courseFile(
        "jr_06_ing_main",
        3,
        3 * TEACH_WEEKS,
        "Tema saati çerçeve planından yeniden ölçülmedi. Yedi tema, 3 saatlik haftalık payın öğretim haftalarına bölünmüş planıdır. Yedi temanın saati yazılı uydulardadır. Tema kabının saati 0'dır. G1 satırının kendi saati yoktur; saati olan taşıyıcının koduna bağlanır.",
        [...ING_THEMES, ...ING_GRAMMAR],
      ),
      ING_ORDER,
      ING_SHELLS,
      3 * TEACH_WEEKS,
    ),
  } satisfies Record<JuniorCourseSlug, CoursePlan>;

  const matWeek3 = activeLessonKeys(courses.jr_06_mat.topics, 3, "teach");
  if (matWeek3.join(",") !== "jr_06_mat-2,jr_06_mat-3") {
    throw new Error(`3. hafta matematik ${matWeek3.join(",")} oldu.`);
  }
  const fenWeek3 = activeLessonKeys(courses.jr_06_fen.topics, 3, "teach");
  if (fenWeek3.join(",") !== "jr_06_fen-2") {
    throw new Error(`3. hafta fen ${fenWeek3.join(",")} oldu.`);
  }
  return { weeks: WEEKS, courses };
}

export function plannedShellCount(): number {
  const plan = buildJuniorContentPlan();
  return Object.values(plan.courses).reduce((total, course) => total + course.shells.length, 0);
}
