import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Cebirsel ifadeler. */
export const JUNIOR_MAT_17_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-17",
  title: "Cebirsel ifadeler",
  teaser:
    "Cebirsel ifade, sayılar ile harflerin işlemli yazılışıdır. Harf, değişebilen bir niceliği tutar. Kavramsal Anlayış, benzer terimi sabit sayıdan ayırmandır. İfade Gücü, 3x artı 2x ifadesini 5x diye kısaltmandır.",
  welcome:
    "Hoş geldin! Hazırsan bugün zihnimizi harika bir matematik yolculuğuna çıkarıyoruz, çünkü bugün sayılarla harfleri bir araya getirip cebir dilini konuşacağız. Hiç bir kutunun içindeki bilye sayısını bilmeden ona bir sembol verip işlem yaptın mı? Harf, o bilinmeyen sayının güvenli bir yer tutucusudur. Bugün seninle cebirsel ifadeleri okuyup benzer terimleri toplamayı öğreneceğiz.",
  concept:
    "Cebirsel ifadede x veya a gibi harfler değişkeni temsil eder. Örneğin 3x demek, x sayısının 3 katı demektir ve buradaki 3 katsayıdır. Eğer harfin önünde sayı yazmıyorsa katsayısı 1'dir. Benzer terimler ise aynı harfi taşıyan terimlerdir; örneğin 3x ile 2x benzer terimdir. 3x ile 5 ise benzer terim değildir, çünkü 5'in yanında harf yoktur. Şurası aklında kalsın tamam mı: Yalnızca benzer terimler birbiriyle toplanabilir; harfli terim ile yalın sayı birbirine asla katılmaz.",
  example:
    "Bir kalemin fiyatı x lira olsun. 3 kalem alırsan 3x lira tutar. 2 kalem daha alırsan 3x artı 2x olur; katsayıları toplarsak 3 artı 2'den sonuç 5x lira yapar. Yanına bir de 4 liralık silgi eklersen toplam tutar 5x artı 4 olur; bu iki ifade birbiriyle toplanıp 9x yapılamaz! x yerine 6 koyarsan: 5 çarpı 6 artı 4'ten sonuç 34 lira çıkar. 2x artı 3x artı 1 ifadesi de 5x artı 1 şeklinde sadeleşir.",
  hint: "trap",
  warning:
    "Tuzaklara Düşme! 3x artı 4 ifadesini toplayıp 7x sanmak en sık düşülen tuzaktır. 4 sayısının yanında x harfi yoktur, bu yüzden katsayıya eklenemez. 3x artı 2x ise 5x olur çünkü ikisi de x harfi taşır. Harfi olmayan sayılar sabit terimdir ve yalnızca diğer sabit terimlerle toplanır.",
  life:
    "Bunu otobüs biletinde de kullanırsın. Bilet x lira ise 4 bilet 4x liradır. Üstüne 10 lira su alırsan ödeme 4x artı 10 olur. Bilet 15 liraysa 4 çarpı 15 artı 10, 70 lira eder. Suyu bilet sayısına katmazsın. Su sabit bir tutardır.",
  recap: [
    "Değişken bir harftir. Katsayı, harfin kaç katı alındığını söyler.",
    "Benzer terimler toplanır. 3x artı 2x, 5x eder.",
    "5x artı 4, 9x değildir. x yerine 6 konursa sonuç 34 olur.",
  ],
  conceptSeal: "Cebirsel ifade, değişken ile sayının birlikte yazılmış hâlidir.",
  voiceSeal: "Benzer terimi neden topladığını ve sabiti neden ayırdığını söylersin.",
  outcomes: [
    "Katsayı, değişkenin kaç katı olduğunu söyler.",
    "Yalnız benzer terimler toplanır.",
    "Değişkenin yerine sayı konunca ifade hesaplanır.",
  ],
  scene: "algebra",
  parentNote:
    "Çocuğunuz 3x artı 2x ifadesini 5x diye toplar. 5x artı 4, 9x yazılmaz. Evde bilet x lira, su 10 lira örneği yeter. x 15 ise sonuç 70 liradır.",

};

export const JUNIOR_MAT_17 = juniorLessonFromScenario(JUNIOR_MAT_17_SCENARIO);
