/**
 * A5 görsel onarımı — kamuya açık açılış dersleri.
 *
 * Her ziyaretçinin ilk gördüğü 5 ders (`jr_06_mat-1`, `jr_06_fen-1`,
 * `jr_06_turkce-1`, `jr_06_sosyal-1`, `jr_06_ing_main-20`) tek `SET_STAGE`
 * taşıyor, yani ders boyunca ekran donuk kalıyordu. `jr_06_mat-1` ve
 * `jr_06_mat-2` gerçek koreografiye sahip; onlara dokunulmaz.
 *
 * Bu betik `SHOW_CONCEPT_LIST` op'ları ekler: anlatı ilerledikçe satır satır
 * açılan kavram listesi. Cue metni, kelime saati ve süre değişmez —
 * akustik senkron kapısı etkilenmez.
 *
 *   npx tsx scripts/author-opener-visual-ops.ts            # kuru
 *   npx tsx scripts/author-opener-visual-ops.ts --apply
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  timelineJsonSchema,
  type TimelineJSON,
  type VisualKeyframe,
} from "@/lib/junior/pilot-engine/schema";

const ROOT = process.cwd();
const TIMELINE_DIR = join(ROOT, "packages", "junior-content", "timelines");

type ConceptRow = {
  title: string;
  body: string;
  tone: "concept" | "example" | "trap" | "gold" | "recap";
};

type Beat = {
  /** Op bu cue'nun başlangıcına yazılır. */
  cueId: string;
  heading?: string;
  subtitle?: string;
  note?: string;
  rows: readonly ConceptRow[];
};

