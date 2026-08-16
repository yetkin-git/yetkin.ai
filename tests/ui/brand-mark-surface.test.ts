import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BRAND_MARK_PATHS,
  BRAND_MARK_COLORS,
  buildBrandMarkSvg,
} from "@/lib/ui/brand-mark-geometry";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Yetkin Rail marka / favicon yüzeyi", () => {
  it("public/favicon.ico 16+32 PNG ICO taşır; haç BMP’si yoktur", () => {
    const favicon = join(ROOT, "public/favicon.ico");
    expect(existsSync(favicon)).toBe(true);
    const buf = readFileSync(favicon);
    expect(buf.length).toBeGreaterThan(500);
    expect(buf.readUInt16LE(0)).toBe(0);
    expect(buf.readUInt16LE(2)).toBe(1);
    expect(buf.readUInt16LE(4)).toBe(2);
    expect(buf[6]).toBe(16);
    expect(buf[22]).toBe(32);
    expect(buf.includes(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe(true);
  });

  it("app/icon.svg açık/koyu tema ve Y-makas raylarını taşır; traverse haç yoktur", () => {
    const svgPath = join(ROOT, "app/icon.svg");
    expect(existsSync(svgPath)).toBe(true);
    const svg = readSrc("app/icon.svg");
    expect(svg).toBe(buildBrandMarkSvg());
    expect(svg).toContain("prefers-color-scheme: light");
    expect(svg).toContain(BRAND_MARK_PATHS.leftRail);
    expect(svg).toContain(BRAND_MARK_PATHS.rightRail);
    expect(svg).toContain(BRAND_MARK_COLORS.ink);
    expect(svg).toContain(BRAND_MARK_COLORS.ivory);
    expect(svg).not.toContain(BRAND_MARK_PATHS.sleeperLow);
    expect(svg).not.toContain("M0 16 H32");
    expect(svg).not.toContain("M16 0 V32");
  });

  it("apple-icon PNG 180 kare kısayol mührüdür", () => {
    const apple = join(ROOT, "app/apple-icon.png");
    expect(existsSync(apple)).toBe(true);
    const buf = readFileSync(apple);
    expect(buf.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true);
    expect(statSync(apple).size).toBeGreaterThan(256);
    expect(buf.readUInt32BE(16)).toBe(180);
    expect(buf.readUInt32BE(20)).toBe(180);
  });

  it("kabuk YR haç-algılı kareyi RailMark ile değiştirdi", () => {
    const chrome = readSrc("components/shell/shell-chrome.tsx");
    expect(chrome).toContain("RailMark");
    expect(chrome).toContain('tone="onInk"');
    expect(chrome).not.toContain(">YR<");
    expect(chrome).not.toContain("bg-[var(--safir)] text-sm font-bold text-white");
    expect(readSrc("components/ui/rail-mark.tsx")).toContain("BRAND_MARK_PATHS");
  });
});
