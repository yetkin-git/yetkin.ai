import { Card } from "@/components/ui/card";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

const ITEMS = [
  ["excel", "deliverableExcelTitle", "deliverableExcelBody"],
  ["prompts", "deliverablePromptTitle", "deliverablePromptBody"],
  ["certificate", "deliverableCertificateTitle", "deliverableCertificateBody"],
] as const;

/** OFF-101 antre — eğitim sonu üç somut parça. */
export function CourseDeliverables() {
  const copy = ACADEMY_SEN.course;
  return (
    <section data-academy-deliverables="">
      <Card eyebrow={copy.deliverablesEyebrow} title={copy.deliverablesTitle} variant="featured">
        <p className="mb-4 text-sm leading-6 text-[var(--foreground)]">{copy.deliverablesLead}</p>
        <ul className="grid gap-3 sm:grid-cols-3">
          {ITEMS.map(([id, titleKey, bodyKey]) => (
            <li
              key={id}
              data-academy-deliverable={id}
              className="rounded-2xl border border-[var(--border)] bg-white p-4"
            >
              <p className="text-sm font-semibold text-[var(--foreground)]">{copy[titleKey]}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy[bodyKey]}</p>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
