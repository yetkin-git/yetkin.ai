import {
  JUNIOR_LIVE_TUTOR_QUICK_CHIPS,
  JUNIOR_LIVE_TUTOR_TEACHER,
  JUNIOR_LIVE_TUTOR_WELCOME,
} from "@/lib/junior/live-tutor-policy";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import {
  MAT_5_CANONICAL_TITLE,
  MAT_5_HERO_FOCUS,
  MAT_5_HERO_QUESTION,
} from "@/lib/junior/pilot-engine/mat-5.choreography";
import { getPilotTimelineForLesson } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import type { JuniorLessonBlueprint, JuniorSimulationTabSpec } from "../types";

/** `jr_06_mat-5` amiral gemisi 4'lü simülasyon sekme seti. */
export const MAT_5_SIMULATION_TABS: readonly JuniorSimulationTabSpec[] = [
  {
    id: "marble",
    label: "🔮 Bilye Dağıtımı",
    activeClass: "border-cyan-500 bg-cyan-50 text-cyan-950",
    summary: "12 bilyeyi kutulara eşit paylaştırarak çarpan ve kalan ilişkisini keşfet.",
  },
  {
    id: "balance",
    label: "⚖️ Bölünebilme Terazisi",
    activeClass: "border-violet-500 bg-violet-50 text-violet-950",
    summary: "Sayı ve bölen ağırlıklarını kefelere koy; kalansız bölünmede dengeyi yakala.",
  },
  {
    id: "chicken",
    label: "🐣 Tavuk Yemleme (2, 5, 10 Kuralı)",
    activeClass: "border-lime-600 bg-lime-50 text-lime-950",
    summary: "Yemleri tavuklara eşit dağıt; 2, 5 ve 10 bölünebilme kurallarını çiftlikte dene.",
  },
  {
    id: "egg",
    label: "🥚 Yumurta Kolileme (Çarpanlar)",
    activeClass: "border-orange-500 bg-orange-50 text-orange-950",
    summary: "24 yumurtayı farklı koli boyutlarına dizerek tam çarpanları bul.",
  },
] as const;

function buildMat1Timeline(): TimelineJSON {
  const example =
    "2 üssü 3 ifadesinde taban 2, üs 3'tür; 2 çarpı 2 çarpı 2 eşittir 8 eder. Sakın 2 çarpı 3 eşittir 6 tuzağına düşme!";
  const listenText = [
    "Merhaba sevgili çocuklar! Ben Matematik öğretmenin Selim.",
    "Bugün seninle tekrarlı çarpımları kısaca yazmanın süper gücünü, yani üslü ifadeleri keşfedeceğiz.",
    example,
    "Sıfırdan farklı bir sayının sıfırıncı kuvveti 1 eder. Bir sayının birinci kuvveti kendisidir.",
    "10'un kuvvetinde üs, sondaki sıfırların sayısıdır.",
    "Bugün Neler Öğrendik? Taban tekrar çarpılan sayıdır, üs ise kaç kez çarpılacağını söyler.",
  ].join(" ");
  const exampleMarked = insertSpeechHook(example, "2 çarpı 2 çarpı 2", "showExponentTree");

  return buildLessonGraphTimeline({
    lessonKey: "jr_06_mat-1",
    title: "Üslü İfadeler ve Tekrarlı Çarpım",
    listenText,
    example,
    exampleMarked,
    audioPath: "/media/junior/audio/jr_06_mat-1.mp3",
    layout: "prime-factor-tree",
    stageTitle: "Üslü İfadeler",
    stageSubtitle: "Taban ve Kuvvet Kulesi",
    chapterTitle: "Üs Kulesi Deneyi",
    exampleKeyframes: [
      {
        hook: "showExponentTree",
        offsetMs: 0,
        op: "SHOW_PRIME_FACTOR_TREE",
        params: {
          composite: {
            number: 8,
            factors: [2, 2, 2],
            product: "2 × 2 × 2 = 2³",
            branches: [
              { value: 2, atMs: 0 },
              { value: 2, atMs: 0 },
              { value: 2, atMs: 0 },
            ],
          },
        },
      },
    ],
  });
}

