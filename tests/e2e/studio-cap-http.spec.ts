import { expect, test } from "@playwright/test";

test.describe("Studio tavan / oturum kapısı (HTTP)", () => {
  test("oturumsuz Studio üretimi sağlayıcıya gitmeden 4xx dürüst hata döner", async ({
    request,
  }) => {
    const response = await request.post("/api/studio/generate", {
      data: { prompt: "Bir slogan üret." },
      headers: { "content-type": "application/json" },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
    const body = (await response.json()) as { ok?: boolean; error?: string };
    expect(body.ok).toBe(false);
    expect(body.error).toBeTruthy();
  });
});
