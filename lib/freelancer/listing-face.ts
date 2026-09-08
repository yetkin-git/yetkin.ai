import type { ListingVisaLockId } from "@/lib/kernel/catalog-ids";
import {
  FREELANCER_OPEN_TRIAL_NEED_ID,
  isFreelancerSystemListing,
  listingVisaLockTitle,
  parseFreelancerNeedId,
} from "@/lib/kernel/catalog-ids";
import { freelancerJobStatusLabel } from "@/lib/copy/status-labels";
import { DEFAULT_REVISION_ALLOWANCE } from "@/lib/freelancer/revision-tracker";
import { jobListingExtrasById } from "@/lib/freelancer/job-listing-extras";
import type { FreelancerJobRecord } from "@/lib/freelancer/types";

const NEED_CERT_SHORT_NAME: Partial<Record<string, string>> = {
  "excel-veri-otomasyon": "Ofis Yapay Zekâ",
  "eticaret-pazaryeri": "E-Ticaret Asistanlığı",
  "logo-gorsel-sosyal-medya": "Sosyal Medya İçerik",
  "chatbot-musteri-hizmetleri": "Kodsuz Chatbot",
  "prompt-uretkenlik": "Prompt Üretkenlik",
  "yazilim-web-mobil": "Yazılım, Web & Mobil",
  "grafik-tasarim-kimlik": "Grafik Tasarım",
  "dijital-pazarlama-seo": "Dijital Pazarlama",
  "ceviri-metin-yazarligi": "Çeviri & Metin",
  "diger-genel-isler": "Genel İşler",
  [FREELANCER_OPEN_TRIAL_NEED_ID]: "Açık Deneme",
};

export type JobListingFace = {
  formats: readonly string[];
  durationDays: number | null;
  requirements: readonly string[];
  revisionAllowance: number;
};

export type JobListingStatusTone = "emerald" | "safir" | "neutral";

export type JobListingStatusFace = {
  label: string;
  tone: JobListingStatusTone;
  isSystemListing: boolean;
};

/** Tohum/sistem OPEN ilanı — yeşil «Açık» piyasa yanılsaması yok. */
export const FREELANCER_SYSTEM_LISTING_STATUS_LABEL = "Platform örneği / Pasif" as const;

/** Canlı DB tohumu gecikse bile vatandaş yüzü pazaryeri kelimesini basmaz. */
export function jobListingDisplayCopy(
  job: Pick<FreelancerJobRecord, "id" | "title" | "brief">,
): { title: string; brief: string } {
  return {
    title: job.title.replaceAll("E-Ticaret Pazaryeri Asistanlığı", "E-Ticaret Asistanlığı"),
    brief: job.brief.replaceAll("pazaryeri ürün kartı", "e-ticaret ürün kartı"),
  };
}

export function listingCertShortName(lockId: ListingVisaLockId): string {
  const canonical = parseFreelancerNeedId(lockId) ?? lockId;
  return NEED_CERT_SHORT_NAME[canonical] ?? listingVisaLockTitle(canonical) ?? "Akademi";
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

export function jobListingStatusFace(
  job: Pick<FreelancerJobRecord, "id" | "status">,
): JobListingStatusFace {
  const isSystemListing = isFreelancerSystemListing(job.id);
  if (job.status === "OPEN" && isSystemListing) {
    return {
      label: FREELANCER_SYSTEM_LISTING_STATUS_LABEL,
      tone: "safir",
      isSystemListing: true,
    };
  }
  return {
    label: freelancerJobStatusLabel(job.status),
    tone: job.status === "OPEN" ? "emerald" : "neutral",
    isSystemListing,
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

/** Organik açık ilan / hazine tohum örneği — kod silinmez, vitrin ayrılır. */
export function partitionFreelancerBoardJobs<T extends { id: string }>(
  jobs: readonly T[],
): { live: T[]; examples: T[] } {
  const live: T[] = [];
  const examples: T[] = [];
  for (const job of jobs) {
    if (isFreelancerSystemListing(job.id)) {
      examples.push(job);
    } else {
      live.push(job);
    }
  }
  return { live, examples };
}
