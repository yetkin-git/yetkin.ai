import type { CueSegment, StageLayout, TimelineJSON, VisualKeyframe, WordTimestamp } from "./timeline-types";

export type MarbleGroupState = {
  total: number;
  groupSize: number | null;
  groups: number;
  remainder: number;
  highlightRemainder: "rose" | "amber" | null;
  equation: string;
};

export type FactorTreeState = {
  visible: boolean;
  number: number;
  factors: readonly number[];
  pairs: readonly string[];
  label: string;
};

export type MultipleStep = {
  step: number;
  value: number;
  atMs: number;
};

export type MultipleTowerState = {
  visible: boolean;
  base: number;
  multiples: readonly MultipleStep[];
  label: string;
  comparisonLeft: string | null;
  comparisonRight: string | null;
};

export type VerdictStamp = {
  rule: number;
  pass: boolean;
  label: string;
};

export type DetectiveState = {
  value: number;
  digits: readonly string[];
  highlightedTarget: "ones" | "last-two" | "all" | null;
  highlightedDigit: string | null;
  highlightColor: "cyan" | "amber" | "rose" | "emerald";
  magnifyingGlass: boolean;
  dimOthers: boolean;
  digitSum: {
    active: boolean;
    digits: readonly number[];
    expression: string;
    sum: number;
  } | null;
  verdicts: readonly VerdictStamp[];
  /** Tuzak sahnesinde cevap, kanca gelene kadar ekrana basılmaz. */
  revealed?: boolean;
};

export type CalloutState = {
  kind: "concept" | "gold" | "trap" | "question";
  badge: string;
  text: string;
};

/** Kelime saatine kilitli sayı. `token` varsa düz sayı değil, o sözcük aranır. */
export type TimedNumber = {
  value: number;
  atMs: number;
  token?: string;
  slot?: string;
};

export type PrimeCompositeCard = {
  number: number;
  factors: readonly number[];
  product: string;
  branches: readonly TimedNumber[];
};

export type PrimeNumberCard = {
  number: number;
  factors: readonly number[];
  stamp: string;
  nodes: readonly TimedNumber[];
};

export type PrimeFactorState = {
  visible: boolean;
  composite: PrimeCompositeCard | null;
  prime: PrimeNumberCard | null;
};

export type CommonDivisorState = {
  visible: boolean;
  left: number;
  right: number;
  leftDivisors: readonly number[];
  rightDivisors: readonly number[];
  commonDivisors: readonly number[];
  gcd: number;
  leftMultiples: readonly number[];
  rightMultiples: readonly number[];
  lcm: number;
  marks: readonly TimedNumber[];
};

/**
 * Çember ölçüsü. Çap, çevre ve açı bu nesneden okunur.
 * İndirgeyici `2r` veya `2πr` hesaplamaz.
 */
export type CircleMeasureState = {
  visible: boolean;
  radius: number;
  diameter: number;
  pi: number;
  circumference: number;
  unit: string;
  formula: string;
  relation: string;
  centralAngle: number;
  arcMeasure: number;
  fullTurn: number;
  semicircle: number;
  slice: number;
  parts: number;
  turns: number;
  distance: number;
  marks: readonly TimedNumber[];
};

/** Biyoçeşitlilik. Tür sayıları ve tehdit adları parametredir. */
export type HabitatState = {
  visible: boolean;
  birds: number;
  plants: number;
  birdsLost: number;
  threats: readonly string[];
  protection: string;
  marks: readonly TimedNumber[];
};

/** Yakıt ve çevre. Kilometre, litre ve baca adları parametredir. */
export type FuelState = {
  visible: boolean;
  distanceKm: number;
  fuelLitres: number;
  walkKm: number;
  cleanStack: string;
  dirtyStack: string;
  alternate: string;
  marks: readonly TimedNumber[];
};

/**
 * Kesir. Pay, payda ve denk kesir parametredir.
 * İndirgeyici toplamı, çarpımı ve sadeleştirmeyi kendisi hesaplamaz.
 */
export type FractionState = {
  visible: boolean;
  operation: string;
  leftNumerator: number;
  leftDenominator: number;
  rightNumerator: number;
  rightDenominator: number;
  equivalentNumerator: number;
  equivalentDenominator: number;
  resultNumerator: number;
  resultDenominator: number;
  differenceNumerator: number;
  differenceDenominator: number;
  productNumerator: number;
  productDenominator: number;
  simplifiedNumerator: number;
  simplifiedDenominator: number;
  quotient: number;
  parts: number;
  filled: number;
  trap: string;
  note: string;
  marks: readonly TimedNumber[];
};

/** Sayı doğrusu ve uzunluk konumu. İndirgeyici birim çevirmez. */
export type NumberLineState = {
  visible: boolean;
  unit: string;
  focus: number;
  focusLabel: string;
  relations: readonly string[];
  marks: readonly TimedNumber[];
};

/**
 * Açı ve dörtgen. Tümler, bütünler ve komşu değerler parametredir.
 * İndirgeyici 180 eksi veya 90 eksi diye doldurmaz.
 */
