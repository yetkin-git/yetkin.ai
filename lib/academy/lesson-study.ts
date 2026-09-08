/**
 * Oynatıcı gövdesi — soğuk şablon başlıkları düşürür; özet / prompt / saha görevi ayırır.
 * PEDAGOJI B.4: TANIŞMA, GİRİŞ, BÖLÜM 1 seslendirilmez ve DOM'a basılmaz.
 */

export type LessonStudyFence = {
  language: string;
  content: string;
};

export type LessonStudyPack = {
  summaryMarkdown: string;
  prompts: LessonStudyFence[];
  formulas: LessonStudyFence[];
  fieldTask: string | null;
  highlightsMarkdown: string;
};

const COLD_DERS_ICERIGI = /^DERS\s+İÇERİĞ[İI]$/u;
const COLD_TANISMA = /^(?:\d+\.\s*)?TANIŞMA\b/u;
const COLD_BARE_GIRIS = /^(?:\d+\.\s*)?GİRİŞ\s*:?\s*$/u;
const COLD_GIRIS_PREFIX = /^(?:\d+\.\s*)?GİRİŞ\s*:/u;
const COLD_BARE_BOLUM = /^BÖLÜM\s+\d+\s*:?\s*$/u;
const COLD_BOLUM_PREFIX = /^BÖLÜM\s+\d+\s*:/u;

function headingPlainText(text: string): string {
  return text.replace(/[*_`#]/g, " ").replace(/\s+/g, " ").trim();
}

function headingUpper(text: string): string {
  return headingPlainText(text).toLocaleUpperCase("tr-TR");
}

/** DOM'da asla basılmayan çıplak şablon (TANIŞMA, DERS İÇERİĞİ, boş GİRİŞ / BÖLÜM N). */
export function isAcademyColdTemplateHeading(text: string): boolean {
  const upper = headingUpper(text);
  if (!upper) {
    return false;
  }
  return (
    COLD_DERS_ICERIGI.test(upper) ||
    COLD_TANISMA.test(upper) ||
    COLD_BARE_GIRIS.test(upper) ||
    COLD_BARE_BOLUM.test(upper)
  );
}

/** Metnin tepesinden düşürülecek şablon — GİRİŞ: konu ve BÖLÜM N: de dahil. */
export function isAcademyLeadingColdHeading(text: string): boolean {
  if (isAcademyColdTemplateHeading(text)) {
    return true;
  }
  const upper = headingUpper(text);
  return COLD_GIRIS_PREFIX.test(upper) || COLD_BOLUM_PREFIX.test(upper);
}

function isBlankOrRule(line: string): boolean {
  const trimmed = line.trim();
  return !trimmed || /^(?:---|\*\*\*|___)\s*$/.test(trimmed);
}

/** Markdown'ın tepesindeki soğuk şablon başlıklarını (ve ardışık ayırıcıları) siler. */
export function stripAcademyColdTemplateHeadings(raw: string): string {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  const skipBlankOrRule = () => {
    while (i < lines.length && isBlankOrRule(lines[i]!)) {
      i += 1;
    }
  };

  skipBlankOrRule();
  while (i < lines.length) {
    const trimmed = lines[i]!.trim();
    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    const candidate = heading ? heading[2]!.trim() : trimmed;
    if (isAcademyLeadingColdHeading(candidate)) {
      i += 1;
      skipBlankOrRule();
      continue;
    }
    break;
  }

  return lines.slice(i).join("\n").replace(/^\n+/, "");
}

function extractFences(markdown: string): LessonStudyFence[] {
  const fences: LessonStudyFence[] = [];
  const re = /```([a-zA-Z0-9_-]*)[ \t]*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    fences.push({
      language: match[1] || "text",
      content: match[2]!.replace(/\s+$/u, ""),
    });
  }
  return fences;
}

function isPromptFence(fence: LessonStudyFence): boolean {
  if (fence.language === "markdown" || fence.language === "alistirma" || fence.language === "odev") {
    return false;
  }
  return (
    /Rol:/i.test(fence.content) ||
    /Görev:/i.test(fence.content) ||
    /Format/i.test(fence.content) ||
    /İstem/i.test(fence.content) ||
    /Prompt/i.test(fence.content)
  );
}

function isFormulaFence(fence: LessonStudyFence): boolean {
  if (isPromptFence(fence)) {
    return false;
  }
  return (
    fence.language === "excel" ||
    fence.language === "vba" ||
    fence.content.trim().startsWith("=") ||
    /ÇOKETOPLA|SUMIFS|DÜŞEYARA|VLOOKUP|İNDİS|INDEX-MATCH/i.test(fence.content)
  );
}

function extractFieldTask(markdown: string): string | null {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^>/.test(lines[i]!) || !/Saha Görevi/i.test(lines[i]!)) {
      continue;
    }
    const collected: string[] = [];
    let j = i;
    while (j < lines.length && /^>/.test(lines[j]!)) {
      collected.push(lines[j]!.replace(/^>\s?/, ""));
      j += 1;
    }
    const text = collected.join("\n").trim();
    if (text) {
      return text;
    }
  }
  return null;
}

function extractSummaryMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const heading = lines[i]!.match(/^(#{1,6})\s+(.*)$/);
    if (heading && /BÖLÜM ÖZETİ|\bÖZET\b|KAZANIM/i.test(heading[2]!)) {
      start = i + 1;
      break;
    }
  }
  if (start < 0) {
    return "";
  }
  const body: string[] = [];
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i]!;
    if (/^(#{1,6})\s+/.test(line)) {
      break;
    }
    if (isBlankOrRule(line) && body.length > 0 && /^(?:---|\*\*\*|___)\s*$/.test(line.trim())) {
      break;
    }
    if (/^>\s*.*Saha Görevi/i.test(line)) {
      break;
    }
    body.push(line);
  }
  return body.join("\n").trim();
}

function fenceMarkdown(fence: LessonStudyFence): string {
  return `\`\`\`${fence.language}\n${fence.content}\n\`\`\``;
}

function composeHighlightsMarkdown(pack: Omit<LessonStudyPack, "highlightsMarkdown">): string {
  const parts: string[] = [];
  if (pack.summaryMarkdown) {
    parts.push(`## Bu bölümde cebine koyacakların\n\n${pack.summaryMarkdown}`);
  }
  for (const prompt of pack.prompts) {
    parts.push(fenceMarkdown(prompt));
  }
  for (const formula of pack.formulas) {
    parts.push(fenceMarkdown(formula));
  }
  if (pack.fieldTask) {
    parts.push(
      pack.fieldTask
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n"),
    );
  }
  if (parts.length === 0) {
    return "Bu bölümde kopyalanacak prompt veya formül yok. Tam anlatımı **Tam Ders Metni** sekmesinde okuyabilirsin.";
  }
  return parts.join("\n\n");
}

export function extractLessonStudyPack(markdown: string): LessonStudyPack {
  const prose = stripAcademyColdTemplateHeadings(markdown);
  const fences = extractFences(prose);
  const prompts = fences.filter(isPromptFence);
  const formulas = fences.filter(isFormulaFence);
  const fieldTask = extractFieldTask(prose);
  const summaryMarkdown = extractSummaryMarkdown(prose);
  const base = { summaryMarkdown, prompts, formulas, fieldTask };
  return {
    ...base,
    highlightsMarkdown: composeHighlightsMarkdown(base),
  };
}
