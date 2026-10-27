import { JUNIOR_BAKE_ATEMPO } from "@/lib/junior/voice";
import type { CueSegment, TimelineJSON, VisualKeyframe } from "./schema";
import { spokenFormOfWord, type AlignedWord } from "./word-aligner";

export type AuthoredCueSpec = {
  id: string;
  chapterId: "ch-1" | "ch-2" | "ch-3" | "ch-4" | "ch-5";
  pauseAfterMs: number;
  /**
   * Yazar kancaları (`{@hookName}`) içeren metin.
   * Fırınlama betiği TTS'e göndermeden önce `{@hook}` etiketlerini temizler,
   * ancak o noktadaki kelimenin gerçek `startMs` değerini keyframe'in `atMs` alanına bağlar!
   */
  markedText: string;
  keyframes: ReadonlyArray<{
    /** Cue başlangıcına göre varsayılan milisaniye ofseti veya bağlanacağı `@hook` adı */
    hook?: string;
    offsetMs: number;
    op: VisualKeyframe["op"];
    params: Record<string, unknown>;
  }>;
};

/**
 * `jr_06_mat-1` oynatılan dersin kanonik başlığı.
 * Kart, quiz ve film aynı yazımı kullanır.
 */
export const MAT_5_CANONICAL_TITLE = "Çarpanlar, Katlar ve Bölünebilme";

/**
 * Ders Notu hero SSOT. Sahne/cue anlatımından türetilmez.
 * `mat5CanonicalBooklet` ve senaryo ayna dosyası aynı sabitleri kullanır.
 */
export const MAT_5_HERO_QUESTION =
  "Bir sayının çarpanı ve katı nedir; bölünebilirliği uzun bölme yapmadan nasıl anlarız?";
export const MAT_5_HERO_FOCUS =
  "Yedi kural (2, 3, 4, 5, 6, 9 ve 10) ile çarpan ve kat: uzun bölme yapmadan karar verme.";

/**
 * `jr_06_mat-1` Ders Notu 3 maddelik pedagojik özet SSOT.
 * `lib/junior/content/mat/1.ts` ve `mat5CanonicalBooklet` aynı diziyi paylaşır.
 */
export const MAT_5_CANONICAL_RECAP = [
  "Çarpan sayıya eşit ya da küçüktür; kat sayıya eşit ya da büyüktür. 6 hem çarpandır hem kattır.",
  "2, 5 ve 10 için son rakama bakılır. 4 için son iki basamak yeter, çünkü 100 sayısı 4'e tam bölünür.",
  "3 ve 9 için rakamlar toplanır. 6 için sayı hem 2'ye hem 3'e aynı anda bölünmelidir.",
] as const;

/**
 * Şablonsuz, 14 sekanslık doğal koreografi.
 * 4: son iki basamak, çünkü 100 sayısı 4'e tam bölünür.
 * 6: hem 2 hem 3. Yapay süre dolgusu yoktur.
 */
