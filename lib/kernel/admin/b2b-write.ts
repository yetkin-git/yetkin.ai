import "server-only";

import { writeSuperAdminAudit } from "@/lib/kernel/admin/audit-log";
import {
  assertB2bOutboundBody,
  B2B_OUTBOUND_DAILY_LIMIT,
  B2B_OUTBOUND_SETTING_ID,
  B2B_OUTBOUND_SETTING_KEY,
  b2bCounterDay,
  isCorporateMailbox,
  type B2bLeadChannel,
} from "@/lib/kernel/admin/b2b-outbound";
import { bindSuperAdminAuditWriter } from "@/lib/kernel/admin/prisma-super-admin-audit";
import { sendAuthHtmlMail } from "@/lib/kernel/auth/confirmation-mail";
import { getPrisma } from "@/lib/kernel/db";
import { BadRequestError, ConflictError, NotFoundError, ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { logEvent } from "@/lib/kernel/observability/log";

function oneLine(value: string, max: number): string {
  const clean = value.replace(/[\r\n\u0000]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function releaseSendLock(id: string, ymd: string): Promise<void> {
  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    const reverted = await tx.b2bLeadCampaignItem.updateMany({
      where: { id, status: "SEND_LOCK" },
      data: { status: "DRAFT_READY" },
    });
    if (reverted.count !== 1) {
      return;
    }
    await tx.$executeRaw`
      UPDATE b2b_outbound_daily_counters
      SET sent_count = sent_count - 1
      WHERE day = ${ymd}::date AND sent_count > 0
    `;
  });
}

async function sealAudit(input: {
  actorUserId: string;
  action: "b2b_switch" | "b2b_send";
  target: string;
  detail: string;
}): Promise<void> {
  try {
    await writeSuperAdminAudit(bindSuperAdminAuditWriter(getPrisma()), input);
  } catch {
    logEvent({
      level: "error",
      event: "admin.b2b.audit_missed",
      route: "/api/admin/b2b",
      action: input.action,
      purpose: "seal",
    });
  }
}

export async function setB2bOutboundEnabled(actorUserId: string, enabled: boolean): Promise<void> {
  const prisma = getPrisma();
  await prisma.b2bOutboundSetting.upsert({
    where: { id: B2B_OUTBOUND_SETTING_ID },
    create: {
      id: B2B_OUTBOUND_SETTING_ID,
      key: B2B_OUTBOUND_SETTING_KEY,
      enabled,
      dailyLimit: B2B_OUTBOUND_DAILY_LIMIT,
      updatedBy: actorUserId,
    },
    update: { enabled, updatedBy: actorUserId },
  });
  await sealAudit({
    actorUserId,
    action: "b2b_switch",
    target: B2B_OUTBOUND_SETTING_ID,
    detail: enabled ? "enabled" : "disabled",
  });
}

export async function editB2bDraft(input: {
  id: string;
  subject: string;
  body: string;
}): Promise<void> {
  const subject = oneLine(input.subject, 180);
  const body = input.body.replace(/\u0000/g, "").trim();
  if (subject.length < 3) {
    throw new BadRequestError("Konu çok kısa.");
  }
  if (body.length < 20 || body.length > 8000) {
    throw new BadRequestError("Metin 20–8000 karakter olmalı.");
  }
  const updated = await getPrisma().b2bLeadCampaignItem.updateMany({
    where: { id: input.id, status: "DRAFT_READY" },
    data: { subject, body },
  });
  if (updated.count !== 1) {
    throw new ConflictError("Yalnız hazır taslak düzenlenir.");
  }
}

export async function releaseB2bSendLock(id: string): Promise<void> {
  const { ymd } = b2bCounterDay();
  const prisma = getPrisma();
  const row = await prisma.b2bLeadCampaignItem.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!row) {
    throw new NotFoundError("Taslak yok.");
  }
  if (row.status !== "SEND_LOCK") {
    throw new ConflictError("Yalnız kilitli gönderim geri alınır.");
  }
  await releaseSendLock(id, ymd);
}

