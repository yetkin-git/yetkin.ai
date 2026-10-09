import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 11. hafta. Yeryüzü şekilleri ve bitki örtüsü. */
export const JUNIOR_SOSYAL_11_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-11",
  title: "Türkiye'nin yeryüzü şekilleri ve bitki örtüsü",
  teaser:
    "Kuzey Anadolu Dağları ve Toroslar kıyılara paralel uzanır. İç kesimde plato, doğuda yüksek dağlar vardır. Bitki örtüsü iklim ve yükseltiye bağlıdır. Kavramsal Anlayış, orman, maki ve bozkırı ayırır. İfade Gücü, bir şeklin bitkisini birlikte söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç yüksek bir dağ geçidini aştıktan hemen sonra havanın ve etrafındaki ağaçların birdenbire değiştiğini fark ettin mi? Yeryüzündeki heybetli dağlar yalnızca birer kaya kütlesi değildir; bulutları tutar, rüzgârı yönlendirir ve bitki örtüsünü belirler. Bugün seninle güzel ülkemizin yeryüzü şekillerini, dağlarını, ovalarını ve onların kucağında yeşeren bitki örtüsünü yakından tanıyacağız.",
  concept:
    "Kuzeyde Kuzey Anadolu Dağları, güneyde ise Toros Dağları kıyıya paralel uzanır. Dağların kıyıya paralel uzanması, denizden gelen nemli havanın iç kesimlere kolayca girmesini engeller. Bu yüzden kıyılar bol yağış alırken iç kesimler kurak kalır. İç Anadolu geniş platolardan oluşur; Doğu Anadolu ise ortalama yükseltisi en fazla olan bölgemizdir. Ovalar ise akarsuların taşıdığı verimli topraklarla kaplı düzlüklerdir; Çukurova ve Bafra buna en güzel örneklerdir. Bitki örtüsü ise iklime ve yükseltiye doğrudan bağlıdır; Karadeniz'de gür ormanlar, Akdeniz'de kısa boylu çalılıklardan oluşan maki, iç kesimlerde ise ilkbaharda yeşerip yazın sararan bozkır görülür. Şurası aklında kalsın tamam mı: Yeryüzünde yükselti arttıkça hava sıcaklığı her iki yüz metrede yaklaşık bir derece düşer; sıcaklık düştükçe bitki örtüsü de değişir.",
  example:
    "Deniz kıyısından başlayıp iç kısımlara doğru bir yolculuğa çıktığını hayal edelim. Kıyıdaki bereketli ovada zeytinlikler ve narenciye bahçeleri uzanır. Ardından Toros Dağları'na tırmanmaya başlarsın; denize bakan yamaçlarda Akdeniz ikliminin simgesi olan maki toplulukları yer alır. Maki, yaz kuraklığına dayanıklı, yaprakları sert ve parlak kısa boylu çalılıklardır; orman değildir. Dağın zirvesini aşıp İç Anadolu tarafına indiğinde ise dağların nemi kestiğini hemen fark edersin; yağış azalır ve uçsuz bucaksız bozkır örtüsü başlar. Bozkır, ilkbahar yağmurlarıyla yeşeren, yaz sıcağında kuruyan seyrek ot topluluğudur; çöl değildir. Doğuya doğru ilerledikçe yükselti daha da artar ve hava iyice serinler. Her yer şekli, doğanın o köşesine ayrı bir örtü armağan eder.",
  hint: "trap",
  warning:
    "Maki örtüsünü dev ormanlarla, bozkırı ise kumlu bir çölle karıştırmak yaygın bir yanılgıdır. Makinin kısa boylu çalı, bozkırın ise ilkbahar otu olduğunu her zaman hatırla. Dağlara tırmandıkça havanın ısındığını düşünmek de yanıltıcı bir tuzaktır; tam tersine yükseldikçe sıcaklık düzenli olarak azalır. Dağların kıyı ile iç kesimler arasında koruyucu dev bir set oluşturduğunu güvenle aklında tutabilirsin.",
  life:
    "Bunu ailenle tatile giderken karayolunda kolayca gözlemleyebilirsin. Akdeniz kıyısında arabayla ilerlerken yol kenarındaki bodur çalıları ve defne ağaçlarını izlersin. Uzun bir tünelden geçip dağın öteki yamacına çıktığında ise bir anda geniş sarı bozkır tarlaları seni karşılar. Aynı gün içinde iki farklı bitki örtüsünün içinden geçersin. Pencereden dışarı bakarken önce yer şeklini, sonra da bitki örtüsünü kendi kendine neşeyle tarif edebilirsin.",
  recap: [
    "Kuzey Anadolu Dağları ve Toroslar kıyıya paralel uzanır. İçeride plato vardır.",
    "Karadeniz'de orman, Akdeniz'de maki, iç kesimde bozkır görülür.",
    "Yükselti artınca sıcaklık düşer. Maki orman, bozkır çöl değildir.",
  ],
  conceptSeal: "Yeryüzü şekli iklimi böler. Bitki örtüsü iklim ve yükseltiye uyar.",
  voiceSeal: "Bir yerin şeklini ve oradaki bitki örtüsünü ayrı cümleyle söylersin.",
  outcomes: [
    "Kuzey Anadolu Dağları ve Toroslar kıyıya paraleldir.",
    "Orman, maki ve bozkır ayrı bitki örtüleridir.",
    "Yükselti artınca sıcaklık düşer.",
  ],
  scene: "globe",
  parentNote:
    "Çocuğunuz dağların kıyı ile iç kesimi ayırdığını, orman, maki ve bozkırın ayrı örtüler olduğunu anlatır. Yükseldikçe sıcaklığın düştüğünü söyler.",

};

export const JUNIOR_SOSYAL_11 = juniorLessonFromScenario(JUNIOR_SOSYAL_11_SCENARIO);
