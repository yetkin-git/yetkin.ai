import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Komşu, tümler, bütünler ve ters açılar. */
export const JUNIOR_MAT_20_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-20",
  title: "Komşu, tümler, bütünler ve ters açılar",
  teaser:
    "Tümler açılar toplamı 90 derecedir. Bütünler açılar toplamı 180 derecedir. Ters açılar, kesişen doğrularda karşılıklı durur ve eşittir. Kavramsal Anlayış, komşu olmayı tümler olmaktan ayırmandır. İfade Gücü, 30 derecenin tümlerini ve bütünlerini ayrı söylemektir.",
  welcome:
    "Merhaba! Matematik dünyasına hoş geldin, bugün geometri dünyasındaki açı komşuluklarını inceliyoruz. Hiç açılan bir kapının köşesine veya makasın kollarına bakıp oluşan açıları inceledin mi? Bazı açılar birbirini 90 dereceye, bazıları ise 180 dereceye tamamlar. Bugün seninle komşu, tümler, bütünler ve ters açıları adım adım öğreneceğiz.",
  concept:
    "Komşu açılar, birer ışınını ortak paylaşan ve yan yana duran açılardır. Ölçüleri toplamı 90 derece olan iki açıya tümler açılar denir. Ölçüleri toplamı 180 derece olan iki açıya ise bütünler açılar denir. İki doğru birbiriyle kesiştiğinde karşılıklı oluşan açılara ters açılar denir ve ters açıların ölçüleri birbirine daima eşittir. Şurası aklında kalsın tamam mı: Komşu olmak tek başına tümler veya bütünler olmayı gerektirmez; toplamları 90 ise tümler, 180 ise bütünler olurlar.",
  example:
    "30 derecelik bir açı düşünelim. Bu açının tümleri 90 eksi 30'dan 60 derecedir; bütünleri ise 180 eksi 30'dan 150 derecedir. Yani 30 ile 60 tümler, 30 ile 150 bütünlerdir. Şimdi kesişen iki doğruya bakalım: Açılardan biri 40 derece ise, onun tam karşısındaki ters açı da 40 derecedir. Yanında duran komşu açı ise doğru çizgiyi tamamladığı için 180 eksi 40'tan 140 derece olur. 40 ile 140 yan yana gelerek doğru bir açı meydana getirir.",
  hint: "gold",
  warning:
    "Altın İpucu! 30 derecelik açının tümlerini sorulduğunda 150 sanmak çok yaygın bir yanılgıdır. 150 derece 180'i tamamlar, yani bütünlerdir; tümler ise 90'ı tamamlar ve 60 derecedir. Ters açı da yanındaki açı değil, tam karşındaki açıdır ve ölçü olarak eşittir.",
  life:
    "Bunu saatin kollarında da kullanırsın. Kollar tam dik durduğunda 90 derecelik bir açı görürsün. O açının tümleri kendisiyle birlikte 90'ı dolduran parçadır. Kapı düz bir çizgide açılırsa kanat ile duvar 180 dereceye varır. Yarım açık kapı ile düz çizgi arasındaki fark, bütünlerin aradığı derecedir.",
  recap: [
    "Tümler açıların toplamı 90 derecedir. Bütünler açıların toplamı 180 derecedir.",
    "Ters açılar kesişen doğrularda karşılıklıdır ve birbirine eşittir.",
    "30 derecenin tümleri 60, bütünleri 150 derecedir.",
  ],
  conceptSeal: "Açı ilişkisi, toplamın 90 mı 180 mi olduğuna ve konumun karşılıklı olup olmadığına bakar.",
  voiceSeal: "30 derece için tümler ve bütünleri ayrı cümleyle söylersin.",
  outcomes: [
    "Tümler açıların toplamı 90 derecedir.",
    "Bütünler açıların toplamı 180 derecedir.",
    "Ters açılar eşittir.",
  ],
  scene: "angles",
  parentNote:
    "Çocuğunuz 30 derecenin tümlerinin 60, bütünlerinin 150 derece olduğunu anlatır. Ters açılar eşittir. Evde kapı ve saat örneği yeter.",

};

export const JUNIOR_MAT_20 = juniorLessonFromScenario(JUNIOR_MAT_20_SCENARIO);
