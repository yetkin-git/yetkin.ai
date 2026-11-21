"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { AcademyCinemaCueSlide } from "@/lib/academy/cinema-cue-catalog";
import { LessonSlideWorkspace } from "@/components/academy/lesson-slide-workspace";
import {
  ACADEMY_EXCEL_FOCUS_ZOOM_SCALE,
  academyExcelFocusZoomActive,
  academyExcelFocusZoomTarget,
} from "@/lib/academy/excel-focus-zoom";
import { academyExcelMouseState } from "@/lib/academy/excel-mouse-pointer";
import type { AcademyVisualExcelPane } from "@/lib/academy/excel-workspace";
import { academyPocketChecklistSteps } from "@/lib/academy/lesson-beat-visual";
import {
  ACADEMY_PPTX_FILE_LABEL,
  ACADEMY_PPTX_FILE_NAME,
  academyPptxAlignBox,
  academyPptxDumpLines,
  academyPptxDumpMode,
  academyPptxElementForCell,
  academyPptxFullBleedCanvas,
} from "@/lib/academy/pptx-workspace";
import { academyCitizenOfficeFileLabel } from "@/lib/academy/prompt-console";
import { academyOfficeFocusOriginCss, applyAcademyOfficeWinFit } from "@/lib/academy/office-win-fit";
import { LessonAiDesk, LessonOfficeCopilotRibbon, useAcademyAiDeskTab } from "@/components/academy/lesson-ai-desk";

function boxStyle(box: { left: number; top: number; width: number; height: number }) {
  return {
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  };
}

