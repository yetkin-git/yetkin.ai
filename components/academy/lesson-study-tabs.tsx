"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import { LinkButton } from "@/components/ui/link-button";
import { AcademyMarkdownRenderer } from "@/components/academy/academy-markdown-renderer";
import { extractLessonStudyPack } from "@/lib/academy/lesson-study";
import { academyExamStartGateHref } from "@/lib/academy/continue-board";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

type StudyTabId = "summary" | "transcript" | "exam";

const TABS: { id: StudyTabId; label: string }[] = [
  { id: "summary", label: "Özet ve Promptlar" },
  { id: "transcript", label: "Tam Ders Metni" },
  { id: "exam", label: "Sınav ve Sertifika" },
];

export function LessonStudyTabs({
  lessonKey,
  articleBody,
  courseSlug,
  examOpen,
  lessonOrder,
  lessonTotal,
  nextLessonTitle,
}: {
  lessonKey: string;
  articleBody: string;
  courseSlug: string;
  examOpen: boolean;
  lessonOrder: number;
  lessonTotal: number;
  nextLessonTitle?: string;
}) {
  const copy = ACADEMY_SEN.player;
  const cert = ACADEMY_SEN.certificates;
  const course = ACADEMY_SEN.course;
  const [tab, setTab] = useState<StudyTabId>("summary");
  const pack = useMemo(() => extractLessonStudyPack(articleBody), [articleBody]);

  useEffect(() => {
    setTab("summary");
  }, [lessonKey]);

  return (
    <section
      className="academy-player-study min-h-[18rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-card)]"
      data-academy-study-tabs=""
    >
      <div
        className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1.5 sm:p-2"
        role="tablist"
        aria-label="Ders çalışma sekmeleri"
      >
        {TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`academy-study-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`academy-study-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              data-academy-study-tab={item.id}
              className={`min-h-10 flex-1 rounded-xl px-3 py-2 text-[13px] font-semibold transition sm:flex-none sm:px-4 ${
                selected
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
              }`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "summary" ? (
        <div
          role="tabpanel"
          id="academy-study-panel-summary"
          aria-labelledby="academy-study-tab-summary"
          className="px-5 py-6 sm:px-8 sm:py-8"
          data-academy-study-panel="summary"
        >
          <AcademyMarkdownRenderer
            content={pack.highlightsMarkdown}
            tone="document"
            className="select-text"
          />
        </div>
      ) : null}

      {tab === "transcript" ? (
        <div
          role="tabpanel"
          id="academy-study-panel-transcript"
          aria-labelledby="academy-study-tab-transcript"
          className="px-5 py-6 sm:px-8 sm:py-9"
          data-academy-study-panel="transcript"
        >
          <article
            className="academy-lesson-article text-[16.5px] leading-[1.85] text-slate-900"
            data-academy-lesson-article=""
            data-academy-lesson-body=""
          >
            <AcademyMarkdownRenderer
              content={articleBody}
              tone="document"
              className="select-text"
            />
          </article>
        </div>
      ) : null}

      {tab === "exam" ? (
        <div
          role="tabpanel"
          id="academy-study-panel-exam"
          aria-labelledby="academy-study-tab-exam"
          className="space-y-4 px-5 py-6 sm:px-8 sm:py-8"
          data-academy-study-panel="exam"
        >
          <p className="text-[13px] font-medium text-slate-600">
            Bölüm {lessonOrder} / {lessonTotal}
            {nextLessonTitle ? ` · Sıradaki: ${nextLessonTitle}` : ""}
          </p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
              {course.examEyebrow}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-900">
              {examOpen ? copy.examReady : copy.examBlocked}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-700">
              Geçme barajı {ACADEMY_EXAM_PASS_SCORE}+. Satın alma tek başına belge basmaz;
              müfredatı bitirip testi geçince SHA-256 yetkinlik mührü Kariyer siciline işlenir.
            </p>
            {examOpen ? (
              <LinkButton
                href={academyExamStartGateHref(courseSlug) as Route}
                size="sm"
                variant="success"
                className="mt-4 min-h-10 rounded-full px-5 text-[13px]"
                data-academy-study-exam-cta=""
                data-academy-exam-launch=""
              >
                {copy.examLaunchCta(lessonTotal, lessonTotal, ACADEMY_EXAM_PASS_SCORE)}
              </LinkButton>
            ) : (
              <p className="mt-4 text-[13px] text-slate-600">{copy.nextHint}</p>
            )}
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900">
              {cert.eyebrow}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-900">{cert.description}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
