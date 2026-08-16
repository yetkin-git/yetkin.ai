import { expect, test } from "@playwright/test";
import {
  E2E_CASH_CLIENT_ID,
  E2E_CASH_CLIENT_START_MINOR,
  E2E_CASH_FREELANCER_ID,
  E2E_CASH_GROSS_MINOR,
  E2E_CASH_PLATFORM_ID,
  runFreelancerCashJourney,
} from "../helpers/freelancer-cash-journey";

test.describe("O9 freelancer nakit & emanet yolculuğu", () => {
  test("giriş / oturum ipucu: /giris → /login; nakit API oturumsuz 401", async ({
    page,
    request,
  }) => {
    const redirect = await request.get("/giris", { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    expect(redirect.headers().location ?? "").toContain("/login");

    const loginHeaders = await request.get("/login", { maxRedirects: 0 });
    expect(loginHeaders.status()).toBe(200);
    expect(loginHeaders.headers()["content-security-policy"] ?? "").toContain(
      "default-src 'self'",
    );

    await page.goto("/giris");
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.getByRole("heading", { name: "Giriş" })).toBeVisible();

    const loginForm = page.locator("form");
    const loginBound = page.getByText("Giriş henüz bağlanmadı");
    await expect(loginForm.or(loginBound)).toBeVisible();

    const jobs = await request.post("/api/freelancer/jobs", {
      data: {
        title: "Oturumsuz ilan",
        brief: "Oturum olmadan nakit yazılmaz.",
        budgetMinor: 10_000,
      },
    });
    expect(jobs.status()).toBe(401);
    const jobsBody = (await jobs.json()) as { ok?: boolean; error?: string };
    expect(jobsBody.ok).toBe(false);
    expect(jobsBody.error).toBe("Oturum gerekli.");

    const accept = await request.post("/api/freelancer/jobs/e2e-job/accept", {
      data: { bidId: "e2e-bid" },
    });
    expect(accept.status()).toBe(401);
    const acceptBody = (await accept.json()) as { ok?: boolean; error?: string };
    expect(acceptBody.error).toBe("Oturum gerekli.");

    const release = await request.post("/api/freelancer/contracts/e2e-contract/release");
    expect(release.status()).toBe(401);
    const releaseBody = (await release.json()) as { ok?: boolean; error?: string };
    expect(releaseBody.error).toBe("Oturum gerekli.");
  });

  test("ilan listeleme: tezgâh, mutlu yol kopyası ve ilan ver yüzeyi", async ({ page }) => {
    const response = await page.goto("/freelancer");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Freelancer tezgâhı" })).toBeVisible();
    await expect(page.getByText("ilan → emanet → teslim")).toBeVisible();
    await expect(page.getByText("Bakiye kilitlidir").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "İlan oluştur" }).first()).toBeVisible();

    const live = page.getByText(/Canlı sicil/);
    const empty = page.getByText("Canlı ilan yok");
    const unbound = page.getByText("Liste henüz yüklenemedi");
    await expect(live.or(empty).or(unbound).first()).toBeVisible();
    await expect(page.getByText("Teslim onayı ile aktarılır").first()).toBeVisible();
    await expect(page.getByText("İtiraz durumunda tahkim süreci işler").first()).toBeVisible();

    await page.getByRole("link", { name: "İlan oluştur" }).first().click();
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.getByRole("heading", { name: "Giriş" })).toBeVisible();
  });

  test("bellek nakit yolu: ilan → fiyat kilidi & emanet → release bakiye aktarımı", async () => {
    const journey = await runFreelancerCashJourney();

    expect(journey.job.status).toBe("OPEN");
    expect(journey.bid.amountMinor).toBe(E2E_CASH_GROSS_MINOR);
    expect(journey.contract.status).toBe("FUNDED");
    expect(journey.holdBps).toBe(1_000);
    expect(journey.contract.grossMinor).toBe(E2E_CASH_GROSS_MINOR);
    expect(journey.holdMinor + journey.netMinor).toBe(journey.contract.grossMinor);
    expect(journey.holdMinor).toBe(1_000);
    expect(journey.netMinor).toBe(9_000);
    expect(journey.holdAfterAccept?.status).toBe("PENDING");
    expect(journey.holdAfterAccept?.grossMinor).toBe(E2E_CASH_GROSS_MINOR);

    expect(journey.released.status).toBe("RELEASED");
    expect(journey.holdAfterRelease?.status).toBe("RELEASED");
    expect(journey.ports.ledger.snapshot(E2E_CASH_CLIENT_ID).amountMinor).toBe(
      E2E_CASH_CLIENT_START_MINOR - E2E_CASH_GROSS_MINOR,
    );
    expect(journey.ports.ledger.snapshot(E2E_CASH_FREELANCER_ID).amountMinor).toBe(9_000);
    expect(journey.ports.ledger.snapshot(E2E_CASH_PLATFORM_ID).amountMinor).toBe(1_000);
  });
});
