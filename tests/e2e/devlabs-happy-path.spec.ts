import { expect, test } from "@playwright/test";

test.describe("O12 DevLabs icra dürüstlüğü yüzeyi", () => {
  test("Faz 1 inişte DevLabs kartı yok; oda ve API 410", async ({ page, request }) => {
    const home = await page.goto("/");
    expect(home?.status()).toBeLessThan(400);
    await expect(page.getByText("Kod tezgâhta üretilir; exec yoktur.")).toHaveCount(0);
    await expect(page.getByText("Projelerinizi yönetin")).toHaveCount(0);

    const catalog = await page.goto("/devlabs");
    expect(catalog?.status()).toBe(410);
    await expect(page.getByText("Bu oda üretimde kapalı.")).toBeVisible();

    const board = await page.goto("/devlabs/projeler/e2e-project");
    expect(board?.status()).toBe(410);

    const create = await request.post("/api/devlabs/projects", {
      data: { name: "E2E", summary: "Oturumsuz proje yazılmaz." },
      headers: { "content-type": "application/json" },
    });
    expect(create.status()).toBe(410);
    const createBody = (await create.json()) as { ok?: boolean; error?: string };
    expect(createBody.ok).toBe(false);
    expect(createBody.error).toBe("Bu oda üretimde kapalı.");

    const generate = await request.post("/api/devlabs/projects/e2e-project/generate", {
      data: { prompt: "kod", apiKeyId: "e2e-key" },
      headers: { "content-type": "application/json" },
    });
    expect(generate.status()).toBe(410);

    const keys = await request.post("/api/devlabs/projects/e2e-project/keys", {
      data: { name: "ci" },
      headers: { "content-type": "application/json" },
    });
    expect(keys.status()).toBe(410);
  });
});
