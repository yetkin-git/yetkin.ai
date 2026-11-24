import { beforeEach, describe, expect, it } from "vitest";
import {
  TEZGAH_FREE_MONTHLY_CREDITS,
  TEZGAH_GUEST_DAILY_LIMIT,
  TEZGAH_PRO_MONTHLY_CREDITS,
  TEZGAH_PRO_QUOTA_MESSAGE,
  TEZGAH_TETKIK_DATE_KEY,
  TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE,
  tezgahPoolQuotaLine,
  tezgahPoolQuotaLineForLane,
  tezgahToolQuotaLine,
  tezgahToolQuotaLineForLane,
} from "@/lib/tezgah/catalog";
import {
  consumeTezgahQuota,
  peekTezgahQuota,
  refundTezgahQuota,
  resetTezgahQuotaForTests,
  tezgahDayKey,
  tezgahMonthKey,
  tezgahPreviousMonthKey,
  tezgahQuotaDateKey,
  tezgahQuotaPeriodKey,
  tezgahRolloverCredits,
} from "@/lib/tezgah/quota";
import { resetTezgahEntitlementReadersForTests, setTezgahEntitlementReadersForTests } from "@/lib/tezgah/paid-lane";

const GUEST = "guest:203.0.113.8";
const MEMBER = "user_tezgah_1";
const AFTERNOON = new Date("2026-11-14T18:00:00+03:00");
const NEXT_MORNING = new Date("2026-11-15T00:10:00+03:00");
const NEXT_MONTH = new Date("2026-12-01T00:10:00+03:00");
const PREVIOUS_MONTH = new Date("2026-10-20T12:00:00+03:00");

describe("tezgâh üye aylık kredi havuzu (S-01)", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("üye ayda 30 kredi kullanır; bakmak kredi düşürmez", async () => {
    expect(await peekTezgahQuota(MEMBER, false, AFTERNOON, "lite")).toMatchObject({
      allowed: true,
      remaining: 30,
      limit: 30,
      used: 0,
      guest: false,
      poolKey: "lite",
      periodKey: "2026-11",
    });
    expect((await peekTezgahQuota(MEMBER, false, AFTERNOON, "lite")).remaining).toBe(30);
    expect(await consumeTezgahQuota(MEMBER, false, AFTERNOON, null, "lite")).toMatchObject({
      allowed: true,
      remaining: 29,
      used: 1,
    });
    expect((await consumeTezgahQuota(MEMBER, false, AFTERNOON, null, "lite")).remaining).toBe(28);
  });

  it("periyot anahtarı üyede aylık (YYYY-MM), misafirde günlük (YYYY-MM-DD)", () => {
    expect(tezgahMonthKey(AFTERNOON)).toBe("2026-11");
    expect(tezgahDayKey(AFTERNOON)).toBe("2026-11-14");
    expect(tezgahQuotaPeriodKey("lite", AFTERNOON, false)).toBe("2026-11");
    expect(tezgahQuotaPeriodKey("lite", AFTERNOON, true)).toBe("2026-11-14");
    expect(tezgahQuotaPeriodKey("tetkik", AFTERNOON, false)).toBe(TEZGAH_TETKIK_DATE_KEY);
    expect(tezgahQuotaPeriodKey("tetkik", AFTERNOON, true)).toBe(TEZGAH_TETKIK_DATE_KEY);
    // Geriye dönük ad üye hattıyla aynıdır.
    expect(tezgahQuotaDateKey("lite", AFTERNOON)).toBe("2026-11");
    expect(tezgahPreviousMonthKey(NEXT_MONTH)).toBe("2026-11");
    expect(tezgahPreviousMonthKey(new Date("2026-01-15T12:00:00+03:00"))).toBe("2025-12");
  });

  it("ay geçişinde üye sayacı sıfırlanır, gün geçişinde sıfırlanmaz", async () => {
    await consumeTezgahQuota(MEMBER, false, AFTERNOON, null, "lite");
    // Ertesi gün: aynı ay, kredi düşmüş kalır.
    expect((await peekTezgahQuota(MEMBER, false, NEXT_MORNING, "lite")).remaining).toBe(29);
    // Yeni ay: taban havuz + %50 devir (29 kullanılmamış → 14 devreder → 44).
    const nextMonth = await peekTezgahQuota(MEMBER, false, NEXT_MONTH, "lite");
    expect(nextMonth.used).toBe(0);
    expect(nextMonth.rollover).toBe(14);
    expect(nextMonth.limit).toBe(TEZGAH_FREE_MONTHLY_CREDITS + 14);
  });

  it("devir %50 ve taban havuzun %50'siyle sınırlı", () => {
    // Hiç kullanmamış: 30 artık → 15 devreder (tavan 15).
    expect(tezgahRolloverCredits({ baseLimit: 30, previousUsed: 0 })).toBe(15);
    // 1 kullanmış: 29 artık → 14 devreder.
    expect(tezgahRolloverCredits({ baseLimit: 30, previousUsed: 1 })).toBe(14);
    // Tamamını kullanmış: 0 devreder.
    expect(tezgahRolloverCredits({ baseLimit: 30, previousUsed: 30 })).toBe(0);
    // Fazla kullanım negatife düşmez.
    expect(tezgahRolloverCredits({ baseLimit: 30, previousUsed: 40 })).toBe(0);
    // Önceki ay satırı yok: bedava kredi doğmaz.
    expect(tezgahRolloverCredits({ baseLimit: 30, previousUsed: null })).toBe(0);
    // Pro havuzu: 500 → tavan 250.
    expect(tezgahRolloverCredits({ baseLimit: 500, previousUsed: 0 })).toBe(250);
    expect(tezgahRolloverCredits({ baseLimit: 500, previousUsed: 480 })).toBe(10);
  });

  it("devir zincirleme birikmez: önceki ayın kendi kullanımı okunur", async () => {
    // Ekim'de 10 kredi kullan → 20 artık → Kasım'a 10 devreder.
    for (let i = 0; i < 10; i += 1) {
      await consumeTezgahQuota(MEMBER, false, PREVIOUS_MONTH, null, "lite");
    }
    const november = await peekTezgahQuota(MEMBER, false, AFTERNOON, "lite");
    expect(november.rollover).toBe(10);
    expect(november.limit).toBe(40);
  });

  it("boş üretim hakkı geri yazar", async () => {
    await consumeTezgahQuota(MEMBER, false, AFTERNOON, null, "lite");
    const restored = await refundTezgahQuota(MEMBER, false, AFTERNOON, "free", "lite");
    expect(restored.remaining).toBe(30);
    expect((await refundTezgahQuota(MEMBER, false, AFTERNOON, "free", "lite")).remaining).toBe(30);
  });

  it("lite ve tetkik havuzları birbirine karışmaz", async () => {
    for (let i = 0; i < 30; i += 1) {
      await consumeTezgahQuota(MEMBER, false, AFTERNOON, null, "lite");
    }
    expect((await peekTezgahQuota(MEMBER, false, AFTERNOON, "lite")).allowed).toBe(false);
    expect(await peekTezgahQuota(MEMBER, false, AFTERNOON, "tetkik")).toMatchObject({
      allowed: true,
      remaining: 1,
      limit: 1,
      poolKey: "tetkik",
    });
  });
});

