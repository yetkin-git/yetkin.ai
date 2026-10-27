"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { burstJuniorActivityConfetti } from "@/lib/junior/activity-confetti";
import {
  playApplauseSound,
  playOopsSound,
  primeActivityAudio,
} from "@/lib/junior/activity-sound";
import {
  getJuniorLessonBlueprint,
  type JuniorSimulationModeId,
} from "@/lib/junior/lesson-engine";
import dynamic from "next/dynamic";
import { markGameComplete, simModeToGameId } from "@/lib/junior/progress-tracker";
import type { TopicSimProps } from "@/components/junior/lesson-engine/mat-topic-simulations";

const ExponentTowerSim = dynamic<TopicSimProps>(
  () =>
    import("@/components/junior/lesson-engine/mat-topic-simulations").then(
      (mod) => mod.ExponentTowerSim,
    ),
);
const OperationPrioritySim = dynamic<TopicSimProps>(
  () =>
    import("@/components/junior/lesson-engine/mat-topic-simulations").then(
      (mod) => mod.OperationPrioritySim,
    ),
);
const DistributeAreaSim = dynamic<TopicSimProps>(
  () =>
    import("@/components/junior/lesson-engine/mat-topic-simulations").then(
      (mod) => mod.DistributeAreaSim,
    ),
);
const ProblemStepsSim = dynamic<TopicSimProps>(
  () =>
    import("@/components/junior/lesson-engine/mat-topic-simulations").then(
      (mod) => mod.ProblemStepsSim,
    ),
);

const MARBLE_TOTAL = 12;
const GROUP_OPTIONS = [2, 3, 4, 5] as const;

const MARBLE_PALETTE = [
  { main: "#22d3ee", mid: "#0891b2", deep: "#164e63" },
  { main: "#38bdf8", mid: "#0284c7", deep: "#0c4a6e" },
  { main: "#a78bfa", mid: "#7c3aed", deep: "#4c1d95" },
  { main: "#34d399", mid: "#059669", deep: "#064e3b" },
  { main: "#fbbf24", mid: "#d97706", deep: "#78350f" },
  { main: "#f472b6", mid: "#db2777", deep: "#831843" },
] as const;

const BALANCE_NUMBERS = [12, 14, 15, 18, 24, 30] as const;
const BALANCE_DIVISORS = [2, 3, 4, 5, 6, 9, 10] as const;

type SimMode = JuniorSimulationModeId;
type GroupSize = (typeof GROUP_OPTIONS)[number];

type MarbleSlot = "pool" | `box-${number}` | "remainder";

type DragMarble = {
  id: number;
  pointerId: number;
  x: number;
  y: number;
};

function MarbleChip(props: {
  index: number;
  remainder?: boolean;
  bounce?: boolean;
  dragging?: boolean;
  onPointerDown?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}): ReactElement {
  const { index, remainder, bounce, dragging, onPointerDown } = props;
  const color = remainder
    ? { main: "#fb7185", mid: "#e11d48", deep: "#881337" }
    : MARBLE_PALETTE[index % MARBLE_PALETTE.length]!;

  return (
    <button
      type="button"
      data-junior-sim-marble={index}
      data-junior-sim-remainder={remainder ? "true" : undefined}
      aria-label={`Bilye ${index + 1}`}
      className={`relative h-9 w-9 shrink-0 touch-none rounded-full border-2 shadow-md transition sm:h-10 sm:w-10 ${
        bounce ? "animate-marble-bounce" : ""
      } ${dragging ? "scale-110 opacity-40" : "hover:scale-105 active:cursor-grabbing"} ${
        remainder ? "border-rose-200" : "border-white/70"
      }`}
      style={{
        background: `radial-gradient(circle at 32% 28%, #fff 0%, ${color.main} 28%, ${color.mid} 72%, ${color.deep} 100%)`,
        cursor: dragging ? "grabbing" : "grab",
      }}
      onPointerDown={onPointerDown}
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow sm:text-xs">
        {index + 1}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-[18%] top-[16%] h-[22%] w-[38%] rounded-full bg-white/75"
      />
    </button>
  );
}