export type AngleState = {
  visible: boolean;
  kind: string;
  acute: number;
  corresponding: number;
  alternate: number;
  supplementary: number;
  straight: number;
  complement: number;
  adjacentLabel: string;
  triangle: readonly number[];
  triangleSum: number;
  triangleMissing: number;
  quadrilateral: readonly number[];
  quadrilateralSum: number;
  quadrilateralKnown: number;
  quadrilateralMissing: number;
  diagonalLong: number;
  diagonalShort: number;
  halfLong: number;
  halfShort: number;
  names: readonly string[];
  note: string;
  marks: readonly TimedNumber[];
};

/** Alan. Taban, yükseklik ve birim dönüşümü parametredir. Çarpım hesaplanmaz. */
export type AreaState = {
  visible: boolean;
  base: number;
  height: number;
  slant: number;
  parallelogram: number;
  triangle: number;
  divisor: number;
  unit: string;
  formula: string;
  squareSide: number;
  squareArea: number;
  squareCm2: number;
  cm2PerM2: number;
  donumCount: number;
  donumM2: number;
  hectareCount: number;
  hectareDonum: number;
  donumPerHectare: number;
  note: string;
  marks: readonly TimedNumber[];
};

/** Kuvvet. Aynı yön, zıt yön ve denge newtonları parametredir. Toplama yapılmaz. */
export type ForceState = {
  visible: boolean;
  unit: string;
  sameA: number;
  sameB: number;
  sameResult: number;
  sameWay: string;
  oppositeA: number;
  oppositeB: number;
  oppositeResult: number;
  oppositeWay: string;
  balanceA: number;
  balanceB: number;
  balanceResult: number;
  showBalance: boolean;
  unbalancedA: number;
  unbalancedB: number;
  unbalancedResult: number;
  unbalancedWay: string;
  note: string;
  marks: readonly TimedNumber[];
};

/** Sürat ve yer değiştirme. Bölme ve fark indirgeyicide yapılmaz. */
export type SpeedState = {
  visible: boolean;
  distance: number;
  time: number;
  speed: number;
  distanceUnit: string;
  timeUnit: string;
  speedUnit: string;
  spanDistance: number;
  spanTime: number;
  laterDistance: number;
  laterTime: number;
  otherDistance: number;
  otherTime: number;
  otherSpeed: number;
  path: number;
  displacement: number;
  showDisplacement: boolean;
  direction: string;
  pathSum: number;
  displacementNet: number;
  straight: number;
  note: string;
  marks: readonly TimedNumber[];
};

export type SummaryCardItem = {
  icon: "puzzle" | "search" | "plus" | "columns" | "link";
  title: string;
  body: string;
};

/**
 * Kavram listesi. Dersin adımlarını zamanla açar.
 * `summary-board` recap kartlarını (dersin sonu) baştan basar; bu layout
 * anlatı ilerledikçe satır ekler, yani ekran konuşmayla birlikte değişir.
 */
export type ConceptRow = {
  title: string;
  body: string;
  tone: "concept" | "example" | "trap" | "gold" | "recap";
};

export type ConceptListState = {
  visible: boolean;
  heading: string;
  rows: readonly ConceptRow[];
  /** Kaçıncı satıra kadar açık. `atMs` ile satır satır artar. */
  revealed: number;
  note: string;
};

export type SceneGraphState = {
  elapsedMs: number;
  layout: StageLayout;
  title: string;
  subtitle: string;
  ruleBadges: readonly string[];
  marblesSpawned: boolean;
  marbleCount: number;
  marbleGroup: MarbleGroupState;
  factorTree: FactorTreeState;
  multipleTower: MultipleTowerState;
  primeFactor: PrimeFactorState;
  commonDivisor: CommonDivisorState;
  circle: CircleMeasureState;
  habitat: HabitatState;
  fuel: FuelState;
  fraction: FractionState;
  numberLine: NumberLineState;
  angle: AngleState;
  area: AreaState;
  force: ForceState;
  speed: SpeedState;
  detective: DetectiveState;
  callout: CalloutState | null;
  summaryCards: readonly SummaryCardItem[];
  conceptList: ConceptListState;
  echoPrompt: string;
  activeCue: CueSegment | null;
  activeCueIndex: number;
  activeWord: WordTimestamp | null;
  activeWordIndex: number;
  activeChapterId: string;
};

const INITIAL_MARBLE_GROUP: MarbleGroupState = {
  total: 12,
  groupSize: null,
  groups: 0,
  remainder: 0,
  highlightRemainder: null,
  equation: "",
};

const INITIAL_FACTOR_TREE: FactorTreeState = {
  visible: false,
  number: 6,
  factors: [1, 2, 3, 6],
  pairs: ["1 × 6 = 6", "2 × 3 = 6"],
  label: "Çarpanlar: eşit veya küçük (1, 2, 3, 6)",
};

const INITIAL_MULTIPLE_TOWER: MultipleTowerState = {
  visible: false,
  base: 6,
  multiples: [],
  label: "Katlar: Katlanarak büyüyen kule",
  comparisonLeft: null,
  comparisonRight: null,
};

