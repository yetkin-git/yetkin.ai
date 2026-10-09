import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Bağlaç de, da, ki ve soru eki mi. */
export const JUNIOR_TURKCE_18_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-18",
  title: "de, da, ki ve mi'nin yazımı",
  teaser:
    "Bağlaç olan de ve da ayrı yazılır. Bulunma eki bitişiktir. Bağlaç olan ki ayrı, sıfat ve zamir kuran ki bitişiktir. Soru eki mi her zaman ayrı yazılır. Kavramsal Anlayış, ayrı ile bitişiği ayırır. İfade Gücü, aynı sesin görevini söylemektir.",
  welcome:
    "Selamlar! Bugün seninle dilimizin ve güzel Türkçemizin çok keyifli bir sırrını keşfedeceğiz, çünkü yazı yazarken en çok merak edilen ve doğru yazıldığında yazıyı bir inci gibi parlatan kuralları öğreneceğiz. Hiç evde sözcüğü ile o da geldi cümlesindeki da sesini söylerken birinin bitişik, diğerinin ayrı yazıldığını fark ettin mi? Biri bir yeri bildirir, diğeri bir başkasını da konuya katar. Bugün seninle bağlaç olan de ve da, ki bağlacı ve soru eki mi'nin yazımındaki altın sırları çözeceğiz.",
  concept:
    "Bağlaç olan de ve da her zaman ayrı bir kelime olarak yazılır; kendinden önceki sözcükten ayrı durur ve cümleden çıkarıldığında cümlenin anlamı bozulmaz, sadece hafifçe daralır. Örneğin Ahmet de geldi cümlesinde de bağlaçtır ve ayrı yazılır; de'yi çıkardığımızda Ahmet geldi cümlesi anlamlı kalır. Bulunma hal eki olan de ve da ise eklendiği sözcüğe bitişik yazılır; nerede sorusuna cevap verir ve cümleden çıkarılırsa anlam tamamen bozulur. Kitabım evde kaldı cümlesinde de bitişiktir. Bağlaç olan ki ayrı yazılır; iki cümleyi birbirine bağlar: Biliyorum ki başaracaksın. Sıfat yapan ve zamir olan ki ise bitişik yazılır: Yarınki sınav, seninki nerede. Soru eki olan mi, mı, mu, mü ise her zaman ama her zaman ayrı yazılır; kendinden sonra gelen ekler ise mi'ye bitişir. Sen de bizimle gelecek misin? Şurası aklında kalsın tamam mı: de'yi cümleden çıkarınca anlam bozulmuyorsa ayrı yazarsın; bozuluyorsa bitişik yazarsın. Soru eki mi ise daima ayrıdır.",
  example:
    "Örneklerimizi birlikte deneyelim. Ali de bizimle gelecek cümlesinde de'yi çıkaralım: Ali bizimle gelecek; anlam bozulmadı, öyleyse de ayrı yazılır. Kalemim çantada kaldı cümlesinde da'yı çıkaralım: Kalemim çanta kaldı; anlam bozuldu, öyleyse da bitişik yazılır. Duydum ki unutmuşsun cümlesinde ki bağlaçtır ve ayrıdır. Masadaki defter dediğimizde sıfat yapar ve bitişiktir. Akşam bize gelecek misin sorusunda mi ayrıdır ve sin şahıs eki mi'ye bitişir.",
  hint: "trap",
  warning:
    "Soru eki mi'yi kendinden önceki sözcükle asla bitişik yazma tuzağına düşmemelisin. Geldinmi veya baktınmı yazmak büyük bir yanlıştır; doğru yazımı geldin mi ve baktın mı şeklindedir. Ayrıca bağlaç olan de ve da hiçbir zaman te ya da ta biçiminde sertleşmez; her zaman yumuşak de veya da olarak ayrı yazılır.",
  life:
    "Arkadaşına mesaj atarken sen de gelsene yazarsan onu davet edersin ve de'yi ayrı yazarsın. Neredesin dediğinde evdeyim yazarsın ve de'yi bitişik tutarsın. Ödevini bitirdin mi diye sorarken mi'yi ayrı bırakırsın. Bu kurallar mesajlarını ve yazılarını pırıl pırıl yapar.",
  recap: [
    "Bağlaç olan de ve da ayrı yazılır, cümleden çıkınca anlam bozulmaz.",
    "Bulunma hal eki de ve da bitişik yazılır, nerede sorusunu cevaplar.",
    "Soru eki mi her zaman ayrı yazılır; bağlaç ki ayrı, sıfat ki'si bitişiktir.",
  ],
  conceptSeal: "Aynı ses, göreve göre bitişik veya ayrı yazılır. Soru eki mi her zaman ayrıdır.",
  voiceSeal: "De, da, ki ve mi sesinin bağlaç mı ek mi olduğunu söyleyip yazımını seçersin.",
  outcomes: [
    "Bağlaç de ve da ayrı, bulunma eki bitişik yazılır.",
    "Bağlaç ki ayrı, sıfat ve zamir kuran ki bitişik yazılır.",
    "Soru eki mi her zaman ayrı yazılır.",
  ],
  scene: "book",
  parentNote:
    "Çocuğunuz bu derste bağlaç de/da ile bulunma eki -de/-da'nın ayrımını cümleden çıkarma yöntemiyle kavrar. Soru eki mi'nin daima ayrı yazıldığını pekiştirebilirsiniz.",

};

export const JUNIOR_TURKCE_18 = juniorLessonFromScenario(JUNIOR_TURKCE_18_SCENARIO);
