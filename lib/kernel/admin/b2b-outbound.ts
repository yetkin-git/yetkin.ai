/**
 * B2B fırsat motoru — saf kurallar.
 * Tetkik ve hibe odası burada import edilmez. Ölçüm sonucu parametredir.
 * Gönderim: anahtar açık ve İstanbul gününde 15'ten az rezerv.
 */

import { istanbulYmd } from "@/lib/kernel/admin/funnel-window";

export const B2B_OUTBOUND_SETTING_ID = "b2b-outbound";
export const B2B_OUTBOUND_SETTING_KEY = "B2B_OUTBOUND_ENABLED";
export const B2B_OUTBOUND_DAILY_LIMIT = 15;
export const B2B_OUTBOUND_BATCH_LIMIT = 15;

export const B2B_TETKIK_URL = "https://yetkin.ai/tezgah?tool=tetkik";
export const B2B_GRANT_URL = "https://yetkin.ai/tezgah?tool=grant";
export const B2B_COMMERCIAL_FOOTER =
  'Bu ileti ticari elektronik iletidir. Almak istemezseniz bu e-postaya "RET" yazmanız yeter.';

export const B2B_LEAD_CHANNELS = ["WEB_TETKIK", "TUBITAK_HIBE"] as const;
export type B2bLeadChannel = (typeof B2B_LEAD_CHANNELS)[number];

export type B2bBoardItemView = {
  id: string;
  companyName: string;
  email: string;
  websiteUrl: string | null;
  sector: string;
  city: string;
  channel: B2bLeadChannel;
  status: "QUEUED" | "DRAFT_READY" | "SEND_LOCK" | "SENT" | "FAILED";
  score: number | null;
  note: string;
  subject: string;
  body: string;
  sentAt: string | null;
};

export type B2bBoardView = {
  enabled: boolean;
  sentToday: number;
  dailyLimit: number;
  items: B2bBoardItemView[];
};

export type B2bLeadInput = {
  companyName: string;
  email: string;
  websiteUrl: string | null;
  sector: string;
  city: string;
  channel: B2bLeadChannel;
};

const FREE_MAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "yahoo.com",
  "yahoo.com.tr",
  "icloud.com",
  "yandex.com",
  "yandex.com.tr",
  "proton.me",
  "protonmail.com",
]);

const OVERCLAIM = /onayland[ıi]|kesin hibe|kesin uygun|%100 uygun|yüzde yüz uygun/i;

export function b2bCounterDay(now: Date = new Date()): { ymd: string; day: Date } {
  const ymd = istanbulYmd(now);
  return { ymd, day: new Date(`${ymd}T00:00:00.000Z`) };
}

export function b2bSendGate(input: { enabled: boolean; sentToday: number }):
  | { ok: true }
  | { ok: false; reason: "disabled" | "limit" } {
  if (!input.enabled) {
    return { ok: false, reason: "disabled" };
  }
  if (!Number.isInteger(input.sentToday) || input.sentToday < 0 || input.sentToday >= B2B_OUTBOUND_DAILY_LIMIT) {
    return { ok: false, reason: "limit" };
  }
  return { ok: true };
}

export function isCorporateMailbox(email: string): boolean {
  const value = email.trim().toLowerCase();
  const match = value.match(/^[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})$/);
  if (!match) {
    return false;
  }
  const domain = match[1] ?? "";
  if (FREE_MAIL_DOMAINS.has(domain)) {
    return false;
  }
  return true;
}

function clip(value: string, max: number): string {
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max);
}

function isChannel(value: string): value is B2bLeadChannel {
  return (B2B_LEAD_CHANNELS as readonly string[]).includes(value);
}

function parseChannel(raw: string): B2bLeadChannel | null {
  const token = raw.trim().toUpperCase().replace(/\s+/g, "_");
  if (token === "WEB" || token === "TETKIK" || token === "WEB_TETKIK") {
    return "WEB_TETKIK";
  }
  if (token === "HIBE" || token === "TUBITAK" || token === "TUBITAK_HIBE") {
    return "TUBITAK_HIBE";
  }
  return isChannel(token) ? token : null;
}

