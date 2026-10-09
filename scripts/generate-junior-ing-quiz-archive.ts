/**
 * Bir kerelik üretim: lib/junior/quiz/ing/{1..20}.ts
 * Çalıştır: npx tsx scripts/generate-junior-ing-quiz-archive.ts
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
    title: "Daily routines ve saati söylemek",
    tellGuides: [
      "Can you tell your daily routine in 3 sentences using simple present tense?",
      "How do you say half past seven and quarter to ten in English?",
      "Ask and answer: What time is it?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "«It is half past seven.» cümlesi saati nasıl anlatır?",
        options: [
          "Saat yedi buçuk",
          "Saat tam yedi",
          "Saate çeyrek kala",
          "Saat sekizi çeyrek geçe",
        ],
        correctAnswerIndex: 0,
        hint: "Half past, yarım saat geçti demektir.",
        explanation:
          "Adım 1: Half past, yarım geçe kalıbıdır. Adım 2: Seven, yedi demektir. Adım 3: Bu yüzden cümle saat yedi buçuktur.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Diyalog: «What time is it?» — «___.» Hangisi doğru cevaptır?",
        options: [
          "It is eight o'clock",
          "I wake up at school",
          "She brushes teeth",
          "We like breakfast",
        ],
        correctAnswerIndex: 0,
        hint: "Saat sorusuna It is ile cevap verilir.",
        explanation:
          "Adım 1: What time is it saat sorusudur. Adım 2: Cevap It is ile başlar. Adım 3: It is eight o'clock doğru saati söyler.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Ece: «I wake up at seven o'clock. I have breakfast at half past seven. I go to school at eight o'clock.» Hangisi doğrudur?",
        options: [
          "Ece kahvaltıyı yedi buçukta yapar",
          "Ece sekizde uyanır",
          "Ece yedide okula gider",
          "Ece günlük rutin anlatmaz",
        ],
        correctAnswerIndex: 0,
        hint: "Have breakfast satırındaki saate bak.",
        explanation:
          "Adım 1: Have breakfast at half past seven = yedi buçukta kahvaltı. Adım 2: Uyanma yedide, okul sekizdedir. Adım 3: Doğru çıkarım kahvaltı saatidir.",
      },
    ],
  },
  {
    n: 2,
    title: "He, she ve it ile simple present",
    tellGuides: [
      "Explain when we add -s to a verb in simple present.",
      "Tell your brother's or sister's morning routine in 3 sentences with he or she.",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "He, she ve it öznesinde simple present fiile ne olur?",
        options: [
          "Fiile -s / -es gelir",
          "Fiil hep yalın kalır",
          "Fiile -ing eklenir",
          "Fiil tamamen silinir",
        ],
        correctAnswerIndex: 0,
        hint: "Üçüncü tekil şahısta fiil değişir.",
        explanation:
          "Adım 1: Simple present alışkanlık anlatır. Adım 2: He/she/it ile fiile -s gelir. Adım 3: I ile fiil yalın kalır; üçüncü tekilde ek vardır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi doğru cümledir?",
        options: [
          "She goes to school",
          "She go to school",
          "She going to school",
          "She to go school",
        ],
        correctAnswerIndex: 0,
        hint: "Go fiili she ile goes olur.",
        explanation:
          "Adım 1: Özne she'dir. Adım 2: Go → goes olur. Adım 3: She goes to school doğru kalıptır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "«I play football. He ___ football.» Boşluğa hangisi gelir?",
        options: ["plays", "play", "playing", "played"],
        correctAnswerIndex: 0,
        hint: "He öznesi fiile -s ister.",
        explanation:
          "Adım 1: I ile play yalın kalır. Adım 2: He üçüncü tekildir. Adım 3: Bu yüzden plays doğrudur.",
      },
    ],
  },
  {
    n: 3,
    title: "Yiyecek, içecek ve likes, dislikes",
    tellGuides: [
      "Tell three foods you like and one you don't like.",
      "Can you make a short dialogue about breakfast using I like / I don't like?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Beğeniyi İngilizcede nasıl söyleriz?",
        options: [
          "I like …",
          "I am like …",
          "I liking …",
          "I likes …",
        ],
        correctAnswerIndex: 0,
        hint: "Like fiili I ile yalın kalır.",
        explanation:
          "Adım 1: Beğeni I like ile kurulur. Adım 2: Beğenmeme I don't like'dır. Adım 3: I likes yanlış özne-fiil uyumudur.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Diyalog: «Do you like milk?» — «___.» Hangisi doğru olumsuz cevaptır?",
        options: [
          "No, I don't",
          "Yes, I am",
          "No, I isn't",
          "Yes, I does",
        ],
        correctAnswerIndex: 0,
        hint: "Do you… sorusuna do/don't ile cevap verilir.",
        explanation:
          "Adım 1: Soru Do you like… şeklindedir. Adım 2: Olumsuz kısa cevap No, I don't'tur. Adım 3: Am/is/does bu soruya uymaz.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Menü: eggs, cheese, tea, soda. Ali: «I like eggs and tea. I don't like soda.» Hangisi doğrudur?",
        options: [
          "Ali gazoz sevmez",
          "Ali yumurta sevmez",
          "Ali çay sevmez",
          "Ali hiçbir şey sevmez",
        ],
        correctAnswerIndex: 0,
        hint: "Don't like satırına bak.",
        explanation:
          "Adım 1: Like eggs and tea = yumurta ve çay sever. Adım 2: Don't like soda = gazoz sevmez. Adım 3: Doğru çıkarım gazozdur.",
      },
    ],
  },
  {
    n: 4,
    title: "Rica etmek ve some, any",
    tellGuides: [
      "How do you politely ask for some juice at breakfast?",
      "When do we use some and when do we use any?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Some genellikle hangi cümlede kullanılır?",
        options: [
          "Olumlu cümlede",
          "Yalnızca geçmiş zamanda",
          "Yalnızca hava cümlesinde",
          "Hiçbir cümlede kullanılmaz",
        ],
        correctAnswerIndex: 0,
        hint: "Some olumlu; any soru/olumsuzdadır.",
        explanation:
          "Adım 1: Some olumlu cümlede miktar söyler. Adım 2: Any soru ve olumsuzdadır. Adım 3: Bu yüzden doğru seçenek olumlu cümledir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi kibar bir ricadır?",
        options: [
          "Can I have some water, please?",
          "Give me water now!",
          "I don't any water",
          "Water is me",
        ],
        correctAnswerIndex: 0,
        hint: "Can I have… please kibar kalıptır.",
        explanation:
          "Adım 1: Rica Can I have ile kurulur. Adım 2: Some olumlu ricada kullanılır. Adım 3: Please kibarlığı tamamlar.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "«Is there ___ milk in the fridge?» Boşluğa hangisi uygundur?",
        options: ["any", "some", "a", "an"],
        correctAnswerIndex: 0,
        hint: "Soru cümlesinde any beklenir.",
        explanation:
          "Adım 1: Cümle sorudur. Adım 2: Soruda genelde any kullanılır. Adım 3: Some daha çok olumludadır; burada any doğrudur.",
      },
    ],
  },
  {
    n: 5,
    title: "Şehirde şu an ne oluyor",
    tellGuides: [
      "Look around and say three things happening now with present continuous.",
      "What is the difference between I walk and I am walking?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Present continuous hangi durumu anlatır?",
        options: [
          "Şu anda olan işi",
          "Yalnızca dünü",
          "Yalnızca gelecek yılı",
          "Hiç yapılmayan işi",
        ],
        correctAnswerIndex: 0,
        hint: "Am/is/are + -ing şimdiyi anlatır.",
        explanation:
          "Adım 1: Present continuous şu anı anlatır. Adım 2: Am/is/are ve -ing ile kurulur. Adım 3: Alışkanlık için simple present kullanılır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi doğru present continuous cümlesidir?",
        options: [
          "They are shopping now",
          "They shopping now",
          "They is shopping now",
          "They shopped now",
        ],
        correctAnswerIndex: 0,
        hint: "They ile are kullanılır.",
        explanation:
          "Adım 1: They çoğuldur. Adım 2: Are + shopping gerekir. Adım 3: They are shopping now doğrudur.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Tabela: «Bus stop». Metin: «A woman is waiting. Two boys are talking.» Hangisi doğrudur?",
        options: [
          "İki çocuk şu an konuşuyor",
          "Kadın dün bekledi",
          "Çocuklar alışveriş yapıyor",
          "Kimse hareket etmiyor",
        ],
        correctAnswerIndex: 0,
        hint: "Are talking satırını oku.",
        explanation:
          "Adım 1: Are talking şu anı anlatır. Adım 2: Two boys öznesidir. Adım 3: Doğru çıkarım çocukların konuşmasıdır.",
      },
    ],
  },
  {
    n: 6,
    title: "Bigger ve cheaper ile karşılaştırma",
    tellGuides: [
      "Compare two shops using bigger, cheaper, or more expensive.",
      "When do we use -er and when do we use more?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Kısa sıfatlarla karşılaştırma nasıl yapılır?",
        options: [
          "Sıfata -er eklenir ve than kullanılır",
          "Sıfata -ing eklenir",
          "Sıfat silinir",
          "Yalnızca was kullanılır",
        ],
        correctAnswerIndex: 0,
        hint: "Big → bigger than.",
        explanation:
          "Adım 1: Kısa sıfat -er alır. Adım 2: Than kıyaslar. Adım 3: Bigger than doğru kalıptır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi doğru karşılaştırmadır?",
        options: [
          "This bag is cheaper than that bag",
          "This bag is cheap than that bag",
          "This bag more cheap that bag",
          "This bag cheapest than bag",
        ],
        correctAnswerIndex: 0,
        hint: "Cheap → cheaper than.",
        explanation:
          "Adım 1: Cheap kısa sıfattır. Adım 2: Cheaper + than gerekir. Adım 3: This bag is cheaper than that bag doğrudur.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Shop A: 50 TL. Shop B: 80 TL. Hangisi doğru cümledir?",
        options: [
          "Shop A is cheaper than Shop B",
          "Shop A is more expensive than Shop B",
          "Shop B is cheaper than Shop A",
          "The prices are the same",
        ],
        correctAnswerIndex: 0,
        hint: "50, 80'den küçüktür.",
        explanation:
          "Adım 1: 50 < 80. Adım 2: Daha ucuz = cheaper. Adım 3: Shop A is cheaper than Shop B doğrudur.",
      },
    ],
  },
  {
    n: 7,
    title: "Sunny, rainy ve cold",
    tellGuides: [
      "Describe today's weather in two English sentences.",
      "What do people usually do when it is rainy?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Hava durumu cümlesi nasıl kurulur?",
        options: [
          "It is + hava sıfatı",
          "I am + hava sıfatı",
          "He are + hava sıfatı",
          "They was + hava sıfatı",
        ],
        correctAnswerIndex: 0,
        hint: "Hava için It is kullanılır.",
        explanation:
          "Adım 1: Hava cümlesi It is ile başlar. Adım 2: Sunny, rainy, cold sıfat gelir. Adım 3: It is sunny doğru kalıptır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Diyalog: «What's the weather like?» — «___.»",
        options: [
          "It is rainy today",
          "I am rainy today",
          "She likes rainy",
          "We were doctor",
        ],
        correctAnswerIndex: 0,
        hint: "Weather sorusuna It is ile cevap ver.",
        explanation:
          "Adım 1: What's the weather like hava sorusudur. Adım 2: Cevap It is … şeklindedir. Adım 3: It is rainy today doğrudur.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Tablo: Monday sunny · Tuesday rainy · Wednesday cold. «On Tuesday it is ___.»",
        options: ["rainy", "sunny", "hot", "snowy"],
        correctAnswerIndex: 0,
        hint: "Tuesday satırına bak.",
        explanation:
          "Adım 1: Tuesday rainy yazıyor. Adım 2: Monday sunny, Wednesday cold ayrıdır. Adım 3: Boşluk rainy ile dolar.",
      },
    ],
  },
  {
    n: 8,
    title: "Happy, anxious ve scared",
    tellGuides: [
      "Name three feelings and say when you feel them.",
      "How is I am happy different from It is sunny?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Duygu cümlesi nasıl kurulur?",
        options: [
          "I am / He is + duygu sıfatı",
          "It is + duygu sıfatı (her zaman)",
          "I are happy",
          "Weather + feeling",
        ],
        correctAnswerIndex: 0,
        hint: "Duygu kişiye, hava It is'e bağlanır.",
        explanation:
          "Adım 1: Duygu I am / she is ile kurulur. Adım 2: Hava It is ile kurulur. Adım 3: I am happy doğru duygu kalıbıdır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi doğru duygu cümlesidir?",
        options: [
          "She is scared of the dark",
          "She are scared of the dark",
          "She scared is dark",
          "It is scared of the dark",
        ],
        correctAnswerIndex: 0,
        hint: "She ile is kullanılır.",
        explanation:
          "Adım 1: Özne she'dir. Adım 2: Is + scared gerekir. Adım 3: Of korkunun nesnesini bağlar.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Ece sınavdan önce gergin, notu görünce mutlu. Hangisi doğru eşleştirmedir?",
        options: [
          "Before: anxious · After: happy",
          "Before: sunny · After: rainy",
          "Before: bigger · After: cheaper",
          "Before: was · After: were",
        ],
        correctAnswerIndex: 0,
        hint: "Anxious gergin, happy mutlu demektir.",
        explanation:
          "Adım 1: Sınav öncesi gerginlik anxious'tır. Adım 2: İyi not sonrası happy'dir. Adım 3: Hava veya karşılaştırma bu senaryoya girmez.",
      },
    ],
  },
  {
    n: 9,
    title: "Lunaparkta rides ve fun",
    tellGuides: [
      "Talk about a fun ride and say I think it is…",
      "Can you invite a friend to a fair in two English sentences?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "«I think the roller coaster is fun.» cümlesinde I think ne yapar?",
        options: [
          "Görüş bildirir",
          "Saati söyler",
          "Meslek adlandırır",
          "Geçmiş zaman kurar",
        ],
        correctAnswerIndex: 0,
        hint: "I think = bence.",
        explanation:
          "Adım 1: I think görüş başlatır. Adım 2: Fun eğlenceli demektir. Adım 3: Bu cümle bir oyuncak hakkındaki görüştür.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi lunaparkta doğal bir cümledir?",
        options: [
          "The Ferris wheel is exciting",
          "The Ferris wheel is recycling",
          "The Ferris wheel was born in 2014",
          "The Ferris wheel shouldn't water",
        ],
        correctAnswerIndex: 0,
        hint: "Exciting heyecan verici demektir.",
        explanation:
          "Adım 1: Ferris wheel bir oyuncaktır. Adım 2: Exciting duygu/görüş sıfatıdır. Adım 3: Diğer şıklar konu dışı kalır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Ali: «I like the carousel. I think it is safe.» Ece: «I don't like it. I think it is boring.» Hangisi doğrudur?",
        options: [
          "İki kişi aynı oyuncak hakkında farklı görüş söyler",
          "İkisi de aynı cümleyi tekrarlar",
          "Kimse görüş bildirmez",
          "Bu bir hava tahmini diyalogudur",
        ],
        correctAnswerIndex: 0,
        hint: "Safe ve boring farklı sıfatlardır.",
        explanation:
          "Adım 1: Ali safe diyor. Adım 2: Ece boring diyor. Adım 3: Aynı konu, iki farklı görüştür.",
      },
    ],
  },
  {
    n: 10,
    title: "Fuarda duyguyu söylemek",
    tellGuides: [
      "Say how you feel about a ride using excited about or scared of.",
      "Make a short fair dialogue with a feeling word.",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "«excited about» hangi duyguyu bağlar?",
        options: [
          "Heyecanı bir şeye bağlar",
          "Korkuyu bir yere bağlar",
          "Saati söyler",
          "Meslek sorar",
        ],
        correctAnswerIndex: 0,
        hint: "Excited about = … hakkında heyecanlı.",
        explanation:
          "Adım 1: Excited heyecan demektir. Adım 2: About nesneyi bağlar. Adım 3: Scared of korkuyu bağlar; bu şık excited about'tır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi doğru duygu cümlesidir?",
        options: [
          "I am scared of the ghost train",
          "I am scared about the ghost train",
          "I am sunny of the ghost train",
          "I scared the ghost train am",
        ],
        correctAnswerIndex: 0,
        hint: "Korku of ile bağlanır.",
        explanation:
          "Adım 1: Scared of kalıbı vardır. Adım 2: Ghost train korku nesnesidir. Adım 3: About burada yanlış edattır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Fuarda Ece roller coaster görünce gülümsüyor: «I am excited about this ride!» Hangisi doğru yorumdur?",
        options: [
          "Ece oyuncaktan heyecan duyuyor",
          "Ece oyuncaktan korkuyor",
          "Ece hava soruyor",
          "Ece meslek seçiyor",
        ],
        correctAnswerIndex: 0,
        hint: "Excited about heyecan bağlar.",
        explanation:
          "Adım 1: Excited about heyecanı bağlar. Adım 2: This ride oyuncağı gösterir. Adım 3: Korku scared of olurdu.",
      },
    ],
  },
  {
    n: 11,
    title: "Doctor, architect ve vet",
    tellGuides: [
      "Name three jobs and say what each person does.",
      "Explain when we use a and when we use an before a job.",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "«a» ve «an» neye göre seçilir?",
        options: [
          "Sonraki sözcüğün ilk sesine göre",
          "Yalnızca mesleğin zorluğuna göre",
          "Yalnızca hava durumuna göre",
          "Hiçbir kurala göre değil",
        ],
        correctAnswerIndex: 0,
        hint: "Ünlü sesle başlayanlarda an.",
        explanation:
          "Adım 1: A/an belirsiz artikellerdir. Adım 2: İlk ses ünlüyse an, değilse a gelir. Adım 3: An architect, a doctor böyledir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi doğru meslektir?",
        options: [
          "She is a vet. She helps animals",
          "She is an vet. She builds houses",
          "She is a architect. She cooks food",
          "She is doctor. She flies planes",
        ],
        correctAnswerIndex: 0,
        hint: "Vet hayvanlara yardım eder; a vet doğrudur.",
        explanation:
          "Adım 1: Vet ünsüzle başlar → a vet. Adım 2: İş hayvanlara yardımdır. Adım 3: Diğer şıklarda hem artikel hem iş yanlışır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Kartlar: doctor → helps sick people · architect → designs buildings · vet → helps animals. Hangisi doğrudur?",
        options: [
          "Architect binaları tasarlar",
          "Doctor hayvanları tedavi eder",
          "Vet binaları tasarlar",
          "Üç meslek de aynı işi yapar",
        ],
        correctAnswerIndex: 0,
        hint: "Designs buildings satırına bak.",
        explanation:
          "Adım 1: Architect = designs buildings. Adım 2: Doctor insanlara, vet hayvanlara bakar. Adım 3: Doğru eşleşme mimardır.",
      },
    ],
  },
  {
    n: 12,
    title: "Was ve were ile geçmiş tarih",
    tellGuides: [
      "Where were you yesterday? Answer in a full English sentence.",
      "When do we use was and when do we use were?",
      "Say one sentence with on Monday and one with in 2015.",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Was hangi öznelerle kullanılır?",
        options: [
          "I, he, she, it",
          "You, we, they",
          "Yalnızca they",
          "Yalnızca we",
        ],
        correctAnswerIndex: 0,
        hint: "Was tekil; were çoğul ve you.",
        explanation:
          "Adım 1: Was tekil öznelerdedir. Adım 2: I/he/she/it was. Adım 3: You/we/they were'dir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi doğru cümledir?",
        options: [
          "They were at the park yesterday",
          "They was at the park yesterday",
          "They are at the park yesterday",
          "They is at the park yesterday",
        ],
        correctAnswerIndex: 0,
        hint: "They ile were gelir.",
        explanation:
          "Adım 1: They çoğuldur. Adım 2: Geçmişte were kullanılır. Adım 3: They were at the park yesterday doğrudur.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "«I ___ born in 2014.» Boşluğa hangisi gelir?",
        options: ["was", "were", "am", "are"],
        correctAnswerIndex: 0,
        hint: "I ile geçmişte was.",
        explanation:
          "Adım 1: Özne I'dır. Adım 2: Doğum yılı geçmiştedir. Adım 3: I was born in 2014 kalıbı doğrudur.",
      },
    ],
  },
  {
    n: 13,
    title: "Visited, swam ve played",
    tellGuides: [
      "Tell three things you did last summer using past simple.",
      "What is the difference between regular -ed verbs and irregular verbs like swam?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Swim fiilinin geçmiş hali nedir?",
        options: ["swam", "swimmed", "swimming", "swims"],
        correctAnswerIndex: 0,
        hint: "Swim özel (irregular) fiildir.",
        explanation:
          "Adım 1: Swim irregular'dır. Adım 2: Geçmiş hali swam'dır. Adım 3: Swimmed yanlış biçimdir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi doğru geçmiş zaman cümlesidir?",
        options: [
          "I visited my grandma last summer",
          "I visit my grandma last summer",
          "I visiting my grandma last summer",
          "I visits my grandma last summer",
        ],
        correctAnswerIndex: 0,
        hint: "Visit düzenli fiildir → visited.",
        explanation:
          "Adım 1: Last summer geçmiş zamandır. Adım 2: Visit → visited. Adım 3: I visited… doğru cümledir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "«Did you ___ in the sea?» Boşluğa hangisi gelir?",
        options: ["swim", "swam", "swimming", "swamned"],
        correctAnswerIndex: 0,
        hint: "Did gelince fiil yalın kalır.",
        explanation:
          "Adım 1: Did soru yardımcısıdır. Adım 2: Did'den sonra fiil birinci haldedir. Adım 3: Swim doğrudur; swam soruda kullanılmaz.",
      },
    ],
  },
  {
    n: 14,
    title: "Tatil etkinliği ve hava",
    tellGuides: [
      "Describe a holiday day: one past activity and the weather that day.",
      "Can you connect It was sunny with We played outside?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Geçmiş hava nasıl söylenir?",
        options: [
          "It was sunny / rainy / cold",
          "It is was sunny",
          "I am sunny yesterday",
          "They sunny were",
        ],
        correctAnswerIndex: 0,
        hint: "Geçmiş havada It was kullanılır.",
        explanation:
          "Adım 1: Hava It is ile kurulur. Adım 2: Geçmişte was gelir. Adım 3: It was sunny doğru kalıptır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi tatil gününü doğru anlatır?",
        options: [
          "It was sunny. We played outside",
          "It is sunny. We play outside yesterday",
          "It was sunny. We plays outside",
          "It sunny. We swimming",
        ],
        correctAnswerIndex: 0,
        hint: "Geçmiş hava + geçmiş etkinlik.",
        explanation:
          "Adım 1: It was sunny geçmiş havadır. Adım 2: Played geçmiş etkinliktir. Adım 3: İkisi aynı günde yan yana durur.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Günlük: «Morning: rainy — stayed home. Afternoon: sunny — swam.» Hangisi doğrudur?",
        options: [
          "Öğleden sonra hava açınca denize girdiler",
          "Sabah güneşliydi ve yüzdüler",
          "Bütün gün yağmur yağdı ve dışarı çıktılar",
          "Hava hiç değişmedi",
        ],
        correctAnswerIndex: 0,
        hint: "Afternoon satırını oku.",
        explanation:
          "Adım 1: Afternoon sunny. Adım 2: Swam yüzmek demektir. Adım 3: Sabah yağmurlu ve evde kaldılar; doğru çıkarım öğleden sonradır.",
      },
    ],
  },
  {
    n: 15,
    title: "Kitap okumaktan söz etmek",
    tellGuides: [
      "Talk about a book: its type and your opinion.",
      "Can you say I like this story because… in English?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Kitap türü ile kişisel görüş nasıl ayrılır?",
        options: [
          "Tür kitabı sınıflar; görüş senin fikrindir",
          "İkisi de aynı şeydir",
          "Tür yalnızca yazardır",
          "Görüş yalnızca kapak rengiidir",
        ],
        correctAnswerIndex: 0,
        hint: "Adventure tür; I think görüştür.",
        explanation:
          "Adım 1: Tür (story, adventure) kitabı sınıflar. Adım 2: I think / I like görüştür. Adım 3: İkisi ayrı söylenir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi kitap hakkında doğal bir cümledir?",
        options: [
          "This is an adventure story. I think it is exciting",
          "This is an adventure story. It is a doctor",
          "This is an adventure story. It was born in 2015",
          "This is an adventure story. Recycle the plastic",
        ],
        correctAnswerIndex: 0,
        hint: "Tür + görüş yan yana durur.",
        explanation:
          "Adım 1: Adventure story türdür. Adım 2: I think it is exciting görüştür. Adım 3: Diğer şıklar konu dışıdır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Ayşe: «I read a funny comic. I don't like sad stories.» Hangisi doğrudur?",
        options: [
          "Ayşe komik çizgi roman okur; üzgün hikâyeleri sevmez",
          "Ayşe üzgün hikâyeleri sever",
          "Ayşe hiç kitap okumaz",
          "Ayşe yalnızca ders kitabı okur",
        ],
        correctAnswerIndex: 0,
        hint: "Funny comic ve don't like satırlarına bak.",
        explanation:
          "Adım 1: Funny comic = komik çizgi roman. Adım 2: Don't like sad stories = üzgün hikâye sevmez. Adım 3: Doğru çıkarım budur.",
      },
    ],
  },
  {
    n: 16,
    title: "In, on, under, behind ve next to",
    tellGuides: [
      "Describe where three things are in your room using in, on, under, behind, or next to.",
      "What is the difference between on the table and under the table?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Yer edatı (preposition of place) ne işe yarar?",
        options: [
          "Eşyanın konumunu söyler",
          "Saati sorar",
          "Meslek adlandırır",
          "Duyguyu siler",
        ],
        correctAnswerIndex: 0,
        hint: "In, on, under konum söyler.",
        explanation:
          "Adım 1: Yer edatı konumu gösterir. Adım 2: In içinde, on üstünde, under altındadır. Adım 3: Behind arkasında, next to yanındadır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Kitap masanın üstündeyse hangisi doğrudur?",
        options: [
          "The book is on the table",
          "The book is in the table",
          "The book is under the table",
          "The book is behind the table",
        ],
        correctAnswerIndex: 0,
        hint: "On = üstünde.",
        explanation:
          "Adım 1: Üstünde = on. Adım 2: In içini, under altını anlatır. Adım 3: The book is on the table doğrudur.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Görsel: kedi koltuğun arkasında, top koltuğun yanında. Hangisi doğru çifttir?",
        options: [
          "The cat is behind the sofa. The ball is next to the sofa",
          "The cat is on the sofa. The ball is in the sofa",
          "The cat is under the sofa. The ball is on the cat",
          "The cat is next to the ball. The sofa is under the sky only",
        ],
        correctAnswerIndex: 0,
        hint: "Behind arkasında, next to yanındadır.",
        explanation:
          "Adım 1: Behind = arkasında → kedi. Adım 2: Next to = yanında → top. Adım 3: Doğru çift budur.",
      },
    ],
  },
  {
    n: 17,
    title: "Çevreyi korumak ve recycling",
    tellGuides: [
      "Explain recycling in two English sentences.",
      "What can you do at home to protect the planet?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Recycling ne demektir?",
        options: [
          "Atığı cinsine göre ayırıp yeniden kullanıma hazırlamak",
          "Her şeyi çöpe karıştırmak",
          "Yalnızca su içmek",
          "Saati söylemek",
        ],
        correctAnswerIndex: 0,
        hint: "Plastic, paper, glass ayrı kutulara gider.",
        explanation:
          "Adım 1: Recycling geri dönüşümdür. Adım 2: Atıklar ayrılır. Adım 3: Karıştırmak recycling değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi çevre dostu bir cümledir?",
        options: [
          "We recycle plastic bottles",
          "We throw all waste together",
          "We waste water every day",
          "We burn plastic at home",
        ],
        correctAnswerIndex: 0,
        hint: "Recycle olumlu çevre eylemidir.",
        explanation:
          "Adım 1: Recycle plastic bottles geri dönüşümdür. Adım 2: Diğer şıklar çevreyi zedeler. Adım 3: Doğru seçenek geri dönüşümdür.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Okul afişi: «Put paper here. Put glass there. Keep water clean.» Hangisi afişin ana fikridir?",
        options: [
          "Atıkları ayır ve suyu koru",
          "Sadece oyun oyna",
          "Meslek seç",
          "Hava tahminini yaz",
        ],
        correctAnswerIndex: 0,
        hint: "Paper/glass ayırma + clean water.",
        explanation:
          "Adım 1: Paper ve glass ayrı yerlere konur. Adım 2: Keep water clean suyu korur. Adım 3: Ana fikir çevre korumadır.",
      },
    ],
  },
  {
    n: 18,
    title: "Should ve shouldn't",
    tellGuides: [
      "Give two tips with should and one warning with shouldn't for the planet.",
      "Does the verb after should stay in the base form? Explain with an example.",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Should ne işe yarar?",
        options: [
          "Öneri verir",
          "Yalnızca geçmiş anlatır",
          "Saati sorar",
          "Artikeli seçer",
        ],
        correctAnswerIndex: 0,
        hint: "Should = yapmalısın; shouldn't = yapmamalısın.",
        explanation:
          "Adım 1: Should öneri kalıbıdır. Adım 2: Shouldn't vazgeçirir. Adım 3: Sonraki fiil yalın kalır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi doğru öneridir?",
        options: [
          "You should turn off the lights",
          "You should turning off the lights",
          "You shouldn't to waste water",
          "You should turns off the lights",
        ],
        correctAnswerIndex: 0,
        hint: "Should + yalın fiil.",
        explanation:
          "Adım 1: Should'dan sonra fiil yalındır. Adım 2: Turn off doğru biçimdir. Adım 3: Turning/turns/to waste yanlış eklerdir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "«We shouldn't throw plastic into the sea.» Bu cümle ne der?",
        options: [
          "Plastiği denize atmamalıyız",
          "Plastiği denize atmalıyız",
          "Deniz çok sıcaktır",
          "Bugün yağmur yağacak",
        ],
        correctAnswerIndex: 0,
        hint: "Shouldn't yasak/uyarıdır.",
        explanation:
          "Adım 1: Shouldn't = yapmamalı. Adım 2: Throw plastic into the sea = denize plastik atmak. Adım 3: Cümle bunu yasaklar.",
      },
    ],
  },
  {
    n: 19,
    title: "Okul seçimi ve voting",
    tellGuides: [
      "Explain what a school election is in two English sentences.",
      "Why does every student get one vote?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Voting (oy vermek) ne demektir?",
        options: [
          "Bir seçimde tercihini bildirmek",
          "Sınıfı temizlemek",
          "Saati sormak",
          "Kitap türünü yazmak",
        ],
        correctAnswerIndex: 0,
        hint: "Vote = oy.",
        explanation:
          "Adım 1: Voting oy kullanmaktır. Adım 2: Seçimde tercih bildirilir. Adım 3: Temizlik veya saat sorusu değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi seçim gününe uygun cümledir?",
        options: [
          "I vote for Ayşe. She helps her friends",
          "I vote for Ayşe. She is sunny today",
          "I vote for Ayşe. Recycle the glass",
          "I vote for Ayşe. Half past seven",
        ],
        correctAnswerIndex: 0,
        hint: "Adayın sözü/davranışı seçimi destekler.",
        explanation:
          "Adım 1: Vote for adayı seçer. Adım 2: Helps her friends gerekçe verir. Adım 3: Hava veya saat seçim gerekçesi değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Sınıfta 20 öğrenci var; herkes bir oy kullanır. Sonuç: Ali 12, Ece 8. Hangisi doğrudur?",
        options: [
          "Ali daha çok oy alır",
          "Ece daha çok oy alır",
          "Oylar eşit kalır",
          "Hiç kimse oy kullanmaz",
        ],
        correctAnswerIndex: 0,
        hint: "12, 8'den büyüktür; daha çok oy kimde?",
        explanation:
          "Adım 1: 12 ile 8 karşılaştırılır. Adım 2: Ali'nin oyu daha fazladır. Adım 3: Herkesin bir oyu olduğu için toplam 20'dir.",
      },
    ],
  },
  {
    n: 20,
    title: "Hak, sorumluluk ve sınıf kuralı",
    tellGuides: [
      "What is the difference between a right and a responsibility in class?",
      "Give one classroom rule and explain why it helps everyone.",
      "Can you say one right and one responsibility you have at school?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Right (hak) ile responsibility (sorumluluk) farkı nedir?",
        options: [
          "Hak yapabildiğin şeydir; sorumluluk üstlendiğin iştir",
          "İkisi de yalnız oyun adıdır",
          "Hak yalnızca ödevdir",
          "Sorumluluk yalnızca tatildir",
        ],
        correctAnswerIndex: 0,
        hint: "Speak freely bir hak; listen carefully bir sorumluluk olabilir.",
        explanation:
          "Adım 1: Right yetki/olanaktır. Adım 2: Responsibility görevdir. Adım 3: Sınıfta ikisi birlikte yürür.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Hangisi sınıf kuralı örneğidir?",
        options: [
          "We should listen when others speak",
          "We should shout in every lesson",
          "We shouldn't come to school",
          "We should break the chairs",
        ],
        correctAnswerIndex: 0,
        hint: "Kural herkese saygıyı korur.",
        explanation:
          "Adım 1: Listen when others speak saygı kuralıdır. Adım 2: Bağırmak veya eşya kırmak kural değildir. Adım 3: Doğru seçenek dinlemektir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Metin: «Students have the right to ask questions. They also have the responsibility to respect others.» Hangisi doğru özet?",
        options: [
          "Soru sormak haktır; başkasına saygı sorumluluktur",
          "Soru sormak yasaktır",
          "Saygı yalnızca öğretmenindir",
          "Metinde kural yoktur",
        ],
        correctAnswerIndex: 0,
        hint: "Right to ask / responsibility to respect.",
        explanation:
          "Adım 1: Right to ask questions = soru sorma hakkı. Adım 2: Responsibility to respect = saygı sorumluluğu. Adım 3: Özet bu ayrımdır.",
      },
    ],
  },
];

function renderPack(pack: Pack): string {
  const guides = pack.tellGuides.map((g) => `    ${JSON.stringify(g)},`).join("\n");
  const questions = pack.questions
    .map((q) => {
      const opts = q.options.map((o) => `        ${JSON.stringify(o)},`).join("\n");
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

/** 6. Sınıf İngilizce — konu sonu soru arşivi (${pack.n}/20). */
export const JUNIOR_ING_QUIZ_${pack.n} = {
  lessonKey: "jr_06_ing_main-${pack.n}",
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

const outDir = join(process.cwd(), "lib", "junior", "quiz", "ing");
mkdirSync(outDir, { recursive: true });

for (const pack of PACKS) {
  const file = join(outDir, `${pack.n}.ts`);
  writeFileSync(file, renderPack(pack), "utf8");
  console.log("wrote", file);
}

const imports = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  return `import { JUNIOR_ING_QUIZ_${n} } from "@/lib/junior/quiz/ing/${n}";`;
}).join("\n");

const packList = Array.from({ length: 20 }, (_, i) => `  JUNIOR_ING_QUIZ_${i + 1},`).join("\n");
const exportList = Array.from({ length: 20 }, (_, i) => `  JUNIOR_ING_QUIZ_${i + 1},`).join("\n");

const index = `${imports}
import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. sınıf İngilizce konu sonu arşivi. Katalog sırası. */
export const JUNIOR_ING_QUIZ_PACKS = [
${packList}
] as const satisfies readonly JuniorLessonQuizPack[];

export {
${exportList}
};
`;

writeFileSync(join(outDir, "index.ts"), index, "utf8");
console.log("wrote index.ts", PACKS.length, "packs,", PACKS.length * 3, "questions");
