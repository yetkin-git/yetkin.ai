import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Junior sahne kapsayıcı sözleşmesi (invariant kapısı).
 *
 * Bu dosya **dizge dondurmaz**. Kaynak dosyaları tarayıp şu değişmezleri doğrular:
 *
 *   1. Sahne katmanlarında katı `min-h-[Npx]` tabanı **yoktur**. Katı taban
 *      absolute katmanı ebeveyninden büyük çizer, `overflow-hidden` sınırında
 *      sessizce kırpar ve ısınma kasetini altyazı rayının üstüne bindirir
 *      (bkz. docs/tespit_raporu_04.md §1.2, M3/M4).
 *   2. Sahne tuvali `overflow: hidden` **ve** `container-type: size` taşır.
 *      Taşma tek yerde kesilir; `cq*` birimleri viewport'a değil sahneye çözülür
 *      (§2.3, M5).
 *   3. `cqh`/`cqmin` kullanan her kapsayıcı `container-type: size` taşır;
 *      inline-size kapsayıcı blok eksenini çözemediği için `46cqh` viewport
 *      yüksekliğine düşer (§1.3d, M7).
 *   4. Oynatıcı kabuğunda mutlak `min-h-[...]` tabanı yoktur; yükseklik tek
 *      değişkene (`--player-stage-min`) bağlıdır (§1.1, M1).
 *   5. Taşan flex/grid çocukları `shrink-0` + `overflow-y-auto` alır ve metin
 *      `overflow-wrap: anywhere` ile sarar (§1.3, §2.2, M6/M9).
 *
 * Dizge dondurmak yerine değişmez doğrulandığı için sınıf adı değişse de kapı
 * yaşar; kırılma geri gelirse kapı kırmızıya döner.
 */

const root = process.cwd();

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

/** Sahne çizici dosyaları — `min-h-[300px]` taşıyan beşi. */
const STAGE_LAYER_FILES = [
  "components/junior/player/scene-ui.tsx",
  "components/junior/player/step-art.tsx",
  "components/junior/player/scene-plate.tsx",
  "components/junior/vector-player.tsx",
  "components/junior/player/warmup-cassette.tsx",
] as const;

/** Sahne bileşenleri — taşma (overlap) üreten dörtlü. */
const STAGE_COMPONENT_FILES = [
  "components/junior/pilot-player/ConceptListStage.tsx",
  "components/junior/pilot-player/SummaryPromptStage.tsx",
  "components/junior/pilot-player/GraphicOpStage.tsx",
  "components/junior/pilot-player/DetectiveBoardStage.tsx",
] as const;

/** Katı piksel tabanı: `min-h-[300px]`, `min-h-[420px]` gibi. */
const HARD_MIN_HEIGHT = /min-h-\[(\d+)px\]/gu;

