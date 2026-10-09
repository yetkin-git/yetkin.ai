import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Benzetme, kişileştirme, konuşturma ve karşıtlık. */
export const JUNIOR_TURKCE_4_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-4",
  title: "Söz sanatları",
  teaser:
    "Benzetmede gibi ve kadar vardır. Kişileştirmede cansıza insan hali verilir. Konuşturmada cansız söz söyler. Karşıtlıkta zıtlar bir aradadır. Kavramsal Anlayış, dördünü ayırır. İfade Gücü, cümledeki sanatı adlandırmaktır.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün kelimelerin arasında nasıl bir yolculuk var, çünkü dilimizi bir ressamın fırçası gibi renklendiren söz sanatlarını öğreneceğiz. Hiç rüzgâr saçımı usulca okşadı cümlesini duyduğunda rüzgârın bir eli olduğunu düşündün mü? O cümlede rüzgâr, tıpkı sevecen bir insan gibi anlatılmıştır. Bugün seninle benzetme, kişileştirme, konuşturma ve karşıtlık sanatlarının büyüleyici güzelliğini keşfedeceğiz.",
  concept:
    "Söz sanatları anlatımı güçlendirir ve güzelleştirir. Benzetme, aralarında ilgi bulunan iki varlıktan zayıf olanı güçlü olana benzetmektir; cümlede gibi ve kadar sözcükleri bize ipucu verir. Kişileştirme, insan dışındaki canlı veya cansız varlıklara insana ait özellikler yüklemektir; bulutların ağlaması kişileştirmedir. Konuşturma yani intak ise insan dışındaki varlıkları insan gibi konuşturmaktır. Karşıtlık yani tezat, birbiriyle zıt duygu, düşünce veya durumları aynı cümlede buluşturmaktır. Şurası aklında kalsın tamam mı: Bir varlık konuştuğunda orada mutlaka konuşturma vardır; konuşturmanın olduğu her yerde doğal olarak kişileştirme de bulunur.",
  example:
    "Örneklerimizi birlikte inceleyelim. Küçük kardeşim sincap gibi çeviktir cümlesinde gibi sözcüğüyle benzetme yapılmıştır. Güneş bu sabah bize sıcacık gülümsedi cümlesinde güneşe insan özelliği verilmiştir; bu kişileştirmedir. Küçük fidan, beni suladığın için teşekkür ederim, dedi cümlesinde fidan konuşmuştur; bu konuşturmadır. Ağlarım hatıra geldikçe gülüştüklerimiz cümlesinde ağlamak ile gülüşmek bir aradadır; bu karşıtlıktır. Dört ayrı sanat, dilimize dört ayrı zarafet katar.",
  hint: "gold",
  warning:
    "Cümlede konuşturulan bir varlık gördüğünde bunu sadece kişileştirme deyip geçmemeyi hatırla. Eğer cansız bir varlık doğrudan söz söylüyorsa orada öncelikle konuşturma sanatı öne çıkar. Karşıtlıkta ise sadece iki zıt sözcük değil, iki zıt durumun bir arada verilmesine dikkat edebilirsin.",
  life:
    "Arkadaşınla bir anını paylaşırken bir aslan gibi cesurdu dersen benzetme kurarsın. Kalemim elimden kayıp kaçtı dersen kişileştirme yaparsın. Hem sevinçten hem kederden gözlerim doldu dersen karşıtlığın gücünden yararlanırsın. Söz sanatları yazdığın kompozisyonları ve konuşmalarını ışıl ışıl parlatır.",
  recap: [
    "Benzetmede gibi veya kadar sözcükleri iki varlığı birbirine bağlar.",
    "Kişileştirme insana ait özellikleri, konuşturma ise konuşma yetisini varlıklara verir.",
    "Karşıtlık, zıt durum ve duyguları bir arada kullanarak anlatımı güçlendirir.",
  ],
  conceptSeal: "Dört sanat ayrı iş görür. Söz varsa konuşturma, gibi varsa benzetmedir.",
  voiceSeal: "Bir cümledeki sanatı benzetme, kişileştirme, konuşturma veya karşıtlık diye söylersin.",
  outcomes: [
    "Benzetme, gibi veya kadar ile kurulur.",
    "Konuşturma, kişileştirmenin söz söyleyen hâlidir.",
    "Karşıtlık, zıtları bir arada kullanır.",
  ],
  scene: "meaning",
  parentNote:
    "Çocuğunuz bu derste benzetme, kişileştirme, konuşturma ve tezat sanatlarını tanır. Masal ve fabl kitaplarındaki hayvanların konuşmasını konuşturma olarak ayırt edebilir.",

};

export const JUNIOR_TURKCE_4 = juniorLessonFromScenario(JUNIOR_TURKCE_4_SCENARIO);
