import { describe, expect, it } from "vitest";
import {
  applyAcademyCueDisplayPhonetics,
  applyAcademySpokenPhoneticsToDisplay,
} from "@/lib/academy/spoken-scripts/phonetics";
import { expandAcademyTtsSkipPreventer } from "@/lib/academy/spoken-scripts/skip-preventer";

describe("TTS model skip preventer", () => {
  it("paragraf başı kısa tuş emrini bağlaçlı akışa çevirir; cue terimini korur", () => {
    expect(expandAcademyTtsSkipPreventer("F2'ye bas")).toBe("Şimdi F2 tuşuna basıyorsun.");
    expect(expandAcademyTtsSkipPreventer("F2'ye bas. Hücre düzenlenir.")).toBe(
      "Şimdi F2 tuşuna basıyorsun. Hücre düzenlenir.",
    );
    expect(expandAcademyTtsSkipPreventer("Alt+F11'e bas")).toBe("Şimdi Alt+F11 tuşuna basıyorsun.");
    expect(expandAcademyTtsSkipPreventer("Şimdi F2 tuşuna basıyorsun.")).toBe("Şimdi F2 tuşuna basıyorsun.");
  });

  it("fonetik harita cue terimini seste okunuşa çevirir; skip-preventer sonra da çalışır", () => {
    const spoken = applyAcademyCueDisplayPhonetics(expandAcademyTtsSkipPreventer("F2'ye bas"));
    expect(spoken).toBe("Şimdi Ef iki tuşuna basıyorsun.");
    expect(spoken).not.toMatch(/\bF2\b/u);
    expect(applyAcademyCueDisplayPhonetics("F2 tuşuna basardın")).toContain("Ef iki");
    expect(applyAcademyCueDisplayPhonetics("+90")).toMatch(/artı doksan/iu);
    expect(applyAcademyCueDisplayPhonetics("Alt+F11")).toBe("Alt Ef on bir");
    expect(applyAcademyCueDisplayPhonetics("SEO")).toBe("Es i o");
    expect(applyAcademyCueDisplayPhonetics("Trendyol")).toBe("Trend yol");
    expect(applyAcademyCueDisplayPhonetics("Buybox")).toBe("Baybaks");
    expect(applyAcademyCueDisplayPhonetics("Bundle")).toBe("Bantıl");
    expect(applyAcademyCueDisplayPhonetics("ChatGPT")).toBe("Çetcipiti");
    expect(applyAcademyCueDisplayPhonetics("chatgpt.com")).toBe("çetcipiti nokta kom");
    expect(applyAcademyCueDisplayPhonetics("claude.ai")).toBe("klod nokta ey ay");
    expect(applyAcademyCueDisplayPhonetics("perplexity.ai")).toBe("perpleksiti nokta ey ay");
    expect(applyAcademyCueDisplayPhonetics("Few-Shot")).toBe("Fyu şat");
    expect(applyAcademyCueDisplayPhonetics("Chain-of-Thought")).toBe("Çeyn ov tot");
    expect(applyAcademyCueDisplayPhonetics("Pre-Mortem")).toBe("Pri mortem");
    expect(applyAcademyCueDisplayPhonetics("SWOT")).toBe("Svot");
    expect(applyAcademyCueDisplayPhonetics("Amazon")).toBe("Ama zon");
    expect(applyAcademyCueDisplayPhonetics("H1")).toBe("He bir");
    expect(applyAcademyCueDisplayPhonetics("Meta")).toBe("Me ta");
    expect(applyAcademyCueDisplayPhonetics("AIDA")).toBe("Ayda");
    expect(applyAcademyCueDisplayPhonetics("PAS")).toBe("Pas");
    expect(applyAcademyCueDisplayPhonetics("CTA")).toBe("Si ti a");
    expect(applyAcademyCueDisplayPhonetics("Midjourney")).toBe("Midcörni");
    expect(applyAcademyCueDisplayPhonetics("Flux")).toBe("Flaks");
    expect(applyAcademyCueDisplayPhonetics("Runway")).toBe("Ranvey");
    expect(applyAcademyCueDisplayPhonetics("Kling")).toBe("Kiling");
    expect(applyAcademyCueDisplayPhonetics("CapCut")).toBe("Kepkat");
    expect(applyAcademyCueDisplayPhonetics("ElevenLabs")).toBe("Ilevın Labs");
    expect(applyAcademyCueDisplayPhonetics("HeyGen")).toBe("Heycen");
    expect(applyAcademyCueDisplayPhonetics("Reels")).toBe("Rils");
  });

  it("Ayda takvim dilini AIDA'ya çevirmez; satış şablonunu çevirir", () => {
    expect(applyAcademySpokenPhoneticsToDisplay("Haftada on saat. Ayda kırk saat.")).toBe(
      "Haftada on saat. Ayda kırk saat.",
    );
    expect(applyAcademySpokenPhoneticsToDisplay("Ayda otuz dikey")).toBe("Ayda otuz dikey");
    expect(applyAcademySpokenPhoneticsToDisplay("Ayda ve Pas")).toBe("AIDA ve PAS");
    expect(applyAcademySpokenPhoneticsToDisplay("Bir: Ayda.")).toBe("Bir: AIDA.");
  });

  it("akış cümlesini ve selamlaşmayı dokunmadan bırakır", () => {
    expect(expandAcademyTtsSkipPreventer("Tekrar merhaba. Ben Gözde.")).toBe("Tekrar merhaba. Ben Gözde.");
    expect(expandAcademyTtsSkipPreventer("Klavyeni çek. Hangi araç açıksa o kalsın.")).toBe(
      "Klavyeni çek. Hangi araç açıksa o kalsın.",
    );
  });
});
