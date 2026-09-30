/**
 * Ölçü, adet ve yüzde: kaynak ve TTS kelimeyle durur, ekran/altyazı rakam basar.
 * «elliye yetmiş santimetre, iki adet» → ekranda «50x70 cm, 2 adet».
 * Saat («on saat», «kırk saat») takvim cümlesidir; rakama dönmez.
 */

const ONES = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"] as const;
const TENS = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"] as const;

type NumKind = "one" | "ten" | "hundred" | "thousand";

type Atom = {
  kind: NumKind;
  value: number;
  dative: boolean;
  suffix: string;
};

const ATOMIC: Readonly<Record<string, { kind: NumKind; value: number }>> = {
  sıfır: { kind: "one", value: 0 },
  bir: { kind: "one", value: 1 },
  iki: { kind: "one", value: 2 },
  üç: { kind: "one", value: 3 },
  dört: { kind: "one", value: 4 },
  beş: { kind: "one", value: 5 },
  altı: { kind: "one", value: 6 },
  yedi: { kind: "one", value: 7 },
  sekiz: { kind: "one", value: 8 },
  dokuz: { kind: "one", value: 9 },
  on: { kind: "ten", value: 10 },
  yirmi: { kind: "ten", value: 20 },
  otuz: { kind: "ten", value: 30 },
  kırk: { kind: "ten", value: 40 },
  elli: { kind: "ten", value: 50 },
  altmış: { kind: "ten", value: 60 },
  yetmiş: { kind: "ten", value: 70 },
  seksen: { kind: "ten", value: 80 },
  doksan: { kind: "ten", value: 90 },
  yüz: { kind: "hundred", value: 100 },
  bin: { kind: "thousand", value: 1000 },
};

const NUMBER_SUFFIXES = [
  "den",
  "dan",
  "ten",
  "tan",
  "nin",
  "nın",
  "nun",
  "nün",
  "dir",
  "dır",
  "dur",
  "dür",
  "in",
  "ın",
  "un",
  "ün",
  "ye",
  "ya",
  "yi",
  "yı",
  "de",
  "da",
  "te",
  "ta",
  "e",
  "a",
  "i",
  "ı",
  "u",
  "ü",
] as const;

/** «birden» ve «yüzden» sayı değil, bağlaçtır. */
const NOT_A_NUMBER = new Set(["birden", "yüzden"]);

function trLower(word: string): string {
  return word.toLocaleLowerCase("tr-TR");
}

function turkishDativeWord(word: string): string {
  const lower = trLower(word);
  const vowels = [...lower].filter((ch) => "aeıioöuü".includes(ch));
  const lastVowel = vowels[vowels.length - 1] ?? "a";
  const front = "eiöü".includes(lastVowel);
  const last = lower.slice(-1);
  const endsVowel = "aeıioöuü".includes(last);
  const suffix = endsVowel ? (front ? "ye" : "ya") : front ? "e" : "a";
  return lower + suffix;
}

const DATIVE_TO_BASE: Readonly<Record<string, string>> = Object.fromEntries(
  Object.keys(ATOMIC).map((word) => [turkishDativeWord(word), word]),
);

function lookupLoose(word: string): Atom | null {
  if (NOT_A_NUMBER.has(word)) return null;
  const direct = ATOMIC[word];
  if (direct) return { ...direct, dative: false, suffix: "" };
  const dativeBase = DATIVE_TO_BASE[word];
  if (dativeBase && ATOMIC[dativeBase]) {
    return { ...ATOMIC[dativeBase], dative: true, suffix: "" };
  }
  for (const suffix of NUMBER_SUFFIXES) {
    if (!word.endsWith(suffix) || word.length <= suffix.length) continue;
    const stem = word.slice(0, -suffix.length);
    const base = ATOMIC[stem];
    if (!base || base.value === 0) continue;
    return { ...base, dative: false, suffix };
  }
  return null;
}

function evalParts(parts: readonly Atom[]): number | null {
  if (parts.length === 1 && parts[0]?.kind === "one" && parts[0].value === 0) return 0;
  let i = 0;
  let value = 0;
  const cur = () => parts[i];
  const nxt = () => parts[i + 1];
  if (cur()?.kind === "one" && (cur()?.value ?? 0) >= 1 && nxt()?.kind === "thousand") {
    value += cur()!.value * 1000;
    i += 2;
  } else if (cur()?.kind === "thousand") {
    value += 1000;
    i += 1;
  }
  if (cur()?.kind === "one" && (cur()?.value ?? 0) >= 1 && nxt()?.kind === "hundred") {
    value += cur()!.value * 100;
    i += 2;
  } else if (cur()?.kind === "hundred") {
    value += 100;
    i += 1;
  }
  if (cur()?.kind === "ten") {
    value += cur()!.value;
    i += 1;
  }
  if (cur()?.kind === "one" && (cur()?.value ?? 0) >= 1) {
    value += cur()!.value;
    i += 1;
  }
  if (i !== parts.length || value === 0) return null;
  return value;
}

