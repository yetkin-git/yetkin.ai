import { expect, test } from "@playwright/test";
import {
  LEGAL_ENTITY,
  LEGAL_HOME_CTA,
  LEGAL_HONESTY_BODY,
  LEGAL_PAGE_TITLE,
  LEGAL_SECTION_TITLES,
} from "../../lib/copy/legal-launch";

test.describe("O13 lansman hukuk yüzeyi", () => {
  test("/legal dürüst kartı ve yasal bölümleri basar", async ({ page, request }) => {
    const headers = await request.get("/legal", { maxRedirects: 0 });
    expect(headers.status()).toBe(200);
    expect(headers.headers()["content-security-policy"] ?? "").toContain("default-src 'self'");

    await page.goto("/legal");
    await expect(page.getByRole("heading", { name: LEGAL_PAGE_TITLE })).toBeVisible();
    await expect(page.getByText(LEGAL_HONESTY_BODY)).toBeVisible();
    await expect(page.getByText(LEGAL_ENTITY.address).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: LEGAL_SECTION_TITLES.kvkk })).toBeVisible();
    await expect(page.getByRole("heading", { name: LEGAL_SECTION_TITLES.cookies })).toBeVisible();
    await expect(page.getByRole("heading", { name: LEGAL_SECTION_TITLES.refund })).toBeVisible();
    await expect(page.getByRole("heading", { name: LEGAL_SECTION_TITLES.distance })).toBeVisible();
    await expect(page.getByRole("heading", { name: LEGAL_SECTION_TITLES.terms })).toBeVisible();
    await expect(page.getByText(/Elektronik ortamda anında ifa/i)).toBeVisible();
    await expect(page.getByRole("link", { name: LEGAL_HOME_CTA })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ana sayfa" })).toBeVisible();
    await page.goto("/iletisim");
    await expect(page.getByRole("main").getByRole("link", { name: "destek@yetkin.ai" })).toBeVisible();
    await expect(page.getByRole("main").getByText(LEGAL_ENTITY.address)).toBeVisible();
    await expect(page.getByRole("main").getByText(LEGAL_ENTITY.taxOffice).first()).toBeVisible();
    await expect(page.getByRole("main").getByText(`${LEGAL_ENTITY.taxOffice} - ${LEGAL_ENTITY.vkn}`)).toBeVisible();
  });

  test("/legal/iade resmi kimliği, tek destek e-postasını ve cüzdan maddesini basar", async ({
    page,
  }) => {
    await page.goto("/legal/iade");
    await expect(page.getByRole("heading", { name: LEGAL_SECTION_TITLES.refund })).toBeVisible();
    await expect(page.getByText(LEGAL_HONESTY_BODY)).toBeVisible();
    await expect(page.getByRole("main").getByText("Destek e-posta:")).toHaveCount(1);
    await expect(
      page.getByRole("main").getByRole("link", { name: "destek@yetkin.ai", exact: true }),
    ).toHaveCount(1);
    await expect(
      page.getByText(
        "Platform cüzdanına yüklenen bakiyeler yalnızca platform içi hizmetlerde kullanılabilir; farklı bir banka hesabına nakit transferi yapılamaz. Hesabın kapatılması veya iade talebi durumunda, henüz harcanmamış olan bakiye yüklemenin yapıldığı orijinal kredi/banka kartına ödeme altyapısı üzerinden iade edilir.",
      ),
    ).toBeVisible();
    await expect(page.locator("[data-legal-colophon]")).toContainText("MERSİS No: 937068336100017");
    await expect(page.locator("[data-legal-colophon]")).toContainText(LEGAL_ENTITY.taxOffice);
    await expect(page.locator("[data-legal-colophon]")).toContainText(`VKN: ${LEGAL_ENTITY.vkn} / ${LEGAL_ENTITY.taxOffice}`);
    await expect(page.locator("[data-legal-colophon]")).toContainText(LEGAL_ENTITY.address);
    await expect(page.getByRole("link", { name: LEGAL_HOME_CTA })).toBeVisible();
  });

  test("yasal sayfa üst çıkışı anasayfaya döner", async ({ page }) => {
    await page.goto("/legal/gizlilik");
    await page.getByRole("link", { name: LEGAL_HOME_CTA }).click();
    await expect(page).toHaveURL(/\/(?:\?.*)?$/);
  });

  test("yasal sayfa URL'leri 200 döner", async ({ request }) => {
    for (const path of [
      "/legal/gizlilik",
      "/legal/cerez",
      "/legal/mesafeli-satis",
      "/legal/iade",
      "/legal/kullanim",
      "/iletisim",
    ]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), path).toBe(200);
    }
  });

  test("yasal şerit login/kayıt/inişte kaydırmadan tabanda durur", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: LEGAL_PAGE_TITLE });
    for (const path of ["/", "/login", "/register"]) {
      await page.goto(path);
      await expect(nav).toBeInViewport();
      for (const label of [
        "Gizlilik",
        "Çerez",
        "İade",
        "Mesafeli satış",
        "Kullanım şartları",
        "İletişim",
        "destek@yetkin.ai",
      ]) {
        await expect(nav.getByRole("link", { name: label, exact: true })).toBeInViewport();
      }
      if (path === "/") {
        await expect(page.getByRole("main").getByRole("link", { name: "Yasal metinler" })).toHaveCount(0);
        await expect(page.getByRole("main").getByRole("link", { name: "Mesafeli satış" })).toHaveCount(0);
      }
    }
    await page.goto("/login");
    const overflowY = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    expect(overflowY).toBeLessThanOrEqual(2);
  });
});