function buildMat2Timeline(): TimelineJSON {
  const example =
    "6 artı 2 çarpı 4 işleminde önce 2 çarpı 4 eşittir 8 yapılır, sonra 6 artı 8 eşittir 14 bulunur.";
  const listenText = [
    "Merhaba sevgili çocuklar! Ben Matematik öğretmenin Selim.",
    "Bugün birden fazla işlem yan yana geldiğinde hangisine ilk yol vereceğimizi, yani işlem önceliğini öğreneceğiz.",
    example,
    "Bugün Neler Öğrendik? Önce üslü ifadeler ve parantez içi, sonra çarpma veya bölme, en son toplama veya çıkarma yapılır.",
  ].join(" ");
  const exampleMarked = insertSpeechHook(example, "2 çarpı 4", "showPriorityStep");

  return buildLessonGraphTimeline({
    lessonKey: "jr_06_mat-2",
    title: "İşlem Önceliği Kuralları",
    listenText,
    example,
    exampleMarked,
    audioPath: "/media/junior/audio/jr_06_mat-2.mp3",
    layout: "common-divisor",
    stageTitle: "İşlem Önceliği",
    stageSubtitle: "Üs → Parantez → Çarpma/Bölme → Toplama/Çıkarma",
    chapterTitle: "İşlem Sırası Robotu",
    exampleKeyframes: [
      {
        hook: "showPriorityStep",
        offsetMs: 0,
        op: "SHOW_COMMON_DIVISOR",
        params: {
          left: 6,
          right: 8,
          gcd: 14,
          lcm: 14,
          note: "6 + (2 × 4) = 6 + 8 = 14",
        },
      },
    ],
  });
}

function buildMat3Timeline(): TimelineJSON {
  const example =
    "6 çarpı parantez içinde 5 artı 3 işlemi, 6 çarpı 5 artı 6 çarpı 3 eşittir 30 artı 18 yani 48 eder.";
  const listenText = [
    "Merhaba sevgili çocuklar! Ben Matematik öğretmenin Selim.",
    "Bugün çarpma işleminin toplama ve çıkarma üzerine dağılma özelliğini ve ortak çarpan parantezine almayı öğreneceğiz.",
    example,
    "Bugün Neler Öğrendik? Parantez dışındaki çarpan, içerideki her terimle ayrı ayrı çarpılır.",
  ].join(" ");
  const exampleMarked = insertSpeechHook(example, "6 çarpı 5", "showAreaSplit");

  return buildLessonGraphTimeline({
    lessonKey: "jr_06_mat-3",
    title: "Ortak Çarpan ve Dağılma Özelliği",
    listenText,
    example,
    exampleMarked,
    audioPath: "/media/junior/audio/jr_06_mat-3.mp3",
    layout: "area",
    stageTitle: "Dağılma Özelliği",
    stageSubtitle: "Dikdörtgen Alan Parçalama: 6 × (5 + 3)",
    chapterTitle: "Bahçe Bölücü",
    exampleKeyframes: [
      {
        hook: "showAreaSplit",
        offsetMs: 0,
        op: "SHOW_AREA",
        params: {
          base: 8,
          height: 6,
          parallelogram: 48,
          triangle: 30,
          note: "6 × (5 + 3) = (6 × 5) + (6 × 3) = 30 + 18 = 48",
        },
      },
    ],
  });
}

function buildMat4Timeline(): TimelineJSON {
  const example =
    "36 bilyenin 12 tanesini ayırırsak 24 bilye kalır; 24 bilyeyi 4 kutuya eşit paylaştırırsak her kutuya 6 bilye düşer.";
  const listenText = [
    "Merhaba sevgili çocuklar! Ben Matematik öğretmenin Selim.",
    "Bugün doğal sayılarla dört işlem problemlerini adım adım kurup çözmeyi öğreneceğiz.",
    example,
    "Bugün Neler Öğrendik? Problemi verilenler ve istenenler diye ayırıp işlemleri sırayla kurarız.",
  ].join(" ");
  const exampleMarked = insertSpeechHook(example, "24 bilyeyi 4 kutuya", "showProblemScale");

  return buildLessonGraphTimeline({
    lessonKey: "jr_06_mat-4",
    title: "Doğal Sayılarla Dört İşlem Problemleri",
    listenText,
    example,
    exampleMarked,
    audioPath: "/media/junior/audio/jr_06_mat-4.mp3",
    layout: "number-line",
    stageTitle: "Dört İşlem Problemleri",
    stageSubtitle: "Adım Adım Çözüm Planı",
    chapterTitle: "Problem Terazisi",
    exampleKeyframes: [
      {
        hook: "showProblemScale",
        offsetMs: 0,
        op: "SHOW_NUMBER_LINE",
        params: {
          focus: 6,
          focusLabel: "(36 − 12) ÷ 4 = 6",
          relations: ["1. Adım: 36 − 12 = 24", "2. Adım: 24 ÷ 4 = 6"],
        },
      },
    ],
  });
}

