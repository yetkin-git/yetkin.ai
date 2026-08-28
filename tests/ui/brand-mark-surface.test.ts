import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { YETKIN_BRAND, YETKIN_RELEASE_LABEL } from "@/lib/copy/brand";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import {
  BRAND_MARK_COLORS,
  BRAND_MARK_GRADIENT,
  BRAND_MARK_LETTER_PATH,
  BRAND_MARK_PATHS,
  BRAND_MARK_SHEEN,
  buildBrandMarkSvg,
} from "@/lib/ui/brand-mark-geometry";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("yetkin.ai marka / favicon yüzeyi", () => {
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

  it("app/icon.svg ve public/icon.svg aynı mor/mavi Y mührünü taşır; ray ve haç yoktur", () => {
    const svg = readSrc("app/icon.svg");
    expect(existsSync(join(ROOT, "app/icon.svg"))).toBe(true);
    expect(existsSync(join(ROOT, "public/icon.svg"))).toBe(true);
    expect(svg).toBe(buildBrandMarkSvg());
    expect(readSrc("public/icon.svg")).toBe(svg);
    expect(svg).toContain("linearGradient");
    expect(svg).toContain(BRAND_MARK_PATHS.letterY);
    expect(svg).toContain(BRAND_MARK_LETTER_PATH);
    expect(svg).toContain(BRAND_MARK_COLORS.violet);
    expect(svg).toContain(BRAND_MARK_COLORS.safir);
    expect(svg).toContain(`url(#${BRAND_MARK_GRADIENT.id})`);
    expect(svg).toContain(`url(#${BRAND_MARK_SHEEN.id})`);
    expect(existsSync(join(ROOT, "components/ui/rail-mark.tsx"))).toBe(false);
    expect(svg).not.toContain("Y-makas");
    expect(svg).not.toContain("leftRail");
    expect(svg).not.toContain("sleeper");
    expect(svg).not.toContain("#c4a35a");
    expect(svg).not.toContain("M0 16 H32");
    expect(svg).not.toContain("M16 0 V32");
    expect(svg).not.toContain("M10.4 24.5 L12.9 8.4");
    expect(svg).not.toContain("M16.8 24.5 L23.2 8.6");
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

  it("kabuk YR haç-algılı kareyi BrandIcon ile değiştirdi", () => {
    const chrome = readSrc("components/shell/shell-chrome.tsx");
    const sidebar = readSrc("components/shell/desktop-sidebar.tsx");
    const mark = readSrc("components/ui/brand-icon.tsx");
    expect(chrome).toContain("BrandIcon");
    expect(chrome).toContain('className="h-8 w-8 shrink-0"');
    expect(chrome).not.toContain("RailMark");
    expect(chrome).not.toContain("withSleepers");
    expect(chrome).not.toContain(">YR<");
    expect(chrome).not.toContain("bg-[var(--safir)] text-sm font-bold text-white");
    expect(sidebar).toContain("BrandIcon");
    expect(sidebar).toContain("h-10 w-10");
    expect(sidebar).not.toContain("RailMark");
    expect(mark).toContain("BRAND_MARK_LETTER_PATH");
    expect(mark).toContain("export const BrandLogo = BrandIcon");
  });

  it("kamu ve kabuk yüzeyi yetkin.ai basar; Yetkin Rail taşımaz", () => {
    expect(YETKIN_BRAND).toBe("yetkin.ai");
    expect(AUTH_SEN.brand).toBe(YETKIN_BRAND);
    expect(PUBLIC_SEN.home.badge).toBe(YETKIN_BRAND);
    expect(PUBLIC_SEN.home.versionBadge).toBe(YETKIN_RELEASE_LABEL);
    expect(YETKIN_RELEASE_LABEL).toBe("v1.0.0 Beta");
    expect(readSrc("app/(public)/page.tsx")).toContain("YETKIN_BRAND");
    expect(readSrc("app/(public)/page.tsx")).toContain("copy.versionBadge");
    expect(PUBLIC_SEN.error.eyebrow).toBe(YETKIN_BRAND);
    expect(PUBLIC_SEN.notFound.description).toContain(YETKIN_BRAND);
    expect(buildBrandMarkSvg()).toContain(`aria-label="${YETKIN_BRAND}"`);
    expect(buildBrandMarkSvg()).toContain(`<title>${YETKIN_BRAND}</title>`);
    expect(buildBrandMarkSvg()).not.toContain("Yetkin Rail");

    const surfaces = [
      "app/layout.tsx",
      "app/icon.svg",
      "public/icon.svg",
      "components/shell/shell-chrome.tsx",
      "components/shell/desktop-sidebar.tsx",
      "components/shell/header-bar.tsx",
      "lib/copy/sen-voice/auth.ts",
      "lib/copy/sen-voice/public.ts",
      "lib/copy/sen-voice/notice.ts",
      "lib/copy/legal-launch.ts",
    ];
    for (const file of surfaces) {
      expect(readSrc(file), file).not.toContain("Yetkin Rail");
    }
    expect(readSrc("components/shell/shell-chrome.tsx")).toContain("YETKIN_BRAND");
    expect(readSrc("components/shell/desktop-sidebar.tsx")).toContain("YETKIN_BRAND");
    expect(readSrc("app/layout.tsx")).toContain("YETKIN_BRAND");
    expect(readSrc("components/shell/shell-chrome.tsx")).toContain("YETKIN_SHELL_TAGLINE");
    expect(readSrc("components/shell/desktop-sidebar.tsx")).toContain("YETKIN_SHELL_TAGLINE");
    expect(readSrc("app/layout.tsx")).toContain("PUBLIC_SEN.home.title");
  });

  it("ana sayfa güven taahhüdü TL sınırı basmaz; ödeme pasifken dürüst dil basar", () => {
    expect(PUBLIC_SEN.home.trustTitle).toBe("Güven taahhüdü");
    expect(PUBLIC_SEN.home.trust.join("\n")).not.toMatch(/Türk Lirası|₺/);
    expect(PUBLIC_SEN.home.trust).toContain(
      "Ödeme henüz bağlanmadı / pasif — sahte bakiye yazılmaz",
    );
    expect(PUBLIC_SEN.home.trust.join("\n")).not.toContain("güvenli ödeme altyapısı");
    expect(readSrc("app/(public)/page.tsx")).toContain("copy.trust.map");
  });
});
