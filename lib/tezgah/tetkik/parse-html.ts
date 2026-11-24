import type { ParsedHomepage, TetkikPageSnippet } from "@/lib/tezgah/tetkik/types";

const CTA_PHRASES = [
  "whatsapp",
  "hemen ara",
  "bizi ara",
  "bize ulaş",
  "bize yaz",
  "iletişime geç",
  "iletişim",
  "teklif al",
  "teklif iste",
  "sipariş ver",
  "satın al",
  "sepete ekle",
  "randevu",
  "rezervasyon",
  "mesaj gönder",
  "hemen yaz",
  "call now",
  "buy now",
  "contact",
  "get a quote",
  "book now",
];

function decodeEntities(value: string): string {
  const amp = value.replace(/&amp;/gi, "&");
  return amp
    .replace(/&#(\d{1,7});/g, (_, digits: string) => codePoint(Number(digits)))
    .replace(/&#x([0-9a-f]{1,6});/gi, (_, hex: string) => codePoint(Number.parseInt(hex, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function codePoint(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) {
    return "";
  }
  if (code >= 0xd800 && code <= 0xdfff) {
    return "";
  }
  return String.fromCodePoint(code);
}

function visibleText(value: string): string {
  return decodeEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fold(value: string): string {
  return visibleText(value).toLocaleLowerCase("tr-TR");
}

function stripNoise(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, "")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "");
}

function readAttrs(source: string): Map<string, string> {
  const attrs = new Map<string, string>();
  const pattern = /([^\s"'=<>`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    const key = match[1]?.toLowerCase();
    if (!key || attrs.has(key)) {
      continue;
    }
    attrs.set(key, decodeEntities(match[2] ?? match[3] ?? match[4] ?? ""));
  }
  return attrs;
}

function collectOpenTags(html: string, tagName: string): string[] {
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>`, "gi");
  return [...html.matchAll(pattern)].map((match) => match[1] ?? "");
}

function collectElements(html: string, tagName: string): { attrs: string; text: string }[] {
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  return [...html.matchAll(pattern)].map((match) => ({
    attrs: match[1] ?? "",
    text: match[2] ?? "",
  }));
}

function isCtaText(value: string): boolean {
  const text = fold(value);
  if (text.length < 2 || text.length > 60) {
    return false;
  }
  return CTA_PHRASES.some((phrase) => text.includes(phrase));
}

function hrefHasWhatsapp(href: string): boolean {
  const value = href.trim().toLowerCase();
  return (
    value.includes("wa.me") ||
    value.includes("api.whatsapp.com") ||
    value.includes("web.whatsapp.com") ||
    value.startsWith("whatsapp:")
  );
}

/**
 * Skorun baktığı etiketleri ayıklar. Betik çalıştırmaz.
 * Görsel yoksa alt metin kararı skor katmanındadır.
 */
export function parseHomepageHtml(source: string): ParsedHomepage {
  const html = stripNoise(source);
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const htmlTag = html.match(/<html\b([^>]*)>/i);
  const lang = htmlTag ? (readAttrs(htmlTag[1] ?? "").get("lang") ?? "") : "";

  let metaDescription = "";
  let viewport = "";
  let robots = "";
  let openGraph = false;
  for (const raw of collectOpenTags(html, "meta")) {
    const attrs = readAttrs(raw);
    const name = (attrs.get("name") ?? "").toLowerCase();
    const property = (attrs.get("property") ?? name).toLowerCase();
    const content = (attrs.get("content") ?? "").trim();
    if (name === "description" && !metaDescription) {
      metaDescription = visibleText(content);
    }
    if (name === "viewport" && !viewport) {
      viewport = content;
    }
    if (name === "robots" && !robots) {
      robots = content.slice(0, 120);
    }
    if (/^og:(title|description|image)$/.test(property) && content) {
      openGraph = true;
    }
  }

  let canonical = "";
  for (const raw of collectOpenTags(html, "link")) {
    const attrs = readAttrs(raw);
    const rel = (attrs.get("rel") ?? "").toLowerCase().split(/\s+/);
    if (rel.includes("canonical") && !canonical) {
      canonical = (attrs.get("href") ?? "").trim().slice(0, 300);
    }
  }

  const headingLevels = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map((match) => Number(match[1]));
  const h1Elements = collectElements(html, "h1");
  const h1Text = h1Elements.length > 0 ? visibleText(h1Elements[0]?.text ?? "").slice(0, 160) : "";

  let whatsapp = false;
  let phone = false;
  let email = false;
  let cta = false;
  const ctaTexts: string[] = [];
  const pushCta = (raw: string) => {
    const text = visibleText(raw).slice(0, 80);
    if (!text || ctaTexts.includes(text)) {
      return;
    }
    if (ctaTexts.length >= 6) {
      return;
    }
    ctaTexts.push(text);
  };

  for (const raw of collectOpenTags(html, "a")) {
    const href = readAttrs(raw).get("href") ?? "";
    if (hrefHasWhatsapp(href)) {
      whatsapp = true;
    }
    if (href.trim().toLowerCase().startsWith("tel:")) {
      phone = true;
    }
    if (href.trim().toLowerCase().startsWith("mailto:")) {
      email = true;
    }
  }
  for (const element of [...collectElements(html, "a"), ...collectElements(html, "button")]) {
    if (fold(element.text).includes("whatsapp")) {
      whatsapp = true;
    }
    if (isCtaText(element.text)) {
      cta = true;
      pushCta(element.text);
    }
  }
  for (const raw of collectOpenTags(html, "input")) {
    const attrs = readAttrs(raw);
    const type = (attrs.get("type") ?? "").toLowerCase();
    const value = attrs.get("value") ?? "";
    if ((type === "submit" || type === "button") && isCtaText(value)) {
      cta = true;
      pushCta(value);
    }
  }

  const images = collectOpenTags(html, "img").map((raw) => {
    const alt = readAttrs(raw).get("alt");
    return { hasAlt: typeof alt === "string" && alt.trim().length > 0 };
  });

  return {
    title: titleMatch ? visibleText(titleMatch[1] ?? "") : "",
    metaDescription,
    h1Text,
    ctaTexts,
    headingLevels,
    viewport,
    lang,
    whatsapp,
    phone,
    email,
    form: /<form\b/i.test(html),
    cta,
    images,
    canonical,
    robots,
    openGraph,
  };
}

/** Modele ve mühüre giden temiz snippet. Ham HTML etiketi taşımaz. */
export function pageSnippetFromParsed(parsed: ParsedHomepage): TetkikPageSnippet {
  return {
    title: parsed.title.slice(0, 120),
    metaDescription: parsed.metaDescription.slice(0, 200),
    h1: parsed.h1Text.slice(0, 160),
    ctaTexts: parsed.ctaTexts.slice(0, 6),
  };
}