/**
 * `jr_06_mat-1`: Üslü İfadeler (Modüler Şablon)
 */
export const JR_06_MAT_1_BLUEPRINT: JuniorLessonBlueprint = {
  lessonKey: "jr_06_mat-1",
  title: "Üslü İfadeler ve Tekrarlı Çarpım",
  grade: 6,
  subject: "Matematik",
  content: {
    lessonKey: "jr_06_mat-1",
    title: "Üslü İfadeler ve Tekrarlı Çarpım",
    mebCode: "MAT.6.1.01",
    heroQuestion: "Bir sayıyı kendisiyle defalarca çarpmayı tek bakışta nasıl yazarız?",
    heroFocus: "Taban ve üs (kuvvet) kavramları; 2³ = 2 × 2 × 2 = 8 ile 2 × 3 = 6 tuzağını ayırma.",
    conceptSummary:
      "Taban çarpılan sayıdır; üs ise tabanın kaç kez yan yana yazılıp çarpılacağını gösterir. 0 ve 1'in kuvvetleri ile 10'un kuvvetlerindeki sıfır sayısı bu kuleyle okunur.",
    outcomes: [
      "Üslü ifadeyi tekrarlı çarpım olarak modeller ve değerini hesaplar.",
      "Taban ile üssü doğrudan çarpma yanılgısına (2³ ≠ 2 × 3) düşmez.",
      "0 ve 1'in kuvvetlerini ayırt eder: sıfırdan farklı n için n⁰ = 1 ve n¹ = n.",
      "10'un kuvvetlerinde sondaki sıfır sayısının üsse eşit olduğunu gösterir.",
    ],
  },
  badge: {
    icon: "🏅",
    chipLabel: "🏅 Üs Kulesi Mimarı",
    modalTitle: "Üs Kulesi Mimarı Rozeti",
    modalSubtitle: "Taban ve üs kulesini kurdun; 0, 1 ve 10'un kuvvetlerini ayırt ettin!",
    thirdStepLabel: "3. Üs Dedektifi",
  },
  tutor: {
    teacherName: JUNIOR_LIVE_TUTOR_TEACHER,
    welcomeMessage:
      "Merhaba, ben Matematik öğretmenin Selim. Üs kulesinde tabanı ve kuvveti birlikte okuyalım. Cevabı ben söylemem; sen kuleyi kur, ben ipucu vereyim.",
    quickChips: [
      { id: "exponent", emoji: "🗼", label: "Üs ne işe yarar? Tabanla karıştırmadan anlatır mısın?" },
      { id: "zero-one", emoji: "0️⃣", label: "0 ve 1'in kuvvetleri neden özeldir?" },
      { id: "tens", emoji: "🔟", label: "10'un kuvvetlerinde kaç tane sıfır olduğunu nasıl bulurum?" },
    ],
  },
  simulations: [
    {
      id: "exponent-tower",
      label: "🗼 Üs Kulesi Lab",
      activeClass: "border-cyan-500 bg-cyan-50 text-cyan-950",
      summary: "Taban ve üssü seç; bloklar katlanarak kule olsun. Doğru sonuçta alkış, yanlışta Ooooo!",
    },
  ],
  tactileRules: {
    matchTargets: { m1: "r1", m2: "r2", m3: "r3", m4: "r4" },
    gapAnswers: {
      g1: ["8", "sekiz"],
      g2: ["1", "bir"],
      g3: ["3", "üç", "uc"],
    },
    rocketRules: {
      e23: ["r-mul"],
      e70: ["r-unit"],
      e14: ["r-unit"],
      e103: ["r-ten"],
    },
    explanations: {
      match:
        "Taban tekrar çarpılan sayıdır. Üs, kaç kez çarpılacağını söyler. 5¹ tabanın kendisidir. 10² = 100 olduğu için sonda 2 sıfır vardır.",
      cloze:
        "2³ = 2 × 2 × 2 = 8. Sıfırdan farklı bir sayının 0. kuvveti 1'dir. 10³ ifadesinin sonunda 3 sıfır vardır.",
      puzzle:
        "2³ tekrarlı çarpımdır. 7⁰ ve 1⁴ sonucu 1'dir. 10³, 10'un kuvvetidir; sonda 3 sıfır bulunur.",
    },
  },
  notes: {
    hint: "trap",
    example: "2³ = 2 × 2 × 2 = 8. 5¹ = 5. 7⁰ = 1. 10³ = 1000; sonda 3 sıfır vardır.",
    warning:
      "2³ ifadesi 2 × 3 demek değildir. Üs, tabanı kendisiyle kaç kez çarpacağını söyler. 2³ = 8, 2 × 3 = 6 tuzağıdır.",
    recap: [
      "Taban çarpılan sayıdır; üs tekrar sayısını söyler.",
      "Sıfırdan farklı bir sayının 0. kuvveti 1, 1. kuvveti kendisidir. 1'in her kuvveti 1'dir.",
      "10'un kuvvetinde sondaki sıfırların sayısı üsse eşittir: 10² = 100, 10³ = 1000.",
    ],
    lifeUse:
      "Bir klasör 2 kez, sonra tekrar 2 kez katlandığında içindeki dosya sayısı üs kulesi gibi büyür. 10, 100, 1000 yazarken de eklediğin sıfır sayısı, 10'un üssüdür.",
  },
  resolveTimeline: buildMat1Timeline,
};

