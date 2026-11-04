import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT } from "@/lib/kernel/auth/super-admin";
import { decideEdgeApiAuth, isFrozenRoomApi } from "@/lib/kernel/security/edge-api-auth";
import {
  canEnterJunior,
  JUNIOR_CHECKOUT_LOCKED_ERROR,
  type JuniorActor,
} from "@/lib/kernel/security/junior-gate";
import {
  completeJuniorCheckout,
  JUNIOR_CHECKOUT_AUDIT_MESSAGE,
  JUNIOR_CHECKOUT_CLOSED_MESSAGE,
} from "@/lib/junior/checkout";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import { juniorLockedResponse } from "@/lib/junior/surface-lock";

const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const PARENT_ID = "22222222-2222-4222-8222-222222222222";
const BETA_ID = "33333333-3333-4333-8333-333333333333";
const BETA_EMAIL = "beta.veli@ornek.com";

const ADMIN = {
  id: ADMIN_ID,
  email: CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT,
  emailConfirmedAt: "2026-01-01T00:00:00.000Z",
} satisfies JuniorActor;

const PARENT = {
  id: PARENT_ID,
  email: "veli@ornek.com",
  emailConfirmedAt: "2026-01-01T00:00:00.000Z",
} satisfies JuniorActor;

const BETA = {
  id: BETA_ID,
  email: BETA_EMAIL,
  emailConfirmedAt: "2026-02-01T00:00:00.000Z",
} satisfies JuniorActor;

const LOCKED_ENV = {
  NODE_ENV: "test",
  JUNIOR_CHECKOUT_OPEN: "",
  JUNIOR_BETA_ALLOWLIST: BETA_EMAIL,
} as NodeJS.ProcessEnv;

const OPEN_ENV = {
  JUNIOR_CHECKOUT_OPEN: "1",
  JUNIOR_BETA_ALLOWLIST: BETA_EMAIL,
  NODE_ENV: "test",
  PAYTR_MERCHANT_ID: "111111",
  PAYTR_MERCHANT_KEY: "iframe-key",
  PAYTR_MERCHANT_SALT: "iframe-salt",
  PAYTR_SANDBOX: "1",
} as NodeJS.ProcessEnv;

const CHECKOUT_KEYS = ["JUNIOR_CHECKOUT_OPEN", "JUNIOR_BETA_ALLOWLIST"] as const;

