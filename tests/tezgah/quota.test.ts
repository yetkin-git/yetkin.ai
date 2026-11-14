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

  it("misafir günde 1 hak kullanır; bakmak hak düşürmez", () => {
    expect(peekTezgahQuota(GUEST, true, AFTERNOON)).toMatchObject({
      allowed: true,
      remaining: 1,
      limit: 1,
      used: 0,
      guest: true,
    });
    expect(peekTezgahQuota(GUEST, true, AFTERNOON).remaining).toBe(1);
    const taken = consumeTezgahQuota(GUEST, true, AFTERNOON);
    expect(taken).toMatchObject({ allowed: true, remaining: 0, used: 1 });
    expect(consumeTezgahQuota(GUEST, true, AFTERNOON)).toMatchObject({
      allowed: false,
      remaining: 0,
      used: 1,
    });
  });

  it("üyeye günde 3 hak verir ve aktörler birbirine karışmaz", () => {
    expect(consumeTezgahQuota(MEMBER, false, AFTERNOON).remaining).toBe(2);
    expect(consumeTezgahQuota(MEMBER, false, AFTERNOON).remaining).toBe(1);
    expect(consumeTezgahQuota(MEMBER, false, AFTERNOON).remaining).toBe(0);
    expect(consumeTezgahQuota(MEMBER, false, AFTERNOON).allowed).toBe(false);
    expect(peekTezgahQuota(GUEST, true, AFTERNOON).remaining).toBe(1);
  });

  it("İstanbul gece yarısında sayaç sıfırlanır", () => {
    consumeTezgahQuota(GUEST, true, AFTERNOON);
    expect(tezgahDayKey(AFTERNOON)).toBe("2026-11-14");
    expect(tezgahDayKey(NEXT_MORNING)).toBe("2026-11-15");
    expect(peekTezgahQuota(GUEST, true, NEXT_MORNING)).toMatchObject({
      allowed: true,
      remaining: 1,
      used: 0,
    });
  });

  it("boş üretim hakkı geri yazar", () => {
    consumeTezgahQuota(MEMBER, false, AFTERNOON);
    const restored = refundTezgahQuota(MEMBER, false, AFTERNOON);
    expect(restored.remaining).toBe(3);
    expect(refundTezgahQuota(MEMBER, false, AFTERNOON).remaining).toBe(3);
  });
});
