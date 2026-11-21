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
import {
  ACADEMY_GMAIL_ACTION_GROUPS,
  ACADEMY_GMAIL_ACTION_HEAD,
  ACADEMY_GMAIL_CARRY_WATER_CLIP,
  ACADEMY_GMAIL_FILE_NAME,
  ACADEMY_GMAIL_INBOX_HEAD,
  ACADEMY_GMAIL_MAILS,
  ACADEMY_GMAIL_SAMPLE_LOCK,
  ACADEMY_GMAIL_WINDOW_TITLE,
  academyGmailStageKind,
} from "@/lib/academy/gmail-workspace";
import { applyAcademyOfficeWinFit } from "@/lib/academy/office-win-fit";
import { academyOutlookAlignBox } from "@/lib/academy/outlook-workspace";
import { LessonAiDesk, LessonOfficeCopilotRibbon, useAcademyAiDeskTab } from "@/components/academy/lesson-ai-desk";

const ACADEMY_GMAIL_FOCUS_ORIGIN = "68% 38%";

function boxStyle(box: { left: number; top: number; width: number; height: number }) {
  return {
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  };
}

function gmailTagClass(tag: string) {
  if (tag === "Ödeme") {
    return "academy-outlook-tag academy-outlook-tag--acil";
  }
  if (tag === "Onay") {
    return "academy-outlook-tag academy-outlook-tag--bekle";
  }
  return "academy-outlook-tag academy-outlook-tag--arsiv";
}

