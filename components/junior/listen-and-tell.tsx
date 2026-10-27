"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { JuniorAccountGate } from "@/components/junior/account-gate-modal";
import { VectorPlayer } from "@/components/junior/vector-player";
import { Button } from "@/components/ui/button";
import {
  JUNIOR_QUIZ_PREPARING_LABEL,
  JUNIOR_TELL_MAX_SEC,
  JUNIOR_TELL_MIN_SEC,
  JUNIOR_TELL_PASS_SCORE,
  JUNIOR_TELL_PATH,
  JUNIOR_TEXT_MAX,
  JUNIOR_TEXT_MIN,
  isJuniorPilotTrialLesson,
  juniorPaidActionError,
  juniorQuizControlLabel,
} from "@/lib/junior/limits";
import {
  hasUsedJuniorTrialTell,
  markJuniorTrialTellUsed,
} from "@/lib/junior/progress-tracker";
import { endJuniorSpeech } from "@/lib/junior/speech";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";
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
  quizCount?: number;
  /** «Hazırım, Sana Anlatayım!» yönlendirme kontrol soruları. */
  tellGuides?: readonly string[];
  recording?: "open" | "locked";
  quizSlot?: "ready" | "preparing" | "locked";
  tellPassed?: boolean;
  quizDone?: boolean;
  onScored?: (feedback: Feedback) => void;
  onOpenQuiz?: () => void;
  trailing?: ReactNode;
  grantedAudioUrl?: string | null;
  grantedWarmupUrl?: string | null;
  lockPublicMedia?: boolean;
  /** Senaryodaki özgün mikro soru. Yıldız paneli bunu basar. */
  microQuestion?: string;
  accountGate?: JuniorAccountGate;
  onNeedAccount?: () => void;
  pilotTimeline?: TimelineJSON | null;
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
  quizCount,
  tellGuides = [],
  recording: recordingGate = "open",
  quizSlot = "ready",
  tellPassed = false,
  quizDone = false,
  onScored,
  onOpenQuiz,
  trailing,
  grantedAudioUrl = null,
  grantedWarmupUrl = null,
  lockPublicMedia = false,
  microQuestion = "",
  accountGate = "ready",
  onNeedAccount,
  pilotTimeline,
}: ListenAndTellProps) {
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: 12 }, () => 12));
  const [seconds, setSeconds] = useState(0);
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [trialTellDone, setTrialTellDone] = useState(false);
  const [tellMode, setTellMode] = useState<"speak" | "write">("speak");
  const [writtenText, setWrittenText] = useState("");
  const isPilotTrial = isJuniorPilotTrialLesson(lessonKey) && !profileId;
  const paidActionError = juniorPaidActionError(quizCount);
  const quizLabel = juniorQuizControlLabel(quizCount);
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
    if (isPilotTrial) {
      setTrialTellDone(hasUsedJuniorTrialTell(profileId, lessonKey));
    }
  }, [isPilotTrial, lessonKey, profileId]);

  useEffect(() => {
    return () => {
      stopMeters();
      recorderRef.current = null;
      chunksRef.current = [];
      endJuniorSpeech();
      window.speechSynthesis?.cancel();
    };
  }, []);

  function blockedByAccount(): boolean {
    if (accountGate === "ready") {
      return false;
    }
    onNeedAccount?.();
    return true;
  }

  async function sendClip(blob: Blob, durationSec: number, mimeType: string) {
    if (blockedByAccount()) {
      return;
    }
    setSending(true);
    setNote("");
    let audioBase64 = "";
    try {
      audioBase64 = await blobToBase64(blob);
      if (profileId) {
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
        if (response.ok && body?.data) {
          setFeedback(body.data);
          onScored?.(body.data);
          return;
        }
        if (!isJuniorPilotTrialLesson(lessonKey) || hasUsedJuniorTrialTell(profileId, lessonKey)) {
          setNote(body?.error || "Şu an dinleyemedim. Biraz sonra yeniden dene.");
          return;
        }
      }

      if (isJuniorPilotTrialLesson(lessonKey)) {
        if (hasUsedJuniorTrialTell(profileId, lessonKey)) {
          setTrialTellDone(true);
          setNote("Ücretsiz 1 defalık deneme hakkını kullandın. Sınırsız anlatış için veli girişi ve paket gerekir.");
          return;
        }
        const trialResponse = await fetch("/api/junior/live-tutor", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            trialMode: "tell",
            lessonKey,
            audioBase64,
            mimeType,
            durationSec,
          }),
        });
        const trialBody = (await trialResponse.json().catch(() => null)) as {
          ok?: boolean;
          error?: string | null;
          data?: Feedback;
        } | null;
        if (!trialResponse.ok || !trialBody?.data) {
          setNote(trialBody?.error || "Şu an dinleyemedim. Biraz sonra yeniden dene.");
          return;
        }
        markJuniorTrialTellUsed(profileId, lessonKey);
        setTrialTellDone(true);
        setFeedback(trialBody.data);
        onScored?.(trialBody.data);
        return;
      }

      setNote(paidActionError);
    } catch {
      setNote("Ses gönderilemedi. Biraz sonra yeniden dene.");
    } finally {
      audioBase64 = "";
      chunksRef.current = [];
      setSending(false);
    }
  }

  async function sendWrittenTell() {
    if (blockedByAccount()) {
      return;
    }
    const clean = writtenText.trim();
    if (clean.length < JUNIOR_TEXT_MIN || clean.length > JUNIOR_TEXT_MAX) {
      setNote("Yazarak anlatış en az bir kısa cümle, en fazla bir paragraf olsun.");
      return;
    }
    setSending(true);
    setNote("");
    try {
      if (profileId) {
        const response = await fetch(
          JUNIOR_TELL_PATH,
          withRailApiVersion({
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              profileId,
              lessonKey,
              mode: "write",
              text: clean,
            }),
          }),
        );
        const body = (await response.json().catch(() => null)) as {
          ok?: boolean;
          error?: string | null;
          data?: Feedback;
        } | null;
        if (response.ok && body?.data) {
          setFeedback(body.data);
          onScored?.(body.data);
          return;
        }
        if (!isJuniorPilotTrialLesson(lessonKey) || hasUsedJuniorTrialTell(profileId, lessonKey)) {
          setNote(body?.error || "Şu an değerlendiremedim. Biraz sonra yeniden dene.");
          return;
        }
      }

      if (isJuniorPilotTrialLesson(lessonKey)) {
        if (hasUsedJuniorTrialTell(profileId, lessonKey)) {
          setTrialTellDone(true);
          setNote("Ücretsiz 1 defalık deneme hakkını kullandın. Sınırsız anlatış için veli girişi ve paket gerekir.");
          return;
        }
        const trialResponse = await fetch("/api/junior/live-tutor", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            trialMode: "tell",
            lessonKey,
            mode: "write",
            text: clean,
          }),
        });
        const trialBody = (await trialResponse.json().catch(() => null)) as {
          ok?: boolean;
          error?: string | null;
          data?: Feedback;
        } | null;
        if (!trialResponse.ok || !trialBody?.data) {
          setNote(trialBody?.error || "Şu an değerlendiremedim. Biraz sonra yeniden dene.");
          return;
        }
        markJuniorTrialTellUsed(profileId, lessonKey);
        setTrialTellDone(true);
        setFeedback(trialBody.data);
        onScored?.(trialBody.data);
        return;
      }

      setNote(paidActionError);
    } catch {
      setNote("Yazılı anlatış gönderilemedi. Biraz sonra yeniden dene.");
    } finally {
      setSending(false);
    }
  }

  async function startRecording() {
    if (blockedByAccount()) {
      return;
    }
    // Önce kaset/Speech kanalını bırak (oynuyor veya pause); sonra mikrofon.
    releasePlayerAudio();
    setFeedback(null);
    setNote("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setTellMode("write");
      setTellArmed(true);
      setNote("Mikrofon algılanmadı. Dersi aşağıdaki kutuya yazarak anlatabilirsin.");
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
      setTellMode("write");
      setTellArmed(true);
      setNote("Mikrofon izni kapalı. Dersi aşağıdaki kutuya yazarak anlatabilirsin.");
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
    if (blockedByAccount()) {
      return;
    }
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

  const showMicDeck = cassetteComplete || tellArmed || recording || sending || tellMode === "write";
  const micLabel = recording
    ? "Anlatmayı Bitir"
    : sending
      ? "Dinleniyor…"
      : "Anlatmaya Başla / Kaydı Başlat";

  return (
    <section
      aria-label={title}
      className="junior-quest flex h-full min-h-0 w-full flex-1 flex-col gap-1 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-card)]"
    >
      {/* Sahne kalan viewport yüksekliğini alır; kontrol çubuğu kartın altında kalır. */}
      <div className="flex min-h-0 w-full flex-1 flex-col" data-junior-stage-full={tellArmed ? "true" : undefined}>
        <VectorPlayer
          fill
          scene={scene}
          mebNote={mebNote}
          lifeUse={lifeUse}
          steps={steps}
          lessonKey={lessonKey}
          profileId={profileId}
          nickname={nickname}
          narration={script}
          grantedAudioUrl={grantedAudioUrl}
          grantedWarmupUrl={grantedWarmupUrl}
          lockPublicMedia={lockPublicMedia}
          microQuestion={microQuestion}
          pilotTimeline={pilotTimeline}
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
        className={`flex shrink-0 flex-col gap-1 border-t border-[var(--border)] pt-1 outline-none transition-[box-shadow] duration-300 ${
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
            {isPilotTrial ? (
              <p
                data-junior-pilot-trial-badge=""
                className="mb-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-900"
              >
                {trialTellDone
                  ? "✓ 1 Defalık Ücretsiz Deneme Anlatışı Tamamlandı"
                  : "🎁 1 Defalık Ücretsiz Deneme Hakkı — Selim Öğretmen Seni Dinleyecek"}
              </p>
            ) : null}
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
            <div className="mt-2 flex items-center justify-center gap-2" role="tablist" aria-label="Anlatış yöntemi">
              <button
                type="button"
                role="tab"
                aria-selected={tellMode === "speak"}
                data-junior-tell-mode="speak"
                onClick={() => setTellMode("speak")}
                className={`rounded-full px-3 py-1 text-xs font-extrabold transition ${
                  tellMode === "speak"
                    ? "bg-[var(--rose)] text-white shadow-sm"
                    : "border border-[var(--border)] bg-white text-[var(--safir-deep)]"
                }`}
              >
                🎙️ Sesle Anlat
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tellMode === "write"}
                data-junior-tell-mode="write"
                onClick={() => {
                  if (recording) {
                    finishRecording();
                  }
                  setTellMode("write");
                }}
                className={`rounded-full px-3 py-1 text-xs font-extrabold transition ${
                  tellMode === "write"
                    ? "bg-[var(--safir)] text-white shadow-sm"
                    : "border border-[var(--border)] bg-white text-[var(--safir-deep)]"
                }`}
              >
                ✍️ Yazarak Anlat
              </button>
            </div>
            {tellMode === "write" ? (
              <div className="mt-3 flex flex-col gap-2" data-junior-write-stage="">
                <textarea
                  value={writtenText}
                  onChange={(event) => setWrittenText(event.target.value)}
                  disabled={sending || recordingGate !== "open" || (isPilotTrial && trialTellDone)}
                  rows={3}
                  maxLength={JUNIOR_TEXT_MAX}
                  placeholder="Öğrendiklerini kendi cümlelerinle buraya yazabilirsin (en az 1 kısa cümle)…"
                  data-junior-tell-textarea=""
                  className="w-full rounded-xl border border-[var(--border)] bg-white p-2.5 text-sm text-slate-900 outline-none focus:border-[var(--safir)]"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[var(--muted)]">
                    {writtenText.trim().length} / {JUNIOR_TEXT_MAX} karakter (en az {JUNIOR_TEXT_MIN})
                  </span>
                  {recordingGate === "open" && !(isPilotTrial && trialTellDone) ? (
                    <Button
                      type="button"
                      size="sm"
                      data-junior-tell-write-submit=""
                      disabled={sending || writtenText.trim().length < JUNIOR_TEXT_MIN}
                      onClick={() => void sendWrittenTell()}
                    >
                      {sending ? "Değerlendiriliyor…" : "Yazılı Anlatışı Gönder"}
                    </Button>
                  ) : (
                    <span className="text-xs text-[var(--muted)]">
                      {isPilotTrial && trialTellDone
                        ? `Ücretsiz deneme anlatışını tamamladın. Şimdi ${quizLabel} testini ücretsiz çözebilirsin.`
                        : paidActionError}
                    </span>
                  )}
                </div>
              </div>
            ) : (
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
                {recordingGate === "open" && !(isPilotTrial && trialTellDone) ? (
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
                    {isPilotTrial && trialTellDone
                      ? `Ücretsiz deneme anlatışını tamamladın. Şimdi ${quizLabel} testini ücretsiz çözebilirsin.`
                      : paidActionError}
                  </span>
                )}
                <p className="text-center text-sm font-bold text-[var(--safir-deep)]">{micLabel}</p>
                {recording ? (
                  <p className="text-center text-xs text-[var(--muted)]">
                    {seconds} sn · en az {JUNIOR_TELL_MIN_SEC}, en fazla {JUNIOR_TELL_MAX_SEC}
                  </p>
                ) : null}
              </div>
            )}
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
              accountPrompt={accountGate !== "ready"}
              guestTrial={isPilotTrial}
              quizLabel={quizLabel}
            />
          ) : null}
          {quizSlot === "preparing" ? (
            <span className="text-xs font-semibold">{JUNIOR_QUIZ_PREPARING_LABEL}</span>
          ) : null}
          {quizSlot === "locked" && recordingGate === "open" ? (
            <span className="min-w-0 text-xs text-[var(--muted)]">{paidActionError}</span>
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
  accountPrompt = false,
  guestTrial = false,
  quizLabel,
}: {
  tellPassed: boolean;
  quizDone: boolean;
  score: number | null;
  onOpenQuiz?: () => void;
  accountPrompt?: boolean;
  /** Misafir pilot: üyelik penceresi olmadan bir kez açılır. */
  guestTrial?: boolean;
  quizLabel: string;
}) {
  const canOpen = guestTrial || accountPrompt || tellPassed || (score !== null && score >= JUNIOR_TELL_PASS_SCORE);
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={canOpen ? "primary" : "outline"}
        disabled={!canOpen}
        onClick={() => onOpenQuiz?.()}
      >
        {quizLabel}
      </Button>
      {quizDone ? <span className="text-xs font-semibold">Bu ders tamamlandı.</span> : null}
      {canOpen ? null : (
        <span className="min-w-0 text-xs text-[var(--muted)]">
          {score !== null
            ? "Hızlı konu kontrolü kilitli. Geliştirme tavsiyesine bak ve yeniden anlat."
            : "Hızlı konu kontrolü kilitli. Önce dinle, sonra kendi sözünle anlat."}
        </span>
      )}
    </>
  );
}
