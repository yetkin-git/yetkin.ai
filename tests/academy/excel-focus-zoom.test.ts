import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_EXCEL_FOCUS_ZOOM_CUE_ID,
  ACADEMY_EXCEL_FOCUS_ZOOM_DURATION_MAX_SEC,
  ACADEMY_EXCEL_FOCUS_ZOOM_DURATION_MIN_SEC,
  ACADEMY_EXCEL_FOCUS_ZOOM_DURATION_SEC,
  ACADEMY_EXCEL_FOCUS_ZOOM_LESSON_KEY,
  ACADEMY_EXCEL_FOCUS_ZOOM_MAX_SCALE,
  ACADEMY_EXCEL_FOCUS_ZOOM_MIN_SCALE,
  ACADEMY_EXCEL_FOCUS_ZOOM_ORIGIN,
  ACADEMY_EXCEL_FOCUS_ZOOM_PHRASES,
  ACADEMY_EXCEL_FOCUS_ZOOM_SCALE,
  ACADEMY_EXCEL_FOCUS_ZOOM_TRANSITION_SEC,
  academyExcelFocusZoomActive,
  buildAcademyExcelFocusZoomWindows,
  loadAcademyExcelFocusZoomWindows,
} from "@/lib/academy/excel-focus-zoom";
import { loadAcademyLessonPlaybackCues } from "@/lib/academy/lesson-cues";
import { loadAcademyKaraokeStrip } from "@/lib/academy/lesson-teleprompter-flow";

const ROOT = process.cwd();
const KEY = ACADEMY_EXCEL_FOCUS_ZOOM_LESSON_KEY;

