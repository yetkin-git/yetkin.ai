/**
 * Model skip preventer — paragraf başındaki kısa emir/teknik cümleler
 * Gemini TTS'in sessiz atlamasına yol açar. Cümle başındaki tek kelimelik
 * komut nidası (Gel, Bak, Dur, Hadi, Haydi) gırtlak patlaması üretir;
 * ses metninde «Şimdi …» akışına iner. Cue ekran metni değişmez.
 * Fonetik harita sonra uygulanır.
 */

const SENTENCE_BOUNDARY = /(?<=[.!?…])\s+/u;
const ALREADY_FLOWING = /^(?:şimdi|sonra|ardından|ardindan)\b/iu;
/**
 * Cümle başı tek kelime + virgül. «Gel, vitrinin başına…» gibi nida,
 * TTS'te kısa patlama olur. Asıl yüklem cümlenin devamındadır.
 */
const SENTENCE_ONSET_COMMAND_INTERJECTION =
  /^(?:Gel|Bak|Dur|Hadi|Haydi),\s+/u;
const MAX_COMMAND_WORDS = 8;

const KEY_TOKEN =
  String.raw`(?:Alt\s*\+\s*F11|Alt\s+Ef\s+on\s+bir|Ctrl\s*\+\s*[A-Za-z0-9]+|Shift\s*\+\s*[A-Za-z0-9]+|F2|F5|Ef\s+iki|Ef\s+beş|\+90)`;

const KEY_PRESS_RE = new RegExp(
  `^(${KEY_TOKEN})(?:['’]ye|['']ye|['’]ya|['']ya|['’]e|['']e|ye|ya|e)?\\s+bas(?:ın|ınız)?[.!]?$`,
  "iu",
);

const KEY_TUS_RE = new RegExp(
  `^(${KEY_TOKEN})\\s+tuşuna\\s+bas(?:ın|ınız)?[.!]?$`,
  "iu",
);

function wordCount(text: string): number {
  return text.split(/\s+/u).filter((word) => word.length > 0).length;
}

function firstSentence(text: string): { head: string; rest: string } {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return { head: "", rest: "" };
  }
  const parts = trimmed.split(SENTENCE_BOUNDARY).map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { head: "", rest: "" };
  }
  return { head: parts[0]!, rest: parts.slice(1).join(" ") };
}

function expandKeyCommand(sentence: string): string | null {
  const keyPress = sentence.match(KEY_PRESS_RE);
  if (keyPress) {
    return `Şimdi ${keyPress[1]} tuşuna basıyorsun.`;
  }
  const keyTus = sentence.match(KEY_TUS_RE);
  if (keyTus) {
    return `Şimdi ${keyTus[1]} tuşuna basıyorsun.`;
  }
  return null;
}

function expandCommandSentence(sentence: string): string {
  const trimmed = sentence.replace(/\s+/gu, " ").trim();
  if (!trimmed || ALREADY_FLOWING.test(trimmed) || wordCount(trimmed) > MAX_COMMAND_WORDS) {
    return trimmed;
  }
  return expandKeyCommand(trimmed) ?? trimmed;
}

function softenSentenceOnsetCommand(sentence: string): string {
  const trimmed = sentence.replace(/\s+/gu, " ").trim();
  if (!trimmed || ALREADY_FLOWING.test(trimmed) || !SENTENCE_ONSET_COMMAND_INTERJECTION.test(trimmed)) {
    return trimmed;
  }
  const rest = trimmed.replace(SENTENCE_ONSET_COMMAND_INTERJECTION, "").trim();
  if (!rest) {
    return trimmed;
  }
  return `Şimdi ${rest}`;
}

/** Her cümle başını tarar. Paragrafın ilk cümlesiyle sınırlı değildir. */
function softenSentenceOnsetCommands(text: string): string {
  return text
    .split(SENTENCE_BOUNDARY)
    .map((part) => softenSentenceOnsetCommand(part))
    .filter((part) => part.length > 0)
    .join(" ");
}

/**
 * Paragraf başındaki kısa emir/teknik cümleyi bağlaçlı akışa çevirir.
 * Cümle başı komut nidasını da ses metninde yumuşatır.
 * Cue JSON’a uygulanmaz. Örn. "F2'ye bas" → "Şimdi F2 tuşuna basıyorsun."
 * Örn. "Gel, vitrinin başına beraber geçelim." → "Şimdi vitrinin başına beraber geçelim."
 */
export function expandAcademyTtsSkipPreventer(text: string): string {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return "";
  }
  const { head, rest } = firstSentence(trimmed);
  if (!head) {
    return "";
  }
  const expanded = expandCommandSentence(head);
  let merged = trimmed;
  if (expanded !== head) {
    if (!rest) {
      merged = expanded;
    } else {
      const headWithStop = /[.!?…]$/u.test(expanded) ? expanded : `${expanded}.`;
      merged = `${headWithStop} ${rest}`;
    }
  }
  return softenSentenceOnsetCommands(merged);
}
