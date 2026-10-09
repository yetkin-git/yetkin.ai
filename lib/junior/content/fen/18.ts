import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Sistemlerin sağlığı ve ilk yardım. */
export const JUNIOR_FEN_18_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-18",
  title: "Sistemlerin sağlığı",
  teaser:
    "Dengeli beslenme, hareket, uyku ve temizlik sistemleri korur. İlk yardımda önce 112 aranır. Kavramsal Anlayış, güvenli ortamı kurar. İfade Gücü, bilinci kapalı kişiye neden su verilmeyeceğini söylemektir.",
  welcome:
    "Selamlar! Bugün seninle doğanın ve bilimin çok keyifli bir sırrını keşfedeceğiz, çünkü bedenimizin tüm sistemlerini bir ömür boyu zinde tutmanın ve beklenmedik kazalarda doğru adımları atmanın yollarını öğreneceğiz. Oyun oynarken düşüp dizini sıyıran ya da bileğini burkan bir arkadaşını gördüğünde ilk ne yapman gerektiğini hiç düşündün mü? Sağlık, sistemlerimize sevgiyle bakmakla başlar; ilk yardım ise soğukkanlı bir bilinçle hayat kurtarır. Bugün seninle sistemlerimizin sağlığını ve temel ilk yardım kurallarını öğreneceğiz.",
  concept:
    "Vücudumuzdaki destek ve hareket, sindirim, dolaşım, solunum ve boşaltım sistemleri düzenli bakım ister. Dengeli ve taze beslenme, bol su içme, düzenli uyku, spor yapma ve kişisel temizlik bu sağlığın temel taşlarıdır. Sigara, alkol gibi zararlı maddelerden ve pasif duman solumaktan kesinlikle uzak durulmalıdır. Beklenmedik bir kaza anında yapılan ilk yardımda ise en temel kural önce ortamın güvenliğini sağlamaktır. Ardından derhal bir yetişkine haber verilir ve 112 Acil Yardım hattı aranır. Bilinci kapalı kişilere asla yiyecek ya da su verilmez. Kanamalarda temiz bir bezle yaranın üzerine hafifçe baskı yapılır. Yanıklarda yanan bölge akan serin musluk suyu altında tutulur. Kırık şüphesinde ise kol ya da bacak asla hareket ettirilmez. Şurası aklında kalsın tamam mı: İlk yardım bir gösteri yarışı değildir; sakin kalmak, doğru numarayı aramak ve bilmediğin müdahalelerden kaçınmak en büyük yardımdır.",
  example:
    "Okul bahçesinde koşarken bir arkadaşının düşüp dizinin kanadığını görelim. Hemen telaşlanmadan yanına git. Önce etrafta bisiklet ya da sivri taş gibi tehlikeler var mı bak. Temiz bir mendille veya gazlı bezle kanayan dizin üzerine nazikçe bastır. Nöbetçi öğretmene hemen haber ver. Evde eline sıcak çorba döküldüğünü düşünelim; asla yanığın üzerine diş macunu veya buz sürme! Elini 10-15 dakika boyunca akan ılık-serin musluk suyunun altına tut. Yolda baygın yatan birini gördüğünde 'ayılsın' diye ağzına su dökmeye çalışma; çünkü su soluk borusuna kaçıp nefesini kesebilir. Sen hemen 112'yi ara, adresini sakin ve net bir sesle söyle.",
  hint: "trap",
  warning:
    "Bayılan ya da bilinci kapalı birini gördüğünde yardım etmek amacıyla su içirmeye çalışmak soluk borusunu tıkayabilir. Hemen bir yetişkine haber verir, 112 Acil Yardım hattını arar ve sakin kalarak sağlık ekiplerini bekleriz.",
  life:
    "Bunu her gün basit alışkanlıklarla hayatına katabilirsin. Yemeklerden önce ve sonra ellerini 20 saniye sabunla yıkamak sindirimini mikroplardan korur. Günde 8-10 bardak su içmek böbreklerine bayram ettirir. Evdeki buzdolabının üstüne ya da çalışma masana 112 numarasını büyük harflerle yazıp asmak harika bir önlemdir. Böylece acil bir durumda panik yapmadan ne yapacağını her zaman bilirsin.",
  recap: [
    "Dengeli beslenme, temizlik, su ve düzenli uyku vücut sistemlerimizi korur.",
    "İlk yardımda önce ortam güvenliği sağlanır, sonra 112 Acil Yardım aranır.",
    "Bilinci kapalıya su verilmez; kanamaya temiz bezle basılır, kırık oynatılmaz.",
  ],
  conceptSeal: "Sistem sağlığı günlük bakım, ilk yardım ise sakin ve güvenli müdahaledir.",
  voiceSeal: "112 yi, su verilmeyecek hâli ve kanamadaki bezi sırayla söylersin.",
  outcomes: [
    "Düzenli beslenme, uyku ve hareket sistemlerin sağlığını korur.",
    "İlk yardımda önce güvenli ortam kurulur ve 112 aranır.",
    "Bilinci kapalı kişiye yiyecek ve su verilmez.",
  ],
  scene: "body",
  parentNote:
    "Çocuğunuz 112 yi, bilinci kapalı kişiye su verilmemesini ve kanamaya temiz bezle bastırmayı söyler. Yanığın serin suyla tutulması ve kırığın oynatılmaması da bu konudadır. Evde numaranın görünür olması yeter.",

};

export const JUNIOR_FEN_18 = juniorLessonFromScenario(JUNIOR_FEN_18_SCENARIO);
