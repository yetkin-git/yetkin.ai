import type { ListingVisaLockId } from "@/lib/kernel/catalog-ids";
import { listingVisaLockTitle } from "@/lib/kernel/catalog-ids";
import { DEFAULT_REVISION_ALLOWANCE } from "@/lib/freelancer/revision-tracker";
import { jobListingExtrasById } from "@/lib/freelancer/job-listing-extras";
import type { FreelancerJobRecord } from "@/lib/freelancer/types";

const LEGACY_CERT_SHORT_NAME: Partial<Record<ListingVisaLockId, string>> = {
  "ai-agent-entegrasyon": "Yapay Zekâ Mühendisliği",
  "yz-muhendislik-agent": "Yapay Zekâ Mühendisliği",
  "web-sitesi-yazilim": "Full-Stack Web Geliştirme",
  "fullstack-web-api": "Full-Stack Web Geliştirme",
  "siber-guvenlik-sunucu-test": "Siber Güvenlik",
  "siber-guvenlik-pentest": "Siber Güvenlik",
  "logo-gorsel-sosyal-medya": "UI/UX Tasarım",
  "uiux-tasarim-sistemleri": "UI/UX Tasarım",
};

export type JobListingFace = {
  formats: readonly string[];
  durationDays: number | null;
  requirements: readonly string[];
  revisionAllowance: number;
};

export function listingCertShortName(lockId: ListingVisaLockId): string {
  return LEGACY_CERT_SHORT_NAME[lockId] ?? listingVisaLockTitle(lockId) ?? "Akademi";
}

export function jobListingFace(
  job: Pick<FreelancerJobRecord, "id" | "dueDays">,
): JobListingFace {
  /** Format / gereksinim tohum extras; süre önce DB `due_days`. */
  const extras = jobListingExtrasById(job.id);
  return {
    formats: extras?.formats ?? [],
    durationDays: job.dueDays ?? extras?.durationDays ?? null,
    requirements: extras?.requirements ?? [],
    revisionAllowance: extras?.revisionAllowance ?? DEFAULT_REVISION_ALLOWANCE,
  };
}

export function jobListingMetaLine(face: JobListingFace): string | undefined {
  const parts: string[] = [];
  if (face.formats.length > 0) {
    parts.push(face.formats.join(", "));
  }
  if (face.durationDays != null && face.durationDays > 0) {
    parts.push(`${face.durationDays} gün`);
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}
