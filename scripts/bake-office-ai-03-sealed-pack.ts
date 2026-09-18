#!/usr/bin/env tsx
/**
 * 01_office_ai bölüm 3 — Google AI Studio mühür paketi.
 * Metin uydurulmaz. Gemini 3.8 Flash + (ayrı) Gemini 3.1 Flash TTS Callirrhoe.
 *
 *   npx tsx scripts/bake-office-ai-03-sealed-pack.ts --confirm-gemini-spend --dry-run
 *   npx tsx scripts/bake-office-ai-03-sealed-pack.ts --confirm-gemini-spend --skip-tts
 *   npx tsx scripts/bake-office-ai-03-sealed-pack.ts --confirm-gemini-spend
 */
import "./load-academy-bake-env";

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";

const ROOT = process.cwd();
const SCRIPT_MODEL = "gemini-3.8-flash";
const MIN_GEMINI_KEY_CHARS = 8;
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "ŞABLON KAOSU",
  "SLAYT İSTE",
  "HİYERARŞİ",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;
const CUE_GROUPS: readonly { badge: (typeof PUNCHCARDS)[number]; count: number }[] = [
  { badge: "GİRİŞ KÖPRÜSÜ", count: 1 },
  { badge: "HOŞ GELDİN", count: 2 },
  { badge: "ŞABLON KAOSU", count: 2 },
  { badge: "SLAYT İSTE", count: 2 },
  { badge: "HİYERARŞİ", count: 2 },
  { badge: "FARK ORTADA", count: 2 },
  { badge: "CEBİNE KOY", count: 1 },
  { badge: "SIRA SENDE", count: 2 },
];
const BEAT_IDS = ["warmup", "command", "comparison", "task"] as const;
const BEAT_LABELS = {
  warmup: "Warm-up",
  command: "Command",
  comparison: "Comparison",
  task: "Task",
} as const;
const BEAT_PARAGRAPH_COUNTS = {
  warmup: 4,
  command: 3,
  comparison: 3,
  task: 4,
} as const;
const BADGE_SEQUENCE = CUE_GROUPS.flatMap((group) => Array.from({ length: group.count }, () => group.badge));
const TOTAL_PARAGRAPHS = BADGE_SEQUENCE.length;
const LESSON_KEY = "01_office_ai-3";
const COURSE_SLUG = "01_office_ai";

type ScriptParagraph = {
  badge: string;
  text: string;
};

type ScriptBeat = {
  id: (typeof BEAT_IDS)[number];
  label: string;
  paragraphs: ScriptParagraph[];
};

type ScriptPayload = {
  title: string;
  beats: ScriptBeat[];
};

type ExamQuestion = {
  id: string;
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

type ExamPayload = {
  lessonKey: string;
  passScore: 70;
  questions: ExamQuestion[];
};

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  text?: string;
  candidates?: Array<{
    content?: { parts?: Array<GeminiPart | null> } | null;
  } | null>;
};

function parseArgs(argv: readonly string[]): {
  confirm: boolean;
  skipTts: boolean;
  skipExam: boolean;
  dryRun: boolean;
} {
  const dryRun = argv.includes("--dry-run");
  return {
    confirm: argv.includes("--confirm-gemini-spend"),
    skipTts: argv.includes("--skip-tts") || dryRun,
    skipExam: argv.includes("--skip-exam"),
    dryRun,
  };
}

function sanitizeGeminiApiKey(raw: string | undefined | null): string | null {
  if (raw == null) {
    return null;
  }
  let value = raw.replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
  const quote = value[0];
  if (
    (quote === '"' || quote === "'" || quote === "`") &&
    value.length >= 2 &&
    value.endsWith(quote)
  ) {
    value = value.slice(1, -1).replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
  }
  return value.length > MIN_GEMINI_KEY_CHARS ? value : null;
}

function wordCount(text: string): number {
  return text
    .replace(/\s+/gu, " ")
    .trim()
    .split(" ")
    .filter((part) => part.length > 0).length;
}

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/u);
  const body = fenced?.[1]?.trim() ?? trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("Gemini JSON nesnesi yok.");
  }
  return JSON.parse(body.slice(start, end + 1));
}

