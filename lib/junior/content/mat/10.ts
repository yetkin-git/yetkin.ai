import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Kesirleri karşılaştırma ve sıralama. */
export const JUNIOR_MAT_10_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-10",
  title: "Kesirleri karşılaştırma ve sıralama",
  teaser:
    "Kesir, bir bütünün eşit parçalarından kaç tanesinin seçildiğini söyler. Kavramsal Anlayış, payda aynıyken paya, pay aynıyken paydaya bakmandır. İfade Gücü, dörtte üç ile üçte birin hangisinin büyük olduğunu gerekçeyle söylemektir.",
  welcome:
    "Merhaba! Matematik dünyasına hoş geldin, bugün kesirlerin dilini çözüyoruz. Hiç bir pastayı eşit dilimlere bölüp kimin daha büyük pay aldığını merak ettin mi? Dilimin boyu aynıysa dilim sayısı çok olan kazanır; dilimin boyutu değiştiğinde ise durum farklılaşır. Bugün seninle kesirleri doğru ve kolay yöntemlerle karşılaştırmayı öğreneceğiz.",
  concept:
    "Kesirde pay, aldığın parça sayısıdır; payda ise bütünün kaç eşit parçaya bölündüğünü gösterir. Eğer paydalar aynıysa, payı büyük olan kesir daha büyüktür. Eğer paylar aynıysa, paydası küçük olan kesir daha büyüktür; çünkü bütün daha az parçaya bölündüğü için dilimler daha büyüktür. Şurası aklında kalsın tamam mı: Birim kesirlerin payı her zaman 1'dir. Payda büyüdükçe parçalar küçülür, dolayısıyla birim kesir de küçülür.",
  example:
    "Dörtte bir, dörtte iki ve dörtte üç kesirlerini yan yana koyalım. Paydaları aynı, yani dörttür; paylar ise 1, 2 ve 3'tür. Küçükten büyüğe sıralarsak: dörtte bir, dörtte iki ve dörtte üç olur. Şimdi de payı 1 olan birim kesirlere bakalım: bir bölü 2, bir bölü 3 ve bir bölü 6. Payda büyüdükçe dilim incelir. En büyük birim kesir yarım, yani bir bölü 2'dir. Dörtte üç ile üçte biri karşılaştırırsak, dörtte üç bütüne daha yakındır ve üçte birden daha büyüktür.",
  hint: "trap",
  warning:
    "Tuzaklara Düşme! Büyük bir payda gördüğünde o kesri hemen büyük sanmak en yaygın tuzaktır. Örneğin altıda bir, üçte birden küçüktür! Paydadaki 6 daha büyüktür ama pastanın daha çok parçaya bölünüp dilimin küçüldüğünü gösterir. Paylar eşitse paydası küçük olanı büyük seç; paydalar eşitse payı büyük olanı seç.",
  life:
    "Bunu su şişesinde de kullanırsın. Şişenin dörtte üçü doluysa üçte biri dolu olan şişeden daha çok su vardır. Yarım şişe, dörtte bir şişeden büyüktür. Aynı boy şişelerde payda aynıysa dolu çizgiye bakman yeter.",
  recap: [
    "Payda aynıysa büyük pay, büyük kesirdir.",
    "Pay aynıysa küçük payda, büyük kesirdir. Birim kesirde payda büyüyünce kesir küçülür.",
    "Dörtte üç, üçte birden büyüktür. Altıda bir, üçte birden küçüktür.",
  ],
  conceptSeal: "Karşılaştırma, dilimin boyunu ve sayısını birlikte okur.",
  voiceSeal: "Hangi kuralı kullandığını ve hangi kesrin büyük olduğunu söylersin.",
  outcomes: [
    "Aynı paydada büyük pay daha büyüktür.",
    "Aynı payda birim kesirde büyük payda daha küçüktür.",
    "Kesirler sayı doğrusunda 0 ile 1 arasına yerleşir.",
  ],
  scene: "fraction",
  parentNote:
    "Çocuğunuz aynı paydada büyük payın, aynı payda birim kesirde küçük paydanın büyük olduğunu anlatır. Evde dörtte üç ile üçte biri karşılaştırmak yeter. Altıda bir, üçte birden küçüktür.",

};

export const JUNIOR_MAT_10 = juniorLessonFromScenario(JUNIOR_MAT_10_SCENARIO);
