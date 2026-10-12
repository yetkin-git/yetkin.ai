import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Ergenlik. FB.6.3.8. */
export const JUNIOR_FEN_28_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-28",
  title: "Ergenlik",
  teaser:
    "Ergenlik, çocukluktan yetişkinliğe geçerken vücudun olgunlaştığı dönemdir. Boy uzar, üreme organları olgunlaşır, duygular güçlenebilir. Kavramsal Anlayış, zamanın kişiden kişiye değiştiğini bilir. İfade Gücü, sağlıklı bir alışkanlığı bu döneme bağlar.",
  welcome:
    "Merhaba sevgili çocuklar! Bazı arkadaşların bir yıl içinde belirgin uzar, bazılarının sesi daha geç değişir. Bu fark bir yarış değildir. Ergenlik, vücudun iç salgı hormonlarıyla olgunlaştığı sağlıklı bir dönemdir. Bugün bu değişimleri sakin bir dille konuşacağız. Bir boy grafiğini gözlemlemek, herkesin aynı ayda aynı santimetreyi almadığını gösterir.",
  concept:
    "Ergenlik, üreme organlarının görev yapabilecek olgunluğa geldiği ve bedenin hızla değiştiği dönemdir. Kızlarda ve erkeklerde başlangıç yaşı aynı olmak zorunda değildir. Boy uzaması, ter bezlerinin çalışması, sivilce ve ses değişimi bu dönemin belirtileri olabilir. Duygular da güçlenebilir; bu bir hastalık değil, gelişmenin parçasıdır. Uyku, dengeli yemek, hareket ve güvenilen bir yetişkinle konuşmak dönemi destekler. Başkasının bedenini küçümsemek bilimsel olmadığı gibi inciticidir. Pratik kural: Ergenlikte tempo kişiye özeldir; sağlıklı alışkanlık ortaktır.",
  example:
    "Sınıf tablosunda 11 yaşındaki Ece 6 santimetre uzamış, 12 yaşındaki Ali henüz 2 santimetre uzamıştır. İkisi de kendi temposundadır. Ece'nin cilt bakımı ve Ali'nin ses değişimi aynı listenin farklı satırlarıdır. İkisi de günde yaklaşık 8 saat uyumayı ve sofrada çeşitli yemek yemeyi ortak tutar. Bir değişiklik seni üzerse bunu yalnız taşımak zorunda değilsin; öğretmen ya da aile büyükleriyle konuşmak tartışmanın sağlıklı biçimidir. Model, yarış cetveli değil büyüme aralığıdır.",
  hint: "gold",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Herkesin aynı ayda aynı değişimi yaşaması gerektiğini sanmak tuzaktır. Ergenliği utanılacak bir durum saymak da yanlıştır. Başkasının boyu ya da sesiyle alay etmek bilimin dışındadır. Ergenlik konusunda kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu evde uyku saatini koruyarak kullanırsın. Spor, yürüyüş ya da okul bahçesindeki oyun bedeni destekler. Aynada yeni bir sivilce görürsen abartılı ürünler yerine temizliği ve gerekirse bir yetişkinin önerisini seç. Okulda bu konuyu alay konusu yapmak yerine bilimsel adlarla konuşmak güven verir.",
  recap: [
    "Ergenlik, bedenin olgunlaştığı sağlıklı bir dönemdir.",
    "Başlangıç yaşı ve hız kişiden kişiye değişir.",
    "Uyku, beslenme, hareket ve güvenilen bir yetişkin dönemi destekler.",
  ],
  conceptSeal: "Ergenlik kişiye özel bir olgunlaşma dönemidir.",
  voiceSeal: "Bu dönemde bir sağlıklı alışkanlığı kendi cümlenle söylersin.",
  outcomes: [
    "Ergenlik olgunlaşma dönemidir.",
    "Değişim hızı kişiden kişiye değişir.",
    "Sağlıklı alışkanlık ve güvenilen yetişkin destekler.",
  ],
  scene: "body",
  parentNote:
    "Çocuğunuz ergenliği sağlıklı ve kişiye özel bir dönem diye anlatır. Uyku, beslenme ve güvenilen bir yetişkinle konuşmayı destek olarak sayar. Anlatım alay ve utanç dili taşımaz.",
};

export const JUNIOR_FEN_28 = juniorLessonFromScenario(JUNIOR_FEN_28_SCENARIO);
