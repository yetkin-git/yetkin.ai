import { expect, test } from "@playwright/test";

test.describe("Faz 1 kamu navigasyonu", () => {
  test("iniş tek birincil Tezgâh CTA basar; Freelancer/pazaryeri dipnotu yok; Junior yok", async ({
    page,
  }) => {
    const home = await page.goto("/");
    expect(home?.status()).toBeLessThan(400);
    await expect(
      page.getByRole("heading", {
        name: "İşinizi Büyüten Yapay Zeka Araçları. Tek Hesap, Sıfır Karmaşa.",
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Ücretsiz Hemen Dene (Kayıt Gerekmez)" })).toHaveAttribute(
      "href",
      "/tezgah",
    );
    await expect(page.getByRole("link", { name: "Paketleri İncele" })).toHaveAttribute(
      "href",
      "/fiyatlandirma",
    );
    await expect(page.getByRole("link", { name: "AI Tezgâh", exact: true })).toHaveAttribute(
      "href",
      "/tezgah",
    );
    await expect(page.getByRole("link", { name: "Fiyatlar" }).first()).toHaveAttribute(
      "href",
      "/fiyatlandirma",
    );
    await expect(page.getByRole("link", { name: "Kurumsal" }).first()).toHaveAttribute(
      "href",
      "/kurumsal",
    );
    await expect(page.getByRole("link", { name: "Rehber" }).first()).toHaveAttribute("href", "/rehber");
    await expect(page.getByRole("link", { name: "Giriş Yap" })).toHaveAttribute("href", "/login");
    await expect(page.getByRole("link", { name: "Kayıt Ol" })).toHaveAttribute("href", "/register");
    await expect(page.getByRole("link", { name: "Panele geç" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Anasayfaya geç" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Anasayfaya gir" })).toHaveCount(0);
    await expect(page.getByText("Ücretsiz Tezgâh")).toBeVisible();
    await expect(page.getByRole("link", { name: "Hibeleri Gör" })).toBeVisible();
    await expect(page.getByText("Hazırlanıyor")).toHaveCount(0);
    await expect(page.getByText("İlan ver veya teklif et")).toHaveCount(0);
    await expect(page.getByText("Split pasifken")).toHaveCount(0);
    await expect(page.getByText("Belgenin vitrini")).toHaveCount(0);
    await expect(page.getByText("Platform örneği · emanet kapalı")).toHaveCount(0);
    await expect(page.getByText("Junior", { exact: true })).toHaveCount(0);
    await expect(page.getByText("YetkinCV & İK Eleme").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "E-Ticareti İncele" })).toBeVisible();
    await expect(page.getByText("Arena")).toHaveCount(0);
    await expect(page.getByText("Yetkinİlan")).toHaveCount(0);
    await expect(page.getByText("YetkinX")).toHaveCount(0);
    await expect(page.getByText("Akademi", { exact: true })).toHaveCount(0);
  });

  test("kamu /career oturumsuz kendi sayfasında kalır", async ({ page, request }) => {
    const career = await request.get("/career", { maxRedirects: 0 });
    expect(career.status()).toBe(200);
    expect(career.headers().location ?? "").toBe("");

    const followed = await page.goto("/career");
    expect(followed?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/career\/?$/);
    await expect(page.getByRole("heading", { name: "Yetkinliğini Gerçek Testle Kanıtla, Fark Yarat." }).first()).toBeVisible();
    await expect(page.getByText("Örnek mühürlü sertifika")).toBeVisible();
    await expect(page.getByRole("heading", { name: "30 günlük aksiyon planı" })).toBeVisible();
    await expect(page.locator("[data-action-plan]")).toContainText(
      "İşe yerleşmeyi veya gelir elde etmeyi garanti etmez",
    );
    await expect(page.getByText("Gün 1–7")).toBeVisible();
    await expect(page.getByText("Gün 23–30")).toBeVisible();
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
