/**
 * Mühürlü Junior senaryosunun metin kalitesi, MEB derinlik ölçüsü ve yardımcı kaynak çizgisi.
 * Ders kitabı sayfası bu pakette yoktur. Kazanım evi `meb/2026-2027` dosyalarıdır.
 * Çizgi: kazanım korunur; anlatım Katman 2 fasikül omurgasına ve Katman 3 sınav ayarına çekilir.
 */

import { juniorSealedScenarioCount } from "./sealed-roster";

export const JUNIOR_WRITTEN_LESSON_COUNT = juniorSealedScenarioCount();

export type CourseId = "mat" | "fen" | "turkce" | "ing" | "sosyal";

export type StageMark = "tam" | "yüzeysel" | "yok";

export type Alignment =
  | "üç-aşama"
  | "seviye-altı"
  | "uydu"
  | "çıktı-dışı"
  | "anlatım-yok"
  | "takvimsiz";

export type FindingCode =
  | "uslu-lego-kule"
  | "uslu-ekleme"
  | "payda-topla"
  | "islem-sira"
  | "kume-tekrar"
  | "benzetme-kalinti";

export type TextFinding = {
  code: FindingCode;
  lessonKey: string;
  title: string;
  field: string;
  excerpt: string;
  message: string;
};

export type LessonField = {
  name: string;
  text: string;
};

export type SkillProbe = {
  question: string;
  correctOption: string;
  explanation: string;
  applyCorrectOption: string;
};

export type QuizStem = {
  level: "concept" | "apply" | "skill";
  question: string;
};

export type WrittenLesson = {
  key: string;
  title: string;
  course: CourseId;
  band: "tymm" | "legacy-2018" | null;
  hours: number;
  outcomeCodes: readonly string[];
  fields: readonly LessonField[];
  concept: string;
  example: string;
  warning: string;
  recap: string;
  life: string;
  skill: SkillProbe | null;
  quizQuestions: readonly QuizStem[];
};

export type ShellLesson = {
  key: string;
  title: string;
  course: CourseId;
  hours: number;
  outcomeCodes: readonly string[];
};

export type OutcomeRef = {
  course: CourseId;
  outcomeCode: string;
  outcomeTitle: string;
  hours: number;
  processOpen: boolean;
};

export type LessonDepth = {
  key: string;
  title: string;
  course: CourseId;
  bandLabel: string;
  hours: number;
  outcomeCodes: readonly string[];
  kavram: StageMark;
  uygulama: StageMark;
  beceri: StageMark;
  alignment: Alignment;
  gaps: readonly string[];
};

export type OutcomeDepth = {
  course: CourseId;
  outcomeCode: string;
  outcomeTitle: string;
  hours: number;
  processOpen: boolean;
  carriers: readonly string[];
  kavram: StageMark;
  uygulama: StageMark;
  beceri: StageMark;
  gaps: readonly string[];
};

export type PhraseHit = {
  label: string;
  count: number;
  lessonKeys: readonly string[];
};

export type DepthCeiling = "yok" | "katman-1" | "katman-2-kısmi" | "katman-2" | "katman-3";

export type LessonDepthBand = {
  key: string;
  title: string;
  course: CourseId;
  layer1: StageMark;
  layer2: StageMark;
  layer3: StageMark;
  ceiling: DepthCeiling;
  gaps: readonly string[];
};

export type ContentQualityModel = {
  runLabel: string;
  writtenCount: number;
  shellCount: number;
  findings: readonly TextFinding[];
  cliches: readonly PhraseHit[];
  openings: readonly PhraseHit[];
  duplicates: readonly PhraseHit[];
  lessons: readonly LessonDepth[];
  outcomes: readonly OutcomeDepth[];
  depths: readonly LessonDepthBand[];
};

const COURSE_TITLE: Record<CourseId, string> = {
  mat: "Matematik",
  fen: "Fen bilimleri",
  turkce: "Türkçe",
  ing: "İngilizce",
  sosyal: "Sosyal bilgiler",
};

const COURSE_ORDER: readonly CourseId[] = ["mat", "fen", "turkce", "ing", "sosyal"];

const CLICHE_PATTERNS: readonly { label: string; pattern: RegExp }[] = [
  { label: "Şurası aklında kalsın tamam mı", pattern: /şurası aklında kalsın tamam mı/u },
  { label: "Merhaba güzel arkadaşım", pattern: /merhaba güzel arkadaşım/u },
  { label: "Bugün seninle", pattern: /bugün seninle/u },
  {
    label: "Selamlar, çok keyifli bir konuyu keşfedeceğiz",
    pattern: /selamlar!?\s+bugün seninle çok keyifli bir konuyu keşfedeceğiz/u,
  },
  { label: "Harika bir matematik yolculuğu", pattern: /harika bir matematik yolculuğuna/u },
  { label: "Matematik dünyasına hoş geldin", pattern: /matematik dünyasına hoş geldin/u },
  { label: "Kavramsal Anlayış / İfade Gücü damgası", pattern: /kavramsal anlayış.{0,120}ifade gücü/u },
  { label: "sakin sakin", pattern: /sakin sakin/u },
  { label: "Aferin, süpersin, harikasın veya bravo", pattern: /\b(?:aferin|süpersin|harikasın|bravo)\b/u },
];

const ANALOGY_REMNANT = /\b(?:lego|playmobil|minecraft|roblox)\b/u;

const PROCESS_VERB =
  /deney|gözlem|model|ölç|tartış|müzakere|yorumla|araştır|hipotez|değişken|grafik|sıklık tablosu|çetele/u;

const CONTEXT_WORD =
  /arkadaş|tablo|grafik|metin|paragraf|market|okul|harita|cümle|veri|problem|karşılaştır|oturum|tur /u;

export function fold(value: string): string {
  return value.toLocaleLowerCase("tr-TR");
}

