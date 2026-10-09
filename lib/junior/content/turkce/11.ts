import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Anlatım biçimleri ve düşünceyi geliştirme yolları. */
export const JUNIOR_TURKCE_11_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-11",
  title: "Anlatım biçimleri ve düşünceyi geliştirme yolları",
  teaser:
    "Öyküleme olay anlatır. Betimleme nasıl göründüğünü gösterir. Açıklama bilgi verir. Tartışma bir düşünceyi savunur. Kavramsal Anlayış, biçim ile geliştirme yolunu ayırır. İfade Gücü, cümlede hangisinin durduğunu söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç bir roman okurken kendini bir maceranın ortasında koşuyor gibi veya bir şiir okurken bir göl kenarındaki renkleri seyreder gibi hissettin mi? Biri olayları hareket halinde yaşatır, diğeri durağan bir resmi gözlerinin önüne serer. Bugün seninle öyküleme, betimleme, açıklama ve tartışma gibi anlatım biçimlerini ve düşünceyi geliştirme yollarını keşfedeceğiz. Kelimelerle resim yapmanın ve düşüncelerini savunmanın gücünü hissetmeye hazır mısın?",
  concept:
    "Dört temel anlatım biçimi vardır. Öyküleme, olayları kişi, yer ve zaman ekseninde hareket halinde, bir video kaydı gibi canlandırır. Betimleme ise varlıkları renk, biçim ve duyusal özellikleriyle durağan bir fotoğraf gibi okurun zihninde resmeder; kelimelerle resim yapma sanatıdır. Açıklama, okuyucuya nesnel bilgi vermek ve bir konuyu öğretmek amacıyla yazılır. Tartışma ise okuyucunun fikrini değiştirmek ve kendi savını kanıtlamak için sohbet havasında yazılır. Düşünceyi geliştirme yolları ise bu biçimlerin içinde kullanılan araçlardır: Tanımlama bu nedir sorusuna cevap verir; örnekleme soyut fikri somut bir örnekle gösterir; karşılaştırma iki varlığın benzer veya farklı yanlarını kıyaslar; sayısal verilerden yararlanma ise araştırmaları ve istatistikleri sunar. Şurası aklında kalsın tamam mı: Anlatım biçimi evin genel mimarisi, düşünceyi geliştirme yolları ise odalardaki eşyalardır.",
  example:
    "Cümlelerimize bakalım. Ali çantasını kaptığı gibi kapıdan dışarı fırladı ve hızla durağa koştu; burada hareket ve zaman akışı vardır, bu öykülemedir. Küçük odanın duvarları açık maviye boyanmıştı, masanın üzerinde eski ahşap bir lamba duruyordu; burada zaman durmuş, bir resim çizilmiştir, bu betimlemedir. Fotosentez bitkilerin ışık enerjisini besine dönüştürmesidir; bu açıklamadır ve aynı zamanda bir tanımlamadır. Ağaçlar beton binalardan çok daha değerlidir cümlesinde ise karşılaştırma yapılmıştır.",
  hint: "gold",
  warning:
    "Betimleme ile öykülemeyi birbiriyle karıştırmamaya dikkat edebilirsin. Eğer sahnede olaylar akıyor, kişiler birbiri ardına eylem yapıyorsa bu öykülemedir; zaman donmuş gibi sadece eşyaların ve mekânın görünüşü anlatılıyorsa bu betimlemedir. Açıklamanın bilgi verdiğini, tartışmanın ise bir fikri savunduğunu da aklında tutabilirsin.",
  life:
    "Teneffüste maçta nasıl gol attığını anlatırken öyküleme yaparsın. Yeni aldığın bisikletin rengini ve pırıl pırıl parlayan vitesini tarif ederken betimleme yaparsın. Fen sınavına çalışırken açıklamaları okursun. Hangi oyunun daha eğlenceli olduğunu arkadaşına savunurken ise tartışma ve karşılaştırma yollarını kullanırsın.",
  recap: [
    "Öyküleme olayları hareket halinde, betimleme ise durağan bir resim gibi anlatır.",
    "Açıklama bilgi vermeyi, tartışma bir düşünceyi savunmayı hedefler.",
    "Tanımlama, örnekleme, karşılaştırma düşünceyi geliştiren güçlü araçlardır.",
  ],
  conceptSeal: "Anlatım biçimi türdür. Geliştirme yolu, düşünceyi büyüten araçtır.",
  voiceSeal: "Bir metnin anlatım biçimini ve içindeki geliştirme yolunu ayrı söylersin.",
  outcomes: [
    "Dört anlatım biçimi öyküleme, betimleme, açıklama ve tartışmadır.",
    "Tanımlama, örnekleme ve karşılaştırma düşünceyi geliştirir.",
    "Betimlemede olay akmaz, görünüş durur.",
  ],
  scene: "book",
  parentNote:
    "Çocuğunuz bu derste olay anlatan öyküleme ile tasvir yapan betimlemeyi ayırır. Tanımlama, örnekleme ve karşılaştırma tekniklerini fark eder.",

};

export const JUNIOR_TURKCE_11 = juniorLessonFromScenario(JUNIOR_TURKCE_11_SCENARIO);
