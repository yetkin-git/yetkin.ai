/**
 * EC-102 mühürlü konuşma gövdesini kırpmadan müfredat, spoken-script ve cue dosyalarına yazar.
 * Rapor ve prompt paketi seslendirilmez. Başlık satırı okunmaz; paragraf olduğu gibi kalır.
 *
 *   npx tsx scripts/ingest-ec102-spoken-bodies.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const MS_PER_WORD = 420;
const SPEECH_RATE = 0.93;
const CUE_GAP_SEC = 0.25;

const LESSONS = [
  { n: 1, file: "EC102_DERS1_MÜHÜRLÜ.md" },
  { n: 2, file: "EC102_DERS2_MÜHÜRLÜ.md" },
  { n: 3, file: "EC102_DERS3_MÜHÜRLÜ.md" },
  { n: 4, file: "EC102_DERS4_MÜHÜRLÜ.md" },
  { n: 5, file: "EC102_DERS5_MÜHÜRLÜ.md" },
  { n: 6, file: "EC102_DERS6_MÜHÜRLÜ.md" },
] as const;

type SpeechSection = {
  heading: string;
  paragraphs: string[];
};

type LessonPack = {
  n: number;
  key: string;
  title: string;
  speech: string;
  sections: SpeechSection[];
  wordCount: number;
  durationMin: number;
};

function extractTitle(raw: string): string {
  const match = raw.match(/\|\s*Başlık\s*\|\s*([^|\n]+)\|/u);
  const title = match?.[1]?.trim();
  if (!title) {
    throw new Error("Başlık satırı yok");
  }
  return title;
}

function extractSpeech(raw: string, file: string): string {
  const marker = "## Konuşma metni";
  const start = raw.indexOf(marker);
  if (start < 0) {
    throw new Error(`Konuşma metni yok: ${file}`);
  }
  const after = raw.slice(start + marker.length).replace(/^\r?\n/u, "");
  const end = after.search(/\r?\n---\r?\n/u);
  if (end < 0) {
    throw new Error(`Konuşma metni kapanışı yok: ${file}`);
  }
  return after.slice(0, end).replace(/\s+$/u, "");
}

function splitSections(speech: string, file: string): SpeechSection[] {
  const chunks = speech.split(/\r?\n(?=### )/u).filter((chunk) => chunk.trim().length > 0);
  const sections: SpeechSection[] = [];
  for (const chunk of chunks) {
    const lines = chunk.replace(/^\uFEFF/, "").split(/\r?\n/u);
    const headingLine = lines[0]?.replace(/^###\s+/u, "").trim() ?? "";
    if (!headingLine) {
      throw new Error(`Bölüm başlığı yok: ${file}`);
    }
    const body = lines.slice(1).join("\n").trim();
    const paragraphs = body
      .split(/\r?\n\s*\r?\n/u)
      .map((part) => part.replace(/\s*\r?\n\s*/gu, " ").trim())
      .filter((part) => part.length > 0);
    if (paragraphs.length === 0) {
      throw new Error(`Boş bölüm: ${file} / ${headingLine}`);
    }
    sections.push({ heading: headingLine, paragraphs });
  }
  if (sections.length === 0) {
    throw new Error(`Bölüm yok: ${file}`);
  }
  return sections;
}

function wordCount(text: string): number {
  return text.split(/\s+/u).filter((part) => part.length > 0).length;
}

