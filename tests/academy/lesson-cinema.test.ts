import { describe, expect, it } from "vitest";
import {
  academyCinemaCaptionText,
  academyCinemaDurationSec,
  academyCinemaSeekAudioSeconds,
  formatAcademyCinemaClock,
  resolveAcademyCinemaSource,
} from "@/lib/academy/lesson-cinema";
import { ACADEMY_MEDIA_PUBLIC_ROOT } from "@/lib/academy/lesson-media";

describe("akademi sinema kaynağı", () => {
  it("bake yoksa Dynamic Canvas basar; HLS/MP4 yuvası durur", () => {
    const source = resolveAcademyCinemaSource("ledger-single-balance");
    expect(source.kind).toBe("canvas");
    expect(source.hls).toBe(`${ACADEMY_MEDIA_PUBLIC_ROOT}/micro/ledger-single-balance.m3u8`);
    expect(source.mp4.endsWith(".mp4")).toBe(true);
    expect(source.webm.endsWith(".webm")).toBe(true);
  });

  it("süre, saat ve altyazı cue dizisinden okunur", () => {
    expect(academyCinemaDurationSec({ spokenDuration: 42, microDurationSec: 8 })).toBe(42);
    expect(academyCinemaDurationSec({ spokenDuration: 0, microDurationSec: 6 })).toBe(8);
    expect(formatAcademyCinemaClock(65)).toBe("01:05");
    expect(
      academyCinemaSeekAudioSeconds({ visualTime: 10, visualDuration: 20, audioDuration: 40 }),
    ).toBe(20);
    expect(
      academyCinemaCaptionText({
        cues: [
          {
            text: "Tutar kuruştur.",
            start: 1,
            end: 4,
          },
        ],
        currentTime: 2,
        audioDuration: 0,
        spokenDuration: 4,
        audioLeadInSec: 0,
      }),
    ).toBe("Tutar kuruştur.");
  });
});
