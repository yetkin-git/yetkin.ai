import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { readStyleBundle } from "../helpers/style-bundle";
import {
  buildCitizenLoginHref,
  buildCitizenRegisterHref,
  resolvePostLoginPath,
} from "@/lib/kernel/auth/redirects";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("ana sayfa Hero CTA oturum yüzeyi", () => {
  it("misafire birincil Tezgâh CTA + ikincil fiyat linki, oturumluya Panele geç basar", () => {
    const page = readSrc("app/(public)/page.tsx");
    const copy = SEN_VOICE.public.home;
    expect(copy.primaryCta).toBe("Ücretsiz Hemen Dene (Kayıt Gerekmez)");
    expect(copy.secondaryCta).toBe("Paketleri İncele");
    expect(copy.tezgahCta).toBe("Tezgâhı Aç");
    expect(copy.freeLessonCta).toBe("Ücretsiz Dersi İzle");
    expect(copy.loginCta).toBe("Giriş Yap");
    expect(copy.registerCta).toBe("Kayıt Ol");
    expect(copy.cockpitCta).toBe("Panele geç");
    const nav = readSrc("components/public/home-account-nav.tsx");
    expect(page).toContain("HomeAccountNav");
    expect(page).not.toContain("getSession");
    expect(nav).toContain("getSession");
    expect(nav).toContain("Suspense");
    expect(page).toContain("copy.primaryCta");
    expect(page).toContain("copy.secondaryCta");
    expect(page).not.toContain("copy.academyCta");
    expect(nav).toContain("copy.loginCta");
    expect(nav).toContain("copy.registerCta");
    expect(nav).toContain("copy.cockpitCta");
    expect(page).toContain('href="/tezgah"');
    expect(page).toContain('href="/fiyatlandirma"');
    expect(page).toContain('href="/kurumsal"');
    expect(page).toContain('href="/rehber"');
    expect(page).toContain("{copy.primaryCta}");
    expect(page).toContain("{copy.secondaryCta}");
    expect(page).toContain("track.href");
    expect(page).toContain("track.cta");
    expect(page).not.toContain("E-Ticaret İşletim Sistemi");
    expect(page).not.toContain("copy.freeLessonCta");
    expect(page).not.toContain("/academy");
    expect(page).not.toContain("/junior");
    expect(page).not.toContain("/young");
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
    expect(page).toContain("copy.chain");
    expect(page).toContain("copy.tracks");
    expect(page).not.toContain("copy.footnotes");
    expect(page).not.toContain("copy.journey");
    expect(page).not.toContain("/freelancer");
    expect(copy.tracks.map((track) => track.href)).toEqual([
      "/tezgah",
      "/e-ticaret",
      "#home-grant",
      "/career",
    ]);
    expect(copy.chain).toHaveLength(4);
    expect(copy.tracks).toHaveLength(4);
    expect(copy.tracks.every((track) => typeof track.cta === "string")).toBe(true);
    expect(copy).not.toHaveProperty("footnotes");
    expect(copy).not.toHaveProperty("footnoteLead");
  });

  it("korumalı CTA'lar giriş duvarına çarpmaz: hibe çapaya, e-ticaret next'li kayda iner", () => {
    const copy = SEN_VOICE.public.home;
    const page = readSrc("app/(public)/page.tsx");
    // Hibe: sayfa içi ücretsiz uygunluk testi (korumalı `/hibe` değil).
    const grantHrefs = [
      ...copy.chain.filter((step) => "href" in step).map((step) => ("href" in step ? step.href : "")),
      ...copy.bench.map((item) => item.href),
      ...copy.tracks.map((track) => track.href),
    ];
    expect(grantHrefs).not.toContain("/hibe");
    expect(grantHrefs.filter((href) => href === "#home-grant").length).toBeGreaterThanOrEqual(3);
    // E-ticaret: hedef korunur, ham `/e-ticaret` basılmaz.
    expect(grantHrefs).toContain("/e-ticaret");
    expect(page).toContain("homeCtaHref");
    expect(page).toContain("buildCitizenRegisterHref");
    expect(page).toContain("isProtectedCitizenPath");
    // Oturumsuz ziyaretçi `next=/e-ticaret` ile kayda gider, `/login` çıplak kalmaz.
    expect(buildCitizenRegisterHref("/e-ticaret")).toBe("/register?next=%2Fe-ticaret");
    expect(buildCitizenLoginHref("/e-ticaret")).toBe("/login?next=%2Fe-ticaret");
    // Açık yön (open redirect) kapalı: dış adres ve protokol-göreli yol reddedilir.
    expect(buildCitizenRegisterHref("https://evil.example")).toBe("/register");
    expect(buildCitizenRegisterHref("//evil.example")).toBe("/register");
    expect(buildCitizenLoginHref("https://evil.example")).toBe("/login");
  });

  it("`next` güvenli iç yola çözülür; dış hedef panele düşer", () => {
    // Güvenli iç yol korunur.
    expect(resolvePostLoginPath("/e-ticaret")).toBe("/e-ticaret");
    expect(resolvePostLoginPath("/hibe")).toBe("/hibe");
    // Açık yön denemeleri varsayılana düşer.
    expect(resolvePostLoginPath("https://evil.example/x")).toBe("/dashboard");
    expect(resolvePostLoginPath("//evil.example")).toBe("/dashboard");
    expect(resolvePostLoginPath("/\\evil.example")).toBe("/dashboard");
    expect(resolvePostLoginPath("javascript:alert(1)")).toBe("/dashboard");
    expect(resolvePostLoginPath(undefined)).toBe("/dashboard");
  });

  it("fiyat kartı ürün karşılığı olmayan 'Seviye Testi' satırı basmaz", () => {
    const vitrine = readSrc("lib/pricing/public-vitrine.ts");
    expect(vitrine).not.toContain("Seviye Testi");
    expect(vitrine).toContain("YetkinCV & Yetkinlik Pasaportu");
    const copy = readSrc("lib/copy/sen-voice/public.ts");
    // Kullanılmayan CTA artıkları temizlendi.
    expect(copy).not.toContain("levelCta");
    expect(copy).not.toContain("tracksCta");
  });

  it("Beta rozeti ve viewport kilidi taşımaz; marka sol üstte, hesap sağ üstte", () => {
    const page = readSrc("app/(public)/page.tsx");
    const nav = readSrc("components/public/home-account-nav.tsx");
    const copy = SEN_VOICE.public.home;
    const css = readStyleBundle();
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
