import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import {
  academyActivePunchcard,
  loadAcademyLessonCues,
} from "@/lib/academy/lesson-cues";
import {
  academyKaraokeNormalizeLine,
  academyKaraokeReconstructLine,
  academyKaraokeShouldGlueToPrevious,
  academyKaraokeStripLines,
  academyKaraokeTokenize,
  academyKaraokeWords,
  academyKaraokeWordState,
  academyTeleprompterActiveLineIndex,
  loadAcademyKaraokeStrip,
  loadAcademyTeleprompterFlow,
} from "@/lib/academy/lesson-teleprompter-flow";

const ROOT = process.cwd();
const KEY = "01_office_ai-1";

describe("mühürlü karaoke şeridi — cue senkronu", () => {
  it("01_office_ai-1 cue parçalarını cümle şeridine böler; ilk kelime vurgulanır", () => {
    const layer = academyCitizenPlayerLayer("01_office_ai", KEY);
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    const flow = loadAcademyTeleprompterFlow(KEY);
    expect(flow.length).toBe(15);
    const strip = loadAcademyKaraokeStrip(KEY);
    expect(strip.length).toBeGreaterThan(flow.length);
    expect(strip[0]?.text).toMatch(/masanın üstünde|yapay zekâ|dosyalar/iu);
    expect(academyKaraokeStripLines(layer.cues)[0]?.cueId).toBe("cue-01");
    const welcome = strip.find((line) => line.cueId === "cue-02");
    expect(welcome?.text).toMatch(/^Selamlar, ben Gözde/u);
    const first = welcome ?? strip[0]!;
    const words = academyKaraokeWords(first);
    expect(words[0]?.text).toMatch(/^Selamlar/u);
    expect(academyKaraokeWordState(words[0]!, first.start)).toBe("active");
    expect(academyKaraokeWordState(words[words.length - 1]!, first.start)).toBe("future");
    expect(academyTeleprompterActiveLineIndex(strip, first.start + 0.05)).toBeGreaterThanOrEqual(0);
    const later = strip.find((line) => line.cueId === "cue-03");
    expect(later).toBeTruthy();
    expect(strip.some((line) => line.cueId === "cue-03" && /ham veri|dağınık|düzensiz/iu.test(line.text))).toBe(true);

    const punchcards = loadAcademyLessonCues(KEY);
    expect(academyActivePunchcard(punchcards, 0)).toBeNull();
    expect(academyActivePunchcard(punchcards, 2.1)?.label).toBe("GİRİŞ KÖPRÜSÜ");
    expect(strip[academyTeleprompterActiveLineIndex(strip, 2.1)!]?.cueId).toBe("cue-01");
    const midCue3 = later!.start + 0.2;
    expect(academyActivePunchcard(punchcards, midCue3)?.label).toBe("DÜZENSİZ TABLO");
    expect(strip[academyTeleprompterActiveLineIndex(strip, midCue3)!]?.cueId).toBe("cue-03");
    const closing = strip.find((line) => /Hazırsan 2\. derste buluşalım/u.test(line.text));
    expect(closing?.cueId).toBe("cue-08");
    expect(strip.some((line) => line.cueId === "cue-08" && /tabloyu temizleme refleksi artık cebinde/u.test(line.text))).toBe(
      true,
    );
    expect(strip.some((line) => line.cueId === "cue-08" && /KVKK/u.test(line.text) && /maskeleme/u.test(line.text))).toBe(
      true,
    );
    expect(strip.every((line) => !/üç maddelik yönetim özetine/u.test(line.text))).toBe(true);
    expect(strip.every((line) => !/grafik raporuna/u.test(line.text))).toBe(true);
    expect(strip.every((line) => !/görüşmek üzere/iu.test(line.text))).toBe(true);
    const bridgeLines = strip.filter((line) =>
      /tabloyu temizleme refleksi|KVKK|Hazırsan 2\. derste buluşalım/u.test(line.text),
    );
    expect(bridgeLines).toHaveLength(3);
    expect(bridgeLines.every((line) => line.cueId === "cue-08")).toBe(true);
    expect(bridgeLines[0]?.start).toBeGreaterThan(450);
    expect(bridgeLines.at(-1)?.end).toBe(529.404);
    for (const line of bridgeLines) {
      const words = academyKaraokeWords(line);
      expect(academyKaraokeWordState(words[0]!, line.start)).toBe("active");
      expect(academyKaraokeWordState(words[words.length - 1]!, line.start)).toBe("future");
    }
    const lastWords = academyKaraokeWords(bridgeLines.at(-1)!);
    expect(lastWords[0]?.text).toMatch(/^Hazırsan/u);
  });

  it("oynatıcı görselin altına cue şeridini basar; LessonTeleprompter kullanılmaz", () => {
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    const strip = readFileSync(join(ROOT, "components/academy/lesson-karaoke-strip.tsx"), "utf8");
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(player).toContain("<LessonKaraokeStrip");
    expect(player).toContain("karaoke.cues");
    expect(player).not.toContain("<LessonTeleprompter");
    expect(player).toContain("captions={false}");
    expect(strip).toContain("data-academy-karaoke-strip");
    expect(strip).toContain("data-academy-karaoke-word");
    expect(strip).not.toContain("loadAcademyTeleprompterFlow");
    expect(strip).toContain("academyKaraokeStripLines");
    expect(strip).toContain("text-center");
    expect(strip).toContain("justify-center");
    expect(css).toContain("academy-player-karaoke-strip");
    expect(css).toMatch(/\.academy-player-karaoke-word\[data-state="active"\]/s);
    expect(player).toContain('data-academy-player-stack="visual-karaoke-transport"');
    expect(css).toMatch(
      /\.academy-player-karaoke\.academy-cinema-stage\s*\{[^}]*aspect-ratio:\s*auto/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke \.academy-player-audio-bar\s*\{[^}]*position:\s*sticky/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke \.academy-player-audio-bar\s*\{[^}]*bottom:\s*0/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-strip\s*\{[^}]*flex-shrink:\s*0/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-strip\s*\{[^}]*justify-content:\s*center/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-strip\s*\{[^}]*text-align:\s*center/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-line\s*\{[^}]*justify-content:\s*center/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-line\s*\{[^}]*text-align:\s*center/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-line\s*\{[^}]*white-space:\s*normal/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-line\s*\{[^}]*column-gap:\s*var\(--academy-karaoke-word-gap\)/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-word\s*\{[^}]*white-space:\s*nowrap/s,
    );
    expect(css).toContain('[data-glue="true"]');
    expect(strip).toContain("gap-x-[0.32em]");
    expect(strip).toContain("data-glue={word.glue");
    expect(strip).not.toMatch(/\{word\.text\}\s*\{\s*" "\s*\}/u);
  });
});

