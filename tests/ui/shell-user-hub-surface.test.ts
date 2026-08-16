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

  it("sol ray yalnız on iki dikey oda basar; Çekirdek bloğu yoktur", () => {
    expect(VERTICAL_ROOMS).toHaveLength(12);
    const nav = readSrc("components/shell/sidebar-nav.tsx");
    expect(nav).toContain("VERTICAL_ROOMS");
    expect(nav).not.toContain("KERNEL_SURFACES");
    expect(nav).not.toContain("Çekirdek");
    expect(nav).not.toContain("/profil");
    expect(nav).not.toContain("/cuzdan");
    expect(nav).not.toContain("/pasaport");
    expect(nav).not.toContain("/admin");
  });

  it("sol ray dikey ritim sıkıdır; 12 oda tek viewport’a çivilenir", () => {
    const nav = readSrc("components/shell/sidebar-nav.tsx");
    const chrome = readSrc("components/shell/shell-chrome.tsx");
    expect(nav).toContain("gap-0.5");
    expect(nav).toContain("py-1");
    expect(nav).toContain("leading-tight");
    expect(nav).toContain("text-[11px]");
    expect(nav).toContain("line-clamp-1");
    expect(nav).not.toContain("py-2.5");
    expect(nav).not.toContain("space-y-2");
    expect(chrome).toContain("py-3");
    expect(chrome).toContain("pb-2");
    expect(chrome).toContain("min-h-0 flex-1 overflow-y-auto");
    expect(chrome).not.toContain("py-5");
    expect(chrome).not.toContain("pb-6");
  });

  it("sağ üst komuta şeridi bakiyeyi /cuzdan’a, menüyü KERNEL_SURFACES’e bağlar", () => {
    const hub = readSrc("components/shell/user-hub.tsx");
    const header = readSrc("components/shell/header-bar.tsx");
    const chip = readSrc("components/shell/header-wallet-chip.tsx");
    expect(header).toContain("UserHub");
    expect(header).not.toContain('href="/profil"');
    expect(header).not.toContain('href="/pasaport"');
    expect(chip).toContain("WALLET_SURFACE_PATH");
    expect(hub).toContain("KERNEL_SURFACES");
    expect(hub).toContain("HeaderWalletChip");
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

  it("admin görünürlüğü RSC oturum + isSuperAdminUser; kenar ve yol sicili durur", () => {
    const shell = readSrc("components/shell/app-shell.tsx");
    const chrome = readSrc("components/shell/shell-chrome.tsx");
    expect(shell).toContain("getSession");
    expect(shell).toContain("isSuperAdminUser");
    expect(shell).toContain("showAdmin");
    expect(chrome).toContain("showAdmin");
    expect(PROTECTED_KERNEL_PATHS).toEqual([
      "/dashboard",
      "/cuzdan",
      "/profil",
      "/pasaport",
      "/admin",
    ]);
  });
});
