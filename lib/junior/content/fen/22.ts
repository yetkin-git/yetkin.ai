import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Üreme. FB.6.3.1. */
export const JUNIOR_FEN_22_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-22",
  title: "Üreme",
  teaser:
    "Üreme, canlıların kendine benzer yeni bireyler oluşturmasıdır. Eşeysiz üremede tek ata, eşeyli üremede iki ata vardır. Kavramsal Anlayış, bu iki yolu ayırır. İfade Gücü, bir canlı örneğinde ata sayısını söylemektir.",
  welcome:
    "Merhaba çocuklar, hepiniz hoş geldiniz! Bahçedeki bir bitkinin tohumu yeni bir fideye, kedinin yavrusu da yeni bir canlıya dönüşür. Canlılar kendi türlerini üreme ile sürdürür. Bugün eşeysiz ve eşeyli üremeyi bir model üzerinde ayıracağız. Bir tohum ile bir çeliği gözlemlemek, ata sayısını görünür kılar.",
  concept:
    "Üreme, canlının soyunu devam ettiren olaydır. Eşeysiz üremede yeni birey tek bir atadan oluşur ve atasına çok benzer. Bazı bitkilerde çelikten yeni bitki çıkması buna örnektir. Eşeyli üremede dişi üreme hücresi ile erkek üreme hücresi birleşir; ata sayısı ikidir ve yavrular arasında çeşitlilik görülebilir. Bakterinin bölünerek çoğalması eşeysiz yola, çiçekli bitkinin tohum oluşturması eşeyli yola örnektir. Pratik kural: Tek ata eşeysiz, iki ata eşeyli üremeyi işaret eder.",
  example:
    "Saksıda bir nane dalını 1 bardak suda köklendirirsen yeni bitki tek atadan gelir; bu eşeysiz üremedir. Aynı bahçede 2 ata gerektiren tohum yoluna bakalım: çiçek tozlaşır, tohum oluşur, tohumdan yeni bitki çıkar. Bu yol eşeylidir. Kedide yavru, dişi ve erkek atanın üreme hücrelerinin birleşmesiyle başlar; yavru ikisine de benzeyebilir ama kopya değildir. Çizimdeki modelde tek ok eşeysiz, iki ok eşeyli yolu gösterir.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Her yeni canlının iki atadan geldiğini sanmak tuzaktır; çelikten türeyen bitki tek atadan gelir. Eşeyli üremeyi yalnız hayvanlara ait sanmak da eksiktir; birçok bitki tohumla eşeyli ürer. Üreme konusunda kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu evde nane ya da gül çeliğine bakarak gözlemleyebilirsin. Mutfakta filizlenen bir patates de tek atadan yeni sürgün verebilir. Bahçede elma ağacının çiçeği ise tohum yolunu hatırlatır. Okul defterine iki kutuluk bir model çizmek ata sayısını akılda tutar.",
  recap: [
    "Üreme, canlının soyunu sürdüren olaydır.",
    "Eşeysiz üremede tek ata, eşeyli üremede iki ata vardır.",
    "Tohum yolu eşeyli, çelik yolu eşeysiz örnektir.",
  ],
  conceptSeal: "Üreme, ata sayısına göre eşeysiz ya da eşeyli diye ayrılır.",
  voiceSeal: "Bir örnekte kaç ata olduğunu ve yolun adını söylersin.",
  outcomes: [
    "Üreme soyun sürmesidir.",
    "Eşeysiz üremede ata tektir.",
    "Eşeyli üremede iki üreme hücresi birleşir.",
  ],
  scene: "body",
  parentNote:
    "Çocuğunuz üremeyi soyun sürmesi diye tanımlar. Çelikte tek ata, tohumda iki ata ayrımını kurar. Anlatım organ şeması düzeyindedir.",
};

export const JUNIOR_FEN_22 = juniorLessonFromScenario(JUNIOR_FEN_22_SCENARIO);
