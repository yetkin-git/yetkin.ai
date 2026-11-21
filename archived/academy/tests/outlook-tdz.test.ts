/**
 * ACİL-01: exit-kit → outlook → excel → cinema döngüsü TDZ üretmesin.
 * Bu dosya cinema-cue-catalog'u doğrudan import etmez; zincir exit-kit'ten iner.
 */
import { describe, expect, it } from "vitest";
import { officeAiExitPromptCards } from "@/lib/academy/exit-kit";
import { ACADEMY_OUTLOOK_COPILOT_PROMPT } from "@/lib/academy/outlook-workspace";

describe("Outlook Copilot istemi — TDZ / dairesel import", () => {
  it("exit-kit zinciri ACADEMY_OUTLOOK_COPILOT_PROMPT initialize olmadan okumaz", () => {
    expect(ACADEMY_OUTLOOK_COPILOT_PROMPT.length).toBeGreaterThan(20);
    expect(officeAiExitPromptCards().length).toBe(8);
  });

  it("cinema katalog Outlook istemini TDZ'siz basar", async () => {
    const { loadAcademyCinemaCueSlides } = await import("@/lib/academy/cinema-cue-catalog");
    const slides = loadAcademyCinemaCueSlides("01_office_ai-4");
    expect(slides.find((slide) => slide.cueIndex === 4)?.copilot?.prompt).toBe(ACADEMY_OUTLOOK_COPILOT_PROMPT);
  });
});
