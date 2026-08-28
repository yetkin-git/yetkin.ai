import { describe, expect, it } from "vitest";
import { flattenRailV1Record } from "../../scripts/rail-v1-ops-json";

describe("saha v1 JSON düzlemesi", () => {
  it("başarı data alanlarını köke indirir; ok durur", () => {
    const flat = flattenRailV1Record({
      ok: true,
      error: null,
      requestId: "550e8400-e29b-41d4-a716-446655440000",
      apiVersion: "1",
      data: { merchantOid: "wallettopup_1", sandboxMode: true },
    });
    expect(flat.ok).toBe(true);
    expect(flat.merchantOid).toBe("wallettopup_1");
    expect(flat.sandboxMode).toBe(true);
  });

  it("versiyonsuz kökü düzlemez", () => {
    const raw = { ok: true, merchantOid: "legacy" };
    expect(flattenRailV1Record(raw)).toEqual(raw);
  });
});
