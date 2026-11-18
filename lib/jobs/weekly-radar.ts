import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { lookupCitizenEmail } from "@/lib/kernel/notice/contact";
import { isNoticeMailConfigured, readNoticeMailConfig } from "@/lib/kernel/notice/mail";
import { sendNoticeSmtp } from "@/lib/kernel/notice/smtp";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  opportunityForInstant,
  opportunityToolKey,
  opportunityWeekKey,
} from "@/lib/matchmaking/opportunity-pool";

export type WeeklyRadarResult = {
  weekKey: string;
  considered: number;
  sent: number;
  skipped: number;
  reason: "ok" | "mail-unconfigured" | "no-database";
};

function origin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://yetkin.ai").replace(/\/$/, "");
}

function formatDay(value: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
  }).format(value);
}

/**
 * Haftalık fırsat radarı. Metin sabittir; model çağrılmaz.
 * Aynı üye ve hafta ikinci kez gitmez.
 */
export async function runWeeklyOpportunityRadar(now = new Date()): Promise<WeeklyRadarResult> {
  const weekKey = opportunityWeekKey(now);
  if (!process.env.DATABASE_URL?.trim()) {
    return { weekKey, considered: 0, sent: 0, skipped: 0, reason: "no-database" };
  }
  if (!isNoticeMailConfigured()) {
    return { weekKey, considered: 0, sent: 0, skipped: 0, reason: "mail-unconfigured" };
  }
  const config = readNoticeMailConfig();
  if (!config) {
    return { weekKey, considered: 0, sent: 0, skipped: 0, reason: "mail-unconfigured" };
  }
  const prisma = getPrisma();
  const opportunity = opportunityForInstant(now);
  const tool = opportunityToolKey(opportunity);
  const link = `${origin()}/tezgah?tool=${tool}`;
  const grants = await prisma.yetkinhibeGrantCall.findMany({
    where: {
      isPublished: true,
      sourceVerifiedAt: { not: null },
      applicationDeadline: { gt: now },
    },
    orderBy: { sourceVerifiedAt: "desc" },
    take: 3,
    select: { title: true, officialInfoUrl: true, applicationDeadline: true },
  });
  const grantLines =
    grants.length === 0
      ? "Bu hafta doğrulanmış açık hibe çağrısı yok."
      : grants
          .map(
            (row) =>
              `- ${row.title} — son gün ${formatDay(row.applicationDeadline)} — ${row.officialInfoUrl}`,
          )
          .join("\n");
  const members = await prisma.user.findMany({
    where: {
      OR: [{ tezgahOutputs: { some: {} } }, { academyCertificates: { some: {} } }, { commerceStores: { some: {} } }],
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: { id: true },
  });
  let sent = 0;
  let skipped = 0;
  for (const member of members) {
    const email = await lookupCitizenEmail(member.id);
    if (!email) {
      skipped += 1;
      continue;
    }
    try {
      await prisma.weeklyRadarDelivery.create({
        data: { userId: member.id, weekKey, sentAt: now },
      });
    } catch {
      skipped += 1;
      continue;
    }
    const text = [
      "Haftalık fırsat radarı",
      "",
      "Doğrulanmış açık hibe çağrıları:",
      grantLines,
      "",
      `Haftanın proje fırsatı: ${opportunity.title}`,
      opportunity.summary,
      `Süre ipucu: ${opportunity.durationHint}. Ödül ipucu: ${opportunity.rewardHint}.`,
      "",
      `Bu fırsatı AI Tezgâh'ta üret: ${link}`,
      "",
      "Bu ileti bilgilendirmedir. Hibe sonucu veya iş garantisi değildir.",
    ].join("\n");
    try {
      await sendNoticeSmtp(config, {
        to: email,
        subject: "Haftalık fırsat radarı",
        text,
        fromName: "yetkin.ai",
      });
      sent += 1;
    } catch (error) {
      skipped += 1;
      logEvent({
        level: "warn",
        event: "weekly.radar.mail.failed",
        userId: member.id,
        errorName: error instanceof Error ? error.name : "unknown",
      });
    }
  }
  logEvent({
    level: "info",
    event: "weekly.radar.done",
    reason: weekKey,
    applied: sent > 0,
  });
  return { weekKey, considered: members.length, sent, skipped, reason: "ok" };
}
