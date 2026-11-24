import { z } from "zod";

const section = z.string().trim().min(12).max(1200);

const narrativeSchema = z.object({
  purpose: section,
  market: section,
  risk: section,
});

const MONEY_WORD =
  /₺|\b(?:tl|try|usd|eur|lira)\b|%|resm[iî]\s+onay|hibe\s+tutar|\bpazar\s+pay\w*/iu;
/**
 * "yüzde 75", "yüzde altmış" gibi oran cümleleri. `RATE_WORD` (`oran`) yalnız
 * "oran" kelimesini görüyordu; "yüzde 75 destek alır" kaçıyordu (F1.9).
 */
const WRITTEN_PERCENT = /yüzde\s+(?:\d+|[a-zçğıöşü]+)/iu;
/**
 * Büyüklük kelimeleri. **Para/oran bağlamında** aranır: "iki yüz metrekare" veya
 * "iki bin adet" gibi fiziksel kapasite ifadeleri silinmez.
 */
const MAGNITUDE = /\b(?:bin|milyon|milyar)\b/iu;
/** Fiziksel kapasite birimi. Yanındaysa büyüklük/sayı ifadesi para/oran sayılmaz. */
const PHYSICAL_UNIT =
  /(?:metrekare|m2|m²|adet|birim|kişi|kisi|personel|ay|gün|gun|ton|kg|litre|kw|ürün|urun|işletme|isletme|şube|sube|müşteri|musteri|istihdam)\b/iu;
/** Para/oran bağlamı. Büyüklük yalnız bu bağlamda yasaklanır. */
const MONEY_OR_RATE_CONTEXT =
  /₺|\b(?:tl|try|lira|liraya|bütçe|butce|fon|kredi|tutar|oran|faiz|kâr|kar|ciro|hasılat|gelir|harcama|maliyet|fiyat)\b|%/iu;
/**
 * Yazıyla verilmiş tutar. "iki yüz metrekare" gibi fiziksel kapasite ifadeleri
 * yanlışlıkla silinmesin diye para birimi bağlamı aranır (Ş4 / F1.9).
 */
const WRITTEN_AMOUNT =
  /\b(?:bir|iki|üç|uc|dört|dort|beş|bes|altı|alti|yedi|sekiz|dokuz|on|yirmi|otuz|kırk|kirk|elli|altmış|altmis|yetmiş|yetmis|seksen|doksan|yüz|yuz)\s+(?:yüz|yuz)?\s*(?:bin|milyon|milyar)?\s*(?:lira|tl)\b/iu;
const RATE_WORD = /oran\w*/iu;
const MONEY_DIGITS = /(?:₺|\b(?:tl|try|lira|bütçe|butce|oran)\b)\s*\d{4,}|\d{4,}\s*(?:₺|\b(?:tl|try|lira)\b)/iu;

/**
 * Büyüklük kelimesi para/oran bağlamında mı? "iki yüz metrekare" hayır,
 * "iki yüz bin lira" evet. Yalnız para/oran bağlamı yasaklanır; fiziksel kapasite korunur.
 */
export function magnitudeIsMoneyContext(line: string): boolean {
  if (!MAGNITUDE.test(line)) {
    return false;
  }
  if (PHYSICAL_UNIT.test(line) && !/₺|%|\b(?:tl|try|lira|oran)\b/iu.test(line)) {
    return false;
  }
  return MONEY_OR_RATE_CONTEXT.test(line);
}

function lineBanned(line: string): boolean {
  return (
    MONEY_WORD.test(line) ||
    WRITTEN_PERCENT.test(line) ||
    magnitudeIsMoneyContext(line) ||
    WRITTEN_AMOUNT.test(line) ||
    RATE_WORD.test(line) ||
    MONEY_DIGITS.test(line)
  );
}

export type GrantNarrative = {
  purpose: string;
  market: string;
  risk: string;
};

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/u, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

function cleanSection(value: string): string | null {
  const cleaned = value
    .replace(/\u0000/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !lineBanned(line))
    .join("\n")
    .trim();
  if (cleaned.length < 12 || cleaned.length > 1200) {
    return null;
  }
  return cleaned;
}

export function readGrantNarrative(text: string): GrantNarrative | null {
  const parsed = narrativeSchema.safeParse(extractJson(text));
  if (!parsed.success) {
    return null;
  }
  const purpose = cleanSection(parsed.data.purpose);
  const market = cleanSection(parsed.data.market);
  const risk = cleanSection(parsed.data.risk);
  if (!purpose || !market || !risk) {
    return null;
  }
  return { purpose, market, risk };
}

const dossierSchema = narrativeSchema.extend({
  summary: section,
  budgetRationale: section,
  competencyNote: section,
  commercialization: section,
});

const DOSSIER_PROMISE =
  /onaylan(?:ır|ir|acak|mıştır|mistir)|garanti\s+edilir|kesin\s+(?:destek|hibe)|çağrı\s+kod\w*|cagri\s+kod\w*|destek\s+tavan\w*|\b20\d{2}\s*\/\s*\d\b/iu;

export type GrantDossierNarrative = GrantNarrative & {
  summary: string;
  budgetRationale: string;
  competencyNote: string;
  commercialization: string;
};

function cleanDossierSection(value: string): string | null {
  const cleaned = value
    .replace(/\u0000/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !lineBanned(line) && !DOSSIER_PROMISE.test(line))
    .join("\n")
    .trim();
  if (cleaned.length < 12 || cleaned.length > 1200) {
    return null;
  }
  return cleaned;
}

export function readGrantDossierNarrative(text: string): GrantDossierNarrative | null {
  const parsed = dossierSchema.safeParse(extractJson(text));
  if (!parsed.success) {
    return null;
  }
  const purpose = cleanDossierSection(parsed.data.purpose);
  const market = cleanDossierSection(parsed.data.market);
  const risk = cleanDossierSection(parsed.data.risk);
  const summary = cleanDossierSection(parsed.data.summary);
  const budgetRationale = cleanDossierSection(parsed.data.budgetRationale);
  const competencyNote = cleanDossierSection(parsed.data.competencyNote);
  const commercialization = cleanDossierSection(parsed.data.commercialization);
  if (!purpose || !market || !risk || !summary || !budgetRationale || !competencyNote || !commercialization) {
    return null;
  }
  return { purpose, market, risk, summary, budgetRationale, competencyNote, commercialization };
}
