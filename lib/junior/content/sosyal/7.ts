import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 7. hafta. Türklerin İslamiyet'i kabulü ve ilk Türk-İslam devletleri. */
export const JUNIOR_SOSYAL_7_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-7",
  title: "Türklerin İslamiyet'i kabulü ve ilk Türk-İslam devletleri",
  teaser:
    "751 Talas Savaşı Türklerin İslamiyet'i yakından tanıdığı eşiktir. Karahanlılar ilk Müslüman Türk devletidir. 1071 Malazgirt Anadolu'nun kapısını açar. Kavramsal Anlayış, kabul ile Anadolu'ya girişi ayırır. İfade Gücü, üç devleti işiyle birlikte söylemektir.",
  welcome:
    "Hoş geldin! Hazırsan bugün tarihin, kültürün ve yeryüzünün heyecan dolu dünyasına adım atıyoruz, çünkü Türk ve İslam tarihinin en önemli buluşmasını keşfedeceğiz. Hiç bir tarihi karşılaşmanın, ticaret yollarında kurulan dostluklarla büyük bir medeniyet değişimini başlattığını duymuş muydun? Türkler İslamiyet'i bir günde değil; ticaret, komşuluk ve ortak değerlerle adım adım tanıdı. Bugün seninle bu kutlu tanışmayı ve ardından kurulan ilk Türk-İslam devletlerini yakından göreceğiz.",
  concept:
    "751 yılındaki Talas Savaşı'nda Karluk Türkleri, Abbasi ordusunun yanında yer aldı ve Çin ordusu yenildi. Bu tarihi karşılaşma, Türklerin İslamiyet'i çok daha yakından tanıyıp benimsediği kritik bir eşiktir. Karahanlılar, Orta Asya'da kurulan ilk Müslüman Türk devletidir; Satuk Buğra Han döneminde İslamiyet devletin dini olarak kabul edilmiştir. Gazneliler ise güçlü bir ordu kurmuş, Gazneli Mahmud liderliğinde Hindistan'a seferler düzenleyerek İslamiyet'i oraya taşımıştır. Büyük Selçuklu Devleti'nde ise Tuğrul Bey ve Sultan Alparslan gibi büyük liderler öne çıkar. Şurası aklında kalsın tamam mı: 1071 yılındaki Malazgirt Zaferi Anadolu'nun kapılarını Türklere açan şanlı bir zaferdir; Türklerin İslamiyet'i kabul tarihi değildir.",
  example:
    "Tarihi durakları sırayla hayal edelim. 751 yılındaki Talas'ta iki büyük ordu karşı karşıya gelir; Karlukların desteği savaşın seyrini değiştirir. Bu tanışmanın ardından kervansaraylarda, pazarlarda ve şehirlerde yeni inanç konuşulur. Karahanlılar döneminde bu inanç köklü bir devlet düzenine ve zengin bir kültüre dönüşür. Bilge yazar Kaşgarlı Mahmud, Türkçenin zenginliğini dünyaya duyurmak için ilk Türkçe sözlüğü yazar; Yusuf Has Hacib ise adaletli devlet yönetimini anlatır. Gazneli Mahmud ordularıyla Hindistan yollarında fetihler yapar. Selçuklular ise 1040 yılındaki Dandanakan Savaşı ile güçlenir, 1071 Malazgirt Zaferi ile de Anadolu'yu Türk yurdu yapacak kapıyı ardına kadar açar. Üç devlet de Müslüman Türk devletidir; her birinin tarihe kattığı değer büyüktür.",
  hint: "trap",
  warning:
    "1071 Malazgirt Zaferi'ni Türklerin İslamiyet'i ilk kez kabul ettiği tarih sanmak yanıltıcı bir tuzaktır. İslamiyet'in kabulü 751 yılındaki Talas'tan sonra başlamış ve Karahanlılar ile devlet inancına dönüşmüştür; Malazgirt ise Anadolu'nun kapılarını açan büyük bir zaferdir. Karahanlı, Gazneli ve Büyük Selçuklu devletlerinin her birinin ayrı birer devlet olduğunu da güvenle aklında tutabilirsin.",
  life:
    "Bunu yeni bir şehre taşınma sırasına benzetebilirsin. Önce bir kapıda yeni insanlarla tanışırsın; ardından bu dostluk evinde kalıcı bir düzene dönüşür; en sonunda da yeni ve geniş bir odaya adım atarsın. Tanışmak, düzene geçmek ve yeni kapılardan geçmek farklı adımlardır. Tarihimizde de Talas Savaşı tanışma eşiği, Karahanlılar devlet düzeni, Malazgirt ise Anadolu'ya açılan kutlu kapıdır.",
  recap: [
    "751 Talas Savaşı, Türklerin İslamiyet'i yakından tanıdığı eşiktir.",
    "Karahanlılar ilk Müslüman Türk devletidir. Gazneliler ve Selçuklular onu izler.",
    "1071 Malazgirt Anadolu'nun kapısıdır. Kabul tarihi değildir.",
  ],
  conceptSeal: "Kabul Talas ve Karahanlılarla ilerler. Malazgirt Anadolu kapısıdır.",
  voiceSeal: "Talas, Karahanlı, Gazneli ve Malazgirt'i ayrı duraklar olarak söylersin.",
  outcomes: [
    "Talas Savaşı 751 yılında yapılmıştır.",
    "Karahanlılar ilk Müslüman Türk devletidir.",
    "Malazgirt Savaşı 1071'de Anadolu kapısını açmıştır.",
  ],
  scene: "history",
  parentNote:
    "Çocuğunuz 751 Talas'ı tanışma eşiği, Karahanlıları ilk Müslüman Türk devleti, 1071 Malazgirt'i Anadolu kapısı olarak ayırır.",

};

export const JUNIOR_SOSYAL_7 = juniorLessonFromScenario(JUNIOR_SOSYAL_7_SCENARIO);
