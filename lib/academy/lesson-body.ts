/**
 * Uygulamalı ders gövdesi — metin, parametre kutusu, teknik adım, kod.
 *
 * Çit (` ```lang `) kullanıcı girdisi değil; müfredat tohumu. Canlı sayfada
 * üretim API’si yok. TTS kod çitini okumaz; adım ve parametre konuşulur.
 */

import { normalizeAcronyms } from "@/lib/academy/acronym-normalizer";
import {
  type AcademyFiveActDialogue,
  type DialogueTurn,
} from "@/lib/academy/curricula/types";
import type { AcademyExamQuestion } from "@/lib/academy/types";

export const ACADEMY_LESSON_PARAMS_FENCE = "params";
export const ACADEMY_LESSON_STEPS_FENCE = "adim";
export const ACADEMY_LESSON_EXERCISE_FENCE = "alistirma";
const LEGACY_ACADEMY_LESSON_CHALLENGE_FENCES = new Set(["odev", "challenge"]);

export type AcademyLessonParamRow = {
  label: string;
  value: string;
};

export type AcademyLessonCodeFence = {
  language: string;
  source: string;
};

export type AcademyLessonPractice = {
  params: readonly AcademyLessonParamRow[];
  steps: readonly string[];
  code: AcademyLessonCodeFence;
};

export type AcademyLessonSegment =
  | { kind: "text"; text: string }
  | { kind: "code"; language: string; source: string }
  | { kind: "steps"; items: readonly string[] }
  | { kind: "params"; rows: readonly AcademyLessonParamRow[] }
  | { kind: "exercise"; prompt: string };

const FENCE_CLOSE = "\n```";
const ARTIFICIAL_OPENING_PATTERN =
  /(?:Şey|Eeee|Bakın(?:\s+burası\s+ilginç)?|Yani|Aslında|Iııı)(?:\.{3}|…)\s*(?:aslında\s+şöyle\s+diyeyim[:,]?\s*)?/gmu;
const ARTIFICIAL_FILLER_SENTENCES = [
  /Şey gibi düşün bunu:\s*/gmu,
  /Ne demek istediğimi anladın değil mi\?\s*/gmu,
  /Buna dikkat ettin mi hiç\?\s*/gmu,
] as const;

/** Quiet Luxury derleme gümrüğü — kaynak mirasını nihai görsel ve sesli gövdeden düşürür. */
export function cleanAcademyArtificialOpenings(text: string): string {
  let cleaned = text.replace(ARTIFICIAL_OPENING_PATTERN, "");
  for (const pattern of ARTIFICIAL_FILLER_SENTENCES) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned
    .replace(/[ \t]+/gu, " ")
    .replace(/ +([,.;!?])/gu, "$1")
    .replace(/\n +/gu, "\n")
    .trim();
}

export function splitAcademyLessonChunks(body: string): string[] {
  const text = body.replace(/\r\n/g, "\n").trim();
  if (!text) {
    return [];
  }
  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    if (text.startsWith("```", cursor)) {
      const afterOpen = text.indexOf("\n", cursor);
      if (afterOpen === -1) {
        chunks.push(text.slice(cursor).trim());
        break;
      }
      const close = text.indexOf(FENCE_CLOSE, afterOpen);
      if (close === -1) {
        chunks.push(text.slice(cursor).trim());
        break;
      }
      const end = close + FENCE_CLOSE.length;
      chunks.push(text.slice(cursor, end).trim());
      cursor = end;
      while (text[cursor] === "\n") {
        cursor += 1;
      }
      continue;
    }
    const nextFence = text.indexOf("\n```", cursor);
    const nextBlank = text.indexOf("\n\n", cursor);
    let cut = text.length;
    if (nextBlank !== -1) {
      cut = Math.min(cut, nextBlank);
    }
    if (nextFence !== -1) {
      cut = Math.min(cut, nextFence);
    }
    const piece = text.slice(cursor, cut).trim();
    if (piece) {
      chunks.push(piece);
    }
    if (cut === text.length) {
      break;
    }
    cursor = cut;
    while (text[cursor] === "\n") {
      cursor += 1;
    }
  }
  return chunks.filter((chunk) => chunk.length > 0);
}

