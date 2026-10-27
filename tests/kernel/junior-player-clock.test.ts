import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { juniorLessonByKey } from "@/lib/junior/catalog";
import { juniorLessonNote } from "@/lib/junior/lesson-note";
import { assertJuniorConcreteVariety, assertJuniorImperativeVariety } from "@/lib/junior/content-rules";
import {
  JUNIOR_NARRATION_AIM_MS,
  JUNIOR_NARRATION_MAX_MS,
  JUNIOR_NARRATION_MIN_MS,
  JUNIOR_PLAYER_BEAT_MS,
  JUNIOR_PLAYER_MIN_WINDOW_MS,
  juniorPlayerActivePieceIndex,
  juniorPlayerBeatFromAnchors,
  juniorPlayerBeatIndex,
  juniorPlayerClampMs,
  juniorPlayerClockLabel,
  juniorPlayerCueAt,
  juniorPlayerHasReachedEnd,
  juniorPlayerLiveCaption,
  juniorPlayerNeighborStepMs,
  juniorPlayerRangeLabel,
  juniorPlayerStepAnchors,
  juniorPlayerStepLabel,
  juniorPlayerTimeline,
  juniorPlayerWindowIndex,
  juniorThinkHoldEndMs,
  scaleJuniorPlayerTimeline,
} from "@/lib/junior/player-clock";
import { chunkJuniorLocalSpeech } from "@/lib/junior/speech";
import { juniorTeacherSelfIntro } from "@/lib/junior/voice";
import {
  DEFAULT_EXPONENT_PARAMS,
  DEFAULT_MEANING_EXAMPLE,
  parseExponentParams,
  parseMeaningExample,
  stickyMeaningExample,
  stickyWordTreeExample,
  tryParseExponentParams,
  tryParseMeaningExample,
  tryParseWordTreeExample,
} from "@/components/junior/player/scene-ui";
import { cleanRecapLine, recapLineForActive } from "@/components/junior/player/step-art";

const root = process.cwd();

