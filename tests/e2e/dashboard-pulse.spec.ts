import { expect, test } from "@playwright/test";

test.describe("T3-BFF Dashboard Pulse", () => {
  test("oturumsuz GET /api/dashboard/pulse 401; kokpit kenarda /login'e gider", async ({
    request,
  }) => {
    const pulse = await request.get("/api/dashboard/pulse", { maxRedirects: 0 });
    expect(pulse.status()).toBe(401);
    const body = (await pulse.json()) as { ok?: boolean; error?: string };
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Oturum gerekli.");
    expect(pulse.headers()["cache-control"] ?? "").not.toMatch(/public/i);

    const dashboard = await request.get("/dashboard", { maxRedirects: 0 });
    expect(dashboard.status()).toBe(307);
    expect(dashboard.headers().location ?? "").toContain("/login");
  });
});
