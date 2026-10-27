import { describe, expect, it } from "vitest";
import {
  juniorSealedLessonInventoryCount,
  juniorShellLessonKeys,
  juniorTopicIsShell,
} from "@/lib/junior/content-source";

describe("Junior kab (yer tutucu) envanter muafiyeti", () => {
  it("~235 baytlık kab konular shell olarak işaretlidir ve sayıma girmez", () => {
    const shells = juniorShellLessonKeys();
    expect(shells.length).toBeGreaterThan(0);
    expect(shells).toContain("jr_06_ing_main-21");
    expect(shells).toContain("jr_06_turkce-21");
    for (const key of shells) {
      expect(juniorTopicIsShell(key)).toBe(true);
    }
    // Mühürlü pilot kab değildir ve envanterde sayılır.
    expect(juniorTopicIsShell("jr_06_mat-1")).toBe(false);
    expect(juniorSealedLessonInventoryCount("jr_06_mat")).toBeGreaterThanOrEqual(1);
    // Kablar matematik envanterini şişirmez: sayım yalnız senaryolu derslerdir.
    expect(juniorSealedLessonInventoryCount("jr_06_ing_main")).toBeLessThan(21);
  });
});
