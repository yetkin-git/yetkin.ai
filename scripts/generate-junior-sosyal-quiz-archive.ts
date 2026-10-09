/**
 * Bir kerelik üretim: lib/junior/quiz/sosyal/{1..20}.ts
 * Çalıştır: npx tsx scripts/generate-junior-sosyal-quiz-archive.ts
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
    title: "Değerlerimiz ve toplumdaki roller",
    tellGuides: [
      "Değer ile rol arasındaki farkı kendi sözlerinle anlatır mısın?",
      "Aynı kişinin bir günde taşıdığı iki rolü örnekle söyler misin?",
      "Rol değişirken değerin yanında kaldığını nasıl açıklarsın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Sosyal Bilgilerde «değer» ne demektir?",
        options: [
          "Birlikte yaşamayı kolaylaştıran ilke",
          "Okuldaki sınıf numarası",
          "Haritadaki bir şehir adı",
          "Yalnızca bir spor takımındaki görev",
        ],
        correctAnswerIndex: 0,
        hint: "Saygı ve dürüstlük bu taraftadır; görev adı değildir.",
        explanation:
          "Adım 1: Değer, birlikte yaşamayı güzelleştiren ilkedir. Adım 2: Saygı, dürüstlük ve yardımlaşma değer örneğidir. Adım 3: Rol ise bir yerdeki görevdir; değerin kendisi değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Sabah kardeşine yardım eden, öğlen derste söz alan bir çocuk için hangisi doğrudur?",
        options: [
          "İki farklı rol, aynı kişinin değerleriyle birlikte yürür",
          "Rol değişince değerler de silinir",
          "Öğrenci olmak bir değerdir, kardeş olmak değildir",
          "Aynı kişi günde yalnız bir rol taşıyabilir",
        ],
        correctAnswerIndex: 0,
        hint: "Ortam değişince görev adı değişir; erdem yanında kalır.",
        explanation:
          "Adım 1: Evde kardeş, okulda öğrenci olmak iki ayrı roldür. Adım 2: Yardımlaşma ve saygı bu rollerin içinde değer olarak kalır. Adım 3: Aynı kişi birden fazla rol taşır; değerler silinmez.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Ece, «Ben yalnızca öğrenciyim; başka hiçbir rolüm yok» diyor. Hangisi doğru düzeltmedir?",
        options: [
          "Aynı kişi evde, okulda ve oyunda farklı roller taşıyabilir",
          "Rol yalnızca kimlik kartındaki meslektir",
          "Değer ile rol aynı şeydir",
          "Rol bitince kişi toplumdan çıkar",
        ],
        correctAnswerIndex: 0,
        hint: "Gün içinde ortam değişince görev de değişir.",
        explanation:
          "Adım 1: Rol, bulunduğun ortamdaki görevdir. Adım 2: Ece evde kardeş, sahada oyuncu da olabilir. Adım 3: Bu yüzden «yalnız öğrenci» demek eksik kalır.",
      },
    ],
  },
  {
    n: 2,
    title: "Toplumsal uyum ve yardımlaşma",
    tellGuides: [
      "Toplumsal uyum ile yardımlaşmayı nasıl ayırırsın?",
      "Sırada beklemek hangi değere ve hangi uyuma örnektir?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Toplumsal uyum neyi anlatır?",
        options: [
          "Birlikte yaşarken kurallara ve birbirine saygı göstermek",
          "Herkesin aynı kıyafeti giymesi",
          "Yalnızca akrabalarla konuşmak",
          "Kuralları hiç dinlememek",
        ],
        correctAnswerIndex: 0,
        hint: "Birlikte yaşamayı kolaylaştıran tutumu düşün.",
        explanation:
          "Adım 1: Uyum, birlikte yaşamayı düzenler. Adım 2: Saygı ve kurallar bu düzenin parçasıdır. Adım 3: Aynı kıyafet veya yalnız akraba olmak uyum tanımı değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Deprem sonrası komşuların ortak yardım çadırı kurması neye örnektir?",
        options: [
          "Yardımlaşma ve toplumsal dayanışma",
          "Önyargı",
          "Mutlak konum",
          "Vergi kaçırma",
        ],
        correctAnswerIndex: 0,
        hint: "Bir ihtiyacı birlikte karşılamak hangi davranıştır?",
        explanation:
          "Adım 1: Yardımlaşma, ihtiyacı olanı desteklemektir. Adım 2: Ortak çadır kurmak dayanışmadır. Adım 3: Bu, önyargı veya konum bilgisiyle karışmaz.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Otobüste yaşlı bir yolcuya yer vermek ile «benim işim değil» demek arasındaki fark nedir?",
        options: [
          "İlki yardımlaşma ve uyumu güçlendirir; ikincisi ortak yaşamı zayıflatır",
          "İkisi de aynı vatandaşlık hakkıdır",
          "Yer vermek vergi ödemektir",
          "«Benim işim değil» demek anayasal bir görevdir",
        ],
        correctAnswerIndex: 0,
        hint: "Küçük bir nezaket, ortak yaşamı nasıl etkiler?",
        explanation:
          "Adım 1: Yer vermek yardımlaşma örneğidir. Adım 2: Uyum, başkasının ihtiyacını görmeyi içerir. Adım 3: Reddetmek hak veya vergi değildir; dayanışmayı zayıflatır.",
      },
    ],
  },
  {
    n: 3,
    title: "Önyargıları kırıyoruz",
    tellGuides: [
      "Önyargı nedir, bir örnekle anlatır mısın?",
      "Tanımadan karar vermek yerine sormak neden daha doğrudur?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Önyargı ne demektir?",
        options: [
          "Bir kişiyi veya grubu tanımadan verilen olumsuz yargı",
          "Bilimsel bir ölçüm sonucu",
          "Haritadaki enlem çizgisi",
          "Mahkemenin kesin kararı",
        ],
        correctAnswerIndex: 0,
        hint: "Tanımadan verilen karar tarafındadır.",
        explanation:
          "Adım 1: Önyargı, yeterli bilgi olmadan verilen yargıdır. Adım 2: Çoğu zaman olumsuz ve genelleyicidir. Adım 3: Bilimsel ölçüm veya mahkeme kararı değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question:
          "«Şu mahalledeki herkes kaba» diyen bir cümle hangi hatayı taşır?",
        options: [
          "Tek örnekten tüm gruba genelleme yapan önyargı",
          "Mutlak konum bilgisi",
          "Vergi sorumluluğu",
          "Demokratik seçim kuralı",
        ],
        correctAnswerIndex: 0,
        hint: "«Herkes» sözü genellemeyi işaret eder.",
        explanation:
          "Adım 1: Önyargı genelleme ile büyür. Adım 2: Bir mahalleyi bütünüyle suçlamak tanıma olmadan karar vermektir. Adım 3: Bu konum, vergi veya seçim kuralı değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Yeni gelen arkadaşın aksanını duyunca «zayıf öğrenci» diyen biri için hangisi doğru yaklaşımdır?",
        options: [
          "Önce tanımak ve sormak; aksanı başarı ölçüsü saymamak",
          "Aksanı hemen sınıf listesine yazmak",
          "Önyargıyı doğru bilgi saymak",
          "Kişiyi hiç tanımadan not vermek",
        ],
        correctAnswerIndex: 0,
        hint: "Sormak, önyargıyı askıya alır.",
        explanation:
          "Adım 1: Aksan, başarıyı göstermez. Adım 2: Önyargı tanımadan karar vermektir. Adım 3: Doğru yol tanımak, sormak ve kişiyi yargılamadan dinlemektir.",
      },
    ],
  },
  {
    n: 4,
    title: "Hak, sorumluluk ve özgürlük",
    tellGuides: [
      "Hak, sorumluluk ve özgürlüğü kendi sözlerinle ayırır mısın?",
      "Özgürlüğün başkasının hakkı ile sınırlandığını bir örnekle anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Hak ile sorumluluk arasındaki temel fark nedir?",
        options: [
          "Hak yetki ve güvencedir; sorumluluk yerine getirilen görevdir",
          "İkisi de yalnız vergi ödemektir",
          "Hak görev, sorumluluk ise özgürlüktür",
          "Sorumluluk yalnızca mahkemeye aittir",
        ],
        correctAnswerIndex: 0,
        hint: "Biri güvence, diğeri görev tarafındadır.",
        explanation:
          "Adım 1: Hak, kişinin güvence altına alınmış yetkisidir. Adım 2: Sorumluluk, yerine getirilmesi beklenen görevdir. Adım 3: İkisi birlikte vatandaşlığı dengeler.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Eğitim hakkı olan bir öğrencinin ders çalışması neyi gösterir?",
        options: [
          "Hak ile sorumluluğun birlikte işlemesini",
          "Yalnızca vergi ödemeyi",
          "Önyargıyı",
          "Mutlak konumu",
        ],
        correctAnswerIndex: 0,
        hint: "Okula gitmek hak; öğrenmeye özen göstermek sorumluluktur.",
        explanation:
          "Adım 1: Eğitim bir haktır. Adım 2: Dersi takip etmek sorumluluktur. Adım 3: Böylece hak ile sorumluluk aynı süreçte yürür.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Müzik dinlerken komşuyu rahatsız edecek kadar ses açmak hangisini bozar?",
        options: [
          "Özgürlüğün başkasının hakkı ile sınırlı olduğu ilkesini",
          "Mutlak konum bilgisini",
          "İpek Yolu ticaretini",
          "Enlem çizgilerini",
        ],
        correctAnswerIndex: 0,
        hint: "Özgürlük, başkasının rahatını yok saymak değildir.",
        explanation:
          "Adım 1: Özgürlük sınırsız değildir. Adım 2: Başkasının dinlenme hakkı vardır. Adım 3: Aşırı ses, özgürlüğü kötü kullanmaktır.",
      },
    ],
  },
  {
    n: 5,
    title: "İlk Türk devletleri ve Orta Asya Türk kültürü",
    tellGuides: [
      "Asya Hun, Göktürk ve Uygur'u kısa kısa tanıtabilir misin?",
      "Töre ve kurultayın ne işe yaradığını anlatır mısın?",
      "Uygurların yerleşik hayata geçmesini neden önemli sayarsın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "İlk Türk devletlerinde «töre» neyi anlatır?",
        options: [
          "Topluluğun ortak düzen ve gelenek kurallarını",
          "Yalnızca bir şehir surunu",
          "Modern vergi sistemini",
          "Deniz ticareti antlaşmasını",
        ],
        correctAnswerIndex: 0,
        hint: "Ortak yaşamı düzenleyen kurallar tarafındadır.",
        explanation:
          "Adım 1: Töre, boyların ortak düzenidir. Adım 2: Kağan ve kurultay bu düzen içinde yer alır. Adım 3: Modern vergi veya deniz antlaşması değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Tarih seridinde Uygurları Göktürklerden ayıran önemli özellik hangisidir?",
        options: [
          "Uygurların yerleşik hayata geçmesi",
          "Uygurların hiç devlet kurmaması",
          "Uygurların yalnız denizci olması",
          "Uygurların töreyi tamamen reddetmesi",
        ],
        correctAnswerIndex: 0,
        hint: "Konar göçer / yerleşik ayrımını düşün.",
        explanation:
          "Adım 1: Hun ve Göktürk daha çok konar göçerdir. Adım 2: Uygurlar yerleşik hayata geçer. Adım 3: Bu, kültür ve devlet düzeninde önemli bir farktır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Bir metinde «kağan kurultayı topladı» yazıyor. Öğrenci bundan ne çıkarabilir?",
        options: [
          "Önemli kararların ortak görüşmeyle de alındığını",
          "Devletin hiç kuralı olmadığını",
          "Yalnızca vergi alındığını",
          "Deniz aşırı koloni kurulduğunu",
        ],
        correctAnswerIndex: 0,
        hint: "Kurultay, ortak danışma yeridir.",
        explanation:
          "Adım 1: Kurultay, boy beylerinin toplandığı meclistir. Adım 2: Kağan önemli işlerde danışır. Adım 3: Bu, keyfi ve kuralsız yönetim olmadığını gösterir.",
      },
    ],
  },
  {
    n: 6,
    title: "İslamiyet'in doğuşu ve yayılışı",
    tellGuides: [
      "İslamiyet'in doğuşunu yer ve yıl ile anlatır mısın?",
      "Hicret'in neden takvim başlangıcı sayıldığını söyler misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "İslamiyet hangi şehirde doğmuştur?",
        options: ["Mekke", "İstanbul", "Roma", "Pekin"],
        correctAnswerIndex: 0,
        hint: "Hicaz bölgesindeki kutsal şehir.",
        explanation:
          "Adım 1: İslamiyet 610 yılında Mekke'de doğar. Adım 2: Hz. Muhammed'e ilk vahiy burada gelir. Adım 3: İstanbul, Roma veya Pekin doğuş yeri değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "622 yılındaki Hicret tarih seridinde neden önemlidir?",
        options: [
          "Medine'ye göçtür ve hicri takvimin başlangıcıdır",
          "İpek Yolu'nun kapanışıdır",
          "İlk Türk devletinin kuruluşudur",
          "Türkiye Cumhuriyeti'nin ilanıdır",
        ],
        correctAnswerIndex: 0,
        hint: "Yer değişimi + takvim bağı.",
        explanation:
          "Adım 1: Hicret, Mekke'den Medine'ye göçtür. Adım 2: Yıl 622'dir. Adım 3: Hicri takvim bu olayla başlar.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Bir öğrenci «İslamiyet yalnız bir şehirde kaldı» diyor. Hangisi doğru düzeltmedir?",
        options: [
          "Doğuş Mekke'dedir; zamanla farklı bölgelere yayılmıştır",
          "Hiç yayılmamış, yalnızca bir köyde kalmıştır",
          "Yalnızca Avrupa'da doğmuştur",
          "Hicret hiç yaşanmamıştır",
        ],
        correctAnswerIndex: 0,
        hint: "Doğuş yeri ile yayılış alanını ayır.",
        explanation:
          "Adım 1: Doğuş Mekke'dedir. Adım 2: Hicret ve sonrasında yayılış hızlanır. Adım 3: Bu yüzden «yalnız bir şehirde kaldı» yanlıştır.",
      },
    ],
  },
  {
    n: 7,
    title: "Türklerin İslamiyet'i kabulü ve ilk Türk-İslam devletleri",
    tellGuides: [
      "Türklerin İslamiyet'i kabulünde Talas ve Karahanlıları nasıl anlatırsın?",
      "Malazgirt'in Anadolu için neden kapı olduğunu söyler misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "İlk Müslüman Türk devleti olarak öne çıkan devlet hangisidir?",
        options: ["Karahanlılar", "Roma İmparatorluğu", "Asya Hun Devleti", "Osmanlı'dan önceki Bizans"],
        correctAnswerIndex: 0,
        hint: "Türk-İslam devletleri hattının başı.",
        explanation:
          "Adım 1: Karahanlılar İslamiyet'i kabul eden ilk Türk devletlerindendir. Adım 2: Bu, Türk-İslam tarihi için dönüm noktasıdır. Adım 3: Roma veya Hun bu tanımın karşılığı değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "1071 Malazgirt Zaferi tarih seridinde neyi açar?",
        options: [
          "Anadolu'nun Türkleşmesi sürecinin kapısını",
          "İpek Yolu'nun tamamen kapanmasını",
          "Cumhuriyet'in ilanını",
          "Hicret'in başlangıcını",
        ],
        correctAnswerIndex: 0,
        hint: "Anadolu kapısı ifadesini düşün.",
        explanation:
          "Adım 1: Malazgirt 1071'dir. Adım 2: Büyük Selçuklu zaferi Anadolu'ya girişi kolaylaştırır. Adım 3: Cumhuriyet veya Hicret bu olay değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "«Türkler İslamiyet'i bir günde ve zorla kabul etti» iddiasına karşı hangisi daha doğru yaklaşımdır?",
        options: [
          "Kabul uzun bir süreçtir; Talas sonrası ilişkiler ve Karahanlılar bu yolda önemli adımlardır",
          "Hiç kabul olmamıştı",
          "Yalnızca 1923'te kabul edildi",
          "Malazgirt İslamiyet'in doğuşudur",
        ],
        correctAnswerIndex: 0,
        hint: "Süreç ve devlet adlarını düşün.",
        explanation:
          "Adım 1: Tarihsel kabul bir süreçtir. Adım 2: Talas sonrası ilişkiler ve Karahanlılar öne çıkar. Adım 3: Tek güne veya yanlış yıla bağlamak yanlıştır.",
      },
    ],
  },
  {
    n: 8,
    title: "İpek Yolu ve kültürel etkileşim",
    tellGuides: [
      "İpek Yolu'nu yalnız ipek hattı olarak mı, yoksa kültür yolu olarak mı anlatırsın?",
      "Kervanın taşıdığı bir mal ve bir fikir örneği verebilir misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "İpek Yolu nedir?",
        options: [
          "Çin'den Anadolu ve Akdeniz'e uzanan ticaret ve karşılaşma yolu",
          "Yalnızca bir demiryolu hattı",
          "Modern otoyol vergisi",
          "Yalnız denizaltı kablosu",
        ],
        correctAnswerIndex: 0,
        hint: "Mal ve kültürün birlikte yürüdüğü yol.",
        explanation:
          "Adım 1: İpek Yolu tarihi bir ticaret yoludur. Adım 2: Çin'den batıya uzanır. Adım 3: Yalnız demiryolu veya vergi değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Haritada kervansaray hangi işlevi gösterir?",
        options: [
          "Yolcuların ve kervanların konakladığı durak",
          "Yalnızca vergi dairesi",
          "Deniz feneri",
          "Modern havaalanı",
        ],
        correctAnswerIndex: 0,
        hint: "Yolda dinlenme ve güvenlik durağı.",
        explanation:
          "Adım 1: Kervansaray yol üstü konaktır. Adım 2: Ticaret güvenliğini artırır. Adım 3: Havaalanı veya vergi dairesi değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Bir metin «İpek Yolu'nda yalnız kumaş taşındı» diyor. Hangisi daha doğru tamamlamadır?",
        options: [
          "Mal yanında din, dil, bilim ve fikirler de taşındı; kültürel etkileşim oldu",
          "Hiçbir kültür alışverişi olmadı",
          "Yalnızca modern bilgisayar taşındı",
          "Yol hiç kullanılmadı",
        ],
        correctAnswerIndex: 0,
        hint: "Kervan mal ile fikri birlikte taşır.",
        explanation:
          "Adım 1: Ticaret mal taşır. Adım 2: İnsanlar fikir, inanç ve bilgi de taşır. Adım 3: Bu yüzden İpek Yolu kültürel etkileşim yoludur.",
      },
    ],
  },
  {
    n: 9,
    title: "Mutlak konum ve göreceli konum",
    tellGuides: [
      "Mutlak konum ile göreceli konum arasındaki farkı anlatır mısın?",
      "Paralel ve meridyenin neyi gösterdiğini söyler misin?",
      "Türkiye'nin yaklaşık enlem aralığını hatırlıyor musun?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Mutlak konum ile göreceli konum arasındaki temel fark nedir?",
        options: [
          "Mutlak konum enlem-boylamla sabittir; göreceli konum başka yere göredir",
          "İkisi de yalnız iklim türüdür",
          "Göreceli konum hiç değişmez, mutlak konum her gün değişir",
          "Mutlak konum yalnız şehir ismidir",
        ],
        correctAnswerIndex: 0,
        hint: "Sabit matematiksel adres / çevreye göre tarif.",
        explanation:
          "Adım 1: Mutlak konum paralel ve meridyenle belirlenir. Adım 2: Göreceli konum «parkın karşısı» gibi tariftir. Adım 3: Biri sabit, diğeri referansa bağlıdır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Haritada paralel çizgileri neyi gösterir?",
        options: [
          "Enlemi",
          "Yalnızca boylamı",
          "Vergi oranını",
          "Nüfus yoğunluğunu",
        ],
        correctAnswerIndex: 0,
        hint: "Ekvator'a paralel hayali çizgiler.",
        explanation:
          "Adım 1: Paraleller enlemi gösterir. Adım 2: Meridyenler boylamı gösterir. Adım 3: Türkiye yaklaşık 36–42° kuzey paralellerindedir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Arkadaşına «Okul, marketin iki sokak yukarısında» diyen biri hangi konumu kullanır?",
        options: [
          "Göreceli konum",
          "Mutlak konum",
          "Yalnızca boylam",
          "İklim tipi",
        ],
        correctAnswerIndex: 0,
        hint: "Başka bir yere göre tarif.",
        explanation:
          "Adım 1: Market referans alınmıştır. Adım 2: Bu göreceli tariftir. Adım 3: Enlem-boylam verilmediği için mutlak konum değildir.",
      },
    ],
  },
  {
    n: 10,
    title: "Türkiye'nin coğrafi konumu ve iklim çeşitliliği",
    tellGuides: [
      "Türkiye'nin coğrafi konumunu neden «köprü» diye anlatırız?",
      "İklim çeşitliliğinin ekonomik faaliyetlere etkisini bir örnekle söyler misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Türkiye'nin coğrafi konumu neden özeldir?",
        options: [
          "Asya ile Avrupa arasında köprü konumundadır",
          "Yalnızca bir okyanus adasıdır",
          "Ekvator üzerindedir",
          "Kutup dairesindedir",
        ],
        correctAnswerIndex: 0,
        hint: "İki kıta arasındaki geçiş konumunu düşün.",
        explanation:
          "Adım 1: Türkiye kıtalararası geçiş yerindedir. Adım 2: Bu konum ticareti ve kültürü etkiler. Adım 3: Ada, ekvator veya kutup ülkesi değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Karadeniz kıyısında çay, iç bölgelerde ise tahıl öne çıkıyorsa bu neyi gösterir?",
        options: [
          "İklim ve konumun ekonomik faaliyeti etkilediğini",
          "İklimin hiç önemli olmadığını",
          "Yalnızca vergi oranını",
          "Mutlak konumun değiştiğini",
        ],
        correctAnswerIndex: 0,
        hint: "Farklı iklim → farklı ürün.",
        explanation:
          "Adım 1: Nemli kıyı ile iç bölge iklimi farklıdır. Adım 2: Ürün buna göre değişir. Adım 3: Bu, konum-iklim-ekonomi bağını gösterir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Bir öğrenci «Türkiye'de tek bir iklim vardır» diyor. Hangisi doğru düzeltmedir?",
        options: [
          "Konum ve yeryüzü şekilleri nedeniyle birden fazla iklim tipi görülür",
          "Hiç iklim yoktur",
          "Yalnızca kutup iklimi vardır",
          "İklim yalnız yazın vardır",
        ],
        correctAnswerIndex: 0,
        hint: "Denize göre konum ve yükselti çeşitliliği.",
        explanation:
          "Adım 1: Türkiye'nin konumu çeşitlidir. Adım 2: Dağlar ve denizler iklimi böler. Adım 3: Bu yüzden tek iklim iddiası yanlıştır.",
      },
    ],
  },
  {
    n: 11,
    title: "Türkiye'nin yeryüzü şekilleri ve bitki örtüsü",
    tellGuides: [
      "Yeryüzü şekillerinin iklimi nasıl böldüğünü anlatır mısın?",
      "Bitki örtüsünün yükselti ve iklimle bağını bir örnekle söyler misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Yeryüzü şekilleri neyi kapsar?",
        options: [
          "Dağ, ova, plato gibi yüzey biçimlerini",
          "Yalnızca nüfus sayısını",
          "Yalnızca parti listelerini",
          "Yalnızca vergi türlerini",
        ],
        correctAnswerIndex: 0,
        hint: "Yeryüzünün kabartı ve çukurlukları.",
        explanation:
          "Adım 1: Dağ, ova, plato yeryüzü şeklidir. Adım 2: Bunlar iklim ve yerleşimi etkiler. Adım 3: Nüfus veya vergi tanımı değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Yüksek dağların denize paralel uzanması kıyı ile iç kesim arasında neyi güçleştirir?",
        options: [
          "Nemli havanın içlere kolayca geçmesini",
          "Hiçbir iklim farkını",
          "Yalnızca boylam hesaplarını",
          "Vergi toplamasını",
        ],
        correctAnswerIndex: 0,
        hint: "Dağlar nemli havanın yolunu kesebilir.",
        explanation:
          "Adım 1: Denize paralel dağlar bariyer gibi davranır. Adım 2: Nemli hava içlere zor geçer. Adım 3: Bu yüzden kıyı ve iç kesim bitki örtüsü farklılaşır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Aynı enlemde kıyıda orman, içte bozkır görülüyorsa öğrenci neyi çıkarır?",
        options: [
          "Bitki örtüsü yalnız enleme değil, yükselti ve nem koşullarına da bağlıdır",
          "Bitki örtüsü rastgele değişir",
          "Enlem hiç işe yaramaz",
          "Bozkır yalnız kutupta olur",
        ],
        correctAnswerIndex: 0,
        hint: "Aynı enlem, farklı nem ve yükselti.",
        explanation:
          "Adım 1: Enlem tek etken değildir. Adım 2: Nem ve yükselti bitkiyi değiştirir. Adım 3: Bu çıkarım LGS sosyal okuryazarlığına uygundur.",
      },
    ],
  },
  {
    n: 12,
    title: "Ülkemizin kaynakları ve ekonomik faaliyetler",
    tellGuides: [
      "Ekonomik faaliyetin ne olduğunu kendi sözlerinle anlatır mısın?",
      "Bir bölgedeki ürünün kaynağa nasıl bağlı olduğunu örnekler misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Ekonomik faaliyet ne demektir?",
        options: [
          "İnsanların geçim için yaptığı üretim, dağıtım ve tüketim işleri",
          "Yalnızca tatil planı",
          "Haritadaki renk skalası",
          "Önyargı örneği",
        ],
        correctAnswerIndex: 0,
        hint: "Geçim ve iş tarafındadır.",
        explanation:
          "Adım 1: Ekonomik faaliyet geçim işidir. Adım 2: Tarım, sanayi, turizm örnekleridir. Adım 3: Tatil planı veya harita rengi değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Maden zenginliği olan bir bölgede hangisi daha beklenir?",
        options: [
          "Madencilik ve buna bağlı sanayi faaliyetleri",
          "Yalnızca kutup turizmi",
          "Hiç ekonomik faaliyet olmaması",
          "Enlem çizgisinin silinmesi",
        ],
        correctAnswerIndex: 0,
        hint: "Kaynak, faaliyeti yönlendirir.",
        explanation:
          "Adım 1: Kaynak ile faaliyet bağlıdır. Adım 2: Maden varsa madencilik öne çıkar. Adım 3: Bu, konum-kaynak-ekonomi ilişkisidir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Sahil kasabasında balıkçılık ve turizm birlikte yürüyorsa bu neyi gösterir?",
        options: [
          "Aynı coğrafi koşulların birden fazla ekonomik faaliyeti destekleyebileceğini",
          "Turizmin yasak olduğunu",
          "Balıkçılığın vergi olmadığını",
          "Kaynağın hiç işe yaramadığını",
        ],
        correctAnswerIndex: 0,
        hint: "Deniz hem ürün hem ziyaretçi getirir.",
        explanation:
          "Adım 1: Deniz balıkçılık kaynağıdır. Adım 2: Manzara ve iklim turizmi destekler. Adım 3: Bir yer birden fazla faaliyet taşıyabilir.",
      },
    ],
  },
  {
    n: 13,
    title: "Doğal kaynaklarımız ve sürdürülebilirlik",
    tellGuides: [
      "Yenilenebilir ve yenilenemez kaynağı nasıl ayırırsın?",
      "Sürdürülebilirliğin «yarını da hesaba katmak» olduğunu bir örnekle anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Yenilenemez doğal kaynak için hangisi doğrudur?",
        options: [
          "Tükendiğinde kısa sürede yeniden oluşmaz",
          "Her gece kendiliğinden çoğalır",
          "Hiç kullanılmaz",
          "Yalnızca rüzgârdır",
        ],
        correctAnswerIndex: 0,
        hint: "Kömür ve petrol bu taraftadır.",
        explanation:
          "Adım 1: Yenilenemez kaynak çok uzun sürede oluşur. Adım 2: Aşırı kullanımda tükenir. Adım 3: Rüzgâr yenilenebilir taraftadır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Ormanı bilinçsiz kesmek hangi ilkeye aykırıdır?",
        options: [
          "Sürdürülebilirlik",
          "Mutlak konum",
          "Hicret",
          "Yasama organı",
        ],
        correctAnswerIndex: 0,
        hint: "Yarını da düşünen kullanım.",
        explanation:
          "Adım 1: Sürdürülebilirlik, kaynağı yarın için de korumaktır. Adım 2: Bilinçsiz kesim yenilenmeyi bozar. Adım 3: Konum veya Hicret ile ilgili değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Okulda kâğıdı iki yüz kullanmak ve ışığı gereksiz yere açık bırakmamak neyi öğretir?",
        options: [
          "Küçük tasarrufun kaynak korumasına katkı verdiğini",
          "Verginin kaldırıldığını",
          "İklimin tek tip olduğunu",
          "Doğal kaynağın sonsuz olduğunu",
        ],
        correctAnswerIndex: 0,
        hint: "Günlük alışkanlık = sürdürülebilirlik pratiği.",
        explanation:
          "Adım 1: Kaynak sınırlıdır. Adım 2: Tasarruf tüketimi azaltır. Adım 3: Bu, sürdürülebilir vatandaşlık davranışıdır.",
      },
    ],
  },
  {
    n: 14,
    title: "Vergilerimiz ve vatandaşlık sorumluluğu",
    tellGuides: [
      "Verginin ortak gider için neden alındığını anlatır mısın?",
      "Vergi ödemenin vatandaşlık sorumluluğu olduğunu bir örnekle söyler misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Vergi temelde ne için alınır?",
        options: [
          "Okul, yol, sağlık gibi ortak kamu giderlerini karşılamak için",
          "Yalnızca bir kişinin tatilini finanse etmek için",
          "Harita çizmek için",
          "Önyargıyı artırmak için",
        ],
        correctAnswerIndex: 0,
        hint: "Ortak hizmetlerin bedeli.",
        explanation:
          "Adım 1: Vergi kamu geliridir. Adım 2: Ortak hizmetleri finanse eder. Adım 3: Kişisel tatil veya önyargı için değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Firkete (fiş) istemek neden önemlidir?",
        options: [
          "Kayıtlı alışveriş vergiye yansır; kamu payı görünür olur",
          "Fiş istemek yasaktır",
          "Fiş iklimi değiştirir",
          "Fiş mutlak konumdur",
        ],
        correctAnswerIndex: 0,
        hint: "Kayıt, ortak payı korur.",
        explanation:
          "Adım 1: Fiş alışverişi belgeler. Adım 2: Belge vergi düzenini destekler. Adım 3: Bu, vatandaşlık sorumluluğunun günlük yüzüdür.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "«Vergi yalnız zenginlerin işidir, benimle ilgisi yok» diyen biri için hangisi doğrudur?",
        options: [
          "Vergi ortak yaşamın finansmanıdır; vatandaşlık sorumluluğudur",
          "Vergi yalnız spor kulübü aidatıdır",
          "Vergi önyargı örneğidir",
          "Vergi enlem hesabıdır",
        ],
        correctAnswerIndex: 0,
        hint: "Ortak gider — ortak pay.",
        explanation:
          "Adım 1: Kamu hizmeti herkese açıktır. Adım 2: Vergi bu hizmetin kaynağıdır. Adım 3: Bu yüzden vatandaşlık sorumluluğudur.",
      },
    ],
  },
  {
    n: 15,
    title: "Nitelikli insan gücü ve meslek seçimi",
    tellGuides: [
      "Nitelikli insan gücünün ne demek olduğunu anlatır mısın?",
      "Meslek seçerken ilgi, beceri ve toplum ihtiyacını nasıl dengelersin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Nitelikli insan gücü neyi anlatır?",
        options: [
          "Bilgi, beceri ve özenle iş yapabilen insanı",
          "Yalnızca fiziksel gücü",
          "Haritadaki nüfus noktasını",
          "Vergi oranını",
        ],
        correctAnswerIndex: 0,
        hint: "Öğrenmek ve özen göstermek tarafındadır.",
        explanation:
          "Adım 1: Nitelik, öğrenme ve beceridir. Adım 2: Özenli çalışma niteliği yükseltir. Adım 3: Yalnız kas gücü veya vergi değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Bir bölgede turizm büyüyorsa hangi nitelikler daha değerli hale gelir?",
        options: [
          "Yabancı dil, iletişim ve hizmet becerileri",
          "Yalnızca kutup araştırması",
          "Hiçbir beceri",
          "Enlem ezberi",
        ],
        correctAnswerIndex: 0,
        hint: "Sektör, ihtiyaç duyulan beceriyi seçer.",
        explanation:
          "Adım 1: Turizm insanla çalışmayı gerektirir. Adım 2: Dil ve iletişim öne çıkar. Adım 3: Bu, meslek-ihtiyaç bağını gösterir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Meslek seçerken yalnız «çok para» diye karar veren biri hangi noktayı eksik bırakır?",
        options: [
          "İlgi, beceri ve toplum ihtiyacını birlikte düşünmeyi",
          "Mutlak konum hesabını",
          "İpek Yolu kronolojisini",
          "Hicret yılını",
        ],
        correctAnswerIndex: 0,
        hint: "Nitelik + uyum + ihtiyaç.",
        explanation:
          "Adım 1: Meslek toplumun bir işidir. Adım 2: İlgi ve beceri sürdürülebilir başarı getirir. Adım 3: Yalnız gelir odaklı seçim eksik kalır.",
      },
    ],
  },
  {
    n: 16,
    title: "Demokrasinin gelişimi ve yönetim biçimleri",
    tellGuides: [
      "Demokrasinin «katılmak» olduğunu nasıl anlatırsın?",
      "Cumhuriyet ile demokrasinin bağını kendi sözlerinle söyler misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Demokrasi temelde neyi ifade eder?",
        options: [
          "Halkın yönetime katılması ve kararlarda söz sahibi olması",
          "Tek kişinin sınırsız yönetimi",
          "Yalnızca vergi oranını",
          "Harita ölçeğini",
        ],
        correctAnswerIndex: 0,
        hint: "Katılım ve söz hakkı.",
        explanation:
          "Adım 1: Demokrasi halkın yönetime katılmasıdır. Adım 2: Seçim ve temsil bu yolun araçlarıdır. Adım 3: Tek kişi egemenliği demokrasi değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Cumhuriyet yönetiminde yöneticiler nasıl belirlenir?",
        options: [
          "Seçimle",
          "Rastgele çekilişle her gün",
          "Yalnız soyadına göre",
          "Harita rengiyle",
        ],
        correctAnswerIndex: 0,
        hint: "Seçilen yönetim.",
        explanation:
          "Adım 1: Cumhuriyette yönetim seçimle gelir. Adım 2: Temsil halkın oyuna dayanır. Adım 3: Soyadı veya harita rengi ölçüt değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Sınıf başkanı seçiminde herkesin oy kullanması hangi değeri yaşatır?",
        options: [
          "Demokratik katılımı",
          "Önyargıyı",
          "Yenilenemez kaynağı",
          "Mutlak konumu",
        ],
        correctAnswerIndex: 0,
        hint: "Küçük ölçekte demokrasi pratiği.",
        explanation:
          "Adım 1: Oy kullanmak katılmaktır. Adım 2: Sınıf seçimi demokrasi alıştırmasıdır. Adım 3: Bu, önyargı veya konum bilgisi değildir.",
      },
    ],
  },
  {
    n: 17,
    title: "Haklarımızın güvencesi: anayasa ve demokrasi",
    tellGuides: [
      "Anayasanın neden üst kanun olduğunu anlatır mısın?",
      "Hakların anayasa ile güvence altına alınmasını bir örnekle söyler misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Anayasa neden «üst kanun» sayılır?",
        options: [
          "Diğer kanunların ona uygun olması gerekir",
          "Yalnız spor kurallarını yazar",
          "Harita çizimidir",
          "Vergi makbuzudur",
        ],
        correctAnswerIndex: 0,
        hint: "Hukuk düzeninin en üst çerçevesi.",
        explanation:
          "Adım 1: Anayasa devletin temel kanunudur. Adım 2: Diğer kurallar ona aykırı olamaz. Adım 3: Bu yüzden üst kanundur.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Eğitim ve sağlık gibi hakların güvencesi nerede yazılıdır?",
        options: [
          "Anayasada",
          "Yalnızca bir reklam afişinde",
          "İpek Yolu haritasında",
          "İklim tablosunda",
        ],
        correctAnswerIndex: 0,
        hint: "Temel hakların yazılı güvencesi.",
        explanation:
          "Adım 1: Temel haklar anayasada yer alır. Adım 2: Bu güvence keyfi değildir. Adım 3: Reklam veya harita güvence kaynağı değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Bir yönetici «Bu hakkı ben tek başıma silebilirim» derse hangisi doğrudur?",
        options: [
          "Anayasal haklar keyfi silinemez; demokrasi ve hukuk bunu engeller",
          "Haklar her gün rastgele silinir",
          "Anayasa yalnız hava durumudur",
          "Haklar yalnızca vergiye bağlıdır",
        ],
        correctAnswerIndex: 0,
        hint: "Üst kanun + güvence.",
        explanation:
          "Adım 1: Haklar anayasa ile korunur. Adım 2: Tek kişinin keyfi silmesi hukuk devletine aykırıdır. Adım 3: Demokrasi bu güvenceyi yaşatır.",
      },
    ],
  },
  {
    n: 18,
    title: "Devletin organları",
    tellGuides: [
      "Yasama, yürütme ve yargıyı kendi sözlerinle ayırır mısın?",
      "Bir haberde geçen işin hangi organa ait olduğunu nasıl anlarsın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Yasama organı Türkiye'de hangisidir?",
        options: [
          "Türkiye Büyük Millet Meclisi",
          "Yalnızca mahkemeler",
          "Yalnızca valilikler",
          "İklim istasyonları",
        ],
        correctAnswerIndex: 0,
        hint: "Kanun yapan organ.",
        explanation:
          "Adım 1: Yasama kanun yapar. Adım 2: Bu iş TBMM'nindir. Adım 3: Mahkeme yargı, uygulama ise yürütme tarafındadır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Cumhurbaşkanının kanunları uygulayan ekibin başında olması hangi organı gösterir?",
        options: [
          "Yürütme",
          "Yasama",
          "Yargı",
          "Kervansaray",
        ],
        correctAnswerIndex: 0,
        hint: "Uygulama tarafı.",
        explanation:
          "Adım 1: Yürütme kanunları uygular. Adım 2: Başında Cumhurbaşkanı vardır. Adım 3: Kanun yazmak yasama, yargılamak yargıdır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Bir dava sonucu mahkemeden çıkıyorsa bu haber hangi organla ilgilidir?",
        options: [
          "Yargı",
          "Yalnızca yasama",
          "Yalnızca İpek Yolu",
          "Yalnızca iklim",
        ],
        correctAnswerIndex: 0,
        hint: "Bağımsız mahkemeler.",
        explanation:
          "Adım 1: Yargı bağımsız mahkemelerdir. Adım 2: Dava kararı yargı işidir. Adım 3: Üç organ birbirinin işini almaz.",
      },
    ],
  },
  {
    n: 19,
    title: "Komşularımız ve uluslararası ilişkiler",
    tellGuides: [
      "Kara komşusu ne demektir, bir örnekle anlatır mısın?",
      "Uluslararası ilişkilerin barış ve iş birliği için olduğunu nasıl açıklarsın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Kara komşusu ne demektir?",
        options: [
          "Sınırı karadan değen devlet",
          "Yalnızca denizde sınırlı ülke",
          "Hiç sınırı olmayan ülke",
          "Bir şehrin mahallesi",
        ],
        correctAnswerIndex: 0,
        hint: "Kara sınırı ortak olan ülke.",
        explanation:
          "Adım 1: Kara komşusu karadan sınırdaş demektir. Adım 2: Türkiye'nin birden fazla kara komşusu vardır. Adım 3: Mahalle veya sınırsız ülke değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Haritada Türkiye'nin güneyindeki kara komşularından biri hangisidir?",
        options: [
          "Suriye",
          "Norveç",
          "Japonya",
          "Brezilya",
        ],
        correctAnswerIndex: 0,
        hint: "Güney sınırına bak.",
        explanation:
          "Adım 1: Suriye Türkiye'nin güneyinde kara komşusudur. Adım 2: Norveç, Japonya, Brezilya bu konumda değildir. Adım 3: Harita okuryazarlığı komşuyu gösterir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "İki ülke arasında kültür ve eğitim iş birliği yapılması neyi güçlendirir?",
        options: [
          "Barışçıl uluslararası ilişkileri",
          "Önyargıyı zorunlu kılar",
          "Anayasayı kaldırır",
          "İklimi yok eder",
        ],
        correctAnswerIndex: 0,
        hint: "İş birliği = ilişkiyi güçlendirir.",
        explanation:
          "Adım 1: Uluslararası ilişki yalnız savaş değildir. Adım 2: Eğitim ve kültür bağları barışı destekler. Adım 3: Bu, vatandaşlık bilincinin dünya ölçeğidir.",
      },
    ],
  },
  {
    n: 20,
    title: "Ülkeler arası ticaret ve kültürel etkileşim",
    tellGuides: [
      "İhracat ile ithalatı kendi sözlerinle ayırır mısın?",
      "Ticaretin kültürel etkileşime nasıl yol açtığını bir örnekle anlatır mısın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "İhracat ne demektir?",
        options: [
          "Ülkenin yurt dışına mal veya hizmet satması",
          "Yalnızca yurt içinden alışveriş",
          "Vergiyi silmek",
          "Enlem çizmek",
        ],
        correctAnswerIndex: 0,
        hint: "Dışarıya satış.",
        explanation:
          "Adım 1: İhracat dışarıya satıştır. Adım 2: İthalat dışarıdan alıştır. Adım 3: İkisi birlikte dış ticareti oluşturur.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Bir ülke fındık satıp karşılığında makine alıyorsa bu neyi gösterir?",
        options: [
          "İhracat ve ithalatın birlikte işlediğini",
          "Ticaretin yasak olduğunu",
          "Yalnızca göreceli konumu",
          "Yalnızca önyargıyı",
        ],
        correctAnswerIndex: 0,
        hint: "Satış + alış = dış ticaret.",
        explanation:
          "Adım 1: Fındık satmak ihracattır. Adım 2: Makine almak ithalattır. Adım 3: Dış ticaret bu iki yönle yürür.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Ticaret yollarıyla yeni yemek, müzik veya kelimelerin yaygınlaşması neyin örneğidir?",
        options: [
          "Kültürel etkileşim",
          "Yenilenemez maden",
          "Yargı organı",
          "Mutlak konum hesabı",
        ],
        correctAnswerIndex: 0,
        hint: "Mal gider, kültür de taşınır.",
        explanation:
          "Adım 1: Ticaret insanları buluşturur. Adım 2: Alışkanlık ve kültür de taşınır. Adım 3: Bu kültürel etkileşimdir; maden veya yargı değildir.",
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

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (${pack.n}/20). */
export const JUNIOR_SOSYAL_QUIZ_${pack.n} = {
  lessonKey: "jr_06_sosyal-${pack.n}",
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

const outDir = join(process.cwd(), "lib", "junior", "quiz", "sosyal");
mkdirSync(outDir, { recursive: true });

for (const pack of PACKS) {
  const file = join(outDir, `${pack.n}.ts`);
  writeFileSync(file, renderPack(pack), "utf8");
  console.log("wrote", file);
}

const imports = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  return `import { JUNIOR_SOSYAL_QUIZ_${n} } from "@/lib/junior/quiz/sosyal/${n}";`;
}).join("\n");

const packList = Array.from({ length: 20 }, (_, i) => `  JUNIOR_SOSYAL_QUIZ_${i + 1},`).join("\n");
const exportList = Array.from({ length: 20 }, (_, i) => `  JUNIOR_SOSYAL_QUIZ_${i + 1},`).join("\n");

const index = `${imports}
import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. sınıf Sosyal Bilgiler konu sonu arşivi. Katalog sırası. */
export const JUNIOR_SOSYAL_QUIZ_PACKS = [
${packList}
] as const satisfies readonly JuniorLessonQuizPack[];

export {
${exportList}
};
`;

writeFileSync(join(outDir, "index.ts"), index, "utf8");
console.log("wrote index.ts", PACKS.length, "packs,", PACKS.length * 3, "questions");
