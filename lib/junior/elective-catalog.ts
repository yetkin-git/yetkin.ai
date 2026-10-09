import { type JuniorHintKind } from "@/lib/junior/content-rules";
import { JUNIOR_COURSE_TITLES } from "@/lib/junior/human-titles";
import { JUNIOR_ELECTIVE_SLUGS, JUNIOR_PILOT_GRADE } from "@/lib/junior/limits";
import { juniorLessonFromScenario } from "@/lib/junior/scenario";
import type { JuniorLessonScript } from "@/lib/junior/types";

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

function lessonWarning(middle: string, hint: JuniorHintKind): string {
  const marker = hint === "gold" ? "Altın İpucu!" : "Tuzaklara Düşme!";
  const at = middle.indexOf(marker);
  const rest = at < 0 ? "" : middle.slice(at + marker.length).replace(/Birlikte bakalım\./gu, "").trim();
  const sentence = rest.split(/(?<=\p{L}[.!?…])\s+/u)[0]?.trim() ?? "";
  if (sentence.length > 24) {
    return sentence;
  }
  return hint === "gold"
    ? "Bu küçük ayrımı bir kez görünce kolayca seçersin."
    : "Bu noktada acele etme. Bir kez daha bakıp doğru kutuyu seçersin.";
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
}): JuniorLessonScript {
  const hint: JuniorHintKind =
  input.middle.includes("Altın İpucu!") || input.school.includes("Altın İpucu!") ? "gold" : "trap";
  const first = input.outcomes[0] ?? input.concept;
  const second = input.outcomes[1] ?? input.voice;
  const third = input.outcomes[2] ?? input.concept;
  return juniorLessonFromScenario({
    key: input.key,
    title: input.title,
    teaser: input.teaser,
    welcome: input.hello,
    concept: input.school,
    example: input.middle,
    hint,
    warning: lessonWarning(input.middle, hint),
    life: input.life,
    recap: [first, second, third],
    conceptSeal: input.concept,
    voiceSeal: input.voice,
    outcomes: input.outcomes,
    scene: "elective",
    band: "draft",
  });
}

