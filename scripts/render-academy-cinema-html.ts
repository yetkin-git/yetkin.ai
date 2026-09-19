/**
 * Tur 3 cue slayt HTML/SVG şablonu — Playwright JPG bake kaynağı.
 */

import type { AcademyCinemaCueSlide, AcademyCinemaThemeId } from "@/lib/academy/cinema-cue-catalog";
import { academyCitizenLessonOrdinalFromKey } from "@/lib/academy/curricula/lesson-index";
import { academyGmailStageKind } from "@/lib/academy/gmail-workspace";
import {
  ACADEMY_PPTX_ACTION_BAND,
  ACADEMY_PPTX_KPI_CARDS,
  ACADEMY_PPTX_SLIDE_TITLE,
} from "@/lib/academy/pptx-workspace";
import {
  ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL,
} from "@/lib/academy/lesson-beat-visual";
import { academyCitizenDocxLabel } from "@/lib/academy/prompt-console";
import { ACADEMY_WORD_FILE_LABEL, academyWordStageKind } from "@/lib/academy/word-workspace";

const THEMES: Record<
  AcademyCinemaThemeId,
  {
    bg0: string;
    bg1: string;
    ink: string;
    muted: string;
    accent: string;
    accent2: string;
    card: string;
    line: string;
    chip: string;
  }
> = {
  office: {
    bg0: "#f3eee6",
    bg1: "#e4d5c0",
    ink: "#2a2118",
    muted: "#6b5d4d",
    accent: "#b8894a",
    accent2: "#3f6b5a",
    card: "rgba(255,252,247,0.92)",
    line: "rgba(42,33,24,0.12)",
    chip: "#fff8ee",
  },
  commerce: {
    bg0: "#12100c",
    bg1: "#2a2318",
    ink: "#f4ead8",
    muted: "#c4b49a",
    accent: "#d4af37",
    accent2: "#e8c97a",
    card: "rgba(22,18,12,0.88)",
    line: "rgba(212,175,55,0.22)",
    chip: "#1c1810",
  },
  social: {
    bg0: "#071018",
    bg1: "#12253a",
    ink: "#e8f4ff",
    muted: "#9bb6cc",
    accent: "#2dd4bf",
    accent2: "#f472b6",
    card: "rgba(8,20,32,0.88)",
    line: "rgba(45,212,191,0.22)",
    chip: "#0c1c28",
  },
  bot: {
    bg0: "#061412",
    bg1: "#0d2a26",
    ink: "#e7fff8",
    muted: "#9dccc0",
    accent: "#2dd4bf",
    accent2: "#5eead4",
    card: "rgba(6,24,22,0.9)",
    line: "rgba(45,212,191,0.24)",
    chip: "#0a221e",
  },
  prompt: {
    bg0: "#f5f0e8",
    bg1: "#ddd4ea",
    ink: "#1f2430",
    muted: "#5b6272",
    accent: "#4f46e5",
    accent2: "#b8894a",
    card: "rgba(255,252,248,0.92)",
    line: "rgba(31,36,48,0.12)",
    chip: "#eef0ff",
  },
};

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Vatandaş altlığı — teknik anahtar (`01_office_ai-5`) ders numarası olarak basılmaz. */
function cinemaCitizenLessonFooter(slide: Pick<AcademyCinemaCueSlide, "lessonKey">): string {
  const ordinal = academyCitizenLessonOrdinalFromKey(slide.lessonKey);
  return ordinal != null ? `Ders ${ordinal}` : "Ders";
}

function chips(items: readonly string[], className: string): string {
  return items.map((item) => `<span class="${className}">${esc(item)}</span>`).join("");
}

