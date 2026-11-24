import { beforeEach, describe, expect, it } from "vitest";
import { TEZGAH_PRO_QUOTA_MESSAGE, TEZGAH_PRO_MONTHLY_CREDITS } from "@/lib/tezgah/catalog";
import {
  consumeTezgahQuota,
  peekTezgahQuota,
  refundTezgahQuota,
  resetTezgahQuotaForTests,
  type TezgahQuotaCommand,
} from "@/lib/tezgah/quota";
import {
  resetTezgahEntitlementReadersForTests,
  setTezgahEntitlementReadersForTests,
  tezgahRequestHash,
} from "@/lib/tezgah/paid-lane";

const NOW = new Date("2026-11-14T12:00:00+03:00");
const MEMBER = "user_kota_simetri";
const GUEST = "guest:203.0.113.77";

function commandFor(intent: string, body: unknown): TezgahQuotaCommand {
  return { key: intent, requestHash: tezgahRequestHash(body) };
}

describe("Y1 — kota Idempotency çift düşümü engeller (ücretsiz hat)", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("aynı anahtar + aynı gövde ikinci kez kredi düşmez", async () => {
    const body = { tool: "proposal", jobPost: "Vitrin metni", expertise: "Metin" };
    const command = commandFor("11111111-1111-4111-8111-111111111111", body);

    const first = await consumeTezgahQuota(MEMBER, false, NOW, command, "lite");
    expect(first).toMatchObject({ allowed: true, remaining: 29, used: 1 });

    const replay = await consumeTezgahQuota(MEMBER, false, NOW, command, "lite");
    expect(replay).toMatchObject({ allowed: true, remaining: 29, used: 1 });

    // Üçüncü tekrar da sayılmaz.
    const again = await consumeTezgahQuota(MEMBER, false, NOW, command, "lite");
    expect(again.used).toBe(1);
    expect((await peekTezgahQuota(MEMBER, false, NOW, "lite")).remaining).toBe(29);
  });

  it("aynı anahtar + farklı gövde 400 conflict döner ve kredi düşmez", async () => {
    const key = "22222222-2222-4222-8222-222222222222";
    const first = await consumeTezgahQuota(
      MEMBER,
      false,
      NOW,
      commandFor(key, { a: 1 }),
      "lite",
    );
    expect(first.used).toBe(1);

    const conflict = await consumeTezgahQuota(
      MEMBER,
      false,
      NOW,
      commandFor(key, { a: 2 }),
      "lite",
    );
    expect(conflict).toMatchObject({ allowed: false, status: 400 });
    expect(conflict.error).toContain("Idempotency-Key");
    expect((await peekTezgahQuota(MEMBER, false, NOW, "lite")).remaining).toBe(29);
  });

  it("farklı anahtarlar birbirini engellemez", async () => {
    await consumeTezgahQuota(MEMBER, false, NOW, commandFor("k1", { n: 1 }), "lite");
    await consumeTezgahQuota(MEMBER, false, NOW, commandFor("k2", { n: 2 }), "lite");
    expect((await peekTezgahQuota(MEMBER, false, NOW, "lite")).remaining).toBe(28);
  });

  it("misafir hattı da idempotenttir", async () => {
    const command = commandFor("guest-key-1", { url: "https://ornek.com" });
    await consumeTezgahQuota(GUEST, true, NOW, command, "lite");
    const replay = await consumeTezgahQuota(GUEST, true, NOW, command, "lite");
    expect(replay).toMatchObject({ allowed: true, remaining: 2, used: 1 });
  });

  it("iade komut anahtarını unutur; yeniden deneme yeni düşüm alır", async () => {
    const command = commandFor("33333333-3333-4333-8333-333333333333", { b: 1 });
    await consumeTezgahQuota(MEMBER, false, NOW, command, "lite");
    const restored = await refundTezgahQuota(MEMBER, false, NOW, "free", "lite", { command });
    expect(restored.remaining).toBe(30);

    const retry = await consumeTezgahQuota(MEMBER, false, NOW, command, "lite");
    expect(retry).toMatchObject({ allowed: true, used: 1, remaining: 29 });
  });
});

