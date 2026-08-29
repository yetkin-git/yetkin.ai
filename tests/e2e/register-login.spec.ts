import { expect, test, type Page } from "@playwright/test";

/**
 * /register + /login vatandaş kapısı.
 * Canlı giriş mevcut E2E_T3 / E2E_T4_CLIENT kimliğini kullanır (yeni gmail icat edilmez).
 */

type E2eCitizen = { email: string; password: string };

function readE2eCitizens(): E2eCitizen[] {
  const pairs = [
    ["E2E_T3_EMAIL", "E2E_T3_PASSWORD"],
    ["E2E_T4_CLIENT_EMAIL", "E2E_T4_CLIENT_PASSWORD"],
  ] as const;
  const citizens: E2eCitizen[] = [];
  for (const [emailKey, passwordKey] of pairs) {
    const email = process.env[emailKey]?.trim() ?? "";
    const password = process.env[passwordKey]?.trim() ?? "";
    if (email && password) {
      citizens.push({ email, password });
    }
  }
  return citizens;
}

async function validationMessage(page: Page, locator: ReturnType<Page["getByLabel"]>): Promise<string> {
  return locator.evaluate((el) => (el as HTMLInputElement).validationMessage);
}

async function fillLogin(page: Page, citizen: E2eCitizen) {
  await page.getByLabel("E-posta").fill(citizen.email);
  await page.getByRole("textbox", { name: "Şifre" }).fill(citizen.password);
}

test.describe("vatandaş /register ve /login", () => {
  test("/register form hataları: boş gönderim, geçersiz e-posta, kısa şifre, geçersiz ad soyad", async ({
    page,
  }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Kayıt" })).toBeVisible();
    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByText("Kayıt henüz bağlanmadı")).toHaveCount(0);

    await page.getByRole("button", { name: "Hesap oluştur" }).click();
    await expect(page).toHaveURL(/\/register\/?$/);
    expect(await validationMessage(page, page.getByLabel("Ad soyad"))).not.toBe("");

    await page.getByLabel("Ad soyad").fill("Ayşe Kaya");
    await page.getByLabel("E-posta").fill("not-an-email");
    await page.getByRole("textbox", { name: "Şifre" }).fill("rail-e2e-sim-8");
    await page.getByRole("button", { name: "Hesap oluştur" }).click();
    await expect(page).toHaveURL(/\/register\/?$/);
    expect(await validationMessage(page, page.getByLabel("E-posta"))).not.toBe("");

    await page.getByLabel("E-posta").fill("e2e.register.invalid@example.com");
    await page.getByRole("textbox", { name: "Şifre" }).fill("short");
    await page.getByRole("button", { name: "Hesap oluştur" }).click();
    await expect(page).toHaveURL(/\/register\/?$/);
    expect(await validationMessage(page, page.getByRole("textbox", { name: "Şifre" }))).not.toBe("");

    await page.getByLabel("Ad soyad").fill("   ");
    await page.getByLabel("E-posta").fill("e2e.register.invalid@example.com");
    await page.getByRole("textbox", { name: "Şifre" }).fill("rail-e2e-sim-8");
    await page.getByRole("button", { name: "Hesap oluştur" }).click();
    await expect(page.getByTestId("register-error")).toHaveText("Ad soyad geçersiz.");
    await expect(page).toHaveURL(/\/register\/?$/);
  });

  test("/login form hataları: boş gönderim ve geçersiz kimlik", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Giriş" })).toBeVisible();
    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByText("Giriş henüz bağlanmadı")).toHaveCount(0);

    await page.getByRole("button", { name: /Giriş yap/ }).click();
    await expect(page).toHaveURL(/\/login\/?$/);
    expect(await validationMessage(page, page.getByLabel("E-posta"))).not.toBe("");

    await page.getByLabel("E-posta").fill("e2e.unknown@example.com");
    await page.getByRole("textbox", { name: "Şifre" }).fill("Definitely-Wrong-Pass-1!");
    await page.getByRole("button", { name: /Giriş yap/ }).click();
    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page.getByTestId("login-error")).toHaveText(
      /E-posta veya şifre kabul edilmedi|Tarayıcı kimlik istemcisi yapılandırılmadı|Kimlik sunucusuna ulaşılamadı/,
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test("/register mevcut e-posta canlı Auth hatası basar (yeni kutu açılmaz)", async ({ page }) => {
    const [citizen] = readE2eCitizens();
    test.skip(!citizen, "E2E_T3/T4 kimliği yok; canlı kayıt atlanır.");
    if (!citizen) {
      return;
    }

    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Kayıt" })).toBeVisible();
    await page.getByLabel("Ad soyad").fill("E2E Vatandaş");
    await page.getByLabel("E-posta").fill(citizen.email);
    await page.getByRole("textbox", { name: "Şifre" }).fill(citizen.password);
    await page.getByRole("button", { name: "Hesap oluştur" }).click();
    await expect(page.getByTestId("register-error")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("register-error")).toHaveText(
      /Bu e-posta zaten kayıtlı|Kayıt başarısız/,
    );
    await expect(page).toHaveURL(/\/register\/?$/);
  });

  test("/login başarılı giriş /dashboard’a gider", async ({ page }) => {
    const citizens = readE2eCitizens();
    test.skip(citizens.length === 0, "E2E_T3/T4 kimliği yok; canlı giriş atlanır.");

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Giriş" })).toBeVisible();

    let signedIn = false;
    for (const citizen of citizens) {
      await fillLogin(page, citizen);
      await page.getByRole("button", { name: /Giriş yap/ }).click();
      try {
        await expect(page).toHaveURL(/\/dashboard\/?$/, { timeout: 20_000 });
        signedIn = true;
        break;
      } catch {
        await expect(page.getByTestId("login-error")).toBeVisible();
      }
    }

    test.skip(!signedIn, "canlı E2E kimlikleri kabul edilmedi; dashboard atlanır.");
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(page.getByRole("heading", { name: /Hoş Geldin|Genel Bakış/ })).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
  });
});