describe("tezgâh misafir günlük tavanı (S-01 bilanço)", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("misafir günde 3 hak kullanır; aylık havuza bağlanmaz", async () => {
    expect(await peekTezgahQuota(GUEST, true, AFTERNOON, "lite")).toMatchObject({
      allowed: true,
      remaining: 3,
      limit: 3,
      used: 0,
      guest: true,
      periodKey: "2026-11-14",
    });
    expect(await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite")).toMatchObject({
      allowed: true,
      remaining: 2,
    });
    expect((await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite")).remaining).toBe(1);
    expect((await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite")).remaining).toBe(0);
    expect(await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite")).toMatchObject({
      allowed: false,
      remaining: 0,
    });
    // Misafir hattı 30 krediye yükselmez.
    expect(TEZGAH_GUEST_DAILY_LIMIT).toBe(3);
  });

  it("İstanbul gece yarısında misafir sayacı sıfırlanır", async () => {
    await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite");
    expect(await peekTezgahQuota(GUEST, true, NEXT_MORNING, "lite")).toMatchObject({
      allowed: true,
      remaining: 3,
      used: 0,
    });
  });
});

describe("tezgâh tetkik ömür boyu kota", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("aktör başına ömür boyu 1 hak verir; ay ve gün yenilemez", async () => {
    expect(await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "tetkik")).toMatchObject({
      allowed: true,
      remaining: 0,
      used: 1,
      limit: 1,
      poolKey: "tetkik",
    });
    expect(await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "tetkik")).toMatchObject({
      allowed: false,
      remaining: 0,
      error: TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE,
    });
    expect(await peekTezgahQuota(GUEST, true, NEXT_MONTH, "tetkik")).toMatchObject({
      allowed: false,
      remaining: 0,
      used: 1,
    });
  });

  it("free_template kota düşürmez", async () => {
    expect(await peekTezgahQuota(GUEST, true, AFTERNOON, "free_template")).toMatchObject({
      allowed: true,
      unlimited: true,
      remaining: 1,
    });
    expect(await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "free_template")).toMatchObject({
      allowed: true,
      unlimited: true,
    });
  });

  it("rozet metinleri kredi dilini basar", () => {
    expect(tezgahPoolQuotaLine("tetkik", 1, 1)).toBe("Kalan ücretsiz analiz hakkın: 1 / 1");
    expect(tezgahPoolQuotaLine("tetkik", 0, 1)).toBe("0 / 1 — Pro veya Kredi gerekli");
    expect(tezgahPoolQuotaLine("lite", 27, 30)).toBe("Kalan kredi: 27 / 30");
    expect(tezgahPoolQuotaLine("lite", 2, 3, true)).toBe("Bugünkü ücretsiz hakkın: 2 / 3");
    expect(tezgahToolQuotaLine("dukkan", 1, 1)).toBe("Ücretsiz kullanım (Kota düşmez)");
    expect(tezgahToolQuotaLine("studio-photo", 27, 30)).toBe("Kalan kredi: 27 / 30");
  });

  /**
   * S-01 — Pro hattı kendi aylık kredi dilini taşır; "ücretsiz kredi" cümlesi basılmaz.
   */
  it("Pro hattı aylık kredi dilini kullanır; ücretsiz cümlesi basılmaz", () => {
    expect(tezgahPoolQuotaLineForLane("lite", 487, TEZGAH_PRO_MONTHLY_CREDITS, "pro")).toBe(
      `Pro — aylık ${TEZGAH_PRO_MONTHLY_CREDITS} kredi · kalan 487`,
    );
    expect(
      tezgahToolQuotaLineForLane("proposal", 500, TEZGAH_PRO_MONTHLY_CREDITS, "pro"),
    ).not.toContain("ücretsiz");
    expect(tezgahPoolQuotaLineForLane("tetkik", 0, 1, "pro")).toContain("ömür boyu");
    expect(tezgahPoolQuotaLineForLane("lite", 27, 30)).toBe("Kalan kredi: 27 / 30");
    expect(tezgahPoolQuotaLineForLane("free_template", 1, 1, "pro")).toBe(
      "Ücretsiz kullanım (Kota düşmez)",
    );
  });

  it("Pro aktifken aylık sayacı gerçekten düşer ve tavanda durur", async () => {
    const PRO = "user_tezgah_pro";
    setTezgahEntitlementReadersForTests({ proActive: async () => true });
    try {
      const first = await consumeTezgahQuota(PRO, false, AFTERNOON, null, "lite");
      expect(first.lane).toBe("pro");
      expect(first.limit).toBe(TEZGAH_PRO_MONTHLY_CREDITS);
      expect(first.remaining).toBe(TEZGAH_PRO_MONTHLY_CREDITS - 1);
      expect(first.used).toBe(1);

      const peek = await peekTezgahQuota(PRO, false, AFTERNOON, "lite");
      expect(peek.remaining).toBe(TEZGAH_PRO_MONTHLY_CREDITS - 1);
      // Ücretsiz havuz (30) artık uygulanmaz.
      expect(peek.remaining).toBeGreaterThan(TEZGAH_FREE_MONTHLY_CREDITS);

      const tetkik = await consumeTezgahQuota(PRO, false, AFTERNOON, null, "tetkik");
      expect(tetkik.limit).toBe(1);
      expect(tetkik.remaining).toBe(0);
    } finally {
      resetTezgahEntitlementReadersForTests();
    }
  });

  it("Pro tavanı dolunca ücretsiz kredi mesajı değil Pro mesajı basılır", async () => {
    const PRO = "user_tezgah_pro_full";
    setTezgahEntitlementReadersForTests({
      proActive: async () => true,
      credits: async () => null,
      catalogAmount: async () => null,
    });
    try {
      for (let i = 0; i < TEZGAH_PRO_MONTHLY_CREDITS; i += 1) {
        const row = await consumeTezgahQuota(PRO, false, AFTERNOON, null, "lite");
        expect(row.allowed).toBe(true);
      }
      const blocked = await consumeTezgahQuota(PRO, false, AFTERNOON, null, "lite");
      expect(blocked.allowed).toBe(false);
      expect(blocked.status).toBe(429);
      expect(blocked.error).toBe(TEZGAH_PRO_QUOTA_MESSAGE);
      expect(blocked.error).not.toContain("ücretsiz");
      expect(blocked.lane).toBe("pro");
    } finally {
      resetTezgahEntitlementReadersForTests();
    }
  });
});
