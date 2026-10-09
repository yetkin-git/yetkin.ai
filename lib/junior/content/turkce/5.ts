import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Öznel ve nesnel cümleler. */
export const JUNIOR_TURKCE_5_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-5",
  title: "Öznel ve nesnel anlatımlı cümleler",
  teaser:
    "Nesnel cümle ölçülür ve herkes için aynıdır. Öznel cümle duygu ve yorum taşır, kişiye göre değişir. Kavramsal Anlayış, ikisini ayırır. İfade Gücü, bir cümlenin hangi tarafta durduğunu söylemektir.",
  welcome:
    "Merhaba! Türkçe dünyasına hoş geldin, hazırsan bugün düşüncelerimizi ve gözlemlerimizi doğru temellere oturtmayı öğreneceğiz. Hiç bu film harika dediğinde bir arkadaşının aynı filmi sıkıcı bulduğuna tanık oldun mu? Beğeniler kişiden kişiye değişir, ancak filmin iki saat sürmesi herkes için aynıdır. Bugün seninle öznel ve nesnel anlatımın berrak sınırlarını keşfedeceğiz. Kendi yorumlarımızı kanıtlanabilir gerçeklerden ayırmak harika bir beceridir.",
  concept:
    "Nesnel anlatım; kişisel duygulardan uzak, doğruluğu veya yanlışlığı herkesçe kanıtlanabilir ve ölçülebilir yargılardır. Türkiye'nin başkenti Ankara'dır ya da Bu masa ahşaptan yapılmıştır yargıları nesneldir; çünkü kişiye göre değişmez. Öznel anlatım ise söyleyenin kişisel duygu, beğeni ve yorumunu içeren, kanıtlanamayan yargılardır. Bu film çok etkileyicidir ya da Mavi en güzel renktir yargıları özneldir. Şurası aklında kalsın tamam mı: Bir cümlede bence, bana göre, harika, en güzel gibi sözcükler varsa o cümle genellikle özneldir; deney, ölçüm veya belgeye dayanan bilgiler ise nesneldir.",
  example:
    "Gel birlikte ikişer örneğe bakalım. Sınıfımızda yirmi beş sıra vardır; bu nesneldir, sayarak kanıtlayabilirsin. Sınıfımız okulun en huzurlu sınıfıdır; bu özneldir, çünkü huzur kişiden kişiye değişen bir duygudur. Yazarın son kitabı yüz kırk sayfadır; bu nesneldir. Yazarın son kitabı çok akıcıdır; bu özneldir. Gördüğün gibi aynı kitaptan bahsederken biri ölçülebilen sayıyı, diğeri kişisel beğeniyi aktarır.",
  hint: "trap",
  warning:
    "İçinde rakam veya sayı bulunan her cümleyi hemen nesnel sanma tuzağına düşmemelisin. En sevdiğim sayı üçtür cümlesinde üç bir sayıdır ama cümlenin bütünü kişisel bir tercihtir ve özneldir. Cümleyi okurken kendine sor: Bu herkes için kanıtlanabilir bir gerçek mi, yoksa söyleyenin kendi fikri mi?",
  life:
    "Fen dersinde su yüz derecede kaynar dediğinde nesnel bir gerçeği söylersin. Çorba çok lezzetli olmuş dediğinde ise kendi öznel zevkini paylaşırsın. Bir konuda fikir yürütürken önce nesnel bilgileri ortaya koyup ardından öznel görüşlerini belirtirsen arkadaşların seni her zaman hayranlıkla dinler.",
  recap: [
    "Nesnel anlatım kanıtlanabilir, ölçülebilir ve herkes için geçerlidir.",
    "Öznel anlatım kişisel duygu, beğeni ve yorum taşır.",
    "Sayı içeren her cümle nesnel değildir; cümlenin bütününe bakılır.",
  ],
  conceptSeal: "Nesnel ortak gözlemdir. Öznel kişinin yorumudur.",
  voiceSeal: "Bir cümlenin öznel mi nesnel mi olduğunu gerekçesiyle söylersin.",
  outcomes: [
    "Nesnel anlatım ölçülebilir ve ortaktır.",
    "Öznel anlatım kişiye göre değişir.",
    "Beğeni bildiren cümle özneldir.",
  ],
  scene: "meaning",
  parentNote:
    "Çocuğunuz bu derste kişisel beğeni bildiren öznel cümleler ile kanıtlanabilir nesnel yargıları birbirinden ayırır. Günlük sohbetlerde fikrini belirtirken bu ayrımı kullanması desteklenebilir.",

};

export const JUNIOR_TURKCE_5 = juniorLessonFromScenario(JUNIOR_TURKCE_5_SCENARIO);
