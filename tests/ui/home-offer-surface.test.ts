import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeOfferSection } from "@/components/public/home-offer-section";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { HOME_LANDING_FAQ } from "@/lib/copy/sem-keywords";
import { resolveHomeOfferState } from "@/lib/yetkinhibe/home-offer-state";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const offers = SEN_VOICE.public.home.offers;

/** Bölümün görünür metin yaprakları. */
function offerStrings(): string[] {
  return [
    offers.eyebrow,
    offers.heading,
    offers.lead,
    offers.statusLabel,
    offers.selfPrepare.title,
    offers.selfPrepare.body,
    offers.selfPrepare.note,
    offers.selfPrepare.cta,
    offers.expert.title,
    offers.expert.body,
    offers.expert.note,
  ];
}

describe("ana sayfa hibe hazırlığı bölümü (V1)", () => {
  it("önizleme yalnız iki oda da kapalıyken açılır; açık oda bölümü gizler", () => {
    expect(resolveHomeOfferState({ yetkinhibeKapali: true, freelancerKapali: true })).toBe("preview");
    expect(resolveHomeOfferState({ yetkinhibeKapali: false, freelancerKapali: true })).toBe("hidden");
    expect(resolveHomeOfferState({ yetkinhibeKapali: true, freelancerKapali: false })).toBe("hidden");
    expect(resolveHomeOfferState({ yetkinhibeKapali: false, freelancerKapali: false })).toBe("hidden");
  });

  it("gizli durumda hiçbir işaretleme basmaz", () => {
    const html = renderToStaticMarkup(createElement(HomeOfferSection, { state: "hidden", copy: offers }));
    expect(html).toBe("");
  });

  it("önizlemede iki kart basar; tek bağlantı ücretsiz derse gider, uzman kartında bağlantı yoktur", () => {
    const html = renderToStaticMarkup(createElement(HomeOfferSection, { state: "preview", copy: offers }));
    expect(html).toContain('aria-labelledby="home-offer-heading"');
    expect(html).toContain(offers.heading);
    expect(html).toContain(offers.selfPrepare.title);
    expect(html).toContain(offers.expert.title);
    expect(html.split(offers.statusLabel).length - 1).toBe(2);
    expect(html.match(/<a\s/g)?.length ?? 0).toBe(1);
    expect(html).toContain('href="/academy/01_office_ai/oyna"');
    expect(html).not.toContain("/freelancer");
    expect(html).not.toContain("/career");
  });

  it("bölüm metni fiyat, rakam, TL, 'Onaylı', '5 dakika' ve AI iddiası taşımaz", () => {
    const text = offerStrings().join("\n");
    expect(text).not.toMatch(/\d/u);
    expect(text).not.toMatch(/TL|₺/u);
    expect(text).not.toMatch(/\bAI\b/u);
    const lower = text.toLocaleLowerCase("tr");
    expect(lower).not.toContain("onaylı");
    expect(lower).not.toContain("dakika");
    expect(lower).not.toContain("freelancer");
  });

  it("bölüm ve ana sayfa SSS'si siz kalıbı taşımaz (büyük/küçük harf duyarsız tarama)", () => {
    const lower = [...offerStrings(), ...HOME_LANDING_FAQ.flatMap((row) => [row.question, row.answer])]
      .join("\n")
      .toLocaleLowerCase("tr");
    expect(lower).not.toMatch(/(?<!\p{L})siz\p{L}*/u);
    expect(lower).not.toMatch(
      /(?:ınız|iniz|unuz|ünüz|sınız|siniz|sunuz|sünüz|musunuz|mısınız|misiniz|müsünüz)(?!\p{L})/u,
    );
  });

  it("SSS ücretsiz yetkinlik testini kayıt ve barajla anlatır", () => {
    expect(HOME_LANDING_FAQ).toHaveLength(6);
    const row = HOME_LANDING_FAQ.find((item) => item.question === "Ücretsiz yetkinlik testi nasıl işler?");
    expect(row?.answer).toContain("Temel Muafiyet Rozeti");
    expect(row?.answer).not.toContain("Hazırlanıyor");
  });

  it("ana sayfa kapalı hibe önizlemesini basmaz; değer zincirini basar", () => {
    const page = readSrc("app/(public)/page.tsx");
    expect(page).not.toContain("HomeOfferSection");
    expect(page).not.toContain("resolveHomeOfferState");
    expect(page).not.toContain("Hazırlanıyor");
    expect(page).not.toContain("İki yol da henüz");
    expect(page).toContain("home-chain-heading");
    expect(page).toContain("OFF_101_EXEMPTION_PATH");
    expect(page).not.toContain("/freelancer");
    expect(page).not.toContain("/career");
    expect(page).not.toMatch(/4\.900|14\.900/u);
  });

  it("bölüm bileşeni sunucu bileşenidir: istemci kancası, olay işleyicisi ve sunucu-only içe aktarım yoktur", () => {
    const src = readSrc("components/public/home-offer-section.tsx");
    expect(src).not.toContain('"use client"');
    expect(src).not.toMatch(/useState|useEffect|onClick|server-only/u);
    expect(src).not.toMatch(/@prisma\/client|lib\/kernel\/db/u);
  });
});
