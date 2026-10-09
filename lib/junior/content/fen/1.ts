import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri, 1. hafta. Güneş sistemi ve gezegenler. */
export const JUNIOR_FEN_1_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-1",
  title: "Güneş sistemindeki gezegenler",
  teaser:
    "Güneş bir yıldızdır ve sistemin merkezindedir. Çevresinde sekiz gezegen dolanır. Kavramsal Anlayış, gezegeni uydu ve cüce gezegenden ayırır. İfade Gücü, sırayı Güneş'ten dışa doğru söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç gece gökyüzünde parlayan bir ışığın yıldız mı, yoksa bir gezegen mi olduğunu merak ettin mi? Bugün seninle Güneş sistemimizin muhteşem ailesini yakından tanıyacağız. Güneş, sistemin tam merkezinde parıldayan dev bir yıldızdır. Gezegenler ise onun çevresinde belirli yörüngelerde yol alır. Güzel dünyamız bu ailedeki üçüncü gezegendir; Ay ise Dünya'mızın sadık uydusudur.",
  concept:
    "Güneş sistemi, Güneş ve onun çevresinde dolanan gök cisimlerinden oluşur. Güneş bir yıldızdır, kesinlikle gezegen değildir. Gezegen ise bir yıldızın çevresinde dolanan büyük gök cismidir. Güneş'e en yakın dört gezegen; Merkür, Venüs, Dünya ve Mars'tır. Bu ilk dörtlüye iç gezegenler veya karasal gezegenler denir. Daha uzakta yer alan diğer dört gezegen ise Jüpiter, Satürn, Uranüs ve Neptün'dür. Bunlara da dış gezegenler veya gaz devleri denir. Şurası aklında kalsın tamam mı: Güneş'ten dışa doğru sıraladığımızda tam sekiz gezegen vardır. Ay bir uydudur ve gezegenler sırasına dahil edilmez.",
  example:
    "Parmağınla sırayı tek tek sayalım. Bir, Merkür; iki, Venüs; üç, Dünya; dört, Mars. Beş, Jüpiter; altı, Satürn; yedi, Uranüs ve sekiz, Neptün. Dünya üçüncü sıradadır ve üzerinde yaşam olan yuvamızdır. Jüpiter sistemin en büyük devidir. Satürn'ün çevresinde göz kamaştıran halkalar uzanır. Ay ise Dünya'mızın çevresinde dolanan bir uydudur. Plüton eskiden gezegen sayılırdı, bugün ise cüce gezegen sınıfındadır. Bu yüzden sekiz gezegenlik sıraya onu eklemiyoruz. İlk dört iç gezegen kayaç yapılıyken, dıştaki dört dev gaz bakımından zengindir.",
  hint: "gold",
  warning:
    "İçteki dört gezegeni kayaç yüzeyli, dıştaki dev gezegenleri ise gaz yapılı diye gruplarsan sıra aklında çok daha kolay kalır. Merkür Güneş'e en yakın, Neptün ise en uzak gezegendir. Ay'ı bu listeye asla bir gezegen olarak eklememeyi her zaman hatırla; çünkü Ay, Dünya'mızın etrafında dolanan sadık bir uydudur.",
  life:
    "Bunu açık bir gecede gökyüzüne bakarken de kullanırsın. Gökyüzünde kırpışmadan sabit parlayan ışıklar çoğu kez birer gezegendir. Dünya senin evindir ve üçüncü sırada sakince döner. Gökyüzündeki Ay'ı görünce, onun Dünya'nın etrafında dönen bir uydu olduğunu sevgiyle hatırlarsın. Şimdi Güneş'ten dışa doğru sekiz gezegeni derin bir nefes alıp sırayla say.",
  recap: [
    "Güneş sistemin merkezindeki yıldızdır; gezegen değildir.",
    "Sekiz gezegen Güneş'ten dışa doğru Merkür, Venüs, Dünya, Mars, Jüpiter, Satürn, Uranüs ve Neptün'dür.",
    "Ay bir uydudur, Plüton ise cüce gezegendir; ikisi de sekiz ana gezegenin yerine geçmez.",
  ],
  conceptSeal: "Güneş sisteminde merkezde bir yıldız ve çevresinde sekiz gezegen vardır.",
  voiceSeal: "Gezegen sırasını Güneş'ten dışa doğru kendi sözlerinle sayarsın.",
  outcomes: [
    "Güneş bir yıldızdır ve sistemin merkezindedir.",
    "Güneş sisteminde sekiz gezegen vardır.",
    "Ay bir gezegen değil, Dünya'nın uydusudur.",
  ],
  scene: "planets",
  parentNote:
    "Çocuğunuz bu konuda Güneş'in yıldız olduğunu ve sekiz gezegenin sırasını anlatır. Ay'ın bir uydu, Plüton'un ise cüce gezegen olduğunu ayırt etmesi beklenir. Evde sekiz gezegeni sırayla sayarak pekiştirebilirsiniz.",

};

export const JUNIOR_FEN_1 = juniorLessonFromScenario(JUNIOR_FEN_1_SCENARIO);
