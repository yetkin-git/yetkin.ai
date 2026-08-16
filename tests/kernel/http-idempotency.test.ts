import { describe, expect, it } from "vitest";
import {
  hashIdempotencyPayload,
  isStartedIdempotencyExpired,
  settleHttpIdempotency,
} from "@/lib/kernel/http/idempotency";
import {
  createClientIdempotencyKey,
  isIdempotencyKey,
  readIdempotencyKey,
} from "@/lib/kernel/http/idempotency-key";
import { createMemoryHttpIdempotencyStore } from "@/lib/kernel/http/memory-idempotency-store";
import {
  buildIdempotentMerchantOid,
  buildMerchantOid,
} from "@/lib/kernel/payments/merchant-oid";
import { decideWalletTopUpReuse } from "@/lib/kernel/payments/wallet-top-up";

describe("HTTP Idempotency-Key", () => {
  it("yalnız UUID kabul eder", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(isIdempotencyKey(uuid)).toBe(true);
    expect(isIdempotencyKey(createClientIdempotencyKey())).toBe(true);
    expect(isIdempotencyKey("not-a-uuid")).toBe(false);
    expect(readIdempotencyKey(new Request("http://localhost/api/wallet/top-up")).ok).toBe(false);
    const ok = readIdempotencyKey(
      new Request("http://localhost/api/wallet/top-up", {
        headers: { "Idempotency-Key": uuid },
      }),
    );
    expect(ok).toEqual({ ok: true, key: uuid });
  });

  it("aynı anahtar ikinci kez execute etmez; farklı gövde 409", async () => {
    const store = createMemoryHttpIdempotencyStore();
    let runs = 0;
    const input = {
      store,
      userId: "user-1",
      route: "/api/wallet/top-up",
      key: "550e8400-e29b-41d4-a716-446655440000",
      requestHash: hashIdempotencyPayload({ amountMinor: 1000 }),
      requestId: "550e8400-e29b-41d4-a716-446655440000",
    };
    const first = await settleHttpIdempotency(input, async () => {
      runs += 1;
      return { status: 200, body: { merchantOid: "wallet-top-up-abc" } };
    });
    const second = await settleHttpIdempotency(input, async () => {
      runs += 1;
      return { status: 200, body: { merchantOid: "should-not-run" } };
    });
    expect(runs).toBe(1);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    const firstJson = (await first.json()) as { merchantOid?: string };
    const secondJson = (await second.json()) as { merchantOid?: string };
    expect(firstJson.merchantOid).toBe("wallet-top-up-abc");
    expect(secondJson.merchantOid).toBe("wallet-top-up-abc");

    const conflict = await settleHttpIdempotency(
      { ...input, requestHash: hashIdempotencyPayload({ amountMinor: 2000 }) },
      async () => {
        runs += 1;
        return { status: 200, body: { merchantOid: "nope" } };
      },
    );
    expect(conflict.status).toBe(409);
    expect(runs).toBe(1);
  });

  it("5xx abandon sonrası aynı anahtar yeniden dener", async () => {
    const store = createMemoryHttpIdempotencyStore();
    const input = {
      store,
      userId: "user-1",
      route: "/api/wallet/top-up",
      key: "550e8400-e29b-41d4-a716-446655440000",
      requestHash: hashIdempotencyPayload({ amountMinor: 1000 }),
      requestId: "550e8400-e29b-41d4-a716-446655440000",
    };
    const failed = await settleHttpIdempotency(input, async () => ({
      status: 503,
      body: { error: "PayTR yok." },
    }));
    expect(failed.status).toBe(503);
    const retry = await settleHttpIdempotency(input, async () => ({
      status: 200,
      body: { iframeUrl: "https://www.paytr.com/odeme/guvenli/token" },
    }));
    expect(retry.status).toBe(200);
  });

  it("started TTL dolunca slot çalınır", () => {
    const createdAt = new Date("2026-08-15T12:00:00.000Z");
    expect(
      isStartedIdempotencyExpired(createdAt, new Date("2026-08-15T12:00:29.000Z")),
    ).toBe(false);
    expect(
      isStartedIdempotencyExpired(createdAt, new Date("2026-08-15T12:00:30.000Z")),
    ).toBe(true);
  });
});

describe("cüzdan yükleme oid mühürü", () => {
  it("Idempotency-Key aynı oid'i üretir; Date.now damgası yoktur", () => {
    const key = "550e8400-e29b-41d4-a716-446655440000";
    const first = buildIdempotentMerchantOid("walletTopUp", "user-1", key);
    const second = buildIdempotentMerchantOid("walletTopUp", "user-1", key);
    expect(first).toBe(second);
    expect(first).toMatch(/^wallettopup[0-9a-f]{24}$/);
    const other = buildIdempotentMerchantOid("walletTopUp", "user-1", createClientIdempotencyKey());
    expect(other).not.toBe(first);
    const stamped = buildMerchantOid("walletTopUp", "user-1");
    expect(stamped.startsWith("wallettopup")).toBe(true);
    expect(stamped).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it("aynı anahtarla ikinci PENDING doğmaz; FAILED oid çatışır", () => {
    expect(decideWalletTopUpReuse(null, "u1", 1000)).toEqual({ action: "create" });
    expect(
      decideWalletTopUpReuse(
        { userId: "u1", amountMinor: 1000, status: "PENDING" },
        "u1",
        1000,
      ),
    ).toEqual({ action: "reuse", retryCheckout: true });
    expect(
      decideWalletTopUpReuse(
        { userId: "u1", amountMinor: 1000, status: "CLEARED" },
        "u1",
        1000,
      ),
    ).toEqual({ action: "reuse", retryCheckout: false });
    expect(
      decideWalletTopUpReuse(
        { userId: "u1", amountMinor: 1000, status: "PENDING" },
        "u1",
        2000,
      ).action,
    ).toBe("conflict");
    expect(
      decideWalletTopUpReuse(
        { userId: "u1", amountMinor: 1000, status: "FAILED" },
        "u1",
        1000,
      ).action,
    ).toBe("conflict");
  });
});
