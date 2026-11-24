import type { GrantLifecyclePhaseKey, HibeDocumentCategory, HibeDocumentStatus } from "@/lib/yetkinhibe/grant-lifecycle";

export type HibeDocumentView = {
  id: string;
  title: string;
  category: HibeDocumentCategory;
  categoryLabel: string;
  status: HibeDocumentStatus;
  statusLabel: string;
  fileUrl: string | null;
  referenceCode: string | null;
  reviewerNote: string | null;
};

export type HibeApplicationView = {
  id: string;
  title: string;
  phase: GrantLifecyclePhaseKey;
  phaseLabel: string;
  nextDeadlineAt: string | null;
  remainingDays: number | null;
  alert: string | null;
  alertSeverity: "info" | "warning" | "critical" | null;
  notes: string | null;
  grantCallId: string;
  clientId: string | null;
  documents: HibeDocumentView[];
};
