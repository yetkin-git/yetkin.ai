import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 12. hafta. Kaynaklar ve ekonomik faaliyetler. */
export const JUNIOR_SOSYAL_12_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-12",
  title: "Ülkemizin kaynakları ve ekonomik faaliyetler",
  teaser:
    "Ekonomik faaliyet, insanın geçinmek için yaptığı iştir. Tarım, hayvancılık, sanayi, madencilik, ticaret ve turizm başlıca faaliyetlerdir. Kavramsal Anlayış, faaliyeti bölgenin kaynağına bağlar. İfade Gücü, bir ürünü yetiştiği bölgeyle söylemektir.",
  welcome:
    "Hoş geldin! Hazırsan bugün tarihin, kültürün ve yeryüzünün heyecan dolu dünyasına adım atıyoruz, çünkü soframıza gelen bereketin ve yurdumuzun zengin kaynaklarının izini süreceğiz. Hiç sabah kahvaltısında içtiğin sıcacık çayın Karadeniz'in dik yamaçlarından, zeytinin ise Ege'nin güneşli kıyılarından geldiğini düşündün mü? Tükettiğimiz hiçbir ürün market raflarında tesadüfen belirmez; toprağın bereketi, iklimin uygunluğu ve insan emeğiyle üretilir. Bugün seninle güzel ülkemizin doğal kaynaklarını ve bu kaynaklara dayalı ekonomik faaliyetleri adım adım öğreneceğiz.",
  concept:
    "Ekonomik faaliyet, insanların ihtiyaçlarını karşılamak ve geçimlerini sağlamak için yaptığı her türlü üretim ve hizmet işidir. Tarım toprağı ekip biçerek ürün elde eder; hayvancılık et, süt ve yün için hayvan yetiştirir; balıkçılık deniz ve göllerden yararlanır; madencilik yer altındaki değerli madenleri çıkarır; sanayi ham maddeleri işleyip fabrikalarda yeni eşyalara dönüştürür; ticaret üretilen malları alıp satar; turizm ise dinlenmek ve gezmek için gelen konukları ağırlar. Şurası aklında kalsın tamam mı: Bir bölgedeki ekonomik faaliyet, o yerin coğrafi özelliklerine, iklimine ve doğal kaynaklarına doğrudan bağlıdır; her bölgede aynı ürün yetişmez.",
  example:
    "Zengin bir kahvaltı sofrasını gözünün önüne getir. İnce belli bardaktaki demli çay ve tabaktaki fındık, bol yağış alan Karadeniz kıyılarını selamlar. Zeytinyağı ve incir, ılık rüzgârların estiği Ege ovalarından gelir. Ekmeğin hamuru olan buğday, geniş düzlükleriyle İç Anadolu tarlalarında sarı başaklar olarak dalgalanmıştır. Portakal ve mandalina gibi sulu turunçgiller ise kışları ılık geçen Akdeniz kıyılarında toplanmıştır. Kıyılardaki oteller ve antik kentler turizmin canlılığını gösterir. Dağların altındaki kömür, demir ve bor ise madenciliktir; fabrikaya giren demir orada işlenir ve mutfağındaki sağlam bir tencereye dönüşür. Tencere sanayinin eseridir. Sofrandaki her lokma bir coğrafi kaynağın emeğini taşır.",
  hint: "gold",
  warning:
    "Her bölgede her türlü tarım ürününün yetiştirilebileceğini düşünmek yanıltıcı bir tuzaktır. Çay ve fındık bol nem ister, turunçgiller ise dondan korunmak ister. Turizmi yalnızca deniz ve plaj tatili sanmak da eksik kalır; tarihi şehirleri, müzeleri ve yaylaları gezmek de çok değerli birer turizm faaliyetidir. Maden çıkarmak ile fabrikada sanayi üretimi yapmanın farklı aşamalar olduğunu her zaman hatırla.",
  life:
    "Bunu ailenle markette alışveriş yaparken reyonlardaki etiketleri okuyarak kolayca görebilirsin. Paketin üzerinde Rize yazdığında çayı, Malatya yazdığında kayısıyı, Aydın yazdığında inciri hatırlarsın. Ürün etiketi aslında küçük bir coğrafya cümlesidir. Yediğin her gıdanın hangi toprağın ve emeğin armağanı olduğunu bilmek, yaşadığın vatana duyduğun sevgiyi ve bilinci kat kat artırır.",
  recap: [
    "Tarım, hayvancılık, balıkçılık, madencilik, sanayi, ticaret ve turizm başlıca faaliyetlerdir.",
    "Faaliyet, bölgenin iklimine ve kaynağına göre değişir.",
    "Çay ve fındık Karadeniz, zeytin Ege, tahıl İç Anadolu, turunçgil Akdeniz tarafındadır.",
  ],
  conceptSeal: "Ekonomik faaliyet geçim işidir. Ürün, bölgenin kaynağına bağlıdır.",
  voiceSeal: "Bir ürünü ve onun yetiştiği bölgeyi aynı cümlede eşlersin.",
  outcomes: [
    "Ekonomik faaliyet, geçim için yapılan iştir.",
    "Tarım, sanayi, madencilik ve turizm ayrı faaliyetlerdir.",
    "Ürünler bölgenin iklimine ve kaynağına göre değişir.",
  ],
  scene: "globe",
  parentNote:
    "Çocuğunuz ekonomik faaliyeti bölgenin kaynağına bağlar. Çay, fındık, zeytin, tahıl ve turunçgili yetiştiği bölgeyle eşler.",

};

export const JUNIOR_SOSYAL_12 = juniorLessonFromScenario(JUNIOR_SOSYAL_12_SCENARIO);
