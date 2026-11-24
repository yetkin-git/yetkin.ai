import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import type { AgencyClientCard } from "@/lib/yetkinhibe/agency-match";
import { AGENCY_FOCUS_UNSET, isAgencyFocusValue } from "@/lib/yetkinhibe/agency-match";
import {
  deadlineReminder,
  daysUntilDeadline,
  grantPhaseLabel,
  hibeDocumentCategoryLabel,
  hibeDocumentStatusLabel,
  isGrantLifecyclePhase,
  isHibeDocumentCategory,
  isHibeDocumentStatus,
  phaseAdvanceError,
  type GrantLifecyclePhaseKey,
  type HibeDocumentCategory,
  type HibeDocumentStatus,
} from "@/lib/yetkinhibe/grant-lifecycle";
import type { HibeApplicationView, HibeDocumentView } from "@/lib/yetkinhibe/lifecycle-view";

const OWNED_ID = /^[A-Za-z0-9_-]{8,80}$/;
const CALL_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{1,119}$/;
const CLIENT_CAP = 200;
const APPLICATION_CAP = 100;
const DOCUMENT_CAP = 40;

export class HibeWriteError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function hibeWriteResult(
  run: () => Promise<Record<string, unknown>>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  try {
    return { status: 200, body: await run() };
  } catch (error) {
    if (error instanceof HibeWriteError) {
      return { status: error.status, body: { error: error.message } };
    }
    throw error;
  }
}

export type { HibeApplicationView, HibeDocumentView } from "@/lib/yetkinhibe/lifecycle-view";

export type CreateHibeApplicationInput = {
  grantCallId: string;
  title: string;
  clientId?: string | null;
  dossierId?: string | null;
  nextDeadlineAt?: string | null;
  notes?: string | null;
};

export type CreateHibeDocumentInput = {
  title: string;
  category: HibeDocumentCategory;
  status?: HibeDocumentStatus;
  fileUrl?: string | null;
  referenceCode?: string | null;
  reviewerNote?: string | null;
};

export type UpdateHibeDocumentInput = {
  documentId: string;
  status: HibeDocumentStatus;
  fileUrl?: string | null;
  referenceCode?: string | null;
  reviewerNote?: string | null;
};

export type CreateHibeClientInput = {
  companyName: string;
  naceGroup: string;
  provinceCode: string;
  audience: string;
  employeeCount: number;
  companyAgeYears: number;
  rdMaturityLevel: string;
  exportActive: boolean;
  /** Ş7 — müşterinin yatırım odağı. Boşsa "genel" yazılır. */
  investmentFocus?: string | null;
  /** Patent beyanı. Yoksa `false`; patent şartlı çağrı "eksik" kovasına düşer. */
  hasPatentOrUtilityModel?: boolean;
};

function ownedId(value: string, label: string): string {
  const id = value.trim();
  if (!OWNED_ID.test(id)) {
    throw new HibeWriteError(404, `${label} bulunamadı.`);
  }
  return id;
}

function cleanHttps(value: string | null | undefined): string | null {
  if (value == null || value.trim().length === 0) {
    return null;
  }
  const url = value.trim();
  if (url.length > 500 || !url.startsWith("https://")) {
    throw new HibeWriteError(400, "Dosya adresi https olmalı.");
  }
  return url;
}

function cleanReference(value: string | null | undefined): string | null {
  if (value == null || value.trim().length === 0) {
    return null;
  }
  const code = value.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9_./-]{0,79}$/.test(code)) {
    throw new HibeWriteError(400, "Referans kodu geçersiz.");
  }
  return code;
}

function cleanNote(value: string | null | undefined, max: number, label: string): string | null {
  if (value == null || value.trim().length === 0) {
    return null;
  }
  const text = value.trim();
  if (text.length > max) {
    throw new HibeWriteError(400, `${label} çok uzun.`);
  }
  return text;
}

function toDocumentView(row: {
  id: string;
  title: string;
  category: string;
  status: string;
  fileUrl: string | null;
  referenceCode: string | null;
  reviewerNote: string | null;
}): HibeDocumentView | null {
  if (!isHibeDocumentCategory(row.category) || !isHibeDocumentStatus(row.status)) {
    return null;
  }
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    categoryLabel: hibeDocumentCategoryLabel(row.category),
    status: row.status,
    statusLabel: hibeDocumentStatusLabel(row.status),
    fileUrl: row.fileUrl,
    referenceCode: row.referenceCode,
    reviewerNote: row.reviewerNote,
  };
}

