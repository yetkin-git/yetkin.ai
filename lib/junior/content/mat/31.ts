import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/**
 * 6. Sınıf Matematik. İki kesenin oluşturduğu dörtgenler.
 * Film `resolveJuniorPlayback` grafiğidir. Yamuk ve paralelkenar parametredir.
 * `AnglesScene` bu dersi çizmez.
 */
export const JUNIOR_MAT_31_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-31",
  title: "İki kesenin oluşturduğu dörtgenler",
  teaser: "İki paralel doğruyu iki kesen kesince arada bir dörtgen durur. Kavramsal Anlayış, bir çift kenarın paralel kaldığını görmektir. İfade Gücü, bu dörtgene yamuk demektir.",
  welcome: "Merhaba sevgili çocuklar! Bugün iki kesenin arasında kalan dörtgeni modelleyeceğiz. Okul defterinde iki yatay çizgiyi iki eğik çizgi keser. Arada kalan şeklin adı rastgele değildir.",
  concept: "İki paralel doğru ve iki kesen, aralarında bir dörtgen sınırlar. Paralel kalan kenar çifti bu dörtgeni yamuk yapar. Dört kenar da paralel çiftlere ayrılırsa model paralelkenara döner. Köşeler dört tanedir. İç açılar toplanınca 360 derece eder.",
  example: "Deftere iki paralel doğru çizelim. Üstüne iki kesen ekleyelim. Kesişen dört nokta bir dörtgen verir. Alt ve üst kenar paraleldir. Bu yüzden şekil yamuktur. Kesenler de birbirine paralel olursa karşılıklı iki çift birden paralel olur ve dörtgen paralelkenardır.",
  hint: "gold",
  warning: "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Her dörtgen yamuk değildir. Yamukta en az bir kenar çifti paraleldir. Hiçbir kenarı paralel olmayan dörtgen bu modelin dışındadır. Köşe sayısını 3 sanırsan üçgen çizersin.",
  life: "Bunu okul bahçesindeki iki kaldırım ve iki patika kesişiminde görürsün. Kutunun kapağında paralel kenarlar duruyorsa dörtgen yamuktur. Patikalar da paralel giderse kapak paralelkenara benzer.",
  recap: [
    "İki paralel doğru ve iki kesen bir dörtgen sınırlar.",
    "Bir kenar çifti paralel ise dörtgen yamuktur.",
    "İki çift birden paralel ise dörtgen paralelkenardır.",
  ],
  conceptSeal: "Kesişen doğruların arası, paralel kenara göre adlandırılır.",
  voiceSeal: "Bir çift kenarı paralel olan dörtgene yamuk dersin.",
  outcomes: [
    "İki kesen, paralellerin arasında dörtgen kurar.",
    "Tek paralel çift yamuktur.",
    "İki paralel çift paralelkenardır.",
    "İki kesenin oluşturduğu dörtgenler kuralı bu derste yeni bir istisna açmaz.",
    "31 numaralı örnek, ikinci bir kurala dönüşmez.",
    "Okul defterindeki adım, bahçedeki ölçümle aynı kuralı taşır.",
  ],
  scene: "angles",
  parentNote: "Çocuğunuz iki paralel çizgi ve iki kesenin arasını yamuk diye adlandırır. İkinci çift de paralelse paralelkenar der. Her dörtgene yamuk demez.",
};

export const JUNIOR_MAT_31 = juniorLessonFromScenario(JUNIOR_MAT_31_SCENARIO);
