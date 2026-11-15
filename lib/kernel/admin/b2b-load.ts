import "server-only";

import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { isSuperAdminActor, type SuperAdminActor } from "@/lib/kernel/auth/super-admin";
import {
  B2B_OUTBOUND_DAILY_LIMIT,
  B2B_OUTBOUND_SETTING_ID,
  b2bCounterDay,
  type B2bBoardItemView,
  type B2bBoardView,
} from "@/lib/kernel/admin/b2b-outbound";
import { getPrisma } from "@/lib/kernel/db";

export type B2bBoardResult =
  | { access: "forbidden" }
  | { access: "unavailable" }
  | { access: "ok"; board: B2bBoardView };

export async function loadB2bBoard(actor: SuperAdminActor): Promise<B2bBoardResult> {
  if (!isSupabaseUserId(actor.id) || !isSuperAdminActor(actor)) {
    return { access: "forbidden" };
  }
  try {
    const prisma = getPrisma();
    const { day } = b2bCounterDay();
    const [setting, counter, rows] = await Promise.all([
      prisma.b2bOutboundSetting.findUnique({ where: { id: B2B_OUTBOUND_SETTING_ID } }),
      prisma.b2bOutboundDailyCounter.findUnique({ where: { day } }),
      prisma.b2bLeadCampaignItem.findMany({
        orderBy: { createdAt: "desc" },
        take: 40,
      }),
    ]);
    return {
      access: "ok",
      board: {
        enabled: setting?.enabled ?? false,
        sentToday: counter?.sentCount ?? 0,
        dailyLimit: B2B_OUTBOUND_DAILY_LIMIT,
        items: rows.map((row): B2bBoardItemView => ({
          id: row.id,
          companyName: row.companyName,
          email: row.email,
          websiteUrl: row.websiteUrl,
          sector: row.sector,
          city: row.city,
          channel: row.channel,
          status: row.status,
          score: row.score,
          note: row.note,
          subject: row.subject,
          body: row.body,
          sentAt: row.sentAt ? row.sentAt.toISOString() : null,
        })),
      },
    };
  } catch {
    return { access: "unavailable" };
  }
}
