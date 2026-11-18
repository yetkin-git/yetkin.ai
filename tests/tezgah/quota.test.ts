import { beforeEach, describe, expect, it } from "vitest";
import {
  consumeTezgahQuota,
  peekTezgahQuota,
  refundTezgahQuota,
  resetTezgahQuotaForTests,
  tezgahDayKey,
} from "@/lib/tezgah/quota";

const GUEST = "guest:203.0.113.8";
const MEMBER = "user_tezgah_1";
const AFTERNOON = new Date("2026-11-14T18:00:00+03:00");
const NEXT_MORNING = new Date("2026-11-15T00:10:00+03:00");

describe("tezgâh günlük kota", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("misafir günde 3 hak kullanır; bakmak hak düşürmez", async () => {
    expect(await peekTezgahQuota(GUEST, true, AFTERNOON)).toMatchObject({
      allowed: true,
      remaining: 3,
      limit: 3,
      used: 0,
      guest: true,
    });
    expect((await peekTezgahQuota(GUEST, true, AFTERNOON)).remaining).toBe(3);
    expect(await consumeTezgahQuota(GUEST, true, AFTERNOON)).toMatchObject({
      allowed: true,
      remaining: 2,
      used: 1,
    });
    expect((await consumeTezgahQuota(GUEST, true, AFTERNOON)).remaining).toBe(1);
    expect(await consumeTezgahQuota(GUEST, true, AFTERNOON)).toMatchObject({
      allowed: true,
      remaining: 0,
      used: 3,
    });
    expect(await consumeTezgahQuota(GUEST, true, AFTERNOON)).toMatchObject({
      allowed: false,
      remaining: 0,
      used: 3,
    });
  });

  it("üyeye günde 3 hak verir ve aktörler birbirine karışmaz", async () => {
    expect((await consumeTezgahQuota(MEMBER, false, AFTERNOON)).remaining).toBe(2);
    expect((await consumeTezgahQuota(MEMBER, false, AFTERNOON)).remaining).toBe(1);
    expect((await consumeTezgahQuota(MEMBER, false, AFTERNOON)).remaining).toBe(0);
    expect((await consumeTezgahQuota(MEMBER, false, AFTERNOON)).allowed).toBe(false);
    expect((await peekTezgahQuota(GUEST, true, AFTERNOON)).remaining).toBe(3);
  });

  it("İstanbul gece yarısında sayaç sıfırlanır", async () => {
    await consumeTezgahQuota(GUEST, true, AFTERNOON);
    expect(tezgahDayKey(AFTERNOON)).toBe("2026-11-14");
    expect(tezgahDayKey(NEXT_MORNING)).toBe("2026-11-15");
    expect(await peekTezgahQuota(GUEST, true, NEXT_MORNING)).toMatchObject({
      allowed: true,
      remaining: 3,
      used: 0,
    });
  });

  it("boş üretim hakkı geri yazar", async () => {
    await consumeTezgahQuota(MEMBER, false, AFTERNOON);
    const restored = await refundTezgahQuota(MEMBER, false, AFTERNOON);
    expect(restored.remaining).toBe(3);
    expect((await refundTezgahQuota(MEMBER, false, AFTERNOON)).remaining).toBe(3);
  });
});
