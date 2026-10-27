/**
 * `jr_06_mat-1` projeksiyon saati. Kilitli oynatıcı dosyasının üzerine yazmaz.
 * Yeni dalga `bake-junior-pilot-tts --lesson=jr_06_mat-1 --force` ile gelir.
 *
 *   npx tsx scripts/project-mat5-timeline.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { assembleMat5PlaybackTimeline } from "@/lib/junior/pilot-engine/mat-1.choreography";
import { timelineJsonSchema } from "@/lib/junior/pilot-engine/schema";

const timelinePath = join(process.cwd(), "packages/junior-content/timelines/jr_06_mat-1.timeline.json");
const previous = timelineJsonSchema.parse(JSON.parse(readFileSync(timelinePath, "utf8")));
if (previous.production?.status === "locked") {
  throw new Error(
    "jr_06_mat-1 üretim durumu locked/ready. Projeksiyon bu dosyanın üzerine yazmaz.",
  );
}
const next = timelineJsonSchema.parse(assembleMat5PlaybackTimeline(previous));
writeFileSync(timelinePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");

const rows = next.cues.map((cue) => `${cue.id} ${cue.startMs}-${cue.endMs}`).join("\n");
console.log(`project-mat5-timeline OK — ${next.cues.length} sekans, ${next.audio.durationMs} ms`);
console.log(rows);
