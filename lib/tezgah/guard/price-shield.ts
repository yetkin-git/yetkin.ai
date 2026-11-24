/**
 * Para / süre / garanti kalkanı.
 * Kullanıcının kendi metninde olmayan ücret, döviz tutarı veya kesin vaat satırını düşürür.
 * Reklam ve teklif masaları aynı mührü kullanır.
 */

const CURRENCY_AMOUNT =
  /(?:₺\s*)(\d[\d.]*)|(?:\$|€|£)\s*(\d[\d.]*)|(\d[\d.]*)\s*(?:₺|tl|lira|usd|eur|euro|dolar|dollar)\b/gi;

const WRITTEN_TRY =
  /\b(?:elli|yüz|bin|milyon)\s*(?:\w+\s*){0,3}(?:bin\s+)?(?:tl|lira|türk\s*liras[ıi])\b/i;

const GUARANTEE =
  /\b(?:garanti(?:si|yiz|edir)?|kesin\s+(?:sonuç|getiri|satış|kazanç)|%\s*\d{1,3}\s*(?:artış|büyüme|dönüşüm)|iade\s+garantisi|para\s+iade\s+garantisi)\b/i;

function moneyTokens(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(CURRENCY_AMOUNT)) {
    const token = (match[1] ?? match[2] ?? match[3] ?? "").replace(/\./g, "");
    if (token) {
      found.add(token);
    }
  }
  return [...found];
}

/** Satır, kaynak metinde olmayan bir tutar veya yalnız para işareti uyduruyorsa true. */
export function inventsMoney(line: string, allowedSource: string): boolean {
  const allowed = new Set(moneyTokens(allowedSource));
  const used = moneyTokens(line);
  if (used.length === 0) {
    if (/(?:₺|\$|€|£)/.test(line) && allowed.size === 0) {
      return true;
    }
    return WRITTEN_TRY.test(line) && !WRITTEN_TRY.test(allowedSource);
  }
  return used.some((token) => !allowed.has(token));
}

/** Kesin garanti / getiri vaadi; kullanıcının kendi cümlesinde yoksa düşer. */
export function inventsGuarantee(line: string, allowedSource: string): boolean {
  if (!GUARANTEE.test(line)) {
    return false;
  }
  return !GUARANTEE.test(allowedSource);
}

export function lineInventedCommercialClaim(line: string, allowedSource: string): boolean {
  return inventsMoney(line, allowedSource) || inventsGuarantee(line, allowedSource);
}

/**
 * Markdown satırlarını süzer. Başlık satırları (`## `) korunur.
 * Uydurma ücret/garanti satırı atılır; kullanıcının kendi tutarı geçer.
 */
export function applyPriceShield(markdown: string, allowedSource: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const kept: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      kept.push(line);
      continue;
    }
    if (trimmed.startsWith("#")) {
      kept.push(line);
      continue;
    }
    if (lineInventedCommercialClaim(trimmed, allowedSource)) {
      continue;
    }
    kept.push(line);
  }
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Reklam mührünün kullandığı tutar jetonları (paylaşılan kaynak). */
export function priceShieldMoneyTokens(text: string): string[] {
  return moneyTokens(text);
}
