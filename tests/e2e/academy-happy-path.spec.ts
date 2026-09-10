import { expect, test } from "@playwright/test";

test.describe("O8 akademi nakit & sınav yolculuğu", () => {
  test("katalog kamu; satın alma oturumsuz 401 (Idempotency-Key oturumdan sonra)", async ({
    page,
    request,
  }) => {
    const response = await page.goto("/academy");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Akademi" })).toBeVisible();

    const live = page.getByText(/Eğitimi incele|Yayında eğitim yok|Liste henüz yüklenemedi/);
    const empty = page.getByText("Yayında eğitim yok");
    const unbound = page.getByText("Liste henüz yüklenemedi");
    await expect(live.or(empty).or(unbound).first()).toBeVisible();

    await expect(page.getByText("Ofiste Yapay Zekâ")).toBeVisible();
    await expect(page.getByText("E-Ticaret ve Pazaryeri Yapay Zekâ")).toBeVisible();
    await expect(page.getByText("Sosyal Medya İçerik Üretimi")).toBeVisible();
    await expect(page.getByText("Kodsuz WhatsApp")).toBeVisible();
    await expect(page.getByText("Pratik Prompt Mühendisliği")).toBeVisible();
    await expect(page.getByRole("link", { name: /Satın Al/ }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Satın Al —/ })).toHaveCount(0);
    await expect(page.getByText(/KDV dahil/).first()).toBeVisible();
    await expect(page.getByText("Erişim Açık")).toHaveCount(0);

    await page.goto("/academy/01_office_ai");
    await expect(page.getByRole("heading", { name: /Ofiste Yapay Zekâ/ })).toBeVisible();
    await expect(page.getByText("Ders listesi")).toBeVisible();
    await expect(page.getByText(/Baraj 70/)).toBeVisible();
    await expect(page.getByText(/Kariyer'de vizeye/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Eğitimi Satın Al —/ }).first()).toBeVisible();
    await expect(page.locator('[data-academy-hero-cta="play"]')).toHaveCount(0);

    const verify = await page.goto("/academy/dogrula/not-a-hash");
    expect(verify?.status()).toBeLessThan(400);
    await expect(page.getByText(/Hash biçimi SHA256/).first()).toBeVisible();

    const landing = await page.goto("/academy/dogrula");
    expect(landing?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Sertifika doğrula", level: 1 })).toBeVisible();

    const apiInvalid = await request.get("/api/academy/certificates/not-a-hash");
    expect(apiInvalid.status()).toBe(400);
    const apiMissing = await request.get(
      "/api/academy/certificates/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    );
    expect([400, 404, 503]).toContain(apiMissing.status());

    const purchase = await request.post("/api/academy/courses/ac_01_office_ai/purchase", {
      headers: { "Idempotency-Key": "550e8400-e29b-41d4-a716-446655440000" },
      data: { lockId: "e2e-lock" },
    });
    expect(purchase.status()).toBe(401);
    const purchaseBody = (await purchase.json()) as { ok?: boolean; error?: string };
    expect(purchaseBody.ok).toBe(false);
    expect(purchaseBody.error).toBe("Oturum gerekli.");

    const lock = await request.post("/api/academy/courses/ac_01_office_ai/lock");
    expect(lock.status()).toBe(401);

    const curriculum = await request.post("/api/academy/courses/ac_01_office_ai/curriculum", {
      data: { lessonKey: "01_office_ai-1" },
    });
    expect(curriculum.status()).toBe(401);

    await page.goto("/academy/01_office_ai/oyna");
    expect(page.url()).toContain("/login");
  });

  test("oturumlu hero Eğitimi Satın Al PayTR iFrame modalını açar", async ({ page }) => {
    const email = process.env.E2E_T3_EMAIL?.trim() || process.env.E2E_T4_CLIENT_EMAIL?.trim() || "";
    const password = process.env.E2E_T3_PASSWORD?.trim() || process.env.E2E_T4_CLIENT_PASSWORD?.trim() || "";
    test.skip(!email || !password, "E2E_T3/T4 kimliği yok; PayTR hero atlanır.");

    const iframeUrl = "https://www.paytr.com/odeme/guvenli/e2e-academy-hero";
    await page.route("**/api/dashboard/wallet-strip", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          error: null,
          requestId: "e2e-strip",
          apiVersion: "1",
          data: { strip: { live: true, amountMinor: 0, currencyCode: "TRY" } },
        }),
      });
    });
    await page.route("**/api/wallet/top-up", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          error: null,
          requestId: "e2e-paytr",
          apiVersion: "1",
          data: { iframeUrl },
        }),
      });
    });

    await page.goto("/login");
    await page.getByLabel("E-posta").fill(email);
    await page.getByRole("textbox", { name: "Şifre" }).fill(password);
    await page.getByRole("button", { name: /Giriş yap/ }).click();
    await expect(page).toHaveURL(/\/dashboard\/?$/, { timeout: 20_000 });

    await page.goto("/academy/01_office_ai");
    const heroPaytr = page.locator('[data-academy-hero-paytr]');
    test.skip((await heroPaytr.count()) === 0, "hero PayTR CTA yok — kayıtlı veya ödeme kapalı.");

    await page.getByLabel("Ad Soyad").first().fill("Ayşe Kaya");
    await page.getByLabel("Cep telefonu").first().fill("05321234567");
    await page.getByLabel("Açık Adres").first().fill("İnönü Mah. 157 Sk. No:3/C Akhisar");
    await page.getByRole("checkbox").nth(0).check();
    await page.getByRole("checkbox").nth(1).check();

    await heroPaytr.click();
    const frame = page.locator("iframe[data-paytr-iframe]");
    await expect(frame).toBeVisible({ timeout: 15_000 });
    await expect(frame).toHaveAttribute("src", iframeUrl);
    await expect(frame).toHaveAttribute("allow", /payment/);
    await expect(page).not.toHaveURL(/#satin-al/);
  });
});