describe("Junior oynatıcı saati", () => {
  it("boş anlatımda adım yedek süresine düşer", () => {
    const timeline = juniorPlayerTimeline("", [], 9);
    expect(timeline.pieces).toEqual([]);
    expect(timeline.windows).toEqual([]);
    expect(timeline.durationMs).toBe(9 * JUNIOR_PLAYER_BEAT_MS);
    expect(juniorPlayerBeatIndex(0, timeline.durationMs, 9)).toBe(0);
    expect(juniorPlayerBeatIndex(timeline.durationMs, timeline.durationMs, 9)).toBe(8);
    expect(juniorPlayerActivePieceIndex(0, timeline)).toBe(-1);
  });

  it("süre etiketini, adımı ve sürükleme sınırını yazar", () => {
    expect(juniorPlayerClockLabel(0)).toBe("0:00");
    expect(juniorPlayerClockLabel(12_500)).toBe("0:13");
    expect(juniorPlayerClockLabel(60_000)).toBe("1:00");
    expect(juniorPlayerRangeLabel(4_000, 65_000)).toBe("0:04 / 1:05");
    expect(juniorPlayerStepLabel(0, 9)).toBe("Adım 1 / 9");
    expect(juniorPlayerStepLabel(8, 9)).toBe("Adım 9 / 9");
    expect(
      juniorPlayerNeighborStepMs({ beat: 0, beatCount: 12, delta: -1, anchors: [] }),
    ).toBeNull();
    expect(
      juniorPlayerNeighborStepMs({
        beat: 0,
        beatCount: 12,
        delta: 1,
        anchors: [{ beat: 1, startMs: 4_000, text: "sonraki" }],
      }),
    ).toBe(4_000);
    expect(
      juniorPlayerNeighborStepMs({
        beat: 11,
        beatCount: 12,
        delta: 1,
        anchors: [{ beat: 11, startMs: 90_000, text: "son" }],
      }),
    ).toBeNull();
    expect(juniorPlayerClampMs(-20, 10_000)).toBe(0);
    expect(juniorPlayerClampMs(10_500, 10_000)).toBe(10_000);
    expect(juniorPlayerClampMs(Number.NaN, 10_000)).toBe(0);
  });

  it("karar butonu kilidi son adıma değil kaset bitişine bağlıdır", () => {
    // 7:06 / 7:25 — Adım 12/12 olsa bile erken overlay yok.
    expect(
      juniorPlayerHasReachedEnd({ currentTimeSec: 7 * 60 + 6, durationSec: 7 * 60 + 25 }),
    ).toBe(false);
    expect(
      juniorPlayerHasReachedEnd({ currentTimeSec: 7 * 60 + 24, durationSec: 7 * 60 + 25 }),
    ).toBe(true);
    expect(
      juniorPlayerHasReachedEnd({ currentTimeSec: 7 * 60 + 25, durationSec: 7 * 60 + 25 }),
    ).toBe(true);
    expect(
      juniorPlayerHasReachedEnd({ ended: true, currentTimeSec: 0, durationSec: 445 }),
    ).toBe(true);
    expect(juniorPlayerHasReachedEnd({ currentTimeSec: 0, durationSec: 0 })).toBe(false);
  });

  it("cümle vurgusu ve adım aynı saatte ilerler", () => {
    const note = "Kesir, bütünün eşit parçasıdır. Pay üstte durur.\n\nMutfakta da kullanılır.";
    const chunks = ["Kesir, bütünün eşit parçasıdır.", "Pay üstte durur. Mutfakta da kullanılır."];
    const timeline = juniorPlayerTimeline(note, chunks, 9);
    expect(timeline.pieces.map((piece) => piece.text)).toEqual([
      "Kesir, bütünün eşit parçasıdır.",
      "Pay üstte durur.",
      "Mutfakta da kullanılır.",
    ]);
    const collapsed = note.replace(/\s+/g, " ").trim();
    expect(chunks.join(" ")).toBe(collapsed);
    expect(timeline.windows[timeline.windows.length - 1]?.noteEnd).toBe(collapsed.length);
    expect(juniorPlayerWindowIndex(0, timeline.windows)).toBe(0);
    expect(juniorPlayerActivePieceIndex(0, timeline)).toBe(0);
    const second = timeline.windows[1];
    expect(second).toBeDefined();
    if (!second) {
      return;
    }
    expect(juniorPlayerActivePieceIndex(second.startMs, timeline)).toBe(1);
    const nearEnd = second.endMs - 1;
    expect(juniorPlayerActivePieceIndex(nearEnd, timeline)).toBe(2);
    expect(juniorPlayerBeatIndex(0, timeline.durationMs, 9, timeline.windows)).toBe(0);
    expect(juniorPlayerBeatIndex(timeline.durationMs, timeline.durationMs, 9, timeline.windows)).toBe(8);
    expect(juniorPlayerLiveCaption(0, timeline)).toContain("Kesir");
    expect(juniorPlayerLiveCaption(second.startMs, timeline)).toMatch(/Pay|Mutfakta/);
    // Cue SSOT: her elapsedMs için highlight indeksi = liveCaption cümlesi.
    for (let ms = 0; ms <= timeline.durationMs; ms += 250) {
      const cue = juniorPlayerCueAt(ms, timeline);
      expect(cue).not.toBeNull();
      if (!cue) {
        continue;
      }
      expect(cue.pieceIndex).toBe(juniorPlayerActivePieceIndex(ms, timeline));
      expect(cue.text).toBe(juniorPlayerLiveCaption(ms, timeline));
      expect(timeline.pieces[cue.pieceIndex]?.text.replace(/\s+/g, " ").trim()).toBe(cue.text);
    }
    let previous = 0;
    for (let ms = 0; ms <= timeline.durationMs; ms += 400) {
      const beat = juniorPlayerBeatIndex(ms, timeline.durationMs, 9, timeline.windows);
      expect(beat).toBeGreaterThanOrEqual(previous);
      expect(beat).toBeLessThan(9);
      previous = beat;
    }
    expect(timeline.windows.every((window) => window.endMs - window.startMs >= JUNIOR_PLAYER_MIN_WINDOW_MS)).toBe(
      true,
    );
  });

  it("matematik ders notunu konuşma parçalarına yayar", () => {
    const lesson = juniorLessonByKey("jr_06_mat-1");
    expect(lesson).not.toBeNull();
    if (!lesson) {
      return;
    }
    const note = juniorLessonNote(lesson.mebNote, lesson.lifeUse);
    const chunks = chunkJuniorLocalSpeech(note);
    const timeline = juniorPlayerTimeline(note, chunks, 12);
    const collapsed = note.replace(/\s+/g, " ").trim();
    expect(chunks.join(" ")).toBe(collapsed);
    expect(timeline.pieces.length).toBeGreaterThan(4);
    expect(timeline.pieces[0]?.text).toBe("Merhaba sevgili çocuklar!");
    expect(timeline.pieces.some((piece) => piece.text.includes(juniorTeacherSelfIntro("jr_06_mat-1")))).toBe(
      true,
    );
    expect(timeline.pieces.some((piece) => piece.text.includes("kalansız"))).toBe(true);
    for (let ms = 0; ms <= timeline.durationMs; ms += 500) {
      const cue = juniorPlayerCueAt(ms, timeline);
      expect(cue?.text).toBe(juniorPlayerLiveCaption(ms, timeline));
      expect(cue?.pieceIndex).toBe(juniorPlayerActivePieceIndex(ms, timeline));
    }
    expect(timeline.pieces.some((piece) => piece.text.includes("bölün"))).toBe(true);
    expect(timeline.pieces.some((piece) => piece.text.includes("mutfakta"))).toBe(false);
    expect(timeline.windows[timeline.windows.length - 1]?.noteEnd).toBe(collapsed.length);
    expect(timeline.durationMs).toBeGreaterThan(9 * JUNIOR_PLAYER_MIN_WINDOW_MS);
    expect(juniorPlayerActivePieceIndex(0, timeline)).toBe(0);
    expect(juniorPlayerActivePieceIndex(timeline.durationMs, timeline)).toBe(timeline.pieces.length - 1);
    const midMs = timeline.durationMs / 2;
    const midWindow = juniorPlayerWindowIndex(midMs, timeline.windows);
    const midBeat = juniorPlayerBeatIndex(midMs, timeline.durationMs, 12, timeline.windows);
    expect(midBeat).toBe(Math.min(11, Math.floor((midWindow * 12) / timeline.windows.length)));
    // Zero-delay cue sync: piece indeksi verilince beat altyazı ile aynı ms'te kayar.
    const midPiece = juniorPlayerActivePieceIndex(midMs, timeline);
    const cueBeat = juniorPlayerBeatIndex(
      midMs,
      timeline.durationMs,
      12,
      timeline.windows,
      midPiece,
      timeline.pieces.length,
    );
    expect(cueBeat).toBe(Math.min(11, Math.floor((midPiece * 12) / timeline.pieces.length)));
    expect(juniorPlayerCueAt(midMs, timeline)?.pieceIndex).toBe(midPiece);
    const factorPiece = timeline.pieces.find((piece) => piece.text.includes("kalansız"));
    expect(factorPiece).toBeDefined();
    if (factorPiece) {
      const at = factorPiece.collapsedStart + 1;
      const windows = timeline.windows;
      const window = windows.find((w) => at >= w.noteStart && at < w.noteEnd) ?? windows[0];
      expect(window).toBeDefined();
      if (window) {
        const span = window.endMs - window.startMs;
        const ratio = (at - window.noteStart) / Math.max(1, window.noteEnd - window.noteStart);
        const ms = window.startMs + ratio * span;
        expect(juniorPlayerLiveCaption(ms, timeline)).toContain("kalansız");
      }
    }
    expect(JUNIOR_NARRATION_MIN_MS).toBe(180_000);
    expect(JUNIOR_NARRATION_AIM_MS).toBe(450_000);
    expect(JUNIOR_NARRATION_MAX_MS).toBe(720_000);
    expect(timeline.durationMs).toBeGreaterThanOrEqual(JUNIOR_NARRATION_MIN_MS);
    expect(timeline.durationMs).toBeLessThanOrEqual(JUNIOR_NARRATION_MAX_MS);
  });

  it("kaset süresi değişince jr_06_mat-1 kâğıt katlama cümlesi ve adım sırası durur", () => {
    const lesson = juniorLessonByKey("jr_06_mat-1");
    expect(lesson?.steps).toBeDefined();
    if (!lesson?.steps) {
      return;
    }
    const note = juniorLessonNote(lesson.mebNote, lesson.lifeUse);
    const base = juniorPlayerTimeline(note, chunkJuniorLocalSpeech(note), lesson.steps.length);
    const scaled = scaleJuniorPlayerTimeline(base, 510_000);
    expect(scaled.durationMs).toBe(510_000);
    expect(scaled.pieces).toBe(base.pieces);
    expect(scaled.durationMs).toBeGreaterThanOrEqual(JUNIOR_NARRATION_MIN_MS);
    expect(scaled.durationMs).toBeLessThanOrEqual(JUNIOR_NARRATION_MAX_MS);
    const baseAnchors = juniorPlayerStepAnchors(lesson.steps, base);
    const scaledAnchors = juniorPlayerStepAnchors(lesson.steps, scaled);
    expect(scaledAnchors.map((anchor) => anchor.beat)).toEqual(baseAnchors.map((anchor) => anchor.beat));
    const factor = scaled.durationMs / base.durationMs;
    for (let index = 0; index < scaledAnchors.length; index += 1) {
      const expected = Math.round((baseAnchors[index]?.startMs ?? 0) * factor);
      expect(Math.abs((scaledAnchors[index]?.startMs ?? 0) - expected)).toBeLessThanOrEqual(8);
    }
    const fold = scaled.pieces.find((piece) => piece.text.includes("kalansız"));
    expect(fold).toBeDefined();
    if (!fold) {
      return;
    }
    const at = fold.collapsedStart + 1;
    const window = scaled.windows.find((row) => at >= row.noteStart && at < row.noteEnd) ?? scaled.windows[0];
    expect(window).toBeDefined();
    if (!window) {
      return;
    }
    const span = window.endMs - window.startMs;
    const ratio = (at - window.noteStart) / Math.max(1, window.noteEnd - window.noteStart);
    const ms = window.startMs + ratio * span;
    expect(juniorPlayerLiveCaption(ms, scaled)).toContain("kalansız");
    expect(juniorPlayerCueAt(ms, scaled)?.text).toContain("kalansız");
    const pieceIndex = juniorPlayerActivePieceIndex(ms, scaled);
    const beat = juniorPlayerBeatIndex(
      ms,
      scaled.durationMs,
      lesson.steps.length,
      scaled.windows,
      pieceIndex,
      scaled.pieces.length,
      scaledAnchors,
    );
    expect(beat).toBeGreaterThanOrEqual(0);
    expect(beat).toBeLessThan(lesson.steps.length);
    const baseWindow = base.windows.find((row) => at >= row.noteStart && at < row.noteEnd) ?? base.windows[0];
    expect(baseWindow).toBeDefined();
    if (baseWindow) {
      expect(window.startMs).toBe(Math.round(baseWindow.startMs * factor));
    }
  });

  it("çizime bak cümlesinin startMs anında adım o cümleye kilitlenir", () => {
    const lesson = juniorLessonByKey("jr_06_mat-1");
    expect(lesson?.steps).toBeDefined();
    if (!lesson?.steps) {
      return;
    }
    const note = juniorLessonNote(lesson.mebNote, lesson.lifeUse);
    const timeline = juniorPlayerTimeline(note, chunkJuniorLocalSpeech(note), 12);
    const anchors = juniorPlayerStepAnchors(lesson.steps, timeline);
    const draw = anchors.find((anchor) => anchor.text.toLocaleLowerCase("tr-TR").includes("çizime"));
    expect(draw).toBeDefined();
    if (!draw) {
      return;
    }
    expect(lesson.steps[draw.beat]).toContain("çizime");
    expect(
      juniorPlayerBeatIndex(
        draw.startMs,
        timeline.durationMs,
        12,
        timeline.windows,
        0,
        timeline.pieces.length,
        anchors,
      ),
    ).toBe(draw.beat);
    expect(juniorPlayerBeatFromAnchors(draw.startMs, 12, anchors)).toBe(draw.beat);
    const forwardMs = juniorPlayerNeighborStepMs({
      beat: 0,
      beatCount: 12,
      delta: 1,
      anchors,
    });
    expect(forwardMs).not.toBeNull();
    if (forwardMs != null) {
      const nextBeat = juniorPlayerBeatIndex(
        forwardMs,
        timeline.durationMs,
        12,
        timeline.windows,
        0,
        timeline.pieces.length,
        anchors,
      );
      expect(nextBeat).toBeGreaterThan(0);
      expect(juniorPlayerStepLabel(nextBeat, 12)).not.toBe("Adım 1 / 12");
    }
    expect(
      juniorPlayerNeighborStepMs({ beat: 0, beatCount: 12, delta: -1, anchors }),
    ).toBeNull();
    // Örnek bloğunun açılış cümlesi filmdeki «24 sayısına bakalım» ile aynıdır.
    const example = timeline.pieces.find((piece) => /24 sayısına/u.test(piece.text));
    expect(example).toBeDefined();
    const exampleAnchor = anchors.find((anchor) => /24 sayısına/u.test(anchor.text));
    if (example && exampleAnchor) {
      expect(exampleAnchor.beat).toBeGreaterThanOrEqual(draw.beat);
      expect(exampleAnchor.startMs).toBeGreaterThanOrEqual(draw.startMs);
    }
    expect(
      juniorPlayerBeatIndex(
        timeline.durationMs - 1500,
        timeline.durationMs,
        12,
        timeline.windows,
        timeline.pieces.length - 1,
        timeline.pieces.length,
        anchors,
      ),
    ).toBeGreaterThanOrEqual(draw.beat);
    expect(juniorThinkHoldEndMs(timeline)).not.toBeNull();
  });

  it("ardışık aynı emir kökünü ve yalın dolguyu reddeder", () => {
    expect(() => assertJuniorImperativeVariety(["Bunu söyle.", "Yeniden söyle."])).toThrow(/emir kökü/);
    expect(() => assertJuniorImperativeVariety(["Bunu söyle.", "Sonra bir kalem seç."])).not.toThrow();
    expect(() => assertJuniorConcreteVariety("2 kalem. 3 bardak. 4 defter.")).not.toThrow();
    expect(() => assertJuniorConcreteVariety("yine söyle")).toThrow(/çeşitliliği/);
  });
});

