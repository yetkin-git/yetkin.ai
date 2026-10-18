import type {
  AngleState,
  AreaState,
  ForceState,
  FractionState,
  NumberLineState,
  SceneGraphState,
  SpeedState,
} from "./state-reducer";

/**
 * Play hop'unun grafik alanı. Konuşma metninin içine yazılmaz.
 * Kare listesi, kanca ve etkinlik anahtarı bu nesnede durmaz.
 */

export type JuniorGraphicFraction = {
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
};

export type JuniorGraphicNumberLine = {
  unit: string;
  focus: number;
  focusLabel: string;
  relations: string[];
};

export type JuniorGraphicAngle = {
  kind: string;
  acute: number;
  corresponding: number;
  alternate: number;
  supplementary: number;
  straight: number;
  complement: number;
  adjacentLabel: string;
  triangle: number[];
  triangleSum: number;
  triangleMissing: number;
  quadrilateral: number[];
  quadrilateralSum: number;
  quadrilateralKnown: number;
  quadrilateralMissing: number;
  diagonalLong: number;
  diagonalShort: number;
  halfLong: number;
  halfShort: number;
  names: string[];
  note: string;
};

export type JuniorGraphicArea = {
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
};

export type JuniorGraphicForce = {
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
};

export type JuniorGraphicSpeed = {
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
};

export type JuniorGraphicHop = {
  schemaVersion: "2.0.0";
  layout: string;
  title: string;
  subtitle: string;
  fraction: JuniorGraphicFraction | null;
  numberLine: JuniorGraphicNumberLine | null;
  angle: JuniorGraphicAngle | null;
  area: JuniorGraphicArea | null;
  force: JuniorGraphicForce | null;
  speed: JuniorGraphicSpeed | null;
};

function fractionHop(card: FractionState): JuniorGraphicFraction | null {
  if (!card.visible) {
    return null;
  }
  return {
    operation: card.operation,
    leftNumerator: card.leftNumerator,
    leftDenominator: card.leftDenominator,
    rightNumerator: card.rightNumerator,
    rightDenominator: card.rightDenominator,
    equivalentNumerator: card.equivalentNumerator,
    equivalentDenominator: card.equivalentDenominator,
    resultNumerator: card.resultNumerator,
    resultDenominator: card.resultDenominator,
    differenceNumerator: card.differenceNumerator,
    differenceDenominator: card.differenceDenominator,
    productNumerator: card.productNumerator,
    productDenominator: card.productDenominator,
    simplifiedNumerator: card.simplifiedNumerator,
    simplifiedDenominator: card.simplifiedDenominator,
    quotient: card.quotient,
    parts: card.parts,
    filled: card.filled,
    trap: card.trap,
    note: card.note,
  };
}

function numberLineHop(card: NumberLineState): JuniorGraphicNumberLine | null {
  if (!card.visible) {
    return null;
  }
  return {
    unit: card.unit,
    focus: card.focus,
    focusLabel: card.focusLabel,
    relations: [...card.relations],
  };
}

function angleHop(card: AngleState): JuniorGraphicAngle | null {
  if (!card.visible) {
    return null;
  }
  return {
    kind: card.kind,
    acute: card.acute,
    corresponding: card.corresponding,
    alternate: card.alternate,
    supplementary: card.supplementary,
    straight: card.straight,
    complement: card.complement,
    adjacentLabel: card.adjacentLabel,
    triangle: [...card.triangle],
    triangleSum: card.triangleSum,
    triangleMissing: card.triangleMissing,
    quadrilateral: [...card.quadrilateral],
    quadrilateralSum: card.quadrilateralSum,
    quadrilateralKnown: card.quadrilateralKnown,
    quadrilateralMissing: card.quadrilateralMissing,
    diagonalLong: card.diagonalLong,
    diagonalShort: card.diagonalShort,
    halfLong: card.halfLong,
    halfShort: card.halfShort,
    names: [...card.names],
    note: card.note,
  };
}

function areaHop(card: AreaState): JuniorGraphicArea | null {
  if (!card.visible) {
    return null;
  }
  return {
    base: card.base,
    height: card.height,
    slant: card.slant,
    parallelogram: card.parallelogram,
    triangle: card.triangle,
    divisor: card.divisor,
    unit: card.unit,
    formula: card.formula,
    squareSide: card.squareSide,
    squareArea: card.squareArea,
    squareCm2: card.squareCm2,
    cm2PerM2: card.cm2PerM2,
    donumCount: card.donumCount,
    donumM2: card.donumM2,
    hectareCount: card.hectareCount,
    hectareDonum: card.hectareDonum,
    donumPerHectare: card.donumPerHectare,
    note: card.note,
  };
}

