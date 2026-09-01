import { expect, test } from "@playwright/test";

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

    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByText("Giriş henüz bağlanmadı")).toHaveCount(0);
    await expect(page.getByLabel("E-posta")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Şifre" })).toBeVisible();

    const jobs = await request.post("/api/freelancer/jobs", {
      data: {
        title: "Oturumsuz ilan",
        brief: "Oturum olmadan nakit yazılmaz.",
        budgetMinor: 25_000,
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
    await expect(page.getByRole("heading", { name: "İş Pazarı" })).toBeVisible();
    await expect(page.getByText("Güvenli ödeme havuzuyla açık ilanlara teklif ver.")).toBeVisible();
    await expect(page.getByRole("link", { name: "İlan oluştur" }).first()).toBeVisible();

    const live = page.getByText(/Açık İlan/);
    const empty = page.getByText("Henüz açık ilan bulunmuyor");
    const unbound = page.getByText("İlan listesi şu an okunamadı");
    await expect(live.or(empty).or(unbound).first()).toBeVisible();

    await page.getByRole("link", { name: "İlan oluştur" }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Giriş" })).toBeVisible();
  });
});