export function courseTitle(course: CourseId): string {
  return COURSE_TITLE[course];
}

function sentences(value: string): string[] {
  return value
    .split(/(?<=[.!?])\s+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function excerpt(value: string): string {
  const flat = value.replace(/\s+/gu, " ").trim();
  if (flat.length <= 180) {
    return flat;
  }
  return `${flat.slice(0, 177)}...`;
}

function lessonNumber(key: string): number {
  const match = /-(\d+)$/u.exec(key);
  return match ? Number(match[1]) : 0;
}

function isExponentLesson(lesson: Pick<WrittenLesson, "title" | "concept">): boolean {
  const blob = fold(`${lesson.title} ${lesson.concept}`);
  return blob.includes("üslü") || blob.includes("üssü") || /(?:^|\s)üs(?:\s|$)/u.test(blob);
}

function pushFinding(findings: TextFinding[], finding: TextFinding, seen: Set<string>): void {
  const id = `${finding.lessonKey}:${finding.code}:${finding.field}:${fold(finding.excerpt)}`;
  if (seen.has(id)) {
    return;
  }
  seen.add(id);
  findings.push(finding);
}

/** Üslü ifadede kat/kule yığmanın toplama gibi okunup okunmadığı. Kâğıt katlama bu kurala girmez. */
export function scanLessonText(lesson: Pick<WrittenLesson, "key" | "title" | "concept" | "life" | "fields">): TextFinding[] {
  const findings: TextFinding[] = [];
  const seen = new Set<string>();
  const exponent = isExponentLesson(lesson);
  const paperFold = /katl(?:a|ı|ad|ıyor|amak)/u.test(fold(lesson.life));

  for (const field of lesson.fields) {
    const foldedField = fold(field.text);
    if (ANALOGY_REMNANT.test(foldedField) && !exponent) {
      pushFinding(findings, {
        code: "benzetme-kalinti",
        lessonKey: lesson.key,
        title: lesson.title,
        field: field.name,
        excerpt: excerpt(field.text),
        message: "Eski oyuncak benzetmesi duruyor. Anlatım kazanımın kendi nesnesine bağlanmalı.",
      }, seen);
    }

    for (const sentence of sentences(field.text)) {
      const folded = fold(sentence);
      const legoStack = ANALOGY_REMNANT.test(folded) && /kat|kule/u.test(folded);
      const countedLayers = /\d+\s*['’]?[şs]erli/u.test(folded) && /kat|kule/u.test(folded);
      if (exponent && (legoStack || countedLayers)) {
        pushFinding(findings, {
          code: "uslu-lego-kule",
          lessonKey: lesson.key,
          title: lesson.title,
          field: field.name,
          excerpt: excerpt(sentence),
          message: paperFold
            ? "Kat sayısı üs gibi durunca 2+2+2 veya 2×3 okunur. 2³, tabanın üç kez çarpımıdır ve 8 eder. Aynı dersin günlük örneği kâğıt katlamadır; o model çarpımı korur. Bu cümle eski yığma kalıntısıdır."
            : "Kat veya kule, üssü toplama ya da düz çarpma gibi okutur. Üslü ifade tekrarlı çarpımdır. Yığma benzetmesi kalkmalı.",
        }, seen);
      }
      if (exponent && /üst üste/u.test(folded) && /ekle|koy|diz/u.test(folded) && !/çarp/u.test(folded)) {
        pushFinding(findings, {
          code: "uslu-ekleme",
          lessonKey: lesson.key,
          title: lesson.title,
          field: field.name,
          excerpt: excerpt(sentence),
          message: "Üst üste ekleme, üslü ifadeyi toplama gibi gösterir. Tekrarlı çarpım cümlesi durmalı.",
        }, seen);
      }
      if (
        (field.name === "concept" || field.name === "example") &&
        /paydalar[ıi](?:n[ıi])?\s+topla/u.test(folded) &&
        !/tuzak|yanlış|değil|sanma|etme/u.test(folded)
      ) {
        pushFinding(findings, {
          code: "payda-topla",
          lessonKey: lesson.key,
          title: lesson.title,
          field: field.name,
          excerpt: excerpt(sentence),
          message: "Paydaları toplamak kesir toplamının kuralı diye verilmiş. Payda eşitlenir; paydalar toplanmaz.",
        }, seen);
      }
      if (
        field.name === "concept" &&
        /önce toplama/u.test(folded) &&
        /çarpma/u.test(folded) &&
        !/değil|tuzak|yanlış|geçer/u.test(folded)
      ) {
        pushFinding(findings, {
          code: "islem-sira",
          lessonKey: lesson.key,
          title: lesson.title,
          field: field.name,
          excerpt: excerpt(sentence),
          message: "İşlem sırasında çarpma, toplamadan önce gelir. Cümle bu sırayı ters kurmuş.",
        }, seen);
      }
      if (
        field.name === "concept" &&
        /aynı eleman/u.test(folded) &&
        /iki kez yazıl/u.test(folded) &&
        !/asla|değil|yazılmaz|tuzak|yanlış/u.test(folded)
      ) {
        pushFinding(findings, {
          code: "kume-tekrar",
          lessonKey: lesson.key,
          title: lesson.title,
          field: field.name,
          excerpt: excerpt(sentence),
          message: "Bir kümede aynı eleman iki kez yazılmaz. Cümle tekrarı kural diye vermiş.",
        }, seen);
      }
    }
  }

  return findings;
}

function clicheBlob(lesson: WrittenLesson): string {
  return fold(lesson.fields.map((field) => field.text).join("\n"));
}

export function collectCliches(lessons: readonly WrittenLesson[]): PhraseHit[] {
  const hits: PhraseHit[] = [];
  for (const pattern of CLICHE_PATTERNS) {
    const lessonKeys = lessons.filter((lesson) => pattern.pattern.test(clicheBlob(lesson))).map((lesson) => lesson.key);
    if (lessonKeys.length >= 3) {
      hits.push({ label: pattern.label, count: lessonKeys.length, lessonKeys });
    }
  }
  return hits.sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "tr"));
}

function openingKey(welcome: string): string {
  return fold(welcome)
    .replace(/[“”«»"'.,;:!?()]/gu, "")
    .split(/\s+/u)
    .slice(0, 8)
    .join(" ");
}

export function collectOpenings(lessons: readonly WrittenLesson[]): PhraseHit[] {
  const groups = new Map<string, string[]>();
  for (const lesson of lessons) {
    const welcome = lesson.fields.find((field) => field.name === "welcome")?.text ?? "";
    const key = openingKey(welcome);
    if (key.length < 12) {
      continue;
    }
    const list = groups.get(key) ?? [];
    list.push(lesson.key);
    groups.set(key, list);
  }
  return [...groups.entries()]
    .filter((entry) => entry[1].length >= 4)
    .map(([label, lessonKeys]) => ({ label, count: lessonKeys.length, lessonKeys }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "tr"));
}

function normalizeSentence(value: string): string {
  return fold(value)
    .replace(/[“”«»"'.,;:!?()]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

export function collectDuplicates(lessons: readonly WrittenLesson[]): PhraseHit[] {
  const groups = new Map<string, Set<string>>();
  for (const lesson of lessons) {
    const seenInLesson = new Set<string>();
    for (const field of lesson.fields) {
      if (field.name === "teaser") {
        continue;
      }
      for (const sentence of sentences(field.text)) {
        const normalized = normalizeSentence(sentence);
        if (normalized.length < 55 || seenInLesson.has(normalized)) {
          continue;
        }
        seenInLesson.add(normalized);
        const keys = groups.get(normalized) ?? new Set<string>();
        keys.add(lesson.key);
        groups.set(normalized, keys);
      }
    }
  }
  return [...groups.entries()]
    .filter((entry) => entry[1].size >= 3)
    .map(([label, keys]) => ({ label, count: keys.size, lessonKeys: [...keys].sort(compareLessonKeys) }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "tr"))
    .slice(0, 20);
}

function conceptMark(concept: string): StageMark {
  const parts = sentences(concept);
  if (concept.trim().length < 40) {
    return "yok";
  }
  if (parts.length < 3 || concept.trim().length < 180) {
    return "yüzeysel";
  }
  return "tam";
}

function applicationMark(example: string, life: string, course: CourseId): StageMark {
  if (example.trim().length < 40) {
    return "yok";
  }
  const cases = sentences(example).filter((sentence) => sentence.length >= 50);
  const concrete = course === "mat" || course === "fen" ? /\d/u.test(example) : cases.length >= 1;
  if (!concrete || cases.length < 2) {
    return "yüzeysel";
  }
  if (life.trim().length < 80) {
    return "yüzeysel";
  }
  return "tam";
}

function numbersIn(value: string): string[] {
  return value.match(/\d+/gu) ?? [];
}

function skillMark(skill: SkillProbe | null): { mark: StageMark; reason: string | null } {
  if (!skill) {
    return { mark: "yok", reason: "Beceri sorusu yok. Bağlamı olan, en az iki adımlı yeni nesil soru yazılacak." };
  }
  const question = fold(skill.question);
  const recall = /^(?:hangisi|aşağıdakilerden hangisi|nedir|ne demektir)\b/u.test(question) && skill.question.trim().length < 90;
  if (recall) {
    return {
      mark: "yüzeysel",
      reason: "Beceri sorusu tanıma sorusu. Yeni nesil soru bir bağlam, ikinci bir koşul ve çeldirici tuzak taşır.",
    };
  }
  const skillNumbers = numbersIn(skill.correctOption);
  const applyNumbers = numbersIn(skill.applyCorrectOption);
  const dataContext = /tablo|grafik|paragraf|metin|harita|sıklık/u.test(question);
  const sameResult = skillNumbers.length > 0 && skillNumbers.join(",") === applyNumbers.join(",") && !dataContext;
  if (sameResult) {
    return {
      mark: "yüzeysel",
      reason: "Beceri sorusu, uygulama sorusunun aynı sayısal sonucunu kısa hikâyeye sarmış. İkinci koşul veya veri yorumu eklenmeli.",
    };
  }
  const steps = fold(skill.explanation).match(/adım/gu)?.length ?? 0;
  const contextual = skill.question.trim().length >= 80 && CONTEXT_WORD.test(question);
  if (steps < 2 || !contextual) {
    return {
      mark: "yüzeysel",
      reason: "Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.",
    };
  }
  return { mark: "tam", reason: null };
}

const TRAP_WORD = /tuzak|sanma|yanlış|karıştır|düşme|düşül|değildir|hatadır|yanılgı/u;
const RULE_WORD = /kural|pratik|ipucu|işlem sırası|her zaman|adım adım/u;
const RULE_OPERATION = /çarp|topla|eşitle|böl|yaz|karşılaştır|çevir|sırala|say|grupla|ayırt|seç/u;
const RULE_CONTRAST = /değil|oysa|ancak|sanma|tuzak|asla|yanlış/u;
const CASE_MARK = /örnek|cümle|durum|mesela|diyelim|bir de|başka/u;
const EXAM_CLAUSE = /ancak|fakat|çünkü|eğer|önce|hem /u;

function hasPracticalRule(lesson: Pick<WrittenLesson, "concept" | "example" | "warning" | "recap">): boolean {
  const blob = fold([lesson.concept, lesson.example, lesson.warning, lesson.recap].join("\n"));
  if (RULE_WORD.test(blob)) {
    return true;
  }
  if (/önce/u.test(blob) && /sonra/u.test(blob)) {
    return true;
  }
  const warning = fold(lesson.warning);
  return lesson.warning.trim().length >= 100 && RULE_OPERATION.test(warning) && RULE_CONTRAST.test(warning);
}

function hasTrapWarning(warning: string): boolean {
  return TRAP_WORD.test(fold(warning));
}

function hasRichExample(example: string): boolean {
  const parts = sentences(example).filter((sentence) => sentence.length >= 40);
  if (parts.length < 2) {
    return false;
  }
  const cases = parts.filter((sentence) => /\d/u.test(sentence) || CASE_MARK.test(fold(sentence)));
  return cases.length >= 2 || parts.length >= 3;
}

function questionShape(question: string): "neg" | "cmp" | "ctx" | "calc" | "recall" | "other" {
  const folded = fold(question);
  if (/yanlıştır|değildir|olamaz|hatalı|yanlış olan/u.test(folded)) {
    return "neg";
  }
  if (/karşılaştır|daha büyük|daha küçük|sırala/u.test(folded)) {
    return "cmp";
  }
  if (question.trim().length >= 100 && CONTEXT_WORD.test(folded)) {
    return "ctx";
  }
  if (/kaç|eder|sonuç|işlemin|bulunur|kaçtır/u.test(folded)) {
    return "calc";
  }
  if (/nedir|hangisi|ne demektir|ne anlama/u.test(folded) && question.trim().length < 110) {
    return "recall";
  }
  return "other";
}

/** Yazılı tipi: concept ve apply kısa tanıma çifti değildir; en az iki şekil ve biri çok koşulludur. */
function hasExamQuestionTypes(questions: readonly QuizStem[]): boolean {
  const stems = questions.filter((question) => question.level === "concept" || question.level === "apply");
  if (stems.length < 2) {
    return false;
  }
  const shapes = new Set(stems.map((stem) => questionShape(stem.question)));
  const examItem = stems.some((stem) => stem.question.trim().length >= 85 || EXAM_CLAUSE.test(fold(stem.question)));
  const classroom = [...shapes].some((shape) => shape === "calc" || shape === "cmp" || shape === "neg" || shape === "ctx");
  const onlyRecall = shapes.size === 1 && shapes.has("recall");
  return examItem && classroom && !onlyRecall && shapes.size >= 2;
}

/**
 * Katman 1 MEB tabanıdır: tanım ve günlük örnek.
 * Katman 2 yardımcı kaynak omurgasıdır: pratik kural, tuzak, zengin örnek, yazılı soru tipi.
 * Katman 3, Katman 2 kapandıktan sonra yeni nesil beceri sorusudur.
 */
export function scoreDepthBand(lesson: WrittenLesson): LessonDepthBand {
  const conceptReady = lesson.concept.trim().length >= 80 && sentences(lesson.concept).length >= 2;
  const lifeReady = lesson.life.trim().length >= 80;
  let layer1: StageMark = "yok";
  if (conceptReady && lifeReady) {
    layer1 = "tam";
  } else if (lesson.concept.trim().length >= 40 || lesson.life.trim().length >= 40) {
    layer1 = "yüzeysel";
  }

  const pillars = {
    rule: hasPracticalRule(lesson),
    trap: hasTrapWarning(lesson.warning),
    rich: hasRichExample(lesson.example),
    types: hasExamQuestionTypes(lesson.quizQuestions),
  };
  const pillarCount = Object.values(pillars).filter(Boolean).length;
  let layer2: StageMark = "yok";
  if (pillarCount === 4) {
    layer2 = "tam";
  } else if (pillarCount >= 2) {
    layer2 = "yüzeysel";
  }

  const skill = skillMark(lesson.skill);
  const layer3 = skill.mark;

  const gaps: string[] = [];
  if (!pillars.rule) {
    gaps.push("Pratik kural yok. Yazılıda kullanılacak işlem veya ayırt etme kuralı yazılacak.");
  }
  if (!pillars.trap) {
    gaps.push("Tuzak uyarısı yok. Sınıf içi yanlışın adı warning alanında duracak.");
  }
  if (!pillars.rich) {
    gaps.push("Zengin örnek yok. En az iki ayrı çözülmüş durum example alanına yazılacak.");
  }
  if (!pillars.types) {
    gaps.push("Soru tipi dar. Concept ve apply kısa tanıma çifti. Yazılı tipi en az iki şekil (hesap, karşılaştırma, olumsuz veya bağlam) ve biri çok koşullu olacak.");
  }
  if (skill.reason) {
    gaps.push(skill.reason);
  }
  if (layer3 === "tam" && layer2 !== "tam") {
    gaps.push("Beceri sorusu hazır. Katman 2 omurgası kapanmadan çizgi tamam sayılmaz.");
  }

  let ceiling: DepthCeiling = "yok";
  if (layer2 === "tam" && layer3 === "tam") {
    ceiling = "katman-3";
  } else if (layer2 === "tam") {
    ceiling = "katman-2";
  } else if (layer2 === "yüzeysel") {
    ceiling = "katman-2-kısmi";
  } else if (layer1 !== "yok") {
    ceiling = "katman-1";
  }

  return {
    key: lesson.key,
    title: lesson.title,
    course: lesson.course,
    layer1,
    layer2,
    layer3,
    ceiling,
    gaps,
  };
}

function significantTokens(title: string): string[] {
  const stop = new Set(["için", "olan", "olarak", "göre", "daha", "arasında", "üzerine", "birlikte"]);
  return fold(title)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 5 && !stop.has(token));
}

function tokensMissing(title: string, blob: string): string[] {
  const folded = fold(blob);
  return significantTokens(title).filter((token) => {
    const stem = token.length >= 7 ? token.slice(0, 6) : token;
    return !folded.includes(token) && !folded.includes(stem);
  });
}

function processBlob(lesson: WrittenLesson): string {
  return fold([lesson.concept, lesson.example, lesson.life, lesson.skill?.question ?? ""].join("\n"));
}

export function scoreWrittenLesson(
  lesson: WrittenLesson,
  outcomes: readonly OutcomeRef[],
): LessonDepth {
  const kavram = conceptMark(lesson.concept);
  const uygulama = applicationMark(lesson.example, lesson.life, lesson.course);
  const skill = skillMark(lesson.skill);
  const gaps: string[] = [];
  if (kavram === "yok") {
    gaps.push("Kavram yok. Tanım, sınır ve karşıt örnek yazılacak.");
  } else if (kavram === "yüzeysel") {
    gaps.push("Kavram yüzeysel. Tanım en az üç cümle olmalı: tanım, sınır, karşıt örnek.");
  }
  if (uygulama === "yok") {
    gaps.push("Uygulama yok. İki çözülmüş durum ve günlük iş yazılacak.");
  } else if (uygulama === "yüzeysel") {
    gaps.push("Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli.");
  }
  if (skill.reason) {
    gaps.push(skill.reason);
  }

  let alignment: Alignment = "takvimsiz";
  if (lesson.band === "legacy-2018") {
    alignment = "çıktı-dışı";
    gaps.push("2026-2027 Maarif çıktı kodu yok. Bu konu ders kitabı kazanımına yazılmaz.");
  } else if (lesson.band === "tymm" && lesson.hours <= 0) {
    alignment = "uydu";
    gaps.push("Tema saati 0. Bu dosya kazanımı kapatmaz. Üç aşama yine de tamamlanmalı.");
  } else if (lesson.band === "tymm") {
    alignment = "seviye-altı";
  }

  const linked = outcomes.filter((outcome) => lesson.outcomeCodes.includes(outcome.outcomeCode));
  if (lesson.band === "tymm" && lesson.hours > 0) {
    for (const outcome of linked) {
      const missing = tokensMissing(outcome.outcomeTitle, `${lesson.title}\n${lesson.concept}\n${lesson.example}`);
      if (missing.length === significantTokens(outcome.outcomeTitle).length && missing.length > 0) {
        gaps.push(`Kazanım terimleri anlatımda yok: ${outcome.outcomeTitle}.`);
      }
      if (outcome.processOpen && !PROCESS_VERB.test(processBlob(lesson))) {
        gaps.push(`Süreç bileşeni açık (${outcome.outcomeCode}). Deney, model, ölçme veya tartışma adımı yok.`);
      }
    }
    if (kavram === "tam" && uygulama === "tam" && skill.mark === "tam" && !gaps.some((gap) => gap.startsWith("Kazanım") || gap.startsWith("Süreç"))) {
      alignment = "üç-aşama";
    }
  }

  return {
    key: lesson.key,
    title: lesson.title,
    course: lesson.course,
    bandLabel: lesson.band ?? "takvimsiz",
    hours: lesson.hours,
    outcomeCodes: lesson.outcomeCodes,
    kavram,
    uygulama,
    beceri: skill.mark,
    alignment,
    gaps,
  };
}

function better(left: StageMark, right: StageMark): StageMark {
  const rank: Record<StageMark, number> = { tam: 2, yüzeysel: 1, yok: 0 };
  return rank[left] >= rank[right] ? left : right;
}

function stageGap(closing: readonly LessonDepth[], prefix: "Kavram" | "Uygulama" | "Beceri", mark: StageMark): string | null {
  if (mark === "tam") {
    return null;
  }
  const owner = closing.find((lesson) => {
    const stage = prefix === "Kavram" ? lesson.kavram : prefix === "Uygulama" ? lesson.uygulama : lesson.beceri;
    return stage === mark;
  });
  return owner?.gaps.find((gap) => gap.startsWith(prefix)) ?? null;
}

export function scoreOutcomes(
  outcomes: readonly OutcomeRef[],
  lessons: readonly LessonDepth[],
  written: readonly WrittenLesson[],
  shells: readonly ShellLesson[],
): OutcomeDepth[] {
  const byKey = new Map(written.map((lesson) => [lesson.key, lesson]));
  return outcomes.map((outcome) => {
    const closing = lessons.filter(
      (lesson) =>
        lesson.bandLabel === "tymm" &&
        lesson.hours > 0 &&
        lesson.outcomeCodes.includes(outcome.outcomeCode),
    );
    const shellKeys = shells
      .filter((shell) => shell.outcomeCodes.includes(outcome.outcomeCode))
      .map((shell) => shell.key);
    const carriers = [...closing.map((lesson) => lesson.key), ...shellKeys];
    if (closing.length === 0) {
      const gaps =
        outcome.hours > 0
          ? ["Saatli anlatım yok. Kavram, uygulama ve beceri bu kabın içine yazılacak."]
          : ["Bu çıktının saati 0. Kapanış, saatli tema gövdesine bağlı."];
      if (outcome.processOpen && outcome.hours > 0) {
        gaps.push("Süreç bileşeni açık. Deney, model, ölçme veya tartışma adımı yok.");
      }
      return {
        course: outcome.course,
        outcomeCode: outcome.outcomeCode,
        outcomeTitle: outcome.outcomeTitle,
        hours: outcome.hours,
        processOpen: outcome.processOpen,
        carriers,
        kavram: "yok",
        uygulama: "yok",
        beceri: "yok",
        gaps,
      };
    }
    const kavram = closing.reduce<StageMark>((mark, lesson) => better(mark, lesson.kavram), "yok");
    const uygulama = closing.reduce<StageMark>((mark, lesson) => better(mark, lesson.uygulama), "yok");
    const beceri = closing.reduce<StageMark>((mark, lesson) => better(mark, lesson.beceri), "yok");
    const blob = closing
      .map((lesson) => byKey.get(lesson.key))
      .filter((lesson): lesson is WrittenLesson => Boolean(lesson))
      .map((lesson) => `${lesson.title}\n${lesson.concept}\n${lesson.example}\n${lesson.life}\n${lesson.skill?.question ?? ""}`)
      .join("\n");
    const gaps = [stageGap(closing, "Kavram", kavram), stageGap(closing, "Uygulama", uygulama), stageGap(closing, "Beceri", beceri)].filter(
      (gap): gap is string => Boolean(gap),
    );
    const missing = tokensMissing(outcome.outcomeTitle, blob);
    if (missing.length > 0 && missing.length === significantTokens(outcome.outcomeTitle).length) {
      gaps.push(`Kazanım terimleri anlatımda yok: ${outcome.outcomeTitle}.`);
    }
    if (outcome.processOpen && !PROCESS_VERB.test(fold(blob))) {
      gaps.push(`Süreç bileşeni açık (${outcome.outcomeCode}). Deney, model, ölçme veya tartışma adımı yok.`);
    }
    return {
      course: outcome.course,
      outcomeCode: outcome.outcomeCode,
      outcomeTitle: outcome.outcomeTitle,
      hours: outcome.hours,
      processOpen: outcome.processOpen,
      carriers,
      kavram,
      uygulama,
      beceri,
      gaps,
    };
  });
}

export function compareLessonKeys(left: string, right: string): number {
  const courseDelta = courseIndexFromKey(left) - courseIndexFromKey(right);
  if (courseDelta !== 0) {
    return courseDelta;
  }
  return lessonNumber(left) - lessonNumber(right);
}

function courseIndexFromKey(key: string): number {
  if (key.includes("_mat-")) {
    return 0;
  }
  if (key.includes("_fen-")) {
    return 1;
  }
  if (key.includes("_turkce-")) {
    return 2;
  }
  if (key.includes("_ing_main-")) {
    return 3;
  }
  if (key.includes("_sosyal-")) {
    return 4;
  }
  return 9;
}

function alignmentLabel(alignment: Alignment): string {
  switch (alignment) {
    case "üç-aşama":
      return "Üç aşama";
    case "seviye-altı":
      return "Seviye altı";
    case "uydu":
      return "Uydu";
    case "çıktı-dışı":
      return "Çıktı dışı";
    case "anlatım-yok":
      return "Anlatım yok";
    case "takvimsiz":
      return "Takvimsiz";
    default: {
      const never: never = alignment;
      return never;
    }
  }
}

function cell(value: string): string {
  return value.replaceAll("|", "/").replaceAll("\n", " ");
}

function keyList(keys: readonly string[], limit = 8): string {
  if (keys.length <= limit) {
    return keys.join(", ");
  }
  return `${keys.slice(0, limit).join(", ")} ve ${keys.length - limit} ders daha`;
}

function countAlignment(lessons: readonly LessonDepth[], alignment: Alignment): number {
  return lessons.filter((lesson) => lesson.alignment === alignment).length;
}

function shortDepthGap(gap: string): string {
  if (gap.startsWith("Pratik kural")) {
    return "pratik kural";
  }
  if (gap.startsWith("Tuzak")) {
    return "tuzak";
  }
  if (gap.startsWith("Zengin örnek")) {
    return "zengin örnek";
  }
  if (gap.startsWith("Soru tipi")) {
    return "soru tipi";
  }
  if (gap.startsWith("Beceri sorusu hazır")) {
    return "omurga açıkken Katman 3 sayılmaz";
  }
  if (gap.startsWith("Beceri")) {
    return "Katman 3";
  }
  return gap;
}

function countCeiling(depths: readonly LessonDepthBand[], ceiling: DepthCeiling): number {
  return depths.filter((depth) => depth.ceiling === ceiling).length;
}

function ceilingLabel(ceiling: DepthCeiling): string {
  switch (ceiling) {
    case "katman-3":
      return "Katman 3";
    case "katman-2":
      return "Katman 2";
    case "katman-2-kısmi":
      return "Katman 2 kısmi";
    case "katman-1":
      return "Katman 1";
    case "yok":
      return "Yok";
    default: {
      const never: never = ceiling;
      return never;
    }
  }
}

export function renderContentQualityReport(model: ContentQualityModel): string {
  const analogy = model.findings.filter((finding) => finding.code === "uslu-lego-kule" || finding.code === "uslu-ekleme" || finding.code === "benzetme-kalinti");
  const logic = model.findings.filter((finding) => finding.code !== "benzetme-kalinti");
  const lines: string[] = [
    "# İçerik kalite raporu",
    "",
    "| Alan | Değer |",
    "|---|---|",
    `| Tarih | ${model.runLabel} |`,
    "| Muhatap | SUPER_ADMIN |",
    "| Betik | `npm run verify:content-quality` |",
    "| Kaynak | `packages/junior-content/topics`, `quiz`, `calendar`, `meb/2026-2027` |",
    `| Yazılı ders | ${model.writtenCount} |`,
    `| Boş kab | ${model.shellCount} |`,
    `| Mantık bulgusu | ${logic.length} |`,
    `| Benzetme kalıntısı | ${analogy.length} |`,
    `| Yüzeysel anlatım (Katman 1) | ${countCeiling(model.depths, "katman-1")} |`,
    "",
    "## SUPER_ADMIN özeti",
    "",
    `${model.writtenCount} yazılı senaryo tarandı. Üslü ifadede kat veya kule yığması toplama algısı kuran benzetmeler, eski oyuncak kalıntıları, klişe koç kalıpları ve mükerrer cümleler aşağıdadır.`,
    "",
    "Çizgi yardımcı kaynak fasikülüdür ve sınav ayarıdır. MEB kazanım kodu korunur; anlatım ders kitabı tanımında bırakılmaz. Katman 1 tanım ve günlük örnektir. Katman 2 ana omurgadır: pratik kural, tuzak uyarısı, zengin örnek ve yazılı soru tipi. Katman 3, omurga kapandıktan sonra yeni nesil muhakeme sorusudur. Yalnız Katman 1'de kalan ders Katman 2 ve Katman 3'e çıkarılır.",
    "",
    `Katman 1 tavanı: ${countCeiling(model.depths, "katman-1")}. Kısmi omurga: ${countCeiling(model.depths, "katman-2-kısmi")}. Katman 2: ${countCeiling(model.depths, "katman-2")}. Katman 3: ${countCeiling(model.depths, "katman-3")}.`,
    "",
    "MEB ölçüsü 2026-2027 Maarif kazanım dosyasıdır. Ders kitabı sayfa metni pakette yoktur; sayfa alıntısı üretilmez. Her konuda üç aşama aranır: Kavram (`concept`), Uygulama (`example` ve `life`), Beceri Temelli (`quiz` düzeyi `skill`). Saatli `tymm` ders, bu üçü tamsa kazanımı taşır. Boş kab ve 0 saatlik uydu kazanımı kapatmaz.",
    "",
    "| Ders | Yazılı | Katman 1 | Kısmi omurga | Katman 2 | Katman 3 |",
    "|---|---:|---:|---:|---:|---:|",
  ];

  for (const course of COURSE_ORDER) {
    const group = model.depths.filter((depth) => depth.course === course);
    lines.push(
      `| ${COURSE_TITLE[course]} | ${group.length} | ${countCeiling(group, "katman-1")} | ${countCeiling(group, "katman-2-kısmi")} | ${countCeiling(group, "katman-2")} | ${countCeiling(group, "katman-3")} |`,
    );
  }

  lines.push(
    "",
    `| Ders | Yazılı | Üç aşama | Seviye altı | Uydu | Çıktı dışı |`,
    "|---|---:|---:|---:|---:|---:|",
  );

  for (const course of COURSE_ORDER) {
    const group = model.lessons.filter((lesson) => lesson.course === course);
    lines.push(
      `| ${COURSE_TITLE[course]} | ${group.length} | ${countAlignment(group, "üç-aşama")} | ${countAlignment(group, "seviye-altı")} | ${countAlignment(group, "uydu")} | ${countAlignment(group, "çıktı-dışı")} |`,
    );
  }

  lines.push(
    "",
    "## 1. Kavramsal ve matematiksel çelişkiler",
    "",
  );
  if (logic.length === 0) {
    lines.push("Bu taramada kurala uyan mantık çelişkisi çıkmadı.", "");
  } else {
    for (const finding of logic) {
      lines.push(`- **${finding.lessonKey}** ${cell(finding.title)} — \`${finding.field}\`. ${finding.message}`, `  > ${cell(finding.excerpt)}`, "");
    }
  }

  lines.push("## 2. Eski benzetme kalıntıları", "");
  if (analogy.length === 0) {
    lines.push("Lego, Playmobil, Minecraft veya Roblox kalıntısı çıkmadı.", "");
  } else {
    for (const finding of analogy) {
      lines.push(`- **${finding.lessonKey}** ${cell(finding.title)} — \`${finding.code}\` / \`${finding.field}\`. ${finding.message}`, `  > ${cell(finding.excerpt)}`, "");
    }
  }

  lines.push("## 3. Klişe koç cümleleri", "", "| Kalıp | Ders | Örnek anahtarlar |", "|---|---:|---|");
  for (const hit of model.cliches) {
    lines.push(`| ${cell(hit.label)} | ${hit.count} | ${cell(keyList(hit.lessonKeys))} |`);
  }
  if (model.cliches.length === 0) {
    lines.push("| Üç derste birden geçen klişe yok | 0 | — |");
  }

  lines.push("", "## 4. Mükerrer açılışlar ve cümleler", "", "Açılış, `welcome` alanının ilk sekiz sözcüğüdür. Dört ve daha fazla derste aynıysa listelenir.", "", "| Açılış | Ders |", "|---|---:|");
  for (const hit of model.openings) {
    lines.push(`| ${cell(hit.label)} | ${hit.count} |`);
  }
  if (model.openings.length === 0) {
    lines.push("| Ortak açılış yok | 0 |");
  }
  lines.push("", "Aynı cümle en az üç derste geçiyorsa aşağıdadır. Liste yirmi grupta kesilir.", "");
  if (model.duplicates.length === 0) {
    lines.push("Üç derste birden geçen uzun cümle yok.", "");
  } else {
    for (const hit of model.duplicates) {
      lines.push(`- ${hit.count} ders: ${cell(hit.label)}`, `  Anahtarlar: ${cell(keyList(hit.lessonKeys))}`, "");
    }
  }

  const openOutcomes = model.outcomes.filter((outcome) => outcome.kavram !== "tam" || outcome.uygulama !== "tam" || outcome.beceri !== "tam");
  lines.push(
    "## 5. MEB kazanım derinliği",
    "",
    "Kazanım satırı, yalnız saati sıfırdan büyük `tymm` anlatımdan kapanır. Üç aşama tam değilse eksik içerik aynı satırdadır.",
    "",
    `Açık kazanım: ${openOutcomes.length} / ${model.outcomes.length}.`,
    "",
    "| Kod | Kazanım | Saat | Kavram | Uygulama | Beceri | Taşıyan | Eksik |",
    "|---|---|---:|---|---|---|---|---|",
  );
  for (const outcome of model.outcomes) {
    const gaps = outcome.gaps.length === 0 ? "—" : outcome.gaps.join(" ");
    lines.push(
      `| ${outcome.outcomeCode} | ${cell(outcome.outcomeTitle)} | ${outcome.hours} | ${outcome.kavram} | ${outcome.uygulama} | ${outcome.beceri} | ${cell(outcome.carriers.join(", ") || "—")} | ${cell(gaps)} |`,
    );
  }

  lines.push(
    "",
    "## 6. Yazılı derslerin hizası",
    "",
    "Hiza: **Üç aşama** saatli Maarif dersidir ve üç ölçü tamdır. **Seviye altı** saatli derstir, bir aşama eksiktir. **Uydu** çıktı kodu taşır, saati 0'dır. **Çıktı dışı** `legacy-2018` bandındadır.",
    "",
    "| Ders | Başlık | Bant | Saat | Çıktı | Kavram | Uygulama | Beceri | Hiza |",
    "|---|---|---|---:|---|---|---|---|---|",
  );
  for (const lesson of model.lessons) {
    lines.push(
      `| ${lesson.key} | ${cell(lesson.title)} | ${lesson.bandLabel} | ${lesson.hours} | ${cell(lesson.outcomeCodes.join(", ") || "—")} | ${lesson.kavram} | ${lesson.uygulama} | ${lesson.beceri} | ${alignmentLabel(lesson.alignment)} |`,
    );
  }

  const below = model.lessons.filter((lesson) => lesson.alignment !== "üç-aşama");
  lines.push("", "## 7. Eksik içerik noktaları", "", "Üç aşamayı kapatmayan yazılı dersler. Aynı cümledeki eksik, o dersin bir sonraki yazarlık işidir.", "");
  for (const course of COURSE_ORDER) {
    const group = below.filter((lesson) => lesson.course === course);
    lines.push(`### ${COURSE_TITLE[course]}`, "");
    if (group.length === 0) {
      lines.push("Bu derste açık yazılı konu yok.", "");
      continue;
    }
    for (const lesson of group) {
      lines.push(`- **${lesson.key}** ${cell(lesson.title)} — ${alignmentLabel(lesson.alignment)}. ${cell(lesson.gaps.join(" "))}`);
    }
    lines.push("");
  }

  const layerOne = model.depths.filter((depth) => depth.ceiling === "katman-1");
  const raise = model.depths.filter((depth) => depth.ceiling !== "katman-3");
  lines.push(
    "## 8. Yüzeysel anlatım uyarısı",
    "",
    "Bu dersler Katman 1 tavanındadır. Tanım veya günlük örnek vardır; yardımcı kaynak omurgası açılmamıştır. Pratik kural, tuzak, zengin örnek ve yazılı soru tipinden en fazla biri duruyorsa ders burada kalır.",
    "",
    `Katman 1 tavanı: ${layerOne.length} ders. Hepsi Katman 2 ve Katman 3'e çıkarılacak.`,
    "",
  );
  if (layerOne.length === 0) {
    lines.push("Yalnız Katman 1'de kalan yazılı ders yok.", "");
  } else {
    for (const course of COURSE_ORDER) {
      const group = layerOne.filter((depth) => depth.course === course);
      lines.push(`### ${COURSE_TITLE[course]}`, "");
      if (group.length === 0) {
        lines.push("Bu derste Katman 1 tavanı yok.", "");
        continue;
      }
      for (const depth of group) {
        lines.push(`- **${depth.key}** ${cell(depth.title)}. ${cell(depth.gaps.join(" "))}`);
      }
      lines.push("");
    }
  }

  lines.push(
    "## 9. Katman 2 ve Katman 3'e çıkarılacak dersler",
    "",
    "Katman 2 dört direk ister: pratik kural, tuzak uyarısı, zengin örnek, yazılı soru tipi. Dördü birden tam değilse omurga kısmi sayılır ve ders çizgiye çıkmaz. Katman 3 ancak omurga tamken kapanır.",
    "",
    `Yükseltilecek yazılı ders: ${raise.length} / ${model.depths.length}.`,
    "",
    "| Ders | Başlık | Tavan | Katman 1 | Katman 2 | Katman 3 | Eksik |",
    "|---|---|---|---|---|---|---|",
  );
  for (const depth of raise) {
    lines.push(
      `| ${depth.key} | ${cell(depth.title)} | ${ceilingLabel(depth.ceiling)} | ${depth.layer1} | ${depth.layer2} | ${depth.layer3} | ${cell(depth.gaps.map(shortDepthGap).join("; "))} |`,
    );
  }
  if (raise.length === 0) {
    lines.push("| — | Üç katmanı kapatan derslerin dışında açık ders yok | — | — | — | — | — |");
  }

  lines.push(
    "",
    "## Ölçü",
    "",
    "Mantık kuralları şunlardır: üslü ifadede Lego, tuğla veya sayılı kat/kule; üst üste ekleme; kavramda paydaları toplama; işlem sırasında toplamayı çarpmadan önce sayma; kümede aynı elemanı iki kez yazma. Kâğıt katlama tekrarlı ikiye bölme olduğu için üslü ifadede doğru model sayılır ve işaretlenmez.",
    "",
    "Yüzeysel anlatım, Katman 1 tavanıdır. Katman 2 tam sayılması için dört direk birden gerekir. Yazılı soru tipi, concept ve apply kısa «nedir / hangisi» çiftiyse kapalı kalır; en az iki şekil ve biri çok koşullu soru aranır. Katman 3, doksan karakterden kısa bir «hangisi» tanıması veya uygulama sorusunun aynı sayısını kısa hikâyeye saran beceri sorusuyla kapanmaz.",
    "",
    "Betik `verify:prebuild` zincirinde değildir. `--strict` mantık veya benzetme bulgusunda çıkış kodunu 1 yapar. Katman eksiği rapora yazılır, çıkış kodunu değiştirmez. Rapor her çalıştırmada bu dosyanın üzerine yazılır.",
    "",
  );
  return lines.join("\n");
}