function forceHop(card: ForceState): JuniorGraphicForce | null {
  if (!card.visible) {
    return null;
  }
  return {
    unit: card.unit,
    sameA: card.sameA,
    sameB: card.sameB,
    sameResult: card.sameResult,
    sameWay: card.sameWay,
    oppositeA: card.oppositeA,
    oppositeB: card.oppositeB,
    oppositeResult: card.oppositeResult,
    oppositeWay: card.oppositeWay,
    balanceA: card.balanceA,
    balanceB: card.balanceB,
    balanceResult: card.balanceResult,
    showBalance: card.showBalance,
    unbalancedA: card.unbalancedA,
    unbalancedB: card.unbalancedB,
    unbalancedResult: card.unbalancedResult,
    unbalancedWay: card.unbalancedWay,
    note: card.note,
  };
}

function speedHop(card: SpeedState): JuniorGraphicSpeed | null {
  if (!card.visible) {
    return null;
  }
  return {
    distance: card.distance,
    time: card.time,
    speed: card.speed,
    distanceUnit: card.distanceUnit,
    timeUnit: card.timeUnit,
    speedUnit: card.speedUnit,
    spanDistance: card.spanDistance,
    spanTime: card.spanTime,
    laterDistance: card.laterDistance,
    laterTime: card.laterTime,
    otherDistance: card.otherDistance,
    otherTime: card.otherTime,
    otherSpeed: card.otherSpeed,
    path: card.path,
    displacement: card.displacement,
    showDisplacement: card.showDisplacement,
    direction: card.direction,
    pathSum: card.pathSum,
    displacementNet: card.displacementNet,
    straight: card.straight,
    note: card.note,
  };
}

/** İndirgenmiş sahnenin hop kopyası. Zaman çizelgesini ve kelime saatini taşımaz. */
export function projectJuniorGraphicHop(state: SceneGraphState): JuniorGraphicHop {
  return {
    schemaVersion: "2.0.0",
    layout: state.layout,
    title: state.title,
    subtitle: state.subtitle,
    fraction: fractionHop(state.fraction),
    numberLine: numberLineHop(state.numberLine),
    angle: angleHop(state.angle),
    area: areaHop(state.area),
    force: forceHop(state.force),
    speed: speedHop(state.speed),
  };
}

const LEAK = ["{@","keyframes","markedText","SPAWN_MARBLES","GROUP_MARBLES","wordBank","validRockets"];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function leaks(value: unknown): boolean {
  if (typeof value === "string") {
    return LEAK.some((marker) => value.includes(marker));
  }
  if (Array.isArray(value)) {
    return value.some((item) => leaks(item));
  }
  const row = asRecord(value);
  if (!row) {
    return false;
  }
  return Object.entries(row).some(([key, child]) => leaks(key) || leaks(child));
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function nums(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is number => typeof item === "number" && Number.isFinite(item));
}

