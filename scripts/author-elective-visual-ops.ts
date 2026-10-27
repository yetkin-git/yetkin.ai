/**
 * A5 görsel onarımı — seçmeli 12 ders.
 *
 * Seçmeli timeline'lar yeni mühürlendi (`seed-junior-listen-timeline`), yani
 * karaoke saati var. Ama tek görsel op taşımıyorlardı: anlatı üç kez
 * «Hadi şimdi ekrandaki çizime birlikte bakalım!» diyor, ekran hiç değişmiyordu.
 *
 * Bu betik `SHOW_CONCEPT_LIST` op'ları ekler. İçerik dersin kendi senaryosundan
 * türetilir (`packages/junior-content/topics/<ders>.json`), uydurulmaz:
 *   · kavram durağı  → concept + outcomes
 *   · örnek durağı   → example cümlesinin parçaları
 *   · tuzak durağı   → warning
 *   · özet durağı    → recap
 * Cue metni, kelime saati ve süre değişmez.
 *
 *   npx tsx scripts/author-elective-visual-ops.ts            # kuru
 *   npx tsx scripts/author-elective-visual-ops.ts --apply
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
const TOPIC_DIR = join(ROOT, "packages", "junior-content", "topics");

const ELECTIVE_KEYS = [
  "jr_06_ing-1",
  "jr_06_ing-2",
  "jr_06_alm-1",
  "jr_06_alm-2",
  "jr_06_fra-1",
  "jr_06_fra-2",
  "jr_06_siyer-1",
  "jr_06_siyer-2",
  "jr_06_kod-1",
  "jr_06_kod-2",
  "jr_06_arp-1",
  "jr_06_arp-2",
] as const;

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

/** Cümleleri tam sınırda böler; yarım cümle satıra girmez. */
function sentences(text: string): string[] {
  return text
    .replace(/\s+/gu, " ")
    .trim()
    .split(/(?<=[.!?…])\s+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/** İlk cümleyi başlık, kalanı gövde yapar; gövde boşsa cümleyi böler. */
function row(sentence: string, tone: Tone, fallbackTitle: string): Row | null {
  const clean = sentence.replace(/^(Tuzaklara Düşme!|Altın İpucu!|Birlikte bakalım\.?)\s*/u, "").trim();
  if (clean.length < 12) {
    return null;
  }
  const parts = sentences(clean);
  const first = parts[0] ?? clean;
  const rest = parts.slice(1).join(" ");
  const title = first.length <= 64 ? first : fallbackTitle;
  const body = first.length <= 64 ? rest || first : first;
  return { title, body, tone };
}

function buildRows(topic: Topic): { concept: Row[]; example: Row[]; trap: Row[]; recap: Row[] } {
  const concept = [
    ...topic.outcomes.slice(0, 2).map((line) => row(line, "concept", "Kavram") ?? null),
    row(sentences(topic.concept)[0] ?? topic.concept, "concept", "Kavram"),
  ].filter((item): item is Row => item !== null);

  const exampleParts = sentences(topic.example).slice(0, 3);
  const example = exampleParts
    .map((part) => row(part, "example", "Örnek"))
    .filter((item): item is Row => item !== null);

  const trap = sentences(topic.warning)
    .filter((part) => !/^(Tuzaklara Düşme!|Altın İpucu!)$/u.test(part.trim()))
    .slice(0, 2)
    .map((part) => row(part, topic.hint === "gold" ? "gold" : "trap", "Dikkat"))
    .filter((item): item is Row => item !== null);

  const recap = topic.recap.map((line) => row(line, "recap", "Özet")).filter((item): item is Row => item !== null);

  return { concept, example, trap, recap };
}

type Planned = { cueId: string; heading: string; note?: string; rows: Row[] };

/** Çizim daveti cue'ları sırayla kavram → örnek → tuzak duraklarına bağlanır. */
function plan(lessonKey: string, topic: Topic, cueIds: readonly string[]): Planned[] {
  const groups = buildRows(topic);
  const drawCues = cueIds.filter((id) => id.length > 0);
  const recapCue = cueIds[cueIds.length - 1] ?? "";
  const [first, second, third] = drawCues;
  const stops: Planned[] = [];

  if (first && groups.concept.length > 0) {
    stops.push({
      cueId: first,
      heading: `${topic.title} · kavram`,
      rows: groups.concept,
    });
  }
  if (second && groups.example.length > 0) {
    stops.push({
      cueId: second,
      heading: `${topic.title} · örnek`,
      note: "Örnek, kavramın kendisini gösterir.",
      rows: groups.example,
    });
  }
  if (third && groups.trap.length > 0) {
    stops.push({
      cueId: third,
      heading: topic.hint === "gold" ? "Altın İpucu" : "Tuzaklara Düşme!",
      rows: groups.trap,
    });
  }
  const recapAnchor = stops.length > 0 ? null : first;
  if (groups.recap.length > 0) {
    stops.push({
      cueId: recapCue,
      heading: "Bugün Neler Öğrendik?",
      rows: groups.recap,
    });
  } else if (recapAnchor) {
    // Recap hiç yoksa son durak ilk çizim davetine düşer; boş sahne bırakılmaz.
    stops.push({ cueId: recapAnchor, heading: topic.title, rows: groups.concept });
  }
  return stops;
}

/** Çizim daveti cue'ları + özet cue'su. */
function anchors(timeline: TimelineJSON): string[] {
  const draws = timeline.cues
    .filter((cue) => cue.text.toLocaleLowerCase("tr-TR").includes("ekrandaki çizime birlikte bakalım"))
    .map((cue) => cue.id);
  const recap = timeline.cues.find((cue) =>
    cue.text.toLocaleLowerCase("tr-TR").includes("bugün neler öğrendik"),
  );
  return [...draws, recap?.id ?? ""];
}

function patchLesson(lessonKey: string): { before: number; after: number; stops: number } {
  const timelinePath = join(TIMELINE_DIR, `${lessonKey}.timeline.json`);
  const topicPath = join(TOPIC_DIR, `${lessonKey}.json`);
  const timeline = timelineJsonSchema.parse(JSON.parse(readFileSync(timelinePath, "utf8")) as unknown);
  const topic = JSON.parse(readFileSync(topicPath, "utf8")) as Topic;

  const stops = plan(lessonKey, topic, anchors(timeline));
  if (stops.length === 0) {
    throw new Error(`${lessonKey} için görsel durak üretilemedi.`);
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
      hook: "secmeli-anlati",
      params: {
        heading: stop.heading,
        ...(stop.note ? { note: stop.note } : {}),
        ...(stop.rows.length > 0 ? { reset: true } : {}),
        rows: stop.rows,
      },
    };
    cue.keyframes.push(frame);
    cue.keyframes.sort((left, right) => left.atMs - right.atMs);
  }

  const after = cues.reduce((sum, cue) => sum + cue.keyframes.length, 0);
  const next: TimelineJSON = timelineJsonSchema.parse({ ...timeline, cues });
  writeFileSync(timelinePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return { before, after, stops: stops.length };
}

function main(): void {
  const apply = process.argv.includes("--apply");
  for (const lessonKey of ELECTIVE_KEYS) {
    if (!apply) {
      process.stdout.write(`${lessonKey}: kuru.\n`);
      continue;
    }
    const result = patchLesson(lessonKey);
    process.stdout.write(
      `${lessonKey}: ${result.stops} durak · görsel op ${result.before} → ${result.after}\n`,
    );
  }
  process.stdout.write(apply ? "author-elective-visual-ops OK\n" : "author-elective-visual-ops kuru çalışma.\n");
}

main();
