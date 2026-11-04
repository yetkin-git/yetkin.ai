import { isZeroFeeAcademyGrantOpen, createAcademyGrantPurchase } from "@/lib/academy/access";
import { isAcademyGrantPurchase } from "@/lib/academy/enrolment";
import { OPS_GRANT_CLOSED, parseOpsGrantBody } from "@/lib/kernel/admin/ops-desk";
import { SUPER_ADMIN_AUDIT_SEAL_MISSED, writeSuperAdminAudit } from "@/lib/kernel/admin/audit-log";
import { bindSuperAdminAuditWriter } from "@/lib/kernel/admin/prisma-super-admin-audit";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { getPrisma } from "@/lib/kernel/db";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk, jsonFail } from "@/lib/kernel/http/json";

export const auth = "admin" as const;

export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    const parsed = parseOpsGrantBody(body);
    if ("error" in parsed) {
      return jsonFail(parsed.error, 400, undefined, request);
    }
    if (!isZeroFeeAcademyGrantOpen()) {
      throw new ForbiddenError(OPS_GRANT_CLOSED);
    }
    const prisma = getPrisma();
    const slug = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: parsed.userId },
        select: { id: true },
      });
      if (!user) {
        throw new NotFoundError("Kullanıcı yok.");
      }
      const course = await tx.academyCourse.findUnique({
        where: { slug: parsed.slug },
        select: { id: true, slug: true },
      });
      if (!course) {
        throw new NotFoundError("Kurs yok.");
      }
      const existing = await tx.academyPurchase.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: course.id } },
      });
      if (existing) {
        throw new ConflictError(
          isAcademyGrantPurchase(existing)
            ? "Bağış zaten duruyor."
            : "Ticari lisansın üstüne bağış yazılmaz.",
        );
      }
      const purchase = createAcademyGrantPurchase(user.id, course.id);
      await tx.academyPurchase.create({
        data: {
          id: purchase.id,
          userId: purchase.userId,
          courseId: purchase.courseId,
          priceLockId: purchase.priceLockId,
          amountMinor: purchase.amountMinor,
          currencyCode: purchase.currencyCode,
          status: purchase.status,
          settledAt: purchase.settledAt,
          createdAt: purchase.createdAt,
          updatedAt: purchase.updatedAt,
        },
      });
      const sealed = await writeSuperAdminAudit(bindSuperAdminAuditWriter(tx), {
        actorUserId: session.id,
        action: "license_grant",
        target: `${user.id}:${course.id}`,
        detail: `${course.slug} · ${parsed.reason}`,
      });
      if (!sealed) {
        throw new ConflictError(SUPER_ADMIN_AUDIT_SEAL_MISSED);
      }
      return course.slug;
    });
    return jsonOk({ applied: true, slug }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
