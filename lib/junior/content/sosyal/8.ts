import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 8. hafta. İpek Yolu ve kültürel etkileşim. */
export const JUNIOR_SOSYAL_8_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-8",
  title: "İpek Yolu ve kültürel etkileşim",
  teaser:
    "İpek Yolu, Çin'den Orta Asya üzerinden Anadolu ve Akdeniz'e uzanan ticaret yoludur. Kervan mal ile birlikte fikir de taşır. Kavramsal Anlayış, yükü yalnız ipek sanmaktan ayırır. İfade Gücü, yolda giden bir mal ile bir fikri ayrı söylemektir.",
  welcome:
    "Selamlar! Bugün seninle toplumsal hayatımızın ve coğrafyamızın çok değerli bir sırrını keşfedeceğiz, çünkü kıtaları birbirine bağlayan efsanevi ticaret yollarına çıkıyoruz. Hiç uçsuz bucaksız bir yolda develerin sırtında yalnızca parlak ipek kumaşların değil, aynı zamanda masalların, türkülerin ve bilimin de taşındığını duymuş muydun? İpek Yolu tam olarak böyle muazzam bir köprüdür. Bugün seninle kervanların izini sürecek, ticaret ile kültürel etkileşimin dünyayı nasıl zenginleştirdiğini göreceğiz.",
  concept:
    "İpek Yolu, Çin'den başlayarak Orta Asya'yı, İran'ı ve Anadolu'yu geçip Akdeniz ve Avrupa'ya kadar uzanan tarihi ticaret yoludur. Kervanlar bu yolda parlak ipek kumaşlar, porselenler, kâğıt ve baharat taşımıştır. Ancak bu yol sadece ticari malların değil; inançların, dillerin, bilimin, sanatın ve felsefenin de taşındığı bir kültür köprüsüdür. Yol boyunca tüccarların güvenle konaklaması için kervansaraylar inşa edilmiştir. Şurası aklında kalsın tamam mı: İpek Yolu yalnızca ipek ve kumaş taşımaz; mal ile birlikte fikirler, icatlar ve kültürler de yolculuk eder. Buna kültürel etkileşim denir.",
  example:
    "Çölde adımlarla ilerleyen bir deve kervanı hayal et. Heybelerinde Çin'den çıkan göz kamaştırıcı ipek topları bulunur. Orta Asya'daki bir Türk şehrine uğrarlar; orada kâğıt yapımı ve matbaa ustalığı konuşulur. Kâğıt bilginin uzak diyarlara ulaşmasını sağlar. Anadolu topraklarına geldiklerinde Selçuklu kervansaraylarının sağlam kapıları açılır; yolcular dinlenir, hayvanlar yemlenir, çorba ikram edilir. Akdeniz limanına varıldığında kumaşlar gemilere yüklenir; dönüş yolunda ise batıdan yeni çalgılar, baharatlar ve mimari fikirler kervana katılır. İki taraf da birbirinin kültürünü tanır ve öğrenir. Şehirler bu zenginlikle gelişir. Yol, farklı kültürlerin buluştuğu bir alandır.",
  hint: "gold",
  warning:
    "İpek Yolu'nu yalnızca zengin kumaşların satıldığı sıradan bir ticaret hattı sanmak eksik bir bilgidir. Kâğıt, matbaa ve porselen gibi insanlığın gelişimine yön veren icatlar da bu yolla dünyaya yayılmıştır. Bir masal, bir ezgi veya bir yemek tarifi de kervanlarla sınırları aşabilir. Ticari malı görürken onunla gelen zengin kültürü de her zaman sevgiyle hatırla.",
  life:
    "Bunu günümüzde kurulan semt pazarlarında ya da çarşılarda da görebilirsin. Bir tezgâhta Karadeniz'den gelen tereyağı, yanında ise Ege'nin zeytinyağı durur; radyoda ise başka bir yörenin neşeli türküsü çalar. Yiyecekler sofrana lezzet katarken, türkü de gönlüne neşe verir. Eski kervan yollarında da tam olarak bu yaşanırdı. Aldığın bir ürünün ardında her zaman o yörenin emeği, kültürü ve hikâyesi saklıdır.",
  recap: [
    "İpek Yolu, Çin'den Anadolu ve Akdeniz'e uzanan ticaret yoludur.",
    "Kervan ipek, kâğıt, porselen ve baharat taşır.",
    "Din, dil ve bilim de bu yoldan geçer. Yol yalnız ipek hattı değildir.",
  ],
  conceptSeal: "İpek Yolu bir ticaret ve karşılaşma yoludur. Kervan mal ile fikri birlikte taşır.",
  voiceSeal: "Yolda giden bir malı ve onunla gelen bir fikri ayrı cümleyle söylersin.",
  outcomes: [
    "İpek Yolu Çin'den Akdeniz'e uzanır.",
    "Kervan mal yanında kültür de taşır.",
    "Kervansaray yolcunun konakladığı duraktır.",
  ],
  scene: "caravan",
  parentNote:
    "Çocuğunuz İpek Yolu'nu yalnız ipek hattı değil, mal ile fikrin birlikte yürüdüğü bir yol olarak anlatır. Kervansaray bir konaklama durağıdır.",

};

export const JUNIOR_SOSYAL_8 = juniorLessonFromScenario(JUNIOR_SOSYAL_8_SCENARIO);
