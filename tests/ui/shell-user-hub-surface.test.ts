import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { KERNEL_SURFACES, VERTICAL_ROOMS } from "@/lib/kernel/modules";
import { PROTECTED_KERNEL_PATHS } from "@/lib/kernel/security/edge-guard";
import { ADMIN_SURFACE_PATH } from "@/lib/kernel/admin/types";
import { PROFILE_SURFACE_PATH, WALLET_SURFACE_PATH } from "@/lib/kernel/identity/types";
import { PASSPORT_SURFACE_PATH } from "@/lib/kernel/passport/types";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("kabuk kullanıcı hub yüzeyi", () => {
  it("çekirdek sicili dört sığınak taşır; cüzdan ayrı CTA, diğerleri menüdür", () => {
    expect(KERNEL_SURFACES.map((surface) => surface.id)).toEqual([
      "profil",
      "cuzdan",
      "pasaport",
      "admin",
    ]);
    expect(KERNEL_SURFACES.map((surface) => surface.path)).toEqual([
      PROFILE_SURFACE_PATH,
      WALLET_SURFACE_PATH,
      PASSPORT_SURFACE_PATH,
      ADMIN_SURFACE_PATH,
    ]);
  });

  it("sol ray Faz 1 odalarını basar; Junior ve çekirdek sığınak yoktur", () => {
    expect(VERTICAL_ROOMS).toHaveLength(4);
    const nav = readSrc("components/shell/sidebar-nav.tsx");
    expect(nav).toContain("VERTICAL_ROOMS");
    expect(nav).toContain("isPhase1ShellNavRoom");
    expect(nav).not.toContain("KERNEL_SURFACES");
    expect(nav).not.toContain("Çekirdek");
    expect(nav).not.toContain("/profil");
    expect(nav).not.toContain("/cuzdan");
    expect(nav).not.toContain("/pasaport");
    expect(nav).not.toContain("/admin");
    expect(nav).not.toContain("Pasif");
  });

  it("sol ray 4 oda ritmi ferahdır; alt şerit daraltma tutamacıdır, dipnot kalabalığı yoktur", () => {
    const nav = readSrc("components/shell/sidebar-nav.tsx");
    const chrome = readSrc("components/shell/shell-chrome.tsx");
    const desktop = readSrc("components/shell/desktop-sidebar.tsx");
    expect(nav).toContain("gap-1.5");
    expect(nav).toContain("py-2.5");
    expect(nav).toContain("leading-snug");
    expect(nav).toContain("min-w-0 flex-1 overflow-hidden");
    expect(nav).toContain("truncate");
    expect(nav).not.toContain("gap-0.5");
    expect(nav).not.toContain("line-clamp-1");
    expect(chrome).toContain("DesktopSidebar");
    expect(chrome).toContain("min-h-0 flex-1 overflow-y-auto");
    expect(chrome).not.toContain("12 asil oda");
    expect(chrome).not.toContain("SidebarFootnote");
    expect(chrome).not.toContain("Faz 1");
    expect(chrome).not.toContain("Akademi → Kanıt → İş");
    expect(chrome).not.toContain("Faz 1 · Akademi → Kanıt → İş · 4 oda");
    expect(chrome).not.toContain("py-5");
    expect(chrome).not.toContain("pb-6");
    expect(desktop).toContain("shrink-0");
    expect(desktop).toContain("Menüyü daralt");
    expect(desktop).toContain("SidebarResizeHandle");
    expect(desktop).toContain("py-3.5");
    expect(desktop).not.toContain("SidebarFootnote");
    expect(desktop).not.toContain("Faz 1 · Akademi → Kanıt → İş · 4 oda");
  });

  it("sağ üst komuta şeridi bakiyeyi /cuzdan’a, menüyü KERNEL_SURFACES’e bağlar", () => {
    const hub = readSrc("components/shell/user-hub.tsx");
    const header = readSrc("components/shell/header-bar.tsx");
    const chip = readSrc("components/shell/header-wallet-chip.tsx");
    const sessionHub = readSrc("components/shell/app-shell-user-hub.tsx");
    expect(header).toContain("userCluster");
    expect(header).not.toContain("Mühürlü ray");
    expect(header).not.toContain("Badge");
    expect(header).not.toContain('href="/profil"');
    expect(header).not.toContain('href="/pasaport"');
    expect(chip).toContain("WALLET_SURFACE_PATH");
    expect(chip).not.toContain("fetch(");
    expect(chip).not.toContain("useEffect");
    expect(chip).not.toContain("useState");
    expect(chip).toContain("pending");
    expect(chip).toContain("min-w-[4.75rem]");
    expect(hub).toContain("KERNEL_SURFACES");
    expect(hub).toContain("walletChip");
    expect(hub).not.toContain("HeaderWalletChip");
    expect(sessionHub).toContain("HeaderWalletChip");
    expect(sessionHub).toContain("readWalletStripSnapshot");
    expect(sessionHub).toContain("Suspense");
    expect(hub).toContain("showAdmin");
    expect(hub).toContain('surface.id !== "admin"');
    expect(hub).toContain('surface.id !== "cuzdan"');
  });

  it("hesap menüsü Çıkış Yap ile mühürlü POST /api/auth/logout ve /login 303 bağlar", () => {
    const hub = readSrc("components/shell/user-hub.tsx");
    const logout = readSrc("app/api/(kernel)/auth/logout/route.ts");
    expect(hub).toContain("AUTH_LOGOUT_API_PATH");
    expect(hub).toContain("AUTH_SEN.logout.submit");
    expect(hub).toContain('method="POST"');
    expect(hub).toContain("text-[var(--rose)]");
    expect(hub).toContain("IconLogout");
    expect(hub).not.toContain("router.push");
    expect(hub).not.toContain("router.refresh");
    expect(logout).toContain('export const auth = "public"');
    expect(logout).toContain("supabase.auth.signOut");
    expect(logout).toContain("createSupabaseCookieClient");
    expect(logout).toContain("CITIZEN_LOGIN_PATH");
    expect(logout).toContain("NextResponse.redirect");
    expect(logout).toContain(", 303");
    expect(logout).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(logout).not.toContain("LOCAL_MOCK_AUTH");
  });

  it("admin görünürlüğü RSC oturum + isSuperAdminActor; kenar ve yol sicili durur", () => {
    const shell = readSrc("components/shell/app-shell.tsx");
    const chrome = readSrc("components/shell/shell-chrome.tsx");
    const sessionHub = readSrc("components/shell/app-shell-user-hub.tsx");
    expect(shell).toContain("AppShellUserHub");
    expect(sessionHub).toContain("getSession");
    expect(sessionHub).toContain("showAdmin");
    expect(sessionHub).toContain("isSuperAdminActor");
    expect(sessionHub).toContain("walletChip");
    expect(sessionHub).toContain("readWalletStripSnapshot");
    expect(chrome).toContain("userCluster");
    expect(chrome).not.toContain("getSession");
    expect(PROTECTED_KERNEL_PATHS).toEqual([
      "/dashboard",
      "/cuzdan",
      "/profil",
      "/pasaport",
      "/admin",
    ]);
  });
});
