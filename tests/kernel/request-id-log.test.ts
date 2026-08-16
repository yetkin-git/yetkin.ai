import { describe, expect, it, vi } from "vitest";
import { isRequestId, resolveRequestId } from "@/lib/kernel/http/request-id";
import { buildStructuredLogLine, logEvent } from "@/lib/kernel/observability/log";

describe("requestId ve structured log", () => {
  it("yalnız UUID x-request-id kabul eder", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(isRequestId(uuid)).toBe(true);
    expect(isRequestId("not-a-uuid")).toBe(false);
    expect(isRequestId("email@x.com; DROP")).toBe(false);

    const accepted = resolveRequestId(
      new Request("http://localhost/api/health", { headers: { "x-request-id": uuid } }),
    );
    expect(accepted).toBe(uuid);

    const generated = resolveRequestId(
      new Request("http://localhost/api/health", { headers: { "x-request-id": "not-a-uuid" } }),
    );
    expect(isRequestId(generated)).toBe(true);
    expect(generated).not.toBe("not-a-uuid");
  });

  it("log satırı JSON ve e-posta anahtarı yazmaz", () => {
    const line = buildStructuredLogLine(
      {
        level: "info",
        event: "wallet.top_up.pending",
        requestId: "550e8400-e29b-41d4-a716-446655440000",
        userId: "user-1",
        amountMinor: 1000,
        merchantOid: "oid-1",
      },
      new Date("2026-08-15T12:00:00.000Z"),
    );
    const parsed = JSON.parse(line) as Record<string, unknown>;
    expect(parsed.event).toBe("wallet.top_up.pending");
    expect(parsed.amountMinor).toBe(1000);
    expect(parsed).not.toHaveProperty("email");
    expect(parsed).not.toHaveProperty("dataBase64");
    expect(line).not.toContain("@");

    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    logEvent({ level: "info", event: "health.probe", db: "ok" });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
