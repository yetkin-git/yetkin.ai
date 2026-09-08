import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chunkAcademyWebSpeechText, prepareAcademyWebSpeechText, ACADEMY_WEB_SPEECH_CHUNK_CHARS } from "@/lib/academy/web-speech";

const ROOT = process.cwd();

describe("Web Speech kuyruğu — Aşama 2 tam metin", () => {
  it("uzun metni cümle cümle böler; Chrome 15 sn tavanının altında kalır", () => {
    const sentences = Array.from({ length: 20 }, (_, i) => `Bu ${i + 1}. cümle ofis yapay zekâ dersinin tam metnidir.`).join(" ");
    const chunks = chunkAcademyWebSpeechText(sentences);
    expect(prepareAcademyWebSpeechText("**Kalın** `kod` ### Başlık").includes("*")).toBe(false);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join(" ")).toContain("20. cümle");
    expect(chunks.every((chunk) => chunk.length <= ACADEMY_WEB_SPEECH_CHUNK_CHARS || chunk.split(" ").length === 1)).toBe(true);
  });

  it("TANIŞMA başlığını seslendirmez; Merhaba ile başlar", () => {
    const spoken = prepareAcademyWebSpeechText(
      "### 1. TANIŞMA: MERHABA, BEN GÖZDE!\n\nMerhaba! Ben Gözde. Bu eğitimde ofis işlerini hızlandıracağız.",
    );
    expect(spoken.startsWith("Merhaba! Ben Gözde.")).toBe(true);
    expect(spoken).not.toMatch(/TANIŞMA/u);
  });

  it("Web Speech yayın senkronu değildir; vatandaş oynatıcısı cue + currentTime kullanır", () => {
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    expect(player).not.toContain("chunkAcademyWebSpeechText");
    expect(player).not.toContain("CourseAudioPreview");
    expect(player).not.toContain("buildAcademyDialogueTimeline");
    expect(existsSync(join(ROOT, "lib/academy/web-speech.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "components/academy/course-audio-preview.tsx"))).toBe(false);
  });
});
