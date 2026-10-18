import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/**
 * 6. Sınıf Matematik. Merkez açı ve gördüğü yay.
 * Film `resolveJuniorPlayback` grafiğidir. Dereceler parametredir.
 */
export const JUNIOR_MAT_36_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-36",
  title: "Merkez açı ve gördüğü yay",
  teaser: "Merkez açı, köşesi çemberin merkezinde duran açıdır. Kavramsal Anlayış, gördüğü yayın ölçüsünün açıya eşit olduğudur. İfade Gücü, 90 derecelik merkez açının çeyrek yay gördüğünü söylemektir.",
  welcome: "Merhaba sevgili çocuklar! Bugün merkezdeki açının çember üzerinde hangi yayı gördüğünü ölçeceğiz. Okul saatinin kolları merkezden çıkar. Kolların arası bir merkez açıdır.",
  concept: "Merkez açının köşesi çemberin merkezidir. Kollar çemberi iki noktada keser. Bu iki nokta arasındaki yay, açının gördüğü yaydır. Yayın ölçü birimi de derecedir ve açıya eşittir. Tam çember 360 derecedir. 90 derecelik merkez açı, çemberin dörtte birini görür.",
  example: "Merkez açı 90 derece olsun. Gördüğü yay da 90 derecedir. Bu, 360 derecenin dörtte biridir. Merkez açı 180 derece ise yay yarım çemberdir. Merkez açı 60 derece ise yay 60 derecedir ve tam turun altıda birine yakındır. 360 bölü 60, 6 eder.",
  hint: "gold",
  warning: "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Yayın uzunluğunu santimetre sanma. Buradaki 90 derece bir ölçü açısıdır. Çevre uzunluğu ayrı bir cetvel işidir. Merkezde durmayan açı, merkez açı değildir.",
  life: "Bunu okul bahçesindeki yelkovanda görürsün. Kutunun yuvarlak kapağında iki ip merkezden kenara giderse aradaki dilim bir yaydır. Dilim 90 dereceyse kapak dört eşit paydan biridir.",
  recap: [
    "Merkez açının köşesi çemberin merkezindedir.",
    "Gördüğü yayın derecesi açıya eşittir.",
    "Tam çember 360 derecedir.",
  ],
  conceptSeal: "Merkez açının gördüğü yay, açının kendisiyle aynı derecededir.",
  voiceSeal: "90 derecelik merkez açının çeyrek yay gördüğünü dersin.",
  outcomes: [
    "Merkez açının köşesi merkezdir.",
    "Yayın derecesi açıya eşittir.",
    "360 derece tam çemberdir.",
    "Merkez açı ve gördüğü yay kuralı bu derste yeni bir istisna açmaz.",
    "36 numaralı örnek, ikinci bir kurala dönüşmez.",
    "Okul defterindeki adım, bahçedeki ölçümle aynı kuralı taşır.",
  ],
  scene: "circle",
  parentNote: "Çocuğunuz 90 derecelik merkez açının 90 derecelik yay gördüğünü söyler. Bunu santimetre sanmaz. Tam çemberi 360 diye tutar.",
};

export const JUNIOR_MAT_36 = juniorLessonFromScenario(JUNIOR_MAT_36_SCENARIO);
