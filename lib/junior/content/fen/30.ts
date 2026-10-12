import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Ayna çeşitleri. FB.6.4.3. */
export const JUNIOR_FEN_30_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-30",
  title: "Ayna çeşitleri",
  teaser:
    "Düz ayna görüntüyü aynı boyda verir. Çukur ayna yakını büyütebilir, tümsek ayna geniş alan gösterir. Kavramsal Anlayış, üç yüzeyi görevle ayırır. İfade Gücü, bir aracı doğru aynayla eşlemektir.",
  welcome:
    "Merhaba çocuklar, hepiniz hoş geldiniz! Banyo aynasında boyun değişmez, makyaj aynası yüzünü büyük gösterebilir, otomobilin yan aynası ise arkadaki yolu geniş tutar. Üçü de aynadır ama yüzeyleri aynı değildir. Bugün düz, çukur ve tümsek aynayı bir deney masasında ayıracağız. Görüntüyü gözlemlemek, hangi yüzeyin ne işe yaradığını söyler.",
  concept:
    "Düz aynada yüzey düzdür. Görüntü sanaldır, boyu cismin boyuna eşittir ve ayna düzlemine göre simetriktir. Çukur aynada yüzey içeri doğru çöküktür. Cisim çok yakınsa görüntü büyük görünebilir; bu yüzden diş hekimi ve bazı makyaj aynaları çukur yüzey kullanır. Tümsek aynada yüzey dışarı doğru bombedir. Görüntü küçük olur ama görüş alanı geniştir; market köşesi ve araç yan aynası buna örnektir. Pratik kural: Düz ayna boyu korur, çukur ayna yakını büyütebilir, tümsek ayna alanı genişletir.",
  example:
    "Masada 1 düz, 1 çukur ve 1 tümsek ayna olsun. Kalemin boyu düz aynada aynı kalır. Çukur aynaya 5 santimetre yaklaştırdığında kalem büyük görünür. Tümsek aynada aynı kalem küçük durur ama arkasındaki 2 kapı birden kadraja girer. Araçtaki uyarı yazısı, tümsek aynadaki uzaklığın olduğundan farklı görünebileceğini hatırlatır. Deneyde değişen değişken ayna türü, gözlenen sonuç görüntünün boyu ve alanıdır.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Tümsek aynanın her şeyi büyüttüğünü sanmak tuzaktır; o ayna küçültür ama alanı açar. Çukur aynayı her uzaklıkta aynı büyüteç sanmak da eksiktir. Düz aynada sağ ile solun yer değiştirmesini boy değişimi sanmak ayrı bir karışıklıktır. Ayna çeşitleri konusunda kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu evdeki düz aynada ve kapı dürbününde kullanırsın. Market koridorunun köşesindeki tümsek ayna geniş bakış içindir. Diş hekiminin küçük çukur aynası dişin yakından görünmesini sağlar. Okul çantandaki metal kaşık da iç ve dış yüzüyle iki yüzeyi hatırlatır.",
  recap: [
    "Düz ayna görüntüyü aynı boyda verir.",
    "Çukur ayna yakın cismi büyütebilir.",
    "Tümsek ayna görüntüyü küçültür ve görüş alanını genişletir.",
  ],
  conceptSeal: "Ayna türü, görüntünün boyunu ve görüş alanını değiştirir.",
  voiceSeal: "Bir aracı düz, çukur ya da tümsek aynayla eşlersin.",
  outcomes: [
    "Düz ayna boyu korur.",
    "Çukur ayna yakını büyütebilir.",
    "Tümsek ayna alanı genişletir.",
  ],
  scene: "mirror",
  parentNote:
    "Çocuğunuz düz, çukur ve tümsek aynayı görüntü boyuyla ayırır. Araç yan aynasının tümsek olduğunu söylemesi beklenir.",
};

export const JUNIOR_FEN_30 = juniorLessonFromScenario(JUNIOR_FEN_30_SCENARIO);
