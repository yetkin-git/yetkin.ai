import type { AcademyHowtoStep } from "@/lib/academy/lesson-beat-visual";

export function LessonHowtoSteps({
  steps,
  activeIndex,
}: {
  steps: readonly AcademyHowtoStep[];
  activeIndex: number;
}) {
  return (
    <ol
      className="academy-howto-band"
      data-academy-howto-band=""
      data-academy-howto-active={activeIndex}
      aria-label="Nasıl yapılır adımları"
    >
      {steps.map((step, index) => {
        const state = index < activeIndex ? "done" : index === activeIndex ? "active" : "next";
        return (
          <li
            key={step.n}
            className="academy-howto-step"
            data-academy-howto-step={step.n}
            data-state={state}
          >
            <span>{`Adım ${step.n}: ${step.label}`}</span>
          </li>
        );
      })}
    </ol>
  );
}
