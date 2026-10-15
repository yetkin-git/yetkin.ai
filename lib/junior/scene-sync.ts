/**
 * Görsel kip, canlı cümlenin tek başına sıçramasına bırakılmaz.
 * Konu cümlesi kipi değiştirir. Genel cümle son kipi tutar.
 */

export type NumberOpsMode = "factor" | "prime" | "gcd" | "problem";

export function stickyCaptionMode<T extends string>(
  trail: readonly string[],
  detect: (caption: string) => T | null,
  seed: T,
): T {
  let mode = seed;
  for (const caption of trail) {
    const hit = detect(caption);
    if (hit) {
      mode = hit;
    }
  }
  return mode;
}

/**
 * Son konu cümlesi. Genel konuşma önceki çizimi düşürmez.
 * Eşleşme yoksa boş döner; sahne kendi varsayılanında kalır.
 */
export function stickyTopicText(trail: readonly string[], isTopic: (text: string) => boolean): string {
  let held = "";
  for (const caption of trail) {
    const text = caption.replace(/\s+/g, " ").trim().toLocaleLowerCase("tr-TR");
    if (text.length > 0 && isTopic(text)) {
      held = text;
    }
  }
  return held;
}

export function detectNumberOpsMode(caption: string): NumberOpsMode | null {
  const text = caption.toLocaleLowerCase("tr-TR");
  if (/asal/.test(text)) {
    return "prime";
  }
  if (/ortak bölen|ortak kat|ebob|ekok|en büyük ortak|en küçük ortak/.test(text)) {
    return "gcd";
  }
  if (/çarpan|bölünebil|bölün/.test(text)) {
    return "factor";
  }
  if (/(?<![\p{L}])kat(?:ı|ları|ıdır|tır)?(?![\p{L}])/u.test(text) && /sayı|çarp/.test(text)) {
    return "factor";
  }
  return null;
}

export function stickyNumberOpsMode(trail: readonly string[]): NumberOpsMode {
  let seeded: NumberOpsMode = "problem";
  for (const caption of trail) {
    const hit = detectNumberOpsMode(caption);
    if (hit) {
      seeded = hit;
      break;
    }
  }
  return stickyCaptionMode(trail, detectNumberOpsMode, seeded);
}

/** Çarpan çiziminin konusu. İz, 6'dan 24'e geçince çizim de geçer. */
export function numberOpsFactorSubject(trail: readonly string[]): number {
  let subject = 0;
  for (const caption of trail) {
    const text = caption.toLocaleLowerCase("tr-TR");
    const named = text.match(/(\d+)\s*['’]?(?:ün|un|ın|in|nın|nin|nün|nun)\s*çarpan/u);
    const ele = text.match(/(\d+)\s+sayısını/u);
    const crowd = text.match(/(\d+)\s+kişi/u);
    const raw = named?.[1] ?? ele?.[1] ?? crowd?.[1];
    if (!raw) {
      continue;
    }
    const value = Number(raw);
    if (value >= 2 && value <= 60) {
      subject = value;
    }
  }
  return subject >= 2 ? subject : 12;
}

/** «2 çarpı 12, 24 eder» — konuşulan çarpım. Eşleşme yoksa null. */
export function spokenFactorProduct(
  caption: string,
): { left: number; right: number; product: number } | null {
  const text = caption.toLocaleLowerCase("tr-TR");
  const hit = text.match(/(\d+)\s*çarpı\s*(\d+)\s*,\s*(\d+)/u);
  if (!hit) {
    return null;
  }
  const left = Number(hit[1]);
  const right = Number(hit[2]);
  const product = Number(hit[3]);
  if (![left, right, product].every((value) => value >= 1 && value <= 200)) {
    return null;
  }
  return { left, right, product };
}

export function positiveFactors(value: number): number[] {
  const subject = Math.max(1, Math.min(60, Math.round(value)));
  const factors: number[] = [];
  for (let cursor = 1; cursor <= subject; cursor += 1) {
    if (subject % cursor === 0) {
      factors.push(cursor);
    }
  }
  return factors.slice(0, 8);
}