export const MAT_5_AUTHORED_CUES: readonly AuthoredCueSpec[] = [
  {
    id: "cue-01",
    chapterId: "ch-1",
    pauseAfterMs: 650,
    markedText:
      "Merhaba sevgili çocuklar! Ben Matematik öğretmenin Selim. Bugün seninle sayıları uzun bölme yapmadan, tek bakışta çözebilen bölünebilme dedektifleri olacağız. {@spawnMarbles} Masadaki şu 12 renkli bilyeye bak!",
    keyframes: [
      {
        offsetMs: 0,
        op: "SET_STAGE",
        params: {
          layout: "marble-tray",
          title: "Bölünebilme Dedektifleri",
          subtitle: "12 Bilye Deneyi",
        },
      },
      {
        hook: "spawnMarbles",
        offsetMs: 7400,
        op: "SPAWN_MARBLES",
        params: { count: 12, arrangement: "scattered", palette: "vibrant" },
      },
    ],
  },
  {
    id: "cue-02",
    chapterId: "ch-1",
    pauseAfterMs: 750,
    markedText:
      "Bu 12 bilyeyi kutulara {@groupBy2} ikişer ikişer dizelim. Bak, tam 6 eşit kutu oldu ve dışarıda hiç bilye artmadı! {@groupBy3} Üçer üçer dizsek? Yine hiç bilye artmaz, 4 eşit kutu olur.",
    keyframes: [
      {
        hook: "groupBy2",
        offsetMs: 1200,
        op: "GROUP_MARBLES",
        params: {
          total: 12,
          groupSize: 2,
          groups: 6,
          remainder: 0,
          equation: "12 ÷ 2 = 6 (Kalan 0 ✓)",
        },
      },
      {
        hook: "groupBy3",
        offsetMs: 7400,
        op: "GROUP_MARBLES",
        params: {
          total: 12,
          groupSize: 3,
          groups: 4,
          remainder: 0,
          equation: "12 ÷ 3 = 4 (Kalan 0 ✓)",
        },
      },
    ],
  },
  {
    id: "cue-03",
    chapterId: "ch-1",
    pauseAfterMs: 850,
    markedText:
      "Peki {@groupBy5} beşer beşer dizmeye çalışırsak ne olur? 2 kutu dolar ama 2 bilye dışarıda artar! İşte bir sayıyı hiç kalan bırakmadan tam bölen sayılara o sayının {@showConceptCallout} Çarpanı diyoruz.",
    keyframes: [
      {
        hook: "groupBy5",
        offsetMs: 600,
        op: "GROUP_MARBLES",
        params: {
          total: 12,
          groupSize: 5,
          groups: 2,
          remainder: 2,
          highlightRemainder: "rose",
          equation: "12 ÷ 5 = 2 (Kalan 2 ✗)",
        },
      },
      {
        hook: "showConceptCallout",
        offsetMs: 5700,
        op: "SHOW_CALLOUT",
        params: {
          kind: "concept",
          badge: "ÇARPAN (= BÖLEN)",
          text: "2 ve 3 sayısı 12'yi kalansız böldüğü için 12'nin çarpanıdır. 5 ise çarpanı değildir.",
        },
      },
    ],
  },
  {
    id: "cue-04",
    chapterId: "ch-2",
    pauseAfterMs: 750,
    markedText:
      "Şimdi en çok karıştırılan ikiliyi, Çarpan ile Kat farkını 6 sayısıyla yan yana görelim. 6'yı kalansız bölen sayılar hangileri? {@showFactorTree} 1, 2, 3 ve 6. Bunlar 6'ya eşit veya küçük olan kalansız bölenlerdir.",
    keyframes: [
      {
        offsetMs: 0,
        op: "SET_STAGE",
        params: {
          layout: "factor-vs-multiple",
          title: "Çarpan (Bölen) ile Kat Farkı",
          subtitle: "Eşit veya küçük mü, kat halkası mı?",
          subject: 6,
        },
      },
      {
        hook: "showFactorTree",
        offsetMs: 6800,
        op: "SHOW_FACTOR_TREE",
        params: {
          number: 6,
          factors: [1, 2, 3, 6],
          pairs: ["1 × 6 = 6", "2 × 3 = 6"],
          label: "Çarpanlar: eşit veya küçük (1, 2, 3, 6)",
        },
      },
    ],
  },
  {
    id: "cue-05",
    chapterId: "ch-2",
    pauseAfterMs: 850,
    markedText:
      "Peki 6'yı {@buildTower} birer, ikişer, üçer katlayarak yukarı doğru büyütürsek? 6, 12, 18, 24 diye yükselen bu kuledeki sayılara ise 6'nın Katları deriz. {@highlightCompare} Unutma: Çarpan eşit veya küçük, kat ise eşit veya büyüktür!",
    keyframes: [
      {
        hook: "buildTower",
        offsetMs: 800,
        op: "BUILD_MULTIPLE_TOWER",
        params: {
          base: 6,
          multiples: [
            { step: 1, value: 6, atMs: 3600 },
            { step: 2, value: 12, atMs: 4400 },
            { step: 3, value: 18, atMs: 5200 },
            { step: 4, value: 24, atMs: 6000 },
          ],
          label: "Katlar: Katlanarak büyüyen kule",
        },
      },
      {
        hook: "highlightCompare",
        offsetMs: 9800,
        op: "HIGHLIGHT_COMPARISON",
        params: {
          leftRule: "Çarpan ≤ Sayı (1, 2, 3, 6)",
          rightRule: "Kat ≥ Sayı (6, 12, 18, 24...)",
        },
      },
    ],
  },
  {
    id: "cue-06",
    chapterId: "ch-3",
    pauseAfterMs: 750,
    markedText:
      "Peki büyük bir sayıyı uzun uzun bölmeden nasıl çözeceğiz? İlk ekibimiz Son Basamak Dedektifleri: 2, 5 ve 10 kuralları! Bu üç kuralda sayının tamamına değil, büyüteçle sadece en sağdaki birler basamağına bakarız. {@inspect24} 24 sayısına bakalım: {@focusOnes} Son rakamı 4, yani çift! {@stamp24} O halde 24 sayısı 2'ye tam bölünür.",
    keyframes: [
      {
        offsetMs: 0,
        op: "SET_STAGE",
        params: {
          layout: "detective-last-digit",
          title: "Son Basamak Dedektifleri: 2, 5 ve 10",
          subtitle: "Büyüteçle sadece birler basamağına bak!",
          ruleBadges: ["2 Kuralı: Çift (0,2,4,6,8)", "5 Kuralı: 0 veya 5", "10 Kuralı: Sonu 0"],
        },
      },
      {
        hook: "inspect24",
        offsetMs: 10200,
        op: "INSPECT_NUMBER",
        params: { value: 24, digits: ["2", "4"], mode: "last-digit" },
      },
      {
        hook: "focusOnes",
        offsetMs: 12500,
        op: "HIGHLIGHT_DIGIT",
        params: {
          target: "ones",
          digit: "4",
          color: "cyan",
          magnifyingGlass: true,
          dimOthers: true,
        },
      },
      {
        hook: "stamp24",
        offsetMs: 15800,
        op: "STAMP_VERDICT",
        params: {
          subject: 24,
          verdicts: [
            { rule: 2, pass: true, label: "✓ 2'ye Bölünür (Sonu 4 - Çift)" },
            { rule: 5, pass: false, label: "✗ 5'e Bölünmez (0 veya 5 değil)" },
          ],
        },
      },
    ],
  },
  {
    id: "cue-07",
    chapterId: "ch-3",
    pauseAfterMs: 750,
    markedText:
      "Şimdi 5 kuralı için {@inspect15} 15 sayısını inceleyelim. Son rakamı 0 veya 5 olan her sayı 5'e tam bölünür. {@focusOnes15} 15'in son rakamı 5 olduğu için {@stamp15Pass} 5'e tam bölünür! Peki 15 sayısı 2'ye bölünür mü? {@stamp15Fail} Hayır, çünkü 5 tek sayıdır!",
    keyframes: [
      {
        hook: "inspect15",
        offsetMs: 400,
        op: "INSPECT_NUMBER",
        params: { value: 15, digits: ["1", "5"], mode: "last-digit" },
      },
      {
        hook: "focusOnes15",
        offsetMs: 5400,
        op: "HIGHLIGHT_DIGIT",
        params: {
          target: "ones",
          digit: "5",
          color: "amber",
          magnifyingGlass: true,
          dimOthers: true,
        },
      },
      {
        hook: "stamp15Pass",
        offsetMs: 8700,
        op: "STAMP_VERDICT",
        params: {
          subject: 15,
          verdicts: [{ rule: 5, pass: true, label: "✓ 5'e Bölünür (Sonu 5)" }],
        },
      },
      {
        hook: "stamp15Fail",
        offsetMs: 13100,
        op: "STAMP_VERDICT",
        params: {
          subject: 15,
          verdicts: [
            { rule: 5, pass: true, label: "✓ 5'e Bölünür (Sonu 5)" },
            { rule: 2, pass: false, label: "✗ 2'ye Bölünmez (5 Tek Sayı)" },
          ],
        },
      },
    ],
  },
  {
    id: "cue-08",
    chapterId: "ch-3",
    pauseAfterMs: 850,
    markedText:
      "10 kuralı ise en kolayı! Bir sayının son rakamı 0 ise 10'a tam bölünür. {@inspect30} Bak, 30 sayısının {@focusOnes30} sonu 0. Sıfır hem çift sayıdır, hem 5 kuralına uyar, hem de 10 kuralına! {@stamp30} Yani 30 sayısı 2'ye, 5'e ve 10'a aynı anda tam bölünür!",
    keyframes: [
      {
        hook: "inspect30",
        offsetMs: 3500,
        op: "INSPECT_NUMBER",
        params: { value: 30, digits: ["3", "0"], mode: "last-digit" },
      },
      {
        hook: "focusOnes30",
        offsetMs: 5100,
        op: "HIGHLIGHT_DIGIT",
        params: {
          target: "ones",
          digit: "0",
          color: "emerald",
          magnifyingGlass: true,
          dimOthers: true,
        },
      },
      {
        hook: "stamp30",
        offsetMs: 9300,
        op: "STAMP_VERDICT",
        params: {
          subject: 30,
          verdicts: [
            { rule: 2, pass: true, label: "✓ 2'ye Bölünür" },
            { rule: 5, pass: true, label: "✓ 5'e Bölünür" },
            { rule: 10, pass: true, label: "✓ 10'a Bölünür (Üçlü Şampiyon!)" },
          ],
        },
      },
    ],
  },
  {
    id: "cue-13",
    chapterId: "ch-3",
    pauseAfterMs: 800,
    markedText:
      "4 kuralı birler basamağına bakmakla çözülmez. Yüz ve yüzün katları 4'e kalansız bölünür, çünkü {@explain100} 100 bölü 4 eşittir 25. Solda kalan yüzler zaten 4'e tam bölündüğü için karar son iki basamaktadır. {@inspect116} 116 sayısına bakalım. {@focusLastTwo} Son iki basamak 16'dır. 16, 4'e kalansız bölündüğü için {@stamp116} 116 sayısı da 4'e tam bölünür.",
    keyframes: [
      {
        offsetMs: 0,
        op: "SET_STAGE",
        params: {
          layout: "detective-last-digit",
          title: "Son İki Basamak Dedektifi: 4",
          subtitle: "100, 4'e tam bölünür; karar son iki basamaktadır.",
          ruleBadges: ["4: son iki basamak", "100 ÷ 4 = 25"],
        },
      },
      {
        hook: "explain100",
        offsetMs: 4200,
        op: "SHOW_CALLOUT",
        params: {
          kind: "concept",
          badge: "NEDEN SON İKİ?",
          text: "100 ÷ 4 = 25. Yüzler zaten 4'e bölünür; geriye son iki basamak kalır.",
        },
      },
      {
        hook: "inspect116",
        offsetMs: 9800,
        op: "INSPECT_NUMBER",
        params: { value: 116, digits: ["1", "1", "6"], mode: "last-two" },
      },
      {
        hook: "focusLastTwo",
        offsetMs: 12400,
        op: "HIGHLIGHT_DIGIT",
        params: {
          target: "last-two",
          digit: "16",
          color: "amber",
          magnifyingGlass: true,
          dimOthers: true,
        },
      },
      {
        hook: "stamp116",
        offsetMs: 16800,
        op: "STAMP_VERDICT",
        params: {
          subject: 116,
          verdicts: [{ rule: 4, pass: true, label: "✓ 4'e Bölünür (Son iki basamak 16)" }],
        },
      },
    ],
  },
  {
    id: "cue-09",
    chapterId: "ch-4",
    pauseAfterMs: 750,
    markedText:
      "Şimdi ikinci ekibimiz olan Rakam Toplama Dedektiflerine, yani 3 ve 9 kurallarına geçelim! Burada sadece son rakama bakmak büyük bir tuzaktır; bütün basamaklardaki rakamları toplarız. {@inspectSum24} 24 sayısına geri dönelim: {@animateSum24} 2 artı 4 eşittir 6 eder. {@stampSum24} 6 sayısı 3'ün katı olduğu için 24 de 3'e tam bölünür!",
    keyframes: [
      {
        offsetMs: 0,
        op: "SET_STAGE",
        params: {
          layout: "detective-digit-sum",
          title: "Rakam Toplama Dedektifleri: 3 ve 9",
          subtitle: "Tüm basamaklardaki rakamları topla!",
          ruleBadges: ["3 Kuralı: Rakamlar Toplamı 3'ün Katı", "9 Kuralı: Rakamlar Toplamı 9'un Katı"],
        },
      },
      {
        hook: "inspectSum24",
        offsetMs: 9800,
        op: "INSPECT_NUMBER",
        params: { value: 24, digits: ["2", "4"], mode: "digit-sum" },
      },
      {
        hook: "animateSum24",
        offsetMs: 12400,
        op: "ANIMATE_DIGIT_SUM",
        params: {
          digits: [2, 4],
          expression: "2 + 4 = 6",
          sum: 6,
          divisor: 3,
        },
      },
      {
        hook: "stampSum24",
        offsetMs: 16500,
        op: "STAMP_VERDICT",
        params: {
          subject: 24,
          verdicts: [
            { rule: 3, pass: true, label: "✓ 3'e Bölünür (6, 3'ün katıdır)" },
            { rule: 9, pass: false, label: "✗ 9'a Bölünmez (6, 9'un katı değil)" },
          ],
        },
      },
    ],
  },
  {
    id: "cue-10",
    chapterId: "ch-4",
    pauseAfterMs: 850,
    markedText:
      "9 kuralı da 3 kuralının ağabeyidir: Rakamları topladığımızda sonuç 9 veya 9'un katıysa sayı 9'a tam bölünür. {@inspect18} Örneğin 18 sayısında {@animateSum18} 1 artı 8 eşittir 9 eder! {@stamp18} Toplam 9 olduğu için 18 sayısı hem 9'a hem de 3'e kalansız bölünür.",
    keyframes: [
      {
        hook: "inspect18",
        offsetMs: 6600,
        op: "INSPECT_NUMBER",
        params: { value: 18, digits: ["1", "8"], mode: "digit-sum" },
      },
      {
        hook: "animateSum18",
        offsetMs: 8900,
        op: "ANIMATE_DIGIT_SUM",
        params: {
          digits: [1, 8],
          expression: "1 + 8 = 9",
          sum: 9,
          divisor: 9,
        },
      },
      {
        hook: "stamp18",
        offsetMs: 13300,
        op: "STAMP_VERDICT",
        params: {
          subject: 18,
          verdicts: [
            { rule: 9, pass: true, label: "✓ 9'a Bölünür (1 + 8 = 9)" },
            { rule: 3, pass: true, label: "✓ 3'e de Bölünür" },
          ],
        },
      },
    ],
  },
  {
    id: "cue-14",
    chapterId: "ch-4",
    pauseAfterMs: 850,
    markedText:
      "6 kuralı tek bakış değildir; çifte koşuldur. Sayı hem 2'ye hem 3'e aynı anda kalansız bölünmelidir. {@inspect24six} 24 sayısını yeniden koyalım. Son rakamı {@focusOnes24} 4 olduğu için 2'ye bölünür. {@sum24six} 2 artı 4 eşittir 6, bu da 3'ün katıdır. {@stamp24six} İki koşul birden tuttuğu için 24 sayısı 6'ya tam bölünür. {@show15miss} 15 ise 3'e bölünür ama tek olduğu için 2'ye bölünmez. Bir koşul yetmez; 15 sayısı 6'ya bölünmez.",
    keyframes: [
      {
        offsetMs: 0,
        op: "SET_STAGE",
        params: {
          layout: "detective-digit-sum",
          title: "Çifte Koşul Dedektifi: 6",
          subtitle: "Hem 2'ye hem 3'e aynı anda bölünmeli.",
          ruleBadges: ["6: hem 2 hem 3", "Tek koşul yetmez"],
        },
      },
      {
        hook: "inspect24six",
        offsetMs: 5200,
        op: "INSPECT_NUMBER",
        params: { value: 24, digits: ["2", "4"], mode: "both-rules" },
      },
      {
        hook: "focusOnes24",
        offsetMs: 7800,
        op: "HIGHLIGHT_DIGIT",
        params: {
          target: "ones",
          digit: "4",
          color: "cyan",
          magnifyingGlass: true,
          dimOthers: true,
        },
      },
      {
        hook: "sum24six",
        offsetMs: 11200,
        op: "ANIMATE_DIGIT_SUM",
        params: {
          digits: [2, 4],
          expression: "2 + 4 = 6",
          sum: 6,
          divisor: 3,
        },
      },
      {
        hook: "stamp24six",
        offsetMs: 15600,
        op: "STAMP_VERDICT",
        params: {
          subject: 24,
          verdicts: [
            { rule: 2, pass: true, label: "✓ 2'ye Bölünür (Sonu 4)" },
            { rule: 3, pass: true, label: "✓ 3'e Bölünür (2 + 4 = 6)" },
            { rule: 6, pass: true, label: "✓ 6'ya Bölünür (İkisi birden)" },
          ],
        },
      },
      {
        hook: "show15miss",
        offsetMs: 19800,
        op: "SHOW_CALLOUT",
        params: {
          kind: "trap",
          badge: "TEK KOŞUL YETMEZ",
          text: "15 → 3'e bölünür ama 2'ye bölünmez. 6'ya bölünmez.",
        },
      },
    ],
  },
  {
    id: "cue-11",
    chapterId: "ch-5",
    pauseAfterMs: 650,
    markedText:
      "Altın İpucu! Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta: 2, 5 ve 10 için son rakama bak; 4 için son iki basamağa bak; 3 ve 9 için rakamları topla; 6 için hem 2 hem 3 birden tutsun! {@showGoldTrap} Örneğin 14'ün sonu çifttir ama rakamları toplamı 5 olduğu için 3'e bölünmez. 14, 2'ye bölünür ama 3'e bölünmediği için 6'ya da bölünmez.",
    keyframes: [
      {
        offsetMs: 0,
        op: "SET_STAGE",
        params: {
          layout: "trap-vs-truth",
          title: "Altın İpucu: Son Rakam Tuzağına Düşme!",
          subtitle: "2, 5, 10 son rakam · 4 son iki basamak · 3, 9 toplam · 6 ikisi birden",
          subject: 14,
          digits: ["1", "4"],
          digitSum: 5,
          sumExpression: "1 + 4 = 5",
        },
      },
      {
        hook: "showGoldTrap",
        offsetMs: 7200,
        op: "SHOW_CALLOUT",
        params: {
          kind: "gold",
          badge: "ALTIN İPUCU",
          text: "14 → Sonu 4 (2'ye bölünür ✓) AMA 1 + 4 = 5 (3'e bölünmez ✗, 6'ya da bölünmez)",
        },
      },
    ],
  },
  {
    id: "cue-12",
    chapterId: "ch-5",
    pauseAfterMs: 0,
    markedText:
      "Bugün Neler Öğrendik? Çarpanın sayıya eşit ya da küçük, katın ise eşit ya da büyük olduğunu ve yedi dedektif kuralımızı öğrendik: 2, 3, 4, 5, 6, 9 ve 10. Tebrikler çocuklar! Harika bir iş çıkardık. Şimdi sıra sende. Aldığın bu notları mikrofona kendi sözlerinle anlat.",
    keyframes: [
      {
        offsetMs: 0,
        op: "SET_STAGE",
        params: {
          layout: "summary-board",
          title: "Özet Kartı ve Sıra Sende",
          subtitle: "7 Dedektif Kuralı Cebimizde!",
          cards: [
            {
              icon: "puzzle",
              title: "Çarpan & Kat",
              body: "Çarpan ≤ sayı (1, 2, 3, 6) · Kat ≥ sayı (6, 12, 18, 24)",
            },
            {
              icon: "search",
              title: "Son Basamak (2, 5, 10)",
              body: "2: Çift · 5: 0 veya 5 · 10: Sonu 0",
            },
            {
              icon: "columns",
              title: "Son İki Basamak (4)",
              body: "100 ÷ 4 = 25 olduğu için son iki basamak yeter.",
            },
            {
              icon: "plus",
              title: "Rakam Toplamı (3 ve 9)",
              body: "Rakamları topla → 3'ün veya 9'un katı mı?",
            },
            {
              icon: "link",
              title: "Çifte Koşul (6)",
              body: "Hem 2'ye hem 3'e aynı anda. Örnek: 24.",
            },
          ],
          echoPrompt: "24 ve 30 ile 116 sayılarının hangi kurallara uyduğunu kendi cümlenle anlat!",
        },
      },
    ],
  },
];

