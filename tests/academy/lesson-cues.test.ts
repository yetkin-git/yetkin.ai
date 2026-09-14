import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { academyLessonCueSpokenDuration, academyPunchcardLabel, hasAcademyLessonCues, loadAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { ACADEMY_MEDIA_SEALED_AUDIO } from "@/lib/academy/pilot-sku";

const ROOT = process.cwd();
const CUE_PATH = join(ROOT, "lib/academy/lesson-cues/01_office_ai-1.json");

describe("akademi cue SSOT — 01_office_ai-1 punchcard", () => {
  it("sekiz rozet sırayla parlar; kardeş dersler boş kalır", () => {
    expect(existsSync(CUE_PATH)).toBe(true);
    const cues = loadAcademyLessonCues("01_office_ai-1");
    expect(hasAcademyLessonCues("01_office_ai-1")).toBe(true);
    expect(cues.map((cue) => cue.text)).toEqual([
      "GİRİŞ KÖPRÜSÜ",
      "HOŞ GELDİN",
      "DÜZENSİZ TABLO",
      "A1 HÜCRESİ",
      "TEMİZLE ŞİMDİ",
      "FARK ORTADA",
      "CEBİNE KOY",
      "SIRA SENDE",
    ]);
    expect(hasAcademyLessonCues("01_office_ai-6")).toBe(false);
    expect(hasAcademyLessonCues("01_office_ai-2")).toBe(true);
    expect(loadAcademyLessonCues("01_office_ai-2")).toHaveLength(8);
    expect(academyLessonCueSpokenDuration(cues)).toBeGreaterThan(0);
  });

  it("compact taslak cue şişirmez; vatandaş sahnesi punchcard sözleşmesi durur", () => {
    expect(ACADEMY_MEDIA_SEALED_AUDIO).toEqual({
      "01_office_ai": ["01_office_ai-1", "01_office_ai-2"],
    });
    expect(existsSync(join(ROOT, "lib/academy/curricula/office_ai/section_1.ts"))).toBe(true);
    expect(academyPunchcardLabel("DÜZENSİZ TABLO ŞİMDİ HEMEN")).toBe("DÜZENSİZ TABLO ŞİMDİ");
    const curriculum = readFileSync(join(ROOT, "lib/academy/curriculum.ts"), "utf8");
    expect(curriculum).not.toContain("lesson-cues");
    expect(readFileSync(join(ROOT, "lib/academy/citizen-player-layer.ts"), "utf8")).toContain(
      "loadAcademyTeleprompterFlow",
    );
    expect(readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8")).not.toContain(
      "<LessonTeleprompter",
    );
    expect(readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8")).toContain(
      'data-academy-directing="punchcard"',
    );
    expect(readFileSync(join(ROOT, "components/academy/lesson-visual-stage.tsx"), "utf8")).toContain(
      "data-academy-punchcard",
    );
    expect(readFileSync(join(ROOT, "components/academy/lesson-media-player.tsx"), "utf8")).not.toContain(
      "loadAcademyLessonCues",
    );
  });
});
