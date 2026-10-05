import "server-only";

import { JUNIOR_QUIZ_MIN_ITEMS } from "@/lib/junior/limits";

/** Soru etiketi. Katsayı, test kurulurken koltuk payıdır. */
export const JUNIOR_QUESTION_TAG = {
  TREND: "Son Dönem MEB/LGS Trendi",
  PARALLEL: "Çıkmış Soru Paraleli",
} as const;

export type JuniorQuestionTag = (typeof JUNIOR_QUESTION_TAG)[keyof typeof JUNIOR_QUESTION_TAG];

/** Trend koltuğu on sorunun yüzde yetmişidir. Paralel koltuk kalan yüzde otuzdur. */
export const JUNIOR_TAG_WEIGHT: Record<JuniorQuestionTag, number> = {
  [JUNIOR_QUESTION_TAG.TREND]: 70,
  [JUNIOR_QUESTION_TAG.PARALLEL]: 30,
};

/** Son dönem kalıbı 2024 ve sonrasıdır. */
export const JUNIOR_TREND_YEAR_MIN = 2024;

/**
 * Kazanım soru havuzunun adres tavanı.
 * Yüz bin yuva, aşağıdaki statik kalıplara bağlanır. Yuva metni ayrıca üretilmez.
 * Konu testi bu bellek arşivinden kurulur. Canlı soru üreticisi çağrılmaz.
 */
export const JUNIOR_OUTCOME_POOL_CAPACITY = 100_000;

