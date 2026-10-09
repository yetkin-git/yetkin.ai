import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Dört işlemde işlem önceliği. */
export const JUNIOR_MAT_2_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-2",
  title: "İşlem önceliği",
  teaser:
    "Parantez önce yapılır. Sonra üs, sonra çarpma ve bölme, en sonda toplama ve çıkarma gelir. Kavramsal Anlayış, sırayı soldan sağa bozmadan kurmandır. İfade Gücü, aynı ifadenin neden 14 ettiğini adım adım söylemektir.",
  welcome:
    "Hoş geldin! Hazırsan bugün zihnimizi harika bir matematik yolculuğuna çıkarıyoruz, çünkü bugün karşımıza çıkan işlemleri doğru bir sıraya koyacağız. Hiç bir alışveriş fişinde hem çarpma hem toplama gördün mü? Hangi işi önce yapacağını bilirsen sonuç asla şaşmaz. Dört işlemi birbirine karıştırmadan, adım adım ve güvenle çözeceğiz.",
  concept:
    "İşlem önceliği, bir matematiksel ifadede hangi işlemin daha önce yapılacağını belirler. İlk olarak parantezin içi tamamlanır. Parantez yoksa sıradaki adım üslü ifadedir. Ardından çarpma ve bölme işlemleri soldan sağa doğru sırayla yapılır. En sonda ise toplama ve çıkarma, yine soldan sağa doğru tamamlanır. Şurası aklında kalsın tamam mı: Çarpma, toplamanın önüne geçer. Aynı seviyedeki iki işlemden solda olanı önce gelir.",
  example:
    "Defterine 3 artı 4 çarpı 2 yaz. Bu ifadede önce çarpma kuralı geçerlidir. 4 çarpı 2, 8 eder; ardından 3 artı 8, 11 eder. Şimdi aynı sayıları parantezle yazalım. Parantez içinde 3 artı 4, ardından çarpı 2. Önce parantez içi 7 eder, sonra 7 çarpı 2, 14 eder. Gördüğün gibi aynı sayılar, farklı işlem sırasıyla farklı sonuca ulaştı. Bir de 20 eksi 6 bölü 2 işlemine bakalım. Önce 6 bölü 2, 3 eder; 20 eksi 3 ise 17 eder. Bölmeyi sona bırakırsan yanlış yaparsın.",
  hint: "trap",
  warning:
    "İfadeyi soldan sağa hiç duraksamadan düz bir sıra gibi yapmak en yaygın tuzaktır. Örneğin 3 artı 4 çarpı 2 ifadesinde, önce 3 ile 4'ü toplayıp 7 yazarsan sonuç kayar. Çarpma, toplamanın her zaman önündedir. Bir parantez gördüğünde önce onun içini bitir, sonra üsse ve çarpmaya geç.",
  life:
    "Bunu markette de kullanırsın. İki kalem 4 lira ve bir silgi 3 liraysa 3 artı 4 çarpı 2 ifadesi iki kalemin tutarına silgiyi ekler. Önce kalemleri çarparsın. 8 lira kalem, 3 lira silgi, toplam 11 liradır. Kasadaki sıra da aynı kuraldır.",
  recap: [
    "Önce parantez, sonra üs, sonra çarpma ve bölme, en sonda toplama ve çıkarma yapılır.",
    "Çarpma ve bölme soldan sağa gider. Toplama ve çıkarma da soldan sağa gider.",
    "3 artı 4 çarpı 2, 11 eder. Parantez 3 artı 4'ü sararsa sonuç 14 olur.",
  ],
  conceptSeal: "İşlem önceliği, aynı ifadenin tek bir doğru sonucunu seçer.",
  voiceSeal: "Önce hangi işi yaptığını ve neden o sırayı seçtiğini söylersin.",
  outcomes: [
    "Parantez, üsten önce yapılır.",
    "Çarpma ve bölme, toplama ve çıkarmadan önce gelir.",
    "Aynı seviyedeki işlemler soldan sağa yapılır.",
  ],
  scene: "ops-order",
  parentNote:
    "Çocuğunuz işlem önceliğini parantez, üs, çarpma ve bölme, toplama ve çıkarma sırasıyla anlatır. Evde 3 artı 4 çarpı 2 ifadesini önce çarpıp 11 bulmak yeter. Parantez sonucu 14'e çevirir.",

};

export const JUNIOR_MAT_2 = juniorLessonFromScenario(JUNIOR_MAT_2_SCENARIO);
