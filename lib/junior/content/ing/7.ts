import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 4 Weather and Emotions. Hava. */
export const JUNIOR_ING_MAIN_7_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-7",
  title: "Sunny, rainy ve cold",
  teaser:
    "Hava It is sunny, It is rainy ve It is cold ile söylenir. Soru What's the weather like diye kurulur. Kavramsal Anlayış, hava adını sıfata çevirir. İfade Gücü, penceredeki havayı bir cümlede anlatmandır.",
  welcome:
    "Hoş geldin! Hazırsan bugün İngilizcenin ve eğlenceli kelimelerin dünyasına adım atıyoruz, çünkü sabah uyandığında ilk baktığın yere, yani gökyüzüne çeviriyoruz gözlerimizi! Sabah perdeyi araladığında pırıl pırıl parlayan bir güneş varsa günün enerjisi apayrı olur; camı tıklatan yağmur damlaları gördüğünde ise hemen montunu ve şemsiyeni hazırlarsın. Bugün seninle havanın nasıl olduğunu İngilizce ifade etmeyi, 'It is sunny', 'It is rainy' ve 'It is cold' gibi güzel hava sıfatlarını kullanmayı ve 'What is the weather like?' sorusuyla havayı merak etmeyi öğreneceğiz.",
  concept:
    "İngilizcede hava durumunu söylerken cümleye daima 'It is' ile başlarız ve arkasından hava durumunu anlatan bir sıfat getiririz. Örneğin 'It is sunny' hava güneşlidir, 'It is rainy' hava yağmurludur, 'It is cold' ise hava soğuktur demektir. Hava sıcak olduğunda 'It is hot', rüzgâr estiğinde 'It is windy', lapa lapa kar yağdığında 'It is snowy', gökyüzü bulutlarla kaplandığında ise 'It is cloudy' deriz. Birine havanın nasıl olduğunu sormak istediğimizde 'What is the weather like?' diye sesleniriz; cevap da yine aynı sevgiyle 'It is' diye başlar. Şurası aklında kalsın tamam mı: Hava durumunu anlatırken isimleri değil, sıfatları kullanırız; yani 'sun' değil, 'sunny' sözcüğünü tercih ederiz.",
  example:
    "Pencerenin önüne geçip gökyüzüne bakalım. Güneş ışıl ışıl parıldıyorsa 'It is sunny and warm' dersin. Yağmur damlaları başladığında 'It is rainy today' diyerek şemsiyeni eline alırsın. Rüzgâr sert esiyorsa ve ellerin üşüyorsa iki hava halini birleştirebilirsin: 'It is cold and windy.' Arkadaşın sana telefon açıp 'What is the weather like in your city?' diye sorduğunda, göğe bakıp 'It is cloudy and chilly' diyerek şehri anlatabilirsin. Kar yağdığı kış günlerinde ise sokaklar beyaz örtüyle kaplanırken 'It is snowy' demek içini neşeyle doldurur.",
  hint: "gold",
  warning:
    "Hava durumunu söylerken isim köklerine küçük ekler getirerek sıfata dönüştürmeyi hatırla. Örneğin 'It is sun' demek yerine 'It is sunny', 'It is rain' demek yerine 'It is rainy' demek anlatımını pırıl pırıl yapar. Havayı sorarken de 'What is the weather like?' kalıbını bir bütün olarak kullanabilirsin; sonundaki 'like' kelimesi havanın neye benzediğini ve nasıl olduğunu sormanın en tatlı yoludur.",
  life:
    "Sabah evden çıkmadan önce mutlaka pencereden dışarı bak ve günün hava durumunu İngilizce fısılda: 'It is cold and rainy.' Montunu fermuarlarken 'I need my warm coat' de. Güneşli bir günde parka çıkarken arkadaşına 'It is hot and sunny today!' diyerek gülümse. Uzaktaki bir akrabanla telefonda konuşurken de ona 'What is the weather like over there?' diye sorarak tatlı bir sohbet başlat.",
  recap: [
    "Hava durumu It is ve ardından gelen bir hava sıfatıyla söylenir.",
    "Sunny güneşli, rainy yağmurlu, cold soğuk, windy rüzgârlı demektir.",
    "What is the weather like sorusuna It is sunny gibi net cümlelerle cevap verilir.",
  ],
  conceptSeal: "Hava, It is ve bir sıfatla kurulur.",
  voiceSeal: "Penceredeki havayı bir cümlede söylersin.",
  outcomes: [
    "Sunny, rainy ve cold hava sıfatlarıdır.",
    "Hava cümlesi It is ile başlar.",
    "What's the weather like hava sorusudur.",
  ],
  scene: "weather",
  parentNote:
    "Çocuğunuz havayı It is sunny, rainy ve cold ile söyler. What's the weather like sorusuna It is ile cevap verir. Sabah pencereden bu cümleyi kurdurabilirsiniz.",

};

export const JUNIOR_ING_MAIN_7 = juniorLessonFromScenario(JUNIOR_ING_MAIN_7_SCENARIO);
