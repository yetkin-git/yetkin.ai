/**
 * A5 dürüst yüzey onarımı — vaat edilen çizimi gerçekten çizen görsel op'lar.
 *
 * `jr_06_mat-26` (gözleme dayalı olasılık) ve `jr_06_fen-24` (çimlenme) anlatıda
 * «Hadi şimdi ekrandaki çizime birlikte bakalım!» diyor ama timeline'da hiç görsel
 * op taşımıyordu (yalnız açılış `SET_STAGE`). Çocuk çizime çağrılıyor, ekranda
 * hiçbir şey değişmiyordu. Bu, Anayasa A5 «Dürüst Yüzey» ihlalidir.
 *
 * Kural: burada yazılan her op `GraphicOpStage` / `JuniorPilotPlayer` tarafından
 * gerçekten basılır. Yalnız `keyframes` eklenir; cue metni, kelime saati ve süre
 * değişmez — akustik senkron kapısı (`verify:junior-sync`) etkilenmez.
 *
 *   npx tsx scripts/author-visual-ops.ts            # kuru
 *   npx tsx scripts/author-visual-ops.ts --apply
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

type PlannedOp = {
  /** Op, hedef cue'nun başlangıç milisaniyesine yazılır. */
  cueId: string;
  op: VisualKeyframe["op"];
  params: Record<string, unknown>;
  hook?: string;
};

/**
 * `jr_06_mat-26` — olasılık sahnesi.
 * `SHOW_FRACTION` gerçekten çizer: pay/payda, denk kesir, dilim sayısı.
 * `SHOW_ANGLE` gerçekten çizer: `names` + `note` alanları (ölçü satırları).
 */
const MAT_26: readonly PlannedOp[] = [
  {
    cueId: "cue-15",
    op: "SET_STAGE",
    hook: "cizim-daveti",
    params: {
      layout: "summary-board",
      title: "Yirmi atış, beş tura",
      subtitle: "Gözlem oranı çeteleyle ölçülür",
      ruleBadges: ["Pay = istenen sonuç", "Payda = bütün deneme"],
      echoPrompt: "20 atışta 5 tura için yirmide beş dersin.",
    },
  },
  {
    cueId: "cue-16",
    op: "SHOW_FRACTION",
    params: {
      operation: "gozlem",
      leftNumerator: 5,
      leftDenominator: 20,
      parts: 20,
      filled: 5,
      note: "Yirmi çekilişin beşi kırmızı",
    },
  },
  {
    cueId: "cue-19",
    op: "SHOW_FRACTION",
    params: {
      operation: "sadelestir",
      leftNumerator: 5,
      leftDenominator: 20,
      equivalentNumerator: 1,
      equivalentDenominator: 4,
      simplifiedNumerator: 1,
      simplifiedDenominator: 4,
      note: "5 ve 20'yi 5'e bölersek dörtte bir",
    },
  },
  {
    cueId: "cue-20",
    op: "SHOW_FRACTION",
    params: {
      operation: "iki-gozlem",
      leftNumerator: 5,
      leftDenominator: 20,
      rightNumerator: 15,
      rightDenominator: 20,
      simplifiedNumerator: 1,
      simplifiedDenominator: 4,
      note: "Mavi yirmide on beş · 15 + 5 = 20",
    },
  },
  {
    cueId: "cue-26",
    op: "SHOW_ANGLE",
    params: {
      kind: "tuzak-karsilastirma",
      names: ["5 kez gelmek", "olasılığın 5 olması değildir"],
      note: "Payda deneme sayısıdır: yirmide beş ile 5 aynı şey değildir.",
    },
  },
  {
    cueId: "cue-29",
    op: "SHOW_ANGLE",
    params: {
      kind: "az-deneme",
      names: ["az atış", "oran oynar", "kesinlik yok"],
      note: "Gözlem, kesin gelecek diye söz vermez.",
    },
  },
];

/**
 * `jr_06_fen-24` — çimlenme deneyi.
 * `SHOW_HABITAT` gerçekten çizer: tür sayıları, tehdit satırları, koruma cümlesi.
 * Deney düzeneği (iki tabak, tek değişken) bu alanlarla basılır.
 * `SHOW_FORCE` gerçekten çizer: yön ve denge satırları (değişken karşılaştırması).
 */
