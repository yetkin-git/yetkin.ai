import { expect, test } from "@playwright/test";

test.describe("K6 kenar API kind", () => {
  test("GET /api/health public 200; oturumsuz Studio 401; PayTR webhook 401 değildir", async ({
    request,
  }) => {
    const health = await request.get("/api/health", { maxRedirects: 0 });
    expect(health.status()).not.toBe(401);
    expect([200, 503]).toContain(health.status());
    const healthBody = (await health.json()) as {
      ok?: boolean;
      service?: string;
      probe?: string;
      checks?: { db?: string };
    };
    expect(healthBody.service).toBe("yetkin-rail");
    expect(healthBody.probe).toBe("readiness");
    if (health.status() === 200) {
      expect(healthBody.ok).toBe(true);
      expect(healthBody.checks?.db).toBe("ok");
    } else {
      expect(healthBody.ok).toBe(false);
      expect(["down", "unconfigured"]).toContain(healthBody.checks?.db);
    }

    const studio = await request.post("/api/studio/generate", {
      data: { prompt: "Kenar mühür." },
      headers: { "content-type": "application/json" },
    });
    expect(studio.status()).toBe(401);
    const studioBody = (await studio.json()) as { ok?: boolean; error?: string };
    expect(studioBody.ok).toBe(false);
    expect(studioBody.error).toBe("Oturum gerekli.");

    const webhook = await request.post("/api/payments/webhooks/paytr", {
      form: { merchant_oid: "probe" },
      maxRedirects: 0,
    });
    expect(webhook.status()).not.toBe(401);
    expect(webhook.status()).not.toBe(307);
  });
});