export async function sendB2bDraft(input: {
  actorUserId: string;
  id: string;
  subject: string;
  body: string;
}): Promise<{ sentToday: number }> {
  const subject = oneLine(input.subject, 180);
  const body = input.body.replace(/\u0000/g, "").trim();
  if (subject.length < 3) {
    throw new BadRequestError("Konu çok kısa.");
  }
  const prisma = getPrisma();
  const existing = await prisma.b2bLeadCampaignItem.findUnique({
    where: { id: input.id },
    select: { id: true, status: true, channel: true, email: true },
  });
  if (!existing) {
    throw new NotFoundError("Taslak yok.");
  }
  if (existing.status !== "DRAFT_READY") {
    throw new ConflictError("Yalnız hazır taslak gönderilir.");
  }
  if (!isCorporateMailbox(existing.email)) {
    throw new BadRequestError("Kurumsal e-posta değil.");
  }
  const sealed = assertB2bOutboundBody(existing.channel as B2bLeadChannel, body);
  if (!sealed.ok) {
    throw new BadRequestError(sealed.error);
  }

  const { ymd } = b2bCounterDay();
  await prisma.$transaction(async (tx) => {
    const setting = await tx.b2bOutboundSetting.findUnique({
      where: { id: B2B_OUTBOUND_SETTING_ID },
      select: { enabled: true },
    });
    if (!setting?.enabled) {
      throw new ConflictError("Motor kapalı. Gönderim kilitli.");
    }
    const locked = await tx.b2bLeadCampaignItem.updateMany({
      where: { id: input.id, status: "DRAFT_READY" },
      data: { status: "SEND_LOCK", subject, body },
    });
    if (locked.count !== 1) {
      throw new ConflictError("Bu taslak gönderilemez.");
    }
    const rows = await tx.$queryRaw<{ sent_count: number }[]>`
      INSERT INTO b2b_outbound_daily_counters (day, sent_count)
      VALUES (${ymd}::date, 1)
      ON CONFLICT (day) DO UPDATE
      SET sent_count = b2b_outbound_daily_counters.sent_count + 1
      WHERE b2b_outbound_daily_counters.sent_count < ${B2B_OUTBOUND_DAILY_LIMIT}
      RETURNING sent_count
    `;
    if (rows.length === 0) {
      throw new ConflictError("Günlük 15 firma limiti doldu.");
    }
  });

  try {
    const status = await sendAuthHtmlMail({
      to: existing.email,
      subject,
      text: body,
      html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(body)}</pre>`,
    });
    if (status !== "sent") {
      throw new ServiceUnavailableError("E-posta servisi ayarlı değil. Taslak duruyor.");
    }
  } catch (error) {
    await releaseSendLock(input.id, ymd);
    if (error instanceof ServiceUnavailableError) {
      throw error;
    }
    throw new ServiceUnavailableError("E-posta gitmedi. Taslak kuyrukta duruyor.");
  }

  const marked = await prisma.b2bLeadCampaignItem.updateMany({
    where: { id: input.id, status: "SEND_LOCK" },
    data: { status: "SENT", sentAt: new Date() },
  });
  if (marked.count !== 1) {
    logEvent({
      level: "error",
      event: "admin.b2b.sent_seal_missed",
      route: "/api/admin/b2b/send",
      action: "b2b_send",
      purpose: "seal",
    });
  }
  await sealAudit({
    actorUserId: input.actorUserId,
    action: "b2b_send",
    target: input.id,
    detail: `${existing.channel} sent`,
  });
  const counter = await prisma.b2bOutboundDailyCounter.findUnique({
    where: { day: b2bCounterDay().day },
    select: { sentCount: true },
  });
  return { sentToday: counter?.sentCount ?? B2B_OUTBOUND_DAILY_LIMIT };
}
