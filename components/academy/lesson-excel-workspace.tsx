"use client";

/**
 * Canlı Excel çalışma alanı — A1 hücresi masada, soyut kart yok.
 */

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  ACADEMY_EXCEL_FOCUS_ZOOM_ORIGIN,
  ACADEMY_EXCEL_FOCUS_ZOOM_SCALE,
} from "@/lib/academy/excel-focus-zoom";
import { academyExcelMouseState } from "@/lib/academy/excel-mouse-pointer";
import type { AcademyCinemaCueSlide } from "@/lib/academy/cinema-cue-catalog";
import {
  ACADEMY_OFFICE_AI_1_TRANSFER_LABELS,
  academyExcelAlignBox,
  academyExcelColLetter,
  academyExcelColumnMinCh,
  academyExcelIsActiveColumn,
  academyExcelIsSelectionOrigin,
  academyExcelSelection,
  academyExcelSnapBoxToColumns,
  type AcademyExcelAlignBox,
  type AcademyVisualExcelPane,
} from "@/lib/academy/excel-workspace";
import { academyPocketChecklistSteps } from "@/lib/academy/lesson-beat-visual";

function cellClass(options: {
  head?: boolean;
  empty?: boolean;
  merge?: boolean;
  foot?: boolean;
  a1?: boolean;
}): string {
  const parts = ["academy-excel-cell"];
  if (options.head) {
    parts.push("academy-excel-cell--head");
  }
  if (options.empty) {
    parts.push("academy-excel-cell--empty");
  }
  if (options.merge) {
    parts.push("academy-excel-cell--merge");
  }
  if (options.foot) {
    parts.push("academy-excel-cell--foot");
  }
  if (options.a1) {
    parts.push("academy-excel-cell--a1");
    parts.push("academy-excel-selection-box");
    parts.push("academy-excel-active-cell-border");
  }
  return parts.join(" ");
}

function boxStyle(box: AcademyExcelAlignBox): CSSProperties {
  return {
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  };
}

function fitExcelGridFont(wrap: HTMLElement, compact: boolean): void {
  const fit = wrap.querySelector<HTMLElement>(".academy-excel-grid-fit");
  const grid = wrap.querySelector<HTMLElement>("table.academy-excel-grid");
  if (!grid) {
    return;
  }
  if (fit) {
    fit.style.transform = "";
    fit.style.width = "";
  }
  grid.style.fontSize = "";
  const available = wrap.clientWidth;
  if (available <= 0) {
    return;
  }
  let size = Number.parseFloat(getComputedStyle(grid).fontSize);
  if (!Number.isFinite(size) || size <= 0) {
    return;
  }
  const floor = compact ? 6 : 8;
  for (let step = 0; step < 48 && grid.scrollWidth > available + 0.5 && size > floor; step += 1) {
    size -= 0.4;
    grid.style.fontSize = `${size}px`;
  }
  if (fit && grid.scrollWidth > available + 0.5) {
    const scale = available / grid.scrollWidth;
    fit.style.transformOrigin = "top left";
    fit.style.transform = `scale(${scale})`;
    fit.style.width = `${100 / scale}%`;
  }
}

