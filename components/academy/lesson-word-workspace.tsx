"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { AcademyCinemaCueSlide } from "@/lib/academy/cinema-cue-catalog";
import {
  ACADEMY_EXCEL_FOCUS_ZOOM_SCALE,
  academyExcelFocusZoomActive,
} from "@/lib/academy/excel-focus-zoom";
import { academyExcelMouseState } from "@/lib/academy/excel-mouse-pointer";
import type { AcademyVisualExcelPane } from "@/lib/academy/excel-workspace";
import { academyPocketChecklistSteps } from "@/lib/academy/lesson-beat-visual";
import { academyOutlookAlignBox } from "@/lib/academy/outlook-workspace";
import { applyAcademyOfficeWinFit } from "@/lib/academy/office-win-fit";
import {
  ACADEMY_WORD_CLAUSE_CARDS,
  ACADEMY_WORD_COPY_FRAGMENTS,
  ACADEMY_WORD_FILE_NAME,
  ACADEMY_WORD_WINDOW_TITLE,
  academyWordStageKind,
} from "@/lib/academy/word-workspace";
import { LessonAiDesk, LessonOfficeCopilotRibbon, useAcademyAiDeskTab } from "@/components/academy/lesson-ai-desk";

/** Kart yığını sahnenin ortasında kalsın; sağa kayan origin sol kenarı keser. */
const ACADEMY_WORD_FOCUS_ORIGIN = "48% 42%";

function boxStyle(box: { left: number; top: number; width: number; height: number }) {
  return {
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  };
}

