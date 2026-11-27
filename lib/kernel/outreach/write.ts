import "server-only";

import { writeSuperAdminAudit } from "@/lib/kernel/admin/audit-log";
import { bindSuperAdminAuditWriter } from "@/lib/kernel/admin/prisma-super-admin-audit";
import { getPrisma } from "@/lib/kernel/db";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServiceUnavailableError,
} from "@/lib/kernel/http/errors";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  isCorporateMailbox,
  normalizeOutreachEmail,
  outreachCopyIssue,
  outreachDayStartUtc,
  outreachImportChannel,
  outreachImportFindings,
  outreachImportNote,
  OUTREACH_IMPORT_TEXT_MAX,
  OUTREACH_ISSUE_LABELS,
  planOutreachImport,
  withUnsubscribeFooter,
  type OutreachDraftEdit,
  type OutreachImportReasons,
  type OutreachVertical,
} from "@/lib/kernel/outreach/policy";
import { describeDraftIssue, generateOutreachDraft, type OutreachSeed } from "@/lib/kernel/outreach/generate";
import { OUTREACH_SETTINGS_ID, OUTREACH_SETTINGS_KEY } from "@/lib/kernel/outreach/load";
import { readOutreachSender, sendOutreachMail } from "@/lib/kernel/outreach/sender";
import {
  buildOutreachUnsubscribeUrl,
  readOutreachUnsubscribeSecret,
} from "@/lib/kernel/outreach/token";

type AuditAction = "outreach_switch" | "outreach_draft" | "outreach_send" | "outreach_import";

async function sealAudit(input: {
  actorUserId: string;
  action: AuditAction;
  target: string;
  detail: string;
}): Promise<void> {
  try {
    await writeSuperAdminAudit(bindSuperAdminAuditWriter(getPrisma()), input);
  } catch {
    logEvent({
      level: "error",
      event: "admin.outreach.audit_missed",
      route: "/api/admin/outreach",
      action: input.action,
      purpose: "seal",
    });
  }
}

/** Ayar yaması. Şalter veya tavan değişimi denetim mührü bırakır. */
export async function updateOutreachSettings(input: {
  actorUserId: string;
  isEnabled?: boolean;
  dailyLimit?: number;
  sendHourTrt?: number;
}): Promise<void> {
  const prisma = getPrisma();
  const current = await prisma.outreachSettings.findUnique({
    where: { id: OUTREACH_SETTINGS_ID },
    select: { isEnabled: true, dailyLimit: true, sendHourTrt: true },
  });
  await prisma.outreachSettings.upsert({
    where: { id: OUTREACH_SETTINGS_ID },
    create: {
      id: OUTREACH_SETTINGS_ID,
      key: OUTREACH_SETTINGS_KEY,
      isEnabled: input.isEnabled ?? false,
      dailyLimit: input.dailyLimit ?? 15,
      sendHourTrt: input.sendHourTrt ?? 9,
      updatedBy: input.actorUserId,
    },
    update: {
      ...(input.isEnabled !== undefined ? { isEnabled: input.isEnabled } : {}),
      ...(input.dailyLimit !== undefined ? { dailyLimit: input.dailyLimit } : {}),
      ...(input.sendHourTrt !== undefined ? { sendHourTrt: input.sendHourTrt } : {}),
      updatedBy: input.actorUserId,
    },
  });
  const detail = [
    `engine=${(input.isEnabled ?? current?.isEnabled ?? false) ? "on" : "off"}`,
    `limit=${input.dailyLimit ?? current?.dailyLimit ?? 15}`,
    `hour=${input.sendHourTrt ?? current?.sendHourTrt ?? 9}TRT`,
  ].join(" · ");
  await sealAudit({
    actorUserId: input.actorUserId,
    action: "outreach_switch",
    target: OUTREACH_SETTINGS_ID,
    detail,
  });
}

/**
 * Taslak üretimi. Hedef kara listede veya zaten kuyruktaysa **yazılmaz**;
 * yanıt `skipped` sayısını dürüstçe döner.
 */
