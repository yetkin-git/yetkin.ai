import "server-only";

import { SUPER_ADMIN_AUDIT_SEAL_MISSED, writeSuperAdminAudit } from "@/lib/kernel/admin/audit-log";
import { bindSuperAdminAuditWriter } from "@/lib/kernel/admin/prisma-super-admin-audit";
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { isSuperAdminActor, type SuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { getPrisma } from "@/lib/kernel/db";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/kernel/http/errors";
import type {
  KurumsalOfferRequestStatusValue,
  KurumsalOfferRow,
} from "@/lib/kernel/admin/kurumsal-offer-parse";

export { parseKurumsalOfferPatchBody } from "@/lib/kernel/admin/kurumsal-offer-parse";

const PACKAGE_LABEL: Record<string, string> = {
  "team-seat": "KOBİ ekip rozeti",
  agency: "E-ticaret ajans paketi",
  "job-screening-pack": "İlan ve aday eleme",
  "iso-auditor": "ISO ve kalite denetçisi (ön talep)",
  "company-brain": "Şirket beyni (ön talep)",
};

export async function patchKurumsalOfferRequest(input: {
  actor: SuperAdminActor;
  id: string;
  status: KurumsalOfferRequestStatusValue;
  adminNote: string;
}): Promise<KurumsalOfferRow> {
  if (!isSupabaseUserId(input.actor.id) || !isSuperAdminActor(input.actor)) {
    throw new ForbiddenError("Süper yönetici gerekli.");
  }
  const id = input.id.trim();
  if (!/^[A-Za-z0-9_-]{8,40}$/u.test(id)) {
    throw new BadRequestError("Talep kimliği geçersiz.");
  }
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const existing = await tx.kurumsalOfferRequest.findUnique({
      where: { id },
      select: { id: true, status: true, packageKey: true },
    });
    if (!existing) {
      throw new NotFoundError("Talep bulunamadı.");
    }
    /**
     * Denetim mührü. F2.4 durum değişikliği B2B gelir hattını etkiler: kim, ne zaman,
     * hangi talebi hangi duruma çektiği `super_admin_audit_logs`'ta iz bırakmalıdır.
     * Mühür yazılamazsa **işlem geri alınır** (fail-closed) — doğrulama rotasıyla
     * aynı sözleşme. Önce yaz, sonra mühürle: mühür düşerse transaction rollback eder.
     */
    const row = await tx.kurumsalOfferRequest.update({
      where: { id },
      data: {
        status: input.status,
        adminNote: input.adminNote,
        handledAt: new Date(),
        handledBy: input.actor.id,
      },
    });
    const sealed = await writeSuperAdminAudit(bindSuperAdminAuditWriter(tx), {
      actorUserId: input.actor.id,
      action: "offer_request_status",
      target: id,
      detail: `${existing.packageKey} · ${existing.status}→${input.status} · ${input.adminNote || "-"}`,
    });
    if (!sealed) {
      throw new ConflictError(SUPER_ADMIN_AUDIT_SEAL_MISSED);
    }
    return {
      id: row.id,
      companyName: row.companyName,
      email: row.email,
      packageKey: row.packageKey,
      packageLabel: PACKAGE_LABEL[row.packageKey] ?? row.packageKey,
      city: row.city,
      note: row.note,
      status: row.status,
      adminNote: row.adminNote,
      quotedAmountMinor: row.quotedAmountMinor,
      handledAt: row.handledAt?.toISOString() ?? null,
      handledBy: row.handledBy,
      createdAt: row.createdAt.toISOString(),
    };
  });
}
