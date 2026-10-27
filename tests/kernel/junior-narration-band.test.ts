import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  JUNIOR_MAT6_LOCKED_NARRATION_MS,
  JUNIOR_NARRATION_BELOW_BAND_FLAG,
  JUNIOR_SHORT_NARRATION_LESSON_KEY,
  juniorNarrationBandWarning,
} from "@/lib/junior/narration-band";
import { JUNIOR_NARRATION_MIN_MS } from "@/lib/junior/player-clock";

describe("jr_06_mat-6 süre bandı", () => {
  it("kilitli timeline 180 saniyenin altında ve uyarı bayrağı açıktır", () => {
    const timeline = JSON.parse(
      readFileSync(
        join(process.cwd(), "packages/junior-content/timelines/jr_06_mat-6.timeline.json"),
        "utf8",
      ),
    ) as { lessonKey: string; audio: { durationMs: number } };

    expect(timeline.lessonKey).toBe(JUNIOR_SHORT_NARRATION_LESSON_KEY);
    expect(timeline.audio.durationMs).toBe(JUNIOR_MAT6_LOCKED_NARRATION_MS);
    expect(timeline.audio.durationMs).toBeLessThan(JUNIOR_NARRATION_MIN_MS);

    const warning = juniorNarrationBandWarning(timeline.lessonKey, timeline.audio.durationMs);
    expect(warning?.flag).toBe(JUNIOR_NARRATION_BELOW_BAND_FLAG);
    expect(warning?.shortfallMs).toBe(JUNIOR_NARRATION_MIN_MS - JUNIOR_MAT6_LOCKED_NARRATION_MS);
    expect(juniorNarrationBandWarning("jr_06_mat-1", timeline.audio.durationMs)?.lessonKey).toBe(
      "jr_06_mat-1",
    );
    expect(juniorNarrationBandWarning("jr_06_mat-1", JUNIOR_NARRATION_MIN_MS)).toBeNull();
    expect(
      juniorNarrationBandWarning(JUNIOR_SHORT_NARRATION_LESSON_KEY, JUNIOR_NARRATION_MIN_MS),
    ).toBeNull();
  });
});
