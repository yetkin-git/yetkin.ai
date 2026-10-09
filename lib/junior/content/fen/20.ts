import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Elektriksel direnç. */
export const JUNIOR_FEN_20_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-20",
  title: "Elektriksel direnç",
  teaser:
    "Direnç, iletkenin akıma karşı gösterdiği zorluktur. Boy uzayınca artar, kesit büyüyünce azalır, cins değişince değişir. Kavramsal Anlayış, üç etkeni ayırır. İfade Gücü, kalın telin neden daha parlak lamba verdiğini söylemektir.",
  welcome:
    "Merhaba! Bilim dünyasına hoş geldin, çünkü bugün elektrik akımının yollarda karşılaştığı o gizemli engeli, yani elektriksel direnci keşfedeceğiz. Aynı pille çalışan iki el fenerinden birinin pırıl pırıl parlarken diğerinin neden daha loş yandığını hiç merak ettin mi? Pil aynı olsa bile, devredeki telin akıma çıkardığı zorluk ampulün parlaklığını baştan sona değiştirir. Bugün seninle telin boyu, kalınlığı ve cinsinin direnci nasıl etkilediğini birlikte inceleyeceğiz.",
  concept:
    "Maddelerin elektrik akımının geçişine karşı gösterdiği zorluğa elektriksel direnç denir. Bir devrede direnç ne kadar büyükse, geçen elektrik akımı o kadar azalır ve lamba o kadar sönük yanar. Bir iletkenin direnci üç temel özelliğe bağlıdır: İletkenin boyu, iletkenin kesit alanı yani kalınlığı ve iletkenin cinsi. İletken telin boyu uzadıkça direnç artar. İletken tel kalınlaştıkça, yani kesit alanı büyüdükçe direnç azalır. Ayrıca telin yapıldığı maddenin cinsi de direnci doğrudan belirler; örneğin bakır telin direnci, aynı boy ve kalınlıktaki demir telin direncinden çok daha küçüktür. Şurası aklında kalsın tamam mı: Uzun ve ince teller elektrik akımına en çok zorluk çıkaran, yani direnci en büyük olan tellerdir.",
  example:
    "Elektrik akımını geniş ya da dar bir otoyolda ilerleyen arabalara benzetebilirsin. Aynı maddeden yapılmış ve aynı kalınlıkta iki tel alalım; biri 10 santimetre, diğeri 50 santimetre olsun. 50 santimetrelik uzun telde elektronlar daha uzun bir yolda ilerlediği için direnç daha büyüktür ve ampul daha sönük yanar. Şimdi boyları eşit iki tel alalım; biri incecik bir tel, diğeri kalın bir kablo olsun. Kalın tel geniş bir otoban gibidir; elektronlar çok daha rahat geçer, direnç küçülür ve ampul ışıl ışıl parlar. Üçüncü durumda aynı boy ve kalınlıkta bir bakır tel ile bir nikel-krom tel deneyelim. Bakır telin direnci küçük olduğu için lamba parlak yanar; nikel-krom telin direnci büyük olduğu için lamba sönük kalır. Bu yüzden ev tesisatlarında direnci çok küçük olan bakır teller kullanılır.",
  hint: "trap",
  warning:
    "Telin kalınlığı arttıkça akıma daha çok zorluk çıkaracağını sanabilirsin; oysa geniş bir otoyol gibi kalın tel de elektronlara rahat bir geçiş sunar ve direnç azalır. Tel uzadıkça yol uzadığı için direncin arttığını kolayca zihninde canlandırabilirsin.",
  life:
    "Bunu evimizdeki elektrikli ısıtıcılarda, fırınlarda ya da ekmek kızartma makinelerinde hemen görürsün. Isıtıcıların içindeki o kızaran ince ve uzun teller, nikel-krom gibi yüksek dirençli tellerdir. Akım bu yüksek dirençten geçerken zorlanır ve elektrik enerjisi ısıya ve ışığa dönüşür. Odalarımızdaki klasik akkor ampullerin içindeki minicik sarmal tungsten tel de yüksek direnci sayesinde parıldar. Elektriği kayıpsız taşımak istediğimizde ise kalın ve düşük dirençli kabloları tercih ederiz.",
  recap: [
    "Elektriksel direnç, maddelerin elektrik akımına karşı gösterdiği zorluktur.",
    "İletkenin boyu uzadıkça direnç artar; tel kalınlaştıkça direnç azalır.",
    "Maddenin cinsi direnci değiştirir; uzun ve ince tellerin direnci büyüktür.",
  ],
  conceptSeal: "Direnç, akımın iletken içinden geçerken karşılaştığı zorluktur.",
  voiceSeal: "Boy, kesit ve cinsin direnci nasıl değiştirdiğini ayrı ayrı söylersin.",
  outcomes: [
    "Direnç, iletkenin akıma gösterdiği zorluktur.",
    "Telin boyu artınca direnç artar.",
    "Kesit alanı artınca direnç azalır. Cins de direnci değiştirir.",
  ],
  scene: "circuit",
  parentNote:
    "Çocuğunuz direncin boy uzayınca arttığını, kesit büyüyünce azaldığını ve madde cinsiyle değiştiğini anlatır. Kalın telin daha kolay ilettiği lamba parlaklığıyla pekişir.",

};

export const JUNIOR_FEN_20 = juniorLessonFromScenario(JUNIOR_FEN_20_SCENARIO);