describe("karaoke kelime boşluğu ve noktalama yapışması", () => {
  it("join('') üretmez; Geçtiğimiz derste kurduğumuz boşluklarını korur", () => {
    const text =
      "Geçtiğimiz derste kurduğumuz Sunum Fabrikası ile slayt hazırlama alışkanlıklarını baştan aşağı değiştirdik.";
    const words = academyKaraokeWords({ id: "cue-01:0", text, start: 0, end: 8 });
    expect(words.slice(0, 3).map((word) => word.text)).toEqual(["Geçtiğimiz", "derste", "kurduğumuz"]);
    expect(words.map((word) => word.text).join("")).toBe(
      "GeçtiğimizderstekurduğumuzSunumFabrikasıileslaythazırlamaalışkanlıklarınıbaştanaşağıdeğiştirdik.",
    );
    expect(academyKaraokeReconstructLine(words)).toBe(text);
    expect(words.some((word) => word.glue)).toBe(false);
    expect(words.at(-1)?.text).toBe("değiştirdik.");

    const opening = loadAcademyKaraokeStrip("01_office_ai-3").find((line) =>
      /Geçtiğimiz derste/u.test(line.text),
    );
    expect(opening).toBeTruthy();
    for (const key of ["01_office_ai-3", "01_office_ai-4"] as const) {
      for (const line of loadAcademyKaraokeStrip(key)) {
        expect(academyKaraokeReconstructLine(academyKaraokeWords(line))).toBe(academyKaraokeNormalizeLine(line.text));
      }
    }
  });

  it("kapanış noktalaması önceki kelimeye yapışır; açılış tırnak boşluklu kalır", () => {
    expect(academyKaraokeShouldGlueToPrevious(".")).toBe(true);
    expect(academyKaraokeShouldGlueToPrevious("»")).toBe(true);
    expect(academyKaraokeShouldGlueToPrevious("Gözde")).toBe(false);
    const words = academyKaraokeTokenize("Hazırsan 2. bölümde buluşalım .");
    expect(academyKaraokeReconstructLine(words)).toBe("Hazırsan 2. bölümde buluşalım.");
    expect(words.at(-1)).toEqual({ text: ".", glue: true });
    const quoted = academyKaraokeTokenize("«sıfır kodlama» ilkesi");
    expect(academyKaraokeReconstructLine(quoted)).toBe("«sıfır kodlama» ilkesi");
  });
});
