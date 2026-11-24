import { beforeEach, describe, expect, it } from "vitest";
import { TEZGAH_FAIL_MESSAGE } from "@/lib/tezgah/catalog";
import { DUKKAN_FILENAME, DUKKAN_ZIP_FILENAME } from "@/lib/tezgah/dukkan/copy";
import { generateDukkanPage } from "@/lib/tezgah/dukkan/engine";
import { buildDukkanPack, renderDukkanHtml } from "@/lib/tezgah/dukkan/render";
import {
  normalizeDukkanWhatsapp,
  parseDukkanServices,
  readDukkanDraft,
  type DukkanGenerateRequest,
} from "@/lib/tezgah/dukkan/schema";
import { peekTezgahQuota, resetTezgahQuotaForTests } from "@/lib/tezgah/quota";

const NOW = new Date("2026-11-14T12:00:00+03:00");

const REQUEST: DukkanGenerateRequest = {
  businessName: "Karaoğlu Fırın",
  sector: "restoran",
  place: "Kadıköy",
  whatsapp: "5321112233",
  services: "Taze ekmek\nPoğaça\nSimit",
  tone: "dogal",
  packages: "",
  hours: "",
  faq: "",
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

  it("kota düşürmez; bozuk mühür üretimi reddeder", async () => {
    const actorId = "guest:dukkan-engine";
    for (let index = 0; index < 5; index += 1) {
      const page = await generateDukkanPage(
        { actorId, guest: true, request: REQUEST },
        { now: () => NOW },
      );
      expect(page.ok).toBe(true);
      if (!page.ok) {
        return;
      }
      expect(page.seals.every((seal) => seal.passed)).toBe(true);
      expect(page.filename).toBe(DUKKAN_FILENAME);
      expect(page.zipFilename).toBe(DUKKAN_ZIP_FILENAME);
      expect(page.zipBase64.length).toBeGreaterThan(20);
      expect(page.remaining).toBe(1);
      expect(page.limit).toBe(1);
      expect(page.html).toContain("https://wa.me/905321112233");
      expect(page.html).not.toMatch(/100\s*\/\s*100/);
    }
    expect(await peekTezgahQuota(actorId, true, NOW, "lite")).toMatchObject({
      remaining: 3,
      used: 0,
    });

    const fresh = "guest:dukkan-refund";
    const broken = await generateDukkanPage(
      { actorId: fresh, guest: true, request: REQUEST },
      {
        now: () => NOW,
        renderPack: () => ({
          html: "<html><title>yok</title></html>",
          guide: "",
          zip: new Uint8Array([1]),
          zipFilename: DUKKAN_ZIP_FILENAME,
        }),
      },
    );
    expect(broken).toMatchObject({ ok: false, status: 503, error: TEZGAH_FAIL_MESSAGE, remaining: 1 });

    const built = readDukkanDraft(REQUEST);
    expect(built).not.toBeNull();
    if (!built) {
      return;
    }
    const clean = renderDukkanHtml(built);
    const poisoned = await generateDukkanPage(
      { actorId: fresh, guest: true, request: REQUEST },
      {
        now: () => NOW,
        renderPack: () => ({
          html: `${clean}<script>alert(1)</script>`,
          guide: "",
          zip: new Uint8Array([1]),
          zipFilename: DUKKAN_ZIP_FILENAME,
        }),
      },
    );
    expect(poisoned).toMatchObject({ ok: false, status: 503, error: TEZGAH_FAIL_MESSAGE, remaining: 1 });

    const oversized = await generateDukkanPage(
      { actorId: fresh, guest: true, request: REQUEST },
      {
        now: () => NOW,
        renderPack: () => ({
          html: `${clean}<!--${"x".repeat(520 * 1024)}-->`,
          guide: "",
          zip: new Uint8Array([1]),
          zipFilename: DUKKAN_ZIP_FILENAME,
        }),
      },
    );
    expect(oversized).toMatchObject({ ok: false, status: 503, remaining: 1 });

    const thrown = await generateDukkanPage(
      { actorId: fresh, guest: true, request: REQUEST },
      {
        now: () => NOW,
        renderPack: () => {
          throw new Error("basım");
        },
      },
    );
    expect(thrown).toMatchObject({ ok: false, status: 503, remaining: 1 });

    const invalid = await generateDukkanPage(
      { actorId: fresh, guest: true, request: { ...REQUEST, whatsapp: "0212 000 00 00" } },
      { now: () => NOW },
    );
    expect(invalid).toMatchObject({ ok: false, status: 400, remaining: 1 });

    const again = await generateDukkanPage(
      { actorId: fresh, guest: true, request: REQUEST },
      { now: () => NOW },
    );
    expect(again.ok).toBe(true);
    if (again.ok) {
      expect(again.remaining).toBe(1);
      expect(buildDukkanPack(built).zip.length).toBeGreaterThan(100);
    }
  });

  it("üye için de sınırsız şablon basımı yapar", async () => {
    const actorId = "user-dukkan";
    for (let index = 0; index < 4; index += 1) {
      const result = await generateDukkanPage(
        { actorId, guest: false, request: REQUEST },
        { now: () => NOW },
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.remaining).toBe(1);
        expect(result.limit).toBe(1);
      }
    }
  });
});
