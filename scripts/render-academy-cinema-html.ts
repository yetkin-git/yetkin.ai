/**
 * Tur 3 cue slayt HTML/SVG şablonu — Playwright JPG bake kaynağı.
 */

import type { AcademyCinemaCueSlide, AcademyCinemaThemeId } from "@/lib/academy/cinema-cue-catalog";

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

function chips(items: readonly string[], className: string): string {
  return items.map((item) => `<span class="${className}">${esc(item)}</span>`).join("");
}

function bullets(items: readonly string[]): string {
  return `<ul class="bullets">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function mockExcel(slide: AcademyCinemaCueSlide): string {
  const table = slide.table;
  if (!table) {
    return "";
  }
  const head = table.headers.map((cell) => `<th>${esc(cell)}</th>`).join("");
  const body = table.rows
    .map(
      (row, rowIndex) =>
        `<tr class="${rowIndex === table.rows.length - 1 ? "foot" : ""}">${row
          .map((cell) => `<td>${esc(cell)}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  return `<div class="app excel">
    <div class="app-bar"><span class="dots"></span><b>Excel</b><span>Kitap1.xlsx</span></div>
    <div class="formula">fx &nbsp; =ÇOKETOPLAŞ.ÇOKLU(...)</div>
    <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
    ${table.note ? `<p class="note">${esc(table.note)}</p>` : ""}
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

function mockWord(slide: AcademyCinemaCueSlide): string {
  const chat = slide.chat;
  return `<div class="app word">
    <div class="app-bar"><span class="dots"></span><b>Word</b><span>Yönetici raporu.docx</span></div>
    <h3>${esc(slide.headline)}</h3>
    ${chat ? chat.replyLines.map((line, i) => `<p><b>${i + 1}.</b> ${esc(line)}</p>`).join("") : bullets(slide.bullets)}
  </div>`;
}

function mockPptx(slide: AcademyCinemaCueSlide): string {
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

export function renderAcademyCinemaCueHtml(slide: AcademyCinemaCueSlide): string {
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
  .word { padding-bottom: 12px; }
  .word h3 { margin: 16px 16px 8px; font-size: 26px; }
  .word p { margin: 8px 16px; font-size: 18px; }
  .deck, .keys, .reels { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .stones { display: flex; flex-wrap: wrap; gap: 14px; }
  .stones article { flex: 1 1 30%; min-width: 200px; }
  .slide-mini, .keys article, .stones article, .reels .reel {
    border: 1px solid ${theme.line}; border-radius: 18px; padding: 16px; background: ${theme.chip}; min-height: 140px;
  }
  .slide-mini span, .keys i, .stones i, .reels small { color: ${theme.accent}; font-weight: 800; letter-spacing: 0.08em; }
  .slide-mini h4, .keys h4, .stones h4 { margin: 8px 0 6px; font-size: 22px; }
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
      <span>${esc(slide.lessonKey)} · cue-${slide.cueIndex}</span>
    </footer>
  </div>
</body>
</html>`;
}
