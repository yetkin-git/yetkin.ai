import { inventsMoney } from "@/lib/tezgah/guard/price-shield";
import { dukkanSectorById } from "@/lib/tezgah/dukkan/copy";
import {
  REKLAM_AIM_CTA,
  REKLAM_DISCLAIMER,
  REKLAM_GOOGLE_DESCRIPTION_MAX,
  REKLAM_GOOGLE_TITLE_MAX,
  REKLAM_META_HEADLINE_MAX,
  REKLAM_META_PRIMARY_MAX,
  REKLAM_SECTOR_INTERESTS,
  REKLAM_VARIANTS,
  type ReklamAim,
  type ReklamVariantId,
} from "@/lib/tezgah/reklam/copy";
import type { ReklamDraft } from "@/lib/tezgah/reklam/schema";
import type { ReklamPackage, ReklamVariantPack } from "@/lib/tezgah/reklam/types";

const METRIC =
  /\d[\d.\s]{0,16}(?:bin\s+)?(?:gösterim|gosterim|tıklama|tiklama|erişim|erisim|kişi|kisi)|(?:gösterim|gosterim|tıklama|tiklama|erişim|erisim)\s*[:.]?\s*\d|\b(?:cpc|cpm|ctr|roas|tbm)\b|tıklama\s+fiyat|tiklama\s+fiyat/i;

function units(value: string): number {
  return [...value].length;
}