describe("Junior sahne kapsayıcı sözleşmesi", () => {
  it("sahne katmanlarında katı piksel min-height tabanı kalmaz", () => {
    for (const file of STAGE_LAYER_FILES) {
      const source = read(file);
      const offenders = Array.from(source.matchAll(HARD_MIN_HEIGHT), (match) => match[0]);
      expect({ file, offenders }).toEqual({ file, offenders: [] });
    }
  });

  it("sahne olmayan min-height kullanımları bilinçli kalır (altyazı rayı, düğme)", () => {
    // Bu değerler sahne katmanı değil; krom ölçüsüdür ve esnek akışta kalır.
    const player = read("components/junior/pilot-player/JuniorPilotPlayer.tsx");
    expect(player).toContain("min-h-[2.75rem]");
    const vector = read("components/junior/vector-player.tsx");
    expect(vector).toContain("min-h-[2.25rem]");
  });

  it("sahne tuvali hem taşmayı keser hem gerçek kapsayıcıdır", () => {
    const pilot = read("components/junior/pilot-player/JuniorPilotPlayer.tsx");
    const canvasRule = pilot.slice(
      pilot.indexOf("data-junior-stage-canvas"),
      pilot.indexOf("data-junior-stage-canvas") + 400,
    );
    expect(canvasRule).toContain("data-junior-stage-canvas");
    // Sınıf tarafı: taşma kesici + boyut kapsayıcısı aynı elemanda.
    expect(pilot).toContain("overflow-hidden [container-type:size]");

    const css = read("app/globals.css");
    expect(css).toContain("[data-junior-stage-canvas]");
    expect(css).toMatch(/\[data-junior-stage-canvas\] \{[^}]*overflow:\s*hidden/s);
    expect(css).toMatch(/\[data-junior-stage-canvas\] \{[^}]*container-type:\s*size/s);
    expect(css).toMatch(/\[data-junior-stage-canvas\] \{[^}]*min-height:\s*0/s);
  });

  it("cqh/cqmin kullanan her kapsayıcı container-type: size taşır", () => {
    const pilotFiles = [
      read("components/junior/pilot-player/DetectiveBoardStage.tsx"),
      read("components/junior/pilot-player/FactorMultipleStage.tsx"),
    ];
    for (const source of pilotFiles) {
      const usesBlockAxis = /cqh|cqmin|cqmax|\d+cq\b/u.test(source);
      if (!usesBlockAxis) {
        continue;
      }
      // Blok eksenini çözen tek kapsayıcı türü `size`dır (inline-size cqh çözmez).
      expect(source).toContain("@container-size");
    }
    const detective = read("components/junior/pilot-player/DetectiveBoardStage.tsx");
    expect(detective).not.toContain("@container/tile");
    expect(detective).toContain("@container-size/tile");
    // Eski `46cqh` üst sınırı 120px'e sabitleniyordu; clamp artık karo ekseninde.
    expect(detective).not.toContain("46cqh");
  });

  it("oynatıcı kabuğu tek yükseklik değişkenine bağlıdır, mutlak taban yok", () => {
    const engine = read("components/junior/lesson-engine/JuniorLessonEngine.tsx");
    expect(engine).toContain("data-junior-player-shell");
    expect(engine).not.toContain("min-h-[28rem]");
    expect(engine).not.toContain("h-[52dvh]");
    // Sihirli krom bütçesi sınıf olarak kalmaz (yalnız yorumda anılır).
    expect(engine).not.toMatch(/className="[^"]*6\.5rem/u);

    const css = read("app/globals.css");
    expect(css).toMatch(/--player-stage-min:/);
    expect(css).toMatch(
      /\[data-junior-player-shell\] \{[^}]*min-height:\s*min\(var\(--player-shell-min\), var\(--junior-player-budget\)\)/s,
    );
    // Taban viewport bütçesini aşamaz: `min()` sarmalayıcısı 448px hatasını yapısal olarak kapatır.
    expect(css).toMatch(/--junior-player-budget:\s*calc\(\s*100dvh - var\(--junior-page-chrome-offset/s);
    // Taban artık krom + sahne toplamıdır; krom ölçülür, varsayılmaz.
    expect(css).toMatch(/--player-shell-min:\s*calc\(var\(--player-chrome-min\) \+ var\(--player-stage-min\)\)/);
    // Bütçe viewport'tan türetilir; ölçülmüş krom payı varsayılanı ezer.
    expect(css).toContain("--junior-page-chrome-offset");
  });

  it("taşan liste konteynerleri kaydırılır ve çocukları büzülmez", () => {
    const concept = read("components/junior/pilot-player/ConceptListStage.tsx");
    expect(concept).toContain("overflow-y-auto");
    expect(concept).toContain("shrink-0");

    const summary = read("components/junior/pilot-player/SummaryPromptStage.tsx");
    expect(summary).toContain("overflow-y-auto");
    expect(summary).toContain("shrink-0");
    // `auto-rows-fr` satırları eşit paylaştırıp içeriği kart dışına taşırıyordu.
    expect(summary).not.toContain("auto-rows-fr");

    const graphic = read("components/junior/pilot-player/GraphicOpStage.tsx");
    // Çember paneli: simetrik taşıyan `justify-center` yalnız kapsayıcıdan
    // küçük içerikte güvenli; bilinmeyen uzunlukta `justify-start` + kaydırma.
    const measureRailAt = graphic.indexOf('data-junior-measure-rail="');
    const measureRail = graphic.slice(
      Math.max(0, graphic.lastIndexOf("className=", measureRailAt)),
      measureRailAt + 40,
    );
    expect(measureRail).toContain("justify-start");
    expect(graphic).toContain("overflow-y-auto");
    // Sabit 148px kolon dar tuvalde metni 90px'e sıkıştırıyordu.
    expect(graphic).not.toContain("grid-cols-[148px_1fr]");
    expect(graphic).toMatch(/grid-cols-\[minmax\(6rem,34%\)_minmax\(0,1fr\)\]/u);
  });

  it("sahne metni kendi kutusunda sarar (overflow-wrap: anywhere)", () => {
    for (const file of STAGE_COMPONENT_FILES) {
      expect({ file, wraps: read(file).includes("overflow-wrap:anywhere") }).toEqual({ file, wraps: true });
    }
    const css = read("app/globals.css");
    expect(css).toMatch(
      /\[data-junior-stage-canvas\] :is\(p, span, h4, h5, h6, li, dt, dd\) \{[^}]*overflow-wrap:\s*anywhere/s,
    );
  });

  it("ısınma kaseti mutlak katmanı ebeveyne oturur ve taşmaz", () => {
    const cassette = read("components/junior/player/warmup-cassette.tsx");
    expect(cassette).toContain("absolute inset-0");
    expect(cassette).toContain("overflow-hidden");
    expect(cassette).not.toContain("min-h-[300px]");
  });

  it("sahne katmanları inset-0 + h-full ile ebeveyne oturur", () => {
    const sceneUi = read("components/junior/player/scene-ui.tsx");
    expect(sceneUi).toContain("absolute inset-0 block h-full w-full");
    const art = read("components/junior/player/step-art.tsx");
    expect(art).toContain("absolute inset-0 block h-full w-full");
    const plate = read("components/junior/player/scene-plate.tsx");
    expect(plate).toContain("absolute inset-0 h-full w-full");
    expect(plate).toContain("absolute inset-0 z-[1] h-full w-full");
    const vector = read("components/junior/vector-player.tsx");
    expect(vector).toContain("absolute inset-0 h-full w-full");
  });
});
