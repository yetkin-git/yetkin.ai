import { describe, expect, it } from "vitest";

import { applyAcousticPauses, demoteSentencePunctuation } from "@/lib/junior/pilot-engine/listen-cue-fit";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";

describe("junior listen cue fit", () => {
  it("cümle işaretini düşürür, sayı noktasını bırakır", () => {
    expect(demoteSentencePunctuation("Saygıyla respectfully. konuş.", "respectfully.")).toBe(
      "Saygıyla respectfully konuş.",
    );
    expect(demoteSentencePunctuation("Bu bir örüntüdür. Sonra dur.", "örüntüdür.")).toBe(
      "Bu bir örüntüdür Sonra dur.",
    );
    expect(demoteSentencePunctuation("Taşır. ve 12. madde", "12.")).toBe("Taşır. ve 12. madde");
    expect(demoteSentencePunctuation("Geldiniz! çocuklar", "Geldiniz!")).toBe("Geldiniz çocuklar");
    expect(demoteSentencePunctuation("Aynı respectfully. ikinci respectfully.", "respectfully.")).toBe(
      "Aynı respectfully ikinci respectfully.",
    );
  });

  it("pauseAfterMs son kelime ile sonraki kelime arasındaki boşluktur", () => {
    const timeline = timelineJsonSchema.parse({
      schemaVersion: "2.0.0",
      lessonKey: "jr_06_fen-1",
      title: "Ölçü",
      grade: 6,
      subject: "Fen",
      teacher: { name: "Deniz", voice: "Fenrir", atempo: 0.94 },
      audio: { publicPath: "/media/junior/audio/jr_06_fen-1.mp3", durationMs: 5000, sampleRateHz: 48000 },
      chapters: [{ id: "ch-1", title: "Giriş", startMs: 0, endMs: 5000 }],
      cues: [
        {
          id: "cue-01",
          chapterId: "ch-1",
          startMs: 0,
          endMs: 1200,
          pauseAfterMs: 280,
          text: "Geldiniz.",
          words: [{ word: "Geldiniz.", startMs: 0, endMs: 900 }],
          keyframes: [],
        },
        {
          id: "cue-02",
          chapterId: "ch-1",
          startMs: 1200,
          endMs: 5000,
          pauseAfterMs: 280,
          text: "Başlayalım.",
          words: [{ word: "Başlayalım.", startMs: 2100, endMs: 4800 }],
          keyframes: [],
        },
      ],
    }) as TimelineJSON;
    const fitted = applyAcousticPauses(timeline);
    expect(fitted.cues[0]?.pauseAfterMs).toBe(1200);
    expect(fitted.cues[1]?.pauseAfterMs).toBe(200);
    expect(fitted.production).toBeUndefined();
  });
});