describe("Junior özet sahne temizliği (Recap Cleanup)", () => {
  it("kaset öneklerini ve başlığı temizler; 2 4. çift indeksi üretmez", () => {
    expect(cleanRecapLine("4. Bugün Neler Öğrendik? Taban alttadır.")).toBe("Taban alttadır.");
    expect(cleanRecapLine("Bugün Neler Öğrendik? Üslü ifade, tekrarlı çarpmadır.")).toBe(
      "Üslü ifade, tekrarlı çarpmadır.",
    );
    expect(cleanRecapLine("10. Bugün Neler Öğrendik? İlk özet.")).toBe("İlk özet.");
    const body = recapLineForActive(
      "Bugün Neler Öğrendik? 1. Birinci madde. 2. İkinci madde. 3. Üçüncü madde.",
      1,
    );
    expect(body).toBe("İkinci madde.");
    expect(body).not.toMatch(/^\d+\./u);
    expect(`2 ${body}`).not.toMatch(/2\s+4\./u);
  });

  it("tek adımlı steps metninde tüm gövdeyi korur", () => {
    const step = "Bugün Neler Öğrendik? Taban alttadır. Üs, çarpım sayısını söyler.";
    expect(recapLineForActive(step, 1)).toBe("Taban alttadır. Üs, çarpım sayısını söyler.");
  });
});