function collectText(response: GeminiResponse): string {
  if (typeof response.text === "string" && response.text.trim()) {
    return response.text;
  }
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => (part && typeof part.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
}

function assertBadge(raw: string, expected: string): string {
  const folded = raw
    .replace(/\[ROZET:\s*/iu, "")
    .replace(/\]/u, "")
    .replace(/\s+/gu, " ")
    .trim()
    .toLocaleUpperCase("tr-TR");
  if (folded !== expected) {
    throw new Error(`Rozet uyuşmadı: beklenen ${expected}, gelen ${raw}`);
  }
  return expected;
}

function normalizeParagraphText(raw: string): string {
  return raw
    .replace(/\[ROZET:\s*[^\]]+\]/giu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function parseScriptPayload(raw: unknown): ScriptPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("Senaryo JSON nesne değil.");
  }
  const rec = raw as Record<string, unknown>;
  const title = typeof rec.title === "string" ? rec.title.trim() : "";
  if (!/sunum|slayt/iu.test(title)) {
    throw new Error("Senaryo başlığı sunum / slayt taşımalı.");
  }
  if (!Array.isArray(rec.beats) || rec.beats.length !== 4) {
    throw new Error("Senaryo tam 4 beat ister.");
  }
  const beats: ScriptBeat[] = [];
  let paragraphIndex = 0;
  for (let beatIndex = 0; beatIndex < 4; beatIndex += 1) {
    const row = rec.beats[beatIndex];
    if (!row || typeof row !== "object") {
      throw new Error(`Beat ${beatIndex} geçersiz.`);
    }
    const beatRec = row as Record<string, unknown>;
    const id = BEAT_IDS[beatIndex]!;
    if (beatRec.id !== id) {
      throw new Error(`Beat id ${id} beklenirdi, ${String(beatRec.id)} geldi.`);
    }
    const expectedCount = BEAT_PARAGRAPH_COUNTS[id];
    if (!Array.isArray(beatRec.paragraphs) || beatRec.paragraphs.length !== expectedCount) {
      throw new Error(`Beat ${id} tam ${expectedCount} paragraf ister.`);
    }
    const paragraphs: ScriptParagraph[] = [];
    for (const item of beatRec.paragraphs) {
      if (!item || typeof item !== "object") {
        throw new Error("Paragraf nesnesi yok.");
      }
      const para = item as Record<string, unknown>;
      const expectedBadge = BADGE_SEQUENCE[paragraphIndex];
      if (!expectedBadge) {
        throw new Error(`Paragraf ${paragraphIndex + 1} için rozet yok.`);
      }
      const badge = assertBadge(String(para.badge ?? ""), expectedBadge);
      const text = normalizeParagraphText(String(para.text ?? ""));
      const words = wordCount(text);
      const [minWords, maxWords] =
        badge === "GİRİŞ KÖPRÜSÜ" ? [70, 105] : badge === "CEBİNE KOY" ? [80, 130] : [48, 100];
      if (words < minWords || words > maxWords) {
        throw new Error(`Paragraf ${paragraphIndex + 1} (${badge}) kelime ${words} (${minWords}–${maxWords}).`);
      }
      paragraphs.push({ badge, text });
      paragraphIndex += 1;
    }
    beats.push({
      id,
      label: BEAT_LABELS[id],
      paragraphs,
    });
  }
  if (paragraphIndex !== TOTAL_PARAGRAPHS) {
    throw new Error(`${TOTAL_PARAGRAPHS} paragraf beklenirdi, ${paragraphIndex} geldi.`);
  }
  const welcome = beats[0]?.paragraphs[1]?.text ?? "";
  const pocket = beats[3]?.paragraphs.find((paragraph) => paragraph.badge === "CEBİNE KOY")?.text ?? "";
  const bridge = beats[0]?.paragraphs[0]?.text ?? "";
  const warmup = beats[0]?.paragraphs.map((paragraph) => paragraph.text).join(" ") ?? "";
  const command = beats[1]?.paragraphs.map((paragraph) => paragraph.text).join(" ") ?? "";
  const comparison = beats[2]?.paragraphs.map((paragraph) => paragraph.text).join(" ") ?? "";
  const last = beats[3]?.paragraphs.at(-1)?.text ?? "";
  const prose = beats
    .flatMap((beat) => beat.paragraphs.map((paragraph) => paragraph.text))
    .join(" ");
  if (!/^Selamlar, ben Gözde/u.test(welcome)) {
    throw new Error("Warm-up ilk HOŞ GELDİN paragrafı 'Selamlar, ben Gözde' ile başlamalı.");
  }
  if (!/yönetici özeti|yönetim özeti/iu.test(bridge) || !/rapor/iu.test(bridge)) {
    throw new Error("GİRİŞ KÖPRÜSÜ 2. ders rapor otomasyonu / yönetici özeti kazanımını pekiştirmeli.");
  }
  if (!/şablon/iu.test(warmup) || !/slayt/iu.test(warmup)) {
    throw new Error("Warm-up boş slayt / şablon arama stresini taşımalı.");
  }
  if (!/slayt tasla/iu.test(command) || !/(?:Copilot|pptx|ataş)/iu.test(command)) {
    throw new Error("Command beat slayt taslağı ve PowerPoint Copilot / pptx ataş yöntemini istemeli.");
  }
  if (!/Sunum Fabrikası|slayt/iu.test(prose)) {
    throw new Error("Senaryo sunum / slayt taşımalı.");
  }
  if (!/E-Posta Akışı/u.test(last) || !/Gelen Kutusu Sıfırlama/u.test(last) || !/4\. bölüm|dördüncü bölüm/iu.test(last)) {
    throw new Error("Gelecek Ders Köprüsü L4 E-Posta Akışı / Gelen Kutusu Sıfırlama / 4. bölüm taşımalı.");
  }
  if (/kirli/iu.test(prose)) {
    throw new Error("Vatandaş metninde «kirli» yok; Düzensiz Tablo veya Ham Veri kullan.");
  }
  if (!/düz metin/iu.test(comparison) || !/hiyerarşi/iu.test(comparison)) {
    throw new Error("Beat 3 split-screen sol düz metin yığını, sağ görsel hiyerarşili slayt anlatmalı.");
  }
  if (!/tek fikir/iu.test(pocket)) {
    throw new Error("CEBİNE KOY 1. adım slayt başına tek fikir vermeli.");
  }
  if (!/görsel yönlendir/iu.test(pocket)) {
    throw new Error("CEBİNE KOY 2. adım görsel yönlendirmeyi yazmalı.");
  }
  if (!/taslak/iu.test(pocket)) {
    throw new Error("CEBİNE KOY 3. adım taslağı aktarmalı.");
  }
  const hasNumberedSteps = /1\./u.test(pocket) && /2\./u.test(pocket) && /3\./u.test(pocket);
  const hasSpokenSteps = /birinci/iu.test(pocket) && /ikinci/iu.test(pocket) && /üçüncü/iu.test(pocket);
  if (!hasNumberedSteps && !hasSpokenSteps) {
    throw new Error("CEBİNE KOY özeti 3 somut adımı tane tane tekrarlamalı.");
  }
  return { title, beats };
}

