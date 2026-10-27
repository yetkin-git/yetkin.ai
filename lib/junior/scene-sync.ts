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
    const alongside = text.match(/(\d+)\s+sayısıyla/u);
    const crowd = text.match(/(\d+)\s+kişi/u);
    const raw = named?.[1] ?? ele?.[1] ?? alongside?.[1] ?? crowd?.[1];
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

export type DivisibilityBoardKind = "last-digit" | "digit-sum";

export type DivisibilityBoardState = {
  kind: DivisibilityBoardKind;
  subject: number;
  prefix: string;
  onesDigit: string;
  bracketed: string;
  sumExpression: string;
  rule: 2 | 5 | 10 | 3 | 9;
  badges: readonly string[];
};

/**
 * Hoca 2, 5, 10 (Son Basamak Dedektifleri) veya 3, 9 (Rakam Toplama Dedektifleri)
 * kurallarını anlatırken Bölünebilme Tahtası (`DivisibilityBoard`) durumunu döner.
 */
export function detectDivisibilityBoard(caption: string): DivisibilityBoardState | null {
  const text = caption.toLocaleLowerCase("tr-TR");
  if (!text) {
    return null;
  }

  const hasDigitSumCue =
    /rakam(?:ları|larını|lar)?\s*topla/u.test(text) ||
    /2\s*(?:artı|\+)\s*4/u.test(text) ||
    /1\s*(?:artı|\+)\s*8/u.test(text) ||
    /\b(?:3|9)\s*kural/u.test(text) ||
    /\b3\s*ve\s*9\b/u.test(text) ||
    /\b(?:3'ün|9'un)\s*katı/u.test(text) ||
    /\b9'a\s*(?:tam\s+|kalansız\s+)?bölün/u.test(text) ||
    (/\b3'e\s*(?:tam\s+|kalansız\s+)?bölün/u.test(text) && !/\b30\b/u.test(text) && !/son\s*rakam/u.test(text));

  const hasLastDigitCue =
    /son\s*rakam|son\s*basamak|birler\s*basama|sonu\s*[024568]/u.test(text) ||
    /\b(?:2|5|10)\s*kural/u.test(text) ||
    /\b2\s*,\s*5\s*ve\s*10\b/u.test(text) ||
    /\b(?:2'ye|5'e|10'a)\s*(?:tam\s+|kalansız\s+)?bölün/u.test(text);

  if (hasDigitSumCue && !/^2\s*,\s*5\s*ve\s*10/u.test(text)) {
    const isNineFocus =
      (/\b18\b/u.test(text) || /\b9\s*kural/u.test(text) || /\b9'a\s*(?:tam\s+|kalansız\s+)?bölün/u.test(text)) &&
      !/2\s*(?:artı|\+)\s*4/u.test(text);
    if (isNineFocus) {
      return {
        kind: "digit-sum",
        subject: 18,
        prefix: "1",
        onesDigit: "8",
        bracketed: "1[8]",
        sumExpression: "1 + 8 = 9",
        rule: 9,
        badges: ["✓ 3'e Bölünür", "✓ 9'a Bölünür"],
      };
    }
    const mentionsNine = /\b9\b/u.test(text);
    return {
      kind: "digit-sum",
      subject: 24,
      prefix: "2",
      onesDigit: "4",
      bracketed: "2[4]",
      sumExpression: "2 + 4 = 6",
      rule: 3,
      badges: mentionsNine ? ["✓ 3'e Bölünür", "✓ 9'a Bölünür"] : ["✓ 3'e Bölünür"],
    };
  }

  if (hasLastDigitCue) {
    if (/\b30\b/u.test(text) || /\b10\s*kural/u.test(text) || /\b10'a\s*(?:tam\s+|kalansız\s+)?bölün/u.test(text)) {
      return {
        kind: "last-digit",
        subject: 30,
        prefix: "3",
        onesDigit: "0",
        bracketed: "3[0]",
        sumExpression: "3 + 0 = 3",
        rule: 10,
        badges: ["✓ 2'ye Bölünür", "✓ 5'e Bölünür", "✓ 10'a Bölünür"],
      };
    }
    if (
      /\b15\b/u.test(text) ||
      /\b5\s*kural/u.test(text) ||
      (/\b5'e\s*(?:tam\s+|kalansız\s+)?bölün/u.test(text) && !/\b24\s*sayısı\s*2'ye/u.test(text))
    ) {
      return {
        kind: "last-digit",
        subject: 15,
        prefix: "1",
        onesDigit: "5",
        bracketed: "1[5]",
        sumExpression: "1 + 5 = 6",
        rule: 5,
        badges: ["✓ 5'e Bölünür"],
      };
    }
    return {
      kind: "last-digit",
      subject: 24,
      prefix: "2",
      onesDigit: "4",
      bracketed: "2[4]",
      sumExpression: "2 + 4 = 6",
      rule: 2,
      badges: ["✓ 2'ye Bölünür", "✗ 5'e Bölünmez"],
    };
  }

  return null;
}
