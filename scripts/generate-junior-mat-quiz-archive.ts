/**
 * Bir kerelik üretim: lib/junior/quiz/mat/{1..25}.ts
 * Çalıştır: npx tsx scripts/generate-junior-mat-quiz-archive.ts
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
    title: "Üslü ifadede taban ve üs",
    tellGuides: [
      "Taban ile üs arasındaki farkı bir örnekle anlatabilir misin?",
      "2 üssü 3 ile 2 çarpı 3 neden aynı sonuç değildir?",
      "Üslü ifadeyi tekrarlı çarpım olarak nasıl kurarsın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "2 üssü 3 ifadesinde taban ve üs hangisidir?",
        options: ["Taban 2, üs 3", "Taban 3, üs 2", "Taban 5, üs 1", "Taban 6, üs 0"],
        correctAnswerIndex: 0,
        hint: "Alttaki sayı tabandır. Üstte küçük yazılan sayı üstür.",
        explanation:
          "Adım 1: Alttaki büyük sayı tabandır; burada 2. Adım 2: Üstteki küçük sayı üstür; burada 3. Adım 3: Yani 2 üssü 3 deriz.",
      },
      {
        id: "q2",
        level: "apply",
        question: "2 üssü 3 kaç eder?",
        options: ["6", "8", "5", "9"],
        correctAnswerIndex: 1,
        hint: "Üs 3 ise tabanı üç kez yan yana çarp.",
        explanation:
          "Adım 1: 2 üssü 3, 2 çarpı 2 çarpı 2 demektir. Adım 2: 2 çarpı 2, 4 eder. Adım 3: 4 çarpı 2, 8 eder.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Ela oyununda skor her tur ikiye katlanıyor. Üç tur sonra skor 2 üssü 3 kadar büyüyor. Kaç kat büyümüştür?",
        options: ["6 kat", "8 kat", "5 kat", "9 kat"],
        correctAnswerIndex: 1,
        hint: "2 üssü 3 ile 2 çarpı 3 aynı iş değildir.",
        explanation:
          "Adım 1: Her tur ikiyle çarpılmak 2 üssü 3 demektir. Adım 2: 2 çarpı 2 çarpı 2, 8 eder. Adım 3: Skor 8 kat büyümüştür. 2 çarpı 3 olsa 6 kat olurdu; o yanlış tuzaktır.",
      },
    ],
  },
  {
    n: 2,
    title: "İşlem önceliği",
    tellGuides: [
      "Parantez, üs, çarpma ve toplama sırasını kendi cümlenle sıralayabilir misin?",
      "3 artı 4 çarpı 2 neden 11 eder, 14 etmez?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "İşlem önceliğinde ilk bakılan yer hangisidir?",
        options: ["Parantez içi", "Toplama", "Çıkarma", "Yalnızca soldaki sayı"],
        correctAnswerIndex: 0,
        hint: "Önce parantez, sonra üs, sonra çarpma ve bölme gelir.",
        explanation:
          "Adım 1: Parantez varsa önce içi biter. Adım 2: Sonra üs gelir. Adım 3: Ardından çarpma ve bölme, en sonda toplama ve çıkarma yapılır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "3 artı 4 çarpı 2 kaç eder?",
        options: ["14", "11", "10", "24"],
        correctAnswerIndex: 1,
        hint: "Çarpma, toplamanın önüne geçer.",
        explanation:
          "Adım 1: Önce 4 çarpı 2 yapılır; 8 eder. Adım 2: Sonra 3 artı 8 yapılır. Adım 3: Sonuç 11'dir. Önce toplarsan 14 bulursun; bu tuzaktır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Market fişinde 3 liralık silgi ve iki kalem var. Her kalem 4 lira. 3 artı 4 çarpı 2 ne kadar tutar?",
        options: ["11 lira", "14 lira", "7 lira", "24 lira"],
        correctAnswerIndex: 0,
        hint: "Önce kalemlerin tutarını çarp, sonra silgiyi ekle.",
        explanation:
          "Adım 1: İki kalem 4 çarpı 2, 8 liradır. Adım 2: Silgi 3 liradır. Adım 3: 3 artı 8, 11 liradır.",
      },
    ],
  },
  {
    n: 3,
    title: "Ortak çarpan ve dağılma",
    tellGuides: [
      "Dağılma özelliğini bir çarpım örneğiyle anlatabilir misin?",
      "Ortak çarpanı parantezin önüne çıkarmak ne işe yarar?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Dağılma özelliği neyi söyler?",
        options: [
          "Çarpımı toplama üzerine yayar",
          "Yalnızca toplamayı siler",
          "Paydayı büyütür",
          "Üssü yaralar",
        ],
        correctAnswerIndex: 0,
        hint: "6 çarpı (5 artı 3) ile 6 çarpı 5 artı 6 çarpı 3 aynı iştir.",
        explanation:
          "Adım 1: Dağılma, çarpımı toplamanın her parçasına yayar. Adım 2: Ortak çarpan parantezin önünde kalır. Adım 3: Sonuç değişmez, yazım kolaylaşır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "6 çarpı 8 ile 6 çarpı 5 artı 6 çarpı 3 için doğru olan hangisidir?",
        options: ["İkisi de 48 eder", "İlki 48, ikincisi 30 eder", "İkisi de 18 eder", "İlki 14 eder"],
        correctAnswerIndex: 0,
        hint: "8, 5 artı 3 diye açılabilir.",
        explanation:
          "Adım 1: 6 çarpı 8, 48 eder. Adım 2: 6 çarpı 5, 30; 6 çarpı 3, 18 eder. Adım 3: 30 artı 18, 48 eder. İkisi aynıdır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Sınıfta 6 sıra var. Her sırada 5 defter ve 3 kalem duruyor. Toplam eşya sayısı nasıl bulunur?",
        options: [
          "6 çarpı (5 artı 3)",
          "6 artı 5 artı 3",
          "6 çarpı 5 eksi 3",
          "Yalnızca 5 artı 3",
        ],
        correctAnswerIndex: 0,
        hint: "Her sıradaki eşyayı topla, sonra sıra sayısıyla çarp.",
        explanation:
          "Adım 1: Bir sırada 5 artı 3, 8 eşya vardır. Adım 2: 6 sıra için 6 çarpı 8 yapılır. Adım 3: Dağılma ile 6 çarpı 5 artı 6 çarpı 3 de aynı 48'i verir.",
      },
    ],
  },
  {
    n: 4,
    title: "Doğal sayı problemleri",
    tellGuides: [
      "Bir problemde önce hangi işi seçtiğini nasıl anlarsın?",
      "4 sıra ve her sırada 7 kitap varken neden 4 artı 7 yanlış yoldur?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Doğal sayı probleminde ilk adım nedir?",
        options: [
          "Sorulan işi seçmek",
          "Hemen en büyük sayıyı yazmak",
          "Paydayı eşitlemek",
          "Üssü bulmak",
        ],
        correctAnswerIndex: 0,
        hint: "Önce ne istendiğini oku; sonra işlemi kur.",
        explanation:
          "Adım 1: Problem ne soruyorsa o iş seçilir. Adım 2: Sayılar bu işe yerleştirilir. Adım 3: Sonuç, sorunun cevabına oturur.",
      },
      {
        id: "q2",
        level: "apply",
        question: "4 sırada her sırada 7 kitap varsa toplam kaç kitap vardır?",
        options: ["11", "28", "47", "3"],
        correctAnswerIndex: 1,
        hint: "Her sıradaki kitapları sıra sayısıyla çarp.",
        explanation:
          "Adım 1: Her sırada 7 kitap vardır. Adım 2: 4 sıra için 4 çarpı 7 yapılır. Adım 3: Sonuç 28'dir. 4 artı 7, 11 eder; bu yanlış yoldur.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Kütüphanede 5 rafta eşit sayıda kitap var. Toplam 40 kitapsa bir rafta kaç kitap vardır?",
        options: ["8", "45", "35", "5"],
        correctAnswerIndex: 0,
        hint: "Toplamı raf sayısına böl.",
        explanation:
          "Adım 1: 40 kitap 5 rafa eşit dağılır. Adım 2: 40 bölü 5 yapılır. Adım 3: Her rafta 8 kitap vardır.",
      },
    ],
  },
  {
    n: 5,
    title: "Çarpanlar, katlar ve bölünebilme",
    tellGuides: [
      "Çarpan ile kat arasındaki farkı bir örnekle anlatabilir misin?",
      "2, 5 ve 10 ile 3 ve 9 kurallarını nasıl ayırırsın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Bir sayının çarpanı nedir?",
        options: [
          "Onu kalansız bölen sayı",
          "Ondan büyük her sayı",
          "Yalnızca 1",
          "Paydaya yazılan sayı",
        ],
        correctAnswerIndex: 0,
        hint: "Çarpan kalansız böler. Kat, çarpımla büyür.",
        explanation:
          "Adım 1: Çarpan, sayıyı kalansız böler. Adım 2: Kat, sayının 1, 2, 3… ile çarpılmış hâlleridir. Adım 3: 3, 12'nin çarpanıdır; 12, 3'ün katıdır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "24 sayısı hangi kurala göre 3'e tam bölünür?",
        options: [
          "Rakamlar toplamı 3'ün katıdır",
          "Son rakamı 4'tür",
          "Çift olduğu için",
          "10'dan büyük olduğu için",
        ],
        correctAnswerIndex: 0,
        hint: "3 ve 9 için rakam toplamına bak.",
        explanation:
          "Adım 1: 2 artı 4, 6 eder. Adım 2: 6, 3'ün katıdır. Adım 3: Bu yüzden 24, 3'e kalansız bölünür.",
      },
      {
        id: "q3",
        level: "skill",
        question: "24 kişiyi beşerli dizerken neden 4 kişi açıkta kalır?",
        options: [
          "24, 5'e tam bölünmez",
          "24, 2'ye bölünmez",
          "24, 3'e bölünmez",
          "24 asal sayıdır",
        ],
        correctAnswerIndex: 0,
        hint: "Son rakama bak; 4, 0 veya 5 değildir.",
        explanation:
          "Adım 1: 5'e bölünebilmek için son rakam 0 veya 5 olmalıdır. Adım 2: 24'ün sonu 4'tür. Adım 3: 24 bölü 5, 4 kalan verir; dört kişi açıkta kalır.",
      },
    ],
  },
  {
    n: 6,
    title: "Asal sayılar ve asal çarpanlar",
    tellGuides: [
      "Asal sayıyı kendi cümlenle tanımlayabilir misin?",
      "1 neden asal değildir? 12'yi asal çarpanlara nasıl ayırırsın?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Asal sayı için doğru olan hangisidir?",
        options: [
          "1'den büyüktür ve yalnız 1 ile kendisine bölünür",
          "Yalnızca çift sayılardır",
          "1 de asaldır",
          "Her tek sayı asaldır",
        ],
        correctAnswerIndex: 0,
        hint: "1 asal değildir. 2 en küçük asal sayıdır.",
        explanation:
          "Adım 1: Asal sayı 1'den büyüktür. Adım 2: Yalnız 1 ve kendisiyle kalansız bölünür. Adım 3: 1'in tek böleni kendisidir; asal sayılmaz.",
      },
      {
        id: "q2",
        level: "apply",
        question: "12 sayısının asal çarpanlara ayrılmış hâli hangisidir?",
        options: ["2 çarpı 2 çarpı 3", "4 çarpı 3", "6 çarpı 2", "1 çarpı 12"],
        correctAnswerIndex: 0,
        hint: "Asal olmayan çarpanları tekrar böl.",
        explanation:
          "Adım 1: 12, 2 çarpı 6 diye açılır. Adım 2: 6, 2 çarpı 3'tür. Adım 3: Hepsi asal olunca 2 çarpı 2 çarpı 3 kalır.",
      },
      {
        id: "q3",
        level: "skill",
        question: "Hangisi asal sayıdır?",
        options: ["9", "15", "7", "1"],
        correctAnswerIndex: 2,
        hint: "9 ve 15 başka çarpan taşır. 1 asal değildir.",
        explanation:
          "Adım 1: 9, 3 çarpı 3'tür; asal değildir. Adım 2: 15, 3 çarpı 5'tir. Adım 3: 7 yalnız 1 ve 7'ye bölünür; asaldır.",
      },
    ],
  },
  {
    n: 7,
    title: "Ortak bölen ve ortak kat",
    tellGuides: [
      "En büyük ortak bölen ile en küçük ortak katı nasıl ayırırsın?",
      "8 ve 12 için EBOB ve EKOK nasıl bulunur?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "En büyük ortak bölen (EBOB) neyi seçer?",
        options: [
          "İki sayıyı da bölen en büyük sayıyı",
          "İki sayının toplamını",
          "En küçük asal sayıyı",
          "Yalnızca 1'i",
        ],
        correctAnswerIndex: 0,
        hint: "Bölen küçük listede, kat büyük listede durur.",
        explanation:
          "Adım 1: Ortak bölenler iki sayıyı da böler. Adım 2: Bunların en büyüğü EBOB'tur. Adım 3: Ortak katların en küçüğü EKOK'tur.",
      },
      {
        id: "q2",
        level: "apply",
        question: "8 ve 12 için en büyük ortak bölen kaçtır?",
        options: ["2", "4", "24", "96"],
        correctAnswerIndex: 1,
        hint: "8'in bölenleri: 1, 2, 4, 8. Ortak olanların en büyüğünü seç.",
        explanation:
          "Adım 1: 8'in bölenleri 1, 2, 4, 8. Adım 2: 12'nin bölenleri 1, 2, 3, 4, 6, 12. Adım 3: Ortakların en büyüğü 4'tür.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "İki zil 8 ve 12 dakikada bir çalıyor. Aynı anda çaldıktan sonra yeniden birlikte kaçıncı dakikada çalar?",
        options: ["4", "20", "24", "96"],
        correctAnswerIndex: 2,
        hint: "Bu soru en küçük ortak katı ister.",
        explanation:
          "Adım 1: Ortak katlar 24, 48, 72… diye gider. Adım 2: En küçüğü 24'tür. Adım 3: Ziller 24. dakikada yeniden birlikte çalar.",
      },
    ],
  },
  {
    n: 8,
    title: "Kümeler",
    tellGuides: [
      "Kümenin elemanı belli olmak ne demektir?",
      "Boş küme ile birleşimde ortak elemanın bir kez yazılmasını anlatabilir misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Boş küme için doğru olan hangisidir?",
        options: [
          "Hiç elemanı yoktur",
          "Yalnızca 0 elemanıdır",
          "Her sayıyı taşır",
          "İki elemanı vardır",
        ],
        correctAnswerIndex: 0,
        hint: "0 bir sayı olabilir; boş küme ise hiç eleman taşımaz.",
        explanation:
          "Adım 1: Kümenin elemanı bellidir. Adım 2: Boş kümede hiç eleman yoktur. Adım 3: 0, boş küme demek değildir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "A = {1, 2, 3} ve B = {3, 4} birleşiminde kaç eleman vardır?",
        options: ["5", "4", "3", "2"],
        correctAnswerIndex: 1,
        hint: "Ortak eleman birleşimde bir kez yazılır.",
        explanation:
          "Adım 1: Birleşim {1, 2, 3, 4} olur. Adım 2: 3 ortak olduğu için bir kez yazılır. Adım 3: Toplam 4 eleman vardır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Sınıfta 3 kişi hem futbol hem basket oynuyor. Futbol kümesi 8, basket kümesi 6 kişiyse birleşimde en az kaç kişi vardır?",
        options: ["11", "14", "3", "8"],
        correctAnswerIndex: 0,
        hint: "Ortakları bir kez say: 8 artı 6 eksi 3.",
        explanation:
          "Adım 1: 8 artı 6, 14 eder ama ortaklar iki kez sayılmıştır. Adım 2: Ortak 3 çıkarılır. Adım 3: Birleşimde 11 kişi kalır.",
      },
    ],
  },
  {
    n: 9,
    title: "Tam sayılar ve mutlak değer",
    tellGuides: [
      "Sayı doğrusunda sağdaki sayının neden daha büyük olduğunu anlatabilir misin?",
      "Mutlak değerin 0'a uzaklık olduğunu bir örnekle söyleyebilir misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Mutlak değer neyi ölçer?",
        options: [
          "Sayının 0'a uzaklığını",
          "Sayının iki katını",
          "Yalnızca eksi işareti",
          "Paydayı",
        ],
        correctAnswerIndex: 0,
        hint: "Mutlak değer eksi çıkmaz; uzaklık pozitiftir.",
        explanation:
          "Adım 1: Mutlak değer, sayının 0'a uzaklığıdır. Adım 2: Uzaklık eksi olmaz. Adım 3: Eksi 4'ün mutlak değeri 4'tür.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Eksi 4'ün mutlak değeri kaçtır?",
        options: ["-4", "4", "0", "8"],
        correctAnswerIndex: 1,
        hint: "0'a uzaklığı say; işaret uzaklıkta kalmaz.",
        explanation:
          "Adım 1: Eksi 4, 0'ın 4 birim solundadır. Adım 2: Uzaklık 4'tür. Adım 3: Mutlak değer 4'tür, eksi 4 değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question: "Termometre eksi 3 dereceyi gösteriyor. 0'a uzaklık kaç derecedir?",
        options: ["3", "-3", "0", "6"],
        correctAnswerIndex: 0,
        hint: "Mutlak değer sorusudur.",
        explanation:
          "Adım 1: Eksi 3, 0'ın 3 birim altındadır. Adım 2: Uzaklık 3'tür. Adım 3: Mutlak değer 3'tür.",
      },
    ],
  },
  {
    n: 10,
    title: "Kesirleri karşılaştırma ve sıralama",
    tellGuides: [
      "Aynı paydada büyük payın neden kazandığını anlatabilir misin?",
      "Birim kesirde büyük paydanın neden küçülttüğünü bir örnekle söyleyebilir misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Paydalar aynıysa hangisi doğrudur?",
        options: [
          "Büyük pay daha büyüktür",
          "Küçük pay daha büyüktür",
          "Paylar önemsizdir",
          "Her zaman eşittirler",
        ],
        correctAnswerIndex: 0,
        hint: "Aynı dilim boyunda daha çok dilim daha büyüktür.",
        explanation:
          "Adım 1: Payda dilimin boyudur. Adım 2: Pay, kaç dilim alındığını söyler. Adım 3: Payda aynıysa büyük pay kazanır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Dörtte üç ile üçte bir karşılaştırıldığında hangisi doğrudur?",
        options: [
          "Dörtte üç daha büyüktür",
          "Üçte bir daha büyüktür",
          "İkisi eşittir",
          "İkisi de birimden küçüktür ve karşılaştırılamaz",
        ],
        correctAnswerIndex: 0,
        hint: "Dörtte üç neredeyse bütün pastadır; üçte bir daha küçüktür.",
        explanation:
          "Adım 1: Dörtte üç, pastanın çoğudur. Adım 2: Üçte bir, pastanın küçük parçasıdır. Adım 3: Dörtte üç daha büyüktür.",
      },
      {
        id: "q3",
        level: "skill",
        question: "Bir pizzanın dörtte üçü yenmiş, diğerinin üçte biri yenmiş. Hangisi daha çok yenmiştir?",
        options: [
          "Dörtte üç yenilen pizza",
          "Üçte bir yenilen pizza",
          "İkisi aynıdır",
          "Karşılaştırılamaz",
        ],
        correctAnswerIndex: 0,
        hint: "Aynı bütün varsay; kesirleri karşılaştır.",
        explanation:
          "Adım 1: Dörtte üç, bütünün büyük kısmıdır. Adım 2: Üçte bir daha küçüktür. Adım 3: Dörtte üç yenilen pizza daha çok yenmiştir.",
      },
    ],
  },
  {
    n: 11,
    title: "Payda aynıyken toplama",
    tellGuides: [
      "Paydalar aynıyken neden yalnız payların toplandığını anlatabilir misin?",
      "Paydayı toplamak neden yanlıştır?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Paydalar aynıysa toplama nasıl yapılır?",
        options: [
          "Yalnız paylar toplanır, payda yerinde kalır",
          "Paydalar da toplanır",
          "Paylar çarpılır",
          "Kesirler ters çevrilir",
        ],
        correctAnswerIndex: 0,
        hint: "Dilim boyu değişmez; dilim sayısı artar.",
        explanation:
          "Adım 1: Payda dilimin boyudur. Adım 2: Aynı boyda dilimler birleşince pay artar. Adım 3: Payda yerinde kalır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Bir bölü dört artı iki bölü dört kaç eder?",
        options: ["Üç bölü dört", "Üç bölü sekiz", "İki bölü dört", "Bir bölü iki"],
        correctAnswerIndex: 0,
        hint: "Payları topla: 1 artı 2. Paydaya dokunma.",
        explanation:
          "Adım 1: Paylar 1 ve 2'dir; 1 artı 2, 3 eder. Adım 2: Payda 4 kalır. Adım 3: Sonuç dörtte üçtür. Üç bölü sekiz tuzaktır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Aynı boy pasta dilimlerinden önce 1, sonra 2 dilim aldın. Pasta 4 dilime bölünmüştü. Ne kadar pasta aldın?",
        options: ["Dörtte üç", "Üç bölü sekiz", "İki bölü dört", "Beş bölü dört"],
        correctAnswerIndex: 0,
        hint: "Payda aynı; payları topla.",
        explanation:
          "Adım 1: Bir bölü dört artı iki bölü dört. Adım 2: Paylar 3 olur, payda 4 kalır. Adım 3: Dörtte üç pasta almışsındır.",
      },
    ],
  },
  {
    n: 12,
    title: "Paydayı eşitleyerek toplama",
    tellGuides: [
      "Paydalar farklıyken önce neden denk kesir kurduğunu anlatabilir misin?",
      "Yarım artı dörtte bir nasıl dörtte üç olur?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Paydalar farklıysa ilk adım nedir?",
        options: [
          "Paydayı eşitleyip denk kesir kurmak",
          "Doğrudan payları toplamak",
          "Paydaları çıkarmak",
          "Kesirleri ters çevirmek",
        ],
        correctAnswerIndex: 0,
        hint: "Aynı dilim boyuna gelmeden pay toplanmaz.",
        explanation:
          "Adım 1: Farklı payda, farklı dilim boyudur. Adım 2: Önce ortak payda bulunur. Adım 3: Denk kesirler yazılıp paylar toplanır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Yarım artı dörtte bir kaç eder?",
        options: ["Dörtte üç", "İki bölü altı", "Üçte iki", "Beşte iki"],
        correctAnswerIndex: 0,
        hint: "Yarım, dörtte ikidir.",
        explanation:
          "Adım 1: Yarım, dörtte ikiye denktir. Adım 2: Dörtte iki artı dörtte bir, dörtte üç eder. Adım 3: İki bölü altı bu işlemin sonucu değildir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Şişenin yarısı dolu. Dörtte bir daha doldurdun. Şişenin kaçı dolu oldu?",
        options: ["Dörtte üç", "Dörtte bir", "İki bölü altı", "Beşte iki"],
        correctAnswerIndex: 0,
        hint: "Yarımı dörtte iki yaz, sonra ekle.",
        explanation:
          "Adım 1: Yarım = dörtte iki. Adım 2: Dörtte bir eklenir. Adım 3: Toplam dörtte üçtür.",
      },
    ],
  },
  {
    n: 13,
    title: "Kesirlerde çarpma ve bölme",
    tellGuides: [
      "Kesir çarpmada pay ve paydanın nasıl işlendiğini anlatabilir misin?",
      "Kesir bölmede ikinci kesiri neden ters çevirirsin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "İki kesri çarparken doğru kural hangisidir?",
        options: [
          "Pay payla, payda paydayla çarpılır",
          "Yalnız paydalar çarpılır",
          "Önce paydalar eşitlenir",
          "İkinci kesir ters çevrilip çıkarılır",
        ],
        correctAnswerIndex: 0,
        hint: "Bölmede ikinci kesir ters çevrilir; çarpmada çevrilmez.",
        explanation:
          "Adım 1: Çarpmada paylar çarpılır. Adım 2: Paydalar çarpılır. Adım 3: Bölmede ise ikinci kesir ters çevrilip çarpılır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Yarımın yarısı kaçtır?",
        options: ["Dörtte bir", "Bir", "İki", "Dörtte üç"],
        correctAnswerIndex: 0,
        hint: "1/2 çarpı 1/2 yap.",
        explanation:
          "Adım 1: 1 çarpı 1, 1 eder. Adım 2: 2 çarpı 2, 4 eder. Adım 3: Sonuç dörtte birdir.",
      },
      {
        id: "q3",
        level: "skill",
        question: "Yarım pizzayı çeyrek dilimlere bölersen kaç dilim çıkar?",
        options: ["2", "1/2", "1/8", "4"],
        correctAnswerIndex: 0,
        hint: "Yarım bölü çeyrek: ikinci kesri ters çevir.",
        explanation:
          "Adım 1: Yarım bölü çeyrek, 1/2 çarpı 4/1 demektir. Adım 2: 4/2, 2 eder. Adım 3: İki çeyrek dilim çıkar.",
      },
    ],
  },
  {
    n: 14,
    title: "Ondalık gösterimi okumak",
    tellGuides: [
      "Virgülün solu ile sağı arasındaki farkı anlatabilir misin?",
      "0,5 ile 0,25'i kesir olarak nasıl okursun?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Ondalık gösterimde virgülün sağı neyi gösterir?",
        options: ["Kesir kısmını", "Yalnızca tam kısmı", "Üssü", "Paydayı siler"],
        correctAnswerIndex: 0,
        hint: "Sol tam, sağ kesirdir.",
        explanation:
          "Adım 1: Virgülün solu tam sayıdır. Adım 2: Sağı kesir kısmıdır. Adım 3: 0,5 yarım; 0,25 dörtte birdir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "0,4 ile 0,35 karşılaştırıldığında hangisi doğrudur?",
        options: ["0,4 daha büyüktür", "0,35 daha büyüktür", "İkisi eşittir", "Karşılaştırılamaz"],
        correctAnswerIndex: 0,
        hint: "0,40 ile 0,35 yazıp bak.",
        explanation:
          "Adım 1: 0,4 yazılırsa 0,40 olur. Adım 2: 40 ile 35 karşılaştırılır. Adım 3: 0,4 daha büyüktür.",
      },
      {
        id: "q3",
        level: "skill",
        question: "Market etiketi 0,5 kg yazıyor. Bu hangi kesre denktir?",
        options: ["Yarım", "Dörtte bir", "Beşte iki", "On ikide bir"],
        correctAnswerIndex: 0,
        hint: "0,5 = 5/10 = 1/2.",
        explanation:
          "Adım 1: 0,5, 5 bölü 10 demektir. Adım 2: Sadeleşince 1/2 olur. Adım 3: Yarım kilogramdır.",
      },
    ],
  },
  {
    n: 15,
    title: "Ondalık sayılarla işlem",
    tellGuides: [
      "Ondalık toplamada virgülleri neden alt alta getirdiğini anlatabilir misin?",
      "10 ile çarpınca virgül neden bir basamak sağa kayar?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Ondalık sayıları toplarken ilk kural nedir?",
        options: [
          "Virgülleri alt alta getirmek",
          "Virgülleri silmek",
          "Paydaları çarpmak",
          "Üssü büyütmek",
        ],
        correctAnswerIndex: 0,
        hint: "Aynı basamaklar üst üste gelsin.",
        explanation:
          "Adım 1: Virgüller alt alta yazılır. Adım 2: Basamaklar hizalanır. Adım 3: Toplama veya çıkarma yapılır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "2,40 artı 1,35 kaç eder?",
        options: ["3,75", "3,65", "4,75", "2,75"],
        correctAnswerIndex: 0,
        hint: "Virgülleri hizala; yüzdeleri topla.",
        explanation:
          "Adım 1: 2,40 ile 1,35 alt alta yazılır. Adım 2: 40 artı 35, 75 eder. Adım 3: Tamlar 2 artı 1, 3 eder; sonuç 3,75'tir.",
      },
      {
        id: "q3",
        level: "skill",
        question: "1,25 metrelik ip 10 kat uzatılırsa yeni uzunluk kaç metre olur?",
        options: ["12,5", "1,250", "0,125", "11,25"],
        correctAnswerIndex: 0,
        hint: "10 ile çarpınca virgül bir basamak sağa kayar.",
        explanation:
          "Adım 1: 1,25 çarpı 10. Adım 2: Virgül bir basamak sağa kayar. Adım 3: Sonuç 12,5 metredir.",
      },
    ],
  },
  {
    n: 16,
    title: "Oran",
    tellGuides: [
      "Oranın sırayı koruduğunu bir örnekle anlatabilir misin?",
      "4'e 6 oranını sadeleştirince neden 2'ye 3 olur, 3'e 2 olmaz?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Oran için doğru olan hangisidir?",
        options: [
          "Sırayı korur",
          "Sayıları her zaman toplar",
          "Paydayı siler",
          "Yalnızca çarpma yapar",
        ],
        correctAnswerIndex: 0,
        hint: "4'e 6 ile 3'e 2 aynı oran değildir.",
        explanation:
          "Adım 1: Oran iki niceliğin sırasını korur. Adım 2: Sadeleştirme ortak çarpanla yapılır. Adım 3: Yer değiştirmek ters oran verir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "4'e 6 oranı sadeleşince ne olur?",
        options: ["2'ye 3", "3'e 2", "4'e 3", "6'ya 4"],
        correctAnswerIndex: 0,
        hint: "İkisini de 2'ye böl.",
        explanation:
          "Adım 1: 4 ve 6'nın ortak çarpanı 2'dir. Adım 2: 4 bölü 2, 2; 6 bölü 2, 3 eder. Adım 3: Oran 2'ye 3 olur.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Tarifte 4 ölçek un ve 6 ölçek süt var. Aynı tadı koruyarak 2 ölçek un kullanırsan kaç ölçek süt gerekir?",
        options: ["3", "2", "6", "8"],
        correctAnswerIndex: 0,
        hint: "Oran 2'ye 3'tür; un 2 ise süt 3'tür.",
        explanation:
          "Adım 1: 4'e 6, 2'ye 3 olur. Adım 2: Un 2 ölçek olunca süt 3 ölçek olmalıdır. Adım 3: Ters yazmak oranı bozar.",
      },
    ],
  },
  {
    n: 17,
    title: "Cebirsel ifadeler",
    tellGuides: [
      "Benzer terimlerin neden toplanabildiğini anlatabilir misin?",
      "3x artı 2x neden 5x eder de 5x artı 4 neden 9x olmaz?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Cebirsel ifadede benzer terim nedir?",
        options: [
          "Aynı harfli ve aynı üslü terimler",
          "Her sayı",
          "Yalnızca sabit sayılar",
          "Farklı harflerin toplamı",
        ],
        correctAnswerIndex: 0,
        hint: "3x ile 2x benzerdir. 5x ile 4 benzer değildir.",
        explanation:
          "Adım 1: Benzer terimler aynı harfi taşır. Adım 2: Katsayılar toplanır. Adım 3: Sabit sayı harfli terimle birleşmez.",
      },
      {
        id: "q2",
        level: "apply",
        question: "3x artı 2x kaç eder?",
        options: ["5x", "6x", "5", "x"],
        correctAnswerIndex: 0,
        hint: "Katsayıları topla; x yerinde kalsın.",
        explanation:
          "Adım 1: 3 ve 2 katsayılardır. Adım 2: 3 artı 2, 5 eder. Adım 3: Sonuç 5x'tir.",
      },
      {
        id: "q3",
        level: "skill",
        question: "Bir kutuda 5x top, yanında 4 top daha var. Toplamı 9x yazmak neden yanlıştır?",
        options: [
          "5x ile 4 benzer terim değildir",
          "x her zaman 1'dir",
          "Toplama yasaktır",
          "4 de x ile çarpılmalıdır",
        ],
        correctAnswerIndex: 0,
        hint: "Harfli terim ile sabit toplanıp tek terim olmaz.",
        explanation:
          "Adım 1: 5x harfli terimdir. Adım 2: 4 sabittir. Adım 3: Toplam 5x artı 4 olarak kalır; 9x olmaz.",
      },
    ],
  },
  {
    n: 18,
    title: "Veri toplama ve değerlendirme",
    tellGuides: [
      "Sıklığın ne anlama geldiğini bir örnekle anlatabilir misin?",
      "En çok seçilen seçeneği tablodan nasıl bulursun?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Sıklık neyi söyler?",
        options: [
          "Bir seçeneğin kaç kez çıktığını",
          "En küçük sayıyı",
          "Ortalamayı",
          "Açıklığı",
        ],
        correctAnswerIndex: 0,
        hint: "Sıklık, tekrar sayısını gösterir.",
        explanation:
          "Adım 1: Her seçenek sayılır. Adım 2: Kaç kez göründüğü sıklıktır. Adım 3: En büyük sıklık en çok seçilendir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Elma 5, armut 4, üzüm 3 kez seçilmiş. Toplam kaç kişi vardır?",
        options: ["12", "5", "9", "3"],
        correctAnswerIndex: 0,
        hint: "Sıklıkları topla.",
        explanation:
          "Adım 1: 5 artı 4, 9 eder. Adım 2: 9 artı 3, 12 eder. Adım 3: Toplam 12 kişidir. En çok seçilen elmadır.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Sınıf anketinde en çok oy alan meyve elmadır (5 oy). Armut 4, üzüm 3 oy almıştır. Hangi sonuç doğrudur?",
        options: [
          "En çok tercih edilen elmadır",
          "En çok tercih edilen üzümdür",
          "Toplam 5 kişidir",
          "Armut hiç seçilmemiştir",
        ],
        correctAnswerIndex: 0,
        hint: "En büyük sıklığa bak.",
        explanation:
          "Adım 1: Sıklıklar 5, 4 ve 3'tür. Adım 2: En büyüğü 5'tir. Adım 3: En çok tercih edilen elmadır.",
      },
    ],
  },
  {
    n: 19,
    title: "Veri analizi",
    tellGuides: [
      "Ortalama ile açıklığı nasıl ayırırsın?",
      "4, 6 ve 8 için ortalama ve açıklığı nasıl bulursun?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Ortalama nasıl bulunur?",
        options: [
          "Toplamın veri sayısına bölümü",
          "En büyük eksi en küçük",
          "Yalnızca en büyük sayı",
          "Sıklığın kendisi",
        ],
        correctAnswerIndex: 0,
        hint: "Açıklık en büyük ile en küçüğün farkıdır.",
        explanation:
          "Adım 1: Veriler toplanır. Adım 2: Toplam veri sayısına bölünür. Adım 3: Bu ortalamadır. Açıklık ayrı iştir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "4, 6 ve 8 sayılarının ortalaması kaçtır?",
        options: ["6", "4", "8", "18"],
        correctAnswerIndex: 0,
        hint: "Topla, sonra 3'e böl.",
        explanation:
          "Adım 1: 4 artı 6 artı 8, 18 eder. Adım 2: 18 bölü 3, 6 eder. Adım 3: Ortalama 6'dır.",
      },
      {
        id: "q3",
        level: "skill",
        question: "Bir takımın gol sayıları 4, 6 ve 8'dir. Açıklık kaçtır?",
        options: ["4", "6", "18", "2"],
        correctAnswerIndex: 0,
        hint: "En büyük eksi en küçük.",
        explanation:
          "Adım 1: En büyük 8, en küçük 4'tür. Adım 2: 8 eksi 4, 4 eder. Adım 3: Açıklık 4'tür.",
      },
    ],
  },
  {
    n: 20,
    title: "Komşu, tümler, bütünler ve ters açılar",
    tellGuides: [
      "Tümler ve bütünler açıların farkını anlatabilir misin?",
      "Ters açıların neden eşit olduğunu bir örnekle söyleyebilir misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Tümler açıların toplamı kaç derecedir?",
        options: ["90", "180", "360", "45"],
        correctAnswerIndex: 0,
        hint: "Bütünler 180, tümler 90'dır.",
        explanation:
          "Adım 1: Tümler açıların toplamı 90 derecedir. Adım 2: Bütünler açıların toplamı 180 derecedir. Adım 3: Ters açılar eşittir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "30 derecenin tümleri kaç derecedir?",
        options: ["60", "150", "90", "30"],
        correctAnswerIndex: 0,
        hint: "90 eksi 30.",
        explanation:
          "Adım 1: Tümler için 90 eksi 30 yapılır. Adım 2: Sonuç 60'tır. Adım 3: Bütünler olsa 180 eksi 30, 150 olurdu.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "İki yol kesişiyor. Bir açı 30 derece. Tersindeki açı kaç derecedir?",
        options: ["30", "60", "150", "90"],
        correctAnswerIndex: 0,
        hint: "Ters açılar eşittir.",
        explanation:
          "Adım 1: Kesişen doğrularda ters açılar eşittir. Adım 2: Verilen açı 30'dur. Adım 3: Tersi de 30 derecedir.",
      },
    ],
  },
  {
    n: 21,
    title: "Paralelkenar ve üçgenin alanı",
    tellGuides: [
      "Paralelkenar alanının taban çarpı yükseklik olduğunu anlatabilir misin?",
      "Üçgen alanının neden bunun yarısı olduğunu söyleyebilir misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Paralelkenarın alanı nasıl bulunur?",
        options: [
          "Taban çarpı yükseklik",
          "Yalnızca çevre",
          "Eğik kenar çarpı taban",
          "Üç kenarın toplamı",
        ],
        correctAnswerIndex: 0,
        hint: "Eğik kenar yükseklik değildir.",
        explanation:
          "Adım 1: Alan = taban çarpı yükseklik. Adım 2: Yükseklik tabana diktir. Adım 3: Üçgen alanı bunun yarısıdır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Taban 8 cm, yükseklik 5 cm olan paralelkenarın alanı kaç cm²'dir?",
        options: ["40", "13", "20", "80"],
        correctAnswerIndex: 0,
        hint: "8 çarpı 5.",
        explanation:
          "Adım 1: 8 çarpı 5 yapılır. Adım 2: Sonuç 40 cm²'dir. Adım 3: Aynı ölçülerde üçgen 20 cm² olur.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Bahçede tabanı 8 m, yüksekliği 5 m olan üçgen çimenlik var. Alanı kaç m²'dir?",
        options: ["20", "40", "13", "80"],
        correctAnswerIndex: 0,
        hint: "Üçgen = (taban çarpı yükseklik) / 2.",
        explanation:
          "Adım 1: 8 çarpı 5, 40 eder. Adım 2: Üçgen olduğu için 40 bölü 2 yapılır. Adım 3: Alan 20 m²'dir.",
      },
    ],
  },
  {
    n: 22,
    title: "Alan ölçü birimleri ve arazi",
    tellGuides: [
      "1 m² ile 1 cm² arasındaki ilişkiyi anlatabilir misin?",
      "Dönüm ve hektar nasıl ilişkilidir?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "1 metre kare kaç santimetre karedir?",
        options: ["10.000", "100", "1.000", "10"],
        correctAnswerIndex: 0,
        hint: "1 m = 100 cm; alan için 100 çarpı 100.",
        explanation:
          "Adım 1: 1 m, 100 cm'dir. Adım 2: Alan için 100 çarpı 100 yapılır. Adım 3: 1 m² = 10.000 cm²'dir.",
      },
      {
        id: "q2",
        level: "apply",
        question: "1 hektar kaç dönümdür?",
        options: ["10", "100", "1.000", "10.000"],
        correctAnswerIndex: 0,
        hint: "1 hektar 10.000 m², 1 dönüm 1.000 m²'dir.",
        explanation:
          "Adım 1: 1 hektar = 10.000 m². Adım 2: 1 dönüm = 1.000 m². Adım 3: 10.000 bölü 1.000, 10 dönümdür.",
      },
      {
        id: "q3",
        level: "skill",
        question: "Çiftçinin 2 hektar tarlası vardır. Bu kaç dönümdür?",
        options: ["20", "2", "200", "10"],
        correctAnswerIndex: 0,
        hint: "1 hektar = 10 dönüm.",
        explanation:
          "Adım 1: 1 hektar 10 dönümdür. Adım 2: 2 hektar için 2 çarpı 10 yapılır. Adım 3: Sonuç 20 dönümdür.",
      },
    ],
  },
  {
    n: 23,
    title: "Çember",
    tellGuides: [
      "Çember ile daire arasındaki farkı anlatabilir misin?",
      "Yarıçap ile çapın ilişkisini bir örnekle söyleyebilir misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Çember ile daire farkı nedir?",
        options: [
          "Çember çizgidir; daire iç bölgeyi de taşır",
          "İkisi aynıdır",
          "Daire yalnız çizgidir",
          "Çember alan demektir",
        ],
        correctAnswerIndex: 0,
        hint: "Çap, iki yarıçapa eşittir.",
        explanation:
          "Adım 1: Çember, sınır çizgisidir. Adım 2: Daire, içini de kapsar. Adım 3: Çap = 2 çarpı yarıçap.",
      },
      {
        id: "q2",
        level: "apply",
        question: "Yarıçap 5 cm ise çap kaç cm'dir?",
        options: ["10", "5", "25", "2,5"],
        correctAnswerIndex: 0,
        hint: "Çap = 2 çarpı yarıçap.",
        explanation:
          "Adım 1: Yarıçap 5 cm'dir. Adım 2: 2 çarpı 5 yapılır. Adım 3: Çap 10 cm'dir.",
      },
      {
        id: "q3",
        level: "skill",
        question: "Bahçe fıskiyesi merkezden 5 m uzağa su atıyor. Sulanan dairenin çapı kaç metredir?",
        options: ["10", "5", "25", "15"],
        correctAnswerIndex: 0,
        hint: "Yarıçap 5 m; çap iki katıdır.",
        explanation:
          "Adım 1: Yarıçap 5 m'dir. Adım 2: Çap 2 çarpı 5'tir. Adım 3: Çap 10 m'dir.",
      },
    ],
  },
  {
    n: 24,
    title: "Prizmalar ve hacim",
    tellGuides: [
      "Dikdörtgenler prizmasının hacmini nasıl bulduğunu anlatabilir misin?",
      "İki kenarın çarpımının neden yalnız taban alanı olduğunu söyleyebilir misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "Dikdörtgenler prizmasının hacmi nasıl bulunur?",
        options: [
          "Üç uzunluğun çarpımı",
          "Yalnızca iki kenarın çarpımı",
          "Kenarların toplamı",
          "Yüzey alanı",
        ],
        correctAnswerIndex: 0,
        hint: "en × boy × yükseklik.",
        explanation:
          "Adım 1: Hacim üç uzunluğun çarpımıdır. Adım 2: İki kenarın çarpımı yalnız taban alanıdır. Adım 3: Birim cm³'tür.",
      },
      {
        id: "q2",
        level: "apply",
        question: "4 cm, 3 cm ve 2 cm'lik kutunun hacmi kaç cm³'tür?",
        options: ["24", "12", "9", "14"],
        correctAnswerIndex: 0,
        hint: "4 çarpı 3 çarpı 2.",
        explanation:
          "Adım 1: 4 çarpı 3, 12 eder. Adım 2: 12 çarpı 2, 24 eder. Adım 3: Hacim 24 cm³'tür.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Koli 4 cm × 3 cm × 2 cm. Taban alanı ile hacmi karıştırmamak için ne demelisin?",
        options: [
          "4 çarpı 3 yalnız taban alanıdır; hacim için yükseklik de çarpılır",
          "Hacim her zaman 12'dir",
          "Yükseklik gerekmez",
          "Alan ile hacim aynıdır",
        ],
        correctAnswerIndex: 0,
        hint: "Taban alanı 12 cm²; hacim 24 cm³.",
        explanation:
          "Adım 1: 4 çarpı 3, 12 cm² taban alanıdır. Adım 2: Yükseklik 2 cm çarpılır. Adım 3: Hacim 24 cm³ olur.",
      },
    ],
  },
  {
    n: 25,
    title: "Sıvı ölçme",
    tellGuides: [
      "1 litre ile 1 mililitre ilişkisini anlatabilir misin?",
      "1 desimetre küpün neden 1 litre ettiğini söyleyebilir misin?",
    ],
    questions: [
      {
        id: "q1",
        level: "concept",
        question: "1 litre kaç mililitredir?",
        options: ["1.000", "100", "10", "10.000"],
        correctAnswerIndex: 0,
        hint: "1 dm³ = 1 L = 1.000 mL.",
        explanation:
          "Adım 1: 1 litre 1.000 mililitredir. Adım 2: 1 desimetre küp 1 litre eder. Adım 3: Bu üçü aynı hacmi anlatır.",
      },
      {
        id: "q2",
        level: "apply",
        question: "2,5 litre kaç mililitredir?",
        options: ["2.500", "250", "25", "25.000"],
        correctAnswerIndex: 0,
        hint: "2,5 çarpı 1.000.",
        explanation:
          "Adım 1: 1 L = 1.000 mL. Adım 2: 2,5 çarpı 1.000 yapılır. Adım 3: Sonuç 2.500 mL'dir.",
      },
      {
        id: "q3",
        level: "skill",
        question:
          "Sulu boya şişesi 2,5 L tutuyor. Bunu mililitre olarak etikete yazmak istersen ne yazarsın?",
        options: ["2500 mL", "250 mL", "25 mL", "2,5 mL"],
        correctAnswerIndex: 0,
        hint: "Litre mililitreye çevrilir.",
        explanation:
          "Adım 1: 2,5 litre vardır. Adım 2: 2,5 × 1000 = 2500. Adım 3: Etiket 2500 mL olmalıdır.",
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

/** 6. Sınıf Matematik — konu sonu soru arşivi (${pack.n}/25). */
export const JUNIOR_MAT_QUIZ_${pack.n} = {
  lessonKey: "jr_06_mat-${pack.n}",
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

const outDir = join(process.cwd(), "lib", "junior", "quiz", "mat");
mkdirSync(outDir, { recursive: true });

for (const pack of PACKS) {
  const file = join(outDir, `${pack.n}.ts`);
  writeFileSync(file, renderPack(pack), "utf8");
  console.log("wrote", file);
}

const index = `import { JUNIOR_MAT_QUIZ_1 } from "@/lib/junior/quiz/mat/1";
import { JUNIOR_MAT_QUIZ_2 } from "@/lib/junior/quiz/mat/2";
import { JUNIOR_MAT_QUIZ_3 } from "@/lib/junior/quiz/mat/3";
import { JUNIOR_MAT_QUIZ_4 } from "@/lib/junior/quiz/mat/4";
import { JUNIOR_MAT_QUIZ_5 } from "@/lib/junior/quiz/mat/5";
import { JUNIOR_MAT_QUIZ_6 } from "@/lib/junior/quiz/mat/6";
import { JUNIOR_MAT_QUIZ_7 } from "@/lib/junior/quiz/mat/7";
import { JUNIOR_MAT_QUIZ_8 } from "@/lib/junior/quiz/mat/8";
import { JUNIOR_MAT_QUIZ_9 } from "@/lib/junior/quiz/mat/9";
import { JUNIOR_MAT_QUIZ_10 } from "@/lib/junior/quiz/mat/10";
import { JUNIOR_MAT_QUIZ_11 } from "@/lib/junior/quiz/mat/11";
import { JUNIOR_MAT_QUIZ_12 } from "@/lib/junior/quiz/mat/12";
import { JUNIOR_MAT_QUIZ_13 } from "@/lib/junior/quiz/mat/13";
import { JUNIOR_MAT_QUIZ_14 } from "@/lib/junior/quiz/mat/14";
import { JUNIOR_MAT_QUIZ_15 } from "@/lib/junior/quiz/mat/15";
import { JUNIOR_MAT_QUIZ_16 } from "@/lib/junior/quiz/mat/16";
import { JUNIOR_MAT_QUIZ_17 } from "@/lib/junior/quiz/mat/17";
import { JUNIOR_MAT_QUIZ_18 } from "@/lib/junior/quiz/mat/18";
import { JUNIOR_MAT_QUIZ_19 } from "@/lib/junior/quiz/mat/19";
import { JUNIOR_MAT_QUIZ_20 } from "@/lib/junior/quiz/mat/20";
import { JUNIOR_MAT_QUIZ_21 } from "@/lib/junior/quiz/mat/21";
import { JUNIOR_MAT_QUIZ_22 } from "@/lib/junior/quiz/mat/22";
import { JUNIOR_MAT_QUIZ_23 } from "@/lib/junior/quiz/mat/23";
import { JUNIOR_MAT_QUIZ_24 } from "@/lib/junior/quiz/mat/24";
import { JUNIOR_MAT_QUIZ_25 } from "@/lib/junior/quiz/mat/25";
import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. sınıf matematik konu sonu arşivi. Katalog sırası. */
export const JUNIOR_MAT_QUIZ_PACKS = [
  JUNIOR_MAT_QUIZ_1,
  JUNIOR_MAT_QUIZ_2,
  JUNIOR_MAT_QUIZ_3,
  JUNIOR_MAT_QUIZ_4,
  JUNIOR_MAT_QUIZ_5,
  JUNIOR_MAT_QUIZ_6,
  JUNIOR_MAT_QUIZ_7,
  JUNIOR_MAT_QUIZ_8,
  JUNIOR_MAT_QUIZ_9,
  JUNIOR_MAT_QUIZ_10,
  JUNIOR_MAT_QUIZ_11,
  JUNIOR_MAT_QUIZ_12,
  JUNIOR_MAT_QUIZ_13,
  JUNIOR_MAT_QUIZ_14,
  JUNIOR_MAT_QUIZ_15,
  JUNIOR_MAT_QUIZ_16,
  JUNIOR_MAT_QUIZ_17,
  JUNIOR_MAT_QUIZ_18,
  JUNIOR_MAT_QUIZ_19,
  JUNIOR_MAT_QUIZ_20,
  JUNIOR_MAT_QUIZ_21,
  JUNIOR_MAT_QUIZ_22,
  JUNIOR_MAT_QUIZ_23,
  JUNIOR_MAT_QUIZ_24,
  JUNIOR_MAT_QUIZ_25,
] as const satisfies readonly JuniorLessonQuizPack[];

export {
  JUNIOR_MAT_QUIZ_1,
  JUNIOR_MAT_QUIZ_2,
  JUNIOR_MAT_QUIZ_3,
  JUNIOR_MAT_QUIZ_4,
  JUNIOR_MAT_QUIZ_5,
  JUNIOR_MAT_QUIZ_6,
  JUNIOR_MAT_QUIZ_7,
  JUNIOR_MAT_QUIZ_8,
  JUNIOR_MAT_QUIZ_9,
  JUNIOR_MAT_QUIZ_10,
  JUNIOR_MAT_QUIZ_11,
  JUNIOR_MAT_QUIZ_12,
  JUNIOR_MAT_QUIZ_13,
  JUNIOR_MAT_QUIZ_14,
  JUNIOR_MAT_QUIZ_15,
  JUNIOR_MAT_QUIZ_16,
  JUNIOR_MAT_QUIZ_17,
  JUNIOR_MAT_QUIZ_18,
  JUNIOR_MAT_QUIZ_19,
  JUNIOR_MAT_QUIZ_20,
  JUNIOR_MAT_QUIZ_21,
  JUNIOR_MAT_QUIZ_22,
  JUNIOR_MAT_QUIZ_23,
  JUNIOR_MAT_QUIZ_24,
  JUNIOR_MAT_QUIZ_25,
};
`;

writeFileSync(join(outDir, "index.ts"), index, "utf8");
console.log("wrote index.ts", PACKS.length, "packs,", PACKS.length * 3, "questions");