/** `{@hook}` etiketlerini metinden temizler ve her kelimenin hangi kancayı tetiklediğini çıkarır. */
export function parseMarkedCueText(markedText: string): {
  cleanText: string;
  words: string[];
  hookWordIndices: Record<string, number>;
} {
  const tokens = markedText.trim().split(/\s+/u);
  const words: string[] = [];
  const hookWordIndices: Record<string, number> = {};
  for (const token of tokens) {
    const hookMatch = /^\{@([a-zA-Z0-9_]+)\}$/u.exec(token);
    if (hookMatch) {
      const hookName = hookMatch[1]!;
      hookWordIndices[hookName] = words.length;
      continue;
    }
    words.push(token);
  }
  return {
    cleanText: words.join(" "),
    words,
    hookWordIndices,
  };
}

/**
 * Dalga dosyası yokken taslak sekans süresi. Oynatıcı mührü değildir.
 * Mühürlü kelime saati `alignWordsByAcoustics` çıktısıdır.
 */
function draftSyllableWeight(word: string): number {
  const vowels = spokenFormOfWord(word)
    .toLocaleLowerCase("tr-TR")
    .match(/[aeıioöuüâîû]/gu);
  const pause = /[.!?…]["»)]*$/u.test(word) ? 1.2 : /[,;:]["»)]*$/u.test(word) ? 0.6 : 0;
  return Math.max(1, vowels?.length ?? 0) + pause;
}

