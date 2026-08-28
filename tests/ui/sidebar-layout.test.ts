import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SIDEBAR_LAYOUT,
  SIDEBAR_LAYOUT_STORAGE_KEY,
  SIDEBAR_WIDTH_DEFAULT,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  SIDEBAR_WIDTH_STEP,
  clampSidebarWidth,
  layoutFromDragX,
  nudgeSidebarWidth,
  parseStoredSidebarLayout,
  resolveSidebarDisplayWidth,
} from "@/lib/ui/sidebar-layout";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("sol ray genişlik ve katlama tercihi", () => {
  it("genişliği MIN–MAX aralığına sıkıştırır; bozuk değer varsayılana düşer", () => {
    expect(clampSidebarWidth(288)).toBe(288);
    expect(clampSidebarWidth(SIDEBAR_WIDTH_MIN - 40)).toBe(SIDEBAR_WIDTH_MIN);
    expect(clampSidebarWidth(SIDEBAR_WIDTH_MAX + 80)).toBe(SIDEBAR_WIDTH_MAX);
    expect(clampSidebarWidth(Number.NaN)).toBe(SIDEBAR_WIDTH_DEFAULT);
    expect(clampSidebarWidth(300.6)).toBe(301);
  });

  it("bozuk JSON ve eksik alan varsayılana düşer; collapsed yalnız true iken açılır", () => {
    expect(parseStoredSidebarLayout(null)).toEqual(DEFAULT_SIDEBAR_LAYOUT);
    expect(parseStoredSidebarLayout("{")).toEqual(DEFAULT_SIDEBAR_LAYOUT);
    expect(parseStoredSidebarLayout("[]")).toEqual(DEFAULT_SIDEBAR_LAYOUT);
    expect(parseStoredSidebarLayout('{"width":360,"collapsed":true}')).toEqual({
      width: 360,
      collapsed: true,
    });
    expect(parseStoredSidebarLayout('{"width":12,"collapsed":"yes"}')).toEqual({
      width: SIDEBAR_WIDTH_MIN,
      collapsed: false,
    });
  });

  it("simge modu ikon genişliğini basar; sürükleme simge modundan MIN üstünde çıkar", () => {
    expect(resolveSidebarDisplayWidth({ width: 320, collapsed: true })).toBe(SIDEBAR_WIDTH_ICON);
    expect(resolveSidebarDisplayWidth({ width: 320, collapsed: false })).toBe(320);
    expect(layoutFromDragX(90, { width: 320, collapsed: true })).toEqual({
      width: 320,
      collapsed: true,
    });
    expect(layoutFromDragX(260, { width: 320, collapsed: true })).toEqual({
      width: 260,
      collapsed: false,
    });
    expect(layoutFromDragX(500, { width: 288, collapsed: false }).width).toBe(SIDEBAR_WIDTH_MAX);
  });

  it("klavye adımı simge modunda sağa basınca açar", () => {
    expect(nudgeSidebarWidth({ width: 300, collapsed: true }, SIDEBAR_WIDTH_STEP)).toEqual({
      width: 300,
      collapsed: false,
    });
    expect(nudgeSidebarWidth({ width: 300, collapsed: true }, -SIDEBAR_WIDTH_STEP)).toEqual({
      width: 300,
      collapsed: true,
    });
    expect(nudgeSidebarWidth({ width: 300, collapsed: false }, -SIDEBAR_WIDTH_STEP).width).toBe(284);
  });

  it("kabuk tutamağı, daralt düğmesi ve localStorage anahtarını bağlar; dipnot kalabalığı yoktur", () => {
    const chrome = readSrc("components/shell/shell-chrome.tsx");
    const desktop = readSrc("components/shell/desktop-sidebar.tsx");
    const nav = readSrc("components/shell/sidebar-nav.tsx");
    expect(SIDEBAR_LAYOUT_STORAGE_KEY).toBe("yetkin-rail.shell.sidebar-layout");
    expect(chrome).toContain("SidebarLayoutProvider");
    expect(chrome).toContain("DesktopSidebar");
    expect(chrome).not.toContain("SidebarFootnote");
    expect(chrome).not.toContain("Faz 1");
    expect(chrome).not.toContain("Akademi → Kanıt → İş");
    expect(desktop).toContain("Menüyü daralt");
    expect(desktop).toContain("Menüyü genişlet");
    expect(desktop).toContain("SidebarResizeHandle");
    expect(desktop).toContain("writeSidebarLayoutToStorage");
    expect(desktop).toContain("useSyncExternalStore");
    expect(desktop).toContain('role="separator"');
    expect(desktop).toContain("cursor-col-resize");
    expect(desktop).toContain("collapsed");
    expect(desktop).not.toContain("SidebarFootnote");
    expect(desktop).not.toContain("Faz 1");
    expect(desktop).not.toContain("Akademi → Kanıt → İş");
    expect(desktop).not.toContain("4 oda");
    expect(nav).toContain("collapsed");
    expect(nav).toContain("sr-only");
  });

  it("Next.js geliştirici rozeti sol altı kapatmaz", () => {
    const config = readSrc("next.config.ts");
    expect(config).toContain("devIndicators: false");
    expect(config).not.toMatch(/position:\s*['"]bottom-left['"]/);
  });

  it("Next.js dev CORS 127.0.0.1 ve localhost kökenlerine izin verir", () => {
    const config = readSrc("next.config.ts");
    expect(config).toContain("allowedDevOrigins");
    expect(config).toContain('"127.0.0.1"');
    expect(config).toContain('"localhost"');
  });
});
