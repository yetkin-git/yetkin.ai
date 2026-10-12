import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler. VII–XIII. yüzyıl İslam medeniyetinin ortak mirası. SB.6.3.2. */
export const JUNIOR_SOSYAL_23_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-23",
  title: "İslam medeniyetinin ortak mirası",
  teaser:
    "Ortak miras, VII. yüzyıldan XIII. yüzyıla uzanan İslam medeniyetinin birlikte ürettiği eser ve bilgidir. Kütüphane, hastane ve sayı düzeni bu mirastadır. Kavramsal Anlayış, mirası tek şehrin süsü sanmaktan ayırır. İfade Gücü, bir eserin bugün de işe yaradığını söylemektir.",
  welcome:
    "Merhaba sevgili çocuklar! Bir kitabın sayfası, bir hastanenin koğuşu ve defterdeki sayı düzeni aynı yüzyıllarda büyümüş olabilir. yedinci yüzyıldan on üçüncü yüzyıla uzanan İslam medeniyetinin ortak mirasını bir tarih sahnesinde araştıracağız.",
  concept:
    "Ortak miras, birçok şehrin aynı yüzyıllarda birlikte büyüttüğü eser ve bilgidir. yedinci yüzyıl ile on üçüncü yüzyıl arasında İslam medeniyeti kütüphane, hastane, gözlem ve sayı düzenini şehirden şehre taşımıştır. Bağdat, Kurtuba ve Semerkant bu ağın duraklarıdır. Araştırma, bir eserin hangi işe yaradığını kaynakta aramaktır. Yorumlamak ise o eserin bugünkü defterde, kitapta ya da çizimde hâlâ durduğunu söylemektir. Pratik kural: Eserin adını, işini ve bugünkü izini ayrı cümleyle söyle.",
  example:
    "Sınıf, bir çizimde kütüphane ile hastaneyi yan yana araştırır. Kütüphanede kitap çoğaltılır ve başka şehre gider. Hastanede hasta bakılır ve bu bilgi de şehirler arasında dolaşır. Öğrenciler iki eseri yorumlar: ikisi de tek bir evin süsü değildir, ortak mirastır. Sayı düzeninin deftere girmesi de aynı mirasın bugünkü izidir.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Ortak mirası tek bir şehrin süsü sanmak tuzaktır. Eserin yalnız eski kaldığını sanmak da eksiktir; sayı ve kitap bugün de iş görür. Araştırmadan «hepsi aynı binadır» demek yorumu bozar. İslam medeniyetinin ortak mirasında kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu okul defterindeki sayılara bakarak da görebilirsin. Kitaplıktaki bir kitap, yüzyıllar önce çoğaltılan sayfanın izini taşır. Şehirde bir hastanenin kapısından geçerken bakım işinin eski bir miras olduğunu hatırlarsın. Yorumun, eserin bugün de durduğunu söyler.",
  recap: [
    "Ortak miras, yedinci ile on üçüncü yüzyıl arasındaki İslam medeniyetinin birlikte büyüttüğü eserdir.",
    "Kütüphane, hastane ve sayı düzeni bu mirastadır.",
    "Yorum, eserin bugün de işe yaradığını söyler.",
  ],
  conceptSeal: "Ortak miras, birçok şehrin birlikte büyüttüğü eser ve bilgidir.",
  voiceSeal: "Bir eserin adını, işini ve bugünkü izini ayrı söylersin.",
  outcomes: [
    "Ortak miras tek şehrin süsü değildir.",
    "Kütüphane ve hastane bu yüzyılların eseridir.",
    "Bugünkü sayı ve kitap o mirasın izidir.",
  ],
  scene: "history",
  parentNote:
    "Çocuğunuz VII–XIII. yüzyıl İslam medeniyetinin ortak mirasını kütüphane, hastane ve sayı düzeni üzerinden kurar. Eserin bugünkü izini yorumlaması beklenir.",
};

export const JUNIOR_SOSYAL_23 = juniorLessonFromScenario(JUNIOR_SOSYAL_23_SCENARIO);
