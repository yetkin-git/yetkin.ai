import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Sindirim sistemi. */
export const JUNIOR_FEN_4_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-4",
  title: "Sindirim sistemi",
  teaser:
    "Fiziksel sindirim besini küçük parçalara ayırır. Kimyasal sindirim enzimle yapıtaşına böler. Kavramsal Anlayış, ikisini karıştırmamaktır. İfade Gücü, lokmanın ağızdan ince bağırsağa yolunu söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün önümüzde merak uyandıran ne var, çünkü lezzetli bir elmayı ısırdığında vücudunda başlayan büyüleyici yolculuğu keşfedeceğiz. Dişlerinle çiğnerken ve tükürüğün lokmayı ıslatırken iki farklı sindirim türünün aynı anda çalıştığını fark etmiş miydin? Bugün seninle besinlerin hücrelerimize ulaşana kadar geçtiği durakları adım adım izleyeceğiz.",
  concept:
    "Fiziksel sindirim, besinleri kimyasal yapısını bozmadan daha küçük parçalara ayırır. Ağızda dişlerle çiğnemek ve midedeki kasların çalkalama hareketi fiziksel sindirimdir. Kimyasal sindirim ise enzimler yardımıyla besinleri kana geçebilecek en küçük yapıtaşlarına böler. Tükürük sıvısındaki enzimler karbonhidratların kimyasal sindirimini ağızda başlatır. Mide öz suyu proteinleri parçalar. İnce bağırsakta ise pankreas öz suyuyla tüm besinlerin kimyasal sindirimi tamamlanır ve emilim başlar. Şurası aklında kalsın tamam mı: Kimyasal sindirimi özel enzimler yapar; karaciğerin ürettiği safra sıvısı bir enzim değildir, yağları sadece damlacıklara böler.",
  example:
    "Bir lokma ekmek aldığını düşün. Dişlerin ekmeği küçük kırıntılara böler; bu fiziksel sindirimdir. Tükürüğün içindeki enzimler ekmekteki nişastayı yapıtaşlarına ayırmaya başlar; bu da kimyasal sindirimdir. Yutkununca lokma yemek borusundan mideye kayar. Mide kasılıp gevşeyerek besini çorba kıvamına getirir. Ardından ince bağırsağa geçen karışıma karaciğerden safra, pankreastan sindirim enzimleri gelir. Safra yağı küçük damlacıklara çevirerek enzimlerin işini kolaylaştırır. Enzimler besinleri en küçük parçalarına ayırır ve villus denen minik uzantılarla kana emilir. Kalın bağırsak kalan su ve mineralleri geri emer; posa ise vücuttan atılır.",
  hint: "trap",
  warning:
    "Safrayı bir enzim sanıp yanılma; safra yağları sadece küçük damlacıklara ayırarak fiziksel yardım sunar. Kimyasal parçalamayı enzimler tamamlar. Besinlerin kana geçtiği emilim durağının da mide değil, ince bağırsak olduğunu güvenle aklında tutabilirsin.",
  life:
    "Bunu yemek yerken her lokmanda hatırlayabilirsin. Yemeği aceleyle çiğnemeden yutarsan dişlerinin yapacağı fiziksel sindirimi midene yüklersin ve miden yorulur. Lokmaları sakin sakin, iyice çiğneyerek yemek sindirimi çok rahatlatır. Karın bölgesinde şiddetli bir ağrı hissettiğinde de kendi başına ilaç almak yerine mutlaka bir büyüğüne haber vermelisin.",
  recap: [
    "Fiziksel sindirim besini küçük parçaya ayırır. Kimyasal yapı değişmez.",
    "Kimyasal sindirim enzimle olur. Safra enzim değildir.",
    "Emilim ince bağırsakta olur. Kalın bağırsak su alır ve posayı iletir.",
  ],
  conceptSeal: "Sindirim, fiziksel parçalama ile kimyasal yapıtaşına ayırmanın birlikte yürümesidir.",
  voiceSeal: "Lokmanın organ sırasını ve safra ile enzimin farkını söylersin.",
  outcomes: [
    "Fiziksel sindirim besini küçük parçalara ayırır.",
    "Kimyasal sindirim enzimlerle gerçekleşir.",
    "Besinlerin emilimi ince bağırsakta olur.",
  ],
  scene: "body",
  parentNote:
    "Çocuğunuz çiğnemeyi fiziksel, enzim işini kimyasal sindirim diye ayırır. Safra enzim değildir. Emilimin ince bağırsakta olduğunu evde lokmanın yolu üzerinden anlatabilir.",

};

export const JUNIOR_FEN_4 = juniorLessonFromScenario(JUNIOR_FEN_4_SCENARIO);
