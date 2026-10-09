import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  JUNIOR_SPEECH_CHUNK_CHARS,
  JUNIOR_SPEECH_LEAVES_BGM_RUNNING,
  JUNIOR_SPEECH_USES_EXTERNAL_API,
  beginJuniorSpeech,
  chunkJuniorLocalSpeech,
  endJuniorSpeech,
  juniorCoreSpeechCacheSize,
  juniorSpeechChannel,
  juniorSpeechSessionCurrent,
  planJuniorSpeech,
  resetJuniorSpeechForTests,
} from "@/lib/junior/speech";

const CORE_TEXT =
  "Merhaba güzel arkadaşım! Bugün seninle kesri öğreneceğiz. Kesir, bütünün eşit parçasıdır. Pay üstte durur. Payda altta durur. Hadi şimdi ekrandaki çizime birlikte bakalım!";

const ELECTIVE_TEXT =
  "Merhaba güzel arkadaşım! Bugün seninle İngilizcede selamlaşmayı öğreneceğiz. Good morning sabah selamıdır. Good night vedadır. Aferin sana!";

describe("Junior kotasız ses kanalı", () => {
  beforeEach(() => {
    resetJuniorSpeechForTests();
  });

  it("standart dersi önbelleğe yazar, seçmeli dersi yerel motora yollar", () => {
    expect(JUNIOR_SPEECH_USES_EXTERNAL_API).toBe(false);
    expect(juniorSpeechChannel("jr_06_mat-1")).toBe("core-cache");
    expect(juniorSpeechChannel("jr_06_fen-2")).toBe("core-cache");
    expect(juniorSpeechChannel("jr_06_turkce-1")).toBe("core-cache");
    expect(juniorSpeechChannel("jr_06_sosyal-1")).toBe("core-cache");
    expect(juniorSpeechChannel("jr_06_ing-1")).toBe("elective-local");
    expect(juniorSpeechChannel("jr_06_alm-2")).toBe("elective-local");
    expect(juniorSpeechChannel("jr_06_fra-1")).toBe("elective-local");
    expect(juniorSpeechChannel("jr_06_siyer-1")).toBe("elective-local");
    expect(juniorSpeechChannel("jr_06_kod-2")).toBe("elective-local");
    expect(juniorSpeechChannel("jr_06_arp-1")).toBe("elective-local");

    const first = planJuniorSpeech("jr_06_mat-1", CORE_TEXT);
    const second = planJuniorSpeech("jr_06_mat-1", CORE_TEXT);
    expect(first.engine).toBe("local-cache");
    expect(first.externalApi).toBe(false);
    expect(first.fromCache).toBe(false);
    expect(second.fromCache).toBe(true);
    expect(second.chunks).toBe(first.chunks);
    expect(first.chunks.join(" ")).toContain("Kesir, bütünün eşit parçasıdır.");

    const elective = planJuniorSpeech("jr_06_ing-1", ELECTIVE_TEXT);
    expect(elective.channel).toBe("elective-local");
    expect(elective.engine).toBe("local-quota-free");
    expect(elective.externalApi).toBe(false);
    expect(elective.fromCache).toBe(false);
    expect(elective.lang).toBe("tr-TR");
    const electiveAgain = planJuniorSpeech("jr_06_ing-1", ELECTIVE_TEXT);
    expect(electiveAgain.fromCache).toBe(false);
    expect(electiveAgain.chunks).not.toBe(elective.chunks);
    expect(juniorCoreSpeechCacheSize()).toBe(1);

    const fen = planJuniorSpeech("jr_06_fen-1", "Kuvvet itme veya çekmedir. Yönü vardır.");
    expect(fen.engine).toBe("local-cache");
    expect(juniorCoreSpeechCacheSize()).toBe(2);
    expect(planJuniorSpeech("jr_06_siyer-1", ELECTIVE_TEXT).engine).toBe("local-quota-free");
    expect(juniorCoreSpeechCacheSize()).toBe(2);
  });

  it("uzun metni kesmeden böler ve yeni okuma eskisini düşürür", () => {
    const sentences = Array.from({ length: 12 }, (_, index) => `Bu ${index + 1}. cümle seçmeli dersin tam anlatımıdır.`).join(
      " ",
    );
    const chunks = chunkJuniorLocalSpeech(sentences);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join(" ")).toContain("12. cümle");
    expect(chunks.every((chunk) => chunk.length <= JUNIOR_SPEECH_CHUNK_CHARS || chunk.split(" ").length === 1)).toBe(
      true,
    );

    const core = beginJuniorSpeech("jr_06_mat-1", CORE_TEXT);
    const elective = beginJuniorSpeech("jr_06_arp-1", ELECTIVE_TEXT);
    expect(juniorSpeechSessionCurrent(core.sessionId)).toBe(false);
    expect(juniorSpeechSessionCurrent(elective.sessionId)).toBe(true);
    expect(elective.engine).toBe("local-quota-free");
    endJuniorSpeech();
    expect(juniorSpeechSessionCurrent(elective.sessionId)).toBe(false);
  });

  it("ses dosyası dış servis çağırmaz, oynatıcı bu kanalı kullanır", () => {
    const speech = readFileSync(join(process.cwd(), "lib/junior/speech.ts"), "utf8");
    const player = readFileSync(join(process.cwd(), "components/junior/player/use-junior-playback.ts"), "utf8");
    expect(JUNIOR_SPEECH_LEAVES_BGM_RUNNING).toBe(true);
    expect(speech).toContain("JUNIOR_SPEECH_LEAVES_BGM_RUNNING");
    expect(speech).toContain("endJuniorSpeech");
    expect(speech).toContain("BGM");
    expect(speech).not.toMatch(/\bfetch\s*\(/);
    expect(speech).not.toMatch(/gemini|openai|elevenlabs|text-to-speech/i);
    expect(player).toContain("beginJuniorSpeech");
    expect(player).toContain("juniorSpeechSessionCurrent");
    expect(player).toContain("juniorLessonAudioSrc");
    expect(player).toContain("juniorBgmSrc");
    expect(player).toContain("armBgm");
    expect(player).toContain("JUNIOR_BGM_SPEECH_VOLUME");
    expect(player).toContain("JUNIOR_BGM_AMBIENT_VOLUME");
    expect(player).toContain('armBgm("speech")');
    expect(player).toContain('armBgm("ambient")');
    expect(player).toContain("HTMLAudioElement");
    expect(player).toContain("playCassetteFrom");
    expect(player).toContain("playSpeechFrom");
    expect(player).toContain("function stop()");
    expect(player).toContain("audio.muted = false");
    expect(player).toContain("audio.volume = 1");
    expect(player).toContain("NotAllowedError");
    expect(player).not.toContain("new SpeechSynthesisUtterance(script)");
    expect(player).not.toMatch(/\bfetch\s*\(/);
    const listenTell = readFileSync(join(process.cwd(), "components/junior/listen-and-tell.tsx"), "utf8");
    expect(listenTell).toContain("releasePlayerAudio");
    expect(listenTell).toContain("getUserMedia");
    expect(listenTell).toContain("MediaRecorder");
    expect(listenTell).toContain('scrollIntoView({ behavior: "smooth", block: "center" })');
    expect(listenTell).toContain('id="listen-and-tell-section"');
    expect(listenTell).toContain("shouldStartImmediately");
    expect(listenTell).toContain("void startRecording()");
    expect(listenTell).toContain("data-junior-stage-full");
    expect(listenTell).toContain("data-junior-mic-record");
    expect(listenTell).not.toContain("data-junior-stage-compact");
    expect(listenTell).not.toContain("max-h-[min(28vh,240px)]");
    const vector = readFileSync(join(process.cwd(), "components/junior/vector-player.tsx"), "utf8");
    expect(vector).toContain("playback.stop()");
    expect(vector).toContain("setDecisionTaken(true)");
    expect(vector).toContain("onReadyToTell");
  });
});
