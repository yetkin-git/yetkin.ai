import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Başkasının istatistiksel yorumunu tartışma. */
export const JUNIOR_MAT_37_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-37",
  title: "Başkasının istatistiksel yorumunu tartışma",
  teaser: "Bir grafik iddia taşır. Kavramsal Anlayış, eksen, örneklem ve başlığı birlikte okumaktır. İfade Gücü, eksik ölçeği veya dar grubu nazikçe tartışmaktır.",
  welcome: "Merhaba sevgili çocuklar! Bugün başkasının grafiğini tartışacağız. Okul panosundaki sütun, bir iddiayı resim gibi gösterir. Resim doğru kurulmamışsa sonuç da kayar.",
  concept: "İstatistiksel yorum, veriden çıkan cümledir. Tartışmak, cümleyi eksen ve grupla denetlemektir. Eksen 0'dan başlamıyorsa fark olduğundan büyük görünür. Yalnızca bir sınıfı ölçüp bütün okulu söylemek, örneklemi daraltır. Başlık, grafiğin neyi saydığını söyler.",
  example: "Bir afiş, 8 ve 9 puanı yan yana koyup 9'u dev gibi çizer. Eksen 7'den başlıyorsa 1 puanlık fark dağ gibi durur. Eksen 0'dan başlasa iki sütun birbirine yakın görünür. Afiş yalnızca 6 kişilik bir grubu ölçmüşse bütün okul için aynı cümle kurulamaz.",
  hint: "trap",
  warning: "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Yüksek sütun her zaman büyük fark demek değildir. Önce eksenin başlangıcını oku. Sonra kaç kişinin ölçüldüğüne bak. Başlık başka şeyi sayıyorsa sonucu kendi sorunmuş gibi alma.",
  life: "Bunu okul bahçesindeki duyuru panosunda görürsün. Kutudan çıkan anket kâğıdı az kişiyse sonucu bütün şehre yayma. Grafiği tartışmak, sayıyı inkâr etmek değildir.",
  recap: [
    "Grafik bir iddia taşır.",
    "Eksen 0'dan başlamıyorsa fark şişer.",
    "Dar grup, bütün topluluk değildir.",
  ],
  conceptSeal: "Yorum, eksen ve örneklem okunmadan sonuç sayılmaz.",
  voiceSeal: "Eksen 7'den başlayan afişte 1 puanlık farkın şiştiğini dersin.",
  outcomes: [
    "Grafik bir istatistiksel iddiadır.",
    "Eksen başlangıcı farkı değiştirir.",
    "Dar örneklem genellenmez.",
    "Başkasının istatistiksel yorumunu tartışma kuralı bu derste yeni bir istisna açmaz.",
    "37 numaralı örnek, ikinci bir kurala dönüşmez.",
    "Okul defterindeki adım, bahçedeki ölçümle aynı kuralı taşır.",
  ],
  scene: "chart",
  parentNote: "Çocuğunuz ekseni 7'den başlayan grafikte farkın şiştiğini söyler. 6 kişilik anketi bütün okul sanmaz. Grafiği tartışırken sayıyı inkâr etmez.",
};

export const JUNIOR_MAT_37 = juniorLessonFromScenario(JUNIOR_MAT_37_SCENARIO);
