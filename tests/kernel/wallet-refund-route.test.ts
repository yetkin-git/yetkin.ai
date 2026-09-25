import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError } from "@/lib/kernel/http/errors";
import { WALLET_REFUND_PATH } from "@/lib/kernel/identity/types";
import { WALLET_REFUND_NONE } from "@/lib/kernel/payments/wallet-card-refund";

vi.mock("@/lib/kernel/auth/session", () => ({
  requireSession: vi.fn(async () => ({ id: "user-1", email: "a@yetkin.test" })),
}));

vi.mock("@/lib/kernel/security/http-rate-limit", async () => {
  const actual = await vi.importActual<typeof import("@/lib/kernel/security/http-rate-limit")>(
    "@/lib/kernel/security/http-rate-limit",
  );
  return {
    ...actual,
    applyHttpRateLimit: vi.fn(async () => ({ allowed: true, remaining: 1, retryAfterMs: 0 })),
  };
});

vi.mock("@/lib/kernel/http/prisma-idempotency-store", () => ({
  createPrismaHttpIdempotencyStore: () => ({
    begin: async () => ({ kind: "bypassed" as const }),
    complete: async () => undefined,
    abandon: async () => undefined,
  }),
}));

const refundUnusedWalletBalanceForUser = vi.fn();

vi.mock("@/lib/kernel/payments/prisma-wallet-card-refund", () => ({
  refundUnusedWalletBalanceForUser: (...args: unknown[]) => refundUnusedWalletBalanceForUser(...args),
}));

const IDEMPOTENCY_KEY = "550e8400-e29b-41d4-a716-446655440000";

function refundRequest(): Request {
  return new Request(`http://localhost${WALLET_REFUND_PATH}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Idempotency-Key": IDEMPOTENCY_KEY,
    },
    body: JSON.stringify({ intent: "wallet-card-refund" }),
  });
}

describe("POST /api/wallet/refund", () => {
  beforeEach(() => {
    refundUnusedWalletBalanceForUser.mockReset();
  });

  it("iade tamamlanınca 200 döner, 404 dönmez", async () => {
    refundUnusedWalletBalanceForUser.mockResolvedValue({
      refundedMinor: 2500,
      requestedMinor: 2500,
      balanceMinor: 0,
    });
    const { POST } = await import("@/app/api/(kernel)/wallet/refund/route");
    const response = await POST(refundRequest());
    expect(response.status).toBe(200);
    expect(response.status).not.toBe(404);
    const body = (await response.json()) as { ok: boolean; data: { refund: { refundedMinor: number } } };
    expect(body.ok).toBe(true);
    expect(body.data.refund.refundedMinor).toBe(2500);
  });

  it("iade edilecek bakiye yoksa 409 döner, 404 dönmez", async () => {
    refundUnusedWalletBalanceForUser.mockRejectedValue(new ConflictError(WALLET_REFUND_NONE));
    const { POST } = await import("@/app/api/(kernel)/wallet/refund/route");
    const response = await POST(refundRequest());
    expect(response.status).toBe(409);
    expect(response.status).not.toBe(404);
    const body = (await response.json()) as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error).toBe(WALLET_REFUND_NONE);
  });

  it("tablo yoksa ham 500 yerine JSON döner", async () => {
    refundUnusedWalletBalanceForUser.mockRejectedValue(
      new Error('relation "wallet_card_refunds" does not exist (42P01)'),
    );
    const { POST } = await import("@/app/api/(kernel)/wallet/refund/route");
    const response = await POST(refundRequest());
    expect(response.status).toBe(503);
    const body = (await response.json()) as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error).toBe("İade kaydı henüz hazır değil.");
  });

  it("beklenmeyen hata JSON zarfı döner", async () => {
    refundUnusedWalletBalanceForUser.mockRejectedValue(new Error("boom"));
    const { POST } = await import("@/app/api/(kernel)/wallet/refund/route");
    const response = await POST(refundRequest());
    expect(response.status).toBe(500);
    const body = (await response.json()) as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error.length).toBeGreaterThan(0);
  });
});
