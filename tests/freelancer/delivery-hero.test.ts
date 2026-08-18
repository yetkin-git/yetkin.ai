import { describe, expect, it } from "vitest";
import { pickLatestDeliveryMessage, shouldShowDeliveryHero } from "@/lib/freelancer/delivery-hero";

describe("teslimat kahraman kartı seçimi", () => {
  it("son DELIVERY'yi alır; TEXT teslim sayılmaz", () => {
    const latest = pickLatestDeliveryMessage([
      { kind: "TEXT", createdAt: "2026-08-18T10:00:00.000Z", id: "t1" },
      { kind: "DELIVERY", createdAt: "2026-08-18T11:00:00.000Z", id: "d1" },
      { kind: "DELIVERY", createdAt: "2026-08-18T12:00:00.000Z", id: "d2" },
      { kind: "REVISION", createdAt: "2026-08-18T13:00:00.000Z", id: "r1" },
    ]);
    expect(latest?.id).toBe("d2");
    expect(pickLatestDeliveryMessage([{ kind: "TEXT", createdAt: new Date(), id: "t" }])).toBeNull();
  });

  it("yalnız FUNDED + teslim varken kahraman kart açılır", () => {
    expect(shouldShowDeliveryHero({ contractStatus: "FUNDED", hasDelivery: true })).toBe(true);
    expect(shouldShowDeliveryHero({ contractStatus: "RELEASED", hasDelivery: true })).toBe(false);
    expect(shouldShowDeliveryHero({ contractStatus: "FUNDED", hasDelivery: false })).toBe(false);
    expect(shouldShowDeliveryHero({ contractStatus: "DISPUTED", hasDelivery: true })).toBe(false);
  });
});