/** «6,» «12,» «24» düz sayı sözcüğüdür. «6'yı» bu kalıba girmez. */
function bareSpokenInteger(word: string): number | null {
  const match = /^(\d+)[,.!?…]*$/u.exec(word);
  return match ? Number(match[1]) : null;
}

/** Sondaki noktalama düşer. Kesme işareti kalır: «8'dir.» → «8'dir». */
function wordStem(word: string): string {
  return word.replace(/[.!?…,;:]+$/u, "");
}

const TIMED_PARAM_KEYS = new Set(["branches", "nodes", "marks"]);

/**
 * `branches`, `nodes` ve `marks` satırları kancadan sonraki kelimeye kilitlenir.
 * `token` varsa sözcüğün kendisi, yoksa düz sayı aranır. Gelecek satır listeden silinmez.
 */
function lockTimedRows(
  rows: unknown[],
  words: ReadonlyArray<{ word: string; startMs: number }>,
  endMs: number,
  startWordIndex: number,
): unknown[] {
  let cursor = startWordIndex;
  return rows.map((item) => {
    if (!item || typeof item !== "object") {
      return item;
    }
    const step = item as { value?: unknown; atMs?: unknown; token?: unknown };
    const token = typeof step.token === "string" ? step.token : "";
    const value = typeof step.value === "number" ? step.value : null;
    const index = words.findIndex((word, wordIndex) => {
      if (wordIndex < cursor) {
        return false;
      }
      if (token.length > 0) {
        return wordStem(word.word) === token;
      }
      return value !== null && bareSpokenInteger(word.word) === value;
    });
    if (index < 0) {
      const atMs = typeof step.atMs === "number" ? Math.min(endMs, Math.max(0, step.atMs)) : 0;
      return { ...step, atMs };
    }
    cursor = index + 1;
    return { ...step, atMs: words[index]!.startMs };
  });
}