export function classifyAcademyLessonChunk(chunk: string): AcademyLessonSegment {
  const trimmed = chunk.trim();
  const fence = trimmed.match(/^```([A-Za-z0-9_-]+)\n([\s\S]*?)\n```$/u);
  if (fence) {
    const language = fence[1]!;
    const inner = fence[2]!.replace(/\s+$/u, "");
    if (language === ACADEMY_LESSON_PARAMS_FENCE || language === "parametre") {
      return { kind: "params", rows: parseParamRows(inner) };
    }
    if (language === ACADEMY_LESSON_STEPS_FENCE || language === "steps") {
      return {
        kind: "steps",
        items: inner
          .split("\n")
          .map((line) => line.replace(/^\d+\.\s+/u, "").trim())
          .filter((line) => line.length > 0),
      };
    }
    if (
      language === ACADEMY_LESSON_EXERCISE_FENCE ||
      LEGACY_ACADEMY_LESSON_CHALLENGE_FENCES.has(language)
    ) {
      return { kind: "exercise", prompt: inner.trim() };
    }
    return { kind: "code", language, source: inner };
  }
  const lines = trimmed.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
  if (lines.length >= 2 && lines.every((line) => /^\d+\.\s+\S/u.test(line))) {
    return {
      kind: "steps",
      items: lines.map((line) => line.replace(/^\d+\.\s+/u, "")),
    };
  }
  return { kind: "text", text: trimmed };
}

function parseParamRows(inner: string): AcademyLessonParamRow[] {
  return inner
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const pipe = line.split(" | ");
      if (pipe.length >= 2) {
        return { label: pipe[0]!.trim(), value: pipe.slice(1).join(" | ").trim() };
      }
      const dash = line.split(" — ");
      if (dash.length >= 2) {
        return { label: dash[0]!.trim(), value: dash.slice(1).join(" — ").trim() };
      }
      return { label: line, value: "" };
    })
    .filter((row) => row.label.length > 0);
}

export function serializeAcademyLessonParams(rows: readonly AcademyLessonParamRow[]): string {
  const lines = rows.map((row) => `${row.label} | ${row.value}`).join("\n");
  return `\`\`\`${ACADEMY_LESSON_PARAMS_FENCE}\n${lines}\n\`\`\``;
}

export function serializeAcademyLessonSteps(items: readonly string[]): string {
  return `\`\`\`${ACADEMY_LESSON_STEPS_FENCE}\n${items.join("\n")}\n\`\`\``;
}

export function serializeAcademyLessonCode(code: AcademyLessonCodeFence): string {
  return `\`\`\`${code.language}\n${code.source.trim()}\n\`\`\``;
}

export function serializeAcademyLessonExercise(prompt: string): string {
  return `\`\`\`${ACADEMY_LESSON_EXERCISE_FENCE}\n${prompt.trim()}\n\`\`\``;
}

export const ACADEMY_LESSON_ACT_HEADINGS = {
  giris: "Giriş",
  syntax: "Kod Örneği (Syntax)",
  mantik: "Çalışma Mantığı",
  uygulama: "Uygulama Taskı",
} as const;

export type AcademyLessonAct = keyof typeof ACADEMY_LESSON_ACT_HEADINGS;

/** PEDAGOJI.md — tek eğitmen, öğrenciye doğrudan hitap. Anahtarlar zaman çizelgesi mührüdür. */
export const ACADEMY_FIVE_ACT_HEADINGS = {
  warmup: "Giriş & Bağlam",
  problem: "Problem",
  development: "Kod & Uygulama Mantığı",
  conclusion: "Özet & Kazanım",
  assessment: "İş Kanıtı / Değerlendirme",
} as const;

export type AcademyFiveAct = keyof typeof ACADEMY_FIVE_ACT_HEADINGS;

export type AcademyLessonHeadingAct = AcademyLessonAct | AcademyFiveAct;

export const ACADEMY_LESSON_SYNTAX_LEAD = "Bu dersin çalışan sözdizimi aşağıdadır." as const;

export type AcademyLessonPedagogySections = {
  intro: string;
  development: string;
  conclusion: string;
  /** İsteğe bağlı metinsel alıştırma; ders tamamlama kanıtı değildir. */
  exercise: string;
};

