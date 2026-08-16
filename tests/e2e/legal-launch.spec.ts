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
});
