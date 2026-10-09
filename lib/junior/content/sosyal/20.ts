import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 20. hafta. Ülkeler arası ticaret ve kültürel etkileşim. */
export const JUNIOR_SOSYAL_20_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-20",
  title: "Ülkeler arası ticaret ve kültürel etkileşim",
  teaser:
    "İhracat, başka ülkeye sattığımız mal ve hizmettir. İthalat, başka ülkeden aldığımızdır. İkisinin birlikte adı dış ticarettir. Kavramsal Anlayış, satışı alıştan ayırır. İfade Gücü, bir malın yönünü tek cümlede söylemektir.",
  welcome:
    "Merhaba! Sosyal Bilgiler dünyasına hoş geldin, çünkü bugün kıtaları aşan gemilerin, trenlerin ve uçakların taşıdığı heyecan verici ticaret dünyasına açılıyoruz. Hiç bir market reyonunda başka bir ülkede üretilmiş bir kırtasiye malzemesi gördün mü? O ürün bize başka bir ülkeden ulaşmıştır; bizim ülkemizde üretilen fındık, incir ya da pamuklu giysiler de dünyanın dört bir yanındaki mağaza raflarını süsler. Bugün seninle ihracat ve ithalatın ne olduğunu, ülkeler arası ticaretin kültürleri ve yaşam biçimlerini nasıl zenginleştirdiğini keşfedeceğiz.",
  concept:
    "İhracat, bir ülkenin kendi topraklarında ürettiği tarım, sanayi veya maden ürünlerini başka ülkelere satmasıdır. İthalat ise bir ülkenin kendi sınırları içinde üretilmeyen veya az bulunan malları başka ülkelerden satın almasıdır. İhracat ve ithalatın toplamına dış ticaret denir. Güzel ülkemiz Türkiye; fındık, zeytinyağı, kuru meyveler, kumaş ve makineleri dünyaya ihraç eder; ihtiyacı olan bazı malları ise ithal eder. Şurası aklında kalsın tamam mı: Ticaret yalnızca sandıklar dolusu mal taşımaz; aynı zamanda yeni kelimelerin, mutfak lezzetlerinin, müziğin ve sanatın da ülkeler arasında taşınmasını sağlar.",
  example:
    "Büyük bir ticaret limanını gözünün önüne getir. Limanda bekleyen dev bir yük gemisi Karadeniz'den toplanmış fındık çuvalları ve kaliteli kumaşlarla doldurulup yurt dışına uğurlanır. Bu ihracattır; çünkü mallar vatanımızdan çıkıp dünyaya gider. Birkaç hafta sonra aynı limana yanaşan başka bir gemiden fabrikalarımız için gerekli modern makineler ya da ilaç kutuları indirilir. Bu ise ithalattır; çünkü mal dışarıdan ülkemize girer. Bu ticari hareketlilik sırasında yabancı tüccarlar Türk kahvesini ve lezzetlerini tadıp kendi ülkelerine götürür; bizler de onların kültüründen yeni kelimeler öğreniriz. Kültürel etkileşim işte bu temaslarla doğar. Ticaret, kasadaki paradan çok daha büyük bir köprüdür.",
  hint: "gold",
  warning:
    "İthalat ile ihracat kavramlarının yönünü birbiriyle karıştırmak sık yapılan bir yanılgıdır. Her zaman malın yönünü sor: Eğer ürün bizden çıkıp başka ülkeye satılıyorsa bu ihracattır; dışarıdan ülkemize alınıp getiriliyorsa ithalattır. Ticareti yalnızca soğuk bir alışveriş sanma; milletlerin birbirinin kültürünü, sanatını ve yaşamını tanıdığı büyük bir dostluk köprüsü olduğunu her zaman hatırla.",
  life:
    "Bunu yurt dışındaki bir akrabana ya da arkadaşına hediye paketi hazırlarken de yaşarsın. Ona Türk lokumu ve kuru incir yolladığında küçük çaplı bir ihracat ve kültür elçiliği yaparsın. O da sana teşekkür mektubuyla birlikte kendi ülkesinin geleneksel bir oyuncağını gönderdiğinde ithalat ve kültürel etkileşim gerçekleşir. İki farklı dünyanın zenginliği aynı hediye paketinde kucaklaşır.",
  recap: [
    "İhracat, başka ülkeye sattığımız mal ve hizmettir.",
    "İthalat, başka ülkeden aldığımız mal ve hizmettir. İkisinin adı dış ticarettir.",
    "Yemek, müzik ve sözcük de ülke değiştirir. Ticaret yalnız eşya değildir.",
  ],
  conceptSeal: "Dış ticaret, ihracat ve ithalatın birlikte adıdır. Yön, kavramı seçer.",
  voiceSeal: "Bir malın bizden mi çıktığını yoksa bize mi girdiğini tek cümleyle söylersin.",
  outcomes: [
    "İhracat, başka ülkeye satıştırm.",
    "İthalat, başka ülkeden alıştırm.",
    "Ticaretle birlikte kültürel etkileşim de olur.",
  ],
  scene: "caravan",
  parentNote:
    "Çocuğunuz ihracatı satış, ithalatı alış olarak ayırır. Ticaretin yemek, müzik ve sözcük gibi kültür ögelerini de taşıdığını anlatır.",

};

export const JUNIOR_SOSYAL_20 = juniorLessonFromScenario(JUNIOR_SOSYAL_20_SCENARIO);