type Tok = {
  start: number;
  end: number;
  word: string;
  commaBefore: boolean;
};

type Phrase = {
  start: number;
  end: number;
  value: number;
  dative: boolean;
  suffix: string;
};

type Span = { start: number; end: number; text: string };

type Hit = { next: number; span: Span };

function tokenize(text: string): Tok[] {
  const tokens: Tok[] = [];
  let prevEnd = 0;
  for (const match of text.matchAll(/\p{L}+/gu)) {
    const start = match.index ?? 0;
    const raw = match[0] ?? "";
    const end = start + raw.length;
    tokens.push({
      start,
      end,
      word: trLower(raw),
      commaBefore: text.slice(prevEnd, start).includes(","),
    });
    prevEnd = end;
  }
  return tokens;
}

function parsePhrase(tokens: readonly Tok[], index: number, allowDative: boolean): Phrase | null {
  let best: Phrase | null = null;
  const buf: Atom[] = [];
  const max = Math.min(tokens.length, index + 6);
  for (let j = index; j < max; j += 1) {
    const atom = lookupLoose(tokens[j]!.word);
    if (!atom) break;
    if (atom.dative && !allowDative) break;
    buf.push(atom);
    const value = evalParts(buf);
    if (value === null) break;
    best = {
      start: index,
      end: j + 1,
      value,
      dative: atom.dative,
      suffix: atom.suffix,
    };
    if (atom.dative || atom.suffix) break;
  }
  return best;
}

type UnitMatch = { display: string; mode: "abbrev" | "keep" };

function matchUnit(word: string): UnitMatch | null {
  if (/^santimetre(?:dir|dır|dur|dür|lik|lık|de|den|ye|si|nin|sinde|sinden)?$/u.test(word)) {
    return { display: "cm", mode: "abbrev" };
  }
  if (/^mililitre(?:dir|dır|dur|dür|lik|lık|de|den|ye|si)?$/u.test(word)) {
    return { display: "ml", mode: "abbrev" };
  }
  if (/^adet(?:tir|tır|tur|tür|i|in|e|ten|tan|te|ta|lik|lık|ler|lar)?$/u.test(word)) {
    return { display: "adet", mode: "keep" };
  }
  if (/^lira(?:sı|nın|nin|nun|nün|ya|yı|yi|da|de|dan|den|lık|lik|dır|dir|dur|dür)?$/u.test(word)) {
    return { display: "lira", mode: "keep" };
  }
  if (/^saniye(?:de|den|dir|dır|lik|lık|si|ye|yi)?$/u.test(word)) {
    return { display: "saniye", mode: "keep" };
  }
  if (/^dakika(?:da|dan|dır|dir|lık|lik|sı|ya|yı)?$/u.test(word)) {
    return { display: "dakika", mode: "keep" };
  }
  return null;
}

function renderGroups(text: string, tokens: readonly Tok[], groups: readonly Phrase[], unitDisplay: string): string {
  let built = "";
  for (let g = 0; g < groups.length; g += 1) {
    const group = groups[g]!;
    if (g > 0) {
      const prev = groups[g - 1]!;
      built += text.slice(tokens[prev.end - 1]!.end, tokens[group.start]!.start);
    }
    const suffix = group.suffix ? `'${group.suffix}` : "";
    built += `${group.value}${suffix} ${unitDisplay}`;
  }
  return built;
}

function tryPercent(tokens: readonly Tok[], index: number): Hit | null {
  if (tokens[index]?.word !== "yüzde") return null;
  const phrase = parsePhrase(tokens, index + 1, false);
  if (!phrase || phrase.dative) return null;
  const suffix = phrase.suffix ? `'${phrase.suffix}` : "";
  return {
    next: phrase.end,
    span: {
      start: tokens[index]!.start,
      end: tokens[phrase.end - 1]!.end,
      text: `%${phrase.value}${suffix}`,
    },
  };
}

function tryDimension(tokens: readonly Tok[], index: number): Hit | null {
  const left = parsePhrase(tokens, index, true);
  if (!left?.dative || left.value < 20 || left.start !== index) return null;
  const right = parsePhrase(tokens, left.end, false);
  if (!right || right.dative) return null;
  const unitTok = tokens[right.end];
  const unit = unitTok ? matchUnit(unitTok.word) : null;
  if (unit?.mode === "abbrev") {
    return {
      next: right.end + 1,
      span: {
        start: tokens[index]!.start,
        end: unitTok!.end,
        text: `${left.value}x${right.value} ${unit.display}`,
      },
    };
  }
  if (unitTok && /^(?:havlu|havlusu)$/u.test(unitTok.word)) {
    return {
      next: right.end,
      span: {
        start: tokens[index]!.start,
        end: tokens[right.end - 1]!.end,
        text: `${left.value}x${right.value}`,
      },
    };
  }
  return null;
}

