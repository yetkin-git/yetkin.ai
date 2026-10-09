import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Çok anlamlılık, sesteşlik ve söz varlığı. */
export const JUNIOR_TURKCE_3_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-3",
  title: "Sözcükte çok anlamlılık ve söz varlığı",
  teaser:
    "Çok anlamlı sözcükte anlamlar ilişkilidir. Sesteşte yazılış aynıdır, anlamlar ilişkisizdir. Söz varlığı, bildiğin ve kullandığın sözcüklerdir. Kavramsal Anlayış, bu üçünü ayırır. İfade Gücü, bir sözcüğü doğru kümeye koymaktır.",
  welcome:
    "Selamlar! Bugün seninle dilimizin ve güzel Türkçemizin çok keyifli bir sırrını keşfedeceğiz, çünkü bir tek kelimenin nasıl onlarca farklı renge bürünebildiğine şahit olacağız. Hiç yüz dendiğinde hem aynadaki yüzünü hem de masanın pürüzsüz yüzeyini düşündün mü? Bugün seninle bir sözcüğün birden fazla anlama gelişini, sesteşliği ve söz varlığımızın zenginliğini öğreneceğiz. Kelimeler bazen akrabadır, bazen de sadece ses benzerliği taşır.",
  concept:
    "Çok anlamlılık, bir sözcüğün temel anlamından tamamen kopmadan zaman içinde birbiriyle bağlantılı yeni anlamlar kazanmasıdır. Örneğin yüz sözcüğü insan yüzü de olabilir, masanın yüzeyi de olabilir; ikisi de bir şeyin dışa bakan ön kısmıyla bağlantılıdır. Sesteş yani eş sesli sözcüklerde ise yazılış ve okunuş tamamen aynıdır fakat anlamlar arasında hiçbir akrabalık yoktur. Örneğin yüz sayısı ile yüzümüz sesteştir. Çay içeceği ile derede akan çay da sesteştir. Söz varlığı ise bildiğin, anladığın ve konuştuğun tüm kelimelerin, deyimlerin ve terimlerin toplam hazinesidir. Şurası aklında kalsın tamam mı: Bol kitap okudukça söz varlığın bir çınar gibi büyür; sesteş sözcükleri çok anlamlılıkla karıştırmamak için anlamlar arasında akrabalık var mı diye bakmalısın.",
  example:
    "Cümlelerimize kulak verelim. Çocuğun yüzü gülüyordu cümlesinde yüz, insan organıdır. Masanın yüzü çizilmiş cümlesinde yüz, nesnenin dış yüzeyidir; bu iki anlam birbiriyle bağlantılıdır ve çok anlamlılıktır. Kitapta yüz sayfa var cümlesindeki yüz ise bir sayıdır; organ olan yüzle hiçbir bağı yoktur, bu yüzden sesteştir. Sıcak bir çay içtik cümlesindeki çay ile köyün çayında yüzdük cümlesindeki çay da sesteştir. Okuduğun her yeni masal ve roman, söz varlığı ağacına yepyeni yapraklar ekler.",
  hint: "trap",
  warning:
    "Yazılışları aynı olan her kelime çiftini hemen çok anlamlı sanmak aceleci bir tuzaktır. Önce kendine şu soruyu sor: Bu iki kullanım arasında azıcık da olsa bir anlam bağı var mı? Eğer bağ varsa çok anlamlılıktır; anlamlar tamamen bağımsız ve ilgisizse sesteşliktir. Bu küçük ayrıntı seni her zaman doğru yanıta götürür.",
  life:
    "Markete gidip yüz gram fındık aldığında sayıyı kullanırsın; aynaya bakıp yüzünü yıkadığında organı kullanırsın. Aynı ses iki bambaşka dünyayı açar. Her gün yeni bir kelime öğrenmek, duygu ve düşüncelerini arkadaşlarına çok daha etkili ve özgüvenle anlatmanı sağlar.",
  recap: [
    "Çok anlamlı sözcükte anlamlar arasında bir akrabalık bağı bulunur.",
    "Sesteş sözcüklerde yazılış aynıdır ancak anlamlar tamamen bağımsızdır.",
    "Söz varlığı, bildiğin ve kullandığın kelimelerin zengin hazinesidir.",
  ],
  conceptSeal: "Çok anlamlıda bağ vardır. Sesteşte bağ yoktur. Söz varlığı okudukça büyür.",
  voiceSeal: "Bir sözcüğün çok anlamlı mı sesteş mi olduğunu ve söz varlığına ne kattığını söylersin.",
  outcomes: [
    "Çok anlamlı sözcükte anlamlar ilişkilidir.",
    "Sesteş sözcüklerde anlamlar ilişkisizdir.",
    "Söz varlığı, bilinen ve kullanılan sözcüklerdir.",
  ],
  scene: "word-tree",
  parentNote:
    "Çocuğunuz bu derste bir sözcüğün birden çok anlama gelmesi ile sesteşlik farkını öğrenir. Evde sesteş sözcüklerle eğlenceli cümle oyunları oynayarak kelime hazinesini genişletebilirsiniz.",

};

export const JUNIOR_TURKCE_3 = juniorLessonFromScenario(JUNIOR_TURKCE_3_SCENARIO);
