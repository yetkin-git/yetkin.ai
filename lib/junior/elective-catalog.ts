import { JUNIOR_ELECTIVE_SLUGS, JUNIOR_PILOT_GRADE } from "@/lib/junior/limits";
import type { JuniorLessonScript, JuniorNineSteps } from "@/lib/junior/types";

export { JUNIOR_ELECTIVE_SLUGS };

export type JuniorElectiveCourse = {
  slug: (typeof JUNIOR_ELECTIVE_SLUGS)[number];
  code: string;
  title: string;
  subject: string;
  grade: typeof JUNIOR_PILOT_GRADE;
  track: "elective";
  lessons: readonly JuniorLessonScript[];
};

const CLOSE =
  "Aferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!";

function seal(concept: string, voice: string): string {
  return `Sevgili çocuklar, buna Kavramsal Anlayış deriz. ${concept} Anlatışınıza İfade Gücü deriz. ${voice} ${CLOSE}`;
}

function lesson(input: {
  key: string;
  title: string;
  teaser: string;
  hello: string;
  middle: string;
  concept: string;
  voice: string;
  school: string;
  life: string;
  outcomes: readonly string[];
  steps: JuniorNineSteps;
}): JuniorLessonScript {
  return {
    key: input.key,
    title: input.title,
    teaser: input.teaser,
    listenText: `${input.hello} ${input.middle} ${seal(input.concept, input.voice)}`,
    outcomes: input.outcomes,
    scene: "elective",
    steps: input.steps,
    mebNote: `${input.school}\n\n${seal(input.concept, input.voice)}`,
    lifeUse: input.life,
  };
}