const INITIAL_PRIME_FACTOR: PrimeFactorState = {
  visible: false,
  composite: null,
  prime: null,
};

const INITIAL_COMMON_DIVISOR: CommonDivisorState = {
  visible: false,
  left: 0,
  right: 0,
  leftDivisors: [],
  rightDivisors: [],
  commonDivisors: [],
  gcd: 0,
  leftMultiples: [],
  rightMultiples: [],
  lcm: 0,
  marks: [],
};

const INITIAL_CIRCLE: CircleMeasureState = {
  visible: false,
  radius: 0,
  diameter: 0,
  pi: 0,
  circumference: 0,
  unit: "",
  formula: "",
  relation: "",
  centralAngle: 0,
  arcMeasure: 0,
  fullTurn: 0,
  semicircle: 0,
  slice: 0,
  parts: 0,
  turns: 0,
  distance: 0,
  marks: [],
};

const INITIAL_HABITAT: HabitatState = {
  visible: false,
  birds: 0,
  plants: 0,
  birdsLost: 0,
  threats: [],
  protection: "",
  marks: [],
};

const INITIAL_FUEL: FuelState = {
  visible: false,
  distanceKm: 0,
  fuelLitres: 0,
  walkKm: 0,
  cleanStack: "",
  dirtyStack: "",
  alternate: "",
  marks: [],
};

const INITIAL_FRACTION: FractionState = {
  visible: false,
  operation: "",
  leftNumerator: 0,
  leftDenominator: 0,
  rightNumerator: 0,
  rightDenominator: 0,
  equivalentNumerator: 0,
  equivalentDenominator: 0,
  resultNumerator: 0,
  resultDenominator: 0,
  differenceNumerator: 0,
  differenceDenominator: 0,
  productNumerator: 0,
  productDenominator: 0,
  simplifiedNumerator: 0,
  simplifiedDenominator: 0,
  quotient: 0,
  parts: 0,
  filled: 0,
  trap: "",
  note: "",
  marks: [],
};

const INITIAL_NUMBER_LINE: NumberLineState = {
  visible: false,
  unit: "",
  focus: 0,
  focusLabel: "",
  relations: [],
  marks: [],
};

const INITIAL_ANGLE: AngleState = {
  visible: false,
  kind: "",
  acute: 0,
  corresponding: 0,
  alternate: 0,
  supplementary: 0,
  straight: 0,
  complement: 0,
  adjacentLabel: "",
  triangle: [],
  triangleSum: 0,
  triangleMissing: 0,
  quadrilateral: [],
  quadrilateralSum: 0,
  quadrilateralKnown: 0,
  quadrilateralMissing: 0,
  diagonalLong: 0,
  diagonalShort: 0,
  halfLong: 0,
  halfShort: 0,
  names: [],
  note: "",
  marks: [],
};

const INITIAL_AREA: AreaState = {
  visible: false,
  base: 0,
  height: 0,
  slant: 0,
  parallelogram: 0,
  triangle: 0,
  divisor: 0,
  unit: "",
  formula: "",
  squareSide: 0,
  squareArea: 0,
  squareCm2: 0,
  cm2PerM2: 0,
  donumCount: 0,
  donumM2: 0,
  hectareCount: 0,
  hectareDonum: 0,
  donumPerHectare: 0,
  note: "",
  marks: [],
};

const INITIAL_FORCE: ForceState = {
  visible: false,
  unit: "",
  sameA: 0,
  sameB: 0,
  sameResult: 0,
  sameWay: "",
  oppositeA: 0,
  oppositeB: 0,
  oppositeResult: 0,
  oppositeWay: "",
  balanceA: 0,
  balanceB: 0,
  balanceResult: 0,
  showBalance: false,
  unbalancedA: 0,
  unbalancedB: 0,
  unbalancedResult: 0,
  unbalancedWay: "",
  note: "",
  marks: [],
};

const INITIAL_SPEED: SpeedState = {
  visible: false,
  distance: 0,
  time: 0,
  speed: 0,
  distanceUnit: "",
  timeUnit: "",
  speedUnit: "",
  spanDistance: 0,
  spanTime: 0,
  laterDistance: 0,
  laterTime: 0,
  otherDistance: 0,
  otherTime: 0,
  otherSpeed: 0,
  path: 0,
  displacement: 0,
  showDisplacement: false,
  direction: "",
  pathSum: 0,
  displacementNet: 0,
  straight: 0,
  note: "",
  marks: [],
};

const INITIAL_DETECTIVE: DetectiveState = {
  value: 24,
  digits: ["2", "4"],
  highlightedTarget: null,
  highlightedDigit: null,
  highlightColor: "cyan",
  magnifyingGlass: false,
  dimOthers: false,
  digitSum: null,
  verdicts: [],
};

const INITIAL_CONCEPT_LIST: ConceptListState = {
  visible: false,
  heading: "",
  rows: [],
  revealed: 0,
  note: "",
};

function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readTextList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function readFinite(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readFlag(value: unknown): boolean {
  return value === true;
}

function readNumberList(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is number => typeof item === "number" && Number.isFinite(item));
}

