import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Alan ölçü birimleri ve arazi ölçüsü. */
export const JUNIOR_MAT_22_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-22",
  title: "Alan ölçü birimleri ve arazi",
  teaser:
    "Alan birimi, bir karenin kapladığı yüzdür. 1 metre kare, kenarı 1 metre olan karedir. Kavramsal Anlayış, birimi iki boyutta çevirdiğini görmendir. İfade Gücü, 1 dönümün kaç metre kare ettiğini söylemektir.",
  welcome:
    "Hoş geldin! Hazırsan bugün zihnimizi harika bir matematik yolculuğuna çıkarıyoruz, çünkü bugün odalardan tarlalara uzanan alan ve arazi ölçülerini keşfedeceğiz. Hiç bir odanın zeminindeki karoları tek tek saymayı denedin mi? Her karo bir alan birimidir ve zemin büyüdükçe birim de büyür. Bugün seninle alan ölçü birimlerini, dönümü ve hektarı öğreneceğiz.",
  concept:
    "Alan, iki boyutlu yüzey ölçüsüdür. 1 metre 100 santimetredir; fakat 1 metrekare, 100 çarpı 100'den tam 10.000 santimetrekaredir! Yani uzunlukta 100 kat olan artış, alanda 10.000 kat olur. Arazi ölçülerinde ise dönüm ve hektar kullanılır. 1 dönüm 1.000 metrekaredir; 1 hektar ise 10.000 metrekaredir. Dolayısıyla 1 hektar, tam 10 dönüme eşittir. Şurası aklında kalsın tamam mı: Uzunluk birimleri onar onar, alan birimleri ise yüzer yüzer büyür ve küçülür.",
  example:
    "Kenar uzunluğu 2 metre olan kare şeklinde bir halı düşünelim. Alanı 2 çarpı 2'den 4 metrekaredir. Bunu santimetrekareye çevirmek istersek, 4 ile 10.000'i çarparız ve 40.000 santimetrekare buluruz. Şimdi de 3 dönümlük bir tarlaya bakalım: 3 ile 1.000'i çarparsak 3.000 metrekare eder. 2 hektarlık büyük bir bahçe ise 20 dönümdür; çünkü her hektarda 10 dönüm yer alır.",
  hint: "gold",
  warning:
    "Altın İpucu! Uzunluk birimi dönüşümünü alan birimlerine olduğu gibi uygulamak büyük bir yanılgıdır. 1 metre 100 santimetredir diye 1 metrekareye 100 santimetrekare diyemezsin! İki kenar da yüzer kat büyüdüğü için 100 çarpı 100'den 10.000 santimetrekare eder. Dönüm ile hektarı da karıştırma; dönüm 1.000, hektar 10.000 metrekaredir.",
  life:
    "Bunu ev planında da kullanırsın. 12 metre karelik bir oda, 12 tane 1 metreye 1 metrelik kare demektir. Bahçedeki 2 dönümlük sebze yeri, 2.000 metre karedir. Marketten aldığımız küçük kumaş ise santimetre kareyle konuşulur. Birimi, ölçtüğün yerin boyuna göre seçersin.",
  recap: [
    "1 metre kare, 10.000 santimetre karedir. Dönüşüm iki boyutta yapılır.",
    "1 dönüm 1.000 metre karedir. 1 hektar 10.000 metre karedir.",
    "2 hektar 20 dönümdür. 3 dönüm 3.000 metre karedir.",
  ],
  conceptSeal: "Alan dönüşümü, uzunluk dönüşümünün karesi kadar büyür.",
  voiceSeal: "Metre kare ile dönümü hangi sayıyla çevirdiğini söylersin.",
  outcomes: [
    "1 metre kare 10.000 santimetre karedir.",
    "1 dönüm 1.000 metre karedir.",
    "1 hektar 10 dönümdür.",
  ],
  scene: "area",
  parentNote:
    "Çocuğunuz 1 metre karenın 10.000 santimetre kare, 1 dönümün 1.000 metre kare olduğunu anlatır. 1 metre 100 santimetredir diye alanı 100 ile çarpmayın.",

};

export const JUNIOR_MAT_22 = juniorLessonFromScenario(JUNIOR_MAT_22_SCENARIO);
