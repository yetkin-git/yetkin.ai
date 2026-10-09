import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler, 1. hafta. Değerler ve toplumdaki roller. */
export const JUNIOR_SOSYAL_1_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-1",
  title: "Değerlerimiz ve toplumdaki roller",
  teaser:
    "Değer, birlikte yaşamayı kolaylaştıran ilkedir. Rol, bir yerde üstlendiğin görevdir. Kavramsal Anlayış, rolü değerden ayırır. İfade Gücü, aynı kişinin birden fazla rolünü ayrı söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç aynı gün içinde hem kardeş hem öğrenci hem de takım arkadaşı olduğunu fark ettin mi? Bunların her biri, bulunduğun yere göre üstlendiğin farklı bir roldür. Saygı, dürüstlük ve yardımlaşma ise rolün değişse bile her zaman seninle kalan değerli ilkelerdir. Bugün seninle değer ile rol arasındaki farkı adım adım keşfedeceğiz. Rolün bulunduğun ortama göre değişir; değerlerin ise toplumla paylaştığın en güçlü pusulandır.",
  concept:
    "Değer, birlikte yaşamayı güzelleştiren ve kolaylaştıran temel ilkedir. Saygı, dürüstlük, yardımlaşma ve sorumluluk bu değerli ilkeler arasında yer alır. Rol ise bir grupta ya da toplumda üstlendiğin görevdir. Okulda öğrenci rolü, evde kardeş ya da evlat rolü, sahada ise takım oyuncusu rolün vardır. Aynı insan, gün içinde birden fazla rolü başarıyla taşır. Bulunduğun yer değiştikçe rolün de değişir; fakat sen aynı değerli birey olarak kalırsın. Şurası aklında kalsın tamam mı: Değer, üstlendiğin rolün içini güzellikle doldurur; rolün adı ise değerin kendisi değildir.",
  example:
    "Sabah evde kardeşine yardım eder, çantasını uzatırsın. Burada kardeş rolündesindir ve yardımlaşma değeri seninle parlar. Okula vardığında dersi dikkatle dinler, söz alarak konuşursun. Burada öğrenci rolündesindir ve saygı değeri davranışına yansır. Okul bahçesinde arkadaşına pas verirsin; bu kez oyuncu rolündesindir ve sorumluluk duygusu öne çıkar. Üç farklı yer, üç farklı rol gördün. Değerlerin ise her adımda seninle birlikte yolculuk etti. Bir ortamda doğruyu söylemekten vazgeçmemek, dürüstlük değerinin bir parçasıdır. Rolün süresi bitse de taşıdığın erdemler daima seninle kalır.",
  hint: "trap",
  warning:
    "Bir insanın üstlendiği rolü onun bütün kişiliği sanmak yanıltıcı olabilir. Okulda öğrenci rolün tamamlandığında sen yok olmazsın; evde sevgi dolu bir kardeş, sahada gayretli bir sporcu olmaya devam edersin. Erdemli değerlerin bu geçişlerde daima seninle kalır. Rolün adını değer kavramıyla karıştırmamaya özen göster. Saygının bir rol değil, her rolü güzelleştiren yüce bir değer olduğunu güvenle aklında tutabilirsin.",
  life:
    "Bunu sıradan bir günün içinde rahatlıkla fark edebilirsin. Sabah kardeş, öğlen öğrenci, akşam mahallede oyun arkadaşı olursun. Bu rollerin hepsi sana aittir ve topluma zenginlik katar. Markette sıranı sabırla beklemek saygı değeridir. Arkadaşına doğruyu söylemen dürüstlüktür. Verilen bir görevi zamanında tamamlaman ise sorumluluktur. Roller ortamla birlikte değişir; güzel erdemlerin ise her yeni role seninle birlikte taşınır.",
  recap: [
    "Değer, birlikte yaşamayı kolaylaştıran ilkedir. Saygı ve dürüstlük bu taraftadır.",
    "Rol, bir yerde üstlendiğin görevdir. Aynı kişi birden fazla rol taşır.",
    "Rol değişir, değer yanında kalır. Rolün adı, değerin yerine geçmez.",
  ],
  conceptSeal: "Değer bir ilkedir. Rol, bir yerdeki görevdir.",
  voiceSeal: "Aynı kişinin rollerini ve o rolleri dolduran değeri ayrı cümlelerle söylersin.",
  outcomes: [
    "Değer, birlikte yaşamayı düzenleyen ilkedir.",
    "Rol, bir toplulukta üstlenilen görevdir.",
    "Aynı kişi birden fazla rol taşıyabilir.",
  ],
  scene: "place",
  parentNote:
    "Çocuğunuz bu derste değer ile rol arasındaki farkı kavrar. Aynı bireyin gün içinde kardeş, öğrenci ve sporcu gibi birden çok rol taşıyabileceğini, saygı ve dürüstlük gibi erdemlerin ise roller değiştikçe korunduğunu öğrenir.",

};

export const JUNIOR_SOSYAL_1 = juniorLessonFromScenario(JUNIOR_SOSYAL_1_SCENARIO);
