import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Üç nokta, soru, ünlem, kesme ve tırnak. */
export const JUNIOR_TURKCE_20_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-20",
  title: "Üç nokta, soru, ünlem, kesme ve tırnak",
  teaser:
    "Üç nokta sözün sürdüğünü gösterir. Soru işareti soruyu, ünlem şaşmayı ve seslenmeyi bitirir. Kesme, özel ada gelen eki ayırır. Tırnak, başkasının sözünü içine alır. Kavramsal Anlayış, beş işareti ayırır. İfade Gücü, cümlede doğru işareti seçmektir.",
  welcome:
    "Merhaba! Türkçe dünyasına hoş geldin, bugün kelimelerin duygusunu, merakını ve sınırlarını belirleyen çok özel işaretlerle tanışacağız. Hiç bir cümlenin sonuna soru işareti koyduğunda ses tonunun kendiliğinden yukarı doğru kalktığını fark ettin mi? Ya da bir şaşkınlık anında ünlem işaretinin metne nasıl büyük bir enerji kattığını gördün mü? Bugün seninle üç nokta işareti, soru işareti, ünlem işareti, kesme işareti ve tırnak işaretinin inceliklerini tek tek keşfedeceğiz.",
  concept:
    "Bu beş işaret metne canlılık ve kesinlik kazandırır. Üç nokta işareti, herhangi bir nedenle bitmemiş, tamamlanmamış veya okuyucunun hayal gücüne bırakılmış cümlelerin sonuna konur; anlatımın kendisi açık uçlu bırakılır. Soru işareti, soru bildiren sözcük veya cümlelerin sonuna gelir; Saat kaçta geleceksin? Ünlem işareti ise sevinç, korku, şaşma, acıma gibi yoğun duyguları anlatan ya da seslenme ve hitap bildiren cümlelerin ardına konur; Yaşasın, sınavı kazandım! Kesme işareti, özel adlara getirilen iyelik, durum ve bildirme eklerini ayırmak için yukarıdan konur; İstanbul'u çok seviyorum cümlesinde u eki kesmeyle ayrılır. Tırnak işareti ise başka bir kimseden veya yazıdan olduğu gibi aktarılan sözlerin başına ve sonuna konur. Şurası aklında kalsın tamam mı: Özel isimlere gelen yapım ekleri ve ler-lar çoğul ekleri kesme işaretiyle ayrılmaz; Türklük ve İstanbullular bitişik yazılır.",
  example:
    "Cümlelerimize bakalım. Karşımızda masmavi bir deniz, yemyeşil tepeler dendiğinde yargı bitmemiştir; sonuna üç nokta işareti yakışır. Bugün kütüphaneye gidecek miyiz sorusunda soru işareti kullanılır. Eyvah, anahtarımı evde unuttum cümlesinde telaş vardır ve ünlem işareti konur. Ankara'ya yarın sabah uçakla gideceğiz cümlesinde ya eki kesme işaretiyle ayrılır. Öğretmenimiz, Yarın kitaplarınızı getirmeyi unutmayın, dedi cümlesinde öğretmenin sözü tırnak işareti içine alınır.",
  hint: "trap",
  warning:
    "Özel adlara gelen yapım eklerini kesme işaretiyle ayırma tuzağına düşmemelisin. Örneğin Ankaralı sözcüğünde lı yapım ekidir ve kesmeyle ayrılmaz. Türkler sözcüğünde ler çoğul ekidir ve kesmeyle ayrılmaz. Ayrıca soru eki mi içeren her cümlede soru anlamı yoksa soru işareti konmaz; Akşam oldu mu eve dönerim cümlesi soru değil, zaman bildirir ve sonuna nokta konur.",
  life:
    "Arkadaşına sürpriz bir doğum günü partisi hazırlarken Yaşasın! diye ünlem koyarsın. Ona yarın buluşuyor muyuz diye sorarken soru işaretiyle merakını belirtirsin. Kitaptan harika bir alıntı yaparken tırnak işaretini kullanırsın. Özel isimlerin hakkını kesme işaretiyle korursun.",
  recap: [
    "Üç nokta işareti tamamlanmamış ve sürdürülen cümlelerin sonuna konur.",
    "Soru işareti soru bildiren, ünlem işareti ise coşku ve seslenme bildiren cümlelerde durur.",
    "Kesme işareti özel adlara gelen çekim eklerini ayırır, tırnak işareti doğrudan aktarılan sözü sarar.",
  ],
  conceptSeal: "Her işaret ayrı iş görür. Kesme eki ayırır. Tırnak başkasının sözünü taşır.",
  voiceSeal: "Bir cümlede üç nokta, soru, ünlem, kesme veya tırnaktan hangisinin duracağını söylersin.",
  outcomes: [
    "Soru işareti soru cümlesini bitirir.",
    "Kesme işareti özel ada gelen eki ayırır.",
    "Tırnak işareti başkasının sözünü içine alır.",
  ],
  scene: "book",
  parentNote:
    "Çocuğunuz bu derste soru işareti, ünlem işareti, kesme işareti, tırnak işareti ve üç nokta işaretinin doğru kullanımını öğrenir. Özel adlara gelen yapım eklerinin ayrılmayacağını pekiştirebilirsiniz.",

};

export const JUNIOR_TURKCE_20 = juniorLessonFromScenario(JUNIOR_TURKCE_20_SCENARIO);
