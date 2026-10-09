/**
 * Bir kerelik üretim: lib/junior/quiz/fen/{1..20}.ts
 * Çalıştır: npx tsx scripts/generate-junior-fen-quiz-archive.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Q = {
  id: string;
  level: "concept" | "apply" | "skill";
  question: string;
  options: [string, string, string, string];
  correctAnswerIndex: 0 | 1 | 2 | 3;
  hint: string;
  explanation: string;
};

type Pack = {
  n: number;
  title: string;
  tellGuides: [string, string] | [string, string, string];
  questions: [Q, Q, Q];
};

const PACKS: Pack[] = [
  {
    n: 1,
    title: "Güneş sistemindeki gezegenler",
    tellGuides: [
      "Güneş neden bir gezegen değildir?",
      "Sekiz gezegeni Güneş'ten dışa doğru sırayla sayabilir misin?",
      "Ay ile Plüton'u gezegen sırasına neden katmıyoruz?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Güneş sisteminin merkezindeki gök cismi nedir?",
        options: ["Güneş (yıldız)", "Dünya", "Ay", "Jüpiter"],
        correctAnswerIndex: 0,
        hint: "Merkezdeki cisim ışık üretir; gezegen değildir.",
        explanation:
          "Adım 1: Güneş sistemi Güneş ve çevresindeki gök cisimlerinden oluşur. Adım 2: Merkezde Güneş vardır. Adım 3: Güneş bir yıldızdır; gezegen veya uydu değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Güneş'ten dışa doğru üçüncü gezegen hangisidir?",
        options: ["Venüs", "Dünya", "Mars", "Merkür"],
        correctAnswerIndex: 1,
        hint: "Sıra: Merkür, Venüs, Dünya, Mars…",
        explanation:
          "Adım 1: Güneş'e en yakın Merkür'dür. Adım 2: Sonra Venüs gelir. Adım 3: Üçüncü sırada Dünya vardır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Ela gece gökyüzüne bakıyor. Ay'ı görüp «İşte dokuzuncu gezegen!» diyor. Hangisi doğru düzeltmedir?",
        options: [
          "Ay bir uydudur; sekiz gezegen listesine girmez",
          "Ay cüce gezegendir; listeye eklenir",
          "Ay en uzak gezegendir",
          "Ay Güneş'in kardeş yıldızıdır",
        ],
        correctAnswerIndex: 0,
        hint: "Ay Dünya'nın çevresinde dolanır.",
        explanation:
          "Adım 1: Gezegen bir yıldızın çevresinde dolanan büyük gök cismidir. Adım 2: Ay Dünya'nın çevresinde dolandığı için uydudur. Adım 3: Bu yüzden sekiz gezegen sırasına eklenmez.",
      },
    ],
  },
  {
    n: 2,
    title: "Güneş ve Ay tutulması",
    tellGuides: [
      "Güneş ve Ay tutulmaları arasındaki temel farkları anlatabilir misin?",
      "Güneş tutulması hangi evrede ve hangi zamanda olur?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Güneş tutulmasında araya hangi gök cismi girer?",
        options: ["Ay", "Dünya", "Mars", "Jüpiter"],
        correctAnswerIndex: 0,
        hint: "Güneş ile Dünya arasında kalan cisim Ay'dır.",
        explanation:
          "Adım 1: Tutulmada üç cisim aynı çizgiye gelir. Adım 2: Güneş tutulmasında Güneş–Ay–Dünya sırası vardır. Adım 3: Arada Ay olduğu için Ay'ın gölgesi Dünya'ya düşer.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Güneş tutulması hangi Ay evresinde ve hangi zamanda gerçekleşir?",
        options: [
          "Yeni ayda, gündüz",
          "Dolunayda, gece",
          "Yeni ayda, gece",
          "Dolunayda, gündüz",
        ],
        correctAnswerIndex: 0,
        hint: "Gündüz kararma = Güneş tutulması; o sırada Ay yenidir.",
        explanation:
          "Adım 1: Güneş tutulması gündüz olur. Adım 2: Ay, Güneş ile Dünya arasındadır; bu dizilim yeni ayda olur. Adım 3: Dolunayda olan ve gece görülen olay Ay tutulmasıdır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Sınıfta fener (Güneş), portakal (Dünya) ve erik (Ay) ile model kuruluyor. Erik fener ile portakal arasındayken portakalın üzerine gölge düşüyor. Bu model neyi gösterir?",
        options: [
          "Güneş tutulmasını",
          "Ay tutulmasını",
          "Yalnızca dolunayı",
          "Gezegen sırasını",
        ],
        correctAnswerIndex: 0,
        hint: "Arada küçük top (Ay) varsa gündüz tutulması modelidir.",
        explanation:
          "Adım 1: Fener Güneş, portakal Dünya, erik Ay'dır. Adım 2: Erik ortadayken ışık kesilir ve Dünya'ya gölge düşer. Adım 3: Bu Güneş tutulması modelidir. Ay tutulmasında Dünya ortada olur.",
      },
    ],
  },
  {
    n: 3,
    title: "Destek ve hareket sistemi",
    tellGuides: [
      "Kemik, eklem ve kasın görevlerini kendi cümlenle ayırabilir misin?",
      "Hareket nasıl oluşur; kaslar ne yapar?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Vücuda şekil veren ve organları koruyan yapı hangisidir?",
        options: ["Kemikler", "Kan", "Alveol", "İdrar kesesi"],
        correctAnswerIndex: 0,
        hint: "İskelet sistemi destek ve koruma sağlar.",
        explanation:
          "Adım 1: Destek ve hareket sisteminde kemikler iskeleti oluşturur. Adım 2: Kemikler vücuda şekil verir. Adım 3: Ayrıca organları dış etkilerden korur.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Dirsekte kemiklerin birbirine bağlandığı yapıya ne denir?",
        options: ["Eklem", "Alveol", "Safra", "Direnç"],
        correctAnswerIndex: 0,
        hint: "Kemik–kemik birleşim yerini düşün.",
        explanation:
          "Adım 1: İki kemiğin birleştiği yere eklem denir. Adım 2: Dirsek bir eklem örneğidir. Adım 3: Eklemler hareketi kolaylaştırır; kaslar da bu eklemler üzerinden iş yapar.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Deniz topu kaldırmak için kolunu büktü. Bu harekette asıl «çekme–gevşeme» işini kim yapar?",
        options: [
          "Kaslar",
          "Yalnızca deri",
          "Yalnızca tırnaklar",
          "Yalnızca saç telleri",
        ],
        correctAnswerIndex: 0,
        hint: "Kasılıp gevşeyen doku harekettir.",
        explanation:
          "Adım 1: Kemikler destek verir ama kendi başına kasılmaz. Adım 2: Kaslar kasılıp gevşeyerek kemikleri hareket ettirir. Adım 3: Topu kaldırmak için kaslar çalışır; eklem hareketi mümkün kılar.",
      },
    ],
  },
  {
    n: 4,
    title: "Sindirim sistemi",
    tellGuides: [
      "Fiziksel ve kimyasal sindirimi nasıl ayırırsın?",
      "Besinlerin emilimi hangi organda olur?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Besini dişlerle küçük parçalara ayırmak hangi sindirimdir?",
        options: [
          "Fiziksel sindirim",
          "Kimyasal sindirim",
          "Boşaltım",
          "Solunum",
        ],
        correctAnswerIndex: 0,
        hint: "Parçalama mekaniktir; enzim yok.",
        explanation:
          "Adım 1: Fiziksel sindirim besini küçük parçalara ayırır. Adım 2: Çiğneme bunun örneğidir. Adım 3: Kimyasal sindirimde enzimler kullanılır; bu soruda enzim yoktur.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Enzimlerle besinlerin parçalanmasına ne denir?",
        options: [
          "Kimyasal sindirim",
          "Yalnızca çiğneme",
          "Kan dolaşımı",
          "Ses yansıması",
        ],
        correctAnswerIndex: 0,
        hint: "Enzim = kimyasal iş.",
        explanation:
          "Adım 1: Kimyasal sindirim enzimlerle olur. Adım 2: Besin molekülleri daha küçük birimlere ayrılır. Adım 3: Bu, çiğnemeden farklı bir süreçtir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Öğle yemeğinden sonra besinlerin kana karışması için asıl emilim yeri neresidir?",
        options: [
          "İnce bağırsak",
          "Ağız boşluğu",
          "Burun boşluğu",
          "Kulak zarı",
        ],
        correctAnswerIndex: 0,
        hint: "Emilim yolu uzun ve kıvrımlıdır.",
        explanation:
          "Adım 1: Ağız ve midede parçalama başlar. Adım 2: Emilimin asıl yeri ince bağırsaktır. Adım 3: Orada sindirilmiş besinler kana geçer.",
      },
    ],
  },
  {
    n: 5,
    title: "Dolaşım sistemi",
    tellGuides: [
      "Dolaşım sisteminin üç temel parçasını söyleyebilir misin?",
      "Büyük ve küçük kan dolaşımını nasıl ayırırsın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Dolaşım sistemini oluşturan üç temel yapı hangisidir?",
        options: [
          "Kalp, kan ve damarlar",
          "Kemik, eklem ve kas",
          "Böbrek, idrar ve deri",
          "Göz, kulak ve dil",
        ],
        correctAnswerIndex: 0,
        hint: "Pompa, taşıyıcı sıvı ve yollar.",
        explanation:
          "Adım 1: Kalp kanı pompalar. Adım 2: Kan oksijen ve besinleri taşır. Adım 3: Damarlar kanın dolaştığı yollardır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Küçük kan dolaşımı hangi iki organ arasındadır?",
        options: [
          "Kalp ile akciğer",
          "Kalp ile ayak",
          "Mide ile bağırsak",
          "Beyin ile omurilik",
        ],
        correctAnswerIndex: 0,
        hint: "Küçük dolaşım oksijen almak içindir.",
        explanation:
          "Adım 1: Küçük dolaşım kalpten akciğere gider. Adım 2: Akciğerde gaz alışverişi olur. Adım 3: Kan tekrar kalbe döner. Büyük dolaşım vücut genelidir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Koşudan sonra nabız hızlanır. Bu, kalbin hangi işini gösterir?",
        options: [
          "Kanı daha hızlı pompaladığını",
          "Ses dalgası ürettiğini",
          "Yoğunluk ölçtüğünü",
          "Işık soğurduğunu",
        ],
        correctAnswerIndex: 0,
        hint: "Kaslar daha çok oksijen ister.",
        explanation:
          "Adım 1: Koşuda kaslar daha fazla oksijen ister. Adım 2: Kalp daha sık kasılarak kanı hızlandırır. Adım 3: Nabız artışı bu pompalama hızının göstergesidir.",
      },
    ],
  },
  {
    n: 6,
    title: "Kan grupları ve kan bağışı",
    tellGuides: [
      "Dört ana kan grubunu ve Rh faktörünü anlatabilir misin?",
      "Kan bağışı neden sağlık kontrolünden sonra yapılır?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Ana kan grupları hangileridir?",
        options: [
          "A, B, AB ve 0",
          "Katı, sıvı ve gaz",
          "İç ve dış gezegen",
          "İletken ve yalıtkan",
        ],
        correctAnswerIndex: 0,
        hint: "Dört harfli gruplama vardır.",
        explanation:
          "Adım 1: İnsanlarda dört ana kan grubu vardır. Adım 2: Bunlar A, B, AB ve 0'dır. Adım 3: Ayrıca Rh pozitif veya negatif olabilir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Rh faktörü neyi etkiler?",
        options: [
          "Kan uyumunu",
          "Sesin hızını",
          "Gezegen sırasını",
          "Yoğunluk formülünü",
        ],
        correctAnswerIndex: 0,
        hint: "Rh+ ve Rh− uyumda önemlidir.",
        explanation:
          "Adım 1: Rh, kanda bir proteindir. Adım 2: Pozitif veya negatif olabilir. Adım 3: Kan naklinde grupla birlikte Rh uyumu da bakılır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Okulda kan bağışı afişi asılı. Doğru mesaj hangisidir?",
        options: [
          "Bağış gönüllüdür ve sağlık kontrolünden sonra yapılır",
          "Herkes hiçbir kontrol olmadan bağış yapmalıdır",
          "Kan grubu bilinmeden bağış zorunludur",
          "Bağış yalnız gece yapılabilir",
        ],
        correctAnswerIndex: 0,
        hint: "Gönüllülük ve güvenlik birlikte gelir.",
        explanation:
          "Adım 1: Kan bağışı gönüllü bir yardımlardır. Adım 2: Önce sağlık kontrolü yapılır. Adım 3: Böylece hem verici hem alıcı korunur.",
      },
    ],
  },
  {
    n: 7,
    title: "Solunum sistemi",
    tellGuides: [
      "Soluk alma ve vermede diyaframın rolünü anlatabilir misin?",
      "Gaz alışverişi nerede olur?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Soluk alma ve vermeyi sağlayan kas hangisidir?",
        options: ["Diyafram", "Kalp kapağı", "Böbrek", "Kulak zarı"],
        correctAnswerIndex: 0,
        hint: "Göğüs boşluğunun altındaki kastır.",
        explanation:
          "Adım 1: Diyafram göğüs boşluğunun altındadır. Adım 2: Kasılınca göğüs genişler, soluk alınır. Adım 3: Gevşeyince soluk verilir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Oksijen ile karbondioksit değişimi nerede olur?",
        options: ["Alveollerde", "Mide duvarında", "Tırnak kökünde", "Saç telinde"],
        correctAnswerIndex: 0,
        hint: "Akciğerdeki ince kesecikler.",
        explanation:
          "Adım 1: Hava bronşlardan alveollere ulaşır. Adım 2: Alveol duvarı incedir. Adım 3: Orada oksijen kana, karbondioksit dışarı geçer.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Derin nefes alıp üfleme yarışında doğru bilimsel ifade hangisidir?",
        options: [
          "Oksijen kana geçer, karbondioksit dışarı verilir",
          "Karbondioksit kana girer, oksijen dışarı atılır",
          "Ses boşlukta daha hızlı yayılır",
          "Kemikler gaz alışverişi yapar",
        ],
        correctAnswerIndex: 0,
        hint: "Alınan oksijen, verilen karbondioksit.",
        explanation:
          "Adım 1: Soluk alırken oksijen alveollere gelir. Adım 2: Oksijen kana geçer. Adım 3: Hücrelerden gelen karbondioksit solukla dışarı verilir.",
      },
    ],
  },
  {
    n: 8,
    title: "Boşaltım sistemi",
    tellGuides: [
      "Böbreklerin temel görevini anlatabilir misin?",
      "Deri ve akciğer boşaltıma nasıl yardım eder?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Kanı süzüp idrar oluşturan organ hangisidir?",
        options: ["Böbrek", "Kalp", "Göz", "Kulak"],
        correctAnswerIndex: 0,
        hint: "İki tane, bel hizasındadır.",
        explanation:
          "Adım 1: Boşaltımın ana organı böbrektir. Adım 2: Böbrekler kanı süzer. Adım 3: Atıklarla birlikte idrar oluşur.",
      },
      {
        id: "q2",
        level: "apply",
        question: "İdrarı bir süre depolayan yapı hangisidir?",
        options: ["İdrar kesesi", "Alveol", "Eklem", "Safra kesesi"],
        correctAnswerIndex: 0,
        hint: "Depo organı mesanedir.",
        explanation:
          "Adım 1: Böbrekte oluşan idrar kanallarla iner. Adım 2: İdrar kesesinde (mesane) birikir. Adım 3: Uygun zamanda vücuttan atılır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Sıcak günde terlemek boşaltım açısından neyi gösterir?",
        options: [
          "Derinin de boşaltıma yardımcı olduğunu",
          "Derinin yalnız ses ürettiğini",
          "Terin sindirim enzimi olduğunu",
          "Terin elektriği yalıttığını",
        ],
        correctAnswerIndex: 0,
        hint: "Boşaltım yalnız böbrek değildir.",
        explanation:
          "Adım 1: Ana boşaltım böbrekledir. Adım 2: Deri terle, akciğer solukla, kalın bağırsak dışkıyla yardımcı olur. Adım 3: Terlemek derinin boşaltıma katkısıdır.",
      },
    ],
  },
  {
    n: 9,
    title: "Bileşke kuvvet",
    tellGuides: [
      "Kuvvetin doğrultusu, yönü ve büyüklüğünü örnekle anlatabilir misin?",
      "Bileşke sıfır olduğunda ne olur?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Kuvvetin üç özelliği hangileridir?",
        options: [
          "Doğrultu, yön ve büyüklük",
          "Renk, koku ve tat",
          "Yoğunluk, hacim ve ses",
          "Rh, A ve B",
        ],
        correctAnswerIndex: 0,
        hint: "Ok çiziminde üç bilgi vardır.",
        explanation:
          "Adım 1: Kuvvet bir vektörel büyüklüktür. Adım 2: Doğrultusu çizgi, yönü ok ucu, büyüklüğü ok uzunluğudur. Adım 3: Bu üçü olmadan kuvvet tam anlatılmaz.",
      },
      {
        id: "q2",
        level: "apply",
        question:
          "Aynı doğrultuda 5 N sağa ve 3 N sola etki ediyor. Bileşke kaç N'dir?",
        options: ["2 N sola", "8 N sağa", "2 N sağa", "15 N sağa"],
        correctAnswerIndex: 2,
        hint: "Zıt yönlerde fark alınır; büyük olanın yönü kalır.",
        explanation:
          "Adım 1: Zıt yönlü kuvvetlerde fark alınır. Adım 2: 5 − 3 = 2 N. Adım 3: Büyük kuvvet sağa olduğu için bileşke 2 N sağadır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Masadaki kitap kıpırdamıyor. Kitaba etki eden kuvvetler için doğru yargı hangisidir?",
        options: [
          "Bileşke sıfırdır; kuvvetler dengelenmiştir",
          "Bileşke sonsuzdur",
          "Kuvvet yoktur",
          "Yalnızca ses kuvveti vardır",
        ],
        correctAnswerIndex: 0,
        hint: "Hareketsizlik = denge.",
        explanation:
          "Adım 1: Kitaba ağırlık ve masa tepkisi gibi kuvvetler etki eder. Adım 2: Kitap yerinden oynamıyorsa net kuvvet sıfırdır. Adım 3: Bileşke sıfırsa kuvvetler dengelenmiştir.",
      },
    ],
  },
  {
    n: 10,
    title: "Sabit süratli hareket",
    tellGuides: [
      "Sürat formülünü ve birimini kendi sözünle söyleyebilir misin?",
      "Sabit süratte yol-zaman grafiği nasıl görünür?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Sürat nasıl hesaplanır?",
        options: [
          "Yol bölü zaman",
          "Zaman bölü yol",
          "Kütle bölü hacim",
          "Kuvvet artı yön",
        ],
        correctAnswerIndex: 0,
        hint: "S = x / t",
        explanation:
          "Adım 1: Sürat, alınan yolun geçen zamana bölümüdür. Adım 2: Formül S = yol / zaman'dır. Adım 3: Birimi genelde m/s veya km/sa olur.",
      },
      {
        id: "q2",
        level: "apply",
        question:
          "Bir bisiklet 100 metreyi 20 saniyede sabit süratle alıyor. Sürati kaç m/s'dir?",
        options: ["5", "20", "100", "2"],
        correctAnswerIndex: 0,
        hint: "100'ü 20'ye böl.",
        explanation:
          "Adım 1: S = yol / zaman. Adım 2: 100 ÷ 20 = 5. Adım 3: Sürat 5 m/s'dir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Yol-zaman grafiğinde sabit süratli hareket nasıl görünür?",
        options: [
          "Eğimi sabit bir doğru",
          "Dikey bir nokta",
          "Yalnızca daire",
          "Ses dalgası eğrisi",
        ],
        correctAnswerIndex: 0,
        hint: "Zaman arttıkça yol düzenli artar.",
        explanation:
          "Adım 1: Sabit süratte eşit zamanlarda eşit yol alınır. Adım 2: Yol-zaman grafiği düz bir doğrudur. Adım 3: Eğim sürati gösterir; sürat-zaman grafiği ise yatay doğru olur.",
      },
    ],
  },
  {
    n: 11,
    title: "Maddenin tanecikli yapısı",
    tellGuides: [
      "Katı, sıvı ve gazda tanecik dizilişini nasıl ayırırsın?",
      "Sıcaklık artınca taneciklere ne olur?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Maddeler neyden oluşur?",
        options: [
          "Taneciklerden",
          "Yalnızca sesten",
          "Yalnızca ışıktan",
          "Yalnızca boşluktan",
        ],
        correctAnswerIndex: 0,
        hint: "Gözle görülmeyen küçük birimler.",
        explanation:
          "Adım 1: Madde tanecikli yapıdadır. Adım 2: Katı, sıvı ve gaz hepsi taneciklerden oluşur. Adım 3: Fark, taneciklerin dizilişi ve hareketindedir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Tanecikler en düzgün ve en sık nasıl dizilir?",
        options: ["Katıda", "Sıvıda", "Gazda", "Boşlukta"],
        correctAnswerIndex: 0,
        hint: "Sabit şekil = sıkı düzen.",
        explanation:
          "Adım 1: Katıda tanecikler düzenli ve yakındır. Adım 2: Sıvıda daha serbest kayarlar. Adım 3: Gazda birbirinden uzak ve hızlıdır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Balon güneşte şişiyor gibi gerginleşiyor. Bilimsel açıklama hangisidir?",
        options: [
          "Sıcaklık artınca gaz tanecikleri daha hızlı hareket eder",
          "Ses boşlukta yayıldığı için",
          "Yoğunluk formülü değiştiği için",
          "Kan grubu değiştiği için",
        ],
        correctAnswerIndex: 0,
        hint: "Isı → hareket hızı.",
        explanation:
          "Adım 1: Güneş balon içindeki havayı ısıtır. Adım 2: Tanecik hareketi hızlanır. Adım 3: Tanecikler duvarlara daha sık çarpar; balon gerginleşir.",
      },
    ],
  },
  {
    n: 12,
    title: "Yoğunluk",
    tellGuides: [
      "Yoğunluk formülünü bir örnekle anlatabilir misin?",
      "Bir cismin suda yüzmesi yoğunlukla nasıl bağlanır?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Yoğunluk nasıl bulunur?",
        options: [
          "Kütle bölü hacim",
          "Hacim bölü kütle",
          "Yol bölü zaman",
          "Kuvvet artı yön",
        ],
        correctAnswerIndex: 0,
        hint: "d = m / V",
        explanation:
          "Adım 1: Yoğunluk ayırt edici bir özelliktir. Adım 2: Formül d = kütle / hacim'dir. Adım 3: Birimi genelde g/cm³ veya kg/m³ olur.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Kütlesi 20 g, hacmi 10 cm³ olan maddenin yoğunluğu kaçtır?",
        options: ["2 g/cm³", "0,5 g/cm³", "30 g/cm³", "200 g/cm³"],
        correctAnswerIndex: 0,
        hint: "20'yi 10'a böl.",
        explanation:
          "Adım 1: d = m / V. Adım 2: 20 ÷ 10 = 2. Adım 3: Yoğunluk 2 g/cm³'tür.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Yağ, su ve bal aynı kapta katmanlaşıyor. En altta hangisi olur?",
        options: [
          "Bal (yoğunluğu en büyük)",
          "Yağ (yoğunluğu en büyük)",
          "Su (yoğunluğu en küçük)",
          "Hepsi aynı yoğunluktadır",
        ],
        correctAnswerIndex: 0,
        hint: "Yoğunluk kulesinde en ağır altta.",
        explanation:
          "Adım 1: Yoğunluğu büyük madde alta çöker. Adım 2: Bal su ve yağdan yoğundur. Adım 3: Bu yüzden en altta bal, ortada su, üstte yağ görünür.",
      },
    ],
  },
  {
    n: 13,
    title: "Madde ve ısı",
    tellGuides: [
      "Isı ile sıcaklık arasındaki farkı anlatabilir misin?",
      "Metal kaşık ile tahta kaşık ısıyı nasıl farklı iletir?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Isı ve sıcaklık için doğru yargı hangisidir?",
        options: [
          "Aynı kavram değildir",
          "Tamamen aynıdır",
          "Yalnızca seste ölçülür",
          "Yalnızca kan grubudur",
        ],
        correctAnswerIndex: 0,
        hint: "Biri enerji aktarımı, biri ölçüm.",
        explanation:
          "Adım 1: Sıcaklık bir cismin sıcaklık derecesidir. Adım 2: Isı, sıcaklık farkından dolayı aktarılan enerjidir. Adım 3: Bu yüzden ikisi aynı kavram değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Isıyı iyi ileten maddeler genelde hangileridir?",
        options: ["Metaller", "Tahta ve plastik", "Kuru hava", "Cam yünü"],
        correctAnswerIndex: 0,
        hint: "Mutfaktaki metal kaşığı düşün.",
        explanation:
          "Adım 1: Metaller ısı iletkenidir. Adım 2: Tahta, plastik ve hava yalıtır. Adım 3: Bu yüzden sıcak çorbada metal kaşık çabuk ısınır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Kışın pencerede çift cam kullanılmasının amacı nedir?",
        options: [
          "Isı geçişini yavaşlatmak (yalıtım)",
          "Sesi boşlukta hızlandırmak",
          "Yoğunluğu sonsuz yapmak",
          "Kan dolaşımını durdurmak",
        ],
        correctAnswerIndex: 0,
        hint: "Yalıtım ısı kaybını azaltır.",
        explanation:
          "Adım 1: Ev içi ile dışarı arasında sıcaklık farkı vardır. Adım 2: Yalıtım malzemeleri ısı geçişini yavaşlatır. Adım 3: Çift cam aradaki hava ile yalıtım sağlar.",
      },
    ],
  },
  {
    n: 14,
    title: "Sesin yayılması",
    tellGuides: [
      "Ses neden boşlukta yayılmaz?",
      "Sesin katı, sıvı ve gazdaki hız sırasını anlatabilir misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Sesin yayılması için ne gerekir?",
        options: [
          "Maddesel ortam",
          "Tam boşluk",
          "Yalnızca ışık",
          "Yalnızca manyetik alan",
        ],
        correctAnswerIndex: 0,
        hint: "Titreşim bir maddeye ihtiyaç duyar.",
        explanation:
          "Adım 1: Ses titreşimle oluşur. Adım 2: Titreşim tanecikten taneciğe aktarılır. Adım 3: Bu yüzden ses maddesel ortamda yayılır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Ses boşlukta nasıl davranır?",
        options: [
          "Yayılmaz",
          "En hızlı yayılır",
          "Yalnızca gündüz yayılır",
          "Yalnızca gece yayılır",
        ],
        correctAnswerIndex: 0,
        hint: "Uzayda ses duyulmaz.",
        explanation:
          "Adım 1: Boşlukta tanecik yoktur. Adım 2: Titreşim aktarılamaz. Adım 3: Bu yüzden ses boşlukta yayılmaz.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Raylara kulak dayayınca tren sesi erken duyulur. Neden?",
        options: [
          "Ses katıda gazdan daha hızlı yayılır",
          "Ses boşlukta daha hızlıdır",
          "Ses yalnız suda yayılır",
          "Ses yoğunluk formülüdür",
        ],
        correctAnswerIndex: 0,
        hint: "Katı > sıvı > gaz hız sırası.",
        explanation:
          "Adım 1: Ses farklı ortamlarda farklı hızla gider. Adım 2: Katıda tanecikler yakındır; iletim hızlıdır. Adım 3: Ray (katı) havadan hızlı ilettiği için ses erken duyulur.",
      },
    ],
  },
  {
    n: 15,
    title: "Sesin maddeyle etkileşimi",
    tellGuides: [
      "Yankı nedir; nasıl oluşur?",
      "Ses yalıtımında hangi malzemeler işe yarar?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Yankı nedir?",
        options: [
          "Sesin yansıması",
          "Sesin boşlukta kaybolması",
          "Isının iletilmesi",
          "Kanın süzülmesi",
        ],
        correctAnswerIndex: 0,
        hint: "Duvar veya dağ sesi geri yollar.",
        explanation:
          "Adım 1: Ses bir yüzeye çarpabilir. Adım 2: Geri dönen sese yankı denir. Adım 3: Yani yankı sesin yansımasıdır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Ses yalıtımında hangisi daha uygundur?",
        options: [
          "Halı, sünger, perde gibi soğurucu malzemeler",
          "Parlak metal ayna",
          "Boş cam kavanoz",
          "Açık pencere",
        ],
        correctAnswerIndex: 0,
        hint: "Yumuşak ve gözenekli yüzeyler soğurur.",
        explanation:
          "Adım 1: Sert düz yüzeyler sesi yansıtır. Adım 2: Yumuşak malzemeler sesi soğurur. Adım 3: Bu yüzden yalıtımda halı, sünger, perde kullanılır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Sinema salonunda duvarlar kumaş kaplıdır. Amaç nedir?",
        options: [
          "Yankıyı azaltmak; sesi soğurmak",
          "Sesi boşlukta hızlandırmak",
          "Işığı tutulmaya çevirmek",
          "Yoğunluğu artırmak",
        ],
        correctAnswerIndex: 0,
        hint: "Net konuşma için az yansıma.",
        explanation:
          "Adım 1: Sert duvarlar yankı yapar. Adım 2: Kumaş sesi soğurur. Adım 3: Böylece film sesi daha net duyulur.",
      },
    ],
  },
  {
    n: 16,
    title: "Denetleyici ve düzenleyici sistemler",
    tellGuides: [
      "Sinir sisteminin temel organlarını sayabilir misin?",
      "Refleks ile hormon denetimini nasıl ayırırsın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Sinir sistemi hangi yapılardan oluşur?",
        options: [
          "Beyin, omurilik ve sinirler",
          "Kalp, damar ve kan",
          "Böbrek, idrar ve deri",
          "Güneş, Ay ve Dünya",
        ],
        correctAnswerIndex: 0,
        hint: "Merkez + yol + uçlar.",
        explanation:
          "Adım 1: Beyin düşünme ve denetimin merkezidir. Adım 2: Omurilik omurga içindedir. Adım 3: Sinirler mesajları taşır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Eline iğne battığında aniden çekmeni kim yönetir?",
        options: [
          "Omurilik (refleks)",
          "Yalnızca mide",
          "Yalnızca Ay",
          "Yalnızca deri rengi",
        ],
        correctAnswerIndex: 0,
        hint: "Çok hızlı, düşünmeden olur.",
        explanation:
          "Adım 1: Refleks istemsiz ve hızlıdır. Adım 2: Mesaj omuriliğe gider. Adım 3: Omurilik hemen kaslara çekme emri verir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Büyüme döneminde boy uzaması büyük ölçüde neyle denetlenir?",
        options: [
          "İç salgı bezlerinin ürettiği hormonlarla",
          "Yalnızca diş minesinin rengiyle",
          "Yalnızca sesin yankısıyla",
          "Yalnızca sürat formülüyle",
        ],
        correctAnswerIndex: 0,
        hint: "Düzenleyici sistem = hormon.",
        explanation:
          "Adım 1: İç salgı bezleri hormon üretir. Adım 2: Hormonlar kanla taşınır. Adım 3: Büyüme gibi uzun süreli düzenlemeler hormonlarla yapılır.",
      },
    ],
  },
  {
    n: 17,
    title: "Duyu organları",
    tellGuides: [
      "Beş duyu organını ve görevlerini anlatabilir misin?",
      "Kulak neden hem işitme hem denge organıdır?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Gözde ışığın alındığı tabaka hangisidir?",
        options: ["Ağ tabaka (retina)", "Kulak zarı", "Diyafram", "Alveol"],
        correctAnswerIndex: 0,
        hint: "Gözün arkasındaki duyarlı katman.",
        explanation:
          "Adım 1: Işık göze girer. Adım 2: Görüntü ağ tabakada oluşur. Adım 3: Sinirler bu bilgiyi beyne iletir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hem işitme hem denge ile ilgili organ hangisidir?",
        options: ["Kulak", "Dil", "Burun", "Deri"],
        correctAnswerIndex: 0,
        hint: "İç kulakta denge organı da vardır.",
        explanation:
          "Adım 1: Kulak sesi alır. Adım 2: İç kulakta denge yapıları vardır. Adım 3: Bu yüzden kulak hem işitme hem denge organıdır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Gözün bağlı bir elma tatlı mı ekşi mi anlaşılmaz. Eksik duyu hangisidir?",
        options: [
          "Tat alma (dil)",
          "Yalnızca işitme",
          "Yalnızca denge",
          "Yalnızca solunum",
        ],
        correctAnswerIndex: 0,
        hint: "Tat dildeki tomurcuklarla alınır.",
        explanation:
          "Adım 1: Görünüş görme ile gelir. Adım 2: Tat için dil gerekir. Adım 3: Göz bağlıyken tat alma yapılmazsa ekşi–tatlı ayrılmaz.",
      },
    ],
  },
  {
    n: 18,
    title: "Sistemlerin sağlığı",
    tellGuides: [
      "Sistemleri korumak için günlük üç alışkanlığı söyleyebilir misin?",
      "İlk yardımda ilk iki adımı sırayla anlatabilir misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Sistemlerin sağlığını koruyan temel alışkanlıklar hangileridir?",
        options: [
          "Düzenli beslenme, uyku ve hareket",
          "Geceleri güneşe bakmak",
          "Hiç su içmemek",
          "Sürekli gürültülü ortam",
        ],
        correctAnswerIndex: 0,
        hint: "Üç temel: ye, uyu, hareket et.",
        explanation:
          "Adım 1: Beslenme enerji ve onarım sağlar. Adım 2: Uyku dinlenme verir. Adım 3: Hareket kas, kalp ve solunumu güçlendirir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "İlk yardımda öncelik sırası hangisidir?",
        options: [
          "Güvenli ortam kur, 112'yi ara",
          "Önce yiyecek ver, sonra bekle",
          "Önce su içir, sonra taşı",
          "Önce güneşe bak, sonra koş",
        ],
        correctAnswerIndex: 0,
        hint: "Güvenlik + yardım çağrısı.",
        explanation:
          "Adım 1: Önce ortam güvenli olmalıdır. Adım 2: Sonra 112 aranır. Adım 3: Bilinci kapalı kişiye yiyecek-su verilmez.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Parkta bir kişi baygın. Doğru davranış hangisidir?",
        options: [
          "Ortamı güvenli tut, 112 ara; yiyecek-su verme",
          "Hemen su ve ekmek ver",
          "Kişiyi yalnız bırakıp uzaklaş",
          "Güneşe çıplak gözle baktır",
        ],
        correctAnswerIndex: 0,
        hint: "Bilinç kapalıysa ağızdan bir şey verilmez.",
        explanation:
          "Adım 1: Güvenlik sağlanır. Adım 2: 112 aranır. Adım 3: Bilinci kapalıysa yiyecek ve su verilmez; boğulma riski vardır.",
      },
    ],
  },
  {
    n: 19,
    title: "İletken ve yalıtkan maddeler",
    tellGuides: [
      "İletken ve yalıtkan maddeleri örneklerle ayırabilir misin?",
      "Tuzlu su ile saf su elektrik açısından nasıl farklıdır?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Elektrik akımını iyi ileten maddeler hangileridir?",
        options: [
          "Metaller",
          "Plastik ve lastik",
          "Kuru tahta",
          "Cam",
        ],
        correctAnswerIndex: 0,
        hint: "Tel genelde bakırdır.",
        explanation:
          "Adım 1: Metaller serbest elektron taşır. Adım 2: Bu yüzden elektrik iletir. Adım 3: Plastik, cam ve lastik yalıtkandır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi yalıtkandır?",
        options: [
          "Plastik kaplama",
          "Bakır tel",
          "Demir çivi",
          "Alüminyum folyo",
        ],
        correctAnswerIndex: 0,
        hint: "Kablo dışındaki malzeme.",
        explanation:
          "Adım 1: Kablo içinde metal iletir. Adım 2: Dışındaki plastik akımı geçirmez. Adım 3: Plastik yalıtkandır; dokunmayı güvenli kılar.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Deneyde saf su lambayı yakmıyor, tuz eklenince lamba yanıyor. Sonuç nedir?",
        options: [
          "Tuzlu su iletkendir; saf su yalıtkan sayılır",
          "Saf su her zaman en iyi iletkendir",
          "Tuz sesi soğurur",
          "Tuz yoğunluğu sonsuz yapar",
        ],
        correctAnswerIndex: 0,
        hint: "İyonlar akımı taşır.",
        explanation:
          "Adım 1: Saf suda iletim zayıftır. Adım 2: Tuz çözününce iyonlar oluşur. Adım 3: İyonlar akımı taşıdığı için tuzlu su iletken davranır.",
      },
    ],
  },
  {
    n: 20,
    title: "Elektriksel direnç",
    tellGuides: [
      "Direnç nedir; lamba parlaklığıyla nasıl bağlanır?",
      "Telin boyu ve kesiti direnci nasıl değiştirir?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Elektriksel direnç nedir?",
        options: [
          "İletkenin akıma gösterdiği zorluk",
          "Sesin yansıması",
          "Kanın Rh değeri",
          "Gezegenin yörüngesi",
        ],
        correctAnswerIndex: 0,
        hint: "Akımı «zorlaştıran» özellik.",
        explanation:
          "Adım 1: Akım iletkenden geçer. Adım 2: İletken akıma zorluk gösterebilir. Adım 3: Bu zorluğa direnç denir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Aynı cins telde boy artarsa direnç ne olur?",
        options: [
          "Artar",
          "Azalır",
          "Hep sıfır kalır",
          "Sese dönüşür",
        ],
        correctAnswerIndex: 0,
        hint: "Uzun yol = daha çok engel.",
        explanation:
          "Adım 1: Tel uzadıkça elektronlar daha uzun yol alır. Adım 2: Bu da direnci artırır. Adım 3: Kesit artarsa direnç azalır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Devrede aynı pil varken tel kısaltılınca lamba daha parlak yanıyor. Neden?",
        options: [
          "Kısa telde direnç azalır; akım artar",
          "Kısa telde direnç artar; akım azalır",
          "Ses boşlukta yayıldığı için",
          "Yoğunluk formülü değiştiği için",
        ],
        correctAnswerIndex: 0,
        hint: "Parlaklık akımla artar.",
        explanation:
          "Adım 1: Tel kısaldıkça direnç düşer. Adım 2: Direnç düşünce akım artar. Adım 3: Daha büyük akım lambayı daha parlak yakar.",
      },
    ],
  },
];

function renderPack(pack: Pack): string {
  const guides = pack.tellGuides.map((g) => `    ${JSON.stringify(g)},`).join("\n");
  const questions = pack.questions
    .map((q) => {
      const opts = q.options.map((o) => `      ${JSON.stringify(o)},`).join("\n");
      return `    {
      id: ${JSON.stringify(q.id)},
      level: ${JSON.stringify(q.level)},
      question: ${JSON.stringify(q.question)},
      options: [
${opts}
      ],
      correctAnswerIndex: ${q.correctAnswerIndex},
      hint: ${JSON.stringify(q.hint)},
      explanation: ${JSON.stringify(q.explanation)},
    },`;
    })
    .join("\n");

  return `import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (${pack.n}/20). */