export async function createOutreachDrafts(input: {
  actorUserId: string;
  vertical: OutreachVertical;
  seeds: readonly OutreachSeed[];
}): Promise<{ created: number; skipped: number; notes: string[] }> {
  if (input.seeds.length === 0) {
    throw new BadRequestError("Üretilecek hedef yok. Kuyrukta uygun firma bulunamadı.");
  }
  const prisma = getPrisma();
  const [suppressedRows, existing] = await Promise.all([
    prisma.outreachSuppression.findMany({ select: { email: true } }),
    prisma.outreachCampaignDraft.findMany({ select: { recipientEmail: true } }),
  ]);
  const suppressed = new Set(suppressedRows.map((row) => normalizeOutreachEmail(row.email)));
  const taken = new Set(existing.map((row) => normalizeOutreachEmail(row.recipientEmail)));

  let created = 0;
  let skipped = 0;
  const notes: string[] = [];

  for (const seed of input.seeds) {
    const email = normalizeOutreachEmail(seed.recipientEmail);
    if (!isCorporateMailbox(email) || suppressed.has(email) || taken.has(email)) {
      skipped += 1;
      continue;
    }
    const draft = await generateOutreachDraft({
      seed,
      vertical: input.vertical,
      userId: input.actorUserId,
    });
    const issue = describeDraftIssue(input.vertical, draft.subject, draft.body);
    if (issue) {
      skipped += 1;
      notes.push(`${seed.companyName}: ${issue}`);
      continue;
    }
    await prisma.outreachCampaignDraft.create({
      data: {
        companyName: seed.companyName,
        recipientEmail: email,
        sector: seed.sector,
        vertical: input.vertical,
        sourceUrl: seed.sourceUrl,
        subject: draft.subject,
        bodyText: draft.body,
        status: "PENDING_APPROVAL",
      },
    });
    taken.add(email);
    created += 1;
    notes.push(`${seed.companyName}: ${draft.note}`);
  }

  await sealAudit({
    actorUserId: input.actorUserId,
    action: "outreach_draft",
    target: `generate:${input.vertical}`,
    detail: `created=${created} skipped=${skipped}`,
  });
  return { created, skipped, notes: notes.slice(0, 12) };
}

/** Panel düzenlemesi. Yalnız onay bekleyen veya reddedilmiş taslak düzenlenir. */
export async function saveOutreachDraft(edit: OutreachDraftEdit): Promise<void> {
  const prisma = getPrisma();
  const row = await prisma.outreachCampaignDraft.findUnique({
    where: { id: edit.id },
    select: { status: true, vertical: true },
  });
  if (!row) {
    throw new NotFoundError("Taslak yok.");
  }
  if (row.status === "SENT") {
    throw new ConflictError("Gönderilmiş taslak değişmez.");
  }
  const issue = describeDraftIssue(row.vertical as OutreachVertical, edit.subject, edit.body);
  if (issue) {
    throw new BadRequestError(issue);
  }
  await prisma.outreachCampaignDraft.update({
    where: { id: edit.id },
    data: {
      recipientEmail: edit.recipientEmail,
      subject: edit.subject,
      bodyText: edit.body,
      // Düzenlenen taslak yeniden onaya döner: eski onay metne ait değildir.
      status: "PENDING_APPROVAL",
      approvedBy: null,
      approvedAt: null,
      errorMessage: "",
    },
  });
}

