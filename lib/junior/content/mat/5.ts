import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";
import {
  MAT_5_CANONICAL_TITLE,
  MAT_5_HERO_FOCUS,
  MAT_5_HERO_QUESTION,
} from "@/lib/junior/pilot-engine/mat-5.choreography";

/**
 * 6. Sınıf Matematik. Çarpan, kat ve bölünebilme kuralları.
 * MEB kazanım M.6.1.2.2 — kurallar: 2, 3, 4, 5, 6, 9, 10 (7 ve 8 kapsam dışı).
 * Mühürlü ders kaydı: kart, kazanım ve `export:junior-content`.
 * Oynatma konuşması burada değildir. Yazar `mat-5.choreography.ts`,
 * mühürlü saat `packages/junior-content/timelines/jr_06_mat-5.timeline.json`.
 * Kapı `resolveJuniorPlayback`: bu ders vektör oynatıcıya düşmez.
 */
export const JUNIOR_MAT_5_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-5",
  title: MAT_5_CANONICAL_TITLE,
  teaser:
    "Çarpan, bir sayıyı kalansız bölen sayıdır. Kat, o sayının katlanarak büyüyen hâlidir. MEB 6. sınıf dedektifleri 2, 3, 4, 5, 6, 9 ve 10 kurallarını dört ekiple şıp diye çözer.",
  /** Ders Notu hero SSOT — sahne/cue cümlesi değil, bütüncül pedagojik soru. */
  heroQuestion: MAT_5_HERO_QUESTION,
  heroFocus: MAT_5_HERO_FOCUS,
  welcome:
    "Merhaba sevgili çocuklar! Ben Matematik öğretmenin Selim. Bugün seninle sayıları hiç işlem yapmadan, tek bakışta çözebilen bölünebilme dedektifleri olacağız. Masadaki şu 12 renkli bilyeye bak!",
  life:
    "Bu 12 bilyeyi kutulara ikişer ikişer dizelim. Bak, tam 6 eşit kutu oldu ve dışarıda hiç bilye artmadı! Üçer üçer dizsek? Yine hiç bilye artmaz, 4 eşit kutu olur. Peki beşer beşer dizmeye çalışırsak ne olur? 2 kutu dolar ama 2 bilye dışarıda artar! İşte bir sayıyı hiç kalan bırakmadan tam bölen sayılara o sayının Çarpanı diyoruz.",
  concept:
    "Çarpan, bir sayıyı kalansız bölen sayıdır; şimdi Çarpan ile Kat farkını 6 sayısıyla yan yana görelim. 6'yı kalansız bölen sayılar hangileri? 1, 2, 3 ve 6. Bunlar 6'nın içindeki küçük parçalardır, yani 6'nın çarpanlarıdır. Peki 6'yı birer, ikişer, üçer katlayarak yukarı doğru büyütürsek? 6, 12, 18, 24 diye yükselen bu kuledeki sayılara ise 6'nın Katları deriz. Unutma: Çarpan böler ve küçültür, kat ise çarpar ve büyütür! İlk ekibimiz Son Basamak Dedektifleri: 2, 5 ve 10 kuralları! Bu üç kuralda sayının tamamına değil, büyüteçle sadece en sağdaki birler basamağına bakarız. İkinci ekibimiz Son İki Basamak Dedektifi: 4 kuralı; burada son iki basamağa bakarız — 00 veya 4'ün katı olmalı. Üçüncü ekibimiz Rakam Toplamı Dedektifleri: 3 ve 9 kurallarıdır; bütün basamaklardaki rakamları toplarız. Dördüncü ekibimiz Çifte Koşul Dedektifi: 6 kuralı; sayı hem 2'ye hem 3'e bölünüyorsa 6'ya da bölünür.",
  example:
    "24 sayısına bakalım: Son rakamı 4, yani çift! O halde 24 sayısı 2'ye tam bölünür. Şimdi 5 kuralı için 15 sayısını inceleyelim. Son rakamı 0 veya 5 olan her sayı 5'e tam bölünür. 15'in son rakamı 5 olduğu için 5'e tam bölünür! Peki 15 sayısı 2'ye bölünür mü? Hayır, çünkü 5 tek sayıdır! 10 kuralı ise en kolayı! Bir sayının son rakamı 0 ise 10'a tam bölünür. Bak, 30 sayısının sonu 0. Sıfır hem çift sayıdır, hem 5 kuralına uyar, hem de 10 kuralına! Yani 30 sayısı 2'ye, 5'e ve 10'a aynı anda tam bölünür! 4 kuralı için 116'ya bakalım: Son iki basamak 16; 16, 4'ün katıdır, o halde 116 sayısı 4'e tam bölünür! 24 sayısına geri dönelim: 2 artı 4 eşittir 6 eder. 6 sayısı 3'ün katı olduğu için 24 de 3'e tam bölünür! 9 kuralı da 3 kuralının ağabeyidir: Rakamları topladığımızda sonuç 9 veya 9'un katıysa sayı 9'a tam bölünür. Örneğin 18 sayısında 1 artı 8 eşittir 9 eder! Toplam 9 olduğu için 18 sayısı hem 9'a hem de 3'e kalansız bölünür. 6 kuralı için yine 24: çifttir yani 2'ye bölünür, rakam toplamı 6 olduğu için 3'e de bölünür — hem 2 hem 3 sağlandığı için 24, 6'ya da tam bölünür!",
  hint: "gold",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. 2, 5 ve 10 için sadece son rakama bak; 4 için son iki basamağa bak; 3 ve 9 içinse son rakama aldanma, mutlaka bütün rakamları topla; 6 için hem 2 hem 3 kuralını birlikte ara! Örneğin 14'ün sonu çifttir ama rakamları toplamı 5 olduğu için 3'e bölünmez. Çarpan ile katı da birbiriyle karıştırma. 3 sayısı 12'nin çarpanıdır; 12 sayısı ise 3'ün katıdır.",
  recap: [
    "Çarpan, sayıyı kalansız böler; 6'yı bölen 1, 2, 3 ve 6 çarpanlarıdır, 6, 12, 18 ve 24 ise katlarıdır.",
    "2, 5 ve 10 için son rakama bakılır: 24 sayısı 2'ye, 15 sayısı 5'e, 30 sayısı ise hem 2'ye hem 5'e hem 10'a bölünür. 4 için son iki basamağa bakılır.",
    "3 ve 9 için rakamlar toplanır; 2 artı 4 eşittir 6 olduğu için 24, 2'ye ve 3'e bölünür, 18 ise 9'a bölünür. 6 için hem 2 hem 3 kuralı birlikte aranır.",
  ],
  conceptSeal:
    "Bugün çarpanın kalansız bölen, katın ise katlanarak büyüyen sayı olduğunu ve 7 dedektif kuralımızı (2, 3, 4, 5, 6, 9, 10) öğrendik.",
  voiceSeal: "24 ve 30 sayılarının hangi kurallara uyduğunu kendi cümlenle anlatırsın.",
  echoPrompt: "24 ve 30 sayılarının hangi kurallara uyduğunu kendi cümlenle anlat!",
  outcomes: [
    "Son Basamak Dedektifleri (2, 5, 10): Birler basamağına bak!",
    "Son İki Basamak Dedektifi (4): Son iki basamak 00 veya 4'ün katı!",
    "Rakam Toplamı Dedektifleri (3, 9): Rakamları topla, kata bak!",
    "Çifte Koşul Dedektifi (6): Hem 2'ye hem 3'e bölünen çift sayılar!",
  ],
  scene: "number-ops",
  parentNote:
    "Çocuğunuz 12 bilye örneğiyle çarpanı, 6'nın çarpanları ve katlarını, ayrıca MEB 6. sınıf kuralları 2, 3, 4, 5, 6, 9 ve 10 üzerinden bölünebilmeyi dört dedektif ekibiyle anlatır.",
};

export const JUNIOR_MAT_5 = juniorLessonFromScenario(JUNIOR_MAT_5_SCENARIO);
