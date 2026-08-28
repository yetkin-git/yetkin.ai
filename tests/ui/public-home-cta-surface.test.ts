import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { YETKIN_BRAND, YETKIN_RELEASE_LABEL } from "@/lib/copy/brand";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("ana sayfa Hero CTA oturum yüzeyi", () => {
  it("misafire Giriş Yap / Kayıt Ol, oturumluya tek Anasayfaya geç basar", () => {
    const page = readSrc("app/(public)/page.tsx");
    const copy = SEN_VOICE.public.home;
    expect(copy.loginCta).toBe("Giriş Yap");
    expect(copy.registerCta).toBe("Kayıt Ol");
    expect(copy.cockpitCta).toBe("Anasayfaya geç");
    expect(page).toContain("getSession");
    expect(page).toContain("copy.loginCta");
    expect(page).toContain("copy.registerCta");
    expect(page).toContain("copy.cockpitCta");
    expect(page).toContain('href="/login"');
    expect(page).toContain('href="/register"');
    expect(page).toContain('href="/dashboard"');
    expect(page).toContain("session ?");
    expect(page).not.toContain("enterCta");
    expect(page).not.toContain("Anasayfaya gir");
  });

  it("Y logosunu yetkin.ai ve v1.0.0 Beta ile sol üste kilitler; viewport taşmasını keser", () => {
    const page = readSrc("app/(public)/page.tsx");
    const copy = SEN_VOICE.public.home;
    expect(YETKIN_RELEASE_LABEL).toBe("v1.0.0 Beta");
    expect(copy.versionBadge).toBe(YETKIN_RELEASE_LABEL);
    expect(copy.badge).toBe(YETKIN_BRAND);
    expect(page).toContain("home-viewport-lock");
    expect(page).toContain("lg:h-dvh");
    expect(page).toContain("lg:max-h-dvh");
    expect(page).toContain("lg:overflow-hidden");
    expect(page).not.toContain("hover:-translate-y");
    expect(page).toContain("pt-4");
    expect(page).toContain("YETKIN_BRAND");
    expect(page).toContain("copy.versionBadge");
    expect(page).toContain("<header");
    expect(page).toContain("BrandIcon");
    expect(page).not.toContain("pt-16");
    expect(page).not.toContain("pb-20");
    expect(page).not.toContain("gap-10");
    expect(page).not.toMatch(/flex-col justify-center/);
    expect(readSrc("app/globals.css")).toContain("html:has(.home-viewport-lock)");
    expect(readSrc("app/globals.css")).toContain("overflow: hidden");
    expect(readSrc("app/globals.css")).toContain("max-height: 779px");
    expect(readSrc("app/globals.css")).toContain("nav-progress-root");
    expect(readSrc("app/globals.css")).toContain("nav-progress-indeterminate");
  });
});
