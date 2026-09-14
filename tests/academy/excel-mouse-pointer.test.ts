import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_EXCEL_MOUSE_CELLS,
  ACADEMY_EXCEL_MOUSE_CELL_POS,
  ACADEMY_EXCEL_MOUSE_CLICK_SEC,
  ACADEMY_EXCEL_MOUSE_CUE_ID,
  ACADEMY_EXCEL_MOUSE_GLIDE_SEC,
  ACADEMY_EXCEL_MOUSE_LESSON_KEY,
  academyExcelMouseActiveCell,
  academyExcelMouseState,
  buildAcademyExcelMouseTrack,
} from "@/lib/academy/excel-mouse-pointer";
import { loadAcademyLessonPlaybackCues } from "@/lib/academy/lesson-cues";
import { loadAcademyKaraokeStrip } from "@/lib/academy/lesson-teleprompter-flow";

const ROOT = process.cwd();
const KEY = ACADEMY_EXCEL_MOUSE_LESSON_KEY;

describe("Excel sanal fare — cue-04 A1 tık ve A1→B1→C1", () => {
  it("cue-04 başında A1’e süzülür, varışta click ripple basar", () => {
    const cues = loadAcademyLessonPlaybackCues(KEY);
    const cue04 = cues.find((cue) => cue.id === ACADEMY_EXCEL_MOUSE_CUE_ID);
    expect(cue04).toBeTruthy();
    expect(academyExcelMouseState(KEY, cue04!.start - 0.05)).toBeNull();
    const start = academyExcelMouseState(KEY, cue04!.start + 0.05);
    expect(start?.visible).toBe(true);
    expect(start?.cell).toBe("A1");
    expect(start?.x).toBeGreaterThan(ACADEMY_EXCEL_MOUSE_CELL_POS.A1.x);
    expect(start?.clicking).toBe(false);
    const arrived = academyExcelMouseState(KEY, cue04!.start + ACADEMY_EXCEL_MOUSE_GLIDE_SEC + 0.02);
    expect(arrived?.cell).toBe("A1");
    expect(arrived?.x).toBeCloseTo(ACADEMY_EXCEL_MOUSE_CELL_POS.A1.x, 5);
    expect(arrived?.clicking).toBe(true);
    expect(
      academyExcelMouseState(KEY, cue04!.start + ACADEMY_EXCEL_MOUSE_GLIDE_SEC + ACADEMY_EXCEL_MOUSE_CLICK_SEC)
        ?.clicking,
    ).toBe(false);
    expect(academyExcelMouseState(KEY, cue04!.end)).toBeNull();
    const lessonTwoCues = loadAcademyLessonPlaybackCues("01_office_ai-2");
    const lessonTwoCue04 = lessonTwoCues.find((cue) => cue.id === "cue-04");
    expect(lessonTwoCue04).toBeTruthy();
    expect(academyExcelMouseState("01_office_ai-2", lessonTwoCue04!.start + 0.05)?.visible).toBe(true);
    expect(academyExcelMouseState("01_office_ai-2", lessonTwoCue04!.end)).toBeNull();
  });

  it("sütun ve satır anlatımında seçili hücre A1 → B1 → C1 yürür", () => {
    const strip = loadAcademyKaraokeStrip(KEY);
    const walkLine = strip.find(
      (line) =>
        line.cueId === ACADEMY_EXCEL_MOUSE_CUE_ID && /Ürün/u.test(line.text) && /Tarih/u.test(line.text),
    );
    expect(walkLine).toBeTruthy();
    const folded = walkLine!.text.toLocaleLowerCase("tr-TR");
    const span = walkLine!.end - walkLine!.start;
    const len = Math.max(1, folded.length);
    const tarihAt =
      walkLine!.start + (span * Math.max(0, folded.indexOf("tarih"))) / len;
    const tutarAt =
      walkLine!.start + (span * Math.max(0, folded.indexOf("tutar"))) / len;
    expect(academyExcelMouseActiveCell(KEY, walkLine!.start + 0.2)).toBe("A1");
    expect(academyExcelMouseActiveCell(KEY, tarihAt + 0.08)).toBe("B1");
    expect(academyExcelMouseActiveCell(KEY, tutarAt + 0.08)).toBe("C1");
    expect(ACADEMY_EXCEL_MOUSE_CELLS).toEqual(["A1", "B1", "C1"]);
  });

  it("sentetik satırda Ürün/Tarih/Tutar vuruşları hücre anahtar karesi basar", () => {
    const track = buildAcademyExcelMouseTrack({
      lessonKey: KEY,
      cues: [{ id: "cue-04", start: 10, end: 40 }],
      lines: [
        {
          cueId: "cue-04",
          text: "A1 hücresine gel. Sonra ürün, tarih, tutar yan yana durur.",
          start: 12,
          end: 22,
        },
      ],
    });
    expect(track[0]?.cell).toBe("A1");
    expect(track.some((frame) => frame.cell === "B1" && frame.t > 12)).toBe(true);
    expect(track.some((frame) => frame.cell === "C1" && frame.t > 12)).toBe(true);
    expect(track.filter((frame) => frame.click).length).toBeGreaterThanOrEqual(1);
  });

  it("oynatıcı sanal fare katmanını ve activeCell sözleşmesini taşır", () => {
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    const eye = readFileSync(join(ROOT, "components/academy/lesson-visual-stage.tsx"), "utf8");
    const excel = readFileSync(join(ROOT, "components/academy/lesson-excel-workspace.tsx"), "utf8");
    expect(eye).toContain("currentTime={currentTime}");
    expect(excel).toContain("academyExcelMouseState");
    expect(excel).toContain("data-academy-excel-mouse-layer");
    expect(excel).toContain("data-academy-excel-mouse-cell");
    expect(excel).toContain("data-academy-excel-mouse-click");
    expect(excel).toContain("data-academy-excel-active-cell");
    expect(excel).toContain("academyExcelSelection");
    expect(excel).toContain("{mergeSelected ? null : (");
    expect(excel).toContain("academy-excel-mouse--click");
    expect(css).toContain("academy-excel-mouse-layer");
    expect(css).toContain("academy-excel-mouse-ripple");
    expect(css).toContain("academy-excel-mouse--click");
    expect(css).toContain("academy-excel-col--active");
  });
});
