import { describe, expect, it } from "vitest";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import {
  ACADEMY_LISTEN_FALLBACK_KIND_LOCAL,
  ACADEMY_LISTEN_MIN_MS_PER_WORD,
  isAcademyListenFallbackHeader,
  isAcademyListenQuotaReason,
  isAcademyListenStudioAudio,
} from "@/archived/lib/academy-studio/lesson-listen";

describe("dersi dinle stüdyo kilidi ve Okuma Modu", () => {
  it("kota başlığı local-voice değerini taşır; stüdyo WAV değildir", () => {
    expect(ACADEMY_LISTEN_FALLBACK_KIND_LOCAL).toBe("local-voice");
    expect(isAcademyListenFallbackHeader("local-voice")).toBe(true);
    expect(isAcademyListenFallbackHeader("silent")).toBe(true);
    expect(isAcademyListenFallbackHeader(null)).toBe(false);
    expect(isAcademyListenFallbackHeader("")).toBe(false);
  });

  it("Gemini / mühürlü model stüdyo sesidir; fallback tamponu değildir", () => {
    expect(
      isAcademyListenStudioAudio({
        model: "gemini-3.1-flash-tts-preview",
        usedFallback: false,
      }),
    ).toBe(true);
    expect(
      isAcademyListenStudioAudio({
        model: "fallback-local",
        usedFallback: false,
      }),
    ).toBe(false);
    expect(
      isAcademyListenStudioAudio({
        model: "gemini-3.1-flash-tts-preview",
        usedFallback: true,
      }),
    ).toBe(false);
  });

  it("kota düşüşü dürüst Okuma Modu cümlesini basar; AbortError hoparlörü Web Speech'tir", () => {
    expect(ACADEMY_SEN.listen.readingMode).toBe("Pürüzsüz Okuma Modu");
    expect(ACADEMY_SEN.listen.failQuota).toBe(ACADEMY_SEN.listen.readingMode);
    expect(ACADEMY_SEN.listen.studioPreparing).toBe(ACADEMY_SEN.listen.readingMode);
    expect(ACADEMY_LISTEN_MIN_MS_PER_WORD).toBe(420);
    expect(isAcademyListenQuotaReason("gemini-quota")).toBe(true);
  });
});
