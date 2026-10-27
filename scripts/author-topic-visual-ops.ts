/**
 * A5 görsel onarımı — ders başına kavram durakları üreteci.
 *
 * Statik kalan çekirdek dersler (tek `SET_STAGE`, ders boyunca donuk ekran) için
 * `SHOW_CONCEPT_LIST` op'ları üretir. Her durak dersin **kendi** senaryosundan
 * (`packages/junior-content/topics/<ders>.json`) türetilir; uydurulmuş cümle yok.
 *
 * Duraklar:
 *   1. kavram durakları  → `outcomes` + `concept` ilk cümlesi
 *   2. örnek durakları   → `example` cümleleri (adım adım)
 *   3. tuzak durağı      → `warning`
 *   4. özet durağı       → `recap`
 *
 * Cue metni, kelime saati ve süre değişmez; akustik senkron kapısı etkilenmez.
 *
 *   npx tsx scripts/author-topic-visual-ops.ts --lesson=jr_06_mat-4
 *   npx tsx scripts/author-topic-visual-ops.ts --lesson=jr_06_mat-4 --apply
 *   npx tsx scripts/author-topic-visual-ops.ts --all --apply
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  timelineJsonSchema,
  type TimelineJSON,
  type VisualKeyframe,
} from "@/lib/junior/pilot-engine/schema";

const ROOT = process.cwd();
const TIMELINE_DIR = join(ROOT, "packages", "junior-content", "timelines");
const TOPIC_DIR = join(ROOT, "packages", "junior-content", "topics");

/** Hikâye sırası: dersin anlatı evrelerini taşıyan cue metinleri. */
const CONCEPT_CUE = /pratik kural|kavram|tanım/iu;
const EXAMPLE_CUE = /örneğin|şimdi.*(bakalım|yapalım|oku)|bir diğer|hadi/iu;
const TRAP_CUE = /tuzaklara düşme|altın ipucu|dikkat etmen/i;
const RECAP_CUE = /bugün neler öğrendik/i;

type Tone = "concept" | "example" | "trap" | "gold" | "recap";
type Row = { title: string; body: string; tone: Tone };

type Topic = {
  title: string;
  concept: string;
  example: string;
  warning: string;
  recap: readonly string[];
  outcomes: readonly string[];
  hint?: "trap" | "gold";
};