/**
 * `jr_06_mat-2`: İşlem Önceliği (Modüler Şablon)
 */
export const JR_06_MAT_2_BLUEPRINT: JuniorLessonBlueprint = {
  lessonKey: "jr_06_mat-2",
  title: "İşlem Önceliği Kuralları",
  grade: 6,
  subject: "Matematik",
  content: {
    lessonKey: "jr_06_mat-2",
    title: "İşlem Önceliği Kuralları",
    mebCode: "MAT.6.1.02",
    heroQuestion: "Aynı satırda hem toplama hem çarpma varsa hangi işlem önce yapılır?",
    heroFocus: "Üslü İfade → Parantez İçi → Çarpma/Bölme → Toplama/Çıkarma öncelik sırası.",
    conceptSummary:
      "İşlem önceliği trafik ışıklarına benzer: önce üs ve parantez, sonra çarpma/bölme, en son toplama/çıkarma geçer.",
    outcomes: [
      "İşlem önceliği sırasını (Üs → Parantez → Çarpma/Bölme → Toplama/Çıkarma) uygular.",
      "Soldan sağa rastgele işlem yapma tuzağını fark eder.",
      "Parantez eklemenin işlem sonucunu nasıl değiştirdiğini gösterir.",
    ],
  },
  badge: {
    icon: "⚙️",
    chipLabel: "🏅 İşlem Ustası",
    modalTitle: "İşlem Önceliği Ustası Rozeti",
    modalSubtitle: "Parantez, üs ve çarpma önceliğini doğru sırayla çalıştırdın!",
    thirdStepLabel: "3. Öncelik Sıralaması",
  },
  tutor: {
    teacherName: JUNIOR_LIVE_TUTOR_TEACHER,
    welcomeMessage: JUNIOR_LIVE_TUTOR_WELCOME,
    quickChips: [
      { id: "example", emoji: "💡", label: "6 + 2 × 4 işleminde neden önce çarpma yapılır?" },
      { id: "brackets", emoji: "🔍", label: "Parantez gelince sıra nasıl değişir?" },
      { id: "ask-one", emoji: "🎯", label: "Bana işlem önceliğiyle ilgili 1 soru sor!" },
    ],
  },
  simulations: [
    {
      id: "ops-priority",
      label: "⚙️ İşlem Önceliği Robotu",
      activeClass: "border-violet-500 bg-violet-50 text-violet-950",
      summary: "İfadedeki doğru ilk adımı seçerek robotu hedefe ulaştır.",
    },
    ...MAT_5_SIMULATION_TABS.slice(0, 2),
  ],
  tactileRules: {
    matchTargets: { m1: "r1", m2: "r2", m3: "r3", m4: "r4" },
    gapAnswers: {
      g1: ["çarpma", "2x4", "8"],
      g2: ["parantez", "paranteziçi"],
      g3: ["14", "ondört"],
    },
  },
  resolveTimeline: buildMat2Timeline,
};

