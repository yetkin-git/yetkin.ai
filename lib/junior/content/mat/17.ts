import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/**
 * 6. Sınıf Matematik. Üçgen ve dörtgenlerin açı problemleri.
 * Film `resolveJuniorPlayback` grafiğidir. 180° ve 360° parametredir.
 * `AnglesScene` bu dersi çizmez.
 */
export const JUNIOR_MAT_33_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-17",
  title: "Üçgen ve dörtgenlerin açı problemleri",
  teaser: "Üçgenin iç açıları 180 dereceyi, dörtgenin iç açıları 360 dereceyi tamamlar. Kavramsal Anlayış, eksik açıyı toplamdan çıkarmaktır. İfade Gücü, verilen iki açıdan üçüncüyü bulmaktır.",
  welcome: "Merhaba sevgili çocuklar! Bugün eksik açıyı toplamdan ölçeceğiz. Okul bahçesindeki üçgen çiçekliğin köşeleri bir düzlemde toplanır. Dört köşe ise daha büyük bir toplam ister.",
  concept: "Üçgenin iç açıları toplamı 180 derecedir. Dörtgenin iç açıları toplamı 360 derecedir. Eksik açı, toplamdan bilinen açıların çıkarılmasıdır. Modelde iki açı verilirse üçüncü açı farktır. Cetvelle tahmin yetmez; toplam kuralı ölçünün yerine geçer.",
  example: "Bir üçgende açılar 50 derece ve 60 derece olsun. Toplam 180 derecedir. 50 artı 60, 110 eder. 180 eksi 110, 70 derece eder. Bir dörtgende üç açı 80, 90 ve 100 derece olsun. Toplamları 270 eder. 360 eksi 270, 90 derece eder. Dördüncü açı 90 derecedir.",
  hint: "trap",
  warning: "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Üçgen toplamını 360 sanma. 360 dörtgene aittir. 50 artı 60 artı 70, 180 eder. Aynı sayıları dörtgen sandığında bir açı açıkta kalır. Hangi çokgen olduğunu köşe sayısından oku.",
  life: "Bunu okul bahçesindeki tabela köşesinde kullanırsın. Üç köşeli kutunun eksik köşesi 180'den çıkar. Dört köşeli kapakta ise 360'tan çıkarırsın.",
  recap: [
    "Üçgenin iç açıları 180 derece eder.",
    "Dörtgenin iç açıları 360 derece eder.",
    "Eksik açı, toplamdan bilinenlerin farkıdır.",
  ],
  conceptSeal: "Köşe sayısı, açı toplamını seçer. Eksik açı farktır.",
  voiceSeal: "50 ve 60 verilen üçgende üçüncü açının 70 derece olduğunu dersin.",
  outcomes: [
    "Üçgenin açı toplamı 180 derecedir.",
    "Dörtgenin açı toplamı 360 derecedir.",
    "Eksik açı çıkarma ile bulunur.",
    "Üçgen ve dörtgenlerin açı problemleri kuralı bu derste yeni bir istisna açmaz.",
    "33 numaralı örnek, ikinci bir kurala dönüşmez.",
    "Okul defterindeki adım, bahçedeki ölçümle aynı kuralı taşır.",
  ],
  scene: "angles",
  parentNote: "Çocuğunuz 50 ve 60 derecelik üçgende üçüncü açıyı 70 diye bulur. Dörtgende 360 kullanır. Üçgeni 360 ile kapatmaz.",
};

export const JUNIOR_MAT_33 = juniorLessonFromScenario(JUNIOR_MAT_33_SCENARIO);
