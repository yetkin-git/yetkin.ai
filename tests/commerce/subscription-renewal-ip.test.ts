import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isLoopbackAddress, readOutboundPublicIp, runCommerceSubscriptionRenewalScan } from "@/lib/commerce/subscription-renewal";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  update: vi.fn(),
  userFindUnique: vi.fn(),
  charge: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("@/lib/kernel/db", () => ({
  getPrisma: () => ({
    commerceSubscription: { findMany: mocks.findMany, update: mocks.update },
    user: { findUnique: mocks.userFindUnique },
  }),
}));

vi.mock("@/lib/commerce/paytr-stored-card", () => ({
  chargeStoredPaytrCard: mocks.charge,
}));

vi.mock("@/lib/kernel/observability/log", () => ({
  logEvent: mocks.logEvent,
}));

const ROOT = process.cwd();
const NOW = new Date("2026-11-22T10:00:00Z");
/** Dönem bir saat önce bitti; esneklik penceresi içinde, çekim adayı. */
const ENDED = new Date("2026-11-22T09:00:00Z");

function dueRow(over: Record<string, unknown> = {}) {
  return {
    id: "sub-1",
    storeId: "store-1",
    ownerUserId: "user-1",
    status: "ACTIVE",
    listPriceMinor: 9900,
    expiresAt: ENDED,
    currentPeriodEnd: ENDED,
    trialEndsAt: null,
    cancelAtPeriodEnd: false,
    paytrUtoken: "utok-1",
    paytrCtoken: "ctok-1",
    dunningAttempts: 0,
    lastDunningAt: null,
    ...over,
  };
}

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  mocks.findMany.mockReset().mockResolvedValue([dueRow()]);
  mocks.update.mockReset().mockResolvedValue({});
  mocks.userFindUnique.mockReset().mockResolvedValue({ email: "owner@example.com" });
  mocks.charge.mockReset().mockResolvedValue({ ok: true });
  mocks.logEvent.mockReset();
  // P0.5 operatör alarmı `console.error` üzerinden gider; test çıktısını kirletmeyiz.
  consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  consoleError.mockRestore();
  vi.unstubAllEnvs();
});