export async function listHibeApplications(userId: string, now = new Date()): Promise<HibeApplicationView[]> {
  const rows = await getPrisma().hibeApplication.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: APPLICATION_CAP,
    include: {
      documents: { orderBy: { updatedAt: "desc" }, take: DOCUMENT_CAP },
    },
  });
  const views: HibeApplicationView[] = [];
  for (const row of rows) {
    if (!isGrantLifecyclePhase(row.phase)) {
      continue;
    }
    const reminder = row.nextDeadlineAt ? deadlineReminder(row.nextDeadlineAt, now) : null;
    const remaining = row.nextDeadlineAt ? daysUntilDeadline(row.nextDeadlineAt, now) : null;
    views.push({
      id: row.id,
      title: row.title,
      phase: row.phase,
      phaseLabel: grantPhaseLabel(row.phase),
      nextDeadlineAt: row.nextDeadlineAt ? row.nextDeadlineAt.toISOString() : null,
      remainingDays: remaining,
      alert: reminder?.message ?? null,
      alertSeverity: reminder?.severity ?? null,
      notes: row.notes,
      grantCallId: row.grantCallId,
      clientId: row.clientId,
      documents: row.documents.flatMap((document) => {
        const view = toDocumentView(document);
        return view ? [view] : [];
      }),
    });
  }
  return views;
}

export async function createHibeApplication(
  userId: string,
  input: CreateHibeApplicationInput,
): Promise<{ id: string; phase: GrantLifecyclePhaseKey }> {
  const grantCallId = input.grantCallId.trim();
  if (!CALL_ID.test(grantCallId)) {
    throw new HibeWriteError(400, "Çağrı kaydı geçersiz.");
  }
  const title = input.title.trim();
  if (title.length < 2 || title.length > 300) {
    throw new HibeWriteError(400, "Başvuru başlığı geçersiz.");
  }
  const notes = cleanNote(input.notes, 2000, "Not");
  let nextDeadlineAt: Date | null = null;
  if (input.nextDeadlineAt && input.nextDeadlineAt.trim().length > 0) {
    nextDeadlineAt = new Date(input.nextDeadlineAt);
    if (Number.isNaN(nextDeadlineAt.getTime())) {
      throw new HibeWriteError(400, "Son tarih okunamadı.");
    }
  }
  const clientId = input.clientId ? ownedId(input.clientId, "Müşteri") : null;
  const dossierId = input.dossierId ? ownedId(input.dossierId, "Dosya") : null;
  const prisma = getPrisma();
  const count = await prisma.hibeApplication.count({ where: { userId } });
  if (count >= APPLICATION_CAP) {
    throw new HibeWriteError(422, "Başvuru sınırı doldu.");
  }
  const call = await prisma.yetkinhibeGrantCall.findFirst({
    where: { id: grantCallId, isPublished: true },
    select: { id: true },
  });
  if (!call) {
    throw new HibeWriteError(422, "Bu çağrı katalogda yok.");
  }
  if (clientId) {
    const client = await prisma.hibeClient.findFirst({ where: { id: clientId, userId }, select: { id: true } });
    if (!client) {
      throw new HibeWriteError(404, "Müşteri bulunamadı.");
    }
  }
  if (dossierId) {
    const dossier = await prisma.hibeDossier.findFirst({ where: { id: dossierId, userId }, select: { id: true } });
    if (!dossier) {
      throw new HibeWriteError(404, "Dosya bulunamadı.");
    }
  }
  const created = await prisma.hibeApplication.create({
    data: {
      userId,
      grantCallId,
      title,
      phase: "APPLICATION_APPROVAL",
      clientId,
      dossierId,
      nextDeadlineAt,
      notes,
    },
    select: { id: true },
  });
  return { id: created.id, phase: "APPLICATION_APPROVAL" };
}

export async function advanceHibeApplicationPhase(
  userId: string,
  applicationId: string,
  requested: string,
): Promise<{ phase: GrantLifecyclePhaseKey }> {
  const id = ownedId(applicationId, "Başvuru");
  const prisma = getPrisma();
  const current = await prisma.hibeApplication.findFirst({
    where: { id, userId },
    select: { phase: true },
  });
  if (!current) {
    throw new HibeWriteError(404, "Başvuru bulunamadı.");
  }
  const error = phaseAdvanceError(current.phase, requested);
  if (error || !isGrantLifecyclePhase(requested)) {
    throw new HibeWriteError(422, error ?? "Faz kaydı okunamadı.");
  }
  await prisma.hibeApplication.update({
    where: { id },
    data: { phase: requested },
  });
  return { phase: requested };
}

async function ownedApplication(userId: string, applicationId: string): Promise<string> {
  const id = ownedId(applicationId, "Başvuru");
  const row = await getPrisma().hibeApplication.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!row) {
    throw new HibeWriteError(404, "Başvuru bulunamadı.");
  }
  return id;
}

