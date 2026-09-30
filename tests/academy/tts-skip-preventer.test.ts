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
    expect(applyAcademyCueDisplayPhonetics("KVKK")).toBe("Kavekaka");
    expect(applyAcademyCueDisplayPhonetics("T.C. Kimlik No")).toBe("TC kimlik numarası");
    expect(applyAcademyCueDisplayPhonetics("MASKELİ_IBAN")).toBe("MASKELİ İban");
    expect(applyAcademyCueDisplayPhonetics("açık IBAN")).toBe("açık İban");
    expect(applyAcademyCueDisplayPhonetics("IBAN'ı")).toBe("İban'ı");
    expect(applyAcademyCueDisplayPhonetics("IBAN, KVKK")).toBe("İban, Kavekaka");
    expect(applyAcademySpokenPhoneticsToDisplay("açık İban")).toBe("açık IBAN");
    expect(applyAcademySpokenPhoneticsToDisplay("MASKELİ İban")).toBe("MASKELİ_IBAN");
    expect(applyAcademySpokenPhoneticsToDisplay("İban'ı")).toBe("IBAN'ı");
    expect(applyAcademyCueDisplayPhonetics("MASKELİ_TELEFON")).toBe("MASKELİ TELEFON");
    expect(applyAcademyCueDisplayPhonetics("MASKELİ_MAAŞ")).toBe("MASKELİ MAAŞ");
    expect(applyAcademySpokenPhoneticsToDisplay("Kavekaka kuralını")).toBe("KVKK kuralını");
    expect(applyAcademyCueDisplayPhonetics("F2 tuşuna basardın")).toContain("Ef iki");
    expect(applyAcademyCueDisplayPhonetics("+90")).toMatch(/artı doksan/iu);
    expect(applyAcademyCueDisplayPhonetics("Alt+F11")).toBe("Alt Ef on bir");
    expect(applyAcademyCueDisplayPhonetics("SEO")).toBe("Seo");
    expect(applyAcademyCueDisplayPhonetics("SEO'dur")).toBe("Seo'dur");
    expect(applyAcademyCueDisplayPhonetics("Es i o")).toBe("Seo");
    expect(applyAcademyCueDisplayPhonetics("ÇiçekSepeti")).toBe("Çiçek sepeti");
    expect(applyAcademyCueDisplayPhonetics("PttAVM")).toBe("Piti avm");
    expect(applyAcademyCueDisplayPhonetics("Listing'e")).toBe("Listin'e");
    expect(applyAcademyCueDisplayPhonetics("Prompt")).toBe("Promt");
    expect(applyAcademySpokenPhoneticsToDisplay("Çiçek sepeti")).toBe("ÇiçekSepeti");
    expect(applyAcademySpokenPhoneticsToDisplay("Piti avm")).toBe("PttAVM");
    expect(applyAcademySpokenPhoneticsToDisplay("Listin")).toBe("Listing");
    expect(applyAcademySpokenPhoneticsToDisplay("Promt")).toBe("Prompt");
    expect(applyAcademySpokenPhoneticsToDisplay("Seo")).toBe("SEO");
    expect(applyAcademySpokenPhoneticsToDisplay("Es i o'dur")).toBe("SEO'dur");
    expect(applyAcademyCueDisplayPhonetics("elliye yetmiş santimetre, iki adet")).toBe(
      "elliye yetmiş santimetre, iki adet",
    );
    expect(applyAcademySpokenPhoneticsToDisplay("elliye yetmiş santimetre, iki adet")).toBe("50x70 cm, 2 adet");
    expect(applyAcademyCueDisplayPhonetics("50x70 cm, 2 adet")).toBe("elliye yetmiş santimetre, iki adet");
    expect(
      applyAcademySpokenPhoneticsToDisplay(
        "Pamuklu mutfak havlusu, ekru, elliye yetmiş santimetre, iki adet.",
      ),
    ).toBe("Pamuklu mutfak havlusu, ekru, 50x70 cm, 2 adet.");
    expect(applyAcademySpokenPhoneticsToDisplay("Ölçü elliye yetmiş santimetredir.")).toBe("Ölçü 50x70 cm.");
    expect(applyAcademySpokenPhoneticsToDisplay("kırk sekiz santimetredir")).toBe("48 cm");
    expect(applyAcademySpokenPhoneticsToDisplay("üç yüz mililitredir")).toBe("300 ml");
    expect(applyAcademySpokenPhoneticsToDisplay("yüz yirmi mililitre")).toBe("120 ml");
    expect(applyAcademySpokenPhoneticsToDisplay("iki adettir")).toBe("2 adettir");
    expect(applyAcademySpokenPhoneticsToDisplay("yüzde yüz pamuk")).toBe("%100 pamuk");
    expect(applyAcademySpokenPhoneticsToDisplay("yüz yirmi liranın yüzde on beşi, on sekiz liradır.")).toBe(
      "120 liranın %15'i, 18 liradır.",
    );
    expect(
      applyAcademySpokenPhoneticsToDisplay(
        "göğüs genişliği küçük kırk sekiz, orta elli iki, büyük elli altı santimetredir",
      ),
    ).toBe("göğüs genişliği küçük 48 cm, orta 52 cm, büyük 56 cm");
    expect(applyAcademySpokenPhoneticsToDisplay("Elliye yetmiş havlu")).toBe("50x70 havlu");
    expect(applyAcademySpokenPhoneticsToDisplay("iki havlu")).toBe("iki havlu");
    expect(applyAcademySpokenPhoneticsToDisplay("Bu yüzden santimetre yazılmaz")).toBe(
      "Bu yüzden santimetre yazılmaz",
    );
    expect(applyAcademyCueDisplayPhonetics("30 dakikalık")).toBe("30 dakikalık");
    expect(applyAcademyCueDisplayPhonetics("%100 aynı")).toBe("%100 aynı");
    expect(applyAcademyCueDisplayPhonetics("N11")).toBe("En on bir");
    expect(applyAcademySpokenPhoneticsToDisplay("En on bir")).toBe("N11");
    expect(applyAcademyCueDisplayPhonetics("Trendyol")).toBe("Trend yol");
    expect(applyAcademyCueDisplayPhonetics("Buybox")).toBe("Baybaks");
    expect(applyAcademyCueDisplayPhonetics("Bundle")).toBe("Bantıl");
    expect(applyAcademyCueDisplayPhonetics("ChatGPT")).toBe("Çetcipiti");
    expect(applyAcademyCueDisplayPhonetics("Muse Spark")).toBe("Myuz Spark");
    expect(applyAcademyCueDisplayPhonetics("Grok, Kimi, Muse Spark vb.")).toContain("Myuz Spark");
    expect(applyAcademySpokenPhoneticsToDisplay("Myuz Spark")).toBe("Muse Spark");
    expect(applyAcademySpokenPhoneticsToDisplay("Grok, Kimi, Myuz Spark vb.")).toBe(
      "Grok, Kimi, Muse Spark vb.",
    );
    expect(applyAcademyCueDisplayPhonetics("özel API")).toBe("ö zel API");
    expect(applyAcademyCueDisplayPhonetics("şirketinin özel API'sine")).toBe(
      "şirketinin ö zel API'sine",
    );
    expect(applyAcademySpokenPhoneticsToDisplay("ö zel API ise evdeki kuralları unutmaz")).toBe(
      "özel API ise evdeki kuralları unutmaz",
    );
    expect(applyAcademyCueDisplayPhonetics("gemini.google.com")).toBe("cemini nokta gugıl nokta kom");
    expect(applyAcademySpokenPhoneticsToDisplay("cemini nokta gugıl nokta kom")).toBe("gemini.google.com");
    expect(applyAcademyCueDisplayPhonetics("chatgpt.com")).toBe("çetcipiti nokta kom");
    expect(applyAcademyCueDisplayPhonetics("claude.ai")).toBe("klod nokta ey ay");
    expect(applyAcademyCueDisplayPhonetics("perplexity.ai")).toBe("perpleksiti nokta ey ay");
    expect(applyAcademyCueDisplayPhonetics("Few-Shot")).toBe("Fyu şat");
    expect(applyAcademyCueDisplayPhonetics("Chain-of-Thought")).toBe("Çeyn ov tot");
    expect(applyAcademyCueDisplayPhonetics("Pre-Mortem")).toBe("Pri mortem");
    expect(applyAcademyCueDisplayPhonetics("SWOT")).toBe("Svot");
    expect(applyAcademyCueDisplayPhonetics("Amazon")).toBe("Ama zon");
    expect(applyAcademyCueDisplayPhonetics("A1 hücresi")).toBe("A bir hücresi");
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
    expect(applyAcademyCueDisplayPhonetics("Ctrl+C")).toBe("Kontrol C");
    expect(applyAcademyCueDisplayPhonetics("Word veya Gemini sohbetine .docx yüklersin")).toContain("Vörd belgesi");
    expect(applyAcademyCueDisplayPhonetics("Word veya Gemini sohbetine .docx yüklersin")).not.toMatch(/\.docx|\bdocx\b/u);
    expect(applyAcademyCueDisplayPhonetics("Sozlesme_Kaya_Gida.docx")).toMatch(/Sozlesme_Kaya_Gida\s+Vörd belgesi/u);
    expect(applyAcademyCueDisplayPhonetics(".xlsx ve .pptx")).toMatch(/Excel tablosu/u);
    expect(applyAcademyCueDisplayPhonetics(".xlsx ve .pptx")).toMatch(/Pauer Point sunusu/u);
    expect(applyAcademyCueDisplayPhonetics(".xlsx ve .pptx")).not.toMatch(/\bxlsx\b|\bpptx\b/u);
    expect(applyAcademySpokenPhoneticsToDisplay("Kontrol C")).toBe("Ctrl+C");
    expect(applyAcademySpokenPhoneticsToDisplay("sohbetine docx yüklersin")).toBe("sohbetine Word belgesi yüklersin");
    expect(applyAcademySpokenPhoneticsToDisplay("sohbetine Vörd belgesi yüklersin")).toBe("sohbetine Word belgesi yüklersin");
  });

  it("Ayda takvim dilini AIDA'ya çevirmez; satış şablonunu çevirir", () => {
    expect(applyAcademySpokenPhoneticsToDisplay("Haftada on saat. Ayda kırk saat.")).toBe(
      "Haftada on saat. Ayda kırk saat.",
    );
    expect(applyAcademySpokenPhoneticsToDisplay("Ayda otuz dikey")).toBe("Ayda otuz dikey");
    expect(applyAcademySpokenPhoneticsToDisplay("Ayda ve Pas")).toBe("AIDA ve PAS");
    expect(applyAcademySpokenPhoneticsToDisplay("Bir: Ayda.")).toBe("Bir: AIDA.");
  });

  it("cümle başı tek kelimelik komut nidasını seste akışa çevirir", () => {
    expect(
      expandAcademyTtsSkipPreventer(
        "Merhaba, ben Selin. Hoş geldin. İlk dersimizdeyiz. Gel, vitrinin başına beraber geçelim.",
      ),
    ).toBe("Merhaba, ben Selin. Hoş geldin. İlk dersimizdeyiz. Şimdi vitrinin başına beraber geçelim.");
    expect(expandAcademyTtsSkipPreventer("Gel, tezgâhın kenarına şöyle otur.")).toBe(
      "Şimdi tezgâhın kenarına şöyle otur.",
    );
    expect(expandAcademyTtsSkipPreventer("Merhaba, ben Selin. Gel, bugün kasaya beraber bakalım.")).toBe(
      "Merhaba, ben Selin. Şimdi bugün kasaya beraber bakalım.",
    );
    expect(expandAcademyTtsSkipPreventer("Bak, fiyat tabanın altında. Dur, bu adımı atlama.")).toBe(
      "Şimdi fiyat tabanın altında. Şimdi bu adımı atlama.",
    );
    expect(expandAcademyTtsSkipPreventer("Hadi, kasaya bakalım.")).toBe("Şimdi kasaya bakalım.");
    expect(expandAcademyTtsSkipPreventer("Şimdi vitrinin başına beraber geçelim.")).toBe(
      "Şimdi vitrinin başına beraber geçelim.",
    );
    expect(expandAcademyTtsSkipPreventer("Hoş geldin. İlk dersimizdeyiz.")).toBe(
      "Hoş geldin. İlk dersimizdeyiz.",
    );
  });

  it("akış cümlesini ve selamlaşmayı dokunmadan bırakır", () => {
    expect(expandAcademyTtsSkipPreventer("Tekrar merhaba. Ben Gözde.")).toBe("Tekrar merhaba. Ben Gözde.");
    expect(expandAcademyTtsSkipPreventer("Klavyeni çek. Hangi araç açıksa o kalsın.")).toBe(
      "Klavyeni çek. Hangi araç açıksa o kalsın.",
    );
  });
});