function lockTimedParams(
  params: Record<string, unknown>,
  words: ReadonlyArray<{ word: string; startMs: number }>,
  endMs: number,
  startWordIndex: number,
): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (TIMED_PARAM_KEYS.has(key) && Array.isArray(value)) {
      next[key] = lockTimedRows(value, words, endMs, startWordIndex);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      next[key] = lockTimedParams(value as Record<string, unknown>, words, endMs, startWordIndex);
    } else {
      next[key] = value;
    }
  }
  return next;
}

/**
 * Kat kulesinin her basamağı, cümlede söylenen sayının kelime başlangıcına kilitlenir.
 * Eşleşme yoksa yazarın koyduğu ofset cue sonunu aşmadan durur.
 */
function lockTowerStepsToSpokenWords(
  multiples: Array<{ step: number; value: number; atMs: number }>,
  words: ReadonlyArray<{ word: string; startMs: number }>,
  endMs: number,
): Array<{ step: number; value: number; atMs: number }> {
  let cursor = 0;
  return multiples.map((step) => {
    const index = words.findIndex(
      (word, wordIndex) => wordIndex >= cursor && bareSpokenInteger(word.word) === step.value,
    );
    if (index < 0) {
      return { ...step, atMs: Math.min(endMs, Math.max(0, step.atMs)) };
    }
    cursor = index + 1;
    return { ...step, atMs: words[index]!.startMs };
  });
}

