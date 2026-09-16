import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_OUTLOOK_COPILOT_PROMPT,
  ACADEMY_OUTLOOK_DRAFT_REPLY,
  ACADEMY_OUTLOOK_DUMP_MAILS,
  ACADEMY_OUTLOOK_MAILS,
  ACADEMY_OUTLOOK_RESET_GROUPS,
  ACADEMY_OUTLOOK_UNREAD_AFTER,
  ACADEMY_OUTLOOK_UNREAD_BEFORE,
  academyOutlookAlignBox,
  academyOutlookElementForCell,
  academyOutlookHasInbox,
} from "@/lib/academy/outlook-workspace";

const ROOT = process.cwd();

describe("E-Posta Akışı gelen kutusu seçim kutusu — getBoundingClientRect", () => {
  it("A1 Kaya, B1 Yıldız, C1 bülten satırına çözülür", () => {
    expect(academyOutlookElementForCell("A1")).toBe("mail-kaya");
    expect(academyOutlookElementForCell("B1")).toBe("mail-yildiz");
    expect(academyOutlookElementForCell("C1")).toBe("mail-bulletin");
    expect(academyOutlookElementForCell(undefined)).toBe("mail-kaya");
  });

  it("seçim kutusu wrap ölçeğini ayırır; kesilme yok", () => {
    const wrap = { left: 0, top: 0, width: 480, height: 360 };
    const layout = { offsetWidth: 400, offsetHeight: 300, scrollLeft: 0, scrollTop: 0 };
    const row = { left: 48, top: 36, width: 240, height: 48 };
    const box = academyOutlookAlignBox(row, wrap, layout);
    expect(box.left).toBeCloseTo(40, 5);
    expect(box.width).toBeCloseTo(200, 5);
    const outlook = readFileSync(join(ROOT, "components/academy/lesson-outlook-workspace.tsx"), "utf8");
    const ssot = readFileSync(join(ROOT, "lib/academy/outlook-workspace.ts"), "utf8");
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(outlook).toContain("getBoundingClientRect");
    expect(outlook).toContain("data-academy-outlook-origin");
    expect(outlook).toContain("data-academy-checklist-overlay");
    expect(outlook).toContain("academy-excel-mouse-ripple");
    expect(outlook).toContain("ACADEMY_OUTLOOK_RESET_GROUPS");
    expect(outlook).toContain("ACADEMY_OUTLOOK_DUMP_MAILS");
    expect(outlook).toContain('data-academy-outlook-reset={zeroed ? "true" : undefined}');
    expect(outlook).not.toContain("ACADEMY_OUTLOOK_MAILS.map");
    expect(ssot).toContain(String(ACADEMY_OUTLOOK_UNREAD_BEFORE));
    expect(ssot).toContain(String(ACADEMY_OUTLOOK_UNREAD_AFTER));
    expect(ssot).toContain("Kaya Gıda A.Ş.");
    expect(ssot).toContain(ACADEMY_OUTLOOK_DRAFT_REPLY);
    expect(ssot).toContain(ACADEMY_OUTLOOK_COPILOT_PROMPT);
    expect(ssot).toContain("ACİL AKSİYON");
    expect(ssot).toContain("TAKİPTE / BEKLEYEN");
    expect(ssot).toContain("OTOMATİK ARŞİVLENDİ");
    expect(css).toContain("text-overflow: clip");
    expect(css).toContain(".academy-outlook-row");
    expect(css).toContain(".academy-outlook-reset");
    expect(css).toContain(".academy-outlook-group--acil");
    expect(css).toContain("--academy-outlook-focus-scale: 1.2");
    expect(css).toContain("overflow-wrap: break-word");
    expect(css).toContain(".academy-outlook-canvas--compact");
    expect(css).toContain("min-width: 16rem");
    expect(css).not.toMatch(/\.academy-outlook-[^{]*\{[^}]*text-overflow:\s*ellipsis/u);
    expect(css).not.toMatch(/\.academy-outlook-[^{]*\{[^}]*overflow-wrap:\s*anywhere/u);
    expect(outlook).toContain('data-academy-fix={compact ? "162719" : undefined}');
    expect(outlook).toContain("applyAcademyOfficeWinFit");
    expect(outlook).toContain("data-academy-office-win-fit");
    expect(ACADEMY_OUTLOOK_MAILS.every((mail) => !mail.subject.includes("...") && !mail.preview.includes("..."))).toBe(
      true,
    );
    expect(ACADEMY_OUTLOOK_DUMP_MAILS).toHaveLength(ACADEMY_OUTLOOK_UNREAD_BEFORE);
    expect(ACADEMY_OUTLOOK_RESET_GROUPS).toHaveLength(3);
    expect(ACADEMY_OUTLOOK_RESET_GROUPS.map((group) => group.label)).toEqual([
      "ACİL AKSİYON",
      "TAKİPTE / BEKLEYEN",
      "OTOMATİK ARŞİVLENDİ",
    ]);
  });

  it("outlook yüzeyinde tablo, düğüm veya madde varken gelen kutu açılır", () => {
    expect(
      academyOutlookHasInbox({
        layout: "outlook",
        bullets: ["Etiketle"],
      }),
    ).toBe(true);
    expect(academyOutlookHasInbox({ layout: "excel", table: { headers: ["A"], rows: [["1"]] } })).toBe(false);
    expect(ACADEMY_OUTLOOK_UNREAD_BEFORE).toBe(142);
    expect(ACADEMY_OUTLOOK_UNREAD_AFTER).toBe(0);
  });
});
