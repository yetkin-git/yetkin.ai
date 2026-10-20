"use client";

import { createContext, useContext, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  resolveJuniorTactileRules,
  type JuniorTactileActivityRules,
} from "@/lib/junior/lesson-engine";
import { ActivityBadgeModal, ActivityModal } from "@/components/junior/activity-modal";
import type {
  JuniorActivityClozeGapPublic,
  JuniorActivityPublic,
  JuniorActivityPuzzlePublic,
} from "@/lib/junior/activity-public";
import { burstJuniorActivityConfetti } from "@/lib/junior/activity-confetti";
import { playApplauseSound, playOopsSound, primeActivityAudio } from "@/lib/junior/activity-sound";
import { JUNIOR_PRACTICE_PATH } from "@/lib/junior/limits";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export type CardNote = { id: string; ok: boolean; answer?: string };
export type Note = { id: string; ok: boolean; explanation: string; cards?: CardNote[] };
type Mark = "ok" | "miss";
type BoardLayout = "rail" | "studio";

const PASTEL = [
  "border-sky-300 bg-sky-100 text-sky-950",
  "border-amber-300 bg-amber-100 text-amber-950",
  "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-950",
  "border-emerald-300 bg-emerald-100 text-emerald-950",
  "border-violet-300 bg-violet-100 text-violet-950",
  "border-orange-300 bg-orange-100 text-orange-950",
] as const;

const SECTION = {
  match: {
    emoji: "🎯",
    title: "1. EŞLEŞTİR",
    wash: "border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50",
  },
  cloze: {
    emoji: "✏️",
    title: "2. BOŞLUK DOLDUR",
    wash: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50",
  },
  order: {
    emoji: "🧩",
    title: "3. SIRAYA DİZ",
    wash: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50",
  },
  puzzle: {
    emoji: "🕵️",
    title: "3. DEDEKTİF BULMACASI",
    wash: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50",
  },
} as const;

/** Pilot `jr_06_mat-5` dokunsal geri bildirim kuralları. */
const MAT5_MATCH_TARGET: Readonly<Record<string, string>> = {
  m1: "r1",
  m2: "r2",
  m3: "r3",
  m4: "r4",
};

const MAT5_GAP_ANSWERS: Readonly<Record<string, readonly string[]>> = {
  g1: ["5", "beş", "5'e"],
  g2: ["3", "üç", "3'e"],
  g3: ["çarpanları", "çarpanı", "bölenleri", "carpanlari"],
};

const MAT5_ROCKET_RULES: Readonly<Record<string, readonly string[]>> = {
  n24: ["r2", "r3"],
  n15: ["r5", "r3"],
  n30: ["r2", "r5", "r3"],
  n18: ["r3", "r2"],
};

const MAT5_TACTILE_RULES: JuniorTactileActivityRules = {
  matchTargets: MAT5_MATCH_TARGET,
  gapAnswers: MAT5_GAP_ANSWERS,
  rocketRules: MAT5_ROCKET_RULES,
};

const TactileRulesContext = createContext<JuniorTactileActivityRules | null>(null);

export function JuniorTactileRulesScope({
  lessonKey,
  children,
}: {
  lessonKey: string;
  children: ReactNode;
}) {
  const rules = resolveJuniorTactileRules(lessonKey);
  return <TactileRulesContext.Provider value={rules}>{children}</TactileRulesContext.Provider>;
}

function useTactileRules(): JuniorTactileActivityRules {
  return useContext(TactileRulesContext) ?? MAT5_TACTILE_RULES;
}

function foldText(value: string): string {
  return value.replace(/\s+/g, "").trim().toLocaleLowerCase("tr-TR");
}

export function mat5MatchReady(
  pairs: Record<string, string>,
  rules: JuniorTactileActivityRules = MAT5_TACTILE_RULES,
): boolean {
  const target = rules.matchTargets ?? MAT5_MATCH_TARGET;
  return Object.entries(target).every(([leftId, rightId]) => pairs[leftId] === rightId);
}

export function mat5ClozeReady(
  gaps: Record<string, string>,
  rules: JuniorTactileActivityRules = MAT5_TACTILE_RULES,
): boolean {
  const table = rules.gapAnswers ?? MAT5_GAP_ANSWERS;
  return Object.keys(table).every((gapId) => {
    const clean = foldText(gaps[gapId] ?? "");
    if (!clean) {
      return false;
    }
    return (table[gapId] ?? []).some((item) => foldText(item) === clean);
  });
}

export function mat5PuzzleReady(
  placements: Record<string, string>,
  rules: JuniorTactileActivityRules = MAT5_TACTILE_RULES,
): boolean {
  const table = rules.rocketRules ?? MAT5_ROCKET_RULES;
  return Object.entries(table).every(([tileId, allowed]) => allowed.includes(placements[tileId] ?? ""));
}

function gameCardClass(
  index: number,
  mark: Mark | null,
  picked = false,
  spacious = false,
  /** Studio eşleştirme: kompakt kart; Cloze/Order spacious boyutunu bozmaz. */
  compact = false,
): string {
  const face =
    mark === "ok"
      ? spacious
        ? "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-[0_0_22px_rgba(16,185,129,0.55)]"
        : "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-[0_0_16px_rgba(16,185,129,0.32)]"
      : mark === "miss"
        ? "animate-shake border-rose-500 bg-rose-50 text-rose-950 shadow-[0_0_14px_rgba(244,63,94,0.28)]"
        : `${PASTEL[index % PASTEL.length]} shadow-sm hover:-translate-y-0.5`;
  const ring = picked
    ? "z-10 scale-[1.02] ring-4 ring-violet-600 ring-offset-2 ring-offset-white"
    : mark === "ok"
      ? "ring-2 ring-emerald-300"
      : "";
  const size = compact
    ? `rounded-2xl px-2.5 text-xs leading-snug sm:px-3 sm:text-sm ${mark ? "pb-2.5 pr-20 pt-7" : "py-2.5"}`
    : spacious
      ? `min-h-[7rem] rounded-3xl px-4 text-base leading-snug sm:text-lg ${mark ? "pb-4 pr-24 pt-10" : "py-5"}`
      : `rounded-2xl px-3.5 text-sm sm:text-base ${mark ? "pb-3 pr-24 pt-8" : "py-3"}`;
  return `relative border-2 text-left font-semibold transition ${size} ${face} ${ring}`;
}

