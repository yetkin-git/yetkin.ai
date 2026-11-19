import { describe, expect, it } from "vitest";
import { DUKKAN_FILENAME } from "@/lib/tezgah/dukkan/copy";
import { generateDukkanPage } from "@/lib/tezgah/dukkan/engine";
import { renderDukkanHtml } from "@/lib/tezgah/dukkan/render";
import {
  dukkanGenerateRequestSchema,
  readDukkanDraft,
  type DukkanGenerateRequest,
} from "@/lib/tezgah/dukkan/schema";
import { scoreHomepageHtml } from "@/lib/tezgah/tetkik/score";

const REQUEST: DukkanGenerateRequest = {
  businessName: `"><script>alert(1)</script>`,
  sector: "klinik",
  place: "javascript:alert(1)",
  whatsapp: "0 (532) 111-22-33",
  services: ['" onmouseover="alert(1)', "<img src=x onerror=alert(1)>", "javascript:alert(1)"].join("\n"),
  tone: "gece",
};

describe("dijital dükkan kaçışı", () => {
  it("enjekte edilmiş girdi kaçışlanır ve skor 100 kalır", () => {
    const parsed = dukkanGenerateRequestSchema.parse(REQUEST);
    const built = readDukkanDraft(parsed);
    expect(built?.whatsapp).toBe("905321112233");
    if (!built) {
      return;
    }
    const html = renderDukkanHtml(built);
    const scored = scoreHomepageHtml(html, {
      https: true,
      ttfbMs: 1,
      htmlBytes: new TextEncoder().encode(html).length,
    });
    expect(scored.score).toBe(100);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/javascript\s*:/i);
    expect(html).not.toMatch(/<[^>]*\son[a-z0-9]+\s*=/i);
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("javascript&#58;");
    expect(html).toContain("onerror&#61;");
    expect(html).toContain("https://wa.me/905321112233");
    expect(html).not.toMatch(/<img\b/i);
  });

  it("motor aynı sayfayı teslim eder", async () => {
    const result = await generateDukkanPage(
      { actorId: "guest:dukkan-xss", guest: true, request: REQUEST },
      { now: () => new Date("2026-11-14T12:00:00+03:00") },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.score).toBe(100);
    expect(result.filename).toBe(DUKKAN_FILENAME);
    expect(result.html).not.toMatch(/<script/i);
    expect(result.html).not.toMatch(/javascript\s*:/i);
    expect(result.remaining).toBe(1);
  });
});
