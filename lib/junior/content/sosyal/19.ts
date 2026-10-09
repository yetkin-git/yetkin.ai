import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 19. hafta. Komşular ve uluslararası ilişkiler. */
export const JUNIOR_SOSYAL_19_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-19",
  title: "Komşularımız ve uluslararası ilişkiler",
  teaser:
    "Türkiye'nin sekiz kara komşusu vardır. Yunanistan, Bulgaristan, Gürcistan, Ermenistan, Nahçıvan, İran, Irak ve Suriye bu listedir. Kavramsal Anlayış, kara komşusu ile deniz kıyısını ayırır. İfade Gücü, bir ülkeyi sınırın yönüyle söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün haritada ve tarihte nasıl bir yolculuk var, çünkü Türkiye'mizin sınır boylarını ve dünya devletleriyle kurduğu dostluk köprülerini keşfedeceğiz. Hiç dünya haritasında güzel ülkemizin etrafında dizilen komşu ülkelerin adlarını sırayla saydın mı? Bazı ülkelerle doğrudan kara sınırımız vardır; bazılarıyla ise denizler yoluyla komşuyuzdur. Bugün seninle sekiz kara komşumuzu, sınır kapılarımızı ve devletlerin barış, ticaret ve kültür amacıyla kurduğu uluslararası ilişkileri öğreneceğiz.",
  concept:
    "Kara komşusu, vatan toprağımızla doğrudan sınır çizgisi birleşen devlettir. Türkiye'nin tam sekiz kara komşusu bulunur. Batıda Yunanistan ve Bulgaristan ile sınırımız vardır. Kuzeydoğuda Gürcistan yer alır. Doğuda Ermenistan, kardeş ülke Azerbaycan'a bağlı olan Nahçıvan bölgesi ve köklü komşumuz İran bulunur. Güneyde ise Irak ve Suriye uzanır. Kardeş ülke Azerbaycan'ın ana topraklarıyla doğrudan kara sınırımız yoktur; sınırımız Nahçıvan iledir. Şurası aklında kalsın tamam mı: Komşularla ve diğer ülkelerle ilişkiler barış, ticaret, dayanışma ve kültürel iş birliği temeline dayanır; Birleşmiş Milletler gibi uluslararası örgütler de dünya barışını korumak için çalışır.",
  example:
    "Türkiye haritasını önümüze alıp sınır boylarımızda saat yönünde bir tura çıkalım. Batı kapımız olan Trakya'da iki komşumuz bizi karşılar: Yunanistan ve Bulgaristan. Kuzeye baktığımızda masmavi Karadeniz uzanır; Karadeniz'in karşı kıyısındaki ülkeler deniz komşumuzdur, kara sınırımız yoktur. Kuzeydoğuya doğru yöneldiğimizde dağlarıyla Gürcistan kapısı açılır. Doğuya indiğimizde Ermenistan, hemen ardından ince bir koridorla bağlandığımız Nahçıvan ve tarihi İpek Yolu'ndan beri komşumuz olan İran gelir. Güney sınırımıza indiğimizde ise Irak ve en uzun kara sınırımıza sahip olduğumuz Suriye yer alır. Böylece sekiz komşumuz tamamlanır. Uluslararası ilişkiler kavga değil; afette yardıma koşmak, karşılıklı ticaret yapmak ve ortak bilimsel adımlar atmaktır.",
  hint: "trap",
  warning:
    "Deniz yoluyla komşu olduğumuz ülkeleri kara komşumuz sanmak yanıltıcı bir tuzaktır. Karadeniz ya da Akdeniz'in karşı kıyısındaki devletlerle kara sınırımız bulunmaz. Nahçıvan kapısını unutmamaya ve Azerbaycan'ın ana toprağıyla doğrudan kara sınırımızın olmadığını doğru kavramaya özen göster. Komşuluk ilişkilerini barış ve kardeşlik içinde yürütülen bir iş birliği olarak her zaman sevgiyle hatırla.",
  life:
    "Bunu kendi oturduğun apartmandaki komşulukla da düşünebilirsin. Kapı komşunla her gün selamlaşır, bayramda ikramda bulunur, zor gününde yardıma koşarsın. Karşı sokaktaki apartmanla ise kapın bitişik değildir; ama yine de mahallede selamlaşırsın. Devletler için de kara komşuları kapı komşusu gibidir; sınır kapılarından tırlar geçer, konuklar gelir, ticaret canlanır. Komşularla iyi geçinmek hem evimizde hem de ülkemizde huzurun en büyük anahtarıdır.",
  recap: [
    "Türkiye'nin sekiz kara komşusu vardır.",
    "Nahçıvan kara komşumuzdur. Azerbaycan'ın ana toprağı ile kara sınırımız yoktur.",
    "Ülkeler barış, ticaret ve kültür için ilişki kurar. Deniz kıyısı kara sınırı değildir.",
  ],
  conceptSeal: "Kara komşusu, sınırı karadan değen devlettir. İlişki barış ve iş birliği içindir.",
  voiceSeal: "Bir komşuyu sınırın yönüyle söyler, sekiz adı da atlamazsın.",
  outcomes: [
    "Türkiye'nin sekiz kara komşusu vardır.",
    "Nahçıvan, Azerbaycan'a ait kara komşumuzdur.",
    "Uluslararası ilişki barış, ticaret ve kültür için kurulur.",
  ],
  scene: "globe",
  parentNote:
    "Çocuğunuz sekiz kara komşusunu yönüyle sayar. Nahçıvan'ı Azerbaycan'ın ana toprağından ayırır. İlişkiyi barış ve iş birliği olarak anlatır.",

};

export const JUNIOR_SOSYAL_19 = juniorLessonFromScenario(JUNIOR_SOSYAL_19_SCENARIO);