/**
 * `jr_06_mat-3`: Ortak Çarpan ve Dağılma Özelliği (Modüler Şablon)
 */
export const JR_06_MAT_3_BLUEPRINT: JuniorLessonBlueprint = {
  lessonKey: "jr_06_mat-3",
  title: "Ortak Çarpan ve Dağılma Özelliği",
  grade: 6,
  subject: "Matematik",
  content: {
    lessonKey: "jr_06_mat-3",
    title: "Ortak Çarpan ve Dağılma Özelliği",
    mebCode: "MAT.6.1.03",
    heroQuestion: "Bir dikdörtgen bahçeyi iki parçaya bölünce toplam alan neden değişmez?",
    heroFocus: "a × (b + c) = a × b + a × c dağılma özelliği ve ortak çarpan parantezine alma.",
    conceptSummary:
      "Çarpmanın toplama ve çıkarma üzerine dağılma özelliği büyük çarpımları zihinden kolayca yapmamızı sağlar.",
    outcomes: [
      "Çarpma işleminin toplama ve çıkarma üzerine dağılma özelliğini alan modeliyle gösterir.",
      "İki çarpımın toplamını ortak çarpan parantezine alır.",
      "Zihinden çarpma işlemlerinde dağılma özelliğini kullanır.",
    ],
  },
  badge: {
    icon: "📐",
    chipLabel: "🏅 Dağılma Mimarı",
    modalTitle: "Dağılma Mimarı Rozeti",
    modalSubtitle: "Dikdörtgen bahçe alanlarını ortak çarpanla kusursuz birleştirdin!",
    thirdStepLabel: "3. Alan Bulmacası",
  },
  tutor: {
    teacherName: JUNIOR_LIVE_TUTOR_TEACHER,
    welcomeMessage: JUNIOR_LIVE_TUTOR_WELCOME,
    quickChips: [
      { id: "example", emoji: "💡", label: "6 × (5 + 3) işlemini bahçe modeliyle açıklar mısın?" },
      { id: "factor", emoji: "🔍", label: "Ortak çarpan parantezine almayı nasıl yapıyoruz?" },
      { id: "ask-one", emoji: "🎯", label: "Bana dağılma özelliğiyle ilgili 1 soru sor!" },
    ],
  },
  simulations: [
    {
      id: "distribute-area",
      label: "📐 Dikdörtgen Bahçe (Dağılma)",
      activeClass: "border-emerald-600 bg-emerald-50 text-emerald-950",
      summary: "Bahçenin kenarlarını bölerek a × (b + c) = a×b + a×c eşitliğini canlı gör.",
    },
    ...MAT_5_SIMULATION_TABS.slice(0, 2),
  ],
  tactileRules: {
    matchTargets: { m1: "r1", m2: "r2", m3: "r3", m4: "r4" },
    gapAnswers: {
      g1: ["48", "kırksekiz"],
      g2: ["6", "altı"],
      g3: ["dağılma", "dagilma"],
    },
  },
  resolveTimeline: buildMat3Timeline,
};

/**
 * `jr_06_mat-4`: Doğal Sayılarla Dört İşlem Problemleri (Modüler Şablon)
 */
