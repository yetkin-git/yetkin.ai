import "server-only";

import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { isSuperAdminActor, type SuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { getPrisma } from "@/lib/kernel/db";
import {
  OUTREACH_DAILY_LIMIT_DEFAULT,
  type OutreachBoardView,
  type OutreachDraftStatus,
  type OutreachDraftView,
  type OutreachVertical,
} from "@/lib/kernel/outreach/policy";
import { readOutreachSender } from "@/lib/kernel/outreach/sender";

/** Tek satır. `id` sabittir; ikinci ayar satırı yoktur. */
export const OUTREACH_SETTINGS_ID = "outreach-engine" as const;
export const OUTREACH_SETTINGS_KEY = "OUTREACH_ENGINE_ENABLED" as const;

export type OutreachBoardResult =
  | { access: "forbidden" }
  | { access: "unavailable" }
  | { access: "ok"; board: OutreachBoardView };

export type OutreachSettingsRow = {
  isEnabled: boolean;
  dailyLimit: number;
  sendHourTrt: number;
};

export async function readOutreachSettings(): Promise<OutreachSettingsRow> {
  const row = await getPrisma().outreachSettings.findUnique({
    where: { id: OUTREACH_SETTINGS_ID },
    select: { isEnabled: true, dailyLimit: true, sendHourTrt: true },
  });
  return {
    isEnabled: row?.isEnabled ?? false,
    dailyLimit: row?.dailyLimit ?? OUTREACH_DAILY_LIMIT_DEFAULT,
    sendHourTrt: row?.sendHourTrt ?? 9,
  };
}

function emptyCounts(): Record<OutreachDraftStatus, number> {
  return {
    PENDING_APPROVAL: 0,
    APPROVED: 0,
    SENT: 0,
    REJECTED: 0,
    FAILED: 0,
  };
}

export async function loadOutreachBoard(actor: SuperAdminActor): Promise<OutreachBoardResult> {
  if (!isSupabaseUserId(actor.id) || !isSuperAdminActor(actor)) {
    return { access: "forbidden" };
  }
  const sender = readOutreachSender();
  try {
    const prisma = getPrisma();
    const [setting, drafts, suppressions, grouped] = await Promise.all([
      prisma.outreachSettings.findUnique({
        where: { id: OUTREACH_SETTINGS_ID },
        select: { isEnabled: true, dailyLimit: true, sendHourTrt: true },
      }),
      prisma.outreachCampaignDraft.findMany({
        orderBy: { createdAt: "desc" },
        take: 60,
      }),
      prisma.outreachSuppression.findMany({
        orderBy: { createdAt: "desc" },
        take: 40,
        select: { email: true, reason: true, createdAt: true },
      }),
      prisma.outreachCampaignDraft.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);
    const counts = emptyCounts();
    for (const row of grouped) {
      const status = row.status as OutreachDraftStatus;
      counts[status] = row._count._all;
    }
    return {
      access: "ok",
      board: {
        isEnabled: setting?.isEnabled ?? false,
        dailyLimit: setting?.dailyLimit ?? OUTREACH_DAILY_LIMIT_DEFAULT,
        sendHourTrt: setting?.sendHourTrt ?? 9,
        fromEmail: sender.ready ? sender.from : null,
        senderReady: sender.ready,
        senderIssue: sender.ready ? null : sender.issue,
        counts,
        drafts: drafts.map(
          (row): OutreachDraftView => ({
            id: row.id,
            companyName: row.companyName,
            recipientEmail: row.recipientEmail,
            sector: row.sector,
            vertical: row.vertical as OutreachVertical,
            sourceUrl: row.sourceUrl,
            subject: row.subject,
            body: row.bodyText,
            status: row.status as OutreachDraftStatus,
            errorMessage: row.errorMessage,
            approvedAt: row.approvedAt ? row.approvedAt.toISOString() : null,
            sentAt: row.sentAt ? row.sentAt.toISOString() : null,
            createdAt: row.createdAt.toISOString(),
          }),
        ),
        suppressed: suppressions.map((row) => ({
          email: row.email,
          reason: row.reason,
          createdAt: row.createdAt.toISOString(),
        })),
      },
    };
  } catch {
    return { access: "unavailable" };
  }
}