function tryMeasure(text: string, tokens: readonly Tok[], index: number): Hit | null {
  const first = parsePhrase(tokens, index, false);
  if (!first || first.dative || first.start !== index) return null;
  const groups: Phrase[] = [first];
  let k = first.end;
  while (k < tokens.length && tokens[k]!.commaBefore) {
    let p = k;
    let labels = 0;
    while (
      p < tokens.length &&
      labels < 3 &&
      !lookupLoose(tokens[p]!.word) &&
      !matchUnit(tokens[p]!.word)
    ) {
      labels += 1;
      p += 1;
    }
    const next = p < tokens.length ? parsePhrase(tokens, p, false) : null;
    if (!next || next.dative) break;
    groups.push(next);
    k = next.end;
  }
  const unitTok = tokens[k];
  if (!unitTok) return null;
  const unit = matchUnit(unitTok.word);
  if (!unit) return null;
  const displayUnit = unit.mode === "abbrev" ? unit.display : text.slice(unitTok.start, unitTok.end);
  return {
    next: k + 1,
    span: {
      start: tokens[groups[0]!.start]!.start,
      end: unitTok.end,
      text: renderGroups(text, tokens, groups, displayUnit),
    },
  };
}

function applySpans(text: string, spans: readonly Span[]): string {
  let out = text;
  for (const span of [...spans].reverse()) {
    out = out.slice(0, span.start) + span.text + out.slice(span.end);
  }
  return out;
}

/** Konuşma metnindeki ölçü, adet, lira, süre ve yüzdeyi ekran rakamına çevirir. */
export function applySpokenMeasuresToDisplay(text: string): string {
  const tokens = tokenize(text);
  const spans: Span[] = [];
  let i = 0;
  while (i < tokens.length) {
    const hit = tryPercent(tokens, i) ?? tryDimension(tokens, i) ?? tryMeasure(text, tokens, i);
    if (!hit) {
      i += 1;
      continue;
    }
    spans.push(hit.span);
    i = hit.next;
  }
  return applySpans(text, spans);
}

function turkishCardinal(n: number): string | null {
  if (!Number.isInteger(n) || n < 0 || n > 9999) return null;
  if (n === 0) return "sıfır";
  const parts: string[] = [];
  let rest = n;
  if (rest >= 1000) {
    const thousands = Math.floor(rest / 1000);
    parts.push(thousands === 1 ? "bin" : `${ONES[thousands]} bin`);
    rest %= 1000;
  }
  if (rest >= 100) {
    const hundreds = Math.floor(rest / 100);
    parts.push(hundreds === 1 ? "yüz" : `${ONES[hundreds]} yüz`);
    rest %= 100;
  }
  if (rest >= 10) {
    parts.push(TENS[Math.floor(rest / 10)]!);
    rest %= 10;
  }
  if (rest > 0) parts.push(ONES[rest]!);
  return parts.join(" ");
}

function turkishDativePhrase(n: number): string | null {
  const words = turkishCardinal(n);
  if (!words) return null;
  const parts = words.split(" ");
  parts[parts.length - 1] = turkishDativeWord(parts[parts.length - 1]!);
  return parts.join(" ");
}

/**
 * Ekran rakamı TTS'e düşerse kelimeye döner.
 * Kaynak zaten «elliye yetmiş santimetre» ise olduğu gibi kalır.
 * «30 dakikalık» ve «%100» mühürlü ofis cümlesidir; burada açılmaz.
 */
export function applyDisplayMeasuresToSpoken(text: string): string {
  return text
    .replace(/(\d{1,4})\s*[x×]\s*(\d{1,4})\s*cm\b/giu, (full, a: string, b: string) => {
      const left = turkishDativePhrase(Number(a));
      const right = turkishCardinal(Number(b));
      if (!left || !right) return full;
      return `${left} ${right} santimetre`;
    })
    .replace(/(\d{1,4})\s*cm\b/giu, (full, a: string) => {
      const words = turkishCardinal(Number(a));
      return words ? `${words} santimetre` : full;
    })
    .replace(/(\d{1,4})\s*ml\b/giu, (full, a: string) => {
      const words = turkishCardinal(Number(a));
      return words ? `${words} mililitre` : full;
    })
    .replace(
      /\b(\d{1,4})\s+(adet(?:tir|tır|tur|tür|i|in|e|ten|tan|te|ta|lik|lık|ler|lar)?)\b/giu,
      (full, n: string, unit: string) => {
        const words = turkishCardinal(Number(n));
        return words ? `${words} ${unit}` : full;
      },
    );
}