export async function decideOutreachDraft(input: {
  actorUserId: string;
  id: string;
  decision: "approve" | "reject";
  subject?: string;
  body?: string;
}): Promise<void> {
  const prisma = getPrisma();
  const row = await prisma.outreachCampaignDraft.findUnique({
    where: { id: input.id },
    select: {
      status: true,
      vertical: true,
      recipientEmail: true,
      subject: true,
      bodyText: true,
      companyName: true,
    },
  });
  if (!row) {
    throw new NotFoundError("Taslak yok.");
  }
  if (row.status === "SENT") {
    throw new ConflictError("Gönderilmiş taslak karara bağlanmaz.");
  }
  const email = normalizeOutreachEmail(row.recipientEmail);
  if (!isCorporateMailbox(email)) {
    throw new BadRequestError("Alıcı kurumsal adres değil.");
  }
  if (input.decision === "approve") {
    const subject = (input.subject ?? row.subject).trim();
    const body = (input.body ?? row.bodyText).trim();
    const issue = describeDraftIssue(row.vertical as OutreachVertical, subject, body);
    if (issue) {
      throw new BadRequestError(issue);
    }
    await prisma.outreachCampaignDraft.update({
      where: { id: input.id },
      data: {
        subject,
        bodyText: body,
        status: "APPROVED",
        approvedBy: input.actorUserId,
        approvedAt: new Date(),
        errorMessage: "",
      },
    });
    await sealAudit({
      actorUserId: input.actorUserId,
      action: "outreach_draft",
      target: input.id,
      detail: `approved · ${row.companyName}`,
    });
    return;
  }
  await prisma.outreachCampaignDraft.update({
    where: { id: input.id },
    data: { status: "REJECTED", approvedBy: null, approvedAt: null, errorMessage: "" },
  });
  await sealAudit({
    actorUserId: input.actorUserId,
    action: "outreach_draft",
    target: input.id,
    detail: `rejected · ${row.companyName}`,
  });
}

/**
 * Tek gönderim — onaylı taslak veya test.
 *
 * Sıra: ayar açık mı → gönderen hazır mı → adres kurumsal mı → kara listede mi →
 * günlük tavan → metin kapısı → taşıma. Her adım fail-closed; hiçbiri atlanmaz.
 * `testTo` verilirse alıcı o adrestir ve taslak durumu değişmez.
 */
export async function sendOutreachDraft(input: {
  actorUserId: string;
  id: string;
  testTo?: string;
}): Promise<{ sent: boolean; sentToday: number; reason?: string }> {
  const prisma = getPrisma();
  const row = await prisma.outreachCampaignDraft.findUnique({
    where: { id: input.id },
    select: {
      id: true,
      status: true,
      vertical: true,
      recipientEmail: true,
      subject: true,
      bodyText: true,
      companyName: true,
    },
  });
  if (!row) {
    throw new NotFoundError("Taslak yok.");
  }

  const isTest = Boolean(input.testTo?.trim());
  const to = isTest ? normalizeOutreachEmail(input.testTo ?? "") : normalizeOutreachEmail(row.recipientEmail);

  if (!isTest && row.status !== "APPROVED") {
    throw new ConflictError("Yalnız onaylı taslak gönderilir.");
  }
  if (!isCorporateMailbox(to)) {
    throw new BadRequestError("Alıcı kurumsal adres değil.");
  }

  const suppressed = await prisma.outreachSuppression.findUnique({ where: { email: to } });
  if (suppressed) {
    throw new ConflictError("Alıcı kara listede. Gönderim durdu.");
  }

  const sender = readOutreachSender();
  if (!sender.ready) {
    throw new ServiceUnavailableError(sender.issue);
  }

  const secret = readOutreachUnsubscribeSecret();
  if (!secret) {
    throw new ServiceUnavailableError(
      "OUTREACH_UNSUBSCRIBE_SECRET yok. RET hakkı olmadan ticari ileti gönderilmez.",
    );
  }

  const setting = await prisma.outreachSettings.findUnique({
    where: { id: OUTREACH_SETTINGS_ID },
    select: { isEnabled: true, dailyLimit: true },
  });
  if (!isTest && !setting?.isEnabled) {
    throw new ConflictError("Otonom gönderim kapalı. Taslak kuyrukta duruyor.");
  }

  if (!isTest) {
    const sentToday = await prisma.outreachCampaignDraft.count({
      where: { status: "SENT", sentAt: { gte: outreachDayStartUtc() } },
    });
    const limit = setting?.dailyLimit ?? 15;
    if (sentToday >= limit) {
      throw new ConflictError(`Günlük tavan doldu (${sentToday}/${limit}).`);
    }
  }

  const unsubscribeUrl = buildOutreachUnsubscribeUrl({ email: to, secret });
  const text = withUnsubscribeFooter(row.bodyText, unsubscribeUrl);
  const issue = outreachCopyIssue({
    vertical: row.vertical as OutreachVertical,
    subject: row.subject,
    body: text,
    unsubscribeUrl,
  });
  if (!issue.ok) {
    throw new BadRequestError(OUTREACH_ISSUE_LABELS[issue.reason]);
  }

  const result = await sendOutreachMail({
    to,
    subject: row.subject,
    text,
    sender,
  });

  if (!result.ok) {
    if (!isTest) {
      await prisma.outreachCampaignDraft.update({
        where: { id: row.id },
        data: {
          status: "FAILED",
          errorMessage: result.detail.slice(0, 500),
        },
      });
    }
    throw new ServiceUnavailableError(
      result.reason === "sender_unconfigured"
        ? "Gönderim taşıması ayarlı değil. Taslak kuyrukta duruyor."
        : `E-posta gitmedi (${result.detail}). Taslak kuyrukta duruyor.`,
    );
  }

  if (!isTest) {
    await prisma.outreachCampaignDraft.update({
      where: { id: row.id },
      data: { status: "SENT", sentAt: new Date(), errorMessage: "" },
    });
    await sealAudit({
      actorUserId: input.actorUserId,
      action: "outreach_send",
      target: row.id,
      detail: `manual · ${row.companyName}`,
    });
  }

  const todayStart = outreachDayStartUtc();
  const sentToday = await prisma.outreachCampaignDraft.count({
    where: { status: "SENT", sentAt: { gte: todayStart } },
  });
  return { sent: true, sentToday };
}