describe("Junior yapışkan sahne (Sticky Scene)", () => {
  it("eşleşme yokken varsayılan 2³ şablonuna geri sıçramaz", () => {
    expect(tryParseExponentParams("Üs, tabanı kaç kez çarpacağını söyler.")).toBeNull();
    expect(parseExponentParams("genel konuşma", { base: 10, exp: 2, product: 100 })).toEqual({
      base: 10,
      exp: 2,
      product: 100,
    });
    expect(parseExponentParams("")).toEqual(DEFAULT_EXPONENT_PARAMS);
  });

  it("1. ünite açılışı çarpan dersidir; üslü taslak bu anahtarda durmaz", () => {
    const lesson = juniorLessonByKey("jr_06_mat-1");
    expect(lesson?.title).toContain("Çarpan");
    expect(lesson?.listenText ?? "").not.toContain("2 üssü 3");
  });
});

describe("Junior Türkçe örnek-sahne senkronu", () => {
  it("konuşulan örnek öbeği Gerçek / Mecaz / Terim kefesine bağlar", () => {
    expect(tryParseMeaningExample("Ağacın kökü gerçek anlamdır.")).toEqual({
      phrase: "Ağacın kökü",
      pan: "gercek",
    });
    expect(tryParseMeaningExample("Sorunun kökü mecaz anlamdır.")).toEqual({
      phrase: "Sorunun kökü",
      pan: "mecaz",
    });
    expect(tryParseMeaningExample("Arkadaşın kulağı deliktir dendiğinde haberleri takip eder.")).toEqual({
      phrase: "kulağı deliktir",
      pan: "mecaz",
    });
    expect(tryParseMeaningExample("Dokuzun karekökü üçtür; bu bir terimdir.")).toEqual({
      phrase: "karekök",
      pan: "terim",
    });
    expect(tryParseMeaningExample("Cümleyi dikkatle oku.")).toBeNull();
    expect(parseMeaningExample("genel konuşma", { phrase: "Ağacın kökü", pan: "gercek" })).toEqual({
      phrase: "Ağacın kökü",
      pan: "gercek",
    });
    expect(parseMeaningExample("")).toEqual(DEFAULT_MEANING_EXAMPLE);
  });

  it("jr_06_turkce-1 örnekleri yapışkan izde doğrusal akar; arada seed bounce yok", () => {
    const trail = [
      "Merhaba güzel arkadaşım! Bugün sözcüğün üç anlamını ayıracağız.",
      "Bunu yüzü düştü cümlesindeki mecaz anlamla açalım.",
      "Ağacın kökü gerçek anlamdır.",
      "Cümle hangi kefeyi seçer?",
      "Sorunun kökü mecaz anlamdır.",
      "Dokuzun karekökü üçtür cümlesinde kök, matematiksel bir terimdir.",
      "Arkadaşın kulağı delik dendiğinde haberleri iyi dinlediğini fark edersin.",
    ];
    const sticky = stickyMeaningExample(trail);
    expect(sticky).toEqual({ phrase: "kulağı deliktir", pan: "mecaz" });
    expect(stickyMeaningExample(trail.slice(0, 3))).toEqual({ phrase: "Ağacın kökü", pan: "gercek" });
    expect(stickyMeaningExample(trail.slice(0, 4))).toEqual({ phrase: "Ağacın kökü", pan: "gercek" });
    expect(stickyMeaningExample(trail.slice(0, 5))).toEqual({ phrase: "Sorunun kökü", pan: "mecaz" });
  });

  it("deyim ve eş anlam örneklerini sözcük ağacına bağlar", () => {
    expect(tryParseWordTreeExample("Kulak kesilmek dikkatle dinlemektir ve bir deyimdir.")).toEqual({
      phrase: "kulak kesilmek",
      branch: "deyim",
    });
    expect(tryParseWordTreeExample("Ayağını yorganına göre uzat tutumlu olmayı öğütleyen bir atasözüdür.")).toEqual({
      phrase: "Ayağını yorganına göre uzat",
      branch: "atasozu",
    });
    expect(tryParseWordTreeExample("Kara ve siyah eştir.")).toEqual({
      phrase: "kara ↔ siyah",
      branch: "es",
    });
    expect(stickyWordTreeExample(["Genel konuşma.", "Kara ve siyah eştir.", "Devam edelim."])).toEqual({
      phrase: "kara ↔ siyah",
      branch: "es",
    });
  });
});

