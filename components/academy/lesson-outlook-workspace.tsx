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
  ACADEMY_OUTLOOK_DUMP_MAILS,
  ACADEMY_OUTLOOK_FILE_NAME,
  ACADEMY_OUTLOOK_RESET_GROUPS,
  ACADEMY_OUTLOOK_UNREAD_AFTER,
  ACADEMY_OUTLOOK_UNREAD_BEFORE,
  ACADEMY_OUTLOOK_WINDOW_TITLE,
  academyOutlookAlignBox,
  academyOutlookElementForCell,
  academyOutlookMailForElement,
} from "@/lib/academy/outlook-workspace";
import { applyAcademyOfficeWinFit } from "@/lib/academy/office-win-fit";
import { LessonAiDesk, LessonOfficeCopilotRibbon, useAcademyAiDeskTab } from "@/components/academy/lesson-ai-desk";

const ACADEMY_OUTLOOK_FOCUS_ORIGIN = "32% 38%";

function boxStyle(box: { left: number; top: number; width: number; height: number }) {
  return {
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  };
}

function outlookTagClass(tag: "Acil" | "Bekle" | "Arşiv") {
  if (tag === "Acil") {
    return "academy-outlook-tag academy-outlook-tag--acil";
  }
  if (tag === "Bekle") {
    return "academy-outlook-tag academy-outlook-tag--bekle";
  }
  return "academy-outlook-tag academy-outlook-tag--arsiv";
}