function MarbleDistributionSim({
  profileId = "",
  lessonKey = "",
  onSuccess,
}: {
  profileId?: string;
  lessonKey?: string;
  onSuccess?: () => void;
}): ReactElement {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [groupSize, setGroupSize] = useState<GroupSize>(2);
  const [slots, setSlots] = useState<Record<number, MarbleSlot>>(() =>
    Object.fromEntries(Array.from({ length: MARBLE_TOTAL }, (_, i) => [i, "pool"])),
  );
  const [bounceIds, setBounceIds] = useState<number[]>([]);
  const [bounceRemainder, setBounceRemainder] = useState(false);
  const [drag, setDrag] = useState<DragMarble | null>(null);
  const [hotBox, setHotBox] = useState<number | "remainder" | null>(null);
  const [verdictKey, setVerdictKey] = useState(0);

  const boxCount = Math.floor(MARBLE_TOTAL / groupSize);
  const expectedRemainder = MARBLE_TOTAL % groupSize;
  const boxes = useMemo(() => Array.from({ length: boxCount }, (_, i) => i), [boxCount]);

  const counts = useMemo(() => {
    const byBox: number[] = boxes.map(() => 0);
    let remainder = 0;
    let pool = 0;
    for (let i = 0; i < MARBLE_TOTAL; i += 1) {
      const slot = slots[i] ?? "pool";
      if (slot === "pool") {
        pool += 1;
      } else if (slot === "remainder") {
        remainder += 1;
      } else {
        const boxIdx = Number(slot.replace("box-", ""));
        if (Number.isFinite(boxIdx) && byBox[boxIdx] !== undefined) {
          byBox[boxIdx] += 1;
        }
      }
    }
    return { byBox, remainder, pool };
  }, [boxes, slots]);

  const placed = MARBLE_TOTAL - counts.pool;
  const exact = expectedRemainder === 0 && counts.remainder === 0 && counts.pool === 0;
  const hasRemainderShown =
    expectedRemainder > 0 && counts.remainder === expectedRemainder && counts.pool === 0;
  const completionKey = exact
    ? `exact-${groupSize}`
    : hasRemainderShown
      ? `rem-${groupSize}`
      : null;

  useEffect(() => {
    if (!completionKey) {
      return;
    }
    setVerdictKey((k) => k + 1);
    if (completionKey.startsWith("exact")) {
      playApplauseSound();
      burstJuniorActivityConfetti("spark");
      const gameId = simModeToGameId("marble");
      if (gameId) {
        markGameComplete(profileId, lessonKey, gameId);
        onSuccess?.();
      }
      return;
    }
    playOopsSound();
    setBounceRemainder(true);
    const timer = window.setTimeout(() => setBounceRemainder(false), 750);
    return () => window.clearTimeout(timer);
    // Yalnız completionKey değişince kutla; profil/callback her render'da alkışı tekrarlamaz.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- completionKey SSOT
  }, [completionKey]);

  function resetForGroup(next: GroupSize) {
    setGroupSize(next);
    setSlots(Object.fromEntries(Array.from({ length: MARBLE_TOTAL }, (_, i) => [i, "pool"])));
    setBounceIds([]);
    setBounceRemainder(false);
    setHotBox(null);
    setDrag(null);
  }

  function isBouncing(id: number, slot: MarbleSlot): boolean {
    return bounceIds.includes(id) || (bounceRemainder && slot === "remainder");
  }

  function autoFill() {
    primeActivityAudio();
    const next: Record<number, MarbleSlot> = {};
    let cursor = 0;
    for (let box = 0; box < boxCount; box += 1) {
      for (let n = 0; n < groupSize; n += 1) {
        next[cursor] = `box-${box}`;
        cursor += 1;
      }
    }
    while (cursor < MARBLE_TOTAL) {
      next[cursor] = "remainder";
      cursor += 1;
    }
    setSlots(next);
  }

  const hitTest = useCallback(
    (clientX: number, clientY: number): number | "remainder" | null => {
      const root = canvasRef.current;
      if (!root) {
        return null;
      }
      const targets = root.querySelectorAll<HTMLElement>("[data-junior-sim-drop]");
      for (const el of targets) {
        const rect = el.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          const key = el.dataset.juniorSimDrop;
          if (key === "remainder") {
            return "remainder";
          }
          const idx = Number(key);
          return Number.isFinite(idx) ? idx : null;
        }
      }
      return null;
    },
    [],
  );

  function onMarblePointerDown(index: number, event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) {
      return;
    }
    primeActivityAudio();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ id: index, pointerId: event.pointerId, x: event.clientX, y: event.clientY });
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    setDrag({ ...drag, x: event.clientX, y: event.clientY });
    setHotBox(hitTest(event.clientX, event.clientY));
  }

  function commitDrop(clientX: number, clientY: number, marbleId: number) {
    const target = hitTest(clientX, clientY);
    setHotBox(null);
    if (target === null) {
      return;
    }
    if (target === "remainder") {
      if (expectedRemainder === 0) {
        playOopsSound();
        setBounceIds([marbleId]);
        window.setTimeout(() => setBounceIds([]), 700);
        return;
      }
      setSlots((current) => ({ ...current, [marbleId]: "remainder" }));
      return;
    }
    const filled = Object.values(slots).filter((s) => s === `box-${target}`).length;
    const alreadyHere = slots[marbleId] === `box-${target}`;
    if (!alreadyHere && filled >= groupSize) {
      playOopsSound();
      setBounceIds([marbleId]);
      window.setTimeout(() => setBounceIds([]), 700);
      return;
    }
    setSlots((current) => ({ ...current, [marbleId]: `box-${target}` }));
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    commitDrop(event.clientX, event.clientY, drag.id);
    setDrag(null);
  }

  const equation =
    expectedRemainder === 0
      ? `${MARBLE_TOTAL} = ${boxCount} × ${groupSize}`
      : `${MARBLE_TOTAL} = ${boxCount} × ${groupSize} + ${expectedRemainder}`;

  return (
    <div
      ref={canvasRef}
      data-junior-sim-canvas="marble"
      className="relative flex flex-col gap-3 rounded-2xl border-2 border-cyan-200 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950 p-3 text-white shadow-inner sm:p-4"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        setDrag(null);
        setHotBox(null);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-cyan-300">
          🔮 12 Bilye Dağıtım Simülasyonu
        </p>
        <p
          key={verdictKey}
          className={`rounded-full px-3 py-1 text-xs font-black ${
            exact
              ? "animate-badge-pop bg-emerald-500/25 text-emerald-200"
              : hasRemainderShown
                ? "animate-badge-pop bg-rose-500/25 text-rose-200"
                : "bg-white/10 text-cyan-100"
          }`}
          aria-live="polite"
        >
          {exact
            ? "Kalansız! Tam çarpan."
            : hasRemainderShown
              ? "Artan bilye var — bu çarpan değil."
              : equation}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Grup boyutu">
        {GROUP_OPTIONS.map((size) => (
          <button
            key={size}
            type="button"
            data-junior-sim-group={size}
            aria-pressed={groupSize === size}
            className={`rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold transition sm:text-sm ${
              groupSize === size
                ? "border-cyan-400 bg-cyan-500/30 text-white"
                : "border-white/15 bg-white/5 text-cyan-100 hover:border-cyan-400/50"
            }`}
            onClick={() => resetForGroup(size)}
          >
            {size}&apos;şer
          </button>
        ))}
        <button
          type="button"
          data-junior-sim-autofill=""
          className="ml-auto rounded-xl border-2 border-amber-400/50 bg-amber-400/20 px-3 py-1.5 text-xs font-extrabold text-amber-100 transition hover:bg-amber-400/30 sm:text-sm"
          onClick={autoFill}
        >
          Otomatik diz
        </button>
        <button
          type="button"
          data-junior-sim-reset=""
          className="rounded-xl border-2 border-white/20 bg-white/5 px-3 py-1.5 text-xs font-extrabold text-slate-200 transition hover:bg-white/10 sm:text-sm"
          onClick={() => resetForGroup(groupSize)}
        >
          Sıfırla
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {boxes.map((box) => {
          const filled = counts.byBox[box] ?? 0;
          const full = filled >= groupSize;
          const hot = hotBox === box;
          const inBox = Array.from({ length: MARBLE_TOTAL }, (_, i) => i).filter(
            (i) => slots[i] === `box-${box}`,
          );
          return (
            <div
              key={box}
              data-junior-sim-drop={box}
              className={`min-h-[5.5rem] rounded-2xl border-2 border-dashed p-2 transition ${
                full
                  ? "border-emerald-400 bg-emerald-500/15"
                  : hot
                    ? "border-cyan-300 bg-cyan-400/20"
                    : "border-cyan-500/40 bg-slate-950/50"
              }`}
            >
              <p className="mb-1 text-center text-[10px] font-extrabold uppercase tracking-wide text-cyan-200/90">
                {box + 1}. Kutu ({filled}/{groupSize})
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                {inBox.map((id) => (
                  <MarbleChip
                    key={id}
                    index={id}
                    bounce={isBouncing(id, `box-${box}`)}
                    dragging={drag?.id === id}
                    onPointerDown={(event) => onMarblePointerDown(id, event)}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {expectedRemainder > 0 ? (
          <div
            data-junior-sim-drop="remainder"
            className={`min-h-[5.5rem] rounded-2xl border-2 border-dashed p-2 transition sm:col-span-1 ${
              hotBox === "remainder"
                ? "border-rose-300 bg-rose-500/25"
                : "border-rose-400/50 bg-rose-950/40"
            }`}
          >
            <p className="mb-1 text-center text-[10px] font-extrabold uppercase tracking-wide text-rose-200">
              Dışarıda artan ({counts.remainder}/{expectedRemainder})
            </p>
            <div className="flex flex-wrap justify-center gap-1">
              {Array.from({ length: MARBLE_TOTAL }, (_, i) => i)
                .filter((i) => slots[i] === "remainder")
                .map((id) => (
                  <MarbleChip
                    key={id}
                    index={id}
                    remainder
                    bounce={isBouncing(id, "remainder")}
                    dragging={drag?.id === id}
                    onPointerDown={(event) => onMarblePointerDown(id, event)}
                  />
                ))}
            </div>
          </div>
        ) : null}
      </div>

      <div
        className="rounded-2xl border border-white/10 bg-black/30 p-2"
        data-junior-sim-pool=""
      >
        <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-300">
          Masa ({counts.pool} bilye) — sürükle veya otomatik diz
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: MARBLE_TOTAL }, (_, i) => i)
            .filter((i) => slots[i] === "pool")
            .map((id) => (
              <MarbleChip
                key={id}
                index={id}
                bounce={isBouncing(id, "pool")}
                dragging={drag?.id === id}
                onPointerDown={(event) => onMarblePointerDown(id, event)}
              />
            ))}
          {counts.pool === 0 ? (
            <p className="py-2 text-xs font-semibold text-slate-400">Tüm bilyeler yerleştirildi.</p>
          ) : null}
        </div>
      </div>

      {drag ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: drag.x, top: drag.y }}
        >
          <MarbleChip index={drag.id} dragging={false} />
        </div>
      ) : null}

      <p className="text-center text-[11px] font-semibold leading-snug text-cyan-100/80">
        {placed === 0
          ? "Bilyeleri kutulara sürükle. Kutuya sığmayan artan bilye sıçrar."
          : exact
            ? `${groupSize} sayısı 12'nin çarpanıdır — kalan yok.`
            : hasRemainderShown
              ? `${groupSize} ile dizince ${expectedRemainder} bilye artar; ${groupSize} çarpan değildir.`
              : `${placed} / ${MARBLE_TOTAL} yerleştirildi.`}
      </p>
    </div>
  );
}