describe("K3 — Pro hattı boş yanıtta krediyi geri yazar", () => {
  const PRO = "user_kota_pro_simetri";

  beforeEach(() => {
    resetTezgahQuotaForTests();
    setTezgahEntitlementReadersForTests({ proActive: async () => true });
  });

  it("Pro sayacı consume ile artar, refund ile aynı değere döner", async () => {
    try {
      const slot = await consumeTezgahQuota(PRO, false, NOW, null, "lite");
      expect(slot.lane).toBe("pro");
      expect(slot.used).toBe(1);
      expect(slot.remaining).toBe(TEZGAH_PRO_MONTHLY_CREDITS - 1);

      const restored = await refundTezgahQuota(PRO, false, NOW, "pro", "lite");
      expect(restored.lane).toBe("pro");
      expect(restored.used).toBe(0);
      expect(restored.remaining).toBe(TEZGAH_PRO_MONTHLY_CREDITS);

      // Peek da aynı gerçeği okur: kredi gerçekten iade edildi.
      const peek = await peekTezgahQuota(PRO, false, NOW, "lite");
      expect(peek.used).toBe(0);
      expect(peek.remaining).toBe(TEZGAH_PRO_MONTHLY_CREDITS);
    } finally {
      resetTezgahEntitlementReadersForTests();
    }
  });

  it("Pro iadesi komut anahtarını da unutur (aynı niyet yeniden sayılır)", async () => {
    try {
      const command = commandFor("44444444-4444-4444-8444-444444444444", { p: 1 });
      const first = await consumeTezgahQuota(PRO, false, NOW, command, "lite");
      expect(first.used).toBe(1);

      const restored = await refundTezgahQuota(PRO, false, NOW, "pro", "lite", { command });
      expect(restored.used).toBe(0);

      const retry = await consumeTezgahQuota(PRO, false, NOW, command, "lite");
      expect(retry.used).toBe(1);
    } finally {
      resetTezgahEntitlementReadersForTests();
    }
  });

  it("Pro sayacı sıfırın altına inmez", async () => {
    try {
      const first = await refundTezgahQuota(PRO, false, NOW, "pro", "lite");
      expect(first.used).toBe(0);
      const second = await refundTezgahQuota(PRO, false, NOW, "pro", "lite");
      expect(second.used).toBe(0);
      expect(second.remaining).toBe(TEZGAH_PRO_MONTHLY_CREDITS);
    } finally {
      resetTezgahEntitlementReadersForTests();
    }
  });

  it("Pro tavanı dolunca mesaj Pro cümlesidir, 'ücretsiz' demez", async () => {
    try {
      for (let index = 0; index < TEZGAH_PRO_MONTHLY_CREDITS; index += 1) {
        const row = await consumeTezgahQuota(PRO, false, NOW, null, "lite");
        expect(row.allowed).toBe(true);
      }
      const blocked = await consumeTezgahQuota(PRO, false, NOW, null, "lite");
      expect(blocked.allowed).toBe(false);
      expect(blocked.error).toBe(TEZGAH_PRO_QUOTA_MESSAGE);
      expect(blocked.error).not.toContain("ücretsiz");
    } finally {
      resetTezgahEntitlementReadersForTests();
    }
  });
});

describe("K3 / Y7 — kredi hattı iade simetrisi", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("ücretsiz havuz tükenince kredi varsa kredi hattı denenir (test sürecinde kapalı)", async () => {
    setTezgahEntitlementReadersForTests({
      proActive: async () => false,
      credits: async () => ({ remaining: 4, unitMinor: 5_900 }),
      catalogAmount: async () => 59_000,
    });
    try {
      for (let index = 0; index < 30; index += 1) {
        await consumeTezgahQuota(MEMBER, false, NOW, null, "lite");
      }
      const credit = await consumeTezgahQuota(MEMBER, false, NOW, null, "lite");
      // Kredi hattı `beginTezgahCreditHold` üzerinden açılır; test sürecinde
      // bilinçli olarak kapalıdır (gerçek defter yazımı yok). Önemli olan:
      // ücretsiz havuz tükendiğinde istek sessizce geçmez ve sayaç uydurulmaz.
      expect(credit.lane).toBe("closed");
      expect(credit.error).toBeTruthy();
      expect(credit.used).toBe(30);
    } finally {
      resetTezgahEntitlementReadersForTests();
    }
  });

  it("kredi hattında hold yoksa iade ücretsiz sayacı geri yazmaz", async () => {
    setTezgahEntitlementReadersForTests({
      proActive: async () => false,
      credits: async () => ({ remaining: 4, unitMinor: 5_900 }),
      catalogAmount: async () => 59_000,
    });
    try {
      for (let index = 0; index < 30; index += 1) {
        await consumeTezgahQuota(MEMBER, false, NOW, null, "lite");
      }
      await refundTezgahQuota(MEMBER, false, NOW, "credit", "lite");

      // Kredi hattı iadesi serbest bırakılacak bir hold bulamaz; bu yüzden
      // ücretsiz aylık sayaç **geri yazılmaz**. Kredi okuması kapatılınca
      // havuzun gerçekten 30/30 tüketilmiş olduğu görülür.
      setTezgahEntitlementReadersForTests({ proActive: async () => false, credits: async () => null });
      const free = await peekTezgahQuota(MEMBER, false, NOW, "lite");
      expect(free.used).toBe(30);
      expect(free.remaining).toBe(0);
      expect(free.allowed).toBe(false);
    } finally {
      resetTezgahEntitlementReadersForTests();
    }
  });
});
