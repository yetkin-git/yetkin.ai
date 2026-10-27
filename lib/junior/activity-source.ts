import type { JuniorTactileActivityRules } from "@/lib/junior/lesson-engine/types";

/**
 * Etkinlik cevaplarının tek yazarı.
 * `activity-rail.ts` buradan okur ve puanlar.
 * Dokunsal kurallar `tactileRulesForLesson` ile aynı nesneden türer; ikinci anahtar yazılmaz.
 * `topics/*.json` aynı nesnenin tek yönlü ihracıdır; elle düzeltilmez.
 */

type MatchKey = {
  id: string;
  kind: "match";
  prompt: string;
  left: readonly { id: string; label: string }[];
  right: readonly { id: string; label: string }[];
  pairs: Readonly<Record<string, string>>;
  explanation: string;
};

type ClozeGapKey = {
  id: string;
  before: string;
  after: string;
  accepts: readonly string[];
};

type ClozeKey = {
  id: string;
  kind: "cloze";
  prompt: string;
  before: string;
  after: string;
  accepts: readonly string[];
  gaps?: readonly ClozeGapKey[];
  wordBank?: readonly string[];
  explanation: string;
};

type PuzzleKey = {
  title: string;
  prompt: string;
  rockets: readonly { id: string; label: string; ruleHint: string }[];
  validRockets: Readonly<Record<string, readonly string[]>>;
};

type OrderKey = {
  id: string;
  kind: "order";
  prompt: string;
  tiles: readonly { id: string; label: string }[];
  sequence: readonly string[];
  puzzle?: PuzzleKey;
  explanation: string;
};

export type AuthoredActivityKey = MatchKey | ClozeKey | OrderKey;

export type JuniorScenarioActivities = {
  matching: { id: string; left: string; right: string }[];
  fillGaps: { id: string; before: string; after: string; answer: string; accepts: string[] }[];
  puzzle: {
    prompt: string;
    rockets: { id: string; label: string; ruleHint: string }[];
    numbers: { id: string; label: string; validRockets: string[] }[];
  };
};

