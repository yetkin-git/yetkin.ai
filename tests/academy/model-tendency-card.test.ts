import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  ACADEMY_MODEL_TENDENCIES,
  ACADEMY_MODEL_TENDENCY_CARD_REVIEWED_AT_ISO,
  ACADEMY_MODEL_TENDENCY_CARD_REVIEWED_LABEL_TR,
  ACADEMY_MODEL_TENDENCY_FRESHNESS_SEAL,
  ACADEMY_MODEL_TENDENCY_REVIEW_MONTHS,
  isAcademyModelTendencyCardStale,
  renderAcademyModelTendencyCardMarkdown,
} from "@/lib/academy/model-tendency-card";

const KEY = "01_office_ai-1";

describe("model eğilim kartı — canlı kutu (Tespit H1 tedavisi)", () => {
  it("tazelik damgası ve gözden geçirme takvimi kilitlenir", () => {
    expect(ACADEMY_MODEL_TENDENCY_REVIEW_MONTHS).toBe(6);
    expect(ACADEMY_MODEL_TENDENCY_CARD_REVIEWED_AT_ISO).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    expect(ACADEMY_MODEL_TENDENCY_CARD_REVIEWED_LABEL_TR).toMatch(/2026/u);
    expect(ACADEMY_MODEL_TENDENCY_FRESHNESS_SEAL).toBe(
      `Tazelik Garantisi: ${ACADEMY_MODEL_TENDENCY_CARD_REVIEWED_LABEL_TR}`,
    );
    expect(ACADEMY_MODEL_TENDENCY_FRESHNESS_SEAL).toMatch(/^Tazelik Garantisi: .+ 2026$/u);
  });

  it("dört eğilim satırı eğilim dilinde durur; sabit karakter iddiası yok", () => {
    expect(ACADEMY_MODEL_TENDENCIES.map((row) => row.model)).toEqual([
      "ChatGPT",
      "Claude",
      "Gemini",
      "Özel API (şirketinin kurumsal modeli)",
    ]);
    for (const row of ACADEMY_MODEL_TENDENCIES) {
      expect(row.tendency).toMatch(/yatkındır/u);
    }
    const rendered = renderAcademyModelTendencyCardMarkdown();
    expect(rendered).toContain(ACADEMY_MODEL_TENDENCY_FRESHNESS_SEAL);
    expect(rendered).toContain("canlı kutu");
    expect(rendered).toContain("Eylül 2026 anlık görüntüsüdür");
    expect(rendered).toContain("sürümde değişir");
    expect(rendered).not.toMatch(/\.xlsx|\.docx|\.pptx/iu);
  });

  it("Ders 1 makalesi canlı kutuyu basar; kaset cümlesi durur (re-bake yok)", () => {
    const body = curriculumForCourseSlug("01_office_ai").find((row) => row.key === KEY)?.body ?? "";
    expect(body).toContain(ACADEMY_MODEL_TENDENCY_FRESHNESS_SEAL);
    expect(body).toContain("Model eğilim kartı (canlı kutu)");
    expect(body).toMatch(/şirketinin kurumsal yapay zekâ modeli/u);
  });

  it("6 ayı aşan kart bayraklanır; taze kart geçmez", () => {
    expect(isAcademyModelTendencyCardStale("2026-09-20")).toBe(false);
    expect(isAcademyModelTendencyCardStale("2027-02-19")).toBe(false);
    expect(isAcademyModelTendencyCardStale("2027-03-20")).toBe(true);
    expect(isAcademyModelTendencyCardStale("2027-09-20")).toBe(true);
    expect(isAcademyModelTendencyCardStale("geçersiz")).toBe(true);
  });
});