function readTimedList(value: unknown): TimedNumber[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const marks: TimedNumber[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const row = item as { value?: unknown; atMs?: unknown; token?: unknown; slot?: unknown };
    if (typeof row.value !== "number" || !Number.isFinite(row.value)) {
      continue;
    }
    marks.push({
      value: row.value,
      atMs: typeof row.atMs === "number" ? row.atMs : 0,
      ...(typeof row.token === "string" && row.token.length > 0 ? { token: row.token } : {}),
      ...(typeof row.slot === "string" && row.slot.length > 0 ? { slot: row.slot } : {}),
    });
  }
  return marks;
}

function readComposite(value: unknown): PrimeCompositeCard | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as { number?: unknown; factors?: unknown; product?: unknown; branches?: unknown };
  if (typeof row.number !== "number") {
    return null;
  }
  return {
    number: row.number,
    factors: readNumberList(row.factors),
    product: typeof row.product === "string" ? row.product : "",
    branches: readTimedList(row.branches),
  };
}

function readPrimeCard(value: unknown): PrimeNumberCard | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as { number?: unknown; factors?: unknown; stamp?: unknown; nodes?: unknown };
  if (typeof row.number !== "number") {
    return null;
  }
  return {
    number: row.number,
    factors: readNumberList(row.factors),
    stamp: typeof row.stamp === "string" ? row.stamp : "",
    nodes: readTimedList(row.nodes),
  };
}

const CONCEPT_TONES = new Set<ConceptRow["tone"]>(["concept", "example", "trap", "gold", "recap"]);

function readConceptRows(value: unknown): ConceptRow[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const rows: ConceptRow[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const row = item as { title?: unknown; body?: unknown; tone?: unknown };
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const body = typeof row.body === "string" ? row.body.trim() : "";
    if (title.length === 0 || body.length === 0) {
      continue;
    }
    const tone = CONCEPT_TONES.has(row.tone as ConceptRow["tone"])
      ? (row.tone as ConceptRow["tone"])
      : "concept";
    rows.push({ title, body, tone });
  }
  return rows;
}

