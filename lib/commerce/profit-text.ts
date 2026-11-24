/**
 * AI metin mührü — kâr / indirim / fiyat rakamı uydurulamaz.
 *
 * Birim kalkanı (P2): izin verilen sayılar **tip taşır**. Kuruş değeri TL gibi,
 * TL değeri kuruş gibi yazılamaz. `8500` kuruş izinliyken metinde `"8500 TL"`
 * geçerse kalkan **reddeder** — 100 katı hata metne sızamaz.
 *
 * Üç izin türü:
 * - `rawMinor`  → yalnız birimsiz kuruş olarak yazılabilir (ya da `kuruş` ekiyle).
 * - `formattedTry` → yalnız `TL`/`₺`/`lira` ekiyle yazılabilir.
 * - `percent`   → yalnız `%` önekiyle yazılabilir.
 */

const DIGIT_RUN = /\d[\d.,]*/g;

export type NumberAllowance =
  | { kind: "rawMinor"; value: number }
  | { kind: "formattedTry"; value: string }
  | { kind: "percent"; value: number };

/** Eski imza ile uyum: sayı → `rawMinor`, `"85,00"` biçimindeki metin → `formattedTry`. */
export function normalizeAllowance(value: string | number | NumberAllowance): NumberAllowance | null {
  if (typeof value === "number") {
    return Number.isInteger(value) ? { kind: "rawMinor", value } : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (/^-?\d+$/.test(trimmed)) {
      const parsed = Number.parseInt(trimmed, 10);
      return Number.isSafeInteger(parsed) ? { kind: "rawMinor", value: parsed } : null;
    }
    if (/^\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?$/.test(trimmed) || /^\d+(?:,\d{1,2})?$/.test(trimmed)) {
      return { kind: "formattedTry", value: trimmed };
    }
    return null;
  }
  if (value == null || typeof value !== "object") {
    return null;
  }
  if (value.kind === "rawMinor" && Number.isInteger(value.value)) {
    return { kind: "rawMinor", value: value.value };
  }
  if (value.kind === "formattedTry" && typeof value.value === "string") {
    return { kind: "formattedTry", value: value.value.trim() };
  }
  if (value.kind === "percent" && Number.isInteger(value.value)) {
    return { kind: "percent", value: value.value };
  }
  return null;
}

/** TL metnini karşılaştırma anahtarına indirger: `"8.500,00"` → `"8500,00"`. */
function normalizeTryText(value: string): string {
  const trimmed = value.trim().replace(/^₺\s*/, "");
  const withoutThousands = trimmed.replace(/\./g, "");
  const [whole = "", fraction] = withoutThousands.split(",");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "") || "0";
  if (fraction == null || fraction === "") {
    return normalizedWhole;
  }
  return `${normalizedWhole},${fraction}`;
}

/** Kuruş değerini TL metnine çevirir (`8500` → `"85,00"`). */
export function tryTextFromMinor(minor: number): string {
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(minor));
  return `${sign}${Math.trunc(abs / 100)},${String(abs % 100).padStart(2, "0")}`;
}

type Token = {
  /** Metindeki ham sayı dizisi (nokta/virgül dahil). */
  raw: string;
  /** Birimsiz, `TL` ve `%` eki ayrıştırılmış sayı. */
  digits: string;
  /** Sayıdan hemen önce `%` var mı. */
  percentPrefix: boolean;
  /** Sayıdan sonra gelen para birimi (varsa). */
  currency: "TRY" | "MINOR" | null;
};

function readNumberPrefix(text: string, index: number): boolean {
  let cursor = index - 1;
  while (cursor >= 0 && /\s/.test(text[cursor] ?? "")) {
    cursor -= 1;
  }
  return text[cursor] === "%";
}

/**
 * Sayıdan sonra gelen para birimi. `kuruş`/`lira` gibi Türkçe harfle biten
 * birimlerde `\b` sınırı çalışmaz (ş, ı, ü kelime karakteri değildir); bu
 * yüzden sınır yerine açık "kelime bitişi" kontrolü kullanılır.
 */
const CURRENCY_SUFFIX = /^\s*(?:(₺)|(tl|lira|kuruş|kurus)(?![A-Za-zÀ-ÿ]))/i;

function readCurrencySuffix(text: string, endIndex: number): "TRY" | "MINOR" | null {
  const tail = text.slice(endIndex, endIndex + 16);
  const match = CURRENCY_SUFFIX.exec(tail);
  if (!match) {
    return null;
  }
  const unit = (match[1] ?? match[2] ?? "").toLowerCase();
  if (unit === "kuruş" || unit === "kurus") {
    return "MINOR";
  }
  return "TRY";
}