export function LessonPptxWorkspace({
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
  const [focusOrigin, setFocusOrigin] = useState("0% 0%");

  const mouse =
    (pane === "live" || pane === "after") && typeof currentTime === "number"
      ? academyExcelMouseState(slide.lessonKey, currentTime)
      : null;
  const highlight = mouse?.cell ?? slide.highlightCell ?? "A1";
  const activeElement = academyPptxElementForCell(highlight);
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
  const dumpMode = academyPptxDumpMode({
    pane,
    section: slide.section,
    hideReply: slide.copilot?.hideReply,
  });
  const nodes = slide.nodes ?? [];
  const dumpLines = academyPptxDumpLines(slide.table);
  const showThumbs = !compact && !dumpMode;
  const hasCopilotPane = Boolean(slide.copilot && !compact);
  const fullBleed = academyPptxFullBleedCanvas({
    pane,
    dumpMode,
    hasCopilot: hasCopilotPane,
  });

  const deskClass = [
    "academy-pptx-desk",
    pane === "live" ? "academy-pptx-desk--live" : "",
    pane === "before" ? "academy-pptx-desk--before" : "",
    pane === "after" ? "academy-pptx-desk--after" : "",
    liveFocusZoom ? "academy-pptx-desk--focus-zoom" : "",
    dumpMode && pane !== "after" ? "academy-pptx-desk--dump" : "",
    fullBleed ? "academy-pptx-desk--full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const zoomTarget =
    pane === "live" ? academyExcelFocusZoomTarget(slide.lessonKey, currentTime ?? 0) : null;
  const cameraTarget = zoomTarget ?? (liveFocusZoom && dumpMode ? "copilot" : liveFocusZoom ? "canvas" : null);
  const originKey = `${activeElement}:${highlight}:${slide.section}:${pane}:${cameraTarget ?? "none"}`;

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const desk = deskRef.current;
    const fit = fitRef.current;
    if (!wrap || !desk || !fit) {
      return;
    }
    const measure = () => {
      const copilot = desk.querySelector<HTMLElement>("[data-academy-ai-desk]");
      const origin =
        cameraTarget === "copilot"
          ? copilot
          : originRef.current ?? wrap.querySelector<HTMLElement>("[data-academy-pptx-origin]");
      applyAcademyOfficeWinFit(desk, fit, {
        zoom: liveFocusZoom ? ACADEMY_EXCEL_FOCUS_ZOOM_SCALE : 1,
        origin: liveFocusZoom ? origin : null,
      });
      if (origin && fit) {
        setFocusOrigin(academyOfficeFocusOriginCss(origin.getBoundingClientRect(), fit.getBoundingClientRect()));
      } else {
        setFocusOrigin("0% 0%");
      }
      if (!origin || cameraTarget === "copilot") {
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
      setAlignBox(academyPptxAlignBox(origin.getBoundingClientRect(), wrapRect, layout));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(desk);
    observer.observe(wrap);
    const origin = originRef.current ?? desk.querySelector<HTMLElement>("[data-academy-ai-desk]");
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
  }, [originKey, liveFocusZoom, compact, dumpMode, cameraTarget]);

  return (
    <div
      ref={deskRef}
      className={deskClass}
      data-academy-pptx-live=""
      data-academy-pptx-pane={pane}
      data-academy-pptx-file={slide.fileName ?? ACADEMY_PPTX_FILE_NAME}
      data-academy-pptx-active={activeElement}
      data-academy-excel-active-cell={highlight}
      data-academy-excel-focus-zoom={pane === "live" ? (liveFocusZoom ? "in" : "out") : undefined}
      data-academy-excel-mouse={mouse ? mouse.cell : undefined}
      data-academy-ai-desk-tab={slide.copilot && !compact ? aiDesk.tab : undefined}
      data-academy-ai-desk-phase={slide.copilot && !compact ? aiDesk.phase : undefined}
      data-academy-pptx-chrome={compact ? "bare" : "full"}
      data-academy-pptx-bleed={fullBleed ? "full" : undefined}
      data-academy-pptx-camera={cameraTarget ?? undefined}
      style={
        pane === "live"
          ? {
              ["--academy-pptx-focus-origin" as string]: focusOrigin,
            }
          : undefined
      }
    >
      <div className="academy-office-win-fit" ref={fitRef} data-academy-office-win-fit="">
      <div className="academy-pptx-win">
        {compact ? null : (
          <div className="academy-pptx-titlebar">
            <i aria-hidden />
            <b>PowerPoint</b>
            <span>{academyCitizenOfficeFileLabel(slide.fileName) ?? ACADEMY_PPTX_FILE_LABEL}</span>
          </div>
        )}
        {compact ? null : (
          <div className="academy-pptx-ribbon" aria-hidden>
            <span className="on">Giriş</span>
            <span>Ekle</span>
            <span>Tasarım</span>
            <span>Geçişler</span>
            <span>Animasyonlar</span>
            <span>Gösteri</span>
            {slide.copilot ? <LessonOfficeCopilotRibbon active={aiDesk.tab === "copilot"} host="pptx" /> : null}
          </div>
        )}
        <div className={`academy-pptx-body${hasCopilotPane ? " academy-pptx-body--copilot" : ""}`}>
          {showThumbs ? (
            <nav className="academy-pptx-thumbs" aria-label="Slayt gezgini">
              {(nodes.length > 0 ? nodes : [{ title: "Yönetim özeti", sub: slide.subhead }]).map((node, index) => (
                <button
                  key={`${index}:${node.title}`}
                  type="button"
                  className={`academy-pptx-thumb${index === 0 ? " on" : ""}`}
                  data-academy-pptx-thumb={index + 1}
                >
                  <i className="academy-pptx-thumb-preview" aria-hidden />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <em>{node.title}</em>
                </button>
              ))}
            </nav>
          ) : null}
          <div className="academy-pptx-canvas-wrap" ref={wrapRef}>
            <article className="academy-pptx-canvas aspect-video" data-academy-pptx-canvas="">
              <LessonSlideWorkspace
                dumpMode={dumpMode && pane !== "after"}
                dumpLines={dumpLines}
                activeElement={activeElement}
                originRef={originRef}
              />
            </article>
            {alignBox ? (
              <div
                className="academy-pptx-active-border"
                data-academy-excel-active-cell-border=""
                data-academy-pptx-card-arrow=""
                style={boxStyle(alignBox)}
                aria-hidden
              />
            ) : null}
            {mouse ? (
              <div
                className="academy-excel-mouse-layer"
                data-academy-excel-mouse-layer=""
                data-academy-excel-mouse-cell={mouse.cell}
                data-academy-excel-mouse-click={mouse.clicking ? "true" : undefined}
                aria-hidden
              >
                <div
                  className="academy-excel-mouse-select"
                  style={alignBox ? boxStyle(alignBox) : { left: `${mouse.x}%`, top: `${mouse.y}%` }}
                />
                <div
                  className={`academy-excel-mouse${mouse.clicking ? " academy-excel-mouse--click" : ""}`}
                  style={{ left: `${mouse.x}%`, top: `${mouse.y}%` }}
                >
                  <span className="academy-excel-mouse-ripple" />
                  <svg className="academy-excel-mouse-pointer" viewBox="0 0 24 24" width="28" height="28">
                    <path
                      d="M4.6 2.8 4.6 20.2 9.2 15.4 12.4 22.4 15.1 21.2 11.8 14.1 18.6 14.1 Z"
                      fill="#fff"
                      stroke="#111"
                      strokeLinejoin="round"
                      strokeWidth="1.35"
                    />
                  </svg>
                </div>
              </div>
            ) : null}
          </div>
          {slide.copilot && !compact ? (
            <LessonAiDesk
              prompt={slide.copilot.prompt}
              currentTime={currentTime}
              lessonKey={slide.lessonKey}
              cueIndex={slide.cueIndex}
              host="pptx"
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
