import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { juniorLessonByKey } from "@/lib/junior/catalog";
import { juniorLessonNote } from "@/lib/junior/lesson-note";
import { startsWithJuniorWarmOpening } from "@/lib/junior/content-rules";
import {
  JUNIOR_NARRATION_AIM_MS,
  JUNIOR_NARRATION_MAX_MS,
  JUNIOR_NARRATION_MIN_MS,
  JUNIOR_PLAYER_BEAT_MS,
  JUNIOR_PLAYER_MIN_WINDOW_MS,
  juniorPlayerActivePieceIndex,
  juniorPlayerBeatIndex,
  juniorPlayerClampMs,
  juniorPlayerClockLabel,
  juniorPlayerCueAt,
  juniorPlayerHasReachedEnd,
  juniorPlayerLiveCaption,
  juniorPlayerRangeLabel,
  juniorPlayerStepLabel,
  juniorPlayerTimeline,
  juniorPlayerWindowIndex,
} from "@/lib/junior/player-clock";
import { chunkJuniorLocalSpeech } from "@/lib/junior/speech";
import { juniorTeacherSelfIntro } from "@/lib/junior/voice";
import {
  DEFAULT_EXPONENT_PARAMS,
  DEFAULT_MEANING_EXAMPLE,
  parseExponentParams,
  parseMeaningExample,
  stickyExponentParams,
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
    expect(startsWithJuniorWarmOpening(timeline.pieces[0]?.text ?? "")).toBe(true);
    expect(timeline.pieces[0]?.text).toContain(juniorTeacherSelfIntro("jr_06_mat-1"));
    expect(timeline.pieces.some((piece) => piece.text.includes("üst üste"))).toBe(true);
    for (let ms = 0; ms <= timeline.durationMs; ms += 500) {
      const cue = juniorPlayerCueAt(ms, timeline);
      expect(cue?.text).toBe(juniorPlayerLiveCaption(ms, timeline));
      expect(cue?.pieceIndex).toBe(juniorPlayerActivePieceIndex(ms, timeline));
    }
    expect(timeline.pieces.some((piece) => piece.text.includes("Lego"))).toBe(true);
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
    const powerPiece = timeline.pieces.find((piece) => /2 üssü 3/u.test(piece.text));
    expect(powerPiece).toBeDefined();
    if (powerPiece) {
      const at = powerPiece.collapsedStart + 1;
      const windows = timeline.windows;
      const window = windows.find((w) => at >= w.noteStart && at < w.noteEnd) ?? windows[0];
      expect(window).toBeDefined();
      if (window) {
        const span = window.endMs - window.startMs;
        const ratio = (at - window.noteStart) / Math.max(1, window.noteEnd - window.noteStart);
        const ms = window.startMs + ratio * span;
        const live = juniorPlayerLiveCaption(ms, timeline);
        expect(live).toContain("2 üssü 3");
        const parsed = parseExponentParams(live);
        expect(parsed).toEqual({ base: 2, exp: 3, product: 8 });
      }
    }
    expect(JUNIOR_NARRATION_MIN_MS).toBe(300_000);
    expect(JUNIOR_NARRATION_AIM_MS).toBe(450_000);
    expect(JUNIOR_NARRATION_MAX_MS).toBe(720_000);
    expect(timeline.durationMs).toBeGreaterThanOrEqual(JUNIOR_NARRATION_MIN_MS);
    expect(timeline.durationMs).toBeLessThanOrEqual(JUNIOR_NARRATION_MAX_MS);
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

  it("jr_06_mat-1 üslü örnekleri doğrusal 2³ → 10² → 5¹ tutar; arada bounce yok", () => {
    const lesson = juniorLessonByKey("jr_06_mat-1");
    expect(lesson).not.toBeNull();
    if (!lesson) {
      return;
    }
    const note = juniorLessonNote(lesson.mebNote, lesson.lifeUse);
    const chunks = chunkJuniorLocalSpeech(note);
    const timeline = juniorPlayerTimeline(note, chunks, 12);
    const trail: string[] = [];
    const seen: Array<{ base: number; exp: number }> = [];
    let previousKey = "";
    let lastHit = DEFAULT_EXPONENT_PARAMS;
    let seenTen = false;
    let seenFive = false;
    for (const piece of timeline.pieces) {
      trail.push(piece.text);
      const params = stickyExponentParams(trail);
      const hit = tryParseExponentParams(piece.text);
      const key = `${params.base}^${params.exp}`;
      if (key !== previousKey) {
        seen.push({ base: params.base, exp: params.exp });
        previousKey = key;
      }
      if (hit) {
        lastHit = hit;
        if (hit.base === 10 && hit.exp === 2) seenTen = true;
        if (hit.base === 5 && hit.exp === 1) seenFive = true;
      } else {
        // Hit yok → son geçerli durum; varsayılana bounce yok.
        expect(params).toEqual(lastHit);
      }
      // Aşama 2 (ilk geçiş): 10² ile 5¹ arası genel cümlede 2³ seed'e çakılma yok.
      if (seenTen && !seenFive && !hit) {
        expect(params).toEqual({ base: 10, exp: 2, product: 100 });
        expect(params).not.toEqual(DEFAULT_EXPONENT_PARAMS);
      }
    }
    // Aşama 1 → 2 → 4: ilk üç üslü örnek sırası (2³, 10², 5¹).
    expect(seen.slice(0, 3)).toEqual([
      { base: 2, exp: 3 },
      { base: 10, exp: 2 },
      { base: 5, exp: 1 },
    ]);
    expect(seenTen && seenFive).toBe(true);
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
    const panel = readFileSync(join(root, "components/junior/player/note-panel.tsx"), "utf8");
    const player = readFileSync(join(root, "components/junior/vector-player.tsx"), "utf8");
    const page = readFileSync(join(root, "app/junior/ders/[lessonKey]/page.tsx"), "utf8");
    expect(controls).toContain("Oynat");
    expect(controls).toContain("Durdur");
    expect(controls).toContain("Baştan Dinle");
    expect(controls).toContain("CC");
    expect(controls).toContain("data-junior-captions-toggle");
    expect(controls).toContain("captionsVisible");
    expect(controls).toContain("onToggleCaptions");
    expect(controls).toContain('aria-label="Anlatım ilerlemesi"');
    expect(controls).toContain("data-junior-player-progress");
    expect(panel).toContain("data-junior-note-span");
    expect(panel).toContain("bg-[#fef3c7]");
    expect(player).toContain("Video / Görsel Oynatıcı");
    expect(player).toContain("Ders Notu ve Özet");
    expect(player).toContain("data-junior-focus-player");
    expect(player).toContain("data-junior-cinema-stage");
    expect(player).toContain("aspect-[16/9]");
    expect(player).toContain("max-h-[min(48dvh,420px)]");
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
    expect(player).toContain("flex w-full flex-col gap-2");
    expect(player).toContain("overflow-hidden rounded-xl border");
    expect(player).toContain('className="flex w-full min-h-[2.25rem]');
    const listenLayout = readFileSync(join(root, "components/junior/listen-and-tell.tsx"), "utf8");
    expect(listenLayout).toContain("overflow-hidden");
    expect(listenLayout).toContain("fill");
    expect(listenLayout).toContain('"flex min-h-0 flex-1 flex-col"');
    expect(listenLayout).toContain("data-junior-stage-full");
    expect(listenLayout).not.toContain("max-h-[min(28vh,240px)]");
    expect(listenLayout).not.toContain("data-junior-stage-compact");
    const lessonPage = readFileSync(join(root, "app/junior/ders/[lessonKey]/page.tsx"), "utf8");
    expect(lessonPage).toContain("lg:overflow-hidden");
    expect(lessonPage).not.toContain("lg:overflow-y-auto");
    expect(player).toContain("<details");
    expect(player).not.toContain("lg:grid-cols-2");
    expect(player).not.toContain("h-[min(56vh,520px)]");
    expect(player).toContain("JuniorPlayerControls");
    expect(player).toContain("JuniorNotePanel");
    expect(player).toContain("JuniorLessonDecision");
    expect(player).toContain("playback.complete");
    expect(player).not.toContain("beat === beats.length - 1 && beats.length > 1");
    expect(player).toContain("JuniorStepArt");
    expect(player).toContain("JuniorWarmupCassette");
    expect(player).toContain("data-junior-warmup-gate");
    expect(player).toContain("onError={warmup.onError}");
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
    expect(playback).toContain("BGM kapanmaz");
    expect(player).toContain("playback.stop()");
    expect(player).toContain("BGM ambient");
    expect(player).toContain("setDecisionTaken(true)");
    expect(player).toContain("playback.complete && !decisionTaken && beats.length > 1");
    expect(player).toContain("onBindStop");
    expect(player).toContain("relative h-full transition-opacity");
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
    expect(mathArt).toContain("stickyFractionParams");
    expect(mathArt).toContain("Sticky Scene");
    expect(player).toContain("captionTrail");
    expect(player).toContain("data-junior-sticky-trail");
    const clock = readFileSync(join(root, "lib/junior/player-clock.ts"), "utf8");
    expect(clock).toContain("juniorPlayerLiveCaption");
    expect(clock).toContain("juniorPlayerCueAt");
    expect(clock).toContain("windows.length > 0");
    expect(clock).toContain("pieceIndex");
    expect(clock).toContain("pieceCount");
    expect(clock).toContain("Cue SSOT");
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
    expect(sceneUi).toContain("block h-full w-full max-h-full");
    expect(sceneUi).not.toContain("min-h-[420px]");
    expect(sceneUi).not.toContain("transition: \"opacity 400ms ease\"");
    expect(sceneUi).not.toContain("stroke 400ms ease");
    expect(sceneUi).toContain("#cbd5e1");
    expect(sceneUi).toContain("parseExponentParams");
    expect(sceneUi).toContain("tryParseExponentParams");
    expect(sceneUi).toContain("stickyExponentParams");
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
    expect(scienceArt).toContain("Bileşke");
    expect(scienceArt).toContain('scene="speed"');
    expect(scienceArt).toContain("stickySpeedParams");
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
    const ing12 = readFileSync(join(root, "lib/junior/content/ing/12.ts"), "utf8");
    expect(ing12).toContain('scene: "holiday"');
    expect(ing12).not.toContain('scene: "badge"');
    const ing11 = readFileSync(join(root, "lib/junior/content/ing/11.ts"), "utf8");
    expect(ing11).toContain('scene: "badge"');
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
    expect(sceneUi).toContain("pointer-events-none block h-full w-full max-h-full");
    expect(art).toContain("pointer-events-none block h-full w-full");
    expect(player).toContain('className="pointer-events-none h-full"');
    expect(page).not.toContain(
      "İlk konu ücretsizdir. Anlatış kaydı ve konu testi veli girişi ile yıllık paket ister.",
    );
    expect(page).not.toContain("JUNIOR_PAID_ACTION_ERROR");
    expect(page).not.toContain("Bu konu veli girişi ve yıllık paket ister.");
  });
});
