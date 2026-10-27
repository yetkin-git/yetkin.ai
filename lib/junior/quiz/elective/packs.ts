import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** Seçmeli İngilizce — saate göre selam. */
export const JUNIOR_ELECTIVE_QUIZ_ING_1 = {
  lessonKey: "jr_06_ing-1",
  title: "Saate göre selam",
  tellGuides: [
    "Good morning ile Good evening hangi saatlere aittir?",
    "Hello her saatte söylenebilir mi? Bir örnekle anlat.",
    "Good night neden ilk selam değildir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Good morning ne zaman söylenir?",
      options: ["Sabah selamı olarak", "Akşam ilk görüşte", "Uykuya giderken veda olarak", "Yalnızca öğle yemeğinde"],
      correctAnswerIndex: 0,
      hint: "Bu söz günaydın yerindedir.",
      explanation:
        "Adım 1: Good morning sabah selamıdır. Adım 2: Günaydın demektir. Adım 3: Akşam veda sözü değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Akşam komşuyu ilk gördüğünde hangi sözü seçersin?",
      options: ["Good night", "Good evening", "Good afternoon", "Good morning"],
      correctAnswerIndex: 1,
      hint: "İlk görüş ile uyku vedası ayrıdır.",
      explanation:
        "Adım 1: Akşam ilk selam Good eveningdir. Adım 2: Good night ayrılırken söylenen iyi gecelerdir. Adım 3: Kapıdaki ilk söz Good night olmaz.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Sabah okul kapısında arkadaşın Good morning diyor. Doğru karşılık hangisidir?",
      options: ["Good night", "Good evening", "Good morning", "Good afternoon"],
      correctAnswerIndex: 2,
      hint: "Selamın karşılığı aynı selamdır.",
      explanation:
        "Adım 1: Sabah selamı Good morningdir. Adım 2: Karşılık, duyulan selamın aynısıdır. Adım 3: Sen de Good morning dersin.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;

/** Seçmeli İngilizce — ad sormak. */
export const JUNIOR_ELECTIVE_QUIZ_ING_2 = {
  lessonKey: "jr_06_ing-2",
  title: "Adını sormak",
  tellGuides: [
    "What's your name sorusu ne ister?",
    "My name is cümlesini kendi adınla kur.",
    "Name is neden tek başına cevap olmaz?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "What's your name ne demektir?",
      options: ["Adın ne", "Günaydın", "İyi geceler", "Hoşça kal"],
      correctAnswerIndex: 0,
      hint: "Bu kalıp bir ad sorusudur.",
      explanation:
        "Adım 1: What's your name adını sorar. Adım 2: What is your name aynı sorudur. Adım 3: Selam sözü değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Arkadaşın adını soruyor. Cevabı nasıl kurarsın?",
      options: ["Name is", "My name is ve adın", "What's your name", "Good night"],
      correctAnswerIndex: 1,
      hint: "My sözü cümlede durur.",
      explanation:
        "Adım 1: Cevap My name is ile başlar. Adım 2: Ardından adın gelir. Adım 3: Yalnız Name is cümleyi eksik bırakır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Yeni bir öğrenciyle konuşuyorsun. Doğru sıra hangisidir?",
      options: [
        "Önce soruyu cevap sanıp susmak",
        "Önce Good night, sonra ad",
        "Önce selam, sonra What's your name",
        "Yalnızca Name is demek",
      ],
      correctAnswerIndex: 2,
      hint: "Selam, sorudan önce durur.",
      explanation:
        "Adım 1: Önce selam verilir. Adım 2: Sonra What's your name sorulur. Adım 3: Cevap My name is ile kurulur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;

/** Almanca — günün selamı. */
export const JUNIOR_ELECTIVE_QUIZ_ALM_1 = {
  lessonKey: "jr_06_alm-1",
  title: "Günün selamı",
  tellGuides: [
    "Guten Morgen ile Guten Abend farkını söyle.",
    "Hallo hangi saatte durur?",
    "Gute Nacht neden ilk karşılaşmanın sözü değildir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Guten Morgen hangi selamdır?",
      options: ["Sabah selamı", "Akşam selamı", "İyi geceler vedası", "Ad sorma kalıbı"],
      correctAnswerIndex: 0,
      hint: "Bu söz günaydın demektir.",
      explanation:
        "Adım 1: Guten Morgen sabah selamıdır. Adım 2: Günaydın demektir. Adım 3: Gute Nacht ile aynı işi görmez.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Öğle vakti bir arkadaşa hangi selamı seçersin?",
      options: ["Gute Nacht", "Guten Tag", "Guten Abend", "Ich heiße"],
      correctAnswerIndex: 1,
      hint: "Gün içinin selamı ayrıdır.",
      explanation:
        "Adım 1: Guten Tag gün içinin selamıdır. Adım 2: İyi günler demektir. Adım 3: Öğle vakti ilk söz Gute Nacht olmaz.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Akşam bakkala ilk giriyorsun. Doğru söz hangisidir?",
      options: ["Gute Nacht", "Guten Morgen", "Guten Abend", "Wie heißt du"],
      correctAnswerIndex: 2,
      hint: "Akşam ilk görüşün selamı vedadan ayrıdır.",
      explanation:
        "Adım 1: Akşam ilk selam Guten Abenddir. Adım 2: Gute Nacht uyku vaktinde vedadır. Adım 3: Kapıdaki ilk söz Guten Abend olur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;

/** Almanca — adını söylemek. */
export const JUNIOR_ELECTIVE_QUIZ_ALM_2 = {
  lessonKey: "jr_06_alm-2",
  title: "Adını söylemek",
  tellGuides: [
    "Wie heißt du ne sorar?",
    "Ich heiße cümlesini kendi adınla kur.",
    "Heiße tek başına neden cevap olmaz?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Wie heißt du ne demektir?",
      options: ["Adın ne", "Günaydın", "İyi geceler", "Hoşça kal"],
      correctAnswerIndex: 0,
      hint: "Bu cümle bir ad sorusudur.",
      explanation:
        "Adım 1: Wie heißt du adını sorar. Adım 2: Cevap başka bir kalıptadır. Adım 3: Selam sözü değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Adını söylerken hangi kalıbı kullanırsın?",
      options: ["Heiße", "Ich heiße ve adın", "Wie heißt du", "Gute Nacht"],
      correctAnswerIndex: 1,
      hint: "Ich sözü cümlede durur.",
      explanation:
        "Adım 1: Cevap Ich heiße ile başlar. Adım 2: Ad, kalıbın ardına gelir. Adım 3: Heiße tek başına eksik kalır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Yaz kursunda yeni bir arkadaşla karşılaşıyorsun. Doğru sıra hangisidir?",
      options: [
        "Sorudaki du sözünü cevapta bırakmak",
        "Yalnız adını fısıldamak",
        "Önce selam, sonra Wie heißt du",
        "Bütün cümleyi silmek",
      ],
      correctAnswerIndex: 2,
      hint: "Selam, ad sorusundan önce durur.",
      explanation:
        "Adım 1: Önce selam verilir. Adım 2: Sonra Wie heißt du sorulur. Adım 3: Cevap Ich heiße ve addır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;

/** Fransızca — Bonjour. */
export const JUNIOR_ELECTIVE_QUIZ_FRA_1 = {
  lessonKey: "jr_06_fra-1",
  title: "Bonjour demek",
  tellGuides: [
    "Bonjour ile Bonsoir hangi saatlere aittir?",
    "Büyük bir kişiye neden önce Bonjour dersin?",
    "Bonne nuit neden ilk selam değildir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Bonjour hangi vaktin selamıdır?",
      options: ["Sabah ve gün içi", "Yalnızca gece yarısı", "Uykuya giderken veda", "Ad sorma kalıbı"],
      correctAnswerIndex: 0,
      hint: "Günaydın ve iyi günler yerinde durur.",
      explanation:
        "Adım 1: Bonjour sabah ve gün içi selamıdır. Adım 2: Bonsoir akşama aittir. Adım 3: Bonne nuit veda sözüdür.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Akşam bir aile büyüğünü ilk gördüğünde hangi sözü seçersin?",
      options: ["Bonne nuit", "Bonsoir", "Je m'appelle", "Comment tu t'appelles"],
      correctAnswerIndex: 1,
      hint: "Akşam selamı vedadan ayrıdır.",
      explanation:
        "Adım 1: Bonsoir akşam selamıdır. Adım 2: Bonne nuit ayrılırken söylenir. Adım 3: İlk görüşte Bonsoir dersin.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Öğretmen kapıda duruyor. En uygun selam hangisidir?",
      options: ["Bonne nuit", "Yalnızca adını söylemek", "Bonjour", "Je m'appelle"],
      correctAnswerIndex: 2,
      hint: "Büyük bir kişiye gün içi selamı daha uygundur.",
      explanation:
        "Adım 1: Öğretmene önce Bonjour denir. Adım 2: Karşılık aynı selamdır. Adım 3: Bonne nuit ilk selam değildir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;

/** Fransızca — ad sormak. */
export const JUNIOR_ELECTIVE_QUIZ_FRA_2 = {
  lessonKey: "jr_06_fra-2",
  title: "Adını sormak",
  tellGuides: [
    "Comment tu t'appelles ne sorar?",
    "Je m'appelle cümlesini kendi adınla kur.",
    "Appelle tek başına neden cevap olmaz?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Comment tu t'appelles ne demektir?",
      options: ["Adın ne", "Günaydın", "İyi geceler", "Hoşça kal"],
      correctAnswerIndex: 0,
      hint: "Bu kalıp ad sorar.",
      explanation:
        "Adım 1: Comment tu t'appelles adını sorar. Adım 2: Cevap Je m'appelle ile kurulur. Adım 3: Selam sözü değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Kendi adını söylerken hangi kalıbı kullanırsın?",
      options: ["Appelle", "Je m'appelle ve adın", "Comment tu t'appelles", "Bonne nuit"],
      correctAnswerIndex: 1,
      hint: "Je sözü cümlede durur.",
      explanation:
        "Adım 1: Cevap Je m'appelle ile başlar. Adım 2: Ad, kalıbın ardına gelir. Adım 3: Appelle tek başına eksik kalır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Yeni bir grupta adını soracaksın. Doğru sıra hangisidir?",
      options: [
        "Soruyu tekrar edip adını söylememek",
        "Yalnız adını söylemek",
        "Önce Bonjour, sonra Comment tu t'appelles",
        "Önce Bonne nuit",
      ],
      correctAnswerIndex: 2,
      hint: "Selam, sorudan önce durur.",
      explanation:
        "Adım 1: Önce Bonjour denir. Adım 2: Sonra ad sorulur. Adım 3: Cevap Je m'appelle ve addır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;

/** Siyer — doğru söz. */
export const JUNIOR_ELECTIVE_QUIZ_SIYER_1 = {
  lessonKey: "jr_06_siyer-1",
  title: "Doğru söz",
  tellGuides: [
    "Doğru sözü kendi cümlenle tanımla.",
    "Emanet bir kalemde söz ile iş nasıl birleşir?",
    "İşine gelen cümle neden doğru söz sayılmaz?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Bu derste doğru söz ne demektir?",
      options: [
        "Söylenen ile yapılanın aynı olması",
        "Hoşa giden her cümle",
        "En uzun cümle",
        "Söylenmeyen bir sır",
      ],
      correctAnswerIndex: 0,
      hint: "Ağızdan çıkan ile elin yaptığı birleşir.",
      explanation:
        "Adım 1: Doğru söz, söylenen ile yapılanın aynı olmasıdır. Adım 2: Söz tutulursa doğru söz durur. Adım 3: Hoşa giden cümle tek başına doğru söz değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Sana emanet bir kalem verildi. Veririm dedin. Doğru iş hangisidir?",
      options: ["Kalemi gizlersin", "Kalemi sahibine geri verirsin", "Kalemi kendininki gibi tutarsın", "Unuttum deyip bırakırsın"],
      correctAnswerIndex: 1,
      hint: "Emanet sahibine döner.",
      explanation:
        "Adım 1: Söz, kalemi geri vermektir. Adım 2: İş de kalemi sahibine vermektir. Adım 3: Emaneti saklamak sözü bozar.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Arkadaşının silgisini ödünç aldın ve getireceğim dedin. Hangisi doğru sözü tutar?",
      options: [
        "Silgiyi çantanda bırakmak",
        "Unuttum deyip konuyu kapatmak",
        "Söylediğin gün silgiyi geri getirmek",
        "Başka bir silgiymiş gibi kullanmak",
      ],
      correctAnswerIndex: 2,
      hint: "Söz ile iş aynı günde birleşir.",
      explanation:
        "Adım 1: Getireceğim sözdür. Adım 2: O gün getirmek iştir. Adım 3: Unuttum demek, tutmadığın sözü doğru yapmaz.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;

/** Siyer — merhamet. */
export const JUNIOR_ELECTIVE_QUIZ_SIYER_2 = {
  lessonKey: "jr_06_siyer-2",
  title: "Merhamet",
  tellGuides: [
    "Merhameti gücün varken ne yapmamak olarak söyle.",
    "Yardım merhametin hangi işidir?",
    "Yanlış bir işi örtmek neden merhamet değildir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Merhamet bu derste ne demektir?",
      options: ["Gücün varken incitmemek", "Her sözü alkışlamak", "Haksız işi gizlemek", "En yüksek sesle konuşmak"],
      correctAnswerIndex: 0,
      hint: "Sertleşmemek bu tanımdadır.",
      explanation:
        "Adım 1: Merhamet, gücün varken incitmemektir. Adım 2: Yardım, bu huyun görünen işidir. Adım 3: Yanlış işi örtmek merhamet değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Yaşlı bir komşu poşeti zor taşıyor. Merhametli iş hangisidir?",
      options: ["Poşete aldırmamak", "Poşeti birlikte tutmak", "Komşuya gülmek", "Poşeti yere bırakmak"],
      correctAnswerIndex: 1,
      hint: "Yardım işte görünür.",
      explanation:
        "Adım 1: Kişiyi incitmezsin. Adım 2: Poşeti birlikte tutarak işini hafifletirsin. Adım 3: Bu, merhametin görünen işidir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Arkadaşın haksız bir iş yapıyor. Hangisi merhamete uyar?",
      options: [
        "Haksız işi doğru diye örtmek",
        "Alay ederek uzaklaşmak",
        "Kişiye yardım edip yanlışı nazikçe söylemek",
        "Yanlışı alkışlamak",
      ],
      correctAnswerIndex: 2,
      hint: "Yardım kişiye yapılır. Haksızlığa alkış tutulmaz.",
      explanation:
        "Adım 1: Merhamet kişiyi incitmez. Adım 2: Yanlış işi örtmek merhamet değildir. Adım 3: Yanlışı nazikçe söylersin.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;

/** Kodlama — komut sırası. */
export const JUNIOR_ELECTIVE_QUIZ_KOD_1 = {
  lessonKey: "jr_06_kod-1",
  title: "Komut sırası",
  tellGuides: [
    "Bilgisayar komutları hangi yönde çalıştırır?",
    "Bardak örneğinde ilk komut neden bardağı tutmaktır?",
    "Sıra değişince sonuç neden değişir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Bilgisayar komutları nasıl çalıştırır?",
      options: ["Yukarıdan aşağı, yazıldıkları sırayla", "En alttan başlayarak", "Karışık seçerek", "Yalnızca son satırı okuyarak"],
      correctAnswerIndex: 0,
      hint: "İlk satır önce çalışır.",
      explanation:
        "Adım 1: Komut, tek bir iştir. Adım 2: Bilgisayar işleri yukarıdan aşağı yapar. Adım 3: Son satır en son çalışır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Suyu bardağa koymak istiyorsun. İlk komut hangisi olmalıdır?",
      options: ["Musluğu aç", "Bardağı tut", "Musluğu kapat", "Bardağı bırak"],
      correctAnswerIndex: 1,
      hint: "Bardak tutulmadan su dökülür.",
      explanation:
        "Adım 1: Önce bardak tutulur. Adım 2: Sonra musluk açılır. Adım 3: Musluğu ilk adım yapmak suyu yere döker.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Üç komut şöyledir: bardağı tut, musluğu aç, musluğu kapat. Hangisi doğrudur?",
      options: [
        "Musluğu önce açmak suyu bardakta tutar",
        "Ortadaki adımı atlamak sonucu bozmaz",
        "Bu sıra suyu bardakta tutar",
        "Komutlar ezberlenince sıra önemsiz olur",
      ],
      correctAnswerIndex: 2,
      hint: "Sıra sonucu belirler.",
      explanation:
        "Adım 1: Birinci komut bardağı tutar. Adım 2: İkinci komut musluğu açar, üçüncü kapatır. Adım 3: Su bardakta kalır. Atlanan adım sırayı bozar.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;

/** Kodlama — hatalı adım. */
export const JUNIOR_ELECTIVE_QUIZ_KOD_2 = {
  lessonKey: "jr_06_kod-2",
  title: "Hatalı adımı bulmak",
  tellGuides: [
    "Hata nedir? Beklenen sonuçla olan sonucu karşılaştır.",
    "Bardağı bırak satırı neden bozuktur?",
    "Sağlam satıra neden dokunulmaz?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Hata bu derste nerede aranır?",
      options: [
        "Beklenen sonuç ile olan sonuç ayrıldığı satırda",
        "Bütün listenin silindiği yerde",
        "Yalnızca ilk satırda",
        "Sonucu beğenmediğin her yerde, satır aramadan",
      ],
      correctAnswerIndex: 0,
      hint: "Satırlar tek tek okunur.",
      explanation:
        "Adım 1: Beklenen sonuç ile olan sonuç farklıysa hata vardır. Adım 2: Bozuk satır işaretlenir. Adım 3: Sağlam satır durur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Komutlar: bardağı tut, bardağı bırak, musluğu aç. Su yere dökülüyor. Hata hangi satırdadır?",
      options: ["Birinci satır", "İkinci satır", "Üçüncü satır", "Hiçbir satır"],
      correctAnswerIndex: 1,
      hint: "Bardağı bırakmak suyu tutmaz.",
      explanation:
        "Adım 1: Birinci satır bardağı tutar ve sağlamdır. Adım 2: İkinci satır bardağı bırakır. Adım 3: Su bu yüzden dökülür. Düzeltme, bardağı tut demektir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Kek tarifinde şeker satırı unutulmuş. Doğru iş hangisidir?",
      options: [
        "Bütün tarifi çöpe atmak",
        "Sağlam adımları da silmek",
        "Eksik satırı eklemek",
        "Sonucu beğenip adımı söylememek",
      ],
      correctAnswerIndex: 2,
      hint: "Sağlam adım durur.",
      explanation:
        "Adım 1: Hata, unutulan şeker satırındadır. Adım 2: Sağlam satırlar silinmez. Adım 3: Eksik satır eklenir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;

/** Arapça — selam. */
export const JUNIOR_ELECTIVE_QUIZ_ARP_1 = {
  lessonKey: "jr_06_arp-1",
  title: "Selam vermek",
  tellGuides: [
    "Selamün aleyküm ne demektir?",
    "Ve aleyküm selam hangi sözün karşılığıdır?",
    "İki sözün sırası neden değişmez?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Selamün aleyküm ne demektir?",
      options: ["Barış üzerine olsun", "Adın ne", "İyi geceler", "Sağdan sola oku"],
      correctAnswerIndex: 0,
      hint: "Bu söz esenlik diler.",
      explanation:
        "Adım 1: Selamün aleyküm, barış üzerine olsun demektir. Adım 2: Bir kişiye esenlik diler. Adım 3: Karşılığı ayrı bir sözdür.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Biri Selamün aleyküm diyor. Karşılığın hangisidir?",
      options: ["Susmak", "Ve aleyküm selam", "Yalnızca adını söylemek", "İki sözü yer değiştirmek"],
      correctAnswerIndex: 1,
      hint: "Karşılık, sana da barış olsun demektir.",
      explanation:
        "Adım 1: Gelen söz selamdır. Adım 2: Dönen söz Ve aleyküm selamdır. Adım 3: Selamı duyup susmak karşılık değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Misafir kapıya geliyor. Doğru sıra hangisidir?",
      options: [
        "Önce karşılığı söyleyip selamı atlamak",
        "Selamı yarıda kesip başka söze geçmek",
        "Önce selam, sonra Ve aleyküm selam",
        "İki cümleyi tek selam sanmak",
      ],
      correctAnswerIndex: 2,
      hint: "Önce selam verilir. Sonra karşılık söylenir.",
      explanation:
        "Adım 1: Selam önce söylenir. Adım 2: Karşılık sonra söylenir. Adım 3: İki sözün yeri değişmez.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;

/** Arapça — okuma yönü. */
export const JUNIOR_ELECTIVE_QUIZ_ARP_2 = {
  lessonKey: "jr_06_arp-2",
  title: "Sağdan sola okumak",
  tellGuides: [
    "Arapça satır hangi yönden okunur?",
    "Elif ile be hangi sesleri taşır?",
    "Bab sözünü sağdan sola nasıl okursun?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Arapça satır hangi yönde okunur?",
      options: ["Sağdan sola", "Soldan sağa", "Yukarıdan aşağı sütun gibi", "Ortadan iki yana"],
      correctAnswerIndex: 0,
      hint: "İlk harf sağda durur.",
      explanation:
        "Adım 1: Arapça yazı sağdan sola okunur. Adım 2: İlk harf sağdadır. Adım 3: Son harf soldadır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Elif hangi sesi taşır?",
      options: ["b sesi", "Uzun a sesi", "Sessiz bir durak", "Kapı anlamı"],
      correctAnswerIndex: 1,
      hint: "Be, b sesidir. Elif başka sestir.",
      explanation:
        "Adım 1: Elif, uzun a sesini taşır. Adım 2: Be, b sesidir. Adım 3: İki harfin sesi birbirine karışmaz.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Bab, kapı demektir. Harfler sağdan sola be, elif, be duruyor. Okuyuş hangisidir?",
      options: ["Soldan sağa a, b, a", "Uzun a, sonra iki sessiz", "b, uzun a, b", "Yalnızca elif"],
      correctAnswerIndex: 2,
      hint: "Yön sağdan sola gider. Sesler harflerle birlikte yürür.",
      explanation:
        "Adım 1: Sağdaki be, b sesidir. Adım 2: Ortadaki elif, uzun a sesidir. Adım 3: Soldaki be yine b sesidir. Okuyuş b, uzun a, b olur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;

export const JUNIOR_ELECTIVE_QUIZ_PACKS = [
  JUNIOR_ELECTIVE_QUIZ_ING_1,
  JUNIOR_ELECTIVE_QUIZ_ING_2,
  JUNIOR_ELECTIVE_QUIZ_ALM_1,
  JUNIOR_ELECTIVE_QUIZ_ALM_2,
  JUNIOR_ELECTIVE_QUIZ_FRA_1,
  JUNIOR_ELECTIVE_QUIZ_FRA_2,
  JUNIOR_ELECTIVE_QUIZ_SIYER_1,
  JUNIOR_ELECTIVE_QUIZ_SIYER_2,
  JUNIOR_ELECTIVE_QUIZ_KOD_1,
  JUNIOR_ELECTIVE_QUIZ_KOD_2,
  JUNIOR_ELECTIVE_QUIZ_ARP_1,
  JUNIOR_ELECTIVE_QUIZ_ARP_2,
] as const satisfies readonly JuniorLessonQuizPack[];
