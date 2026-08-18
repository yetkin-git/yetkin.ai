import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RIBBON_ROOMS, VERTICAL_ROOMS } from "@/lib/kernel/modules";
import {
  PAZARYERI_DISK_PATH,
  YETKINILAN_BLURB,
  YETKINILAN_BRAND,
  YETKINILAN_PATH,
  isYetkinIlanPath,
  yetkinIlanHref,
} from "@/lib/kernel/yetkinilan";

describe("Yetkinİlan marka ve çift rota", () => {
  it("vatandaş etiketi Yetkinİlan’dır; jenerik Pazaryeri yoktur", () => {
    expect(YETKINILAN_BRAND).toBe("Yetkinİlan");
    expect(YETKINILAN_BLURB).toBe(
      "Dijital üründe anında teslim. Hizmette emanet kilit. Emlak/vasıta yalnız vitrin.",
    );
    expect(YETKINILAN_PATH).toBe("/yetkinilan");
    expect(PAZARYERI_DISK_PATH).toBe("/pazaryeri");
    expect(VERTICAL_ROOMS.map((room) => room.label)).toContain("Yetkinİlan");
    expect(VERTICAL_ROOMS.map((room) => room.label)).not.toContain("Pazaryeri");
    expect(RIBBON_ROOMS.map((room) => room.label)).toContain("Yetkinİlan");
    expect(RIBBON_ROOMS.map((room) => room.label)).not.toContain("Anasayfa");
  });

  it("hem /yetkinilan hem /pazaryeri aynı odayı tanır", () => {
    expect(isYetkinIlanPath("/yetkinilan")).toBe(true);
    expect(isYetkinIlanPath("/yetkinilan/tezgah")).toBe(true);
    expect(isYetkinIlanPath("/pazaryeri")).toBe(true);
    expect(isYetkinIlanPath("/pazaryeri/siparisler")).toBe(true);
    expect(isYetkinIlanPath("/studio")).toBe(false);
    expect(isYetkinIlanPath(null)).toBe(false);
    expect(yetkinIlanHref()).toBe("/yetkinilan");
    expect(yetkinIlanHref("/tezgah")).toBe("/yetkinilan/tezgah");
    expect(yetkinIlanHref("siparisler")).toBe("/yetkinilan/siparisler");
  });

  it("next.config marka rewrite ve /market alias taşır", () => {
    const source = readFileSync(path.join(process.cwd(), "next.config.ts"), "utf8");
    expect(source).toContain('source: "/yetkinilan"');
    expect(source).toContain('destination: "/pazaryeri"');
    expect(source).toContain('source: "/yetkinilan/:path*"');
    expect(source).toContain('destination: "/pazaryeri/:path*"');
    expect(source).toContain('source: "/market"');
    expect(source).toContain('destination: "/yetkinilan"');
  });

  it("kenar çubuğu, şerit ve nabız kartı jenerik Pazaryeri kopyası taşımaz", () => {
    const files = [
      "components/shell/sidebar-nav.tsx",
      "components/dashboard/module-ribbon.tsx",
      "components/dashboard/pazaryeri-pulse-widget.tsx",
      "app/dashboard/page.tsx",
      "app/pazaryeri/page.tsx",
    ];
    for (const relative of files) {
      const source = readFileSync(path.join(process.cwd(), relative), "utf8");
      expect(source).not.toMatch(/["'`]Pazaryeri/);
    }
  });
});
