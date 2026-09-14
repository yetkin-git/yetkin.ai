import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LIVE_BROADCAST_SHUTDOWN,
  isLiveBroadcastShutdownEnvActive,
  isLiveBroadcastShutdownFlagOn,
} from "@/lib/kernel/http/live-broadcast-shutdown";
import { SITE_MAINTENANCE_API_ERROR } from "@/lib/kernel/http/site-maintenance";

describe("canlı yayın kapatma kilidi", () => {
  it("varsayılan kapalıdır; env true|1 üretimde açılır", () => {
    expect(LIVE_BROADCAST_SHUTDOWN).toBe(false);
    expect(isLiveBroadcastShutdownFlagOn({})).toBe(false);
    expect(isLiveBroadcastShutdownFlagOn({ LIVE_BROADCAST_SHUTDOWN: "true" })).toBe(true);
    expect(isLiveBroadcastShutdownFlagOn({ LIVE_BROADCAST_SHUTDOWN: "1" })).toBe(true);
    expect(
      isLiveBroadcastShutdownEnvActive({ NODE_ENV: "production", VITEST: "false" }),
    ).toBe(false);
    expect(
      isLiveBroadcastShutdownEnvActive({
        NODE_ENV: "production",
        VITEST: "false",
        LIVE_BROADCAST_SHUTDOWN: "true",
      }),
    ).toBe(true);
    expect(
      isLiveBroadcastShutdownEnvActive({
        NODE_ENV: "production",
        VITEST: "true",
        LIVE_BROADCAST_SHUTDOWN: "true",
      }),
    ).toBe(false);
    expect(
      isLiveBroadcastShutdownEnvActive({
        NODE_ENV: "development",
        VITEST: "false",
        LIVE_BROADCAST_SHUTDOWN: "true",
      }),
    ).toBe(false);
    expect(isLiveBroadcastShutdownEnvActive({ NODE_ENV: "test" })).toBe(false);
  });
});

describe("PayTR ve Inngest handler fail-closed (üretim kapatma)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("PayTR GET/POST üretimde CREDIT basmaz; 503", async () => {
    if (!LIVE_BROADCAST_SHUTDOWN) {
      return;
    }
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const { GET, POST } = await import("@/app/api/(kernel)/payments/webhooks/paytr/route");
    const getRes = await GET(new Request("http://localhost/api/payments/webhooks/paytr"));
    expect(getRes.status).toBe(503);
    const getBody = (await getRes.json()) as { ok?: boolean; error?: string };
    expect(getBody.ok).toBe(false);
    expect(getBody.error).toBe(SITE_MAINTENANCE_API_ERROR);

    const postRes = await POST(
      new Request("http://localhost/api/payments/webhooks/paytr", {
        method: "POST",
        body: new FormData(),
      }),
    );
    expect(postRes.status).toBe(503);
  });

  it("env LIVE_BROADCAST_SHUTDOWN=true iken PayTR üretimde 503", async () => {
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LIVE_BROADCAST_SHUTDOWN", "true");
    vi.resetModules();
    const { GET } = await import("@/app/api/(kernel)/payments/webhooks/paytr/route");
    const getRes = await GET(new Request("http://localhost/api/payments/webhooks/paytr"));
    expect(getRes.status).toBe(503);
  });

  it("Inngest GET üretimde anahtar dolu olsa da 503", async () => {
    if (!LIVE_BROADCAST_SHUTDOWN) {
      return;
    }
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("INNGEST_EVENT_KEY", "evt");
    vi.stubEnv("INNGEST_SIGNING_KEY", "sign");
    vi.resetModules();
    const { GET } = await import("@/app/api/(kernel)/jobs/inngest/route");
    const getRes = await GET(new Request("http://localhost/api/jobs/inngest"));
    expect(getRes.status).toBe(503);
  });
});
