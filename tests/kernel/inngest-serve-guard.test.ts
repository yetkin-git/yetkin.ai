import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertInngestCronServeReady,
  canInvokeInngestServe,
  canSendInngestEvents,
  INNGEST_CRON_SERVE_NOT_READY,
  INNGEST_EVENT_SEND_NOT_READY,
  INNGEST_KERNEL_CRON_FUNCTION_IDS,
  isInngestDevEnabled,
  resolveInngestServeMode,
  shouldFailClosedInngestServe,
} from "@/lib/kernel/jobs/inngest-guard";
import { inngestNotConfiguredResponse } from "@/lib/kernel/jobs/inngest";

describe("Inngest imza fail-closed", () => {
  it("üretimde boş INNGEST_SIGNING_KEY veya INNGEST_EVENT_KEY serve açmaz; dev boş anahtara izin verir", () => {
    expect(
      shouldFailClosedInngestServe({ NODE_ENV: "production", INNGEST_SIGNING_KEY: "" }),
    ).toBe(true);
    expect(
      shouldFailClosedInngestServe({ NODE_ENV: "production", INNGEST_SIGNING_KEY: "   " }),
    ).toBe(true);
    expect(
      shouldFailClosedInngestServe({
        NODE_ENV: "production",
        INNGEST_SIGNING_KEY: "signkey-prod-test",
      }),
    ).toBe(true);
    expect(
      shouldFailClosedInngestServe({
        NODE_ENV: "production",
        INNGEST_EVENT_KEY: "eventkey-prod-test",
      }),
    ).toBe(true);
    expect(
      shouldFailClosedInngestServe({
        NODE_ENV: "production",
        INNGEST_SIGNING_KEY: "signkey-prod-test",
        INNGEST_EVENT_KEY: "   ",
      }),
    ).toBe(true);
    expect(
      shouldFailClosedInngestServe({
        NODE_ENV: "production",
        INNGEST_SIGNING_KEY: "signkey-prod-test",
        INNGEST_EVENT_KEY: "eventkey-prod-test",
      }),
    ).toBe(false);
    expect(
      shouldFailClosedInngestServe({ NODE_ENV: "development", INNGEST_SIGNING_KEY: "" }),
    ).toBe(false);
    expect(shouldFailClosedInngestServe({ NODE_ENV: "test", INNGEST_SIGNING_KEY: "" })).toBe(
      false,
    );
  });

  it("INNGEST_DEV üretim kilidini açmaz", () => {
    expect(
      shouldFailClosedInngestServe({
        NODE_ENV: "production",
        INNGEST_SIGNING_KEY: "",
        INNGEST_DEV: "1",
      }),
    ).toBe(true);
    expect(
      shouldFailClosedInngestServe({
        NODE_ENV: "production",
        INNGEST_SIGNING_KEY: "signkey-prod-test",
        INNGEST_EVENT_KEY: "",
        INNGEST_DEV: "1",
      }),
    ).toBe(true);
    expect(
      isInngestDevEnabled({ NODE_ENV: "production", INNGEST_DEV: "1" }),
    ).toBe(false);
    expect(
      canInvokeInngestServe({
        NODE_ENV: "production",
        INNGEST_SIGNING_KEY: "",
        INNGEST_EVENT_KEY: "",
        INNGEST_DEV: "1",
      }),
    ).toBe(false);
  });

  it("geliştirmede Cloud yoksa INNGEST_DEV olmadan serve açılmaz; INNGEST_DEV=1 dumanı açar", () => {
    expect(
      canInvokeInngestServe({
        NODE_ENV: "development",
        INNGEST_SIGNING_KEY: "",
        INNGEST_EVENT_KEY: "",
      }),
    ).toBe(false);
    expect(
      canInvokeInngestServe({
        NODE_ENV: "development",
        INNGEST_SIGNING_KEY: "",
        INNGEST_EVENT_KEY: "",
        INNGEST_DEV: "1",
      }),
    ).toBe(true);
    expect(
      canInvokeInngestServe({
        NODE_ENV: "development",
        INNGEST_SIGNING_KEY: "signkey-dev-test",
        INNGEST_EVENT_KEY: "eventkey-dev-test",
      }),
    ).toBe(true);
  });

  it("cloud ve INNGEST_DEV modunda cron 503'e düşmez; boş anahtarda throw", () => {
    expect(INNGEST_KERNEL_CRON_FUNCTION_IDS).toEqual([
      "paytr-clearing-scan",
      "ledger-reconciliation-scan",
      "escrow-timeout-scan",
      "escrow-ttl-approaching-scan",
    ]);
    expect(
      resolveInngestServeMode({
        NODE_ENV: "production",
        INNGEST_SIGNING_KEY: "signkey-prod-test",
        INNGEST_EVENT_KEY: "eventkey-prod-test",
      }),
    ).toBe("cloud");
    expect(
      assertInngestCronServeReady({
        NODE_ENV: "production",
        INNGEST_SIGNING_KEY: "signkey-prod-test",
        INNGEST_EVENT_KEY: "eventkey-prod-test",
      }),
    ).toBe("cloud");
    expect(
      resolveInngestServeMode({
        NODE_ENV: "development",
        INNGEST_DEV: "1",
        INNGEST_SIGNING_KEY: "",
        INNGEST_EVENT_KEY: "",
      }),
    ).toBe("dev");
    expect(
      assertInngestCronServeReady({
        NODE_ENV: "development",
        INNGEST_DEV: "1",
      }),
    ).toBe("dev");
    expect(
      resolveInngestServeMode({
        NODE_ENV: "production",
        INNGEST_DEV: "1",
        INNGEST_SIGNING_KEY: "",
        INNGEST_EVENT_KEY: "",
      }),
    ).toBe("fail-closed");
    expect(() =>
      assertInngestCronServeReady({
        NODE_ENV: "production",
        INNGEST_SIGNING_KEY: "",
        INNGEST_EVENT_KEY: "",
      }),
    ).toThrow(INNGEST_CRON_SERVE_NOT_READY);
  });
  it("canSendInngestEvents yalnız EVENT_KEY ister; boşken send yolu SDK'ya inmez", () => {
    expect(canSendInngestEvents({ INNGEST_EVENT_KEY: "" })).toBe(false);
    expect(canSendInngestEvents({ INNGEST_EVENT_KEY: "   " })).toBe(false);
    expect(canSendInngestEvents({ INNGEST_EVENT_KEY: "evt" })).toBe(true);
    expect(INNGEST_EVENT_SEND_NOT_READY).toContain("INNGEST_EVENT_KEY");
  });
});