function sentences(text: string): string[] {
  return text
    .replace(/\s+/gu, " ")
    .trim()
    .split(/(?<=[.!?…])\s+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

const STRIP_LEAD = /^(Tuzaklara Düşme!|Altın İpucu!|Birlikte bakalım\.?|Şimdi sevgili arkadaşım[^.]*\.)\s*/u;

function toRow(sentence: string, tone: Tone, fallbackTitle: string): Row | null {
  const clean = sentence.replace(STRIP_LEAD, "").trim();
  if (clean.length < 12) {
    return null;
  }
  const parts = sentences(clean);
  const first = parts[0] ?? clean;
  const rest = parts.slice(1).join(" ");
  if (first.length <= 68) {
    return { title: first, body: rest.length > 0 ? rest : first, tone };
  }
  return { title: fallbackTitle, body: clean, tone };
}

type Planned = { cueId: string; heading: string; note?: string; rows: Row[]; reset: boolean };

function anchors(timeline: TimelineJSON): {
  concept: string | null;
  example: string | null;
  trap: string | null;
  recap: string | null;
} {
  const pick = (pattern: RegExp): string | null => {
    const hit = timeline.cues.find((cue) => pattern.test(cue.text));
    return hit?.id ?? null;
  };
  return {
    concept: pick(CONCEPT_CUE),
    example: pick(EXAMPLE_CUE),
    trap: pick(TRAP_CUE),
    recap: pick(RECAP_CUE),
  };
}

function plan(topic: Topic, cues: ReturnType<typeof anchors>): Planned[] {
  const outcomeRows = topic.outcomes
    .slice(0, 2)
    .map((line) => toRow(line, "concept", "Kavram"))
    .filter((row): row is Row => row !== null);
  const conceptFirst = toRow(sentences(topic.concept)[0] ?? topic.concept, "concept", "Kavram");
  const conceptRows = [...outcomeRows, ...(conceptFirst ? [conceptFirst] : [])];

  const exampleRows = sentences(topic.example)
    .slice(0, 3)
    .map((line) => toRow(line, "example", "Örnek"))
    .filter((row): row is Row => row !== null);

  const trapRows = sentences(topic.warning)
    .filter((part) => !/^(Tuzaklara Düşme!|Altın İpucu!)$/u.test(part.trim()))
    .slice(0, 2)
    .map((line) => toRow(line, topic.hint === "gold" ? "gold" : "trap", "Dikkat"))
    .filter((row): row is Row => row !== null);

  const recapRows = topic.recap
    .map((line) => toRow(line, "recap", "Özet"))
    .filter((row): row is Row => row !== null);

  const stops: Planned[] = [];
  if (cues.concept && conceptRows.length > 0) {
    stops.push({
      cueId: cues.concept,
      heading: `${topic.title} · kavram`,
      rows: conceptRows,
      reset: true,
    });
  }
  if (cues.example && exampleRows.length > 0) {
    stops.push({
      cueId: cues.example,
      heading: `${topic.title} · örnek`,
      rows: exampleRows,
      reset: true,
    });
  }
  if (cues.trap && trapRows.length > 0) {
    stops.push({
      cueId: cues.trap,
      heading: topic.hint === "gold" ? "Altın İpucu" : "Tuzaklara Düşme!",
      rows: trapRows,
      reset: true,
    });
  }
  if (cues.recap && recapRows.length > 0) {
    stops.push({
      cueId: cues.recap,
      heading: "Bugün Neler Öğrendik?",
      rows: recapRows,
      reset: true,
    });
  }
  return stops;
}

function patchLesson(lessonKey: string): { before: number; after: number; stops: number } {
  const timeline = timelineJsonSchema.parse(
    JSON.parse(readFileSync(join(TIMELINE_DIR, `${lessonKey}.timeline.json`), "utf8")) as unknown,
  );
  const topic = JSON.parse(readFileSync(join(TOPIC_DIR, `${lessonKey}.json`), "utf8")) as Topic;
  const stops = plan(topic, anchors(timeline));
  if (stops.length < 2) {
    throw new Error(`${lessonKey} için yeterli durak üretilemedi (${stops.length}).`);
  }

  const indexByCue = new Map(timeline.cues.map((cue, index) => [cue.id, index]));
  const before = timeline.cues.reduce((sum, cue) => sum + cue.keyframes.length, 0);
  const cues = timeline.cues.map((cue) => ({ ...cue, keyframes: [...cue.keyframes] }));

  for (const stop of stops) {
    const index = indexByCue.get(stop.cueId);
    if (index === undefined) {
      throw new Error(`${lessonKey} içinde ${stop.cueId} yok.`);
    }
    const cue = cues[index]!;
    if (cue.keyframes.some((frame) => frame.op === "SHOW_CONCEPT_LIST" && frame.atMs === cue.startMs)) {
      continue;
    }
    const frame: VisualKeyframe = {
      atMs: cue.startMs,
      op: "SHOW_CONCEPT_LIST",
      hook: "konu-anlati",
      params: {
        heading: stop.heading,
        reset: stop.reset,
        rows: stop.rows,
        ...(stop.note ? { note: stop.note } : {}),
      },
    };
    cue.keyframes.push(frame);
    cue.keyframes.sort((left, right) => left.atMs - right.atMs);
  }

  const after = cues.reduce((sum, cue) => sum + cue.keyframes.length, 0);
  const next: TimelineJSON = timelineJsonSchema.parse({ ...timeline, cues });
  writeFileSync(join(TIMELINE_DIR, `${lessonKey}.timeline.json`), `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return { before, after, stops: stops.length };
}

function readdirSyncSafe(): string[] {
  return readdirSync(TIMELINE_DIR)
    .filter((name) => name.endsWith(".timeline.json"))
    .map((name) => name.slice(0, -".timeline.json".length))
    .sort();
}

function main(): void {
  const argv = process.argv.slice(2);
  const apply = argv.includes("--apply");
  const explicit = argv
    .filter((part) => part.startsWith("--lesson="))
    .map((part) => part.slice("--lesson=".length).trim())
    .filter((key) => key.length > 0);
  const keys = argv.includes("--all") ? readdirSyncSafe() : explicit;
  if (keys.length === 0) {
    throw new Error("--lesson=<anahtar> veya --all ver.");
  }
  for (const lessonKey of keys) {
    if (!apply) {
      process.stdout.write(`${lessonKey}: kuru (uygulanmadı).\n`);
      continue;
    }
    try {
      const result = patchLesson(lessonKey);
      process.stdout.write(
        `${lessonKey}: ${result.stops} durak · görsel op ${result.before} → ${result.after}\n`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${lessonKey} BAŞARISIZ — ${message}\n`);
    }
  }
  process.stdout.write(apply ? "author-topic-visual-ops OK\n" : "author-topic-visual-ops kuru çalışma.\n");
}

main();
