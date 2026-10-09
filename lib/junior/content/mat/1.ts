import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik, 1. hafta. Doğal sayılarda tekrarlı çarpım ve üslü ifade. */
export const JUNIOR_MAT_1_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-1",
  title: "Üslü ifadede taban ve üs",
  teaser:
    "Üslü ifade, aynı doğal sayının üst üste çarpımıdır. Taban çarpılan sayıdır. Üs, kaç kez çarpıldığını söyler. Kavramsal Anlayış, tabanı üsten ayırır. İfade Gücü, 2 üssü 3 ifadesini kendi sözlerinle kurmandır.",
  welcome:
    "Merhaba güzel arkadaşım, odanda 2'şerli Lego'lardan 3 kat kule yaptığında aslında matematiksel bir üslü ifade oluşturursun. Aynı sayıyı üst üste çarptığında kısa yazmanın adı budur. Bu kuledeki her kat, bir çarpımı saklar. Bugün seninle o gizli matematiği sakin sakin açacağız. Hazırsan önce sahneyi kuracağız, sonra parçaları bir kez net söyleyeceğiz, en sonda özet kartıyla kapatacağız.",
  concept:
    "Üslü ifade, aynı sayının kendisiyle tekrarlı çarpımıdır. Taban hangi sayının çarpılacağını, üs ise kaç kez çarpılacağını söyler. Alttaki büyük sayı tabandır; üstte küçük yazılan sayı üstür. Bu iki parçayı yerinden tanırsan işlem kendiliğinden açılır.",
  example:
    "2 üssü 3 yazınca taban 2, üs 3 olur. Önce 2 çarpı 2, 4 eder; 4 çarpı 2 ise 8 eder. Yani 2 çarpı 2 çarpı 2, 8 sonucunu verir. 10 üssü 2 ise 10 çarpı 10, yani 100 eder. 5 üssü 1 yazarsan taban bir kez durur, sonuç 5'tir; üs 1 olunca sayı değişmez. Her örnekte önce tabanı, sonra üssü söyle, en sonda çarpımı kur.",
  hint: "trap",
  warning:
    "2 üssü 3 ifadesini 2 çarpı 3 sanmak tuzaktır. 2 çarpı 3, 6 eder; oysa 2 üssü 3, tam 8 eder! Üs, tek başına çarpan gibi durmaz; tabanı üs kadar yan yana çarparsın. Üstteki küçük sayıyı görünce dur, nefes al, tane tane çarp.",
  life:
    "Kendi odanda Lego'larla bir kule yaptığını düşün. İlk kata 2 Lego koyuyorsun. Her Lego'nun üzerine 2'şer tane daha ekleyerek 3 kat boyunca katlıyorsun; bu 2 üssü 3 demektir. İşte o Lego kulesinde toplam 2 çarpı 2 çarpı 2, yani 8 blok vardır! Kuleyi gözünde kat kat çıkar; her kat aynı sayıyı çoğaltır. Merak burada başlar.",
  recap: [
    "Üslü ifade, aynı sayının kendisiyle tekrarlı çarpımıdır.",
    "Üs (kuvvet), tabanın kaç kez yan yana çarpılacağını gösterir.",
    "Örneğin 2 üssü 3 ifadesi; 3 adet 2'nin çarpımı olan 2 çarpı 2 çarpı 2, 8 sonucunu verir.",
  ],
  conceptSeal: "Üslü ifade, aynı sayının kendisiyle tekrarlı çarpımıdır.",
  voiceSeal: "Tabanı ve üssü ayrı söyleyip çarpımı adım adım kurarsın.",
  echoPrompt:
    "Şimdi 'üs' kavramının ne anlama geldiğini kendi cümlenle tek bir cümleyle söyle.",
  outcomes: [
    "Üslü ifade, aynı sayının kendisiyle tekrarlı çarpımıdır.",
    "Üs (kuvvet), tabanın kaç kez yan yana çarpılacağını gösterir.",
    "2 üssü 3, 2 çarpı 2 çarpı 2 demektir ve 8 eder.",
    "2 üssü 3 ile 2 çarpı 3 aynı sonuç değildir.",
  ],
  scene: "exponent",
  parentNote:
    "Çocuğunuz bu konuda üslü ifadeyi tekrarlı çarpım olarak anlatır. Taban alttaki sayıdır. Üs (kuvvet), tabanın kaç kez yan yana çarpılacağını gösterir. Evde 2 üssü 3 ifadesini 2 çarpı 2 çarpı 2 diye açmak yeter. Bunu 2 çarpı 3 ile karıştırmayın. Sonuç 8 dir, 6 değil. Odadaki Lego kulesi (2 üssü 3 = 8 blok) iyi bir ev örneğidir.",

};

export const JUNIOR_MAT_1 = juniorLessonFromScenario(JUNIOR_MAT_1_SCENARIO);
