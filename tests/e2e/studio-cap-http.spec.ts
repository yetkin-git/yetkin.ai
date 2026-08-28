import { expect, test } from "@playwright/test";

test.describe("Studio tavan / donmuş kapı (HTTP)", () => {
  test("Studio üretimi kenarda 410; sağlayıcıya gitmez", async ({ request }) => {
    const response = await request.post("/api/studio/generate", {
      data: { prompt: "Bir slogan üret." },
      headers: { "content-type": "application/json" },
    });
    expect(response.status()).toBe(410);
    const body = (await response.json()) as { ok?: boolean; error?: string };
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Bu oda üretimde kapalı.");
  });
});
