"use client";

import { useState, useMemo, type ReactNode } from "react";
import { isAcademyColdTemplateHeading, stripAcademyColdTemplateHeadings } from "@/lib/academy/lesson-study";

/** `document` = açık makale kartı (Aşama 1 oynatıcı); `studio` = koyu stüdyo paneli. */
export type AcademyMarkdownTone = "document" | "studio";

const INLINE = {
  document: {
    code: "rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800",
    strongBi: "font-semibold italic text-slate-900",
    strong: "font-semibold text-slate-900",
    em: "italic text-slate-700",
    link: "text-[var(--safir-deep)] underline underline-offset-2 hover:text-slate-900",
  },
  studio: {
    code: "rounded border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-[13px] text-amber-300",
    strongBi: "font-semibold italic text-white",
    strong: "font-semibold text-white",
    em: "italic text-slate-200",
    link: "text-[var(--safir)] underline underline-offset-2 hover:text-white",
  },
} as const;

// Inline markdown parser
export function renderInlineMarkdown(text: string, tone: AcademyMarkdownTone = "document"): ReactNode[] {
  if (!text) return [];

  const nodes: ReactNode[] = [];
  const ink = INLINE[tone];
  // Tokenize regex for inline code, bold-italic, bold, italic, links
  // Matches: `code`, ***bold-italic***, **bold**, *italic*, [label](url)
  const tokenRegex = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `inline-${match.index}`;

    if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code key={key} className={ink.code}>
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("***") && token.endsWith("***")) {
      nodes.push(
        <strong key={key} className={ink.strongBi}>
          {token.slice(3, -3)}
        </strong>,
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={key} className={ink.strong}>
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={key} className={ink.em}>
          {token.slice(1, -1)}
        </em>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className={ink.link}
          >
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(token);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

// Markdown block types
type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "divider" }
  | {
      type: "table";
      headers: string[];
      aligns: ("left" | "center" | "right")[];
      rows: string[][];
    }
  | { type: "code"; language: string; content: string }
  | { type: "blockquote"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "paragraph"; text: string };

function parseMarkdownBlocks(rawText: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = rawText.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    // 1. Code blocks (```lang ... ```)
    if (line.trim().startsWith("```")) {
      const langMatch = line.trim().match(/^```([a-zA-Z0-9_-]*)/);
      const language = langMatch ? langMatch[1] || "text" : "text";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.trim().startsWith("```")) {
        codeLines.push(lines[i]!);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        type: "code",
        language,
        content: codeLines.join("\n"),
      });
      continue;
    }

    // 2. Dividers (--- or ***)
    if (/^(?:---|---|\*\*\*|___)\s*$/.test(line.trim())) {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    // 3. Headings (#, ##, ###, ####, etc.)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1]!.length,
        text: headingMatch[2]!.trim(),
      });
      i++;
      continue;
    }

    // 4. Tables (| col | col |)
    if (line.trim().startsWith("|") && line.trim().includes("|", 1)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith("|") && lines[i]!.trim().includes("|", 1)) {
        tableLines.push(lines[i]!.trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const splitCells = (row: string) => {
          let cleaned = row.trim();
          if (cleaned.startsWith("|")) cleaned = cleaned.slice(1);
          if (cleaned.endsWith("|")) cleaned = cleaned.slice(0, -1);
          return cleaned.split("|").map((cell) => cell.trim());
        };

        const headers = splitCells(tableLines[0]!);
        const separatorCells = splitCells(tableLines[1]!);
        const aligns: ("left" | "center" | "right")[] = separatorCells.map((sep) => {
          if (sep.startsWith(":") && sep.endsWith(":")) return "center";
          if (sep.endsWith(":")) return "right";
          return "left";
        });

        const rows = tableLines.slice(2).map(splitCells);
        blocks.push({
          type: "table",
          headers,
          aligns,
          rows,
        });
        continue;
      }
    }

    // 5. Blockquotes (> ...)
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith(">")) {
        quoteLines.push(lines[i]!.trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        type: "blockquote",
        lines: quoteLines,
      });
      continue;
    }

    // 6. Lists (*, -, or 1.)
    const bulletMatch = line.trim().match(/^([*+-]|\d+\.)\s+(.*)$/);
    if (bulletMatch) {
      const isOrdered = /^\d+\./.test(bulletMatch[1]!);
      const listItems: string[] = [];
      while (i < lines.length) {
        const itemMatch = lines[i]!.trim().match(/^([*+-]|\d+\.)\s+(.*)$/);
        if (itemMatch) {
          listItems.push(itemMatch[2]!.trim());
          i++;
        } else if (
          lines[i]!.trim().length > 0 &&
          !lines[i]!.trim().startsWith("#") &&
          !lines[i]!.trim().startsWith("```") &&
          !lines[i]!.trim().startsWith(">")
        ) {
          // Continuation of previous list item
          if (listItems.length > 0) {
            listItems[listItems.length - 1] += " " + lines[i]!.trim();
          }
          i++;
        } else {
          break;
        }
      }
      blocks.push({
        type: "list",
        ordered: isOrdered,
        items: listItems,
      });
      continue;
    }

    // 7. Blank lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // 8. Paragraphs
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim().length > 0 &&
      !lines[i]!.trim().startsWith("```") &&
      !lines[i]!.trim().startsWith("#") &&
      !lines[i]!.trim().startsWith(">") &&
      !lines[i]!.trim().startsWith("|") &&
      !/^([*+-]|\d+\.)\s+/.test(lines[i]!.trim()) &&
      !/^(?:---|---|\*\*\*|___)\s*$/.test(lines[i]!.trim())
    ) {
      paraLines.push(lines[i]!.trim());
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({
        type: "paragraph",
        text: paraLines.join(" "),
      });
    }
  }

  return blocks;
}

