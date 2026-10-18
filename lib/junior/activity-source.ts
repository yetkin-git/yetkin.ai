/**
 * Etkinlik cevaplarının tek yazarı.
 * `activity-rail.ts` buradan okur ve puanlar.
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
  "jr_06_mat-5": [
    {
      id: "rail-jr_06_mat-5-match",
      kind: "match",
      prompt: "Bölünebilme dedektifi kurallarını ve kavramları doğru açıklamayla eşleştir.",
      left: [
        { id: "m1", label: "2, 5 ve 10 Kuralları" },
        { id: "m2", label: "3 ve 9 Kuralları" },
        { id: "m3", label: "Çarpan (= Bölen)" },
        { id: "m4", label: "Kat" },
      ],
      right: [
        { id: "r3", label: "Sayıyı kalansız bölen küçük parçadır." },
        { id: "r1", label: "Son basamağa (birler basamağına) bakar." },
        { id: "r4", label: "Sayıyı katlayarak büyüten kule basamağıdır." },
        { id: "r2", label: "Rakamların toplamına bakar." },
      ],
      pairs: {
        m1: "r1",
        m2: "r2",
        m3: "r3",
        m4: "r4",
      },
      explanation:
        "2, 5 ve 10 kuralları son basamağa; 3 ve 9 kuralları rakamların toplamına bakar. Çarpan sayıyı kalansız böler, kat ise katlayarak büyütür.",
    },
    {
      id: "rail-jr_06_mat-5-cloze",
      kind: "cloze",
      prompt: "Bölünebilme dedektifi cümlelerindeki boşlukları doldur.",
      before: "Bir sayının son rakamı 0 veya 5 ise bu sayı",
      after: "'e tam bölünür.",
      accepts: ["5", "beş", "5'e"],
      wordBank: ["5", "3", "çarpanları"],
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
          before: "12 sayısını kalansız bölen 1, 2, 3, 4, 6 ve 12 sayılarına 12'nin",
          after: "denir.",
          accepts: ["çarpanları", "çarpanı", "bölenleri", "carpanlari"],
        },
      ],
      explanation:
        "Son rakamı 0 veya 5 olan sayılar 5'e; rakamları toplamı 6 olan 24 sayısı 3'e tam bölünür. 12'yi kalansız bölen sayılara 12'nin çarpanları denir.",
    },
    {
      id: "rail-jr_06_mat-5-order",
      kind: "order",
      prompt: "24, 15, 30 ve 18 sayılarını doğru dedektif roketlerine yerleştir.",
      tiles: [
        { id: "n24", label: "24" },
        { id: "n15", label: "15" },
        { id: "n30", label: "30" },
        { id: "n18", label: "18" },
      ],
      sequence: ["n15", "n24", "n18", "n30"],
      puzzle: {
        title: "3. DEDEKTİF BULMACASI",
        prompt: "24, 15, 30 ve 18 sayılarını doğru dedektif roketlerine yerleştir.",
        rockets: [
          {
            id: "r2",
            label: "2'ye Bölünenler",
            ruleHint: "Son basamağı çift (0, 2, 4, 6, 8)",
          },
          {
            id: "r5",
            label: "5'e Bölünenler",
            ruleHint: "Son basamağı 0 veya 5",
          },
          {
            id: "r3",
            label: "3'e Bölünenler",
            ruleHint: "Rakamları toplamı 3'ün katı",
          },
        ],
        validRockets: {
          n24: ["r2", "r3"],
          n15: ["r5", "r3"],
          n30: ["r2", "r5", "r3"],
          n18: ["r3", "r2"],
        },
      },
      explanation:
        "24 çift olduğu için 2'ye (ve rakamları toplamı 6 olduğu için 3'e), 15 sonu 5 olduğu için 5'e (ve 3'e), 30 hem 2'ye hem 5'e hem 3'e, 18 ise rakamları toplamı 9 olduğu için 3'e (ve çift olduğu için 2'ye) tam bölünür.",
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
