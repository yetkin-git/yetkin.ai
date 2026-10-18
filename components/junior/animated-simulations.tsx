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
import { markGameComplete, simModeToGameId } from "@/lib/junior/progress-tracker";

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

const FEED_TOTALS = [15, 24, 25] as const;
const CHICKEN_COUNTS = [2, 3, 5, 10] as const;

const EGG_TOTAL = 24;
const EGG_CARTON_SIZES = [2, 3, 4, 5, 6, 7, 8] as const;

type SimMode = "marble" | "balance" | "chicken" | "egg";
type GroupSize = (typeof GROUP_OPTIONS)[number];
type FeedTotal = (typeof FEED_TOTALS)[number];
type ChickenCount = (typeof CHICKEN_COUNTS)[number];
type EggCartonSize = (typeof EGG_CARTON_SIZES)[number];

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

function ChickenSvg(props: {
  happy?: boolean;
  feedPerChicken: number;
  index: number;
}): ReactElement {
  const { happy, feedPerChicken, index } = props;
  const uid = useId();
  const body = happy ? "#fbbf24" : "#fcd34d";
  const comb = happy ? "#ef4444" : "#f87171";

  return (
    <div
      data-junior-sim-chicken={index}
      className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition ${
        happy
          ? "animate-chicken-hop border-emerald-400 bg-emerald-50/80 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
          : "border-amber-200/80 bg-amber-50/60 hover:border-amber-400 hover:-translate-y-0.5"
      }`}
    >
      <svg viewBox="0 0 80 72" className="h-14 w-16 sm:h-16 sm:w-[4.5rem]" role="img" aria-label={`Tavuk ${index + 1}`}>
        <defs>
          <radialGradient id={`${uid}-body`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="55%" stopColor={body} />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
        </defs>
        <ellipse cx="40" cy="66" rx="22" ry="4" fill="rgba(120,53,15,0.18)" />
        <ellipse cx="40" cy="42" rx="22" ry="18" fill={`url(#${uid}-body)`} />
        <circle cx="52" cy="28" r="12" fill={`url(#${uid}-body)`} />
        <ellipse cx="62" cy="30" rx="5" ry="3.5" fill="#f59e0b" />
        <circle cx="56" cy="26" r="2.2" fill="#1e293b" />
        <path d="M48 16 Q52 8 56 14 Q60 8 62 16 Q56 12 48 16" fill={comb} />
        <path d="M28 40 Q18 36 16 44 Q20 48 28 46" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
        <path d="M36 58 L34 66 M44 58 L46 66" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
        {happy ? (
          <text x="40" y="14" textAnchor="middle" fontSize="10" fill="#059669">
            ♥
          </text>
        ) : null}
      </svg>
      <p className="text-[10px] font-black text-amber-950 sm:text-xs">
        {feedPerChicken > 0 ? `${feedPerChicken} yem` : "Bekliyor"}
      </p>
    </div>
  );
}

function FeedPellet(props: { index: number; leftover?: boolean }): ReactElement {
  const { index, leftover } = props;
  return (
    <span
      data-junior-sim-feed={index}
      aria-hidden
      className={`inline-block h-2.5 w-2.5 rounded-full border shadow-sm sm:h-3 sm:w-3 ${
        leftover
          ? "animate-marble-bounce border-rose-300 bg-gradient-to-br from-rose-200 to-rose-500"
          : "border-amber-200 bg-gradient-to-br from-amber-100 to-amber-600"
      }`}
      style={{ animationDelay: leftover ? `${(index % 5) * 40}ms` : undefined }}
    />
  );
}

function ChickenFeedSimulation({
  profileId = "",
  lessonKey = "",
  onSuccess,
}: {
  profileId?: string;
  lessonKey?: string;
  onSuccess?: () => void;
}): ReactElement {
  const [feedTotal, setFeedTotal] = useState<FeedTotal>(15);
  const [chickens, setChickens] = useState<ChickenCount>(3);
  const [fed, setFed] = useState(false);
  const [pulse, setPulse] = useState(0);

  const perChicken = Math.floor(feedTotal / chickens);
  const remainder = feedTotal % chickens;
  const exact = remainder === 0;
  const equation =
    exact
      ? `${feedTotal} = ${chickens} × ${perChicken}`
      : `${feedTotal} = ${chickens} × ${perChicken} + ${remainder}`;

  useEffect(() => {
    if (!fed) {
      return;
    }
    setPulse((p) => p + 1);
    if (exact) {
      playApplauseSound();
      burstJuniorActivityConfetti("spark");
      const gameId = simModeToGameId("chicken");
      if (gameId) {
        markGameComplete(profileId, lessonKey, gameId);
        onSuccess?.();
      }
    } else {
      playOopsSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fed / exact SSOT
  }, [fed, exact, feedTotal, chickens]);

  function selectFeed(next: FeedTotal) {
    primeActivityAudio();
    setFeedTotal(next);
    setFed(false);
  }

  function selectChickens(next: ChickenCount) {
    primeActivityAudio();
    setChickens(next);
    setFed(false);
  }

  function distribute() {
    primeActivityAudio();
    setFed(true);
  }

  function reset() {
    primeActivityAudio();
    setFed(false);
  }

  return (
    <div
      data-junior-sim-canvas="chicken"
      className="flex flex-col gap-3 rounded-2xl border-2 border-lime-300 bg-gradient-to-b from-lime-50 via-emerald-50 to-amber-50 p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-lime-800">
          🐣 Tavuk Yemleme (2, 5, 10 Kuralı)
        </p>
        <p
          key={pulse}
          className={`rounded-full px-3 py-1 text-xs font-black ${
            !fed
              ? "bg-white/70 text-lime-900"
              : exact
                ? "animate-badge-pop bg-emerald-500/20 text-emerald-800"
                : "animate-badge-pop bg-rose-500/20 text-rose-800"
          }`}
          aria-live="polite"
        >
          {!fed
            ? "Yem ve tavuk seç, sonra dağıt"
            : exact
              ? "Hepsi neşeli! Tam bölündü."
              : "Kalan var! Tam bölünmez"}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div role="group" aria-label="Yem miktarı">
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-900">
            Yem sayısı
          </p>
          <div className="flex flex-wrap gap-1.5">
            {FEED_TOTALS.map((n) => (
              <button
                key={n}
                type="button"
                data-junior-sim-feed-total={n}
                aria-pressed={feedTotal === n}
                className={`rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold transition sm:text-sm ${
                  feedTotal === n
                    ? "border-amber-500 bg-amber-400 text-amber-950 shadow-[0_0_14px_rgba(245,158,11,0.4)]"
                    : "border-amber-200 bg-white text-amber-900 hover:border-amber-400 hover:-translate-y-0.5"
                }`}
                onClick={() => selectFeed(n)}
              >
                {n} yem
              </button>
            ))}
          </div>
        </div>
        <div role="group" aria-label="Tavuk sayısı">
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-lime-900">
            Tavuk sayısı
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CHICKEN_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                data-junior-sim-chicken-count={n}
                aria-pressed={chickens === n}
                className={`rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold transition sm:text-sm ${
                  chickens === n
                    ? "border-lime-600 bg-lime-500 text-lime-950 shadow-[0_0_14px_rgba(132,204,22,0.4)]"
                    : "border-lime-200 bg-white text-lime-900 hover:border-lime-400 hover:-translate-y-0.5"
                }`}
                onClick={() => selectChickens(n)}
              >
                {n} tavuk
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          data-junior-sim-feed-run=""
          className="rounded-xl border-2 border-emerald-500 bg-emerald-500/90 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-emerald-600 hover:-translate-y-0.5 sm:text-sm"
          onClick={distribute}
        >
          Yemleri dağıt
        </button>
        <button
          type="button"
          data-junior-sim-feed-reset=""
          className="rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 transition hover:border-slate-300 hover:-translate-y-0.5 sm:text-sm"
          onClick={reset}
        >
          Sıfırla
        </button>
        <p className="ml-auto self-center rounded-full bg-white/80 px-3 py-1 text-[11px] font-black text-lime-900">
          {equation}
        </p>
      </div>

      <div
        className={`grid gap-2 ${
          chickens <= 3 ? "grid-cols-2 sm:grid-cols-3" : chickens <= 5 ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-4 sm:grid-cols-5"
        }`}
      >
        {Array.from({ length: chickens }, (_, i) => (
          <ChickenSvg
            key={`${chickens}-${feedTotal}-${i}`}
            index={i}
            happy={fed && exact}
            feedPerChicken={fed ? perChicken : 0}
          />
        ))}
      </div>

      {fed ? (
        <div
          data-junior-sim-feed-yard=""
          className={`rounded-2xl border-2 border-dashed p-3 ${
            exact
              ? "border-emerald-300 bg-emerald-50/70"
              : "border-rose-300 bg-rose-50/80"
          }`}
        >
          <p className="mb-2 text-center text-[10px] font-extrabold uppercase tracking-wide text-amber-950">
            {exact
              ? `Her tavuğa ${perChicken} yem — çitte kalan yok`
              : `Çitte kalan yem: ${remainder} — eşit paylaşılmadı`}
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            {Array.from({ length: feedTotal }, (_, i) => (
              <FeedPellet key={i} index={i} leftover={!exact && i >= feedTotal - remainder} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-lime-300/80 bg-white/50 p-3 text-center text-[11px] font-semibold text-lime-900/80">
          Örn. 15 yem ÷ 5 tavuk = 3&apos;er (neşeli). 25 yem ÷ 2 tavuk = kalan 1 (çitte durur).
        </div>
      )}
    </div>
  );
}

function EggSvg(props: { index: number; leftover?: boolean; nestle?: boolean }): ReactElement {
  const { index, leftover, nestle } = props;
  const uid = useId();
  return (
    <svg
      viewBox="0 0 28 36"
      className={`h-7 w-5 sm:h-8 sm:w-6 ${nestle ? "animate-egg-nestle" : ""} ${
        leftover ? "animate-marble-bounce" : ""
      }`}
      role="img"
      aria-label={leftover ? `Açıkta yumurta ${index + 1}` : `Yumurta ${index + 1}`}
      data-junior-sim-egg={index}
      data-junior-sim-egg-leftover={leftover ? "true" : undefined}
    >
      <defs>
        <radialGradient id={`${uid}-egg`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#fffef7" />
          <stop offset="55%" stopColor={leftover ? "#fecdd3" : "#fde68a"} />
          <stop offset="100%" stopColor={leftover ? "#e11d48" : "#d97706"} />
        </radialGradient>
      </defs>
      <ellipse cx="14" cy="19" rx="11" ry="15" fill={`url(#${uid}-egg)`} stroke={leftover ? "#fb7185" : "#f59e0b"} strokeWidth="1.2" />
      <ellipse cx="10" cy="12" rx="3.5" ry="2" fill="rgba(255,255,255,0.65)" />
    </svg>
  );
}

function EggCartonSimulation({
  profileId = "",
  lessonKey = "",
  onSuccess,
}: {
  profileId?: string;
  lessonKey?: string;
  onSuccess?: () => void;
}): ReactElement {
  const [cartonSize, setCartonSize] = useState<EggCartonSize>(4);
  const [packed, setPacked] = useState(false);
  const [pulse, setPulse] = useState(0);

  const cartonCount = Math.floor(EGG_TOTAL / cartonSize);
  const remainder = EGG_TOTAL % cartonSize;
  const exact = remainder === 0;
  const equation = exact
    ? `${EGG_TOTAL} = ${cartonCount} × ${cartonSize}`
    : `${EGG_TOTAL} = ${cartonCount} × ${cartonSize} + ${remainder}`;

  useEffect(() => {
    if (!packed) {
      return;
    }
    setPulse((p) => p + 1);
    if (exact) {
      playApplauseSound();
      burstJuniorActivityConfetti("spark");
      const gameId = simModeToGameId("egg");
      if (gameId) {
        markGameComplete(profileId, lessonKey, gameId);
        onSuccess?.();
      }
    } else {
      playOopsSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- packed / exact SSOT
  }, [packed, exact, cartonSize]);

  function selectSize(next: EggCartonSize) {
    primeActivityAudio();
    setCartonSize(next);
    setPacked(false);
  }

  function pack() {
    primeActivityAudio();
    setPacked(true);
  }

  function reset() {
    primeActivityAudio();
    setPacked(false);
  }

  return (
    <div
      data-junior-sim-canvas="egg"
      className="flex flex-col gap-3 rounded-2xl border-2 border-orange-300 bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50 p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-800">
          🥚 Yumurta Kolileme (Çarpanlar)
        </p>
        <p
          key={pulse}
          className={`rounded-full px-3 py-1 text-xs font-black ${
            !packed
              ? "bg-white/70 text-orange-900"
              : exact
                ? "animate-badge-pop bg-emerald-500/20 text-emerald-800"
                : "animate-badge-pop bg-rose-500/20 text-rose-800"
          }`}
          aria-live="polite"
        >
          {!packed
            ? "Koli boyutu seç, yumurtaları diz"
            : exact
              ? "Tam oturdu! Bu bir çarpan."
              : "Açıkta yumurta kaldı — çarpan değil"}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Koli boyutu">
        {EGG_CARTON_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            data-junior-sim-egg-size={size}
            aria-pressed={cartonSize === size}
            className={`rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold transition sm:text-sm ${
              cartonSize === size
                ? "border-orange-500 bg-orange-400 text-orange-950 shadow-[0_0_14px_rgba(251,146,60,0.45)]"
                : "border-orange-200 bg-white text-orange-900 hover:border-orange-400 hover:-translate-y-0.5"
            }`}
            onClick={() => selectSize(size)}
          >
            {size}&apos;li koli
          </button>
        ))}
        <button
          type="button"
          data-junior-sim-egg-pack=""
          className="ml-auto rounded-xl border-2 border-amber-500 bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-amber-950 transition hover:bg-amber-500 hover:-translate-y-0.5 sm:text-sm"
          onClick={pack}
        >
          Kolilere diz
        </button>
        <button
          type="button"
          data-junior-sim-egg-reset=""
          className="rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 transition hover:border-slate-300 hover:-translate-y-0.5 sm:text-sm"
          onClick={reset}
        >
          Sıfırla
        </button>
      </div>

      <p className="text-center text-sm font-black text-orange-950">{equation}</p>

      {packed ? (
        <>
          <div
            className={`grid gap-2 ${
              cartonCount <= 4
                ? "grid-cols-2 sm:grid-cols-4"
                : cartonCount <= 6
                  ? "grid-cols-3 sm:grid-cols-6"
                  : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"
            }`}
          >
            {Array.from({ length: cartonCount }, (_, box) => (
              <div
                key={box}
                data-junior-sim-egg-carton={box}
                className={`rounded-2xl border-2 p-2 transition ${
                  exact
                    ? "border-emerald-400 bg-emerald-50/80 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    : "border-amber-300 bg-amber-100/70"
                }`}
              >
                <p className="mb-1 text-center text-[10px] font-extrabold uppercase tracking-wide text-amber-900">
                  Koli {box + 1}
                </p>
                <div className="flex flex-wrap justify-center gap-0.5">
                  {Array.from({ length: cartonSize }, (_, slot) => (
                    <EggSvg
                      key={slot}
                      index={box * cartonSize + slot}
                      nestle
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {remainder > 0 ? (
            <div
              data-junior-sim-egg-leftover-zone=""
              className="rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/90 p-3"
            >
              <p className="mb-2 text-center text-[10px] font-extrabold uppercase tracking-wide text-rose-800">
                Açıkta kalan yumurta ({remainder})
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                {Array.from({ length: remainder }, (_, i) => (
                  <EggSvg key={i} index={EGG_TOTAL - remainder + i} leftover />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-[11px] font-semibold text-emerald-800">
              24 yumurta {cartonSize}&apos;li kolilere tam sığdı — {cartonSize} sayısı 24&apos;ün çarpanı.
            </p>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-orange-300/80 bg-white/60 p-4">
          <div className="mb-2 flex flex-wrap justify-center gap-1">
            {Array.from({ length: EGG_TOTAL }, (_, i) => (
              <EggSvg key={i} index={i} />
            ))}
          </div>
          <p className="text-center text-[11px] font-semibold text-orange-900/80">
            24 yumurta masada. 2, 3, 4, 6, 8&apos;li koli tam oturur; 5 veya 7&apos;li kutuda açıkta kalır.
          </p>
        </div>
      )}
    </div>
  );
}

const SIM_TABS: {
  id: SimMode;
  label: string;
  activeClass: string;
}[] = [
  { id: "marble", label: "🔮 Bilye Dağıtımı", activeClass: "border-cyan-500 bg-cyan-50 text-cyan-950" },
  {
    id: "balance",
    label: "⚖️ Bölünebilme Terazisi",
    activeClass: "border-violet-500 bg-violet-50 text-violet-950",
  },
  {
    id: "chicken",
    label: "🐣 Tavuk Yemleme (2, 5, 10 Kuralı)",
    activeClass: "border-lime-600 bg-lime-50 text-lime-950",
  },
  {
    id: "egg",
    label: "🥚 Yumurta Kolileme (Çarpanlar)",
    activeClass: "border-orange-500 bg-orange-50 text-orange-950",
  },
];

export function AnimatedSimulationStudio({
  lessonKey,
  profileId = "",
  onSimSuccess,
}: {
  lessonKey: string;
  profileId?: string;
  onSimSuccess?: () => void;
}): ReactElement {
  const [mode, setMode] = useState<SimMode>("marble");
  const isMat5 = lessonKey === "jr_06_mat-5";
  const simProps = { profileId, lessonKey, onSuccess: onSimSuccess };

  return (
    <div data-junior-animated-sim="" className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Simülasyon türü">
        {SIM_TABS.map((tab) => (
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

      {isMat5 ? (
        <>
          <div
            id="junior-sim-panel-marble"
            role="tabpanel"
            aria-labelledby="junior-sim-tab-marble"
            className={mode === "marble" ? "block" : "hidden"}
          >
            <MarbleDistributionSim {...simProps} />
          </div>
          <div
            id="junior-sim-panel-balance"
            role="tabpanel"
            aria-labelledby="junior-sim-tab-balance"
            className={mode === "balance" ? "block" : "hidden"}
          >
            <DivisibilityBalanceSim {...simProps} />
          </div>
          <div
            id="junior-sim-panel-chicken"
            role="tabpanel"
            aria-labelledby="junior-sim-tab-chicken"
            className={mode === "chicken" ? "block" : "hidden"}
          >
            <ChickenFeedSimulation {...simProps} />
          </div>
          <div
            id="junior-sim-panel-egg"
            role="tabpanel"
            aria-labelledby="junior-sim-tab-egg"
            className={mode === "egg" ? "block" : "hidden"}
          >
            <EggCartonSimulation {...simProps} />
          </div>
        </>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600">
          Bu ders için animasyonlu simülasyon yakında.
        </p>
      )}
    </div>
  );
}