// Code Block with Copy Button and Prompt/Formula highlights
function CodeBlockRenderer({ language, content }: { language: string; content: string }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPrompt =
    language === "text" &&
    (/Rol:/i.test(content) ||
      /Görev:/i.test(content) ||
      /Format/i.test(content) ||
      /İstem/i.test(content) ||
      /Prompt/i.test(content));

  const isSolutionOrOutput =
    language === "markdown" ||
    /YÖNETİCİ ÖZETİ/i.test(content) ||
    /AKSYİON/i.test(content) ||
    /ACİL AKSİYON/i.test(content);

  const isExcelFormula =
    language === "excel" || content.trim().startsWith("=") || /ÇOKETOPLA|SUMIFS|DÜŞEYARA|VLOOKUP/i.test(content);

  const isVba = language === "vba" || /Sub\s+|End\s+Sub/i.test(content);

  // Badge label and styling
  let badgeLabel = `${language.toUpperCase()} KODU`;
  let badgeStyle = "bg-slate-700/60 text-slate-300 border-slate-600";
  let borderStyle = "border-white/10";

  if (isPrompt) {
    badgeLabel = "🎯 İSTEM (PROMPT) ŞABLONU";
    badgeStyle = "bg-cyan-950/80 text-cyan-300 border-cyan-700/60 shadow-cyan-950/40";
    borderStyle = "border-cyan-500/30";
  } else if (isExcelFormula) {
    badgeLabel = "📊 EXCEL FORMÜLÜ";
    badgeStyle = "bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-emerald-950/40";
    borderStyle = "border-emerald-500/30";
  } else if (isSolutionOrOutput) {
    badgeLabel = "📋 ÖRNEK ÇIKTI / ÇÖZÜM ŞABLONU";
    badgeStyle = "bg-blue-950/80 text-blue-300 border-blue-700/60 shadow-blue-950/40";
    borderStyle = "border-blue-500/30";
  } else if (isVba) {
    badgeLabel = "⚡ VBA MAKRO KODU";
    badgeStyle = "bg-purple-950/80 text-purple-300 border-purple-700/60 shadow-purple-950/40";
    borderStyle = "border-purple-500/30";
  }

  // Format prompt lines for high legibility
  const renderFormattedContent = () => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Highlight structured prompt keys (Rol:, Görev:, Format ve Kurallar:, vb.)
      const keyMatch = line.match(
        /^(Rol:|Görev:|Format ve Kurallar:|Kurallar:|Toplantı Notları:|İhtiyaç:|Tablo Yapısı:|Kullandığım Formül:|Sorun:|Girdi:|Beklenen Çıktı:|Örnek:|Yakalanacak Desenler ve Sütunlar:|Serbest Metinler:)(.*)$/i,
      );

      if (keyMatch) {
        return (
          <div key={idx} className="my-0.5">
            <span className="font-bold text-cyan-300">{keyMatch[1]}</span>
            <span className="text-slate-100">{keyMatch[2]}</span>
          </div>
        );
      }

      // Formula lines
      if (line.trim().startsWith("=")) {
        return (
          <div key={idx} className="my-1 font-bold text-emerald-300">
            {line}
          </div>
        );
      }

      return (
        <div key={idx} className="min-h-[1.25rem]">
          {line}
        </div>
      );
    });
  };

  const renderedBlocks = useMemo(() => {
    if (language === "markdown") {
      return parseMarkdownBlocks(content);
    }
    return [];
  }, [language, content]);

  return (
    <div className={`my-4 overflow-hidden rounded-xl border ${borderStyle} bg-slate-950/90 shadow-lg backdrop-blur`}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/[0.04] px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${badgeStyle}`}>
            {badgeLabel}
          </span>
          {language === "markdown" ? (
            <div className="flex rounded-md border border-white/10 bg-white/5 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode("rendered")}
                className={`rounded px-2 py-0.5 font-medium transition-all ${
                  viewMode === "rendered"
                    ? "bg-[var(--safir)] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Biçimlendirilmiş
              </button>
              <button
                type="button"
                onClick={() => setViewMode("raw")}
                className={`rounded px-2 py-0.5 font-medium transition-all ${
                  viewMode === "raw"
                    ? "bg-[var(--safir)] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Ham Kod
              </button>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/20 hover:text-white active:scale-95"
          title="Kodu / İstemi Kopyala"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">Kopyalandı!</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Panoya Kopyala</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      {language === "markdown" && viewMode === "rendered" ? (
        <div className="p-4 space-y-3">
          {renderedBlocks.map((b, bIdx) => {
            if (b.type === "heading") {
              return (
                <div key={bIdx} className="font-bold text-white text-sm sm:text-base border-b border-white/10 pb-1 mt-2">
                  {renderInlineMarkdown(b.text, "studio")}
                </div>
              );
            }
            if (b.type === "table") {
              return (
                <TableRenderer
                  key={bIdx}
                  headers={b.headers}
                  aligns={b.aligns}
                  rows={b.rows}
                  tone="studio"
                />
              );
            }
            if (b.type === "list") {
              return b.ordered ? (
                <ol key={bIdx} className="my-2 ml-5 list-decimal space-y-1 text-slate-200 text-xs sm:text-sm">
                  {b.items.map((it, itIdx) => (
                    <li key={itIdx}>{renderInlineMarkdown(it, "studio")}</li>
                  ))}
                </ol>
              ) : (
                <ul key={bIdx} className="my-2 ml-5 list-disc space-y-1 text-slate-200 text-xs sm:text-sm">
                  {b.items.map((it, itIdx) => (
                    <li key={itIdx}>{renderInlineMarkdown(it, "studio")}</li>
                  ))}
                </ul>
              );
            }
            if (b.type === "paragraph") {
              return (
                <p key={bIdx} className="text-xs sm:text-sm leading-relaxed text-slate-200">
                  {renderInlineMarkdown(b.text, "studio")}
                </p>
              );
            }
            return null;
          })}
        </div>
      ) : (
        <div className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-slate-200">
          {renderFormattedContent()}
        </div>
      )}
    </div>
  );
}

// Table Renderer
function TableRenderer({
  headers,
  aligns,
  rows,
  tone = "document",
}: {
  headers: string[];
  aligns: ("left" | "center" | "right")[];
  rows: string[][];
  tone?: AcademyMarkdownTone;
}) {
  const isDocument = tone === "document";
  return (
    <div
      className={
        isDocument
          ? "my-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          : "my-5 overflow-hidden rounded-xl border border-white/15 bg-slate-900/60 shadow-md"
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr
              className={
                isDocument
                  ? "border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700"
                  : "border-b border-white/15 bg-white/10 text-xs font-semibold uppercase tracking-wider text-slate-200"
              }
            >
              {headers.map((header, idx) => {
                const align = aligns[idx] || "left";
                return (
                  <th
                    key={idx}
                    className={`px-4 py-3 ${
                      align === "center"
                        ? "text-center"
                        : align === "right"
                          ? "text-right"
                          : "text-left"
                    }`}
                  >
                    {renderInlineMarkdown(header, tone)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={isDocument ? "divide-y divide-slate-100" : "divide-y divide-white/5"}>
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={
                  isDocument
                    ? "transition-colors hover:bg-slate-50 odd:bg-transparent even:bg-slate-50/80"
                    : "transition-colors hover:bg-white/[0.04] odd:bg-transparent even:bg-white/[0.02]"
                }
              >
                {row.map((cell, cellIdx) => {
                  const align = aligns[cellIdx] || "left";
                  return (
                    <td
                      key={cellIdx}
                      className={`px-4 py-2.5 ${isDocument ? "text-slate-800" : "text-slate-200"} ${
                        align === "center"
                          ? "text-center"
                          : align === "right"
                            ? "text-right"
                            : "text-left"
                      }`}
                    >
                      {renderInlineMarkdown(cell, tone)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Heading Renderer with categorized visual styling
function HeadingRenderer({
  level,
  text,
  tone = "document",
}: {
  level: number;
  text: string;
  tone?: AcademyMarkdownTone;
}) {
  const isDocument = tone === "document";
  if (isAcademyColdTemplateHeading(text)) {
    return null;
  }
  const isSecurityAlert = /ALTIN KURAL|GÜVENLİK|KVKK|ŞİRKET SIRLARI/i.test(text);
  const isPractice = /CANLI UYGULAMA|GEL BİRLİKTE YAPALIM|UYGULAMA/i.test(text);
  const isSummary = /BÖLÜM ÖZETİ|ÖZET|KAZANIM/i.test(text);
  const isBridge = /BİR SONRAKİ BÖLÜM|MERAK KANCASI/i.test(text);

  let badge: ReactNode = null;
  if (isSecurityAlert) {
    badge = (
      <span
        className={
          isDocument
            ? "mb-1 inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-950"
            : "mb-1 inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300"
        }
      >
        🛡️ GÜVENLİK VE KVKK KURALI
      </span>
    );
  } else if (isPractice) {
    badge = (
      <span
        className={
          isDocument
            ? "mb-1 inline-flex items-center gap-1 rounded bg-[var(--safir-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--safir-deep)]"
            : "mb-1 inline-flex items-center gap-1 rounded bg-[var(--safir)]/20 px-2 py-0.5 text-[11px] font-bold text-[var(--safir)]"
        }
      >
        🚀 UYGULAMALI ÇALIŞMA
      </span>
    );
  } else if (isSummary) {
    badge = (
      <span
        className={
          isDocument
            ? "mb-1 inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-900"
            : "mb-1 inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300"
        }
      >
        📌 BÖLÜM ÖZETİ & KAZANIMLAR
      </span>
    );
  } else if (isBridge) {
    badge = (
      <span
        className={
          isDocument
            ? "mb-1 inline-flex items-center gap-1 rounded bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-900"
            : "mb-1 inline-flex items-center gap-1 rounded bg-purple-500/20 px-2 py-0.5 text-[11px] font-bold text-purple-300"
        }
      >
        🔮 SIRADAKİ ADIM
      </span>
    );
  }

  if (level === 1 || level === 2) {
    return (
      <div className={isDocument ? "mt-8 mb-4 border-b border-slate-200 pb-2" : "mt-8 mb-4 border-b border-white/10 pb-2"}>
        {badge}
        <h2
          className={
            isDocument
              ? "text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
              : "text-xl font-bold tracking-tight text-white sm:text-2xl"
          }
        >
          {renderInlineMarkdown(text, tone)}
        </h2>
      </div>
    );
  }

  if (level === 3) {
    return (
      <div className="mt-7 mb-3">
        {badge}
        <h3
          className={
            isDocument
              ? "text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
              : "text-lg font-semibold tracking-tight text-white sm:text-xl"
          }
        >
          {renderInlineMarkdown(text, tone)}
        </h3>
      </div>
    );
  }

  return (
    <div className="mt-5 mb-2">
      <h4
        className={
          isDocument
            ? "text-base font-semibold tracking-tight text-slate-800"
            : "text-base font-semibold tracking-tight text-slate-200"
        }
      >
        {renderInlineMarkdown(text, tone)}
      </h4>
    </div>
  );
}

// Blockquote Renderer
function BlockquoteRenderer({
  lines,
  tone = "document",
}: {
  lines: string[];
  tone?: AcademyMarkdownTone;
}) {
  const fullText = lines.join(" ");
  const isDocument = tone === "document";
  const isFieldTask = /Saha Görevi/i.test(fullText);
  const isTip = /💡|İpucu|Tavsiye/i.test(fullText);
  const isWarning = /⚠️|Dikkat|Uyarı/i.test(fullText);

  if (isFieldTask) {
    return (
      <aside
        className={
          isDocument
            ? "my-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-[15px] leading-relaxed text-slate-800 shadow-sm"
            : "my-6 rounded-2xl border border-amber-400/40 bg-amber-500/15 p-5 text-[15px] leading-relaxed text-amber-50"
        }
        data-academy-field-task=""
      >
        <p
          className={
            isDocument
              ? "mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-900"
              : "mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200"
          }
        >
          Saha Görevi
        </p>
        {lines.map((line, idx) => (
          <p key={idx} className={idx > 0 ? "mt-2" : ""}>
            {renderInlineMarkdown(line, tone)}
          </p>
        ))}
      </aside>
    );
  }

  let borderClass = isDocument
    ? "border-l-4 border-[var(--safir)] bg-[var(--safir-soft)] text-slate-800"
    : "border-l-4 border-[var(--safir)] bg-[var(--safir)]/10 text-slate-200";
  if (isTip) {
    borderClass = isDocument
      ? "border-l-4 border-amber-500 bg-amber-50 text-slate-800"
      : "border-l-4 border-amber-400 bg-amber-500/10 text-slate-200";
  } else if (isWarning) {
    borderClass = isDocument
      ? "border-l-4 border-rose-500 bg-rose-50 text-slate-800"
      : "border-l-4 border-rose-500 bg-rose-500/10 text-slate-200";
  }

  return (
    <blockquote className={`my-4 rounded-r-xl p-4 text-[14px] leading-relaxed ${borderClass}`}>
      {lines.map((line, idx) => (
        <p key={idx} className={idx > 0 ? "mt-2" : ""}>
          {renderInlineMarkdown(line, tone)}
        </p>
      ))}
    </blockquote>
  );
}

// Main Academy Markdown Renderer Component
export function AcademyMarkdownRenderer({
  content,
  className = "",
  tone = "document",
}: {
  content: string;
  className?: string;
  tone?: AcademyMarkdownTone;
}) {
  const prepared = useMemo(() => stripAcademyColdTemplateHeadings(content), [content]);
  const blocks = useMemo(() => parseMarkdownBlocks(prepared), [prepared]);
  const isDocument = tone === "document";

  return (
    <div
      className={`space-y-4 text-[16px] leading-[1.8] ${
        isDocument ? "text-slate-900" : "text-slate-200"
      } ${className}`}
      data-academy-md=""
      data-academy-md-tone={tone}
    >
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading":
            return <HeadingRenderer key={idx} level={block.level} text={block.text} tone={tone} />;

          case "divider":
            return (
              <hr
                key={idx}
                className={
                  isDocument
                    ? "my-8 h-px border-0 bg-gradient-to-r from-transparent via-slate-300 to-transparent"
                    : "my-8 h-px border-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                }
              />
            );

          case "table":
            return (
              <TableRenderer
                key={idx}
                headers={block.headers}
                aligns={block.aligns}
                rows={block.rows}
                tone={tone}
              />
            );

          case "code":
            return (
              <CodeBlockRenderer
                key={idx}
                language={block.language}
                content={block.content}
              />
            );

          case "blockquote":
            return <BlockquoteRenderer key={idx} lines={block.lines} tone={tone} />;

          case "list":
            return block.ordered ? (
              <ol
                key={idx}
                className={`my-3 ml-5 list-decimal space-y-1.5 ${isDocument ? "text-slate-900" : "text-slate-200"}`}
              >
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="pl-1 leading-relaxed">
                    {renderInlineMarkdown(item, tone)}
                  </li>
                ))}
              </ol>
            ) : (
              <ul
                key={idx}
                className={`my-3 ml-5 list-disc space-y-1.5 ${isDocument ? "text-slate-900" : "text-slate-200"}`}
              >
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="pl-1 leading-relaxed">
                    {renderInlineMarkdown(item, tone)}
                  </li>
                ))}
              </ul>
            );

          case "paragraph":
            return (
              <p key={idx} className={`my-3 ${isDocument ? "text-slate-900" : "text-slate-200"}`}>
                {renderInlineMarkdown(block.text, tone)}
              </p>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
