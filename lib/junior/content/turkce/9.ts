import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Paragrafta yardımcı fikirler. */
export const JUNIOR_TURKCE_9_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-9",
  title: "Paragrafta yardımcı fikirler",
  teaser:
    "Yardımcı fikir, ana fikri taşıyan küçük cümledir. Ana fikrin yerine geçmez. Kavramsal Anlayış, taşıyan cümle ile asıl yargıyı ayırır. İfade Gücü, hangi cümlenin yardımcı olduğunu söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün kelimelerin arasında nasıl bir yolculuk var, çünkü ana fikrin sağlam sütunları olan yardımcı fikirleri yakından tanıyacağız. Hiç güçlü bir düşünceyi savunduktan sonra onu desteklemek için peş peşe kanıtlar ve örnekler sıraladın mı? İşte o destekleyici cümleler yardımcı fikirdir. Bugün seninle ana fikri omuzlarında taşıyan yardımcı fikirlerin paragraftaki rolünü ve onları bulmanın püf noktalarını göreceğiz.",
  concept:
    "Yardımcı fikirler, ana düşünceyi açıklayan, belirginleştiren, geliştiren ve inandırıcı kılan yan düşüncelerdir. Bir paragrafta ana fikir daima bir tanedir; fakat onu destekleyen yardımcı fikirler birden fazladır. Ana fikir bir binanın sağlam çatısıysa, yardımcı fikirler o çatıyı dimdik ayakta tutan taşıyıcı kolonlardır. Yardımcı fikirler metinden çıkarılırsa ana fikir yalnız kalır; fakat ana fikir çıkarılırsa tüm metin anlamını yitirir. Şurası aklında kalsın tamam mı: Sınavlarda ve sorularda bu metinden hangisi çıkarılamaz veya hangisine değinilmemiştir soruları doğrudan yardımcı fikirleri bulmanı ister.",
  example:
    "Birlikte bir metin kuralım. Düzenli spor yapmak insan sağlığını korur ana fikrini ele alalım. Kalp kaslarını güçlendirir birinci yardımcı fikirdir. Stresi azaltıp zihni rahatlatır ikinci yardımcı fikirdir. Bağışıklık sistemini kuvvetlendirir üçüncü yardımcı fikirdir. Bu üç cümle de tek başına ana fikir değildir; hepsi birleşerek sporun sağlığa faydası çatısına güç verir. Yardımcı fikirlerden biri eksilse de ana fikir durur; fakat ana fikir olmasa bu üç cümle amaçsız kalırdı.",
  hint: "gold",
  warning:
    "Yardımcı bir düşünceyi ikinci bir ana fikir sanma yanılgısına düşmemelisin. Metinde asıl varılmak istenen sonuç tek bir tanedir. Sorularda hangisine değinilmiştir denildiğinde yardımcı fikri, metnin ana mesajı nedir denildiğinde ise ana fikri seçmelisin.",
  life:
    "Bir arkadaşını hafta sonu kütüphaneye gitmeye ikna ederken orada hem sakin bir çalışma ortamı var hem de aradığımız kaynak kitaplar bulunuyor dersin. Asıl amacın kütüphaneye gitmektir; sıraladığın nedenler ise senin ikna edici yardımcı fikirlerindir. Düşüncelerini kanıtlarla desteklemek konuşmalarını çok daha güçlü kılar.",
  recap: [
    "Yardımcı fikirler ana düşünceyi açıklayan ve destekleyen yan düşüncelerdir.",
    "Bir metinde tek bir ana fikir, birden fazla yardımcı fikir bulunur.",
    "Değinilmemiştir veya çıkarılamaz soruları yardımcı fikirleri hedefler.",
  ],
  conceptSeal: "Yardımcı fikir, ana fikri taşır. Yerine geçmez.",
  voiceSeal: "Hangi cümlenin yardımcı fikir olduğunu ve asıl yargıyı ayrı söylersin.",
  outcomes: [
    "Yardımcı fikir ana fikri taşır.",
    "Yardımcı fikir ana fikrin yerine geçmez.",
    "Bir paragrafta yardımcı fikir birden fazla olabilir.",
  ],
  scene: "support-idea",
  parentNote:
    "Çocuğunuz bu derste ana fikri destekleyen yardımcı fikirleri tespit eder. Bir düşünceyi savunurken arkasına sıraladığı gerekçelerin yardımcı fikir olduğunu evdeki sohbetlerde pekiştirebilirsiniz.",

};

export const JUNIOR_TURKCE_9 = juniorLessonFromScenario(JUNIOR_TURKCE_9_SCENARIO);
