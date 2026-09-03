import "server-only";

import { cache } from "react";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { loadCareerLivePulse } from "@/lib/career/load";
import {
  assembleDashboardPulse,
  DASHBOARD_PULSE_ROOMS,
  EMPTY_DASHBOARD_PULSE,
  withLiveFlag,
  type DashboardPulse,
} from "@/lib/dashboard/pulse";
import { EMPTY_ACADEMY_PULSE } from "@/lib/dashboard/academy-pulse";
import { EMPTY_CAREER_PULSE } from "@/lib/dashboard/career-pulse";
import { EMPTY_FREELANCER_PULSE } from "@/lib/dashboard/freelancer-pulse";
import { EMPTY_WALLET_STRIP } from "@/lib/dashboard/wallet-strip";
import { readWalletStripSnapshot } from "@/lib/dashboard/load-wallet-strip";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";
import {
  ensurePrismaQueryEngine,
  isServerlessRuntime,
  kernelBackgroundReadTimeoutMs,
  prismaErrorLabel,
  withFailEarlyDbRead,
} from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";

/**
 * Serverless oda fail-soft. 400ms TR→EU / soğuk izolatta SELECT'i keserdi.
 * Vercel Hobby 10s tavanının altında kalır (4 oda × 1 eşzamanlılık).
 */
export const DASHBOARD_PULSE_ROOM_TIMEOUT_MS = 2_000;

/**
 * Uzun süreç: 4 oda paralel (`Promise.allSettled`) — biri tıkanınca diğerleri ve
 * `maxDuration` 15s route TIMEOUT'a düşmez. Serverless `max=1` iken 1.
 */
export const DASHBOARD_PULSE_ROOM_CONCURRENCY = 4;

/** Isınma + odalar `maxDuration` 15s'i aşmasın; kalan bütçe oda timeout'una yazılır. */
export const DASHBOARD_PULSE_LOAD_BUDGET_MS = 12_000;

const PULSE_MEMO_TTL_MS = 3_000;
const PULSE_MEMO_MAX = 256;

type PulseMemo = {
  pulse: DashboardPulse;
  at: number;
};

const pulseFresh = new Map<string, PulseMemo>();
const pulseInflight = new Map<string, Promise<DashboardPulse>>();

export function dashboardPulseRoomTimeoutMs(env: NodeJS.ProcessEnv = process.env): number {
  const customMs = env.DASHBOARD_PULSE_ROOM_TIMEOUT_MS
    ? Number(env.DASHBOARD_PULSE_ROOM_TIMEOUT_MS)
    : null;
  if (customMs && Number.isFinite(customMs) && customMs > 0) {
    return customMs;
  }
  return kernelBackgroundReadTimeoutMs(DASHBOARD_PULSE_ROOM_TIMEOUT_MS, env);
}

export function dashboardPulseRoomConcurrency(env: NodeJS.ProcessEnv = process.env): number {
  if (isServerlessRuntime(env)) {
    return 1;
  }
  const customConcurrency = env.DASHBOARD_PULSE_ROOM_CONCURRENCY
    ? Number(env.DASHBOARD_PULSE_ROOM_CONCURRENCY)
    : null;
  if (customConcurrency && Number.isInteger(customConcurrency) && customConcurrency >= 1) {
    return customConcurrency;
  }
  return DASHBOARD_PULSE_ROOM_CONCURRENCY;
}

export function dashboardPulseLoadBudgetMs(env: NodeJS.ProcessEnv = process.env): number {
  const customBudgetMs = env.DASHBOARD_PULSE_LOAD_BUDGET_MS
    ? Number(env.DASHBOARD_PULSE_LOAD_BUDGET_MS)
    : null;
  if (customBudgetMs && Number.isFinite(customBudgetMs) && customBudgetMs > 0) {
    return customBudgetMs;
  }
  return DASHBOARD_PULSE_LOAD_BUDGET_MS;
}

function pulseHasLiveRoom(pulse: DashboardPulse): boolean {
  return DASHBOARD_PULSE_ROOMS.some((room) => pulse[room].live);
}

function prunePulseMemo(now: number): void {
  for (const [key, entry] of pulseFresh) {
    if (now - entry.at >= PULSE_MEMO_TTL_MS) {
      pulseFresh.delete(key);
    }
  }
  while (pulseFresh.size > PULSE_MEMO_MAX) {
    const first = pulseFresh.keys().next().value;
    if (first === undefined) {
      break;
    }
    pulseFresh.delete(first);
  }
}

/**
 * Composition root — yalnız çalışan 4 oda + cüzdan. Donmuş 8 oda
 * paralel Prisma sorgusu yapmaz; boş nabız basılır.
 * Salt okuma: cüzdan satırı yoksa INSERT yok, live:false.
 */
async function readRoom<T>(
  room: string,
  work: () => Promise<T>,
  fallback: T,
  timeoutMs: number,
): Promise<T> {
  const started = Date.now();
  try {
    return await withFailEarlyDbRead(work, timeoutMs, `pulse:${room}`);
  } catch (error) {
    logEvent({
      level: "warn",
      event: "dashboard.pulse.room_failed",
      reason: room,
      errorName: prismaErrorLabel(error),
      durationMs: Date.now() - started,
      route: "/api/dashboard/pulse",
    });
    return fallback;
  }
}