/** Studio Boşluk doldur: cümle kartı — min-h ve py-5 yok; dikey sığdırma öncelikli. */
function clozeStudioCardClass(index: number, mark: Mark | null): string {
  const face =
    mark === "ok"
      ? "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-[0_0_12px_rgba(16,185,129,0.32)]"
      : mark === "miss"
        ? "animate-shake border-rose-500 bg-rose-50 text-rose-950 shadow-[0_0_10px_rgba(244,63,94,0.24)]"
        : `${PASTEL[index % PASTEL.length]} shadow-sm`;
  const ring = mark === "ok" ? "ring-1 ring-emerald-300" : "";
  const size = mark
    ? "rounded-2xl px-4 pb-2 pr-20 pt-6 text-sm leading-snug"
    : "rounded-2xl px-4 py-2.5 text-sm leading-snug";
  return `relative border text-left font-semibold transition ${size} ${face} ${ring}`;
}

function cardState(cards: CardNote[], id: string): { mark: Mark | null; answer?: string } {
  const row = cards.find((card) => card.id === id);
  if (!row) {
    return { mark: null };
  }
  return { mark: row.ok ? "ok" : "miss", answer: row.ok ? undefined : row.answer };
}

function MarkBadge({ mark }: { mark: Mark }) {
  const ok = mark === "ok";
  return (
    <span
      data-junior-card-badge={ok ? "ok" : "miss"}
      className={`pointer-events-none absolute right-2 top-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold text-white ${
        ok ? "bg-emerald-600" : "bg-rose-600"
      }`}
    >
      {ok ? "✓ Doğru" : "✗ Yanlış"}
    </span>
  );
}

function AnswerHint({ answer }: { answer?: string }) {
  if (!answer) {
    return null;
  }
  return (
    <p data-junior-answer-hint="" className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700">
      Doğru cevap: {answer}
    </p>
  );
}

function GameHeading({ kind }: { kind: keyof typeof SECTION }) {
  const section = SECTION[kind];
  return (
    <h3 className="text-lg font-extrabold tracking-wide text-slate-900 sm:text-xl">
      <span aria-hidden="true">{section.emoji} </span>
      {section.title}
    </h3>
  );
}

function ResultLine({ note }: { note: Note | null }) {
  if (!note) {
    return null;
  }
  return (
    <p className={`text-xs font-semibold sm:text-sm ${note.ok ? "text-emerald-700" : "text-rose-700"}`}>
      {note.ok ? "Doğru. " : "Yeniden dene. "}
      {note.explanation}
    </p>
  );
}

const MATCH_LINK_COLORS = ["#0284c7", "#d97706", "#c026d3", "#059669", "#7c3aed", "#ea580c"] as const;

type MatchLink = { id: string; d: string; color: string; dashed: boolean };

function matchLinkColor(index: number): string {
  return MATCH_LINK_COLORS[index % MATCH_LINK_COLORS.length] ?? "#0284c7";
}

function roundPx(value: number): number {
  return Math.round(value * 10) / 10;
}

function sameMatchLinks(current: MatchLink[], next: MatchLink[]): boolean {
  if (current.length !== next.length) {
    return false;
  }
  return current.every((item, index) => {
    const other = next[index];
    return (
      other !== undefined &&
      item.id === other.id &&
      item.d === other.d &&
      item.color === other.color &&
      item.dashed === other.dashed
    );
  });
}

/** İki sütun eşiği: kart ~280px × 2 + gap-12 (48px). CSS `@min-[608px]/match` ile aynı sayı. */
const MATCH_COLUMNS_MIN_PX = 608;

function measureMatchLinks(
  board: HTMLElement,
  pairs: { leftId: string; rightId: string; color: string; dashed: boolean }[],
  leftNodes: ReadonlyMap<string, HTMLElement>,
  rightNodes: ReadonlyMap<string, HTMLElement>,
): MatchLink[] {
  const origin = board.getBoundingClientRect();
  if (origin.width < MATCH_COLUMNS_MIN_PX) {
    return [];
  }
  const paths: MatchLink[] = [];
  for (const pair of pairs) {
    const left = leftNodes.get(pair.leftId);
    const right = rightNodes.get(pair.rightId);
    if (!left || !right) {
      continue;
    }
    const from = left.getBoundingClientRect();
    const to = right.getBoundingClientRect();
    if (to.left < from.right - 8) {
      continue;
    }
    const x1 = roundPx(from.right - origin.left);
    const y1 = roundPx(from.top + from.height / 2 - origin.top);
    const x2 = roundPx(to.left - origin.left);
    const y2 = roundPx(to.top + to.height / 2 - origin.top);
    const bend = roundPx(Math.max(28, (x2 - x1) / 2));
    paths.push({
      id: `${pair.leftId}>${pair.rightId}`,
      d: `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`,
      color: pair.color,
      dashed: pair.dashed,
    });
  }
  return paths;
}

function MatchPort({ side, active, linked }: { side: "out" | "in"; active: boolean; linked: boolean }) {
  const place = side === "out" ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2";
  const tone = linked ? "bg-emerald-500" : active ? "bg-violet-600" : "bg-sky-400";
  return (
    <span
      aria-hidden="true"
      data-junior-match-port={side}
      className={`pointer-events-none absolute top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow-sm @min-[608px]/match:block ${place} ${tone}`}
    />
  );
}

