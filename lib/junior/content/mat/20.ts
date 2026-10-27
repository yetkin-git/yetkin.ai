import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/**
 * 6. Sınıf Matematik. Çember uzunluğu ile çap.
 * Film `resolveJuniorPlayback` grafiğidir. r, R, π ve çevre parametredir.
 * `CircleGeoScene` bu dersi çizmez.
 */
export const JUNIOR_MAT_34_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-20",
  title: "Çember uzunluğu ile çap",
  teaser: "Çemberin çevresi, çap ile pi sayısının çarpımıdır. Kavramsal Anlayış, çapın yarıçapın iki katı olduğudur. İfade Gücü, çapı 10 olan çemberin çevresini pi ile yazmaktır.",
  welcome: "Merhaba sevgili çocuklar! Bugün çemberin çevresini çapından ölçeceğiz. Okul bahçesindeki yuvarlak havuzun kenarı bir çemberdir. Çap, çemberi ortadan ikiye bölen en uzun kiriştir.",
  concept: "Çap, merkezden geçen ve çemberi iki noktada kesen doğru parçasıdır. Yarıçap, çapın yarısıdır. Çevre uzunluğu çap ile pi sayısının çarpımıdır. Pi yaklaşık 3,14 alınır. Cetvelle çapı ölçünce çevre, çarpımla bulunur. Çap 2 ise yarıçap 1'dir.",
  example: "Çapı 10 santimetre olan bir çemberde çevre 10 çarpı pi santimetredir. Pi yerine 3 alırsak yaklaşık çevre 30 santimetre olur. Pi yerine 3,14 alırsak 31,4 santimetre olur. Yarıçap 5 santimetredir çünkü 10'un yarısı 5'tir. Çap verilmeden yarıçapı çevre sanma.",
  hint: "gold",
  warning: "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Çap ile yarıçapı yer değiştirme. Çap 10 ise yarıçap 5'tir. Çevreyi yarıçapla çarparken çap formülünü iki kez kullanmış olursun. Formül çarpı çaptır. Yarıçap verilirse önce iki katını al.",
  life: "Bunu okul bahçesindeki yuvarlak saksıda görürsün. Kutunun kapağı yuvarlaksa bir ipi kenardan dolandırıp çapı ölçersin. İpin boyu, çap ile pi'nin çarpımına yakındır.",
  recap: [
    "Çap, yarıçapın iki katıdır.",
    "Çevre, çap çarpı pi eder.",
    "Pi yaklaşık 3,14 alınır.",
  ],
  conceptSeal: "Çemberin çevresi çap ile pi'nin çarpımıdır.",
  voiceSeal: "Çapı 10 olan çemberde çevrenin 10 çarpı pi olduğunu dersin.",
  outcomes: [
    "Çap, yarıçapın iki katıdır.",
    "Çevre, çap ile pi'nin çarpımıdır.",
    "Yaklaşık hesapta pi 3,14 alınır.",
    "Çember uzunluğu ile çap kuralı bu derste yeni bir istisna açmaz.",
    "34 numaralı örnek, ikinci bir kurala dönüşmez.",
    "Okul defterindeki adım, bahçedeki ölçümle aynı kuralı taşır.",
  ],
  scene: "circle",
  parentNote: "Çocuğunuz çapı 10 olan çemberin çevresini 10 çarpı pi diye yazar. Yarıçapı 5 diye ayırır. Çevreyi yarıçap sanmaz.",
};

export const JUNIOR_MAT_34 = juniorLessonFromScenario(JUNIOR_MAT_34_SCENARIO);