describe("Excel A1 odak zoom — cue-04 ses pencereleri", () => {
  it("ölçek %115–120, geçiş 0.8s, pencere 1.5–2.5 sn aralığında durur", () => {
    expect(ACADEMY_EXCEL_FOCUS_ZOOM_SCALE).toBe(1.2);
    expect(ACADEMY_EXCEL_FOCUS_ZOOM_SCALE).toBeGreaterThanOrEqual(ACADEMY_EXCEL_FOCUS_ZOOM_MIN_SCALE);
    expect(ACADEMY_EXCEL_FOCUS_ZOOM_SCALE).toBeLessThanOrEqual(ACADEMY_EXCEL_FOCUS_ZOOM_MAX_SCALE);
    expect(ACADEMY_EXCEL_FOCUS_ZOOM_TRANSITION_SEC).toBe(0.8);
    expect(ACADEMY_EXCEL_FOCUS_ZOOM_DURATION_SEC).toBeGreaterThanOrEqual(
      ACADEMY_EXCEL_FOCUS_ZOOM_DURATION_MIN_SEC,
    );
    expect(ACADEMY_EXCEL_FOCUS_ZOOM_DURATION_SEC).toBeLessThanOrEqual(
      ACADEMY_EXCEL_FOCUS_ZOOM_DURATION_MAX_SEC,
    );
    expect(ACADEMY_EXCEL_FOCUS_ZOOM_ORIGIN).toBe("12% 22%");
    expect(ACADEMY_EXCEL_FOCUS_ZOOM_PHRASES).toEqual(["A1 hücresi", "sütun başlığı", "formül çubuğu"]);
  });

  it("cue-04 başında ve A1 / sütun başlığı cümlelerinde zoom açılır; cue-05 genel tabloda kapanır", () => {
    const cues = loadAcademyLessonPlaybackCues(KEY);
    const cue04 = cues.find((cue) => cue.id === ACADEMY_EXCEL_FOCUS_ZOOM_CUE_ID);
    const cue05 = cues.find((cue) => cue.id === "cue-05");
    expect(cue04).toBeTruthy();
    expect(cue05).toBeTruthy();
    const windows = loadAcademyExcelFocusZoomWindows(KEY);
    expect(windows.length).toBeGreaterThan(1);
    expect(windows[0]?.start).toBe(cue04!.start);
    expect(windows[0]!.end - windows[0]!.start).toBeGreaterThanOrEqual(ACADEMY_EXCEL_FOCUS_ZOOM_DURATION_MIN_SEC);
    expect(academyExcelFocusZoomActive(KEY, cue04!.start)).toBe(true);
    expect(academyExcelFocusZoomActive(KEY, cue04!.start + 0.2)).toBe(true);

    const strip = loadAcademyKaraokeStrip(KEY);
    const a1Line = strip.find(
      (line) => line.cueId === ACADEMY_EXCEL_FOCUS_ZOOM_CUE_ID && /A1 hücresi/u.test(line.text),
    );
    const headerLine = strip.find(
      (line) => line.cueId === ACADEMY_EXCEL_FOCUS_ZOOM_CUE_ID && /sütun başlığı/u.test(line.text),
    );
    expect(a1Line).toBeTruthy();
    expect(headerLine).toBeTruthy();
    const headerAt = headerLine!.text.toLocaleLowerCase("tr-TR").indexOf("sütun başlığı");
    const headerTime =
      headerLine!.start +
      ((headerLine!.end - headerLine!.start) * Math.max(0, headerAt)) / Math.max(1, headerLine!.text.length);
    expect(academyExcelFocusZoomActive(KEY, a1Line!.start + 0.15)).toBe(true);
    expect(academyExcelFocusZoomActive(KEY, headerTime + 0.05)).toBe(true);

    const lastWindow = windows.at(-1)!;
    expect(lastWindow.end).toBeLessThanOrEqual(cue04!.end);
    expect(academyExcelFocusZoomActive(KEY, lastWindow.end)).toBe(false);
    expect(academyExcelFocusZoomActive(KEY, cue05!.start)).toBe(false);
    expect(academyExcelFocusZoomActive(KEY, cue05!.start + 1)).toBe(false);
    const lessonTwoCues = loadAcademyLessonPlaybackCues("01_office_ai-2");
    const lessonTwoCue04 = lessonTwoCues.find((cue) => cue.id === "cue-04");
    expect(lessonTwoCue04).toBeTruthy();
    expect(academyExcelFocusZoomActive("01_office_ai-2", lessonTwoCue04!.start)).toBe(true);
    const lessonThreeWindows = loadAcademyExcelFocusZoomWindows("01_office_ai-3");
    const lessonThreeCue04 = loadAcademyLessonPlaybackCues("01_office_ai-3").find((cue) => cue.id === "cue-04");
    expect(lessonThreeCue04).toBeTruthy();
    expect(lessonThreeWindows.length).toBeGreaterThan(0);
    expect(lessonThreeWindows.length).toBeLessThanOrEqual(2);
    expect(academyExcelFocusZoomActive("01_office_ai-3", lessonThreeCue04!.start)).toBe(false);
    expect(lessonThreeWindows[0]!.start).toBeGreaterThan(lessonThreeCue04!.start);
  });

  it("sentetik satırda formül çubuğu ifadesi A1’e zoom penceresi basar; örtüşen pencereler birleşir", () => {
    const windows = buildAcademyExcelFocusZoomWindows({
      lessonKey: KEY,
      cues: [{ id: "cue-04", start: 10, end: 40 }],
      lines: [
        {
          cueId: "cue-04",
          text: "Formül çubuğu A1 hücresini gösterir.",
          start: 12,
          end: 18,
        },
        {
          cueId: "cue-04",
          text: "A1 hücresi hemen yanında durur.",
          start: 12.4,
          end: 16,
        },
        {
          cueId: "cue-05",
          text: "A1 hücresi genel tabloda geçmesin.",
          start: 41,
          end: 50,
        },
      ],
    });
    expect(windows[0]?.start).toBe(10);
    expect(windows).toHaveLength(1);
    expect(windows[0]!.end).toBeGreaterThan(13);
    expect(windows[0]!.end).toBeLessThanOrEqual(40);
  });

  it("0.8s geçişten kısa boşlukları birleştirir; titreme olmaz", () => {
    const windows = buildAcademyExcelFocusZoomWindows({
      lessonKey: KEY,
      cues: [{ id: "cue-04", start: 10, end: 40 }],
      lines: [
        {
          cueId: "cue-04",
          text: "A1 hücresi burada.",
          start: 12.2,
          end: 14,
        },
      ],
    });
    expect(windows).toHaveLength(1);
    expect(windows[0]?.start).toBe(10);
    expect(windows[0]!.end).toBeGreaterThan(12.2);
  });

  it("oynatıcı CSS scale + transform-origin sözleşmesini taşır", () => {
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    const eye = readFileSync(join(ROOT, "components/academy/lesson-visual-stage.tsx"), "utf8");
    const excel = readFileSync(join(ROOT, "components/academy/lesson-excel-workspace.tsx"), "utf8");
    expect(eye).toContain("academyExcelFocusZoomActive");
    expect(eye).toContain("focusZoom={excelFocusZoom}");
    expect(excel).toContain("academy-excel-desk--focus-zoom");
    expect(excel).toContain("academy-excel-desk--live");
    expect(excel).toContain("data-academy-excel-focus-zoom");
    expect(css).toContain("academy-excel-desk--focus-zoom");
    expect(css).toContain("transform: scale(var(--academy-excel-focus-scale, 1))");
    expect(css).toContain("transform-origin: var(--academy-excel-focus-origin, 12% 22%)");
    expect(css).toMatch(/transition:\s*transform\s+0\.8s/u);
    expect(css).toContain("--academy-excel-focus-scale: 1.2");
  });
});