export function academyLessonActFromHeading(line: string): AcademyLessonHeadingAct | null {
  const trimmed = line.trim();
  for (const act of Object.keys(ACADEMY_FIVE_ACT_HEADINGS) as AcademyFiveAct[]) {
    if (ACADEMY_FIVE_ACT_HEADINGS[act] === trimmed) {
      return act;
    }
  }
  for (const act of Object.keys(ACADEMY_LESSON_ACT_HEADINGS) as AcademyLessonAct[]) {
    if (ACADEMY_LESSON_ACT_HEADINGS[act] === trimmed) {
      return act;
    }
  }
  return null;
}

export function academyLessonHeadingForAct(act: AcademyLessonHeadingAct): string {
  if (act in ACADEMY_FIVE_ACT_HEADINGS) {
    return ACADEMY_FIVE_ACT_HEADINGS[act as AcademyFiveAct];
  }
  return ACADEMY_LESSON_ACT_HEADINGS[act as AcademyLessonAct];
}

export function attachAcademyLessonActHeading(act: AcademyLessonHeadingAct, prose: string): string {
  const heading = academyLessonHeadingForAct(act);
  const parts = prose
    .split(/\n\n+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return heading;
  }
  const [first, ...rest] = parts;
  return [`${heading}\n${first}`, ...rest].join("\n\n");
}

export function parseAcademyLessonActText(text: string): {
  act: AcademyLessonHeadingAct | null;
  heading: string | null;
  body: string;
} {
  const trimmed = text.replace(/\r\n/g, "\n").trim();
  if (!trimmed) {
    return { act: null, heading: null, body: "" };
  }
  const newline = trimmed.indexOf("\n");
  const firstLine = (newline === -1 ? trimmed : trimmed.slice(0, newline)).trim();
  const act = academyLessonActFromHeading(firstLine);
  if (!act) {
    return { act: null, heading: null, body: trimmed };
  }
  return {
    act,
    heading: firstLine,
    body: newline === -1 ? "" : trimmed.slice(newline).trim(),
  };
}

export function composePracticalLessonBody(
  prose: string,
  practice: AcademyLessonPractice,
): string {
  return [
    ensureTwoProseParagraphs(prose.trim()),
    serializeAcademyLessonParams(practice.params),
    serializeAcademyLessonSteps(practice.steps),
    serializeAcademyLessonCode(practice.code),
  ].join("\n\n");
}

/**
 * Standart 4 bölüm: Giriş, Kod Örneği (Syntax), Çalışma Mantığı, Uygulama Taskı.
 * Ekran düzyazısı ile ses metni aynı kaynaktan okunur; stüdyo repliği yok.
 */
export function composePedagogicalLessonBody(
  sections: AcademyLessonPedagogySections,
  practice: AcademyLessonPractice,
): string {
  const intro = cleanAcademyArtificialOpenings(sections.intro);
  const development = cleanAcademyArtificialOpenings(sections.development);
  const conclusion = cleanAcademyArtificialOpenings(sections.conclusion);
  const exercise = cleanAcademyArtificialOpenings(sections.exercise);
  if (!intro || !development || !conclusion || !exercise) {
    throw new Error("Pedagoji dört bölüm / alıştırma eksik.");
  }
  return [
    attachAcademyLessonActHeading("giris", intro),
    attachAcademyLessonActHeading("syntax", ACADEMY_LESSON_SYNTAX_LEAD),
    serializeAcademyLessonCode(practice.code),
    attachAcademyLessonActHeading("mantik", development),
    serializeAcademyLessonParams(practice.params),
    serializeAcademyLessonSteps(practice.steps),
    attachAcademyLessonActHeading("uygulama", conclusion),
    serializeAcademyLessonExercise(exercise),
  ].join("\n\n");
}

/** Masterclass / tekil SKU — ısınma ve 5 perde zorunlu değildir. */
export function composeCompactLessonBody(
  prose: string,
  practice?: AcademyLessonPractice | null,
): string {
  const cleaned = cleanAcademyArtificialOpenings(prose.trim());
  if (!cleaned) {
    throw new Error("Masterclass / tekil SKU gövdesi boş olamaz.");
  }
  if (!practice) {
    return ensureTwoProseParagraphs(cleaned);
  }
  return composePracticalLessonBody(cleaned, practice);
}

export function serializeDialogueTurns(turns: readonly DialogueTurn[]): string {
  return turns
    .map((turn) => {
      const line = cleanAcademyArtificialOpenings(turn.text);
      if (!turn.code) {
        return line;
      }
      return `${line}\n\n${serializeAcademyLessonCode(turn.code)}`;
    })
    .join("\n\n");
}

