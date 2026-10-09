import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Nokta, virgül, noktalı virgül ve iki nokta. */
export const JUNIOR_TURKCE_19_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-19",
  title: "Nokta, virgül, noktalı virgül ve iki nokta",
  teaser:
    "Nokta cümleyi bitirir. Virgül eş görevlileri ve hitabı ayırır. Noktalı virgül, içinde virgül olan öbekleri ayırır. İki nokta açıklamadan önce durur. Kavramsal Anlayış, dört işareti ayırır. İfade Gücü, cümlede doğru işareti seçmektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün kelimelerin arasında nasıl bir yolculuk var, çünkü bir cümlenin nefesini, duraklarını ve ahengini belirleyen noktalama işaretlerini tanıyacağız. Hiç noktalama işareti olmayan uzun bir yazıyı okumayı denedin mi? Nefesin tükenir, kelimeler birbirine karışır. Nokta cümleyi tamamlar, virgül tatlı bir nefes aldırır. Bugün seninle nokta, virgül, noktalı virgül ve iki noktanın görevlerini ve metne kattıkları ritmi adım adım keşfedeceğiz.",
  concept:
    "Noktalama işaretleri yazının trafik işaretleridir. Nokta, tamamlanmış cümlenin sonuna konur ve tam bir duraklama sağlar. Bazı kısaltmaların, sıra bildiren sayıların ve tarihlerin arasına da nokta gelir. Virgül, birbiri ardınca sıralanan eş görevli kelime ve kelime gruplarının arasına konur; elma, armut, kiraz aldım. Sıralı cümleleri ayırır ve hitap sözlerinden sonra yer alır; Sevgili Arkadaşım, buraya gel. Noktalı virgül ise içinde virgüller bulunan farklı tür veya öbekleri birbirinden ayırmak için kullanılır; manavdan elma, armut; kırtasiyeden defter, kalem aldım. İki nokta ise kendisinden sonra bir açıklama yapılacaksa veya bir liste, örnekler sıralanacaksa kullanılır. Şurası aklında kalsın tamam mı: Nokta tamamlar ve bitirir; virgül nefes aldırıp ayırır; iki nokta arkadan gelecek açıklamayı haber verir.",
  example:
    "Örneklerimize kulak verelim. Bahar geldi, her taraf yemyeşil oldu; bu sıralı iki cümleyi virgül birbirine bağlar. Cümlemiz bittiğinde ise sonuna nokta koyarız. Pazardan pırasa, ıspanak; marketten süt, peynir aldık cümlesinde sebzeler ile süt ürünlerini ayırmak için ortaya noktalı virgül gelir. Çantamda şunlar vardı: defter, silgi ve kalem cümlesinde ise liste başlamadan önce iki nokta konur. Ali, çantanı unutma cümlesinde Ali hitabından sonra virgül nefes aldırır.",
  hint: "gold",
  warning:
    "İki noktadan sonra gelen açıklama tam bir cümle ise büyük harfle başlar; sadece örnekler ve kelimeler sıralanıyorsa küçük harfle devam edebilir. Noktalı virgülü de virgülün olmadığı yere koymamayı hatırla; bir cümlede noktalı virgül olabilmesi için öncesinde ya da sonrasında mutlaka virgülle ayrılmış kelimeler bulunmalıdır.",
  life:
    "Market alışveriş listeni yazarken aralara virgül koyarsın. Bir dilekçe ya da mektup yazarken Sevgili Öğretmenim dedikten sonra virgül bırakırsın. Cümleni güvenle bitirdiğinde noktanı koyarsın. İki nokta ile listeni açarsın. Noktalama işaretleri senin düşüncelerini başkalarının pürüzsüzce anlamasını sağlar.",
  recap: [
    "Nokta tamamlanan cümlenin sonuna konur ve tam duraklama sağlar.",
    "Virgül eş görevli sözcükleri, sıralı cümleleri ve hitapları ayırır.",
    "Noktalı virgül grupları ayırır; iki nokta açıklamayı ve örneği başlatır.",
  ],
  conceptSeal: "Nokta bitirir. Virgül ayırır. İki nokta açıklamayı haber verir.",
  voiceSeal: "Bir cümlede nokta, virgül, noktalı virgül veya iki noktadan hangisinin duracağını söylersin.",
  outcomes: [
    "Nokta tamamlanan cümlenin sonuna konur.",
    "Virgül eş görevli sözcükleri ve hitabı ayırır.",
    "İki nokta açıklama ve örnekten önce kullanılır.",
  ],
  scene: "book",
  parentNote:
    "Çocuğunuz bu derste nokta, virgül, noktalı virgül ve iki noktanın yerini ve görevini öğrenir. Birlikte sesli kitap okurken noktalama işaretlerinde duraklayarak ritim duygusunu pekiştirebilirsiniz.",

};

export const JUNIOR_TURKCE_19 = juniorLessonFromScenario(JUNIOR_TURKCE_19_SCENARIO);
