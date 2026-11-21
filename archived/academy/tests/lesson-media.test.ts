import { describe, expect, it } from "vitest";
import { composeAcademyLessonBlocks } from "@/lib/academy/lesson-media";

describe("akademi ders gövdesi blokları", () => {
  it("mikro-videoyu ilk paragrafın ardına, şemayı ikinci paragrafın ardına dizer", () => {
    const blocks = composeAcademyLessonBlocks({
      body: "Birinci cümle burada kalır.\n\nİkinci paragraf şemadan önce durur.",
      microVideos: [
        {
          afterParagraph: 0,
          title: "Akış",
          caption: "Sessiz döngü.",
          durationSec: 6,
          assetKey: "ledger-single-balance",
        },
      ],
      diagrams: [
        {
          afterParagraph: 1,
          title: "Şema",
          caption: "Tek yazıcı.",
          diagramKey: "ledger-single-balance",
        },
      ],
    });
    expect(blocks.map((block) => block.kind)).toEqual([
      "text",
      "micro-video",
      "text",
      "diagram",
    ]);
  });

  it("parametre, adım ve kod çitlerini metin arasına dizer", () => {
    const blocks = composeAcademyLessonBlocks({
      body: [
        "Giriş cümlesi durur.",
        "İkinci paragraf şemadan önce durur.",
        "```params\ntutar | kuruş\n```",
        "```adim\nSatır okunur\nTutar sabitlenir\n```",
        "```json\n{\"ok\":true}\n```",
      ].join("\n\n"),
      microVideos: [
        {
          afterParagraph: 0,
          title: "Akış",
          caption: "Sessiz döngü.",
          durationSec: 6,
          assetKey: "ledger-single-balance",
        },
      ],
      diagrams: [
        {
          afterParagraph: 1,
          title: "Şema",
          caption: "Tek yazıcı.",
          diagramKey: "ledger-single-balance",
        },
      ],
    });
    expect(blocks.map((block) => block.kind)).toEqual([
      "text",
      "micro-video",
      "text",
      "diagram",
      "params",
      "steps",
      "code",
    ]);
  });
});
