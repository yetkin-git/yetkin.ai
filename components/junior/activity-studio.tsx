"use client";

import { useCallback, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import {
  ClozeLine,
  MatchBoard,
  OrderBoard,
  evaluateLocalRail,
  mat5ClozeReady,
  mat5MatchReady,
  mat5PuzzleReady,
  type Note,
} from "@/components/junior/activity-rail";
import type { JuniorHubModule } from "@/components/junior/activity-hub";
import { AnimatedSimulationStudio } from "@/components/junior/animated-simulations";
import { LiveTutorPanel } from "@/components/junior/live-tutor-panel";
import { QuickTools, type QuickToolsStatus } from "@/components/junior/quick-tools";
import type { JuniorActivityPublic } from "@/lib/junior/activity-public";
import { burstJuniorActivityConfetti } from "@/lib/junior/activity-confetti";
import { playApplauseSound, playOopsSound, primeActivityAudio } from "@/lib/junior/activity-sound";
import { JUNIOR_PRACTICE_PATH } from "@/lib/junior/limits";
import {
  activityKindToGameId,
  badgeProgressCount,
  JUNIOR_BADGE_UNLOCK_THRESHOLD,
  JUNIOR_LESSON_PROGRESS_EVENT,
  markGameComplete,
  readLessonProgress,
  recordActivityScore,
  type JuniorLessonProgressEventDetail,
} from "@/lib/junior/progress-tracker";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export type ActivityStudioStatus = QuickToolsStatus;

const GAMES = [
  { id: "match", label: "Eşleştir" },
  { id: "cloze", label: "Boşluk doldur" },
  { id: "puzzle", label: "Dedektif" },
  { id: "sim", label: "Animasyonlu Simülasyon" },
] as const;

type GameId = (typeof GAMES)[number]["id"];

const TOOLS = [
  { id: "activities", label: "Etkinlikler" },
  { id: "tests", label: "Soru Bankası" },
  { id: "notes", label: "Ders Notu" },
  { id: "tutor", label: "Selim Öğretmen'e Sor" },
] as const satisfies readonly { id: JuniorHubModule; label: string }[];

type MatchProps = Omit<ComponentProps<typeof MatchBoard>, "layout">;
type ClozeProps = Omit<ComponentProps<typeof ClozeLine>, "layout">;
type PuzzleProps = Omit<ComponentProps<typeof OrderBoard>, "layout">;

export function MatchingGrid(props: MatchProps) {
  return <MatchBoard {...props} layout="studio" />;
}

export function FillGapsBoard(props: ClozeProps) {
  return <ClozeLine {...props} layout="studio" />;
}

export function CategoryPuzzles(props: PuzzleProps) {
  return <OrderBoard {...props} layout="studio" />;
}

export function ActivityStudio({
  profileId,
  lessonKey,
  items,
  onStatus,
}: {
  profileId: string;
  lessonKey: string;
  items: JuniorActivityPublic[];
  onStatus?: (status: ActivityStudioStatus) => void;
}) {
  const [game, setGame] = useState<GameId>("match");
  const [matches, setMatches] = useState<Record<string, Record<string, string>>>({});
  const [clozes, setClozes] = useState<Record<string, string>>({});
  const [multiClozes, setMultiClozes] = useState<Record<string, Record<string, string>>>({});
  const [orders, setOrders] = useState<Record<string, string[]>>({});
  const [placements, setPlacements] = useState<Record<string, Record<string, string>>>({});
  const [notes, setNotes] = useState<Note[]>([]);
  const [summary, setSummary] = useState("");
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [cheer, setCheer] = useState(0);
  const [glow, setGlow] = useState(false);
  const glowTimer = useRef(0);
  const noteById = new Map(notes.map((note) => [note.id, note]));
  const matchItem = items.find((item) => item.kind === "match");
  const clozeItem = items.find((item) => item.kind === "cloze");
  const puzzleItem = items.find((item) => item.kind === "order");
  const matchReady = matchItem ? mat5MatchReady(matches[matchItem.id] ?? {}) : false;
  const clozeReady = clozeItem ? mat5ClozeReady(multiClozes[clozeItem.id] ?? {}) : false;
  const puzzleReady = puzzleItem ? mat5PuzzleReady(placements[puzzleItem.id] ?? {}) : false;
  const readyCount = [matchReady, clozeReady, puzzleReady].filter(Boolean).length;

  const pushStatus = useCallback(() => {
    const progress = readLessonProgress(profileId, lessonKey);
    onStatus?.({
      solved: badgeProgressCount(progress),
      total: JUNIOR_BADGE_UNLOCK_THRESHOLD,
      badge: progress.badgeUnlocked,
    });
  }, [lessonKey, onStatus, profileId]);

  useEffect(() => {
    pushStatus();
    function onProgress(event: Event) {
      const detail = (event as CustomEvent<JuniorLessonProgressEventDetail>).detail;
      if (!detail) {
        return;
      }
      if (detail.lessonKey !== lessonKey) {
        return;
      }
      if ((detail.profileId.trim() || "anon") !== (profileId.trim() || "anon")) {
        return;
      }
      onStatus?.({
        solved: badgeProgressCount(detail.progress),
        total: JUNIOR_BADGE_UNLOCK_THRESHOLD,
        badge: detail.progress.badgeUnlocked,
      });
    }
    window.addEventListener(JUNIOR_LESSON_PROGRESS_EVENT, onProgress);
    return () => window.removeEventListener(JUNIOR_LESSON_PROGRESS_EVENT, onProgress);
  }, [lessonKey, onStatus, profileId, pushStatus]);

  function forget(id: string) {
    setNotes((current) => current.filter((note) => note.id !== id));
    setSummary("");
    setCelebrate(false);
  }

  function syncGradeToProgress(nextNotes: Note[], correct: number, total: number) {
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    recordActivityScore(profileId, lessonKey, percent);
    for (const note of nextNotes) {
      if (!note.ok) {
        continue;
      }
      const item = items.find((entry) => entry.id === note.id);
      const gameId = item ? activityKindToGameId(item.kind) : null;
      if (gameId) {
        markGameComplete(profileId, lessonKey, gameId);
      }
    }
    pushStatus();
  }

  function onHit(ok: boolean) {
    if (!ok) {
      return;
    }
    setCheer((current) => current + 1);
    setGlow(true);
    burstJuniorActivityConfetti("spark");
    window.clearTimeout(glowTimer.current);
    glowTimer.current = window.setTimeout(() => setGlow(false), 900);
  }

  function applyGradeOutcome(nextNotes: Note[], correct: number, total: number) {
    const perfect = total > 0 && correct === total;
    setNotes(nextNotes);
    setAttempt((current) => current + 1);
    syncGradeToProgress(nextNotes, correct, total);
    setSummary(
      perfect
        ? "Tebrikler! 3 / 3 etkinliği tam puanla tamamladın! 🏅"
        : `${correct} / ${total} doğru. Bir daha dene.`,
    );
    if (perfect) {
      setCelebrate(true);
      burstJuniorActivityConfetti("cheer");
      playApplauseSound();
      return;
    }
    setCelebrate(false);
    playOopsSound();
  }

  async function onSubmit() {
    primeActivityAudio();
    setPending(true);
    setCelebrate(false);
    try {
      if (!profileId) {
        const local = evaluateLocalRail(items, matches, clozes, multiClozes, orders, placements);
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
        data?: { correct?: number; total?: number; notes?: Note[] };
      } | null;
      if (!response.ok || !body?.data) {
        const local = evaluateLocalRail(items, matches, clozes, multiClozes, orders, placements);
        applyGradeOutcome(local.notes, local.correct, local.total);
        return;
      }
      applyGradeOutcome(body.data.notes ?? [], body.data.correct ?? 0, body.data.total ?? items.length);
    } finally {
      setPending(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  const readyByGame: Record<GameId, boolean> = {
    match: matchReady,
    cloze: clozeReady,
    puzzle: puzzleReady,
    sim: false,
  };
  const isSim = game === "sim";

  return (
    <section
      data-junior-activity-studio=""
      className={`relative flex w-full flex-col gap-2 rounded-[2rem] border-2 bg-gradient-to-b from-fuchsia-50 via-white to-sky-50 p-3 shadow-sm transition-shadow sm:p-4 ${
        glow ? "border-emerald-400 shadow-[0_0_32px_rgba(16,185,129,0.45)]" : "border-fuchsia-200"
      }`}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-black text-slate-900 sm:text-lg">Etkinlik ve Oyun Stüdyosu</h2>
        <p className="text-sm font-extrabold text-emerald-700" aria-live="polite">
          {glow ? (
            <span key={cheer} data-junior-hit-badge="" className="animate-badge-pop inline-flex items-center gap-1">
              🏅 Doğru — yeşil neon yandı
            </span>
          ) : isSim ? (
            <span className="font-semibold text-cyan-700">Dokunarak dene</span>
          ) : (
            <span className="font-semibold text-slate-500">{readyCount} / 3 oyun hazır</span>
          )}
        </p>
      </header>

      {!profileId ? (
        <p className="shrink-0 truncate rounded-xl bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-950">
          Puanın karnene yazılması için veli girişi gerekir.
        </p>
      ) : null}

      <div role="tablist" aria-label="Etkinlik oyunları" className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-4">
        {GAMES.map((item) => {
          const selected = item.id === game;
          const ready = readyByGame[item.id];
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`junior-studio-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`junior-studio-panel-${item.id}`}
              data-junior-studio-tab={item.id}
              className={`min-w-0 truncate rounded-xl border-2 px-2 py-1.5 text-center text-xs font-extrabold leading-tight transition sm:text-sm ${
                selected
                  ? item.id === "sim"
                    ? "border-cyan-500 bg-cyan-50 text-slate-900 shadow-[0_0_18px_rgba(34,211,238,0.28)]"
                    : "border-emerald-500 bg-emerald-50 text-slate-900 shadow-[0_0_18px_rgba(16,185,129,0.22)]"
                  : "border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5"
              }`}
              onClick={() => setGame(item.id)}
            >
              <span className={ready ? "text-emerald-700" : undefined}>{ready ? "✓ " : ""}</span>
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="min-w-0">

      {matchItem ? (
        <div
          className={game === "match" ? "block" : "hidden"}
          id="junior-studio-panel-match"
          role="tabpanel"
          aria-labelledby="junior-studio-tab-match"
        >
          <MatchingGrid
            left={matchItem.left}
            right={matchItem.right}
            value={matches[matchItem.id] ?? {}}
            onChange={(next) => {
              setMatches((current) => ({ ...current, [matchItem.id]: next }));
              forget(matchItem.id);
            }}
            mark={noteById.get(matchItem.id) ? (noteById.get(matchItem.id)?.ok ? "ok" : "miss") : null}
            attempt={attempt}
            note={noteById.get(matchItem.id) ?? null}
            cards={noteById.get(matchItem.id)?.cards ?? []}
            onHit={onHit}
          />
        </div>
      ) : null}

      {clozeItem ? (
        <div
          className={game === "cloze" ? "block" : "hidden"}
          id="junior-studio-panel-cloze"
          role="tabpanel"
          aria-labelledby="junior-studio-tab-cloze"
        >
          <FillGapsBoard
            before={clozeItem.before}
            after={clozeItem.after}
            gaps={clozeItem.gaps}
            wordBank={clozeItem.wordBank}
            value={clozes[clozeItem.id] ?? ""}
            gapValues={multiClozes[clozeItem.id] ?? {}}
            onChange={(next) => {
              setClozes((current) => ({ ...current, [clozeItem.id]: next }));
              forget(clozeItem.id);
            }}
            onGapChange={(next) => {
              setMultiClozes((current) => ({ ...current, [clozeItem.id]: next }));
              forget(clozeItem.id);
            }}
            mark={noteById.get(clozeItem.id) ? (noteById.get(clozeItem.id)?.ok ? "ok" : "miss") : null}
            attempt={attempt}
            note={noteById.get(clozeItem.id) ?? null}
            cards={noteById.get(clozeItem.id)?.cards ?? []}
            onHit={onHit}
          />
        </div>
      ) : null}

      {puzzleItem ? (
        <div
          className={game === "puzzle" ? "block" : "hidden"}
          id="junior-studio-panel-puzzle"
          role="tabpanel"
          aria-labelledby="junior-studio-tab-puzzle"
        >
          <CategoryPuzzles
            tiles={puzzleItem.tiles}
            puzzle={puzzleItem.puzzle}
            value={orders[puzzleItem.id] ?? puzzleItem.tiles.map((tile) => tile.id)}
            placements={placements[puzzleItem.id] ?? {}}
            onChange={(next) => {
              setOrders((current) => ({ ...current, [puzzleItem.id]: next }));
              forget(puzzleItem.id);
            }}
            onPlacementsChange={(next) => {
              setPlacements((current) => ({ ...current, [puzzleItem.id]: next }));
              forget(puzzleItem.id);
            }}
            mark={noteById.get(puzzleItem.id) ? (noteById.get(puzzleItem.id)?.ok ? "ok" : "miss") : null}
            attempt={attempt}
            note={noteById.get(puzzleItem.id) ?? null}
            cards={noteById.get(puzzleItem.id)?.cards ?? []}
            onHit={onHit}
          />
        </div>
      ) : null}

      <div
        className={isSim ? "block" : "hidden"}
        id="junior-studio-panel-sim"
        role="tabpanel"
        aria-labelledby="junior-studio-tab-sim"
      >
        <AnimatedSimulationStudio
          lessonKey={lessonKey}
          profileId={profileId}
          onSimSuccess={pushStatus}
        />
      </div>

        {!isSim ? (
          <div className="sticky bottom-0 z-10 mt-3 flex justify-center bg-gradient-to-t from-white via-white/95 to-transparent py-2">
            <button
              type="button"
              data-junior-activity-check=""
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500 px-8 text-base font-extrabold text-white shadow-[0_10px_24px_rgba(168,85,247,0.35)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => void onSubmit()}
              disabled={pending}
            >
              {pending ? "Kontrol ediliyor…" : "Etkinliği kontrol et"}
            </button>
          </div>
        ) : null}
        {summary && !isSim ? (
          <p
            className={`pb-2 text-center text-sm font-extrabold ${celebrate ? "text-emerald-700" : "text-rose-600"}`}
            aria-live="polite"
          >
            {summary}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function Mat5FocusedLayout({
  lessonKey,
  profileId = "",
  module,
  onModule,
  status,
  player,
  studio,
  tests,
  notes,
  tutor,
  totalScenes,
}: {
  lessonKey: string;
  profileId?: string;
  module: JuniorHubModule;
  onModule: (next: JuniorHubModule) => void;
  status: ActivityStudioStatus;
  player: ReactNode;
  studio: ReactNode;
  tests: ReactNode;
  notes: ReactNode;
  tutor?: ReactNode;
  /** Pilot timeline cue sayısı; kart/yüzde hesabı için. */
  totalScenes?: number;
}) {
  function choose(next: JuniorHubModule) {
    onModule(next);
    window.requestAnimationFrame(() => {
      document.getElementById("junior-activity-hub")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div
      data-junior-studio-flow={lessonKey}
      data-junior-fold="flow"
      className="flex w-full min-w-0 flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_14.5rem] xl:items-start xl:gap-6"
    >
      <div className="flex min-w-0 flex-col gap-3">
        <div
          data-junior-player-shell=""
          className="flex h-[min(48rem,calc(100dvh-6.5rem))] min-h-[28rem] w-full min-w-0 flex-col"
        >
          {player}
        </div>
        <div id="junior-activity-hub" className="min-w-0">
          <div className={module === "activities" ? "block" : "hidden"}>{studio}</div>
          {module === "tests" ? <div>{tests}</div> : null}
          {module === "notes" ? <div>{notes}</div> : null}
          {module === "tutor" ? <div data-junior-tutor-slot="">{tutor ?? <LiveTutorPanel lessonKey={lessonKey} />}</div> : null}
        </div>
      </div>
      <QuickTools
        lessonKey={lessonKey}
        profileId={profileId}
        totalScenes={totalScenes}
        status={status}
        tools={
          <div
            role="tablist"
            aria-label="Ders araçları"
            className="grid min-w-0 flex-1 grid-cols-2 gap-1.5 sm:grid-cols-4 xl:mt-3 xl:grid-cols-1 xl:gap-2"
          >
            {TOOLS.map((tool) => {
              const selected = tool.id === module;
              return (
                <button
                  key={tool.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  data-junior-studio-tool={tool.id}
                  className={`min-w-0 whitespace-normal rounded-xl border px-1.5 py-2 text-center text-xs font-extrabold leading-tight xl:px-3 xl:py-2.5 xl:text-left xl:text-sm ${
                    selected
                      ? "border-[var(--safir)] bg-[var(--safir-soft)] text-[var(--safir-deep)]"
                      : "border-[var(--border)] bg-white text-slate-800"
                  }`}
                  onClick={() => choose(tool.id)}
                >
                  {tool.label}
                </button>
              );
            })}
          </div>
        }
      />
    </div>
  );
}
