import { describe, expect, it } from "vitest";
import {
  ACADEMY_TTS_RULE_EXAMPLE_PAUSE_MAX_SEC,
  ACADEMY_TTS_RULE_EXAMPLE_PAUSE_MIN_SEC,
  ACADEMY_TTS_RULE_EXAMPLE_PAUSE_SEC,
  ACADEMY_TTS_VISUAL_HOLD_SEC,
  academyBakeChunkGap,
} from "@/lib/academy/human-rhythm";
import { ACADEMY_INSTRUCTOR_SPEECH_RATE } from "@/lib/academy/instructors";

describe("insani anlatım ritmi", () => {
  it("konuşma hızı doğal temponun tam %7 yavaşıdır", () => {
    expect(ACADEMY_INSTRUCTOR_SPEECH_RATE).toBe(0.93);
  });

  it("cümle nefesi 0.4 sn, kural geçişi 1.5–2.0 bandında, slayt 1.5 sn önden gelir", () => {
    expect(ACADEMY_TTS_RULE_EXAMPLE_PAUSE_MIN_SEC).toBe(1.5);
    expect(ACADEMY_TTS_RULE_EXAMPLE_PAUSE_MAX_SEC).toBe(2);
    expect(ACADEMY_TTS_RULE_EXAMPLE_PAUSE_SEC).toBe(1.75);
    expect(ACADEMY_TTS_VISUAL_HOLD_SEC).toBe(1.5);
    const same = academyBakeChunkGap({
      prevCueId: "cue-02",
      nextCueId: "cue-02",
      prevParagraphIndex: 0,
      nextParagraphIndex: 0,
    });
    expect(same.pauseSec).toBe(0.4);
    expect(same.visualLeadSec).toBe(0);
    const rule = academyBakeChunkGap({
      prevCueId: "cue-02",
      nextCueId: "cue-02",
      prevParagraphIndex: 0,
      nextParagraphIndex: 1,
    });
    expect(rule.pauseSec).toBe(1.75);
    expect(rule.pauseSec).toBeGreaterThanOrEqual(ACADEMY_TTS_RULE_EXAMPLE_PAUSE_MIN_SEC);
    expect(rule.pauseSec).toBeLessThanOrEqual(ACADEMY_TTS_RULE_EXAMPLE_PAUSE_MAX_SEC);
    expect(rule.visualLeadSec).toBe(0);
    const slide = academyBakeChunkGap({
      prevCueId: "cue-02",
      nextCueId: "cue-03",
      prevParagraphIndex: 1,
      nextParagraphIndex: 0,
    });
    expect(slide.pauseSec).toBe(1.75);
    expect(slide.visualLeadSec).toBe(1.5);
  });
});