export function MatchBoard({
  left,
  right,
  value,
  onChange,
  mark,
  attempt,
  note,
  cards,
  layout = "rail",
  onHit,
}: {
  left: { id: string; label: string }[];
  right: { id: string; label: string }[];
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  mark: Mark | null;
  attempt: number;
  note: Note | null;
  cards: CardNote[];
  layout?: BoardLayout;
  onHit?: (ok: boolean) => void;
}) {
  const conceptsLabelId = useId();
  const explanationsLabelId = useId();
  const boardRef = useRef<HTMLDivElement>(null);
  const leftNodes = useRef(new Map<string, HTMLButtonElement>());
  const rightNodes = useRef(new Map<string, HTMLButtonElement>());
  const tactileRules = useTactileRules();
  const [picked, setPicked] = useState<string | null>(null);
  const [aimRightId, setAimRightId] = useState<string | null>(null);
  const [tactileMarks, setTactileMarks] = useState<Record<string, Mark>>({});
  const [shakeRightId, setShakeRightId] = useState<string | null>(null);
  const [links, setLinks] = useState<MatchLink[]>([]);
  const rightById = new Map(right.map((item) => [item.id, item.label]));
  const spacious = layout === "studio";
  /** Sütun içi dikey aralık — kartlar birbirine yapışmasın, çizgi okunaklı kalsın. */
  const stackGap = "gap-3";
  const compactCards = spacious;

  function clearAim() {
    setAimRightId(null);
  }

  function connectPair(leftId: string, rightId: string) {
    primeActivityAudio();
    clearAim();
    const expectedRight = tactileRules.matchTargets?.[leftId];
    if (expectedRight) {
      if (expectedRight === rightId) {
        const fresh = value[leftId] !== rightId;
        setTactileMarks((curr) => ({ ...curr, [leftId]: "ok" }));
        setShakeRightId(null);
        setPicked(null);
        if (!fresh) {
          return;
        }
        onChange({ ...value, [leftId]: rightId });
        playApplauseSound();
        onHit?.(true);
        return;
      }
      setTactileMarks((curr) => ({ ...curr, [leftId]: "miss" }));
      setShakeRightId(rightId);
      playOopsSound();
      onHit?.(false);
      window.setTimeout(() => {
        setShakeRightId((curr) => (curr === rightId ? null : curr));
      }, 650);
      return;
    }
    onChange({ ...value, [leftId]: rightId });
    setPicked(null);
  }

  const linkSignature = [
    picked ?? "",
    aimRightId ?? "",
    attempt,
    Object.entries(value)
      .map(([leftId, rightId]) => `${leftId}:${rightId}`)
      .join("|"),
    Object.entries(tactileMarks)
      .map(([leftId, tone]) => `${leftId}:${tone}`)
      .join("|"),
    cards.map((card) => `${card.id}:${card.ok}`).join("|"),
  ].join("~");

  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) {
      return;
    }
    const pairs = Object.entries(value).map(([leftId, rightId]) => {
      const index = left.findIndex((item) => item.id === leftId);
      const tone = cardState(cards, leftId).mark ?? tactileMarks[leftId] ?? null;
      return {
        leftId,
        rightId,
        color: tone === "ok" ? "#059669" : tone === "miss" ? "#e11d48" : matchLinkColor(index),
        dashed: false,
      };
    });
    if (picked && aimRightId && value[picked] !== aimRightId) {
      pairs.push({
        leftId: picked,
        rightId: aimRightId,
        color: "#7c3aed",
        dashed: true,
      });
    }
    const draw = () => {
      const next = measureMatchLinks(board, pairs, leftNodes.current, rightNodes.current);
      setLinks((current) => (sameMatchLinks(current, next) ? current : next));
    };
    draw();
    const frame = window.requestAnimationFrame(draw);
    const observer = new ResizeObserver(draw);
    observer.observe(board);
    window.addEventListener("resize", draw);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [aimRightId, cards, left, linkSignature, picked, tactileMarks, value]);

  return (
    <section
      className={`@container/match grid rounded-[1.5rem] border-2 shadow-sm ${spacious ? "gap-4 p-3 sm:p-4" : "gap-3.5 p-3.5 sm:p-4"} ${SECTION.match.wash}`}
      data-junior-match-board=""
      data-junior-board-layout={layout}
      data-junior-activity-mark={mark ?? undefined}
      data-junior-match-picked={picked ?? undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {spacious ? null : <GameHeading kind="match" />}
        <span
          data-junior-match-hint=""
          className="ml-auto rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-900"
        >
          {picked ? (
            "Açıklama seç"
          ) : (
            <>
              <span className="@min-[608px]/match:hidden">Dokunarak Eşleştir</span>
              <span className="hidden @min-[608px]/match:inline">Sürükle-bırak veya dokun</span>
            </>
          )}
        </span>
      </div>
      <div
        ref={boardRef}
        className="relative grid grid-cols-1 items-start gap-5 @min-[608px]/match:grid-cols-2 @min-[608px]/match:gap-12"
        data-junior-matching-grid="columns"
      >
        <div
          role="group"
          aria-labelledby={conceptsLabelId}
          className="grid min-w-0 grid-cols-1 content-start gap-3"
          data-junior-match-column="concepts"
        >
          <p id={conceptsLabelId} className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-800">
            KAVRAMLAR
          </p>
          <div className={`grid grid-cols-1 ${stackGap}`}>
            {left.map((item, index) => {
              const linked = rightById.get(value[item.id] ?? "");
              const serverState = cardState(cards, item.id);
              const effectiveMark = serverState.mark ?? tactileMarks[item.id] ?? null;
              const selected = picked === item.id;
              return (
                <div key={`${item.id}-${effectiveMark === "miss" ? attempt : "card"}`} className="grid gap-1.5">
                  <button
                    type="button"
                    draggable
                    ref={(node) => {
                      if (node) {
                        leftNodes.current.set(item.id, node);
                      } else {
                        leftNodes.current.delete(item.id);
                      }
                    }}
                    aria-pressed={selected}
                    data-junior-card-mark={effectiveMark ?? undefined}
                    data-junior-match-left={item.id}
                    data-junior-match-selected={selected ? "true" : "false"}
                    className={`${gameCardClass(index, effectiveMark, selected, spacious, compactCards)} cursor-grab active:cursor-grabbing`}
                    onDragStart={(event) => {
                      setPicked(item.id);
                      clearAim();
                      event.dataTransfer.setData("text/plain", item.id);
                      event.dataTransfer.effectAllowed = "linkMove";
                    }}
                    onClick={() => {
                      setPicked((current) => (current === item.id ? null : item.id));
                      clearAim();
                    }}
                  >
                    <MatchPort side="out" active={selected} linked={Boolean(linked)} />
                    {effectiveMark ? <MarkBadge mark={effectiveMark} /> : null}
                    <span className="block">{item.label}</span>
                    {linked ? (
                      <span className="mt-1 block text-[11px] font-extrabold text-emerald-800 @min-[608px]/match:hidden">
                        ↔ {linked}
                      </span>
                    ) : null}
                  </button>
                  <AnswerHint answer={serverState.answer} />
                </div>
              );
            })}
          </div>
        </div>
        <div
          role="group"
          aria-labelledby={explanationsLabelId}
          className="grid min-w-0 grid-cols-1 content-start gap-3"
          data-junior-match-column="explanations"
        >
          <p
            id={explanationsLabelId}
            className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-800"
          >
            AÇIKLAMALAR
          </p>
          <div className={`grid grid-cols-1 ${stackGap}`}>
            {right.map((item, index) => {
              const isMatched = Object.values(value).includes(item.id);
              const isShaking = shakeRightId === item.id;
              const targetMark: Mark | null = isShaking ? "miss" : isMatched ? "ok" : null;
              const hot = aimRightId === item.id;
              const armed = Boolean(picked) && !isMatched && !isShaking;
              return (
                <button
                  key={item.id}
                  type="button"
                  ref={(node) => {
                    if (node) {
                      rightNodes.current.set(item.id, node);
                    } else {
                      rightNodes.current.delete(item.id);
                    }
                  }}
                  data-junior-match-right={item.id}
                  data-junior-match-armed={armed ? "true" : "false"}
                  data-junior-match-hot={hot ? "true" : "false"}
                  className={`${gameCardClass(index + left.length, targetMark, hot, spacious, compactCards)} ${
                    armed && !hot ? "ring-2 ring-violet-400" : ""
                  } ${picked ? "cursor-pointer" : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setAimRightId(item.id);
                  }}
                  onDragLeave={(event) => {
                    const next = event.relatedTarget;
                    if (next instanceof Node && event.currentTarget.contains(next)) {
                      return;
                    }
                    setAimRightId((current) => (current === item.id ? null : current));
                  }}
                  onMouseEnter={() => {
                    if (picked) {
                      setAimRightId(item.id);
                    }
                  }}
                  onMouseLeave={() => {
                    setAimRightId((current) => (current === item.id ? null : current));
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const leftId = event.dataTransfer.getData("text/plain") || picked;
                    if (leftId) {
                      connectPair(leftId, item.id);
                    }
                  }}
                  onClick={() => {
                    if (!picked) {
                      return;
                    }
                    connectPair(picked, item.id);
                  }}
                >
                  <MatchPort side="in" active={armed || hot} linked={isMatched} />
                  {targetMark ? <MarkBadge mark={targetMark} /> : null}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        {links.length > 0 ? (
          <svg
            className="pointer-events-none absolute inset-0 z-[1] hidden h-full w-full overflow-visible @min-[608px]/match:block"
            data-junior-match-links=""
            aria-hidden="true"
          >
            {links.map((link) => (
              <path
                key={link.id}
                d={link.d}
                fill="none"
                stroke={link.color}
                strokeWidth={2.75}
                strokeLinecap="round"
                strokeDasharray={link.dashed ? "6 5" : undefined}
                data-junior-match-link={link.id}
              />
            ))}
          </svg>
        ) : null}
      </div>
      <ResultLine note={note} />
    </section>
  );
}

export function OrderBoard({
  tiles,
  puzzle,
  value,
  placements = {},
  onChange,
  onPlacementsChange,
  mark,
  attempt,
  note,
  cards,
  layout = "rail",
  onHit,
}: {
  tiles: { id: string; label: string }[];
  puzzle?: JuniorActivityPuzzlePublic;
  value: string[];
  placements?: Record<string, string>;
  onChange: (next: string[]) => void;
  onPlacementsChange?: (next: Record<string, string>) => void;
  mark: Mark | null;
  attempt: number;
  note: Note | null;
  cards: CardNote[];
  layout?: BoardLayout;
  onHit?: (ok: boolean) => void;
}) {
  const tactileRules = useTactileRules();
  const [pickedTileId, setPickedTileId] = useState<string | null>(null);
  const [shakeRocketId, setShakeRocketId] = useState<string | null>(null);
  const [puzzleHint, setPuzzleHint] = useState<string>("");

  if (puzzle && onPlacementsChange) {
    function assignNumberToRocket(tileId: string, rocketId: string) {
      primeActivityAudio();
      const allowed = tactileRules.rocketRules?.[tileId];
      const tileLabel = tiles.find((t) => t.id === tileId)?.label ?? tileId;
      const rocketLabel = puzzle?.rockets.find((r) => r.id === rocketId)?.label ?? rocketId;
      if (allowed && !allowed.includes(rocketId)) {
        setShakeRocketId(rocketId);
        setPuzzleHint(
          `Dedektif Uyarısı: ${tileLabel} sayısı "${rocketLabel}" kuralına uymuyor! Başka rokete dene.`,
        );
        playOopsSound();
        onHit?.(false);
        window.setTimeout(() => {
          setShakeRocketId((curr) => (curr === rocketId ? null : curr));
        }, 650);
        return;
      }
      if (placements[tileId] === rocketId) {
        setPickedTileId(null);
        return;
      }
      setPuzzleHint(`${tileLabel} sayısı "${rocketLabel}" roketine başarıyla yerleşti! 🚀`);
      setShakeRocketId(null);
      onPlacementsChange?.({ ...placements, [tileId]: rocketId });
      setPickedTileId(null);
      playApplauseSound();
      onHit?.(true);
    }

    return (
      <section
        className={`grid rounded-[1.5rem] border-2 shadow-sm ${layout === "studio" ? "gap-2.5 p-3 sm:p-4" : "gap-3.5 p-3.5 sm:p-4"} ${SECTION.puzzle.wash}`}
        data-junior-order-board=""
        data-junior-detective-puzzle={layout === "studio" ? "compact" : ""}
        data-junior-board-layout={layout}
        data-junior-activity-mark={mark ?? undefined}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          {layout === "studio" ? null : <GameHeading kind="puzzle" />}
          <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900">
            Sayıyı rokete sürükle veya dokun
          </span>
        </div>
        <p className={`font-semibold text-slate-700 ${layout === "studio" ? "text-[11px] leading-snug" : "text-xs"}`}>
          {puzzle.prompt}
        </p>

        {/* Dedektif Sayı Çipleri (`24`, `15`, `30`, `18`) — studio: tek satır kompakt rozet */}
        <div className={layout === "studio" ? "grid grid-cols-4 gap-2" : "flex flex-wrap gap-2"}>
          {tiles.map((tile, index) => {
            const assignedRocketId = placements[tile.id];
            const assignedRocket = puzzle.rockets.find((r) => r.id === assignedRocketId);
            const serverState = cardState(cards, tile.id);
            const tileMark: Mark | null =
              serverState.mark ?? (assignedRocketId ? "ok" : null);
            const isPicked = pickedTileId === tile.id;
            return (
              <button
                key={tile.id}
                type="button"
                draggable
                data-junior-puzzle-number={tile.label}
                data-junior-card-mark={tileMark ?? undefined}
                onDragStart={(event) => {
                  setPickedTileId(tile.id);
                  event.dataTransfer.setData("text/plain", tile.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onClick={() => setPickedTileId(tile.id)}
                className={`flex cursor-grab border-2 font-bold transition active:cursor-grabbing ${
                  layout === "studio"
                    ? "flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-2 text-sm shadow-sm sm:px-4 sm:text-base"
                    : "items-center justify-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-black"
                } ${
                  tileMark === "ok"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                    : tileMark === "miss"
                      ? "animate-shake border-rose-500 bg-rose-50 text-rose-950"
                      : `${PASTEL[index % PASTEL.length]} ${isPicked ? "scale-105 ring-2 ring-violet-500" : ""}`
                }`}
              >
                {layout === "studio" ? (
                  <>
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Sayı</span>
                    <span className="leading-none">{tile.label}</span>
                  </>
                ) : (
                  <span className="text-base">🔢 {tile.label}</span>
                )}
                {assignedRocket ? (
                  <span className="max-w-full truncate rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white sm:px-2 sm:text-[10px]">
                    ✓ {assignedRocket.label}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* 3 Dedektif Roketi — studio: yan yana 3 sütun, düşük min-h */}
        <div
          className={layout === "studio" ? "grid grid-cols-3 gap-2" : "grid gap-2.5"}
          data-junior-category-rockets={layout === "studio" ? "wide" : undefined}
        >
          {puzzle.rockets.map((rocket) => {
            const dockedTiles = tiles.filter((t) => placements[t.id] === rocket.id);
            const isShaking = shakeRocketId === rocket.id;
            const hasDocked = dockedTiles.length > 0;
            return (
              <div
                key={rocket.id}
                role="button"
                tabIndex={0}
                data-junior-puzzle-rocket={rocket.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const tileId = event.dataTransfer.getData("text/plain") || pickedTileId;
                  if (tileId) {
                    assignNumberToRocket(tileId, rocket.id);
                  }
                }}
                onClick={() => {
                  if (pickedTileId) {
                    assignNumberToRocket(pickedTileId, rocket.id);
                  }
                }}
                onKeyDown={(event) => {
                  if ((event.key === "Enter" || event.key === " ") && pickedTileId) {
                    event.preventDefault();
                    assignNumberToRocket(pickedTileId, rocket.id);
                  }
                }}
                className={`cursor-pointer border-2 text-left transition ${
                  layout === "studio" ? "min-h-[100px] rounded-2xl p-3 sm:p-4" : "rounded-3xl p-3"
                } ${
                  isShaking
                    ? "animate-shake border-rose-500 bg-rose-50 text-rose-950"
                    : hasDocked
                      ? "border-emerald-500 bg-emerald-50/90 text-emerald-950 shadow-[0_0_14px_rgba(16,185,129,0.32)]"
                      : "border-dashed border-emerald-400 bg-white/90 hover:border-emerald-600 hover:bg-emerald-50/50"
                }`}
              >
                <div className={`flex gap-2 ${layout === "studio" ? "flex-col" : "items-center justify-between"}`}>
                  <div>
                    <p
                      className={`font-extrabold text-slate-900 ${
                        layout === "studio" ? "text-sm sm:text-base" : "text-sm"
                      }`}
                    >
                      🚀 {rocket.label}
                    </p>
                    <p
                      className={`font-semibold text-slate-600 ${
                        layout === "studio" ? "mt-0.5 text-[10px] sm:text-xs" : "text-[11px]"
                      }`}
                    >
                      {rocket.ruleHint}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {dockedTiles.length > 0 ? (
                      dockedTiles.map((dt) => (
                        <span
                          key={dt.id}
                          className="inline-flex items-center rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow-sm sm:text-xs"
                        >
                          {dt.label} ✓
                        </span>
                      ))
                    ) : (
                      <span
                        className={`rounded-lg bg-slate-100 px-2 py-0.5 font-bold text-slate-500 ${
                          layout === "studio" ? "text-[10px] sm:text-xs" : "text-[11px]"
                        }`}
                      >
                        Sayı bırak
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {puzzleHint ? (
          <p
            aria-live="polite"
            className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
              shakeRocketId ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-900"
            }`}
          >
            {puzzleHint}
          </p>
        ) : null}

        <ResultLine note={note} />
      </section>
    );
  }

  const order = value.length === tiles.length ? value : tiles.map((tile) => tile.id);
  const byId = new Map(tiles.map((tile) => [tile.id, tile]));

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length || from === to) {
      return;
    }
    const next = [...order];
    const [picked] = next.splice(from, 1);
    if (!picked) {
      return;
    }
    next.splice(to, 0, picked);
    onChange(next);
  }

  return (
    <section
      className={`grid gap-4 rounded-[1.75rem] border-2 p-4 shadow-sm sm:p-5 ${SECTION.order.wash}`}
      data-junior-order-board=""
      data-junior-activity-mark={mark ?? undefined}
    >
      <GameHeading kind="order" />
      <ol className="grid gap-3">
        {order.map((id, index) => {
          const tile = byId.get(id);
          if (!tile) {
            return null;
          }
          const state = cardState(cards, id);
          return (
            <li
              key={`${id}-${state.mark === "miss" ? attempt : "card"}`}
              draggable
              data-junior-card-mark={state.mark ?? undefined}
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", String(index));
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const from = Number(event.dataTransfer.getData("text/plain"));
                if (Number.isInteger(from)) {
                  move(from, index);
                }
              }}
              className={`${gameCardClass(index, state.mark)} flex cursor-grab items-center gap-3 active:cursor-grabbing`}
            >
              {state.mark ? <MarkBadge mark={state.mark} /> : null}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-sm font-extrabold">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">{tile.label}</span>
              <button
                type="button"
                className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-bold"
                aria-label={`${tile.label} yukarı`}
                onClick={() => move(index, index - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-bold"
                aria-label={`${tile.label} aşağı`}
                onClick={() => move(index, index + 1)}
              >
                ↓
              </button>
            </li>
          );
        })}
      </ol>
      <ResultLine note={note} />
    </section>
  );
}

