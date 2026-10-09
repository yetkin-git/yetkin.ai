import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Solunum sistemi. */
export const JUNIOR_FEN_7_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-7",
  title: "Solunum sistemi",
  teaser:
    "Hava burundan akciğerdeki alveollere iner. Soluk alınca diyafram kasılır ve göğüs genişler. Kavramsal Anlayış, gaz alışverişinin yerini söyler. İfade Gücü, soluk alma ile soluk vermeyi ayırmandır.",
  welcome:
    "Hoş geldin! Hazırsan bugün zihnimizi harika bir bilim yolculuğuna çıkarıyoruz, çünkü aldığımız her nefeste içimizde gerçekleşen o muazzam hava trafiğini keşfedeceğiz. Hiç koşup merdiven çıktıktan sonra soluk alış verişinin hızlandığını fark ettin mi? Çalışan kaslarımız hemen daha çok oksijen ister. Bugün seninle havanın vücudumuza girişinden akciğerlerimizin derinliklerindeki minik odacıklara kadar olan yolunu tanıyacağız.",
  concept:
    "Solunum yolu; burun, yutak, gırtlak, soluk borusu, bronşlar ve akciğerlerden meydana gelir. Akciğerlerimizin içinde etrafı kılcal damarlarla sarılı alveol denen milyonlarca mikroskobik hava keseciği bulunur. Soluk aldığımızda diyafram kası kasılarak düzleşir ve göğüs kafesimiz genişler; böylece içeriye temiz hava dolar. Soluk verdiğimizde ise diyafram gevşeyip kubbeleşir, göğüs daralır ve hava dışarı atılır. Alveollerde oksijen kana geçerken, kandaki karbondioksit havaya aktarılır. Şurası aklında kalsın tamam mı: Akciğerlerimiz bir kas gibi kendi kendine şişip inmez; hacmi diyafram kası ve kaburgalar arası kaslar değiştirir.",
  example:
    "Şimdi burnundan derin ve sakin bir nefes al. Burnundaki kıllar ve mukus tabakası havadaki tozları süzer, havayı ısıtır ve nemlendirir. Temizlenen hava yutak ve gırtlaktan geçerek kıkırdak halkalı soluk borusuna iner. Soluk borusu ikiye ayrılarak sağ ve sol bronşa bağlanır. Akciğerin içinde bronşçuklar ağaç dalları gibi incelir ve uçlarındaki alveollere ulaşır. Alveollerin incecik duvarlarından geçen oksijen kırmızı kan hücrelerine biner. Karbondioksit ise nefes verme yoluyla aynı rotadan dışarı çıkar. Ağızdan nefes almak bu koruyucu filtreleri atladığı için burnumuz solunumun en sağlıklı kapısıdır.",
  hint: "gold",
  warning:
    "Akciğerlerin kendi kendine kasılıp şişen bir kas olduğunu sanabilirsin; oysa asıl kahraman diyafram ve kaburga kaslarımızdır. Diyafram kasılıp göğüs kafesini genişletince akciğere taze hava dolar. Gaz alışverişinin minik alveol keseciklerinde gerçekleştiğini her zaman hatırlayabilirsin.",
  life:
    "Bunu beden eğitimi dersinde ya da bisiklet sürerken hemen gözlemleyebilirsin. Yoruldukça burnundan derin nefesler almak kalbini ve kaslarını rahatlatır. Soğuk ve tozlu havalarda burnundan nefes alıp ağzını kapalı tutmak akciğerlerini korur. Arkadaşlarınla nefes tutma gibi tehlikeli oyunlara asla girmemeli, vücudunun temiz oksijen ihtiyacına daima saygı göstermelisin.",
  recap: [
    "Hava burundan başlayıp alveollere kadar uzanan bir yoldan ilerler.",
    "Soluk alınca diyafram kasılır ve göğüs genişler. Soluk verince diyafram gevşer.",
    "Oksijen alveollerden kana, karbondioksit ise kandan alveollere geçer.",
  ],
  conceptSeal: "Solunum, havanın akciğere girip oksijen ile karbondioksitin yer değiştirmesidir.",
  voiceSeal: "Soluk alma ve soluk vermede diyaframın ne yaptığını söylersin.",
  outcomes: [
    "Soluk alma ve soluk verme diyaframın hareketiyle olur.",
    "Gaz alışverişi alveollerde gerçekleşir.",
    "Oksijen kana geçer, karbondioksit dışarı verilir.",
  ],
  scene: "body",
  parentNote:
    "Çocuğunuz soluk alınca diyaframın kasıldığını ve gaz alışverişinin alveolde olduğunu anlatır. Burnun havayı süzmesi ve nefes tutma oyununun sakıncası evde de konuşulabilir.",

};

export const JUNIOR_FEN_7 = juniorLessonFromScenario(JUNIOR_FEN_7_SCENARIO);
