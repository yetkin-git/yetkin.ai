import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Prizmalar ve hacim. */
export const JUNIOR_MAT_24_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-24",
  title: "Prizmalar ve hacim",
  teaser:
    "Prizma, tabanları birbirine eş ve paralel olan bir cisimdir. Hacim, cismin kapladığı yerdir. Dikdörtgenler prizmasının hacmi, üç ayrı uzunluğun çarpımıdır. Kavramsal Anlayış, hacmi alandan ayırmandır. İfade Gücü, küpün üç kenarının da eşit olduğunu söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün önümüzde ne var, birlikte keşfedelim. Hiç bir hediye kutusunun içine kaç tane birim küp sığacağını zihninde canlandırdın mı? Bir cismin boşlukta kapladığı yer onun hacmidir. Bugün seninle prizmaları tanıyacak ve dikdörtgenler prizmasının hacmini kolaylıkla hesaplayacağız.",
  concept:
    "Dikdörtgenler prizmasında üç temel boyut vardır: En, boy ve yükseklik. Hacim, bu üç farklı uzunluğun birbiriyle çarpılmasıyla bulunur ve birimi santimetreküptür. Küp ise bütün ayrıt uzunlukları birbirine eşit olan özel bir prizmadır. Küpün hacmini bulurken bir kenar uzunluğunu kendisiyle üç kez art arda çarparız. Şurası aklında kalsın tamam mı: Alan iki boyutludur ve iki uzunluğu çarpar; hacim ise üç boyutludur ve üç uzunluğu çarpar.",
  example:
    "Eni 4, boyu 3, yüksekliği 2 santimetre olan bir kutu düşünelim. Hacmi 4 çarpı 3 çarpı 2 işleminden bulunur: 4 çarpı 3, 12 eder; 12 çarpı 2 ise 24 santimetreküp yapar. Burada 4 çarpı 3 aynı zamanda kutunun taban alanıdır; yani taban alanı çarpı yükseklik de hacmi verir. Kenarı 3 santimetre olan bir küpün hacmi ise 3 çarpı 3 çarpı 3'ten 27 santimetreküptür. 3 çarpı 3, 9 santimetrekaredir ve sadece tek bir yüzün alanıdır; hacim için üçüncü 3 ile de çarparız.",
  hint: "gold",
  warning:
    "Altın İpucu! Prizmada sadece iki kenarı çarpıp hacmi buldum sanmak en yaygın hatadır. 4 çarpı 3 işlemi yalnız taban alanını verir ve 12 santimetrekaredir; üçüncü kenar olan 2 ile çarpmadan hacme ulaşamazsın. Hacim 24 santimetreküptür. Alan santimetrekare, hacim ise santimetreküp ile ifade edilir.",
  life:
    "Bunu oyuncak kutusunda da kullanırsın. Kutunun tabanına kaç blok sığıyorsa o taban alanıdır. Kaç kat dizdiysen o yüksekliktir. Kat sayısıyla tabanı çarpmak hacmi verir. Buzdolabındaki süt kutusunun içi de bir prizmadır. Üç ayrıtı ölçmeden kaç bardak sığacağını bilemezsin.",
  recap: [
    "Dikdörtgenler prizmasının hacmi en çarpı boy çarpı yüksekliktir.",
    "Küpün üç kenarı eşittir. Hacmi, kenarın üç kez çarpımıdır.",
    "4, 3 ve 2 santimetrelik kutunun hacmi 24 santimetre küptür. 12 yalnız taban alanıdır.",
  ],
  conceptSeal: "Hacim, cismin kapladığı üç boyutlu yerdir.",
  voiceSeal: "Taban alanı ile yüksekliği neden çarptığını söylersin.",
  outcomes: [
    "Prizmanın hacmi üç uzunluğun çarpımıdır.",
    "Küpte üç kenar eşittir.",
    "Alan ile hacmin birimi farklıdır.",
  ],
  scene: "prism",
  parentNote:
    "Çocuğunuz 4, 3 ve 2 santimetrelik kutunun hacmini 24 santimetre küp diye hesaplar. 4 çarpı 3 yalnız taban alanıdır. Evde küp şeker saymak yeter.",

};

export const JUNIOR_MAT_24 = juniorLessonFromScenario(JUNIOR_MAT_24_SCENARIO);