export function ClozeLine({
  before,
  after,
  gaps,
  wordBank,
  value,
  gapValues = {},
  onChange,
  onGapChange,
  mark,
  attempt,
  note,
  cards,
  layout = "rail",
  onHit,
}: {
  before: string;
  after: string;
  gaps?: JuniorActivityClozeGapPublic[];
  wordBank?: string[];
  value: string;
  gapValues?: Record<string, string>;
  onChange: (next: string) => void;
  onGapChange?: (next: Record<string, string>) => void;
  mark: Mark | null;
  attempt: number;
  note: Note | null;
  cards: CardNote[];
  layout?: BoardLayout;
  onHit?: (ok: boolean) => void;
}) {
  const tactileRules = useTactileRules();
  const [activeGapId, setActiveGapId] = useState<string | null>(null);
  const [tactileGapMarks, setTactileGapMarks] = useState<Record<string, Mark>>({});

  function gapOk(gapId: string, raw: string): boolean {
    const clean = foldText(raw);
    if (!clean) {
      return false;
    }
    const allowed = tactileRules.gapAnswers?.[gapId] ?? [];
    return allowed.some((item) => foldText(item) === clean);
  }

  if (gaps && gaps.length > 0 && onGapChange) {
    function updateGap(gapId: string, text: string, fromChip = false) {
      if ((gapValues[gapId] ?? "") === text) {
        return;
      }
      const next = { ...gapValues, [gapId]: text };
      onGapChange?.(next);
      if (gapId === gaps?.[0]?.id) {
        onChange(text);
      }
      if (!text.trim()) {
        setTactileGapMarks((curr) => {
          const copy = { ...curr };
          delete copy[gapId];
          return copy;
        });
        return;
      }
      if (gapOk(gapId, text)) {
        primeActivityAudio();
        setTactileGapMarks((curr) => ({ ...curr, [gapId]: "ok" }));
        playApplauseSound();
        onHit?.(true);
      } else if (fromChip) {
        primeActivityAudio();
        setTactileGapMarks((curr) => ({ ...curr, [gapId]: "miss" }));
        playOopsSound();
        onHit?.(false);
      }
    }

    function applyWordBankChip(word: string) {
      const activeEmpty =
        activeGapId && !(gapValues[activeGapId] ?? "").trim() ? activeGapId : null;
      const targetId =
        activeEmpty ??
        gaps?.find((g) => !(gapValues[g.id] ?? "").trim())?.id ??
        activeGapId ??
        gaps?.[0]?.id;
      if (!targetId) {
        return;
      }
      updateGap(targetId, word, true);
      const nextEmpty = gaps?.find(
        (g) => g.id !== targetId && !(gapValues[g.id] ?? "").trim(),
      )?.id;
      setActiveGapId(nextEmpty ?? null);
    }

    return (
      <section
        className={`grid rounded-[1.5rem] border-2 shadow-sm ${layout === "studio" ? "gap-2.5 p-3" : "gap-3.5 p-3.5 sm:p-4"} ${SECTION.cloze.wash}`}
        data-junior-cloze-line=""
        data-junior-fill-gaps={layout === "studio" ? "compact" : undefined}
        data-junior-board-layout={layout}
        data-junior-activity-mark={mark ?? undefined}
      >
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          {layout === "studio" ? null : <GameHeading kind="cloze" />}
          <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
            Yaz veya kelimeyi bırak
          </span>
        </div>

        {wordBank && wordBank.length > 0 ? (
          <div
            className={`flex flex-wrap items-center gap-1.5 border border-amber-200/80 bg-white/90 ${
              layout === "studio" ? "rounded-xl px-2 py-1.5" : "rounded-2xl p-2.5"
            }`}
            data-junior-cloze-bank=""
          >
            <span className="text-[11px] font-extrabold text-slate-600">İpucu Kelimeler:</span>
            {wordBank.map((word) => (
              <button
                key={word}
                type="button"
                draggable
                data-junior-cloze-chip={word}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", word);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => applyWordBankChip(word)}
                className={`cursor-grab border border-violet-300 bg-violet-100 font-black text-violet-950 transition hover:scale-105 active:cursor-grabbing ${
                  layout === "studio"
                    ? "rounded-lg px-2.5 py-0.5 text-xs shadow-sm"
                    : "rounded-xl border-2 px-3 py-1 text-xs shadow-sm"
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid gap-2.5" data-junior-fill-gap-cards="">
          {gaps.map((gap, index) => {
            const serverState = cardState(cards, gap.id);
            const currentVal = gapValues[gap.id] ?? "";
            const effectiveMark =
              serverState.mark ??
              tactileGapMarks[gap.id] ??
              (gapOk(gap.id, currentVal) ? "ok" : null);
            const blankStyle =
              effectiveMark === "ok"
                ? "border-solid border-emerald-500 bg-emerald-50 text-emerald-950"
                : effectiveMark === "miss"
                  ? "border-solid border-rose-500 bg-rose-50 text-rose-950"
                  : "border-dashed border-violet-400 bg-white text-slate-900";
            return (
              <div
                key={`${gap.id}-${effectiveMark === "miss" ? attempt : "card"}`}
                className="grid gap-1"
              >
                <label
                  data-junior-card-mark={effectiveMark ?? undefined}
                  data-junior-blank-drop-target=""
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const dropped = event.dataTransfer.getData("text/plain");
                    if (dropped) {
                      updateGap(gap.id, dropped, true);
                    }
                  }}
                  className={`${
                    layout === "studio"
                      ? clozeStudioCardClass(index + 1, effectiveMark)
                      : gameCardClass(index + 1, effectiveMark)
                  } flex flex-wrap items-center gap-1.5 leading-6`}
                >
                  {effectiveMark ? <MarkBadge mark={effectiveMark} /> : null}
                  <span>{gap.before}</span>
                  <input
                    value={currentVal}
                    onFocus={() => setActiveGapId(gap.id)}
                    onChange={(event) => updateGap(gap.id, event.target.value, false)}
                    aria-label={`Boşluk ${index + 1}`}
                    data-junior-cloze-input={gap.id}
                    aria-invalid={effectiveMark === "miss" ? true : undefined}
                    placeholder="____"
                    className={`text-center font-extrabold outline-none ${
                      layout === "studio"
                        ? "h-8 w-28 max-w-[7.5rem] shrink-0 rounded-xl border px-3 text-sm"
                        : "w-28 rounded-2xl border-2 px-2.5 py-1 text-sm sm:text-base"
                    } ${blankStyle} ${
                      effectiveMark === "ok" ? "shadow-[0_0_12px_rgba(16,185,129,0.35)]" : ""
                    }`}
                    size={8}
                    maxLength={40}
                  />
                  <span>{gap.after}</span>
                </label>
                <AnswerHint answer={serverState.answer} />
              </div>
            );
          })}
        </div>
        <ResultLine note={note} />
      </section>
    );
  }

  const state = cards[0] ? cardState(cards, cards[0].id) : { mark: null as Mark | null, answer: undefined };
  const blank =
    state.mark === "ok"
      ? "border-solid border-emerald-500 bg-emerald-50"
      : state.mark === "miss"
        ? "border-solid border-rose-500 bg-rose-50"
        : "border-dashed border-violet-300 bg-white";
  return (
    <section
      className={`grid gap-4 rounded-[1.75rem] border-2 p-4 shadow-sm sm:p-5 ${SECTION.cloze.wash}`}
      data-junior-cloze-line=""
      data-junior-activity-mark={mark ?? undefined}
    >
      <GameHeading kind="cloze" />
      <div key={state.mark === "miss" ? attempt : "card"} className="grid gap-1.5">
        <label
          data-junior-card-mark={state.mark ?? undefined}
          className={`${gameCardClass(2, state.mark)} flex flex-wrap items-center gap-2 text-lg leading-8`}
        >
          {state.mark ? <MarkBadge mark={state.mark} /> : null}
          <span>{before}</span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label="Boşluk"
            aria-invalid={state.mark === "miss" ? true : undefined}
            className={`w-28 rounded-2xl border-2 px-3 py-2 text-center text-lg font-extrabold text-slate-900 outline-none ${blank}`}
            maxLength={40}
          />
          <span>{after}</span>
        </label>
        <AnswerHint answer={state.answer} />
      </div>
      <ResultLine note={note} />
    </section>
  );
}

/** Oturumsuz (misafir) önizlemede yerel değerlendirme üretir. */
export function evaluateLocalRail(
  items: JuniorActivityPublic[],
  matches: Record<string, Record<string, string>>,
  clozes: Record<string, string>,
  multiClozes: Record<string, Record<string, string>>,
  orders: Record<string, string[]>,
  placements: Record<string, Record<string, string>>,
  rules: JuniorTactileActivityRules = MAT5_TACTILE_RULES,
): { correct: number; total: number; notes: Note[] } {
  const matchTargets = rules.matchTargets ?? MAT5_MATCH_TARGET;
  const gapAnswers = rules.gapAnswers ?? MAT5_GAP_ANSWERS;
  const rocketRules = rules.rocketRules ?? MAT5_ROCKET_RULES;
  const notes: Note[] = items.map((item) => {
    if (item.kind === "match") {
      const m = matches[item.id] ?? {};
      const cards: CardNote[] = item.left.map((l) => {
        const expected = matchTargets[l.id];
        const ok = expected ? m[l.id] === expected : Boolean(m[l.id]);
        const ansLabel = expected ? item.right.find((r) => r.id === expected)?.label : undefined;
        return ok ? { id: l.id, ok: true } : { id: l.id, ok: false, answer: ansLabel };
      });
      const ok = cards.every((c) => c.ok);
      return {
        id: item.id,
        ok,
        explanation:
          rules.explanations?.match ??
          "2, 5 ve 10 kuralları son basamağa; 3 ve 9 kuralları rakamların toplamına bakar. Çarpan böler, kat büyütür.",
        cards,
      };
    }
    if (item.kind === "cloze") {
      if (item.gaps && item.gaps.length > 0) {
        const gMap = multiClozes[item.id] ?? {};
        const cards: CardNote[] = item.gaps.map((g) => {
          const written = foldText(gMap[g.id] ?? "");
          const allowed = gapAnswers[g.id] ?? [];
          const ok = written.length > 0 && allowed.some((item) => foldText(item) === written);
          const fallbackAns = allowed[0] ?? "";
          return ok ? { id: g.id, ok: true } : { id: g.id, ok: false, answer: fallbackAns };
        });
        const ok = cards.every((c) => c.ok);
        return {
          id: item.id,
          ok,
          explanation:
            rules.explanations?.cloze ??
            "Son rakamı 0 veya 5 olan sayılar 5'e; rakamları toplamı 6 olan 24 sayısı 3'e tam bölünür. 12'yi kalansız bölen sayılara 12'nin çarpanları denir.",
          cards,
        };
      }
      const val = (clozes[item.id] ?? "").trim();
      const ok = val.length > 0;
      return {
        id: item.id,
        ok,
        explanation: item.prompt,
        cards: [{ id: item.id, ok }],
      };
    }
    if (item.puzzle) {
      const pMap = placements[item.id] ?? {};
      const cards: CardNote[] = item.tiles.map((t) => {
        const rId = pMap[t.id] ?? "";
        const allowed = rocketRules[t.id] ?? [];
        return { id: t.id, ok: Boolean(rId && allowed.includes(rId)) };
      });
      const ok = cards.every((c) => c.ok);
      return {
        id: item.id,
        ok,
        explanation:
          rules.explanations?.puzzle ??
          "24, 15, 30 ve 18 sayıları bölünebilme dedektifi kurallarına göre roketlere yerleşti.",
        cards,
      };
    }
    const given = orders[item.id] ?? item.tiles.map((t) => t.id);
    return {
      id: item.id,
      ok: given.length === item.tiles.length,
      explanation: item.prompt,
      cards: item.tiles.map((t) => ({ id: t.id, ok: true })),
    };
  });
  const correct = notes.filter((n) => n.ok).length;
  return { correct, total: items.length, notes };
}

export function ActivityRail({
  profileId,
  lessonKey,
  items,
}: {
  profileId: string;
  lessonKey: string;
  items: JuniorActivityPublic[];
}) {
  const tactileRules = resolveJuniorTactileRules(lessonKey);
  const [matches, setMatches] = useState<Record<string, Record<string, string>>>({});
  const [clozes, setClozes] = useState<Record<string, string>>({});
  const [multiClozes, setMultiClozes] = useState<Record<string, Record<string, string>>>({});
  const [orders, setOrders] = useState<Record<string, string[]>>({});
  const [placements, setPlacements] = useState<Record<string, Record<string, string>>>({});
  const [notes, setNotes] = useState<Note[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const noteById = new Map(notes.map((note) => [note.id, note]));

  function forget(id: string) {
    setNotes((current) => current.filter((note) => note.id !== id));
    setSummary("");
  }

  function applyGradeOutcome(nextNotes: Note[], correct: number, total: number) {
    const perfect = total > 0 && correct === total;
    setNotes(nextNotes);
    setAttempt((current) => current + 1);
    setSummary(perfect ? "Tebrikler! 3 / 3 etkinliği tam puanla tamamladın! 🏅" : `${correct} / ${total} doğru. Bir daha dene.`);
    if (perfect) {
      setCelebrate(true);
      burstJuniorActivityConfetti();
      playApplauseSound();
      return;
    }
    playOopsSound();
  }

  async function onSubmit() {
    primeActivityAudio();
    setPending(true);
    setError("");
    setCelebrate(false);
    try {
      if (!profileId) {
        const local = evaluateLocalRail(items, matches, clozes, multiClozes, orders, placements, tactileRules);
        applyGradeOutcome(local.notes, local.correct, local.total);
        return;
      }

      const answers = items.map((item) => {
        if (item.kind === "match") {
          return { id: item.id, matches: matches[item.id] ?? {} };
        }
        if (item.kind === "order") {
          return {
            id: item.id,
            order: orders[item.id] ?? item.tiles.map((tile) => tile.id),
            ...(item.puzzle ? { placements: placements[item.id] ?? {} } : {}),
          };
        }
        return {
          id: item.id,
          cloze: clozes[item.id] ?? "",
          ...(item.gaps ? { clozes: multiClozes[item.id] ?? {} } : {}),
        };
      });
      const response = await fetch(
        JUNIOR_PRACTICE_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profileId, lessonKey, answers }),
        }),
      );
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string | null;
        data?: { correct?: number; total?: number; notes?: Note[] };
      } | null;
      if (!response.ok || !body?.data) {
        const local = evaluateLocalRail(
          items,
          matches,
          clozes,
          multiClozes,
          orders,
          placements,
          tactileRules,
        );
        applyGradeOutcome(local.notes, local.correct, local.total);
        return;
      }
      const nextNotes = body.data.notes ?? [];
      const correct = body.data.correct ?? 0;
      const total = body.data.total ?? items.length;
      applyGradeOutcome(nextNotes, correct, total);
    } finally {
      setPending(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  function renderBoards() {
    return (
      <div className="grid gap-4">
        {items.map((item) => {
          const note = noteById.get(item.id) ?? null;
          const mark: Mark | null = note ? (note.ok ? "ok" : "miss") : null;
          const cards = note?.cards ?? [];
          if (item.kind === "match") {
            return (
              <MatchBoard
                key={item.id}
                left={item.left}
                right={item.right}
                value={matches[item.id] ?? {}}
                onChange={(next) => {
                  setMatches((current) => ({ ...current, [item.id]: next }));
                  forget(item.id);
                }}
                mark={mark}
                attempt={attempt}
                note={note}
                cards={cards}
              />
            );
          }
          if (item.kind === "order") {
            return (
              <OrderBoard
                key={item.id}
                tiles={item.tiles}
                puzzle={item.puzzle}
                value={orders[item.id] ?? item.tiles.map((tile) => tile.id)}
                placements={placements[item.id] ?? {}}
                onChange={(next) => {
                  setOrders((current) => ({ ...current, [item.id]: next }));
                  forget(item.id);
                }}
                onPlacementsChange={(next) => {
                  setPlacements((current) => ({ ...current, [item.id]: next }));
                  forget(item.id);
                }}
                mark={mark}
                attempt={attempt}
                note={note}
                cards={cards}
              />
            );
          }
          return (
            <ClozeLine
              key={item.id}
              before={item.before}
              after={item.after}
              gaps={item.gaps}
              wordBank={item.wordBank}
              value={clozes[item.id] ?? ""}
              gapValues={multiClozes[item.id] ?? {}}
              onChange={(next) => {
                setClozes((current) => ({ ...current, [item.id]: next }));
                forget(item.id);
              }}
              onGapChange={(next) => {
                setMultiClozes((current) => ({ ...current, [item.id]: next }));
                forget(item.id);
              }}
              mark={mark}
              attempt={attempt}
              note={note}
              cards={cards}
            />
          );
        })}
      </div>
    );
  }

  return (
    <JuniorTactileRulesScope lessonKey={lessonKey}>
    <section
      className="rounded-[2rem] border-2 border-fuchsia-200 bg-gradient-to-b from-fuchsia-50 via-white to-sky-50 p-3.5 shadow-sm sm:p-4"
      data-junior-activity-rail=""
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-extrabold text-fuchsia-900">
          🕵️‍♂️ 3 Hızlı Mini Etkinlik
        </span>
        <button
          type="button"
          data-junior-open-activity-modal=""
          onClick={() => setModalOpen(true)}
          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-violet-300 bg-white px-3 py-1 text-xs font-extrabold text-violet-800 shadow-2xs transition hover:bg-violet-50"
        >
          🔍 Büyük Sahnede Oyna
        </button>
      </div>

      {!profileId ? (
        <p className="mb-3 rounded-2xl bg-amber-100 px-3.5 py-2 text-xs font-semibold text-amber-950">
          Etkinlikleri hemen çözebilirsin. Puanın karnene yazılması için veli girişi gerekir.
        </p>
      ) : null}

      {renderBoards()}

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          data-junior-activity-check=""
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500 px-7 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(168,85,247,0.35)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-base"
          onClick={() => void onSubmit()}
          disabled={pending}
        >
          {pending ? "Kontrol ediliyor…" : "Etkinliği kontrol et"}
        </button>
      </div>

      {summary ? (
        <p
          className={`mt-3 text-center text-sm font-extrabold ${
            celebrate ? "text-emerald-700" : "text-rose-600"
          }`}
          aria-live="polite"
        >
          {summary}
        </p>
      ) : null}
      {error ? <p className="mt-3 text-center text-sm font-semibold text-rose-600">{error}</p> : null}

      <ActivityModal
        open={modalOpen}
        title="Bölünebilme Dedektifleri — Etkinlikler ve Bulmacalar"
        onClose={() => setModalOpen(false)}
      >
        {renderBoards()}
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500 px-8 text-base font-extrabold text-white shadow-[0_10px_24px_rgba(168,85,247,0.35)]"
            onClick={() => void onSubmit()}
            disabled={pending}
          >
            {pending ? "Kontrol ediliyor…" : "Etkinliği kontrol et"}
          </button>
        </div>
      </ActivityModal>

      <ActivityBadgeModal
        open={celebrate}
        lessonKey={lessonKey}
        onClose={() => setCelebrate(false)}
      />
    </section>
    </JuniorTactileRulesScope>
  );
}
