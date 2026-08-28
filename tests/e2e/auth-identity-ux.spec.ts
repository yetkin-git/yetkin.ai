import { expect, test } from "@playwright/test";

test.describe("vatandaş kimlik UX", () => {
  test("/login göz ikonu ve Şifremi Unuttum bağlantısı; /sifremi-unuttum yüzeyi açılır", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Giriş" })).toBeVisible();

    const loginForm = page.locator("form");
    if (await loginForm.count()) {
      await expect(page.getByRole("link", { name: "Şifremi Unuttum?" })).toBeVisible();
      const password = page.getByRole("textbox", { name: "Şifre" });
      await password.fill("rail-e2e-sim-8");
      await expect(password).toHaveAttribute("type", "password");
      await page.getByRole("button", { name: "Şifreyi göster" }).click();
      await expect(password).toHaveAttribute("type", "text");
      await page.getByRole("button", { name: "Şifreyi gizle" }).click();
      await expect(password).toHaveAttribute("type", "password");
      await page.getByRole("link", { name: "Şifremi Unuttum?" }).click();
      await expect(page).toHaveURL(/\/sifremi-unuttum\/?$/);
    } else {
      await expect(page.getByText("Giriş henüz bağlanmadı")).toBeVisible();
      await page.goto("/sifremi-unuttum");
    }

    await expect(page.getByRole("heading", { name: "Şifremi Unuttum" })).toBeVisible();
    const resetForm = page.locator("form");
    const resetBound = page.getByText("Şifre sıfırlama henüz bağlanmadı");
    await expect(resetForm.or(resetBound)).toBeVisible();
  });

  test("/register güvenli şifre üretir; kopyalandı bildirimi görünür", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Kayıt" })).toBeVisible();

    const registerForm = page.locator("form");
    if (await registerForm.count()) {
      await page.getByRole("button", { name: "Güvenli Şifre Üret" }).click();
      const password = page.getByRole("textbox", { name: "Şifre" });
      await expect(password).toHaveAttribute("type", "text");
      const value = await password.inputValue();
      expect(value.length).toBe(16);
      expect(value).toMatch(/[a-z]/);
      expect(value).toMatch(/[A-Z]/);
      expect(value).toMatch(/\d/);
      expect(value).toMatch(/[^A-Za-z0-9]/);
      await expect(page.getByRole("status")).toContainText(/Kopyalandı|Panoya kopyalanamadı/);
    } else {
      await expect(page.getByText("Kayıt henüz bağlanmadı")).toBeVisible();
    }
  });

  test("/sifre-yenile dürüst kapalı veya oturum yok yüzeyi basar", async ({ page }) => {
    await page.goto("/sifre-yenile");
    await expect(page.getByRole("heading", { name: "Şifre Yenile" })).toBeVisible();
    const bound = page.getByText("Şifre yenileme henüz bağlanmadı");
    const missing = page.getByText("Sıfırlama oturumu bulunamadı");
    const checking = page.getByText("Sıfırlama oturumu kontrol ediliyor");
    const form = page.locator("form");
    await expect(bound.or(missing).or(checking).or(form)).toBeVisible();
  });

  test("/login?next= cüzdan hedefini URL'de tutar", async ({ page }) => {
    await page.goto("/login?next=%2Fcuzdan");
    await expect(page).toHaveURL(/\/login\?next=%2Fcuzdan/);
    await expect(page.getByRole("heading", { name: "Giriş" })).toBeVisible();
  });

  test("/auth/callback codesuz login hata yüzüne düşer; service_role cookie yazmaz", async ({
    page,
  }) => {
    await page.goto("/auth/callback");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toMatch(/error=/);
    const cookies = await page.context().cookies();
    expect(cookies.some((cookie) => cookie.name.toLowerCase().includes("service_role"))).toBe(
      false,
    );
  });
});
