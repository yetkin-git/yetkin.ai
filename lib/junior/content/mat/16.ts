import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Oran. */
export const JUNIOR_MAT_16_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-16",
  title: "Oran",
  teaser:
    "Oran, iki çokluğun birbirine göre karşılaştırmasıdır. 2'nin 3'e oranı, 2 bölü 3 diye yazılır. Kavramsal Anlayış, aynı oranın sadeleşince değişmediğini görmendir. İfade Gücü, 4'e 6 ile 2'ye 3'ün aynı oran olduğunu söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç lezzetli bir şerbet hazırlarken iki ölçek şeker ile üç ölçek suyu karıştırdın mı? Şeker ile su arasındaki bu uyumlu ilişki bir orandır. Bugün seninle oran kavramını öğrenecek, oranları sadeleştirip denk oranlar kuracağız.",
  concept:
    "Oran, birinci çokluğun ikinci çokluğa bölünerek karşılaştırılmasıdır. 2'nin 3'e oranı; 2 bölü 3 veya 2'ye 3 şeklinde okunur. Oranda sıra kesinlikle değişmez; çünkü 3'ün 2'ye oranı bambaşka bir durumdur. Şurası aklında kalsın tamam mı: Payı ve paydayı aynı sayıyla çarpar veya bölersen oran değişmez; buna denk oran denir.",
  example:
    "Bir kasede 4 kırmızı ve 6 mavi bilye olsun. Kırmızı bilyelerin mavi bilyelere oranı 4'e 6'dır. 4 bölü 6 kesrini 2 ile sadeleştirirsek 2 bölü 3 elde ederiz; yani her 2 kırmızı bilyeye tam 3 mavi bilye düşer. Mavi bilyelerin kırmızı bilyelere oranı ise 6'ya 4'tür, sadeleşince 3'e 2 olur. 10 kız ve 15 erkek öğrencinin bulunduğu bir sınıfta kızların erkeklere oranı da 10'a 15'tir; 5 ile sadeleşince yine 2'ye 3 olur ve aynı oranı verir.",
  hint: "gold",
  warning:
    "Altın İpucu! Oranın sırasını ters çevirmek en yaygın tuzaktır. 2'ye 3 oranı ile 3'e 2 oranı aynı şey değildir! Cümlede ilk söylenen çokluk her zaman paya, ikinci söylenen çokluk ise paydaya yazılır. Hangi çokluğun hangisine oranlandığını dikkatle oku.",
  life:
    "Bunu meyve suyu karışımında da kullanırsın. 2 bardak meyve özü ve 3 bardak su, 2'ye 3 orandır. İki kat tarif 4 bardak öz ve 6 bardak su ister. Oran yine 2'ye 3 kalır. Özün miktarını suyun yerine yazarsan tat değişir. Sıra, tarifin kendisidir. Bardağı büyütmek oranı bozmaz, yalnız miktarı büyütür.",
  recap: [
    "Oran, iki çokluğu sırayla karşılaştırır. 2'ye 3, 3'e 2 değildir.",
    "Pay ve paydayı aynı sayıyla bölmek oranı değiştirmez.",
    "4'e 6, sadeleşince 2'ye 3 olur. 10'a 15 de aynı orandır.",
  ],
  conceptSeal: "Oran, sırası belli bir karşılaştırmadır.",
  voiceSeal: "Hangi çokluğun hangisine oranlandığını ve sade hâli söylersin.",
  outcomes: [
    "Oran, birinci çokluğun ikinciye göre hâlidir.",
    "Sıra değişirse oran değişir.",
    "Denk oran, aynı sayıyla genişler veya sadeleşir.",
  ],
  scene: "ratio",
  parentNote:
    "Çocuğunuz 4 kırmızı ve 6 mavi bilyede kırmızının maviye oranının 2'ye 3 olduğunu anlatır. 3'e 2 bu oranın tersidir. Evde 2 bardak öz ve 3 bardak su yeter.",

};

export const JUNIOR_MAT_16 = juniorLessonFromScenario(JUNIOR_MAT_16_SCENARIO);