export function LessonWordWorkspace({
  slide,
  pane,
  focusZoom,
  currentTime,
}: {
  slide: AcademyCinemaCueSlide;
  pane: AcademyVisualExcelPane;
  focusZoom?: boolean;
  currentTime?: number;
}) {
  const deskRef = useRef<HTMLDivElement | null>(null);
  const fitRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const originRef = useRef<HTMLElement | null>(null);
  const [alignBox, setAlignBox] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const mouse =
    (pane === "live" || pane === "after") && typeof currentTime === "number"
      ? academyExcelMouseState(slide.lessonKey, currentTime)
      : null;
  const highlight = mouse?.cell ?? slide.highlightCell ?? "A1";
  const liveFocusZoom =
    pane === "live" &&
    (focusZoom === true || academyExcelFocusZoomActive(slide.lessonKey, currentTime ?? 0));
  const pocketSteps = academyPocketChecklistSteps(slide.lessonKey, slide.section);
  const isPocketChecklist = pocketSteps != null;
  const compact = pane !== "live";
  const aiDesk = useAcademyAiDeskTab({
    lessonKey: slide.lessonKey,
    cueIndex: slide.cueIndex,
    currentTime,
  });
  const stage = academyWordStageKind({
    pane,
    section: slide.section,
    hideReply: slide.copilot?.hideReply,
  });
  const copyMode = stage === "copy";
  const uploadMode = stage === "attach" || stage === "analysis";
  const analysisMode = stage === "analysis";
  const originKey = `${highlight}:${slide.section}:${pane}`;

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const desk = deskRef.current;
    const fit = fitRef.current;
    if (!wrap || !desk || !fit) {
      return;
    }
    const measure = () => {
      applyAcademyOfficeWinFit(desk, fit);
      const origin =
        originRef.current ?? wrap.querySelector<HTMLElement>("[data-academy-word-origin]");
      if (!origin) {
        setAlignBox(null);
        return;
      }
      const layout = {
        offsetWidth: wrap.offsetWidth,
        offsetHeight: wrap.offsetHeight,
        scrollLeft: wrap.scrollLeft,
        scrollTop: wrap.scrollTop,
      };
      const wrapRect = wrap.getBoundingClientRect();
      setAlignBox(academyOutlookAlignBox(origin.getBoundingClientRect(), wrapRect, layout));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(desk);
    observer.observe(wrap);
    const origin = originRef.current;
    if (origin) {
      observer.observe(origin);
    }
    wrap.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      wrap.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [originKey, liveFocusZoom, compact, copyMode]);

  const deskClass = [
    "academy-excel-desk",
    "academy-excel-desk--word",
    "academy-outlook-desk",
    "academy-word-desk",
    pane === "live" ? "academy-outlook-desk--live" : "",
    pane === "before" ? "academy-outlook-desk--before" : "",
    pane === "after" ? "academy-outlook-desk--after" : "",
    liveFocusZoom ? "academy-outlook-desk--focus-zoom" : "",
    copyMode ? "academy-word-desk--copy" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={deskRef}
      className={deskClass}
      data-academy-word-live=""
      data-academy-word-pane={pane}
      data-academy-office-app="word"
      data-academy-word-copy={copyMode ? "true" : undefined}
      data-academy-excel-active-cell={highlight}
      data-academy-excel-focus-zoom={pane === "live" ? (liveFocusZoom ? "in" : "out") : undefined}
      data-academy-ai-desk-tab={slide.copilot && !compact ? aiDesk.tab : undefined}
      style={
        pane === "live"
          ? {
              ["--academy-outlook-focus-scale" as string]: liveFocusZoom
                ? String(ACADEMY_EXCEL_FOCUS_ZOOM_SCALE)
                : 1,
              ["--academy-outlook-focus-origin" as string]: ACADEMY_WORD_FOCUS_ORIGIN,
            }
          : undefined
      }
    >
      <div className="academy-office-win-fit" ref={fitRef} data-academy-office-win-fit="">
      <div className="academy-outlook-win academy-word-win">
        <div className="academy-outlook-titlebar">
          <i aria-hidden />
          <b>{copyMode ? "ChatGPT" : ACADEMY_WORD_WINDOW_TITLE}</b>
          <span>
            {copyMode ? "Parça parça yapıştırma" : (slide.fileName ?? ACADEMY_WORD_FILE_NAME)}
          </span>
        </div>
        {compact ? null : (
          <div className="academy-outlook-ribbon" aria-hidden>
            <span className="on">{copyMode ? "Ctrl+C" : "Ataş"}</span>
            <span>{copyMode ? "Sayfa 4" : "Yükle"}</span>
            {slide.copilot && uploadMode ? (
              <LessonOfficeCopilotRibbon active={aiDesk.tab === "copilot"} host="word" />
            ) : null}
          </div>
        )}
        <div
          className={`academy-outlook-body academy-outlook-body--word${slide.copilot && !compact && uploadMode ? " academy-outlook-body--copilot" : ""}`}
        >
          <div className="academy-outlook-canvas-wrap" ref={wrapRef}>
            <article
              className="academy-outlook-canvas academy-outlook-canvas--compact"
              data-academy-word-canvas=""
              data-academy-fix={compact ? "162719" : undefined}
            >
              {copyMode ? (
                <div className="academy-word-copy" data-academy-word-copy-panel="">
                  <p className="academy-gmail-carry-badge">ZAHMETLİ YOL</p>
                  <div className="academy-outlook-list">
                    {ACADEMY_WORD_COPY_FRAGMENTS.map((frag) => {
                      const isOrigin = frag.cell === highlight;
                      return (
                        <button
                          key={frag.id}
                          type="button"
                          className={`academy-outlook-row${isOrigin ? " on" : ""} unread`}
                          data-academy-word-origin={isOrigin ? "" : undefined}
                          data-academy-excel-active-cell={frag.cell}
                          ref={isOrigin ? (el) => { originRef.current = el; } : undefined}
                        >
                          <b>{frag.page}</b>
                          <strong>{frag.text}</strong>
                          <em>Bağlam kopuk · Ctrl+C</em>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="academy-outlook-reset academy-word-clause-stack" data-academy-word-upload="">
                  <p className="academy-word-attach-chip" data-academy-attach="" data-academy-word-origin="">
                    Ataş · {slide.fileName ?? ACADEMY_WORD_FILE_NAME}
                  </p>
                  {analysisMode ? (
                    ACADEMY_WORD_CLAUSE_CARDS.map((card) => {
                      const isOrigin = card.cell === highlight;
                      return (
                        <article
                          key={card.id}
                          className={`academy-outlook-group academy-outlook-group--${card.tone}${isOrigin ? " on" : ""}`}
                          data-academy-word-origin={isOrigin ? "" : undefined}
                          data-academy-excel-active-cell={card.cell}
                          ref={isOrigin ? (el) => { originRef.current = el; } : undefined}
                        >
                          <span className="academy-outlook-group-mark" aria-hidden>
                            {card.mark}
                          </span>
                          <div className="academy-outlook-group-copy">
                            <p className="academy-outlook-group-label">{card.label}</p>
                            <strong className="academy-outlook-group-title">{card.title}</strong>
                            <em className="academy-outlook-group-detail">{card.detail}</em>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <p className="academy-word-spoiler" data-academy-word-spoiler="">
                      Maddeler · Spoiler yok
                    </p>
                  )}
                </div>
              )}
              {alignBox ? (
                <div
                  className="academy-outlook-active-border"
                  data-academy-excel-active-cell-border=""
                  style={boxStyle(alignBox)}
                  aria-hidden
                />
              ) : null}
            </article>
          </div>
          {slide.copilot && !compact && uploadMode ? (
            <LessonAiDesk
              prompt={slide.copilot.prompt}
              currentTime={currentTime}
              lessonKey={slide.lessonKey}
              cueIndex={slide.cueIndex}
              host="word"
              hideReply={slide.copilot.hideReply}
              replyLines={slide.copilot.replyLines}
              tab={aiDesk.tab}
              onTabChange={aiDesk.setTab}
              phase={aiDesk.phase}
            />
          ) : null}
        </div>
      </div>
      </div>
      {isPocketChecklist && pocketSteps && pane === "live" ? (
        <div className="academy-excel-checklist" data-academy-checklist-overlay="cebine-koy">
          <p className="academy-excel-checklist-title">CEBİNE KOY · 3 adım</p>
          <ol>
            {pocketSteps.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
