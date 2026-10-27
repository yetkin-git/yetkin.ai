import { JUNIOR_BAKE_ATEMPO } from "@/lib/junior/voice";
import {
  buildCueTimingFromBounds,
  parseMarkedCueText,
  type AuthoredCueSpec,
} from "@/lib/junior/pilot-engine/mat-1.choreography";
import type { CueSegment, TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-2` oynatılan dersin kanonik başlığı.
 * Kart, quiz ve film aynı yazımı kullanır.
 */
export const MAT_6_CANONICAL_TITLE = "Asal sayılar ve asal çarpanlar";

/**
 * Ders Notu hero SSOT. Sahne cümlesinden türetilmez.
 * Teaser, veli notu ve çip aynı üç işi söyler: tanım, üç özel durum, 12'nin ağacı.
 */
export const MAT_6_HERO_QUESTION =
  "Asal sayı nedir; 12'yi asal çarpan ağacıyla nasıl yazarız?";
export const MAT_6_HERO_FOCUS =
  "1'den büyük ve yalnız 1 ile kendisine bölünen sayı. 1 asal değildir, 2 tek çift asaldır, 9 tuzaktır. 12 = 2 × 2 × 3.";

const MAT_6_CHAPTERS: ReadonlyArray<{ id: AuthoredCueSpec["chapterId"]; title: string }> = [
  { id: "ch-1", title: "Asal sayının tanımı" },
  { id: "ch-2", title: "1, 2 ve 9" },
  { id: "ch-3", title: "12'nin çarpan ağacı" },
  { id: "ch-4", title: "Takım örneği" },
  { id: "ch-5", title: "Kilit nokta ve özet" },
];

/**
 * Yazarın kurduğu 12 sekans.
 * Otomatik cümle bölmesi bu listeye girmez.
 * Kapsül: tanım, 1 asal değildir, 2 tek çift asaldır, 9 tuzağı, 12 = 2 × 2 × 3.
 * Film kalburu oynatmaz. Çocuk eleği `PrimeSieve` bileşenindedir.
 */
export const MAT_6_AUTHORED_CUES: readonly AuthoredCueSpec[] = [
  {
    id: "cue-01",
    chapterId: "ch-1",
    pauseAfterMs: 650,
    markedText:
      "Merhaba çocuklar, hepiniz hoş geldiniz! Ben Matematik öğretmenin Selim. Bugün seninle masadaki sayı kartlarına bakacağız. Bazı sayılar yalnız 1'e ve kendisine bölünür. Bazıları ise daha küçük asal taşlara ayrılır. Defterini aç, sınıf kartlarını sıraya koyalım. Asal sayının ne olduğunu birlikte kuralım.",
    keyframes: [
      {
        offsetMs: 0,
        op: "SET_STAGE",
        params: {
          layout: "prime-factor-tree",
          title: "Asal Sayılar",
          subtitle: "Tanım, üç özel durum, 12'nin ağacı",
        },
      },
    ],
  },
  {
    id: "cue-02",
    chapterId: "ch-1",
    pauseAfterMs: 700,
    markedText:
      "Asal sayı, 1'den büyük olan ve yalnız 1'e ve kendisine kalansız bölünen doğal sayıdır. {@showPrimes} Örneğin 2, 3, 5 ve 7 birer asal sayıdır. Bu sayıların başka bir kalansız böleni yoktur. 2'yi 1'e ve 2'ye bölersin. 3'ü 1'e ve 3'e bölersin. 5 ve 7 de aynı kurala uyar.",
    keyframes: [
      {
        hook: "showPrimes",
        offsetMs: 4200,
        op: "SHOW_CALLOUT",
        params: {
          kind: "concept",
          badge: "ASAL SAYI",
          text: "1'den büyük. Yalnız 1 ve kendisi. Örnek: 2, 3, 5, 7.",
        },
      },
    ],
  },
  {
    id: "cue-03",
    chapterId: "ch-1",
    pauseAfterMs: 700,
    markedText:
      "4 sayısı asal değildir, çünkü 2'ye de bölünür. {@showFour} 4'ü ikişerli iki gruba ayırınca dışarıda bir şey kalmaz. O yüzden 4, asal listesine yazılmaz. Asal olmak, küçük olmak demek değildir. Kalansız başka bir böleni varsa sayı asal değildir.",
    keyframes: [
      {
        hook: "showFour",
        offsetMs: 1800,
        op: "SHOW_CALLOUT",
        params: {
          kind: "trap",
          badge: "4 ASAL DEĞİL",
          text: "4 = 2 × 2. 2'ye de bölündüğü için asal değildir.",
        },
      },
    ],
  },
  {
    id: "cue-04",
    chapterId: "ch-2",
    pauseAfterMs: 750,
    markedText:
      "1 sayısı asla asal kabul edilmez. {@stampOne} Asal sayıların 1'den büyük olma şartı vardır. 1'in tek böleni kendisidir. İki farklı pozitif böleni yoktur. Bu yüzden 1'i asal listesine asla yazma. Listenin ilk sayısı 2'dir.",
    keyframes: [
      {
        hook: "stampOne",
        offsetMs: 900,
        op: "SHOW_CALLOUT",
        params: {
          kind: "trap",
          badge: "1 ASAL DEĞİL",
          text: "1'in tek böleni kendisidir. Asal sayı 1'den büyüktür.",
        },
      },
    ],
  },
  {
    id: "cue-05",
    chapterId: "ch-2",
    pauseAfterMs: 700,
    markedText:
      "2, asal sayılar içindeki tek çift sayıdır. {@stampTwo} Çift olan diğer sayılar 2'ye de bölünür. 4, 6, 8 ve 10 çift olduğu için asal değildir. 2'nin kendisi ise yalnız 1'e ve 2'ye bölünür. Onu asal listesinden sakın çıkarma.",
    keyframes: [
      {
        hook: "stampTwo",
        offsetMs: 700,
        op: "SHOW_CALLOUT",
        params: {
          kind: "gold",
          badge: "TEK ÇİFT ASAL",
          text: "2, çift olup da asal kalan tek sayıdır.",
        },
      },
    ],
  },
  {
    id: "cue-06",
    chapterId: "ch-2",
    pauseAfterMs: 800,
    markedText:
      "Bir de her tek sayıyı asal sanma. {@trapNine} 9 tek bir sayıdır ama 3 çarpı 3 olduğu için asal değildir. 15 de tektir ama 3 çarpı 5 diye ayrılır. Tek olmak, asal olmak demek değildir. 9 tuzağını defterinin kenarına yaz.",
    keyframes: [
      {
        hook: "trapNine",
        offsetMs: 1200,
        op: "SHOW_CALLOUT",
        params: {
          kind: "trap",
          badge: "9 TUZAĞI",
          text: "9 = 3 × 3. Tek sayıdır, asal değildir.",
        },
      },
    ],
  },
  {
    id: "cue-07",
    chapterId: "ch-3",
    pauseAfterMs: 850,
    markedText:
      "12 sayısını asal çarpanlarına ayıralım. 12, 2 çarpı 6'dır. 6 ise 2 çarpı 3'tür. 3 zaten asaldır. O hâlde 12 sayısı, {@showTree} 2 çarpı 2 çarpı 3 şeklinde yazılır. Bunu 2 üssü 2 çarpı 3 olarak da kısaltabilirsin. Şimdi 7'ye bakalım: 7 sayısı 2'ye, 3'e veya 5'e bölünmez. Çarpanları sadece {@stampSeven} 1 ve 7'dir; yani 7 asaldır.",
    keyframes: [
      {
        hook: "showTree",
        offsetMs: 9000,
        op: "SHOW_PRIME_FACTOR_TREE",
        params: {
          composite: {
            number: 12,
            factors: [2, 2, 3],
            product: "2 × 2 × 3",
            branches: [
              { value: 2, atMs: 0 },
              { value: 2, atMs: 0 },
              { value: 3, atMs: 0 },
            ],
          },
        },
      },
      {
        hook: "stampSeven",
        offsetMs: 16000,
        op: "SHOW_PRIME_FACTOR_TREE",
        params: {
          prime: {
            number: 7,
            factors: [1, 7],
            stamp: "asal",
            nodes: [
              { value: 1, atMs: 0 },
              { value: 7, atMs: 0 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "cue-08",
    chapterId: "ch-3",
    pauseAfterMs: 750,
    markedText:
      "Ağacın dalı asal kalana kadar bölünür. 6 dalda kalamaz, çünkü 6 da iki çarpı üç diye ayrılır. 4 de dalda kalamaz, çünkü 4 iki çarpı ikidir. Ağaç, 12'yi daha küçük asal taşlara indirir. Kısaltma olarak 2 üssü 2 çarpı 3 dersin. Anlamı aynı çarpımdır.",
    keyframes: [
      {
        offsetMs: 1200,
        op: "SHOW_CALLOUT",
        params: {
          kind: "concept",
          badge: "AĞAÇ KURALI",
          text: "Dal asal kalana kadar bölünür. 6 ve 4 dalda durmaz.",
        },
      },
    ],
  },
  {
    id: "cue-09",
    chapterId: "ch-4",
    pauseAfterMs: 700,
    markedText:
      "Bunu takım kurarken de kullanırsın. {@teamSeven} 7 kişilik bir grup eşit takımlara yalnız 1'erli ya da 7'li ayrılır. Ara bir pay yoktur. Arkadaşların yedi kişi ise ortaya üçerli bir takım kuramazsın. 7 asal olduğu için ara pay bırakmaz.",
    keyframes: [
      {
        hook: "teamSeven",
        offsetMs: 800,
        op: "SHOW_CALLOUT",
        params: {
          kind: "concept",
          badge: "7 KİŞİLİK TAKIM",
          text: "Eşit pay yalnız 1'erli ya da 7'li. Ara pay yok.",
        },
      },
    ],
  },
  {
    id: "cue-10",
    chapterId: "ch-4",
    pauseAfterMs: 750,
    markedText:
      "12 kişilik grup ise 2'li ve 3'lü takımlara ayrılır. {@teamTwelve} Oyun başlarken on iki kişiyi ikişerli altı gruba ya da üçerli dört gruba koyabilirsin. Asal çarpanlar, takımın hangi eşit parçalara bölüneceğini söyler. Ağaç bu ayrımı önceden gösterir.",
    keyframes: [
      {
        hook: "teamTwelve",
        offsetMs: 1400,
        op: "SHOW_CALLOUT",
        params: {
          kind: "gold",
          badge: "12 KİŞİLİK TAKIM",
          text: "2'li ve 3'lü takımlar. Ağaç: 2 × 2 × 3.",
        },
      },
    ],
  },
  {
    id: "cue-11",
    chapterId: "ch-5",
    pauseAfterMs: 700,
    markedText:
      "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. 1 sayısını asal sanmak en yaygın tuzaklardan biridir. Unutma; asal sayılar mutlaka 1'den büyük olmak zorundadır. 9'u tek diye asal sanma. 2'yi çift diye listeden çıkarma.",
    keyframes: [
      {
        offsetMs: 2800,
        op: "SHOW_CALLOUT",
        params: {
          kind: "trap",
          badge: "ÜÇ KİLİT",
          text: "1 asal değildir. 9 asal değildir. 2 listede kalır.",
        },
      },
    ],
  },
  {
    id: "cue-12",
    chapterId: "ch-5",
    pauseAfterMs: 0,
    markedText:
      "Bugün Neler Öğrendik? Asal sayı, 1'den büyük ve yalnız 1 ile kendisine bölünen sayıdır. 1 asal değildir. 2 tek çift asal sayıdır. 9 asal değildir. 12, 2 çarpı 2 çarpı 3 olarak asal çarpanlarına ayrılır. Tebrikler çocuklar! Harika bir iş çıkardık. Şimdi sıra sende. 1'in neden asal olmadığını ve 12'nin çarpımını mikrofona kendi sözlerinle anlat.",
    keyframes: [
      {
        offsetMs: 0,
        op: "SET_STAGE",
        params: {
          layout: "summary-board",
          title: "Özet Kartı",
          subtitle: "Tanım, üç özel durum, tek ağaç",
          cards: [
            {
              icon: "puzzle",
              title: "Tanım",
              body: "1'den büyük. Yalnız 1 ve kendisi.",
            },
            {
              icon: "search",
              title: "1 ve 2",
              body: "1 asal değildir. 2 tek çift asaldır.",
            },
            {
              icon: "plus",
              title: "9 tuzağı",
              body: "9 = 3 × 3. Tek olması yetmez.",
            },
            {
              icon: "link",
              title: "12'nin ağacı",
              body: "12 = 2 × 2 × 3.",
            },
          ],
          echoPrompt: "1'in neden asal olmadığını ve 12'nin çarpımını kendi cümlenle anlat!",
        },
      },
    ],
  },
];

function mat6Chapters(cues: readonly CueSegment[], totalDurationMs: number) {
  return MAT_6_CHAPTERS.map((chapter, index) => {
    const first = cues.find((cue) => cue.chapterId === chapter.id);
    const next = MAT_6_CHAPTERS[index + 1];
    const nextFirst = next ? cues.find((cue) => cue.chapterId === next.id) : undefined;
    return {
      id: chapter.id,
      title: chapter.title,
      startMs: first ? first.startMs : 0,
      endMs: nextFirst ? nextFirst.startMs : totalDurationMs,
    };
  });
}

/** Taslak konuşma süreleri. Oynatıcı bunları PCM sanmaz. Fırın yerine geçer. */
export const DEFAULT_MAT_6_SPEECH_DURATIONS_MS: readonly number[] = [
  16800, 18200, 16400, 15800, 17200, 16600, 28600, 16200, 15400, 16800, 17600, 21400,
];

export function buildMat6TimelineFromDurations(speechDurationsMs: readonly number[]): TimelineJSON {
  let cursorMs = 0;
  const cues: CueSegment[] = MAT_6_AUTHORED_CUES.map((spec, index) => {
    const speechMs = speechDurationsMs[index] ?? 15_000;
    const cue = buildCueTimingFromBounds(spec, cursorMs, speechMs);
    cursorMs = cue.endMs + spec.pauseAfterMs;
    return cue;
  });
  const totalDurationMs = cues[cues.length - 1]?.endMs ?? 180_000;
  return {
    schemaVersion: "2.0.0",
    lessonKey: "jr_06_mat-2",
    title: MAT_6_CANONICAL_TITLE,
    grade: 6,
    subject: "Matematik",
    teacher: {
      name: "Selim",
      voice: "Fenrir",
      atempo: JUNIOR_BAKE_ATEMPO,
    },
    audio: {
      publicPath: "/media/junior/audio/jr_06_mat-2.mp3",
      durationMs: totalDurationMs,
      sampleRateHz: 48000,
    },
    chapters: mat6Chapters(cues, totalDurationMs),
    cues,
  };
}

export const MAT_6_DRAFT_TIMELINE: TimelineJSON = buildMat6TimelineFromDurations(
  DEFAULT_MAT_6_SPEECH_DURATIONS_MS,
);

export function mat6FullListenText(): string {
  return MAT_6_AUTHORED_CUES.map((cue) => parseMarkedCueText(cue.markedText).cleanText).join(" ");
}

export function mat6CueText(id: string): string {
  const spec = MAT_6_AUTHORED_CUES.find((cue) => cue.id === id);
  if (!spec) {
    throw new Error(`mat-6 kanonik sekans yok: ${id}`);
  }
  return parseMarkedCueText(spec.markedText).cleanText;
}

/**
 * 12 sekansın tek TTS gövdesi. Sekans arasına `[pause]` konur.
 * Pedagojik es süresi bu metinde değildir. Dönüş tam 1 istektir.
 */
export function mat6SingleRequestListenText(): string {
  const count = MAT_6_AUTHORED_CUES.length;
  if (count < 10 || count > 12) {
    throw new Error(`jr_06_mat-2 tek istek 10-12 sekans bekler. Gelen ${count}.`);
  }
  return MAT_6_AUTHORED_CUES.map((cue, index) => {
    const clean = parseMarkedCueText(cue.markedText).cleanText;
    const last = index === MAT_6_AUTHORED_CUES.length - 1;
    if (!last && !/[.!?…]["»)]*$/u.test(clean)) {
      throw new Error(`${cue.id} cümle sınırıyla bitmiyor. Tek istek duraklaması kaybolur.`);
    }
    if (last || cue.pauseAfterMs <= 0) {
      return clean;
    }
    return `${clean} [pause]`;
  }).join(" ");
}

const cue = mat6CueText;

export function mat6CanonicalBooklet(): {
  welcome: string;
  life: string;
  concept: string;
  example: string;
  warning: string;
  recap: readonly [string, string, string];
  heroQuestion: string;
  heroFocus: string;
} {
  return {
    welcome: cue("cue-01"),
    life: [cue("cue-09"), cue("cue-10")].join(" "),
    concept: ["cue-02", "cue-03", "cue-04", "cue-05", "cue-06"].map((id) => cue(id)).join(" "),
    example: [cue("cue-07"), cue("cue-08")].join(" "),
    warning: cue("cue-11"),
    recap: [
      "Asal sayı, 1'den büyük ve yalnız 1 ile kendisine bölünen sayıdır.",
      "1 asal değildir. 2 tek çift asal sayıdır. 9 asal değildir.",
      "12, 2 çarpı 2 çarpı 3 olarak asal çarpanlarına ayrılır.",
    ],
    heroQuestion: MAT_6_HERO_QUESTION,
    heroFocus: MAT_6_HERO_FOCUS,
  };
}