function applyKeyframe(state: SceneGraphState, kf: VisualKeyframe): void {
  const p = kf.params;
  switch (kf.op) {
    case "SET_STAGE": {
      const nextLayout = (p.layout as StageLayout | undefined) ?? state.layout;
      state.layout = nextLayout;
      if (typeof p.title === "string") state.title = p.title;
      state.subtitle = typeof p.subtitle === "string" ? p.subtitle : "";
      if (Array.isArray(p.ruleBadges)) {
        state.ruleBadges = p.ruleBadges.map(String);
      }
      state.callout = null;
      if (nextLayout === "detective-last-digit" || nextLayout === "detective-digit-sum") {
        state.detective = {
          ...INITIAL_DETECTIVE,
          value: 0,
          digits: [],
          highlightedTarget: null,
          highlightedDigit: null,
          magnifyingGlass: false,
          dimOthers: false,
          digitSum: null,
          verdicts: [],
        };
      }
      if (nextLayout === "factor-vs-multiple") {
        const subject = typeof p.subject === "number" ? p.subject : 0;
        state.factorTree = {
          visible: false,
          number: subject,
          factors: [],
          pairs: [],
          label: "",
        };
        state.multipleTower = {
          ...INITIAL_MULTIPLE_TOWER,
          visible: false,
          multiples: [],
          comparisonLeft: null,
          comparisonRight: null,
        };
      }
      if (nextLayout === "trap-vs-truth") {
        const value = typeof p.subject === "number" ? p.subject : 0;
        const digits = Array.isArray(p.digits)
          ? p.digits.map(String)
          : value > 0
            ? String(value).split("")
            : [];
        const sumDigits = digits.map((digit) => Number(digit)).filter((digit) => Number.isFinite(digit));
        const sum =
          typeof p.digitSum === "number"
            ? p.digitSum
            : sumDigits.reduce((total, digit) => total + digit, 0);
        const expression =
          typeof p.sumExpression === "string" && p.sumExpression.length > 0
            ? p.sumExpression
            : digits.length > 0
              ? `${digits.join(" + ")} = ${sum}`
              : "";
        state.detective = {
          ...INITIAL_DETECTIVE,
          value,
          digits,
          highlightedTarget: digits.length > 0 ? "ones" : null,
          highlightedDigit: digits[digits.length - 1] ?? null,
          highlightColor: "emerald",
          magnifyingGlass: digits.length > 0,
          dimOthers: digits.length > 1,
          digitSum:
            digits.length > 0
              ? {
                  active: true,
                  digits: sumDigits,
                  expression,
                  sum,
                }
              : null,
          verdicts: [],
          revealed: false,
        };
      }
      if (nextLayout === "summary-board") {
        if (Array.isArray(p.cards)) {
          state.summaryCards = p.cards as SummaryCardItem[];
        }
        if (typeof p.echoPrompt === "string") {
          state.echoPrompt = p.echoPrompt;
        }
      }
      if (nextLayout === "prime-factor-tree") {
        state.primeFactor = { ...INITIAL_PRIME_FACTOR, composite: null, prime: null };
      }
      if (nextLayout === "common-divisor") {
        state.commonDivisor = {
          ...INITIAL_COMMON_DIVISOR,
          leftDivisors: [],
          rightDivisors: [],
          commonDivisors: [],
          leftMultiples: [],
          rightMultiples: [],
          marks: [],
        };
      }
      if (nextLayout === "circle-measure") {
        state.circle = { ...INITIAL_CIRCLE, marks: [] };
      }
      if (nextLayout === "habitat") {
        state.habitat = { ...INITIAL_HABITAT, threats: [], marks: [] };
      }
      if (nextLayout === "fuel") {
        state.fuel = { ...INITIAL_FUEL, marks: [] };
      }
      if (nextLayout === "fraction") {
        state.fraction = { ...INITIAL_FRACTION, marks: [] };
      }
      if (nextLayout === "number-line") {
        state.numberLine = { ...INITIAL_NUMBER_LINE, relations: [], marks: [] };
      }
      if (nextLayout === "angle") {
        state.angle = {
          ...INITIAL_ANGLE,
          triangle: [],
          quadrilateral: [],
          names: [],
          marks: [],
        };
      }
      if (nextLayout === "area") {
        state.area = { ...INITIAL_AREA, marks: [] };
      }
      if (nextLayout === "force") {
        state.force = { ...INITIAL_FORCE, marks: [] };
      }
      if (nextLayout === "speed") {
        state.speed = { ...INITIAL_SPEED, marks: [] };
      }
      break;
    }
    case "SPAWN_MARBLES": {
      state.marblesSpawned = true;
      state.marbleCount = typeof p.count === "number" ? p.count : 12;
      state.marbleGroup = { ...INITIAL_MARBLE_GROUP, total: state.marbleCount };
      break;
    }
    case "GROUP_MARBLES": {
      state.marblesSpawned = true;
      state.marbleGroup = {
        total: typeof p.total === "number" ? p.total : state.marbleCount,
        groupSize: typeof p.groupSize === "number" ? p.groupSize : null,
        groups: typeof p.groups === "number" ? p.groups : 0,
        remainder: typeof p.remainder === "number" ? p.remainder : 0,
        highlightRemainder:
          p.highlightRemainder === "rose" || p.highlightRemainder === "amber"
            ? p.highlightRemainder
            : null,
        equation: typeof p.equation === "string" ? p.equation : "",
      };
      break;
    }
    case "SHOW_FACTOR_TREE": {
      state.factorTree = {
        visible: true,
        number: typeof p.number === "number" ? p.number : 6,
        factors: Array.isArray(p.factors) ? p.factors.map(Number) : [1, 2, 3, 6],
        pairs: Array.isArray(p.pairs) ? p.pairs.map(String) : ["1 × 6 = 6", "2 × 3 = 6"],
        label: typeof p.label === "string" ? p.label : "Çarpanlar: eşit veya küçük (1, 2, 3, 6)",
      };
      break;
    }
    case "BUILD_MULTIPLE_TOWER": {
      const rawMultiples = Array.isArray(p.multiples) ? (p.multiples as MultipleStep[]) : [];
      state.multipleTower = {
        ...state.multipleTower,
        visible: true,
        base: typeof p.base === "number" ? p.base : 6,
        multiples: rawMultiples,
        label: typeof p.label === "string" ? p.label : "Katlar: Katlanarak büyüyen kule",
      };
      break;
    }
    case "HIGHLIGHT_COMPARISON": {
      state.multipleTower = {
        ...state.multipleTower,
        comparisonLeft: typeof p.leftRule === "string" ? p.leftRule : null,
        comparisonRight: typeof p.rightRule === "string" ? p.rightRule : null,
      };
      break;
    }
    case "INSPECT_NUMBER": {
      const val = typeof p.value === "number" ? p.value : 24;
      const digits = Array.isArray(p.digits) ? p.digits.map(String) : String(val).split("");
      state.detective = {
        value: val,
        digits,
        highlightedTarget: null,
        highlightedDigit: null,
        highlightColor: "cyan",
        magnifyingGlass: false,
        dimOthers: false,
        digitSum: null,
        verdicts: [],
      };
      break;
    }
    case "HIGHLIGHT_DIGIT": {
      const color =
        p.color === "amber" || p.color === "rose" || p.color === "emerald" ? p.color : "cyan";
      state.detective = {
        ...state.detective,
        highlightedTarget:
          p.target === "all" ? "all" : p.target === "last-two" ? "last-two" : "ones",
        highlightedDigit: typeof p.digit === "string" ? p.digit : state.detective.digits[state.detective.digits.length - 1] ?? null,
        highlightColor: color,
        magnifyingGlass: Boolean(p.magnifyingGlass),
        dimOthers: Boolean(p.dimOthers),
      };
      break;
    }
    case "ANIMATE_DIGIT_SUM": {
      const digits = Array.isArray(p.digits) ? p.digits.map(Number) : [2, 4];
      const sum = typeof p.sum === "number" ? p.sum : digits.reduce((a, b) => a + b, 0);
      const expr = typeof p.expression === "string" ? p.expression : `${digits.join(" + ")} = ${sum}`;
      state.detective = {
        ...state.detective,
        highlightedTarget: "all",
        magnifyingGlass: false,
        dimOthers: false,
        digitSum: {
          active: true,
          digits,
          expression: expr,
          sum,
        },
      };
      break;
    }
    case "STAMP_VERDICT": {
      const verdicts = Array.isArray(p.verdicts) ? (p.verdicts as VerdictStamp[]) : [];
      state.detective = {
        ...state.detective,
        verdicts,
      };
      break;
    }
    case "SHOW_PRIME_FACTOR_TREE": {
      const composite = readComposite(p.composite);
      const prime = readPrimeCard(p.prime);
      state.layout = "prime-factor-tree";
      state.primeFactor = {
        visible: true,
        composite: composite ?? state.primeFactor.composite,
        prime: prime ?? state.primeFactor.prime,
      };
      break;
    }
    case "SHOW_COMMON_DIVISOR": {
      state.layout = "common-divisor";
      state.commonDivisor = {
        visible: true,
        left: typeof p.left === "number" ? p.left : 0,
        right: typeof p.right === "number" ? p.right : 0,
        leftDivisors: readNumberList(p.leftDivisors),
        rightDivisors: readNumberList(p.rightDivisors),
        commonDivisors: readNumberList(p.commonDivisors),
        gcd: typeof p.gcd === "number" ? p.gcd : 0,
        leftMultiples: readNumberList(p.leftMultiples),
        rightMultiples: readNumberList(p.rightMultiples),
        lcm: typeof p.lcm === "number" ? p.lcm : 0,
        marks: readTimedList(p.marks),
      };
      break;
    }
    case "SHOW_CIRCLE": {
      state.layout = "circle-measure";
      state.circle = {
        visible: true,
        radius: readFinite(p.radius),
        diameter: readFinite(p.diameter),
        pi: readFinite(p.pi),
        circumference: readFinite(p.circumference),
        unit: readText(p.unit),
        formula: readText(p.formula),
        relation: readText(p.relation),
        centralAngle: readFinite(p.centralAngle),
        arcMeasure: readFinite(p.arcMeasure),
        fullTurn: readFinite(p.fullTurn),
        semicircle: readFinite(p.semicircle),
        slice: readFinite(p.slice),
        parts: readFinite(p.parts),
        turns: readFinite(p.turns),
        distance: readFinite(p.distance),
        marks: readTimedList(p.marks),
      };
      break;
    }
    case "SHOW_HABITAT": {
      state.layout = "habitat";
      state.habitat = {
        visible: true,
        birds: readFinite(p.birds),
        plants: readFinite(p.plants),
        birdsLost: readFinite(p.birdsLost),
        threats: readTextList(p.threats),
        protection: readText(p.protection),
        marks: readTimedList(p.marks),
      };
      break;
    }
    case "SHOW_FUEL": {
      state.layout = "fuel";
      state.fuel = {
        visible: true,
        distanceKm: readFinite(p.distanceKm),
        fuelLitres: readFinite(p.fuelLitres),
        walkKm: readFinite(p.walkKm),
        cleanStack: readText(p.cleanStack),
        dirtyStack: readText(p.dirtyStack),
        alternate: readText(p.alternate),
        marks: readTimedList(p.marks),
      };
      break;
    }
    case "SHOW_FRACTION": {
      state.layout = "fraction";
      state.fraction = {
        visible: true,
        operation: readText(p.operation),
        leftNumerator: readFinite(p.leftNumerator),
        leftDenominator: readFinite(p.leftDenominator),
        rightNumerator: readFinite(p.rightNumerator),
        rightDenominator: readFinite(p.rightDenominator),
        equivalentNumerator: readFinite(p.equivalentNumerator),
        equivalentDenominator: readFinite(p.equivalentDenominator),
        resultNumerator: readFinite(p.resultNumerator),
        resultDenominator: readFinite(p.resultDenominator),
        differenceNumerator: readFinite(p.differenceNumerator),
        differenceDenominator: readFinite(p.differenceDenominator),
        productNumerator: readFinite(p.productNumerator),
        productDenominator: readFinite(p.productDenominator),
        simplifiedNumerator: readFinite(p.simplifiedNumerator),
        simplifiedDenominator: readFinite(p.simplifiedDenominator),
        quotient: readFinite(p.quotient),
        parts: readFinite(p.parts),
        filled: readFinite(p.filled),
        trap: readText(p.trap),
        note: readText(p.note),
        marks: readTimedList(p.marks),
      };
      break;
    }
    case "SHOW_NUMBER_LINE": {
      state.layout = "number-line";
      state.numberLine = {
        visible: true,
        unit: readText(p.unit),
        focus: readFinite(p.focus),
        focusLabel: readText(p.focusLabel),
        relations: readTextList(p.relations),
        marks: readTimedList(p.marks),
      };
      break;
    }
    case "SHOW_ANGLE": {
      state.layout = "angle";
      state.angle = {
        visible: true,
        kind: readText(p.kind),
        acute: readFinite(p.acute),
        corresponding: readFinite(p.corresponding),
        alternate: readFinite(p.alternate),
        supplementary: readFinite(p.supplementary),
        straight: readFinite(p.straight),
        complement: readFinite(p.complement),
        adjacentLabel: readText(p.adjacentLabel),
        triangle: readNumberList(p.triangle),
        triangleSum: readFinite(p.triangleSum),
        triangleMissing: readFinite(p.triangleMissing),
        quadrilateral: readNumberList(p.quadrilateral),
        quadrilateralSum: readFinite(p.quadrilateralSum),
        quadrilateralKnown: readFinite(p.quadrilateralKnown),
        quadrilateralMissing: readFinite(p.quadrilateralMissing),
        diagonalLong: readFinite(p.diagonalLong),
        diagonalShort: readFinite(p.diagonalShort),
        halfLong: readFinite(p.halfLong),
        halfShort: readFinite(p.halfShort),
        names: readTextList(p.names),
        note: readText(p.note),
        marks: readTimedList(p.marks),
      };
      break;
    }
    case "SHOW_AREA": {
      state.layout = "area";
      state.area = {
        visible: true,
        base: readFinite(p.base),
        height: readFinite(p.height),
        slant: readFinite(p.slant),
        parallelogram: readFinite(p.parallelogram),
        triangle: readFinite(p.triangle),
        divisor: readFinite(p.divisor),
        unit: readText(p.unit),
        formula: readText(p.formula),
        squareSide: readFinite(p.squareSide),
        squareArea: readFinite(p.squareArea),
        squareCm2: readFinite(p.squareCm2),
        cm2PerM2: readFinite(p.cm2PerM2),
        donumCount: readFinite(p.donumCount),
        donumM2: readFinite(p.donumM2),
        hectareCount: readFinite(p.hectareCount),
        hectareDonum: readFinite(p.hectareDonum),
        donumPerHectare: readFinite(p.donumPerHectare),
        note: readText(p.note),
        marks: readTimedList(p.marks),
      };
      break;
    }
    case "SHOW_FORCE": {
      state.layout = "force";
      state.force = {
        visible: true,
        unit: readText(p.unit),
        sameA: readFinite(p.sameA),
        sameB: readFinite(p.sameB),
        sameResult: readFinite(p.sameResult),
        sameWay: readText(p.sameWay),
        oppositeA: readFinite(p.oppositeA),
        oppositeB: readFinite(p.oppositeB),
        oppositeResult: readFinite(p.oppositeResult),
        oppositeWay: readText(p.oppositeWay),
        balanceA: readFinite(p.balanceA),
        balanceB: readFinite(p.balanceB),
        balanceResult: readFinite(p.balanceResult),
        showBalance: readFlag(p.showBalance),
        unbalancedA: readFinite(p.unbalancedA),
        unbalancedB: readFinite(p.unbalancedB),
        unbalancedResult: readFinite(p.unbalancedResult),
        unbalancedWay: readText(p.unbalancedWay),
        note: readText(p.note),
        marks: readTimedList(p.marks),
      };
      break;
    }
    case "SHOW_SPEED": {
      state.layout = "speed";
      state.speed = {
        visible: true,
        distance: readFinite(p.distance),
        time: readFinite(p.time),
        speed: readFinite(p.speed),
        distanceUnit: readText(p.distanceUnit),
        timeUnit: readText(p.timeUnit),
        speedUnit: readText(p.speedUnit),
        spanDistance: readFinite(p.spanDistance),
        spanTime: readFinite(p.spanTime),
        laterDistance: readFinite(p.laterDistance),
        laterTime: readFinite(p.laterTime),
        otherDistance: readFinite(p.otherDistance),
        otherTime: readFinite(p.otherTime),
        otherSpeed: readFinite(p.otherSpeed),
        path: readFinite(p.path),
        displacement: readFinite(p.displacement),
        showDisplacement: readFlag(p.showDisplacement),
        direction: readText(p.direction),
        pathSum: readFinite(p.pathSum),
        displacementNet: readFinite(p.displacementNet),
        straight: readFinite(p.straight),
        note: readText(p.note),
        marks: readTimedList(p.marks),
      };
      break;
    }
    case "SHOW_CALLOUT": {
      const kind =
        p.kind === "gold" || p.kind === "trap" || p.kind === "question" ? p.kind : "concept";
      state.callout = {
        kind,
        badge: typeof p.badge === "string" ? p.badge : "İPUCU",
        text: typeof p.text === "string" ? p.text : "",
      };
      if (state.layout === "trap-vs-truth") {
        state.detective = { ...state.detective, revealed: true };
      }
      break;
    }
    case "SHOW_CONCEPT_LIST": {
      state.layout = "concept-list";
      const previous = state.conceptList;
      const rows = readConceptRows(p.rows);
      // Satır biriktirilir: anlatı ilerledikçe liste büyür, ekran donmaz.
      const merged = p.reset === true ? rows : [...previous.rows, ...rows];
      const requested =
        typeof p.reveal === "number" && Number.isFinite(p.reveal)
          ? Math.trunc(p.reveal)
          : merged.length;
      state.conceptList = {
        visible: merged.length > 0,
        heading: typeof p.heading === "string" ? p.heading : previous.heading,
        rows: merged,
        revealed: Math.max(0, Math.min(merged.length, requested)),
        note: typeof p.note === "string" ? p.note : previous.note,
      };
      if (typeof p.subtitle === "string") {
        state.subtitle = p.subtitle;
      }
      break;
    }
  }
}

