#!/usr/bin/env tsx
/**
 * Junior çocuk sesi kapısı. API çağırmaz. MP3'yi yeniden yazmaz.
 *
 *   npm run verify:junior-speech
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { ACADEMY_MATCH_WHISTLE_MAX } from "@/lib/academy/production-standard";
import { JUNIOR_FEN_LESSONS } from "@/lib/junior/content/fen";
import { JUNIOR_ING_LESSONS } from "@/lib/junior/content/ing";
import { JUNIOR_MAT_LESSONS } from "@/lib/junior/content/mat";
import { JUNIOR_SOSYAL_LESSONS } from "@/lib/junior/content/sosyal";
import { JUNIOR_TURKCE_LESSONS } from "@/lib/junior/content/turkce";
import { juniorLessonNote } from "@/lib/junior/lesson-note";
import {
  JUNIOR_NARRATION_MAX_MS,
  JUNIOR_NARRATION_MIN_MS,
  juniorPlayerBeatIndex,
  juniorPlayerCueAt,
  juniorPlayerLiveCaption,
  juniorPlayerStepAnchors,
  juniorPlayerTimeline,
  scaleJuniorPlayerTimeline,
} from "@/lib/junior/player-clock";
import { chunkJuniorLocalSpeech } from "@/lib/junior/speech";
import { juniorTeacherForLesson } from "@/lib/junior/voice";
import { JUNIOR_MAT_5 } from "@/lib/junior/content/mat/1";
import { JUNIOR_AUDIO_MANIFEST } from "@/lib/junior/audio-manifest.generated";
import { juniorSealedScenarioCount } from "../packages/junior-content/src/sealed-roster";
import { isGeminiTtsPrebuiltVoice } from "@/lib/kernel/ai/tts-voices";
import {
  JUNIOR_CATALOG_NARRATOR_VOICE,
  JUNIOR_CHILD_VOICE_PEER_GUARD,
  JUNIOR_CHILD_VOICE_PROMPT,
  JUNIOR_VOICE_DESIGN,
  juniorVoiceDesignCreateBody,
  juniorVoiceDesignTranscript,
} from "@/lib/junior/voice-design";

const require = createRequire(import.meta.url);
const issues: string[] = [];

function probeMp3DurationSec(path: string): number | null {
  if (!existsSync(path)) {
    return null;
  }
  const ffmpegPath = require("ffmpeg-static") as string | null;
  if (!ffmpegPath) {
    return null;
  }
  const result = spawnSync(ffmpegPath, ["-hide_banner", "-i", path], { encoding: "utf8" });
  const text = `${result.stderr ?? ""}\n${result.stdout ?? ""}`;
  const match = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/u);
  if (!match) {
    return null;
  }
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function check(ok: boolean, message: string): void {
  if (!ok) {
    issues.push(message);
  }
}

function walkKeys(value: unknown, path: string): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkKeys(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") {
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === "systemInstruction") {
      issues.push(`${path}.${key} TTS isteğine basılamaz`);
    }
    walkKeys(child, `${path}.${key}`);
  }
}

const body = juniorVoiceDesignCreateBody();
check(JUNIOR_VOICE_DESIGN.voicePrompt.startsWith(JUNIOR_CHILD_VOICE_PROMPT), "voicePrompt CEO cümlesiyle açılmıyor");
check(JUNIOR_VOICE_DESIGN.voicePrompt.includes(JUNIOR_CHILD_VOICE_PEER_GUARD), "5-8 akran kilidi yok");
check(JUNIOR_VOICE_DESIGN.systemInstruction === JUNIOR_VOICE_DESIGN.voicePrompt, "systemInstruction voicePrompt ile aynı değil");
check(body.voice.prompted.input === JUNIOR_VOICE_DESIGN.voicePrompt, "prompted.input voicePrompt değil");
check(body.voice.language_code === "tr-TR", "ses tasarımı dili tr-TR değil");
walkKeys(body, "createBody");

const transcript = juniorVoiceDesignTranscript(JUNIOR_MAT_5.listenText);
check(transcript.includes("kalansız"), "jr_06_mat-1 bölünebilme cümlesi transkriptte yok");
check(!transcript.includes("# AUDIO PROFILE"), "transkript yönetmen katmanı taşıyor");
check(!transcript.includes("[pause]"), "transkript [pause] etiketini sesli okuyabilir");

const bake = readFileSync(join(process.cwd(), "scripts", "bake-junior-pilot-tts.ts"), "utf8");
check(bake.includes("prebuiltVoiceConfig"), "fırın katalog sesini senteze basmıyor");
check(bake.includes('voiceMode: "catalog"'), "fırın fişi katalog sesi taşımıyor");
check(bake.includes("voicePrompt gönderilmez"), "fırın voicePrompt yolunu kapatmıyor");
check(!bake.includes("createJuniorDesignedVoice"), "fırın Voices API voicePrompt yolunu hâlâ çağırıyor");
check(!bake.includes("systemInstruction:"), "fırın TTS systemInstruction basıyor");
check(
  juniorTeacherForLesson("jr_06_mat-1").voice === JUNIOR_CATALOG_NARRATOR_VOICE,
  "jr_06_mat-1 katalog sesi varsayılan anlatıcıyla uyuşmuyor",
);
check(isGeminiTtsPrebuiltVoice(JUNIOR_CATALOG_NARRATOR_VOICE), "varsayılan anlatıcı Gemini katalog sesi değil");
check(JUNIOR_CATALOG_NARRATOR_VOICE === "Fenrir", "varsayılan anlatıcı Fenrir değil");
check(juniorTeacherForLesson("jr_06_fen-1").voice === JUNIOR_CATALOG_NARRATOR_VOICE, "fen katalog sesi Fenrir değil");
check(juniorTeacherForLesson("jr_06_ing_main-1").voice === "Kore", "İngilizce Kore'den çıktı");
check(juniorTeacherForLesson("jr_06_mat-1").voice !== "Puck", "jr_06_mat-1 hâlâ iri Puck sesinde");
check(juniorTeacherForLesson("jr_06_mat-1").voice !== "Charon", "jr_06_mat-1 hâlâ tok Charon sesinde");
check(juniorTeacherForLesson("jr_06_mat-1").voice !== "Kore", "jr_06_mat-1 hâlâ kadın Kore sesinde");

const speech = readFileSync(join(process.cwd(), "lib", "junior", "speech.ts"), "utf8");
check(!/gemini|openai|elevenlabs|text-to-speech/i.test(speech), "dinleme kanalı dış ses servisi taşıyor");
check(speech.includes("voice-design.ts"), "dinleme kanalı fırın profiline işaret etmiyor");

const player = readFileSync(join(process.cwd(), "components", "junior", "player", "use-junior-playback.ts"), "utf8");
check(player.includes("scaleJuniorPlayerTimeline"), "oynatıcı kaset süresine ölçeklemiyor");

const courses = [JUNIOR_MAT_LESSONS, JUNIOR_FEN_LESSONS, JUNIOR_TURKCE_LESSONS, JUNIOR_SOSYAL_LESSONS, JUNIOR_ING_LESSONS];
const total = courses.reduce((sum, lessons) => sum + lessons.length, 0);
const published = Object.keys(JUNIOR_AUDIO_MANIFEST).length;
check(total === published, `yayın ders sayısı ${published} değil: ${total}`);
check(juniorSealedScenarioCount() >= total, "yazarlık kadrosu yayından küçük");
check(JUNIOR_MAT_LESSONS[0]?.key === "jr_06_mat-1", "matematik açılışı jr_06_mat-1 değil");
for (const lessons of courses) {
  check(
    lessons.length + 1 <= ACADEMY_MATCH_WHISTLE_MAX,
    `${lessons[0]?.key ?? "kurs"} düdük tavanını aşıyor`,
  );
}

const lesson = JUNIOR_MAT_5;
const steps: readonly string[] = lesson.steps ?? [];
check(steps.length > 0, "jr_06_mat-1 görsel adım dizisi yok");
const note = juniorLessonNote(lesson.mebNote, lesson.lifeUse);
const base = juniorPlayerTimeline(note, chunkJuniorLocalSpeech(note), steps.length);
const scaled = scaleJuniorPlayerTimeline(base, 510_000);
check(scaled.pieces === base.pieces, "ölçek parça metnini değiştirdi");
check(
  scaled.durationMs >= JUNIOR_NARRATION_MIN_MS && scaled.durationMs <= JUNIOR_NARRATION_MAX_MS,
  "ölçeklenen süre anlatım bandının dışında",
);
const baseAnchors = juniorPlayerStepAnchors(steps, base);
const anchors = juniorPlayerStepAnchors(steps, scaled);
check(
  anchors.map((anchor) => anchor.beat).join(",") === baseAnchors.map((anchor) => anchor.beat).join(","),
  "ölçek adım sırasını değiştirdi",
);
const factor = scaled.durationMs / base.durationMs;
for (let index = 0; index < anchors.length; index += 1) {
  const expected = Math.round((baseAnchors[index]?.startMs ?? 0) * factor);
  check(
    Math.abs((anchors[index]?.startMs ?? 0) - expected) <= 8,
    "adım çapası kaset süresiyle orantılı kaymadı",
  );
}
const cassettePath = join(process.cwd(), "public", "media", "junior", "audio", "jr_06_mat-1.mp3");
const cassetteSec = probeMp3DurationSec(cassettePath);
if (cassetteSec != null) {
  check(cassetteSec >= 299 && cassetteSec <= 330, `jr_06_mat-1 kaset süresi mühürlü 4:59–5:30 bandında değil: ${cassetteSec.toFixed(2)}s`);
  const live = scaleJuniorPlayerTimeline(base, Math.round(cassetteSec * 1000));
  check(live.durationMs === Math.round(cassetteSec * 1000), "kaset saati MP3 süresine oturmadı");
  check(live.pieces === base.pieces, "kaset ölçeği parça metnini değiştirdi");
  const liveAnchors = juniorPlayerStepAnchors(steps, live);
  check(
    liveAnchors.map((anchor) => anchor.beat).join(",") === baseAnchors.map((anchor) => anchor.beat).join(","),
    "kaset ölçeği adım sırasını değiştirdi",
  );
  const liveFactor = live.durationMs / base.durationMs;
  for (let index = 0; index < liveAnchors.length; index += 1) {
    const expected = Math.round((baseAnchors[index]?.startMs ?? 0) * liveFactor);
    check(
      Math.abs((liveAnchors[index]?.startMs ?? 0) - expected) <= 8,
      "kaset adım çapası gerçek süreyle orantılı kaymadı",
    );
  }
}

const fold = scaled.pieces.find((piece) => piece.text.includes("kalansız"));
check(Boolean(fold), "bölünebilme cümlesi saatte yok");
if (fold) {
  const at = fold.collapsedStart + 1;
  const window = scaled.windows.find((row) => at >= row.noteStart && at < row.noteEnd) ?? scaled.windows[0];
  if (window) {
    const span = window.endMs - window.startMs;
    const ratio = (at - window.noteStart) / Math.max(1, window.noteEnd - window.noteStart);
    const ms = window.startMs + ratio * span;
    const caption = juniorPlayerLiveCaption(ms, scaled);
    check(caption.includes("kalansız"), "ölçeklenen saatte bölünebilme cümlesi kaydı");
    check(juniorPlayerCueAt(ms, scaled)?.text.includes("kalansız") === true, "ölçeklenen cue bölünebilmeyi kaçırdı");
    const beat = juniorPlayerBeatIndex(ms, scaled.durationMs, steps.length, scaled.windows, 0, scaled.pieces.length, anchors);
    check(beat >= 0 && beat < steps.length, "adım indeksi ders boyunun dışında");
  }
}

if (issues.length > 0) {
  process.stderr.write(["verify:junior-speech BAŞARISIZ", ...issues.map((row) => `  ✗ ${row}`)].join("\n") + "\n");
  process.exit(1);
}

process.stdout.write(
  `verify:junior-speech OK — jr_06_mat-1 katalog sesi Fenrir, voicePrompt senteze gitmez, ${published} yayın dersi fırına hazır, yazarlık ${juniorSealedScenarioCount()}, saat 510s ölçekte bölünebilme adımında.\n`,
);
