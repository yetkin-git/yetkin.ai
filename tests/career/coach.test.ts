import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildFallbackDossier,
  careerCoachRequestSchema,
  dossierFromModelText,
  fallbackCareerDialogue,
  scrubCareerCoachText,
} from "@/lib/career/coach-contract";
import { runCareerCoach } from "@/lib/career/coach";
import { isLlmMutationPath } from "@/lib/kernel/security/http-rate-limit";
import type { LlmGatewayResult } from "@/lib/kernel/ai/types";

const ROOT = process.cwd();

const profile = {
  targetRole: "Freelancer dijital danışman",
  experience: "Ürün kartı yazdım. Sosyal medya takvimi kurdum.",
  goal: "freelancer" as const,
};

function llmResult(text: string): LlmGatewayResult {
  return {
    text,
    model: "test-model",
    provider: "gemini",
    usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
  };
}

describe("kariyer koçu", () => {
  it("rozet yokken doğrulanmış belge uydurmaz ve gelir vaadi vermez", () => {
    const dossier = buildFallbackDossier({ ...profile, verifiedBadges: [] });
    const blob = JSON.stringify(dossier);
    expect(dossier.offers).toHaveLength(3);
    expect(dossier.cv).toContain("Doğrulanmış rozet yok");
    expect(dossier.cv).toContain("garanti etmez");
    expect(dossier.disclaimer).toContain("garanti etmez");
    expect(blob).not.toMatch(/işe yerleşeceksin|kazanırsın|gelir elde edersin/i);
    expect(dossier.offers.every((offer) => offer.tezgahHref?.startsWith("/tezgah?tool="))).toBe(true);
    expect(dossier.offers[0]?.tezgahHref).toBe("/tezgah?tool=proposal");
  });

  it("kazanılmış rozeti yazar; e-ticaret hedefini tezgâh aracıyla eşler", () => {
    const dossier = buildFallbackDossier({
      targetRole: "E-Ticaret Uzmanı",
      experience: "Pazaryeri ürün metni yazdım.",
      goal: "freelancer",
      verifiedBadges: ["Ofiste Yapay Zekâ"],
    });
    expect(dossier.cv).toContain("Ofiste Yapay Zekâ");
    expect(dossier.cv).not.toContain("Hayali Kurs");
    expect(dossier.offers[0]?.tezgahHref).toBe("/tezgah?tool=ecommerce");
    expect(dossier.swot.strengths.join(" ")).toContain("Ofiste Yapay Zekâ");
  });

  it("model vaadini ve kazanılmamış rozeti düşürür; tezgâh kimliğini katalogla sınırlar", () => {
    expect(scrubCareerCoachText("Bu adım gelir garantisi vermez.", [])).toContain("gelir garantisi vermez");
    expect(scrubCareerCoachText("Gemini dedi ki işe yerleşeceksin.", [])).not.toMatch(/gemini/i);
    expect(scrubCareerCoachText("Gemini dedi ki işe yerleşeceksin.", [])).not.toContain("yerleşeceksin");

    const dossier = dossierFromModelText(
      JSON.stringify({
        cv: "Gemini ile işe yerleşeceksin.\nDoğrulanmış rozet: Hayali Kurs.",
        swot: {
          strengths: ["Hedef net"],
          weaknesses: ["Kanıt az"],
          opportunities: ["Teklif yaz"],
          threats: ["Abartı güveni düşürür"],
        },
        offers: [
          { title: "Teklif", why: "İhtiyaç net.", incomeStep: "Taslak yaz.", tezgahToolId: "proposal" },
          { title: "Uydurma", why: "Dış bağ.", incomeStep: "Bekle.", tezgahToolId: "bilinmeyen" },
          { title: "Reklam", why: "Görünürlük.", incomeStep: "Üç kanca yaz.", tezgahToolId: "reklam" },
        ],
        roadmap: ["Dersi bitir", "Teslim üret", "Görüş"],
      }),
      { ...profile, verifiedBadges: ["Ofiste Yapay Zekâ"] },
    );
    expect(dossier?.source).toBe("llm");
    expect(dossier?.cv).not.toMatch(/gemini/i);
    expect(dossier?.cv).not.toContain("yerleşeceksin");
    expect(dossier?.cv).not.toContain("Hayali Kurs");
    expect(dossier?.cv).toContain("garanti etmez");
    expect(dossier?.offers[0]?.tezgahHref).toBe("/tezgah?tool=proposal");
    expect(dossier?.offers[1]?.tezgahHref).toBeNull();
    expect(dossier?.offers[2]?.tezgahHref).toBe("/tezgah?tool=reklam");
  });

  it("diyalog ilan, gelişim ve teklif sorularına garanti vermeden cevaplar", () => {
    const dossier = buildFallbackDossier({ ...profile, verifiedBadges: [] });
    expect(fallbackCareerDialogue("CV'mi şu ilana göre uyarla", dossier, []).toLocaleLowerCase("tr-TR")).toContain(
      "ilan",
    );
    expect(fallbackCareerDialogue("Zayıf yönlerimi nasıl kapatırım?", dossier, [])).toContain("garanti etmez");
    expect(fallbackCareerDialogue("İlk freelancer teklifimi nasıl yazarım?", dossier, [])).toContain("teklif");
  });

  it("istem gövdesi rozet alanı kabul etmez", () => {
    expect(
      careerCoachRequestSchema.safeParse({
        mode: "profile",
        targetRole: "Yazılım geliştirici",
        experience: "Arayüz kurdum.",
        goal: "full_time",
        verifiedBadges: ["Sahte"],
      }).success,
    ).toBe(false);
  });

  it("anahtar yokken modeli çağırmaz; anahtar varken JSON dosyasını döner", async () => {
    let calls = 0;
    const skipped = await runCareerCoach(
      {
        userId: "user_1",
        request: { mode: "profile", ...profile },
        verifiedBadges: [],
      },
      {
        modelConfigured: false,
        invoke: async () => {
          calls += 1;
          return null;
        },
      },
    );
    expect(calls).toBe(0);
    expect(skipped.mode).toBe("profile");
    if (skipped.mode === "profile") {
      expect(skipped.source).toBe("fallback");
      expect(skipped.note).toContain("anahtarı tanımlı değil");
      expect(skipped.verifiedBadgeCount).toBe(0);
    }

    const answered = await runCareerCoach(
      {
        userId: "user_1",
        request: {
          mode: "dialogue",
          ...profile,
          message: "Zayıf yönlerimi nasıl kapatırım?",
          dossier: buildFallbackDossier({ ...profile, verifiedBadges: ["Ofiste Yapay Zekâ"] }),
        },
        verifiedBadges: ["Ofiste Yapay Zekâ"],
      },
      {
        modelConfigured: true,
        invoke: async () => llmResult("Akademi dersini bitir. Gemini işe yerleşeceksin."),
      },
    );
    expect(answered.mode).toBe("dialogue");
    if (answered.mode === "dialogue") {
      expect(answered.source).toBe("llm");
      expect(answered.reply).not.toMatch(/gemini/i);
      expect(answered.reply).not.toContain("yerleşeceksin");
      expect(answered.reply).toContain("garanti etmez");
      expect(answered.reply).not.toContain("Sahte Rozet");
    }
  });

  it("rota üye yetkisi taşır ve kenar hız tavanına girer", () => {
    const route = readFileSync(join(ROOT, "app/api/career/coach/route.ts"), "utf8");
    expect(route).toContain('export const auth = "session"');
    expect(route).toContain("loadCareerBoard");
    expect(isLlmMutationPath("/api/career/coach")).toBe(true);
  });
});
