import { expect, test } from "@playwright/test";

test.describe("vatandaş /kayit mutlu yolu", () => {
  test("/kayit 308 ile /register’a gider; form veya dürüst kapalı yüzey görünür; giriş simülasyonu çalışır", async ({
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

    const registerForm = page.locator("form");
    const registerBound = page.getByText("Kayıt henüz bağlanmadı");
    await expect(registerForm.or(registerBound)).toBeVisible();

    await page.getByRole("link", { name: "Giriş" }).click();
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.getByRole("heading", { name: "Giriş" })).toBeVisible();

    const loginForm = page.locator("form");
    if (await loginForm.count()) {
      await page.getByLabel("E-posta").fill("e2e.vatandas@example.com");
      await page.getByRole("textbox", { name: "Şifre" }).fill("rail-e2e-sim-8");
      await page.getByRole("button", { name: /Giriş yap/ }).click();
      await expect(page.locator("form")).toBeVisible();
    } else {
      await expect(page.getByText("Giriş henüz bağlanmadı")).toBeVisible();
    }
  });

  test("oturumsuz /dashboard ve /pasaport kenarda /login’e 307 gider", async ({ request }) => {
    for (const path of ["/dashboard", "/pasaport"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      expect(response.headers().location ?? "").toContain("/login");
      expect(response.headers()["content-security-policy"] ?? "").toContain("default-src 'self'");
    }
  });
});
