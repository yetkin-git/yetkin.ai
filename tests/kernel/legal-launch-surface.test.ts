import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LEGAL_HONESTY_BODY,
  LEGAL_LAUNCH_SECTIONS,
  LEGAL_PAGE_TITLE,
  LEGAL_SECTION_IDS,
  LEGAL_SECTION_TITLES,
} from "@/lib/copy/legal-launch";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("lansman hukuk yüzeyi (O13)", () => {
  it("dürüst mükellefiyet kartını korur; dört lansman başlığını taşır", () => {
    expect(LEGAL_HONESTY_BODY).toContain("Canlı vergi mükellefiyeti henüz açık değildir.");
    expect(LEGAL_HONESTY_BODY).toContain("18 yaş altı Junior");
    expect(LEGAL_PAGE_TITLE).toBe("Gizlilik ve yasal çerçeve");
    expect(LEGAL_LAUNCH_SECTIONS).toHaveLength(4);
    expect(LEGAL_LAUNCH_SECTIONS.map((row) => row.title)).toEqual([
      LEGAL_SECTION_TITLES.kvkk,
      LEGAL_SECTION_TITLES.refund,
      LEGAL_SECTION_TITLES.distance,
      LEGAL_SECTION_TITLES.terms,
    ]);
    expect(LEGAL_SECTION_TITLES.kvkk).toBe("KVKK Aydınlatma Metni & Çerez Politikası");
    expect(LEGAL_SECTION_TITLES.refund).toBe("İade ve İptal Koşulları (Emanet / Bakiye Yükleme)");
    expect(LEGAL_SECTION_TITLES.distance).toBe("Mesafeli Hizmet ve Dijital İçerik Sözleşmesi");
    expect(LEGAL_SECTION_TITLES.terms).toBe("Platform Kullanım Şartları & Sorumluluk Sınırları");
    expect(LEGAL_SECTION_IDS.kvkk).toBe("kvkk-cerez");
  });

  it("/legal sayfası kopya sicilini basar; sahte VKN/MERSİS yazmaz", () => {
    const page = readSrc("app/(public)/legal/page.tsx");
    const copy = readSrc("lib/copy/legal-launch.ts");
    expect(page).toContain("LEGAL_HONESTY_BODY");
    expect(page).toContain("LEGAL_LAUNCH_SECTIONS");
    expect(page).toContain("LEGAL_PAGE_TITLE");
    expect(copy).toContain("Canlı vergi mükellefiyeti henüz açık değildir.");
    expect(copy).toContain("EscrowHold");
    expect(copy).toContain("amountMinor");
    expect(copy).not.toMatch(/VKN:\s*\d/);
    expect(copy).not.toContain("YAPINET");
    expect(copy).not.toContain("hukuk@yetkin.ai");
  });
});