describe("abonelik yenileme: çıkış IP'si ve alıcı e-postası", () => {
  it("OUTBOUND_PUBLIC_IP tanımlıysa çekim o IP ve gerçek hesap e-postasıyla gider", async () => {
    vi.stubEnv("OUTBOUND_PUBLIC_IP", " 85.105.141.10 ");
    const result = await runCommerceSubscriptionRenewalScan(NOW);
    expect(mocks.charge).toHaveBeenCalledTimes(1);
    expect(mocks.charge.mock.calls[0]?.[0]).toMatchObject({
      email: "owner@example.com",
      userIp: "85.105.141.10",
      amountMinor: 9900,
      utoken: "utok-1",
      ctoken: "ctok-1",
    });
    expect(result).toEqual({ scanned: 1, charged: 1, pastDue: 0, canceled: 0, blockedConfig: 0 });
    expect(mocks.update.mock.calls[0]?.[0]).toMatchObject({ where: { id: "sub-1" }, data: { status: "ACTIVE" } });
    expect(mocks.logEvent.mock.calls.some((call) => call[0]?.reason === "blocked_config")).toBe(false);
  });

  it("P0.5 — OUTBOUND_PUBLIC_IP yoksa çekim hiç denenmez; blocked_config ve operatör alarmı", async () => {
    vi.stubEnv("OUTBOUND_PUBLIC_IP", "");
    const result = await runCommerceSubscriptionRenewalScan(NOW);
    // Fail-closed: PayTR CAPI hash'i user_ip taşır, 127.0.0.1 ile asla tutmaz.
    expect(mocks.charge).not.toHaveBeenCalled();
    expect(result).toEqual({ scanned: 1, charged: 0, pastDue: 0, canceled: 0, blockedConfig: 1 });
    // Abonelik PAST_DUE'ya düşmez, deneme sayacı artmaz: deneme hakkı yanmaz.
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "error",
        event: "commerce.subscription.renewal",
        reason: "blocked_config",
      }),
    );
    expect(consoleError).toHaveBeenCalled();
  });

  it("P0.5 — 127.0.0.1 yapılandırılmış sayılmaz; çekim yine yapılmaz", async () => {
    vi.stubEnv("OUTBOUND_PUBLIC_IP", "127.0.0.1");
    const result = await runCommerceSubscriptionRenewalScan(NOW);
    expect(mocks.charge).not.toHaveBeenCalled();
    expect(result.blockedConfig).toBe(1);
    expect(result.pastDue).toBe(0);
  });

  it("çıkış IP'si okuyucusu yerel adresleri reddeder", () => {
    const env = (value: string): NodeJS.ProcessEnv => ({ NODE_ENV: "test", OUTBOUND_PUBLIC_IP: value });
    expect(readOutboundPublicIp(env(""))).toEqual({ ok: false, reason: "missing" });
    expect(readOutboundPublicIp(env("127.0.0.1"))).toEqual({ ok: false, reason: "loopback" });
    expect(readOutboundPublicIp(env("127.0.0.2"))).toEqual({ ok: false, reason: "loopback" });
    expect(readOutboundPublicIp(env("127.8.8.8"))).toEqual({ ok: false, reason: "loopback" });
    expect(readOutboundPublicIp(env("localhost"))).toEqual({ ok: false, reason: "loopback" });
    expect(isLoopbackAddress("::ffff:127.0.0.2")).toBe(true);
    expect(readOutboundPublicIp(env("85.105.141.10"))).toEqual({ ok: true, ip: "85.105.141.10" });
  });

  it("hesap e-postası yoksa çekim yapılmaz; sahte adres kullanılmaz, abonelik gecikir", async () => {
    vi.stubEnv("OUTBOUND_PUBLIC_IP", "85.105.141.10");
    mocks.userFindUnique.mockResolvedValue({ email: "   " });
    const result = await runCommerceSubscriptionRenewalScan(NOW);
    expect(mocks.charge).not.toHaveBeenCalled();
    expect(result).toEqual({ scanned: 1, charged: 0, pastDue: 1, canceled: 0, blockedConfig: 0 });
    expect(mocks.update.mock.calls[0]?.[0]).toMatchObject({ data: { status: "PAST_DUE", dunningAttempts: 1 } });
    expect(mocks.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ level: "warn", reason: "owner_email_missing", userId: "user-1", applied: false }),
    );
  });

  it("kullanıcı kaydı hiç yoksa da çekim yapılmaz", async () => {
    vi.stubEnv("OUTBOUND_PUBLIC_IP", "85.105.141.10");
    mocks.userFindUnique.mockResolvedValue(null);
    await runCommerceSubscriptionRenewalScan(NOW);
    expect(mocks.charge).not.toHaveBeenCalled();
  });

  it("çekim reddedilirse abonelik gecikir ve sayaç artar", async () => {
    vi.stubEnv("OUTBOUND_PUBLIC_IP", "85.105.141.10");
    mocks.charge.mockResolvedValue({ ok: false });
    const result = await runCommerceSubscriptionRenewalScan(NOW);
    expect(result).toEqual({ scanned: 1, charged: 0, pastDue: 1, canceled: 0, blockedConfig: 0 });
  });

  it("iptal adayı (cancel) yapılandırma kapısından geçmez; iptal yine yazılır", async () => {
    vi.stubEnv("OUTBOUND_PUBLIC_IP", "");
    mocks.findMany.mockResolvedValue([dueRow({ cancelAtPeriodEnd: true })]);
    const result = await runCommerceSubscriptionRenewalScan(NOW);
    expect(result.canceled).toBe(1);
    expect(result.blockedConfig).toBe(0);
    expect(mocks.update.mock.calls[0]?.[0]).toMatchObject({ data: { status: "CANCELED" } });
  });

  it("kaynak dosyada sabit yedek e-posta ve IP metni yoktur", () => {
    const source = readFileSync(join(ROOT, "lib/commerce/subscription-renewal.ts"), "utf8");
    expect(source).not.toContain("billing@yetkin.ai");
    // P0.5 — sabit 127.0.0.1 yedeği kaldırıldı; yerel adres reddedilir.
    expect(source).not.toContain('|| "127.0.0.1"');
    expect(source).not.toContain('userIp: "127.0.0.1"');
    expect(source).toContain("blocked_config");
    expect(source).toContain("console.error");
  });
});