describe("Inngest HTTP 503", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("not-configured yanıtı 503 ve sahte event taşımaz", async () => {
    const response = inngestNotConfiguredResponse("req-1");
    expect(response.status).toBe(503);
    const body = (await response.json()) as { ok?: boolean; error?: string; requestId?: string };
    expect(body.ok).toBe(false);
    expect(body.error).toContain("Inngest Cloud anahtarları");
    expect(body.requestId).toBe("req-1");
  });
  it("geliştirmede Cloud yok ve INNGEST_DEV yoksa GET 503; serve açılmaz", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("INNGEST_SIGNING_KEY", "");
    vi.stubEnv("INNGEST_EVENT_KEY", "");
    vi.stubEnv("INNGEST_DEV", "");
    vi.resetModules();
    const { GET } = await import("@/app/api/(kernel)/jobs/inngest/route");
    const getRes = await GET(new Request("http://localhost/api/jobs/inngest"));
    expect(getRes.status).toBe(503);
    const body = (await getRes.json()) as { ok?: boolean; error?: string };
    expect(body.ok).toBe(false);
    expect(body.error).toContain("INNGEST_DEV=1");
  });

  it("üretimde boş çift anahtarda GET/POST/PUT 503; serve açılmaz", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("INNGEST_SIGNING_KEY", "");
    vi.stubEnv("INNGEST_EVENT_KEY", "");
    vi.stubEnv("INNGEST_DEV", "1");
    vi.resetModules();
    const { GET, POST, PUT } = await import("@/app/api/(kernel)/jobs/inngest/route");
    const fake = new Request("http://localhost/api/jobs/inngest", {
      method: "POST",
      body: JSON.stringify({ name: "fake/event", data: {} }),
      headers: { "content-type": "application/json" },
    });
    const getRes = await GET(new Request("http://localhost/api/jobs/inngest"));
    const postRes = await POST(fake);
    const putRes = await PUT(
      new Request("http://localhost/api/jobs/inngest", {
        method: "PUT",
        body: JSON.stringify({ name: "fake/event", data: {} }),
        headers: { "content-type": "application/json" },
      }),
    );
    expect(getRes.status).toBe(503);
    expect(postRes.status).toBe(503);
    expect(putRes.status).toBe(503);
    const body = (await postRes.json()) as { ok?: boolean; error?: string };
    expect(body.ok).toBe(false);
    expect(body.error).toContain("Inngest Cloud anahtarları");
  });
});
