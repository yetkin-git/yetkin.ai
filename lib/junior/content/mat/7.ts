import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Ortak bölenler ve ortak katlar. */
export const JUNIOR_MAT_7_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-7",
  title: "Ortak bölen ve ortak kat",
  teaser:
    "Ortak bölen, iki sayıyı birden kalansız bölen sayıdır. Ortak kat, iki sayının da katı olan sayıdır. Kavramsal Anlayış, en büyük ortak böleni en küçük ortak kattan ayırmandır. İfade Gücü, 8 ve 12 için bu iki sayıyı ayrı söylemektir.",
  welcome:
    "Hoş geldin! Hazırsan bugün zihnimizi harika bir matematik yolculuğuna çıkarıyoruz, çünkü iki sayının birlikte paylaştığı bölenleri ve katları yakalayacağız. Hiç iki farklı kurdele rulosunu aynı boyda eşit parçalara ayırmayı denedin mi? Keseceğin parça, iki ruloyu da kalansız bölmelidir. Bugün seninle en büyük ortak böleni ve en küçük ortak katı keşfedeceğiz.",
  concept:
    "Ortak bölen, iki sayıyı da aynı anda kalansız bölen sayılardır. En büyük ortak bölen, bu ortak bölenlerin en büyüğüdür. Ortak kat ise her iki sayının da katları arasında birlikte yer alan sayılardır. En küçük ortak kat, bu ortak katların sıfırdan farklı en küçüğüdür. Şurası aklında kalsın tamam mı: Bir bölen, sayıların kendisinden büyük olamaz. Bir ortak kat ise sayılardan asla küçük olamaz.",
  example:
    "8 ve 12 sayılarını yan yana koyalım. 8'in bölenleri 1, 2, 4 ve 8'dir. 12'nin bölenleri 1, 2, 3, 4, 6 ve 12'dir. İkisinin ortak bölenleri 1, 2 ve 4'tür. En büyük ortak bölen ise 4'tür. Şimdi katlara bakalım: 8'in katları 8, 16, 24 ve 32'dir. 12'nin katları 12, 24 ve 36'dır. İlk buluştukları ortak kat 24'tür; yani en küçük ortak kat 24'tür. 4 sayısı iki kurdeleyi de böler; 24 ise iki sayının da ulaştığı ilk ortak noktadır.",
  hint: "gold",
  warning:
    "Altın İpucu! En büyük ortak bölen ile en küçük ortak katı birbiriyle karıştırma. Bölenler küçük sayılar arasında gezinir; katlar ise büyük sayılara doğru koşar. 8 ve 12 için 4 sayısı bölen, 24 sayısı ise kattır. 4'ü kat, 24'ü bölen sanma tuzağına düşme.",
  life:
    "Bunu servis saatlerinde de kullanırsın. Bir otobüs 8 dakikada, öteki 12 dakikada bir kalkar. İkisi de 0. dakikada kalktıysa yeniden birlikte kalkış 24. dakikadadır. Bu, en küçük ortak kattır. Kurdele parçası ise en büyük ortak bölendir.",
  recap: [
    "Ortak bölen iki sayıyı birden böler. En büyüğü, en büyük ortak bölendir.",
    "Ortak kat iki sayının da katıdır. En küçüğü, en küçük ortak kattır.",
    "8 ve 12 için en büyük ortak bölen 4, en küçük ortak kat 24'tür.",
  ],
  conceptSeal: "Ortak bölen paylaşır. Ortak kat, iki sayının birlikte büyüdüğü yerdir.",
  voiceSeal: "4 ile 24'ün hangisinin bölen, hangisinin kat olduğunu ayırırsın.",
  outcomes: [
    "En büyük ortak bölen, ortak çarpanların en büyüğüdür.",
    "En küçük ortak kat, ortak katların en küçüğüdür.",
    "8 ve 12 örneğinde sonuçlar 4 ve 24'tür.",
  ],
  scene: "number-ops",
  parentNote:
    "Çocuğunuz 8 ve 12 için en büyük ortak bölenin 4, en küçük ortak katın 24 olduğunu anlatır. Bölen küçük listede, kat büyük listede durur.",

};

export const JUNIOR_MAT_7 = juniorLessonFromScenario(JUNIOR_MAT_7_SCENARIO);
