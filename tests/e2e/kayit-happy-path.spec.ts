import { expect, test } from "@playwright/test";

test.describe("vatandaş /kayit mutlu yolu", () => {
  test("/kayit 308 ile /register’a gider; form görünür; giriş simülasyonu çalışır", async ({
    page,
    request,
  }) => {
    const redirect = await request.get("/kayit", { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    const location = redirect.headers().location ?? "";
    expect(location).toContain("/register");

    const registerHeaders = await request.get("/register", { maxRedirects: 0 });
    expect(registerHeaders.headers()["content-security-policy"] ?? "").toContain(
      "default-src 'self'",
    );

    await page.goto("/kayit");
    await expect(page).toHaveURL(/\/register\/?$/);
    await expect(page.getByRole("heading", { name: "Kayıt" })).toBeVisible();

    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByLabel("Ad soyad")).toBeVisible();
    await expect(page.getByLabel("E-posta")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Şifre" })).toBeVisible();
    await expect(page.getByText("Kayıt henüz bağlanmadı")).toHaveCount(0);

    await page.getByRole("link", { name: "Giriş" }).click();
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.getByRole("heading", { name: "Giriş" })).toBeVisible();

    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByText("Giriş henüz bağlanmadı")).toHaveCount(0);
    await page.getByLabel("E-posta").fill("e2e.vatandas@example.com");
    await page.getByRole("textbox", { name: "Şifre" }).fill("rail-e2e-sim-8");
    await page.getByRole("button", { name: /Giriş yap/ }).click();
    await expect(page.locator("form")).toBeVisible();
  });

  test("oturumsuz /dashboard kendi sayfasında kalır, /pasaport girişe 307 gider", async ({ request }) => {
    const dashboard = await request.get("/dashboard", { maxRedirects: 0 });
    expect(dashboard.status()).toBe(200);
    expect(dashboard.headers().location ?? "").toBe("");
    expect(dashboard.headers()["content-security-policy"] ?? "").toContain("default-src 'self'");

    const passport = await request.get("/pasaport", { maxRedirects: 0 });
    expect(passport.status()).toBe(307);
    expect(passport.headers().location ?? "").toContain("/login");
    expect(passport.headers()["content-security-policy"] ?? "").toContain("default-src 'self'");
  });
});
