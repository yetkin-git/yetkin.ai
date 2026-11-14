export function guardTetkikNarrative(text: string, score: number): string {
  const kept = text
    .replace(/\u0000/g, "")
    .split("\n")
    .filter((line) => narrativeLineAllowed(line, score));
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function narrativeLineAllowed(line: string, score: number): boolean {
  if (/\d+\s*(müşteri|ziyaretçi)/i.test(line) || /\bayda\s+\d+/i.test(line)) {
    return false;
  }
  if (/₺|\bfiyat\b|\btutar\b|\b\d[\d.\s]*\s*tl\b/i.test(line)) {
    return false;
  }
  const slash = /\b(\d{1,3})\s*\/\s*100\b/.exec(line);
  if (slash && Number(slash[1]) !== score) {
    return false;
  }
  const claimed = /\bskor(?:u|un)?\b[^0-9]{0,24}(\d{1,3})\b/i.exec(line);
  if (claimed && Number(claimed[1]) !== score) {
    return false;
  }
  return true;
}
