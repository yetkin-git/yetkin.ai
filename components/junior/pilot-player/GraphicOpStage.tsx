"use client";

import type { ReactElement } from "react";
import type {
  AngleState,
  AreaState,
  CircleMeasureState,
  CommonDivisorState,
  ForceState,
  FractionState,
  FuelState,
  HabitatState,
  NumberLineState,
  PrimeFactorState,
  SceneGraphState,
  SpeedState,
  TimedNumber,
} from "@/lib/junior/pilot-engine/state-reducer";

function lit(now: number, atMs: number): boolean {
  return now >= atMs;
}

function markTime(marks: readonly TimedNumber[], slot: string, value: number): number | null {
  const hit = marks.find((mark) => mark.slot === slot && mark.value === value);
  return hit ? hit.atMs : null;
}

function Chip(props: { value: number; on: boolean }): ReactElement {
  return (
    <span
      style={{ opacity: props.on ? 1 : 0.2 }}
      className="inline-flex min-w-9 items-center justify-center rounded-lg border border-white/20 bg-slate-950/70 px-2 py-1 text-sm font-black text-white"
    >
      {props.value}
    </span>
  );
}

function PrimeTree(props: { card: PrimeFactorState; now: number }): ReactElement {
  const { card, now } = props;
  const composite = card.composite;
  const prime = card.prime;
  const stampOn = Boolean(
    prime &&
      prime.stamp.length > 0 &&
      prime.nodes.some((node) => node.value === prime.number && lit(now, node.atMs)),
  );
  return (
    <div className="grid h-full min-h-0 grid-cols-2 gap-2" data-junior-graphic-op="prime-factor-tree">
      <section className="flex min-h-0 flex-col rounded-xl border border-cyan-400/40 bg-cyan-950/30 p-3">
        <p className="text-[11px] font-black uppercase tracking-wider text-cyan-200">Bileşik sayı</p>
        {composite && (composite.factors.length > 0 || composite.branches.length > 0) ? (
          <>
            <p className="mt-2 text-4xl font-black text-white">{composite.number}</p>
            {composite.product.length > 0 ? (
              <p className="mt-1 text-sm font-bold text-cyan-100" data-junior-composite-product="">
                {composite.product}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {(composite.branches.length > 0 ? composite.branches : composite.factors.map((value) => ({ value, atMs: 0 }))).map(
                (branch, index) => (
                  <Chip
                    key={`${branch.value}-${index}`}
                    value={branch.value}
                    on={"atMs" in branch ? lit(now, branch.atMs) : true}
                  />
                ),
              )}
            </div>
          </>
        ) : null}
      </section>
      <section className="flex min-h-0 flex-col rounded-xl border border-emerald-400/40 bg-emerald-950/25 p-3">
        <p className="text-[11px] font-black uppercase tracking-wider text-emerald-200">Asal sayı</p>
        {prime && (prime.factors.length > 0 || prime.nodes.length > 0) ? (
          <>
            <p className="mt-2 text-4xl font-black text-white">{prime.number}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(prime.nodes.length > 0 ? prime.nodes : prime.factors.map((value) => ({ value, atMs: 0 }))).map(
                (node, index) => (
                  <Chip key={`${node.value}-${index}`} value={node.value} on={"atMs" in node ? lit(now, node.atMs) : true} />
                ),
              )}
            </div>
            {prime.stamp.length > 0 ? (
              <p
                data-junior-prime-stamp={prime.stamp}
                style={{ opacity: stampOn ? 1 : 0.2 }}
                className="mt-3 w-fit rounded-lg bg-emerald-400 px-3 py-1 text-sm font-black text-slate-950"
              >
                {prime.stamp}
              </p>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}

function NumberRow(props: {
  label: string;
  values: readonly number[];
  slot: string;
  marks: readonly TimedNumber[];
  now: number;
  visible: boolean;
}): ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-full text-[11px] font-bold text-slate-300">{props.label}</span>
      {props.values.map((value, index) => {
        const atMs = markTime(props.marks, props.slot, value);
        const on = props.visible && atMs !== null && lit(props.now, atMs);
        return <Chip key={`${props.slot}-${value}-${index}`} value={value} on={on} />;
      })}
    </div>
  );
}

function CommonBoard(props: { card: CommonDivisorState; now: number }): ReactElement {
  const { card, now } = props;
  const gcdOn = card.marks.some((mark) => mark.slot === "gcd" && lit(now, mark.atMs));
  const lcmOn = card.marks.some((mark) => mark.slot === "lcm" && lit(now, mark.atMs));
  return (
    <div className="flex h-full min-h-0 flex-col gap-2" data-junior-graphic-op="common-divisor">
      <div className="flex items-end gap-3">
        <p className="text-3xl font-black text-white" data-junior-common-left="">
          {card.left}
        </p>
        <p className="pb-1 text-sm font-bold text-slate-300">ve</p>
        <p className="text-3xl font-black text-white" data-junior-common-right="">
          {card.right}
        </p>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
        <div className="flex flex-col gap-2 rounded-xl border border-cyan-400/30 bg-slate-950/40 p-2">
          <NumberRow label="Bölenler" values={card.leftDivisors} slot="left-div" marks={card.marks} now={now} visible={card.visible} />
          <NumberRow label="Katlar" values={card.leftMultiples} slot="left-mult" marks={card.marks} now={now} visible={card.visible} />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-amber-400/30 bg-slate-950/40 p-2">
          <NumberRow label="Bölenler" values={card.rightDivisors} slot="right-div" marks={card.marks} now={now} visible={card.visible} />
          <NumberRow label="Katlar" values={card.rightMultiples} slot="right-mult" marks={card.marks} now={now} visible={card.visible} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <p
          data-junior-gcd=""
          style={{ opacity: gcdOn ? 1 : 0.25 }}
          className="rounded-xl bg-cyan-400/20 px-3 py-2 text-center text-sm font-black text-cyan-100"
        >
          Ortak bölen = {card.gcd}
        </p>
        <p
          data-junior-lcm=""
          style={{ opacity: lcmOn ? 1 : 0.25 }}
          className="rounded-xl bg-amber-400/20 px-3 py-2 text-center text-sm font-black text-amber-100"
        >
          Ortak kat = {card.lcm}
        </p>
      </div>
    </div>
  );
}

function hasPrimeDrawing(card: PrimeFactorState): boolean {
  if (!card.visible) {
    return false;
  }
  const compositeOn = Boolean(card.composite && (card.composite.factors.length > 0 || card.composite.branches.length > 0));
  const primeOn = Boolean(card.prime && (card.prime.factors.length > 0 || card.prime.nodes.length > 0));
  return compositeOn || primeOn;
}

function hasCommonDrawing(card: CommonDivisorState): boolean {
  return card.visible && (card.leftDivisors.length > 0 || card.marks.length > 0 || card.gcd > 0 || card.lcm > 0);
}

function trNumber(value: number): string {
  return String(value).replace(".", ",");
}

function MeasureLine(props: { tag: string; text: string }): ReactElement {
  return (
    <p data-junior-circle-line={props.tag} className="text-sm font-black text-white">
      {props.text}
    </p>
  );
}

function CircleBoard(props: { card: CircleMeasureState }): ReactElement {
  const { card } = props;
  const radiusPx = card.radius > 0 ? Math.min(56, 18 + card.radius * 4) : 48;
  const sweep = card.fullTurn > 0 && card.centralAngle > 0 ? (card.centralAngle / card.fullTurn) * Math.PI * 2 : 0;
  const cx = 72;
  const cy = 78;
  const endX = cx + radiusPx * Math.sin(sweep);
  const endY = cy - radiusPx * Math.cos(sweep);
  const large = sweep > Math.PI ? 1 : 0;
  return (
    <div className="grid h-full min-h-0 grid-cols-[148px_1fr] gap-3" data-junior-graphic-op="circle-measure">
      <svg viewBox="0 0 148 160" className="h-full w-full" aria-hidden="true">
        <circle cx={cx} cy={cy} r={radiusPx} fill="none" stroke="#22d3ee" strokeWidth="3" />
        {card.diameter > 0 ? (
          <line
            x1={cx - radiusPx}
            y1={cy}
            x2={cx + radiusPx}
            y2={cy}
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
        ) : null}
        {card.radius > 0 ? <line x1={cx} y1={cy} x2={cx + radiusPx} y2={cy} stroke="#67e8f9" strokeWidth="2.5" /> : null}
        {sweep > 0 ? (
          <path
            d={`M ${cx} ${cy - radiusPx} A ${radiusPx} ${radiusPx} 0 ${large} 1 ${endX} ${endY}`}
            fill="none"
            stroke="#34d399"
            strokeWidth="4"
          />
        ) : null}
      </svg>
      <div className="flex min-h-0 flex-col justify-center gap-1.5">
        {card.radius > 0 ? <MeasureLine tag="radius" text={`r = ${trNumber(card.radius)}`} /> : null}
        {card.relation.length > 0 ? <MeasureLine tag="relation" text={card.relation} /> : null}
        {card.diameter > 0 ? <MeasureLine tag="diameter" text={`R = ${trNumber(card.diameter)}`} /> : null}
        {card.pi > 0 ? <MeasureLine tag="pi" text={`π = ${trNumber(card.pi)}`} /> : null}
        {card.formula.length > 0 && card.circumference > 0 ? (
          <MeasureLine
            tag="circumference"
            text={`${card.formula} = ${trNumber(card.circumference)}${card.unit.length > 0 ? ` ${card.unit}` : ""}`}
          />
        ) : null}
        {card.turns > 0 && card.distance > 0 ? (
          <MeasureLine
            tag="distance"
            text={`${trNumber(card.turns)} tur = ${trNumber(card.distance)}${card.unit.length > 0 ? ` ${card.unit}` : ""}`}
          />
        ) : null}
        {card.centralAngle > 0 ? <MeasureLine tag="angle" text={`merkez açı = ${trNumber(card.centralAngle)}°`} /> : null}
        {card.arcMeasure > 0 ? <MeasureLine tag="arc" text={`yay = ${trNumber(card.arcMeasure)}°`} /> : null}
        {card.fullTurn > 0 ? <MeasureLine tag="full" text={`tam tur = ${trNumber(card.fullTurn)}°`} /> : null}
        {card.semicircle > 0 ? <MeasureLine tag="half" text={`yarım çember = ${trNumber(card.semicircle)}°`} /> : null}
        {card.slice > 0 ? <MeasureLine tag="slice" text={`dilim = ${trNumber(card.slice)}°`} /> : null}
        {card.parts > 0 ? <MeasureLine tag="parts" text={`pay = ${trNumber(card.parts)}`} /> : null}
      </div>
    </div>
  );
}

function HabitatBoard(props: { card: HabitatState }): ReactElement {
  const { card } = props;
  return (
    <div className="flex h-full min-h-0 flex-col gap-2" data-junior-graphic-op="habitat">
      <div className="flex flex-wrap gap-2">
        {card.birds > 0 ? (
          <p data-junior-habitat-birds="" className="rounded-xl bg-emerald-400/20 px-3 py-2 text-sm font-black text-emerald-100">
            {trNumber(card.birds)} kuş türü
          </p>
        ) : null}
        {card.plants > 0 ? (
          <p data-junior-habitat-plants="" className="rounded-xl bg-lime-400/20 px-3 py-2 text-sm font-black text-lime-100">
            {trNumber(card.plants)} bitki türü
          </p>
        ) : null}
        {card.birdsLost > 0 ? (
          <p data-junior-habitat-lost="" className="rounded-xl bg-rose-400/20 px-3 py-2 text-sm font-black text-rose-100">
            {trNumber(card.birdsLost)} tür ayrılır
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        {card.threats.map((threat) => (
          <p key={threat} data-junior-habitat-threat="" className="text-sm font-bold text-amber-100">
            {threat}
          </p>
        ))}
      </div>
      {card.protection.length > 0 ? (
        <p data-junior-habitat-protection="" className="text-sm font-black text-cyan-100">
          {card.protection}
        </p>
      ) : null}
    </div>
  );
}

function FuelBoard(props: { card: FuelState }): ReactElement {
  const { card } = props;
  return (
    <div className="flex h-full min-h-0 flex-col gap-2" data-junior-graphic-op="fuel">
      <div className="flex flex-wrap gap-2">
        {card.distanceKm > 0 ? (
          <p data-junior-fuel-distance="" className="rounded-xl bg-sky-400/20 px-3 py-2 text-sm font-black text-sky-100">
            {trNumber(card.distanceKm)} km
          </p>
        ) : null}
        {card.fuelLitres > 0 ? (
          <p data-junior-fuel-litres="" className="rounded-xl bg-orange-400/20 px-3 py-2 text-sm font-black text-orange-100">
            {trNumber(card.fuelLitres)} litre
          </p>
        ) : null}
        {card.walkKm > 0 ? (
          <p data-junior-fuel-walk="" className="rounded-xl bg-emerald-400/20 px-3 py-2 text-sm font-black text-emerald-100">
            {trNumber(card.walkKm)} km yürüyüş
          </p>
        ) : null}
      </div>
      {card.cleanStack.length > 0 ? (
        <p data-junior-fuel-clean="" className="text-sm font-bold text-cyan-100">
          {card.cleanStack}
        </p>
      ) : null}
      {card.dirtyStack.length > 0 ? (
        <p data-junior-fuel-dirty="" className="text-sm font-bold text-rose-100">
          {card.dirtyStack}
        </p>
      ) : null}
      {card.alternate.length > 0 ? (
        <p data-junior-fuel-alternate="" className="text-sm font-black text-amber-100">
          {card.alternate}
        </p>
      ) : null}
    </div>
  );
}

function fractionPair(numerator: number, denominator: number): string | null {
  if (numerator <= 0 || denominator <= 0) {
    return null;
  }
  return `${trNumber(numerator)}/${trNumber(denominator)}`;
}

function FractionBoard(props: { card: FractionState }): ReactElement {
  const { card } = props;
  const left = fractionPair(card.leftNumerator, card.leftDenominator);
  const right = fractionPair(card.rightNumerator, card.rightDenominator);
  const equivalent = fractionPair(card.equivalentNumerator, card.equivalentDenominator);
  const result = fractionPair(card.resultNumerator, card.resultDenominator);
  const difference = fractionPair(card.differenceNumerator, card.differenceDenominator);
  const product = fractionPair(card.productNumerator, card.productDenominator);
  const simplified = fractionPair(card.simplifiedNumerator, card.simplifiedDenominator);
  return (
    <div className="flex h-full min-h-0 flex-col gap-2" data-junior-graphic-op="fraction">
      <div className="flex flex-wrap gap-2">
        {left ? (
          <p data-junior-fraction="left" className="rounded-xl bg-sky-400/20 px-3 py-2 text-sm font-black text-sky-100">
            sol {left}
          </p>
        ) : null}
        {right ? (
          <p data-junior-fraction="right" className="rounded-xl bg-sky-400/20 px-3 py-2 text-sm font-black text-sky-100">
            sağ {right}
          </p>
        ) : null}
        {equivalent ? (
          <p data-junior-fraction="equivalent" className="rounded-xl bg-amber-400/20 px-3 py-2 text-sm font-black text-amber-100">
            denk {equivalent}
          </p>
        ) : null}
        {result ? (
          <p data-junior-fraction="result" className="rounded-xl bg-emerald-400/20 px-3 py-2 text-sm font-black text-emerald-100">
            sonuç {result}
          </p>
        ) : null}
        {difference ? (
          <p data-junior-fraction="difference" className="rounded-xl bg-emerald-400/20 px-3 py-2 text-sm font-black text-emerald-100">
            fark {difference}
          </p>
        ) : null}
        {product ? (
          <p data-junior-fraction="product" className="rounded-xl bg-violet-400/20 px-3 py-2 text-sm font-black text-violet-100">
            çarpım {product}
          </p>
        ) : null}
        {simplified ? (
          <p data-junior-fraction="simplified" className="rounded-xl bg-violet-400/20 px-3 py-2 text-sm font-black text-violet-100">
            sade {simplified}
          </p>
        ) : null}
        {card.quotient > 0 ? (
          <p data-junior-fraction="quotient" className="rounded-xl bg-rose-400/20 px-3 py-2 text-sm font-black text-rose-100">
            bölüm {trNumber(card.quotient)}
          </p>
        ) : null}
        {card.parts > 0 && card.filled > 0 ? (
          <p data-junior-fraction="parts" className="rounded-xl bg-cyan-400/20 px-3 py-2 text-sm font-black text-cyan-100">
            {trNumber(card.parts)} dilimde {trNumber(card.filled)}
          </p>
        ) : null}
      </div>
      {card.note.length > 0 ? <p className="text-sm font-black text-white">{card.note}</p> : null}
      {card.trap.length > 0 ? <p className="text-sm font-bold text-rose-200">{card.trap}</p> : null}
    </div>
  );
}

function NumberLineBoard(props: { card: NumberLineState }): ReactElement {
  const { card } = props;
  return (
    <div className="flex h-full min-h-0 flex-col gap-2" data-junior-graphic-op="number-line">
      {card.focusLabel.length > 0 ? (
        <p data-junior-number-line="focus" className="text-lg font-black text-white">
          {card.focusLabel}
        </p>
      ) : null}
      <div className="flex flex-col gap-1">
        {card.relations.map((relation) => (
          <p key={relation} data-junior-number-line="relation" className="text-sm font-bold text-cyan-100">
            {relation}
          </p>
        ))}
      </div>
    </div>
  );
}

function degreeLine(tag: string, label: string, value: number): ReactElement | null {
  if (value <= 0) {
    return null;
  }
  return (
    <p data-junior-angle={tag} className="text-sm font-black text-white">
      {label} {trNumber(value)}°
    </p>
  );
}

function AngleBoard(props: { card: AngleState }): ReactElement {
  const { card } = props;
  const triangle = card.triangle.length > 0 ? card.triangle.map((value) => `${trNumber(value)}°`).join(" + ") : "";
  const quad = card.quadrilateral.length > 0 ? card.quadrilateral.map((value) => `${trNumber(value)}°`).join(" + ") : "";
  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5" data-junior-graphic-op="angle">
      {degreeLine("acute", "iç açı", card.acute)}
      {degreeLine("corresponding", "yöndeş", card.corresponding)}
      {degreeLine("alternate", "iç ters", card.alternate)}
      {degreeLine("supplementary", "bütünler", card.supplementary)}
      {degreeLine("straight", "doğru açı", card.straight)}
      {degreeLine("complement", "tümler", card.complement)}
      {card.adjacentLabel.length > 0 ? (
        <p data-junior-angle="adjacent" className="text-sm font-bold text-amber-100">
          {card.adjacentLabel}
        </p>
      ) : null}
      {card.diagonalLong > 0 ? (
        <p data-junior-angle="diagonal-long" className="text-sm font-black text-white">
          köşegen {trNumber(card.diagonalLong)} cm
        </p>
      ) : null}
      {card.diagonalShort > 0 ? (
        <p data-junior-angle="diagonal-short" className="text-sm font-black text-white">
          köşegen {trNumber(card.diagonalShort)} cm
        </p>
      ) : null}
      {card.halfLong > 0 ? (
        <p data-junior-angle="half-long" className="text-sm font-bold text-cyan-100">
          {trNumber(card.halfLong)} cm ve {trNumber(card.halfLong)} cm
        </p>
      ) : null}
      {card.halfShort > 0 ? (
        <p data-junior-angle="half-short" className="text-sm font-bold text-cyan-100">
          {trNumber(card.halfShort)} cm ve {trNumber(card.halfShort)} cm
        </p>
      ) : null}
      {triangle.length > 0 ? (
        <p data-junior-angle="triangle" className="text-sm font-black text-white">
          üçgen {triangle}
          {card.triangleSum > 0 ? ` = ${trNumber(card.triangleSum)}°` : ""}
        </p>
      ) : null}
      {quad.length > 0 ? (
        <p data-junior-angle="quad" className="text-sm font-black text-white">
          dörtgen {quad}
          {card.quadrilateralSum > 0 ? ` = ${trNumber(card.quadrilateralSum)}°` : ""}
        </p>
      ) : null}
      {card.names.map((name) => (
        <p key={name} data-junior-angle="name" className="text-sm font-black text-amber-100">
          {name}
        </p>
      ))}
      {card.note.length > 0 ? <p className="text-sm font-bold text-slate-200">{card.note}</p> : null}
    </div>
  );
}

function AreaBoard(props: { card: AreaState }): ReactElement {
  const { card } = props;
  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5" data-junior-graphic-op="area">
      {card.base > 0 ? <p className="text-sm font-black text-white">taban {trNumber(card.base)}</p> : null}
      {card.height > 0 ? <p className="text-sm font-black text-white">yükseklik {trNumber(card.height)}</p> : null}
      {card.slant > 0 ? <p className="text-sm font-bold text-rose-200">eğik {trNumber(card.slant)}</p> : null}
      {card.parallelogram > 0 ? (
        <p data-junior-area="parallelogram" className="text-sm font-black text-cyan-100">
          paralelkenar {trNumber(card.parallelogram)} {card.unit}
        </p>
      ) : null}
      {card.triangle > 0 ? (
        <p data-junior-area="triangle" className="text-sm font-black text-emerald-100">
          üçgen {trNumber(card.triangle)} {card.unit}
        </p>
      ) : null}
      {card.formula.length > 0 ? <p className="text-sm font-bold text-slate-200">{card.formula}</p> : null}
      {card.squareSide > 0 ? <p className="text-sm font-black text-white">kenar {trNumber(card.squareSide)}</p> : null}
      {card.squareArea > 0 ? (
        <p data-junior-area="square" className="text-sm font-black text-cyan-100">
          {trNumber(card.squareArea)} {card.unit}
        </p>
      ) : null}
      {card.squareCm2 > 0 ? (
        <p data-junior-area="cm2" className="text-sm font-black text-white">
          {trNumber(card.squareCm2)} cm²
        </p>
      ) : null}
      {card.cm2PerM2 > 0 ? <p className="text-sm font-bold text-slate-200">{trNumber(card.cm2PerM2)} cm² = 1 m²</p> : null}
      {card.donumCount > 0 ? (
        <p data-junior-area="donum" className="text-sm font-black text-amber-100">
          {trNumber(card.donumCount)} dönüm = {trNumber(card.donumM2)} m²
        </p>
      ) : null}
      {card.hectareCount > 0 ? (
        <p data-junior-area="hectare" className="text-sm font-black text-emerald-100">
          {trNumber(card.hectareCount)} hektar = {trNumber(card.hectareDonum)} dönüm
        </p>
      ) : null}
      {card.note.length > 0 ? <p className="text-sm font-bold text-slate-200">{card.note}</p> : null}
    </div>
  );
}

function forceLine(tag: string, text: string): ReactElement {
  return (
    <p data-junior-force={tag} className="text-sm font-black text-white">
      {text}
    </p>
  );
}

function ForceBoard(props: { card: ForceState }): ReactElement {
  const { card } = props;
  const unit = card.unit.length > 0 ? card.unit : "N";
  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5" data-junior-graphic-op="force">
      {card.sameA > 0 && card.sameB > 0 && card.sameResult > 0
        ? forceLine("same", `${trNumber(card.sameA)} ${unit} + ${trNumber(card.sameB)} ${unit} = ${trNumber(card.sameResult)} ${unit} ${card.sameWay}`)
        : null}
      {card.oppositeA > 0 && card.oppositeB > 0 && card.oppositeResult > 0
        ? forceLine(
            "opposite",
            `${trNumber(card.oppositeA)} ${unit} − ${trNumber(card.oppositeB)} ${unit} = ${trNumber(card.oppositeResult)} ${unit} ${card.oppositeWay}`,
          )
        : null}
      {card.showBalance ? (
        forceLine(
          "balance",
          `${trNumber(card.balanceA)} ${unit} ve ${trNumber(card.balanceB)} ${unit} Bileşke ${trNumber(card.balanceResult)}`,
        )
      ) : null}
      {card.unbalancedA > 0 && card.unbalancedResult > 0
        ? forceLine(
            "unbalanced",
            `${trNumber(card.unbalancedA)} ${unit} − ${trNumber(card.unbalancedB)} ${unit} = ${trNumber(card.unbalancedResult)} ${unit} ${card.unbalancedWay}`,
          )
        : null}
      {card.note.length > 0 ? <p className="text-sm font-bold text-amber-100">{card.note}</p> : null}
    </div>
  );
}

function SpeedBoard(props: { card: SpeedState }): ReactElement {
  const { card } = props;
  const distanceUnit = card.distanceUnit.length > 0 ? card.distanceUnit : "m";
  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5" data-junior-graphic-op="speed">
      {card.distance > 0 && card.time > 0 ? (
        <p data-junior-speed="rate" className="text-sm font-black text-white">
          {trNumber(card.distance)} {card.distanceUnit} ÷ {trNumber(card.time)} {card.timeUnit} = {trNumber(card.speed)} {card.speedUnit}
        </p>
      ) : null}
      {card.spanTime > 0 && card.spanDistance > 0 ? (
        <p data-junior-speed="span" className="text-sm font-bold text-cyan-100">
          {trNumber(card.spanTime)} {card.timeUnit} → {trNumber(card.spanDistance)} {card.distanceUnit}
        </p>
      ) : null}
      {card.laterTime > 0 && card.laterDistance > 0 ? (
        <p data-junior-speed="later" className="text-sm font-bold text-cyan-100">
          {trNumber(card.laterTime)} {card.timeUnit} → {trNumber(card.laterDistance)} {card.distanceUnit}
        </p>
      ) : null}
      {card.otherDistance > 0 && card.otherTime > 0 ? (
        <p data-junior-speed="other" className="text-sm font-black text-emerald-100">
          {trNumber(card.otherDistance)} {card.distanceUnit} ÷ {trNumber(card.otherTime)} {card.timeUnit} = {trNumber(card.otherSpeed)} {card.speedUnit}
        </p>
      ) : null}
      {card.showDisplacement ? (
        <>
          <p data-junior-speed="path" className="text-sm font-black text-white">
            alınan yol {trNumber(card.path)} {distanceUnit}
          </p>
          <p data-junior-speed="displacement" className="text-sm font-black text-amber-100">
            yer değiştirme {trNumber(card.displacement)} {distanceUnit}
          </p>
          {card.pathSum > 0 ? (
            <p data-junior-speed="path-sum" className="text-sm font-bold text-cyan-100">
              alınan yol {trNumber(card.pathSum)} {distanceUnit}
            </p>
          ) : null}
          {card.displacementNet > 0 ? (
            <p data-junior-speed="net" className="text-sm font-bold text-emerald-100">
              yer değiştirme {trNumber(card.displacementNet)} {distanceUnit} {card.direction}
            </p>
          ) : null}
          {card.straight > 0 ? (
            <p data-junior-speed="straight" className="text-sm font-bold text-white">
              düz {trNumber(card.straight)} {distanceUnit}
            </p>
          ) : null}
        </>
      ) : null}
      {card.note.length > 0 ? <p className="text-sm font-bold text-slate-200">{card.note}</p> : null}
    </div>
  );
}

function hasCircleDrawing(card: CircleMeasureState): boolean {
  return (
    card.visible &&
    (card.radius > 0 ||
      card.diameter > 0 ||
      card.circumference > 0 ||
      card.centralAngle > 0 ||
      card.marks.length > 0)
  );
}

function hasHabitatDrawing(card: HabitatState): boolean {
  return card.visible && (card.birds > 0 || card.plants > 0 || card.threats.length > 0 || card.marks.length > 0);
}

function hasFuelDrawing(card: FuelState): boolean {
  return (
    card.visible &&
    (card.distanceKm > 0 || card.fuelLitres > 0 || card.cleanStack.length > 0 || card.marks.length > 0)
  );
}

function hasFractionDrawing(card: FractionState): boolean {
  return (
    card.visible &&
    (card.leftNumerator > 0 ||
      card.resultNumerator > 0 ||
      card.productNumerator > 0 ||
      card.quotient > 0 ||
      card.parts > 0 ||
      card.note.length > 0 ||
      card.marks.length > 0)
  );
}

function hasNumberLineDrawing(card: NumberLineState): boolean {
  return card.visible && (card.focusLabel.length > 0 || card.relations.length > 0 || card.focus > 0 || card.marks.length > 0);
}

function hasAngleDrawing(card: AngleState): boolean {
  return (
    card.visible &&
    (card.acute > 0 ||
      card.diagonalLong > 0 ||
      card.triangle.length > 0 ||
      card.names.length > 0 ||
      card.note.length > 0 ||
      card.marks.length > 0)
  );
}

function hasAreaDrawing(card: AreaState): boolean {
  return (
    card.visible &&
    (card.base > 0 || card.parallelogram > 0 || card.squareArea > 0 || card.donumCount > 0 || card.marks.length > 0)
  );
}

function hasForceDrawing(card: ForceState): boolean {
  return card.visible && (card.sameA > 0 || card.showBalance || card.note.length > 0 || card.marks.length > 0);
}

function hasSpeedDrawing(card: SpeedState): boolean {
  return card.visible && (card.distance > 0 || card.showDisplacement || card.path > 0 || card.marks.length > 0);
}

/** İşlem sözlüğünün çizicisi. Sayıyı state'ten basar; kardeş dersin tablosunu doldurmaz. */
export function GraphicOpStage(props: { state: SceneGraphState; currentTimeMs: number }): ReactElement {
  const { state, currentTimeMs } = props;
  const prime = state.layout === "prime-factor-tree" && hasPrimeDrawing(state.primeFactor);
  const common = state.layout === "common-divisor" && hasCommonDrawing(state.commonDivisor);
  const circle = state.layout === "circle-measure" && hasCircleDrawing(state.circle);
  const habitat = state.layout === "habitat" && hasHabitatDrawing(state.habitat);
  const fuel = state.layout === "fuel" && hasFuelDrawing(state.fuel);
  const fraction = state.layout === "fraction" && hasFractionDrawing(state.fraction);
  const numberLine = state.layout === "number-line" && hasNumberLineDrawing(state.numberLine);
  const angle = state.layout === "angle" && hasAngleDrawing(state.angle);
  const area = state.layout === "area" && hasAreaDrawing(state.area);
  const force = state.layout === "force" && hasForceDrawing(state.force);
  const speed = state.layout === "speed" && hasSpeedDrawing(state.speed);
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden p-3">
      {prime ? (
        <PrimeTree card={state.primeFactor} now={currentTimeMs} />
      ) : common ? (
        <CommonBoard card={state.commonDivisor} now={currentTimeMs} />
      ) : circle ? (
        <CircleBoard card={state.circle} />
      ) : habitat ? (
        <HabitatBoard card={state.habitat} />
      ) : fuel ? (
        <FuelBoard card={state.fuel} />
      ) : fraction ? (
        <FractionBoard card={state.fraction} />
      ) : numberLine ? (
        <NumberLineBoard card={state.numberLine} />
      ) : angle ? (
        <AngleBoard card={state.angle} />
      ) : area ? (
        <AreaBoard card={state.area} />
      ) : force ? (
        <ForceBoard card={state.force} />
      ) : speed ? (
        <SpeedBoard card={state.speed} />
      ) : (
        <div data-junior-graphic-op="none" />
      )}
    </div>
  );
}
