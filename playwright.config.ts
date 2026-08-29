import { resolve } from "node:path";
import dotenv from "dotenv";
import { defineConfig, devices } from "@playwright/test";

dotenv.config({ path: resolve(".env.local"), quiet: true });
dotenv.config({ quiet: true });

const BASE_URL = process.env.E2E_BASE_URL?.trim() || "http://127.0.0.1:3000";
const MANAGES_OWN_SERVER = !process.env.E2E_BASE_URL?.trim();

/**
 * E2E kapısı.
 * HTTP: oturum ipucu, ilan tezgâhı, hukuk yüzeyi, kenar 401 — mevcut `next dev`
 * (varsayılan :3000) yeniden kullanılır; Next 16 aynı dizinde ikinci dev kilidi vardır.
 * Nakit: freelancer listing → fiyat kilidi + emanet → release bellek portunda koşar
 * (canlı Auth/Postgres tohumu istemez; LOCAL_MOCK_AUTH yok).
 * T4: kayıt yüzeyi + pulse/top-up 401 + bellek PayTR clearing → emanet → vize.
 * Canlı/sandbox HTTP yalnız E2E_CASH_SANDBOX=1 + bearer (yeşil boyama yok).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  outputDir: "./test-results/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: MANAGES_OWN_SERVER ? 120_000 : 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    locale: "tr-TR",
    timezoneId: "Europe/Istanbul",
  },
  projects: [
    {
      name: "kapi",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: MANAGES_OWN_SERVER
    ? {
        command: "npx next dev --hostname 127.0.0.1 --port 3000",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: "pipe",
        stderr: "pipe",
      }
    : undefined,
});
