import { describe, expect, it } from "vitest";

import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  getPreviewIdeaValidatorFallback,
  validatePreviewIdea,
} from "@/lib/yetkinhibe/preview-idea-validator";
import type { GrantCallWithMeta } from "@/lib/yetkinhibe/types";

import { makeGrantCall, OPEN_CRITERIA } from "./fixtures";

const TUBITAK_ID = "tubitak-1501-sanayi-arge";
const KOSGEB_ARGE_ID = "kosgeb-arge-inovasyon-2026";
const KOBIGEL_ID = "kosgeb-kobigel-2026";

/** İhracat şartı olan çağrılar; önizleme profilinde ihracat olmadığı için 80 tabanından başlar. */
const EXPORT_REQUIRED = { ...OPEN_CRITERIA, requiresExportActivity: true };

function tubitakCall(overrides: Partial<GrantCallWithMeta> = {}): GrantCallWithMeta {
  return makeGrantCall({
    id: TUBITAK_ID,
    source: "TUBITAK",
    sourceLabel: "TÜBİTAK",
    title: "TÜBİTAK 1501",
    eligibility: EXPORT_REQUIRED,
    maxSupportMinor: toAmountMinor(150_000_000),
    ...overrides,
  });
}

function kosgebArgeCall(): GrantCallWithMeta {
  return makeGrantCall({
    id: KOSGEB_ARGE_ID,
    source: "KOSGEB",
    sourceLabel: "KOSGEB",
    title: "KOSGEB Ar-Ge ve İnovasyon",
    eligibility: EXPORT_REQUIRED,
    maxSupportMinor: toAmountMinor(100_000_000),
  });
}

describe("validatePreviewIdea — fikir önizlemesi", () => {
  it("kısa veya boş fikir metni için null döner", () => {
    expect(validatePreviewIdea("kısa", [tubitakCall()])).toBeNull();
    expect(validatePreviewIdea("   ", [tubitakCall()])).toBeNull();
  });

  it("aktif çağrı yoksa null döner", () => {
    const upcoming = tubitakCall({ status: "UPCOMING" });
    expect(
      validatePreviewIdea("Yapay zeka ile otomasyon prototipi geliştiriyoruz", [upcoming]),
    ).toBeNull();
  });

  it("anahtar kelime eşleşmesi en uygun programı seçer ve tahmini desteği yazar", () => {
    const result = validatePreviewIdea(
      "Yapay zeka ve otomasyon ile yeni bir prototip algoritması geliştiriyoruz",
      [kosgebArgeCall(), tubitakCall()],
    );

    // İhracat kısıtı geçilmez (taban 0). Dört anahtar kelime 24, uzunluk 4. Tutar katalog tavanıdır.
    expect(result).toEqual({
      grantId: TUBITAK_ID,
      programLabel: "TÜBİTAK 1501",
      matchScorePct: 28,
      estimatedSupportLabel: "Program üst limiti: ₺1.500.000",
    });
  });

  it("iki program puan farkı 8 veya daha az olduğunda etiketler birleşir", () => {
    const result = validatePreviewIdea("Bugün güzel bir plan üzerine konuşuyoruz", [
      tubitakCall(),
      kosgebArgeCall(),
    ]);

    expect(result?.programLabel).toBe("TÜBİTAK 1501 / KOSGEB Ar-Ge ve İnovasyon");
  });

  it("Türkçe büyük harf ve noktalı İ metinde anahtar kelimeleri yakalar", () => {
    const kobigel = makeGrantCall({
      id: KOBIGEL_ID,
      source: "KOSGEB",
      sourceLabel: "KOSGEB",
      eligibility: EXPORT_REQUIRED,
    });

    // İhracat kısıtı 0. Üç anahtar kelime 18, kısa metin uzunluk payı 2.
    expect(validatePreviewIdea("DİJİTAL DÖNÜŞÜM VE KOBİ", [kobigel])?.matchScorePct).toBe(20);
    expect(validatePreviewIdea("genel bir plan metni hazirlandi", [kobigel])?.matchScorePct).toBe(2);
  });
});

describe("getPreviewIdeaValidatorFallback — vitrin yedeği", () => {
  it("iki program aktifse birleşik etiket ve yarım destek tahmini döner", () => {
    const result = getPreviewIdeaValidatorFallback([tubitakCall(), kosgebArgeCall()]);

    expect(result).toEqual({
      grantId: TUBITAK_ID,
      programLabel: "TÜBİTAK 1501 / KOSGEB Ar-Ge ve İnovasyon",
      matchScorePct: 0,
      estimatedSupportLabel: "Program üst limiti: ₺1.500.000",
    });
  });

  it("yalnız KOSGEB aktifse etiketi tekrarlamaz", () => {
    const result = getPreviewIdeaValidatorFallback([kosgebArgeCall()]);

    expect(result?.programLabel).toBe("KOSGEB Ar-Ge ve İnovasyon");
    expect(result?.grantId).toBe(KOSGEB_ARGE_ID);
  });

  it("aktif çağrı yoksa null döner; tutar uydurmaz", () => {
    expect(getPreviewIdeaValidatorFallback([])).toBeNull();
    expect(getPreviewIdeaValidatorFallback([tubitakCall({ status: "CLOSED" })])).toBeNull();
  });
});
