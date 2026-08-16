/**
 * Mühürlü kopya denylist — tık avı, popülist gürültü, siyaset meydan dışıdır.
 * Serbest kullanıcı postu yoktur; bu süzgeç yalnız mühürlü başlık/gövde ve paylaşım notu içindir.
 */

const CLICKBAIT = [
  "şok",
  "sok",
  "inanılmaz",
  "tıklamadan",
  "ifşa",
  "skandal",
  "bunu görünce",
  "son dakika click",
];

const POLITICS = [
  "akp",
  "chp",
  "mhp",
  "iyi parti",
  "zafer partisi",
  "hdp",
  "dem parti",
  "miting",
  "oy verin",
  "seçim kampanyası",
];

function normalize(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isSealedCopyClean(title: string, body: string): boolean {
  const haystack = normalize(`${title}\n${body}`);
  return ![...CLICKBAIT, ...POLITICS].some((token) => haystack.includes(normalize(token)));
}

export function assertSealedCopyClean(title: string, body: string): void {
  if (!isSealedCopyClean(title, body)) {
    throw new Error("Mühürlü kopya tık avı veya siyaset taşıyamaz.");
  }
}

export function truncateSealedBody(body: string, max = 280): string {
  const trimmed = body.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}