export function validateB2bLead(raw: unknown): { ok: true; item: B2bLeadInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Firma satırı okunamadı." };
  }
  const row = raw as Record<string, unknown>;
  const companyName = clip(typeof row.companyName === "string" ? row.companyName : "", 120);
  const email = (typeof row.email === "string" ? row.email : "").trim().toLowerCase();
  const websiteRaw = typeof row.websiteUrl === "string" ? row.websiteUrl.trim() : "";
  const sector = clip(typeof row.sector === "string" ? row.sector : "", 80);
  const city = clip(typeof row.city === "string" ? row.city : "", 80);
  const channel = parseChannel(typeof row.channel === "string" ? row.channel : "");
  if (companyName.length < 2) {
    return { ok: false, error: "Firma adı kısa." };
  }
  if (!isCorporateMailbox(email)) {
    return { ok: false, error: `${email || "e-posta"} kurumsal adres değil.` };
  }
  if (!sector || !city) {
    return { ok: false, error: `${companyName} için sektör ve il gerekli.` };
  }
  if (!channel) {
    return { ok: false, error: `${companyName} kanalı WEB_TETKIK veya TUBITAK_HIBE olmalı.` };
  }
  const websiteUrl = websiteRaw === "" || websiteRaw === "-" ? null : websiteRaw;
  if (websiteUrl && (!websiteUrl.startsWith("https://") || websiteUrl.length > 300 || /\s/.test(websiteUrl))) {
    return { ok: false, error: `${companyName} sitesi https adresi olmalı.` };
  }
  if (channel === "WEB_TETKIK" && !websiteUrl) {
    return { ok: false, error: `${companyName} tetkiki için site adresi gerekli.` };
  }
  return {
    ok: true,
    item: { companyName, email, websiteUrl, sector, city, channel },
  };
}

export function parseB2bLeadBatch(lines: string): { items: B2bLeadInput[]; errors: string[] } {
  const items: B2bLeadInput[] = [];
  const errors: string[] = [];
  const rows = lines.split(/\r?\n/);
  let seen = 0;
  for (const rawLine of rows) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    seen += 1;
    if (seen > B2B_OUTBOUND_BATCH_LIMIT) {
      errors.push("Bir seferde en fazla 15 firma.");
      break;
    }
    const parts = (line.includes("|") ? line.split("|") : line.split(";")).map((part) => part.trim());
    if (parts.length < 6) {
      errors.push(`Satır ${seen} altı alan bekler: firma, e-posta, site, sektör, il, kanal.`);
      continue;
    }
    const parsed = validateB2bLead({
      companyName: parts[0],
      email: parts[1],
      websiteUrl: parts[2],
      sector: parts[3],
      city: parts[4],
      channel: parts[5],
    });
    if (!parsed.ok) {
      errors.push(`Satır ${seen}: ${parsed.error}`);
      continue;
    }
    items.push(parsed.item);
  }
  return { items, errors };
}

export type B2bTetkikDraftInput = {
  companyName: string;
  url: string;
  score: number;
  gaps: readonly { label: string; detail: string }[];
  disclaimer: string;
};

export type B2bGrantDraftInput = {
  companyName: string;
  sector: string;
  city: string;
  grantTitle: string | null;
  deadlineLabel: string | null;
  windowOpen: boolean;
  listedEligible: boolean;
  axesResolved: boolean;
  note: string;
};

function footer(body: string, link: string): string {
  return `${body.trim()}\n\n${link}\n\nYetkin\n${B2B_COMMERCIAL_FOOTER}`;
}

export function composeTetkikOffer(input: B2bTetkikDraftInput): { subject: string; body: string } {
  const gaps = input.gaps.slice(0, 2);
  const gapLines =
    gaps.length === 0
      ? ["Ölçülen rubrikte açık madde kalmadı. Bu, reklam veya satış hazır olduğu anlamına gelmez."]
      : gaps.map((gap, index) => `${index + 1}. ${gap.label}: ${gap.detail || gap.label}`);
  const body = footer(
    [
      `Merhaba ${input.companyName},`,
      "",
      `${input.url} adresinin herkese açık ana sayfa HTML’i ölçüldü. Dijital sağlık skoru ${input.score}/100.`,
      input.disclaimer,
      "",
      "En kritik eksikler:",
      ...gapLines,
      "",
      "Bu not satış vaadi değildir. Skor, sonradan çizilen vitrini kapsamaz.",
      "Aynı ölçüm tezgahdaki tetkik aracındadır.",
    ].join("\n"),
    B2B_TETKIK_URL,
  );
  return {
    subject: clip(`${input.companyName} sitesi için ölçülmüş bir not`, 180),
    body,
  };
}

