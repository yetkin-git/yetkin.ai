"use client";

import type { Ref } from "react";
import {
  ACADEMY_PPTX_ACTION_BAND,
  ACADEMY_PPTX_KPI_CARDS,
  ACADEMY_PPTX_SLIDE_TITLE,
  type AcademyPptxElementId,
} from "@/lib/academy/pptx-workspace";

const WORD_DUMP_CHROME = "Mart_2026_tahsilat_notlari.docx";

function bindHtmlRef(ref: Ref<HTMLElement | null>, el: HTMLElement | null): void {
  if (ref == null) {
    return;
  }
  if (typeof ref === "function") {
    ref(el);
    return;
  }
  ref.current = el;
}

export function LessonSlideWorkspace({
  dumpMode,
  dumpLines,
  activeElement,
  originRef,
}: {
  dumpMode: boolean;
  dumpLines: readonly string[];
  activeElement: AcademyPptxElementId;
  originRef: Ref<HTMLElement | null>;
}) {
  if (dumpMode) {
    return (
      <div
        ref={(el) => bindHtmlRef(originRef, el)}
        className="academy-pptx-dump academy-pptx-dump--word"
        data-academy-pptx-element="dump"
        data-academy-pptx-origin=""
        data-academy-pptx-dump="word"
      >
        <p className="academy-pptx-dump-chrome">{WORD_DUMP_CHROME}</p>
        {(dumpLines.length > 0 ? dumpLines : ["Mart tahsilat notları dağınık durur..."]).map((line, index) => (
          <p
            key={`${index}:${line}`}
            className={`academy-pptx-dump-line academy-pptx-dump-line--${index % 5}`}
          >
            {line}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="academy-pptx-slide-stage" data-academy-pptx-deck="kpi">
      <h3 className="academy-pptx-slide-title text-center" data-academy-pptx-slide-title="">
        {ACADEMY_PPTX_SLIDE_TITLE}
      </h3>
      <div className="academy-pptx-kpi-grid" data-academy-pptx-kpi-grid="">
        {ACADEMY_PPTX_KPI_CARDS.map((card, index) => {
          const isOrigin = activeElement === card.id;
          return (
            <article
              key={card.id}
              ref={isOrigin ? (el) => bindHtmlRef(originRef, el) : undefined}
              className={`academy-pptx-kpi academy-pptx-kpi--${card.tone} items-center justify-center text-center`}
              data-academy-pptx-element={card.id}
              data-academy-pptx-kpi={card.id.replace("kpi-", "")}
              data-academy-pptx-origin={isOrigin ? "" : undefined}
              data-academy-pptx-on={isOrigin ? "true" : undefined}
            >
              <span className="academy-pptx-kpi-label">{card.label}</span>
              <strong className="academy-pptx-kpi-value">{card.value}</strong>
              {index === 2 ? <em className="academy-pptx-kpi-badge">Uyarı</em> : null}
            </article>
          );
        })}
      </div>
      <footer className="academy-pptx-action-band text-center" data-academy-pptx-action-band="">
        {ACADEMY_PPTX_ACTION_BAND}
      </footer>
    </div>
  );
}