export function serializeAcademyLessonQuizPrompt(questions: readonly AcademyExamQuestion[]): string {
  const blocks = questions.map((question, index) => {
    const choices = question.choices
      .map((choice, choiceIndex) => `${String.fromCharCode(65 + choiceIndex)}) ${choice}`)
      .join("\n");
    return `${index + 1}. ${question.prompt}\n${choices}`;
  });
  return [
    "Baraj 70. Üç soru, her birinde tek doğru şık. Cevabı burada işaretlemiyoruz; ölçüm sınav kapısında durur.",
    ...blocks,
  ].join("\n\n");
}

/**
 * PEDAGOJI.md 4 perde — tek eğitmen, öğrenciye doğrudan hitap + çalışan kod + ders sonu quiz.
 */
export function composeFiveActDialogueLessonBody(
  dialogue: AcademyFiveActDialogue,
  quiz: readonly AcademyExamQuestion[],
  practice: AcademyLessonPractice,
): string {
  const warmup = serializeDialogueTurns(dialogue.warmup);
  const problem = serializeDialogueTurns(dialogue.problem);
  const development = serializeDialogueTurns(dialogue.development);
  const conclusion = serializeDialogueTurns(dialogue.conclusion);
  const assessment = serializeAcademyLessonQuizPrompt(quiz);
  if (!warmup || !problem || !development || !conclusion || !assessment) {
    throw new Error("Pedagoji beş perde / quiz eksik.");
  }
  if (quiz.length < 3) {
    throw new Error("Ders sonu quiz 3 soru ister.");
  }
  return [
    attachAcademyLessonActHeading("warmup", warmup),
    attachAcademyLessonActHeading("problem", problem),
    attachAcademyLessonActHeading("development", development),
    serializeAcademyLessonCode(practice.code),
    serializeAcademyLessonParams(practice.params),
    serializeAcademyLessonSteps(practice.steps),
    attachAcademyLessonActHeading("conclusion", conclusion),
    attachAcademyLessonActHeading("assessment", assessment),
    serializeAcademyLessonExercise(assessment),
  ].join("\n\n");
}

export function academyLessonHasFiveActPedagogy(body: string): boolean {
  return (
    body.includes(ACADEMY_FIVE_ACT_HEADINGS.warmup) &&
    body.includes(ACADEMY_FIVE_ACT_HEADINGS.problem) &&
    body.includes(ACADEMY_FIVE_ACT_HEADINGS.development) &&
    body.includes(ACADEMY_FIVE_ACT_HEADINGS.conclusion) &&
    body.includes(ACADEMY_FIVE_ACT_HEADINGS.assessment) &&
    body.includes("```" + ACADEMY_LESSON_EXERCISE_FENCE)
  );
}

export function academyLessonHasFourActInstructorPedagogy(body: string): boolean {
  return (
    body.includes(ACADEMY_FIVE_ACT_HEADINGS.warmup) &&
    body.includes(ACADEMY_FIVE_ACT_HEADINGS.problem) &&
    body.includes(ACADEMY_FIVE_ACT_HEADINGS.development) &&
    body.includes(ACADEMY_FIVE_ACT_HEADINGS.conclusion)
  );
}

export function academyLessonHasPedagogy(body: string): boolean {
  if (academyLessonHasFiveActPedagogy(body) || academyLessonHasFourActInstructorPedagogy(body)) {
    return true;
  }
  return (
    body.includes(ACADEMY_LESSON_ACT_HEADINGS.giris) &&
    body.includes(ACADEMY_LESSON_ACT_HEADINGS.syntax) &&
    body.includes(ACADEMY_LESSON_ACT_HEADINGS.mantik) &&
    body.includes(ACADEMY_LESSON_ACT_HEADINGS.uygulama) &&
    body.includes("```" + ACADEMY_LESSON_EXERCISE_FENCE)
  );
}

/** Ekran ve ses karşılaştırması — boşlukları tek boşluğa indirger. */
export function collapseAcademyLessonProse(text: string): string {
  return text.replace(/\s+/gu, " ").trim();
}

