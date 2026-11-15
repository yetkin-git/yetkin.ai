import { describe, expect, it } from "vitest";
import { TETKIK_CHECK_ORDER, TETKIK_LABELS, TETKIK_OPPORTUNITY, TETKIK_WEIGHTS } from "@/lib/tezgah/tetkik/rubric";
import { buildTetkikRevisionPack } from "@/lib/tezgah/tetkik/revision";
import type { TetkikCheckId } from "@/lib/tezgah/tetkik/rubric";
import type { TetkikReport } from "@/lib/tezgah/tetkik/types";

function report(name: string, passed: ReadonlySet<TetkikCheckId> = new Set()): TetkikReport {
  return {
    tool: "tetkik",
    score: 0,
    maxScore: 100,
    disclaimer: "Ölçüm ana sayfanın ilk HTML’idir; sonradan çizilen vitrin bu skora girmez.",
    measuredAt: "2026-11-15T12:00:00.000Z",
    url: "https://ornek.test",
    businessName: name,
    freelancerName: "Ayşe Yılmaz",
    agencyName: null,
    pageTitle: "Eski başlık",
    ttfbMs: 120,
    htmlBytes: 4000,
    checks: TETKIK_CHECK_ORDER.map((id) => ({
      id,
      label: TETKIK_LABELS[id],
      earned: passed.has(id) ? TETKIK_WEIGHTS[id] : 0,
      weight: TETKIK_WEIGHTS[id],
      passed: passed.has(id),
      detail: "",
      opportunity: passed.has(id) ? "" : TETKIK_OPPORTUNITY[id],
    })),
    opportunities: [],
    action: { stage: "shop", title: "3. Aşama — Yeni Dijital Dükkan", body: "İskelet eksik." },
    narrative: "",
  };
}

describe("tetkik revizyon paketi", () => {
  it("eksik sitede başlık ve açıklama skor penceresine sığar", () => {
    const pack = buildTetkikRevisionPack(report("Karaoğlu Fırın"));
    const title = pack.fields.find((field) => field.id === "metaTitle");
    const description = pack.fields.find((field) => field.id === "metaDescription");
    const heading = pack.fields.find((field) => field.id === "h1");
    const cta = pack.fields.find((field) => field.id === "cta");
    expect(title?.text.length).toBeGreaterThanOrEqual(10);
    expect(title?.text.length).toBeLessThanOrEqual(60);
    expect(description?.text.length).toBeGreaterThanOrEqual(50);
    expect(description?.text.length).toBeLessThanOrEqual(160);
    expect(heading?.text).toBe("Karaoğlu Fırın — sipariş ve randevu");
    expect(heading?.text).not.toContain("\n");
    expect(cta?.text).toContain("https://wa.me/90XXXXXXXXXX");
    expect(cta?.text).toContain("Randevu bırakın");
    expect(pack.fields.every((field) => field.gap)).toBe(true);
    expect(pack.leftovers).toEqual([
      "Mobil çerçeve",
      "Türkçe dil işareti",
      "HTTPS",
      "Görsel alt metni",
      "İlk bayt",
      "Sayfa boyu",
    ]);
    expect(pack.markdown).toContain("## Yenilenmiş Ana Başlık (H1)");
    expect(pack.markdown).not.toMatch(/fiyat|tutar|₺/);
  });

  it("uzun ve kısa ad pencereden çıkmaz; geçen madde yenileme olarak kalır", () => {
    const longName = "Ç".repeat(80);
    const longPack = buildTetkikRevisionPack(report(longName));
    const shortPack = buildTetkikRevisionPack(report("Ab"));
    for (const pack of [longPack, shortPack]) {
      const title = pack.fields.find((field) => field.id === "metaTitle")?.text ?? "";
      const description = pack.fields.find((field) => field.id === "metaDescription")?.text ?? "";
      expect(title.length).toBeGreaterThanOrEqual(10);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(description.length).toBeGreaterThanOrEqual(50);
      expect(description.length).toBeLessThanOrEqual(160);
    }
    const ready = buildTetkikRevisionPack(report("Karaoğlu Fırın", new Set(TETKIK_CHECK_ORDER)));
    expect(ready.fields.every((field) => field.gap)).toBe(false);
    expect(ready.leftovers).toEqual([]);
    expect(ready.fields.find((field) => field.id === "metaTitle")?.gap).toBe(false);
  });

  it("işletme adındaki işaret, kopyalanan çağrı bloğunda kaçışlanır", () => {
    const pack = buildTetkikRevisionPack(report('A&B <script> "fırın"'));
    const cta = pack.fields.find((field) => field.id === "cta")?.text ?? "";
    expect(cta).toContain("A&amp;B &lt;script&gt; &quot;fırın&quot;");
    expect(cta).not.toContain("<script>");
    expect(pack.fields.find((field) => field.id === "h1")?.text.startsWith("A&B")).toBe(true);
  });
});
