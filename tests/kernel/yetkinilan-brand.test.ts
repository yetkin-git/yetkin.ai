import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RIBBON_ROOMS, VERTICAL_ROOMS } from "@/lib/kernel/modules";
import {
  FROZEN_DISK_ROOM_CATALOG,
  isFrozenShellPagePath,
} from "@/lib/kernel/compliance/circuit-breakers";
import {
  PAZARYERI_DISK_PATH,
  YETKINILAN_BRAND,
  YETKINILAN_PATH,
  isYetkinIlanPath,
  yetkinIlanHref,
} from "@/lib/kernel/yetkinilan";

describe("Yetkinİlan marka ve çift rota", () => {
  it("vatandaş etiketi Yetkinİlan’dır; canlı nav jenerik Pazaryeri taşımaz", () => {
    expect(YETKINILAN_BRAND).toBe("Yetkinİlan");
    expect(YETKINILAN_PATH).toBe("/yetkinilan");
    expect(PAZARYERI_DISK_PATH).toBe("/pazaryeri");
    expect(FROZEN_DISK_ROOM_CATALOG.map((room) => room.label)).toContain("Yetkinİlan");
    expect(VERTICAL_ROOMS.map((room) => room.label)).not.toContain("Pazaryeri");
    expect(VERTICAL_ROOMS.map((room) => room.label)).not.toContain("Yetkinİlan");
    expect(RIBBON_ROOMS.map((room) => room.label)).not.toContain("Pazaryeri");
    expect(RIBBON_ROOMS.map((room) => room.id)).toEqual(["academy", "career", "freelancer"]);
  });

  it("hem /yetkinilan hem /pazaryeri aynı donmuş odayı tanır", () => {
    expect(isYetkinIlanPath("/yetkinilan")).toBe(true);
    expect(isYetkinIlanPath("/yetkinilan/tezgah")).toBe(true);
    expect(isYetkinIlanPath("/pazaryeri")).toBe(true);
    expect(isYetkinIlanPath("/pazaryeri/siparisler")).toBe(true);
    expect(isYetkinIlanPath("/studio")).toBe(false);
    expect(isYetkinIlanPath(null)).toBe(false);
    expect(yetkinIlanHref()).toBe("/yetkinilan");
    expect(yetkinIlanHref("/tezgah")).toBe("/yetkinilan/tezgah");
    expect(yetkinIlanHref("siparisler")).toBe("/yetkinilan/siparisler");
    expect(isFrozenShellPagePath("/yetkinilan")).toBe(true);
    expect(isFrozenShellPagePath("/pazaryeri")).toBe(true);
    expect(isFrozenShellPagePath("/market")).toBe(true);
  });

  it("next.config donmuş odayı canlı yola rewrite etmez; kenar 410", () => {
    const source = readFileSync(path.join(process.cwd(), "next.config.ts"), "utf8");
    expect(source).toContain("/yetkinilan");
    expect(source).toContain("kenar 410");
    expect(source).not.toContain('destination: "/pazaryeri"');
    expect(source).not.toContain('destination: "/yetkinilan"');
  });

  it("kenar çubuğu ve şerit jenerik Pazaryeri kopyası taşımaz", () => {
    const files = [
      "components/shell/sidebar-nav.tsx",
      "app/dashboard/page.tsx",
    ];
    for (const relative of files) {
      const source = readFileSync(path.join(process.cwd(), relative), "utf8");
      expect(source, relative).not.toMatch(/["'`]Pazaryeri/);
    }
  });
});
