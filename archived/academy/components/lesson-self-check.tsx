"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { loadAcademyLessonExam } from "@/lib/academy/lesson-exams";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

export function LessonSelfCheck({ lessonKey }: { lessonKey: string }) {
  const copy = ACADEMY_SEN.player;
  const exam = useMemo(() => loadAcademyLessonExam(lessonKey), [lessonKey]);
  const questions = exam?.questions.slice(0, 3) ?? [];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
  }, [lessonKey]);

  if (!exam || questions.length < 3) {
    return (
      <p className="text-[14px] leading-relaxed text-slate-600" data-academy-self-check-missing="">
        {copy.selfCheckMissing}
      </p>
    );
  }

  const answered = questions.every((question) => Number.isInteger(answers[question.id]));
  const correctCount = submitted
    ? questions.filter((question) => answers[question.id] === question.correctIndex).length
    : 0;

  return (
    <div
      className="space-y-5"
      data-academy-self-check=""
      data-academy-self-check-ungraded={submitted ? undefined : ""}
      data-academy-self-check-result={submitted ? String(correctCount) : undefined}
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
          {copy.selfCheckTitle}
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-800">{copy.selfCheckLead}</p>
      </div>

      <ol className="space-y-4">
        {questions.map((question, index) => {
          const selected = answers[question.id];
          const showKey = submitted;
          return (
            <li
              key={question.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
              data-academy-self-check-question={question.id}
            >
              <p className="text-[14px] font-semibold leading-relaxed text-slate-900">
                {index + 1}. {question.prompt}
              </p>
              <fieldset className="mt-3 space-y-2" disabled={submitted}>
                <legend className="sr-only">Soru {index + 1}</legend>
                {question.choices.map((choice, choiceIndex) => {
                  const isSelected = selected === choiceIndex;
                  const isCorrect = choiceIndex === question.correctIndex;
                  const mark =
                    showKey && isCorrect ? "ring-2 ring-emerald-400 bg-emerald-50" : "";
                  const miss = showKey && isSelected && !isCorrect ? "ring-2 ring-rose-300 bg-rose-50" : "";
                  return (
                    <label
                      key={`${question.id}-${choiceIndex}`}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[14px] leading-relaxed text-slate-800 ${mark} ${miss}`}
                    >
                      <input
                        type="radio"
                        className="mt-1"
                        name={question.id}
                        value={choiceIndex}
                        checked={isSelected}
                        onChange={() =>
                          setAnswers((current) => ({ ...current, [question.id]: choiceIndex }))
                        }
                      />
                      <span>{choice}</span>
                    </label>
                  );
                })}
              </fieldset>
              {showKey ? (
                <p className="mt-3 text-[13px] font-medium text-slate-700">
                  {selected === question.correctIndex ? copy.selfCheckCorrect : copy.selfCheckWrong}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {submitted ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[14px] font-semibold text-slate-900">{copy.selfCheckScore(correctCount, questions.length)}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full"
            data-academy-self-check-retry=""
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
          >
            {copy.selfCheckRetry}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="rounded-full"
          disabled={!answered}
          data-academy-self-check-submit=""
          onClick={() => setSubmitted(true)}
        >
          {copy.selfCheckSubmit}
        </Button>
      )}
    </div>
  );
}