export type JuniorArchiveItem = {
  id: string;
  lessonKey: string;
  itemId: string;
  outcomeCode: string;
  prompt: string;
  choices: readonly [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
  tag: JuniorQuestionTag;
  weight: number;
  patternYear: number;
  poolSlot: number;
  active: true;
};

type ArchiveDraft = {
  lessonKey: string;
  itemId: string;
  outcomeCode: string;
  prompt: string;
  choices: readonly [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
  tag: JuniorQuestionTag;
  patternYear: number;
};

function sealArchive(rows: readonly ArchiveDraft[]): readonly JuniorArchiveItem[] {
  return rows.map((row, poolSlot) => ({
    ...row,
    id: `${row.lessonKey}:${row.itemId}`,
    weight: JUNIOR_TAG_WEIGHT[row.tag],
    poolSlot,
    active: true as const,
  }));
}

const TREND = JUNIOR_QUESTION_TAG.TREND;
const PARALLEL = JUNIOR_QUESTION_TAG.PARALLEL;

/** Soru arşivi olan üç konu. Arşivsiz konuda test kurulmaz; ücretsiz izleme bu listeye bağlı değildir. */
export const JUNIOR_QUESTION_ARCHIVE: readonly JuniorArchiveItem[] = sealArchive([
  {
    lessonKey: "jr_06_mat-1",
    itemId: "kesir-ne",
    outcomeCode: "JR-06-MAT-KESIR",
    prompt: "Kesir nedir?",
    choices: ["Bir bütünün eşit parçası", "Bütünün rastgele bir dilimi", "Yalnızca büyük sayı"],
    correctIndex: 0,
    explanation: "Kesir, bir bütünün eşit parçasıdır.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_mat-1",
    itemId: "pay-yer",
    outcomeCode: "JR-06-MAT-PAY",
    prompt: "Pay kesrin neresindedir?",
    choices: ["Altta", "Üstte", "Ortada"],
    correctIndex: 1,
    explanation: "Pay üstteki sayıdır.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_mat-1",
    itemId: "payda-yer",
    outcomeCode: "JR-06-MAT-PAYDA",
    prompt: "Payda kesrin neresindedir?",
    choices: ["Üstte", "Ortada", "Altta"],
    correctIndex: 2,
    explanation: "Payda alttaki sayıdır.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_mat-1",
    itemId: "payda-soyler",
    outcomeCode: "JR-06-MAT-PAYDA",
    prompt: "Payda neyi söyler?",
    choices: ["Kaç parça alındığını", "Bütünün kaç eşit parçaya bölündüğünü", "Parçaların eşit olmadığını"],
    correctIndex: 1,
    explanation: "Payda, bütünün kaç eşit parçaya bölündüğünü söyler.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_mat-1",
    itemId: "esit-degil",
    outcomeCode: "JR-06-MAT-KESIR",
    prompt: "Parçalar eşit değilse ne olur?",
    choices: ["Bu sayı kesir olmaz", "Payda bir olur", "Pay üstten alta iner"],
    correctIndex: 0,
    explanation: "Parçalar eşit değilse bu sayı kesir olmaz.",
    tag: PARALLEL,
    patternYear: 2022,
  },
  {
    lessonKey: "jr_06_mat-1",
    itemId: "dortte-bir",
    outcomeCode: "JR-06-MAT-KESIR",
    prompt: "Bir elma dört eşit parçaysa bir parça nedir?",
    choices: ["Bütün elma", "İki elma", "Dörtte bir"],
    correctIndex: 2,
    explanation: "Dört eşit parçadan biri dörtte birdir.",
    tag: PARALLEL,
    patternYear: 2022,
  },
  {
    lessonKey: "jr_06_mat-1",
    itemId: "pay-soyler",
    outcomeCode: "JR-06-MAT-PAY",
    prompt: "Pay neyi söyler?",
    choices: ["Bütünün rengini", "Seçilen parça sayısını", "Parçaların eşit olmadığını"],
    correctIndex: 1,
    explanation: "Pay, seçilen parça sayısıdır.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_mat-1",
    itemId: "yarim",
    outcomeCode: "JR-06-MAT-OKUMA",
    prompt: "1/2 nasıl okunur?",
    choices: ["Yarım", "Çeyrek", "Üçte bir"],
    correctIndex: 0,
    explanation: "1/2 yarımdır.",
    tag: TREND,
    patternYear: 2026,
  },
  {
    lessonKey: "jr_06_mat-1",
    itemId: "ceyrek",
    outcomeCode: "JR-06-MAT-OKUMA",
    prompt: "1/4 nasıl okunur?",
    choices: ["Yarım", "Üçte bir", "Çeyrek"],
    correctIndex: 2,
    explanation: "1/4 çeyrektir.",
    tag: TREND,
    patternYear: 2026,
  },
  {
    lessonKey: "jr_06_mat-1",
    itemId: "ustteki",
    outcomeCode: "JR-06-MAT-PAY",
    prompt: "Kesirde üstteki sayı hangisidir?",
    choices: ["Payda", "Pay", "Bütün"],
    correctIndex: 1,
    explanation: "Üstteki sayı paydır. Payda altta durur.",
    tag: PARALLEL,
    patternYear: 2021,
  },
  {
    lessonKey: "jr_06_fen-1",
    itemId: "kuvvet-ne",
    outcomeCode: "JR-06-FEN-KUVVET",
    prompt: "Kuvvet nedir?",
    choices: ["Bir cismi iten veya çeken etki", "Cismin rengi", "Cismin ağırlık sayısı"],
    correctIndex: 0,
    explanation: "Kuvvet, bir cismi iten veya çeken etkidir.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_fen-1",
    itemId: "itmek",
    outcomeCode: "JR-06-FEN-KUVVET",
    prompt: "Kapıyı itmek nedir?",
    choices: ["Yalnızca ses", "Bir kuvvettir", "Cismin rengi"],
    correctIndex: 1,
    explanation: "İtmek bir kuvvettir.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_fen-1",
    itemId: "cekmek",
    outcomeCode: "JR-06-FEN-KUVVET",
    prompt: "Çekmeceyi çekmek nedir?",
    choices: ["Kuvvet değildir", "Yalnızca yönsüz bir iş", "Bir kuvvettir"],
    correctIndex: 2,
    explanation: "Çekmek de bir kuvvettir.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_fen-1",
    itemId: "yon-var",
    outcomeCode: "JR-06-FEN-YON",
    prompt: "Kuvvetin yönü var mıdır?",
    choices: ["Yoktur", "Vardır", "Yalnızca renkte vardır"],
    correctIndex: 1,
    explanation: "Kuvvetin yönü vardır.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_fen-1",
    itemId: "yonler",
    outcomeCode: "JR-06-FEN-YON",
    prompt: "İtmek ve çekmek için doğru olan hangisidir?",
    choices: ["Yönleri terstir", "İkisi de yönsüzdür", "Yalnız itmek kuvvettir"],
    correctIndex: 0,
    explanation: "İtmek bir yöndür. Çekmek ters yöndür.",
    tag: TREND,
    patternYear: 2024,
  },
  {
    lessonKey: "jr_06_fen-1",
    itemId: "duran",
    outcomeCode: "JR-06-FEN-HAREKET",
    prompt: "Durmakta olan bir cisim yeterli kuvvet alınca ne olur?",
    choices: ["Rengi değişir", "Yerinde küçülür", "Hareket edebilir"],
    correctIndex: 2,
    explanation: "Durmakta olan bir cisim, yeterli kuvvet uygulanınca hareket edebilir.",
    tag: TREND,
    patternYear: 2026,
  },
  {
    lessonKey: "jr_06_fen-1",
    itemId: "gorunmez",
    outcomeCode: "JR-06-FEN-KUVVET",
    prompt: "Kuvvetin kendisi nasıldır?",
    choices: ["Cetvelle ölçülen bir boyadır", "Görünmez. Etkisi görünür", "Her zaman bir oktur"],
    correctIndex: 1,
    explanation: "Kuvvet görünmez. Etkisi görünür.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_fen-1",
    itemId: "ok",
    outcomeCode: "JR-06-FEN-YON",
    prompt: "Kuvvet çiziminde ok neyi gösterir?",
    choices: ["Kuvvetin yönünü", "Cismin rengini", "Paydanın yerini"],
    correctIndex: 0,
    explanation: "Ok, kuvvetin yönünü gösterir.",
    tag: PARALLEL,
    patternYear: 2022,
  },
  {
    lessonKey: "jr_06_fen-1",
    itemId: "ters-yon",
    outcomeCode: "JR-06-FEN-YON",
    prompt: "Çekmek, itmeye göre nasıldır?",
    choices: ["Aynı yöndür", "Kuvvet sayılmaz", "Ters yöndür"],
    correctIndex: 2,
    explanation: "Çekmek, itmenin ters yönüdür.",
    tag: PARALLEL,
    patternYear: 2021,
  },
  {
    lessonKey: "jr_06_fen-1",
    itemId: "etki",
    outcomeCode: "JR-06-FEN-KUVVET",
    prompt: "İtmek ve çekmek birlikte neyin örneğidir?",
    choices: ["Kesrin paydası", "Kuvvet", "Ana fikir"],
    correctIndex: 1,
    explanation: "İtmek ve çekmek kuvvettir.",
    tag: PARALLEL,
    patternYear: 2020,
  },
  {
    lessonKey: "jr_06_turkce-1",
    itemId: "ana-ne",
    outcomeCode: "JR-06-TUR-ANA",
    prompt: "Ana fikir nedir?",
    choices: ["Yazarın okura asıl söylemek istediği", "Metindeki ilk sayı", "Metindeki bütün örnekler"],
    correctIndex: 0,
    explanation: "Ana fikir, yazarın asıl söylemek istediğidir.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_turkce-1",
    itemId: "tek-cumle",
    outcomeCode: "JR-06-TUR-ANA",
    prompt: "Ana fikir çoğu kez nasıl söylenir?",
    choices: ["Uzun bir listeyle", "Tek cümleyle", "Yalnızca bir sayıyla"],
    correctIndex: 1,
    explanation: "Ana fikir çoğu kez tek cümleyle söylenir.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_turkce-1",
    itemId: "ornek",
    outcomeCode: "JR-06-TUR-AYRINTI",
    prompt: "Metindeki örnek nedir?",
    choices: ["Ana fikrin kendisi", "Payda", "Ayrıntı"],
    correctIndex: 2,
    explanation: "Örnek ayrıntıdır. Ana fikrin kendisi değildir.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_turkce-1",
    itemId: "ayrinti-is",
    outcomeCode: "JR-06-TUR-AYRINTI",
    prompt: "Ayrıntı ne işe yarar?",
    choices: ["Metni siler", "Ana fikri destekler", "Ana fikrin yerine geçer"],
    correctIndex: 1,
    explanation: "Ayrıntı ana fikri destekler.",
    tag: TREND,
    patternYear: 2024,
  },
  {
    lessonKey: "jr_06_turkce-1",
    itemId: "ayrinti-degil",
    outcomeCode: "JR-06-TUR-AYRINTI",
    prompt: "Ayrıntı ana fikir midir?",
    choices: ["Hayır. Ayrıntı ana fikir değildir", "Evet. Her örnek ana fikirdir", "Evet. Her sayı ana fikirdir"],
    correctIndex: 0,
    explanation: "Ayrıntı ana fikri destekler. Ana fikrin kendisi değildir.",
    tag: TREND,
    patternYear: 2026,
  },
  {
    lessonKey: "jr_06_turkce-1",
    itemId: "sayi",
    outcomeCode: "JR-06-TUR-AYRINTI",
    prompt: "Metindeki sayı ne sayılır?",
    choices: ["Ana fikir", "Pay", "Ayrıntı"],
    correctIndex: 2,
    explanation: "Sayı ayrıntıdır.",
    tag: PARALLEL,
    patternYear: 2022,
  },
  {
    lessonKey: "jr_06_turkce-1",
    itemId: "baslik",
    outcomeCode: "JR-06-TUR-BASLIK",
    prompt: "Bir haberin başlığı neye benzer?",
    choices: ["Yazarın asıl sözünün kısası", "Bütün örneklerin listesi", "Paydanın kendisi"],
    correctIndex: 0,
    explanation: "Başlık, yazarın asıl söylemek istediğini kısa söyler.",
    tag: TREND,
    patternYear: 2025,
  },
  {
    lessonKey: "jr_06_turkce-1",
    itemId: "hatirla",
    outcomeCode: "JR-06-TUR-ANA",
    prompt: "Yazar senden en çok neyi hatırlamanı ister?",
    choices: ["İlk sayıyı", "Ana fikri", "Bütün örnekleri"],
    correctIndex: 1,
    explanation: "Yazar, ana fikrin hatırlanmasını ister.",
    tag: PARALLEL,
    patternYear: 2021,
  },
  {
    lessonKey: "jr_06_turkce-1",
    itemId: "cok-ornek",
    outcomeCode: "JR-06-TUR-AYRINTI",
    prompt: "Birden fazla örnek varsa bunlar nedir?",
    choices: ["Hepsi ayrı bir ana fikirdir", "Hepsi paydadır", "Ayrıntıdır. Ana fikir değildir"],
    correctIndex: 2,
    explanation: "Örnekler ayrıntıdır. Ana fikrin yerine geçmez.",
    tag: PARALLEL,
    patternYear: 2020,
  },
  {
    lessonKey: "jr_06_turkce-1",
    itemId: "asil-soz",
    outcomeCode: "JR-06-TUR-ANA",
    prompt: "Ana fikir yazarın nesi olur?",
    choices: ["İlk ayrıntısı", "Asıl sözü", "Silinen cümlesi"],
    correctIndex: 1,
    explanation: "Ana fikir, yazarın asıl sözüdür.",
    tag: TREND,
    patternYear: 2026,
  },
]);

export type JuniorPoolAddress = {
  slot: number;
  patternId: string;
  lessonKey: string;
  outcomeCode: string;
  tag: JuniorQuestionTag;
  weight: number;
  variant: number;
};

/** Yüz bin yuvadan biri, statik kalıba döner. Aralık dışı yuva boştur. */
export function juniorOutcomePoolSlot(slot: number): JuniorPoolAddress | null {
  const patterns = JUNIOR_QUESTION_ARCHIVE;
  if (!Number.isInteger(slot) || slot < 0 || slot >= JUNIOR_OUTCOME_POOL_CAPACITY || patterns.length === 0) {
    return null;
  }
  const pattern = patterns[slot % patterns.length];
  if (!pattern) {
    return null;
  }
  return {
    slot,
    patternId: pattern.id,
    lessonKey: pattern.lessonKey,
    outcomeCode: pattern.outcomeCode,
    tag: pattern.tag,
    weight: pattern.weight,
    variant: Math.floor(slot / patterns.length),
  };
}

export function juniorQuizSeatPlan(size = JUNIOR_QUIZ_MIN_ITEMS): { trend: number; parallel: number } {
  const trend = Math.round((size * JUNIOR_TAG_WEIGHT[JUNIOR_QUESTION_TAG.TREND]) / 100);
  const parallel = size - trend;
  return { trend, parallel };
}

/**
 * On soruluk konu testi.
 * Yedi koltuk son dönem trend etiketinden, üç koltuk çıkmış soru paralelinden gelir.
 * Sıra, arşivdeki yazılı sıradır. Doğru şık bu listede kalır; tarayıcıya gitmez.
 */
/** On soruluk arşivi olan konular. Arşivsiz konu bu listeye girmez. */
export function juniorQuizBankLessonKeys(): readonly string[] {
  const seen: string[] = [];
  for (const row of JUNIOR_QUESTION_ARCHIVE) {
    if (!seen.includes(row.lessonKey)) {
      seen.push(row.lessonKey);
    }
  }
  return seen.filter((key) => assembleJuniorQuestionSet(key).length >= JUNIOR_QUIZ_MIN_ITEMS);
}

export function assembleJuniorQuestionSet(lessonKey: string): readonly JuniorArchiveItem[] {
  const rows = JUNIOR_QUESTION_ARCHIVE.filter((row) => row.lessonKey === lessonKey && row.active);
  const seats = juniorQuizSeatPlan(JUNIOR_QUIZ_MIN_ITEMS);
  const trend = rows.filter(
    (row) => row.tag === JUNIOR_QUESTION_TAG.TREND && row.patternYear >= JUNIOR_TREND_YEAR_MIN,
  );
  const parallel = rows.filter((row) => row.tag === JUNIOR_QUESTION_TAG.PARALLEL);
  const chosen = new Set<string>([
    ...trend.slice(0, seats.trend).map((row) => row.itemId),
    ...parallel.slice(0, seats.parallel).map((row) => row.itemId),
  ]);
  if (chosen.size < JUNIOR_QUIZ_MIN_ITEMS) {
    for (const row of rows) {
      if (chosen.size >= JUNIOR_QUIZ_MIN_ITEMS) {
        break;
      }
      chosen.add(row.itemId);
    }
  }
  return rows.filter((row) => chosen.has(row.itemId)).slice(0, JUNIOR_QUIZ_MIN_ITEMS);
}
