import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Güneş tutulması ve Ay tutulması. */
export const JUNIOR_FEN_2_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-2",
  title: "Güneş ve Ay tutulması",
  teaser:
    "Güneş tutulmasında Ay, Güneş ile Dünya arasındadır ve olay gündüz olur. Ay tutulmasında Dünya aradadır ve olay gece olur. Kavramsal Anlayış, araya kimin girdiğini söyler. İfade Gücü, iki tutulmayı gündüz ve geceyle ayırmandır.",
  welcome:
    "Hoş geldin! Hazırsan bugün zihnimizi harika bir bilim yolculuğuna çıkarıyoruz, çünkü bugün gökyüzünün en büyüleyici olaylarından birini inceleyeceğiz. Hiç gündüz vakti gökyüzünün aniden karardığını duydun mu? Güneş bir anlığına saklanmış gibi olur. Bugün seninle bunun bir yok oluş değil; Güneş, Ay ve Dünya'nın aynı çizgiye geldiği harika bir doğa dansı olduğunu keşfedeceğiz.",
  concept:
    "Güneş tutulmasında Ay, Güneş ile Dünya'nın tam arasına girer. Ay o sırada yeni ay evresindedir ve olay gündüz vakti gerçekleşir. Ay'ın gölgesi Dünya'nın belirli bir bölgesine düşer ve Güneş görünmez olur. Ay tutulmasında ise Dünya, Güneş ile Ay'ın arasına girer. Ay dolunay evresindedir ve olay gece yaşanır. Dünya'nın dev gölgesi Ay'ın üzerini örter. Şurası aklında kalsın tamam mı: Gündüz yaşanan tutulmada arada Ay, gece yaşanan tutulmada ise arada Dünya vardır.",
  example:
    "Masada üç farklı top hayal et. En büyük sarı top Güneş, orta boy mavi top Dünya, minik gri top da Ay olsun. Güneş tutulmasını canlandırmak için küçük Ay'ı ortaya koy. Feneri yaktığında küçük top ışığı keser ve Dünya'nın üzerine gölge düşer. O bölgedeki insanlar gündüz vakti gökyüzünün karardığını görür. Şimdi küçük topu Dünya'nın arkasına al. Bu kez Dünya ışığı keser ve Ay karanlıkta kalır; işte bu da Ay tutulmasıdır. Ay'ın yörüngesi eğik olduğu için her yeni ayda ya da her dolunayda tutulma gerçekleşmez.",
  hint: "trap",
  warning:
    "Güneş tutulmasını izlerken gözlerimizi korumak için mutlaka özel filtreli tutulma gözlüğü kullanırız; çıplak gözle doğrudan güneşe bakmamaya özen gösteririz. Ay tutulmasını ise hiçbir koruyucu olmadan güvenle izleyebilirsin. İki tutulmayı birbirinden ayırırken önce araya kimin girdiğini hatırla: Gündüz Ay, gece ise Dünya aradadır.",
  life:
    "Bunu evde bir el feneri ve iki meyveyle de deneyebilirsin. Fener Güneş olsun; portakal Dünya, küçük bir erik de Ay olsun. Eriği fenerle portakal arasına getirdiğinde portakalın üzerinde bir gölge belirir. Bu, gündüz yaşanan Güneş tutulmasının harika bir modelidir. Eriği portakalın arkasına sakladığında ise Ay tutulmasını görürsün. Gerçek hayatta bir tutulma olduğunda gözlüksüz güneşe bakmamayı ve bilimin bu güzelliğini güvenle izlemeyi unutma.",
  recap: [
    "Güneş tutulmasında Ay, Güneş ile Dünya arasındadır. Olay gündüz olur.",
    "Ay tutulmasında Dünya, Güneş ile Ay arasındadır. Olay gece olur.",
    "Her yeni ay ve her dolunay tutulma değildir. Güneş'e çıplak gözle bakılmaz.",
  ],
  conceptSeal: "Tutulma, Güneş, Ay ve Dünya'nın aynı çizgide dizilmesidir.",
  voiceSeal: "Hangi tutulmada kimin arada durduğunu ve olayın gündüz mü gece mi olduğunu söylersin.",
  outcomes: [
    "Güneş tutulmasında Ay, Güneş ile Dünya arasındadır.",
    "Ay tutulmasında Dünya, Güneş ile Ay arasındadır.",
    "Güneş tutulması gündüz, Ay tutulması gece gerçekleşir.",
  ],
  scene: "eclipse",
  parentNote:
    "Çocuğunuz Güneş tutulmasında Ay'ın arada olduğunu ve olayın gündüz gerçekleştiğini anlatır. Ay tutulmasında Dünya aradadır ve olay gecedir. Güneş tutulmasına çıplak gözle bakılmaması evde de hatırlatılmalıdır.",

};

export const JUNIOR_FEN_2 = juniorLessonFromScenario(JUNIOR_FEN_2_SCENARIO);
