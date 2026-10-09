import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 4 Weather and Emotions. Duygular. */
export const JUNIOR_ING_MAIN_8_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-8",
  title: "Happy, anxious ve scared",
  teaser:
    "Duygu I am happy, I am anxious ve I am scared ile söylenir. Soru How do you feel diye kurulur. Kavramsal Anlayış, duyguyu hava ile karıştırmaz. İfade Gücü, o anki halini bir cümlede anlatmandır.",
  welcome:
    "Selamlar! Bugün seninle kendimizi İngilizce ifade etmenin çok keyifli yollarını keşfedeceğiz, üstelik bu kez duygularımızın o derin ve renkli dünyasına yolculuk yapacağız! Bazen güneşli bir havada kalbin sevinçle dolar, bazen tahtaya kalkıp şiir okumadan önce içinde tatlı bir heyecan ve kıpırtı hissedersin; bazen de gök gürültüsü duyduğunda yastığına biraz daha sıkı sarılırsın. İşte tüm bunlar bizim kıymetli duygularımızdır. Bugün seninle 'happy', 'anxious' ve 'scared' gibi hislerimizi İngilizce anlatmayı ve birine 'How do you feel?' diye sormayı öğreneceğiz.",
  concept:
    "Duygularımızı anlatırken cümleye 'I am' veya 'I feel' kalıbıyla başlarız. 'I am happy' mutluyum, 'I am sad' üzgünüm demektir. 'I am anxious' dediğinde ise henüz gerçekleşmemiş bir olay öncesinde içinde hissettiğin tatlı kaygıyı veya meraklı telaşı anlatırsın. 'I am scared' ise korktuğunu samimiyetle dile getirir. Bir macera öncesinde 'I am excited' diyerek heyecanını, 'I am calm' diyerek huzurunu paylaşabilirsin. Bir arkadaşına nasıl hissettiğini sormak için 'How do you feel?' dersin. Şurası aklında kalsın tamam mı: 'Anxious' gelecekteki bir durum için duyulan kaygı ve heyecandır; 'scared' ise o an karşılaşılan bir şeyden korkmaktır. İkisi de tamamen insani ve çok doğal hislerdir.",
  example:
    "Farklı anları birlikte canlandıralım: Teneffüste en sevdiğin oyunu oynarken 'I feel happy and energetic!' dersin. Yarın okulda önemli bir İngilizce projesi sunacaksan 'I am a little anxious about tomorrow' demen çok doğaldır. Şimşek çaktığında pencere kenarındaysan 'I am scared of thunder' diyebilirsin. Arkadaşın sana yaklaşıp 'How do you feel today?' diye sorduğunda gülümseyerek 'I feel great!' diyerek cevap verirsin. Unutma: Hava durumu gökyüzündedir ve 'It is rainy' denir; duygu ise senin içindedir ve 'I am happy' diye kurulur.",
  hint: "trap",
  warning:
    "Kendi hissini söylerken 'scared' kelimesini seçmeye özen gösterebilirsin. Çünkü 'scared' korkan kişiyi, 'scary' ise korkutucu olan nesneyi veya filmi anlatır; örneğin 'The film is scary, but I am not scared!' demek harika bir ayrımdır. Ayrıca duygularını ifade ederken 'I am happy' şeklinde yardımcı fiilini kullanmayı ve arkadaşına halini sorarken 'How do you feel?' kalıbını tercih etmeyi sevgiyle aklında tutabilirsin.",
  life:
    "Akşam eve geldiğinde ailen sana gününü sorduğunda 'I am very happy today' diyerek sarıl. Sınavdan veya önemli bir maçtan önce kalbin hızla çarpıyorsa kendine 'I am a little anxious, but I can do this!' diyerek özgüven ver. Bir arkadaşının yüzü asıksa yanına gidip şefkatle 'How do you feel?' diye sor. Gökyüzünde yağmur yağsa bile kendi içindeki güneşi 'I am happy' diyerek koru.",
  recap: [
    "I am happy mutlu, I am anxious kaygılı, I am scared korkmuş anlamına gelir.",
    "How do you feel sorusuna I feel happy veya I am happy ile cevap verilir.",
    "Scary korkutucu olan şeydir; scared ise o duyguyu hisseden kişidir.",
  ],
  conceptSeal: "Duygu I am ile kurulur. Hava It is ile kurulur.",
  voiceSeal: "O anki halini happy, anxious ya da scared ile söylersin.",
  outcomes: [
    "Happy, anxious ve scared duygu sözleridir.",
    "Duygu cümlesi I am ile başlar.",
    "How do you feel duygu sorusudur.",
  ],
  scene: "weather",
  parentNote:
    "Çocuğunuz duyguyu I am happy, anxious ve scared ile söyler. Scary korkutan, scared korkan demektir. Akşam How do you feel diye sorabilirsiniz.",

};

export const JUNIOR_ING_MAIN_8 = juniorLessonFromScenario(JUNIOR_ING_MAIN_8_SCENARIO);
