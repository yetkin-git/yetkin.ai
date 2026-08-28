import { LinkButton } from "@/components/ui/link-button";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { listingVisaScopeSign } from "@/lib/career/visa-scope-board";
import type { ListingVisaSubject } from "@/lib/career/listing-visa-scope";

export function ListingVisaScopeSign({ listing }: { listing: ListingVisaSubject }) {
  const copy = FREELANCER_SEN.job;
  const sign = listingVisaScopeSign(listing);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[var(--foreground)]">{copy.visaScopeTitle}</p>
      <p className="text-sm leading-6 text-[var(--muted)]">
        {copy.visaScopeLead(sign.pathwayTitle)}
      </p>
      <ul className="space-y-2">
        {sign.courses.map((course) => (
          <li key={course.slug}>
            <LinkButton href={course.href} variant="outline" size="sm">
              {course.title}
            </LinkButton>
          </li>
        ))}
      </ul>
    </div>
  );
}
