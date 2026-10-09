import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 3 Downtown. Present continuous. */
export const JUNIOR_ING_MAIN_5_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-5",
  title: "Şehirde şu an ne oluyor",
  teaser:
    "Şu anda olan iş, am is are ve fiilin ing haliyle söylenir. Buna present continuous denir. Kavramsal Anlayış, şimdi ile her günü ayırır. İfade Gücü, sokakta gördüğün bir kişiyi İngilizce anlatmandır.",
  welcome:
    "Merhaba! İngilizce dünyasına hoş geldin, bugün seninle şehrin capcanlı caddelerine çıkıyoruz ve tam şu anda etrafımızda olup biten hareketli anları izliyoruz. Birisi caddede yürüyor, bir başkası vitrinlere bakıp alışveriş yapıyor, durakta ise insanlar otobüs bekliyor. Tüm bu olaylar tam gözümüzün önünde, yani şu anda gerçekleşiyor. Bugün seninle şimdiki zamanı, yani 'present continuous' kalıbını öğreneceğiz. Her gün yaptığımız genel alışkanlıklar başka bir kalıptır; şu anda gerçekleşen hareketli anlar ise bambaşka ve neşeli bir kalıpla söylenir.",
  concept:
    "'Present continuous', tam şu saniyede gerçekleşen olayları anlatmak için kullanılır. 'I am walking' dediğinde, şu anda yürüyorum anlamına gelir. 'She is shopping' onun şu anda alışveriş yaptığını, 'They are waiting' ise onların otobüs beklediğini gösterir. Bu zamanın formülü çok basittir: Özneden sonra 'am', 'is' veya 'are' yardımcı fiillerinden biri gelir ve hemen ardından fiilimize o enerjik '-ing' eki eklenir. Cümlede gördüğümüz 'now' yani şimdi ve 'at the moment' yani şu anda ifadeleri bu zamanın en güzel işaretleridir. Şurası aklında kalsın tamam mı: Her gün yapılan işlerde fiil sade kalırken, tam şu anda olan işlerde mutlaka fiilin sonuna '-ing' gelir.",
  example:
    "Şehrin sokaklarına birlikte bakalım: 'She is walking down the street.' Parkta neşeyle oynayan bir çocuk var: 'He is playing in the park.' İki arkadaş bankta oturup dondurma yiyor: 'They are eating ice cream.' Sen de vitrinleri inceliyorsan 'I am looking at the shops' dersin. Alışkanlık ile şu anı birbirinden ayırmak çok kolaydır: 'She walks to school every day' dediğinde her gün yürüyerek gittiğini anlatırsın; ama 'She is walking now' dediğinde tam şu anda yürüdüğünü söylersin. Dikkat çekmek istediğinde de 'Look, he is crossing the street!' diyerek anı yakalarsın.",
  hint: "gold",
  warning:
    "Şu anda olan bir olayı anlatırken hem yardımcı fiili hem de fiilin sonundaki '-ing' ekini birlikte kullanmayı hatırla. Örneğin 'She is shopping now' demek tam bir şimdiki zaman cümlesidir. 'I am walking' derken 'am' sözcüğünü, 'They are waiting' derken 'are' sözcüğünü fiille buluşturmak anlatımını mükemmel yapar. Her gün yaptığın genel alışkanlıkları anlatırken ise '-ing' ekine gerek kalmadığını, fiilin yalın kalacağını sevgiyle aklında tutabilirsin.",
  life:
    "Odanın penceresinden sokağa bak ve gördüğün bir kişiyi hemen İngilizceye dök: 'The man is walking.' Mutfağa göz attığında anneni yemek yaparken görürsen 'She is cooking' de. Kardeşin salonda oyun oynuyorsa 'He is playing' diyerek anı yakala. Kendin çalışma masasında otururken 'I am doing my homework' de. Bir arkadaşın seni arayıp 'What are you doing?' diye sorarsa gururla 'I am reading an English book!' diyerek cevap ver.",
  recap: [
    "Present continuous, tam şu anda gerçekleşen hareketli işleri anlatır.",
    "Kalıp am, is, are ve fiilin ing halidir; she is walking böyle kurulur.",
    "Her gün olan iş yalın kalırken, şu anda olan iş fiile ing ister.",
  ],
  conceptSeal: "Şimdi olan iş am, is, are ve ing ile kurulur.",
  voiceSeal: "Sokakta gördüğün bir kişiyi şu anda diye anlatırsın.",
  outcomes: [
    "Present continuous şu andaki işi anlatır.",
    "Am, is ve are fiile ing ekler.",
    "Her gün olan alışkanlık bu kalıba girmez.",
  ],
  scene: "skyline",
  parentNote:
    "Çocuğunuz şu andaki işi am, is, are ve ing ile kurar. She is walking şu anda yürüyor demektir. Pencereden bir kişiyi bu kalıpla anlattırabilirsiniz.",

};

export const JUNIOR_ING_MAIN_5 = juniorLessonFromScenario(JUNIOR_ING_MAIN_5_SCENARIO);
