import { beforeEach, describe, expect, it } from "vitest";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE, TEZGAH_MEMBER_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { DUKKAN_FILENAME } from "@/lib/tezgah/dukkan/copy";
import { generateDukkanPage } from "@/lib/tezgah/dukkan/engine";
import { renderDukkanHtml } from "@/lib/tezgah/dukkan/render";
import {
  normalizeDukkanWhatsapp,
  parseDukkanServices,
  readDukkanDraft,
  type DukkanGenerateRequest,
} from "@/lib/tezgah/dukkan/schema";
import { resetTezgahQuotaForTests } from "@/lib/tezgah/quota";

const NOW = new Date("2026-11-14T12:00:00+03:00");

const REQUEST: DukkanGenerateRequest = {
  businessName: "Karaoğlu Fırın",
  sector: "restoran",
  place: "Kadıköy",
  whatsapp: "5321112233",
  services: "Taze ekmek\nPoğaça\nSimit",
  tone: "dogal",
};

describe("dijital dükkan motoru", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("üç numara biçimini 90… yapar; sabit hat ve eksik hizmeti reddeder", () => {
    expect(normalizeDukkanWhatsapp("0532 111 22 33")).toBe("905321112233");
    expect(normalizeDukkanWhatsapp("5321112233")).toBe("905321112233");
    expect(normalizeDukkanWhatsapp("+90 532 111 22 33")).toBe("905321112233");
    expect(normalizeDukkanWhatsapp("0212 111 22 33")).toBeNull();
    expect(parseDukkanServices("Ekmek\n\nPoğaça\nSimit")).toEqual(["Ekmek", "Poğaça", "Simit"]);
    expect(parseDukkanServices("Ekmek\nPoğaça")).toBeNull();
  });

  it("hak düşer, ikinci misafir çağrısı 429 olur, bozuk öz-skor hakkı geri yazar", async () => {
    const actorId = "guest:dukkan-engine";
    const first = await generateDukkanPage(
      { actorId, guest: true, request: REQUEST },
      { now: () => NOW },
    );
    expect(first.ok).toBe(true);
    if (!first.ok) {
      return;
    }
    expect(first.score).toBe(100);
    expect(first.filename).toBe(DUKKAN_FILENAME);
    expect(first.remaining).toBe(2);
    expect(first.limit).toBe(3);
    expect(first.html).toContain("https://wa.me/905321112233");

    for (let extra = 0; extra < 2; extra += 1) {
      const mid = await generateDukkanPage({ actorId, guest: true, request: REQUEST }, { now: () => NOW });
      expect(mid.ok).toBe(true);
    }
    const blocked = await generateDukkanPage(
      { actorId, guest: true, request: REQUEST },
      { now: () => NOW },
    );
    expect(blocked).toMatchObject({ ok: false, status: 429, error: TEZGAH_GUEST_QUOTA_MESSAGE, remaining: 0 });

    const fresh = "guest:dukkan-refund";
    const broken = await generateDukkanPage(
      { actorId: fresh, guest: true, request: REQUEST },
      { now: () => NOW, render: () => "<html><title>yok</title></html>" },
    );
    expect(broken).toMatchObject({ ok: false, status: 503, error: TEZGAH_FAIL_MESSAGE, remaining: 3 });

    const built = readDukkanDraft(REQUEST);
    expect(built).not.toBeNull();
    if (!built) {
      return;
    }
    const clean = renderDukkanHtml(built);
    const poisoned = await generateDukkanPage(
      { actorId: fresh, guest: true, request: REQUEST },
      { now: () => NOW, render: () => `${clean}<script>alert(1)</script>` },
    );
    expect(poisoned).toMatchObject({ ok: false, status: 503, error: TEZGAH_FAIL_MESSAGE, remaining: 3 });

    const oversized = await generateDukkanPage(
      { actorId: fresh, guest: true, request: REQUEST },
      { now: () => NOW, render: () => `${clean}<!--${"x".repeat(520 * 1024)}-->` },
    );
    expect(oversized).toMatchObject({ ok: false, status: 503, remaining: 3 });

    const thrown = await generateDukkanPage(
      { actorId: fresh, guest: true, request: REQUEST },
      {
        now: () => NOW,
        render: () => {
          throw new Error("basım");
        },
      },
    );
    expect(thrown).toMatchObject({ ok: false, status: 503, remaining: 3 });

    const invalid = await generateDukkanPage(
      { actorId: fresh, guest: true, request: { ...REQUEST, whatsapp: "0212 000 00 00" } },
      { now: () => NOW },
    );
    expect(invalid).toMatchObject({ ok: false, status: 400, remaining: 3 });

    const again = await generateDukkanPage(
      { actorId: fresh, guest: true, request: REQUEST },
      { now: () => NOW },
    );
    expect(again.ok).toBe(true);
    if (again.ok) {
      expect(again.remaining).toBe(2);
    }
  });

  it("üyenin üç hakkından sonra 429 döner", async () => {
    const actorId = "user-dukkan";
    for (let index = 0; index < 3; index += 1) {
      const result = await generateDukkanPage(
        { actorId, guest: false, request: REQUEST },
        { now: () => NOW },
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.remaining).toBe(2 - index);
        expect(result.limit).toBe(3);
      }
    }
    const blocked = await generateDukkanPage(
      { actorId, guest: false, request: REQUEST },
      { now: () => NOW },
    );
    expect(blocked).toMatchObject({
      ok: false,
      status: 429,
      error: TEZGAH_MEMBER_QUOTA_MESSAGE,
      remaining: 0,
      limit: 3,
    });
  });
});