function flattenParagraphs(script: ScriptPayload): ScriptParagraph[] {
  const out: ScriptParagraph[] = [];
  for (const beat of script.beats) {
    out.push(...beat.paragraphs);
  }
  return out;
}

function parseExamPayload(raw: unknown): ExamPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("Sınav JSON nesne değil.");
  }
  const rec = raw as Record<string, unknown>;
  if (rec.passScore !== 70) {
    throw new Error("Sınav barajı 70 olmalı.");
  }
  if (!Array.isArray(rec.questions) || rec.questions.length !== 3) {
    throw new Error("Mini sınav tam 3 soru ister.");
  }
  const questions: ExamQuestion[] = rec.questions.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Soru ${index} geçersiz.`);
    }
    const row = item as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id.trim() : "";
    const prompt = typeof row.prompt === "string" ? row.prompt.trim() : "";
    if (!id || !prompt) {
      throw new Error(`Soru ${index} id/prompt eksik.`);
    }
    if (!Array.isArray(row.choices) || row.choices.length !== 4) {
      throw new Error(`Soru ${id} tam 4 şık ister.`);
    }
    const choices = row.choices.map((choice) => String(choice).trim()) as [
      string,
      string,
      string,
      string,
    ];
    const correctIndex = row.correctIndex;
    if (correctIndex !== 0 && correctIndex !== 1 && correctIndex !== 2 && correctIndex !== 3) {
      throw new Error(`Soru ${id} doğru şık indeksi geçersiz.`);
    }
    return { id, prompt, choices, correctIndex };
  });
  return {
    lessonKey: LESSON_KEY,
    passScore: 70,
    questions,
  };
}

function renderCurriculumMarkdown(script: ScriptPayload): string {
  const lines: string[] = [
    `# ${script.title}`,
    "",
    "Eğitmen: Gözde (Callirrhoe). 4-beat reji + pekiştirme durakları (GİRİŞ KÖPRÜSÜ, CEBİNE KOY). SEN dili. Punchcard rozetleri paragraf sonunda.",
    "",
  ];
  for (const beat of script.beats) {
    lines.push(`## ${beat.label}`);
    lines.push("");
    for (const paragraph of beat.paragraphs) {
      lines.push(`${paragraph.text} [ROZET: ${paragraph.badge}]`);
      lines.push("");
    }
  }
  return `${lines.join("\n").trim()}\n`;
}

