import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, ENG.6.6 World and Culture, 34. hafta. Kutlama ve yemek. */
export const JUNIOR_ING_MAIN_11_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-11",
  title: "World and Culture: kutlama ve yemek",
  teaser:
    "World and Culture temasında kutlama celebrate, yemek eat ile söylenir. We celebrate with our family, ailemizle kutlarız demektir. Kavramsal Anlayış, kendi kültürü ile başka kültürü karşılaştırır. İfade Gücü, bir bayram yemeğini bir cümlede anlatmandır.",
  welcome:
    "Merhaba çocuklar, hepiniz hoş geldiniz! Bayram sofrasında pilav, börek ya da tatlı görünce o günün özel olduğunu anlarsın. Başka ülkelerde de insanlar bir araya gelir, farklı yemekler yer ve birbirini selamlar. World and Culture konusunda kutlamayı ve yemeği İngilizce söyleyeceğiz. Bir sofra fotoğrafını gözlemlemek, we eat ile they eat ayrımını kolaylaştırır.",
  concept:
    "Celebrate kutlamak, festival bayram ya da şenlik, traditional geleneksel demektir. We celebrate with our family, ailemizle kutlarız demektir. They eat special food, onlar özel yemek yer demektir. We kendi grubunu, they başka bir grubu anlatır. In Turkey we eat baklava on special days cümlesi bir geleneği söyler. In Japan they eat rice at many meals cümlesi başka bir sofrayı anlatır. Soru What do you eat at the festival? bayramda ne yersiniz diye sorar. Pratik kural: We kendi kültürün, they gözlemlediğin başka kültürün öznesidir.",
  example:
    "Ece kendi bayramını anlatır: In Turkey we celebrate with our family and we eat sweet food. Bir Japon festivalini kitaptan okuyunca özne değişir: In Japan they celebrate in the spring and they eat rice dishes. İki sofrayı karşılaştırmak için We eat baklava, they eat sushi dersin; bu cümle üstünlük kurmaz, farkı söyler. Arkadaşın What do you do at a festival? diye sorarsa We visit our relatives and we eat together diye cevap verirsin. Bayramda Good morning yerine mutlu bir kutlama dili kullanmak da kültürün parçasıdır.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Başka ülkenin yemeğini we ile söylemek grubu karıştırır; onlar için they eat durur. Bir yemeği daha iyi ya da daha kötü diye sıralamak bu dersin işi değildir. Celebrate fiilini eats gibi çekmek de özneyi şaşırtır; we celebrate yalın kalır, she celebrates s alır. World and Culture konusunda kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu bayram sabahı sofrada deneyebilirsin. Kendi tabağını gösterip We eat this food today de. Kitapta başka bir ülke görürsen They celebrate this festival diye ayır. Okulda bir dünya yemeği günü varsa iki cümle yeter. Akşam aile büyüklerine bugün öğrendiğin bir selamı söylemek, culture sözcüğünü eve taşır.",
  recap: [
    "Kutlama celebrate, yemek eat ile söylenir.",
    "We kendi grubunu, they başka grubu anlatır.",
    "Kültür karşılaştırması üstünlük kurmaz, farkı söyler.",
  ],
  conceptSeal: "Kutlama ve yemek we ya da they ile kurulur.",
  voiceSeal: "Bir bayram yemeğini kendi kültürün ve bir başka kültür için ayrı cümleyle söylersin.",
  outcomes: [
    "Celebrate kutlamayı, eat yemeği söyler.",
    "We ve they farklı grupları anlatır.",
    "Kültür cümlesi karşılaştırır, sıralamaz.",
  ],
  scene: "holiday",
  parentNote:
    "Çocuğunuz bir bayram yemeğini We eat ile anlatır. Başka bir kültür için They eat diye ayırır. Sofrada iki kısa cümle pekiştirir.",
};

export const JUNIOR_ING_MAIN_11 = juniorLessonFromScenario(JUNIOR_ING_MAIN_11_SCENARIO);