/**
 * Sekans sınırını ve `@hook` anlarını kurar.
 * `alignedWords` akustik mühürdür. Dizi yoksa yalnız taslak saat kurulur; bu saat yayın değildir.
 */
export function buildCueTimingFromBounds(
  spec: AuthoredCueSpec,
  startMs: number,
  speechDurationMs: number,
  alignedWords?: readonly AlignedWord[],
): CueSegment {
  const { cleanText, words, hookWordIndices } = parseMarkedCueText(spec.markedText);
  const weights = words.map((w) => draftSyllableWeight(w));
  const totalWeight = Math.max(1, weights.reduce((a, b) => a + b, 0));
  let accWeight = 0;
  const estimated = words.map((word, index) => {
    const w = weights[index] ?? 1;
    const wStart = startMs + Math.round((accWeight / totalWeight) * speechDurationMs);
    accWeight += w;
    const wEnd = startMs + Math.round((accWeight / totalWeight) * speechDurationMs);
    return {
      word,
      startMs: wStart,
      endMs: Math.max(wStart + 40, wEnd),
    };
  });
  const wordTimestamps =
    alignedWords && alignedWords.length === words.length
      ? alignedWords.map((word, index) => ({
          word: words[index] ?? word.word,
          startMs: Math.max(startMs, Math.min(startMs + speechDurationMs, word.startMs)),
          endMs: Math.max(startMs + 40, Math.min(startMs + speechDurationMs, word.endMs)),
        }))
      : estimated;

  const endMs = startMs + speechDurationMs;
  const keyframes: VisualKeyframe[] = spec.keyframes.map((kf) => {
    let atMs = startMs + kf.offsetMs;
    if (kf.hook && hookWordIndices[kf.hook] !== undefined) {
      const wordIdx = hookWordIndices[kf.hook]!;
      const targetWord = wordTimestamps[wordIdx];
      if (targetWord) {
        atMs = targetWord.startMs;
      }
    }
    atMs = Math.max(startMs, Math.min(endMs, atMs));
    const startWordIndex =
      kf.hook && hookWordIndices[kf.hook] !== undefined ? hookWordIndices[kf.hook]! : 0;
    const withTower =
      kf.op === "BUILD_MULTIPLE_TOWER" && Array.isArray(kf.params.multiples)
        ? {
            ...kf.params,
            multiples: lockTowerStepsToSpokenWords(
              kf.params.multiples as Array<{ step: number; value: number; atMs: number }>,
              wordTimestamps,
              endMs,
            ),
          }
        : kf.params;
    return {
      atMs,
      op: kf.op,
      hook: kf.hook,
      params: lockTimedParams(withTower, wordTimestamps, endMs, startWordIndex),
    };
  });

  return {
    id: spec.id,
    chapterId: spec.chapterId,
    startMs,
    endMs,
    pauseAfterMs: spec.pauseAfterMs,
    text: cleanText,
    markedText: spec.markedText,
    words: wordTimestamps,
    keyframes,
  };
}

