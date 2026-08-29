import { expect, test } from "@playwright/test";

test.describe("Faz 1 kamu navigasyonu", () => {
  test("iniş Akademi → Kanıt → İlan basar; Junior ve donmuş odalar kartta yok", async ({
    page,
  }) => {
    const home = await page.goto("/");
    expect(home?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Güvenli kariyer ve iş platformu" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Giriş Yap" })).toHaveAttribute("href", "/login");
    await expect(page.getByRole("link", { name: "Kayıt Ol" })).toHaveAttribute("href", "/register");
    await expect(page.getByRole("link", { name: "Anasayfaya geç" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Anasayfaya gir" })).toHaveCount(0);
    await expect(page.getByText("Nasıl başlarsın")).toBeVisible();
    await expect(page.getByText("Öğren ve sınavı geç")).toBeVisible();
    await expect(page.getByText("Uzmanlığını belgele", { exact: true })).toBeVisible();
    await expect(page.getByText("İlan ver veya teklif et")).toBeVisible();
    await expect(page.getByText("Junior", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Kurumsal")).toHaveCount(0);
    await expect(page.getByText("Hibe")).toHaveCount(0);
    await expect(page.getByText("Arena")).toHaveCount(0);
    await expect(page.getByText("Yetkinİlan")).toHaveCount(0);
    await expect(page.getByText("YetkinX")).toHaveCount(0);
  });

  test("kamu /career vize-ilan tabelasını oturumsuz basar", async ({ page }) => {
    const career = await page.goto("/career");
    expect(career?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Vize ve Geçiş Defteri" })).toBeVisible();
    await expect(page.getByText("Bu vize hangi ilanları açar?")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sertifika doğrula" })).toBeVisible();
  });
});

test.describe("health liveness / readiness", () => {
  test("GET /api/health/live 200; GET /api/health readiness 200 veya 503", async ({ request }) => {
    const live = await request.get("/api/health/live", { maxRedirects: 0 });
    expect(live.status()).toBe(200);
    const liveBody = (await live.json()) as {
      ok?: boolean;
      data?: { probe?: string; service?: string };
    };
    expect(liveBody.ok).toBe(true);
    expect(liveBody.data?.service).toBe("yetkin-rail");
    expect(liveBody.data?.probe).toBe("liveness");

    const ready = await request.get("/api/health", { maxRedirects: 0 });
    expect([200, 503]).toContain(ready.status());
    const readyBody = (await ready.json()) as {
      ok?: boolean;
      error?: string | null;
      data?: { probe?: string; checks?: { db?: string } };
    };
    if (ready.status() === 200) {
      expect(readyBody.ok).toBe(true);
      expect(readyBody.data?.probe).toBe("readiness");
      expect(readyBody.data?.checks?.db).toBe("ok");
    } else {
      expect(readyBody.ok).toBe(false);
      expect(typeof readyBody.error).toBe("string");
    }
  });
});