/**
 * Inngest cron gövdesi: onaylı kuyruktan en fazla `dailyLimit` adet gönderir.
 * `step.sleep` çağıran katmandadır; bu fonksiyon **tek** taslak gönderir ve
 * sonucu döner. Böylece Inngest her adımı ayrı `step.run` olarak izler.
 */
export async function sendOneApprovedOutreach(input: {
  id: string;
  actorUserId: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const prisma = getPrisma();
  const row = await prisma.outreachCampaignDraft.findUnique({
    where: { id: input.id },
    select: { status: true, recipientEmail: true },
  });
  if (!row) {
    return { sent: false, reason: "not_found" };
  }
  if (row.status !== "APPROVED") {
    return { sent: false, reason: "not_approved" };
  }
  const email = normalizeOutreachEmail(row.recipientEmail);
  if (!isCorporateMailbox(email)) {
    await prisma.outreachCampaignDraft.update({
      where: { id: input.id },
      data: { status: "REJECTED", errorMessage: "Alıcı kurumsal adres değil." },
    });
    return { sent: false, reason: "not_corporate" };
  }
  const suppressed = await prisma.outreachSuppression.findUnique({ where: { email } });
  if (suppressed) {
    await prisma.outreachCampaignDraft.update({
      where: { id: input.id },
      data: { status: "REJECTED", errorMessage: "Kara listede." },
    });
    return { sent: false, reason: "suppressed" };
  }
  try {
    const result = await sendOutreachDraft({ actorUserId: input.actorUserId, id: input.id });
    return { sent: result.sent };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "send_failed";
    return { sent: false, reason: reason.slice(0, 200) };
  }
}

/** Cron için onaylı kimlik listesi — gönderim sırası eskiden yeniye. */
export async function listApprovedOutreachIds(limit: number): Promise<string[]> {
  const rows = await getPrisma().outreachCampaignDraft.findMany({
    where: { status: "APPROVED" },
    orderBy: { approvedAt: "asc" },
    take: Math.min(Math.max(limit, 1), 20),
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

export type OutreachImportResult = {
  added: number;
  rejected: number;
  reasons: OutreachImportReasons;
};

/**
 * Süper admin listesini hedef havuzuna yazar.
 * Geçersiz adres, ücretsiz kutu ve kara liste elenir; sayaç dürüst döner.
 * Temiz satır `b2b_lead_campaign_items` içine `admin-csv` etiketiyle düşer.
 * Denetim satırına adres dökümü yazılmaz.
 */
export async function importOutreachTargets(input: {
  actorUserId: string;
  text: string;
}): Promise<OutreachImportResult> {
  if (input.text.length > OUTREACH_IMPORT_TEXT_MAX) {
    throw new BadRequestError("Liste çok uzun.");
  }
  if (input.text.trim().length === 0) {
    throw new BadRequestError("Liste boş.");
  }

  const prisma = getPrisma();
  const [suppressedRows, leads, drafts] = await Promise.all([
    prisma.outreachSuppression.findMany({ select: { email: true } }),
    prisma.b2bLeadCampaignItem.findMany({ select: { email: true } }),
    prisma.outreachCampaignDraft.findMany({ select: { recipientEmail: true } }),
  ]);
  const plan = planOutreachImport(input.text, {
    suppressed: new Set(suppressedRows.map((row) => row.email)),
    taken: new Set([
      ...leads.map((row) => row.email),
      ...drafts.map((row) => row.recipientEmail),
    ]),
  });
  if (plan.accepted.length === 0 && plan.rejected === 0) {
    throw new BadRequestError("Liste boş.");
  }

  const written =
    plan.accepted.length === 0
      ? 0
      : (
          await prisma.b2bLeadCampaignItem.createMany({
            data: plan.accepted.map((row) => ({
              companyName: row.companyName,
              email: row.recipientEmail,
              sector: row.sector,
              city: "",
              channel: outreachImportChannel(row.vertical),
              status: "QUEUED",
              note: outreachImportNote(row.sourceNote),
              findingsJson: outreachImportFindings(row),
              actorUserId: input.actorUserId,
              updatedAt: new Date(),
            })),
          })
        ).count;

  await sealAudit({
    actorUserId: input.actorUserId,
    action: "outreach_import",
    target: "admin-csv",
    detail: `added=${written} rejected=${plan.rejected}`,
  });

  return { added: written, rejected: plan.rejected, reasons: plan.reasons };
}

/** RET ucu: adresi kara listeye yazar ve bekleyen taslaklarını iptal eder. */
export async function suppressOutreachEmail(input: {
  email: string;
  reason?: string;
}): Promise<{ added: boolean; cancelled: number }> {
  const email = normalizeOutreachEmail(input.email);
  if (!email) {
    throw new BadRequestError("Adres yok.");
  }
  const prisma = getPrisma();
  const existing = await prisma.outreachSuppression.findUnique({ where: { email } });
  let added = false;
  if (!existing) {
    await prisma.outreachSuppression.create({
      data: { email, reason: (input.reason ?? "unsubscribe").slice(0, 40) },
    });
    added = true;
  }
  const cancelled = await prisma.outreachCampaignDraft.updateMany({
    where: { recipientEmail: email, status: { in: ["PENDING_APPROVAL", "APPROVED", "FAILED"] } },
    data: {
      status: "REJECTED",
      errorMessage: "Alıcı çıktı (RET).",
      approvedBy: null,
      approvedAt: null,
    },
  });
  logEvent({
    level: "info",
    event: "outreach.unsubscribe.applied",
    action: "suppress",
    applied: added,
    reason: `cancelled=${cancelled.count}`,
  });
  return { added, cancelled: cancelled.count };
}

/** Yönetici tarafından elle kara listeye alma (şikâyet, sert bounce). */
export async function blockOutreachEmail(actorUserId: string, email: string): Promise<void> {
  const normalized = normalizeOutreachEmail(email);
  if (!normalized) {
    throw new BadRequestError("Adres yok.");
  }
  await suppressOutreachEmail({ email: normalized, reason: "admin_block" });
  await sealAudit({
    actorUserId,
    action: "outreach_draft",
    target: normalized,
    detail: "blocked",
  });
}
