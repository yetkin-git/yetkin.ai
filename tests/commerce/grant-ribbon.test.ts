import { describe, expect, it } from "vitest";
import { selectVerifiedGrantRibbon } from "@/lib/commerce/grant-ribbon";

describe("E-ticaret hibe şeridi", () => {
  it("sourceVerifiedAt boşsa satırı yazmaz", () => {
    const now = new Date("2026-11-23T12:00:00.000Z");
    expect(
      selectVerifiedGrantRibbon(
        [
          {
            title: "Kaynaksız",
            sourceLabel: "Ticaret Bakanlığı",
            remainingDays: 20,
            status: "ACTIVE",
            sourceVerifiedAt: null,
          },
        ],
        now,
      ),
    ).toEqual([]);
  });
});
