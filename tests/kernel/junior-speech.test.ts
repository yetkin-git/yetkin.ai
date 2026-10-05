import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  JUNIOR_SPEECH_CHUNK_CHARS,
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
  "Sevgili çocuklar merhaba! Bugünkü dersimizde kesri öğreneceğiz. Kesir, bütünün eşit parçasıdır. Pay üstte durur. Payda altta durur. Hadi şimdi ekrandaki çizime birlikte bakalım!";

const ELECTIVE_TEXT =
  "Sevgili çocuklar merhaba! Bugünkü dersimizde İngilizcede selamlaşmayı öğreneceğiz. Good morning sabah selamıdır. Good night vedadır. Aferin size!";

describe("Junior kotasız ses kanalı", () => {
  beforeEach(() => {
    resetJuniorSpeechForTests();
  });

  it("standart dersi önbelleğe yazar, seçmeli dersi yerel motora yollar", () => {
    expect(JUNIOR_SPEECH_USES_EXTERNAL_API).toBe(false);
    expect(juniorSpeechChannel("jr_06_mat-1")).toBe("core-cache");
    expect(juniorSpeechChannel("jr_06_fen-2")).toBe("core-cache");
    expect(juniorSpeechChannel("jr_06_turkce-1")).toBe("core-cache");
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

  it("ses dosyası dış servis çağırmaz, dinle düğmesi bu kanalı kullanır", () => {
    const speech = readFileSync(join(process.cwd(), "lib/junior/speech.ts"), "utf8");
    const player = readFileSync(join(process.cwd(), "components/junior/listen-and-tell.tsx"), "utf8");
    expect(speech).not.toMatch(/\bfetch\s*\(/);
    expect(speech).not.toMatch(/gemini|openai|elevenlabs|text-to-speech/i);
    expect(player).toContain("beginJuniorSpeech");
    expect(player).toContain("juniorSpeechSessionCurrent");
    expect(player).not.toContain("new SpeechSynthesisUtterance(script)");
  });
});