export function LessonGmailWorkspace({
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
  const stage = academyGmailStageKind({
    pane,
    section: slide.section,
    hideReply: slide.copilot?.hideReply,
  });
  const carryWater = stage === "disconnected";
  const nativeInbox = stage === "native";
  const showGemini = Boolean(slide.copilot) && !carryWater && (pane === "live" || pane === "after");
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
        originRef.current ?? wrap.querySelector<HTMLElement>("[data-academy-gmail-origin]");
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
  }, [originKey, liveFocusZoom, compact, carryWater]);

  const deskClass = [
    "academy-outlook-desk",
    "academy-gmail-desk",
    pane === "live" ? "academy-outlook-desk--live" : "",
    pane === "before" ? "academy-outlook-desk--before" : "",
    pane === "after" ? "academy-outlook-desk--after" : "",
    liveFocusZoom ? "academy-outlook-desk--focus-zoom" : "",
    carryWater ? "academy-gmail-desk--carry" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={deskRef}
      className={deskClass}
      data-academy-gmail-live=""
      data-academy-gmail-pane={pane}
      data-academy-gmail-stage={stage}
      data-academy-gmail-file={slide.fileName ?? ACADEMY_GMAIL_FILE_NAME}
      data-academy-gmail-carry={carryWater ? "true" : undefined}
      data-academy-excel-active-cell={highlight}
      data-academy-excel-focus-zoom={pane === "live" ? (liveFocusZoom ? "in" : "out") : undefined}
      data-academy-ai-desk-tab={showGemini ? aiDesk.tab : undefined}
      style={
        pane === "live"
          ? {
              ["--academy-outlook-focus-scale" as string]: liveFocusZoom
                ? String(ACADEMY_EXCEL_FOCUS_ZOOM_SCALE)
                : 1,
              ["--academy-outlook-focus-origin" as string]: ACADEMY_GMAIL_FOCUS_ORIGIN,
            }
          : undefined
      }
    >
      <div className="academy-office-win-fit" ref={fitRef} data-academy-office-win-fit="">
      <div className="academy-outlook-win">
        <div className="academy-outlook-titlebar">
          <i aria-hidden />
          <b>{carryWater ? "ChatGPT" : ACADEMY_GMAIL_WINDOW_TITLE}</b>
          <span>{carryWater ? "Taşıma su" : (slide.fileName ?? ACADEMY_GMAIL_FILE_NAME)}</span>
        </div>
        {compact ? null : (
          <div className="academy-outlook-ribbon" aria-hidden>
            <span className="on">{carryWater ? "Yapıştır" : "Gelen Kutusu"}</span>
            {carryWater ? (
              <span>Ctrl+C</span>
            ) : (
              <>
                <span>Gemini</span>
                <span>Arşiv</span>
              </>
            )}
            {showGemini && pane === "live" ? (
              <LessonOfficeCopilotRibbon active={aiDesk.tab === "copilot"} host="gmail" />
            ) : null}
          </div>
        )}
        <div
          className={[
            "academy-outlook-body",
            "academy-outlook-body--gmail",
            carryWater ? "academy-outlook-body--carry" : "",
            showGemini ? "academy-outlook-body--copilot" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {compact || carryWater ? null : (
            <nav className="academy-outlook-folders" aria-label="Klasörler">
              <button type="button" className="academy-outlook-folder on">
                <em>Gelen Kutusu</em>
                <span>24s</span>
              </button>
              <button type="button" className="academy-outlook-folder">
                <em>Arşivlik</em>
              </button>
            </nav>
          )}
          <div className="academy-outlook-canvas-wrap" ref={wrapRef}>
            <article
              className={`academy-outlook-canvas academy-outlook-canvas--compact${nativeInbox ? " academy-outlook-canvas--reset" : ""}`}
              data-academy-gmail-canvas=""
              data-academy-fix={compact ? "162719" : undefined}
            >
              {carryWater ? (
                <div className="academy-gmail-carry" data-academy-gmail-carry-panel="">
                  <p className="academy-gmail-carry-badge">TAŞIMA SU</p>
                  {compact ? null : (
                    <p className="academy-gmail-sample-lock" data-academy-gmail-sample-lock="">
                      {ACADEMY_GMAIL_SAMPLE_LOCK}
                    </p>
                  )}
                  <ul>
                    {ACADEMY_GMAIL_CARRY_WATER_CLIP.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <div className="academy-outlook-list">
                    {ACADEMY_GMAIL_MAILS.map((mail) => {
                      const isOrigin = mail.cell === highlight;
                      return (
                        <button
                          key={mail.id}
                          type="button"
                          className={`academy-outlook-row${isOrigin ? " on" : ""} unread`}
                          data-academy-gmail-origin={isOrigin ? "" : undefined}
                          data-academy-excel-active-cell={mail.cell}
                          ref={isOrigin ? (el) => { originRef.current = el; } : undefined}
                        >
                          <b>{mail.from}</b>
                          <strong>{mail.subject}</strong>
                          <em>Kutudan kopuk yapıştırma</em>
                          <span className={gmailTagClass(mail.tag)}>{mail.tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : nativeInbox ? (
                <div className="academy-outlook-reset" data-academy-gmail-native="">
                  <p className="academy-outlook-list-head">{ACADEMY_GMAIL_ACTION_HEAD}</p>
                  {compact ? null : (
                    <p className="academy-gmail-sample-lock" data-academy-gmail-sample-lock="">
                      {ACADEMY_GMAIL_SAMPLE_LOCK}
                    </p>
                  )}
                  {ACADEMY_GMAIL_ACTION_GROUPS.map((group) => {
                    const isOrigin = group.cell === highlight;
                    return (
                      <article
                        key={group.id}
                        className={`academy-outlook-group academy-outlook-group--${group.tone}${isOrigin ? " on" : ""} overflow-hidden`}
                        data-academy-gmail-origin={isOrigin ? "" : undefined}
                        data-academy-excel-active-cell={group.cell}
                        ref={isOrigin ? originRef : undefined}
                      >
                        <span className="academy-outlook-group-mark" aria-hidden>
                          {group.mark}
                        </span>
                        <div className="academy-outlook-group-copy">
                          <p className="academy-outlook-group-label">{group.label}</p>
                          <strong className="academy-outlook-group-title">{group.title}</strong>
                          <em className="academy-outlook-group-detail">{group.detail}</em>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="academy-outlook-list" data-academy-gmail-inbox="">
                  <p className="academy-outlook-list-head">{ACADEMY_GMAIL_INBOX_HEAD}</p>
                  {compact ? null : (
                    <p className="academy-gmail-sample-lock" data-academy-gmail-sample-lock="">
                      {ACADEMY_GMAIL_SAMPLE_LOCK}
                    </p>
                  )}
                  {ACADEMY_GMAIL_MAILS.map((mail) => {
                    const isOrigin = mail.cell === highlight;
                    return (
                      <button
                        key={mail.id}
                        type="button"
                        className={`academy-outlook-row${isOrigin ? " on" : ""} unread`}
                        data-academy-gmail-origin={isOrigin ? "" : undefined}
                        data-academy-excel-active-cell={mail.cell}
                        ref={isOrigin ? (el) => { originRef.current = el; } : undefined}
                      >
                        <b>{mail.from}</b>
                        <strong>{mail.subject}</strong>
                        <em>{mail.preview} · özet kapalı</em>
                        <span className={gmailTagClass(mail.tag)}>{mail.tag}</span>
                      </button>
                    );
                  })}
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
          {showGemini && slide.copilot ? (
            <LessonAiDesk
              prompt={slide.copilot.prompt}
              currentTime={currentTime}
              lessonKey={slide.lessonKey}
              cueIndex={slide.cueIndex}
              host="gmail"
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