function BalanceWeight(props: {
  value: number;
  kind: "number" | "divisor";
  selected?: boolean;
  onSelect: () => void;
}): ReactElement {
  const { value, kind, selected, onSelect } = props;
  const tone =
    kind === "number"
      ? selected
        ? "border-violet-400 bg-violet-500 text-white shadow-[0_0_16px_rgba(139,92,246,0.45)]"
        : "border-violet-200 bg-violet-50 text-violet-950 hover:border-violet-400"
      : selected
        ? "border-amber-400 bg-amber-400 text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.45)]"
        : "border-amber-200 bg-amber-50 text-amber-950 hover:border-amber-400";

  return (
    <button
      type="button"
      data-junior-sim-weight={`${kind}-${value}`}
      aria-pressed={selected}
      className={`min-w-[2.75rem] rounded-xl border-2 px-2.5 py-2 text-sm font-black transition hover:-translate-y-0.5 sm:min-w-[3rem] sm:text-base ${tone}`}
      onClick={() => {
        primeActivityAudio();
        onSelect();
      }}
    >
      {value}
    </button>
  );
}

function DivisibilityBalanceSim({
  profileId = "",
  lessonKey = "",
  onSuccess,
}: {
  profileId?: string;
  lessonKey?: string;
  onSuccess?: () => void;
}): ReactElement {
  const beamId = useId();
  const [number, setNumber] = useState<number | null>(null);
  const [divisor, setDivisor] = useState<number | null>(null);
  const [anim, setAnim] = useState<"idle" | "settle" | "wobble">("idle");
  const [pulse, setPulse] = useState(0);
  const pairKey = number !== null && divisor !== null ? `${number}/${divisor}` : null;

  const remainder = number !== null && divisor !== null ? number % divisor : null;
  const balanced = remainder === 0;
  const tilt =
    remainder === null || divisor === null
      ? 0
      : balanced
        ? 0
        : Math.min(14, 4 + remainder * 2) * (remainder % 2 === 0 ? 1 : -1);

  useEffect(() => {
    if (!pairKey || remainder === null) {
      setAnim("idle");
      return;
    }
    setPulse((p) => p + 1);
    if (remainder === 0) {
      setAnim("settle");
      playApplauseSound();
      burstJuniorActivityConfetti("spark");
      const gameId = simModeToGameId("balance");
      if (gameId) {
        markGameComplete(profileId, lessonKey, gameId);
        onSuccess?.();
      }
    } else {
      setAnim("wobble");
      playOopsSound();
    }
    const timer = window.setTimeout(() => setAnim("idle"), 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pairKey / remainder SSOT
  }, [pairKey, remainder]);

  return (
    <div
      data-junior-sim-canvas="balance"
      className="flex flex-col gap-3 rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-violet-50 via-white to-amber-50 p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-violet-700">
          ⚖️ Bölünebilme Terazisi
        </p>
        <p
          key={pulse}
          className={`rounded-full px-3 py-1 text-xs font-black ${
            remainder === null
              ? "bg-slate-100 text-slate-600"
              : balanced
                ? "animate-badge-pop bg-emerald-100 text-emerald-800"
                : "animate-badge-pop bg-rose-100 text-rose-800"
          }`}
          aria-live="polite"
        >
          {remainder === null
            ? "Sayı ve böleni seç"
            : balanced
              ? `${number} ÷ ${divisor} kalansız — denge!`
              : `${number} ÷ ${divisor} kalan ${remainder} — sallanıyor`}
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-lg">
        <svg viewBox="0 0 400 220" className="h-auto w-full select-none" role="img" aria-label="Bölünebilme terazisi">
          <defs>
            <linearGradient id={`${beamId}-beam`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect x="188" y="36" width="24" height="140" rx="8" fill="#334155" />
          <polygon points="200,28 214,48 186,48" fill="#0f172a" />
          <g
            key={`${pulse}-${anim}`}
            className={
              anim === "settle" ? "animate-scale-settle" : anim === "wobble" ? "animate-scale-wobble" : undefined
            }
            style={
              {
                transformOrigin: "200px 48px",
                transform: anim === "idle" ? `rotate(${tilt}deg)` : undefined,
                ["--junior-tilt" as string]: `${tilt}deg`,
                ["--junior-from-tilt" as string]: `${tilt === 0 ? 10 : tilt}deg`,
                transition: anim === "idle" ? "transform 500ms cubic-bezier(0.34, 1.4, 0.64, 1)" : undefined,
              } as CSSProperties
            }
          >
            <rect x="48" y="44" width="304" height="10" rx="5" fill={`url(#${beamId}-beam)`} />
            <line x1="78" y1="54" x2="78" y2="88" stroke="#64748b" strokeWidth="3" />
            <line x1="322" y1="54" x2="322" y2="88" stroke="#64748b" strokeWidth="3" />
            <rect
              x="40"
              y="88"
              width="76"
              height="52"
              rx="12"
              fill={balanced && remainder === 0 ? "#d1fae5" : "#ede9fe"}
              stroke={balanced && remainder === 0 ? "#34d399" : "#8b5cf6"}
              strokeWidth="2.5"
            />
            <text x="78" y="120" textAnchor="middle" fontSize="22" fontWeight="900" fill="#4c1d95">
              {number ?? "?"}
            </text>
            <rect
              x="284"
              y="88"
              width="76"
              height="52"
              rx="12"
              fill={balanced && remainder === 0 ? "#d1fae5" : "#fffbeb"}
              stroke={balanced && remainder === 0 ? "#34d399" : "#f59e0b"}
              strokeWidth="2.5"
            />
            <text x="322" y="120" textAnchor="middle" fontSize="22" fontWeight="900" fill="#78350f">
              {divisor ?? "?"}
            </text>
          </g>
          <ellipse cx="200" cy="188" rx="70" ry="12" fill="rgba(15,23,42,0.18)" />
          <rect x="150" y="176" width="100" height="16" rx="6" fill="#1e293b" />
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-violet-800">
            Sayı ağırlıkları
          </p>
          <div className="flex flex-wrap gap-1.5">
            {BALANCE_NUMBERS.map((n) => (
              <BalanceWeight
                key={n}
                value={n}
                kind="number"
                selected={number === n}
                onSelect={() => setNumber(n)}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-800">
            Bölen ağırlıkları
          </p>
          <div className="flex flex-wrap gap-1.5">
            {BALANCE_DIVISORS.map((d) => (
              <BalanceWeight
                key={d}
                value={d}
                kind="divisor"
                selected={divisor === d}
                onSelect={() => setDivisor(d)}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] font-semibold leading-snug text-slate-600">
        Tam bölünürse terazi dengelenir; kalan varsa sallanır. Örn. 24÷3 dengede, 14÷3 sallanır.
      </p>
    </div>
  );
}

export function AnimatedSimulationStudio({
  lessonKey,
  profileId = "",
  onSimSuccess,
}: {
  lessonKey: string;
  profileId?: string;
  onSimSuccess?: () => void;
}): ReactElement | null {
  const blueprint = getJuniorLessonBlueprint(lessonKey);
  const tabs = blueprint?.simulations ?? [];
  const defaultMode: SimMode = tabs[0]?.id ?? "marble";
  const [mode, setMode] = useState<SimMode>(defaultMode);

  useEffect(() => {
    const nextDefault = tabs[0]?.id ?? "marble";
    if (tabs.length > 0 && !tabs.some((t) => t.id === mode)) {
      setMode(nextDefault);
    }
  }, [lessonKey, mode, tabs]);

  if (tabs.length === 0) {
    return null;
  }

  const simProps = { profileId, lessonKey, onSuccess: onSimSuccess };

  return (
    <div data-junior-animated-sim="" className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Simülasyon türü">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`junior-sim-tab-${tab.id}`}
            aria-selected={mode === tab.id}
            aria-controls={`junior-sim-panel-${tab.id}`}
            data-junior-sim-mode={tab.id}
            className={`rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold transition sm:text-sm ${
              mode === tab.id
                ? tab.activeClass
                : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-300"
            }`}
            onClick={() => setMode(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <>
          {tabs.some((t) => t.id === "exponent-tower") ? (
            <div
              id="junior-sim-panel-exponent-tower"
              role="tabpanel"
              aria-labelledby="junior-sim-tab-exponent-tower"
              className={mode === "exponent-tower" ? "block" : "hidden"}
            >
              <ExponentTowerSim {...simProps} />
            </div>
          ) : null}
          {tabs.some((t) => t.id === "ops-priority") ? (
            <div
              id="junior-sim-panel-ops-priority"
              role="tabpanel"
              aria-labelledby="junior-sim-tab-ops-priority"
              className={mode === "ops-priority" ? "block" : "hidden"}
            >
              <OperationPrioritySim {...simProps} />
            </div>
          ) : null}
          {tabs.some((t) => t.id === "distribute-area") ? (
            <div
              id="junior-sim-panel-distribute-area"
              role="tabpanel"
              aria-labelledby="junior-sim-tab-distribute-area"
              className={mode === "distribute-area" ? "block" : "hidden"}
            >
              <DistributeAreaSim {...simProps} />
            </div>
          ) : null}
          {tabs.some((t) => t.id === "problem-steps") ? (
            <div
              id="junior-sim-panel-problem-steps"
              role="tabpanel"
              aria-labelledby="junior-sim-tab-problem-steps"
              className={mode === "problem-steps" ? "block" : "hidden"}
            >
              <ProblemStepsSim {...simProps} />
            </div>
          ) : null}
          {tabs.some((t) => t.id === "marble") ? (
            <div
              id="junior-sim-panel-marble"
              role="tabpanel"
              aria-labelledby="junior-sim-tab-marble"
              className={mode === "marble" ? "block" : "hidden"}
            >
              <MarbleDistributionSim {...simProps} />
            </div>
          ) : null}
          {tabs.some((t) => t.id === "balance") ? (
            <div
              id="junior-sim-panel-balance"
              role="tabpanel"
              aria-labelledby="junior-sim-tab-balance"
              className={mode === "balance" ? "block" : "hidden"}
            >
              <DivisibilityBalanceSim {...simProps} />
            </div>
          ) : null}
      </>
    </div>
  );
}
