import { describe, expect, it } from "vitest";
import { DUKKAN_FILENAME } from "@/lib/tezgah/dukkan/copy";
import { generateDukkanPage } from "@/lib/tezgah/dukkan/engine";
import { inspectDukkanDelivery, renderDukkanHtml } from "@/lib/tezgah/dukkan/render";
import {
  dukkanGenerateRequestSchema,
  readDukkanDraft,
  type DukkanGenerateRequest,
} from "@/lib/tezgah/dukkan/schema";

const REQUEST: DukkanGenerateRequest = {
  businessName: `"><script>alert(1)</script>`,
  sector: "klinik",
  place: "javascript:alert(1)",
  whatsapp: "0 (532) 111-22-33",
  services: ['" onmouseover="alert(1)', "<img src=x onerror=alert(1)>", "javascript:alert(1)"].join("\n"),
  tone: "gece",
  packages: `<script>x</script> | onerror=alert(1) | 10 TL`,
  hours: `"><img src=x onerror=alert(1)>`,
  faq: `Soru <script> | Cevap onerror=alert(1)`,
};

describe("dijital dükkan kaçışı", () => {
  it("enjekte edilmiş girdi kaçışlanır; sahte 100 skoru yoktur", () => {
    const parsed = dukkanGenerateRequestSchema.parse(REQUEST);
    const built = readDukkanDraft(parsed);
    expect(built?.whatsapp).toBe("905321112233");
    if (!built) {
      return;
    }
    const html = renderDukkanHtml(built);
    const inspected = inspectDukkanDelivery(html);
    expect(inspected.ok).toBe(true);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/javascript\s*:/i);
    expect(html).not.toMatch(/<[^>]*\son[a-z0-9]+\s*=/i);
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("javascript&#58;");
    expect(html).toContain("onerror&#61;");
    expect(html).toContain("https://wa.me/905321112233");
    expect(html).not.toMatch(/<img\b/i);
    expect(html).not.toMatch(/100\s*\/\s*100/);
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
    expect(result.seals.every((seal) => seal.passed)).toBe(true);
    expect(result.filename).toBe(DUKKAN_FILENAME);
    expect(result.html).not.toMatch(/<script/i);
    expect(result.html).not.toMatch(/javascript\s*:/i);
    expect(result.remaining).toBe(1);
  });
});