/**
 * İki kelime arasındaki sessizlik bu kadar veya daha uzunsa vurgu aralıkta durmaz.
 * Kelime aralığının dışında kuyruk yoktur.
 */
const KARAOKE_SILENCE_GAP_MS = 150;

/**
 * Amber kelime indeksi. Aralık yalnız `startMs ≤ şimdi ≤ endMs`.
 * Sonraki kelime 150 ms veya daha geç başlıyorsa ara indeks -1'dir.
 * Ortak milisaniyede yeni kelime seçilir. Sessizlikte son kelime asılı kalmaz.
 */
function activeKaraokeWordIndex(words: readonly WordTimestamp[], timeMs: number): number {
  let wIdx = -1;
  for (let w = 0; w < words.length; w += 1) {
    const word = words[w]!;
    const next = words[w + 1];
    const gapMs = next ? next.startMs - word.endMs : Number.POSITIVE_INFINITY;
    if (gapMs >= KARAOKE_SILENCE_GAP_MS && timeMs > word.endMs && (!next || timeMs < next.startMs)) {
      return -1;
    }
    if (timeMs >= word.startMs && timeMs <= word.endMs) {
      wIdx = w;
    }
  }
  return wIdx;
}

/**
 * Saf Durum İndirgeyici (Pure State Reducer).
 * 0ms'den currentTimeMs anına kadar tüm keyframe'leri deterministik olarak katlar.
 * İleri/geri sarma (scrubbing) %100 hatasız ve O(K) karmaşıklıkta çalışır.
 */