function readingSec(text: string): number {
  const words = wordCount(text);
  if (words <= 0) {
    return 0;
  }
  return (words * MS_PER_WORD) / 1000 / SPEECH_RATE;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function punchcard(heading: string): string {
  return heading.split(/\s+/u).slice(0, 3).join(" ").toLocaleUpperCase("tr-TR");
}

function loadLesson(n: number, file: string): LessonPack {
  const raw = readFileSync(join(ROOT, "docs", file), "utf8");
  const title = extractTitle(raw);
  const speech = extractSpeech(raw, file);
  const sections = splitSections(speech, file);
  const spoken = sections.flatMap((section) => section.paragraphs).join(" ");
  let clock = 0;
  for (const section of sections) {
    const spokenSec = readingSec(section.paragraphs.join(" "));
    clock += spokenSec;
    clock += CUE_GAP_SEC;
  }
  const durationMin = Math.round((clock / 60) * 10) / 10;
  return {
    n,
    key: `02_ecommerce_ai-${n}`,
    title,
    speech,
    sections,
    wordCount: wordCount(spoken),
    durationMin,
  };
}

function tsString(value: string): string {
  return JSON.stringify(value);
}

function writeSpokenScript(lesson: LessonPack): void {
  const body = lesson.sections.flatMap((section) => section.paragraphs).join("\n\n");
  const path = join(ROOT, "lib", "academy", "spoken-scripts", `${lesson.key}.md`);
  writeFileSync(path, `${body}\n`, "utf8");
}

function writeCues(lesson: LessonPack): void {
  let cursor = 0;
  const cues = lesson.sections.map((section, index) => {
    const start = round3(cursor);
    const spokenSec = readingSec(section.paragraphs.join(" "));
    const end = round3(start + spokenSec);
    cursor = end + CUE_GAP_SEC;
    return {
      id: `cue-${String(index + 1).padStart(2, "0")}`,
      start,
      end,
      text: punchcard(section.heading),
      section: section.heading,
      paragraphs: section.paragraphs,
    };
  });
  const path = join(ROOT, "lib", "academy", "lesson-cues", `${lesson.key}.json`);
  writeFileSync(path, `${JSON.stringify(cues, null, 2)}\n`, "utf8");
}

function writeSectionsModule(lessons: readonly LessonPack[]): void {
  const blocks = lessons
    .map((lesson) => {
      const objective = `Bu derste ${lesson.title.charAt(0).toLocaleLowerCase("tr-TR")}${lesson.title.slice(1)} işlenir. Konuşma gövdesi mühür dosyasından kırpmadan alındı.`;
      return `export const section${lesson.n}: Section = {
  sectionNumber: ${lesson.n},
  lessonKey: ${tsString(lesson.key)},
  isPreviewAllowed: false,
  isLocked: true,
  title: ${tsString(lesson.title)},
  targetDurationMinutes: ${lesson.durationMin},
  estimatedWordCount: ${lesson.wordCount},
  pedagogicalObjective: ${tsString(objective)},
  contentMarkdown: ${tsString(lesson.speech)},
};`;
    })
    .join("\n\n");
  const path = join(ROOT, "lib", "academy", "curricula", "ecommerce_ai", "sections.ts");
  writeFileSync(
    path,
    `import type { Section } from "../types";

${blocks}
`,
    "utf8",
  );
}

function writeCinemaModule(lessons: readonly LessonPack[]): void {
  const entries = lessons
    .map((lesson) => {
      const cues = lesson.sections.map((section, index) => {
        const headline = punchcard(section.heading);
        return `    {
      cueIndex: ${index + 1},
      section: ${tsString(section.heading)},
      headline: ${tsString(headline)},
      subhead: ${tsString(lesson.title)},
      bullets: [${tsString(section.heading)}],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    }`;
      });
      return `  ${tsString(lesson.key)}: {
    title: ${tsString(lesson.title)},
    cues: [
${cues.join(",\n")}
    ],
  }`;
    })
    .join(",\n");
  const path = join(ROOT, "lib", "academy", "curricula", "ecommerce_ai", "cinema-slides.ts");
  mkdirSync(join(ROOT, "lib", "academy", "curricula", "ecommerce_ai"), { recursive: true });
  writeFileSync(
    path,
    `export type EcommerceCinemaCue = {
  cueIndex: number;
  section: string;
  headline: string;
  subhead: string;
  bullets: readonly string[];
  tools: readonly string[];
  layout: "listing";
};

export type EcommerceCinemaLesson = {
  title: string;
  cues: readonly EcommerceCinemaCue[];
};

/** EC-102 slayt iskeleti. Saat lesson-cues JSON'dadır. Konuşma gövdesi burada kısılmaz. */
export const ECOMMERCE_CINEMA_LESSONS: Record<string, EcommerceCinemaLesson> = {
${entries}
};
`,
    "utf8",
  );
}

function main(): void {
  const lessons = LESSONS.map((row) => loadLesson(row.n, row.file));
  writeSectionsModule(lessons);
  writeCinemaModule(lessons);
  for (const lesson of lessons) {
    writeSpokenScript(lesson);
    writeCues(lesson);
    const paragraphs = lesson.sections.reduce((sum, section) => sum + section.paragraphs.length, 0);
    process.stdout.write(
      `${lesson.key} bölüm=${lesson.sections.length} paragraf=${paragraphs} kelime=${lesson.wordCount} dk=${lesson.durationMin} başlık=${lesson.title}\n`,
    );
  }
}

main();
