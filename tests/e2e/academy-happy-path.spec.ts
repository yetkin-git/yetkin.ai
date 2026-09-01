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

    await expect(page.getByText("Python ile Programlama ve Problem Çözme")).toBeVisible();
    await expect(page.getByText("Modern Web Geliştirme Temelleri (HTML, CSS, JavaScript ve TypeScript)")).toBeVisible();
    await expect(page.getByText("Yapay Zekâ ve Veri Analizi (Prompt ve Veri Bilimi)")).toBeVisible();
    await expect(page.getByText("Dijital Ürün Tasarımı (UI/UX ve Figma Masterclass)")).toBeVisible();
    await expect(page.getByRole("link", { name: /Satın Al/ }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Satın Al —/ })).toHaveCount(0);
    await expect(page.getByText(/KDV dahil/).first()).toBeVisible();
    await expect(page.getByText("Erişim Açık")).toHaveCount(0);

    await page.goto("/academy/python-temel");
    await expect(page.getByRole("heading", { name: "Python ile Programlama ve Problem Çözme" })).toBeVisible();
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

    const purchase = await request.post("/api/academy/courses/ac_rail_temel/purchase", {
      headers: { "Idempotency-Key": "550e8400-e29b-41d4-a716-446655440000" },
      data: { lockId: "e2e-lock" },
    });
    expect(purchase.status()).toBe(401);
    const purchaseBody = (await purchase.json()) as { ok?: boolean; error?: string };
    expect(purchaseBody.ok).toBe(false);
    expect(purchaseBody.error).toBe("Oturum gerekli.");

    const lock = await request.post("/api/academy/courses/ac_rail_temel/lock");
    expect(lock.status()).toBe(401);

    const curriculum = await request.post("/api/academy/courses/ac_rail_temel/curriculum", {
      data: { lessonKey: "python-temel-1" },
    });
    expect(curriculum.status()).toBe(401);

    await page.goto("/academy/python-temel/oyna");
    expect(page.url()).toContain("/login");
  });
});
