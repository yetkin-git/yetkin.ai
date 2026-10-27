import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";
import {
  MAT_5_CANONICAL_RECAP,
  MAT_5_CANONICAL_TITLE,
  MAT_5_HERO_FOCUS,
  MAT_5_HERO_QUESTION,
  mat5CueText,
  mat5FullListenText,
} from "@/lib/junior/pilot-engine/mat-1.choreography";

/**
 * 6. Sınıf Matematik. Bu kapsül MAT.6.1.1 ve MAT.6.1.2'nin yedi kuralıdır:
 * çarpan, kat, 2, 3, 4, 5, 6, 9, 10.
 * 4: 100 sayısı 4'e tam bölündüğü için son iki basamak yeter.
 * 6: hem 2 hem 3. Kart cümleleri oynatılan sekanslardan gelir.
 * Üretim durumu locked / ready. Kulak, tek istek fırınının PCM saatidir.
 */
const cue = mat5CueText;

export const JUNIOR_MAT_5_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-1",
  title: MAT_5_CANONICAL_TITLE,
  teaser:
    "Çarpan, sayıya eşit ya da küçük kalansız bölendir. Kat, sayıya eşit ya da büyük çarpımdır. Bu derste 2, 3, 4, 5, 6, 9 ve 10 kuralları vardır.",
  /** Ders Notu hero SSOT — sahne/cue cümlesi değil, bütüncül pedagojik soru. */
  heroQuestion: MAT_5_HERO_QUESTION,
  heroFocus: MAT_5_HERO_FOCUS,
  welcome: cue("cue-01"),
  life: [cue("cue-02"), cue("cue-03")].join(" "),
  concept: [cue("cue-04"), cue("cue-05")].join(" "),
  example: ["cue-06", "cue-07", "cue-08", "cue-13", "cue-09", "cue-10", "cue-14"]
    .map((id) => cue(id))
    .join(" "),
  hint: "gold",
  warning: cue("cue-11"),
  recap: [...MAT_5_CANONICAL_RECAP],
  conceptSeal:
    "Bugün çarpanın sayıya eşit ya da küçük, katın ise eşit ya da büyük olduğunu ve yedi dedektif kuralımızı (2, 3, 4, 5, 6, 9, 10) öğrendik.",
  voiceSeal: "24 ve 30 ile 116 sayılarının hangi kurallara uyduğunu kendi cümlenle anlatırsın.",
  echoPrompt: "24 ve 30 ile 116 sayılarının hangi kurallara uyduğunu kendi cümlenle anlat!",
  outcomes: [
    "Çarpan ≤ sayı, kat ≥ sayı. Sayının kendisi hem çarpandır hem kattır.",
    "Son Basamak Dedektifleri (2, 5, 10): Birler basamağına bak!",
    "Son İki Basamak Dedektifi (4): 100, 4'e tam bölündüğü için son iki basamak yeter.",
    "Rakam Toplamı Dedektifleri (3, 9): Rakamları topla, kata bak!",
    "Çifte Koşul Dedektifi (6): Hem 2'ye hem 3'e aynı anda bölünmeli.",
  ],
  scene: "number-ops",
  parentNote:
    "Çocuğunuz 12 bilye ile çarpanı, 6'nın çarpan ve katlarını, son rakamla 2, 5 ve 10'u, son iki basamakla 4'ü, rakam toplamıyla 3 ve 9'u, hem 2 hem 3 koşuluyla 6'yı anlatır.",
};

const assembledMat5 = juniorLessonFromScenario(JUNIOR_MAT_5_SCENARIO);
/** Katalog kaseti oynatılan sekansların birleşimidir. Senaryo kabuğu ikinci bir konuşma yazmaz. */
export const JUNIOR_MAT_5 = { ...assembledMat5, listenText: mat5FullListenText() };
