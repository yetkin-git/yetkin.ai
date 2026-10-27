#!/usr/bin/env tsx
/**
 * A5 «Dürüst Yüzey» görsel op kapısı.
 *
 * İki ihlal sınıfı arar:
 *   1. SERT — Anlatı «ekrandaki çizime birlikte bakalım» diyor ama timeline'da
 *      `SET_STAGE` dışında tek görsel op yok. Çocuk çizime çağrılıyor, ekran donuk.
 *   2. RAPOR — `SHOW_STATIC` işareti: tek `SET_STAGE` taşıyan ders (statik sahne).
 *      Kapıyı düşürmez; storyboard borcunu görünür tutar.
 *
 *   npm run verify:junior-visual-ops
 *   npm run verify:junior-visual-ops -- --report   # statik ders listesini de bas
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";

const ROOT = process.cwd();
const TIMELINE_DIR = join(ROOT, "packages", "junior-content", "timelines");

/**
 * Storyboard borcu işareti.
 * Tek `SET_STAGE` taşıyan ders "statik sahne"dir: anlatı ilerlerken ekran değişmez.
 * Bu bir **yayın engeli değildir** (A5 ihlali değildir: ders çizim vaat etmiyorsa
 * yalan söylemiyordur), ama bilinen bir kalite borcudur. Kapı bu listeyi basar ki
 * borç görünmez kalmasın; `--strict` ile yayın öncesi sıfırlanması istenebilir.
 *
 * Borç evi: `docs/TEDAVI_RAPORU_01.md` §2.2 ve `scripts/author-topic-visual-ops.ts`
 * (ders başına durak üreteci). Yeni ders yazılırken `--strict` yeşil olmalıdır.
 */
export const STORYBOARD_DEBT_MARKER = "junior.storyboard.debt";

/** Anlatıdaki çizim daveti. Ses metni bu cümleyi söylüyorsa ekranda çizim olmalı. */
const DRAW_INVITE = "ekrandaki çizime birlikte bakalım";

/** Gerçek görsel hareket sayılan op'lar. `SET_STAGE` sahne kurulumudur, hareket değildir. */
const MOTION_OPS = new Set([
  "SPAWN_MARBLES",
  "GROUP_MARBLES",
  "SHOW_FACTOR_TREE",
  "BUILD_MULTIPLE_TOWER",
  "HIGHLIGHT_COMPARISON",
  "INSPECT_NUMBER",
  "HIGHLIGHT_DIGIT",
  "ANIMATE_DIGIT_SUM",
  "STAMP_VERDICT",
  "SHOW_PRIME_FACTOR_TREE",
  "SHOW_COMMON_DIVISOR",
  "SHOW_CIRCLE",
  "SHOW_HABITAT",
  "SHOW_FUEL",
  "SHOW_FRACTION",
  "SHOW_NUMBER_LINE",
  "SHOW_ANGLE",
  "SHOW_AREA",
  "SHOW_FORCE",
  "SHOW_SPEED",
  "SHOW_CONCEPT_LIST",
]);

export type VisualAudit = {
  lessonKey: string;
  cues: number;
  motionOps: number;
  promisesDrawing: boolean;
  /** Sert ihlal: çizim vaadi var, görsel op yok. */
  violation: boolean;
  /** Storyboard borcu: tek sahne kurulumu, hiç hareket yok. */
  staticScene: boolean;
};

export function auditTimeline(timeline: TimelineJSON): VisualAudit {
  const cues = timeline.cues.length;
  const frames = timeline.cues.flatMap((cue) => cue.keyframes);
  const motionOps = frames.filter((frame) => MOTION_OPS.has(frame.op)).length;
  const promisesDrawing = timeline.cues.some((cue) =>
    cue.text.toLocaleLowerCase("tr-TR").includes(DRAW_INVITE),
  );
  return {
    lessonKey: timeline.lessonKey,
    cues,
    motionOps,
    promisesDrawing,
    violation: promisesDrawing && motionOps === 0,
    staticScene: motionOps === 0,
  };
}

function readAll(): VisualAudit[] {
  return readdirSync(TIMELINE_DIR)
    .filter((name) => name.endsWith(".timeline.json"))
    .sort()
    .map((name) => {
      const timeline = timelineJsonSchema.parse(
        JSON.parse(readFileSync(join(TIMELINE_DIR, name), "utf8")) as unknown,
      );
      return auditTimeline(timeline);
    });
}

function main(): void {
  const report = process.argv.includes("--report");
  const strict = process.argv.includes("--strict");
  const audits = readAll();
  const violations = audits.filter((row) => row.violation);
  const statics = audits.filter((row) => row.staticScene);
  const totalOps = audits.reduce((sum, row) => sum + row.motionOps, 0);
  const promises = audits.filter((row) => row.promisesDrawing);

  process.stdout.write(
    `A5 görsel op kapısı — ${audits.length} timeline · ${promises.length} çizim vaadi · ` +
      `${totalOps} görsel hareket · ${statics.length} statik sahne\n`,
  );

  if (violations.length > 0) {
    process.stderr.write(
      [
        "A5 İHLALİ — anlatı çizime çağırıyor, ekranda hiç görsel op yok:",
        ...violations.map((row) => `  ✗ ${row.lessonKey} (${row.cues} cue, 0 hareket)`),
      ].join("\n") + "\n",
    );
    process.exit(1);
  }

  if (statics.length > 0) {
    process.stdout.write(
      `${STORYBOARD_DEBT_MARKER} — ${statics.length} ders tek sahne kurulumuyla açılıyor ` +
        `(yayın engeli değil, bilinen kalite borcu).\n`,
    );
  }
  if (report) {
    process.stdout.write(
      ["Statik sahne (storyboard borcu):", ...statics.map((row) => `  · ${row.lessonKey}`)].join("\n") + "\n",
    );
  }
  if (strict && statics.length > 0) {
    process.stderr.write(
      `--strict: ${statics.length} statik ders var. Borç kapanmadan bu kapı yeşil olmaz.\n`,
    );
    process.exit(1);
  }
  process.stdout.write("verify:junior-visual-ops OK\n");
}

main();
