import { INNGEST_EVENTS, inngest } from "@/lib/kernel/jobs/inngest";

/** Arena tur geçişi — Socket.IO yok (S3-A). HTTP cron + event. */
export const arenaTenderRoundScan = inngest.createFunction(
  {
    id: "arena-tender-round-scan",
    name: "Arena ihale tur tarama",
    triggers: [{ cron: "TZ=Europe/Istanbul */15 * * * *" }],
  },
  async ({ step }) => {
    return step.run("advance-due-tenders", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return { advanced: 0 };
      }
      const { createPrismaArenaPorts } = await import("@/lib/arena/runtime");
      const { advanceDueArenaTenders } = await import("@/lib/arena/engine");
      const ports = createPrismaArenaPorts();
      const advanced = await advanceDueArenaTenders(ports);
      return { advanced: advanced.length };
    });
  },
);

export const arenaTenderRoundTick = inngest.createFunction(
  {
    id: "arena-tender-round-tick",
    name: "Arena ihale tur tekil",
    idempotency: "event.data.tenderId",
    triggers: [{ event: INNGEST_EVENTS.ARENA_TENDER_ROUND_TICK }],
  },
  async ({ event, step }) => {
    const tenderId = String((event.data as { tenderId?: string }).tenderId ?? "").trim();
    if (!tenderId) {
      return { skipped: true };
    }
    return step.run("advance-tender-round", async () => {
      const { createPrismaArenaPorts } = await import("@/lib/arena/runtime");
      const { advanceArenaTenderRound } = await import("@/lib/arena/engine");
      const ports = createPrismaArenaPorts();
      const tender = await advanceArenaTenderRound(ports, { tenderId });
      return { tenderId: tender.id, status: tender.status, round: tender.round };
    });
  },
);

export const arenaInngestFunctions = [arenaTenderRoundScan, arenaTenderRoundTick];
