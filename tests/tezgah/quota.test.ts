import { beforeEach, describe, expect, it } from "vitest";
import {
  TEZGAH_TETKIK_DATE_KEY,
  TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE,
  tezgahPoolQuotaLine,
  tezgahToolQuotaLine,
} from "@/lib/tezgah/catalog";
import {
  consumeTezgahQuota,
  peekTezgahQuota,
  refundTezgahQuota,
  resetTezgahQuotaForTests,
  tezgahDayKey,
  tezgahQuotaDateKey,
} from "@/lib/tezgah/quota";

const GUEST = "guest:203.0.113.8";
const MEMBER = "user_tezgah_1";
const AFTERNOON = new Date("2026-11-14T18:00:00+03:00");
const NEXT_MORNING = new Date("2026-11-15T00:10:00+03:00");

describe("tezgâh lite günlük kota", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("misafir günde 3 hak kullanır; bakmak hak düşürmez", async () => {
    expect(await peekTezgahQuota(GUEST, true, AFTERNOON, "lite")).toMatchObject({
      allowed: true,
      remaining: 3,
      limit: 3,
      used: 0,
      guest: true,
      poolKey: "lite",
    });
    expect((await peekTezgahQuota(GUEST, true, AFTERNOON, "lite")).remaining).toBe(3);
    expect(await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite")).toMatchObject({
      allowed: true,
      remaining: 2,
      used: 1,
    });
    expect((await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite")).remaining).toBe(1);
    expect(await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite")).toMatchObject({
      allowed: true,
      remaining: 0,
      used: 3,
    });
    expect(await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite")).toMatchObject({
      allowed: false,
      remaining: 0,
      used: 3,
    });
  });

  it("üyeye günde 3 hak verir ve aktörler birbirine karışmaz", async () => {
    expect((await consumeTezgahQuota(MEMBER, false, AFTERNOON, null, "lite")).remaining).toBe(2);
    expect((await consumeTezgahQuota(MEMBER, false, AFTERNOON, null, "lite")).remaining).toBe(1);
    expect((await consumeTezgahQuota(MEMBER, false, AFTERNOON, null, "lite")).remaining).toBe(0);
    expect((await consumeTezgahQuota(MEMBER, false, AFTERNOON, null, "lite")).allowed).toBe(false);
    expect((await peekTezgahQuota(GUEST, true, AFTERNOON, "lite")).remaining).toBe(3);
  });

  it("İstanbul gece yarısında lite sayacı sıfırlanır", async () => {
    await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite");
    expect(tezgahDayKey(AFTERNOON)).toBe("2026-11-14");
    expect(tezgahDayKey(NEXT_MORNING)).toBe("2026-11-15");
    expect(await peekTezgahQuota(GUEST, true, NEXT_MORNING, "lite")).toMatchObject({
      allowed: true,
      remaining: 3,
      used: 0,
    });
  });

  it("boş üretim hakkı geri yazar", async () => {
    await consumeTezgahQuota(MEMBER, false, AFTERNOON, null, "lite");
    const restored = await refundTezgahQuota(MEMBER, false, AFTERNOON, "free", "lite");
    expect(restored.remaining).toBe(3);
    expect((await refundTezgahQuota(MEMBER, false, AFTERNOON, "free", "lite")).remaining).toBe(3);
  });

  it("lite ve tetkik havuzları birbirine karışmaz", async () => {
    await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite");
    await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite");
    await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "lite");
    expect((await peekTezgahQuota(GUEST, true, AFTERNOON, "lite")).allowed).toBe(false);
    expect(await peekTezgahQuota(GUEST, true, AFTERNOON, "tetkik")).toMatchObject({
      allowed: true,
      remaining: 1,
      limit: 1,
      poolKey: "tetkik",
    });
  });
});

describe("tezgâh tetkik ömür boyu kota", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("aktör başına ömür boyu 1 hak verir; gece yarısı yenilemez", async () => {
    expect(tezgahQuotaDateKey("tetkik", AFTERNOON)).toBe(TEZGAH_TETKIK_DATE_KEY);
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
    expect(await peekTezgahQuota(GUEST, true, NEXT_MORNING, "tetkik")).toMatchObject({
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
    expect(await consumeTezgahQuota(GUEST, true, AFTERNOON, null, "free_template")).toMatchObject({
      allowed: true,
      unlimited: true,
    });
  });

  it("rozet metinleri havuza göre değişir", () => {
    expect(tezgahPoolQuotaLine("tetkik", 1, 1)).toBe("Kalan ücretsiz analiz hakkınız: 1 / 1");
    expect(tezgahPoolQuotaLine("tetkik", 0, 1)).toBe("0 / 1 — Pro veya Kredi gerekli");
    expect(tezgahPoolQuotaLine("lite", 2, 3)).toBe("Günlük ücretsiz hakkınız: 2 / 3");
    expect(tezgahToolQuotaLine("dukkan", 1, 1)).toBe("Ücretsiz kullanım (Kota düşmez)");
    expect(tezgahToolQuotaLine("studio-photo", 0, 0)).toBe("Ücretsiz kullanım (Kota düşmez)");
  });
});
