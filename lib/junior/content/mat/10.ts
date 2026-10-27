import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Ondalık sayılarla toplama, çıkarma ve 10 ile çarpma. */
export const JUNIOR_MAT_15_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-10",
  title: "Ondalık sayılarla işlem",
  teaser:
    "Ondalık toplamada virgüller alt alta gelir. 10 ile çarpınca virgül bir basamak sağa kayar. Kavramsal Anlayış, kuruşu kuruşun altına yazmandır. İfade Gücü, 2,40 artı 1,35'in neden 3,75 ettiğini söylemektir.",
  welcome:
    "Merhaba sevgili çocuklar! Bugün ondalık sayılarla toplama ve çıkarma yapacağız. Hiç alışveriş yaparken etiketlerdeki lira ve kuruş kısımlarını alt alta toplayıp hesapladın mı? Virgülleri aynı hizaya getirdiğinde işlem bir anda çok kolaylaşır. Ondalık sayılarda toplama, çıkarma ve 10 ile kısa yoldan çarpmayı öğreneceğiz.",
  concept:
    "Ondalık sayılarla toplama ve çıkarma yaparken virgüller mutlaka tam olarak alt alta gelmelidir. Tam kısım tam kısmın, onda birler onda birlerin, yüzde birler yüzde birlerin altına yazılır. Boş basamaklar olursa yerine sıfır koyabilirsin. Bir ondalık sayıyı 10 ile çarpmak ise virgülü tam bir basamak sağa kaydırır. Pratik kural: Sayıyı 10'a bölmek virgülü bir basamak sola kaydırır; 10 ile çarpmak ise sağa taşır. Yüzde, yüz eşit parçadan kaç parça alındığını söyler. Bir çokluğun yüzdesi, o çokluk ile yüzdenin çarpımıdır. 200 liranın yüzde 10'u 20 liradır.",
  example:
    "2,40 ile 1,35 sayılarını alt alta toplayalım. Virgüller aynı hizada. Yüzde birlerde 0 artı 5, 5 eder; onda birlerde 4 artı 3, 7 eder; tam kısımda 2 artı 1, 3 eder; sonuç 3,75'tir. Şimdi 3,75'ten 1,35'i çıkarırsak geriye 2,40 kalır. Bir de 3,75'i 10 ile çarpalım: Virgül bir basamak sağa kayar ve sonuç 37,5 olur. 37,5 sayısını 10'a bölersek virgül yeniden sola kayar ve 3,75 değerine geri döner. Yüzde problemlerinde aynı çarpım işe yarar. 80 liralık defterde yüzde 25 indirim, 20 lira iner; ödenen 60 lira kalır. 100 liralık ürüne yüzde 20 KDV eklenirse 20 lira vergi gelir ve ödenen 120 lira olur. 50 liraya alınıp 70 liraya satılan kalemde kâr 20 liradır. 70 liraya alınıp 50 liraya satılırsa zarar 20 liradır.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Tuzaklara Düşme! Virgülleri alt alta hizalamadan sayıları sağa dayayarak toplamak en büyük tuzaktır. 2,4 ile 1,35 toplanırken 4 rakamı 5'in üstüne gelmez! Çünkü 2,4 aslında 2,40 demektir ve 4 rakamı onda birdir. Virgülleri aynı çizgiye dizdiğinde hiçbir işlem karışmaz.",
  life:
    "Bunu harçlık defterinde de kullanırsın. 2 lira 40 kuruş ekmek ve 1 lira 35 kuruş süt, 3 lira 75 kuruş eder. On tane 3,75 liralık defter alırsan 37,5 lira ödersin. Virgül bir basamak sağa kaymıştır. Kuruşu liranın altına yazmadığın gün hesap şaşar.",
  recap: [
    "Toplama ve çıkarmada virgüller alt alta gelir.",
    "2,40 artı 1,35, 3,75 eder. 3,75 eksi 1,35, 2,40 kalır.",
    "Yüzde, bir çokluğun parçasıdır. İndirim düşer, KDV eklenir, kâr ve zarar alış ile satışın farkıdır.",
  ],
  conceptSeal: "Virgül hizası, lira ile kuruşu birbirine karıştırmaz.",
  voiceSeal: "Hangi basamağı hangisinin altına yazdığını söylersin.",
  outcomes: [
    "Ondalık toplamada virgüller alt alta yazılır.",
    "Eksik basamak 0 ile doldurulabilir.",
    "10 ile çarpma virgülü sağa kaydırır.",
    "Yüzde problemleri indirim, KDV, kâr ve zararı aynı çarpımla kurar.",
  ],
  scene: "decimal",
  parentNote:
    "Çocuğunuz 2,40 artı 1,35'i virgülleri hizalayarak 3,75 bulur. 3,75 çarpı 10, 37,5 eder. Evde ekmek ve süt hesabı yeter.",

};

export const JUNIOR_MAT_15 = juniorLessonFromScenario(JUNIOR_MAT_15_SCENARIO);