function renderSpokenScriptMarkdown(paragraphs: readonly ScriptParagraph[]): string {
  const body = paragraphs.map((paragraph) => paragraph.text).join("\n\n");
  return `<!--
  ${LESSON_KEY} — konuşma metni
  Ses: Gözde / Callirrhoe. Kod çiti yok. SEN aksı.
  Punchcard: ${PUNCHCARDS.join(" · ")}
-->

${body}
`;
}

function renderCuesJson(paragraphs: readonly ScriptParagraph[]): unknown {
  const cues = [];
  let cursor = 0;
  let paragraphCursor = 0;
  for (let index = 0; index < CUE_GROUPS.length; index += 1) {
    const group = CUE_GROUPS[index]!;
    const texts = paragraphs.slice(paragraphCursor, paragraphCursor + group.count).map((row) => row.text);
    if (texts.length !== group.count) {
      throw new Error(`Cue ${group.badge} paragraf eksiği.`);
    }
    const words = texts.reduce((sum, text) => sum + wordCount(text), 0);
    const duration = Math.max(28, Math.round((words / 140) * 60 * 10) / 10);
    const start = index === 0 ? 2 : cursor;
    const end = Math.round((cursor + duration) * 10) / 10;
    cues.push({
      id: `cue-0${index + 1}`,
      start,
      end,
      text: group.badge,
      section: group.badge,
      paragraphs: texts,
    });
    cursor = Math.round((end + 0.4) * 10) / 10;
    paragraphCursor += group.count;
  }
  return cues;
}

