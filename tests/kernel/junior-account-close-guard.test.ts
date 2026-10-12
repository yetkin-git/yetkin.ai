import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPrisma } from "@/lib/kernel/db";
import { ConflictError } from "@/lib/kernel/http/errors";
import { closeCitizenAccount } from "@/lib/kernel/identity/close-account";
import {
  registerAccountCloseGuard,
  runAccountCloseGuards,
} from "@/lib/kernel/identity/close-account-gate";
import {
  assertJuniorAccountCloseable,
  JUNIOR_ACCOUNT_CLOSE_PAYMENT_BLOCK,
  JUNIOR_ACCOUNT_CLOSE_PLAN_BLOCK,
  JUNIOR_ACCOUNT_CLOSE_PROFILE_BLOCK,
  readJuniorAccountCloseState,
} from "@/lib/junior/account-close-guard";
import { JUNIOR_LICENSE_ORDER_PURPOSE } from "@/lib/junior/paytr-license-bridge";

vi.mock("@/lib/kernel/ledger/wallet-read", () => ({
  readSettlementWallet: vi.fn(async () => null),
}));

vi.mock("@/lib/kernel/db", () => ({
  getPrisma: vi.fn(() => {
    throw new Error("DB_REACHED");
  }),
}));

const ROOT = process.cwd();
const USER = "11111111-1111-4111-8111-111111111111";

type Counts = { plan: number; profiles: number; payments: number };

/** Yalnız okuyan sahte istemci: SQL metnine göre sayı döner ve her çağrıyı kaydeder. */
function fakeCloseDb(counts: Counts) {
  const seen: { sql: string; values: unknown[] }[] = [];
  return {
    seen,
    async $queryRaw<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T> {
      const sql = strings.join("?");
      seen.push({ sql, values });
      const n = sql.includes("junior_subscriptions")
        ? counts.plan
        : sql.includes("junior_profiles")
          ? counts.profiles
          : counts.payments;
      return [{ n }] as unknown as T;
    },
  };
}

describe("Junior hesap kapanış kapısı (T-02)", () => {
  beforeEach(() => {
    vi.mocked(getPrisma).mockClear();
  });

  it("aktif paket, açık çocuk profili veya bekleyen ödeme varken kapanış reddedilir", () => {
    expect(() =>
      assertJuniorAccountCloseable({ activePlan: false, openChildProfiles: 0, paymentInFlight: false }),
    ).not.toThrow();

    expect(() =>
      assertJuniorAccountCloseable({ activePlan: true, openChildProfiles: 0, paymentInFlight: false }),
    ).toThrow(JUNIOR_ACCOUNT_CLOSE_PLAN_BLOCK);
    expect(() =>
      assertJuniorAccountCloseable({ activePlan: false, openChildProfiles: 1, paymentInFlight: false }),
    ).toThrow(JUNIOR_ACCOUNT_CLOSE_PROFILE_BLOCK);
    expect(() =>
      assertJuniorAccountCloseable({ activePlan: false, openChildProfiles: 0, paymentInFlight: true }),
    ).toThrow(JUNIOR_ACCOUNT_CLOSE_PAYMENT_BLOCK);

    try {
      assertJuniorAccountCloseable({ activePlan: true, openChildProfiles: 0, paymentInFlight: false });
      throw new Error("beklenmeyen geçiş");
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictError);
    }
  });

  it("sayılar durum olarak okunur; her sorgu yalnız bu kullanıcıya ve Junior lisans amacına bakar", async () => {
    const db = fakeCloseDb({ plan: 1, profiles: 2, payments: 0 });
    const state = await readJuniorAccountCloseState(USER, db);

    expect(state).toEqual({ activePlan: true, openChildProfiles: 2, paymentInFlight: false });
    expect(db.seen).toHaveLength(3);
    expect(db.seen.every((row) => row.values[0] === USER)).toBe(true);

    const paymentCall = db.seen.find((row) => row.sql.includes("payment_orders"));
    expect(paymentCall?.values).toEqual([USER, JUNIOR_LICENSE_ORDER_PURPOSE]);
    expect(paymentCall?.sql).toContain("INTERVAL '1 day'");
    expect(paymentCall?.sql).toContain("'PAID'");
  });

  it("bekleyen veya tahsil edilmiş lisans siparişi varsa paymentInFlight true olur", async () => {
    const state = await readJuniorAccountCloseState(USER, fakeCloseDb({ plan: 0, profiles: 0, payments: 1 }));
    expect(state).toEqual({ activePlan: false, openChildProfiles: 0, paymentInFlight: true });
  });

  it("kapanış kapı kararını silme sorgularından önce verir (kaynak sırası)", () => {
    const src = readFileSync(join(ROOT, "lib/kernel/identity/close-account.ts"), "utf8");
    const guardAt = src.indexOf("await runAccountCloseGuards(userId);");
    expect(guardAt).toBeGreaterThan(0);
    expect(guardAt).toBeLessThan(src.indexOf("prisma.$transaction("));
    expect(guardAt).toBeLessThan(src.indexOf("DELETE FROM auth.sessions"));
    expect(guardAt).toBeGreaterThan(src.indexOf("assertAccountCloseable(wallet?.amountMinor"));
  });

  it("profil kapatma route'u Junior kapısını kaydeder; kernel Junior modülünü import etmez", () => {
    const route = readFileSync(join(ROOT, "app/api/(kernel)/profile/close/route.ts"), "utf8");
    expect(route).toContain("registerJuniorAccountCloseGuard();");

    const kernelGate = readFileSync(join(ROOT, "lib/kernel/identity/close-account-gate.ts"), "utf8");
    const kernelClose = readFileSync(join(ROOT, "lib/kernel/identity/close-account.ts"), "utf8");
    expect(kernelGate).not.toContain("@/lib/junior");
    expect(kernelClose).not.toContain("@/lib/junior");
  });

  it("kapı reddederse closeCitizenAccount veritabanına hiç dokunmaz", async () => {
    const dispose = registerAccountCloseGuard(async () => {
      throw new ConflictError(JUNIOR_ACCOUNT_CLOSE_PLAN_BLOCK);
    });
    try {
      await expect(closeCitizenAccount(USER)).rejects.toThrow(JUNIOR_ACCOUNT_CLOSE_PLAN_BLOCK);
      expect(getPrisma).not.toHaveBeenCalled();
    } finally {
      dispose();
    }
  });

  it("kapılar geçerse kapanış veritabanı katmanına ulaşır", async () => {
    const dispose = registerAccountCloseGuard(async () => {});
    try {
      await expect(closeCitizenAccount(USER)).rejects.toThrow("DB_REACHED");
      expect(getPrisma).toHaveBeenCalledTimes(1);
    } finally {
      dispose();
    }
  });

  it("kayıt geri alınınca kapı çalışmaz; aynı kapı iki kez kaydedilse de bir kez çalışır", async () => {
    let calls = 0;
    const guard = async () => {
      calls += 1;
    };
    const disposeA = registerAccountCloseGuard(guard);
    const disposeB = registerAccountCloseGuard(guard);
    await runAccountCloseGuards(USER);
    expect(calls).toBe(1);
    disposeA();
    disposeB();
    await runAccountCloseGuards(USER);
    expect(calls).toBe(1);
  });
});