const FEN_24: readonly PlannedOp[] = [
  {
    cueId: "cue-20",
    op: "SET_STAGE",
    hook: "cizim-daveti",
    params: {
      layout: "summary-board",
      title: "Çimlenme deneyi",
      subtitle: "İki tabak, tek değişken",
      ruleBadges: ["Su", "Oksijen", "Uygun sıcaklık"],
      echoPrompt: "Bir deneyde hangi değişkeni değiştirdiğini söylersin.",
    },
  },
  {
    cueId: "cue-21",
    op: "SHOW_HABITAT",
    params: {
      birds: 10,
      plants: 10,
      threats: ["1. tabak nemli pamuk", "2. tabak kuru pamuk"],
      protection: "İki tabak aynı sıcaklıkta durur. Değişen tek şey sudur.",
    },
  },
  {
    cueId: "cue-26",
    op: "SHOW_HABITAT",
    params: {
      birds: 10,
      plants: 10,
      birdsLost: 0,
      threats: ["Nemli tabakta kökleşme başladı", "Kuru tabak susuz kaldı"],
      protection: "Bağımsız değişken su, bağımlı değişken çimlenmedir.",
    },
  },
  {
    cueId: "cue-28",
    op: "SHOW_FORCE",
    params: {
      unit: "°C",
      sameA: 4,
      sameB: 4,
      sameResult: 8,
      sameWay: "buzdolabı · aynı yön",
      oppositeA: 22,
      oppositeB: 4,
      oppositeResult: 18,
      oppositeWay: "oda sıcaklığı ile buzdolabı zıt",
      balanceA: 22,
      balanceB: 22,
      balanceResult: 0,
      showBalance: true,
      note: "Buzdolabındaki ıslak tohum oda sıcaklığındaki ikizine göre uyanmayabilir.",
    },
  },
  {
    cueId: "cue-30",
    op: "SHOW_ANGLE",
    params: {
      kind: "tuzak",
      names: ["güneş ışığı şart değil", "karanlık tek başına engel değil"],
      note: "Işık, fide yeşerdikten sonra besin üretimi için önem kazanır.",
    },
  },
  {
    cueId: "cue-36",
    op: "SHOW_ANGLE",
    params: {
      kind: "cift-degisken",
      names: ["hem su hem sıcaklık", "değişirse", "hangi değişken ayırt edilemez"],
      note: "Kontrollü deneyde bir değişken değişir.",
    },
  },
];

const PLANS: Readonly<Record<string, readonly PlannedOp[]>> = {
  "jr_06_mat-26": MAT_26,
  "jr_06_fen-24": FEN_24,
};

/** Okunabilirlik için: her op'un hangi cue'ya düştüğü ve o cue'nun konuşması. */
function patchLesson(
  lessonKey: string,
  ops: readonly PlannedOp[],
): { before: number; after: number; touched: string[] } {
  const path = join(TIMELINE_DIR, `${lessonKey}.timeline.json`);
  const timeline = timelineJsonSchema.parse(JSON.parse(readFileSync(path, "utf8")) as unknown);
  const indexByCue = new Map(timeline.cues.map((cue, index) => [cue.id, index]));
  const before = timeline.cues.reduce((sum, cue) => sum + cue.keyframes.length, 0);

  const cues = timeline.cues.map((cue) => ({ ...cue, keyframes: [...cue.keyframes] }));
  const touched: string[] = [];
  for (const plan of ops) {
    const index = indexByCue.get(plan.cueId);
    if (index === undefined) {
      throw new Error(`${lessonKey} içinde ${plan.cueId} yok.`);
    }
    const cue = cues[index]!;
    // Aynı op aynı anda zaten duruyorsa ikinci kez yazılmaz (idempotent).
    if (cue.keyframes.some((frame) => frame.op === plan.op && frame.atMs === cue.startMs)) {
      continue;
    }
    const frame: VisualKeyframe = {
      atMs: cue.startMs,
      op: plan.op,
      ...(plan.hook ? { hook: plan.hook } : {}),
      params: plan.params,
    };
    cue.keyframes.push(frame);
    cue.keyframes.sort((left, right) => left.atMs - right.atMs);
    touched.push(`${plan.cueId}:${plan.op}`);
  }

  const after = cues.reduce((sum, cue) => sum + cue.keyframes.length, 0);
  const next: TimelineJSON = timelineJsonSchema.parse({ ...timeline, cues });
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return { before, after, touched };
}

function main(): void {
  const apply = process.argv.includes("--apply");
  for (const [lessonKey, ops] of Object.entries(PLANS)) {
    if (!apply) {
      process.stdout.write(`${lessonKey}: ${ops.length} op planlandı (kuru).\n`);
      continue;
    }
    const result = patchLesson(lessonKey, ops);
    process.stdout.write(
      `${lessonKey}: görsel op ${result.before} → ${result.after} (${result.touched.join(", ")})\n`,
    );
  }
  process.stdout.write(apply ? "author-visual-ops OK\n" : "author-visual-ops kuru çalışma.\n");
}

main();