export const JR_06_MAT_4_BLUEPRINT: JuniorLessonBlueprint = {
  lessonKey: "jr_06_mat-4",
  title: "Doğal Sayılarla Dört İşlem Problemleri",
  grade: 6,
  subject: "Matematik",
  content: {
    lessonKey: "jr_06_mat-4",
    title: "Doğal Sayılarla Dört İşlem Problemleri",
    mebCode: "MAT.6.1.04",
    heroQuestion: "Uzun bir matematik problemini tek seferde çözmeye çalışmak yerine nasıl parçalarız?",
    heroFocus: "Verilenleri ayırma, ara adımı bulma ve kalanı eşit paylaştırma stratejisi.",
    conceptSummary:
      "Çok adımlı problemlerde önce fazlalık veya eksiklik çıkarılır, ardından kalan miktar eşit gruplara bölünür.",
    outcomes: [
      "Doğal sayılarla dört işlem gerektiren gerçek yaşam problemlerini çözer.",
      "Problem çözüm adımlarını denklem ve terazi modeliyle doğrular.",
      "Bulduğu sonucun problem bağlamına uygunluğunu kontrol eder.",
    ],
  },
  badge: {
    icon: "🧭",
    chipLabel: "🏅 Problem Dedektifi",
    modalTitle: "Problem Dedektifi Rozeti",
    modalSubtitle: "Çok adımlı doğal sayı problemlerini adım adım çözüp doğruladın!",
    thirdStepLabel: "3. Adım Sıralaması",
  },
  tutor: {
    teacherName: JUNIOR_LIVE_TUTOR_TEACHER,
    welcomeMessage: JUNIOR_LIVE_TUTOR_WELCOME,
    quickChips: [
      { id: "example", emoji: "💡", label: "Problemi adım adım kurmayı bir örnekle gösterir misin?" },
      { id: "steps", emoji: "🔍", label: "Hangi işlemden başlayacağımı nasıl anlarım?" },
      { id: "ask-one", emoji: "🎯", label: "Bana iki adımlı 1 problem sor!" },
    ],
  },
  simulations: [
    {
      id: "problem-steps",
      label: "🧭 Problem Çözüm Terazisi",
      activeClass: "border-amber-500 bg-amber-50 text-amber-950",
      summary: "Toplam, ayrılan miktar ve grup sayısını seçerek iki adımlı problemi modelle.",
    },
    ...MAT_5_SIMULATION_TABS.slice(0, 2),
  ],
  tactileRules: {
    matchTargets: { m1: "r1", m2: "r2", m3: "r3", m4: "r4" },
    gapAnswers: {
      g1: ["24", "yirmidört"],
      g2: ["6", "altı"],
      g3: ["bölme", "bolme"],
    },
  },
  resolveTimeline: buildMat4Timeline,
};

/**
 * `jr_06_mat-5`: Çarpanlar, Katlar ve Bölünebilme (Amiral Gemisi Gold Master)
 */
export const JR_06_MAT_5_BLUEPRINT: JuniorLessonBlueprint = {
  lessonKey: "jr_06_mat-5",
  title: MAT_5_CANONICAL_TITLE,
  grade: 6,
  subject: "Matematik",
  content: {
    lessonKey: "jr_06_mat-5",
    title: MAT_5_CANONICAL_TITLE,
    mebCode: "MAT.6.1.1 / MAT.6.1.2",
    heroQuestion: MAT_5_HERO_QUESTION,
    heroFocus: MAT_5_HERO_FOCUS,
    conceptSummary:
      "Çarpan bir sayıyı kalansız bölen sayıdır; kat ise o sayının katlanarak büyüyen hâlidir. 2, 3, 4, 5, 6, 9 ve 10 kuralları dört dedektif ekibiyle çözülür.",
    outcomes: [
      "Son Basamak Dedektifleri (2, 5, 10): Birler basamağına bak!",
      "Son İki Basamak Dedektifi (4): Son iki basamak 00 veya 4'ün katı!",
      "Rakam Toplamı Dedektifleri (3, 9): Rakamları topla, kata bak!",
      "Çifte Koşul Dedektifi (6): Hem 2'ye hem 3'e bölünen çift sayılar!",
    ],
  },
  badge: {
    icon: "🕵️‍♂️",
    chipLabel: "🏅 Bölünebilme Dedektifi",
    modalTitle: "Bölünebilme Dedektifi Rozeti",
    modalSubtitle: "2, 5, 10 son basamak ve 3, 9 rakam toplama görevlerini kusursuz çözdün!",
    thirdStepLabel: "3. Dedektif Bulmacası",
  },
  tutor: {
    teacherName: JUNIOR_LIVE_TUTOR_TEACHER,
    welcomeMessage: JUNIOR_LIVE_TUTOR_WELCOME,
    quickChips: JUNIOR_LIVE_TUTOR_QUICK_CHIPS,
  },
  simulations: MAT_5_SIMULATION_TABS,
  tactileRules: {
    matchTargets: {
      m1: "r1",
      m2: "r2",
      m3: "r3",
      m4: "r4",
    },
    gapAnswers: {
      g1: ["5", "beş", "5'e"],
      g2: ["3", "üç", "3'e"],
      g3: ["çarpanları", "çarpanı", "bölenleri", "carpanlari"],
    },
    rocketRules: {
      n24: ["r2", "r3"],
      n15: ["r5", "r3"],
      n30: ["r2", "r5", "r3"],
      n18: ["r3", "r2"],
    },
  },
  resolveTimeline: () => getPilotTimelineForLesson("jr_06_mat-5"),
};