const MAT_5_CHAPTERS: ReadonlyArray<{ id: AuthoredCueSpec["chapterId"]; title: string }> = [
  { id: "ch-1", title: "12 Bilye Deneyi ve Çarpan" },
  { id: "ch-2", title: "Çarpan mı, Kat mı?" },
  { id: "ch-3", title: "Son Basamak ve Son İki Basamak (2, 4, 5, 10)" },
  { id: "ch-4", title: "Rakam Toplamı ve Çifte Koşul (3, 6, 9)" },
  { id: "ch-5", title: "Altın İpucu ve Özet" },
];

/**
 * Önceki fırının PCM süresi / hece taslağı oranı.
 * Yeni dalga ölçülünce bu katsayı kalkar; oynatıcı onu PCM sanmaz.
 */
export const MAT_5_PCM_STRETCH = 1.18;

function mat5Chapters(cues: readonly CueSegment[], totalDurationMs: number) {
  return MAT_5_CHAPTERS.map((ch, idx) => {
    const chCues = cues.filter((c) => c.chapterId === ch.id);
    const first = chCues[0];
    const nextChapterFirst =
      idx + 1 < MAT_5_CHAPTERS.length
        ? cues.find((c) => c.chapterId === MAT_5_CHAPTERS[idx + 1]!.id)
        : undefined;
    const startMs = first ? first.startMs : 0;
    const endMs = nextChapterFirst ? nextChapterFirst.startMs : totalDurationMs;
    return {
      id: ch.id,
      title: ch.title,
      startMs,
      endMs,
    };
  });
}

function shiftTimestampTree(value: unknown, delta: number): unknown {
  if (delta === 0 || !value || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => shiftTimestampTree(item, delta));
  }
  const next: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    next[key] = key === "atMs" && typeof item === "number" ? item + delta : shiftTimestampTree(item, delta);
  }
  return next;
}

function shiftCueTiming(cue: CueSegment, delta: number): CueSegment {
  if (delta === 0) {
    return cue;
  }
  return {
    ...cue,
    startMs: cue.startMs + delta,
    endMs: cue.endMs + delta,
    words: cue.words?.map((word) => ({
      ...word,
      startMs: word.startMs + delta,
      endMs: word.endMs + delta,
    })),
    keyframes: cue.keyframes.map((frame) => ({
      ...frame,
      atMs: frame.atMs + delta,
      params: shiftTimestampTree(frame.params, delta) as Record<string, unknown>,
    })),
  };
}

/**
 * Verilen sekans konuşma sürelerinden (ms) eksiksiz `TimelineJSON` nesnesi inşa eder.
 */
export function buildMat5TimelineFromDurations(speechDurationsMs: readonly number[]): TimelineJSON {
  let cursorMs = 0;
  const cues: CueSegment[] = MAT_5_AUTHORED_CUES.map((spec, idx) => {
    const speechMs = speechDurationsMs[idx] ?? 14_000;
    const cue = buildCueTimingFromBounds(spec, cursorMs, speechMs);
    cursorMs = cue.endMs + spec.pauseAfterMs;
    return cue;
  });

  const totalDurationMs = cues[cues.length - 1]?.endMs ?? 186_000;

  return {
    schemaVersion: "2.0.0",
    lessonKey: "jr_06_mat-1",
    title: MAT_5_CANONICAL_TITLE,
    grade: 6,
    subject: "Matematik",
    teacher: {
      name: "Selim",
      voice: "Fenrir",
      atempo: JUNIOR_BAKE_ATEMPO,
    },
    audio: {
      publicPath: "/media/junior/audio/jr_06_mat-1.mp3",
      durationMs: totalDurationMs,
      sampleRateHz: 48000,
    },
    chapters: mat5Chapters(cues, totalDurationMs),
    cues,
  };
}

/**
 * Oynatıcı saati. Metni değişmeyen sekanslar önceki PCM kelime saatini korur.
 * Yeni ve değişen sekanslar hece taslağının 1,18 katı kadar sürer; bu ölçülmüş dalga değildir.
 * Fırın sonrası `alignSingleWavToMat5Cues` bu saatin yerine geçer.
 */
