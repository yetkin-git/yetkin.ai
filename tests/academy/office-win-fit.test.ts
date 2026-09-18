import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  academyOfficeAabbInsidePane,
  academyOfficeContainCamera,
  academyOfficeFocusOriginCss,
  academyOfficeIsWidescreenRatio,
  academyOfficeWinFitScale,
} from "@/lib/academy/office-win-fit";
import { ACADEMY_GMAIL_CARRY_WATER_CLIP, ACADEMY_GMAIL_MAILS } from "@/lib/academy/gmail-workspace";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Sinema masası office-win-fit — 16:9 contain / scale-down", () => {
  it("taşan dikey içerik tek ölçekle tuvale sığar; sığan içerik küçülmez", () => {
    expect(
      academyOfficeWinFitScale({
        paneWidth: 400,
        paneHeight: 240,
        contentWidth: 400,
        contentHeight: 400,
      }),
    ).toBeCloseTo(0.6, 5);
    expect(
      academyOfficeWinFitScale({
        paneWidth: 400,
        paneHeight: 240,
        contentWidth: 320,
        contentHeight: 200,
      }),
    ).toBe(1);
    expect(
      academyOfficeWinFitScale({
        paneWidth: 360,
        paneHeight: 220,
        contentWidth: 480,
        contentHeight: 400,
      }),
    ).toBeCloseTo(0.55, 5);
    expect(
      academyOfficeWinFitScale({
        paneWidth: 0,
        paneHeight: 240,
        contentWidth: 400,
        contentHeight: 400,
      }),
    ).toBe(1);
  });

  it("focus-zoom AABB waiter dışına taşmaz; 16:9 tuval oranı 1.77 kalır", () => {
    const waiter = { width: 1280, height: 720 };
    const content = { width: 1560, height: 1080 };
    const rest = academyOfficeWinFitScale({
      paneWidth: waiter.width,
      paneHeight: waiter.height,
      contentWidth: content.width,
      contentHeight: content.height,
    });
    const camera = academyOfficeContainCamera({
      paneWidth: waiter.width,
      paneHeight: waiter.height,
      contentWidth: content.width,
      contentHeight: content.height,
      originX: content.width * 0.82,
      originY: content.height * 0.44,
      zoom: 1.2,
    });
    expect(camera.scale).toBeLessThanOrEqual(rest + 1e-9);
    expect(academyOfficeAabbInsidePane(camera.aabb, waiter)).toBe(true);
    const canvas = {
      width: camera.aabb.width * 0.62,
      height: (camera.aabb.width * 0.62) * (9 / 16),
    };
    expect(academyOfficeIsWidescreenRatio(canvas.width, canvas.height)).toBe(true);
    expect(canvas.width).toBeLessThanOrEqual(camera.aabb.width + 0.01);
    expect(canvas.height).toBeLessThanOrEqual(camera.aabb.height + 0.01);
    expect(
      academyOfficeFocusOriginCss(
        { left: 820, top: 310, width: 240, height: 180 },
        { left: 0, top: 0, width: 1280, height: 720 },
      ),
    ).toBe("73.44% 55.56%");
  });

  it("Gmail taşıma-su paneli Banka Dekontu satırını düşürmez; 4 kart + 3 clip durur", () => {
    expect(ACADEMY_GMAIL_MAILS.map((mail) => mail.from)).toEqual([
      "Kaya Gıda A.Ş.",
      "Yönetim Kurulu",
      "Banka Dekontu",
      "Haftalık Bülten",
    ]);
    expect(ACADEMY_GMAIL_CARRY_WATER_CLIP).toHaveLength(3);
    expect(ACADEMY_GMAIL_CARRY_WATER_CLIP[2]).toMatch(/ChatGPT/u);
  });

  it("Gmail / Outlook / Word / PowerPoint pencereleri ResizeObserver contain kilidini taşır", () => {
    const gmail = readSrc("components/academy/lesson-gmail-workspace.tsx");
    const outlook = readSrc("components/academy/lesson-outlook-workspace.tsx");
    const word = readSrc("components/academy/lesson-word-workspace.tsx");
    const pptx = readSrc("components/academy/lesson-pptx-workspace.tsx");
    const excel = readSrc("components/academy/lesson-excel-workspace.tsx");
    const css = readSrc("app/globals.css");
    for (const src of [gmail, outlook, word, pptx]) {
      expect(src).toContain("applyAcademyOfficeWinFit");
      expect(src).toContain("data-academy-office-win-fit");
      expect(src).toContain("academy-office-win-fit");
      expect(src).toContain("useLayoutEffect");
      expect(src).toContain("observer.observe(desk)");
    }
    expect(excel).toContain("const availH = wrap.clientHeight");
    expect(excel).toContain("visualH > availH");
    expect(css).toContain(".academy-office-win-fit");
    expect(css).toContain("height: max-content");
    expect(css).toContain("transform-origin: top left");
    expect(css).toMatch(
      /\.academy-player-compare-pane \.academy-gmail-carry[\s\S]*?flex:\s*0 0 auto/u,
    );
    expect(css).toMatch(
      /\.academy-player-waiter\.academy-player-compare\s*\{[^}]*height:\s*auto/u,
    );
    expect(css).toMatch(
      /\.academy-player-compare-label\s*\{[^}]*position:\s*static/u,
    );
    expect(css).toMatch(
      /\.academy-player-compare-label\s*\{[^}]*flex:\s*0 0 auto/u,
    );
    expect(css).not.toMatch(
      /\.academy-player-compare-pane \.academy-gmail-carry[\s\S]{0,400}max-height:\s*28%/u,
    );
  });
});