export function LessonExcelWorkspace({
  slide,
  pane = "live",
  focusZoom = false,
  currentTime,
}: {
  slide: AcademyCinemaCueSlide;
  pane?: AcademyVisualExcelPane;
  /** Cue-04 A1 odak kamerası — CSS scale; yalnız canlı ızgara. */
  focusZoom?: boolean;
  /** Cue-04 sanal fare — yalnız canlı ızgara. */
  currentTime?: number;
}) {
  const table = slide.table;
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const originRef = useRef<HTMLTableCellElement | null>(null);
  const [alignBox, setAlignBox] = useState<AcademyExcelAlignBox | null>(null);
  const compact = pane === "before" || pane === "after";
  const colCount = table
    ? Math.max(table.headers.length, ...table.rows.map((row) => row.length), compact ? 1 : 6)
    : compact
      ? 1
      : 6;
  const colMinCh = table ? academyExcelColumnMinCh(table, colCount) : [];
  const colPad = compact ? "0.32rem" : "0.64rem";
  const letters = Array.from({ length: colCount }, (_, index) => academyExcelColLetter(index));
  const mouse =
    pane === "live" && Number.isFinite(currentTime)
      ? academyExcelMouseState(slide.lessonKey, currentTime as number)
      : null;
  const highlight = mouse?.cell ?? slide.highlightCell ?? "A1";
  const formula =
    slide.formulaBar !== undefined ? slide.formulaBar : (table?.headers[0] ?? "");
  const merged = slide.mergedTop === true;
  const selection = academyExcelSelection({
    cell: highlight,
    mergedTop: merged,
    colCount,
  });
  const nameBox = selection.nameBox;
  const mergeSelected = selection.coversMerge;
  const headerRow = merged ? 3 : 1;
  const dataStart = merged ? 4 : 2;
  const fillerCount = Math.max(0, (compact ? 8 : 12) - (table?.rows.length ?? 0) - (merged ? 3 : 1));
  const isPocketChecklist = academyPocketChecklistSteps(slide.lessonKey, slide.section) != null;
  const pocketSteps = academyPocketChecklistSteps(slide.lessonKey, slide.section);
  const isTransferDesk =
    slide.lessonKey === "01_office_ai-1" && slide.section === "TEMİZLE ŞİMDİ" && pane === "live";
  const liveFocusZoom = pane === "live" && focusZoom;
  const startCol = mergeSelected && selection.merge ? selection.merge.startCol : selection.address.col;
  const endCol = mergeSelected && selection.merge ? selection.merge.endCol : selection.address.col;
  const deskClass = [
    "academy-excel-desk",
    pane === "live" ? "academy-excel-desk--live" : "",
    slide.zoomA1 === true || pane === "after" ? "academy-excel-desk--zoom" : "",
    liveFocusZoom ? "academy-excel-desk--focus-zoom" : "",
    pane === "before" ? "academy-excel-desk--before" : "",
    pane === "after" ? "academy-excel-desk--after" : "",
  ]
    .filter((part) => part.length > 0)
    .join(" ");

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) {
      return;
    }

    const measure = () => {
      fitExcelGridFont(wrap, compact);
      const origin =
        originRef.current ?? wrap.querySelector<HTMLElement>("[data-academy-excel-origin]");
      if (!origin) {
        setAlignBox(null);
        return;
      }
      const frame = wrap.querySelector<HTMLElement>(".academy-excel-grid-fit") ?? wrap;
      const layout = {
        offsetWidth: frame.offsetWidth,
        offsetHeight: frame.offsetHeight,
        scrollLeft: wrap.scrollLeft,
        scrollTop: wrap.scrollTop,
      };
      const wrapRect = frame.getBoundingClientRect();
      const cellBox = academyExcelAlignBox(origin.getBoundingClientRect(), wrapRect, layout);
      const firstTh = wrap.querySelector<HTMLElement>(
        `th[data-academy-excel-col="${academyExcelColLetter(startCol)}"]`,
      );
      const lastTh = wrap.querySelector<HTMLElement>(
        `th[data-academy-excel-col="${academyExcelColLetter(endCol)}"]`,
      );
      const firstCol = firstTh
        ? academyExcelAlignBox(firstTh.getBoundingClientRect(), wrapRect, layout)
        : null;
      const lastCol = lastTh
        ? academyExcelAlignBox(lastTh.getBoundingClientRect(), wrapRect, layout)
        : firstCol;
      setAlignBox(academyExcelSnapBoxToColumns(cellBox, firstCol, lastCol));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    const grid = wrap.querySelector("table");
    if (grid) {
      observer.observe(grid);
    }
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
  }, [nameBox, mergeSelected, startCol, endCol, colCount, compact, liveFocusZoom, highlight, formula]);

  if (!table) {
    return null;
  }

  return (
    <div
      className={deskClass}
      data-academy-excel-live=""
      data-academy-excel-pane={pane}
      data-academy-excel-file={slide.fileName ?? "Kitap1.xlsx"}
      data-academy-highlight-cell={nameBox}
      data-academy-excel-active-cell={nameBox}
      data-academy-excel-merge={selection.merge?.ref}
      data-academy-excel-selection={mergeSelected ? "merge" : "cell"}
      data-academy-excel-focus-zoom={pane === "live" ? (liveFocusZoom ? "in" : "out") : undefined}
      data-academy-excel-mouse={mouse ? mouse.cell : undefined}
      style={
        pane === "live"
          ? {
              ["--academy-excel-focus-scale" as string]: liveFocusZoom
                ? String(ACADEMY_EXCEL_FOCUS_ZOOM_SCALE)
                : 1,
              ["--academy-excel-focus-origin" as string]: ACADEMY_EXCEL_FOCUS_ZOOM_ORIGIN,
            }
          : undefined
      }
    >
      <div className="academy-excel-win">
        <div className="academy-excel-title">
          <i aria-hidden />
          <b>Excel</b>
          <span>{slide.fileName ?? "Kitap1.xlsx"}</span>
        </div>
        {compact ? null : (
          <div className="academy-excel-ribbon" aria-hidden>
            <span className="on">Giriş</span>
            <span>Ekle</span>
            <span>Çiz</span>
            <span>Sayfa Düzeni</span>
            <span>Formüller</span>
            <span>Veri</span>
            <span>Gözden Geçir</span>
            <span>Görünüm</span>
          </div>
        )}
        <div className="academy-excel-fx">
          <div className="academy-excel-name">{nameBox}</div>
          <div className="academy-excel-fx-label">fx</div>
          <div className="academy-excel-fx-value">{formula}</div>
        </div>
        <div className={`academy-excel-body${slide.copilot && !compact ? " academy-excel-body--copilot" : ""}`}>
          <div className="academy-excel-grid-wrap" ref={wrapRef}>
            <div className="academy-excel-grid-fit">
            <table className="academy-excel-grid">
              <colgroup>
                <col className="academy-excel-col-gutter" />
                {letters.map((letter, index) => (
                  <col
                    key={letter}
                    className="academy-excel-col-data"
                    style={{
                      minWidth: `calc(${colMinCh[index]}ch + ${colPad})`,
                      width: "auto",
                    }}
                  />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="academy-excel-corner" />
                  {letters.map((letter, index) => (
                    <th
                      key={letter}
                      className={`academy-excel-col${academyExcelIsActiveColumn(selection, index) ? " academy-excel-col--active" : ""}`}
                      data-academy-excel-col={letter}
                      data-academy-excel-col-on={academyExcelIsActiveColumn(selection, index) ? "true" : undefined}
                      style={{ minWidth: `calc(${colMinCh[index]}ch + ${colPad})`, width: "auto" }}
                    >
                      {letter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {merged ? (
                  <>
                    <tr>
                      <th className={`academy-excel-row${mergeSelected ? " academy-excel-row--active" : ""}`}>1</th>
                      <td
                        ref={academyExcelIsSelectionOrigin(selection, 0, 1) ? originRef : undefined}
                        className={cellClass({
                          merge: true,
                          a1: academyExcelIsSelectionOrigin(selection, 0, 1),
                        })}
                        colSpan={colCount}
                        data-academy-excel-col="A"
                        data-academy-excel-origin={
                          academyExcelIsSelectionOrigin(selection, 0, 1) ? "" : undefined
                        }
                        data-academy-excel-merge={selection.merge?.ref}
                        data-academy-excel-selection-box={
                          academyExcelIsSelectionOrigin(selection, 0, 1) ? selection.merge?.ref : undefined
                        }
                      >
                        {formula || "Mart 2026 Tahsilat Dökümü"}
                      </td>
                    </tr>
                    <tr>
                      <th className="academy-excel-row">2</th>
                      {letters.map((letter) => (
                        <td key={letter} className={cellClass({ empty: true })} data-academy-excel-col={letter} />
                      ))}
                    </tr>
                  </>
                ) : null}
                <tr>
                  <th className="academy-excel-row">{headerRow}</th>
                  {letters.map((letter, col) => {
                    const value = table.headers[col] ?? "";
                    const isOrigin = !merged && academyExcelIsSelectionOrigin(selection, col, 1);
                    return (
                      <td
                        key={letter}
                        ref={isOrigin ? originRef : undefined}
                        className={cellClass({
                          head: true,
                          a1: isOrigin,
                        })}
                        data-academy-excel-col={letter}
                        data-academy-excel-origin={isOrigin ? "" : undefined}
                        style={{ minWidth: `calc(${colMinCh[col]}ch + ${colPad})` }}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
                {table.rows.map((row, rowIndex) => {
                  const excelRow = dataStart + rowIndex;
                  const isFoot = rowIndex === table.rows.length - 1 && /toplam/iu.test(row[0] ?? "");
                  return (
                    <tr key={`r-${excelRow}`}>
                      <th className="academy-excel-row">{excelRow}</th>
                      {letters.map((letter, col) => {
                        const isOrigin = academyExcelIsSelectionOrigin(selection, col, excelRow);
                        return (
                          <td
                            key={letter}
                            ref={isOrigin ? originRef : undefined}
                            className={cellClass({
                              foot: isFoot,
                              a1: isOrigin,
                            })}
                            data-academy-excel-col={letter}
                            data-academy-excel-origin={isOrigin ? "" : undefined}
                          >
                            {row[col] ?? ""}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {Array.from({ length: fillerCount }, (_, index) => {
                  const excelRow = dataStart + table.rows.length + index;
                  return (
                    <tr key={`f-${excelRow}`}>
                      <th className="academy-excel-row">{excelRow}</th>
                      {letters.map((letter) => (
                        <td key={letter} data-academy-excel-col={letter} />
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {alignBox ? (
              <div
                className="academy-excel-active-cell-border"
                data-academy-excel-active-cell-border=""
                style={boxStyle(alignBox)}
                aria-hidden
              />
            ) : null}
            </div>
            {mouse ? (
              <div
                className="academy-excel-mouse-layer"
                data-academy-excel-mouse-layer=""
                data-academy-excel-mouse-cell={mouse.cell}
                data-academy-excel-mouse-click={mouse.clicking ? "true" : undefined}
                aria-hidden
              >
                {mergeSelected ? null : (
                  <div
                    className="academy-excel-mouse-select"
                    style={alignBox ? boxStyle(alignBox) : { left: `${mouse.x}%`, top: `${mouse.y}%` }}
                  />
                )}
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
            <aside className="academy-excel-copilot" data-academy-ai-desk="">
              <header>AI masası</header>
              <p className="academy-excel-ai-brands">ChatGPT · Claude · Gemini · API</p>
              {isTransferDesk ? (
                <ul className="academy-excel-transfer-tags" data-academy-transfer-tags="">
                  {ACADEMY_OFFICE_AI_1_TRANSFER_LABELS.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              ) : null}
              <div className="academy-excel-bubble academy-excel-bubble--user">{slide.copilot.prompt}</div>
              {slide.copilot.hideReply === true ? null : (
                <div className="academy-excel-bubble academy-excel-bubble--bot">
                  {slide.copilot.replyLines.map((line, index) => (
                    <p key={`${index}:${line}`}>{line}</p>
                  ))}
                </div>
              )}
            </aside>
          ) : null}
        </div>
        {table.note && !compact ? (
          <div className="academy-excel-note" data-academy-excel-note="">
            {table.note}
          </div>
        ) : null}
        <div className="academy-excel-tabs">
          <span className="on">{slide.sheetName ?? "Sayfa1"}</span>
          <span>Sayfa2</span>
          <i>+</i>
          <em>Hazır</em>
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
