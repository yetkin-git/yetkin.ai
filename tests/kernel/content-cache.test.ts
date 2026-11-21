import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  CONTENT_CACHE_TTL_SECONDS,
  createContentCache,
} from "@/lib/content/cache";
import {
  clearPublicContentCache,
  glossaryEntryPath,
  guideEntryPath,
  loadGlossaryTerm,
  loadGlossaryTerms,
  loadLegalSection,
  loadPublicGuide,
  loadPublicGuides,
} from "@/lib/content/public-content";
import { GLOSSARY_TERMS, glossaryPath } from "@/lib/copy/glossary";
import { PUBLIC_GUIDES, guidePath } from "@/lib/copy/guides";
import { LEGAL_LAUNCH_SECTIONS } from "@/lib/copy/legal-launch";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

/**
 * Faz 2 / P3 — statik içerik önbelleği.
 *
 * Tespit §5.5: `/sozluk`, `/sozluk/[terim]`, `/rehber/[slug]`, `/legal/[slug]`
 * tamamen dosya sabitlerinden besleniyordu ama her istekte aynı kayıt çözümü
 * yeniden yapılıyordu. Bu testler önbelleğin **davranışını** kilitler; sayfa
 * gövdelerinin istek anında nonce CSP ile basılmaya devam ettiğini de doğrular.
 */
describe("Faz 2 içerik önbelleği — davranış", () => {
  it("aynı anahtar için yükleyici bir kez çağrılır (TTL içinde)", async () => {
    const cache = createContentCache<number>();
    const load = vi.fn(() => 42);

    expect(await cache.read("k", load)).toBe(42);
    expect(await cache.read("k", load)).toBe(42);
    expect(await cache.read("k", load)).toBe(42);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("TTL dolduğunda yeniden okur", async () => {
    let clock = 1_000;
    const cache = createContentCache<number>({ ttlSeconds: 10, now: () => clock });
    const load = vi.fn(() => clock);

    expect(await cache.read("k", load)).toBe(1_000);
    clock += 5_000;
    expect(await cache.read("k", load)).toBe(1_000);
    expect(load).toHaveBeenCalledTimes(1);

    clock += 6_000; // TTL (10 sn) geçti
    expect(await cache.read("k", load)).toBe(12_000);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("eşzamanlı istekler tek uçuşta birleşir (single-flight)", async () => {
    const cache = createContentCache<string>();
    let calls = 0;
    const load = async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return "value";
    };

    const results = await Promise.all([
      cache.read("k", load),
      cache.read("k", load),
      cache.read("k", load),
      cache.read("k", load),
    ]);
    expect(results).toEqual(["value", "value", "value", "value"]);
    expect(calls).toBe(1);
  });

  it("hata önbelleğe alınmaz: sonraki istek yeniden dener", async () => {
    const cache = createContentCache<string>();
    let attempt = 0;
    const flaky = () => {
      attempt += 1;
      if (attempt === 1) {
        throw new Error("boom");
      }
      return "ok";
    };

    await expect(cache.read("k", flaky)).rejects.toThrow("boom");
    expect(await cache.read("k", flaky)).toBe("ok");
    expect(attempt).toBe(2);
  });

  it("farklı anahtarlar birbirine karışmaz", async () => {
    const cache = createContentCache<string>();
    expect(await cache.read("a", () => "A")).toBe("A");
    expect(await cache.read("b", () => "B")).toBe("B");
    expect(await cache.read("a", () => "X")).toBe("A");
  });

  it("TTL saniye cinsinden ve makul (bir saat)", () => {
    expect(CONTENT_CACHE_TTL_SECONDS).toBe(3_600);
  });
});

describe("Faz 2 içerik önbelleği — kamu içerik yüzeyleri", () => {
  it("sözlük, rehber ve yasal yükleyiciler kaynakla aynı sonucu döner", async () => {
    clearPublicContentCache();

    const terms = await loadGlossaryTerms();
    expect(terms).toHaveLength(GLOSSARY_TERMS.length);
    expect(terms.map((term) => term.slug)).toEqual(GLOSSARY_TERMS.map((term) => term.slug));

    const first = GLOSSARY_TERMS[0]!;
    const term = await loadGlossaryTerm(first.slug);
    expect(term?.term).toBe(first.term);
    expect(await loadGlossaryTerm("olmayan-terim")).toBeNull();
    expect(glossaryEntryPath(first.slug)).toBe(glossaryPath(first.slug));

    const guides = await loadPublicGuides();
    expect(guides).toHaveLength(PUBLIC_GUIDES.length);
    const guide = await loadPublicGuide(PUBLIC_GUIDES[0]!.slug);
    expect(guide?.title).toBe(PUBLIC_GUIDES[0]!.title);
    expect(await loadPublicGuide("olmayan-rehber")).toBeNull();
    expect(guideEntryPath(PUBLIC_GUIDES[0]!.slug)).toBe(guidePath(PUBLIC_GUIDES[0]!.slug));

    const section = await loadLegalSection(LEGAL_LAUNCH_SECTIONS[0]!.slug);
    expect(section?.title).toBe(LEGAL_LAUNCH_SECTIONS[0]!.title);
    expect(await loadLegalSection("olmayan-yasal")).toBeNull();
  });

  it("yükleyici kimlik sızdırmaz: dönen nesneler kamu alanlarıdır", async () => {
    clearPublicContentCache();
    const serialized = JSON.stringify(await loadGlossaryTerms());
    expect(serialized).not.toContain("userId");
    expect(serialized).not.toContain("email");
  });
});

describe("Faz 2 içerik önbelleği — sayfa bağlantısı", () => {
  it("dört statik sayfa önbellekli yükleyiciyi kullanır", () => {
    const sozluk = readSrc("app/(public)/sozluk/page.tsx");
    expect(sozluk).toContain("loadGlossaryTerms");
    expect(sozluk).not.toContain("GLOSSARY_TERMS.map");

    const terim = readSrc("app/(public)/sozluk/[terim]/page.tsx");
    expect(terim).toContain("loadGlossaryTerm");

    const rehber = readSrc("app/(public)/rehber/[slug]/page.tsx");
    expect(rehber).toContain("loadPublicGuide");

    const legal = readSrc("app/(public)/legal/[slug]/page.tsx");
    expect(legal).toContain("loadLegalSection");
  });

  it("CSP nonce dinamiği bozulmadı: kök layout cookies + connection taşır", () => {
    // Bu sayfalar için tam sayfa ISR bilinçli olarak kullanılmadı; nonce CSP
    // istek kapsamlı kalır. Kilit: kök layout davranışı değişmedi.
    const layout = readSrc("app/layout.tsx");
    expect(layout).toContain("await connection()");
    expect(layout).toContain("cookies()");
    // Hiçbir statik sayfa `force-static` ile nonce'u dondurmaya çalışmaz.
    for (const file of [
      "app/(public)/sozluk/page.tsx",
      "app/(public)/sozluk/[terim]/page.tsx",
      "app/(public)/rehber/[slug]/page.tsx",
      "app/(public)/legal/[slug]/page.tsx",
    ]) {
      expect(readSrc(file), file).not.toContain("force-static");
    }
  });

  it("önbellek modülü sunucu tarafıdır; istemciye sızmaz", () => {
    const cache = readSrc("lib/content/cache.ts");
    expect(cache).not.toContain('"use client"');
    expect(cache).not.toContain("window.");
  });
});