function cleanLine(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200d\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function foreignCta(line: string, aim: ReklamAim): boolean {
  const lower = line.toLocaleLowerCase("tr-TR");
  for (const [id, phrase] of Object.entries(REKLAM_AIM_CTA) as [ReklamAim, string][]) {
    if (id !== aim && lower.includes(phrase.toLocaleLowerCase("tr-TR"))) {
      return true;
    }
  }
  return false;
}

function lineKept(line: string, offer: string, aim: ReklamAim): boolean {
  if (!line || METRIC.test(line) || inventsMoney(line, offer) || foreignCta(line, aim)) {
    return false;
  }
  return true;
}

/** Kod noktası kırpma. Sığmazsa kısaltır; 2 karakter altı null. */
export function clipReklamUnits(value: string, max: number): string | null {
  const clean = cleanLine(value);
  if (units(clean) < 2) {
    return null;
  }
  if (units(clean) <= max) {
    return clean;
  }
  const clipped = [...clean].slice(0, max).join("").trim();
  return units(clipped) >= 2 ? clipped : null;
}

function sectionsOf(raw: string): Map<string, string> {
  const map = new Map<string, string>();
  const parts = raw.replace(/\r\n/g, "\n").split(/^## /m);
  for (const part of parts) {
    const breakAt = part.indexOf("\n");
    if (breakAt < 0) {
      continue;
    }
    const title = part.slice(0, breakAt).trim().toLocaleLowerCase("tr-TR");
    const body = part.slice(breakAt + 1).trim();
    if (title && body) {
      map.set(title, body);
    }
  }
  return map;
}

function subSectionsOf(body: string): Map<string, string> {
  const map = new Map<string, string>();
  const parts = body.replace(/\r\n/g, "\n").split(/^### /m);
  for (const part of parts) {
    const breakAt = part.indexOf("\n");
    if (breakAt < 0) {
      continue;
    }
    const title = part.slice(0, breakAt).trim().toLocaleLowerCase("tr-TR");
    const text = part.slice(breakAt + 1).trim();
    if (title && text) {
      map.set(title, text);
    }
  }
  return map;
}

function bullets(body: string, offer: string, aim: ReklamAim, max: number): string[] {
  const kept: string[] = [];
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("- ")) {
      continue;
    }
    const text = cleanLine(trimmed.slice(2));
    if (units(text) < 2 || !lineKept(text, offer, aim)) {
      continue;
    }
    const clipped = clipReklamUnits(text, max);
    if (clipped) {
      kept.push(clipped);
    }
  }
  return kept;
}

function plainBody(body: string, offer: string, aim: ReklamAim, max: number): string | null {
  const kept = body
    .split("\n")
    .map((line) => cleanLine(line.replace(/^[-*]\s+/, "")))
    .filter((line) => line.length > 0 && lineKept(line, offer, aim));
  if (kept.length === 0) {
    return null;
  }
  return clipReklamUnits(kept.join(" "), max);
}

function labeled(body: string, labels: readonly string[], offer: string, aim: ReklamAim, max: number): string | null {
  for (const rawLine of body.split("\n")) {
    const line = cleanLine(rawLine);
    const lower = line.toLocaleLowerCase("tr-TR");
    for (const label of labels) {
      const probe = label.toLocaleLowerCase("tr-TR");
      if (!lower.startsWith(probe)) {
        continue;
      }
      const value = cleanLine(line.slice(label.length).replace(/^[:\s-]+/, ""));
      if (!lineKept(value, offer, aim)) {
        return null;
      }
      return clipReklamUnits(value, max);
    }
  }
  return null;
}

function variantKey(id: ReklamVariantId): string {
  const row = REKLAM_VARIANTS.find((item) => item.id === id);
  return (row?.heading ?? "").toLocaleLowerCase("tr-TR");
}

function sealVariant(
  body: string,
  draft: ReklamDraft,
  meta: (typeof REKLAM_VARIANTS)[number],
): ReklamVariantPack | null {
  const subs = subSectionsOf(body);
  const headlines = bullets(subs.get("google başlıklar") ?? "", draft.offer, draft.aim, REKLAM_GOOGLE_TITLE_MAX);
  const descriptions = bullets(
    subs.get("google açıklamalar") ?? "",
    draft.offer,
    draft.aim,
    REKLAM_GOOGLE_DESCRIPTION_MAX,
  );
  const metaHeadline = plainBody(subs.get("meta başlık") ?? "", draft.offer, draft.aim, REKLAM_META_HEADLINE_MAX);
  const metaPrimary = plainBody(subs.get("meta metin") ?? "", draft.offer, draft.aim, REKLAM_META_PRIMARY_MAX);
  const keywords = bullets(subs.get("anahtar kelimeler") ?? "", draft.offer, draft.aim, 40).slice(0, 12);
  const negatives = bullets(subs.get("negatif anahtar kelimeler") ?? "", draft.offer, draft.aim, 40).slice(0, 8);
  const brief = subs.get("görsel brif") ?? "";
  const frame = labeled(brief, ["Kadraj"], draft.offer, draft.aim, 160);
  const overlay = labeled(brief, ["Görsel üstü yazı", "Üst yazı"], draft.offer, draft.aim, 160);
  const hidden = labeled(brief, ["Gösterilmeyecek", "Gösterme"], draft.offer, draft.aim, 160);

  if (
    headlines.length < 3 ||
    descriptions.length < 2 ||
    !metaHeadline ||
    !metaPrimary ||
    keywords.length < 3 ||
    negatives.length < 2 ||
    !frame ||
    !overlay ||
    !hidden
  ) {
    return null;
  }

  return {
    id: meta.id,
    angle: meta.angle,
    heading: meta.heading,
    googleHeadlines: [headlines[0]!, headlines[1]!, headlines[2]!],
    googleDescriptions: [descriptions[0]!, descriptions[1]!],
    metaHeadline,
    metaPrimary,
    keywords,
    negatives,
    frame,
    overlay,
    hidden,
  };
}

function extractLabeled(body: string, labels: readonly string[], max: number): string | null {
  for (const rawLine of body.split("\n")) {
    const line = cleanLine(rawLine);
    const lower = line.toLocaleLowerCase("tr-TR");
    for (const label of labels) {
      const probe = label.toLocaleLowerCase("tr-TR");
      if (!lower.startsWith(probe)) {
        continue;
      }
      const value = cleanLine(line.slice(label.length).replace(/^[:\s-]+/, ""));
      return clipReklamUnits(value, max);
    }
  }
  return null;
}

export function renderReklamMarkdown(pack: ReklamPackage): string {
  const blocks: string[] = [
    `# ${pack.businessName}`,
    `${pack.place} · ${pack.sectorLabel}`,
    "",
    "## Bütçe dağılımı",
    ...budgetLinesFromPack(pack),
    "",
  ];

  for (const variant of pack.variants) {
    blocks.push(
      `## ${variant.heading}`,
      `Açı: ${variant.angle}`,
      "",
      "### Google Arama",
      `Başlık 1: ${variant.googleHeadlines[0]}`,
      `Başlık 2: ${variant.googleHeadlines[1]}`,
      `Başlık 3: ${variant.googleHeadlines[2]}`,
      `Açıklama 1: ${variant.googleDescriptions[0]}`,
      `Açıklama 2: ${variant.googleDescriptions[1]}`,
      "",
      "### Meta",
      `Ana Metin: ${variant.metaPrimary}`,
      `Başlık: ${variant.metaHeadline}`,
      "",
      "### Anahtar kelimeler",
      ...variant.keywords.map((word) => `- ${word}`),
      "",
      "### Negatif anahtar kelimeler",
      ...variant.negatives.map((word) => `- ${word}`),
      "",
      "### Görsel brif",
      `Kadraj: ${variant.frame}`,
      `Görsel üstü yazı: ${variant.overlay}`,
      `Gösterilmeyecek: ${variant.hidden}`,
      "",
    );
  }

  blocks.push(
    "## Hedef kitle",
    `Şehir: ${pack.place}`,
    `İlgi alanları: ${pack.interests}`,
    "",
    "## Amaç çağrısı",
    pack.aimCta,
    "",
    pack.disclaimer,
  );
  return blocks.join("\n");
}

function budgetLinesFromPack(pack: ReklamPackage): string[] {
  const { budget } = pack;
  if (budget.totalBudgetTl == null) {
    return [
      `Soğuk Test: %${budget.coldTestPct}`,
      `Yeniden Pazarlama: %${budget.remarketingPct}`,
      `Kazanan Ölçekleme: %${budget.scalePct}`,
      "Tutar girilmedi; yalnız yüzdesel dağılım gösterilir.",
    ];
  }
  return [
    `Toplam bütçe: ${budget.totalBudgetTl} TL`,
    `Soğuk Test: %${budget.coldTestPct} · ${budget.coldTestTl} TL`,
    `Yeniden Pazarlama: %${budget.remarketingPct} · ${budget.remarketingTl} TL`,
    `Kazanan Ölçekleme: %${budget.scalePct} · ${budget.scaleTl} TL`,
  ];
}

/**
 * Model metnini 3 varyantlı A/B kampanya paketine mühürler.
 * Google 30/90 ve Meta başlık/metin sınırında deterministik kırpma uygular.
 * Zorunlu parça eksikse veya sahte metrik/para varsa null → kota iadesi.
 */
export function sealReklamPackage(raw: string, draft: ReklamDraft): ReklamPackage | null {
  const sections = sectionsOf(raw);
  const sealed: ReklamVariantPack[] = [];
  for (const meta of REKLAM_VARIANTS) {
    const body = sections.get(variantKey(meta.id)) ?? "";
    const variant = sealVariant(body, draft, meta);
    if (!variant) {
      return null;
    }
    sealed.push(variant);
  }
  if (sealed.length !== 3) {
    return null;
  }

  const sector = dukkanSectorById(draft.sector);
  return {
    businessName: draft.businessName,
    place: draft.place,
    sectorLabel: sector.label,
    aimCta: REKLAM_AIM_CTA[draft.aim],
    interests: REKLAM_SECTOR_INTERESTS[draft.sector].join(", "),
    offer: draft.offer,
    budget: draft.budget,
    variants: [sealed[0]!, sealed[1]!, sealed[2]!],
    disclaimer: REKLAM_DISCLAIMER,
  };
}

/** Markdown mühürü. Eksik/bozuk pakette null. */
export function sealReklamMarkdown(raw: string, draft: ReklamDraft): string | null {
  const pack = sealReklamPackage(raw, draft);
  return pack ? renderReklamMarkdown(pack) : null;
}

/** Arşivden / önizlemeden paket yeniden kurma (CSV ve DOCX için). */
export function parseSealedReklamMarkdown(markdown: string): ReklamPackage | null {
  const text = markdown.replace(/\r\n/g, "\n").trim();
  const titleMatch = /^#\s+(.+)$/m.exec(text);
  const placeLine = text.split("\n").find((line, index) => index > 0 && line.includes("·"));
  if (!titleMatch?.[1] || !placeLine) {
    return null;
  }
  const businessName = cleanLine(titleMatch[1]);
  const [placeRaw, sectorRaw] = placeLine.split("·").map((part) => cleanLine(part));
  if (!businessName || !placeRaw || !sectorRaw) {
    return null;
  }

  const sections = sectionsOf(text);
  const budgetBody = sections.get("bütçe dağılımı") ?? "";
  const totalMatch = /Toplam bütçe:\s*(\d+)\s*TL/i.exec(budgetBody);
  const coldMatch = /Soğuk Test:\s*%(\d+)(?:\s*·\s*(\d+)\s*TL)?/i.exec(budgetBody);
  const rematch = /Yeniden Pazarlama:\s*%(\d+)(?:\s*·\s*(\d+)\s*TL)?/i.exec(budgetBody);
  const scaleMatch = /Kazanan Ölçekleme:\s*%(\d+)(?:\s*·\s*(\d+)\s*TL)?/i.exec(budgetBody);

  const totalBudgetTl = totalMatch?.[1] ? Number(totalMatch[1]) : null;
  const budget = {
    coldTestPct: 60 as const,
    remarketingPct: 25 as const,
    scalePct: 15 as const,
    totalBudgetTl: totalBudgetTl != null && Number.isFinite(totalBudgetTl) ? totalBudgetTl : null,
    coldTestTl: coldMatch?.[2] ? Number(coldMatch[2]) : null,
    remarketingTl: rematch?.[2] ? Number(rematch[2]) : null,
    scaleTl: scaleMatch?.[2] ? Number(scaleMatch[2]) : null,
  };

  const variants: ReklamVariantPack[] = [];
  for (const meta of REKLAM_VARIANTS) {
    const body = sections.get(variantKey(meta.id)) ?? "";
    const google = body.split("### Meta")[0] ?? body;
    const h1 = extractLabeled(google, ["Başlık 1"], REKLAM_GOOGLE_TITLE_MAX);
    const h2 = extractLabeled(google, ["Başlık 2"], REKLAM_GOOGLE_TITLE_MAX);
    const h3 = extractLabeled(google, ["Başlık 3"], REKLAM_GOOGLE_TITLE_MAX);
    const d1 = extractLabeled(google, ["Açıklama 1"], REKLAM_GOOGLE_DESCRIPTION_MAX);
    const d2 = extractLabeled(google, ["Açıklama 2"], REKLAM_GOOGLE_DESCRIPTION_MAX);

    const metaBlock = body.includes("### Meta") ? body.slice(body.indexOf("### Meta")) : "";
    const metaPrimary = extractLabeled(metaBlock, ["Ana Metin"], REKLAM_META_PRIMARY_MAX);
    const metaHeadline = extractLabeled(metaBlock, ["Başlık"], REKLAM_META_HEADLINE_MAX);

    const keywordBody = /### Anahtar kelimeler\n([\s\S]*?)(?=\n### |\n## |$)/i.exec(body)?.[1] ?? "";
    const negativeBody = /### Negatif anahtar kelimeler\n([\s\S]*?)(?=\n### |\n## |$)/i.exec(body)?.[1] ?? "";
    const keywords = keywordBody
      .split("\n")
      .map((line) => cleanLine(line.replace(/^[-*]\s+/, "")))
      .filter((line) => line.length >= 2)
      .slice(0, 12);
    const negatives = negativeBody
      .split("\n")
      .map((line) => cleanLine(line.replace(/^[-*]\s+/, "")))
      .filter((line) => line.length >= 2)
      .slice(0, 8);

    const brief = /### Görsel brif\n([\s\S]*?)(?=\n## |$)/i.exec(body)?.[1] ?? "";
    const frame = extractLabeled(brief, ["Kadraj"], 160);
    const overlay = extractLabeled(brief, ["Görsel üstü yazı", "Üst yazı"], 160);
    const hidden = extractLabeled(brief, ["Gösterilmeyecek", "Gösterme"], 160);

    if (!h1 || !h2 || !h3 || !d1 || !d2 || !metaPrimary || !metaHeadline || !frame || !overlay || !hidden) {
      return null;
    }
    if (keywords.length < 1 || negatives.length < 1) {
      return null;
    }

    variants.push({
      id: meta.id,
      angle: meta.angle,
      heading: meta.heading,
      googleHeadlines: [h1, h2, h3],
      googleDescriptions: [d1, d2],
      metaHeadline,
      metaPrimary,
      keywords,
      negatives,
      frame,
      overlay,
      hidden,
    });
  }

  if (variants.length !== 3) {
    return null;
  }

  const audience = sections.get("hedef kitle") ?? "";
  const interests =
    audience
      .split("\n")
      .map((line) => cleanLine(line))
      .find((line) => line.toLocaleLowerCase("tr-TR").startsWith("ilgi alanları:"))
      ?.replace(/^ilgi alanları:\s*/i, "")
      .trim() ?? "";
  const aimCta = cleanLine((sections.get("amaç çağrısı") ?? "").split("\n")[0] ?? "");

  return {
    businessName,
    place: placeRaw,
    sectorLabel: sectorRaw,
    aimCta: aimCta || REKLAM_AIM_CTA.whatsapp,
    interests,
    offer: "",
    budget,
    variants: [variants[0]!, variants[1]!, variants[2]!],
    disclaimer: REKLAM_DISCLAIMER,
  };
}

/** Test ve dış kullanım için sahte metrik süzgeci. */
export function reklamRejectsMetric(line: string): boolean {
  return METRIC.test(line);
}
