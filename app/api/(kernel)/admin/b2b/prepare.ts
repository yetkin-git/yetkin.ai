import {
  composeGrantOffer,
  composeTetkikOffer,
  type B2bLeadInput,
} from "@/lib/kernel/admin/b2b-outbound";
import { measurePublicTetkik } from "@/lib/tezgah/tetkik/b2b-measure";
import { assessB2bGrant, type B2bGrantCall } from "@/lib/yetkinhibe/b2b-sector-match";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";

export type PreparedB2bDraft = {
  status: "DRAFT_READY" | "FAILED";
  subject: string;
  body: string;
  score: number | null;
  note: string;
  findingsJson: string;
};

function clipNote(value: string): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length <= 500 ? clean : clean.slice(0, 500);
}

export async function loadB2bGrantCalls(): Promise<readonly B2bGrantCall[] | null> {
  try {
    const catalog = await loadYetkinhibeGrantCatalog(new Date());
    return catalog.map((entry) => ({
      id: entry.id,
      title: entry.title,
      sourceLabel: entry.sourceLabel,
      officialInfoUrl: entry.officialInfoUrl,
      status: entry.status,
      remainingDays: entry.remainingDays,
      poolAmountMinor: entry.poolAmountMinor,
      maxSupportMinor: entry.maxSupportMinor,
      supportRatioBps: entry.supportRatioBps,
      sourceVerifiedAt: entry.sourceVerifiedAt,
      eligibility: entry.eligibility,
      applicationDeadline: entry.applicationDeadline,
    }));
  } catch {
    return null;
  }
}

export async function prepareB2bDraft(
  item: B2bLeadInput,
  calls: readonly B2bGrantCall[] | null,
): Promise<PreparedB2bDraft> {
  if (item.channel === "WEB_TETKIK") {
    const measured = await measurePublicTetkik(item.websiteUrl ?? "");
    if (!measured.ok) {
      return {
        status: "FAILED",
        subject: "",
        body: "",
        score: null,
        note: clipNote(measured.error),
        findingsJson: JSON.stringify({ note: measured.error }),
      };
    }
    const draft = composeTetkikOffer({
      companyName: item.companyName,
      url: measured.url,
      score: measured.score,
      gaps: measured.gaps,
      disclaimer: measured.disclaimer,
    });
    return {
      status: "DRAFT_READY",
      subject: draft.subject,
      body: draft.body,
      score: measured.score,
      note: clipNote(`Skor ${measured.score}/100. ${measured.gaps.map((gap) => gap.label).join(", ")}`),
      findingsJson: JSON.stringify({
        score: measured.score,
        url: measured.url,
        gaps: measured.gaps,
        disclaimer: measured.disclaimer,
      }),
    };
  }

  const reading = assessB2bGrant({ sector: item.sector, city: item.city, calls });
  const draft = composeGrantOffer({
    companyName: item.companyName,
    sector: item.sector,
    city: item.city,
    grantTitle: reading.grantTitle,
    deadlineLabel: reading.deadlineLabel,
    windowOpen: reading.windowOpen,
    listedEligible: reading.listedEligible,
    axesResolved: reading.axesResolved,
    note: reading.note,
  });
  return {
    status: "DRAFT_READY",
    subject: draft.subject,
    body: draft.body,
    score: null,
    note: clipNote(reading.unresolved ?? reading.assumption),
    findingsJson: JSON.stringify({
      grantTitle: reading.grantTitle,
      deadlineLabel: reading.deadlineLabel,
      windowOpen: reading.windowOpen,
      listedEligible: reading.listedEligible,
      axesResolved: reading.axesResolved,
      note: reading.note,
    }),
  };
}