function bullets(items: readonly string[]): string {
  return `<ul class="bullets">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function colLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

function isHighlightCell(cell: string | undefined, col: number, row: number): boolean {
  if (!cell) {
    return col === 0 && row === 1;
  }
  const match = /^([A-Z]+)(\d+)$/u.exec(cell.trim().toUpperCase());
  if (!match) {
    return col === 0 && row === 1;
  }
  const colIndex = match[1]!.charCodeAt(0) - 65;
  const rowIndex = Number(match[2]);
  return col === colIndex && row === rowIndex;
}

function mockExcel(slide: AcademyCinemaCueSlide): string {
  const table = slide.table;
  if (!table) {
    return "";
  }
  const colCount = Math.max(table.headers.length, ...table.rows.map((row) => row.length), 6);
  const letters = Array.from({ length: colCount }, (_, index) => colLetter(index));
  const highlight = slide.highlightCell ?? "A1";
  const formula =
    slide.formulaBar !== undefined
      ? slide.formulaBar
      : table.headers[0] ?? "";
  const fileName = slide.fileName ?? "Kitap1.xlsx";
  const sheetName = slide.sheetName ?? "Sayfa1";
  const zoom = slide.zoomA1 === true;
  const merged = slide.mergedTop === true;
  const headerRow = merged ? 3 : 1;
  const dataStart = merged ? 4 : 2;

  const colHeads = letters
    .map((letter) => `<th class="xl-col">${esc(letter)}</th>`)
    .join("");

  const mergedRow = merged
    ? `<tr>
        <th class="xl-row">1</th>
        <td class="xl-merge${isHighlightCell(highlight, 0, 1) ? " xl-a1" : ""}" colspan="${colCount}">${esc(
          formula || "Mart 2026 Tahsilat Dökümü",
        )}</td>
      </tr>
      <tr>
        <th class="xl-row">2</th>
        ${letters.map(() => `<td class="xl-empty"></td>`).join("")}
      </tr>`
    : "";

  const headerCells = table.headers
    .concat(Array.from({ length: Math.max(0, colCount - table.headers.length) }, () => ""))
    .slice(0, colCount)
    .map((cell, col) => {
      const a1 = !merged && isHighlightCell(highlight, col, 1);
      return `<td class="xl-head${a1 ? " xl-a1" : ""}">${esc(cell)}</td>`;
    })
    .join("");

  const headerLine = `<tr>
      <th class="xl-row">${headerRow}</th>
      ${headerCells}
    </tr>`;

  const body = table.rows
    .map((row, rowIndex) => {
      const excelRow = dataStart + rowIndex;
      const isFoot = rowIndex === table.rows.length - 1 && /toplam/iu.test(row[0] ?? "");
      const cells = Array.from({ length: colCount }, (_, col) => {
        const value = row[col] ?? "";
        const a1 = isHighlightCell(highlight, col, excelRow);
        return `<td class="${isFoot ? "xl-foot" : ""}${a1 ? " xl-a1" : ""}">${esc(value)}</td>`;
      }).join("");
      return `<tr><th class="xl-row">${excelRow}</th>${cells}</tr>`;
    })
    .join("");

  const fillerCount = Math.max(0, 12 - table.rows.length - (merged ? 3 : 1));
  const filler = Array.from({ length: fillerCount }, (_, index) => {
    const excelRow = dataStart + table.rows.length + index;
    return `<tr><th class="xl-row">${excelRow}</th>${letters.map(() => `<td></td>`).join("")}</tr>`;
  }).join("");

  const copilot = slide.copilot
    ? `<aside class="xl-copilot" data-academy-ai-desk>
        <nav class="xl-ai-tabs"><button class="on">Copilot (Dahili)</button><button>ChatGPT / Claude</button></nav>
        <p class="xl-paste-guide">Nereye Yapıştıracaksın?</p>
        <div class="xl-bubble user">${esc(slide.copilot.prompt)}</div>
        <div class="xl-bubble bot">${slide.copilot.replyLines.map((line) => `<p>${esc(line)}</p>`).join("")}</div>
      </aside>`
    : "";

  return `<div class="xl-desk${zoom ? " xl-zoom" : ""}">
    <div class="xl-win">
      <div class="xl-title"><i></i><b>Excel</b><span>${esc(fileName)}</span></div>
      <div class="xl-ribbon">
        <span class="on">Giriş</span><span>Ekle</span><span>Çiz</span><span>Sayfa Düzeni</span><span>Formüller</span><span>Veri</span><span>Gözden Geçir</span><span>Görünüm</span><span class="xl-copilot-btn">Copilot</span>
      </div>
      <div class="xl-fx">
        <div class="xl-name">${esc(highlight)}</div>
        <div class="xl-fx-label">fx</div>
        <div class="xl-fx-value">${esc(formula)}</div>
      </div>
      <div class="xl-body">
        <div class="xl-grid-wrap">
          <table class="xl-grid">
            <thead><tr><th class="xl-corner"></th>${colHeads}</tr></thead>
            <tbody>
              ${mergedRow}
              ${headerLine}
              ${body}
              ${filler}
            </tbody>
          </table>
        </div>
        ${copilot}
      </div>
      <div class="xl-tabs">
        <span class="on">${esc(sheetName)}</span>
        <span>Sayfa2</span>
        <i>+</i>
        <em>Hazır</em>
      </div>
    </div>
  </div>`;
}

function mockChat(slide: AcademyCinemaCueSlide): string {
  const chat = slide.chat;
  if (!chat) {
    return "";
  }
  return `<div class="app chat">
    <div class="app-bar"><span class="dots"></span><b>${esc(slide.tools[0] ?? "Sohbet")}</b><span>${esc(chat.role)}</span></div>
    <div class="bubble user"><small>Sen</small><p>${esc(chat.prompt)}</p></div>
    <div class="bubble bot"><small>Asistan</small><strong>${esc(chat.replyTitle)}</strong>${chat.replyLines
      .map((line) => `<p>${esc(line)}</p>`)
      .join("")}</div>
  </div>`;
}

function mockEmail(slide: AcademyCinemaCueSlide): string {
  const chat = slide.chat;
  return `<div class="app mail">
    <div class="app-bar"><span class="dots"></span><b>Outlook</b><span>Yeni ileti</span></div>
    <div class="mail-meta"><span>Kime</span><b>Muhasebe · maskeli</b></div>
    <div class="mail-meta"><span>Konu</span><b>${esc(slide.headline)}</b></div>
    <div class="mail-body">${
      chat
        ? chat.replyLines.map((line) => `<p>${esc(line)}</p>`).join("")
        : bullets(slide.bullets)
    }</div>
  </div>`;
}

function mockGmail(slide: AcademyCinemaCueSlide): string {
  const stage = academyGmailStageKind({
    section: slide.section,
    hideReply: slide.copilot?.hideReply,
  });
  const rows = slide.table?.rows ?? [];
  const native = stage === "native";
  const disconnected = stage === "disconnected";
  const title = disconnected ? "ChatGPT" : "Gmail";
  const sub = disconnected ? "Taşıma su" : (slide.fileName ?? "Gelen_Kutusu.gmail");
  const badge = native
    ? "GELEN KUTUSU İÇİ / YERLEŞİK GEMİNİ ENTEGRASYONU"
    : disconnected
      ? "GELEN KUTUSUNDAN KOPUK / TAŞIMA SU YÖNTEMİ"
      : "Gmail · Gemini paneli · özet kapalı";
  const list =
    rows.length > 0
      ? rows
          .map(
            (row) =>
              `<button type="button" class="gmail-row"><b>${esc(row[0] ?? "")}</b><strong>${esc(row[1] ?? "")}</strong><em>${esc(row[2] ?? row[1] ?? "")}</em></button>`,
          )
          .join("")
      : bullets(slide.bullets);
  return `<div class="app mail gmail${native ? " gmail-native" : disconnected ? " gmail-carry" : " gmail-inbox"}">
    <div class="app-bar"><span class="dots"></span><b>${esc(title)}</b><span>${esc(sub)}</span></div>
    <p class="gmail-badge">${esc(badge)}</p>
    <div class="gmail-list">${list}</div>
  </div>`;
}

function mockWord(slide: AcademyCinemaCueSlide): string {
  const chat = slide.chat;
  const stage = academyWordStageKind({
    section: slide.section,
    hideReply: slide.copilot?.hideReply,
  });
  const fileLabel =
    academyCitizenDocxLabel(slide.fileName) ?? slide.fileName ?? ACADEMY_WORD_FILE_LABEL;
  const copy = stage === "copy";
  const analysis = stage === "analysis";
  const title = copy ? "ChatGPT" : "Word";
  const sub = copy ? "Parça parça yapıştırma" : fileLabel;
  const badge = analysis
    ? ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL
    : copy
      ? ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL
      : "Ataş · madde listesi kapalı";
  const rows = slide.table?.rows ?? [];
  const body =
    rows.length > 0
      ? `<div class="word-list">${rows
          .map(
            (row) =>
              `<article class="word-card"><b>${esc(row[0] ?? "")}</b><strong>${esc(row[1] ?? "")}</strong><em>${esc(row[2] ?? "")}</em></article>`,
          )
          .join("")}</div>`
      : chat
        ? chat.replyLines.map((line, i) => `<p><b>${i + 1}.</b> ${esc(line)}</p>`).join("")
        : bullets(slide.bullets);
  return `<div class="app word${analysis ? " word-upload" : copy ? " word-copy" : " word-attach"}">
    <div class="app-bar"><span class="dots"></span><b>${esc(title)}</b><span>${esc(sub)}</span></div>
    ${badge ? `<p class="gmail-badge">${esc(badge)}</p>` : ""}
    ${copy ? "" : `<p class="word-attach">Ataş · ${esc(fileLabel)}</p>`}
    <h3>${esc(slide.headline)}</h3>
    ${body}
  </div>`;
}

function isPptxHierarchySlide(slide: AcademyCinemaCueSlide): boolean {
  return slide.visualMode === "split" || slide.table?.headers[0] === "KPI";
}

function mockPptx(slide: AcademyCinemaCueSlide): string {
  if (isPptxHierarchySlide(slide)) {
    const kicker = slide.compare?.afterLabel ?? "İyi slayt örneği";
    const cards = ACADEMY_PPTX_KPI_CARDS.map(
      (card) => `<article class="pptx-kpi pptx-kpi--${esc(card.tone)}">
        <small>${esc(card.label)}</small>
        <b>${esc(card.value)}</b>
        ${card.id === "kpi-risk" ? `<em>Uyarı</em>` : ""}
      </article>`,
    ).join("");
    return `<div class="pptx-good">
      <div class="pptx-good-head">
        <p class="pptx-good-kicker">${esc(kicker)}</p>
        <h3>${esc(ACADEMY_PPTX_SLIDE_TITLE)}</h3>
      </div>
      <div class="pptx-kpi-row">${cards}</div>
      <p class="pptx-action">${esc(slide.table?.note ?? ACADEMY_PPTX_ACTION_BAND)}</p>
    </div>`;
  }
  const nodes = slide.nodes ?? [];
  return `<div class="deck">
    ${nodes
      .map(
        (node, index) => `<article class="slide-mini">
        <span>0${index + 1}</span>
        <h4>${esc(node.title)}</h4>
        <p>${esc(node.sub)}</p>
      </article>`,
      )
      .join("")}
  </div>`;
}

function mockOutlook(slide: AcademyCinemaCueSlide): string {
  return mockExcel(slide) || mockEmail(slide);
}

function mockListing(slide: AcademyCinemaCueSlide): string {
  const table = slide.table;
  return `<div class="app listing">
    <div class="app-bar"><span class="dots"></span><b>Satıcı paneli</b><span>Ürün listesi</span></div>
    <div class="listing-grid">
      <div class="hero-thumb"><div class="bottle"></div><small>500 ml</small></div>
      <div>${
        table
          ? `<dl>${table.rows.map((row) => `<div><dt>${esc(row[0] ?? "")}</dt><dd>${esc(row[1] ?? "")}</dd></div>`).join("")}</dl>`
          : bullets(slide.bullets)
      }</div>
    </div>
  </div>`;
}

function mockShield(slide: AcademyCinemaCueSlide): string {
  return `<div class="shield">
    <svg viewBox="0 0 72 84" aria-hidden="true"><path d="M36 4 L68 16 V40 C68 62 52 76 36 80 C20 76 4 62 4 40 V16 Z" fill="none" stroke="currentColor" stroke-width="4"/><path d="M22 42 L32 52 L52 28" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div>
      ${bullets(slide.bullets)}
      ${slide.warning ? `<p class="warn">${esc(slide.warning)}</p>` : ""}
    </div>
  </div>`;
}

function mockFlow(slide: AcademyCinemaCueSlide): string {
  const nodes = slide.nodes ?? [];
  return `<div class="flow">
    ${nodes
      .map(
        (node, index) => `<div class="node"><b>${esc(node.title)}</b><span>${esc(node.sub)}</span></div>${
          index < nodes.length - 1 ? `<div class="arrow"></div>` : ""
        }`,
      )
      .join("")}
  </div>`;
}

function mockWhatsapp(slide: AcademyCinemaCueSlide): string {
  const messages = slide.messages ?? [];
  return `<div class="phone">
    <div class="notch"></div>
    <header>NovaDent · çevrimiçi</header>
    <div class="thread">${messages
      .map((message) => `<p class="${message.from}">${esc(message.text)}</p>`)
      .join("")}</div>
  </div>`;
}

function mockReels(slide: AcademyCinemaCueSlide): string {
  const nodes = slide.nodes ?? [];
  return `<div class="reels">
    ${nodes
      .map(
        (node, index) => `<article class="reel">
        <div class="reel-screen"><span>9:16</span><b>${esc(node.title)}</b></div>
        <p>${esc(node.sub)}</p>
        <small>0${index + 1}</small>
      </article>`,
      )
      .join("")}
  </div>`;
}

function mockPrompt(slide: AcademyCinemaCueSlide): string {
  const nodes = slide.nodes ?? [];
  return `<div class="stones">
    ${nodes
      .map(
        (node, index) => `<article><i>0${index + 1}</i><h4>${esc(node.title)}</h4><p>${esc(node.sub)}</p></article>`,
      )
      .join("")}
  </div>`;
}

function mockKeys(slide: AcademyCinemaCueSlide): string {
  const keys = slide.keys ?? [];
  return `<div class="keys">${keys
    .map(
      (key) => `<article><i>${esc(key.n)}</i><h4>${esc(key.title)}</h4><p>${esc(key.body)}</p></article>`,
    )
    .join("")}${slide.fieldTask ? `<div class="task"><b>Saha görevi</b><p>${esc(slide.fieldTask)}</p></div>` : ""}</div>`;
}

function mockProblem(slide: AcademyCinemaCueSlide): string {
  const stats = slide.stats ?? [];
  if (stats.length === 0) {
    return `<div class="stats-empty">${slide.warning ? `<p class="warn">${esc(slide.warning)}</p>` : ""}</div>`;
  }
  return `<div class="stats">${stats
    .map((stat) => `<article><b>${esc(stat.value)}</b><span>${esc(stat.label)}</span></article>`)
    .join("")}</div>${slide.warning ? `<p class="warn">${esc(slide.warning)}</p>` : ""}`;
}

function stageBody(slide: AcademyCinemaCueSlide): string {
  switch (slide.layout) {
    case "excel":
    case "outlook":
      return slide.layout === "outlook" && !slide.table ? mockOutlook(slide) : mockExcel(slide) || mockProblem(slide);
    case "chat":
      return mockChat(slide);
    case "email":
      return mockEmail(slide);
    case "gmail":
      return mockGmail(slide);
    case "word":
      return mockWord(slide);
    case "pptx":
      return mockPptx(slide);
    case "listing":
      return mockListing(slide);
    case "shield":
      return mockShield(slide);
    case "flow":
      return mockFlow(slide);
    case "whatsapp":
      return mockWhatsapp(slide);
    case "reels":
      return mockReels(slide);
    case "prompt":
      return mockPrompt(slide);
    case "keys":
      return mockKeys(slide);
    default:
      return mockProblem(slide);
  }
}

function renderExcelFullBleedHtml(slide: AcademyCinemaCueSlide): string {
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<style>
  html, body { margin: 0; padding: 0; width: 1920px; height: 1080px; overflow: hidden; background: #1b1b1b; }
  body { font-family: "Segoe UI", "Noto Sans", sans-serif; }
  .xl-desk { width: 1920px; height: 1080px; padding: 18px 22px 20px; box-sizing: border-box; background: #c8c8c8; }
  .xl-desk.xl-zoom .xl-a1 { font-size: 28px; font-weight: 800; min-height: 64px; }
  .xl-win { height: 100%; display: flex; flex-direction: column; background: #fff; border: 1px solid #8a8a8a; box-shadow: 0 18px 40px rgba(0,0,0,0.28); }
  .xl-title { display: flex; align-items: center; gap: 10px; height: 36px; padding: 0 12px; background: #217346; color: #fff; font-size: 14px; font-weight: 600; }
  .xl-title i { width: 14px; height: 14px; border-radius: 2px; background: #fff; display: inline-block; }
  .xl-title span { opacity: 0.92; font-weight: 500; }
  .xl-ribbon { display: flex; gap: 18px; height: 38px; align-items: center; padding: 0 16px; background: #f3f3f3; border-bottom: 1px solid #d0d0d0; font-size: 14px; color: #333; }
  .xl-ribbon .on { color: #217346; font-weight: 700; border-bottom: 2px solid #217346; padding-bottom: 6px; }
  .xl-fx { display: grid; grid-template-columns: 88px 36px 1fr; height: 32px; border-bottom: 1px solid #d0d0d0; font-size: 13px; }
  .xl-name { display: flex; align-items: center; justify-content: center; font-weight: 700; background: #fff; border-right: 1px solid #d0d0d0; }
  .xl-fx-label { display: flex; align-items: center; justify-content: center; font-style: italic; color: #666; border-right: 1px solid #d0d0d0; }
  .xl-fx-value { display: flex; align-items: center; padding: 0 10px; }
  .xl-body { flex: 1; display: grid; grid-template-columns: ${slide.copilot ? "1.7fr 0.55fr" : "1fr"}; min-height: 0; }
  .xl-grid-wrap { overflow: hidden; background: #fff; }
  .xl-grid { width: 100%; height: 100%; border-collapse: collapse; table-layout: fixed; font-size: 15px; }
  .xl-grid th, .xl-grid td { border: 1px solid #d0d7de; padding: 6px 8px; height: 32px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .xl-corner { width: 42px; background: #f2f2f2; }
  .xl-col { background: #f2f2f2; text-align: center; font-weight: 600; color: #444; }
  .xl-row { width: 42px; background: #f2f2f2; text-align: center; font-weight: 600; color: #666; }
  .xl-head { background: #eef6f1; font-weight: 700; }
  .xl-empty { background: #fafafa; }
  .xl-merge { background: #fff2cc; font-weight: 700; text-align: center; letter-spacing: 0.04em; }
  .xl-foot { font-weight: 800; background: #e2efda; }
  .xl-a1 { outline: 3px solid #217346; outline-offset: -3px; background: #e2efda !important; box-shadow: inset 0 0 0 1px #217346; }
  .xl-copilot { border-left: 1px solid #d0d0d0; background: #f7faf8; padding: 14px 16px; font-size: 14px; }
  .xl-copilot header { font-weight: 800; color: #217346; margin-bottom: 8px; letter-spacing: 0.08em; text-transform: uppercase; font-size: 12px; }
  .xl-ai-brands { margin: 0 0 10px; font-size: 11px; font-weight: 700; color: #3d6b54; }
  .xl-bubble { border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; line-height: 1.4; }
  .xl-bubble.user { background: #deefe4; }
  .xl-bubble.bot { background: #fff; border: 1px solid #d0d7de; }
  .xl-bubble p { margin: 0 0 6px; }
  .xl-tabs { height: 32px; display: flex; align-items: center; gap: 8px; padding: 0 12px; background: #f3f3f3; border-top: 1px solid #d0d0d0; font-size: 13px; }
  .xl-tabs .on { background: #fff; border: 1px solid #d0d0d0; border-bottom: none; padding: 4px 12px; font-weight: 700; color: #217346; }
  .xl-tabs i { font-style: normal; padding: 0 8px; color: #217346; font-weight: 700; }
  .xl-tabs em { margin-left: auto; font-style: normal; color: #666; }
</style>
</head>
<body>${mockExcel(slide)}</body>
</html>`;
}

