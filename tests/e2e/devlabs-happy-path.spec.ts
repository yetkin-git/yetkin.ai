import { expect, test } from "@playwright/test";

test.describe("O12 DevLabs icra dürüstlüğü yüzeyi", () => {
  test("şerit exec yoktur mühürler; konsol kamu; proje yazma girişe döner; API oturumsuz 401", async ({
    page,
    request,
  }) => {
    const home = await page.goto("/");
    expect(home?.status()).toBeLessThan(400);
    await expect(page.getByText("Kod tezgâhta üretilir; exec yoktur.")).toBeVisible();
    await expect(page.getByText("Projelerinizi yönetin")).toHaveCount(0);

    const catalog = await page.goto("/devlabs");
    expect(catalog?.status()).toBeLessThan(400);
    await expect(page.getByText("Exec Yoktur / Çalıştırma Yapılmaz")).toBeVisible();
    await expect(page.getByText("sunucuda kod çalıştırılmaz (exec yoktur)")).toBeVisible();
    await expect(page.getByText("API anahtarı yalnız bir kez gösterilir (yrk_ öneki)")).toBeVisible();
    await expect(page.getByText("Proje Oluştur")).toBeVisible();
    await expect(page.getByText("Üret (Generate)")).toBeVisible();
    await expect(page.getByText("Linter / Denetle")).toBeVisible();
    await expect(page.getByText("Çıktı Kasa / Artifact")).toBeVisible();

    const board = await page.goto("/devlabs/projeler/e2e-project");
    expect(board?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/(giris|login)\/?/);

    const create = await request.post("/api/devlabs/projects", {
      data: { name: "E2E", summary: "Oturumsuz proje yazılmaz." },
      headers: { "content-type": "application/json" },
    });
    expect(create.status()).toBe(401);
    const createBody = (await create.json()) as { ok?: boolean; error?: string };
    expect(createBody.ok).toBe(false);
    expect(createBody.error).toBe("Oturum gerekli.");

    const generate = await request.post("/api/devlabs/projects/e2e-project/generate", {
      data: { prompt: "kod", apiKeyId: "e2e-key" },
      headers: { "content-type": "application/json" },
    });
    expect(generate.status()).toBe(401);

    const keys = await request.post("/api/devlabs/projects/e2e-project/keys", {
      data: { name: "ci" },
      headers: { "content-type": "application/json" },
    });
    expect(keys.status()).toBe(401);
  });
});
