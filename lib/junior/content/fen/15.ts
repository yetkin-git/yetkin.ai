import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Sesin sürati ve maddeyle etkileşimi. */
export const JUNIOR_FEN_15_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-15",
  title: "Sesin maddeyle etkileşimi",
  teaser:
    "Sesin sürati ortama bağlıdır. Ses maddeye çarpınca yansır, soğurulur ya da iletilir. Kavramsal Anlayış, yankı ile soğurulmayı ayırır. İfade Gücü, perdenin neden yankıyı azalttığını söylemektir.",
  welcome:
    "Merhaba! Bilim dünyasına hoş geldin, çünkü bugün ses dalgalarının duvarlarla, eşyalarla ve salonlarla yaptığı heyecan verici etkileşimi inceleyeceğiz. Hiç henüz eşyaları taşınmamış boş bir odaya girip 'merhaba' dediğinde sesinin sana anında geri döndüğünü duydun mu? O geri gelen ses, bilimdeki adıyla yankıdır. Bugün seninle sesin farklı ortamlardaki süratini, yankı olayını ve ses yalıtımının püf noktalarını öğreneceğiz.",
  concept:
    "Sesin sürati bulunduğu ortama göre değişir; ses oda sıcaklığındaki havada saniyede yaklaşık 340 metre bölü saniye süratle yol alır. Ses dalgaları bir engelle karşılaştığında üç farklı olay gerçekleşebilir: Bir kısmı yüzeyden yansır, bir kısmı madde tarafından soğurulur, bir kısmı da maddenin diğer tarafına iletilir. Sesin sert ve pürüzsüz bir yüzeye çarpıp kaynağına geri dönmesine yankı denir. Sert yüzeyler sesi güçlü şekilde yansıtır. Yumuşak, gözenekli ve pürüzlü yüzeyler ise ses dalgalarını hapsederek soğurur. Halı, kalın perde, sünger ve cam yünü gibi malzemeler sesi soğurduğu için ses yalıtımında kullanılır. Şurası aklında kalsın tamam mı: Yankı yeni bir ses değildir; ağzından çıkan aynı sesin sert duvardan sekip geri dönmesidir.",
  example:
    "Bomboş bir spor salonunda alkış tuttuğunda sert duvarlar sesi geri fırlatır; yarım saniye sonra kendi alkışının kopyasını yeniden işitirsin; bu yankıdır. Şimdi o salona binlerce seyircinin girdiğini, yerlere halılar serildiğini ve duvarlara akustik paneller takıldığını hayal et. Artık yankı duyulmaz; çünkü insanların kıyafetleri ve yumuşak yüzeyler sesi içine çeker, yani soğurur. Sinema salonlarının ve tiyatroların duvarlarının kumaş kaplı olması da bu yüzdendir. Sesin sürati havada yaklaşık 340 metre bölü saniyeyken, suda yaklaşık 1500 metre bölü saniyeye, çelik rayda ise 5000 metre bölü saniyeye fırlar. Ortamın yoğunluğu ve esnekliği değiştikçe sesin hızı da katbekat artar.",
  hint: "gold",
  warning:
    "Yankı duyduğunda ortamda ikinci bir ses kaynağı olduğunu sanma; sert yüzeye çarpan sesin sana geri dönmesidir bu. Odalara serilen yumuşak halılar ve kalın perdeler ise sesi soğurarak bu gereksiz yankılanmayı önler.",
  life:
    "Bunu evinin salonunda hemen fark edersin. Eşyalı ve halılı bir odada konuşurken sesin çok doğal ve berraktır. Oysa boş bir banyoda fayanslar sert olduğu için sesin çınlar ve yankılanır. Alt komşuya giden ayak seslerini engellemek için odalara yumuşak halı sermek de günlük hayatımızdaki en güzel ses yalıtımı örneğidir. Gürültülü otoyol kenarlarına dikilen ağaçlar ve ses bariyerleri de çevreye giden sesi soğurur.",
  recap: [
    "Sesin sürati ortama bağlıdır; havada yaklaşık 340 metre bölü saniyedir.",
    "Yankı, ses dalgalarının sert bir yüzeye çarpıp geri dönmesidir.",
    "Yumuşak ve gözenekli yüzeyler sesi soğurarak ses yalıtımını sağlar.",
  ],
  conceptSeal: "Ses maddeyle karşılaşınca yansır, soğurulur ya da iletilir.",
  voiceSeal: "Yankı ile soğurulmayı bir oda örneğinde ayırırsın.",
  outcomes: [
    "Sesin sürati bulunduğu ortama göre değişir.",
    "Yankı, sesin yansımasıdır.",
    "Ses yalıtımında soğurucu malzemeler kullanılır.",
  ],
  scene: "sound",
  parentNote:
    "Çocuğunuz yankıyı yansıma, perde ve halıyı soğurma diye ayırır. Sesin süratinin ortama bağlı olduğunu söyler. Evde halının ayak sesini azaltması bu konunun günlük karşılığıdır.",

};

export const JUNIOR_FEN_15 = juniorLessonFromScenario(JUNIOR_FEN_15_SCENARIO);