describe("Junior oynatıcı yüzü", () => {
  it("kontrol çubuğu, vurgu ve yinelenen uyarı aynı sözleşmede durur", () => {
    const controls = readFileSync(join(root, "components/junior/player/controls.tsx"), "utf8");
    const progress = readFileSync(join(root, "components/junior/player/progress-bar.tsx"), "utf8");
    const player = readFileSync(join(root, "components/junior/vector-player.tsx"), "utf8");
    const page = readFileSync(join(root, "app/junior/ders/[lessonKey]/page.tsx"), "utf8");
    expect(controls).toContain("Oynat");
    expect(controls).toContain("Durdur");
    expect(controls).toContain("Baştan Dinle");
    expect(controls).toContain("Önceki adım");
    expect(controls).toContain("Sonraki adım");
    expect(controls).toContain("data-junior-step-prev");
    expect(controls).toContain("data-junior-step-next");
    expect(controls).toContain("CC");
    expect(controls).toContain("data-junior-captions-toggle");
    expect(controls).toContain("captionsVisible");
    expect(controls).toContain("onToggleCaptions");
    expect(progress).toContain('aria-label="Anlatım ilerlemesi"');
    expect(progress).toContain("data-junior-player-progress");
    expect(controls).toContain("JuniorProgressBar");
    expect(player).toContain("Video / Görsel Oynatıcı");
    expect(player).not.toContain("Ders Notu ve Özet");
    expect(player).not.toContain("JuniorNotePanel");
    expect(player).toContain("data-junior-focus-player");
    expect(player).toContain("data-junior-cinema-stage");
    expect(player).toContain("min-h-0 w-full flex-1 overflow-hidden");
    expect(player).not.toContain("aspect-video w-full min-h-[300px] shrink-0");
    expect(player).not.toContain("h-[min(380px,40dvh)]");
    expect(player).not.toContain("max-h-[380px]");
    expect(player).not.toContain("max-h-[min(48dvh,420px)]");
    expect(player).not.toContain("aspect-[16/9]");
    expect(player).toContain("min-h-0 flex-1 overflow-hidden");
    expect(player).toContain("data-junior-zero-scroll");
    expect(player).not.toContain("min-h-[420px]");
    expect(player).not.toContain("h-[450px]");
    expect(player).toContain("shrink-0");
    expect(player).toContain("onPlaybackComplete");
    expect(player).not.toContain("lg:h-full lg:max-h-full");
    expect(player).toContain("data-junior-live-caption");
    expect(player).toContain("data-junior-cinema-board");
    expect(player).toContain("data-junior-caption-rail");
    expect(player).toContain("useState(false)");
    expect(player).toContain("captionsVisible");
    expect(player).toContain("{captionsVisible ? (");
    expect(player).toContain('data-junior-clean-stage={captionsVisible ? undefined : "true"}');
    expect(player).toContain("onToggleCaptions=");
    expect(player).toContain("flex min-h-0 w-full flex-1 flex-col gap-1");
    expect(player).toContain("overflow-hidden border border-[var(--border)]");
    expect(player).toContain("data-junior-fullscreen");
    expect(player).toContain('className="flex w-full min-h-[2.25rem]');
    const listenLayout = readFileSync(join(root, "components/junior/listen-and-tell.tsx"), "utf8");
    expect(listenLayout).toContain("overflow-hidden");
    expect(listenLayout).toContain("flex h-full min-h-0 w-full flex-1 flex-col");
    expect(listenLayout).toContain("fill");
    expect(listenLayout).toContain('"flex min-h-0 w-full flex-1 flex-col"');
    expect(listenLayout).toContain("data-junior-stage-full");
    expect(listenLayout).not.toContain("max-h-[min(28vh,240px)]");
    expect(listenLayout).not.toContain("data-junior-stage-compact");
    const lessonPage = readFileSync(join(root, "app/junior/ders/[lessonKey]/page.tsx"), "utf8");
    expect(lessonPage).not.toContain("juniorFreeLessonPublicLine");
    expect(lessonPage).not.toContain("ücretsiz ilk konusudur");
    expect(lessonPage).toContain("cinema");
    expect(lessonPage).toContain("overflow-hidden");
    expect(lessonPage).toContain("pb-0");
    expect(lessonPage).not.toContain("lg:overflow-hidden");
    expect(lessonPage).not.toContain("lg:overflow-y-auto");
    const lessonShell = readFileSync(join(root, "components/shell/app-shell-switch.tsx"), "utf8");
    expect(lessonShell).toContain("h-[calc(100dvh-3rem)]");
    expect(lessonShell).toContain("max-h-[calc(100dvh-3rem)]");
    expect(lessonPage).toContain("outcomes={lesson.outcomes}");
    const lessonChain = readFileSync(join(root, "components/junior/lesson-chain.tsx"), "utf8");
    expect(lessonChain).toContain("ActivityHub");
    expect(lessonChain).toContain("grid-rows-[minmax(0,1fr)_9rem]");
    expect(lessonChain).toContain("lg:grid-rows-1");
    expect(lessonChain).not.toContain("h-[min(46vh,26rem)]");
    const activityHub = readFileSync(join(root, "components/junior/activity-hub.tsx"), "utf8");
    const booklet = readFileSync(join(root, "components/junior/lesson-booklet.tsx"), "utf8");
    expect(activityHub).toContain("junior-activity-hub");
    expect(activityHub).toContain("🎮 Etkinlikler ve Bulmacalar");
    expect(activityHub).toContain("📝 Soru Bankası ve Testler");
    expect(activityHub).toContain("📘 Ders Notu ve Zihin Haritası");
    expect(activityHub).not.toContain("Konu Anlatımı ve Animasyon");
    expect(activityHub).not.toContain("data-junior-narration-panel");
    expect(activityHub).not.toContain("yukarıdaki sahnede oynar");
    expect(activityHub).not.toContain("<ol");
    expect(booklet).toContain("data-junior-booklet");
    expect(booklet).toContain("bg-amber-50");
    expect(booklet).toContain("border-l-4 border-amber-400");
    expect(booklet).toContain("bg-sky-50");
    expect(booklet).toContain("border-l-4 border-sky-400");
    expect(booklet).toContain("juniorHintTitle(\"trap\")");
    expect(booklet).not.toContain("Tuzaklara Düşme!");
    expect(booklet).toContain("data-junior-paper-fold");
    expect(booklet).toContain("2³ ≠ 6");
    expect(player).not.toContain("<details");
    expect(player).not.toContain("lg:grid-cols-2");
    expect(player).not.toContain("h-[min(56vh,520px)]");
    expect(player).toContain("JuniorPlayerControls");
    expect(player).toContain("JuniorLessonDecision");
    expect(player).toContain("playback.complete");
    expect(player).not.toContain("beat === beats.length - 1 && beats.length > 1");
    expect(player).toContain("JuniorStepArt");
    expect(player).toContain("JuniorWarmupCassette");
    expect(player).toContain("data-junior-warmup-gate");
    expect(player).toContain("onError={warmup.onError}");
    expect(player).toContain("onStep={warmup.orienting ? undefined : playback.stepBy}");
    // Pilot dalı: sealed ile aynı pre-roll shell; grantedWarmupUrl / lockPublicMedia iletilir.
    expect(player).toContain("PilotPlayerWithWarmupShell");
    expect(player).toContain("data-junior-pilot-warmup-shell");
    expect(player).toContain("grantedWarmupUrl");
    expect(player).toContain("lockPublicMedia");
    expect(player).toContain("narrationHold={warmup.gate === \"cassette\"}");
    expect(player).toContain("controlsLocked={warmup.orienting}");
    const pilotPlayer = readFileSync(
      join(root, "components/junior/pilot-player/JuniorPilotPlayer.tsx"),
      "utf8",
    );
    expect(pilotPlayer).toContain("narrationHold");
    expect(pilotPlayer).toContain("onBindStartNarration");
    expect(pilotPlayer).toContain("seekToMs(0, { force: true })");
    // Altyazı aktif kelime: font-weight sabit; vurgu yalnızca amber arka plan + renk (layout shift yok).
    expect(pilotPlayer).toContain('data-junior-caption-word={isActiveWord ? "active"');
    expect(pilotPlayer).toContain("bg-amber-400/30 text-amber-300");
    expect(pilotPlayer).toMatch(/font-medium/);
    expect(pilotPlayer).not.toMatch(
      /isActiveWord[\s\S]{0,220}font-(?:black|bold|semibold|extrabold)/,
    );
    expect(pilotPlayer).not.toMatch(
      /isActiveWord[\s\S]{0,220}underline/,
    );
    expect(player).toContain("data-junior-profile-missing");
    expect(player).toContain("Profil seçilmedi. Ders kilitlenmeden oynar.");
    const listenTell = readFileSync(join(root, "components/junior/listen-and-tell.tsx"), "utf8");
    expect(listenTell).toContain("cassetteComplete && tellGuides.length > 0");
    expect(listenTell).toContain("onPlaybackComplete={(complete) => {");
    expect(listenTell).toContain("setCassetteComplete(complete)");
    expect(listenTell).toContain("Hazırım, Sana Anlatayım! — kontrol soruları");
    expect(listenTell).toContain('scrollIntoView({ behavior: "smooth", block: "center" })');
    expect(listenTell).toContain('id="listen-and-tell-section"');
    expect(listenTell).toContain("shouldStartImmediately");
    expect(listenTell).toContain("setTellArmed(true)");
    expect(listenTell).toContain("void startRecording()");
    expect(listenTell).toContain("data-junior-tell-armed");
    expect(listenTell).toContain("data-junior-stage-full");
    expect(listenTell).toContain("data-junior-mic-record");
    expect(listenTell).toContain("data-junior-mic-wave");
    expect(listenTell).toContain("Anlatmaya Başla / Kaydı Başlat");
    expect(listenTell).not.toContain("data-junior-stage-compact");
    const playback = readFileSync(join(root, "components/junior/player/use-junior-playback.ts"), "utf8");
    expect(playback).toContain("juniorLessonAudioSrc");
    expect(playback).toContain("juniorBgmSrc");
    expect(playback).toContain("armBgm");
    expect(playback).toContain("JUNIOR_BGM_SPEECH_VOLUME");
    expect(playback).toContain("JUNIOR_BGM_AMBIENT_VOLUME");
    expect(playback).toContain('armBgm("speech")');
    expect(playback).toContain('armBgm("ambient")');
    expect(playback).toContain("bgm.loop = true");
    expect(playback).toContain("playCassetteFrom");
    expect(playback).toContain("playSpeechFrom");
    expect(playback).toContain("HTMLAudioElement");
    expect(playback).toContain("audio.muted = false");
    expect(playback).toContain("audio.volume = 1");
    expect(playback).toContain("armCassetteChannel");
    expect(playback).toContain("NotAllowedError");
    expect(playback).toContain("juniorPlayerCueAt");
    expect(playback).toContain("juniorPlayerHasReachedEnd");
    expect(playback).toContain("liveCaption");
    expect(playback).toContain("timeline.windows");
    expect(playback).toContain("timeline.pieces.length");
    expect(playback).toContain("activePiece");
    expect(playback).toContain("Zero-delay");
    expect(playback).not.toContain("now - paint >= 80");
    expect(playback).toContain("audio.currentTime = 0");
    expect(playback).toContain("complete");
    expect(playback).toContain("function stop()");
    expect(playback).toContain("function pauseBgm()");
    expect(playback).toContain("pauseBgm()");
    expect(playback).toContain("BGM kapanmaz");
    expect(player).toContain("requestFullscreen");
    expect(player).toContain('event.key !== "f"');
    expect(controls).toContain("Tam Ekran");
    expect(controls).toContain("Arka plan müziğini kapat");
    expect(player).toContain("playback.stop()");
    expect(player).toContain("BGM ambient");
    expect(player).toContain("setDecisionTaken(true)");
    expect(player).toContain("playback.complete && !decisionTaken && beats.length > 1");
    expect(player).toContain("onBindStop");
    expect(player).toContain("absolute inset-0 h-full min-h-[300px] w-full transition-opacity");
    expect(listenTell).toContain("releasePlayerAudio");
    expect(listenTell).toContain("onBindStop=");
    expect(listenTell).toContain("stopPlayerRef");
    expect(player).toContain("playback.liveCaption");
    expect(player).toContain("narration.trim()");
    const cassette = readFileSync(join(root, "components/junior/player/warmup-cassette.tsx"), "utf8");
    expect(cassette).toContain("Atla");
    expect(cassette).toContain('aria-label="Isınmayı atla"');
    expect(cassette).toContain('finish("error")');
    expect(cassette).toContain("transition-opacity");
    const art = readFileSync(join(root, "components/junior/player/step-art.tsx"), "utf8");
    expect(art).not.toContain("Hazırım, Sana Anlatayım");
    expect(art).not.toContain("JuniorLessonDecision");
    expect(art).toContain("playback.complete");
    expect(art).toContain("MathSceneArt");
    expect(art).toContain("isMathJuniorScene");
    expect(art).toContain("ScienceSceneArt");
    expect(art).toContain("isScienceJuniorScene");
    expect(art).toContain("TurkishSceneArt");
    expect(art).toContain("isTurkishJuniorScene");
    expect(art).toContain("SocialSceneArt");
    expect(art).toContain("isSocialJuniorScene");
    expect(art).not.toContain("function ForceScene");
    expect(art).not.toContain("function PlanetScene");
    expect(art).not.toContain("function MeaningScene");
    expect(art).not.toContain("function AffixScene");
    expect(art).not.toContain("function PlaceGlobeArt");
    expect(art).not.toContain("function CultureScene");
    expect(art).not.toContain("function HistoryScene");
    expect(art).not.toContain("M70 98 q26 -34");
    expect(art).not.toContain("l7 12 h-14 z");
    expect(art).not.toContain("data-junior-globe=\"dunya-enlem-boylam\"");
    expect(art).not.toContain("Paralel / Enlem");
    const mathArt = readFileSync(join(root, "components/junior/player/math-scenes.tsx"), "utf8");
    expect(mathArt).toContain("ExponentScene");
    expect(mathArt).toContain("SoftStage");
    expect(mathArt).toContain("Taban");
    expect(mathArt).toContain("Üs");
    expect(mathArt).toContain("üssü");
    expect(mathArt).toContain('join(" × ")');
    expect(mathArt).not.toContain("Üs 3, taban üç kez");
    expect(mathArt).not.toContain("Taban henüz yalnız");
    expect(mathArt).toContain("Canlı karatahta");
    expect(mathArt).toContain('scene="exponent"');
    expect(mathArt).toContain("SoftCard");
    expect(mathArt).toContain("stickyExponentParams");
    expect(mathArt).not.toContain("stickyFractionParams");
    expect(mathArt).toContain("Sticky Scene");
    expect(player).toContain("captionTrail");
    expect(player).toContain("openedMarker?.kind === \"notebook\"");
    expect(player).toContain("JuniorPauseBanner");
    expect(player).toContain("JuniorStarQuestion");
    expect(player).not.toContain("JuniorStarAlert");
    expect(player).toContain("starGlowEndMs");
    expect(player).toContain("pauses={playback.microPauses}");
    expect(player).not.toContain("bg-black/35");
    expect(player).not.toContain('role="dialog"');
    expect(player).not.toContain("absolute inset-0 z-20");
    expect(controls).toContain("data-junior-pause-count");
    expect(controls).toContain("JuniorProgressBar");
    const progressBar = readFileSync(join(root, "components/junior/player/progress-bar.tsx"), "utf8");
    expect(progressBar).toContain("data-junior-pause-pin");
    expect(progressBar).toContain("data-junior-star-glow");
    expect(progressBar).toContain("junior-star-pulse");
    expect(progressBar).toContain("💡");
    expect(progressBar).toContain("Dikkat noktası");
    const pauseBanner = readFileSync(join(root, "components/junior/player/pause-banner.tsx"), "utf8");
    expect(pauseBanner).toContain("data-junior-pause-banner");
    expect(pauseBanner).toContain("data-junior-think-hold");
    expect(pauseBanner).toContain("data-junior-star-alert");
    expect(pauseBanner).toContain("data-junior-micro-question");
    expect(pauseBanner).toContain("JUNIOR_TURN_CARD_KICKER");
    expect(pauseBanner).not.toContain("Bu parçayı kendi cümlenle söyle");
    expect(pauseBanner).not.toContain("JUNIOR_TURN_CARD_HINT");
    expect(pauseBanner).not.toContain("aria-modal");
    expect(pauseBanner).not.toContain("inset-0");
    const playbackHook = readFileSync(join(root, "components/junior/player/use-junior-playback.ts"), "utf8");
    expect(playbackHook).toContain("pause.kind === \"turn\"");
    expect(playbackHook).toContain("noticeStar");
    expect(playbackHook).toContain("Yıldız ikazı kaseti durdurmaz");
    expect(playbackHook).not.toContain("enterThinkHold");
    expect(playbackHook).not.toContain("upcomingPause");
    expect(player).not.toContain("Tuzaklara Düşme!");
    expect(player).not.toContain("Tuzak veya");
    const hintBox = readFileSync(join(root, "components/junior/hint-box.tsx"), "utf8");
    expect(hintBox).toContain("data-junior-attention-hold");
    expect(hintBox).toContain("JUNIOR_ATTENTION_BUTTON");
    expect(player).toContain("data-junior-sticky-trail");
    const clock = readFileSync(join(root, "lib/junior/player-clock.ts"), "utf8");
    expect(clock).toContain("juniorPlayerLiveCaption");
    expect(clock).toContain("juniorPlayerCueAt");
    expect(clock).toContain("windows.length > 0");
    expect(clock).toContain("pieceIndex");
    expect(clock).toContain("pieceCount");
    expect(clock).toContain("Cue SSOT");
    expect(clock).toContain("Anladım! ➔");
    expect(clock).not.toContain("Tuzak");
    expect(clock).not.toContain("orantılı tahminleme birincil");
    expect(art).toContain("captionTrail");
    expect(art).toContain("yapışkan görsel durum");
    expect(art).toContain("cleanRecapLine");
    expect(art).toContain("recapLineForActive");
    expect(art).toContain('data-junior-recap={recapClean ? "clean" : undefined}');
    expect(art).toContain("Clean Stage Unmount");
    expect(art).toContain('data-junior-stage="cinema-16x9"');
    expect(art).not.toContain("transition: \"opacity 400ms ease\"");
    expect(art).not.toContain("mathRecapName");
    expect(art).not.toContain("Merak burada başlar.");
    expect(mathArt).toContain("beat >= 9) return null");
    expect(player).toContain("artCaption");
    expect(player).toContain('beat >= 9 ? `${scene}-recap` : scene');
    expect(player).toContain("data-junior-recap-stage");
    const sceneUi = readFileSync(join(root, "components/junior/player/scene-ui.tsx"), "utf8");
    expect(sceneUi).toContain("SoftStage");
    expect(sceneUi).toContain("data-junior-scene={scene}");
    expect(sceneUi).toContain('data-junior-stage="cinema-16x9"');
    expect(sceneUi).toContain('data-junior-stage-focus="blackboard"');
    expect(sceneUi).toContain("JUNIOR_STAGE_VB_W");
    expect(sceneUi).toContain("JUNIOR_STAGE_ART_SCALE");
    expect(sceneUi).toContain("JUNIOR_STAGE_MIN_HEIGHT_PX");
    expect(sceneUi).toContain("JUNIOR_STAGE_HEIGHT_PX");
    expect(sceneUi).toContain('data-junior-stage-fit="viewport"');
    expect(sceneUi).toContain("absolute inset-0 block h-full min-h-[300px] w-full");
    expect(sceneUi).toContain("SceneReveal");
    expect(sceneUi).not.toContain("max-h-full");
    expect(sceneUi).not.toContain("min-h-[420px]");
    expect(sceneUi).not.toContain("transition: \"opacity 400ms ease\"");
    expect(sceneUi).not.toContain("stroke 400ms ease");
    expect(sceneUi).toContain("#cbd5e1");
    expect(sceneUi).toContain("parseExponentParams");
    expect(sceneUi).toContain("tryParseExponentParams");
    expect(sceneUi).toContain("stickyExponentParams");
    expect(sceneUi).toContain("stickyFractionParams");
    expect(sceneUi).toContain("stickyRetainParams");
    expect(sceneUi).toContain("base: 2, exp: 3, product: 8");
    expect(sceneUi).toContain("parseSpeedParams");
    expect(sceneUi).toContain("parseAffixTrain");
    expect(sceneUi).toContain("tryParseMeaningExample");
    expect(sceneUi).toContain("stickyMeaningExample");
    expect(sceneUi).toContain("tryParseWordTreeExample");
    expect(sceneUi).toContain("stickyWordTreeExample");
    const scienceArt = readFileSync(join(root, "components/junior/player/science-scenes.tsx"), "utf8");
    expect(scienceArt).toContain("ForceScene");
    expect(scienceArt).toContain("SpeedScene");
    expect(scienceArt).toContain("PlanetScene");
    expect(scienceArt).toContain("BodyScene");
    expect(scienceArt).toContain("BloodScene");
    expect(scienceArt).toContain("ParticleScene");
    expect(scienceArt).toContain("SoundScene");
    expect(scienceArt).toContain("CircuitScene");
    expect(scienceArt).toContain("SoftStage");
    expect(scienceArt).toContain("Yoğunluk kulesi");
    expect(scienceArt).toContain('scene="speed"');
    expect(scienceArt).not.toContain("stickySpeedParams");
    expect(sceneUi).toContain("stickySpeedParams");
    const graphic = readFileSync(join(root, "components/junior/pilot-player/GraphicOpStage.tsx"), "utf8");
    expect(graphic).toContain("Bileşke");
    expect(scienceArt).toContain("#cbd5e1");
    expect(scienceArt).not.toContain('stroke="#0f172a"');
    const fen10 = readFileSync(join(root, "lib/junior/content/fen/10.ts"), "utf8");
    expect(fen10).toContain('scene: "speed"');
    expect(fen10).not.toContain('scene: "force"');
    const turkishArt = readFileSync(join(root, "components/junior/player/turkish-scenes.tsx"), "utf8");
    expect(turkishArt).toContain("MeaningScene");
    expect(turkishArt).toContain("WordTreeScene");
    expect(turkishArt).toContain("AffixScene");
    expect(turkishArt).toContain("BookScene");
    expect(turkishArt).toContain("MainIdeaScene");
    expect(turkishArt).toContain("SupportIdeaScene");
    expect(turkishArt).toContain("SoftStage");
    expect(turkishArt).toContain("Anlam terazisi");
    expect(turkishArt).toContain("Paragraf piramidi");
    expect(turkishArt).toContain("Kök ve ek treni");
    expect(turkishArt).toContain("Noktalama ailesi");
    expect(turkishArt).toContain("Ana fikir pusulası");
    expect(turkishArt).toContain("stickyAffixTrain");
    expect(turkishArt).toContain("stickyMeaningExample");
    expect(turkishArt).toContain("stickyWordTreeExample");
    expect(turkishArt).toContain('data-junior-example="meaning"');
    expect(turkishArt).toContain('data-junior-example="word-tree"');
    expect(turkishArt).toContain("captionTrail");
    expect(turkishArt).toContain("#cbd5e1");
    expect(turkishArt).not.toContain('stroke="#0f172a"');
    const turkce1 = readFileSync(join(root, "lib/junior/content/turkce/1.ts"), "utf8");
    expect(turkce1).toContain('scene: "meaning"');
    const turkce14 = readFileSync(join(root, "lib/junior/content/turkce/14.ts"), "utf8");
    expect(turkce14).toContain('scene: "affix"');
    const socialArt = readFileSync(join(root, "components/junior/player/social-scenes.tsx"), "utf8");
    expect(socialArt).toContain("PlaceScene");
    expect(socialArt).toContain("CultureScene");
    expect(socialArt).toContain("GlobeScene");
    expect(socialArt).toContain("GridScene");
    expect(socialArt).toContain("HistoryScene");
    expect(socialArt).toContain("CaravanScene");
    expect(socialArt).toContain("AssemblyScene");
    expect(socialArt).toContain("SoftStage");
    expect(socialArt).toContain("Toplumsal rol ve değerler");
    expect(socialArt).toContain("Hak–sorumluluk terazisi");
    expect(socialArt).toContain("Kaynaklar ve ekonomi akışı");
    expect(socialArt).toContain("Demokrasi meclis binası");
    expect(socialArt).toContain("data-junior-globe=\"dunya-enlem-boylam\"");
    expect(socialArt).toContain("data-junior-equator=\"cizgi\"");
    expect(socialArt).toContain("Paralel / Enlem");
    expect(socialArt).toContain("Meridyen / Boylam");
    expect(socialArt).toContain("Ekvator");
    expect(socialArt).toContain("#cbd5e1");
    expect(socialArt).not.toContain('stroke="#0f172a"');
    const sosyal1 = readFileSync(join(root, "lib/junior/content/sosyal/1.ts"), "utf8");
    expect(sosyal1).toContain('scene: "place"');
    expect(sosyal1).not.toContain("Ekvator");
    const sosyal9 = readFileSync(join(root, "lib/junior/content/sosyal/9.ts"), "utf8");
    expect(sosyal9).toContain('scene: "grid"');
    expect(art).toContain("EnglishSceneArt");
    expect(art).toContain("isEnglishJuniorScene");
    const englishArt = readFileSync(join(root, "components/junior/player/english-scenes.tsx"), "utf8");
    expect(englishArt).toContain("ClockScene");
    expect(englishArt).toContain("TrayScene");
    expect(englishArt).toContain("SkylineScene");
    expect(englishArt).toContain("WeatherScene");
    expect(englishArt).toContain("FairScene");
    expect(englishArt).toContain("BadgeScene");
    expect(englishArt).toContain("ShelfScene");
    expect(englishArt).toContain("HolidayScene");
    expect(englishArt).toContain("RecycleScene");
    expect(englishArt).toContain("BallotScene");
    expect(englishArt).toContain("SoftStage");
    expect(englishArt).toContain("Analog saat");
    expect(englishArt).toContain("Karşılaştırma terazisi");
    expect(englishArt).toContain("was / were — geçmiş takvim");
    expect(englishArt).toContain("Some / Any sepeti");
    expect(englishArt).toContain("Sınıf kuralları puan tablosu");
    expect(englishArt).toContain("#cbd5e1");
    expect(englishArt).not.toContain('stroke="#0f172a"');
    const ing16 = readFileSync(join(root, "lib/junior/content/ing/16.ts"), "utf8");
    expect(ing16).toContain('scene: "shelf"');
    expect(ing16).not.toContain('scene: "badge"');
    const ing20 = readFileSync(join(root, "lib/junior/content/ing/20.ts"), "utf8");
    expect(ing20).toContain('scene: "rules"');
    expect(player).toContain("data-junior-step-art");
    expect(player).toContain("key={beat >= 9 ? `${scene}-recap` : scene}");
    expect(player).not.toContain("key={`${scene}-${beat}`}");
    expect(sceneUi).toContain("SoftFocus");
    expect(mathArt).toContain("Zero Layout Shift");
    expect(scienceArt).toContain("yalnız vurgu kayar");
    const decision = readFileSync(join(root, "components/junior/player/lesson-decision.tsx"), "utf8");
    expect(decision).toContain("Hazırım, Sana Anlatayım! 🎙️");
    expect(decision).toContain("Bir Kez Daha Dinlemek İstiyorum");
    expect(decision).toContain(
      "absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto",
    );
    expect(decision).toContain("cursor-pointer");
    expect(player).toContain("data-junior-cinema-board");
    expect(player).toContain("<JuniorLessonDecision");
    expect(sceneUi).toContain("pointer-events-none absolute inset-0 block h-full min-h-[300px] w-full");
    expect(art).toContain("pointer-events-none absolute inset-0 block h-full min-h-[300px] w-full");
    expect(player).toContain('className="pointer-events-none absolute inset-0 h-full min-h-[300px] w-full"');
    expect(mathArt).toContain("showExponent = beat >= 1");
    expect(mathArt).toContain("showFactors = beat >= 2");
    expect(mathArt).toContain("showEquality = beat >= 3");
    expect(mathArt).toContain("showProduct = beat >= 5");
    expect(mathArt).toContain("showTrap = beat >= 7");
    expect(mathArt).toContain("SceneReveal");
    expect(scienceArt).toContain('data-junior-reveal={revealed ? "on" : "off"}');
    expect(page).not.toContain(
      "İlk konu ücretsizdir. Anlatış kaydı ve konu testi veli girişi ile yıllık paket ister.",
    );
    expect(page).not.toContain("JUNIOR_PAID_ACTION_ERROR");
    expect(page).not.toContain("Bu konu veli girişi ve yıllık paket ister.");
  });
});
