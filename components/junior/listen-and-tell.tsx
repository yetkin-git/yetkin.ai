"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { VectorPlayer } from "@/components/junior/vector-player";
import { Button } from "@/components/ui/button";
import {
  JUNIOR_PAID_ACTION_ERROR,
  JUNIOR_QUIZ_PREPARING_LABEL,
  JUNIOR_TELL_MAX_SEC,
  JUNIOR_TELL_MIN_SEC,
  JUNIOR_TELL_PASS_SCORE,
  JUNIOR_TELL_PATH,
} from "@/lib/junior/limits";
import { endJuniorSpeech } from "@/lib/junior/speech";
import type { JuniorVectorScene } from "@/lib/junior/types";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type Feedback = {
  praised: string;
  missing: string;
  advice: string;
  score: number;
  xpAwarded: number;
  points: number;
};

type ListenAndTellProps = {
  profileId: string;
  lessonKey: string;
  nickname?: string | null;
  title: string;
  script: string;
  scene: JuniorVectorScene;
  mebNote: string;
  lifeUse: string;
  steps?: readonly string[];
  hasQuiz?: boolean;
  /** «Hazırım, Sana Anlatayım!» yönlendirme kontrol soruları. */
  tellGuides?: readonly string[];
  recording?: "open" | "locked";
  quizSlot?: "ready" | "preparing" | "locked";
  tellPassed?: boolean;
  quizDone?: boolean;
  onScored?: (feedback: Feedback) => void;
  onOpenQuiz?: () => void;
  trailing?: ReactNode;
};

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/webm")) {
    return "audio/webm";
  }
  if (MediaRecorder.isTypeSupported("audio/mp4")) {
    return "audio/mp4";
  }
  return "";
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === "string" ? reader.result : "";
      const comma = raw.indexOf(",");
      resolve(comma >= 0 ? raw.slice(comma + 1) : raw);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Ses okunamadı."));
    reader.readAsDataURL(blob);
  });
}