function unwrapSettled<T>(
  result: PromiseSettledResult<T> | undefined,
  fallback: T,
  room: string,
): T {
  if (result?.status === "fulfilled") {
    return result.value;
  }
  logEvent({
    level: "warn",
    event: "dashboard.pulse.room_failed",
    reason: room,
    errorName: prismaErrorLabel(result?.reason),
    route: "/api/dashboard/pulse",
  });
  return fallback;
}

/**
 * Biri reject olsa bile diğer odalar tamamlanır. `concurrency >= n` iken dört sorgu
 * aynı anda açılır; serverless `max=1` dalga dalga gider.
 */
async function allSettledLimited<const T extends readonly (() => Promise<unknown>)[]>(
  factories: T,
  concurrency: number,
): Promise<{ [K in keyof T]: PromiseSettledResult<Awaited<ReturnType<T[K]>>> }> {
  const size = Math.min(Math.max(1, concurrency), factories.length);
  if (size >= factories.length) {
    return (await Promise.allSettled(factories.map((run) => run()))) as {
      [K in keyof T]: PromiseSettledResult<Awaited<ReturnType<T[K]>>>;
    };
  }
  const results: PromiseSettledResult<unknown>[] = new Array(factories.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const index = cursor;
      cursor += 1;
      const run = factories[index];
      if (!run) {
        return;
      }
      results[index] = await Promise.allSettled([run()]).then((row) => row[0]!);
    }
  }
  await Promise.allSettled(Array.from({ length: size }, () => worker()));
  return results as { [K in keyof T]: PromiseSettledResult<Awaited<ReturnType<T[K]>>> };
}

async function loadDashboardPulseFresh(userId: string): Promise<DashboardPulse> {
  const started = Date.now();
  const engineReady = await ensurePrismaQueryEngine();
  if (!engineReady) {
    return EMPTY_DASHBOARD_PULSE;
  }
  const budgetMs = dashboardPulseLoadBudgetMs();
  const remainingMs = budgetMs - (Date.now() - started);
  if (remainingMs < 250) {
    return EMPTY_DASHBOARD_PULSE;
  }
  const roomTimeoutMs = Math.min(dashboardPulseRoomTimeoutMs(), remainingMs);
  const settled = await allSettledLimited(
    [
      () => readRoom("wallet", () => readWalletStripSnapshot(userId), EMPTY_WALLET_STRIP, roomTimeoutMs),
      () =>
        readRoom(
          "freelancer",
          async () => withLiveFlag(await createPrismaFreelancerPorts().freelancer.pulseForUser(userId)),
          EMPTY_FREELANCER_PULSE,
          roomTimeoutMs,
        ),
      () =>
        readRoom(
          "academy",
          async () => withLiveFlag(await createPrismaAcademyPorts().academy.pulseForUser(userId)),
          EMPTY_ACADEMY_PULSE,
          roomTimeoutMs,
        ),
      () =>
        readRoom(
          "career",
          async () => (await loadCareerLivePulse(userId)) ?? EMPTY_CAREER_PULSE,
          EMPTY_CAREER_PULSE,
          roomTimeoutMs,
        ),
    ],
    dashboardPulseRoomConcurrency(),
  );

  return assembleDashboardPulse({
    ...EMPTY_DASHBOARD_PULSE,
    wallet: unwrapSettled(settled[0], EMPTY_WALLET_STRIP, "wallet"),
    freelancer: unwrapSettled(settled[1], EMPTY_FREELANCER_PULSE, "freelancer"),
    academy: unwrapSettled(settled[2], EMPTY_ACADEMY_PULSE, "academy"),
    career: unwrapSettled(settled[3], EMPTY_CAREER_PULSE, "career"),
  });
}

async function loadDashboardPulseMemoized(userId: string): Promise<DashboardPulse> {
  const now = Date.now();
  prunePulseMemo(now);
  const cached = pulseFresh.get(userId);
  if (cached && now - cached.at < PULSE_MEMO_TTL_MS && pulseHasLiveRoom(cached.pulse)) {
    return cached.pulse;
  }
  const pending = pulseInflight.get(userId);
  if (pending) {
    return pending;
  }
  const inflight = loadDashboardPulseFresh(userId)
    .then((pulse) => {
      if (pulseHasLiveRoom(pulse)) {
        pulseFresh.set(userId, { pulse, at: Date.now() });
        prunePulseMemo(Date.now());
      } else {
        pulseFresh.delete(userId);
      }
      return pulse;
    })
    .finally(() => {
      pulseInflight.delete(userId);
    });
  pulseInflight.set(userId, inflight);
  return inflight;
}

/**
 * React `cache`: aynı RSC istekte kokpit + BFF tek montaj.
 * Süreç içi TTL: 3s taze nabız; boş fallback cache'lenmez.
 */
export const loadDashboardPulse = cache(async function loadDashboardPulse(
  userId: string,
): Promise<DashboardPulse> {
  return loadDashboardPulseMemoized(userId);
});

export function emptyDashboardPulse(): DashboardPulse {
  return EMPTY_DASHBOARD_PULSE;
}