/** Metindeki tüm sayı dizilerini birim bilgisiyle toplar. */
export function numberTokensIn(text: string): Token[] {
  const tokens: Token[] = [];
  for (const match of text.matchAll(DIGIT_RUN)) {
    const raw = match[0];
    const index = match.index ?? 0;
    const endIndex = index + raw.length;
    // Rakamın hemen arkasındaki `%` (ör. "25%") yüzde sayılır; para birimi değildir.
    const trailingPercent = text[endIndex] === "%";
    tokens.push({
      raw,
      digits: raw.replace(/[.,]/g, ""),
      percentPrefix: readNumberPrefix(text, index),
      currency: trailingPercent ? null : readCurrencySuffix(text, endIndex),
    });
  }
  return tokens;
}

/** Metindeki para tokenları (`moneyTokensIn` eski sözleşmesi) — birim bilgisiyle. */
export function moneyTokensIn(text: string): string[] {
  const found = new Set<string>();
  for (const token of numberTokensIn(text)) {
    if (token.currency != null) {
      found.add(token.digits);
    }
  }
  return [...found];
}

/** Üç birimin sayısal izin kümeleri. */
export type AllowanceIndex = {
  minor: Set<string>;
  tryText: Set<string>;
  percent: Set<string>;
  /** Birimsiz ham sayı olarak da kabul edilen biçimli TL (ör. "85,00"). */
  tryRaw: Set<string>;
};

export function buildAllowanceIndex(allowed: readonly (string | number | NumberAllowance)[]): AllowanceIndex {
  const index: AllowanceIndex = {
    minor: new Set<string>(),
    tryText: new Set<string>(),
    percent: new Set<string>(),
    tryRaw: new Set<string>(),
  };
  for (const raw of allowed) {
    const item = normalizeAllowance(raw);
    if (!item) {
      continue;
    }
    if (item.kind === "rawMinor") {
      index.minor.add(String(item.value));
      // Kuruş değeri TL metnine de çevrilebilir: 8500 kuruş = "85,00" TL.
      index.tryText.add(normalizeTryText(tryTextFromMinor(item.value)));
    } else if (item.kind === "formattedTry") {
      index.tryText.add(normalizeTryText(item.value));
    } else {
      index.percent.add(String(item.value));
    }
  }
  return index;
}

/**
 * Metindeki her sayı uygun birimle yazılmış mı?
 *
 * - `%` önekli sayı yalnız `percent` izninden gelir.
 * - `TL`/`₺`/`lira` ekli sayı yalnız `tryText` izninden gelir.
 * - `kuruş` ekli veya birimsiz sayı yalnız `minor` izninden gelir.
 *
 * `8500` kuruş izinliyken `"8500 TL"` **reddedilir**.
 */
export function textStaysOnNumbers(
  text: string,
  allowed: readonly (string | number | NumberAllowance)[],
): boolean {
  const index = buildAllowanceIndex(allowed);
  for (const token of numberTokensIn(text)) {
    if (token.percentPrefix) {
      if (!index.percent.has(token.digits)) {
        return false;
      }
      continue;
    }
    if (token.currency === "TRY") {
      const normalized = normalizeTryText(token.raw);
      if (index.tryText.has(normalized)) {
        continue;
      }
      // "85" TL, 85,00 TL demek olabilir; ama "8500" TL asla 8500 kuruş değildir.
      if (index.minor.has(token.digits)) {
        return false;
      }
      return false;
    }
    if (token.currency === "MINOR") {
      // Kuruş yalnız tam sayıdır. "85,00 kuruş" ayraç silinince 8500 olup rawMinor'a sızmasın.
      if (/[.,]/.test(token.raw)) {
        return false;
      }
      if (!index.minor.has(token.digits)) {
        return false;
      }
      continue;
    }
    // Birimsiz sayı: düz tam sayı kuruş izninden gelir. Ondalık/binlik ayraç
    // taşıyan sayı ("85,00" / "8.500") birim yazılmadığı için belirsizdir:
    // yalnız biçimli TL izni varsa kabul edilir. Kuruş değeri TL gibi sızmaz.
    if (/[.,]/.test(token.raw)) {
      const normalized = normalizeTryText(token.raw);
      if (index.tryText.has(normalized)) {
        continue;
      }
      return false;
    }
    if (index.minor.has(token.digits)) {
      continue;
    }
    return false;
  }
  return true;
}

/** Doğruysa metni döndürür; değilse boş metin (mühür: metin yazılmaz). */
export function scrubInventedNumbers(
  text: string,
  allowed: readonly (string | number | NumberAllowance)[],
): string {
  if (textStaysOnNumbers(text, allowed)) {
    return text.trim().slice(0, 500);
  }
  return "";
}

export function formatTryFromMinor(minor: number): string {
  const whole = Math.trunc(minor / 100);
  const kurus = Math.abs(minor % 100);
  return `${whole},${String(kurus).padStart(2, "0")}`;
}
