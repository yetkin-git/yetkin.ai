import { describe, expect, it } from "vitest";
import {
  TEZGAH_TOOL_IDS,
  TEZGAH_DESK_TOOL_IDS,
  parseTezgahToolParam,
  readTezgahPrefill,
  resolveTezgahDeskTool,
  tezgahDeskHref,
  tezgahRelocatedOsHref,
  tezgahToolAnchorPath,
  tezgahToolHref,
} from "@/lib/tezgah/catalog";

describe("tezgâh araç sorgusu", () => {
  it("on kimliği kabul eder ve href biçimini kilitler", () => {
    expect(TEZGAH_TOOL_IDS).toEqual([
      "ecommerce",
      "proposal",
      "grant",
      "tetkik",
      "dukkan",
      "reklam",
      "pazaryeri",
      "studio-photo",
      "technical-drawing",
      "saas-builder",
    ]);
    for (const id of TEZGAH_TOOL_IDS) {
      expect(parseTezgahToolParam(id)).toBe(id);
      expect(parseTezgahToolParam(`  ${id}  `)).toBe(id);
      expect(tezgahToolHref(id)).toBe(`/tezgah?tool=${id}`);
      expect(tezgahToolAnchorPath(id)).toBe(`/tezgah#${id}`);
    }
  });

  it("yabancı ve boş değeri düşürür", () => {
    expect(parseTezgahToolParam("studio")).toBeNull();
    expect(parseTezgahToolParam("")).toBeNull();
    expect(parseTezgahToolParam("   ")).toBeNull();
    expect(parseTezgahToolParam(null)).toBeNull();
    expect(parseTezgahToolParam(undefined)).toBeNull();
    expect(parseTezgahToolParam("TETKIK")).toBeNull();
    expect(parseTezgahToolParam("tetkik&x=1")).toBeNull();
    expect(parseTezgahToolParam("hibe")).toBe("grant");
    expect(parseTezgahToolParam("studio-photo")).toBe("studio-photo");
    expect(tezgahRelocatedOsHref("grant")).toBe("/panel/hibe?sekme=proje");
    expect(tezgahRelocatedOsHref("hibe")).toBe("/panel/hibe?sekme=proje");
    expect(tezgahRelocatedOsHref("ecommerce")).toBe("/panel/e-ticaret?sekme=havuz");
    expect(tezgahRelocatedOsHref("proposal")).toBeNull();
    expect(resolveTezgahDeskTool("ecommerce")).toBe("proposal");
    expect(resolveTezgahDeskTool(null)).toBe("proposal");
    expect([...TEZGAH_DESK_TOOL_IDS]).toEqual([
      "proposal",
      "tetkik",
      "dukkan",
      "reklam",
      "pazaryeri",
      "studio-photo",
      "technical-drawing",
      "saas-builder",
    ]);
    expect(tezgahDeskHref("studio-photo", "task-1234")).toBe("/tezgah?tool=studio-photo&desk=task-1234");
    expect(tezgahDeskHref("technical-drawing", "kısa")).toBe("/tezgah?tool=technical-drawing");
  });

  it("sorgu alanını yalnız katalog alanı kadar doldurur", () => {
    const params = new URLSearchParams({
      tool: "hibe",
      businessName: "Karaoğlu",
      audience: "mevcut_kobi",
      investmentFocus: "ihracat",
      provinceCode: "yok",
    });
    expect(readTezgahPrefill("grant", params)).toEqual({
      businessName: "Karaoğlu",
      audience: "mevcut_kobi",
      investmentFocus: "ihracat",
    });
  });
});
