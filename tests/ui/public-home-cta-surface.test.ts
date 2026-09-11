import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("ana sayfa Hero CTA oturum yüzeyi", () => {
  it("misafire birincil Akademi CTA + header Giriş/Kayıt, oturumluya Panele geç basar", () => {
    const page = readSrc("app/(public)/page.tsx");
    const copy = SEN_VOICE.public.home;
    expect(copy.academyCta).toBe("Eğitimleri İncele");
    expect(copy.loginCta).toBe("Giriş Yap");
    expect(copy.registerCta).toBe("Kayıt Ol");
    expect(copy.cockpitCta).toBe("Panele geç");
    const nav = readSrc("components/public/home-account-nav.tsx");
    expect(page).toContain("HomeAccountNav");
    expect(page).not.toContain("getSession");
    expect(nav).toContain("getSession");
    expect(nav).toContain("Suspense");
    expect(page).toContain("copy.academyCta");
    expect(nav).toContain("copy.loginCta");
    expect(nav).toContain("copy.registerCta");
    expect(nav).toContain("copy.cockpitCta");
    expect(page).toContain('href="/academy"');
    expect(nav).toContain('href="/login"');
    expect(nav).toContain('href="/register"');
    expect(nav).toContain('href="/dashboard"');
    expect(nav).toContain("session ?");
    expect(nav).toContain('aria-label="Hesap"');
    expect(page).not.toContain("enterCta");
    expect(page).not.toContain("Anasayfaya gir");
    expect(page).not.toContain("Anasayfaya geç");
    expect(page).not.toContain("VERTICAL_ROOMS");
    expect(page).not.toContain("ROOM_ICONS");
    expect(page).toContain("copy.hero");
    expect(page).not.toContain("copy.footnotes");
    expect(page).not.toContain("copy.journey");
    expect(page).not.toContain("/freelancer");
    expect(page).not.toContain("/career");
    expect(copy.hero.href).toBe("/academy");
    expect(copy).not.toHaveProperty("footnotes");
    expect(copy).not.toHaveProperty("footnoteLead");
  });

  it("Beta rozeti ve viewport kilidi taşımaz; marka sol üstte, hesap sağ üstte", () => {
    const page = readSrc("app/(public)/page.tsx");
    const nav = readSrc("components/public/home-account-nav.tsx");
    const copy = SEN_VOICE.public.home;
    const css = readSrc("app/globals.css");
    expect(copy).not.toHaveProperty("versionBadge");
    expect(copy.badge).toBe(YETKIN_BRAND);
    expect(page).not.toContain("home-viewport-lock");
    expect(page).not.toContain("lg:h-dvh");
    expect(page).not.toContain("lg:max-h-dvh");
    expect(page).not.toContain("lg:overflow-hidden");
    expect(page).not.toContain("versionBadge");
    expect(page).not.toContain("v1.0.0 Beta");
    expect(page).not.toContain("hover:-translate-y");
    expect(page).toContain("pt-4");
    expect(page).toContain("YETKIN_BRAND");
    expect(page).toContain("<header");
    expect(page).toContain("BrandIcon");
    expect(nav).toContain("ml-auto");
    expect(page).not.toContain("pt-16");
    expect(page).not.toContain("pb-20");
    expect(page).not.toContain("gap-10");
    expect(page).not.toMatch(/flex-col justify-center/);
    expect(css).not.toContain("html:has(.home-viewport-lock)");
    expect(css).not.toContain("max-height: 779px");
    expect(css).toContain("nav-progress-root");
    expect(css).toContain("nav-progress-indeterminate");
  });
});
