import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isDirectorySlicePublished, publishedDirectoryCells, TALENT_DIRECTORY_K_MIN } from "@/lib/career/k-anonymity";
import {
  emptyTalentDirectory,
  parseTalentCity,
  projectTalentDirectory,
  TALENT_DIRECTORY_EXAM_CTA,
  type TalentDirectorySource,
} from "@/lib/career/talent-directory";
import { GLOSSARY_TERMS } from "@/lib/copy/glossary";
import { PUBLIC_GUIDES } from "@/lib/copy/guides";
import { isLlmMutationPath } from "@/lib/kernel/security/http-rate-limit";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";

const ROOT = process.cwd();

function source(index: number, partial: Partial<TalentDirectorySource> = {}): TalentDirectorySource {
  return {
    userKey: `user-secret-${index}`,
    stampId: `stamp${String(index).padStart(2, "0")}ok`,
    displayName: partial.displayName ?? `Usta ${index}`,
    title: partial.title ?? "E-Ticaret Rozeti",
    issuedAt: partial.issuedAt ?? new Date(`2026-08-${String(index).padStart(2, "0")}T00:00:00.000Z`),
    courseSlug: partial.courseSlug ?? "02_ecommerce_ai",
    portfolioTitle: partial.portfolioTitle ?? "Ürün kartı",
    city: partial.city ?? null,
  };
}

describe("uzman dizini k-anonimlik", () => {
  it("eşik 5'tir ve gevşetilemez", () => {
    expect(TALENT_DIRECTORY_K_MIN).toBe(5);
    expect(isDirectorySlicePublished(5)).toBe(true);
    expect(isDirectorySlicePublished(4)).toBe(false);
    expect(() => isDirectorySlicePublished(4, 3)).toThrow(/k_min_invalid/);
  });

  it("beşten az kişide kart ve kimlik basılmaz", () => {
    const view = projectTalentDirectory(
      [1, 2, 3, 4].map((index) => source(index, { displayName: `Gizli ${index}` })),
      { vertical: null, city: { kind: "all" } },
    );
    expect(view.status).toBe("empty");
    if (view.status !== "empty") {
      return;
    }
    expect(view.ctaLabel).toBe(TALENT_DIRECTORY_EXAM_CTA);
    expect(view.ctaHref).toBe("/career#yetkincv");
    const raw = JSON.stringify(view);
    expect(raw).not.toContain("user-secret");
    expect(raw).not.toContain("Gizli");
    expect(raw).not.toContain("stamp");
  });

  it("beş ve üzeri kişide gerçek kart basılır; e-posta adı rozet sahibi olur", () => {
    const people = [1, 2, 3, 4, 5, 6].map((index) =>
      source(index, {
        displayName: index === 1 ? "ada@ornek.com" : `Usta ${index}`,
        city: index === 6 ? "Ankara" : "İstanbul",
        courseSlug: index === 6 ? "05_prompt_practice" : "02_ecommerce_ai",
      }),
    );
    const open = projectTalentDirectory(people, { vertical: null, city: { kind: "all" } });
    expect(open.status).toBe("listed");
    if (open.status !== "listed") {
      return;
    }
    expect(open.experts).toHaveLength(6);
    expect(open.experts.some((expert) => expert.displayName === "Rozet sahibi")).toBe(true);
    expect(JSON.stringify(open)).not.toContain("user-secret");
    expect(JSON.stringify(open)).not.toContain("ada@ornek.com");
    expect(open.stats).toEqual([{ verticalId: "eticaret", label: "E-Ticaret", count: 5 }]);
    expect(publishedDirectoryCells([{ province: null, verticalId: "prompt", count: 1, suppressed: true }])).toEqual([]);

    const ankara = projectTalentDirectory(people, { vertical: null, city: { kind: "province", name: "Ankara" } });
    expect(ankara.status).toBe("empty");
    const istanbul = projectTalentDirectory(people, {
      vertical: "eticaret",
      city: { kind: "province", name: "İstanbul" },
    });
    expect(istanbul.status).toBe("listed");
    if (istanbul.status === "listed") {
      expect(istanbul.experts).toHaveLength(5);
      expect(istanbul.stats).toEqual([]);
    }
  });

  it("mahalle filtresi liste basmaz", () => {
    expect(parseTalentCity("Kadıköy Mahallesi").kind).toBe("rejected");
    const view = projectTalentDirectory([1, 2, 3, 4, 5, 6].map((index) => source(index)), {
      vertical: null,
      city: parseTalentCity("Kadıköy Mahallesi"),
    });
    expect(view).toEqual(emptyTalentDirectory("threshold"));
  });
});

describe("sözlük ve rehber yüzeyi", () => {
  it("30 terim ve 15 rehber tekil slug taşır; açıklama 160 karakteri geçmez", () => {
    expect(GLOSSARY_TERMS).toHaveLength(30);
    expect(PUBLIC_GUIDES).toHaveLength(15);
    expect(new Set(GLOSSARY_TERMS.map((term) => term.slug)).size).toBe(30);
    expect(new Set(PUBLIC_GUIDES.map((guide) => guide.slug)).size).toBe(15);
    for (const guide of PUBLIC_GUIDES) {
      expect(guide.description.length).toBeLessThanOrEqual(160);
      expect(guide.toolHref.startsWith("/freelancer")).toBe(false);
    }
    for (const term of GLOSSARY_TERMS) {
      expect(term.toolHref.startsWith("/freelancer")).toBe(false);
      expect(term.definition.length).toBeGreaterThan(40);
    }
  });
});

describe("kamuya açık tetkik", () => {
  it("yayın rotası LLM yolu değildir", () => {
    expect(ROUTE_AUTH_MAP["/api/tezgah/tetkik/publish"]).toBe("public");
    expect(isLlmMutationPath("/api/tezgah/tetkik/publish")).toBe(false);
    const sourceText = readFileSync(join(ROOT, "lib/tezgah/tetkik/public-report.ts"), "utf8");
    expect(sourceText).not.toContain("invokeLlm");
    expect(sourceText).toContain("scoreTetkik");
  });
});