function renderSectionMarkdown(script: ScriptPayload, _exam: ExamPayload): string {
  const lines: string[] = [""];
  let lastHeading = "";
  for (const beat of script.beats) {
    for (const paragraph of beat.paragraphs) {
      const skipHeading = paragraph.badge === "GİRİŞ KÖPRÜSÜ" || paragraph.badge === "HOŞ GELDİN";
      if (!skipHeading && paragraph.badge !== lastHeading) {
        lines.push(`## ${paragraph.badge}`);
        lines.push("");
        lastHeading = paragraph.badge;
      } else if (skipHeading) {
        lastHeading = paragraph.badge;
      }
      lines.push(paragraph.text);
      lines.push("");
    }
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

function writeUtf8(relativePath: string, body: string): void {
  const diskPath = join(ROOT, relativePath);
  mkdirSync(dirname(diskPath), { recursive: true });
  writeFileSync(diskPath, body, "utf8");
  process.stdout.write(`yazıldı ${relativePath}\n`);
}

function writeSection3(script: ScriptPayload, exam: ExamPayload): void {
  const markdown = renderSectionMarkdown(script, exam);
  const words = wordCount(markdown);
  const minutes = Math.round((words / 140) * 10) / 10;
  const source = `import type { Section } from "../types";

export const section3: Section = {
  sectionNumber: 3,
  title: ${JSON.stringify(script.title)},
  targetDurationMinutes: ${Math.max(7, Math.min(10.5, minutes))},
  estimatedWordCount: ${words},
  pedagogicalObjective: "Metinden slayt başına tek fikir, görsel yönlendirme ve taslak aktarma akışını göstermek.",
  contentMarkdown: ${JSON.stringify(`\n${markdown}`)},
};
`;
  writeUtf8("lib/academy/curricula/office_ai/section_3.ts", source);
}

async function generateJson(client: GoogleGenAI, prompt: string): Promise<unknown> {
  const response = (await client.models.generateContent({
    model: SCRIPT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 16_384,
    },
  })) as GeminiResponse;
  const text = collectText(response);
  if (!text) {
    throw new Error("Gemini boş metin döndü.");
  }
  return extractJsonObject(text);
}

const SCRIPT_PROMPT = `Sen yetkin.ai akademisinin yazar fırınısın (Gemini 3.8 Flash). İş Hayatında ve Ofiste Yapay Zekâ dersinin 3. bölümü (Sunum Fabrikası) için konuşma senaryosu yaz.

ZORUNLU JSON ŞEMASI:
{
  "title": "Sunum Fabrikası: Metinden Slayta",
  "beats": [
    {
      "id": "warmup",
      "label": "Warm-up",
      "paragraphs": [
        { "badge": "GİRİŞ KÖPRÜSÜ", "text": "..." },
        { "badge": "HOŞ GELDİN", "text": "..." },
        { "badge": "HOŞ GELDİN", "text": "..." },
        { "badge": "ŞABLON KAOSU", "text": "..." }
      ]
    },
    {
      "id": "command",
      "label": "Command",
      "paragraphs": [
        { "badge": "ŞABLON KAOSU", "text": "..." },
        { "badge": "SLAYT İSTE", "text": "..." },
        { "badge": "SLAYT İSTE", "text": "..." }
      ]
    },
    {
      "id": "comparison",
      "label": "Comparison",
      "paragraphs": [
        { "badge": "HİYERARŞİ", "text": "..." },
        { "badge": "HİYERARŞİ", "text": "..." },
        { "badge": "FARK ORTADA", "text": "..." }
      ]
    },
    {
      "id": "task",
      "label": "Task",
      "paragraphs": [
        { "badge": "FARK ORTADA", "text": "..." },
        { "badge": "CEBİNE KOY", "text": "..." },
        { "badge": "SIRA SENDE", "text": "..." },
        { "badge": "SIRA SENDE", "text": "..." }
      ]
    }
  ]
}

KURALLAR:
- Tam 4 beat, sıra: warmup → command → comparison → task.
- Tam 14 paragraf. Rozet sırası birebir: GİRİŞ KÖPRÜSÜ, HOŞ GELDİN, HOŞ GELDİN, ŞABLON KAOSU, ŞABLON KAOSU, SLAYT İSTE, SLAYT İSTE, HİYERARŞİ, HİYERARŞİ, FARK ORTADA, FARK ORTADA, CEBİNE KOY, SIRA SENDE, SIRA SENDE.
- Pekiştirme durakları:
  * GİRİŞ KÖPRÜSÜ (Warm-up öncesi, ~40 sn, 70–105 kelime): 2. dersteki rapor otomasyonu ve yönetici özeti refleksini hatırlat/bağla. Üç madde ve karar notu. Henüz «Selamlar» deme. Mutlaka «yönetici özeti» veya «yönetim özeti» ve «rapor» geçsin.
  * CEBİNE KOY (Task öncesi, ~45 sn, 80–130 kelime, hedef 105): Derste öğrenilen 3 somut adımı tane tane tekrarla. Adımları «1.» «2.» «3.» diye say. 1) Slayt başına tek fikir ver. 2) Görsel yönlendirmeyi yaz. 3) Taslağı aktar. Her adımı bir cümleyle açıkla. Bu üç ifadeyi kelime olarak kullan: «tek fikir», «görsel yönlendirme», «taslak».
- 4-beat reji:
  * Warm-up: Sıfırdan slayt hazırlama stresi ve şablon arama karmaşası. Mutlaka «şablon» ve «slayt» geçsin.
  * Command: Metin tabanlı içerikten yapay zekâ ile slayt taslağı iste. SLAYT İSTE paragraflarında mutlaka «slayt taslağı» ve 1. Kapı PowerPoint Copilot veya 2. Kapı pptx ataş geçsin. VBA, Gamma, Marp zorunlu değildir; ana yol değillerse tek cümle yeter. Spoiler yasağı: biten sunumun ekranda açık olduğunu söyleme; sonucu Beat 3’e kadar açıklama. «tek fikir» ifadesi Command’da da geçebilir.
  * Comparison: Dikey split-screen. Sol «ÖNCE (DÜZ METİN YIĞINI)», sağ «SONRA (GÖRSEL HİYERARŞİLİ SLAYT - AI)». FARK ORTADA ve HİYERARŞİ paragraflarında «düz metin» ve «hiyerarşi» geçsin.
  * Task: Kendi metnini tek tıkla slayt yapısına dönüştürme saha görevi.
- Gelecek Ders Köprüsü: Son SIRA SENDE paragrafı L4’e tatlı geçiş yapsın. Mutlaka «E-Posta Akışı», «Gelen Kutusu Sıfırlama» ve «4. bölüm» geçsin. Gelen kutusunu sıfırlayacağını söyle. «Üçüncü adımı tamamladın, görüşmek üzere» YAZMA.
- Diğer paragraflar 48–100 Türkçe kelime. Üretmeden önce her paragrafı kelime kelime say. Toplam ~900–1150 kelime.
- SEN dili. Anlatıcı Gözde. İkinci paragraf (ilk HOŞ GELDİN) TAM OLARAK "Selamlar, ben Gözde" ile başlar.
- Kod yok. VBA/Gamma/Marp zorunlu değildir; 1. Kapı PowerPoint Copilot, 2. Kapı pptx ataş. Vatandaşa «Kirli» deme; «Düzensiz Tablo», «Ham Veri» veya «Dağınık Yapı» kullan. «kirli» kelimesi hiç geçmesin.
- badge alanı en fazla 3 kelime, yukarıdaki büyük harfli etiketler. Başka rozet yok.
- Yalnız JSON döndür.`;

const EXAM_PROMPT = `Sen yetkin.ai akademi sınav yazarısın (Gemini 3.8 Flash). 01_office_ai 3. bölüm (metinden slayt taslağı: slayt başına tek fikir, görsel yönlendirme, taslağı aktarma) için ezberci olmayan 3 soruluk mini sınav yaz.

ZORUNLU JSON:
{
  "lessonKey": "01_office_ai-3",
  "passScore": 70,
  "questions": [
    {
      "id": "q_off_l3_1",
      "prompt": "...",
      "choices": ["...", "...", "...", "..."],
      "correctIndex": 0
    },
    {
      "id": "q_off_l3_2",
      "prompt": "...",
      "choices": ["...", "...", "...", "..."],
      "correctIndex": 1
    },
    {
      "id": "q_off_l3_3",
      "prompt": "...",
      "choices": ["...", "...", "...", "..."],
      "correctIndex": 2
    }
  ]
}

KURALLAR:
- Tam 3 soru, her biri tam 4 şık. correctIndex 0–3 tamsayı.
- Baraj 70. Ezber tanım yok; iş sahnesi (yönetim sunumu yarım saat sonra, düz metin yığını, slayt başına tek fikir, görsel yönlendirme kutusu, taslağı PowerPoint’e aktarma, tüm metni tek slayta yapıştırmama). «Kirli» kelimesi yok. E-posta bu dersin konusu değil.
- id değerleri birebir: q_off_l3_1, q_off_l3_2, q_off_l3_3.
- Türkçe, SEN'e hitap etmeyen tarafsız sınav dili.
- Yalnız JSON döndür.`;

function runTtsBake(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        join(ROOT, "node_modules", "tsx", "dist", "cli.mjs"),
        join(ROOT, "scripts", "generate-academy-lesson-audio.ts"),
        "--seal",
        "--confirm-gemini-spend",
        "--force",
        "--no-db",
        `--slug=${COURSE_SLUG}`,
        `--key=${LESSON_KEY}`,
      ],
      { cwd: ROOT, stdio: "inherit", env: process.env },
    );
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`TTS bake çıkış ${code ?? "null"}`));
    });
  });
}

