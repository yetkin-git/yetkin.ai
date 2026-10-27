import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/**
 * 6. Sınıf Matematik. Ortak bölenler ve ortak katlar.
 * Film `resolveJuniorPlayback` grafiğidir. Ortak bölen ve ortak kat sayıları grafiğin parametresidir.
 */
export const JUNIOR_MAT_7_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-3",
  title: "Ortak bölen ve ortak kat",
  teaser:
    "Ortak bölen, iki sayıyı birden kalansız bölen sayıdır. Ortak kat, iki sayının da katı olan sayıdır. Ortak bölenler ile ortak katlar ayrı listelerdir. 8 ve 12 için ortak bölenler 1, 2 ve 4, ortak katlar 24'te buluşur.",
  welcome:
    "Merhaba sevgili çocuklar! İki sayının birlikte paylaştığı bölenleri ve katları yakalayacağız. Hiç iki farklı kurdele rulosunu aynı boyda eşit parçalara ayırmayı denedin mi? Keseceğin parça, iki ruloyu da kalansız bölmelidir. Ortak bölenleri ve ortak katları keşfedeceğiz.",
  concept:
    "Ortak bölenler, iki sayıyı da aynı anda kalansız bölen sayılardır. Bu ortak bölenler küçük listede durur. Ortak katlar ise her iki sayının da katları arasında birlikte yer alan sayılardır. Ortak katlar büyük listede, sıfırdan farklı yerde durur. Pratik kural: Bir bölen, sayıların kendisinden büyük olamaz. Bir ortak kat ise sayılardan asla küçük olamaz.",
  example:
    "8 ve 12 sayılarını yan yana koyalım. 8'in bölenleri 1, 2, 4 ve 8'dir. 12'nin bölenleri 1, 2, 3, 4, 6 ve 12'dir. İkisinin ortak bölenleri 1, 2 ve 4'tür. Ortak bölenler listesinin son sayısı 4'tür. Şimdi katlara bakalım: 8'in katları 8, 16, 24 ve 32'dir. 12'nin katları 12, 24 ve 36'dır. İlk buluştukları ortak kat 24'tür; yani ortak katlar burada 24'tür. 4 sayısı iki kurdeleyi de böler; 24 ise iki sayının da ulaştığı ilk ortak noktadır.",
  hint: "gold",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Altın İpucu! Ortak bölenler ile ortak katları birbiriyle karıştırma. Bölenler küçük sayılar arasında gezinir; katlar ise büyük sayılara doğru koşar. 8 ve 12 için 4 sayısı bölen, 24 sayısı ise kattır. 4'ü kat, 24'ü bölen sanma tuzağına düşme.",
  life:
    "Bunu servis saatlerinde de kullanırsın. Bir otobüs 8 dakikada, öteki 12 dakikada bir kalkar. İkisi de 0. dakikada kalktıysa yeniden birlikte kalkış 24. dakikadadır. Bu, ortak katların buluştuğu yerdir. Kurdele parçası ise ortak bölenlerdendir.",
  recap: [
    "Ortak bölenler iki sayıyı birden böler. 8 ve 12 için liste 1, 2 ve 4'tür.",
    "Ortak katlar iki sayının da katıdır. 8 ve 12 ilk kez 24'te buluşur.",
    "8 ve 12 için ortak bölenler 1, 2 ve 4'tür; ortak katlar 24'te buluşur.",
  ],
  conceptSeal: "Ortak bölen paylaşır. Ortak kat, iki sayının birlikte büyüdüğü yerdir.",
  voiceSeal: "4 ile 24'ün hangisinin bölen, hangisinin kat olduğunu ayırırsın.",
  outcomes: [
    "Ortak bölenler, iki sayıyı birden kalansız bölen sayılardır.",
    "Ortak katlar, iki sayının da katı olan sayılardır.",
    "8 ve 12 örneğinde ortak bölenler 1, 2 ve 4, buluşma 24'tür.",
  ],
  scene: "number-ops",
  parentNote:
    "Çocuğunuz 8 ve 12 için ortak bölenlerin 1, 2 ve 4 olduğunu, ortak katların 24'te buluştuğunu anlatır. Ortak bölenler küçük listede, ortak katlar büyük listede durur.",

};

export const JUNIOR_MAT_7 = juniorLessonFromScenario(JUNIOR_MAT_7_SCENARIO);
