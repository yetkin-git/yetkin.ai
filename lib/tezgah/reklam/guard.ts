import { dukkanSectorById } from "@/lib/tezgah/dukkan/copy";
import {
  REKLAM_AIM_CTA,
  REKLAM_DISCLAIMER,
  REKLAM_GOOGLE_DESCRIPTION_MAX,
  REKLAM_GOOGLE_TITLE_MAX,
  REKLAM_SECTOR_INTERESTS,
  type ReklamAim,
} from "@/lib/tezgah/reklam/copy";
import type { ReklamDraft } from "@/lib/tezgah/reklam/schema";

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

function moneyTokens(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(/(?:₺\s*)(\d[\d.]*)|(\d[\d.]*)\s*(?:₺|tl|lira)\b/gi)) {
    const token = (match[1] ?? match[2] ?? "").replace(/\./g, "");
    if (token) {
      found.add(token);
    }
  }
  return [...found];
}

function inventsMoney(line: string, offer: string): boolean {
  const allowed = new Set(moneyTokens(offer));
  const used = moneyTokens(line);
  if (used.length === 0) {
    return /₺/.test(line) && allowed.size === 0;
  }
  return used.some((token) => !allowed.has(token));
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

function bullets(body: string, offer: string, aim: ReklamAim, max: number): string[] {
  const kept: string[] = [];
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("- ")) {
      continue;
    }
    const text = cleanLine(trimmed.slice(2));
    if (units(text) < 2 || units(text) > max || !lineKept(text, offer, aim)) {
      continue;
    }
    kept.push(text);
  }
  return kept;
}

function plainBody(body: string, offer: string, aim: ReklamAim, max: number): string | null {
  const kept = body
    .split("\n")
    .map((line) => cleanLine(line))
    .filter((line) => line.length > 0 && lineKept(line, offer, aim));
  if (kept.length === 0) {
    return null;
  }
  const text = cleanLine(kept.join(" "));
  if (units(text) < 2 || units(text) > max) {
    return null;
  }
  return text;
}

function labeled(body: string, labels: readonly string[], offer: string, aim: ReklamAim): string | null {
  for (const rawLine of body.split("\n")) {
    const line = cleanLine(rawLine);
    const lower = line.toLocaleLowerCase("tr-TR");
    for (const label of labels) {
      const probe = label.toLocaleLowerCase("tr-TR");
      if (!lower.startsWith(probe)) {
        continue;
      }
      const value = cleanLine(line.slice(label.length).replace(/^[:\s-]+/, ""));
      if (units(value) < 2 || units(value) > 160 || !lineKept(value, offer, aim)) {
        return null;
      }
      return value;
    }
  }
  return null;
}

/**
 * Model metnini reklam paketine mühürler.
 * Google başlığı 30, açıklaması 90 karakteri aşarsa ya da zorunlu parça eksikse null döner.
 * Şehir, ilgi alanı, amaç çağrısı ve kapanış cümlesi kodun metnidir.
 */
export function sealReklamMarkdown(raw: string, draft: ReklamDraft): string | null {
  const sections = sectionsOf(raw);
  const hooks = bullets(sections.get("kancalar") ?? "", draft.offer, draft.aim, 180).slice(0, 3);
  if (hooks.length !== 3) {
    return null;
  }
  const metaTitle = plainBody(sections.get("meta başlık") ?? "", draft.offer, draft.aim, 120);
  const metaBody = plainBody(sections.get("meta metin") ?? "", draft.offer, draft.aim, 600);
  const googleTitle = plainBody(sections.get("google başlık") ?? "", draft.offer, draft.aim, REKLAM_GOOGLE_TITLE_MAX);
  const googleDescription = plainBody(
    sections.get("google açıklama") ?? "",
    draft.offer,
    draft.aim,
    REKLAM_GOOGLE_DESCRIPTION_MAX,
  );
  const keywords = bullets(sections.get("anahtar kelimeler") ?? "", draft.offer, draft.aim, 40).slice(0, 12);
  const brief = sections.get("görsel brif") ?? "";
  const frame = labeled(brief, ["Kadraj"], draft.offer, draft.aim);
  const overlay = labeled(brief, ["Görsel üstü yazı", "Üst yazı"], draft.offer, draft.aim);
  const hidden = labeled(brief, ["Gösterilmeyecek", "Gösterme"], draft.offer, draft.aim);
  if (!metaTitle || !metaBody || !googleTitle || !googleDescription || keywords.length < 3 || !frame || !overlay || !hidden) {
    return null;
  }
  if (units(googleTitle) > REKLAM_GOOGLE_TITLE_MAX || units(googleDescription) > REKLAM_GOOGLE_DESCRIPTION_MAX) {
    return null;
  }

  const sector = dukkanSectorById(draft.sector);
  const interests = REKLAM_SECTOR_INTERESTS[draft.sector].join(", ");
  return [
    `# ${draft.businessName}`,
    `${draft.place} · ${sector.label}`,
    "",
    "## Kancalar",
    ...hooks.map((hook) => `- ${hook}`),
    "",
    "## Meta",
    `Başlık: ${metaTitle}`,
    metaBody,
    "",
    "## Google Arama",
    `Başlık: ${googleTitle}`,
    `Açıklama: ${googleDescription}`,
    "",
    "## Hedef kitle",
    `Şehir: ${draft.place}`,
    `İlgi alanları: ${interests}`,
    "",
    "## Anahtar kelimeler",
    ...keywords.map((word) => `- ${word}`),
    "",
    "## Görsel brif",
    `Kadraj: ${frame}`,
    `Görsel üstü yazı: ${overlay}`,
    `Gösterilmeyecek: ${hidden}`,
    "",
    "## Amaç çağrısı",
    REKLAM_AIM_CTA[draft.aim],
    "",
    REKLAM_DISCLAIMER,
  ].join("\n");
}
