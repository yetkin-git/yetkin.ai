import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("akademi markdown — açık makale kontrastı", () => {
  it("varsayılan tone document slat-800 gövde kullanır; Saha Görevi kartı vardır", () => {
    const src = readFileSync(join(ROOT, "components/academy/academy-markdown-renderer.tsx"), "utf8");
    expect(src).toContain('tone = "document"');
    expect(src).toContain("text-slate-800");
    expect(src).toContain("text-slate-900");
    expect(src).toContain("stripAcademyColdTemplateHeadings");
    expect(src).toContain("isAcademyColdTemplateHeading");
    expect(src).toContain("data-academy-field-task");
    expect(src).toContain("Saha Görevi");
    expect(src).toContain('data-academy-md-tone={tone}');
  });
});
