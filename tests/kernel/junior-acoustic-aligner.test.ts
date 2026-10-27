import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { reduceSceneState, type TimelineJSON, type WordTimestamp } from "@/lib/junior/pilot-engine/state-reducer";
import { alignWordsByAcoustics, spokenPhoneKinds } from "@/lib/junior/pilot-engine/word-aligner";

const RATE = 16_000;

function burst(samples: Int16Array, startMs: number, endMs: number, frequencyHz: number, amplitude: number): void {
  const start = Math.round((startMs / 1000) * RATE);
  const end = Math.min(samples.length, Math.round((endMs / 1000) * RATE));
  for (let index = start; index < end; index += 1) {
    const time = index / RATE;
    samples[index] = Math.round(amplitude * Math.sin(2 * Math.PI * frequencyHz * time));
  }
}

function silence(ms: number): Int16Array {
  return new Int16Array(Math.round((ms / 1000) * RATE));
}

function midpoint(word: { startMs: number; endMs: number }): number {
  return (word.startMs + word.endMs) / 2;
}

describe("akustik kelime hizası", () => {
  it("hece payı fonksiyonunu üretim yolundan çıkarmıştır", () => {
    const source = readFileSync(join(process.cwd(), "lib/junior/pilot-engine/word-aligner.ts"), "utf8");
    expect(source).not.toContain("alignWordsToSpeechWindow");
    expect(source).not.toContain("spokenWordWeight");
    const bake = readFileSync(join(process.cwd(), "scripts/bake-junior-pilot-tts.ts"), "utf8");
    expect(bake).toContain("alignWordsByAcoustics");
    expect(bake).toContain("decodeAudioToMonoPcm");
    const prebuild = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(prebuild.scripts["verify:prebuild"]).toContain("verify:junior-sync");
  });

  it("sessizlikle ayrılmış adalara kelimeleri sırayla oturtur", () => {
    const samples = silence(1_300);
    burst(samples, 180, 640, 180, 12_000);
    burst(samples, 920, 1_140, 240, 12_000);
    const aligned = alignWordsByAcoustics(["merhaba", "o"], samples, RATE, 0, 1_300);
    expect(aligned).toHaveLength(2);
    expect(midpoint(aligned[0]!)).toBeGreaterThanOrEqual(180);
    expect(midpoint(aligned[0]!)).toBeLessThanOrEqual(640);
    expect(aligned[0]!.endMs).toBeLessThanOrEqual(780);
    expect(aligned[1]!.startMs).toBeGreaterThanOrEqual(840);
    expect(midpoint(aligned[1]!)).toBeGreaterThanOrEqual(900);
    expect(midpoint(aligned[1]!)).toBeLessThanOrEqual(1_160);
  });

  it("baştaki sessizliği ilk kelimenin içine yazmaz", () => {
    const samples = silence(900);
    burst(samples, 300, 620, 200, 10_000);
    const aligned = alignWordsByAcoustics(["ev"], samples, RATE, 0, 900);
    expect(aligned[0]!.startMs).toBeGreaterThanOrEqual(240);
    expect(aligned[0]!.endMs).toBeLessThanOrEqual(720);
    expect(aligned[0]!.endMs).toBeGreaterThan(aligned[0]!.startMs);
  });

  it("aynı dalgada aynı damgayı üretir", () => {
    const samples = silence(800);
    burst(samples, 80, 360, 190, 9_000);
    burst(samples, 480, 700, 260, 9_000);
    const first = alignWordsByAcoustics(["bir", "sayı"], samples, RATE, 0, 800);
    const second = alignWordsByAcoustics(["bir", "sayı"], samples, RATE, 0, 800);
    expect(second).toEqual(first);
  });

  it("12 sayısını on iki diye okur", () => {
    expect(spokenPhoneKinds("12").length).toBeGreaterThan(spokenPhoneKinds("o").length);
  });
});

describe("altyazı vurgusu", () => {
  function probe(words: readonly WordTimestamp[]): TimelineJSON {
    const endMs = Math.max(...words.map((word) => word.endMs), 1);
    return {
      schemaVersion: "2.0.0",
      lessonKey: "jr_06_mat-1",
      title: "Altyazı sondası",
      grade: 6,
      subject: "Matematik",
      teacher: { name: "Selim", voice: "Fenrir", atempo: 0.94 },
      audio: { publicPath: "/media/junior/audio/probe.mp3", durationMs: endMs + 2_000, sampleRateHz: 48_000 },
      chapters: [{ id: "ch-1", title: "Sonda", startMs: 0, endMs: endMs + 2_000 }],
      cues: [
        {
          id: "cue-probe",
          chapterId: "ch-1",
          startMs: 0,
          endMs: endMs + 2_000,
          pauseAfterMs: 0,
          text: words.map((word) => word.word).join(" "),
          words: [...words],
          keyframes: [],
        },
      ],
    };
  }

  it("yalnız kelime aralığında amber kalır ve 150 ms sessizlikte düşer", () => {
    const timeline = probe([
      { word: "hiç", startMs: 0, endMs: 100 },
      { word: "kalan", startMs: 250, endMs: 400 },
    ]);
    expect(reduceSceneState(timeline, 100).activeWord?.word).toBe("hiç");
    expect(reduceSceneState(timeline, 101).activeWordIndex).toBe(-1);
    expect(reduceSceneState(timeline, 249).activeWordIndex).toBe(-1);
    expect(reduceSceneState(timeline, 250).activeWord?.word).toBe("kalan");
    expect(reduceSceneState(timeline, 400).activeWord?.word).toBe("kalan");
    expect(reduceSceneState(timeline, 401).activeWordIndex).toBe(-1);
  });
});
