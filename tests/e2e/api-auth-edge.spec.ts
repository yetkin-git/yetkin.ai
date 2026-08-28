import { expect, test } from "@playwright/test";

test.describe("K6 kenar API kind", () => {
  test("GET /api/health public 200; donmuş Studio 410; PayTR webhook 401 değildir", async ({
    request,
  }) => {
    const health = await request.get("/api/health", { maxRedirects: 0 });
    expect(health.status()).not.toBe(401);
    expect([200, 503]).toContain(health.status());
    const healthBody = (await health.json()) as {
      ok?: boolean;
      error?: string | null;
      data?: { service?: string; probe?: string; checks?: { db?: string } };
    };

    const live = await request.get("/api/health/live", { maxRedirects: 0 });
    expect(live.status()).toBe(200);
    const liveBody = (await live.json()) as {
      ok?: boolean;
      data?: { probe?: string; service?: string };
    };
    expect(liveBody.ok).toBe(true);
    expect(liveBody.data?.probe).toBe("liveness");
    expect(liveBody.data?.service).toBe("yetkin-rail");
    if (health.status() === 200) {
      expect(healthBody.ok).toBe(true);
      expect(healthBody.data?.service).toBe("yetkin-rail");
      expect(healthBody.data?.probe).toBe("readiness");
      expect(healthBody.data?.checks?.db).toBe("ok");
    } else {
      expect(healthBody.ok).toBe(false);
      expect(typeof healthBody.error).toBe("string");
    }

    const studio = await request.post("/api/studio/generate", {
      data: { prompt: "Kenar mühür." },
      headers: { "content-type": "application/json" },
    });
    expect(studio.status()).toBe(410);
    const studioBody = (await studio.json()) as { ok?: boolean; error?: string };
    expect(studioBody.ok).toBe(false);
    expect(studioBody.error).toBe("Bu oda üretimde kapalı.");

    const webhook = await request.post("/api/payments/webhooks/paytr", {
      form: { merchant_oid: "probe" },
      maxRedirects: 0,
    });
    expect(webhook.status()).not.toBe(401);
    expect(webhook.status()).not.toBe(307);
  });
});
