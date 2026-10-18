import { z } from "zod";
import type { JuniorGraphicHop } from "./hop";

const fractionSchema = z.strictObject({
  operation: z.string(),
  leftNumerator: z.number(),
  leftDenominator: z.number(),
  rightNumerator: z.number(),
  rightDenominator: z.number(),
  equivalentNumerator: z.number(),
  equivalentDenominator: z.number(),
  resultNumerator: z.number(),
  resultDenominator: z.number(),
  differenceNumerator: z.number(),
  differenceDenominator: z.number(),
  productNumerator: z.number(),
  productDenominator: z.number(),
  simplifiedNumerator: z.number(),
  simplifiedDenominator: z.number(),
  quotient: z.number(),
  parts: z.number(),
  filled: z.number(),
  trap: z.string(),
  note: z.string(),
});

const numberLineSchema = z.strictObject({
  unit: z.string(),
  focus: z.number(),
  focusLabel: z.string(),
  relations: z.array(z.string()),
});

const angleSchema = z.strictObject({
  kind: z.string(),
  acute: z.number(),
  corresponding: z.number(),
  alternate: z.number(),
  supplementary: z.number(),
  straight: z.number(),
  complement: z.number(),
  adjacentLabel: z.string(),
  triangle: z.array(z.number()),
  triangleSum: z.number(),
  triangleMissing: z.number(),
  quadrilateral: z.array(z.number()),
  quadrilateralSum: z.number(),
  quadrilateralKnown: z.number(),
  quadrilateralMissing: z.number(),
  diagonalLong: z.number(),
  diagonalShort: z.number(),
  halfLong: z.number(),
  halfShort: z.number(),
  names: z.array(z.string()),
  note: z.string(),
});

const areaSchema = z.strictObject({
  base: z.number(),
  height: z.number(),
  slant: z.number(),
  parallelogram: z.number(),
  triangle: z.number(),
  divisor: z.number(),
  unit: z.string(),
  formula: z.string(),
  squareSide: z.number(),
  squareArea: z.number(),
  squareCm2: z.number(),
  cm2PerM2: z.number(),
  donumCount: z.number(),
  donumM2: z.number(),
  hectareCount: z.number(),
  hectareDonum: z.number(),
  donumPerHectare: z.number(),
  note: z.string(),
});

const forceSchema = z.strictObject({
  unit: z.string(),
  sameA: z.number(),
  sameB: z.number(),
  sameResult: z.number(),
  sameWay: z.string(),
  oppositeA: z.number(),
  oppositeB: z.number(),
  oppositeResult: z.number(),
  oppositeWay: z.string(),
  balanceA: z.number(),
  balanceB: z.number(),
  balanceResult: z.number(),
  showBalance: z.boolean(),
  unbalancedA: z.number(),
  unbalancedB: z.number(),
  unbalancedResult: z.number(),
  unbalancedWay: z.string(),
  note: z.string(),
});

const speedSchema = z.strictObject({
  distance: z.number(),
  time: z.number(),
  speed: z.number(),
  distanceUnit: z.string(),
  timeUnit: z.string(),
  speedUnit: z.string(),
  spanDistance: z.number(),
  spanTime: z.number(),
  laterDistance: z.number(),
  laterTime: z.number(),
  otherDistance: z.number(),
  otherTime: z.number(),
  otherSpeed: z.number(),
  path: z.number(),
  displacement: z.number(),
  showDisplacement: z.boolean(),
  direction: z.string(),
  pathSum: z.number(),
  displacementNet: z.number(),
  straight: z.number(),
  note: z.string(),
});

export const juniorGraphicHopSchema = z.strictObject({
  schemaVersion: z.literal("2.0.0"),
  layout: z.string().min(1),
  title: z.string(),
  subtitle: z.string(),
  fraction: fractionSchema.nullable(),
  numberLine: numberLineSchema.nullable(),
  angle: angleSchema.nullable(),
  area: areaSchema.nullable(),
  force: forceSchema.nullable(),
  speed: speedSchema.nullable(),
});

const _hop: JuniorGraphicHop = null as unknown as z.infer<typeof juniorGraphicHopSchema>;
const _hopBack: z.infer<typeof juniorGraphicHopSchema> = null as unknown as JuniorGraphicHop;
void _hop;
void _hopBack;