const FEN_1: readonly Beat[] = [
  {
    cueId: "cue-13",
    heading: "Güneş sistemi nedir?",
    subtitle: "Merkezde yıldız, çevresinde gezegenler",
    rows: [
      {
        title: "Güneş bir yıldızdır",
        body: "Sistemin merkezinde durur ve gezegen değildir.",
        tone: "concept",
      },
      {
        title: "Gezegen nedir?",
        body: "Bir yıldızın çevresinde dolanan büyük gök cismidir.",
        tone: "concept",
      },
    ],
  },
  {
    cueId: "cue-16",
    heading: "İç gezegenler",
    subtitle: "Güneş'e en yakın dörtlü",
    rows: [
      {
        title: "Merkür · Venüs · Dünya · Mars",
        body: "Bu dörtlüye iç gezegenler veya karasal gezegenler denir.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-18",
    heading: "Dış gezegenler",
    subtitle: "Gaz devleri",
    rows: [
      {
        title: "Jüpiter · Satürn · Uranüs · Neptün",
        body: "Daha uzakta duran bu dörtlüye gaz devleri denir.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-20",
    heading: "Sıra tam sekiz",
    note: "Sıra her zaman Güneş'ten dışa doğru sayılır.",
    rows: [
      {
        title: "Bir · iki · üç… sekiz",
        body: "Güneş'ten dışa doğru sıraladığımızda tam sekiz gezegen çıkar.",
        tone: "recap",
      },
    ],
  },
  {
    cueId: "cue-21",
    heading: "Ay listede yok",
    rows: [
      {
        title: "Ay bir uydudur",
        body: "Gezegenler sırasına dahil edilmez.",
        tone: "trap",
      },
    ],
  },
  {
    cueId: "cue-35",
    heading: "Altın İpucu",
    rows: [
      {
        title: "Ay'ı sekizlerin arasına yazma",
        body: "Ay uydudur, Plüton cüce gezegendir.",
        tone: "gold",
      },
    ],
  },
  {
    cueId: "cue-42",
    heading: "Bugün Neler Öğrendik?",
    subtitle: "Üç nokta",
    rows: [
      {
        title: "1. Güneş yıldızdır",
        body: "Merkezdeki yıldız gezegen sayılmaz.",
        tone: "recap",
      },
      {
        title: "2. Sekiz gezegen",
        body: "Merkür'den Neptün'e kadar sekiz gezegen vardır.",
        tone: "recap",
      },
      {
        title: "3. Ay uydu, Plüton cüce gezegen",
        body: "İkisi de sekiz ana gezegenin yerine geçmez.",
        tone: "recap",
      },
    ],
  },
];

const TURKCE_1: readonly Beat[] = [
  {
    cueId: "cue-15",
    heading: "Gerçek anlam",
    subtitle: "Aklımıza ilk gelen anlam",
    rows: [
      {
        title: "Gerçek anlam",
        body: "Sözcüğün akla ilk gelen, herkesçe bilinen anlamıdır.",
        tone: "concept",
      },
    ],
  },
  {
    cueId: "cue-16",
    heading: "Gerçek anlam örneği",
    rows: [
      {
        title: "Göz görmemizi sağlar",
        body: "Duyu organı anlamı gerçek anlamdır.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-17",
    heading: "Mecaz anlam",
    rows: [
      {
        title: "Mecaz anlam",
        body: "Gerçek anlamdan uzaklaşıp benzetmeyle kurulan yeni anlamdır.",
        tone: "concept",
      },
    ],
  },
  {
    cueId: "cue-18",
    heading: "Mecaz anlam örneği",
    rows: [
      {
        title: "Gözü açık çocuk",
        body: "Uyanık ve dikkatli çocuk demektir; gözle ilgisi yoktur.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-19",
    heading: "Terim anlam",
    rows: [
      {
        title: "Terim anlam",
        body: "Bir bilim, sanat, spor veya meslek dalının özel anlamıdır.",
        tone: "concept",
      },
    ],
  },
  {
    cueId: "cue-20",
    heading: "Terim anlam örneği",
    rows: [
      {
        title: "Matematikte kök",
        body: "Bir sayının kökünü anlatır; bitki kökü değildir.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-22",
    heading: "Aynı sözcük, üç cümle",
    subtitle: "kök",
    rows: [
      {
        title: "Ağacın kökü toprakta",
        body: "Gerçek anlam.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-24",
    heading: "kök · ikinci cümle",
    rows: [
      {
        title: "Sorunun kökü acele etmek",
        body: "Mecaz anlam.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-25",
    heading: "kök · üçüncü cümle",
    rows: [
      {
        title: "Dokuzun karekökü üçtür",
        body: "Terim anlam.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-31",
    heading: "Tuzaklara Düşme!",
    rows: [
      {
        title: "Mecazı gerçek sanma",
        body: "Yüzü düştü cümlesinde yüz yere düşmez; üzüntü anlatılır.",
        tone: "trap",
      },
      {
        title: "Terimi günlük eşyayla karıştırma",
        body: "Bilimsel terim sıradan nesne anlamına gelmez.",
        tone: "trap",
      },
    ],
  },
  {
    cueId: "cue-39",
    heading: "Bugün Neler Öğrendik?",
    subtitle: "Üç nokta",
    rows: [
      {
        title: "1. Gerçek anlam",
        body: "Akla ilk gelen somut anlamdır.",
        tone: "recap",
      },
      {
        title: "2. Mecaz anlam",
        body: "Benzetmeyle kurulan soyut ve yeni anlamdır.",
        tone: "recap",
      },
      {
        title: "3. Terim anlam",
        body: "Bilim, sanat ve meslek alanlarının özel anlamıdır.",
        tone: "recap",
      },
    ],
  },
];

const SOSYAL_1: readonly Beat[] = [
  {
    cueId: "cue-15",
    heading: "Değer nedir?",
    subtitle: "Birlikte yaşamı kolaylaştıran ilke",
    rows: [
      {
        title: "Değer",
        body: "Birlikte yaşamayı güzelleştiren ve kolaylaştıran temel ilkedir.",
        tone: "concept",
      },
    ],
  },
  {
    cueId: "cue-16",
    heading: "Değerlerimiz",
    rows: [
      {
        title: "Saygı · dürüstlük · yardımlaşma · sorumluluk",
        body: "Bu dört ilke her rolde seninle yürür.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-17",
    heading: "Rol nedir?",
    rows: [
      {
        title: "Rol",
        body: "Bir grupta ya da toplumda üstlendiğin görevdir.",
        tone: "concept",
      },
    ],
  },
  {
    cueId: "cue-18",
    heading: "Bir gün, üç rol",
    rows: [
      {
        title: "Evde kardeş",
        body: "Aile içinde üstlendiğin rol.",
        tone: "example",
      },
      {
        title: "Okulda öğrenci",
        body: "Sınıfta üstlendiğin rol.",
        tone: "example",
      },
      {
        title: "Sahada oyuncu",
        body: "Takımda üstlendiğin rol.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-20",
    heading: "Yer değişir, sen kalırsın",
    rows: [
      {
        title: "Rol ortamla değişir",
        body: "Bulunduğun yer değiştikçe rolün de değişir; sen aynı kişisin.",
        tone: "concept",
      },
    ],
  },
  {
    cueId: "cue-32",
    heading: "Tuzaklara Düşme!",
    rows: [
      {
        title: "Rolü kişiliğin tamamı sanma",
        body: "Bir insanın rolü onun bütün kişiliği değildir.",
        tone: "trap",
      },
      {
        title: "Rolün adını değerle karıştırma",
        body: "Saygı bir rol değil, her rolü güzelleştiren değerdir.",
        tone: "trap",
      },
    ],
  },
  {
    cueId: "cue-41",
    heading: "Bugün Neler Öğrendik?",
    subtitle: "Üç nokta",
    rows: [
      {
        title: "1. Değer bir ilkedir",
        body: "Birlikte yaşamayı kolaylaştırır.",
        tone: "recap",
      },
      {
        title: "2. Rol bir görevdir",
        body: "Aynı kişi birden fazla rol taşır.",
        tone: "recap",
      },
      {
        title: "3. Rol değişir, değer kalır",
        body: "Rolün adı değerin yerine geçmez.",
        tone: "recap",
      },
    ],
  },
];

const ING_20: readonly Beat[] = [
  {
    cueId: "cue-11",
    heading: "Right = hak",
    subtitle: "Hak, yapabildiğin şeydir",
    rows: [
      {
        title: "Right",
        body: "Bir birey olarak sahip olduğun haktır: konuşmak, öğrenmek, soru sormak.",
        tone: "concept",
      },
    ],
  },
  {
    cueId: "cue-12",
    heading: "Responsibility = sorumluluk",
    rows: [
      {
        title: "Responsibility",
        body: "Toplumun ve sınıfın senden beklediği görevdir: dinlemek, sırasını beklemek.",
        tone: "concept",
      },
    ],
  },
  {
    cueId: "cue-13",
    heading: "Sınıf kuralları dengeyi kurar",
    rows: [
      {
        title: "Raise your hand",
        body: "Söz hakkı isterken parmak kaldırılır.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-16",
    heading: "Üç altın kural",
    rows: [
      {
        title: "First",
        body: "Sınıf panosuna yazılan ilk kural.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-17",
    heading: "Üç altın kural · 2",
    rows: [
      {
        title: "Second, we listen",
        body: "Öğretmeni ve arkadaşları saygıyla dinleriz.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-18",
    heading: "Üç altın kural · 3",
    rows: [
      {
        title: "Third, we keep our classroom tidy",
        body: "Sınıfı temiz ve düzenli tutarız.",
        tone: "example",
      },
    ],
  },
  {
    cueId: "cue-20",
    heading: "Tuzaklara Düşme!",
    rows: [
      {
        title: "Hak ile sorumluluğu karıştırma",
        body: "Hak sahip olduğun, sorumluluk üstlendiğin şeydir.",
        tone: "trap",
      },
      {
        title: "Hak başkasının hakkını silmez",
        body: "Haklarımız başkasının hakkına zarar vermediği sürece geçerlidir.",
        tone: "trap",
      },
    ],
  },
  {
    cueId: "cue-26",
    heading: "Bugün Neler Öğrendik?",
    subtitle: "Three points",
    rows: [
      {
        title: "1. Right is a right",
        body: "Konuşmak, öğrenmek ve soru sormak temel haktır.",
        tone: "recap",
      },
      {
        title: "2. Responsibility is a duty",
        body: "Dinlemek ve sırasını beklemek sorumluluktur.",
        tone: "recap",
      },
      {
        title: "3. Rules balance both",
        body: "Sınıf kuralları hak ve sorumluluğu adil dengede buluşturur.",
        tone: "recap",
      },
    ],
  },
];

const PLANS: Readonly<Record<string, readonly Beat[]>> = {
  "jr_06_fen-1": FEN_1,
  "jr_06_turkce-1": TURKCE_1,
  "jr_06_sosyal-1": SOSYAL_1,
  "jr_06_ing_main-20": ING_20,
};

function patchLesson(lessonKey: string, beats: readonly Beat[]): { before: number; after: number } {
  const path = join(TIMELINE_DIR, `${lessonKey}.timeline.json`);
  const timeline = timelineJsonSchema.parse(JSON.parse(readFileSync(path, "utf8")) as unknown);
  const indexByCue = new Map(timeline.cues.map((cue, index) => [cue.id, index]));
  const before = timeline.cues.reduce((sum, cue) => sum + cue.keyframes.length, 0);

  const cues = timeline.cues.map((cue) => ({ ...cue, keyframes: [...cue.keyframes] }));
  for (const beat of beats) {
    const index = indexByCue.get(beat.cueId);
    if (index === undefined) {
      throw new Error(`${lessonKey} içinde ${beat.cueId} yok.`);
    }
    const cue = cues[index]!;
    if (cue.keyframes.some((frame) => frame.op === "SHOW_CONCEPT_LIST" && frame.atMs === cue.startMs)) {
      continue;
    }
    const frame: VisualKeyframe = {
      atMs: cue.startMs,
      op: "SHOW_CONCEPT_LIST",
      hook: "anlati-ilerlemesi",
      params: {
        ...(beat.heading ? { heading: beat.heading } : {}),
        ...(beat.subtitle ? { subtitle: beat.subtitle } : {}),
        ...(beat.note ? { note: beat.note } : {}),
        rows: beat.rows,
      },
    };
    cue.keyframes.push(frame);
    cue.keyframes.sort((left, right) => left.atMs - right.atMs);
  }

  const after = cues.reduce((sum, cue) => sum + cue.keyframes.length, 0);
  const next: TimelineJSON = timelineJsonSchema.parse({ ...timeline, cues });
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return { before, after };
}

function main(): void {
  const apply = process.argv.includes("--apply");
  for (const [lessonKey, beats] of Object.entries(PLANS)) {
    if (!apply) {
      process.stdout.write(`${lessonKey}: ${beats.length} kavram durağı planlandı (kuru).\n`);
      continue;
    }
    const result = patchLesson(lessonKey, beats);
    process.stdout.write(`${lessonKey}: görsel op ${result.before} → ${result.after}\n`);
  }
  process.stdout.write(apply ? "author-opener-visual-ops OK\n" : "author-opener-visual-ops kuru çalışma.\n");
}

main();
