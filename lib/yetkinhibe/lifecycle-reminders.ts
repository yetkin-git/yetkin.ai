import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { lookupCitizenEmail } from "@/lib/kernel/notice/contact";
import { isNoticeMailConfigured, readNoticeMailConfig } from "@/lib/kernel/notice/mail";
import { sendNoticeSmtp } from "@/lib/kernel/notice/smtp";
import { logEvent } from "@/lib/kernel/observability/log";
import { deadlineReminder, type DeadlineReminderDay } from "@/lib/yetkinhibe/grant-lifecycle";
import { HIBE_PANEL_PATH } from "@/lib/yetkinhibe/radar-profile";

export type HibeLifecycleReminderResult = {
  scanned: number;
  notified: number;
  skipped: number;
  reason: "ok" | "mail-unconfigured" | "no-database";
};

function origin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://yetkin.ai").replace(/\/$/, "");
}

/**
 * Günlük hatırlatma. Yalnız 7, 3 ve 1 gün kala mektup gider.
 * Aynı bant ikinci kez yazılmaz. Katalog tutarı üretilmez.
 */
export async function runHibeLifecycleReminders(now = new Date()): Promise<HibeLifecycleReminderResult> {
  if (!process.env.DATABASE_URL?.trim()) {
    return { scanned: 0, notified: 0, skipped: 0, reason: "no-database" };
  }
  if (!isNoticeMailConfigured()) {
    return { scanned: 0, notified: 0, skipped: 0, reason: "mail-unconfigured" };
  }
  const config = readNoticeMailConfig();
  if (!config) {
    return { scanned: 0, notified: 0, skipped: 0, reason: "mail-unconfigured" };
  }
  const horizon = new Date(now.getTime() + 8 * 86_400_000);
  const floor = new Date(now.getTime() - 86_400_000);
  const rows = await getPrisma().hibeApplication.findMany({
    where: {
      nextDeadlineAt: { not: null, lte: horizon, gte: floor },
    },
    orderBy: { nextDeadlineAt: "asc" },
    take: 500,
    select: {
      id: true,
      userId: true,
      title: true,
      nextDeadlineAt: true,
      lastReminderDays: true,
    },
  });
  let notified = 0;
  let skipped = 0;
  const link = `${origin()}${HIBE_PANEL_PATH}?sekme=basvuru`;
  for (const row of rows) {
    if (!row.nextDeadlineAt) {
      skipped += 1;
      continue;
    }
    const reminder = deadlineReminder(row.nextDeadlineAt, now);
    if (!reminder) {
      skipped += 1;
      continue;
    }
    if (row.lastReminderDays === reminder.days) {
      skipped += 1;
      continue;
    }
    const previous = row.lastReminderDays;
    const claimed = await getPrisma().hibeApplication.updateMany({
      where: { id: row.id, lastReminderDays: previous },
      data: { lastReminderDays: reminder.days },
    });
    if (claimed.count !== 1) {
      skipped += 1;
      continue;
    }
    const email = await lookupCitizenEmail(row.userId);
    if (!email) {
      await restoreReminder(row.id, reminder.days, previous);
      skipped += 1;
      continue;
    }
    try {
      await sendNoticeSmtp(config, {
        to: email,
        subject: "Hibe son tarih uyarısı",
        fromName: "yetkin.ai",
        text: [
          row.title,
          "",
          reminder.message,
          "",
          `Başvuru masası: ${link}`,
          "",
          "Bu ileti bilgilendirmedir. Hibe sonucu veya ödeme garantisi değildir.",
        ].join("\n"),
      });
      notified += 1;
    } catch (error) {
      await restoreReminder(row.id, reminder.days, previous);
      skipped += 1;
      logEvent({
        level: "warn",
        event: "hibe.lifecycle.reminder.failed",
        userId: row.userId,
        errorName: error instanceof Error ? error.name : "unknown",
      });
    }
  }
  logEvent({
    level: "info",
    event: "hibe.lifecycle.reminder.done",
    applied: notified > 0,
  });
  return { scanned: rows.length, notified, skipped, reason: "ok" };
}

async function restoreReminder(
  id: string,
  claimed: DeadlineReminderDay,
  previous: number | null,
): Promise<void> {
  await getPrisma().hibeApplication.updateMany({
    where: { id, lastReminderDays: claimed },
    data: { lastReminderDays: previous },
  });
}
