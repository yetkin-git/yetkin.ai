import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Asal sayılar ve asal çarpanlar. */
export const JUNIOR_MAT_6_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-6",
  title: "Asal sayılar ve asal çarpanlar",
  teaser:
    "Asal sayı, 1'den ve kendisinden başka çarpanı olmayan 1'den büyük doğal sayıdır. Kavramsal Anlayış, 1'in asal olmadığını ve 2'nin tek çift asal olduğunu ayırmandır. İfade Gücü, 12'yi asal çarpanların çarpımı olarak yazmandır.",
  welcome:
    "Merhaba güzel arkadaşım, hiç bir sayıyı daha küçük parçalara ayırırken en dipte hangi asal yapı taşlarının kaldığını düşündün mü? Bazı sayılar vardır ki, sadece 1'e ve kendisine bölünür. Bugün seninle asal sayıları ve bir sayıyı asal çarpanlarına ayırmayı adım adım öğreneceğiz.",
  concept:
    "Asal sayı; 1'den büyük olan, sadece 1'e ve kendisine kalansız bölünebilen doğal sayıdır. Örneğin 2, 3, 5 ve 7 birer asal sayıdır. 4 sayısı asal değildir, çünkü 2'ye de bölünür. 1 sayısı ise asla asal kabul edilmez; çünkü asal sayıların 1'den büyük olma şartı vardır. Şurası aklında kalsın tamam mı: Her bileşik sayı, asal sayıların çarpımı olarak yazılabilir. Ayrıca 2, asal sayılar içindeki tek çift sayıdır.",
  example:
    "12 sayısını asal çarpanlarına ayıralım. 12, 2 çarpı 6'dır. 6 ise 2 çarpı 3'tür. 3 zaten asaldır. O hâlde 12 sayısı, 2 çarpı 2 çarpı 3 şeklinde yazılır. Bunu 2 üssü 2 çarpı 3 olarak da kısaltabilirsin. Şimdi 7'ye bakalım: 7 sayısı 2'ye, 3'e veya 5'e bölünmez. Çarpanları sadece 1 ve 7'dir; yani 7 asaldır. 9 ise 3 çarpı 3 olduğu için asal değildir. 1'i ise asal listesine asla yazma, çünkü 1'in iki farklı pozitif böleni yoktur.",
  hint: "trap",
  warning:
    "1 sayısını asal sanmak en yaygın tuzaklardan biridir. Unutma; asal sayılar mutlaka 1'den büyük olmak zorundadır. Bir de her tek sayıyı asal sanma; 9 tek bir sayıdır ama 3 çarpı 3 olduğu için asal değildir. Öte yandan 2 çift olduğu hâlde asal olan tek sayıdır; onu asal listesinden sakın çıkarma.",
  life:
    "Bunu takım kurarken de kullanırsın. 7 kişilik bir grup eşit takımlara yalnız 1'erli ya da 7'li ayrılır. Ara bir pay yoktur. 12 kişilik grup ise 2'li ve 3'lü takımlara ayrılır. Asal çarpanlar, takımın hangi eşit parçalara bölüneceğini söyler.",
  recap: [
    "Asal sayı, 1'den büyük ve yalnız 1 ile kendisine bölünen sayıdır.",
    "1 asal değildir. 2 tek çift asal sayıdır. 9 asal değildir.",
    "12, 2 çarpı 2 çarpı 3 olarak asal çarpanlarına ayrılır.",
  ],
  conceptSeal: "Asal çarpan, sayıyı daha küçük asalların çarpımına indirir.",
  voiceSeal: "1'in neden asal olmadığını ve 12'nin çarpımını kendi sözlerinle söylersin.",
  outcomes: [
    "Asal sayının çarpanı yalnız 1 ve kendisidir.",
    "1 asal sayı değildir.",
    "Bileşik sayı asal çarpanların çarpımıdır.",
  ],
  scene: "number-ops",
  parentNote:
    "Çocuğunuz 2, 3, 5 ve 7'nin asal olduğunu, 1'in ve 9'un asal olmadığını anlatır. Evde 12'yi 2 çarpı 2 çarpı 3 diye ayırmak yeter.",

};

export const JUNIOR_MAT_6 = juniorLessonFromScenario(JUNIOR_MAT_6_SCENARIO);
