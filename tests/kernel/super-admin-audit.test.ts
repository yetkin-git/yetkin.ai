import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  SUPER_ADMIN_AUDIT_ACTIONS,
  planRoomFlagAudit,
  planSuperAdminAuditInsert,
} from "@/lib/kernel/admin/audit-log";

const ENV_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("süper yönetici günlüğü", () => {
  it("yalnız ortam UUID’si eşleşince satır planlar", () => {
    expect(
      planSuperAdminAuditInsert(
        {
          actorUserId: ENV_ID,
          action: "catalog_publish",
          target: "ai-temel",
          detail: "Yayında. gerekçe yeter",
        },
        ENV_ID,
      ),
    ).toEqual({
      actorUserId: ENV_ID,
      action: "catalog_publish",
      target: "ai-temel",
      detail: "Yayında. gerekçe yeter",
    });
    expect(
      planSuperAdminAuditInsert(
        {
          actorUserId: OTHER_ID,
          action: "manual_refund",
          target: OTHER_ID,
          detail: "refundedMinor=0",
        },
        ENV_ID,
      ),
    ).toBeNull();
    expect(
      planSuperAdminAuditInsert(
        {
          actorUserId: ENV_ID,
          action: "license_grant",
          target: "user:course",
          detail: "ai-temel",
        },
        "not-a-uuid",
      ),
    ).toBeNull();
    expect(
      planRoomFlagAudit({ actorUserId: ENV_ID, roomId: "ornek-kapali", open: false }, ENV_ID),
    ).toMatchObject({ action: "room_flag", target: "ornek-kapali", detail: "closed" });
  });

  it("tablo append-only ve eylem listesi SQL ile aynıdır", () => {
    const sql = [
      read("prisma/migrations/20261102160000_super_admin_audit_log/migration.sql"),
      read("prisma/migrations/20261104121000_super_admin_audit_certificate_and_price/migration.sql"),
    ].join("\n");
    for (const action of SUPER_ADMIN_AUDIT_ACTIONS) {
      expect(sql).toContain(`'${action}'`);
    }
    expect(sql).toContain("BEFORE UPDATE OR DELETE");
    expect(sql).toContain("super_admin_audit_logs is append-only");
    expect(sql).not.toContain("CREATE TYPE");

    const schema = read("prisma/schema/kernel.prisma");
    const model = schema.slice(schema.indexOf("model SuperAdminAuditLog"));
    const body = model.slice(0, model.indexOf("model CheckoutPriceLock"));
    expect(body).toContain('@@map("super_admin_audit_logs")');
    expect(body).not.toContain("updatedAt");
    expect(body).not.toContain("role");

    const writer = read("lib/kernel/admin/audit-log.ts");
    expect(writer).not.toContain(".update(");
    expect(writer).not.toContain(".delete(");
    expect(read("lib/kernel/admin/prisma-course-publish.ts")).toContain('action: "catalog_publish"');
    expect(read("lib/kernel/admin/prisma-catalog-write.ts")).toContain('action: "catalog_price"');
    expect(read("app/api/(kernel)/admin/ops/certificate-revoke/route.ts")).toContain(
      'action: "certificate_revoke"',
    );
    expect(read("lib/kernel/payments/prisma-wallet-card-refund.ts")).toContain('action: "manual_refund"');
    expect(read("scripts/ops-super-admin-academy-grant-lib.ts")).toContain('action: "license_grant"');
    expect(read("lib/academy/prisma-store.ts")).toContain('action: "license_grant"');
    expect(read("lib/kernel/admin/room-flag-audit.ts")).toContain('action: "room_flag"');
    expect(read("scripts/ops-super-admin-room-flag-lib.ts")).toContain("appendRoomFlagAudit");
    expect(read("lib/kernel/auth/super-admin.ts")).toContain("SUPER_ADMIN_USER_ID");
  });
});