export function LessonOutlookWorkspace({
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
  const activeElement = academyOutlookElementForCell(highlight);
  const activeMail = academyOutlookMailForElement(activeElement);
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
  const dumpMode =
    pane === "before" ||
    slide.copilot?.hideReply === true ||
    slide.section === "INBOX KAOSU" ||
    slide.section === "HOŞ GELDİN" ||
    slide.section === "GİRİŞ KÖPRÜSÜ";
  const zeroed = !dumpMode || pane === "after";
  const unread = zeroed ? ACADEMY_OUTLOOK_UNREAD_AFTER : ACADEMY_OUTLOOK_UNREAD_BEFORE;

  const deskClass = [
    "academy-outlook-desk",
    pane === "live" ? "academy-outlook-desk--live" : "",
    pane === "before" ? "academy-outlook-desk--before" : "",
    pane === "after" ? "academy-outlook-desk--after" : "",
    liveFocusZoom ? "academy-outlook-desk--focus-zoom" : "",
    dumpMode && pane !== "after" ? "academy-outlook-desk--dump" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const originKey = `${activeElement}:${highlight}:${slide.section}:${pane}`;

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
        originRef.current ?? wrap.querySelector<HTMLElement>("[data-academy-outlook-origin]");
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
  }, [originKey, liveFocusZoom, compact, dumpMode]);

  return (
    <div
      ref={deskRef}
      className={deskClass}
      data-academy-outlook-live=""
      data-academy-outlook-pane={pane}
      data-academy-outlook-file={slide.fileName ?? ACADEMY_OUTLOOK_FILE_NAME}
      data-academy-outlook-active={activeElement}
      data-academy-outlook-unread={String(unread)}
      data-academy-outlook-reset={zeroed ? "true" : undefined}
      data-academy-excel-active-cell={highlight}
      data-academy-excel-focus-zoom={pane === "live" ? (liveFocusZoom ? "in" : "out") : undefined}
      data-academy-excel-mouse={mouse ? mouse.cell : undefined}
      data-academy-ai-desk-tab={slide.copilot && !compact ? aiDesk.tab : undefined}
      data-academy-ai-desk-phase={slide.copilot && !compact ? aiDesk.phase : undefined}
      style={
        pane === "live"
          ? {
              ["--academy-outlook-focus-scale" as string]: liveFocusZoom
                ? String(ACADEMY_EXCEL_FOCUS_ZOOM_SCALE)
                : 1,
              ["--academy-outlook-focus-origin" as string]: ACADEMY_OUTLOOK_FOCUS_ORIGIN,
            }
          : undefined
      }
    >
      <div className="academy-office-win-fit" ref={fitRef} data-academy-office-win-fit="">
      <div className="academy-outlook-win">
        <div className="academy-outlook-titlebar">
          <i aria-hidden />
          <b>{ACADEMY_OUTLOOK_WINDOW_TITLE}</b>
          <span>{slide.fileName ?? ACADEMY_OUTLOOK_FILE_NAME}</span>
        </div>
        {compact ? null : (
          <div className="academy-outlook-ribbon" aria-hidden>
            <span className="on">Gelen Kutusu</span>
            <span>Yanıtla</span>
            <span>Etiketle</span>
            <span>Arşiv</span>
            <span>Sil</span>
            {slide.copilot ? (
              <LessonOfficeCopilotRibbon active={aiDesk.tab === "copilot"} host="outlook" />
            ) : null}
          </div>
        )}
        <div className={`academy-outlook-body${slide.copilot && !compact ? " academy-outlook-body--copilot" : ""}`}>
          {compact ? null : (
            <nav className="academy-outlook-folders" aria-label="Klasörler">
              <button type="button" className="academy-outlook-folder on" data-academy-outlook-folder="inbox">
                <em>Gelen Kutusu</em>
                <span data-academy-outlook-unread-badge="">{unread}</span>
              </button>
              <button type="button" className="academy-outlook-folder" data-academy-outlook-folder="drafts">
                <em>Taslaklar</em>
              </button>
              <button type="button" className="academy-outlook-folder" data-academy-outlook-folder="archive">
                <em>Arşiv</em>
              </button>
            </nav>
          )}
          <div className="academy-outlook-canvas-wrap" ref={wrapRef}>
            <article
              className={`academy-outlook-canvas${compact ? " academy-outlook-canvas--compact" : ""}${zeroed ? " academy-outlook-canvas--reset" : ""}`}
              data-academy-outlook-canvas=""
              data-academy-fix={compact ? "162719" : undefined}
            >
              {zeroed ? (
                <div className="academy-outlook-reset" data-academy-outlook-reset="">
                  {ACADEMY_OUTLOOK_RESET_GROUPS.map((group) => {
                    const isOrigin = group.id === activeElement;
                    return (
                      <article
                        key={group.id}
                        className={`academy-outlook-group academy-outlook-group--${group.tone}${isOrigin ? " on" : ""} overflow-hidden`}
                        data-academy-outlook-element={group.id}
                        data-academy-outlook-group={group.tone}
                        data-academy-outlook-origin={isOrigin ? "" : undefined}
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
                <>
                  <div className="academy-outlook-list" data-academy-outlook-list="">
                    <p className="academy-outlook-list-head">
                      Gelen Kutusu · {unread} okunmamış
                    </p>
                    {ACADEMY_OUTLOOK_DUMP_MAILS.map((mail) => {
                      const isOrigin = mail.id === activeElement;
                      const showTag = mail.id.startsWith("mail-");
                      return (
                        <button
                          key={mail.id}
                          type="button"
                          className={`academy-outlook-row${isOrigin ? " on" : ""} unread`}
                          data-academy-outlook-element={mail.id}
                          data-academy-outlook-origin={isOrigin ? "" : undefined}
                          data-academy-excel-active-cell={mail.cell}
                          ref={isOrigin ? (el) => { originRef.current = el; } : undefined}
                        >
                          <b>{mail.from}</b>
                          <strong>{mail.subject}</strong>
                          <em>{mail.preview}</em>
                          {showTag ? <span className={outlookTagClass(mail.tag)}>{mail.tag}</span> : null}
                        </button>
                      );
                    })}
                  </div>
                  {compact ? null : (
                    <aside className="academy-outlook-read" data-academy-outlook-read="">
                      <p className="academy-outlook-read-from">{activeMail.from}</p>
                      <h3 className="academy-outlook-read-subject">{activeMail.subject}</h3>
                      <span className={outlookTagClass(activeMail.tag)}>{activeMail.tag}</span>
                      <p className="academy-outlook-read-body">
                        Yüzlerce okunmamış satır üst üste biner. Etiket yok, taslak yok, arşiv kapalı.
                      </p>
                    </aside>
                  )}
                </>
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
              host="outlook"
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
