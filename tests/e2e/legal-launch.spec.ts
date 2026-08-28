import { expect, test } from "@playwright/test";
import {
  LEGAL_HONESTY_BODY,
  LEGAL_PAGE_TITLE,
  LEGAL_SECTION_TITLES,
} from "../../lib/copy/legal-launch";

test.describe("O13 lansman hukuk yüzeyi", () => {
  test("/legal dürüst kartı ve dört lansman bölümünü basar", async ({ page, request }) => {
    const headers = await request.get("/legal", { maxRedirects: 0 });
    expect(headers.status()).toBe(200);
    expect(headers.headers()["content-security-policy"] ?? "").toContain("default-src 'self'");

    await page.goto("/legal");
    await expect(page.getByRole("heading", { name: LEGAL_PAGE_TITLE })).toBeVisible();
    await expect(page.getByText(LEGAL_HONESTY_BODY)).toBeVisible();
    await expect(page.getByRole("heading", { name: LEGAL_SECTION_TITLES.kvkk })).toBeVisible();
    await expect(page.getByRole("heading", { name: LEGAL_SECTION_TITLES.refund })).toBeVisible();
    await expect(page.getByRole("heading", { name: LEGAL_SECTION_TITLES.distance })).toBeVisible();
    await expect(page.getByRole("heading", { name: LEGAL_SECTION_TITLES.terms })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ana sayfa" })).toBeVisible();
  });

  test("PayTR vitrin URL'leri 200 döner", async ({ request }) => {
    for (const path of [
      "/legal/gizlilik",
      "/legal/mesafeli-satis",
      "/legal/iade",
      "/legal/kullanim-sartlari",
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
      for (const label of ["Gizlilik", "İade", "Mesafeli satış", "Kullanım şartları", "İletişim"]) {
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
