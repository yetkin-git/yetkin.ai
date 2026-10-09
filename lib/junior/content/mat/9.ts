import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Tam sayılar ve mutlak değer. */
export const JUNIOR_MAT_9_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-9",
  title: "Tam sayılar ve mutlak değer",
  teaser:
    "Tam sayılar, doğal sayılara negatiflerin ve sıfırın katılmasıyla oluşur. Mutlak değer, sayının sıfıra uzaklığıdır. Kavramsal Anlayış, eksi 3 ile artı 3'ün aynı uzaklığa sahip olduğunu görmendir. İfade Gücü, sayı doğrusunda yönü ve uzaklığı ayrı söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün önümüzde ne var, birlikte keşfedelim. Hiç bir binanın asansöründe zemin katın altına, yani bodruma indin mi? Zemin kat sıfırdır; yukarı çıkarken sayılar artı, aşağı indikçe ise eksi olur. Bugün seninle tam sayıları ve sıfıra olan uzaklığı anlatan mutlak değeri öğreneceğiz.",
  concept:
    "Tam sayılar; negatif tam sayılar, sıfır sayısı ve pozitif tam sayıların bir araya gelmesiyle oluşur. Sayı doğrusunda sol taraf eksi, sağ taraf ise artı yöndür. Sayı doğrusunda daha sağda duran her sayı diğerinden büyüktür. Mutlak değer ise bir sayının sıfıra olan mesafesidir ve uzaklık hiçbir zaman eksi olamaz. Şurası aklında kalsın tamam mı: Eksi 3 sayısı artı 3'ten küçüktür; fakat ikisinin de sıfıra uzaklığı, yani mutlak değeri 3'tür. Eksi işareti yönü belirtir, uzaklığı silmez.",
  example:
    "Sayı doğrusunda eksi 4, eksi 1, 0 ve artı 2 noktalarını işaretleyelim. En solda eksi 4, en sağda ise artı 2 durur. Sıralama eksi 4, eksi 1, 0 ve artı 2 şeklindedir. Eksi 4'ün mutlak değeri 4'tür; artı 2'nin mutlak değeri ise 2'dir. Eksi 4, sıfıra daha uzaktadır. Şimdi borç hesabını düşün: Cebinde 5 lira varken 3 lira borcun varsa, 5 artı eksi 3 işleminden geriye 2 lira kalır. Mutlak değer işlem değil, sadece sıfıra olan net mesafedir.",
  hint: "gold",
  warning:
    "Altın İpucu! Eksi bir sayının mutlak değerini de eksi sanmak çok yaygın bir tuzaktır. Eksi 4 sayısının mutlak değeri asla eksi 4 olmaz; çünkü bir noktaya olan uzaklık pozitif söylenir, yani 4'tür. Ayrıca sayı doğrusunda sağdaki sayı her zaman daha büyüktür: Eksi 1 sayısı, eksi 4'ten büyüktür çünkü daha sağda yer alır.",
  life:
    "Bunu hava durumunda da kullanırsın. Gece eksi 2 derece, gündüz artı 5 derece olabilir. Gündüz daha sıcaktır çünkü artı 5, eksi 2'nin sağındadır. Eksi 2'nin mutlak değeri 2'dir. Bu, don noktasından 2 derece uzakta olduğunu söyler. Yönü ise eksi işaret söyler.",
  recap: [
    "Tam sayılar negatifleri, sıfırı ve pozitifleri kapsar. Sağdaki sayı daha büyüktür.",
    "Mutlak değer, sayının 0'a uzaklığıdır ve eksi olmaz.",
    "Eksi 4, artı 2'den küçüktür. Eksi 4'ün mutlak değeri 4'tür.",
  ],
  conceptSeal: "Mutlak değer uzaklığı söyler. İşaret ise yönü söyler.",
  voiceSeal: "Sayı doğrusunda hangisinin sağda kaldığını ve uzaklığı ayrı söylersin.",
  outcomes: [
    "Negatif tam sayılar 0'ın solundadır.",
    "Sağdaki tam sayı daha büyüktür.",
    "Mutlak değer 0'a uzaklıktır ve eksi çıkmaz.",
  ],
  scene: "number-line",
  parentNote:
    "Çocuğunuz tam sayıyı asansör ve sayı doğrusuyla anlatır. Eksi 4, artı 2'den küçüktür. Eksi 4'ün mutlak değeri 4'tür. Evde 5 artı eksi 3'ün 2 kaldığını konuşmak yeter.",

};

export const JUNIOR_MAT_9 = juniorLessonFromScenario(JUNIOR_MAT_9_SCENARIO);
