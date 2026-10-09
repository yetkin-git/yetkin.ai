import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe, 1. hafta. Sözcükte gerçek, mecaz ve terim anlam. */
export const JUNIOR_TURKCE_1_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-1",
  title: "Gerçek, mecaz ve terim anlam",
  teaser:
    "Gerçek anlam, sözcüğün somut ilk anlamıdır. Mecaz anlam, benzetmeyle kurulan yeni anlamdır. Terim anlam, bir bilimin özel anlamıdır. Kavramsal Anlayış, üçünü ayırır. İfade Gücü, aynı sözcüğü üç örnekte söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç bir arkadaşının yüzü düştü dendiğinde gerçekten yüzünün yere düştüğünü düşündün mü? Elbette hayır! O cümlede yüz, bir organı değil, yaşanan bir üzüntüyü anlatır. Bugün seninle kelimelerin gerçek, mecaz ve terim anlamlarını adım adım keşfedeceğiz. Aynı sözcük, girdiği cümleye göre bambaşka bir göreve bürünür. Cümleyi dikkatle okuduğunda, kelimenin hangi anlam elbisesini giydiğini sen de hemen fark edersin.",
  concept:
    "Gerçek anlam, bir sözcüğün aklımıza ilk gelen, herkesçe bilinen somut ve temel anlamıdır. Örneğin göz, görmemizi sağlayan duyu organımızdır; bu gerçek anlamdır. Mecaz anlam ise sözcüğün gerçek anlamından tamamen uzaklaşarak benzetme yoluyla kazandığı yeni ve soyut anlamdır. Gözü açık çocuk dediğimizde, uyanık ve dikkatli bir çocuğu anlatırız; burada göz artık organ anlamında değildir. Terim anlam ise bir bilim, sanat, spor veya meslek dalına özgü özel kavramları karşılayan anlamdır. Örneğin matematikte kök, bir sayının kökünü anlatır; bitkinin toprak altındaki kısmı ise gerçek anlamdır. Şurası aklında kalsın tamam mı: Bir sözcüğün anlamını tek başına sözlük değil, içinde bulunduğu cümlenin bütünü belirler.",
  example:
    "Gel seninle kök sözcüğünü üç farklı cümlede dinleyelim. Ağacın kökü toprağın derinliklerindedir; bu gerçek anlamdır. Sorunun kökü acele etmekmiş dediğimizde ise mecaz anlamdır; çünkü kök burada temel sebep anlamına gelir. Dokuzun karekökü üçtür dediğimizde ise terim anlamdır; çünkü karekök burada matematiğin özel bir terimidir. Bir diğer örneğe bakalım. Ağır taş elde zor durur; bu gerçek anlamdır. Ağır konuştu, yani saygılı ve temkinli konuştu dediğimizde mecaz anlamdır. Fen dersinde ağırlık bir kuvvettir dediğimizde ise terim anlamdır. Gördüğün gibi aynı sözcük, üç ayrı cümlede üç farklı zenginlik taşır.",
  hint: "trap",
  warning:
    "Mecazlı bir anlatımı ilk duyduğunda hemen gerçek anlam sanmak aceleci bir yaklaşımdır. Yüzü düştü cümlesinde yüz yere düşmez; bir üzüntü anlatılır. Bilimsel bir terimi de günlük hayattaki sıradan bir eşyayla karıştırmamaya özen göster. Cümleyi başından sonuna sakin bir nefesle oku; kelimenin o cümlede ne anlatmak istediğini güvenle fark edeceksin.",
  life:
    "Bunu günlük sohbetlerinde de keyifle fark edersin. Bir arkadaşın kulağı deliktir dendiğinde kulağında delik aramazsın; haberleri çok iyi takip ettiğini hemen anlarsın. Bu mecaz anlamdır. Doktor muayenede tansiyon dediğinde bu bir sağlık terimidir. Sofradaki tuz ise gerçek anlamıyla durur. Cümleler değiştikçe kelimelerin sana sunduğu anlam zenginliği de güzelleşir.",
  recap: [
    "Gerçek anlam, sözcüğün akla ilk gelen somut anlamıdır.",
    "Mecaz anlam, benzetmeyle kurulan soyut ve yeni anlamdır.",
    "Terim anlam; bilim, sanat ve meslek alanlarının özel anlamıdır.",
  ],
  conceptSeal: "Sözcüğün anlamını cümle seçer. Gerçek, mecaz ve terim ayrı işlerdir.",
  voiceSeal: "Aynı sözcüğü üç cümlede hangi anlamla kurduğunu ayrı ayrı söylersin.",
  outcomes: [
    "Gerçek anlam, sözcüğün somut ilk anlamıdır.",
    "Mecaz anlam, benzetme yoluyla kazanılan anlamdır.",
    "Terim anlam, bir bilimin özel anlamıdır.",
  ],
  scene: "meaning",
  parentNote:
    "Çocuğunuz bu derste bir sözcüğün gerçek, mecaz ve terim anlamını cümle içindeki kullanımına bakarak ayırt eder. Evde günlük deyimleri ve terimleri birlikte konuşarak kelime hazinesini pekiştirebilirsiniz.",

};

export const JUNIOR_TURKCE_1 = juniorLessonFromScenario(JUNIOR_TURKCE_1_SCENARIO);
