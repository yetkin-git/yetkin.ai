import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { SuperAdminAuditWriter } from "@/lib/kernel/admin/audit-log";

type AuditDb = Pick<PrismaClient, "superAdminAuditLog">;

/** Tek Prisma yazıcı — append-only `super_admin_audit_logs`. */
export function bindSuperAdminAuditWriter(db: AuditDb): SuperAdminAuditWriter {
  return {
    create: (data) =>
      db.superAdminAuditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: data.action,
          target: data.target,
          detail: data.detail,
        },
      }),
  };
}