async function copySealedAudioAlias(): Promise<void> {
  const { copyFileSync, existsSync } = await import("node:fs");
  const src = join(ROOT, "public", "media", "academy", "audio", COURSE_SLUG, `${LESSON_KEY}.mp3`);
  const dest = join(ROOT, "media-bake", "01_office_ai_03_audio.mp3");
  if (!existsSync(src)) {
    throw new Error(`Yayın MP3 yok: ${src}`);
  }
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  process.stdout.write("yazıldı media-bake/01_office_ai_03_audio.mp3\n");
}

async function overlayCueTimesFromTimings(): Promise<void> {
  const { readFileSync } = await import("node:fs");
  const cuePath = join(ROOT, "lib", "academy", "lesson-cues", `${LESSON_KEY}.json`);
  const timingsPath = join(ROOT, "lib", "academy", "lesson-audio-timings", `${LESSON_KEY}.json`);
  const cues = JSON.parse(readFileSync(cuePath, "utf8")) as Array<Record<string, unknown>>;
  const timings = JSON.parse(readFileSync(timingsPath, "utf8")) as {
    pieces?: Array<{ cueId: string; start: number; end: number }>;
    durationSec?: number;
  };
  const pieces = timings.pieces ?? [];
  for (const cue of cues) {
    const group = pieces.filter((piece) => piece.cueId === cue.id);
    if (group.length === 0) {
      continue;
    }
    cue.start = group[0]!.start;
    cue.end = group[group.length - 1]!.end;
  }
  writeUtf8(
    "lib/academy/lesson-cues/01_office_ai-3.json",
    `${JSON.stringify(cues, null, 2)}\n`,
  );
  writeUtf8(
    "docs/curriculum/01_office_ai_03_cue.json",
    `${JSON.stringify(
      {
        lessonKey: LESSON_KEY,
        model: "gemini-3.1-flash-tts-preview",
        voice: "Callirrhoe",
        durationSec: timings.durationSec ?? null,
        cues,
        pieces,
      },
      null,
      2,
    )}\n`,
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (!args.confirm) {
    throw new Error("--confirm-gemini-spend gerekli (Google AI Studio harcaması).");
  }
  const apiKey = sanitizeGeminiApiKey(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY yok.");
  }
  const client = new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 180_000,
      retryOptions: { attempts: 1, httpStatusCodes: [] as number[] },
    },
  });

  process.stdout.write(`1/3 senaryo ${SCRIPT_MODEL}\n`);
  let script: ScriptPayload | null = null;
  let lastScriptError = "";
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      script = parseScriptPayload(await generateJson(client, SCRIPT_PROMPT));
      break;
    } catch (error) {
      lastScriptError = error instanceof Error ? error.message : String(error);
      process.stdout.write(`  senaryo deneme ${attempt}/8: ${lastScriptError}\n`);
    }
  }
  if (!script) {
    throw new Error(`Senaryo mühürlenemedi: ${lastScriptError}`);
  }
  const paragraphs = flattenParagraphs(script);
  writeUtf8("docs/curriculum/01_office_ai_03_script.md", renderCurriculumMarkdown(script));
  writeUtf8(
    "lib/academy/spoken-scripts/01_office_ai-3.md",
    renderSpokenScriptMarkdown(paragraphs),
  );
  const cues = renderCuesJson(paragraphs);
  writeUtf8(
    "lib/academy/lesson-cues/01_office_ai-3.json",
    `${JSON.stringify(cues, null, 2)}\n`,
  );
  writeUtf8(
    "docs/curriculum/01_office_ai_03_cue.json",
    `${JSON.stringify({ lessonKey: LESSON_KEY, cues }, null, 2)}\n`,
  );

  process.stdout.write(`2/3 sınav ${SCRIPT_MODEL}\n`);
  let exam: ExamPayload;
  if (args.skipExam) {
    const { readFileSync } = await import("node:fs");
    exam = parseExamPayload(
      JSON.parse(readFileSync(join(ROOT, "docs", "curriculum", "01_office_ai_03_exam.json"), "utf8")),
    );
    process.stdout.write("sınav atlandı (--skip-exam); mevcut mini sınav durur.\n");
  } else {
    exam = parseExamPayload(await generateJson(client, EXAM_PROMPT));
    writeUtf8(
      "docs/curriculum/01_office_ai_03_exam.json",
      `${JSON.stringify(exam, null, 2)}\n`,
    );
    writeUtf8(
      "lib/academy/lesson-exams/01_office_ai-3.json",
      `${JSON.stringify(exam, null, 2)}\n`,
    );
  }
  writeSection3(script, exam);

  if (args.skipTts) {
    process.stdout.write(
      args.dryRun
        ? "TTS atlandı (--dry-run). Senaryo ve cue yazıldı; mühür yok.\n"
        : "TTS atlandı (--skip-tts). Metin mühürlü.\n",
    );
    return;
  }
  process.stdout.write("3/3 TTS gemini-3.1-flash-tts-preview Callirrhoe\n");
  await runTtsBake();
  await copySealedAudioAlias();
  await overlayCueTimesFromTimings();
  process.stdout.write("01_office_ai bölüm 3 mühür paketi tamam.\n");
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
