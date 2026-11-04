import { describe, expect, it, vi } from "vitest";
import { CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT } from "@/lib/kernel/auth/super-admin";
import {
  planSuperAdminAuditInsert,
  writeSuperAdminAudit,
  type SuperAdminAuditWriter,
} from "@/lib/kernel/admin/audit-log";
import {
  completeJuniorCheckout,
  JUNIOR_CHECKOUT_AUDIT_MESSAGE,
} from "@/lib/junior/checkout";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import { isJuniorAuditActor, type JuniorActor } from "@/lib/kernel/security/junior-gate";

const SUPER_ADMIN_USER_ID = "11111111-1111-4111-8111-111111111111";
const CITIZEN_USER_ID = "22222222-2222-4222-8222-222222222222";

const OPEN_CHECKOUT_ENV = {
  JUNIOR_CHECKOUT_OPEN: "1",
  NODE_ENV: "test",
  PAYTR_MERCHANT_ID: "111111",
  PAYTR_MERCHANT_KEY: "iframe-key",
  PAYTR_MERCHANT_SALT: "iframe-salt",
  PAYTR_SANDBOX: "1",
} as NodeJS.ProcessEnv;

describe("faz 1 karakterizasyon", () => {
  it("aktör SUPER_ADMIN_USER_ID ile eşleşmezse plan null, yazım false döner", async () => {
    const input = {
      actorUserId: CITIZEN_USER_ID,
      action: "manual_refund" as const,
      target: CITIZEN_USER_ID,
      detail: "refundedMinor=2500",
    };
    expect(planSuperAdminAuditInsert(input, SUPER_ADMIN_USER_ID)).toBeNull();

    const create = vi.fn(async () => undefined);
    const writer: SuperAdminAuditWriter = { create };
    await expect(writeSuperAdminAudit(writer, input, SUPER_ADMIN_USER_ID)).resolves.toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("denetim aktörü ödeme istediğinde kasa 403 ve denetim iletisini döner", async () => {
    const actor = {
      id: SUPER_ADMIN_USER_ID,
      email: CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT,
      emailConfirmedAt: "2026-01-01T00:00:00.000Z",
    } satisfies JuniorActor;
    expect(isJuniorAuditActor(actor, OPEN_CHECKOUT_ENV)).toBe(true);

    const store = createMemoryJuniorStore();
    let placed = false;
    const paid = await completeJuniorCheckout(store, SUPER_ADMIN_USER_ID, {}, new Date("2026-11-02T18:00:00.000Z"), {
      env: OPEN_CHECKOUT_ENV,
      email: actor.email ?? undefined,
      userIp: "127.0.0.1",
      idempotencyKey: "faz1-audit-checkout",
      actor,
      ports: {
        readPrice: async () => ({ amountMinor: 549_900 }),
        placeOrder: async () => {
          placed = true;
          return { ok: false, status: 503, error: "olmamalı" };
        },
      },
    });

    expect(placed).toBe(false);
    expect(paid).toEqual({ ok: false, status: 403, error: JUNIOR_CHECKOUT_AUDIT_MESSAGE });
    expect(await store.getSubscription(SUPER_ADMIN_USER_ID)).toBeNull();
  });
});
