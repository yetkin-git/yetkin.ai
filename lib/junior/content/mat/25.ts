import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Sıvı ölçme ve litre. */
export const JUNIOR_MAT_25_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-25",
  title: "Sıvı ölçme",
  teaser:
    "Sıvılar litre ve mililitre ile ölçülür. 1 litre, 1.000 mililitredir. 1 desimetre küp de 1 litre eder. Kavramsal Anlayış, kabın hacmi ile içindeki sıvıyı aynı birime bağlamandır. İfade Gücü, 2,5 litrenin kaç mililitre olduğunu söylemektir.",
  welcome:
    "Merhaba! Matematik dünyasına hoş geldin, bugün mutfaktan laboratuvara kadar her yerde karşımıza çıkan sıvı ölçülerini inceliyoruz. Hiç bir sürahiyi bardak bardak suyla doldururken kaç bardak aldığını saydın mı? Suyun kapladığı miktar bir sıvı ölçüsüdür. Bugün seninle litre, mililitre ve kabın hacmi arasındaki güçlü bağı öğreneceğiz.",
  concept:
    "Sıvı ölçüsünün temel birimi litredir. 1 litre, tam 1.000 mililitredir; yani mililitre, litrenin binde biridir. Yarım litre 500 mililitre, çeyrek litre ise 250 mililitredir. Hacim ölçüleriyle sıvı ölçüleri arasında da harika bir köprü vardır: 1 desimetreküp hacmindeki bir kap, tam 1 litre sıvı alır. Şurası aklında kalsın tamam mı: 1.000 santimetreküp de 1 desimetreküp olduğu için yine 1 litreye eşittir. Sıvılar içine konuldukları kabın şeklini alır ama hacimleri birimle söylenir.",
  example:
    "2,5 litre suyu ele alalım: 2 litre 2.000 mililitre, 0,5 litre ise 500 mililitredir; toplamı 2.500 mililitre eder. 750 mililitrelik bir şişe süt, litre cinsinden 750 bölü 1.000'den 0,75 litredir. 2 litrelik bir sürahiye 400 mililitrelik bardaklardan üç tane boşaltırsan; 3 çarpı 400'den 1.200 mililitre, yani 1,2 litre su dolar. Sürahide hâlâ 800 mililitrelik boş yer kalır.",
  hint: "trap",
  warning:
    "Tuzaklara Düşme! 1 litreyi 100 mililitre sanmak çok sık düşülen bir tuzaktır! Metre ile santimetre arasındaki 100 sayısı sıvı ölçülerinde geçerli değildir; sıvılarda basamak biner biner ilerler. 1 litre tam 1.000 mililitredir. 2,5 litreyi de 250 mililitre sanma; virgülden sonraki 5 yarım litredir, yani 2.500 mililitredir.",
  life:
    "Bunu ilaç kaşığında ve matarada da kullanırsın. 5 mililitrelik bir kaşık, 1 litrenin çok küçük bir parçasıdır. 1.000 bölü 5, 200 eder. 1 litreyi bitirmek için 200 kaşık gerekir. Okul mataran 500 mililitreyse yarım litredir. İki matara 1 litre eder. Şişenin üstündeki mililitre yazısını litreye çevirirken 1.000'e bölersin.",
  recap: [
    "1 litre 1.000 mililitredir. Yarım litre 500, çeyrek litre 250 mililitredir.",
    "1 desimetre küp ve 1.000 santimetre küp, 1 litre eder.",
    "2,5 litre 2.500 mililitredir. 750 mililitre 0,75 litredir.",
  ],
  conceptSeal: "Sıvı ölçüsü, kabın iç hacmiyle aynı miktarı başka birimle söyler.",
  voiceSeal: "Litreyi mililitreye 1.000 ile çevirdiğini söylersin.",
  outcomes: [
    "1 litre 1.000 mililitredir.",
    "1 desimetre küp 1 litre eder.",
    "2,5 litre 2.500 mililitredir.",
  ],
  scene: "prism",
  parentNote:
    "Çocuğunuz 1 litrenin 1.000 mililitre ve 1 desimetre küp olduğunu anlatır. 2,5 litre 2.500 mililitredir. Evde yarım litrelik mataranın 500 mililitre olduğunu konuşmak yeter.",

};

export const JUNIOR_MAT_25 = juniorLessonFromScenario(JUNIOR_MAT_25_SCENARIO);
