"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { JUNIOR_TELL_MAX_SEC, JUNIOR_TELL_MIN_SEC, JUNIOR_TELL_PATH } from "@/lib/junior/limits";
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
  title: string;
  script: string;
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

export function ListenAndTell({ profileId, lessonKey, title, script }: ListenAndTellProps) {
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: 12 }, () => 12));
  const [seconds, setSeconds] = useState(0);
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [writeMode, setWriteMode] = useState(false);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef(0);
  const timerRef = useRef(0);
  const startedRef = useRef(0);
  const chunksRef = useRef<Blob[]>([]);

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

  useEffect(() => {
    return () => {
      stopMeters();
      recorderRef.current = null;
      chunksRef.current = [];
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speak() {
    if (!window.speechSynthesis) {
      setNote("Bu tarayıcı sesli okuyamıyor. Metni birlikte okuyun.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = "tr-TR";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

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
    } catch {
      setNote("Ses gönderilemedi. Yazarak anlatabilirsin.");
      setWriteMode(true);
    } finally {
      audioBase64 = "";
      chunksRef.current = [];
      setSending(false);
    }
  }

  async function startRecording() {
    setFeedback(null);
    setNote("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setWriteMode(true);
      setNote("Mikrofon yok. Yazarak anlat.");
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
      setWriteMode(true);
      setNote("Mikrofon izni yok. Yazarak anlat.");
    }
  }

  function finishRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  }

  async function sendText() {
    const trimmed = text.trim();
    if (trimmed.length < 20) {
      setNote("En az bir kısa cümle yaz.");
      return;
    }
    setSending(true);
    setNote("");
    try {
      const response = await fetch(
        JUNIOR_TELL_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            profileId,
            lessonKey,
            mode: "write",
            text: trimmed,
          }),
        }),
      );
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string | null;
        data?: Feedback;
      } | null;
      if (!response.ok || !body?.data) {
        setNote(body?.error || "Yazı gönderilemedi.");
        return;
      }
      setFeedback(body.data);
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="junior-quest rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">Dinle ve Anlat</p>
      <h2 className="mt-1 text-xl font-semibold">{title}</h2>
      <p className="mt-3 text-base leading-7">{script}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={speak}>
          Dinle
        </Button>
        {recording ? (
          <Button type="button" onClick={finishRecording}>
            Anlatmayı bitir
          </Button>
        ) : (
          <Button type="button" onClick={() => void startRecording()} disabled={sending}>
            Şimdi sen anlat
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => setWriteMode((open) => !open)}>
          Yazarak anlat
        </Button>
      </div>
      {recording ? (
        <div className="mt-4" aria-live="polite">
          <p className="text-sm font-semibold">Şimdi Sen Anlat</p>
          <div className="mt-2 flex h-16 items-end gap-1" aria-hidden>
            {bars.map((height, index) => (
              <span
                key={index}
                className="w-2 rounded-full bg-[var(--safir)]"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {seconds} sn · en az {JUNIOR_TELL_MIN_SEC}, en fazla {JUNIOR_TELL_MAX_SEC}
          </p>
        </div>
      ) : null}
      {writeMode ? (
        <div className="mt-4">
          <label className="text-sm font-medium" htmlFor="junior-write">
            Yazarak anlat
          </label>
          <textarea
            id="junior-write"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={600}
            rows={4}
            className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2"
            placeholder="Güneş bir yıldızdır. Dünya bir gezegendir."
          />
          <Button type="button" className="mt-2" onClick={() => void sendText()} disabled={sending}>
            Yazıyı gönder
          </Button>
        </div>
      ) : null}
      {sending ? <p className="mt-3 text-sm">Dinleniyor. Ses saklanmaz.</p> : null}
      {note ? <p className="mt-3 text-sm text-[var(--rose)]">{note}</p> : null}
      {feedback ? (
        <div className="mt-4 grid gap-3">
          <article className="rounded-2xl bg-[var(--emerald-soft)] p-3">
            <h3 className="text-sm font-semibold">Harika Anlattın</h3>
            <p className="mt-1 text-sm">{feedback.praised}</p>
          </article>
          <article className="rounded-2xl bg-[var(--amber-soft)] p-3">
            <h3 className="text-sm font-semibold">Eksik Kalan Nokta</h3>
            <p className="mt-1 text-sm">{feedback.missing}</p>
          </article>
          <article className="rounded-2xl bg-[var(--safir-soft)] p-3">
            <h3 className="text-sm font-semibold">Geliştirme Tavsiyesi</h3>
            <p className="mt-1 text-sm">{feedback.advice}</p>
          </article>
          <p className="text-sm">
            Kazanım puanı: {feedback.xpAwarded}. Toplam oyun puanı: {feedback.points}. Bu puan cüzdan değildir.
          </p>
        </div>
      ) : null}
    </section>
  );
}
