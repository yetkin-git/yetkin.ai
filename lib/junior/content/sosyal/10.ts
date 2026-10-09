import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 10. hafta. Türkiye'nin coğrafi konumu ve iklimi. */
export const JUNIOR_SOSYAL_10_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-10",
  title: "Türkiye'nin coğrafi konumu ve iklim çeşitliliği",
  teaser:
    "Türkiye üç tarafı deniz olan bir ülkedir ve Asya ile Avrupa'yı bağlar. İklim tek değildir. Karadeniz, Akdeniz, karasal ve Marmara geçiş iklimi birlikte görülür. Kavramsal Anlayış, iklimi konuma bağlar. İfade Gücü, bir bölgenin yağışını mevsimiyle söylemektir.",
  welcome:
    "Merhaba! Sosyal Bilgiler dünyasına hoş geldin, çünkü bugün yurdumuzun güzel iklim zenginliğine ve coğrafi konumuna bir yolculuk yapacağız. Hiç aynı hafta içinde televizyonda bir ilimizde lapa lapa kar yağarken, diğer bir kıyı kentimizde insanların güneşin tadını çıkardığını gördün mü? Güzel ülkemiz geniş bir coğrafyaya sahiptir ve iklimi tek bir kalıba asla sığmaz. Bugün seninle bu muhteşem çeşitliliğin nedenlerini, denizlerin ve dağların havayı nasıl şekillendirdiğini keşfedeceğiz.",
  concept:
    "Türkiye, Asya ile Avrupa kıtalarının birbirine kavuştuğu stratejik bir köprü konumundadır ve üç tarafı denizlerle çevrilidir. Kuzeyde Karadeniz, batıda Ege Denizi, güneyde ise Akdeniz yer alır. Bu özel konum yurdumuzda iklim çeşitliliğini meydana getirir. Karadeniz ikliminde her mevsim bol yağış görülür ve hava ılımandır. Akdeniz ikliminde yazlar sıcak ve kurak, kışlar ise ılık ve yağışlı geçer. Denizden uzak iç ve doğu bölgelerimizde ise karasal iklim hâkimdir; yazlar sıcak, kışlar ise çok soğuk ve kar yağışlıdır. Şurası aklında kalsın tamam mı: Marmara Bölgesi ve çevresinde ise bu iklimlerin özelliklerini bir arada taşıyan geçiş iklimi yaşanır; ülkemizde tek bir iklim tipi yoktur.",
  example:
    "Bir hafta sonu yurdumuzun farklı köşelerine yolculuk yaptığını hayal et. Rize'deysen yanında mutlaka bir şemsiye bulundurursun; çünkü Karadeniz'de yağmur yıl boyu bereketiyle yağar ve yamaçlar yemyeşil kalır. Antalya kıyılarına indiğinde ise yaz mevsiminde şemsiye yağmurdan değil, yakıcı güneşten korunmak içindir; yağışlar kış aylarına kalır. Ankara veya Erzurum'a doğru iç kesimlere gittiğinde ise havanın aniden sertleştiğini hissedersin; kışın lapa lapa kar yağar ve hava soğur. İstanbul ve Marmara çevresi ise bu iklimlerin birbiriyle kucaklaştığı tatlı bir geçiş noktasıdır. Denize yakın olmak havayı ılımanlaştırırken, denizden uzaklaşıp yükselti arttıkça karasallık ve soğukluk belirginleşir. Coğrafi konum ve yer şekilleri yurdumuzun her köşesine ayrı bir güzellik katar.",
  hint: "gold",
  warning:
    "Türkiye'nin her yerinde aynı hava şartlarının ve iklimin yaşandığını düşünmek yanıltıcı bir tuzaktır. Kıyı şeritleri ile iç kesimlerin iklimi birbirinden çok farklıdır. Karadeniz'in her mevsim süren yağışlarını, Akdeniz'in kurak ve sıcak yazlarıyla karıştırmamaya dikkat et. Marmara'daki geçiş ikliminin de kendine has dengeli bir özellik taşıdığını güvenle aklında tutabilirsin.",
  life:
    "Bunu farklı bir şehre geziye giderken bavul hazırlarken de hemen görürsün. Karadeniz turuna çıkıyorsan çantana mutlaka bir yağmurluk koyarsın. Akdeniz kıyılarına giderken ince ve pamuklu giysiler tercih edersin. Kışın İç Anadolu veya Doğu Anadolu'ya yolculuk yapacaksan kalın bir mont, bere ve eldiven alırsın. Aynı vatan toprağı içinde üç farklı bavul hazırlığı yaparsın. Coğrafi konumu ve hava tahminlerini incelemek, günlük hayatını kolaylaştıran harika bir alışkanlıktır.",
  recap: [
    "Türkiye üç tarafı deniz olan bir ülkedir ve iki kıtayı birbirine bağlar.",
    "Karadeniz her mevsim yağışlı, Akdeniz yazın kurak, karasal iklim kışın soğuktur.",
    "Marmara geçiş iklimidir. Ülkede tek iklim yoktur.",
  ],
  conceptSeal: "Konum, Türkiye'yi hem köprü hem de iklim çeşitliliği yapan yerdir.",
  voiceSeal: "Bir bölgenin denizini ve yağış düzenini ayrı cümleyle söylersin.",
  outcomes: [
    "Türkiye Asya ile Avrupa arasında, üç tarafı deniz bir ülkedir.",
    "Karadeniz, Akdeniz ve karasal iklim birlikte görülür.",
    "Marmara çevresinde geçiş iklimi vardır.",
  ],
  scene: "globe",
  parentNote:
    "Çocuğunuz Türkiye'nin üç tarafının deniz olduğunu ve iklimin bölgeden bölgeye değiştiğini anlatır. Karadeniz, Akdeniz, karasal ve Marmara geçişi ayrı tutulur.",

};

export const JUNIOR_SOSYAL_10 = juniorLessonFromScenario(JUNIOR_SOSYAL_10_SCENARIO);
