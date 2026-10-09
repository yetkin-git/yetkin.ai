import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Denetleyici ve düzenleyici sistemler. */
export const JUNIOR_FEN_16_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-16",
  title: "Denetleyici ve düzenleyici sistemler",
  teaser:
    "Sinir sistemi hızlı haber taşır. İç salgı bezleri hormon üretir ve kan yoluyla daha yavaş etki eder. Kavramsal Anlayış, refleksin omurilikte kurulduğunu söyler. İfade Gücü, iki sistemi hızıyla ayırmandır.",
  welcome:
    "Merhaba güzel arkadaşım, hiç elin kazara çok sıcak bir çaydanlığa değdiğinde, sen daha ne olduğunu anlamadan elini şimşek hızıyla geri çektiğin oldu mu? O inanılmaz hız, bir oturup düşünme kararı değildir. Bugün seninle bedenimizin usta orkestra şefleri olan denetleyici ve düzenleyici sistemlerimizi; yani sinir sistemimiz ile hormonlarımızı yakından tanıyacağız.",
  concept:
    "Vücudumuzdaki sistemlerin uyum içinde çalışmasını denetleyici ve düzenleyici sistemler sağlar. Bu sistem iki ana koldan oluşur: Sinir sistemi ve iç salgı bezleri. Sinir sistemi; beyin, beyincik, omurilik soğanı ve omurilikten oluşur. Sinir hücreleri vücudumuza elektrik telleri gibi yayılır ve iletileri saniyenin küçük bir kesrinde çok hızlı taşır. Beyin öğrenme, hafıza ve istemli hareketlerimizin merkezidir. Omurilik ise istemsiz ve ani tepkilerimiz olan refleksleri yönetir. İç salgı bezleri ise hormon adı verilen kimyasal habercileri doğrudan kana verir. Hipofiz büyüme hormonunu, tiroit tiroksin hormonunu, pankreas ise kan şekerini ayarlayan insülini salgılar. Şurası aklında kalsın tamam mı: Sinirsel iletiler anında ve çok hızlı gerçekleşir; hormonların etkisi ise daha yavaş başlar ama vücutta çok daha uzun süre devam eder.",
  example:
    "Elinin sıcak bir sobaya değdiğini düşünelim. Derindeki duyu almaçları tehlikeyi fark eder ve sinirlerle omuriliğe sinyal yollar. Omurilik hiç vakit kaybetmeden kaslarına 'kolunu çek' emri verir. Elini hızla çekersin; işte bu hayat kurtaran ani tepkiye refleks denir. Acı hissini ise beyin olay bittikten hemen sonra algılar. Şimdi de büyümeni ve boyunun uzamasını düşün. Bu işlem saniyeler içinde olmaz. Hipofiz bezin büyüme hormonunu kana azar azar salgılar ve kemiklerin aylar, yıllar içinde uzar. Aniden karşına sevimli ama havlayan bir köpek çıktığında böbrek üstü bezlerin adrenalin salgılar; kalbin hızla çarpmaya başlar. Gördüğün gibi sinir ve hormonlar birlikte mükemmel bir uyumla çalışır.",
  hint: "trap",
  warning:
    "Sıcak bir nesneye değince elimizi yıldırım hızıyla çekmemizi beynimizin uzun uzun düşündüğünü sanabilirsin; oysa bu hayat kurtaran refleks omuriliğimizin kontrolündedir. Beynimiz bu durumu olay gerçekleştikten hemen sonra öğrenir.",
  life:
    "Bunu bisiklet sürerken ya da ip atlarken çok açık şekilde yaşarsın. Dengeni koruyan ve kaslarının uyumunu sağlayan beyinciğindir. Gece zamanında uyumak büyüme hormonunun en verimli şekilde salgılanmasını sağlar. Çok fazla şekerli ve paketli gıdalar tüketmek ise pankreasını yorabilir. Bedenimizin bu hassas düzenini korumak için düzenli uyku ve dengeli beslenmeyi asla ihmal etmemelisin.",
  recap: [
    "Sinir sistemi beyin, beyincik, omurilik soğanı ve omurilikten oluşur; haberleri çok hızlı taşır.",
    "Refleks davranışlarını omurilik yönetir; beyin haberi hemen ardından alır.",
    "İç salgı bezleri hormon üretip kana verir; etkileri daha yavaş başlar ve uzun sürer.",
  ],
  conceptSeal: "Denetim, sinirin hızlı haberi ile hormonun uzun düzenini birlikte kurar.",
  voiceSeal: "Refleks ile hormonun hız farkını bir örnekle söylersin.",
  outcomes: [
    "Sinir sistemi beyin, omurilik ve sinirlerden oluşur.",
    "Refleks omurilik tarafından yönetilir.",
    "İç salgı bezleri hormon üretir.",
  ],
  scene: "body",
  parentNote:
    "Çocuğunuz sinir sisteminin hızlı, hormonların daha yavaş ve uzun etkili olduğunu ayırır. Sıcak tabağa el çekmenin refleks olduğunu ve omurilikte kurulduğunu anlatır.",

};

export const JUNIOR_FEN_16 = juniorLessonFromScenario(JUNIOR_FEN_16_SCENARIO);
