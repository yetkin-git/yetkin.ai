"use client";

import { useEffect, useMemo, useState } from "react";
import { AcademyMarkdownRenderer } from "@/components/academy/academy-markdown-renderer";
import { LessonCinemaEyeLayer } from "@/components/academy/lesson-visual-stage";
import { LessonMediaPlayer } from "@/components/academy/lesson-media-player";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyLessonBedPlaybackSrc } from "@/lib/academy/lesson-audio";
import { loadAcademyLessonVisualStage } from "@/lib/academy/lesson-visual-stage";
import {
  academyPrepStripPlayerLayer,
  isAcademyPrepStripKaraokeLayer,
  type AcademyPrepStrip,
} from "@/lib/academy/prep-strip";

export function PrepStripPanel({
  strip,
  done,
  courseSlug,
}: {
  strip: AcademyPrepStrip;
  done: boolean;
  courseSlug: string;
}) {
  const copy = ACADEMY_SEN.outline;
  const [mounted, setMounted] = useState(false);
  const [mediaElapsed, setMediaElapsed] = useState(0);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMediaElapsed(0);
    setMediaPlaying(false);
  }, [strip.key]);

  const layer = useMemo(() => academyPrepStripPlayerLayer(courseSlug), [courseSlug]);
  const karaoke = isAcademyPrepStripKaraokeLayer(layer) ? layer : null;
  const eyeStage = karaoke ? loadAcademyLessonVisualStage(karaoke.lessonKey) : null;
  // Dip müzik: şerit fırını 1. ders bed'ini reuse eder (yeni Lyria çağrısı yok).
  const bedSrc = useMemo(
    () => (karaoke ? academyLessonBedPlaybackSrc(courseSlug, "01_office_ai-1") : undefined),
    [karaoke, courseSlug],
  );

  return (
    <>
      {karaoke ? (
        <section
          className="academy-player-karaoke academy-cinema-stage mt-0 overflow-visible bg-transparent pt-0"
          data-academy-karaoke="prep-strip"
          data-academy-media="prep-strip-audio"
          data-academy-canvas="full"
          data-academy-directing="punchcard"
          data-academy-player-stack="visual-karaoke-transport"
        >
          {eyeStage ? (
            <LessonCinemaEyeLayer
              stage={eyeStage}
              currentTime={mediaElapsed}
              playing={mediaPlaying}
              captions={false}
              karaokeCues={karaoke.cues}
            />
          ) : null}
          <LessonMediaPlayer
            key={karaoke.lessonKey}
            courseSlug={courseSlug}
            lessonKey={karaoke.lessonKey}
            lessonTitle={strip.title}
            autoStart={false}
            audioSrcOverride={karaoke.audioSrc}
            bedSrcOverride={bedSrc}
            sealedDurationSecOverride={karaoke.durationSec}
            onSpokenElapsedChange={setMediaElapsed}
            onPlayingChange={setMediaPlaying}
          />
        </section>
      ) : null}
      <section
        className="academy-player-study min-h-[18rem] overflow-y-auto rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]"
        data-academy-prep-article=""
        data-academy-prep-done={mounted && done ? "true" : undefined}
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 sm:px-8">
          <span className="inline-flex rounded-full bg-[var(--safir-soft)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
            {strip.badge}
          </span>
          <p className="text-[13px] text-slate-600">
            {copy.prepKind} · {copy.durationMin(strip.estimatedMinutes)} · sınav yoluna girmez
          </p>
        </div>
        <article className="academy-lesson-article px-5 py-6 text-[16.5px] leading-[1.85] text-slate-900 sm:px-8 sm:py-8">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">{strip.title}</h2>
          <AcademyMarkdownRenderer content={strip.contentMarkdown} tone="document" className="select-text" />
        </article>
      </section>
    </>
  );
}