export const JUNIOR_ELECTIVE_COURSES = [
  {
    slug: "jr_06_ing",
    code: "JR-06-ING",
    title: "Seçmeli İngilizce (Pratik & Konuşma)",
    subject: "İngilizce",
    grade: JUNIOR_PILOT_GRADE,
    track: "elective",
    lessons: [
      lesson({
        key: "jr_06_ing-1",
        title: "Saate göre selam",
        teaser:
          "İngilizce selam, günün saatine göre seçilir. Kavramsal Anlayış, hangi selamın hangi saate ait olduğunu söyler. İfade Gücü, o selamı neden seçtiğinizi kendi sözlerinizle anlatmanızdır.",
        hello:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde İngilizcede selamlaşmayı öğreneceğiz.",
        middle:
          "Sabah gördüğünüz kişiye Good morning dersiniz. Bu söz, günaydın demektir. Öğleden sonra Good afternoon dersiniz. Akşam Good evening dersiniz. Hello, her saatte söylenebilir. Hello, merhaba demektir. Hadi şimdi ekrandaki çizime birlikte bakalım! Karşınızda bir arkadaş duruyor. Siz Good morning diyorsunuz. O da Good morning diyor. Selamın karşılığı aynı selamdır. Hatırlarsanız, selam saate göre değişiyordu. Burası çok önemli çocuklar, sakın unutmayın! Good night, iyi geceler demektir. Bu söz vedadır. Yeni gördüğünüz kişiye Good night demeyin.",
        concept: "Selam, günün saatine göre seçilir.",
        voice: "Hangi selamı neden seçtiğinizi kendi sözlerinizle söylersiniz.",
        school:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde İngilizce selamı saate bağlıyoruz. Good morning sabah selamıdır. Good afternoon öğleden sonra selamıdır. Good evening akşam selamıdır. Hello her saatte kullanılır. Karşılık, duyulan selamın aynısıdır.\n\nHatırlarsanız, saat selamı seçiyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Sabah kapıda bir arkadaş duruyor. Siz Good morning dersiniz. Arkadaşınız da Good morning der.\n\nBurası çok önemli çocuklar, sakın unutmayın! Good night ilk selam değildir. Good night, ayrılırken söylenen iyi geceler sözüdür. Akşam ilk görüşte Good evening dersiniz.",
        life:
          "Sevgili çocuklar, sabah okul kapısında Good morning dersiniz. Öğleden sonra derse girerken Good afternoon dersiniz. Akşam komşuya Good evening dersiniz. Hatırlarsanız, Hello her saatte duruyordu. Telefonda da aynı sözler kullanılır. Burası çok önemli çocuklar, sakın unutmayın! Uyku vaktinde vedalaşırken Good night dersiniz. O söz, yeni bir selamın yerine geçmez.",
        outcomes: [
          "Good morning sabah selamıdır.",
          "Good afternoon öğleden sonra selamıdır.",
          "Good evening akşam selamıdır.",
          "Good night vedadır. İlk selam değildir.",
        ],
        steps: [
          "Selam konusu açıldı. Henüz söz seçilmedi.",
          "Good morning, günaydın demektir.",
          "Good afternoon, öğleden sonranın selamıdır.",
          "Good evening, akşamın selamıdır.",
          "Hello her saatte söylenir.",
          "Karşılık, duyulan selamın aynısıdır.",
          "Soru: Akşam ilk görüşte hangi selamı seçersiniz?",
          "Çözüm: Good evening dersiniz.",
          "Tuzak: Good night vedadır. İlk selam diye kullanmayın.",
        ],
      }),
      lesson({
        key: "jr_06_ing-2",
        title: "Adını sormak",
        teaser:
          "What's your name, adını sorar. My name is, adını söyler. Kavramsal Anlayış, soru ile cevabı ayırır. İfade Gücü, adınızı tam kalıpla kurmanızdır.",
        hello: "Sevgili çocuklar merhaba! Bugünkü dersimizde İngilizcede ad sormayı öğreneceğiz.",
        middle:
          "What's your name sorusu, adın ne demektir. What is your name da aynı sorudur. Kısaltılmış hali sınıfta daha çok duyulur. Cevap My name is ile başlar. Ardından adınız gelir. Hadi şimdi ekrandaki çizime birlikte bakalım! Arkadaşınız What's your name diyor. Siz My name is ile kendi adınızı söylüyorsunuz. Soru adı ister. Cevap adı verir. Hatırlarsanız, selam önce gelmişti. Önce selam verirsiniz. Sonra adı sorarsınız. Burası çok önemli çocuklar, sakın unutmayın! Yalnız Name is demeyin. My name is ile başlayın. Soruyu cevap sanmayın.",
        concept: "Soru adı ister. Cevap, My name is ile adı söyler.",
        voice: "Adınızı tam kalıpla nasıl kurduğunuzu söylersiniz.",
        school:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde ad sorma kalıbı var. What's your name, adın ne demektir. What is your name aynı sorudur. Cevap My name is ile kurulur. Kalıbın ardına ad gelir. Selam, sorudan önce durur.\n\nHatırlarsanız, selam saate göre seçiliyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Good morning densin. Sonra What's your name densin. Cevap My name is ve ad olsun.\n\nBurası çok önemli çocuklar, sakın unutmayın! Name is tek başına cevap olmaz. My sözü düşerse cümle eksik kalır. Soruyu tekrar etmek, adınızı söylemek değildir.",
        life:
          "Sevgili çocuklar, yeni bir öğrenci sınıfa gelince önce selam verirsiniz. Sonra What's your name diye sorarsınız. O da My name is ile adını söyler. Hatırlarsanız, soru ile cevap ayrıydı. Siz de kendi adınızı aynı kalıpla söylersiniz. Burası çok önemli çocuklar, sakın unutmayın! Yalnız adınızı fısıldamak kalıbı öğretmez. My name is cümlesini kurun.",
        outcomes: [
          "What's your name, adını sorar.",
          "My name is, adını söyler.",
          "What is your name ile What's your name aynı sorudur.",
        ],
        steps: [
          "Ad sorma konusu açıldı.",
          "What's your name, adın ne demektir.",
          "What is your name aynı sorudur.",
          "Cevap My name is ile başlar.",
          "Ad, kalıbın ardına gelir.",
          "Önce selam, sonra ad sorusu gelir.",
          "Soru: Adınızı nasıl söylersiniz?",
          "Çözüm: My name is ve adınız.",
          "Tuzak: Name is tek başına cevap değildir.",
        ],
      }),
    ],
  },
  {
    slug: "jr_06_alm",
    code: "JR-06-ALM",
    title: "Almanca",
    subject: "Almanca",
    grade: JUNIOR_PILOT_GRADE,
    track: "elective",
    lessons: [
      lesson({
        key: "jr_06_alm-1",
        title: "Günün selamı",
        teaser:
          "Almanca selam da saate bakar. Kavramsal Anlayış, Guten Morgen ile Guten Abend farkını söyler. İfade Gücü, seçtiğiniz selamı neden o saate bağladığınızı anlatmanızdır.",
        hello: "Sevgili çocuklar merhaba! Bugünkü dersimizde Almancada selamlaşmayı öğreneceğiz.",
        middle:
          "Sabah Guten Morgen dersiniz. Bu söz, günaydın demektir. Gün içinde Guten Tag dersiniz. Bu söz, iyi günler demektir. Akşam Guten Abend dersiniz. Hallo, her saatte söylenebilir. Hallo, merhaba demektir. Hadi şimdi ekrandaki çizime birlikte bakalım! Sabah bir komşu duruyor. Siz Guten Morgen diyorsunuz. O da aynı sözle karşılık veriyor. Hatırlarsanız, selam saati gösteriyordu. Burası çok önemli çocuklar, sakın unutmayın! Gute Nacht, iyi geceler demektir. Bu söz vedadır. İlk karşılaşmada Gute Nacht demeyin.",
        concept: "Almanca selam, günün saatine göre seçilir.",
        voice: "Seçtiğiniz selamı hangi saate bağladığınızı söylersiniz.",
        school:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde Almanca selamı saate bağlıyoruz. Guten Morgen sabah selamıdır. Guten Tag gün içinin selamıdır. Guten Abend akşam selamıdır. Hallo her saatte kullanılır. Karşılık, duyulan selamın aynısıdır.\n\nHatırlarsanız, saat sözü seçiyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Öğle vakti bir arkadaş duruyor. Siz Guten Tag dersiniz.\n\nBurası çok önemli çocuklar, sakın unutmayın! Gute Nacht ilk selam değildir. Ayrılırken söylenir. Akşam ilk görüşte Guten Abend dersiniz.",
        life:
          "Sevgili çocuklar, sabah serviste Guten Morgen dersiniz. Okul günü içinde Guten Tag dersiniz. Akşam bakkala girerken Guten Abend dersiniz. Hatırlarsanız, Hallo her saatte duruyordu. Burası çok önemli çocuklar, sakın unutmayın! Uyku vaktinde Gute Nacht dersiniz. O söz, kapıdaki ilk selamın yerine geçmez.",
        outcomes: [
          "Guten Morgen sabah selamıdır.",
          "Guten Tag gün içinin selamıdır.",
          "Guten Abend akşam selamıdır.",
          "Gute Nacht vedadır.",
        ],
        steps: [
          "Almanca selam açıldı.",
          "Guten Morgen, günaydın demektir.",
          "Guten Tag, iyi günler demektir.",
          "Guten Abend, iyi akşamlar demektir.",
          "Hallo her saatte söylenir.",
          "Karşılık aynı selamla verilir.",
          "Soru: Öğle vakti hangi selamı seçersiniz?",
          "Çözüm: Guten Tag dersiniz.",
          "Tuzak: Gute Nacht ilk selam değildir.",
        ],
      }),
      lesson({
        key: "jr_06_alm-2",
        title: "Adını söylemek",
        teaser:
          "Wie heißt du, adını sorar. Ich heiße, adını söyler. Kavramsal Anlayış, soru cümlesi ile cevap cümlesini ayırır. İfade Gücü, adınızı Ich heiße ile kurmanızdır.",
        hello: "Sevgili çocuklar merhaba! Bugünkü dersimizde Almancada ad sormayı öğreneceğiz.",
        middle:
          "Wie heißt du sorusu, adın ne demektir. Cevap Ich heiße ile başlar. Ardından adınız gelir. Hadi şimdi ekrandaki çizime birlikte bakalım! Arkadaşınız Wie heißt du diyor. Siz Ich heiße ile kendi adınızı söylüyorsunuz. Soru bekler. Cevap adı koyar. Hatırlarsanız, önce selam verilmişti. Guten Tag dedikten sonra adı sorarsınız. Burası çok önemli çocuklar, sakın unutmayın! Heiße tek başına cevap olmaz. Ich heiße ile başlayın. Sorudaki du sözünü cevapta kullanmayın.",
        concept: "Wie heißt du adı sorar. Ich heiße adı söyler.",
        voice: "Adınızı Ich heiße kalıbıyla nasıl kurduğunuzu söylersiniz.",
        school:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde Almanca ad kalıbı var. Wie heißt du, adın ne demektir. Cevap Ich heiße ile kurulur. Ad, kalıbın ardına gelir. Selam, sorudan önce durur.\n\nHatırlarsanız, Guten Tag gün içinin selamıydı. Hadi şimdi ekrandaki çizime birlikte bakalım! Önce Guten Tag. Sonra Wie heißt du. Cevap Ich heiße ve ad.\n\nBurası çok önemli çocuklar, sakın unutmayın! Heiße sözünü yalnız bırakmayın. Ich düşerse cümle eksik kalır. Soruyu aynen tekrar etmek ad söylemek değildir.",
        life:
          "Sevgili çocuklar, yaz kursunda yeni bir arkadaşla karşılaşırsınız. Önce selam verirsiniz. Sonra Wie heißt du diye sorarsınız. O da Ich heiße ile adını söyler. Hatırlarsanız, soru ile cevap ayrıydı. Siz de kendi adınızı aynı kalıpla söylersiniz. Burası çok önemli çocuklar, sakın unutmayın! Yalnız adınızı söylemek kalıbı eksik bırakır.",
        outcomes: ["Wie heißt du, adını sorar.", "Ich heiße, adını söyler."],
        steps: [
          "Ad sorma konusu açıldı.",
          "Wie heißt du, adın ne demektir.",
          "Cevap Ich heiße ile başlar.",
          "Ad, kalıbın ardına gelir.",
          "Önce selam verilir.",
          "Sonra ad sorulur.",
          "Soru: Adınızı Almanca nasıl söylersiniz?",
          "Çözüm: Ich heiße ve adınız.",
          "Tuzak: Heiße tek başına cevap değildir.",
        ],
      }),
    ],
  },
  {
    slug: "jr_06_fra",
    code: "JR-06-FRA",
    title: "Fransızca",
    subject: "Fransızca",
    grade: JUNIOR_PILOT_GRADE,
    track: "elective",
    lessons: [
      lesson({
        key: "jr_06_fra-1",
        title: "Bonjour demek",
        teaser:
          "Bonjour, gün içinin selamıdır. Bonsoir, akşam selamıdır. Kavramsal Anlayış, bu iki sözü saate göre ayırır. İfade Gücü, hangisini neden seçtiğinizi söylemenizdir.",
        hello: "Sevgili çocuklar merhaba! Bugünkü dersimizde Fransızcada selamlaşmayı öğreneceğiz.",
        middle:
          "Bonjour, günaydın ve iyi günler yerinde durur. Sabah ve gün içinde Bonjour dersiniz. Akşam Bonsoir dersiniz. Salut, arkadaş arasında merhaba demektir. Salut her saatte söylenebilir. Büyük bir kişiye önce Bonjour demek daha uygundur. Hadi şimdi ekrandaki çizime birlikte bakalım! Öğretmen kapıda duruyor. Siz Bonjour diyorsunuz. Öğretmen de Bonjour diyor. Hatırlarsanız, selam saate bakıyordu. Burası çok önemli çocuklar, sakın unutmayın! Bonne nuit, iyi geceler demektir. Bu söz vedadır. İlk görüşte Bonne nuit demeyin.",
        concept: "Bonjour gün içine, Bonsoir akşama aittir.",
        voice: "Hangi selamı hangi saate bağladığınızı söylersiniz.",
        school:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde Fransızca selamı saate bağlıyoruz. Bonjour sabah ve gün içi selamıdır. Bonsoir akşam selamıdır. Salut arkadaş selamıdır. Büyük bir kişiye Bonjour daha uygundur. Karşılık, duyulan selamın aynısıdır.\n\nHatırlarsanız, saat sözü seçiyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Akşam bir komşu duruyor. Siz Bonsoir dersiniz.\n\nBurası çok önemli çocuklar, sakın unutmayın! Bonne nuit ilk selam değildir. Ayrılırken söylenir. Akşam ilk görüşte Bonsoir dersiniz.",
        life:
          "Sevgili çocuklar, sabah derse girerken Bonjour dersiniz. Akşam aile büyüğüne Bonsoir dersiniz. Yakın arkadaşınıza Salut diyebilirsiniz. Hatırlarsanız, büyük kişiye Bonjour daha uygundu. Burası çok önemli çocuklar, sakın unutmayın! Uyku vaktinde Bonne nuit dersiniz. O söz, kapıdaki ilk selam değildir.",
        outcomes: [
          "Bonjour gün içinin selamıdır.",
          "Bonsoir akşam selamıdır.",
          "Bonne nuit vedadır.",
        ],
        steps: [
          "Fransızca selam açıldı.",
          "Bonjour, gün içinin selamıdır.",
          "Bonsoir, akşam selamıdır.",
          "Salut, arkadaş selamıdır.",
          "Büyük kişiye Bonjour uygundur.",
          "Karşılık aynı selamla verilir.",
          "Soru: Akşam ilk görüşte ne dersiniz?",
          "Çözüm: Bonsoir dersiniz.",
          "Tuzak: Bonne nuit ilk selam değildir.",
        ],
      }),
      lesson({
        key: "jr_06_fra-2",
        title: "Adını sormak",
        teaser:
          "Comment tu t'appelles, adını sorar. Je m'appelle, adını söyler. Kavramsal Anlayış, soru ile cevabı ayırır. İfade Gücü, adınızı Je m'appelle ile kurmanızdır.",
        hello: "Sevgili çocuklar merhaba! Bugünkü dersimizde Fransızcada ad sormayı öğreneceğiz.",
        middle:
          "Comment tu t'appelles sorusu, adın ne demektir. Cevap Je m'appelle ile başlar. Ardından adınız gelir. Hadi şimdi ekrandaki çizime birlikte bakalım! Arkadaşınız soruyu soruyor. Siz Je m'appelle ile kendi adınızı söylüyorsunuz. Soru ad bekler. Cevap adı koyar. Hatırlarsanız, önce Bonjour denmişti. Selamdan sonra adı sorarsınız. Burası çok önemli çocuklar, sakın unutmayın! Appelle tek başına cevap olmaz. Je m'appelle ile başlayın. Sorudaki tu sözünü cevapta bırakmayın.",
        concept: "Soru adı ister. Je m'appelle adı söyler.",
        voice: "Adınızı Je m'appelle kalıbıyla nasıl kurduğunuzu söylersiniz.",
        school:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde Fransızca ad kalıbı var. Comment tu t'appelles, adın ne demektir. Cevap Je m'appelle ile kurulur. Ad, kalıbın ardına gelir. Selam, sorudan önce durur.\n\nHatırlarsanız, Bonjour gün içinin selamıydı. Hadi şimdi ekrandaki çizime birlikte bakalım! Önce Bonjour. Sonra Comment tu t'appelles. Cevap Je m'appelle ve ad.\n\nBurası çok önemli çocuklar, sakın unutmayın! M'appelle sözünü yalnız bırakmayın. Je düşerse cümle eksik kalır. Soruyu tekrar etmek, adınızı söylemek değildir.",
        life:
          "Sevgili çocuklar, yeni bir grupta önce Bonjour dersiniz. Sonra Comment tu t'appelles diye sorarsınız. Karşınızdaki Je m'appelle ile adını söyler. Hatırlarsanız, soru ile cevap ayrıydı. Siz de kendi adınızı aynı kalıpla söylersiniz. Burası çok önemli çocuklar, sakın unutmayın! Yalnız adınızı söylemek cümleyi eksik bırakır.",
        outcomes: ["Comment tu t'appelles, adını sorar.", "Je m'appelle, adını söyler."],
        steps: [
          "Ad sorma konusu açıldı.",
          "Comment tu t'appelles, adın ne demektir.",
          "Cevap Je m'appelle ile başlar.",
          "Ad, kalıbın ardına gelir.",
          "Önce Bonjour denir.",
          "Sonra ad sorulur.",
          "Soru: Adınızı Fransızca nasıl söylersiniz?",
          "Çözüm: Je m'appelle ve adınız.",
          "Tuzak: Appelle tek başına cevap değildir.",
        ],
      }),
    ],
  },
  {
    slug: "jr_06_siyer",
    code: "JR-06-SIY",
    title: "Siyer-i Nebi",
    subject: "Siyer",
    grade: JUNIOR_PILOT_GRADE,
    track: "elective",
    lessons: [
      lesson({
        key: "jr_06_siyer-1",
        title: "Doğru söz",
        teaser:
          "Doğru söz, söylenen ile yapılanın aynı olmasıdır. Kavramsal Anlayış, doğru sözü işine geleni söylemekten ayırır. İfade Gücü, bir örnekte söz ile işin nasıl birleştiğini anlatmanızdır.",
        hello:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde siyerde doğru sözü öğreneceğiz.",
        middle:
          "Siyer, Peygamberimizin hayatını güvenilir haberlerle anlatan derstir. Bu derste bir huyu adıyla öğreniriz. Doğru söz, ağzından çıkan ile elinin yaptığı aynı olunca durur. Söz başka, iş başka olursa doğru söz bozulur. Hadi şimdi ekrandaki çizime birlikte bakalım! Bir kalem size emanet edildi. Sözünüz şudur. Kalemi sahibine geri vereceğim. İşi de budur. Kalemi sahibine verirsiniz. Söz ile iş birleşir. Hatırlarsanız, doğru söz bu birleşmeydi. Burası çok önemli çocuklar, sakın unutmayın! İşinize gelen cümle, doğru söz sayılmaz. Emaneti gizlerseniz sözünüz bozulur.",
        concept: "Doğru söz, söylenen ile yapılanın aynı olmasıdır.",
        voice: "Örnekte söz ile işin nasıl birleştiğini adım adım söylersiniz.",
        school:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde doğru sözü tanımlıyoruz. Siyer, Peygamberimizin hayatını anlatan derstir. Doğru söz, söylenen cümle ile yapılan işin aynı olmasıdır. Söz tutulursa doğru söz durur. Söz tutulmazsa doğru söz bozulur.\n\nHatırlarsanız, emanet geri verilmişti. Hadi şimdi ekrandaki çizime birlikte bakalım! Kalem size bırakıldı. Kalemi sahibine geri verdiniz. Sözünüz ile işiniz birleşti.\n\nBurası çok önemli çocuklar, sakın unutmayın! Doğru söz, hoşa giden cümle değildir. Emaneti saklamak doğru sözü bozar. Başkasının eşyasını kendinizinki gibi tutmayın.",
        life:
          "Sevgili çocuklar, arkadaşınızın silgisini ödünç aldıysanız geri verirsiniz. Veririm dediyseniz o gün getirirsiniz. Hatırlarsanız, söz ile iş aynı olmalıydı. Evde de aynı kural durur. Burası çok önemli çocuklar, sakın unutmayın! Unuttum demek, tutmadığınız sözü doğru yapmaz.",
        outcomes: [
          "Siyer, Peygamberimizin hayatını anlatan derstir.",
          "Doğru söz, söylenen ile yapılanın aynı olmasıdır.",
          "Emanet, sahibine geri verilir.",
        ],
        steps: [
          "Siyer defteri açıldı.",
          "Doğru söz, söz ile işin birleşmesidir.",
          "Bir kalem emanet duruyor.",
          "Söz: Kalemi sahibine vereceğim.",
          "İş: Kalem sahibine gider.",
          "Söz ile iş aynıysa doğru söz durur.",
          "Soru: Emanet kalem ne yapılır?",
          "Çözüm: Sahibine geri verilir.",
          "Tuzak: İşine gelen cümle doğru söz değildir.",
        ],
      }),
      lesson({
        key: "jr_06_siyer-2",
        title: "Merhamet",
        teaser:
          "Merhamet, gücün varken incitmemektir. Kavramsal Anlayış, yardımı yanlış işi örtmekten ayırır. İfade Gücü, kime neden yardım ettiğinizi söylemenizdir.",
        hello: "Sevgili çocuklar merhaba! Bugünkü dersimizde merhameti öğreneceğiz.",
        middle:
          "Merhamet, karşınızdaki kişiyi incitmemektir. Gücünüz yettiği halde sertleşmemektir. Yardım, merhametin görünen işidir. Hadi şimdi ekrandaki çizime birlikte bakalım! Yaşlı bir komşu poşeti zor taşıyor. Siz poşeti birlikte tutuyorsunuz. Kişiyi incitmediniz. İşini hafiflettiniz. Hatırlarsanız, doğru söz söz ile işi birleştiriyordu. Merhamet de işte görünür. Burası çok önemli çocuklar, sakın unutmayın! Merhamet, yanlış bir işi alkışlamak değildir. Kişiye yardım edersiniz. Haksız işi doğru diye örtmezsiniz.",
        concept: "Merhamet, gücün varken incitmemektir.",
        voice: "Kime neden yardım ettiğinizi kendi sözlerinizle söylersiniz.",
        school:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde merhameti tanımlıyoruz. Merhamet, bir kişiyi incitmemektir. Güç varken yumuşak davranmaktır. Yardım, bu huyun görünen işidir.\n\nHatırlarsanız, doğru söz işte görünüyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Komşu poşeti zor taşıyor. Poşeti birlikte tuttunuz. Kişiye yardım ettiniz.\n\nBurası çok önemli çocuklar, sakın unutmayın! Yanlış işi örtmek merhamet değildir. Alay etmek merhameti bozar. Yardım kişiye yapılır. Haksızlığa alkış tutulmaz.",
        life:
          "Sevgili çocuklar, sırada düşen bir çantayı kaldırırsınız. Küçük kardeşinizin ayakkabısını bağlarken acele ettirmezsiniz. Hatırlarsanız, merhamet incitmemekti. Oyunda da itmeden yer verirsiniz. Burası çok önemli çocuklar, sakın unutmayın! Bir arkadaşınızın yanlışını gizlemek, ona yardım sayılmaz. Yanlışı nazikçe söylersiniz.",
        outcomes: [
          "Merhamet, gücün varken incitmemektir.",
          "Yardım, merhametin görünen işidir.",
          "Yanlış işi örtmek merhamet değildir.",
        ],
        steps: [
          "Merhamet konusu açıldı.",
          "Merhamet, incitmemektir.",
          "Güç varken yumuşak davranılır.",
          "Komşu poşeti zor taşıyor.",
          "Poşet birlikte tutulur.",
          "Yardım kişiye yapılır.",
          "Soru: Düşen çanta ne yapılır?",
          "Çözüm: Çanta kaldırılır. Kişi incitilmez.",
          "Tuzak: Yanlış işi örtmek merhamet değildir.",
        ],
      }),
    ],
  },
  {
    slug: "jr_06_kod",
    code: "JR-06-KOD",
    title: "Bilgisayar Bilimi / Kodlama",
    subject: "Bilgisayar Bilimi",
    grade: JUNIOR_PILOT_GRADE,
    track: "elective",
    lessons: [
      lesson({
        key: "jr_06_kod-1",
        title: "Komut sırası",
        teaser:
          "Bilgisayar, komutları yukarıdan aşağı yapar. Kavramsal Anlayış, sıranın sonucu değiştirdiğini söyler. İfade Gücü, hangi adımın önce geldiğini anlatmanızdır.",
        hello:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde komut sırasını öğreneceğiz.",
        middle:
          "Bir komut, bilgisayara verilen tek iştir. Bilgisayar bu işleri yazıldıkları sırayla yapar. İlk satır önce çalışır. Son satır en son çalışır. Sıra değişirse sonuç değişir. Hadi şimdi ekrandaki çizime birlikte bakalım! Üç komut duruyor. Bardağı tut. Musluğu aç. Bardak dolunca musluğu kapat. Bu sıra suyu bardağa koyar. Musluğu önce açarsanız su yere dökülür. Hatırlarsanız, sıra sonucu belirliyordu. Burası çok önemli çocuklar, sakın unutmayın! Komutları karışık okumayın. Yukarıdan aşağı gidin. Bir adımı atlamak da sırayı bozar.",
        concept: "Bilgisayar, komutları yukarıdan aşağı yapar.",
        voice: "Hangi adımın neden önce geldiğini söylersiniz.",
        school:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde komut sırasını kuruyoruz. Komut, tek bir iştir. Bilgisayar komutları yukarıdan aşağı çalıştırır. Sıra değişirse sonuç değişir. Atlanan adım da sonucu bozar.\n\nHatırlarsanız, bardak önce tutulmuştu. Hadi şimdi ekrandaki çizime birlikte bakalım! Birinci komut bardağı tutmaktır. İkinci komut musluğu açmaktır. Üçüncü komut musluğu kapatmaktır. Su bardakta kalır.\n\nBurası çok önemli çocuklar, sakın unutmayın! Musluğu ilk adım yapmayın. Su yere dökülür. Komutları ezberlemek yetmez. Sırayı söylemek gerekir.",
        life:
          "Sevgili çocuklar, diş fırçalarken önce suyu alırsınız. Sonra macunu sürersiniz. Sonra fırçalarsınız. Sıra değişirse iş karışır. Hatırlarsanız, bilgisayar da adımları sırayla yapıyordu. Yemek tarifi de aynı kuraldır. Burası çok önemli çocuklar, sakın unutmayın! İlk adımı atlarsanız sonraki adım boşa düşer.",
        outcomes: [
          "Komut, tek bir iştir.",
          "Bilgisayar komutları yukarıdan aşağı yapar.",
          "Sıra değişirse sonuç değişir.",
        ],
        steps: [
          "Üç boş satır duruyor.",
          "Komut, tek bir iştir.",
          "Birinci komut: Bardağı tut.",
          "İkinci komut: Musluğu aç.",
          "Üçüncü komut: Musluğu kapat.",
          "Sıra yukarıdan aşağı okunur.",
          "Soru: Musluk önce açılırsa ne olur?",
          "Çözüm: Su yere dökülür. Bardak önce tutulur.",
          "Tuzak: Komutları karışık okumayın.",
        ],
      }),
      lesson({
        key: "jr_06_kod-2",
        title: "Hatalı adımı bulmak",
        teaser:
          "Hata, beklenen sonuç ile olan sonucun ayrıldığı yerdir. Kavramsal Anlayış, yanlış adımı bütün listeden ayırır. İfade Gücü, hangi satırın bozuk olduğunu söylemenizdir.",
        hello:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde hatalı adımı bulmayı öğreneceğiz.",
        middle:
          "Beklediğiniz sonuç ile ekrandaki sonuç aynı değilse bir hata vardır. Hatayı bulmak için satırları tek tek okursunuz. Bozuk olan satırı işaretlersiniz. Sağlam satırı silmezsiniz. Hadi şimdi ekrandaki çizime birlikte bakalım! Üç komut var. Bardağı tut. Bardağı bırak. Musluğu aç. Su yere dökülür. Hata ikinci satırdadır. Bardağı bırakmak, suyu tutmaz. O satır bardağı tut olarak düzelir. Hatırlarsanız, sıra yukarıdan aşağıydı. Burası çok önemli çocuklar, sakın unutmayın! Bütün listeyi silmek ilk iş değildir. Önce yanlış satırı gösterin. Sonra o satırı düzeltin.",
        concept: "Hata, beklenen sonuç ile olan sonucun ayrıldığı satırdır.",
        voice: "Hangi satırın bozuk olduğunu ve nedenini söylersiniz.",
        school:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde hatalı adımı arıyoruz. Beklenen sonuç ile olan sonuç farklıysa hata vardır. Satırlar tek tek okunur. Bozuk satır işaretlenir. Sağlam satır durur.\n\nHatırlarsanız, bardak önce tutulmalıydı. Hadi şimdi ekrandaki çizime birlikte bakalım! İkinci satır bardağı bırak diyor. Su dökülüyor. Hata ikinci satırdadır. Düzeltme şudur. Bardağı tut.\n\nBurası çok önemli çocuklar, sakın unutmayın! Bütün komutları silmeyin. İlk satır sağlamsa ona dokunmayın. Hatayı göstermeden düzeltme olmaz.",
        life:
          "Sevgili çocuklar, kek tarifi sırasını okursunuz. Şeker unutulmuşsa hata o satırdadır. Bütün tarifi çöpe atmazsınız. Eksik satırı eklersiniz. Hatırlarsanız, sağlam adım duruyordu. Ödev adımlarında da aynı işi yaparsınız. Burası çok önemli çocuklar, sakın unutmayın! Sonucu beğenmemek yetmez. Bozuk adımı adıyla söyleyin.",
        outcomes: [
          "Hata, beklenen sonuç ile olan sonuç aynı değilse aranır.",
          "Bozuk satır işaretlenir.",
          "Sağlam satır silinmez.",
        ],
        steps: [
          "Üç komut yazılı duruyor.",
          "Beklenen sonuç: Su bardakta kalsın.",
          "Olan sonuç: Su yere döküldü.",
          "Satırlar tek tek okunur.",
          "İkinci satır bardağı bırak diyor.",
          "Hata ikinci satırdadır.",
          "Soru: Hangi satır düzeltilir?",
          "Çözüm: İkinci satır, bardağı tut olur.",
          "Tuzak: Bütün listeyi silmeyin.",
        ],
      }),
    ],
  },
  {
    slug: "jr_06_arp",
    code: "JR-06-ARP",
    title: "Seçmeli Arapça",
    subject: "Arapça",
    grade: JUNIOR_PILOT_GRADE,
    track: "elective",
    lessons: [
      lesson({
        key: "jr_06_arp-1",
        title: "Selam vermek",
        teaser:
          "Selamün aleyküm, barış üzerine olsun demektir. Kavramsal Anlayış, selam ile karşılığını ayırır. İfade Gücü, duyduğunuz selama hangi sözle döndüğünüzü söylemenizdir.",
        hello: "Sevgili çocuklar merhaba! Bugünkü dersimizde Arapçada selamı öğreneceğiz.",
        middle:
          "Selamün aleyküm, barış üzerine olsun demektir. Bu söz bir kişiye esenlik diler. Karşılık Ve aleyküm selamdır. Bu söz, size de barış olsun demektir. Hadi şimdi ekrandaki çizime birlikte bakalım! Kapıda bir kişi duruyor. O, Selamün aleyküm diyor. Siz, Ve aleyküm selam diyorsunuz. Selam gider. Karşılık gelir. Hatırlarsanız, selam tek başına bitmiyordu. Burası çok önemli çocuklar, sakın unutmayın! Selamı duyup susmayın. Karşılığı söyleyin. İki sözün yerini değiştirmeyin. Önce selam verilir. Sonra karşılık söylenir.",
        concept: "Selamün aleyküm esenlik diler. Ve aleyküm selam karşılıktır.",
        voice: "Duyduğunuz selama hangi sözle döndüğünüzü söylersiniz.",
        school:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde Arapça selamı kuruyoruz. Selamün aleyküm, barış üzerine olsun demektir. Ve aleyküm selam, karşılık sözüdür. Selam önce söylenir. Karşılık sonra söylenir.\n\nHatırlarsanız, selam tek yönlü değildi. Hadi şimdi ekrandaki çizime birlikte bakalım! Gelen söz Selamün aleykümdür. Dönen söz Ve aleyküm selamdır.\n\nBurası çok önemli çocuklar, sakın unutmayın! Karşılığı susarak geçmeyin. İki cümleyi aynı ağızdan tek selam sanmayın. Önce gelen sözü dinleyin. Sonra karşılığı söyleyin.",
        life:
          "Sevgili çocuklar, cami çıkışında ya da bir büyük ziyaretinde bu selamı duyarsınız. Siz de Ve aleyküm selam dersiniz. Hatırlarsanız, karşılık ayrı bir sözdü. Evde misafire de aynı düzen durur. Burası çok önemli çocuklar, sakın unutmayın! Selamı yarıda kesip başka söze atlamayın.",
        outcomes: [
          "Selamün aleyküm, barış üzerine olsun demektir.",
          "Ve aleyküm selam, selamın karşılığıdır.",
          "Önce selam verilir. Sonra karşılık söylenir.",
        ],
        steps: [
          "Selam konusu açıldı.",
          "Selamün aleyküm, barış üzerine olsun demektir.",
          "Bu söz esenlik diler.",
          "Karşılık Ve aleyküm selamdır.",
          "Karşılık, size de barış olsun demektir.",
          "Önce selam, sonra karşılık gelir.",
          "Soru: Selamün aleyküm duyunca ne dersiniz?",
          "Çözüm: Ve aleyküm selam dersiniz.",
          "Tuzak: Selamı duyup susmayın.",
        ],
      }),
      lesson({
        key: "jr_06_arp-2",
        title: "Sağdan sola okumak",
        teaser:
          "Arapça satır sağdan sola okunur. Kavramsal Anlayış, yönü ve ilk iki harfin sesini söyler. İfade Gücü, kelimeyi hangi yönden okuduğunuzu anlatmanızdır.",
        hello:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde Arapçada okuma yönünü öğreneceğiz.",
        middle:
          "Arapça satır sağdan sola gider. İlk harf sağda durur. Son harf solda durur. Elif, uzun a sesini taşır. Be, b sesidir. Hadi şimdi ekrandaki çizime birlikte bakalım! Kapı anlamına gelen bab sözü üç harftir. Sağda be durur. Ortada elif durur. Solda yine be durur. Okuyuş b, uzun a, b diye gider. Hatırlarsanız, selam da bir sıra ile söylenmişti. Harf de sırayla okunur. Burası çok önemli çocuklar, sakın unutmayın! Satırı soldan sağa okumayın. Yön değişirse kelime değişir. Elif ile be sesini birbirine karıştırmayın.",
        concept: "Arapça satır sağdan sola okunur.",
        voice: "Kelimeyi hangi yönden ve hangi seslerle okuduğunuzu söylersiniz.",
        school:
          "Sevgili çocuklar merhaba! Bugünkü dersimizde okuma yönünü kuruyoruz. Arapça yazı sağdan sola okunur. İlk harf sağdadır. Elif, uzun a sesini taşır. Be, b sesidir.\n\nHatırlarsanız, sıra sözü belirliyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Bab, kapı demektir. Sağdan sola be, elif, be okunur. Ses b, uzun a, b olur.\n\nBurası çok önemli çocuklar, sakın unutmayın! Soldan sağa okumak yönü bozar. Elif, b sesi değildir. Be, uzun a sesi değildir. Harfi sesiyle birlikte söyleyin.",
        life:
          "Sevgili çocuklar, bir tabelada Arapça bir söz görürseniz okumaya sağdan başlarsınız. Hatırlarsanız, ilk harf sağda duruyordu. Defterde de satırı sağdan kurarsınız. Burası çok önemli çocuklar, sakın unutmayın! Türkçe satır gibi soldan başlamayın. Yön ayrıdır.",
        outcomes: [
          "Arapça satır sağdan sola okunur.",
          "Elif, uzun a sesini taşır.",
          "Be, b sesidir.",
        ],
        steps: [
          "Boş bir satır duruyor. Yön henüz yok.",
          "Arapça satır sağdan sola okunur.",
          "İlk harf sağda durur.",
          "Elif, uzun a sesini taşır.",
          "Be, b sesidir.",
          "Bab sözü sağdan sola be, elif, be diye okunur.",
          "Soru: Bab kelimesine hangi yönden başlarsınız?",
          "Çözüm: Sağdan. Ses b, uzun a, b olur.",
          "Tuzak: Soldan sağa okumayın.",
        ],
      }),
    ],
  },
] as const satisfies readonly JuniorElectiveCourse[];
