import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Paralelkenar ve üçgenin alanı. */
export const JUNIOR_MAT_21_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-21",
  title: "Paralelkenar ve üçgenin alanı",
  teaser:
    "Paralelkenarın alanı, taban ile yüksekliğin çarpımıdır. Üçgenin alanı, bu çarpımın yarısıdır. Kavramsal Anlayış, yüksekliğin tabana dik inen uzunluk olduğunu görmendir. İfade Gücü, aynı taban ve yükseklikte üçgenin neden paralelkenarın yarısı olduğunu söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç bir kâğıt paralelkenarı tam köşegeninden kesip iki eş üçgen elde ettin mi? Bu iki üçgeni üst üste koyduğunda alanın tam yarıya indiğini görürsün. Bugün seninle paralelkenarın ve üçgenin alanını hesaplamanın pratik yollarını keşfedeceğiz.",
  concept:
    "Alan, bir geometrik şeklin düzlemde kapladığı yüzey ölçüsüdür. Paralelkenarda taban seçilen alt kenardır; yükseklik ise o tabana karşı kenardan dik inen doğru parçasıdır. Yandaki eğik kenar asla yükseklik değildir! Paralelkenarın alanı, taban ile yüksekliğin çarpımıdır. Üçgenin alanı ise aynı taban ve aynı yüksekliğe sahip paralelkenarın tam yarısıdır. Şurası aklında kalsın tamam mı: Üçgende alanı bulurken taban ile yüksekliği çarpıp mutlaka ikiye bölersin; eğik kenarı ise yükseklik yerine asla kullanmazsın.",
  example:
    "Tabanı 8 santimetre, yüksekliği 5 santimetre olan bir paralelkenar düşünelim. Alanı 8 çarpı 5'ten 40 santimetrekaredir. Aynı tabana ve aynı yüksekliğe sahip bir üçgenin alanı ise 40'ın yarısı, yani 20 santimetrekaredir; bunu 8 çarpı 5 bölü 2 diye yazarız. Paralelkenarın eğik kenarı 6 santimetre olsa bile, 8 ile 6'yı çarpmak alanı vermez; çünkü 6 dik yükseklik değildir. Yükseklik daima dik inen 5 santimetredir.",
  hint: "trap",
  warning:
    "Tuzaklara Düşme! Yandaki eğik kenarı yükseklik sanıp tabanla çarpmak en sık yapılan hatadır. Yükseklik mutlaka tabana dik inmelidir. Bir de üçgenin alanını hesaplarken ikiye bölmeyi her zaman hatırla; 8 çarpı 5 paralelkenarın alanıdır, üçgen için bu sonucu 2'ye bölmek şarttır.",
  life:
    "Bunu bir uçurtmada da kullanırsın. Uçurtmanın bir parçası üçgen ise tabanı ve dik yüksekliği ölçersin. Çarpımın yarısı, kâğıdın kapladığı alandır. Bahçedeki paralelkenar tarhın alanı ise taban çarpı yüksekliktir. Çiti eğik ölçersen tarhı olduğundan büyük sanırsın.",
  recap: [
    "Paralelkenarın alanı taban çarpı yüksekliktir.",
    "Üçgenin alanı, aynı taban ve yükseklikteki paralelkenarın yarısıdır.",
    "Taban 8 ve yükseklik 5 ise paralelkenar 40, üçgen 20 santimetrekaredir.",
  ],
  conceptSeal: "Yükseklik, tabana dik inen uzunluktur.",
  voiceSeal: "Üçgende neden ikiye böldüğünü ve eğik kenarı neden kullanmadığını söylersin.",
  outcomes: [
    "Paralelkenarın alanı taban çarpı yüksekliktir.",
    "Üçgenin alanı bu çarpımın yarısıdır.",
    "Eğik kenar, yükseklik değildir.",
  ],
  scene: "area",
  parentNote:
    "Çocuğunuz tabanı 8, yüksekliği 5 olan paralelkenarın alanını 40, aynı üçgenin alanını 20 santimetrekare diye anlatır. Eğik kenar yükseklik yerine geçmez.",

};

export const JUNIOR_MAT_21 = juniorLessonFromScenario(JUNIOR_MAT_21_SCENARIO);
