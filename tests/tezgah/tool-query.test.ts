import { describe, expect, it } from "vitest";
import {
  TEZGAH_TOOL_IDS,
  parseTezgahToolParam,
  tezgahToolAnchorPath,
  tezgahToolHref,
} from "@/lib/tezgah/catalog";

describe("tezgâh araç sorgusu", () => {
  it("yedi kimliği kabul eder ve href biçimini kilitler", () => {
    expect(TEZGAH_TOOL_IDS).toEqual([
      "ecommerce",
      "proposal",
      "grant",
      "tetkik",
      "dukkan",
      "reklam",
      "pazaryeri",
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
  });
});