function texts(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function readFraction(value: unknown): JuniorGraphicFraction | null {
  const row = asRecord(value);
  if (!row) {
    return null;
  }
  return {
    operation: text(row.operation),
    leftNumerator: num(row.leftNumerator),
    leftDenominator: num(row.leftDenominator),
    rightNumerator: num(row.rightNumerator),
    rightDenominator: num(row.rightDenominator),
    equivalentNumerator: num(row.equivalentNumerator),
    equivalentDenominator: num(row.equivalentDenominator),
    resultNumerator: num(row.resultNumerator),
    resultDenominator: num(row.resultDenominator),
    differenceNumerator: num(row.differenceNumerator),
    differenceDenominator: num(row.differenceDenominator),
    productNumerator: num(row.productNumerator),
    productDenominator: num(row.productDenominator),
    simplifiedNumerator: num(row.simplifiedNumerator),
    simplifiedDenominator: num(row.simplifiedDenominator),
    quotient: num(row.quotient),
    parts: num(row.parts),
    filled: num(row.filled),
    trap: text(row.trap),
    note: text(row.note),
  };
}

function readNumberLine(value: unknown): JuniorGraphicNumberLine | null {
  const row = asRecord(value);
  if (!row) {
    return null;
  }
  return {
    unit: text(row.unit),
    focus: num(row.focus),
    focusLabel: text(row.focusLabel),
    relations: texts(row.relations),
  };
}

function readAngle(value: unknown): JuniorGraphicAngle | null {
  const row = asRecord(value);
  if (!row) {
    return null;
  }
  return {
    kind: text(row.kind),
    acute: num(row.acute),
    corresponding: num(row.corresponding),
    alternate: num(row.alternate),
    supplementary: num(row.supplementary),
    straight: num(row.straight),
    complement: num(row.complement),
    adjacentLabel: text(row.adjacentLabel),
    triangle: nums(row.triangle),
    triangleSum: num(row.triangleSum),
    triangleMissing: num(row.triangleMissing),
    quadrilateral: nums(row.quadrilateral),
    quadrilateralSum: num(row.quadrilateralSum),
    quadrilateralKnown: num(row.quadrilateralKnown),
    quadrilateralMissing: num(row.quadrilateralMissing),
    diagonalLong: num(row.diagonalLong),
    diagonalShort: num(row.diagonalShort),
    halfLong: num(row.halfLong),
    halfShort: num(row.halfShort),
    names: texts(row.names),
    note: text(row.note),
  };
}

function readArea(value: unknown): JuniorGraphicArea | null {
  const row = asRecord(value);
  if (!row) {
    return null;
  }
  return {
    base: num(row.base),
    height: num(row.height),
    slant: num(row.slant),
    parallelogram: num(row.parallelogram),
    triangle: num(row.triangle),
    divisor: num(row.divisor),
    unit: text(row.unit),
    formula: text(row.formula),
    squareSide: num(row.squareSide),
    squareArea: num(row.squareArea),
    squareCm2: num(row.squareCm2),
    cm2PerM2: num(row.cm2PerM2),
    donumCount: num(row.donumCount),
    donumM2: num(row.donumM2),
    hectareCount: num(row.hectareCount),
    hectareDonum: num(row.hectareDonum),
    donumPerHectare: num(row.donumPerHectare),
    note: text(row.note),
  };
}

function readForce(value: unknown): JuniorGraphicForce | null {
  const row = asRecord(value);
  if (!row) {
    return null;
  }
  return {
    unit: text(row.unit),
    sameA: num(row.sameA),
    sameB: num(row.sameB),
    sameResult: num(row.sameResult),
    sameWay: text(row.sameWay),
    oppositeA: num(row.oppositeA),
    oppositeB: num(row.oppositeB),
    oppositeResult: num(row.oppositeResult),
    oppositeWay: text(row.oppositeWay),
    balanceA: num(row.balanceA),
    balanceB: num(row.balanceB),
    balanceResult: num(row.balanceResult),
    showBalance: row.showBalance === true,
    unbalancedA: num(row.unbalancedA),
    unbalancedB: num(row.unbalancedB),
    unbalancedResult: num(row.unbalancedResult),
    unbalancedWay: text(row.unbalancedWay),
    note: text(row.note),
  };
}

function readSpeed(value: unknown): JuniorGraphicSpeed | null {
  const row = asRecord(value);
  if (!row) {
    return null;
  }
  return {
    distance: num(row.distance),
    time: num(row.time),
    speed: num(row.speed),
    distanceUnit: text(row.distanceUnit),
    timeUnit: text(row.timeUnit),
    speedUnit: text(row.speedUnit),
    spanDistance: num(row.spanDistance),
    spanTime: num(row.spanTime),
    laterDistance: num(row.laterDistance),
    laterTime: num(row.laterTime),
    otherDistance: num(row.otherDistance),
    otherTime: num(row.otherTime),
    otherSpeed: num(row.otherSpeed),
    path: num(row.path),
    displacement: num(row.displacement),
    showDisplacement: row.showDisplacement === true,
    direction: text(row.direction),
    pathSum: num(row.pathSum),
    displacementNet: num(row.displacementNet),
    straight: num(row.straight),
    note: text(row.note),
  };
}

/**
 * Hop gövdesindeki grafik alanını okur.
 * Kare listesi veya konuşma kancası varsa alanı yok sayar; konuşmayı bozmaz.
 */
export function readJuniorGraphicHop(value: unknown): JuniorGraphicHop | null {
  const row = asRecord(value);
  if (!row || row.schemaVersion !== "2.0.0") {
    return null;
  }
  if (leaks(row)) {
    return null;
  }
  const layout = text(row.layout);
  if (!layout) {
    return null;
  }
  return {
    schemaVersion: "2.0.0",
    layout,
    title: text(row.title),
    subtitle: text(row.subtitle),
    fraction: readFraction(row.fraction),
    numberLine: readNumberLine(row.numberLine),
    angle: readAngle(row.angle),
    area: readArea(row.area),
    force: readForce(row.force),
    speed: readSpeed(row.speed),
  };
}
