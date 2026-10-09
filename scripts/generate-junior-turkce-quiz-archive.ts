/**
 * Bir kerelik üretim: lib/junior/quiz/turkce/{1..20}.ts
 * Çalıştır: npx tsx scripts/generate-junior-turkce-quiz-archive.ts
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
    title: "Gerçek, mecaz ve terim anlam",
    tellGuides: [
      "Gerçek, mecaz ve terim anlamı kendi sözlerinle ayırır mısın?",
      "Aynı sözcüğün anlamını cümlenin nasıl seçtiğini bir örnekle anlatır mısın?",
      "Kök sözcüğünü üç farklı cümlede hangi anlamda kullanırsın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Gerçek anlam nedir?",
        options: [
          "Sözcüğün somut ilk anlamı",
          "Benzetmeyle kurulan soyut anlam",
          "Bir bilimin özel adı",
          "Sözcüğün yazım kuralı",
        ],
        correctAnswerIndex: 0,
        hint: "İlk akla gelen, somut temel anlamı düşün.",
        explanation:
          "Adım 1: Gerçek anlam, sözcüğün akla ilk gelen somut anlamıdır. Adım 2: Mecaz benzetmeyle kurulur; terim bilim alanına özgüdür. Adım 3: Bu yüzden doğru seçenek somut ilk anlamdır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "«Sorunun kökü acele etmekmiş.» cümlesinde kök sözcüğü hangi anlamdadır?",
        options: ["Mecaz anlam", "Gerçek anlam", "Terim anlam", "Yazım anlamı"],
        correctAnswerIndex: 0,
        hint: "Burada kök, bitkinin parçası değildir; sebep anlatır.",
        explanation:
          "Adım 1: Cümlede kök toprağa bağlı bir parça değildir. Adım 2: Temel sebep anlamında kullanılmıştır. Adım 3: Benzetmeyle kurulduğu için mecaz anlamdır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Ece üç cümle okudu: «Ağacın kökü toprakta.», «Sorunun kökü acele.», «Dokuzun karekökü üç.» Hangisi doğru eşleştirmedir?",
        options: [
          "Gerçek — mecaz — terim",
          "Mecaz — gerçek — terim",
          "Terim — mecaz — gerçek",
          "Gerçek — terim — mecaz",
        ],
        correctAnswerIndex: 0,
        hint: "Topraktaki kök somuttur; sebep kökü benzetmedir; karekök matematik terimidir.",
        explanation:
          "Adım 1: Topraktaki kök somut ve gerçek anlamdır. Adım 2: Sorunun kökü sebep anlatır; mecazdır. Adım 3: Karekök matematikte özel bir terimdir. Sıra: gerçek — mecaz — terim.",
      },
    ],
  },
  {
    n: 2,
    title: "Eş anlam, zıt anlam ve yakın anlamlı sözcükler",
    tellGuides: [
      "Eş anlam, zıt anlam ve yakın anlam arasındaki farkı kendi sözlerinle anlatır mısın?",
      "Yakın anlamlı iki sözcüğün her cümlede yer değiştirememesini bir örnekle açıklar mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Eş anlamlı sözcükler hangisidir?",
        options: [
          "Aynı veya çok yakın işi söyleyen sözcükler",
          "Karşıt anlamlı sözcükler",
          "Yalnızca aynı harfle başlayan sözcükler",
          "Sadece terim olan sözcükler",
        ],
        correctAnswerIndex: 0,
        hint: "Cevap ile yanıt gibi aynı işi söyleyenleri düşün.",
        explanation:
          "Adım 1: Eş anlamlılar aynı veya çok yakın anlam taşır. Adım 2: Zıt anlamlılar karşıttır. Adım 3: Bu yüzden doğru seçenek aynı işi söyleyen sözcüklerdir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "«Açık» sözcüğünün zıt anlamlısı hangisidir?",
        options: ["Kapalı", "Geniş", "Yakın", "Hoş"],
        correctAnswerIndex: 0,
        hint: "Kapı açıkken karşıtı nedir?",
        explanation:
          "Adım 1: Zıt anlam karşıtlık taşır. Adım 2: Açık ile kapalı birbirinin karşıtıdır. Adım 3: Geniş, yakın ve hoş zıt anlam değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Deniz «güzel» ile «hoş»u her cümlede değiş tokuş edebileceğini düşünüyor. Hangisi doğru düzeltmedir?",
        options: [
          "Yakın anlamlıdırlar; her cümlede yer değiştirmeyebilirler",
          "Tam eş anlamlıdırlar; her yerde değişirler",
          "Zıt anlamlıdırlar",
          "Terim anlamdırlar",
        ],
        correctAnswerIndex: 0,
        hint: "Yakın anlam benzerdir ama her bağlamda aynı değildir.",
        explanation:
          "Adım 1: Güzel ile hoş yakın anlamlıdır. Adım 2: Yakın anlamlılar her cümlede yer değiştirmeyebilir. Adım 3: Bu yüzden Deniz’in düşüncesi düzeltilmelidir.",
      },
    ],
  },
  {
    n: 3,
    title: "Sözcükte çok anlamlılık ve söz varlığı",
    tellGuides: [
      "Çok anlamlılık ile sesteşliği kendi sözlerinle ayırır mısın?",
      "Söz varlığının okudukça nasıl büyüdüğünü bir örnekle anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Çok anlamlı sözcükte anlamlar nasıl ilişkilidir?",
        options: [
          "Anlamlar birbiriyle ilişkilidir",
          "Anlamlar tamamen ilişkisizdir",
          "Yalnızca yazım farklıdır",
          "Yalnızca noktalama değişir",
        ],
        correctAnswerIndex: 0,
        hint: "Yüz organı ile yüzey gibi bağlantılı anlamları düşün.",
        explanation:
          "Adım 1: Çok anlamlılıkta anlamlar ilişkilidir. Adım 2: Sesteşte yazılış aynı, anlamlar ilişkisizdir. Adım 3: Doğru seçenek ilişkililiktir.",
      },
      {
        id: "q2",
        level: "apply",
        question:
          "«Yüz» sayısı ile «çay» akarsuyu örnekleri hangi durumu gösterir?",
        options: [
          "Sesteşlik (anlamlar ilişkisiz)",
          "Çok anlamlılık",
          "Zıt anlam",
          "Yapım eki",
        ],
        correctAnswerIndex: 0,
        hint: "Sayı olan yüz ile organ olan yüz farklıdır; akarsu çay ile içecek çay da farklıdır.",
        explanation:
          "Adım 1: Sesteşte yazılış aynı kalır. Adım 2: Anlamlar birbirinden bağımsızdır. Adım 3: Bu örnekler sesteşliği gösterir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Mert «yüz» sözcüğünü hem organ hem yüzey anlamında kullanıyor. Hangisi doğrudur?",
        options: [
          "Çok anlamlılıktır; anlamlar ilişkilidir",
          "Sesteştir; anlamlar ilişkisizdir",
          "Zıt anlamlıdır",
          "Terim anlam değildir hiçbiri",
        ],
        correctAnswerIndex: 0,
        hint: "Organ yüzü ile yüzey anlamı birbiriyle bağlantılıdır.",
        explanation:
          "Adım 1: Organ ve yüzey anlamları ilişkilidir. Adım 2: Bu çok anlamlılıktır. Adım 3: Sesteşte anlamlar bağlanmaz; burada bağ vardır.",
      },
    ],
  },
  {
    n: 4,
    title: "Söz sanatları",
    tellGuides: [
      "Benzetme, kişileştirme ve konuşturmayı kendi sözlerinle ayırır mısın?",
      "Karşıtlığın bir araya getirdiği zıtlıkları bir örnekle anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Benzetmede sık görülen bağ sözcükler hangileridir?",
        options: ["gibi, kadar", "ama, fakat", "ve, ile", "mi, mı"],
        correctAnswerIndex: 0,
        hint: "«Kar gibi beyaz» cümlesindeki bağa bak.",
        explanation:
          "Adım 1: Benzetmede iki şey birbirine yaklaştırılır. Adım 2: Sık bağlar gibi ve kadardır. Adım 3: Diğerleri bağlaç veya soru ekidir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "«Rüzgâr fısıldadı.» cümlesinde hangi söz sanatı vardır?",
        options: ["Kişileştirme", "Benzetme", "Karşıtlık", "Tanımlama"],
        correctAnswerIndex: 0,
        hint: "Cansıza insan hali verilmiş midir?",
        explanation:
          "Adım 1: Rüzgâr cansızdır. Adım 2: Fısıldamak insan eylemidir. Adım 3: Cansıza insan hali vermek kişileştirmedir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Ayşe «Güneş bana «Merhaba!» dedi.» cümlesini inceliyor. Hangisi doğru tanıdır?",
        options: [
          "Konuşturma; cansıza söz söyletilmiştir",
          "Yalnızca benzetmedir",
          "Zıt anlamdır",
          "Noktalama hatasıdır",
        ],
        correctAnswerIndex: 0,
        hint: "Cansıza gerçekten söz mü verildi?",
        explanation:
          "Adım 1: Güneş cansızdır. Adım 2: Ona söz söyletilmiştir. Adım 3: Bu konuşturmadır; kişileştirmeden bir adım ötedir.",
      },
    ],
  },
  {
    n: 5,
    title: "Öznel ve nesnel anlatımlı cümleler",
    tellGuides: [
      "Öznel ve nesnel cümleyi kendi sözlerinle ayırır mısın?",
      "İçinde sayı olan her cümlenin nesnel olmayabileceğini bir örnekle anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Nesnel cümle nasıl tanımlanır?",
        options: [
          "Ölçülebilir ve herkes için aynı olan yargı",
          "Duygu ve kişisel yorum taşıyan yargı",
          "Yalnızca soru cümlesi",
          "Yalnızca ünlem cümlesi",
        ],
        correctAnswerIndex: 0,
        hint: "Herkesin aynı ölçebileceği bilgiyi düşün.",
        explanation:
          "Adım 1: Nesnel yargı ölçülür ve kişiden kişiye değişmez. Adım 2: Öznel yargı duygu ve yorum taşır. Adım 3: Doğru seçenek ölçülebilir ortak yargıdır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi öznel bir cümledir?",
        options: [
          "Bu masa çok güzel.",
          "Bu masa tahtadır.",
          "Bu masa iki metredir.",
          "Bu masanın dört ayağı vardır.",
        ],
        correctAnswerIndex: 0,
        hint: "Hangisi kişisel beğeni taşır?",
        explanation:
          "Adım 1: Tahta, ölçü ve ayak sayısı ölçülebilir. Adım 2: «Çok güzel» kişisel yorumdur. Adım 3: Bu yüzden özneldir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Can «Bu film 120 dakikadır ve efsane bir filmdir.» diyor. Hangisi doğru ayrımıdır?",
        options: [
          "İlk yargı nesnel, ikinci yargı özneldir",
          "İkisi de nesneldir",
          "İkisi de özneldir",
          "İkisi de terim anlamdır",
        ],
        correctAnswerIndex: 0,
        hint: "Süre ölçülür; «efsane» yorumdur.",
        explanation:
          "Adım 1: 120 dakika ölçülebilir; nesneldir. Adım 2: «Efsane» kişisel beğenidir; özneldir. Adım 3: Sayı var diye tüm cümle nesnel olmaz.",
      },
    ],
  },
  {
    n: 6,
    title: "Neden-sonuç, amaç-sonuç ve koşul-sonuç cümleleri",
    tellGuides: [
      "Neden-sonuç ile amaç-sonucu kendi sözlerinle ayırır mısın?",
      "«İçin» sözcüğünün her zaman amaç olmadığını bir örnekle anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Amaç-sonuç cümlesi ne bildirir?",
        options: [
          "Hedef / amaç",
          "Geçmiş bir sebep",
          "Yalnızca soru",
          "Yalnızca noktalama",
        ],
        correctAnswerIndex: 0,
        hint: "«Dinlenmek için yattı» cümlesindeki hedefi düşün.",
        explanation:
          "Adım 1: Amaç-sonuç hedef bildirir. Adım 2: Neden-sonuç sebep bildirir. Adım 3: Doğru seçenek hedeftir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "«Hasta olduğu için gelmedi.» cümlesi hangi türdedir?",
        options: ["Neden-sonuç", "Amaç-sonuç", "Koşul-sonuç", "Öznel yargı"],
        correctAnswerIndex: 0,
        hint: "Hastalık, gelmemenin sebebi midir?",
        explanation:
          "Adım 1: «İçin» burada sebep bağlar. Adım 2: Hastalık olmuş bir sebeptir. Adım 3: Bu neden-sonuç cümlesidir; amaç değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Ela «Yağmur yağarsa pikniğe gitmeyiz.» diyor. Hangisi doğrudur?",
        options: [
          "Koşul-sonuç; henüz olmamış şarta bağlıdır",
          "Amaç-sonuçtur",
          "Yalnızca nesnel tanımdır",
          "Terim anlamdır",
        ],
        correctAnswerIndex: 0,
        hint: "Yağmur henüz yağmadı; şart bekleniyor.",
        explanation:
          "Adım 1: «Yağarsa» henüz gerçekleşmemiş şarttır. Adım 2: Sonuç şarta bağlanmıştır. Adım 3: Bu koşul-sonuç cümlesidir.",
      },
    ],
  },
  {
    n: 7,
    title: "Cümlede örtülü anlam ve cümle yorumlama",
    tellGuides: [
      "Açık anlam ile örtülü anlamı kendi sözlerinle ayırır mısın?",
      "Yorum yaparken cümlede iz olmayan yargıyı neden eklemememiz gerektiğini anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Örtülü anlam nedir?",
        options: [
          "Doğrudan söylenmeyip sezdirilen anlam",
          "Sözlükteki ilk madde",
          "Yalnızca terim anlam",
          "Yalnızca noktalama",
        ],
        correctAnswerIndex: 0,
        hint: "Kapıyı çarparak çıkmak kızgınlığı nasıl sezdirir?",
        explanation:
          "Adım 1: Açık anlam doğrudan söylenir. Adım 2: Örtülü anlam sezdirilir. Adım 3: Doğru seçenek sezdirilen anlamdır.",
      },
      {
        id: "q2",
        level: "apply",
        question:
          "«Kapıyı çarparak çıktı.» cümlesinde örtülü olarak ne sezdirilir?",
        options: ["Kızgınlık / öfke", "Mutluluk", "Uykusuzluk", "Yemek saati"],
        correctAnswerIndex: 0,
        hint: "Kapıyı çarpmak hangi duyguyu düşündürür?",
        explanation:
          "Adım 1: Kapıyı çarpmak sert bir davranıştır. Adım 2: Bu davranış kızgınlığı sezdirir. Adım 3: Metinde mutluluk veya yemek izi yoktur.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Berk «Kapıyı çarparak çıktı; demek ki eve geç kaldı.» diyor. Hangisi doğru değerlendirmedir?",
        options: [
          "Geç kalma izi yok; eklenmemelidir",
          "Geç kalma kesin örtülü anlamdır",
          "Cümle nesnel tanımdır",
          "Bu bir atasözüdür",
        ],
        correctAnswerIndex: 0,
        hint: "Yorum, cümledeki ize dayanmalıdır.",
        explanation:
          "Adım 1: Kapıyı çarpmak öfkeyi sezdirir. Adım 2: Geç kalmaya dair iz yoktur. Adım 3: İzi olmayan yargı eklenmez.",
      },
    ],
  },
  {
    n: 8,
    title: "Paragrafta ana fikir ve konu",
    tellGuides: [
      "Konu ile ana fikri kendi sözlerinle ayırır mısın?",
      "Örnek cümlenin neden ana fikir olmadığını bir örnekle anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Ana fikir nedir?",
        options: [
          "Paragrafın asıl yargısı (tektir)",
          "Yargısız genel alan",
          "Yalnızca örnek cümle",
          "Yalnızca başlık",
        ],
        correctAnswerIndex: 0,
        hint: "Konu alandır; ana fikir o alandaki asıl yargıdır.",
        explanation:
          "Adım 1: Konu yargısız alandır. Adım 2: Ana fikir asıl yargıdır ve tektir. Adım 3: Örnek cümle ana fikir değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question:
          "«Ağaçların yararı» ifadesi paragrafta neye karşılık gelir?",
        options: ["Konu", "Ana fikir", "Yardımcı fikir", "Sonuç cümlesi"],
        correctAnswerIndex: 0,
        hint: "Yargı var mı, yoksa alan mı?",
        explanation:
          "Adım 1: «Ağaçların yararı» yargı taşımaz. Adım 2: Bu bir alandır. Adım 3: Bu yüzden konudur; ana fikir değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Metinde «Ağaçlar canlılara yarar sağlar.» ve «Gölge verir.» var. Hangisi ana fikirdir?",
        options: [
          "Ağaçlar canlılara yarar sağlar",
          "Gölge verir",
          "Ağaçların yararı",
          "Canlılar",
        ],
        correctAnswerIndex: 0,
        hint: "Asıl yargı hangisidir? Gölge bir örnektir.",
        explanation:
          "Adım 1: Ana fikir asıl yargıdır. Adım 2: «Yarar sağlar» asıl yargıdır. Adım 3: Gölge örnek / yardımcı iz taşır; konu ise yargısız alandır.",
      },
    ],
  },
  {
    n: 9,
    title: "Paragrafta yardımcı fikirler",
    tellGuides: [
      "Yardımcı fikrin ana fikri nasıl taşıdığını kendi sözlerinle anlatır mısın?",
      "Yardımcı cümlenin ikinci ana fikir olmadığını neden söylersin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Yardımcı fikir ne iş yapar?",
        options: [
          "Ana fikri taşır; yerine geçmez",
          "Ana fikrin yerini alır",
          "Konuyu siler",
          "Noktalama ekler",
        ],
        correctAnswerIndex: 0,
        hint: "Gölge ve yuva örnekleri ana fikri besler.",
        explanation:
          "Adım 1: Ana fikir tektir. Adım 2: Yardımcı fikir onu destekler. Adım 3: Yerine geçmez.",
      },
      {
        id: "q2",
        level: "apply",
        question:
          "Ana fikir «Ağaçlar canlılara yarar sağlar.» ise «Kuşlara yuva olur.» ne olur?",
        options: [
          "Yardımcı fikir",
          "İkinci ana fikir",
          "Konu başlığı",
          "Örtülü anlam",
        ],
        correctAnswerIndex: 0,
        hint: "Yuva, yarar yargısını besleyen bir örnektir.",
        explanation:
          "Adım 1: Ana fikir yarar sağlamaktır. Adım 2: Yuva bu yararı örneklendirir. Adım 3: Bu yardımcı fikirdir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Sude yardımcı cümleyi ikinci ana fikir sayıyor. Hangisi doğru düzeltmedir?",
        options: [
          "Metinde ana fikir tektir; yardımcı ikinci ana fikir değildir",
          "Her yardımcı cümle yeni ana fikirdir",
          "Yardımcı fikir konuyu değiştirir",
          "Yardımcı fikir terim anlamdır",
        ],
        correctAnswerIndex: 0,
        hint: "Ana fikir sayısı kaçtır?",
        explanation:
          "Adım 1: Ana fikir tektir. Adım 2: Yardımcı cümle onu taşır. Adım 3: İkinci ana fikir olmaz.",
      },
    ],
  },
  {
    n: 10,
    title: "Paragrafın yapısı",
    tellGuides: [
      "Giriş, gelişme ve sonucun görevlerini kendi sözlerinle anlatır mısın?",
      "Konuya bağlanmayan cümlenin akışı nasıl bozduğunu bir örnekle açıklar mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Paragrafın giriş bölümü ne yapar?",
        options: [
          "Konuyu tanıtır",
          "Yalnızca sonucu yazar",
          "Noktalama ekler",
          "Atasözü uydurur",
        ],
        correctAnswerIndex: 0,
        hint: "İlk bölüm okuru nereye götürür?",
        explanation:
          "Adım 1: Giriş konuyu tanıtır. Adım 2: Gelişme açıklar. Adım 3: Sonuç toparlar.",
      },
      {
        id: "q2",
        level: "apply",
        question:
          "Gelişme bölümünde beklenen iş hangisidir?",
        options: [
          "Konuyu açıklamak ve desteklemek",
          "Konuyu hiç anmamak",
          "Yalnızca ünlem koymak",
          "Başlığı silmek",
        ],
        correctAnswerIndex: 0,
        hint: "Gelişme, girişte açılan konuyu büyütür.",
        explanation:
          "Adım 1: Üç bölüm aynı konudadır. Adım 2: Gelişme açıklar ve destekler. Adım 3: Konuya bağlanmayan cümle akışı bozar.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Orman yararı anlatan paragrafa «Dün sinemaya gittim.» cümlesi eklenmiş. Hangisi doğrudur?",
        options: [
          "Konuya bağlanmaz; çıkınca akış düzelir",
          "Zorunlu sonuç cümlesidir",
          "Ana fikirdir",
          "Yapım ekidir",
        ],
        correctAnswerIndex: 0,
        hint: "Cümle orman konusuyla bağlanıyor mu?",
        explanation:
          "Adım 1: Paragraf orman yararı üzerinedir. Adım 2: Sinema cümlesi konuya bağlanmaz. Adım 3: Çıkınca paragraf düzelir.",
      },
    ],
  },
  {
    n: 11,
    title: "Anlatım biçimleri ve düşünceyi geliştirme yolları",
    tellGuides: [
      "Öyküleme, betimleme, açıklama ve tartışmayı kendi sözlerinle ayırır mısın?",
      "Örnekleme veya karşılaştırma gibi bir düşünceyi geliştirme yolunu bir örnekle anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Öyküleme ne anlatır?",
        options: [
          "Olay anlatır",
          "Yalnızca görünüşü gösterir",
          "Yalnızca sayı verir",
          "Yalnızca tanım yazar",
        ],
        correctAnswerIndex: 0,
        hint: "Zaman içinde olup bitenleri düşün.",
        explanation:
          "Adım 1: Öyküleme olay anlatır. Adım 2: Betimleme görünüşü gösterir. Adım 3: Açıklama bilgi verir; tartışma savunur.",
      },
      {
        id: "q2",
        level: "apply",
        question:
          "«Kalem kırmızı, kenarı yıpranmıştı.» cümlesi hangi anlatım biçimine yakındır?",
        options: ["Betimleme", "Öyküleme", "Tartışma", "Tanık gösterme"],
        correctAnswerIndex: 0,
        hint: "Görünüş mü anlatılıyor, olay mı?",
        explanation:
          "Adım 1: Renk ve yıpranma görünüştür. Adım 2: Bu betimlemedir. Adım 3: Olay zinciri yoktur; öyküleme değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Yazar düşüncesini güçlendirmek için bir uzman adı veriyor. Bu hangi yoldur?",
        options: [
          "Tanık gösterme",
          "Yalnızca betimleme",
          "Yapım eki",
          "Kesme işareti",
        ],
        correctAnswerIndex: 0,
        hint: "Başkasının sözü veya adı düşünceyi nasıl güçlendirir?",
        explanation:
          "Adım 1: Düşünceyi geliştirme yollarından biri tanık göstermedir. Adım 2: Uzman adı buna örnektir. Adım 3: Betimleme görünüş; ek ve noktalama ayrı işlerdir.",
      },
    ],
  },
  {
    n: 12,
    title: "Metin türleri",
    tellGuides: [
      "Hikâye, anı, mektup, tiyatro ve gezi yazısını kendi sözlerinle ayırır mısın?",
      "Anının neden çoğu zaman birinci kişiyle anlatıldığını açıklar mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Anı metni nasıl anlatılır?",
        options: [
          "Yaşanmışı çoğu zaman birinci kişiyle anlatır",
          "Yalnızca kurmaca diyalogdur",
          "Yalnızca hitap yazısıdır",
          "Yalnızca noktalama listesidir",
        ],
        correctAnswerIndex: 0,
        hint: "«Ben o gün…» anlatımını düşün.",
        explanation:
          "Adım 1: Anı yaşanmışı anlatır. Adım 2: Çoğu zaman birinci kişidedir. Adım 3: Hikâye kurmaca olabilir; mektupta hitap vardır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Kişilerin konuşmasıyla ilerleyen metin türü hangisidir?",
        options: ["Tiyatro", "Gezi yazısı", "Anı", "Tanım paragrafı"],
        correctAnswerIndex: 0,
        hint: "Sahne ve replikleri düşün.",
        explanation:
          "Adım 1: Tiyatro konuşmalarla ilerler. Adım 2: Gezi yazısı yer ve izlenim taşır. Adım 3: Anı yaşanmışı anlatır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Metinde «Sevgili arkadaşım,» hitabı ve özlem cümleleri var. Hangisi en uygundur?",
        options: [
          "Mektup",
          "Tiyatro",
          "Yalnızca atasözü listesi",
          "İsim kökü listesi",
        ],
        correctAnswerIndex: 0,
        hint: "Hitap hangi türde sık görülür?",
        explanation:
          "Adım 1: Mektupta hitap vardır. Adım 2: Özlem ve sesleniş mektuba uyar. Adım 3: Tiyatro replikle ilerler; bu örnek mektuptur.",
      },
    ],
  },
  {
    n: 13,
    title: "Deyimler ve atasözleri",
    tellGuides: [
      "Deyim ile atasözünü kendi sözlerinle ayırır mısın?",
      "«Burnu havada» deyiminin gerçek anlamından uzaklığını anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Deyim nasıl tanımlanır?",
        options: [
          "Kalıptır ve çoğu zaman gerçek anlamından uzaktır",
          "Her zaman tam cümle öğüt verir",
          "Yalnızca noktalama kuralıdır",
          "Yalnızca yapım ekidir",
        ],
        correctAnswerIndex: 0,
        hint: "Burnu havada = kibirli örneğini düşün.",
        explanation:
          "Adım 1: Deyim kalıptır. Adım 2: Gerçek anlamından uzaklaşır. Adım 3: Atasözü öğüt veren genel yargıdır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "«Burnu havada» deyimi ne anlatır?",
        options: ["Kibirli / burnu büyük olmak", "Uçak yolculuğu", "Soğuk hava", "Burun ameliyatı"],
        correctAnswerIndex: 0,
        hint: "Gerçekten burnu gökyüzünde midir?",
        explanation:
          "Adım 1: Deyim gerçek anlamından uzaktır. Adım 2: Burnu havada kibirli demektir. Adım 3: Uçak veya hava ile ilgili değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "«Damlaya damlaya göl olur.» ifadesi hangisine örnektir?",
        options: [
          "Atasözü; öğüt veren genel yargı",
          "Yalnızca deyim",
          "Nesnel ölçü cümlesi",
          "İsim çekim eki",
        ],
        correctAnswerIndex: 0,
        hint: "Tam cümle ve genel öğüt mü?",
        explanation:
          "Adım 1: Atasözü çoğu zaman tam cümledir. Adım 2: Genel bir öğüt / yargı taşır. Adım 3: Bu örnek atasözüdür.",
      },
    ],
  },
  {
    n: 14,
    title: "İsim ve fiil kökü",
    tellGuides: [
      "İsim kökü ile fiil kökünü kendi sözlerinle ayırır mısın?",
      "«Gözlük» sözcüğünün neden tek başına kök olmadığını anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Kök nedir?",
        options: [
          "Anlamı taşıyan en küçük parça",
          "Yalnızca çoğul eki",
          "Yalnızca nokta işareti",
          "Yalnızca paragraf başlığı",
        ],
        correctAnswerIndex: 0,
        hint: "Göz, taş, gel, yaz gibi parçaları düşün.",
        explanation:
          "Adım 1: Kök anlamı taşıyan en küçük parçadır. Adım 2: İsim kökü ad, fiil kökü iş taşır. Adım 3: Ekler köke eklenir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi fiil köküdür?",
        options: ["gel", "göz", "taş", "ev"],
        correctAnswerIndex: 0,
        hint: "Hangisi bir iş / eylem taşır?",
        explanation:
          "Adım 1: Fiil kökü iş taşır. Adım 2: gel, yaz, sev böyledir. Adım 3: göz, taş, ev isim köküdür.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Ada «gözlük» sözcüğünü kök sayıyor. Hangisi doğru düzeltmedir?",
        options: [
          "Göz köktür; gözlük türemiş sözcüktür",
          "Gözlük isim köküdür",
          "Gözlük fiil köküdür",
          "Gözlük mastar ekidir",
        ],
        correctAnswerIndex: 0,
        hint: "Göz + lük ayrımını düşün.",
        explanation:
          "Adım 1: Kök en küçük anlamlı parçadır. Adım 2: göz köktür. Adım 3: gözlük yapım ekiyle türemiştir; tek başına kök değildir.",
      },
    ],
  },
  {
    n: 15,
    title: "Yapım ekleri ve sözcük türetme",
    tellGuides: [
      "Yapım eki ile çekim ekinin kelimenin anlamında yaptığı değişikliği kendi sözlerinle anlatır mısın?",
      "Dört türetme yolundan birini bir örnekle açıklar mısın?",
      "«Evler» ile «evli» arasındaki farkı anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Yapım eki ne yapar?",
        options: [
          "Yeni anlamlı sözcük türetir",
          "Yalnızca çoğul yapar",
          "Yalnızca soru sorar",
          "Yalnızca nokta koyar",
        ],
        correctAnswerIndex: 0,
        hint: "Göz → gözlük değişimini düşün.",
        explanation:
          "Adım 1: Yapım eki yeni sözcük türetir. Adım 2: Anlam ve bazen tür değişir. Adım 3: Çekim eki görev verir; türetmez.",
      },
      {
        id: "q2",
        level: "apply",
        question: "«gözlük» sözcüğünde hangi türetme vardır?",
        options: [
          "İsimden isim",
          "Fiilden fiil",
          "Yalnızca çekim",
          "Koşul-sonuç",
        ],
        correctAnswerIndex: 0,
        hint: "göz bir isimdir; gözlük de bir addır.",
        explanation:
          "Adım 1: göz isim köküdür. Adım 2: lük yapım ekidir. Adım 3: Yeni bir isim doğmuştur; isimden isim türetmedir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "«Evler» ile «evli» karşılaştırılıyor. Hangisi doğrudur?",
        options: [
          "Evler çekimdir (anlam aynı); evli yapımdır (yeni anlam)",
          "İkisi de yapım ekidir",
          "İkisi de fiil köküdür",
          "İkisi de atasözüdür",
        ],
        correctAnswerIndex: 0,
        hint: "Evler hâlâ ev midir? Evli yeni bir kimlik midir?",
        explanation:
          "Adım 1: Evler hâlâ evdir; çoğul çekimdir. Adım 2: Evli yeni anlam taşır; yapım ekidir. Adım 3: Yapım türetir, çekim görev verir.",
      },
    ],
  },
  {
    n: 16,
    title: "İsim çekim ekleri",
    tellGuides: [
      "Çekim ekinin türü değiştirmeden görev verdiğini kendi sözlerinle anlatır mısın?",
      "Hal eklerinden birini (yönelme, belirtme, bulunma, ayrılma) örnekle açıklar mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Çekim eki ne yapar?",
        options: [
          "Görev verir; türü değiştirmez",
          "Yeni sözcük türetir",
          "Ana fikir kurar",
          "Sesteşlik yaratır",
        ],
        correctAnswerIndex: 0,
        hint: "Ev → evler hâlâ ev midir?",
        explanation:
          "Adım 1: Çekim eki cümlede görev verir. Adım 2: Tür ve temel anlam değişmez. Adım 3: Yapım eki türetir; çekim türetmez.",
      },
      {
        id: "q2",
        level: "apply",
        question: "«evde» sözcüğündeki -de eki hangi haldedir?",
        options: ["Bulunma", "Yönelme", "Ayrılma", "Belirtme"],
        correctAnswerIndex: 0,
        hint: "Nerede? sorusuna cevap verir.",
        explanation:
          "Adım 1: Hal ekleri yönelme, belirtme, bulunma, ayrılmadır. Adım 2: -de bulunma bildirir. Adım 3: evde = bulunma hali.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "«Evin kapısı» ile «Senin evin» karşılaştırmasında hangisi doğrudur?",
        options: [
          "Evin’de ilgi; senin evin’de iyelik öne çıkar",
          "İkisi de yapım ekidir",
          "İkisi de fiil köküdür",
          "İkisi de soru ekidir",
        ],
        correctAnswerIndex: 0,
        hint: "İlgi eki iki adı bağlar; iyelik sahiplik bildirir.",
        explanation:
          "Adım 1: Evin kapısı’nda ilgi bağı vardır. Adım 2: Senin evin sahiplik / iyelik taşır. Adım 3: İkisi de çekim alanındadır; yapım değildir.",
      },
    ],
  },
  {
    n: 17,
    title: "Büyük harfler ve sayıların yazımı",
    tellGuides: [
      "Özel adların neden büyük harfle yazıldığını kendi sözlerinle anlatır mısın?",
      "Üç elma ile tarih/saat yazımı arasındaki farkı açıklar mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Cümle hızlı nasıl başlamalıdır?",
        options: [
          "Büyük harfle",
          "Küçük harfle",
          "Ünlemle",
          "Kesme işaretiyle",
        ],
        correctAnswerIndex: 0,
        hint: "İlk harf kuralını düşün.",
        explanation:
          "Adım 1: Cümle büyük harfle başlar. Adım 2: Özel adlar da büyük yazılır. Adım 3: Ay ve gün adları cümle ortasında küçük kalabilir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi doğru yazımdır?",
        options: [
          "Üç elma aldım.",
          "3 elma aldım. (zorunlu tek doğru)",
          "ankara'ya gittim.",
          "ali geldi.",
        ],
        correctAnswerIndex: 0,
        hint: "Küçük sayılar yazıyla yazılır; özel ad büyük harfle başlar.",
        explanation:
          "Adım 1: Üç gibi küçük sayılar yazıyla yazılır. Adım 2: Ankara ve Ali özel addır; büyük yazılır. Adım 3: Doğru seçenek «Üç elma aldım.»dır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Tarih, saat ve para hangi biçimde yazılır?",
        options: [
          "Rakamla",
          "Her zaman yazıyla",
          "Yalnızca noktalı virgülle",
          "Yalnızca tırnak içinde",
        ],
        correctAnswerIndex: 0,
        hint: "8 Ekim, 14.30, 50 TL örneklerini düşün.",
        explanation:
          "Adım 1: Küçük sayılar yazıyla yazılabilir. Adım 2: Tarih, saat ve para rakamla yazılır. Adım 3: Doğru seçenek rakamladır.",
      },
    ],
  },
  {
    n: 18,
    title: "de, da, ki ve mi'nin yazımı",
    tellGuides: [
      "Bağlaç de/da ile bulunma eki -de/-da farkını kendi sözlerinle anlatır mısın?",
      "Soru eki mi'nin neden her zaman ayrı yazıldığını açıklar mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Bağlaç olan de / da nasıl yazılır?",
        options: [
          "Ayrı yazılır",
          "Her zaman bitişik yazılır",
          "Yalnızca büyük harfle yazılır",
          "Yalnızca tırnak içinde yazılır",
        ],
        correctAnswerIndex: 0,
        hint: "«Ali de geldi.» örneğini düşün.",
        explanation:
          "Adım 1: Bağlaç de/da ayrı yazılır. Adım 2: Bulunma eki bitişiktir (evde). Adım 3: Doğru seçenek ayrı yazımdır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisinde bulunma eki vardır?",
        options: ["Ali evde.", "Ali de geldi.", "O da geldi.", "Geldin mi?"],
        correctAnswerIndex: 0,
        hint: "Hangisi «nerede?» sorusuna cevap verir?",
        explanation:
          "Adım 1: evde bulunma ekidir ve bitişiktir. Adım 2: Ali de / O da bağlaçtır. Adım 3: mi soru ekidir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "«Yarınki» ve «ki bağlacı» için hangisi doğrudur?",
        options: [
          "Yarınki bitişik; bağlaç ki ayrıdır",
          "İkisi de her zaman ayrıdır",
          "İkisi de her zaman bitişiktir",
          "İkisi de soru ekidir",
        ],
        correctAnswerIndex: 0,
        hint: "seninki / yarınki bitişik; «ki» bağlacı ayrıdır.",
        explanation:
          "Adım 1: Bağlaç ki ayrı yazılır. Adım 2: yarınki, seninki bitişiktir. Adım 3: Soru eki mi her zaman ayrıdır; ki değildir.",
      },
    ],
  },
  {
    n: 19,
    title: "Nokta, virgül, noktalı virgül ve iki nokta",
    tellGuides: [
      "Nokta, virgül, noktalı virgül ve iki noktanın işlerini kendi sözlerinle anlatır mısın?",
      "İçinde virgül olan öbekleri ayırmak için neden noktalı virgül kullandığımızı açıklar mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Nokta ne iş yapar?",
        options: [
          "Cümleyi bitirir",
          "Hitabı ayırır",
          "Soru sorar",
          "Şaşma bildirir",
        ],
        correctAnswerIndex: 0,
        hint: "Tam cümle sonunda hangi işaret durur?",
        explanation:
          "Adım 1: Nokta cümleyi bitirir. Adım 2: Virgül eş görevlileri ve hitabı ayırır. Adım 3: Soru ve ünlem ayrı işlerdir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "«Ali, buraya gel.» cümlesinde virgül neden vardır?",
        options: [
          "Hitabı ayırmak için",
          "Cümleyi bitirmek için",
          "Soru sormak için",
          "Kesme yerine",
        ],
        correctAnswerIndex: 0,
        hint: "Ali’ye sesleniş vardır.",
        explanation:
          "Adım 1: Ali hitaptır. Adım 2: Virgül hitabı ayırır. Adım 3: Nokta bitirir; soru ve kesme başka işlerdir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Açıklama ve örnekten önce hangi işaret durur?",
        options: [
          "İki nokta",
          "Ünlem",
          "Kesme",
          "Soru eki mi",
        ],
        correctAnswerIndex: 0,
        hint: "«İşte örnek: …» kalıbını düşün.",
        explanation:
          "Adım 1: İki nokta açıklama ve örnekten önce durur. Adım 2: Noktalı virgül virgüllü öbekleri ayırır. Adım 3: Doğru seçenek iki noktadır.",
      },
    ],
  },
  {
    n: 20,
    title: "Üç nokta, soru, ünlem, kesme ve tırnak",
    tellGuides: [
      "Üç nokta, soru, ünlem, kesme ve tırnağın işlerini kendi sözlerinle anlatır mısın?",
      "Soru eki mi ile soru işaretinin aynı iş olmadığını neden söylersin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Üç nokta işareti ne gösterir?",
        options: [
          "Sözün sürdüğünü / eksik bırakıldığını",
          "Cümleyi kesin bitirdiğini",
          "Yalnızca hitabı",
          "Yalnızca iyelik ekini",
        ],
        correctAnswerIndex: 0,
        hint: "Söz yarım kalmış gibi durur.",
        explanation:
          "Adım 1: Üç nokta sözün sürdüğünü gösterir. Adım 2: Nokta cümleyi bitirir. Adım 3: Hitap ve iyelik başka işlerdir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "«Ankara'ya» yazımında kesme ne yapar?",
        options: [
          "Eki özel addan ayırır",
          "Soru sorar",
          "Şaşma bildirir",
          "Başkasının sözünü alır",
        ],
        correctAnswerIndex: 0,
        hint: "Özel ada gelen eki düşün.",
        explanation:
          "Adım 1: Ankara özel addır. Adım 2: Kesme eki ayırır. Adım 3: Soru, ünlem ve tırnak farklı işlerdir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "«Geldin mi?» cümlesinde mi ve soru işareti için hangisi doğrudur?",
        options: [
          "mi soru ekidir (ayrı); soru işareti soruyu bitirir — aynı iş değildir",
          "İkisi de aynı işarettir",
          "mi kesme işaretidir",
          "Soru işareti bağlaçtır",
        ],
        correctAnswerIndex: 0,
        hint: "Biri ek, biri noktalama işaretidir.",
        explanation:
          "Adım 1: mi soru ekidir ve ayrı yazılır. Adım 2: Soru işareti soruyu bitirir. Adım 3: İkisi birlikte çalışır ama aynı iş değildir.",
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

/** 6. Sınıf Türkçe — konu sonu soru arşivi (${pack.n}/20). */
export const JUNIOR_TURKCE_QUIZ_${pack.n} = {
  lessonKey: "jr_06_turkce-${pack.n}",
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

const outDir = join(process.cwd(), "lib", "junior", "quiz", "turkce");
mkdirSync(outDir, { recursive: true });

for (const pack of PACKS) {
  const file = join(outDir, `${pack.n}.ts`);
  writeFileSync(file, renderPack(pack), "utf8");
  console.log("wrote", file);
}

const imports = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  return `import { JUNIOR_TURKCE_QUIZ_${n} } from "@/lib/junior/quiz/turkce/${n}";`;
}).join("\n");

const packList = Array.from({ length: 20 }, (_, i) => `  JUNIOR_TURKCE_QUIZ_${i + 1},`).join("\n");
const exportList = Array.from({ length: 20 }, (_, i) => `  JUNIOR_TURKCE_QUIZ_${i + 1},`).join("\n");

const index = `${imports}
import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. sınıf Türkçe konu sonu arşivi. Katalog sırası. */
export const JUNIOR_TURKCE_QUIZ_PACKS = [
${packList}
] as const satisfies readonly JuniorLessonQuizPack[];

export {
${exportList}
};
`;

writeFileSync(join(outDir, "index.ts"), index, "utf8");
console.log("wrote index.ts", PACKS.length, "packs,", PACKS.length * 3, "questions");