export function composeGrantOffer(input: B2bGrantDraftInput): { subject: string; body: string } {
  const windowLine = !input.grantTitle
    ? "Yayındaki katalogda 1507 satırı doğrulanamadı. 25 Kasım 2026 atfı bu yüzden uygunluk değildir."
    : input.deadlineLabel
      ? `${input.grantTitle} için katalogdaki son başvuru ${input.deadlineLabel}.`
      : `${input.grantTitle} katalogda duruyor. Kapanış günü bu satırdan okunamadı.`;
  const matchLine = !input.axesResolved
    ? "Sektör veya il kapalı listeye oturmadığı için eşleştirici çalışmadı."
    : !input.windowOpen
      ? "Katalog bu çağrıyı açık pencerede tutmuyor."
      : input.listedEligible
        ? "Doğrulanmamış KOBİ ve Ar-Ge başlangıç varsayımıyla çağrı listede kaldı. Bu, firmanın uygun olduğu anlamına gelmez."
        : "Aynı varsayımla çağrı listeye girmedi.";
  const summary = `${input.companyName} için ön proje özeti: ${input.sector} / ${input.city} alanında problem, yöntem ve beklenen çıktı tek sayfada yazılır. Bu metin başvuru dosyası değildir. Resmî pencere PRODİS üzerindedir. Yetkin onay vermez.`;
  const body = footer(
    [
      `Merhaba ${input.companyName},`,
      "",
      windowLine,
      matchLine,
      input.note,
      "",
      summary,
      "",
      "Taslak aracı tezgahdaki hibe ekranındadır.",
    ].join("\n"),
    B2B_GRANT_URL,
  );
  return {
    subject: clip(`${input.companyName} için 1507 penceresine kısa not`, 180),
    body,
  };
}

export function composeB2bReplyDraft(input: {
  companyName: string;
  channel: B2bLeadChannel;
  inbound: string;
}): string {
  const echo = clip(input.inbound, 280);
  const link = input.channel === "WEB_TETKIK" ? B2B_TETKIK_URL : B2B_GRANT_URL;
  const topic = input.channel === "WEB_TETKIK" ? "ölçülen dijital sağlık notu" : "hibe penceresi notu";
  const name = clip(input.companyName, 120) || "Merhaba";
  return [
    `${name},`,
    "",
    "Notu okuduk. Kısa yanıt:",
    echo || "Yazı boş görünüyor.",
    "",
    `Bu yazışma ${topic} ile sınırlıdır. Hibe onayı, indirim veya hukuki sonuç bu taslakta yoktur.`,
    `Sonraki adım bu bağlantıda kalır: ${link}`,
    "",
    "Yetkin",
  ].join("\n");
}

export function assertB2bOutboundBody(
  channel: B2bLeadChannel,
  body: string,
): { ok: true } | { ok: false; error: string } {
  const link = channel === "WEB_TETKIK" ? B2B_TETKIK_URL : B2B_GRANT_URL;
  if (!body.includes(link)) {
    return { ok: false, error: "Metinde tezgah bağlantısı durmalı." };
  }
  if (!body.includes(B2B_COMMERCIAL_FOOTER)) {
    return { ok: false, error: "Metinde ticari ileti ve RET satırı durmalı." };
  }
  if (OVERCLAIM.test(body)) {
    return { ok: false, error: "Metin onay veya kesin uygunluk vaadi taşıyor." };
  }
  if (body.trim().length < 20 || body.length > 8000) {
    return { ok: false, error: "Metin 20–8000 karakter olmalı." };
  }
  return { ok: true };
}
