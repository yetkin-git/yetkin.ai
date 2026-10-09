import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Kesirlerde çarpma ve bölme. */
export const JUNIOR_MAT_13_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-13",
  title: "Kesirlerde çarpma ve bölme",
  teaser:
    "Kesirde çarpma, payları kendi arasında ve paydaları kendi arasında çarpar. Bölme, ikinci kesrin ters çevrilip çarpılmasıdır. Kavramsal Anlayış, yarının yarısının dörtte bir olduğunu görmendir. İfade Gücü, bölmeyi çarpmaya nasıl çevirdiğini söylemektir.",
  welcome:
    "Selamlar! Bugün seninle çok keyifli bir konuyu keşfedeceğiz, çünkü kesirlerle çarpma ve bölmenin mantığını adım adım kavrayacağız. Hiç bir çikolatanın yarısını alıp o yarımın da yarısını bir arkadaşına verdin mi? Elinde bütün çikolatanın dörtte biri kalır. Bugün seninle kesirlerde çarpma ve bölmeyi en pratik ve kalıcı şekilde öğreneceğiz.",
  concept:
    "İki kesir çarpılırken paylar kendi arasında çarpılıp paya, paydalar kendi arasında çarpılıp paydaya yazılır; payda eşitlemeye hiç gerek yoktur! Bölme işleminde ise ikinci kesir ters çevrilir; yani pay ile paydanın yeri değiştirilir ve işlem çarpmaya dönüştürülür. Şurası aklında kalsın tamam mı: Bir kesri 1'den küçük bir kesirle çarptığında elde ettiğin sonuç küçülür. Yarının yarısı, dörtte birdir.",
  example:
    "Bir bölü 2 çarpı bir bölü 2 işlemine bakalım. Paylar 1 çarpı 1, 1 eder; paydalar 2 çarpı 2, 4 eder; sonuç dörtte birdir. Üç bölü 4 ile 2 tam sayısını çarpalım. 2 sayısı iki bölü 1 olarak yazılır; paylar 3 çarpı 2'den 6, paydalar 4 çarpı 1'den 4 eder; sadeleşince üç bölü 2 olur. Şimdi bölme yapalım: Bir bölü 2 bölü bir bölü 4. İkinci kesir olan bir bölü 4'ü ters çevirirsek dört bölü 1 olur. Bir bölü 2 çarpı dört bölü 1 işleminden sonuç 2 çıkar. Çünkü bir yarımın içinde tam iki tane çeyrek vardır.",
  hint: "trap",
  warning:
    "Tuzaklara Düşme! Bölme işleminde ikinci kesri ters çevirmeden çarpmak en sık yapılan hatadır. Bir bölü 2 bölü bir bölü 4 işlemi asla bir bölü 8 etmez! İkinci kesir ters dönünce 4 olur ve yarım çarpı 4, 2 eder. Çarpma işleminde ise sakın payda eşitlemeye kalkışma; payı payla, paydayı paydayla çarp.",
  life:
    "Bunu mutfakta da kullanırsın. Yarım limonun yarısını sıkarsan bütün limonun dörtte birini kullanmış olursun. Bir bölü 2 çarpı bir bölü 2, dörtte birdir. Yarım litre sütü çeyrek litrelik bardaklara bölersen 2 bardak dolar. Bölme, kaç çeyrek sığdığını söyler.",
  recap: [
    "Çarpmada paylar kendi arasında, paydalar kendi arasında çarpılır.",
    "Bölmede ikinci kesir ters çevrilir, sonra çarpılır.",
    "Yarının yarısı dörtte birdir. Yarım bölü çeyrek, 2 eder.",
  ],
  conceptSeal: "Kesirde çarpma alanı daraltır. Bölme, ters kesirle çarpmaya döner.",
  voiceSeal: "Çarpmada pay ve paydayı, bölmede ters çevirmeyi ayrı söylersin.",
  outcomes: [
    "Kesir çarpımında paydalar eşitlenmez.",
    "Bölme, ikinci kesrin tersiyle çarpılır.",
    "Bir bölü 2 çarpı bir bölü 2, dörtte birdir.",
  ],
  scene: "fraction",
  parentNote:
    "Çocuğunuz yarının yarısının dörtte bir olduğunu ve yarım bölü çeyreğin 2 ettiğini anlatır. Bölmede ikinci kesir ters çevrilir. Evde limon örneği yeter.",

};

export const JUNIOR_MAT_13 = juniorLessonFromScenario(JUNIOR_MAT_13_SCENARIO);
