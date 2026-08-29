import "server-only";

import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { createPrismaCareerPorts } from "@/lib/career/runtime";
import {
  assembleDashboardPulse,
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
import { ensurePrismaQueryEngine, prismaErrorLabel, withDbReadTimeout } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";

/** Oda okuması bu süreyi aşarsa boş nabız; havuzu 10s kilitlemez. */
export const DASHBOARD_PULSE_ROOM_TIMEOUT_MS = 600;

/** 4 oda eşzamanlı; havuz max 5 ve oda timeout kilidi tutar. */
export const DASHBOARD_PULSE_ROOM_CONCURRENCY = 4;

/**
 * Composition root — yalnız çalışan 4 oda + cüzdan. Donmuş 8 oda
 * paralel Prisma sorgusu yapmaz; boş nabız basılır.
 * Salt okuma: cüzdan satırı yoksa INSERT yok, live:false.
 */
async function readRoom<T>(room: string, work: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await withDbReadTimeout(work(), DASHBOARD_PULSE_ROOM_TIMEOUT_MS, `pulse:${room}`);
  } catch (error) {
    logEvent({
      level: "warn",
      event: "dashboard.pulse.room_failed",
      reason: room,
      errorName: prismaErrorLabel(error),
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

export async function loadDashboardPulse(userId: string): Promise<DashboardPulse> {
  void ensurePrismaQueryEngine();
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
          async () => withLiveFlag(await createPrismaCareerPorts().career.pulseForUser(userId)),
          EMPTY_CAREER_PULSE,
        ),
    ],
    DASHBOARD_PULSE_ROOM_CONCURRENCY,
  );

  return assembleDashboardPulse({
    ...EMPTY_DASHBOARD_PULSE,
    wallet,
    freelancer,
    academy,
    career,
  });
}

export function emptyDashboardPulse(): DashboardPulse {
  return EMPTY_DASHBOARD_PULSE;
}