export function assembleMat5PlaybackTimeline(previous: TimelineJSON | null): TimelineJSON {
  let cursor = 0;
  const cues: CueSegment[] = MAT_5_AUTHORED_CUES.map((spec, index) => {
    const clean = parseMarkedCueText(spec.markedText).cleanText;
    const old = previous?.cues.find((cue) => cue.id === spec.id && cue.text === clean);
    if (old && cursor <= old.startMs) {
      cursor = old.startMs;
    }
    if (old) {
      const moved = shiftCueTiming(old, cursor - old.startMs);
      const cue: CueSegment = {
        ...moved,
        id: spec.id,
        chapterId: spec.chapterId,
        pauseAfterMs: spec.pauseAfterMs,
        text: clean,
        markedText: spec.markedText,
      };
      cursor = cue.endMs + spec.pauseAfterMs;
      return cue;
    }
    const draftMs = DEFAULT_MAT_5_SPEECH_DURATIONS_MS[index] ?? 14_000;
    const speechMs = Math.round(draftMs * MAT_5_PCM_STRETCH);
    const built = buildCueTimingFromBounds(spec, cursor, speechMs);
    cursor = built.endMs + spec.pauseAfterMs;
    return built;
  });
  const totalDurationMs = cues[cues.length - 1]?.endMs ?? 0;
  return {
    schemaVersion: "2.0.0",
    lessonKey: "jr_06_mat-1",
    title: MAT_5_CANONICAL_TITLE,
    grade: 6,
    subject: "Matematik",
    teacher: {
      name: "Selim",
      voice: "Fenrir",
      atempo: JUNIOR_BAKE_ATEMPO,
    },
    audio: {
      publicPath: "/media/junior/audio/jr_06_mat-1.mp3",
      durationMs: totalDurationMs,
      sampleRateHz: 48000,
    },
    chapters: mat5Chapters(cues, totalDurationMs),
    cues,
  };
}

/**
 * 14 sekansın taslak konuşma süreleri. Oynatıcı bu saati okumaz.
 * Oynatıcı saati `assembleMat5PlaybackTimeline` ile kurulur; fırın onu PCM ile değiştirir.
 */
export const DEFAULT_MAT_5_SPEECH_DURATIONS_MS: readonly number[] = [
  11200, // cue-01
  12600, // cue-02
  10100, // cue-03
  15500, // cue-04
  15000, // cue-05
  18400, // cue-06
  15900, // cue-07
  13500, // cue-08
  19800, // cue-13 — 4 kuralı, son iki basamak
  21200, // cue-09
  19300, // cue-10
  26800, // cue-14 — 6 kuralı, çifte koşul
  17600, // cue-11
  14600, // cue-12
];

/** Taslak hece saati. Ürün oynatıcısının kaynağı değildir. */
export const MAT_5_DRAFT_TIMELINE: TimelineJSON = buildMat5TimelineFromDurations(
  DEFAULT_MAT_5_SPEECH_DURATIONS_MS,
);

export function mat5FullListenText(): string {
  return MAT_5_AUTHORED_CUES.map((c) => parseMarkedCueText(c.markedText).cleanText).join(" ");
}

/**
 * 14 sekansın tek TTS gövdesi. Sekans arasına `[pause]` konur; model bunu nefes olarak okur.
 * Pedagojik es süresi (`pauseAfterMs`) bu metinde değildir; dilimleyici PCM'e yazar.
 * Dönüş: tam 1 istek. Sekans sayısı kadar çağrı üretilmez.
 */
export function mat5SingleRequestListenText(): string {
  if (MAT_5_AUTHORED_CUES.length !== 14) {
    throw new Error(`jr_06_mat-1 tek istek 14 sekans bekler. Gelen ${MAT_5_AUTHORED_CUES.length}.`);
  }
  return MAT_5_AUTHORED_CUES.map((cue, index) => {
    const clean = parseMarkedCueText(cue.markedText).cleanText;
    const last = index === MAT_5_AUTHORED_CUES.length - 1;
    if (!last && !/[.!?…]["»)]*$/u.test(clean)) {
      throw new Error(`${cue.id} cümle sınırıyla bitmiyor. Tek istek duraklaması kaybolur.`);
    }
    if (last || cue.pauseAfterMs <= 0) {
      return clean;
    }
    return `${clean} [pause]`;
  }).join(" ");
}

export function mat5CueText(id: string): string {
  const spec = MAT_5_AUTHORED_CUES.find((cue) => cue.id === id);
  if (!spec) {
    throw new Error(`mat-5 kanonik sekans yok: ${id}`);
  }
  return parseMarkedCueText(spec.markedText).cleanText;
}

/** Not Defteri. Kavram/örnek cümleler oynatılan sekansların temiz metnidir; hero ve 3 maddelik özet ayrı SSOT'tur. */
export function mat5CanonicalBooklet(): {
  concept: string;
  example: string;
  warning: string;
  recap: readonly string[];
  hint: "gold";
  heroQuestion: string;
  heroFocus: string;
} {
  return {
    concept: [mat5CueText("cue-03"), mat5CueText("cue-04"), mat5CueText("cue-05")].join(" "),
    example: ["cue-06", "cue-07", "cue-08", "cue-13", "cue-09", "cue-10", "cue-14"]
      .map((id) => mat5CueText(id))
      .join(" "),
    warning: mat5CueText("cue-11"),
    recap: [...MAT_5_CANONICAL_RECAP],
    hint: "gold",
    heroQuestion: MAT_5_HERO_QUESTION,
    heroFocus: MAT_5_HERO_FOCUS,
  };
}
