import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";
import {
  MAT_6_CANONICAL_TITLE,
  MAT_6_HERO_FOCUS,
  MAT_6_HERO_QUESTION,
  mat6CanonicalBooklet,
  mat6FullListenText,
} from "@/lib/junior/pilot-engine/mat-6.choreography";

/**
 * 6. Sınıf Matematik. MAT.6.1.3'ün bu kapsülü:
 * asal tanımı, 1 asal değildir, 2 tek çift asaldır, 9 tuzağı, 12 = 2 × 2 × 3.
 * Kart cümleleri oynatılan 12 sekansın metnidir.
 * Kalbur ve bölen listesi bu filmde yoktur. Üretim durumu fırın sonrası locked / ready.
 */
const booklet = mat6CanonicalBooklet();

export const JUNIOR_MAT_6_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-2",
  title: MAT_6_CANONICAL_TITLE,
  teaser:
    "Asal sayı, 1'den büyük olan ve yalnız 1'e ve kendisine bölünen sayıdır. 1 asal değildir. 2 tek çift asal sayıdır. 9, 3 çarpı 3 olduğu için asal değildir. 12, 2 çarpı 2 çarpı 3 diye yazılır.",
  heroQuestion: MAT_6_HERO_QUESTION,
  heroFocus: MAT_6_HERO_FOCUS,
  welcome: booklet.welcome,
  life: booklet.life,
  concept: booklet.concept,
  example: booklet.example,
  hint: "trap",
  warning: booklet.warning,
  recap: booklet.recap,
  conceptSeal: "Asal çarpan, 12'yi 2 çarpı 2 çarpı 3 diye daha küçük asalların çarpımına indirir.",
  voiceSeal: "1'in neden asal olmadığını ve 12'nin çarpımını kendi sözlerinle söylersin.",
  echoPrompt: "1'in neden asal olmadığını ve 12'nin çarpımını kendi cümlenle anlat!",
  outcomes: [
    "Asal sayı 1'den büyüktür ve yalnız 1 ile kendisine bölünür.",
    "1 asal değildir. 2 tek çift asal sayıdır. 9 asal değildir.",
    "12, 2 çarpı 2 çarpı 3 olarak çarpan ağacına ayrılır.",
  ],
  scene: "number-ops",
  parentNote:
    "Çocuğunuz asal sayıyı 1'den büyük ve yalnız 1 ile kendisine bölünen sayı diye anlatır. 1'in asal olmadığını, 2'nin tek çift asal olduğunu ve 9'un 3 çarpı 3 olduğu için asal olmadığını söyler. Evde 12'yi 2 çarpı 2 çarpı 3 diye ayırmak yeter.",
};

const assembledMat6 = juniorLessonFromScenario(JUNIOR_MAT_6_SCENARIO);
/** Katalog kaseti oynatılan sekansların birleşimidir. Senaryo kabuğu ikinci bir konuşma yazmaz. */
export const JUNIOR_MAT_6 = { ...assembledMat6, listenText: mat6FullListenText() };