export const JUNIOR_ELECTIVE_COURSES = [
{
  slug: "jr_06_ing",
  code: "JR-06-ING",
  title: JUNIOR_COURSE_TITLES.jr_06_ing,
  subject: "İngilizce",
  grade: JUNIOR_PILOT_GRADE,
  track: "elective",
  lessons: [
  lesson({
    key: "jr_06_ing-1",
    title: "Saate göre selam",
    teaser:
    "İngilizce selam, günün saatine göre seçilir. Kavramsal Anlayış, hangi selamın hangi saate ait olduğunu söyler. İfade Gücü, o selamı neden seçtiğini kendi sözlerinle anlatmandır.",
    hello:
    "Bugün seninle İngilizcede selamlaşmayı öğreneceğiz.",
    middle:
    "Sabah gördüğün kişiye Good morning dersin. Bu söz, günaydın demektir. Öğleden sonra Good afternoon dersin. Akşam Good evening dersin. Hello, her saatte söylenebilir. Hello, merhaba demektir. Hadi şimdi ekrandaki çizime birlikte bakalım! Karşında bir arkadaş duruyor. Sen Good morning diyorsun. O da Good morning diyor. Selamın karşılığı aynı selamdır. Hatırlarsan, selam saate göre değişiyordu. Tuzaklara Düşme! Birlikte bakalım. Good night, iyi geceler demektir. Bu söz vedadır. Yeni gördüğün kişiye Good night deme.",
    concept: "Selam, günün saatine göre seçilir.",
    voice: "Hangi selamı neden seçtiğini kendi sözlerinle söylersin.",
    school:
    "Bugün seninle İngilizce selamı saate bağlıyoruz. Good morning sabah selamıdır. Good afternoon öğleden sonra selamıdır. Good evening akşam selamıdır. Hello her saatte kullanılır. Karşılık, duyulan selamın aynısıdır.\n\nHatırlarsan, saat selamı seçiyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Sabah kapıda bir arkadaş duruyor. Sen Good morning dersin. Arkadaşın da Good morning der.\n\nTuzaklara Düşme! Birlikte bakalım. Good night ilk selam değildir. Good night, ayrılırken söylenen iyi geceler sözüdür. Akşam ilk görüşte Good evening dersin.",
    life:
    "Sabah okul kapısında Good morning dersin. Öğleden sonra derse girerken Good afternoon dersin. Akşam komşuya Good evening dersin. Hatırlarsan, Hello her saatte duruyordu. Telefonda da aynı sözler kullanılır. Tuzaklara Düşme! Birlikte bakalım. Uyku vaktinde vedalaşırken Good night dersin. O söz, yeni bir selamın yerine geçmez.",
    outcomes: [
    "Good morning sabah selamıdır.",
    "Good afternoon öğleden sonra selamıdır.",
    "Good evening akşam selamıdır.",
    "Good night vedadır. İlk selam değildir.",
    ],
  }),
  lesson({
    key: "jr_06_ing-2",
    title: "Adını sormak",
    teaser:
    "What's your name, adını sorar. My name is, adını söyler. Kavramsal Anlayış, soru ile cevabı ayırır. İfade Gücü, adını tam kalıpla kurmandır.",
    hello: "Bugün seninle İngilizcede ad sormayı öğreneceğiz.",
    middle:
    "What's your name sorusu, adın ne demektir. What is your name da aynı sorudur. Kısaltılmış hali sınıfta daha çok duyulur. Cevap My name is ile başlar. Ardından adın gelir. Hadi şimdi ekrandaki çizime birlikte bakalım! Arkadaşın What's your name diyor. Sen My name is ile kendi adını söylüyorsun. Soru adı ister. Cevap adı verir. Hatırlarsan, selam önce gelmişti. Önce selam verirsin. Sonra adı sorarsın. Tuzaklara Düşme! Birlikte bakalım. Yalnız Name is deme. My name is ile başla. Soruyu cevap sanma.",
    concept: "Soru adı ister. Cevap, My name is ile adı söyler.",
    voice: "Adını tam kalıpla nasıl kurduğunu söylersin.",
    school:
    "Bugün seninle ad sorma kalıbı var. What's your name, adın ne demektir. What is your name aynı sorudur. Cevap My name is ile kurulur. Kalıbın ardına ad gelir. Selam, sorudan önce durur.\n\nHatırlarsan, selam saate göre seçiliyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Good morning densin. Sonra What's your name densin. Cevap My name is ve ad olsun.\n\nTuzaklara Düşme! Birlikte bakalım. Name is tek başına cevap olmaz. My sözü düşerse cümle eksik kalır. Soruyu tekrar etmek, adını söylemek değildir.",
    life:
    "Yeni bir öğrenci sınıfa gelince önce selam verirsin. Sonra What's your name diye sorarsın. O da My name is ile adını söyler. Hatırlarsan, soru ile cevap ayrıydı. Sen de kendi adını aynı kalıpla söylersin. Tuzaklara Düşme! Birlikte bakalım. Yalnız adını fısıldamak kalıbı öğretmez. My name is cümlesini kur.",
    outcomes: [
    "What's your name, adını sorar.",
    "My name is, adını söyler.",
    "What is your name ile What's your name aynı sorudur.",
    ],
  }),
  ],
},
{
  slug: "jr_06_alm",
  code: "JR-06-ALM",
  title: JUNIOR_COURSE_TITLES.jr_06_alm,
  subject: "Almanca",
  grade: JUNIOR_PILOT_GRADE,
  track: "elective",
  lessons: [
  lesson({
    key: "jr_06_alm-1",
    title: "Günün selamı",
    teaser:
    "Almanca selam da saate bakar. Kavramsal Anlayış, Guten Morgen ile Guten Abend farkını söyler. İfade Gücü, seçtiğin selamı neden o saate bağladığını anlatmandır.",
    hello: "Bugün seninle Almancada selamlaşmayı öğreneceğiz.",
    middle:
    "Sabah Guten Morgen dersin. Bu söz, günaydın demektir. Gün içinde Guten Tag dersin. Bu söz, iyi günler demektir. Akşam Guten Abend dersin. Hallo, her saatte söylenebilir. Hallo, merhaba demektir. Hadi şimdi ekrandaki çizime birlikte bakalım! Sabah bir komşu duruyor. Sen Guten Morgen diyorsun. O da aynı sözle karşılık veriyor. Hatırlarsan, selam saati gösteriyordu. Tuzaklara Düşme! Birlikte bakalım. Gute Nacht, iyi geceler demektir. Bu söz vedadır. İlk karşılaşmada Gute Nacht deme.",
    concept: "Almanca selam, günün saatine göre seçilir.",
    voice: "Seçtiğin selamı hangi saate bağladığını söylersin.",
    school:
    "Bugün seninle Almanca selamı saate bağlıyoruz. Guten Morgen sabah selamıdır. Guten Tag gün içinin selamıdır. Guten Abend akşam selamıdır. Hallo her saatte kullanılır. Karşılık, duyulan selamın aynısıdır.\n\nHatırlarsan, saat sözü seçiyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Öğle vakti bir arkadaş duruyor. Sen Guten Tag dersin.\n\nTuzaklara Düşme! Birlikte bakalım. Gute Nacht ilk selam değildir. Ayrılırken söylenir. Akşam ilk görüşte Guten Abend dersin.",
    life:
    "Sabah serviste Guten Morgen dersin. Okul günü içinde Guten Tag dersin. Akşam bakkala girerken Guten Abend dersin. Hatırlarsan, Hallo her saatte duruyordu. Tuzaklara Düşme! Birlikte bakalım. Uyku vaktinde Gute Nacht dersin. O söz, kapıdaki ilk selamın yerine geçmez.",
    outcomes: [
    "Guten Morgen sabah selamıdır.",
    "Guten Tag gün içinin selamıdır.",
    "Guten Abend akşam selamıdır.",
    "Gute Nacht vedadır.",
    ],
  }),
  lesson({
    key: "jr_06_alm-2",
    title: "Adını söylemek",
    teaser:
    "Wie heißt du, adını sorar. Ich heiße, adını söyler. Kavramsal Anlayış, soru cümlesi ile cevap cümlesini ayırır. İfade Gücü, adını Ich heiße ile kurmandır.",
    hello: "Bugün seninle Almancada ad sormayı öğreneceğiz.",
    middle:
    "Wie heißt du sorusu, adın ne demektir. Cevap Ich heiße ile başlar. Ardından adın gelir. Hadi şimdi ekrandaki çizime birlikte bakalım! Arkadaşın Wie heißt du diyor. Sen Ich heiße ile kendi adını söylüyorsun. Soru bekler. Cevap adı koyar. Hatırlarsan, önce selam verilmişti. Guten Tag dedikten sonra adı sorarsın. Tuzaklara Düşme! Birlikte bakalım. Heiße tek başına cevap olmaz. Ich heiße ile başla. Sorudaki du sözünü cevapta kullanma.",
    concept: "Wie heißt du adı sorar. Ich heiße adı söyler.",
    voice: "Adını Ich heiße kalıbıyla nasıl kurduğunu söylersin.",
    school:
    "Bugün seninle Almanca ad kalıbı var. Wie heißt du, adın ne demektir. Cevap Ich heiße ile kurulur. Ad, kalıbın ardına gelir. Selam, sorudan önce durur.\n\nHatırlarsan, Guten Tag gün içinin selamıydı. Hadi şimdi ekrandaki çizime birlikte bakalım! Önce Guten Tag. Sonra Wie heißt du. Cevap Ich heiße ve ad.\n\nTuzaklara Düşme! Birlikte bakalım. Heiße sözünü yalnız bırakma. Ich düşerse cümle eksik kalır. Soruyu aynen tekrar etmek ad söylemek değildir.",
    life:
    "Yaz kursunda yeni bir arkadaşla karşılaşırsın. Önce selam verirsin. Sonra Wie heißt du diye sorarsın. O da Ich heiße ile adını söyler. Hatırlarsan, soru ile cevap ayrıydı. Sen de kendi adını aynı kalıpla söylersin. Tuzaklara Düşme! Birlikte bakalım. Yalnız adını söylemek kalıbı eksik bırakır.",
    outcomes: ["Wie heißt du, adını sorar.", "Ich heiße, adını söyler."],
  }),
  ],
},
{
  slug: "jr_06_fra",
  code: "JR-06-FRA",
  title: JUNIOR_COURSE_TITLES.jr_06_fra,
  subject: "Fransızca",
  grade: JUNIOR_PILOT_GRADE,
  track: "elective",
  lessons: [
  lesson({
    key: "jr_06_fra-1",
    title: "Bonjour demek",
    teaser:
    "Bonjour, gün içinin selamıdır. Bonsoir, akşam selamıdır. Kavramsal Anlayış, bu iki sözü saate göre ayırır. İfade Gücü, hangisini neden seçtiğini söylemendir.",
    hello: "Bugün seninle Fransızcada selamlaşmayı öğreneceğiz.",
    middle:
    "Bonjour, günaydın ve iyi günler yerinde durur. Sabah ve gün içinde Bonjour dersin. Akşam Bonsoir dersin. Salut, arkadaş arasında merhaba demektir. Salut her saatte söylenebilir. Büyük bir kişiye önce Bonjour demek daha uygundur. Hadi şimdi ekrandaki çizime birlikte bakalım! Öğretmen kapıda duruyor. Sen Bonjour diyorsun. Öğretmen de Bonjour diyor. Hatırlarsan, selam saate bakıyordu. Tuzaklara Düşme! Birlikte bakalım. Bonne nuit, iyi geceler demektir. Bu söz vedadır. İlk görüşte Bonne nuit deme.",
    concept: "Bonjour gün içine, Bonsoir akşama aittir.",
    voice: "Hangi selamı hangi saate bağladığını söylersin.",
    school:
    "Bugün seninle Fransızca selamı saate bağlıyoruz. Bonjour sabah ve gün içi selamıdır. Bonsoir akşam selamıdır. Salut arkadaş selamıdır. Büyük bir kişiye Bonjour daha uygundur. Karşılık, duyulan selamın aynısıdır.\n\nHatırlarsan, saat sözü seçiyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Akşam bir komşu duruyor. Sen Bonsoir dersin.\n\nTuzaklara Düşme! Birlikte bakalım. Bonne nuit ilk selam değildir. Ayrılırken söylenir. Akşam ilk görüşte Bonsoir dersin.",
    life:
    "Sabah derse girerken Bonjour dersin. Akşam aile büyüğüne Bonsoir dersin. Yakın arkadaşına Salut diyebilirsin. Hatırlarsan, büyük kişiye Bonjour daha uygundu. Tuzaklara Düşme! Birlikte bakalım. Uyku vaktinde Bonne nuit dersin. O söz, kapıdaki ilk selam değildir.",
    outcomes: [
    "Bonjour gün içinin selamıdır.",
    "Bonsoir akşam selamıdır.",
    "Bonne nuit vedadır.",
    ],
  }),
  lesson({
    key: "jr_06_fra-2",
    title: "Adını sormak",
    teaser:
    "Comment tu t'appelles, adını sorar. Je m'appelle, adını söyler. Kavramsal Anlayış, soru ile cevabı ayırır. İfade Gücü, adını Je m'appelle ile kurmandır.",
    hello: "Bugün seninle Fransızcada ad sormayı öğreneceğiz.",
    middle:
    "Comment tu t'appelles sorusu, adın ne demektir. Cevap Je m'appelle ile başlar. Ardından adın gelir. Hadi şimdi ekrandaki çizime birlikte bakalım! Arkadaşın soruyu soruyor. Sen Je m'appelle ile kendi adını söylüyorsun. Soru ad bekler. Cevap adı koyar. Hatırlarsan, önce Bonjour denmişti. Selamdan sonra adı sorarsın. Tuzaklara Düşme! Birlikte bakalım. Appelle tek başına cevap olmaz. Je m'appelle ile başla. Sorudaki tu sözünü cevapta bırakma.",
    concept: "Soru adı ister. Je m'appelle adı söyler.",
    voice: "Adını Je m'appelle kalıbıyla nasıl kurduğunu söylersin.",
    school:
    "Bugün seninle Fransızca ad kalıbı var. Comment tu t'appelles, adın ne demektir. Cevap Je m'appelle ile kurulur. Ad, kalıbın ardına gelir. Selam, sorudan önce durur.\n\nHatırlarsan, Bonjour gün içinin selamıydı. Hadi şimdi ekrandaki çizime birlikte bakalım! Önce Bonjour. Sonra Comment tu t'appelles. Cevap Je m'appelle ve ad.\n\nTuzaklara Düşme! Birlikte bakalım. M'appelle sözünü yalnız bırakma. Je düşerse cümle eksik kalır. Soruyu tekrar etmek, adını söylemek değildir.",
    life:
    "Yeni bir grupta önce Bonjour dersin. Sonra Comment tu t'appelles diye sorarsın. Karşındaki Je m'appelle ile adını söyler. Hatırlarsan, soru ile cevap ayrıydı. Sen de kendi adını aynı kalıpla söylersin. Tuzaklara Düşme! Birlikte bakalım. Yalnız adını söylemek cümleyi eksik bırakır.",
    outcomes: ["Comment tu t'appelles, adını sorar.", "Je m'appelle, adını söyler."],
  }),
  ],
},
{
  slug: "jr_06_siyer",
  code: "JR-06-SIY",
  title: JUNIOR_COURSE_TITLES.jr_06_siyer,
  subject: "Siyer",
  grade: JUNIOR_PILOT_GRADE,
  track: "elective",
  lessons: [
  lesson({
    key: "jr_06_siyer-1",
    title: "Doğru söz",
    teaser:
    "Doğru söz, söylenen ile yapılanın aynı olmasıdır. Kavramsal Anlayış, doğru sözü işine geleni söylemekten ayırır. İfade Gücü, bir örnekte söz ile işin nasıl birleştiğini anlatmandır.",
    hello:
    "Bugün seninle siyerde doğru sözü öğreneceğiz.",
    middle:
    "Siyer, Peygamberimizin hayatını güvenilir haberlerle anlatan derstir. Bu derste bir huyu adıyla öğreniriz. Doğru söz, ağzından çıkan ile elinin yaptığı aynı olunca durur. Söz başka, iş başka olursa doğru söz bozulur. Hadi şimdi ekrandaki çizime birlikte bakalım! Bir kalem sana emanet edildi. Sözün şudur. Kalemi sahibine geri vereceğim. İşi de budur. Kalemi sahibine verirsin. Söz ile iş birleşir. Hatırlarsan, doğru söz bu birleşmeydi. Tuzaklara Düşme! Birlikte bakalım. İşine gelen cümle, doğru söz sayılmaz. Emaneti gizlersen sözün bozulur.",
    concept: "Doğru söz, söylenen ile yapılanın aynı olmasıdır.",
    voice: "Örnekte söz ile işin nasıl birleştiğini adım adım söylersin.",
    school:
    "Bugün seninle doğru sözü tanımlıyoruz. Siyer, Peygamberimizin hayatını anlatan derstir. Doğru söz, söylenen cümle ile yapılan işin aynı olmasıdır. Söz tutulursa doğru söz durur. Söz tutulmazsa doğru söz bozulur.\n\nHatırlarsan, emanet geri verilmişti. Hadi şimdi ekrandaki çizime birlikte bakalım! Kalem sana bırakıldı. Kalemi sahibine geri verdin. Sözün ile işin birleşti.\n\nTuzaklara Düşme! Birlikte bakalım. Doğru söz, hoşa giden cümle değildir. Emaneti saklamak doğru sözü bozar. Başkasının eşyasını kendininki gibi tutma.",
    life:
    "Arkadaşının silgisini ödünç aldıysan geri verirsin. Veririm dediysen o gün getirirsin. Hatırlarsan, söz ile iş aynı olmalıydı. Evde de aynı kural durur. Tuzaklara Düşme! Birlikte bakalım. Unuttum demek, tutmadığın sözü doğru yapmaz.",
    outcomes: [
    "Siyer, Peygamberimizin hayatını anlatan derstir.",
    "Doğru söz, söylenen ile yapılanın aynı olmasıdır.",
    "Emanet, sahibine geri verilir.",
    ],
  }),
  lesson({
    key: "jr_06_siyer-2",
    title: "Merhamet",
    teaser:
    "Merhamet, gücün varken incitmemektir. Kavramsal Anlayış, yardımı yanlış işi örtmekten ayırır. İfade Gücü, kime neden yardım ettiğini söylemendir.",
    hello: "Bugün seninle merhameti öğreneceğiz.",
    middle:
    "Merhamet, karşındaki kişiyi incitmemektir. Gücün yettiği halde sertleşmemektir. Yardım, merhametin görünen işidir. Hadi şimdi ekrandaki çizime birlikte bakalım! Yaşlı bir komşu poşeti zor taşıyor. Sen poşeti birlikte tutuyorsun. Kişiyi incitmedin. İşini hafiflettin. Hatırlarsan, doğru söz söz ile işi birleştiriyordu. Merhamet de işte görünür. Tuzaklara Düşme! Birlikte bakalım. Merhamet, yanlış bir işi alkışlamak değildir. Kişiye yardım edersin. Haksız işi doğru diye örtmezsin.",
    concept: "Merhamet, gücün varken incitmemektir.",
    voice: "Kime neden yardım ettiğini kendi sözlerinle söylersin.",
    school:
    "Bugün seninle merhameti tanımlıyoruz. Merhamet, bir kişiyi incitmemektir. Güç varken yumuşak davranmaktır. Yardım, bu huyun görünen işidir.\n\nHatırlarsan, doğru söz işte görünüyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Komşu poşeti zor taşıyor. Poşeti birlikte tuttun. Kişiye yardım ettin.\n\nTuzaklara Düşme! Birlikte bakalım. Yanlış işi örtmek merhamet değildir. Alay etmek merhameti bozar. Yardım kişiye yapılır. Haksızlığa alkış tutulmaz.",
    life:
    "Sırada düşen bir çantayı kaldırırsın. Küçük kardeşinin ayakkabısını bağlarken acele ettirmezsin. Hatırlarsan, merhamet incitmemekti. Oyunda da itmeden yer verirsin. Tuzaklara Düşme! Birlikte bakalım. Bir arkadaşının yanlışını gizlemek, ona yardım sayılmaz. Yanlışı nazikçe söylersin.",
    outcomes: [
    "Merhamet, gücün varken incitmemektir.",
    "Yardım, merhametin görünen işidir.",
    "Yanlış işi örtmek merhamet değildir.",
    ],
  }),
  ],
},
{
  slug: "jr_06_kod",
  code: "JR-06-KOD",
  title: JUNIOR_COURSE_TITLES.jr_06_kod,
  subject: "Bilgisayar Bilimi",
  grade: JUNIOR_PILOT_GRADE,
  track: "elective",
  lessons: [
  lesson({
    key: "jr_06_kod-1",
    title: "Komut sırası",
    teaser:
    "Bilgisayar, komutları yukarıdan aşağı yapar. Kavramsal Anlayış, sıranın sonucu değiştirdiğini söyler. İfade Gücü, hangi adımın önce geldiğini anlatmandır.",
    hello:
    "Bugün seninle komut sırasını öğreneceğiz.",
    middle:
    "Bir komut, bilgisayara verilen tek iştir. Bilgisayar bu işleri yazıldıkları sırayla yapar. İlk satır önce çalışır. Son satır en son çalışır. Sıra değişirse sonuç değişir. Hadi şimdi ekrandaki çizime birlikte bakalım! Üç komut duruyor. Bardağı tut. Musluğu aç. Bardak dolunca musluğu kapat. Bu sıra suyu bardağa koyar. Musluğu önce açarsan su yere dökülür. Hatırlarsan, sıra sonucu belirliyordu. Tuzaklara Düşme! Birlikte bakalım. Komutları karışık okuma. Yukarıdan aşağı git. Bir adımı atlamak da sırayı bozar.",
    concept: "Bilgisayar, komutları yukarıdan aşağı yapar.",
    voice: "Hangi adımın neden önce geldiğini söylersin.",
    school:
    "Bugün seninle komut sırasını kuruyoruz. Komut, tek bir iştir. Bilgisayar komutları yukarıdan aşağı çalıştırır. Sıra değişirse sonuç değişir. Atlanan adım da sonucu bozar.\n\nHatırlarsan, bardak önce tutulmuştu. Hadi şimdi ekrandaki çizime birlikte bakalım! Birinci komut bardağı tutmaktır. İkinci komut musluğu açmaktır. Üçüncü komut musluğu kapatmaktır. Su bardakta kalır.\n\nTuzaklara Düşme! Birlikte bakalım. Musluğu ilk adım yapma. Su yere dökülür. Komutları ezberlemek yetmez. Sırayı söylemek gerekir.",
    life:
    "Diş fırçalarken önce suyu alırsın. Sonra macunu sürersin. Sonra fırçalarsın. Sıra değişirse iş karışır. Hatırlarsan, bilgisayar da adımları sırayla yapıyordu. Yemek tarifi de aynı kuraldır. Tuzaklara Düşme! Birlikte bakalım. İlk adımı atlarsan sonraki adım boşa düşer.",
    outcomes: [
    "Komut, tek bir iştir.",
    "Bilgisayar komutları yukarıdan aşağı yapar.",
    "Sıra değişirse sonuç değişir.",
    ],
  }),
  lesson({
    key: "jr_06_kod-2",
    title: "Hatalı adımı bulmak",
    teaser:
    "Hata, beklenen sonuç ile olan sonucun ayrıldığı yerdir. Kavramsal Anlayış, yanlış adımı bütün listeden ayırır. İfade Gücü, hangi satırın bozuk olduğunu söylemendir.",
    hello:
    "Bugün seninle hatalı adımı bulmayı öğreneceğiz.",
    middle:
    "Beklediğin sonuç ile ekrandaki sonuç aynı değilse bir hata vardır. Hatayı bulmak için satırları tek tek okursun. Bozuk olan satırı işaretlersin. Sağlam satırı silmezsin. Hadi şimdi ekrandaki çizime birlikte bakalım! Üç komut var. Bardağı tut. Bardağı bırak. Musluğu aç. Su yere dökülür. Hata ikinci satırdadır. Bardağı bırakmak, suyu tutmaz. O satır bardağı tut olarak düzelir. Hatırlarsan, sıra yukarıdan aşağıydı. Tuzaklara Düşme! Birlikte bakalım. Bütün listeyi silmek ilk iş değildir. Önce yanlış satırı göster. Sonra o satırı düzelt.",
    concept: "Hata, beklenen sonuç ile olan sonucun ayrıldığı satırdır.",
    voice: "Hangi satırın bozuk olduğunu ve nedenini söylersin.",
    school:
    "Bugün seninle hatalı adımı arıyoruz. Beklenen sonuç ile olan sonuç farklıysa hata vardır. Satırlar tek tek okunur. Bozuk satır işaretlenir. Sağlam satır durur.\n\nHatırlarsan, bardak önce tutulmalıydı. Hadi şimdi ekrandaki çizime birlikte bakalım! İkinci satır bardağı bırak diyor. Su dökülüyor. Hata ikinci satırdadır. Düzeltme şudur. Bardağı tut.\n\nTuzaklara Düşme! Birlikte bakalım. Bütün komutları silme. İlk satır sağlamsa ona dokunma. Hatayı göstermeden düzeltme olmaz.",
    life:
    "Kek tarifi sırasını okursun. Şeker unutulmuşsa hata o satırdadır. Bütün tarifi çöpe atmazsın. Eksik satırı eklersin. Hatırlarsan, sağlam adım duruyordu. Ödev adımlarında da aynı işi yaparsın. Tuzaklara Düşme! Birlikte bakalım. Sonucu beğenmemek yetmez. Bozuk adımı adıyla söyle.",
    outcomes: [
    "Hata, beklenen sonuç ile olan sonuç aynı değilse aranır.",
    "Bozuk satır işaretlenir.",
    "Sağlam satır silinmez.",
    ],
  }),
  ],
},
{
  slug: "jr_06_arp",
  code: "JR-06-ARP",
  title: JUNIOR_COURSE_TITLES.jr_06_arp,
  subject: "Arapça",
  grade: JUNIOR_PILOT_GRADE,
  track: "elective",
  lessons: [
  lesson({
    key: "jr_06_arp-1",
    title: "Selam vermek",
    teaser:
    "Selamün aleyküm, barış üzerine olsun demektir. Kavramsal Anlayış, selam ile karşılığını ayırır. İfade Gücü, duyduğun selama hangi sözle döndüğünü söylemendir.",
    hello: "Bugün seninle Arapçada selamı öğreneceğiz.",
    middle:
    "Selamün aleyküm, barış üzerine olsun demektir. Bu söz bir kişiye esenlik diler. Karşılık Ve aleyküm selamdır. Bu söz, sana da barış olsun demektir. Hadi şimdi ekrandaki çizime birlikte bakalım! Kapıda bir kişi duruyor. O, Selamün aleyküm diyor. Sen, Ve aleyküm selam diyorsun. Selam gider. Karşılık gelir. Hatırlarsan, selam tek başına bitmiyordu. Tuzaklara Düşme! Birlikte bakalım. Selamı duyup susma. Karşılığı söyle. İki sözün yerini değiştirme. Önce selam verilir. Sonra karşılık söylenir.",
    concept: "Selamün aleyküm esenlik diler. Ve aleyküm selam karşılıktır.",
    voice: "Duyduğun selama hangi sözle döndüğünü söylersin.",
    school:
    "Bugün seninle Arapça selamı kuruyoruz. Selamün aleyküm, barış üzerine olsun demektir. Ve aleyküm selam, karşılık sözüdür. Selam önce söylenir. Karşılık sonra söylenir.\n\nHatırlarsan, selam tek yönlü değildi. Hadi şimdi ekrandaki çizime birlikte bakalım! Gelen söz Selamün aleykümdür. Dönen söz Ve aleyküm selamdır.\n\nTuzaklara Düşme! Birlikte bakalım. Karşılığı susarak geçme. İki cümleyi aynı ağızdan tek selam sanma. Önce gelen sözü dinle. Sonra karşılığı söyle.",
    life:
    "Cami çıkışında ya da bir büyük ziyaretinde bu selamı duyarsın. Sen de Ve aleyküm selam dersin. Hatırlarsan, karşılık ayrı bir sözdü. Evde misafire de aynı düzen durur. Tuzaklara Düşme! Birlikte bakalım. Selamı yarıda kesip başka söze atlama.",
    outcomes: [
    "Selamün aleyküm, barış üzerine olsun demektir.",
    "Ve aleyküm selam, selamın karşılığıdır.",
    "Önce selam verilir. Sonra karşılık söylenir.",
    ],
  }),
  lesson({
    key: "jr_06_arp-2",
    title: "Sağdan sola okumak",
    teaser:
    "Arapça satır sağdan sola okunur. Kavramsal Anlayış, yönü ve ilk iki harfin sesini söyler. İfade Gücü, kelimeyi hangi yönden okuduğunu anlatmandır.",
    hello:
    "Bugün seninle Arapçada okuma yönünü öğreneceğiz.",
    middle:
    "Arapça satır sağdan sola gider. İlk harf sağda durur. Son harf solda durur. Elif, uzun a sesini taşır. Be, b sesidir. Hadi şimdi ekrandaki çizime birlikte bakalım! Kapı anlamına gelen bab sözü üç harftir. Sağda be durur. Ortada elif durur. Solda yine be durur. Okuyuş b, uzun a, b diye gider. Hatırlarsan, selam da bir sıra ile söylenmişti. Harf de sırayla okunur. Tuzaklara Düşme! Birlikte bakalım. Satırı soldan sağa okuma. Yön değişirse kelime değişir. Elif ile be sesini birbirine karıştırma.",
    concept: "Arapça satır sağdan sola okunur.",
    voice: "Kelimeyi hangi yönden ve hangi seslerle okuduğunu söylersin.",
    school:
    "Bugün seninle okuma yönünü kuruyoruz. Arapça yazı sağdan sola okunur. İlk harf sağdadır. Elif, uzun a sesini taşır. Be, b sesidir.\n\nHatırlarsan, sıra sözü belirliyordu. Hadi şimdi ekrandaki çizime birlikte bakalım! Bab, kapı demektir. Sağdan sola be, elif, be okunur. Ses b, uzun a, b olur.\n\nTuzaklara Düşme! Birlikte bakalım. Soldan sağa okumak yönü bozar. Elif, b sesi değildir. Be, uzun a sesi değildir. Harfi sesiyle birlikte söyle.",
    life:
    "Bir tabelada Arapça bir söz görürsen okumaya sağdan başlarsın. Hatırlarsan, ilk harf sağda duruyordu. Defterde de satırı sağdan kurarsın. Tuzaklara Düşme! Birlikte bakalım. Türkçe satır gibi soldan başlama. Yön ayrıdır.",
    outcomes: [
    "Arapça satır sağdan sola okunur.",
    "Elif, uzun a sesini taşır.",
    "Be, b sesidir.",
    ],
  }),
  ],
},
] as const satisfies readonly JuniorElectiveCourse[];

