import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Eş anlamlı, zıt anlamlı ve yakın anlamlı sözcükler. */
export const JUNIOR_TURKCE_2_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-2",
  title: "Eş anlam, zıt anlam ve yakın anlamlı sözcükler",
  teaser:
    "Eş anlamlı sözcükler aynı işi söyler. Zıt anlamlılar karşıttır. Yakın anlamlılar benzerdir ama her cümlede yer değiştirmez. Kavramsal Anlayış, üç dalı ayırır. İfade Gücü, bir çifti doğru dala koymaktır.",
  welcome:
    "Hoş geldin! Hazırsan bugün kelimelerin ve cümlelerin renkli dünyasına adım atıyoruz, çünkü bugün kelimeler arasındaki büyüleyici dostluk ve karşıtlık ilişkilerini keşfedeceğiz. Hiç cevap yerine yanıt dediğinde cümlenin hiçbir anlam kaybına uğramadığını fark ettin mi? Bugün seninle sözcüklerin akrabalık bağlarını çözeceğiz. Kimi sözcük birbiriyle ikizdir, kimi birbirine tamamen karşıdır, kimi de birbirine çok yakındır ama her yerde yer değiştirmez.",
  concept:
    "Eş anlamlı yani anlamdaş sözcükler, yazılışları farklı olsa da aynı anlamı eksiksiz taşır. Cevap ve yanıt, kara ve siyah böyledir. Zıt yani karşıt anlamlı sözcükler ise anlamca birbirinin tam tersi olan durumları ifade eder. Açık ile kapalı, büyük ile küçük birbirinin zıttıdır. Yakın anlamlı sözcükler ise birbirini andıran fakat aralarında küçük anlam ayrıntıları bulunan sözcüklerdir. Örneğin basmak ve çiğnemek, doğru ile dürüst yakın anlamlıdır. Şurası aklında kalsın tamam mı: Yakın anlamlı sözcükler, eş anlamlılar gibi her cümlede birbirinin yerine rahatça konulamaz.",
  example:
    "Gel birlikte cümleler üzerinde görelim. Kara tahta ile siyah tahta aynı varlığı söyler; bu tam bir eş anlamlılıktır. Kapı açık ile kapı kapalı birbirinin tam tersidir; bu zıt anlamlılıktır. Güzel bir şarkı ile hoş bir şarkı ise yakın anlamlıdır. Hoş sözcüğü kulağa tatlı geleni, güzel sözcüğü ise genel bir niteliği anlatır. Başka bir örneğe bakalım: Erken gel ile geç gel zıttır. Erken gel ile çabuk gel ise yakın durur; çünkü çabuk hızı, erken ise vakti anlatır. Cümleyi okurken bu ince farkı rahatça hissedersin.",
  hint: "gold",
  warning:
    "Yakın anlamlı iki sözcüğü her cümlede birbirinin ikizi gibi düşünmemeye dikkat edebilirsin. Çiçekleri çiğnedi cümlesi ile çiçeklere bastı cümlesi aynı şiddette değildir; çiğnemek ezmeyi de içerir. Önce sözcükler birebir aynı anlamı mı taşıyor, yoksa sadece birbirini mi andırıyor diye bakarsan en doğru sonuca ulaşırsın.",
  life:
    "Bunu arkadaşlarınla konuşurken dilini zenginleştirmek için kullanırsın. Bir arkadaşına yanıt yerine cevap dersen aynı düşünceyi aktarırsın. Bir konuda doğruyu söylerken hem doğru hem dürüst bir arkadaş olmanın inceliğini seçersin. Kelime dağarcığında eş, zıt ve yakın anlamlı sözcüklerin olması kendini çok daha berrak ifade etmeni sağlar.",
  recap: [
    "Eş anlamlı sözcükler farklı yazılır ama aynı anlamı taşır.",
    "Zıt anlamlı sözcükler anlamca birbirinin tam karşısındadır.",
    "Yakın anlamlılar birbirini andırır ancak her cümlede birbirinin yerine geçmez.",
  ],
  conceptSeal: "Eş anlam aynıdır. Zıt anlam karşıttır. Yakın anlam benzerdir, ikiz değildir.",
  voiceSeal: "Bir sözcük çiftini eş, zıt veya yakın diye adlandırırsın.",
  outcomes: [
    "Eş anlamlı sözcükler aynı anlamı taşır.",
    "Zıt anlamlı sözcükler karşıt anlamlıdır.",
    "Yakın anlamlı sözcükler her cümlede yer değiştirmez.",
  ],
  scene: "word-tree",
  parentNote:
    "Çocuğunuz bu derste eş anlamlı, zıt anlamlı ve yakın anlamlı sözcüklerin farkını kavrar. Yakın anlamlıların her cümlede birbirinin yerine geçemeyeceğini günlük konuşmalarda birlikte deneyimleyebilirsiniz.",

};

export const JUNIOR_TURKCE_2 = juniorLessonFromScenario(JUNIOR_TURKCE_2_SCENARIO);