export const JUNIOR_FEN_QUIZ_${pack.n} = {
  lessonKey: "jr_06_fen-${pack.n}",
  title: ${JSON.stringify(pack.title)},
  tellGuides: [
${guides}
  ],
  questions: [
${questions}
  ],
} as const satisfies JuniorLessonQuizPack;
`;
}

const outDir = join(process.cwd(), "lib", "junior", "quiz", "fen");
mkdirSync(outDir, { recursive: true });

for (const pack of PACKS) {
  const file = join(outDir, `${pack.n}.ts`);
  writeFileSync(file, renderPack(pack), "utf8");
  console.log("wrote", file);
}

const imports = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  return `import { JUNIOR_FEN_QUIZ_${n} } from "@/lib/junior/quiz/fen/${n}";`;
}).join("\n");

const packList = Array.from({ length: 20 }, (_, i) => `  JUNIOR_FEN_QUIZ_${i + 1},`).join("\n");
const exportList = Array.from({ length: 20 }, (_, i) => `  JUNIOR_FEN_QUIZ_${i + 1},`).join("\n");

const index = `${imports}
import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. sınıf fen bilimleri konu sonu arşivi. Katalog sırası. */
export const JUNIOR_FEN_QUIZ_PACKS = [
${packList}
] as const satisfies readonly JuniorLessonQuizPack[];

export {
${exportList}
};
`;

writeFileSync(join(outDir, "index.ts"), index, "utf8");
console.log("wrote index.ts", PACKS.length, "packs,", PACKS.length * 3, "questions");
