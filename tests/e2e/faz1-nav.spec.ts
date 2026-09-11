import { expect, test } from "@playwright/test";

test.describe("Faz 1 kamu navigasyonu", () => {
  test("iniş Akademi kahramanı basar; Freelancer/pazaryeri dipnotu yok; Junior yok", async ({
    page,
  }) => {
    const home = await page.goto("/");
    expect(home?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Yapay zekâ yetkinliğini kanıtla, kariyerini mühürle" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Eğitimleri İncele" })).toHaveAttribute("href", "/academy");
    await expect(page.getByRole("link", { name: "Giriş Yap" })).toHaveAttribute("href", "/login");
    await expect(page.getByRole("link", { name: "Kayıt Ol" })).toHaveAttribute("href", "/register");
    await expect(page.getByRole("link", { name: "Panele geç" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Anasayfaya geç" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Anasayfaya gir" })).toHaveCount(0);
    await expect(page.getByText("Bugün satılan ürün")).toBeVisible();
    await expect(page.getByText("Öğren, sınavı geç, belgeni mühürle")).toBeVisible();
    await expect(page.getByText("Freelancer")).toHaveCount(0);
    await expect(page.getByText("İlan ver veya teklif et")).toHaveCount(0);
    await expect(page.getByText("Split pasifken")).toHaveCount(0);
    await expect(page.getByText("Belgenin vitrini")).toHaveCount(0);
    await expect(page.getByText("Platform örneği · emanet kapalı")).toHaveCount(0);
    await expect(page.getByText("Junior", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Kurumsal")).toHaveCount(0);
    await expect(page.getByText("Hibe")).toHaveCount(0);
    await expect(page.getByText("Arena")).toHaveCount(0);
    await expect(page.getByText("Yetkinİlan")).toHaveCount(0);
    await expect(page.getByText("YetkinX")).toHaveCount(0);
  });

  test("kamu /career oturumsuz /login 307 sığınağına gider", async ({ page, request }) => {
    const career = await request.get("/career", { maxRedirects: 0 });
    expect(career.status()).toBe(307);
    expect(career.headers().location ?? "").toContain("/login?next=%2Fcareer");

    const followed = await page.goto("/career");
    expect(followed?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/login\?next=%2Fcareer/);
    await expect(page.getByRole("heading", { name: "Kariyer", exact: true })).toHaveCount(0);
    await expect(page.getByText("Yetenek Radarı")).toHaveCount(0);
    await expect(page.getByText("SWOT")).toHaveCount(0);
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