/** Görsel yuvalar iki düzyazı arasına düşsün diye tek paragraf cümleden ikiye ayrılır. */
function ensureTwoProseParagraphs(prose: string): string {
  const parts = prose
    .split(/\n\n+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.length >= 2) {
    return parts.join("\n\n");
  }
  const text = parts[0] ?? "";
  const sentences = text.split(/(?<=[.!?])\s+/u).filter((part) => part.length > 0);
  if (sentences.length < 2) {
    return text;
  }
  const mid = Math.max(1, Math.floor(sentences.length / 2));
  return [sentences.slice(0, mid).join(" "), sentences.slice(mid).join(" ")].join("\n\n");
}

/** TTS kısaltma genişletmesi — görsel metin değişmez; yalnızca spokenText. */
export function expandAcademySpokenAbbreviations(text: string): string {
  return normalizeAcronyms(
    text
      .replace(/\bY\s*\.\s*Z\s*\.?/giu, "Yapay Zekâ")
      .replace(/\bYZ\b/giu, "Yapay Zekâ")
      .replace(
        /(?<![.(])\bTCP\s*\/\s*IP\b(?!\s*\()/giu,
        "İletim Kontrol Protokolü / İnternet Protokolü (TCP/IP)",
      )
      .replace(
        /(?<![.(])\bOWASP\s+Top\s*10\b(?!\s*\()/giu,
        "Açık Web Uygulaması Güvenlik Projesi Top 10 (OWASP Top 10)",
      )
      .replace(
        /(?<![.(])\bCI\s*\/\s*CD\b(?!\s*\()/giu,
        "Sürekli Entegrasyon ve Sürekli Teslimat (CI/CD)",
      )
      .replace(
        /(?<![.(])\bISO\s*27001\b(?!\s*\()/giu,
        "Uluslararası Standardizasyon Örgütü iki bin yedi yüz bir (ISO 27001)",
      )
      .replace(
        /(?<![.(])\bDevSecOps\b(?!\s*\()/giu,
        "Geliştirme-Güvenlik-İşletme (DevSecOps)",
      )
      .replace(
        /\bApp Store Connect\b/giu,
        "Apple Uygulama Mağazası Bağlantısı (App Store Connect)",
      )
      .replace(
        /(?<![.(])\bApp Store\b(?!\s*\()/giu,
        "Apple Uygulama Mağazası (App Store)",
      )
      .replace(
        /(?<![.(])\bPlay Console\b(?!\s*\()/giu,
        "Google Play Konsolu (Play Console)",
      )
      .replace(
        /(?<![.(])\bPlay Store\b(?!\s*\()/giu,
        "Google Play Mağazası (Play Store)",
      )
      .replace(
        /(?<![.(])\bState Management\b(?!\s*\()/giu,
        "durum yönetimi (State Management)",
      )
      .replace(
        /(?<![.(])\bApp Bundle\b(?!\s*\()/giu,
        "Android Uygulama Paketi (App Bundle)",
      )
      .replace(
        /(?<![.(])\bNative\b(?!\s*\()/gu,
        "yerel platform (Native)",
      )
      .replace(
        /(?<![.(])\bApache\s+Kafka\b(?!\s*\()/giu,
        "Apache Kafka (dağıtık olay günlüğü)",
      )
      .replace(
        /(?<![.(])\bKafka\b(?!\s*\()/giu,
        "Apache Kafka (dağıtık olay günlüğü)",
      )
      .replace(/(?<![.(])\bER\b(?!\s*\()/gu, "Varlık İlişki Modeli (ER)")
      .replace(/(?<![.(])\bPK\b(?!\s*\()/gu, "birincil anahtar (PK)")
      .replace(/(?<![.(])\bFK\b(?!\s*\()/gu, "yabancı anahtar (FK)")
      .replace(/(?<![.(])\bCAP\b(?!\s*\()/gu, "Tutarlılık-Erişilebilirlik-Bölünme Toleransı (CAP)")
      .replace(/(?<![.(])\bWAL\b(?!\s*\()/gu, "öncelikli yazma günlüğü (WAL)")
      .replace(
        /(?<![.(])\bEXPLAIN\b(?!\s*\()/gu,
        "sorgu planı dökümü (EXPLAIN)",
      )
      .replace(
        /(?<![.(])\bEvent-Driven\b(?!\s*\()/giu,
        "olay güdümlü (Event-Driven)",
      )
      .replace(
        /(?<![.(])\bERC-721\b(?!\s*\()/giu,
        "Ethereum Yorum Talebi yedi yüz yirmi bir (ERC-721)",
      )
      .replace(
        /(?<![.(])\bERC-20\b(?!\s*\()/giu,
        "Ethereum Yorum Talebi yirmi (ERC-20)",
      )
      .replace(
        /(?<![.(])\bIERC20\b(?!\s*\()/giu,
        "Ethereum Yorum Talebi yirmi arayüzü (IERC20)",
      )
      .replace(
        /(?<![.(])\bSafeERC20\b(?!\s*\()/giu,
        "güvenli Ethereum Yorum Talebi yirmi sarmalayıcısı (SafeERC20)",
      )
      .replace(
        /\bERC\s+Standartlar[ıi]\b/giu,
        "Ethereum Yorum Talebi Standartları (ERC)",
      )
      .replace(
        /(?<![.(])\bERC\b(?!\s*\()/gu,
        "Ethereum Yorum Talebi Standartları (ERC)",
      )
      .replace(/(?<![.(])\bIndexing\b(?!\s*\()/giu, "dizinleme (Indexing)")
      .replace(
        /(?<![.(])\bQuery Tuning\b(?!\s*\()/giu,
        "sorgu ayarı (Query Tuning)",
      )
      .replace(
        /(?<![.(])\bDesign System\b(?!\s*\()/giu,
        "Tasarım Sistemi (Design System)",
      )
      .replace(
        /(?<![.(])\bUsability Testing\b(?!\s*\()/giu,
        "Kullanılabilirlik Testi (Usability Testing)",
      )
      .replace(
        /(?<![.(])\bWireframing\b(?!\s*\()/giu,
        "tel çerçeveleme (Wireframing)",
      )
      .replace(
        /(?<![.(])\bDev Mode\b(?!\s*\()/giu,
        "Geliştirici Kipi (Dev Mode)",
      )
      .replace(/(?<![.(])\bhandoff\b(?!\s*\()/giu, "el teslimi (handoff)")
      .replace(/(?<![.(])\ba11y\b(?!\s*\()/giu, "erişilebilirlik (a11y)")
      .replace(
        /(?<![.(])\bTailwind\b(?!\s*\()/gu,
        "Tailwind (yardımcı sınıf stil çerçevesi)",
      )
      .replace(
        /(?<![.(])\bReact\b(?!\s*\()/gu,
        "React (kullanıcı arayüzü kütüphanesi)",
      )
      .replace(
        /(?<![.(])\bNext\.js\b(?!\s*\()/giu,
        "Next.js (tam yığın çerçeve)",
      )
      .replace(
        /(?<![.(])\bApp Router\b(?!\s*\()/giu,
        "Uygulama Yönlendiricisi (App Router)",
      )
      .replace(
        /(?<![.(])\bServer Actions?\b(?!\s*\()/giu,
        "Sunucu Eylemi (Server Actions)",
      )
      .replace(
        /(?<![.(])\bDocker Compose\b(?!\s*\()/giu,
        "Docker Compose (çoklu konteyner planı)",
      )
      .replace(
        /(?<![.(])\bGitHub Actions\b(?!\s*\()/giu,
        "GitHub Actions (iş akışı bandı)",
      )
      .replace(
        /(?<![.(])\bRequirement Gathering\b(?!\s*\()/giu,
        "Gereksinim Toplama (Requirement Gathering)",
      )
      .replace(
        /(?<![.(])\bUser Story\b(?!\s*\()/giu,
        "Kullanıcı Hikayesi (User Story)",
      )
      .replace(
        /(?<![.(])\bA\s*\/\s*B\s*Testing\b(?!\s*\()/giu,
        "İkili Karşılaştırma Testi / AB Testi",
      )
      .replace(
        /(?<![.(])\bA\s*\/\s*B\b(?!\s*\()/giu,
        "İkili Karşılaştırma Testi / AB Testi",
      )
      .replace(
        /(?<![.(])\bJIRA\b(?!\s*\()(?!\s+iş takip)/gu,
        "JIRA (iş takip panosu)",
      )
      .replace(
        /(?<![.(])\bMeta Ads\b(?!\s*\()/giu,
        "Meta Reklamları (Meta Ads)",
      )
      .replace(
        /(?<![.(])\bGoogle Ads\b(?!\s*\()/giu,
        "Google Reklamları (Google Ads)",
      )
      .replace(
        /(?<![.(])\bYouTube Ads\b(?!\s*\()/giu,
        "YouTube Reklamları (YouTube Ads)",
      )
      .replace(
        /(?<![.(])\bMeta Pixel\b(?!\s*\()/giu,
        "Meta Piksel (Meta Pixel)",
      )
      .replace(
        /(?<![.(])\bEvents Manager\b(?!\s*\()/giu,
        "Olay Yöneticisi (Events Manager)",
      )
      .replace(
        /(?<![.(])\bQuality Score\b(?!\s*\()/giu,
        "Kalite Skoru (Quality Score)",
      )
      .replace(
        /(?<![.(])\bPerformance Max\b(?!\s*\()/giu,
        "Performans Maksimumu (Performance Max)",
      )
      .replace(
        /(?<![.(])\bCore Web Vitals\b(?!\s*\()/giu,
        "Temel Web Canlılıkları (Core Web Vitals)",
      )
      .replace(
        /(?<![.(])\bGrowth Pazarlama\b(?!\s*\()/giu,
        "Büyüme Pazarlaması (Growth)",
      )
      .replace(
        /(?<![.(])\bDisplay Kampanyaları\b(?!\s*\()/giu,
        "Görüntülü Kampanyalar (Display)",
      )
      .replace(
        /(?<![.(])\bgrowth loop\b(?!\s*\()/giu,
        "büyüme çarkı (growth loop)",
      )
      .replace(
        /(?<![.(])\bDropshipping\b(?!\s*\()/giu,
        "Doğrudan Sevkiyat / Stoksuz Satış (Dropshipping)",
      )
      .replace(
        /(?<![.(])\bFulfillment\b(?!\s*\()/giu,
        "Sipariş Karşılama ve Depo Operasyonu (Fulfillment)",
      )
      .replace(
        /(?<![.(])\bPower Query\b(?!\s*\()/giu,
        "Power Query (Veri Dönüştürme ve Yükleme İşlemi)",
      )
      .replace(
        /(?<![.(])\bPower BI\b(?!\s*\()/giu,
        "Power BI (İş Zekâsı)",
      )
      .replace(
        /(?<![.(])\bPivotTable\b(?!\s*\()/giu,
        "Özet Tablo (PivotTable)",
      )
      .replace(
        /(?<![.(])\bPivot\b(?!\s*\()/giu,
        "Özet Tablo (Pivot)",
      )
      .replace(
        /(?<![.(])\bApps?\s*Script\b(?!\s*\()/giu,
        "Uygulama Senaryosu (Apps Script)",
      )
      .replace(
        /(?<![.(])\bARRAYFORMULA\b(?!\s*\()/g,
        "dizi formülü (ARRAYFORMULA)",
      )
      .replace(
        /(?<![.(])\bQUERY\b(?!\s*\()/g,
        "sorgulama işlevi (QUERY)",
      )
      .replace(
        /(?<![.(])\bCapstone\b(?!\s*\()/giu,
        "Kapanış Çalışması (Capstone)",
      )
      .replace(
        /(?<![.(])\bEisenhower(?:\s+matrisi)?\b(?!\s+Öncelik)(?!\s*\()/giu,
        "Eisenhower Öncelik Matrisi",
      )
      .replace(
        /(?<![.(])\btimebox(?:ing)?\b(?!\s*\()/giu,
        "zaman kutusu (timeboxing)",
      )
      .replace(
        /(?<![.(])\bKişisel\s+OS\b(?!\s*\()/giu,
        "Kişisel İşletim Sistemi (OS)",
      )
      .replace(
        /(?<![.(])\bShorts\b(?!\s*\()/giu,
        "Kısa Dikey Video (Shorts)",
      )
      .replace(
        /(?<![.(])\bReels\b(?!\s*\()/giu,
        "Kısa Dikey Video (Reels)",
      )
      .replace(
        /(?<![.(])\bB-roll\b(?!\s*\()/giu,
        "destek görüntüsü (B-roll)",
      )
      .replace(
        /(?<![.(])\bthumbnail\b(?!\s*\()/giu,
        "küçük resim (thumbnail)",
      ),
  );
}

/**
 * TTS gümrüğü — sistem/prompt/sahne talimatlarını konuşulan metinden siler.
 * Anayasa / yönerge / SESLENDİRİLECEK sarmalayıcıları ses parametresine sızmaz.
 * Kısaltmalar `normalizeAcronyms` ile açılır (BEFORE TTS).
 */
export function cleanAcademySpokenTextForTts(text: string): string {
  let out = text.replace(/\r\n/g, "\n");
  // Eski sarmalayıcı sızıntısı: yönerge + "SESLENDİRİLECEK METİN:" öneki.
  const spokenMarker = /SESLENDİRİLECEK\s+METİN\s*:/iu;
  if (spokenMarker.test(out)) {
    out = out.split(spokenMarker).pop() ?? out;
  }
  out = out.replace(/【[^】]*】/gu, " ");
  out = out.replace(
    /\[[^\]]*(?:sistem|system|prompt|tts|geliştirici|developer|internal|TODO|FIXME|yönerge|talimat|anayasa)[^\]]*\]/giu,
    " ",
  );
  out = out.replace(
    /\b[\p{L}'’]+\s+yerine\s+[\p{L}'’\s]+?\s+(?:de|söyle|oku|hitap\s+et|seslen)\b[.!]*/giu,
    " ",
  );
  out = out.replace(/\(([^)]*)\)/gu, (full, inner) => {
    const folded = String(inner).toLocaleLowerCase("tr-TR");
    if (
      /\b(?:yerine|hitap|seslen|söyle|tts|prompt|sistem|geliştirici|talimat|yönerge|instruction|developer|internal|todo|fix|anayasa)\b/u.test(
        folded,
      ) ||
      /^(?:not|nb|dikkat|önemli|sistem|prompt|tts)\b/u.test(folded.trim()) ||
      /\b(?:yavaş|hızlı|yavaşça|nefes|durakla|pause|slow|fast)\s+(?:oku|konuş|seslendir)/u.test(folded) ||
      /\bde\b.*\b(?:hanım|bey)\b|\b(?:hanım|bey)\b.*\bde\b/u.test(folded)
    ) {
      return " ";
    }
    return full;
  });
  out = out.replace(/<\/?[A-Za-z][^>]*>/gu, " ");
  out = out.replace(/^\s*(?:Sistem|Prompt|TTS|Geliştirici|Developer|Anayasa)\s:[^\n]*/gimu, " ");
  out = out.replace(
    /Kullanıcıya ders anlatırken kesinlikle sadece harf kısaltması[\s\S]*?oku\./giu,
    " ",
  );
  out = expandAcademySpokenAbbreviations(out);
  return out.replace(/\s+/gu, " ").trim();
}

/**
 * Ekranda görünen düzyazı — başlık + gövde. Kod çiti boş (görsel blok).
 * Ses metni bu dizginin TTS gümrüğünden geçer; ek köprü / diyalog yok.
 */
export function displayAcademyLessonSegment(segment: AcademyLessonSegment): string {
  if (segment.kind === "text") {
    const parsed = parseAcademyLessonActText(segment.text);
    if (parsed.heading) {
      return collapseAcademyLessonProse(`${parsed.heading} ${parsed.body}`);
    }
    return collapseAcademyLessonProse(segment.text);
  }
  if (segment.kind === "steps") {
    return collapseAcademyLessonProse(
      segment.items.map((item, index) => `${index + 1}. ${item}`).join(" "),
    );
  }
  if (segment.kind === "params") {
    return collapseAcademyLessonProse(segment.rows.map((row) => `${row.label}: ${row.value}.`).join(" "));
  }
  if (segment.kind === "exercise") {
    return collapseAcademyLessonProse(segment.prompt);
  }
  return "";
}

/** TTS: tek segmentin konuşulan metni. Ekran metni ile birebir (gümrük sonrası). */
export function spokenAcademyLessonSegment(segment: AcademyLessonSegment): string {
  return cleanAcademySpokenTextForTts(displayAcademyLessonSegment(segment));
}

/** TTS: kod çiti düşer; adım ve parametre düz cümle olur. */
export function spokenAcademyLessonBody(body: string): string {
  const parts: string[] = [];
  for (const chunk of splitAcademyLessonChunks(body)) {
    const spoken = spokenAcademyLessonSegment(classifyAcademyLessonChunk(chunk));
    if (spoken) {
      parts.push(spoken);
    }
  }
  return parts.join(" ");
}

export function academyLessonHasPractice(body: string): boolean {
  const kinds = new Set(splitAcademyLessonChunks(body).map((chunk) => classifyAcademyLessonChunk(chunk).kind));
  return kinds.has("code") && kinds.has("steps") && kinds.has("params") && kinds.has("text");
}