export async function addHibeDocument(
  userId: string,
  applicationId: string,
  input: CreateHibeDocumentInput,
): Promise<{ id: string; status: HibeDocumentStatus }> {
  const application = await ownedApplication(userId, applicationId);
  const title = input.title.trim();
  if (title.length < 2 || title.length > 200) {
    throw new HibeWriteError(400, "Evrak başlığı geçersiz.");
  }
  const fileUrl = cleanHttps(input.fileUrl);
  const referenceCode = cleanReference(input.referenceCode);
  const reviewerNote = cleanNote(input.reviewerNote, 1000, "İnceleme notu");
  const status = input.status ?? (fileUrl || referenceCode ? "pending" : "missing");
  const prisma = getPrisma();
  const count = await prisma.hibeDocument.count({ where: { applicationId: application, userId } });
  if (count >= DOCUMENT_CAP) {
    throw new HibeWriteError(422, "Evrak sınırı doldu.");
  }
  const created = await prisma.hibeDocument.create({
    data: {
      userId,
      applicationId: application,
      title,
      category: input.category,
      status,
      fileUrl,
      referenceCode,
      reviewerNote,
    },
    select: { id: true, status: true },
  });
  if (!isHibeDocumentStatus(created.status)) {
    throw new HibeWriteError(500, "Evrak durumu okunamadı.");
  }
  return { id: created.id, status: created.status };
}

export async function updateHibeDocument(
  userId: string,
  applicationId: string,
  input: UpdateHibeDocumentInput,
): Promise<{ id: string; status: HibeDocumentStatus }> {
  const application = await ownedApplication(userId, applicationId);
  const documentId = ownedId(input.documentId, "Evrak");
  const fileUrl = input.fileUrl === undefined ? undefined : cleanHttps(input.fileUrl);
  const referenceCode = input.referenceCode === undefined ? undefined : cleanReference(input.referenceCode);
  const reviewerNote = input.reviewerNote === undefined ? undefined : cleanNote(input.reviewerNote, 1000, "İnceleme notu");
  const prisma = getPrisma();
  const current = await prisma.hibeDocument.findFirst({
    where: { id: documentId, applicationId: application, userId },
    select: { id: true },
  });
  if (!current) {
    throw new HibeWriteError(404, "Evrak bulunamadı.");
  }
  const updated = await prisma.hibeDocument.update({
    where: { id: documentId },
    data: {
      status: input.status,
      ...(fileUrl !== undefined ? { fileUrl } : {}),
      ...(referenceCode !== undefined ? { referenceCode } : {}),
      ...(reviewerNote !== undefined ? { reviewerNote } : {}),
    },
    select: { id: true, status: true },
  });
  if (!isHibeDocumentStatus(updated.status)) {
    throw new HibeWriteError(500, "Evrak durumu okunamadı.");
  }
  return { id: updated.id, status: updated.status };
}

export async function listHibeClients(userId: string): Promise<AgencyClientCard[]> {
  const rows = await getPrisma().hibeClient.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: CLIENT_CAP,
  });
  return rows.map((row) => ({
    id: row.id,
    companyName: row.companyName,
    naceGroup: row.naceGroup,
    provinceCode: row.provinceCode,
    audience: row.audience,
    employeeCount: row.employeeCount,
    companyAgeYears: row.companyAgeYears,
    rdMaturityLevel: row.rdMaturityLevel,
    exportActive: row.exportActive,
    investmentFocus: row.investmentFocus,
  }));
}

export async function createHibeClient(
  userId: string,
  input: CreateHibeClientInput,
): Promise<{ id: string }> {
  const prisma = getPrisma();
  const count = await prisma.hibeClient.count({ where: { userId } });
  if (count >= CLIENT_CAP) {
    throw new HibeWriteError(422, "Portföy sınırı 200 müşteri.");
  }
  const focus = input.investmentFocus?.trim() ?? "";
  // "genel" = beyan yok. Kapalı liste dışındaki değer sessizce kabul edilmez.
  const investmentFocus = focus.length === 0 ? AGENCY_FOCUS_UNSET : focus;
  if (!isAgencyFocusValue(investmentFocus)) {
    throw new HibeWriteError(400, "Yatırım odağı kapalı listede değil.");
  }
  const created = await prisma.hibeClient.create({
    data: {
      userId,
      companyName: input.companyName.trim(),
      naceGroup: input.naceGroup,
      provinceCode: input.provinceCode,
      audience: input.audience,
      employeeCount: input.employeeCount,
      companyAgeYears: input.companyAgeYears,
      rdMaturityLevel: input.rdMaturityLevel,
      exportActive: input.exportActive,
      investmentFocus,
    },
    select: { id: true },
  });
  return { id: created.id };
}