export const AUTHORED_ACTIVITY_RAILS: Readonly<Record<string, readonly AuthoredActivityKey[]>> = {
  "jr_06_mat-1": [
    {
      id: "rail-jr_06_mat-1-match",
      kind: "match",
      prompt: "Bölünebilme dedektifi kurallarını ve kavramları doğru açıklamayla eşleştir.",
      left: [
        { id: "m1", label: "2, 5 ve 10 Kuralları" },
        { id: "m2", label: "3 ve 9 Kuralları" },
        { id: "m3", label: "Çarpan (= Bölen)" },
        { id: "m4", label: "Kat" },
        { id: "m5", label: "4 Kuralı" },
        { id: "m6", label: "6 Kuralı" },
      ],
      right: [
        { id: "r3", label: "Sayıya eşit ya da küçük, kalansız bölendir." },
        { id: "r6", label: "Hem 2'ye hem 3'e aynı anda bölünür." },
        { id: "r1", label: "Son basamağa (birler basamağına) bakar." },
        { id: "r5", label: "Son iki basamağa bakar; 100, 4'e tam bölünür." },
        { id: "r4", label: "Sayıya eşit ya da büyük kat halkasıdır." },
        { id: "r2", label: "Rakamların toplamına bakar." },
      ],
      pairs: {
        m1: "r1",
        m2: "r2",
        m3: "r3",
        m4: "r4",
        m5: "r5",
        m6: "r6",
      },
      explanation:
        "2, 5 ve 10 son basamağa; 4 son iki basamağa bakar çünkü 100, 4'e tam bölünür. 3 ve 9 rakam toplamına bakar. 6, hem 2 hem 3 ister. Çarpan sayıya eşit ya da küçüktür, kat sayıya eşit ya da büyüktür.",
    },
    {
      id: "rail-jr_06_mat-1-cloze",
      kind: "cloze",
      prompt: "Bölünebilme dedektifi cümlelerindeki boşlukları doldur.",
      before: "Bir sayının son rakamı 0 veya 5 ise bu sayı",
      after: "'e tam bölünür.",
      accepts: ["5", "beş", "5'e"],
      wordBank: ["5", "3", "çarpanları", "4", "6"],
      gaps: [
        {
          id: "g1",
          before: "Bir sayının son rakamı 0 veya 5 ise bu sayı",
          after: "'e tam bölünür.",
          accepts: ["5", "beş", "5'e"],
        },
        {
          id: "g2",
          before: "24 sayısının rakamları toplamı 6 olduğu için",
          after: "ile tam bölünür.",
          accepts: ["3", "üç", "3'e"],
        },
        {
          id: "g3",
          before: "6 sayısını kalansız bölen 1, 2, 3 ve 6 sayılarına 6'nın",
          after: "denir.",
          accepts: ["çarpanları", "çarpanı", "bölenleri", "carpanlari"],
        },
        {
          id: "g4",
          before: "116 sayısının son iki basamağı 16 olduğu için bu sayı",
          after: "ile tam bölünür.",
          accepts: ["4", "dört", "4'e"],
        },
        {
          id: "g5",
          before: "24 hem 2'ye hem 3'e bölündüğü için",
          after: "ile de tam bölünür.",
          accepts: ["6", "altı", "6'ya"],
        },
      ],
      explanation:
        "Son rakamı 0 veya 5 olan sayılar 5'e bölünür. 24'ün rakam toplamı 6 olduğu için 3'e, hem 2'ye hem 3'e bölündüğü için 6'ya da bölünür. 116'nın son iki basamağı 16 olduğu için 4'e bölünür. 6'yı kalansız bölen sayılara 6'nın çarpanları denir.",
    },
    {
      id: "rail-jr_06_mat-1-order",
      kind: "order",
      prompt: "24, 15, 30, 18 ve 116 sayılarını 2, 3, 4, 5, 6, 9 ve 10 roketlerine yerleştir.",
      tiles: [
        { id: "n24", label: "24" },
        { id: "n15", label: "15" },
        { id: "n30", label: "30" },
        { id: "n18", label: "18" },
        { id: "n116", label: "116" },
      ],
      sequence: ["n15", "n24", "n18", "n30", "n116"],
      puzzle: {
        title: "3. DEDEKTİF BULMACASI",
        prompt: "24, 15, 30, 18 ve 116 sayılarını 2, 3, 4, 5, 6, 9 ve 10 roketlerine yerleştir.",
        rockets: [
          {
            id: "r2",
            label: "2'ye Bölünenler",
            ruleHint: "Son basamağı çift (0, 2, 4, 6, 8)",
          },
          {
            id: "r4",
            label: "4'e Bölünenler",
            ruleHint: "Son iki basamak 4'e bölünür",
          },
          {
            id: "r5",
            label: "5'e Bölünenler",
            ruleHint: "Son basamağı 0 veya 5",
          },
          {
            id: "r10",
            label: "10'a Bölünenler",
            ruleHint: "Son basamağı 0",
          },
          {
            id: "r3",
            label: "3'e Bölünenler",
            ruleHint: "Rakamları toplamı 3'ün katı",
          },
          {
            id: "r6",
            label: "6'ya Bölünenler",
            ruleHint: "Hem 2'ye hem 3'e bölünür",
          },
          {
            id: "r9",
            label: "9'a Bölünenler",
            ruleHint: "Rakamları toplamı 9'un katı",
          },
        ],
        validRockets: {
          n24: ["r2", "r3", "r4", "r6"],
          n15: ["r5", "r3"],
          n30: ["r2", "r5", "r10", "r3", "r6"],
          n18: ["r2", "r3", "r6", "r9"],
          n116: ["r2", "r4"],
        },
      },
      explanation:
        "24 çifttir; 4'e ve hem 2 hem 3 tuttuğu için 6'ya da bölünür. 15 sonu 5 olduğu için 5'e ve 3'e bölünür, 6'ya bölünmez. 30 sonu 0 olduğu için 2, 5 ve 10'a, rakam toplamı 3 olduğu için 3'e ve 6'ya bölünür. 18, 2, 3, 6 ve 9'a bölünür. 116'nın son iki basamağı 16 olduğu için 4'e bölünür.",
    },
  ],
  "jr_06_mat-2": [
    {
      id: "rail-jr_06_mat-2-match",
      kind: "match",
      prompt: "Asal sayı tanımını, özel durumları ve 12'nin ağacını doğru açıklamayla eşleştir.",
      left: [
        { id: "m1", label: "Asal sayı" },
        { id: "m2", label: "1" },
        { id: "m3", label: "2" },
        { id: "m4", label: "9" },
        { id: "m5", label: "7" },
        { id: "m6", label: "12'nin ağacı" },
      ],
      right: [
        { id: "r2", label: "Asal değildir. Tek böleni kendisidir." },
        { id: "r6", label: "2 çarpı 2 çarpı 3." },
        { id: "r1", label: "1'den büyüktür ve yalnız 1 ile kendisine bölünür." },
        { id: "r5", label: "Çarpanları yalnız 1 ve 7'dir. Asaldır." },
        { id: "r4", label: "3 çarpı 3'tür. Tektir ama asal değildir." },
        { id: "r3", label: "Tek çift asal sayıdır." },
      ],
      pairs: {
        m1: "r1",
        m2: "r2",
        m3: "r3",
        m4: "r4",
        m5: "r5",
        m6: "r6",
      },
      explanation:
        "Asal sayı 1'den büyüktür ve yalnız 1 ile kendisine bölünür. 1 asal değildir. 2 tek çift asaldır. 9, 3 çarpı 3 olduğu için asal değildir. 7 yalnız 1 ve 7'ye bölünür. 12'nin ağacı 2 çarpı 2 çarpı 3'tür.",
    },
    {
      id: "rail-jr_06_mat-2-cloze",
      kind: "cloze",
      prompt: "Asal tanımındaki ve 12'nin ağacındaki boşlukları doldur.",
      before: "Asal sayı 1'den",
      after: "ve yalnız 1 ile kendisine bölünür.",
      accepts: ["büyüktür", "buyuktur", "büyük"],
      wordBank: ["büyüktür", "çift", "3", "değildir"],
      gaps: [
        {
          id: "g1",
          before: "Asal sayı 1'den",
          after: "ve yalnız 1 ile kendisine bölünür.",
          accepts: ["büyüktür", "buyuktur", "büyük"],
        },
        {
          id: "g2",
          before: "2, asal sayılar içindeki tek",
          after: "asal sayıdır.",
          accepts: ["çift", "cift"],
        },
        {
          id: "g3",
          before: "12, 2 çarpı 2 çarpı",
          after: "olarak yazılır.",
          accepts: ["3", "üç", "uc"],
        },
        {
          id: "g4",
          before: "9, 3 çarpı 3 olduğu için asal",
          after: ".",
          accepts: ["değildir", "degildir"],
        },
        {
          id: "g5",
          before: "1 sayısı asal",
          after: ".",
          accepts: ["değildir", "degildir"],
        },
      ],
      explanation:
        "Asal sayı 1'den büyüktür. 2 tek çift asaldır. 12, 2 çarpı 2 çarpı 3 diye ayrılır. 9 ve 1 asal değildir.",
    },
    {
      id: "rail-jr_06_mat-2-order",
      kind: "order",
      prompt: "2, 7, 1, 9, 4 ve 12 sayılarını asal, asal değil ve 12'nin ağacı kutularına yerleştir.",
      tiles: [
        { id: "n12", label: "12" },
        { id: "n1", label: "1" },
        { id: "n7", label: "7" },
        { id: "n4", label: "4" },
        { id: "n2", label: "2" },
        { id: "n9", label: "9" },
      ],
      sequence: ["n2", "n7", "n1", "n9", "n4", "n12"],
      puzzle: {
        title: "3. ASAL AĞAÇ",
        prompt: "2, 7, 1, 9, 4 ve 12 sayılarını asal, asal değil ve 12'nin ağacı kutularına yerleştir.",
        rockets: [
          {
            id: "r-prime",
            label: "Asal sayılar",
            ruleHint: "1'den büyük, yalnız 1 ve kendisi",
          },
          {
            id: "r-not",
            label: "Asal olmayanlar",
            ruleHint: "1, ya da başka bir çarpanı olanlar",
          },
          {
            id: "r-tree",
            label: "12'nin ağacı",
            ruleHint: "2 çarpı 2 çarpı 3",
          },
        ],
        validRockets: {
          n2: ["r-prime"],
          n7: ["r-prime"],
          n1: ["r-not"],
          n9: ["r-not"],
          n4: ["r-not"],
          n12: ["r-not", "r-tree"],
        },
      },
      explanation:
        "2 ve 7 asaldır. 1, 9 ve 4 asal değildir. 12 asal değildir ve çarpan ağacı 2 çarpı 2 çarpı 3'tür.",
    },
  ],
};

