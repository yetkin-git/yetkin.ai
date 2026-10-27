/**
 * Kilitli grafik JSON'unun oynatıcı kapısını yoklar. Dosya yazmaz.
 *   npx tsx scripts/check-junior-graph-seal.ts
 */
import "@/lib/junior/pilot-engine/acoustic-timeline-disk";
import { juniorBookletCopy } from "@/lib/junior/booklet";
import { isLockedTimeline } from "@/lib/junior/pilot-engine/acoustic-timeline-store";
import { getPilotTimelineForLesson } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";

const KEYS = [
  "jr_06_mat-3",
  "jr_06_mat-7",
  "jr_06_mat-8",
  "jr_06_mat-9",
  "jr_06_mat-14",
  "jr_06_mat-15",
  "jr_06_mat-16",
  "jr_06_mat-17",
  "jr_06_mat-18",
  "jr_06_mat-19",
  "jr_06_mat-20",
  "jr_06_mat-21",
  "jr_06_mat-22",
  "jr_06_fen-9",
  "jr_06_fen-10",
  "jr_06_fen-21",
  "jr_06_fen-37",
  "jr_06_fen-38",
] as const;

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 12);
}

const issues: string[] = [];
for (const lessonKey of KEYS) {
  const timeline = getPilotTimelineForLesson(lessonKey);
  if (!isLockedTimeline(timeline) || timeline.lessonKey !== lessonKey) {
    issues.push(`${lessonKey} kilitli JSON oynatıcıya girmiyor.`);
    continue;
  }
  const words = timeline.cues.reduce((sum, cue) => sum + (cue.words?.length ?? 0), 0);
  if (words === 0) {
    issues.push(`${lessonKey} kelime saati boş.`);
  }
  const film = timeline.cues.map((cue) => cue.text).join(" ");
  const missing = sentences(juniorBookletCopy(lessonKey).example).filter((sentence) => !film.includes(sentence));
  if (missing.length > 0) {
    issues.push(`${lessonKey} not cümlesi filmde yok: ${missing.join(" | ")}`);
  }
  for (const cue of timeline.cues) {
    for (const frame of cue.keyframes) {
      const marks = frame.params.marks;
      if (!Array.isArray(marks)) {
        continue;
      }
      for (const mark of marks) {
        if (!mark || typeof mark !== "object" || !("atMs" in mark)) {
          continue;
        }
        const atMs = (mark as { atMs: number }).atMs;
        const hit = cue.words?.some((word) => word.startMs === atMs);
        if (!hit) {
          issues.push(`${lessonKey} ${cue.id} ${frame.op} işareti kelime başında değil (${atMs}).`);
        }
      }
    }
  }
}

if (issues.length > 0) {
  for (const issue of issues) {
    process.stderr.write(`${issue}\n`);
  }
  process.exit(1);
}
process.stdout.write(`check:junior-graph-seal OK — ${KEYS.length} ders kilitli\n`);
