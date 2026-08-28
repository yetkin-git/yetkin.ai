import { describe, expect, it } from "vitest";
import {
  DEFAULT_REVISION_ALLOWANCE,
  countRevisionRequests,
  remainingRevisions,
  shouldHighlightReleaseCta,
} from "@/lib/freelancer/revision-tracker";

describe("freelancer revizyon sayacı", () => {
  it("varsayılan 3 hak; REVISION mesajları hakkı düşürür", () => {
    expect(DEFAULT_REVISION_ALLOWANCE).toBe(3);
    expect(countRevisionRequests([])).toBe(0);
    expect(
      countRevisionRequests([
        { kind: "TEXT" },
        { kind: "DELIVERY" },
        { kind: "REVISION" },
        { kind: "REVISION" },
      ]),
    ).toBe(2);
    expect(remainingRevisions(0)).toBe(3);
    expect(remainingRevisions(2)).toBe(1);
    expect(remainingRevisions(3)).toBe(0);
    expect(remainingRevisions(9)).toBe(0);
  });

  it("hak bitince veya teslim varken onay CTA’sını öne çıkarır", () => {
    expect(
      shouldHighlightReleaseCta({
        contractStatus: "FUNDED",
        remaining: 0,
        hasDelivery: false,
      }),
    ).toBe(true);
    expect(
      shouldHighlightReleaseCta({
        contractStatus: "FUNDED",
        remaining: 2,
        hasDelivery: true,
      }),
    ).toBe(true);
    expect(
      shouldHighlightReleaseCta({
        contractStatus: "FUNDED",
        remaining: 2,
        hasDelivery: false,
      }),
    ).toBe(false);
    expect(
      shouldHighlightReleaseCta({
        contractStatus: "RELEASED",
        remaining: 0,
        hasDelivery: true,
      }),
    ).toBe(false);
  });
});
