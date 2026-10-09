import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Duyu organları. */
export const JUNIOR_FEN_17_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-17",
  title: "Duyu organları",
  teaser:
    "Göz görür, kulak işitir ve dengeyi taşır, burun koku alır, dil tat alır, deri dokunur. Kavramsal Anlayış, her organın almaç yerini söyler. İfade Gücü, ışık olmadan rengin seçilemeyeceğini anlatmandır.",
  welcome:
    "Hoş geldin! Hazırsan bugün zihnimizi harika bir bilim yolculuğuna çıkarıyoruz, çünkü dünyayı algılamamızı sağlayan beş eşsiz penceremizi aralayacağız. Zifiri karanlık bir odada eşyaların renklerini neden göremediğini ya da burnun tıkalıyken en sevdiğin yemeğin tadını neden alamadığını hiç düşündün mü? Gözümüz, kulağımız, burnumuz, dilimiz ve derimiz çevremizdeki mesajları toplayan birer dedektiftir. Bugün seninle beş duyu organımızın hayranlık uyandıran yapısını ve görevlerini öğreneceğiz.",
  concept:
    "Duyu organlarımız çevremizdeki uyarıları özel almaçlarıyla toplar ve sinirlerle beynimize iletir. Gözümüz görme organımızdır; ışık korneadan geçer, göz bebeğinden girer, göz merceğinde kırılır ve ağ tabakadaki sarı lekeye ters olarak düşer; görme sinirleri bunu beyne taşır ve beyin düz olarak algılar. Kulağımız işitme organımız olduğu kadar iç kulaktaki yarım daire kanalları sayesinde dengemizi de sağlar. Burnumuzun sarı bölgesindeki koku almaçları havadaki koku taneciklerini algılar. Dilimizdeki tat tomurcukları tatlı, tuzlu, ekşi ve acı tatları ayırt eder. Derimiz ise dokunma, sıcaklık, soğukluk, basınç ve acıyı hisseden en büyük organımızdır. Şurası aklında kalsın tamam mı: Duyu organları sadece mesajı alan alıcılardır; görüntüyü gören, sesi işiten ve kokuyu anlamlandıran merkez daima beynimizdir.",
  example:
    "Masaya sulu kırmızı bir elma koyalım. Gözümüz elmanın rengini ve yuvarlaklığını görür. Elini uzattığında derindeki dokunma almaçları elmanın pürüzsüz kabuğunu hisseder. Burnunu yaklaştırdığında sarı bölgedeki koku almaçları o tatlı kokuyu yakalar. Bir ısırık aldığında kulağın elmanın çıtırtısını duyar, dilindeki tat tomurcukları ise elmanın tatlılığını beyne bildirir. Tek bir elmayı yerken beş duyu organın aynı anda beyne beş farklı bilgi akıtır. Beynimiz bu beş parçayı birleştirir ve 'Bu taze ve lezzetli bir elmadır' der. Işık olmayan karanlıkta gözdeki almaçlar uyarılamaz ve renkleri göremezsin; burnun tıkandığında ise koku ve tat beyinde ortak işlendiği için yemeğin lezzetini eksik alırsın.",
  hint: "gold",
  warning:
    "Zifiri karanlıkta renkleri ayırt edebileceğimizi düşünmek bir yanılgıdır; çünkü gözümüzdeki görme hücrelerinin çalışması için mutlaka ışık gerekir. Ayrıca kulağımızın sadece işitmeye değil, dengemizi sağlamaya da yarayan mucizevi bir organ olduğunu aklından çıkarma.",
  life:
    "Bunu her sabah yüzünü yıkarken ve güne başlarken hatırlayabilirsin. Gözlerini tozdan korumak için kirli ellerle ovuşturmamalısın. Yüksek sesle uzun süre kulaklıkla müzik dinlemek kulak zarındaki hassas yapıları yorar. Çok sıcak içecekler içmek dilindeki tat tomurcuklarına zarar verebilir. Duyu organlarımız dış dünyaya açılan en kıymetli kapılarımızdır; onları korumak sağlığımızın ilk adımıdır.",
  recap: [
    "Göz ışıkla görür; görüntü ağ tabakada oluşur ve görme sinirleriyle beyne taşınır.",
    "Kulak hem işitme hem de denge organımızdır; burun koku, dil tat alır.",
    "Deri dokunma, sıcaklık ve basıncı algılar; bütün bu duyuların anlamını beyin kurar.",
  ],
  conceptSeal: "Duyu organları çevreden haber alır ve bu haberi sinirle beyne taşır.",
  voiceSeal: "Beş organın neyi aldığını ve gözün ışık istediğini söylersin.",
  outcomes: [
    "Göz, ışığı ağ tabakada alır.",
    "Kulak işitme ve denge organıdır.",
    "Burun, dil ve deri koku, tat ve dokunma haberini alır.",
  ],
  scene: "body",
  parentNote:
    "Çocuğunuz beş duyu organının görevini ve gözde görüntünün ağ tabakada oluştuğunu anlatır. Kulağın dengeyi de taşıdığını ve karanlıkta renk seçilemediğini ayırt eder.",

};

export const JUNIOR_FEN_17 = juniorLessonFromScenario(JUNIOR_FEN_17_SCENARIO);
