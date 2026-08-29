import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { ACADEMY_COURSE_TITLES, academyCourseTitleBySlug } from "@/lib/academy/course-titles";
import {
  applyBreadcrumbOverrides,
  breadcrumbsFromPathname,
  looksLikeOpaqueId,
  normalizeBreadcrumbPath,
} from "@/lib/ui/breadcrumbs";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function labels(pathname: string | null): string[] {
  return breadcrumbsFromPathname(pathname).map((crumb) => crumb.label);
}

function hrefs(pathname: string): string[] {
  return breadcrumbsFromPathname(pathname).map((crumb) => crumb.href);
}

describe("dinamik ekmek kırıntısı", () => {
  it("çalışan oda köklerini Anasayfa hiyerarşisine bağlar", () => {
    expect(labels("/dashboard")).toEqual(["Anasayfa"]);
    expect(hrefs("/dashboard")).toEqual(["/dashboard"]);
    expect(labels("/academy")).toEqual(["Anasayfa", "Akademi"]);
    expect(hrefs("/academy")).toEqual(["/dashboard", "/academy"]);
    expect(labels("/career")).toEqual(["Anasayfa", "Kariyer"]);
    expect(labels("/freelancer")).toEqual(["Anasayfa", "Freelancer"]);
    expect(labels("/profil")).toEqual(["Anasayfa", "Profil"]);
    expect(labels("/cuzdan")).toEqual(["Anasayfa", "Cüzdan"]);
  });

  it("akademi kurs slug'ını tohum başlığına çözer; müfredat dördüncü kırıntıdır", () => {
    expect(ACADEMY_COURSE_TITLES["python-temel"]).toBe(
      "Python ile Sıfırdan Programlama ve Problem Çözme",
    );
    for (const seed of ACADEMY_COURSE_SEEDS) {
      expect(academyCourseTitleBySlug(seed.slug)).toBe(seed.title);
      expect(labels(`/academy/${seed.slug}`)).toEqual(["Anasayfa", "Akademi", seed.title]);
      expect(hrefs(`/academy/${seed.slug}`)).toEqual([
        "/dashboard",
        "/academy",
        `/academy/${seed.slug}`,
      ]);
    }
    expect(labels("/academy/python-temel/oyna")).toEqual([
      "Anasayfa",
      "Akademi",
      "Python ile Sıfırdan Programlama ve Problem Çözme",
      "Müfredat",
    ]);
    expect(labels("/academy/certificates")).toEqual(["Anasayfa", "Akademi", "Sertifikalar"]);
    expect(labels("/academy/dogrula")).toEqual(["Anasayfa", "Akademi", "Doğrula"]);
    expect(labels("/academy/dogrula/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toEqual(
      ["Anasayfa", "Akademi", "Doğrula"],
    );
  });

  it("freelancer alt yollarında koleksiyon klasörünü basmaz", () => {
    expect(labels("/freelancer/new")).toEqual(["Anasayfa", "Freelancer", "İlan oluştur"]);
    expect(labels("/freelancer/jobs/fj_rail_icon_set")).toEqual(["Anasayfa", "Freelancer", "İlan"]);
    expect(hrefs("/freelancer/jobs/fj_rail_icon_set")).toEqual([
      "/dashboard",
      "/freelancer",
      "/freelancer/jobs/fj_rail_icon_set",
    ]);
    expect(labels("/freelancer/contracts/cabcdefghijklmnopqrstuvwx")).toEqual([
      "Anasayfa",
      "Freelancer",
      "Sözleşme",
    ]);
  });

  it("canlı başlık override yalnız eşleşen href kırıntısını değiştirir", () => {
    const crumbs = breadcrumbsFromPathname("/academy/ai-temel/oyna");
    const next = applyBreadcrumbOverrides(crumbs, [
      {
        href: "/academy/ai-temel",
        label: "Yapay Zekâ ve Prompt Mühendisliğine Giriş",
      },
    ]);
    expect(next.map((crumb) => crumb.label)).toEqual([
      "Anasayfa",
      "Akademi",
      "Yapay Zekâ ve Prompt Mühendisliğine Giriş",
      "Müfredat",
    ]);
    const job = applyBreadcrumbOverrides(breadcrumbsFromPathname("/freelancer/jobs/abc"), [
      { href: "/freelancer/jobs/abc", label: "İkon seti teslimi" },
    ]);
    expect(job.map((crumb) => crumb.label)).toEqual(["Anasayfa", "Freelancer", "İkon seti teslimi"]);
  });

  it("pazaryeri disk yolunu Yetkinİlan vatandaş yoluna çeker", () => {
    expect(normalizeBreadcrumbPath("/pazaryeri/tezgah")).toBe("/yetkinilan/tezgah");
    expect(labels("/pazaryeri/tezgah")).toEqual(["Anasayfa", "Yetkinİlan", "Tezgâh"]);
    expect(hrefs("/yetkinilan/siparisler")).toEqual([
      "/dashboard",
      "/yetkinilan",
      "/yetkinilan/siparisler",
    ]);
  });

  it("üst şerit statik yüzey metnini breadcrumb bileşeniyle değiştirir", () => {
    const header = readSrc("components/shell/header-bar.tsx");
    const trail = readSrc("components/shell/header-breadcrumb.tsx");
    const chrome = readSrc("components/shell/shell-chrome.tsx");
    expect(header).toContain("HeaderBreadcrumb");
    expect(header).not.toContain("yüzeyi");
    expect(header).not.toContain("cockpit");
    expect(header).not.toContain("roomLabelFromId");
    expect(trail).toContain("aria-label=\"Sayfa yolu\"");
    expect(trail).toContain("aria-current=\"page\"");
    expect(trail).toContain("truncate");
    expect(trail).toContain("BreadcrumbPageLabel");
    expect(trail).toContain("from \"next/link\"");
    expect(chrome).toContain("BreadcrumbOverrideProvider");
    expect(readSrc("app/academy/[slug]/page.tsx")).toContain("BreadcrumbPageLabel");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).toContain("BreadcrumbPageLabel");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("BreadcrumbPageLabel");
    expect(looksLikeOpaqueId("fj_rail_icon_set")).toBe(true);
    expect(looksLikeOpaqueId("yz-icerik-gorsel-uretim")).toBe(false);
  });
});