export function reduceSceneState(timeline: TimelineJSON, currentTimeMs: number): SceneGraphState {
  const clampedMs = Math.max(0, Math.min(timeline.audio.durationMs, currentTimeMs));
  const state: SceneGraphState = {
    elapsedMs: clampedMs,
    layout: "marble-tray",
    title: "Bölünebilme Dedektifleri",
    subtitle: "12 Bilye Deneyi",
    ruleBadges: ["2 Kuralı: Çift (0,2,4,6,8)", "5 Kuralı: 0 veya 5", "10 Kuralı: Sonu 0"],
    marblesSpawned: false,
    marbleCount: 12,
    marbleGroup: { ...INITIAL_MARBLE_GROUP },
    factorTree: { ...INITIAL_FACTOR_TREE },
    multipleTower: { ...INITIAL_MULTIPLE_TOWER },
    primeFactor: { ...INITIAL_PRIME_FACTOR, composite: null, prime: null },
    commonDivisor: {
      ...INITIAL_COMMON_DIVISOR,
      leftDivisors: [],
      rightDivisors: [],
      commonDivisors: [],
      leftMultiples: [],
      rightMultiples: [],
      marks: [],
    },
    circle: { ...INITIAL_CIRCLE, marks: [] },
    habitat: { ...INITIAL_HABITAT, threats: [], marks: [] },
    fuel: { ...INITIAL_FUEL, marks: [] },
    fraction: { ...INITIAL_FRACTION, marks: [] },
    numberLine: { ...INITIAL_NUMBER_LINE, relations: [], marks: [] },
    angle: { ...INITIAL_ANGLE, triangle: [], quadrilateral: [], names: [], marks: [] },
    area: { ...INITIAL_AREA, marks: [] },
    force: { ...INITIAL_FORCE, marks: [] },
    speed: { ...INITIAL_SPEED, marks: [] },
    detective: { ...INITIAL_DETECTIVE },
    callout: null,
    summaryCards: [],
    conceptList: { ...INITIAL_CONCEPT_LIST, rows: [] },
    echoPrompt: "",
    activeCue: null,
    activeCueIndex: 0,
    activeWord: null,
    activeWordIndex: -1,
    activeChapterId: timeline.chapters[0]?.id ?? "ch-1",
  };

  let activeCueIndex = 0;
  for (let i = 0; i < timeline.cues.length; i += 1) {
    const cue = timeline.cues[i]!;
    if (clampedMs >= cue.startMs) {
      activeCueIndex = i;
    }
    for (const kf of cue.keyframes) {
      if (kf.atMs <= clampedMs) {
        applyKeyframe(state, kf);
      }
    }
  }

  const activeCue = timeline.cues[activeCueIndex] ?? timeline.cues[0] ?? null;
  state.activeCue = activeCue;
  state.activeCueIndex = activeCueIndex;
  if (activeCue) {
    state.activeChapterId = activeCue.chapterId;
    if (activeCue.words && activeCue.words.length > 0) {
      const wIdx = activeKaraokeWordIndex(activeCue.words, clampedMs);
      state.activeWordIndex = wIdx;
      state.activeWord = wIdx >= 0 ? (activeCue.words[wIdx] ?? null) : null;
    }
  }

  return state;
}
