import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 10 Democracy. Hak, sorumluluk ve sınıf kuralı. */
export const JUNIOR_ING_MAIN_20_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-20",
  title: "Hak, sorumluluk ve sınıf kuralı",
  teaser:
    "Right haktır. Responsibility sorumluluktur. Sınıf kuralı ikisini birlikte taşır. Kavramsal Anlayış, hakkı sorumluluktan ayırır. İfade Gücü, bir sınıf kuralını hak ve sorumluluk olarak söylemandır.",
  welcome:
    "Merhaba! İngilizce dünyasına hoş geldin, bugün seninle birlikte huzurlu, adil ve mutlu bir sınıf ortamının en önemli sırrını keşfediyoruz! Bir sınıfta parmak kaldırıp düşünceni özgürce söylemek senin en doğal hakkındır; öğretmenini ve konuşan sıra arkadaşını saygıyla dinlemek ise senin en kıymetli sorumluluğundur. İşte bir arada yaşamanın güzelliği haklar ve sorumlulukların dengesinde saklıdır. Bugün seninle 'right' yani hak ile 'responsibility' yani sorumluluk kavramlarını İngilizce öğrenecek, 'raise your hand' ve 'respect your friends' gibi altın kurallarla sınıfımızı güzelleştireceğiz.",
  concept:
    "'Right' kelimesi hak anlamına gelir ve bir birey olarak yapmaya yetkili olduğun, sana değer katan güzel şeyleri anlatır: 'I have the right to speak' konuşma hakkım var, 'I have the right to ask questions' soru sorma hakkım var demektir. 'Responsibility' ise sorumluluk demektir ve toplumun, sınıfın huzuru için üstlendiğin özenli görevlerdir: 'I have the responsibility to listen to others' başkalarını dinleme sorumluluğum var, 'We have the responsibility to keep the class clean' sınıfı temiz tutma sorumluluğumuz var anlamına gelir. Sınıf kuralları bu iki değeri dengede tutar: 'Raise your hand before speaking' konuşmadan önce parmağını kaldır, 'Respect your friends' arkadaşlarına saygı göster, 'Listen carefully' dikkatle dinle demektir. Şurası aklında kalsın tamam mı: Haklar özgürlüğümüzdür, sorumluluklar ise birbirimize duyduğumuz sevgi ve saygının teminatıdır.",
  example:
    "Sınıfımızın duvarındaki panoya üç altın kural yazalım: 'First, we raise our hands to speak. Second, we listen to our teacher and classmates respectfully. Third, we keep our classroom tidy and clean.' Hak ile sorumluluğu yan yana koyalım: 'I have the right to play during break time, but I have the responsibility to play safely without hurting anyone.' Bir arkadaşının sözünü kesmeden beklemek büyük bir erdemdir: 'I have the responsibility to wait for my turn.' Söz sırası sana geldiğinde ise özgüvenle 'I have the right to express my opinion' dersin. Birbirimize saygı duymak sınıfımızı güneş gibi aydınlatır!",
  hint: "trap",
  warning:
    "Hak ile sorumluluğu birbirine karıştırmamaya özen gösterebilirsin: Söz almak ve soru sormak bir haktır; konuşanı saygıyla dinlemek ve sıranı beklemek ise bir sorumluluktur. Haklarımızın başkalarının haklarına zarar vermediği sürece geçerli olduğunu, yani 'I have the right to speak' derken kimsenin sözünü kesmememiz gerektiğini her zaman hatırla; çünkü hak ve sorumluluk el ele yürüdüğünde sınıfımız kocaman ve mutlu bir aile olur.",
  life:
    "Yarın derste öğretmenin bir soru sorduğunda heyecanla parmağını kaldır ve içinden 'I raise my hand' de. Yanındaki arkadaşın konuşurken göz teması kurarak 'I listen respectfully' cümlesini aklından geçir. Teneffüste yerdeki bir kâğıdı çöp kutusuna atarken 'We keep our classroom clean' de. Akşam eve geldiğinde ise bir hakkını ve bir sorumluluğunu İngilizce olarak ailene gururla anlat.",
  recap: [
    "Right haktır; konuşmak, öğrenmek ve soru sormak temel haktır.",
    "Responsibility sorumluluktur; dinlemek, sırasını beklemek sorumluluktur.",
    "Sınıf kuralları hak ve sorumlulukları adil bir dengede buluşturur.",
  ],
  conceptSeal: "Hak yapabildiğin şeydir. Sorumluluk üstlendiğin iştir.",
  voiceSeal: "Bir sınıf kuralını hak ve sorumluluk olarak iki cümlede söylersin.",
  outcomes: [
    "Right hak, responsibility sorumluluktur.",
    "El kaldırmak ve dinlemek sınıf kuralıdır.",
    "Hak ile sorumluluk birlikte durur.",
  ],
  scene: "ballot",
  parentNote:
    "Çocuğunuz hakkı right, sorumluluğu responsibility ile ayırır. Konuşmak hak, dinlemek sorumluluktur. Evde bir kuralı bu iki sözle kurdurabilirsiniz.",

};

export const JUNIOR_ING_MAIN_20 = juniorLessonFromScenario(JUNIOR_ING_MAIN_20_SCENARIO);
