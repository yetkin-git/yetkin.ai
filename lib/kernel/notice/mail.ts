import "server-only";

import { NOTICE_SEN } from "@/lib/copy/sen-voice/notice";
import { lookupCitizenEmail } from "@/lib/kernel/notice/contact";
import { sendNoticeSmtp } from "@/lib/kernel/notice/smtp";
import type { CitizenNotice } from "@/lib/kernel/notice/types";
import { logEvent } from "@/lib/kernel/observability/log";

export type NoticeMailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

function envTrim(name: string, env: Record<string, string | undefined>): string {
  return env[name]?.trim() ?? "";
}

export function readNoticeMailConfig(
  env: Record<string, string | undefined> = process.env,
): NoticeMailConfig | null {
  const host = envTrim("NOTICE_SMTP_HOST", env);
  const from = envTrim("NOTICE_MAIL_FROM", env);
  if (!host || !from) {
    return null;
  }
  const portRaw = envTrim("NOTICE_SMTP_PORT", env);
  const port = portRaw ? Number.parseInt(portRaw, 10) : 587;
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    return null;
  }
  return {
    host,
    port,
    user: envTrim("NOTICE_SMTP_USER", env),
    pass: envTrim("NOTICE_SMTP_PASS", env),
    from,
  };
}

export function isNoticeMailConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return readNoticeMailConfig(env) !== null;
}

function copyFor(kind: CitizenNotice["kind"]): { subject: string; body: string } {
  switch (kind) {
    case "bid_received":
      return NOTICE_SEN.bidReceived;
    case "bid_accepted":
      return NOTICE_SEN.bidAccepted;
    case "delivery_posted":
      return NOTICE_SEN.deliveryPosted;
    case "escrow_released":
      return NOTICE_SEN.escrowReleased;
    case "escrow_ttl_approaching":
      return NOTICE_SEN.escrowTtlApproaching;
  }
}

function appOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
}

export async function deliverCitizenNoticeMail(notice: CitizenNotice): Promise<"sent" | "skipped"> {
  if (!notice.applied) {
    return "skipped";
  }
  if (process.env.NODE_ENV === "test") {
    return "skipped";
  }
  const config = readNoticeMailConfig();
  if (!config) {
    logEvent({
      level: "info",
      event: "citizen.notice.mail.skipped",
      userId: notice.userId,
      action: notice.kind,
      reason: "smtp_unconfigured",
      applied: true,
      requestId: notice.requestId,
    });
    return "skipped";
  }
  const to = await lookupCitizenEmail(notice.userId);
  if (!to) {
    logEvent({
      level: "info",
      event: "citizen.notice.mail.skipped",
      userId: notice.userId,
      action: notice.kind,
      reason: "no_email",
      applied: true,
      requestId: notice.requestId,
    });
    return "skipped";
  }
  const copy = copyFor(notice.kind);
  const text = `${copy.body}\n\n${appOrigin()}/freelancer\n`;
  await sendNoticeSmtp(config, {
    to,
    subject: copy.subject,
    text,
    fromName: NOTICE_SEN.fromName,
  });
  logEvent({
    level: "info",
    event: "citizen.notice.mail.sent",
    userId: notice.userId,
    action: notice.kind,
    applied: true,
    requestId: notice.requestId,
  });
  return "sent";
}