function restoreEnv(previous: Record<string, string | undefined>) {
  for (const key of CHECKOUT_KEYS) {
    const value = previous[key];
    if (value == null) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function snapshotEnv(): Record<string, string | undefined> {
  return {
    JUNIOR_CHECKOUT_OPEN: process.env.JUNIOR_CHECKOUT_OPEN,
    JUNIOR_BETA_ALLOWLIST: process.env.JUNIOR_BETA_ALLOWLIST,
  };
}

describe("Junior kasa kilit sırası", () => {
  const previous = snapshotEnv();

  afterEach(() => {
    restoreEnv(previous);
  });

  it("kaynakta kilit, kapıda ve para katmanında denetim reddinden önce okunur", () => {
    const gate = readFileSync(join(process.cwd(), "lib/kernel/security/junior-gate.ts"), "utf8");
    const checkoutStart = gate.indexOf('if (intent === "checkout")');
    const profileStart = gate.indexOf('if (intent === "profile")');
    const branch = gate.slice(checkoutStart, profileStart);
    const lockAt = branch.indexOf("isJuniorCheckoutLocked(env)");
    const auditAt = branch.indexOf("isJuniorAuditActor(actor, env)");
    expect(lockAt).toBeGreaterThanOrEqual(0);
    expect(auditAt).toBeGreaterThan(lockAt);

    const money = readFileSync(join(process.cwd(), "lib/junior/checkout.ts"), "utf8");
    const fn = money.slice(money.indexOf("export async function completeJuniorCheckout"));
    const saleAt = fn.indexOf("juniorPaytrSaleGate");
    const closedAt = fn.indexOf('gate === "closed"');
    const auditMoney = fn.indexOf("isJuniorAuditActor");
    expect(saleAt).toBeGreaterThanOrEqual(0);
    expect(closedAt).toBeGreaterThan(saleAt);
    expect(auditMoney).toBeGreaterThan(closedAt);

    const doctrine = readFileSync(join(process.cwd(), ".system_docs/ANAYASA.md"), "utf8");
    expect(doctrine).toContain("Kapalı kasayı denetim hesabı ve izin listesi açamaz");
    expect(doctrine).toContain("isJuniorCheckoutLocked` denetim kısayolundan önce okunur");
  });

  it("kapalı kasada süper yönetici ve izin listesi checkout açamaz; kilitli dersi izler", () => {
    for (const actor of [ADMIN, BETA]) {
      expect(canEnterJunior(actor, null, { intent: "checkout" }, LOCKED_ENV)).toEqual({
        allow: false,
        reason: "money",
      });
      expect(
        canEnterJunior(actor, "jr_06_mat-2", { intent: "lesson", lessonAccess: "locked" }, LOCKED_ENV),
      ).toEqual({ allow: true, via: "audit" });
    }
    expect(canEnterJunior(PARENT, null, { intent: "checkout" }, LOCKED_ENV)).toEqual({
      allow: false,
      reason: "money",
    });
    expect(canEnterJunior(ADMIN, null, { intent: "profile" }, LOCKED_ENV)).toEqual({
      allow: true,
      via: "audit",
    });
  });

  it("açık kasada kapı denetimi geçirir; veli beta ile girer", () => {
    expect(canEnterJunior(ADMIN, null, { intent: "checkout" }, OPEN_ENV)).toEqual({
      allow: true,
      via: "audit",
    });
    expect(canEnterJunior(BETA, null, { intent: "checkout" }, OPEN_ENV)).toEqual({
      allow: true,
      via: "audit",
    });
    expect(canEnterJunior(PARENT, null, { intent: "checkout" }, OPEN_ENV)).toEqual({
      allow: true,
      via: "beta",
    });
    expect(canEnterJunior(null, null, { intent: "checkout" }, OPEN_ENV)).toEqual({
      allow: false,
      reason: "money",
    });
  });

  it("kapalı kasada para katmanı denetimden önce 503 döner ve sipariş kurmaz", async () => {
    const store = createMemoryJuniorStore();
    let placed = false;
    const paid = await completeJuniorCheckout(store, ADMIN_ID, {}, new Date("2026-11-02T18:00:00.000Z"), {
      env: LOCKED_ENV,
      email: ADMIN.email ?? undefined,
      userIp: "127.0.0.1",
      idempotencyKey: "lock-order-closed",
      actor: ADMIN,
      ports: {
        readPrice: async () => ({ amountMinor: 120_000 }),
        placeOrder: async () => {
          placed = true;
          return { ok: false, status: 503, error: "olmamalı" };
        },
      },
    });
    expect(placed).toBe(false);
    expect(paid).toEqual({ ok: false, status: 503, error: JUNIOR_CHECKOUT_CLOSED_MESSAGE });
    expect(await store.getSubscription(ADMIN_ID)).toBeNull();
  });

  it("açık kasada izin listesi nakit satırı yazmaz", async () => {
    const store = createMemoryJuniorStore();
    let placed = false;
    const paid = await completeJuniorCheckout(store, BETA_ID, {}, new Date("2026-11-02T18:00:00.000Z"), {
      env: OPEN_ENV,
      email: BETA.email ?? undefined,
      userIp: "127.0.0.1",
      idempotencyKey: "lock-order-allowlist",
      actor: BETA,
      ports: {
        readPrice: async () => ({ amountMinor: 120_000 }),
        placeOrder: async () => {
          placed = true;
          return { ok: false, status: 503, error: "olmamalı" };
        },
      },
    });
    expect(placed).toBe(false);
    expect(paid).toEqual({ ok: false, status: 403, error: JUNIOR_CHECKOUT_AUDIT_MESSAGE });
    expect(await store.getSubscription(BETA_ID)).toBeNull();
  });

  it("kenar kapalı kasada denetim checkout isteğini 410 ile keser; açık kasada handler'a bırakır", async () => {
    process.env.JUNIOR_CHECKOUT_OPEN = "";
    process.env.JUNIOR_BETA_ALLOWLIST = BETA_EMAIL;
    expect(isFrozenRoomApi("/api/junior-pilot/checkout", ADMIN)).toBe(true);
    expect(isFrozenRoomApi("/api/junior-pilot/checkout", BETA)).toBe(true);
    expect(
      decideEdgeApiAuth({
        pathname: "/api/junior-pilot/checkout",
        method: "POST",
        sessionHint: true,
        sessionUserId: ADMIN.id,
        sessionEmail: ADMIN.email,
        sessionEmailConfirmedAt: ADMIN.emailConfirmedAt,
      }),
    ).toEqual({ kind: "deny", status: 410, error: JUNIOR_CHECKOUT_LOCKED_ERROR });

    const request = new Request("https://yetkin.ai/api/junior-pilot/checkout", { method: "POST" });
    const denied = juniorLockedResponse("r-lock", request, ADMIN, "checkout");
    expect(denied?.status).toBe(503);
    expect(await denied?.json()).toMatchObject({ ok: false, error: JUNIOR_CHECKOUT_LOCKED_ERROR });

    process.env.JUNIOR_CHECKOUT_OPEN = "1";
    expect(isFrozenRoomApi("/api/junior-pilot/checkout", ADMIN)).toBe(false);
    expect(
      decideEdgeApiAuth({
        pathname: "/api/junior-pilot/checkout",
        method: "POST",
        sessionHint: true,
        sessionUserId: ADMIN.id,
        sessionEmail: ADMIN.email,
        sessionEmailConfirmedAt: ADMIN.emailConfirmedAt,
      }),
    ).toEqual({ kind: "next" });
    expect(juniorLockedResponse("r-open", request, ADMIN, "checkout")).toBeNull();
  });
});
