import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { tezgahToolHref } from "@/lib/tezgah/catalog";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const BENCH_TOOLS = ["ecommerce", "proposal", "tetkik", "dukkan", "pazaryeri", "reklam", "grant"] as const;

describe("ana sayfa yedili tezgâh vitrini", () => {
  it("sayfa kaynağında yedi araç linkini bu sırayla basar; zincir durur", () => {
    const page = readSrc("app/(public)/page.tsx");
    const copySrc = readSrc("lib/copy/sen-voice/public.ts");
    const home = SEN_VOICE.public.home;
    const hrefs = BENCH_TOOLS.map((id) => tezgahToolHref(id));

    expect(home.bench.map((item) => item.id)).toEqual([...BENCH_TOOLS]);
    expect(home.bench.map((item) => item.href)).toEqual(hrefs);
    expect(home.bench.map((item) => item.title)).toEqual([
      "E-Ticaret Ürün Kartı",
      "Müşteri Teklif Yazıcı",
      "Web Sitesi Tetkik",
      "Sektörel Dijital Dükkan",
      "Pazaryeri Katalog Fabrikası",
      "Otonom Reklam Paketi",
      "Hibe Proje Dosyası",
    ]);
    expect(home.benchTitle).toBe("Yedi araç, bugün teslim");

    let cursor = copySrc.indexOf("bench:");
    expect(cursor).toBeGreaterThan(-1);
    for (const href of hrefs) {
      const at = copySrc.indexOf(href, cursor);
      expect(at).toBeGreaterThan(cursor);
      cursor = at + href.length;
    }

    expect(page).toContain("copy.bench");
    expect(page).toContain("item.href");
    expect(page).toContain("data-home-bench");
    expect(page).toContain("home-bench-heading");
    for (const href of hrefs) {
      expect(copySrc).toContain(href);
    }
    const chainAt = page.indexOf("data-home-value-chain");
    const benchAt = page.indexOf("data-home-bench");
    const tracksAt = page.indexOf("home-tracks-heading");
    expect(chainAt).toBeGreaterThan(-1);
    expect(benchAt).toBeGreaterThan(chainAt);
    expect(tracksAt).toBeGreaterThan(benchAt);

    expect(home.chain).toHaveLength(4);
    expect(home.chainTitle).toBe("Dört adımda sistem");
    expect(home.chain[0]).toMatchObject({ href: "/tezgah", title: "Ücretsiz Test & Tezgâh" });
    expect(page).toContain('href="/tezgah"');
    expect(page).toContain("copy.chain");
    expect(page).not.toContain("HomeOfferSection");
    expect(page).not.toContain("Hazırlanıyor");
    expect(home.chain[3]?.title).toBe("30 Günlük Plan ve Canlı Vitrin");
    expect(home.title).not.toContain("İşverenlerle Buluş");
    expect(home.description).not.toContain("teklif ver");
  });

  it("vitrin metni fiyatsızdır; freelancer ve kariyer yolu yoktur", () => {
    const page = readSrc("app/(public)/page.tsx");
    const home = SEN_VOICE.public.home;
    const text = [home.benchKicker, home.benchTitle, ...home.bench.flatMap((item) => [item.title, item.body, item.href])].join(
      "\n",
    );
    expect(text).not.toMatch(/TL|₺/u);
    expect(text).not.toMatch(/\b\d+\s*TL\b/u);
    expect(home.bench.map((item) => item.href).join("\n")).not.toContain("/freelancer");
    expect(home.bench.map((item) => item.href).join("\n")).not.toContain("/career");
    expect(page).not.toContain("/freelancer");
    expect(page).not.toContain("/career");
    const lower = text.toLocaleLowerCase("tr");
    expect(lower).not.toMatch(/(?<!\p{L})siz\p{L}*/u);
  });
});