/** Konu JSON'undaki etkinlik şekli. Cevap sırası ve roket eşlemesi raydan gelir. */
export function scenarioActivitiesForLesson(lessonKey: string): JuniorScenarioActivities | null {
  const rows = AUTHORED_ACTIVITY_RAILS[lessonKey];
  if (!rows) {
    return null;
  }
  const match = rows.find((row): row is MatchKey => row.kind === "match");
  const cloze = rows.find((row): row is ClozeKey => row.kind === "cloze");
  const order = rows.find((row): row is OrderKey => row.kind === "order");
  if (!match || !cloze?.gaps || cloze.gaps.length === 0 || !order?.puzzle) {
    return null;
  }
  return {
    matching: match.left.map((item) => {
      const rightId = match.pairs[item.id];
      const right = match.right.find((row) => row.id === rightId);
      return {
        id: item.id,
        left: item.label,
        right: right?.label ?? "",
      };
    }),
    fillGaps: cloze.gaps.map((gap) => ({
      id: gap.id,
      before: gap.before,
      after: gap.after,
      answer: gap.accepts[0] ?? "",
      accepts: [...gap.accepts],
    })),
    puzzle: {
      prompt: order.puzzle.prompt,
      rockets: order.puzzle.rockets.map((rocket) => ({
        id: rocket.id,
        label: rocket.label,
        ruleHint: rocket.ruleHint,
      })),
      numbers: order.tiles.map((tile) => ({
        id: tile.id,
        label: tile.label,
        validRockets: [...(order.puzzle?.validRockets[tile.id] ?? [])],
      })),
    },
  };
}

/** Dokunsal puan anahtarı. Etkinlik rayının ikinci kopyası değildir. */
export function tactileRulesForLesson(lessonKey: string): JuniorTactileActivityRules | null {
  const rows = AUTHORED_ACTIVITY_RAILS[lessonKey];
  if (!rows) {
    return null;
  }
  const match = rows.find((row): row is MatchKey => row.kind === "match");
  const cloze = rows.find((row): row is ClozeKey => row.kind === "cloze");
  const order = rows.find((row): row is OrderKey => row.kind === "order");
  if (!match || !cloze?.gaps || cloze.gaps.length === 0 || !order?.puzzle) {
    return null;
  }
  const gapAnswers: Record<string, readonly string[]> = {};
  for (const gap of cloze.gaps) {
    gapAnswers[gap.id] = gap.accepts;
  }
  return {
    matchTargets: match.pairs,
    gapAnswers,
    rocketRules: order.puzzle.validRockets,
    explanations: {
      match: match.explanation,
      cloze: cloze.explanation,
      puzzle: order.explanation,
    },
  };
}
