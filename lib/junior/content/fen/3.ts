import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Destek ve hareket sistemi. */
export const JUNIOR_FEN_3_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-3",
  title: "Destek ve hareket sistemi",
  teaser:
    "Kemik şekil verir ve korur. Kıkırdak esnektir. Eklem kemikleri birleştirir. Kas kasılınca kemik hareket eder. Kavramsal Anlayış, dördünü ayrı işiyle söyler. İfade Gücü, kolunu kaldırırken kas ve eklemi anlatmandır.",
  welcome:
    "Selamlar! Bugün seninle doğanın ve bilimin çok keyifli bir sırrını keşfedeceğiz, çünkü kendi bedenimizin hareket mucizesine yakından bakacağız. Hiç kolunu kaldırırken veya topa vururken hangi parçalarının uyumla çalıştığını düşündün mü? Kemiklerimiz tek başına adım atamaz. Bugün seninle kemik, kıkırdak, eklem ve kaslarımızın el ele vererek nasıl harika bir takım oluşturduğunu göreceğiz.",
  concept:
    "Destek ve hareket sistemi; kemik, kıkırdak, eklem ve kaslardan meydana gelir. Kemiklerimiz vücudumuza dik bir şekil verir ve hayati iç organlarımızı korur. Kıkırdak ise esnek ve yumuşaktır; burun ucumuzda, kulak kepçemizde ve kemik uçlarında sürtünmeyi önler. Eklem, iki kemiğin birbiriyle buluştuğu noktadır. Dirsek ve dizlerimiz oynar eklemdir, rahatça bükülür. Kafatası kemiklerimiz ise oynamaz eklemdir, beynimizi sıkıca sarar. Kaslarımız ise kasılıp gevşeyerek kemikleri çeker. Şurası aklında kalsın tamam mı: Kemik tek başına hareket edemez; mutlaka kasların çekiş gücüyle çalışır.",
  example:
    "Hadi şimdi birlikte kolunu büküp pazını sık. Kolunu yukarı çeken şey, kolunun önündeki kasın kasılıp kısalmasıdır. Kas kasılırken kemiği dirsek ekleminden yukarı doğru çeker. Dirsek oynar bir eklem olduğu için kolun kolayca bükülür. Şimdi elini burnunun ucuna ve kulağına dokundur; hissettiğin o tatlı esneklik kıkırdaktır. Dizlerindeki kıkırdak olmasaydı kemikler birbirine sertçe sürter ve aşınırdı. Yürürken, koşarken veya zıplarken kemik yükü taşır, kas ise o yükü hareket ettirir.",
  hint: "gold",
  warning:
    "Kemikleri yalnızca sert birer iskelet desteği gibi düşünmek eksik kalır; onlar iç organlarımızı korur ve kaslara tutunacak sağlam bir yuva sunar. Kaslar da tek başına hareket yaratamaz. Kemik ve kas birlikte çalışınca destek ve hareket sistemi kusursuzca işler.",
  life:
    "Bunu okulda sırt çantanı taşırken hemen fark edersin. Çantanı tek omzuna asarsan o taraftaki kemik ve kaslar çok çabuk yorulur; bu yüzden askıları iki omzuna birden takıp yükü paylaştırmalısın. Ders çalışırken sırtını dik tutmak omurganı korur. Oyun oynarken bir eklemini burkarsan o bölgeyi zorlamamalı, hemen dinlenmeli ve bir büyüğüne haber vermelisin.",
  recap: [
    "Kemik şekil verir ve organları korur. Kıkırdak esnektir.",
    "Oynar eklem hareketi genişletir. Oynamaz eklem kemikleri sıkı tutar.",
    "Kas kasılıp gevşer. Kemik bu çekişle hareket eder.",
  ],
  conceptSeal: "Destek ve hareket, kemik ile kasın birlikte çalışmasıdır.",
  voiceSeal: "Kolunu kaldırırken kasın kemiği eklemden çektiğini söylersin.",
  outcomes: [
    "Kemikler vücuda şekil verir ve organları korur.",
    "Eklemler kemikleri birbirine bağlar.",
    "Kaslar kasılıp gevşeyerek hareketi sağlar.",
  ],
  scene: "body",
  parentNote:
    "Çocuğunuz kemiğin destek ve koruma, kıkırdağın esneklik, eklemin birleşme ve kasın hareket işini ayırır. Çantanın iki omuza takılması ve düşen eklemin zorlanmaması evde pekişir.",

};

export const JUNIOR_FEN_3 = juniorLessonFromScenario(JUNIOR_FEN_3_SCENARIO);
