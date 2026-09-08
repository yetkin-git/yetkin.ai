import { LinkButton } from "@/components/ui/link-button";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { listingVisaScopeSign } from "@/lib/career/visa-scope-board";
import type { ListingVisaSubject } from "@/lib/career/listing-visa-scope";
import type { Route } from "next";

export function ListingVisaScopeSign({ listing }: { listing: ListingVisaSubject }) {
  const copy = FREELANCER_SEN.job;
  const sign = listingVisaScopeSign(listing);

  if (sign.courses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[var(--foreground)]">{copy.visaScopeTitle}</p>
      <p className="text-sm leading-6 text-[var(--muted)]">
        {copy.visaScopeLead(sign.pathwayTitle)}
      </p>
      <ul className="space-y-3">
        {sign.courses.map((course) => (
          <li key={course.slug} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <p className="text-sm text-[var(--foreground)]">{course.title}</p>
            <LinkButton href={course.href as Route} variant="primary" size="sm">
              {copy.visaCta}
            </LinkButton>
          </li>
        ))}
      </ul>
    </div>
  );
}
