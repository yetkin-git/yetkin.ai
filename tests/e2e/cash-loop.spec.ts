import { expect, test } from "@playwright/test";
import {
  CASH_LOOP_CLIENT_ID,
  CASH_LOOP_FREELANCER_ID,
  CASH_LOOP_GROSS_MINOR,
  CASH_LOOP_PLATFORM_ID,
  CASH_LOOP_TOP_UP_MINOR,
  runCashLoopJourney,
} from "../helpers/cash-loop-journey";

test.describe("T4 nakit döngüsü — kayıt → yükleme → emanet → vize", () => {
  test("oturumsuz pulse, yükleme ve emanet yazmaları 401; /kayit 308 durur", async ({
    request,
  }) => {
    const redirect = await request.get("/kayit", { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    expect(redirect.headers().location ?? "").toContain("/register");

    const register = await request.get("/register", { maxRedirects: 0 });
    expect(register.status()).toBe(200);
    expect(register.headers()["content-security-policy"] ?? "").toContain("default-src 'self'");

    const pulse = await request.get("/api/dashboard/pulse");
    expect(pulse.status()).toBe(401);
    const pulseBody = (await pulse.json()) as { ok?: boolean; error?: string };
    expect(pulseBody.ok).toBe(false);
    expect(pulseBody.error).toBe("Oturum gerekli.");

    const topUp = await request.post("/api/wallet/top-up", {
      data: { amountMinor: 10_000 },
      headers: { "Idempotency-Key": "00000000-0000-4000-8000-0000000000e2" },
    });
    expect(topUp.status()).toBe(401);
    const topUpBody = (await topUp.json()) as { ok?: boolean; error?: string };
    expect(topUpBody.error).toBe("Oturum gerekli.");

    const jobs = await request.post("/api/freelancer/jobs", {
      data: {
        title: "Oturumsuz T4 ilan",
        brief: "Nakit yazılmaz.",
        budgetMinor: 10_000,
      },
    });
    expect(jobs.status()).toBe(401);

    const release = await request.post("/api/freelancer/contracts/e2e-contract/release");
    expect(release.status()).toBe(401);
    const releaseBody = (await release.json()) as { ok?: boolean; error?: string };
    expect(releaseBody.error).toBe("Oturum gerekli.");
  });

  test("bellek nakit yolu: mock PayTR CREDIT → emanet → RELEASE → kariyer vizesi", async () => {
    const journey = await runCashLoopJourney();

    expect(journey.cleared.applied).toBe(true);
    expect(journey.cleared.status).toBe("CLEARED");
    expect(journey.released.status).toBe("RELEASED");
    expect(journey.holdAfterRelease?.status).toBe("RELEASED");
    expect(journey.visa.applied).toBe(true);
    expect(journey.visa.stamp.sourceKind).toBe("FREELANCER_RELEASE");
    expect(journey.visa.stamp.userId).toBe(CASH_LOOP_FREELANCER_ID);
    expect(journey.ports.ledger.snapshot(CASH_LOOP_CLIENT_ID).amountMinor).toBe(
      CASH_LOOP_TOP_UP_MINOR - CASH_LOOP_GROSS_MINOR,
    );
    expect(journey.ports.ledger.snapshot(CASH_LOOP_FREELANCER_ID).amountMinor).toBe(
      journey.netMinor,
    );
    expect(journey.ports.ledger.snapshot(CASH_LOOP_PLATFORM_ID).amountMinor).toBe(
      journey.holdMinor,
    );
  });

  test("canlı/sandbox HTTP nakit döngüsü yalnız E2E_CASH_SANDBOX=1 ile açılır", async ({
    request,
  }) => {
    const enabled = process.env.E2E_CASH_SANDBOX?.trim() === "1";
    test.skip(
      !enabled,
      "E2E_CASH_SANDBOX=1 yok — staging kimliği olmadan yeşil boyama yok",
    );

    const clientToken = process.env.E2E_CASH_CLIENT_BEARER?.trim() ?? "";
    const freelancerToken = process.env.E2E_CASH_FREELANCER_BEARER?.trim() ?? "";
    expect(clientToken, "E2E_CASH_CLIENT_BEARER zorunlu").toBeTruthy();
    expect(freelancerToken, "E2E_CASH_FREELANCER_BEARER zorunlu").toBeTruthy();

    const pulse = await request.get("/api/dashboard/pulse", {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    expect(pulse.status()).toBe(200);
    const pulseBody = (await pulse.json()) as {
      ok?: boolean;
      pulse?: { wallet?: { live?: boolean }; freelancer?: { live?: boolean }; career?: { live?: boolean } };
    };
    expect(pulseBody.ok).toBe(true);
    expect(pulseBody.pulse?.wallet?.live).toBe(true);
    expect(pulseBody.pulse?.freelancer?.live).toBe(true);
    expect(pulseBody.pulse?.career?.live).toBe(true);

    const idempotencyKey = crypto.randomUUID();
    const topUp = await request.post("/api/wallet/top-up", {
      data: { amountMinor: 10_000 },
      headers: {
        Authorization: `Bearer ${clientToken}`,
        "Idempotency-Key": idempotencyKey,
      },
    });
    expect([200, 503]).toContain(topUp.status());
    if (topUp.status() === 200) {
      const body = (await topUp.json()) as {
        ok?: boolean;
        sandboxMode?: boolean;
        mockCheckout?: boolean;
        merchantOid?: string;
      };
      expect(body.ok).toBe(true);
      expect(body.merchantOid).toBeTruthy();
    }
  });
});
