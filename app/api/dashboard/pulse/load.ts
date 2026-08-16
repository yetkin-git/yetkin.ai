import "server-only";

import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { createPrismaArenaPorts } from "@/lib/arena/runtime";
import { createPrismaCareerPorts } from "@/lib/career/runtime";
import {
  assembleDashboardPulse,
  EMPTY_DASHBOARD_PULSE,
  withLiveFlag,
  type DashboardPulse,
} from "@/lib/dashboard/pulse";
import { EMPTY_ACADEMY_PULSE } from "@/lib/dashboard/academy-pulse";
import { EMPTY_ARENA_PULSE } from "@/lib/dashboard/arena-pulse";
import { EMPTY_CAREER_PULSE } from "@/lib/dashboard/career-pulse";
import { EMPTY_DEVLABS_PULSE } from "@/lib/dashboard/devlabs-pulse";
import { EMPTY_FREELANCER_PULSE } from "@/lib/dashboard/freelancer-pulse";
import { EMPTY_HIBE_PULSE } from "@/lib/dashboard/hibe-pulse";
import { EMPTY_JUNIOR_PULSE } from "@/lib/dashboard/junior-pulse";
import { EMPTY_KURUMSAL_PULSE } from "@/lib/dashboard/kurumsal-pulse";
import { EMPTY_PAZARYERI_PULSE } from "@/lib/dashboard/pazaryeri-pulse";
import { EMPTY_SOCIAL_PULSE } from "@/lib/dashboard/social-pulse";
import { EMPTY_STUDIO_PULSE } from "@/lib/dashboard/studio-pulse";
import { EMPTY_WALLET_STRIP, type WalletStripSnapshot } from "@/lib/dashboard/wallet-strip";
import { createPrismaDevLabsPorts } from "@/lib/devlabs/runtime";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";
import { buildHibePulse } from "@/lib/hibe/engine";
import { createPrismaHibePorts } from "@/lib/hibe/runtime";
import { buildJuniorPulse } from "@/lib/junior/engine";
import { createPrismaJuniorPorts } from "@/lib/junior/runtime";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { logEvent } from "@/lib/kernel/observability/log";
import { createPrismaKurumsalPorts } from "@/lib/kurumsal/runtime";
import { createPrismaPazaryeriPorts } from "@/lib/pazaryeri/runtime";
import { buildSocialPulse } from "@/lib/social/engine";
import { createPrismaSocialPorts } from "@/lib/social/runtime";
import { createPrismaStudioPorts } from "@/lib/studio/runtime";

/**
 * Composition root — oda runtime'ları yalnız burada birleşir.
 * lib/dashboard nabız tiplerini taşır; kernel dikey tablo okumaz (§2.8).
 */
async function readRoom<T>(room: string, work: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await work();
  } catch (error) {
    logEvent({
      level: "warn",
      event: "dashboard.pulse.room_failed",
      reason: room,
      errorName: error instanceof Error ? error.name : "unknown",
      route: "/api/dashboard/pulse",
    });
    return fallback;
  }
}

async function readWalletStrip(userId: string): Promise<WalletStripSnapshot> {
  const prisma = getPrisma();
  const wallet = await prisma.wallet.findUnique({
    where: { userId_currencyCode: { userId, currencyCode: SETTLEMENT_CURRENCY } },
  });
  return {
    live: true,
    amountMinor: toAmountMinor(wallet?.amountMinor ?? 0),
    currencyCode: SETTLEMENT_CURRENCY,
  };
}

export async function loadDashboardPulse(userId: string): Promise<DashboardPulse> {
  const [
    wallet,
    freelancer,
    academy,
    career,
    studio,
    kurumsal,
    arena,
    devlabs,
    pazaryeri,
    hibe,
    junior,
    social,
  ] = await Promise.all([
    readRoom("wallet", () => readWalletStrip(userId), EMPTY_WALLET_STRIP),
    readRoom(
      "freelancer",
      async () => withLiveFlag(await createPrismaFreelancerPorts().freelancer.pulseForUser(userId)),
      EMPTY_FREELANCER_PULSE,
    ),
    readRoom(
      "academy",
      async () => withLiveFlag(await createPrismaAcademyPorts().academy.pulseForUser(userId)),
      EMPTY_ACADEMY_PULSE,
    ),
    readRoom(
      "career",
      async () => withLiveFlag(await createPrismaCareerPorts().career.pulseForUser(userId)),
      EMPTY_CAREER_PULSE,
    ),
    readRoom(
      "studio",
      async () => withLiveFlag(await createPrismaStudioPorts().studio.pulseForUser(userId)),
      EMPTY_STUDIO_PULSE,
    ),
    readRoom(
      "kurumsal",
      async () => withLiveFlag(await createPrismaKurumsalPorts().kurumsal.pulseForUser(userId)),
      EMPTY_KURUMSAL_PULSE,
    ),
    readRoom(
      "arena",
      async () => withLiveFlag(await createPrismaArenaPorts().arena.pulseForUser(userId)),
      EMPTY_ARENA_PULSE,
    ),
    readRoom(
      "devlabs",
      async () => withLiveFlag(await createPrismaDevLabsPorts().devlabs.pulseForUser(userId)),
      EMPTY_DEVLABS_PULSE,
    ),
    readRoom(
      "pazaryeri",
      async () => withLiveFlag(await createPrismaPazaryeriPorts().pazaryeri.pulseForUser(userId)),
      EMPTY_PAZARYERI_PULSE,
    ),
    readRoom(
      "hibe",
      async () => withLiveFlag(await buildHibePulse(createPrismaHibePorts(), userId)),
      EMPTY_HIBE_PULSE,
    ),
    readRoom(
      "junior",
      async () => withLiveFlag(await buildJuniorPulse(createPrismaJuniorPorts(), userId)),
      EMPTY_JUNIOR_PULSE,
    ),
    readRoom(
      "social",
      async () => withLiveFlag(await buildSocialPulse(createPrismaSocialPorts(), userId)),
      EMPTY_SOCIAL_PULSE,
    ),
  ]);

  return assembleDashboardPulse({
    wallet,
    freelancer,
    academy,
    career,
    studio,
    kurumsal,
    arena,
    devlabs,
    pazaryeri,
    hibe,
    junior,
    social,
  });
}

export function emptyDashboardPulse(): DashboardPulse {
  return EMPTY_DASHBOARD_PULSE;
}
