import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import "@/lib/junior/pilot-engine/acoustic-timeline-disk";
import { juniorScenarioIfPresent } from "@/lib/junior/content-source";
import { buildListenTimelineSeed } from "@/lib/junior/pilot-engine/listen-timeline-seed";
import { getPilotTimelineForLesson } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import { resolveJuniorPlayback } from "@/lib/junior/pilot-engine/playback";
import { isJuniorGraphClockLesson } from "@/lib/junior/pilot-engine/playback-key";

const OPENERS = ["jr_06_turkce-1", "jr_06_sosyal-1", "jr_06_fen-1", "jr_06_ing_main-20"] as const;

describe("junior listen timeline seed", () => {
  it("dört ücretsiz kapının tohumu bugünkü listenText ile kurulur ve production taşımaz", () => {
    for (const lessonKey of OPENERS) {
      const scenario = juniorScenarioIfPresent(lessonKey);
      expect(scenario, lessonKey).not.toBeNull();
      if (!scenario) {
        continue;
      }
      const seed = buildListenTimelineSeed(scenario);
      expect(seed.timeline.lessonKey).toBe(lessonKey);
      expect(seed.timeline.production).toBeUndefined();
      expect(seed.timeline.cues.map((cue) => cue.text).join(" ")).toBe(
        seed.cues.map((cue) => cue.markedText).join(" "),
      );
      expect(seed.timeline.audio.publicPath).toBe(`/media/junior/audio/${lessonKey}.mp3`);
      expect(seed.timeline.audio.sampleRateHz).toBe(48000);
      expect(seed.timeline.teacher.atempo).toBe(0.94);
      expect(seed.timeline.chapters.map((chapter) => chapter.title)).toEqual(["Giriş", "Gelişme", "Sonuç"]);
      expect(seed.timeline.cues[0]?.keyframes[0]?.op).toBe("SET_STAGE");
      expect(seed.timeline.cues[0]?.keyframes[0]?.params.layout).toBe("summary-board");
      expect(JSON.stringify(seed.timeline.cues[0]?.keyframes[0]?.params)).not.toContain("Bölünebilme");
      expect(seed.timeline.cues.slice(1).every((cue) => cue.keyframes.length === 0)).toBe(true);
    }
  });

  it("kilitli ücretsiz kapı saatini stüdyo oynatıcısına bağlar", () => {
    for (const lessonKey of ["jr_06_turkce-1", "jr_06_sosyal-1", "jr_06_fen-1", "jr_06_ing_main-20"] as const) {
      const timeline = getPilotTimelineForLesson(lessonKey);
      expect(timeline?.production).toEqual({ status: "locked", readiness: "ready" });
      expect(timeline?.audio.publicPath).toBe(`/media/junior/audio/${lessonKey}.mp3`);
      expect((timeline?.cues[0]?.words?.length ?? 0) > 0).toBe(true);
      expect(resolveJuniorPlayback(lessonKey).engine).toBe("pilot");
      expect(isJuniorGraphClockLesson(lessonKey)).toBe(false);
    }
  });

  it("yazıcı ses dosyasına dokunan kapıyı reddeder", () => {
    const source = readFileSync(join(process.cwd(), "scripts/seed-junior-listen-timeline.ts"), "utf8");
    const fit = readFileSync(join(process.cwd(), "lib/junior/pilot-engine/listen-cue-fit.ts"), "utf8");
    expect(source).toContain("decodeAudioToMonoPcm");
    expect(source).toContain("fitListenCuesToAcoustics");
    expect(source).toContain("alignWordsByAcoustics");
    expect(fit).toContain("realignPilotTimelineWords");
    expect(source).toContain("--force ve --overwrite kapalıdır");
    expect(source).toContain("PILOT_BAKE_SPECS");
    expect(source).not.toContain("bake-junior-pilot-tts");
    expect(fit).not.toContain("bake-junior-pilot-tts");
  });
});
