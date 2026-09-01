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

/** Yazma (ilan POST) için havuzda yer: uzun süreçte 2; serverless `max=1` iken 1. */
export const DASHBOARD_PULSE_ROOM_CONCURRENCY = 2;

const PULSE_MEMO_TTL_MS = 3_000;
const PULSE_MEMO_MAX = 256;

type PulseMemo = {
  pulse: DashboardPulse;
  at: number;
};

const pulseFresh = new Map<string, PulseMemo>();
const pulseInflight = new Map<string, Promise<DashboardPulse>>();

export function dashboardPulseRoomTimeoutMs(env: NodeJS.ProcessEnv = process.env): number {
  return kernelBackgroundReadTimeoutMs(DASHBOARD_PULSE_ROOM_TIMEOUT_MS, env);
}

export function dashboardPulseRoomConcurrency(env: NodeJS.ProcessEnv = process.env): number {
  return isServerlessRuntime(env) ? 1 : DASHBOARD_PULSE_ROOM_CONCURRENCY;
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
async function readRoom<T>(room: string, work: () => Promise<T>, fallback: T): Promise<T> {
  const started = Date.now();
  try {
    return await withFailEarlyDbRead(work, dashboardPulseRoomTimeoutMs(), `pulse:${room}`);
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

async function mapPool<const T extends readonly (() => Promise<unknown>)[]>(
  tasks: T,
  concurrency: number,
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const results: unknown[] = new Array(tasks.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const index = cursor;
      cursor += 1;
      const task = tasks[index];
      if (!task) {
        return;
      }
      results[index] = await task();
    }
  }
  const size = Math.min(Math.max(1, concurrency), tasks.length);
  await Promise.all(Array.from({ length: size }, () => worker()));
  return results as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
}

async function loadDashboardPulseFresh(userId: string): Promise<DashboardPulse> {
  const engineReady = await ensurePrismaQueryEngine();
  if (!engineReady) {
    return EMPTY_DASHBOARD_PULSE;
  }
  const [wallet, freelancer, academy, career] = await mapPool(
    [
      () => readRoom("wallet", () => readWalletStripSnapshot(userId), EMPTY_WALLET_STRIP),
      () =>
        readRoom(
          "freelancer",
          async () => withLiveFlag(await createPrismaFreelancerPorts().freelancer.pulseForUser(userId)),
          EMPTY_FREELANCER_PULSE,
        ),
      () =>
        readRoom(
          "academy",
          async () => withLiveFlag(await createPrismaAcademyPorts().academy.pulseForUser(userId)),
          EMPTY_ACADEMY_PULSE,
        ),
      () =>
        readRoom(
          "career",
          async () => (await loadCareerLivePulse(userId)) ?? EMPTY_CAREER_PULSE,
          EMPTY_CAREER_PULSE,
        ),
    ],
    dashboardPulseRoomConcurrency(),
  );

  return assembleDashboardPulse({
    ...EMPTY_DASHBOARD_PULSE,
    wallet,
    freelancer,
    academy,
    career,
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