export function renderAcademyCinemaCueHtml(slide: AcademyCinemaCueSlide): string {
  if (slide.layout === "excel") {
    return renderExcelFullBleedHtml(slide);
  }
  const theme = THEMES[slide.theme];
  const cueLabel = `CUE ${String(slide.cueIndex).padStart(2, "0")}`;
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<style>
  html, body { margin: 0; padding: 0; width: 1920px; height: 1080px; overflow: hidden; }
  body {
    font-family: "Segoe UI", "Noto Sans", "Helvetica Neue", sans-serif;
    color: ${theme.ink};
    background:
      radial-gradient(1200px 600px at 12% -10%, ${theme.accent}33, transparent 55%),
      radial-gradient(900px 500px at 110% 20%, ${theme.accent2}22, transparent 50%),
      linear-gradient(145deg, ${theme.bg0}, ${theme.bg1});
  }
  .frame { position: relative; width: 1920px; height: 1080px; box-sizing: border-box; padding: 48px 56px 40px; }
  .grid-bg {
    position: absolute; inset: 0; opacity: 0.18; pointer-events: none;
    background-image: linear-gradient(${theme.line} 1px, transparent 1px), linear-gradient(90deg, ${theme.line} 1px, transparent 1px);
    background-size: 48px 48px;
  }
  header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; position: relative; }
  .brand { display: flex; flex-direction: column; gap: 6px; }
  .kicker { letter-spacing: 0.18em; text-transform: uppercase; font-size: 15px; color: ${theme.muted}; font-weight: 700; }
  h1 { margin: 0; font-size: 48px; line-height: 1.12; max-width: 1180px; letter-spacing: -0.03em; }
  .sub { margin: 10px 0 0; font-size: 24px; color: ${theme.muted}; max-width: 1040px; }
  .meta { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
  .cue {
    background: ${theme.accent}; color: ${slide.theme === "office" || slide.theme === "prompt" ? "#1a140e" : "#06201c"};
    font-weight: 800; letter-spacing: 0.12em; padding: 10px 16px; border-radius: 999px; font-size: 14px;
  }
  .section { font-size: 16px; color: ${theme.muted}; }
  .tools { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; max-width: 520px; }
  .tool { background: ${theme.chip}; border: 1px solid ${theme.line}; border-radius: 999px; padding: 6px 12px; font-size: 13px; font-weight: 600; }
  main { margin-top: 28px; display: grid; grid-template-columns: 0.82fr 1.18fr; gap: 28px; height: 760px; position: relative; }
  .col { background: ${theme.card}; border: 1px solid ${theme.line}; border-radius: 28px; padding: 28px 30px; box-shadow: 0 24px 60px rgba(0,0,0,0.12); overflow: hidden; }
  .lesson { font-size: 15px; color: ${theme.muted}; margin: 0 0 8px; }
  .bullets { margin: 18px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 14px; }
  .bullets li { font-size: 22px; line-height: 1.35; padding-left: 28px; position: relative; }
  .bullets li::before { content: ""; position: absolute; left: 0; top: 0.45em; width: 12px; height: 12px; border-radius: 50%; background: ${theme.accent}; }
  .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 8px; }
  .stats article { background: ${theme.chip}; border: 1px solid ${theme.line}; border-radius: 18px; padding: 16px 18px; }
  .stats b { display: block; font-size: 32px; letter-spacing: -0.04em; }
  .stats span { color: ${theme.muted}; font-size: 15px; }
  .app { border: 1px solid ${theme.line}; border-radius: 18px; overflow: hidden; background: ${theme.chip}; }
  .app-bar { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 1px solid ${theme.line}; font-size: 14px; }
  .app-bar .dots { width: 42px; height: 10px; border-radius: 8px; background: linear-gradient(90deg, #ff6b6b 10px, #ffd166 10px 22px, #51cf66 22px); }
  .excel table { width: 100%; border-collapse: collapse; font-size: 15px; }
  .excel th, .excel td { border: 1px solid ${theme.line}; padding: 9px 10px; text-align: left; }
  .excel th { background: ${theme.accent}33; }
  .excel tr.foot td { font-weight: 700; background: ${theme.accent}14; }
  .formula { padding: 8px 12px; font-family: Consolas, "Segoe UI", monospace; font-size: 13px; color: ${theme.muted}; border-bottom: 1px solid ${theme.line}; }
  .note, .warn { margin: 12px 0 0; font-size: 16px; color: ${theme.muted}; }
  .warn { color: ${theme.accent2}; font-weight: 700; }
  .bubble { margin: 14px; border-radius: 16px; padding: 12px 14px; }
  .bubble.user { background: ${theme.accent}22; }
  .bubble.bot { background: ${slide.theme === "office" || slide.theme === "prompt" ? "#fff" : "rgba(255,255,255,0.04)"}; border: 1px solid ${theme.line}; }
  .bubble small { display: block; opacity: 0.7; margin-bottom: 6px; font-size: 12px; }
  .bubble p { margin: 6px 0 0; font-size: 16px; line-height: 1.4; }
  .mail-meta { display: grid; grid-template-columns: 70px 1fr; gap: 8px; padding: 8px 14px; border-bottom: 1px solid ${theme.line}; font-size: 15px; }
  .mail-body { padding: 16px; font-size: 18px; line-height: 1.45; }
  .gmail-badge { margin: 12px 14px 8px; padding: 6px 12px; width: fit-content; border-radius: 999px; font-size: 13px; font-weight: 800; letter-spacing: 0.04em; }
  .gmail-carry .gmail-badge, .word-copy .gmail-badge { background: #fb923c22; color: #c2410c; }
  .gmail-native .gmail-badge, .word-upload .gmail-badge { background: #34d39922; color: #047857; }
  .gmail-list, .word-list { display: flex; flex-direction: column; gap: 8px; padding: 8px 14px 16px; }
  .gmail-row, .word-card { display: grid; gap: 2px; text-align: left; border: 1px solid ${theme.line}; border-radius: 12px; padding: 10px 12px; background: ${theme.card}; font: inherit; color: inherit; }
  .gmail-row b, .word-card b { font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; color: ${theme.accent}; }
  .gmail-row strong, .word-card strong { font-size: 18px; }
  .gmail-row em, .word-card em { font-size: 14px; color: ${theme.muted}; font-style: normal; }
  .word { padding-bottom: 12px; }
  .word h3 { margin: 16px 16px 8px; font-size: 26px; }
  .word p { margin: 8px 16px; font-size: 18px; }
  .word-attach { margin: 8px 14px; font-weight: 800; color: ${theme.accent2}; }
  .deck, .keys, .reels { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; align-content: start; }
  .stones { display: flex; flex-wrap: wrap; gap: 14px; }
  .stones article { flex: 1 1 30%; min-width: 200px; }
  .slide-mini, .keys article, .stones article, .reels .reel {
    display: flex; flex-direction: column; gap: 8px; min-width: 0; min-height: 0;
    border: 1px solid ${theme.line}; border-radius: 18px; padding: 16px; background: ${theme.chip};
  }
  .slide-mini span, .keys i, .stones i, .reels small { color: ${theme.accent}; font-weight: 800; letter-spacing: 0.08em; }
  .slide-mini h4, .keys h4, .stones h4 { margin: 0; font-size: 22px; overflow-wrap: anywhere; }
  .slide-mini p { margin: 0; overflow-wrap: anywhere; }
  .pptx-good {
    display: flex; flex-direction: column; gap: 20px; aspect-ratio: 16 / 9; width: 100%; height: auto; max-height: 100%; object-fit: contain; min-height: 0; box-sizing: border-box;
    padding: 20px 22px 18px; border-radius: 20px; color: #f8fbff;
    background: radial-gradient(120% 80% at 12% 0%, rgba(56, 189, 248, 0.18), transparent 46%),
      linear-gradient(165deg, #102033 0%, #0b1220 52%, #152a44 100%);
  }
  .pptx-good-head { display: flex; flex-direction: column; gap: 12px; flex: 0 0 auto; min-width: 0; }
  .pptx-good-kicker {
    margin: 0; align-self: flex-start; max-width: 100%; padding: 6px 12px; border-radius: 999px;
    background: rgba(8, 42, 48, 0.84); border: 1px solid rgba(72, 228, 196, 0.7);
    font-size: 11px; font-weight: 800; letter-spacing: 0.06em; line-height: 1.25; text-transform: uppercase;
    overflow-wrap: anywhere;
  }
  .pptx-good h3 { margin: 0; width: 100%; text-align: center; font-size: 28px; letter-spacing: -0.03em; line-height: 1.2; }
  .pptx-kpi-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; flex: 1 1 auto; align-items: center; align-content: center; min-height: 180px; }
  .pptx-kpi {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
    min-width: 0; min-height: 160px; padding: 18px 14px; border-radius: 16px; text-align: center; background: rgba(8, 16, 32, 0.55);
  }
  .pptx-kpi--green { border: 1px solid rgba(52, 211, 153, 0.55); }
  .pptx-kpi--blue { border: 1px solid rgba(56, 189, 248, 0.55); }
  .pptx-kpi--warn { border: 1px solid rgba(251, 146, 60, 0.7); }
  .pptx-kpi small { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(226, 232, 240, 0.72); }
  .pptx-kpi b { font-size: 22px; line-height: 1.2; overflow-wrap: anywhere; }
  .pptx-kpi--green b { color: #6ee7b7; }
  .pptx-kpi--blue b { color: #7dd3fc; }
  .pptx-kpi--warn b { color: #fdba74; }
  .pptx-kpi em {
    display: inline-flex; margin: 0; padding: 4px 10px; border-radius: 999px; background: #ea580c;
    color: #fff7ed; font-size: 11px; font-style: normal; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
  }
  .pptx-action {
    margin: auto 0 0; padding: 12px 14px; border-radius: 12px; text-align: center; font-size: 16px; font-weight: 700;
    background: linear-gradient(90deg, #020617 0%, #111827 55%, #1f2937 100%);
  }
  .flow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .node { flex: 1; min-width: 160px; background: ${theme.chip}; border: 1px solid ${theme.line}; border-radius: 16px; padding: 16px; }
  .node b { display: block; font-size: 20px; margin-bottom: 6px; }
  .arrow { width: 28px; height: 2px; background: ${theme.accent}; position: relative; }
  .arrow::after { content: ""; position: absolute; right: -2px; top: -4px; border: 5px solid transparent; border-left-color: ${theme.accent}; }
  .phone { width: 360px; margin: 0 auto; background: #0b141a; color: #e7fff8; border-radius: 36px; padding: 18px 14px 24px; border: 1px solid ${theme.line}; }
  .notch { width: 120px; height: 18px; background: #000; border-radius: 0 0 14px 14px; margin: 0 auto 10px; }
  .phone header { display: block; text-align: center; font-weight: 700; margin-bottom: 12px; color: #d1fae5; }
  .thread { display: flex; flex-direction: column; gap: 8px; min-height: 420px; }
  .thread p { max-width: 80%; margin: 0; padding: 10px 12px; border-radius: 16px; font-size: 15px; line-height: 1.35; }
  .thread .user { align-self: flex-end; background: #128c7e; }
  .thread .bot { align-self: flex-start; background: #1f2c34; }
  .listing-grid { display: grid; grid-template-columns: 180px 1fr; gap: 16px; padding: 16px; }
  .hero-thumb { height: 220px; border-radius: 16px; background: linear-gradient(#222, #111); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #eee; }
  .bottle { width: 54px; height: 140px; border-radius: 18px 18px 12px 12px; background: linear-gradient(#444, #111); box-shadow: inset 0 0 0 2px #d4af37aa; }
  dl { margin: 0; display: flex; flex-direction: column; gap: 10px; }
  dl div { display: grid; grid-template-columns: 140px 1fr; gap: 8px; font-size: 16px; }
  dt { color: ${theme.muted}; }
  .shield { display: grid; grid-template-columns: 90px 1fr; gap: 18px; align-items: start; color: ${theme.accent}; }
  .shield svg { width: 84px; height: 96px; }
  .task { grid-column: 1 / -1; border: 1px dashed ${theme.accent}; border-radius: 18px; padding: 16px 18px; }
  .task b { color: ${theme.accent}; letter-spacing: 0.08em; text-transform: uppercase; font-size: 13px; }
  footer { position: absolute; left: 56px; right: 56px; bottom: 28px; display: flex; justify-content: space-between; color: ${theme.muted}; font-size: 14px; letter-spacing: 0.04em; }
</style>
</head>
<body>
  <div class="frame">
    <div class="grid-bg"></div>
    <header>
      <div class="brand">
        <div class="kicker">${esc(slide.courseLabel)}</div>
        <h1>${esc(slide.headline)}</h1>
        <p class="sub">${esc(slide.subhead)}</p>
      </div>
      <div class="meta">
        <div class="cue">${esc(cueLabel)}</div>
        <div class="section">${esc(slide.section)}</div>
        <div class="tools">${chips(slide.tools, "tool")}</div>
      </div>
    </header>
    <main>
      <section class="col">
        <p class="lesson">${esc(slide.instructor)} · ${esc(slide.lessonTitle)}</p>
        ${bullets(slide.bullets)}
        ${slide.warning && slide.layout !== "shield" ? `<p class="warn">${esc(slide.warning)}</p>` : ""}
      </section>
      <section class="col">${stageBody(slide)}</section>
    </main>
    <footer>
      <span>yetkin.ai akademi · görsel sahne</span>
      <span>${esc(cinemaCitizenLessonFooter(slide))} · cue-${slide.cueIndex}</span>
    </footer>
  </div>
</body>
</html>`;
}