export function ListenAndTell({
  profileId,
  lessonKey,
  nickname = null,
  title,
  script,
  scene,
  mebNote,
  lifeUse,
  steps,
  hasQuiz = true,
  tellGuides = [],
  recording: recordingGate = "open",
  quizSlot = "ready",
  tellPassed = false,
  quizDone = false,
  onScored,
  onOpenQuiz,
  trailing,
}: ListenAndTellProps) {
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: 12 }, () => 12));
  const [seconds, setSeconds] = useState(0);
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  /** Pembe kontrol soruları — yalnız kaset `playback.complete === true` iken. */
  const [cassetteComplete, setCassetteComplete] = useState(false);
  /** «Hazırım…» sonrası tell bandı vurgusu — kaydırma hedefi + aktif halka. */
  const [tellArmed, setTellArmed] = useState(false);
  /**
   * Karar CTA jesti: pembe bölüm merkeze kayar, mikrofon aynı yığında açılır.
   * SoftStage boyutu korunur (sıkıştırılmaz). useEffect ile geciktirilmez —
   * getUserMedia kullanıcı jestini kaybeder.
   */
  const [shouldStartImmediately, setShouldStartImmediately] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef(0);
  const timerRef = useRef(0);
  const startedRef = useRef(0);
  const chunksRef = useRef<Blob[]>([]);
  /** VectorPlayer kaset stop — anlatış tıklamasında kanal çakışmasını keser. */
  const stopPlayerRef = useRef<() => void>(() => undefined);
  const tellBandRef = useRef<HTMLDivElement | null>(null);

  function stopMeters() {
    window.cancelAnimationFrame(frameRef.current);
    window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== "closed") {
      void context.close();
    }
  }

  /** Oynatıcıyı bırak; mikrofon jesti aynı tıklama yığınında kalsın. */
  function releasePlayerAudio() {
    stopPlayerRef.current();
    window.speechSynthesis?.cancel();
    endJuniorSpeech();
  }

  useEffect(() => {
    return () => {
      stopMeters();
      recorderRef.current = null;
      chunksRef.current = [];
      endJuniorSpeech();
      window.speechSynthesis?.cancel();
    };
  }, []);

  async function sendClip(blob: Blob, durationSec: number, mimeType: string) {
    setSending(true);
    setNote("");
    let audioBase64 = "";
    try {
      audioBase64 = await blobToBase64(blob);
      const response = await fetch(
        JUNIOR_TELL_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            profileId,
            lessonKey,
            mode: "speak",
            audioBase64,
            mimeType,
            durationSec,
          }),
        }),
      );
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string | null;
        data?: Feedback;
      } | null;
      if (!response.ok || !body?.data) {
        setNote(body?.error || "Şu an dinleyemedim. Biraz sonra yeniden dene.");
        return;
      }
      setFeedback(body.data);
      onScored?.(body.data);
    } catch {
      setNote("Ses gönderilemedi. Biraz sonra yeniden dene.");
    } finally {
      audioBase64 = "";
      chunksRef.current = [];
      setSending(false);
    }
  }

  async function startRecording() {
    // Önce kaset/Speech kanalını bırak (oynuyor veya pause); sonra mikrofon.
    releasePlayerAudio();
    setFeedback(null);
    setNote("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setNote("Mikrofon yok. Anlatış için mikrofon gerekir.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMime();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const durationSec = Math.floor((Date.now() - startedRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
        chunksRef.current = [];
        stopMeters();
        setRecording(false);
        if (durationSec < JUNIOR_TELL_MIN_SEC) {
          setNote("En az on beş saniye anlat.");
          return;
        }
        void sendClip(blob, Math.min(durationSec, JUNIOR_TELL_MAX_SEC), recorder.mimeType || mimeType || "audio/webm");
      };
      const context = new AudioContext();
      contextRef.current = context;
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const paint = () => {
        analyser.getByteFrequencyData(data);
        const next: number[] = [];
        const step = Math.max(1, Math.floor(data.length / 12));
        for (let index = 0; index < 12; index += 1) {
          const value = data[index * step] ?? 0;
          next.push(18 + Math.round((value / 255) * 82));
        }
        setBars(next);
        frameRef.current = window.requestAnimationFrame(paint);
      };
      paint();
      startedRef.current = Date.now();
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedRef.current) / 1000);
        setSeconds(elapsed);
        const active = recorderRef.current;
        if (elapsed >= JUNIOR_TELL_MAX_SEC && active?.state === "recording") {
          active.stop();
        }
      }, 250);
      recorder.start();
      setRecording(true);
    } catch {
      stopMeters();
      setRecording(false);
      setNote("Mikrofon izni yok. İzin ver, sonra yeniden dene.");
    }
  }

  function finishRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  }

  const showBand =
    recording ||
    sending ||
    note.length > 0 ||
    feedback !== null ||
    trailing != null ||
    shouldStartImmediately;

  function armTellFromDecision() {
    // Overlay kapandıktan sonra pembe alan merkeze gelir; SoftStage boyutu korunur.
    setTellArmed(true);
    setShouldStartImmediately(true);
    // Mikrofon aynı tıklama yığınında — rAF / useEffect jestini bozar.
    if (recordingGate === "open" && !recording && !sending) {
      void startRecording();
    }
    window.requestAnimationFrame(() => {
      const band =
        tellBandRef.current ?? document.getElementById("listen-and-tell-section");
      band?.scrollIntoView({ behavior: "smooth", block: "center" });
      tellBandRef.current?.focus({ preventScroll: true });
    });
  }

  const showMicDeck = cassetteComplete || tellArmed || recording || sending;
  const micLabel = recording
    ? "Anlatmayı Bitir"
    : sending
      ? "Dinleniyor…"
      : "Anlatmaya Başla / Kaydı Başlat";

  return (
    <section
      aria-label={title}
      className={`junior-quest flex h-full min-h-0 flex-1 flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-card)] ${
        cassetteComplete || showBand || tellArmed ? "overflow-y-auto" : "overflow-hidden"
      }`}
    >
      {/* flex-1 min-h-0: SoftStage + Oynat/Durdur tam boy — tellArmed iken de sıkışmaz. */}
      <div
        className="flex min-h-0 flex-1 flex-col"
        data-junior-stage-full={tellArmed ? "true" : undefined}
      >
        <VectorPlayer
          fill
          scene={scene}
          mebNote={mebNote}
          lifeUse={lifeUse}
          steps={steps}
          lessonKey={lessonKey}
          nickname={nickname}
          narration={script}
          onPlaybackComplete={(complete) => {
            setCassetteComplete(complete);
            if (!complete) {
              // Tekrar dinle: tell jesti sıfırlanır; SoftStage boyutu zaten tam.
              setTellArmed(false);
              setShouldStartImmediately(false);
            }
          }}
          onBindStop={(stop) => {
            stopPlayerRef.current = stop;
          }}
          onReadyToTell={armTellFromDecision}
        />
      </div>
      <div
        id="listen-and-tell-section"
        ref={tellBandRef}
        tabIndex={-1}
        data-junior-tell-band=""
        data-junior-tell-armed={tellArmed ? "true" : undefined}
        data-junior-should-start={shouldStartImmediately ? "true" : undefined}
        className={`flex shrink-0 flex-col gap-2 border-t border-[var(--border)] pt-2 outline-none transition-[box-shadow] duration-300 ${
          tellArmed
            ? "rounded-xl ring-2 ring-[color-mix(in_srgb,var(--rose)_55%,transparent)] ring-offset-2 ring-offset-[var(--surface)]"
            : ""
        }`}
      >
        {showMicDeck ? (
          <div
            data-junior-tell-guides=""
            data-junior-mic-deck=""
            className="rounded-xl border border-[color-mix(in_srgb,var(--rose)_35%,var(--border))] bg-[color-mix(in_srgb,var(--rose-soft)_85%,white)] px-3 py-3"
          >
            {cassetteComplete && tellGuides.length > 0 ? (
              <>
                <p className="text-xs font-semibold text-[var(--safir-deep)]">
                  Hazırım, Sana Anlatayım! — kontrol soruları
                </p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-xs leading-5 text-[var(--safir-deep)]">
                  {tellGuides.map((guide) => (
                    <li key={guide}>{guide}</li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="text-xs font-semibold text-[var(--safir-deep)]">Şimdi Sen Anlat</p>
            )}
            <div
              className="mt-3 flex flex-col items-center gap-3"
              data-junior-mic-stage=""
              aria-live="polite"
            >
              <div
                className="flex h-10 w-full max-w-xs items-end justify-center gap-1"
                aria-hidden
                data-junior-mic-wave=""
              >
                {bars.map((height, index) => (
                  <span
                    key={index}
                    className={`w-2 rounded-full transition-[height] duration-75 ${
                      recording
                        ? "bg-[var(--emerald)] shadow-[0_0_8px_color-mix(in_srgb,var(--emerald)_70%,transparent)]"
                        : "bg-[color-mix(in_srgb,var(--rose)_55%,var(--safir))]"
                    }`}
                    style={{ height: `${recording ? height : 18 + (index % 4) * 10}%` }}
                  />
                ))}
              </div>
              {recordingGate === "open" ? (
                <button
                  type="button"
                  data-junior-mic-record=""
                  disabled={sending}
                  onClick={() => {
                    if (recording) {
                      finishRecording();
                      return;
                    }
                    void startRecording();
                  }}
                  className={`flex h-20 w-20 cursor-pointer items-center justify-center rounded-full text-3xl text-white transition-transform duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${
                    recording
                      ? "scale-105 bg-[var(--emerald)] shadow-[0_0_0_6px_color-mix(in_srgb,var(--emerald)_35%,transparent),0_0_28px_color-mix(in_srgb,var(--emerald)_55%,transparent)]"
                      : "bg-[var(--rose)] shadow-[0_0_0_6px_color-mix(in_srgb,var(--rose)_35%,transparent),0_0_28px_color-mix(in_srgb,var(--rose)_55%,transparent)] hover:scale-105"
                  }`}
                  aria-label={micLabel}
                >
                  {recording ? "⏹" : "🎙️"}
                </button>
              ) : (
                <span className="min-w-0 text-center text-xs text-[var(--muted)]">
                  {JUNIOR_PAID_ACTION_ERROR}
                </span>
              )}
              <p className="text-center text-sm font-bold text-[var(--safir-deep)]">{micLabel}</p>
              {recording ? (
                <p className="text-center text-xs text-[var(--muted)]">
                  {seconds} sn · en az {JUNIOR_TELL_MIN_SEC}, en fazla {JUNIOR_TELL_MAX_SEC}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {recordingGate === "open" && !showMicDeck ? (
            <Button type="button" size="sm" onClick={() => void startRecording()} disabled={sending}>
              Şimdi Sen Anlat
            </Button>
          ) : null}
          {quizSlot === "ready" && hasQuiz ? (
            <QuizGate
              tellPassed={tellPassed}
              quizDone={quizDone}
              score={feedback?.score ?? null}
              onOpenQuiz={onOpenQuiz}
            />
          ) : null}
          {quizSlot === "preparing" ? (
            <span className="text-xs font-semibold">{JUNIOR_QUIZ_PREPARING_LABEL}</span>
          ) : null}
          {quizSlot === "locked" && recordingGate === "open" ? (
            <span className="min-w-0 text-xs text-[var(--muted)]">{JUNIOR_PAID_ACTION_ERROR}</span>
          ) : null}
        </div>
      </div>
      {showBand ? (
        <div className="grid min-h-0 content-start gap-2 overflow-y-auto">
          {sending ? <p className="text-sm">Dinleniyor. Ses saklanmaz.</p> : null}
          {note ? <p className="text-sm text-[var(--rose)]">{note}</p> : null}
          {feedback ? (
            <div className="grid gap-2">
              <article className="rounded-xl bg-[var(--emerald-soft)] p-2">
                <h3 className="text-sm font-semibold">Harika Anlattın</h3>
                <p className="mt-0.5 text-sm">{feedback.praised}</p>
              </article>
              <article className="rounded-xl bg-[var(--amber-soft)] p-2">
                <h3 className="text-sm font-semibold">Eksik Kalan Nokta</h3>
                <p className="mt-0.5 text-sm">{feedback.missing}</p>
              </article>
              <article className="rounded-xl bg-[var(--safir-soft)] p-2">
                <h3 className="text-sm font-semibold">Geliştirme Tavsiyesi</h3>
                <p className="mt-0.5 text-sm">{feedback.advice}</p>
              </article>
              <p className="text-sm">
                Kazanım puanı: {feedback.xpAwarded}. Toplam oyun puanı: {feedback.points}. Bu puan cüzdan değildir.
              </p>
            </div>
          ) : null}
          {trailing}
        </div>
      ) : null}
    </section>
  );
}

function QuizGate({
  tellPassed,
  quizDone,
  score,
  onOpenQuiz,
}: {
  tellPassed: boolean;
  quizDone: boolean;
  score: number | null;
  onOpenQuiz?: () => void;
}) {
  const canOpen = tellPassed || (score !== null && score >= JUNIOR_TELL_PASS_SCORE);
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={canOpen ? "primary" : "outline"}
        disabled={!canOpen}
        onClick={() => onOpenQuiz?.()}
      >
        Konu Testini Çöz
      </Button>
      {quizDone ? <span className="text-xs font-semibold">Bu ders tamamlandı.</span> : null}
      {canOpen ? null : (
        <span className="min-w-0 text-xs text-[var(--muted)]">
          {score !== null
            ? "Konu testi kilitli. Geliştirme tavsiyesine bak ve yeniden anlat."
            : "Konu testi kilitli. Önce dinle, sonra kendi sözünle anlat."}
        </span>
      )}
    </>
  );
}
