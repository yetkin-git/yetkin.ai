import { revokeAcademyCertificate } from "@/lib/academy/certificate-lifecycle";
import { bindAcademyStore } from "@/lib/academy/prisma-store";
import { parseOpsRevokeBody } from "@/lib/kernel/admin/ops-desk";
import { SUPER_ADMIN_AUDIT_SEAL_MISSED, writeSuperAdminAudit } from "@/lib/kernel/admin/audit-log";
import { bindSuperAdminAuditWriter } from "@/lib/kernel/admin/prisma-super-admin-audit";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { getPrisma } from "@/lib/kernel/db";
import { ConflictError } from "@/lib/kernel/http/errors";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "admin" as const;

export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    const parsed = parseOpsRevokeBody(body);
    if ("error" in parsed) {
      return jsonFail(parsed.error, 400, undefined, request);
    }
    const prisma = getPrisma();
    const applied = await prisma.$transaction(async (tx) => {
      const result = await revokeAcademyCertificate(bindAcademyStore(tx), {
        hash: parsed.hash,
        reason: parsed.reason,
      });
      if (!result.applied) {
        throw new ConflictError("Sertifika zaten iptal.");
      }
      const sealed = await writeSuperAdminAudit(bindSuperAdminAuditWriter(tx), {
        actorUserId: session.id,
        action: "certificate_revoke",
        target: parsed.hash,
        detail: parsed.reason,
      });
      if (!sealed) {
        throw new ConflictError(SUPER_ADMIN_AUDIT_SEAL_MISSED);
      }
      return true;
    });
    return jsonOk({ applied }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
