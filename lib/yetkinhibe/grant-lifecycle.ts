/**
 * YetkinHibe yaşam döngüsü — faz ve evrak türleri, aktif başvuru seçimi, proje başlığı.
 * Bu modülde ilerleme veya onay durumu üreten fonksiyon yoktur. Durum yalnız gerçek başvuru
 * kayıtlarından okunur (Anayasa A5: sahte bakiye, onay veya veri yok).
 */

export type GrantLifecyclePhaseKey =
  | "APPLICATION_APPROVAL"
  | "INTERIM_REPORT"
  | "INVOICE_SGK"
  | "AUDITOR_VISIT"
  | "PAYOUT";

export type GrantLifecyclePhaseStatus = "completed" | "active" | "upcoming";

export type GrantDocumentStatus = "approved" | "pending" | "missing" | "rejected";

export type GrantDocumentCategory =
  | "SGK"
  | "FINANCE"
  | "TECHNICAL"
  | "REPORT"
  | "AUDIT";

export type GrantLifecyclePhase = {
  key: GrantLifecyclePhaseKey;
  order: number;
  status: GrantLifecyclePhaseStatus;
  /** ISO date — faz tamamlandıysa veya aktif faz deadline'ı */
  deadlineIso: string | null;
  /** Kalan gün — negatif ise gecikmiş */
  remainingDays: number | null;
};

export type GrantLifecycleDocument = {
  id: string;
  label: string;
  category: GrantDocumentCategory;
  status: GrantDocumentStatus;
  requiredByIso: string | null;
  uploadedAtIso: string | null;
  /** Ajans/freelancer modunda evrakı yükleyen taraf */
  uploaderRole: "company" | "agency" | "freelancer";
};

export type GrantLifecycleAiAlert = {
  severity: "info" | "warning" | "critical";
  message: string;
  daysUntilDeadline: number | null;
};

export type GrantLifecycleState = {
  applicationId: string;
  projectTitle: string;
  grantTitle: string;
  monitoringMonths: number;
  currentPhaseKey: GrantLifecyclePhaseKey;
  currentPhaseLabel: string;
  completionPct: number;
  phases: readonly GrantLifecyclePhase[];
  documents: readonly GrantLifecycleDocument[];
  aiAlert: GrantLifecycleAiAlert | null;
  nextCriticalDeadlineIso: string | null;
  nextCriticalDeadlineLabel: string | null;
};

/** Aktif izleme süreci sayılan başvuru durumları */
export const ACTIVE_LIFECYCLE_STATUSES = ["IN_PREPARATION", "SUBMITTED"] as const;

export type ActiveLifecycleApplication = {
  id: string;
  grantId: string;
  grantTitle: string;
  /** Proje başlığı — yoksa grantTitle kullanılır */
  projectTitle?: string;
  status: string;
  matchScorePct: number;
  readinessPct: number;
  totalBudgetLabel: string;
  requestedSupportLabel: string;
  updatedAt?: string;
};

export function filterActiveLifecycleApplications(
  applications: ActiveLifecycleApplication[],
): ActiveLifecycleApplication[] {
  return applications.filter((app) =>
    (ACTIVE_LIFECYCLE_STATUSES as readonly string[]).includes(app.status),
  );
}

export function pickPrimaryLifecycleApplication(
  applications: ActiveLifecycleApplication[],
): ActiveLifecycleApplication | null {
  const active = filterActiveLifecycleApplications(applications);
  if (active.length === 0) return null;

  const statusPriority: Record<string, number> = {
    SUBMITTED: 2,
    IN_PREPARATION: 1,
  };

  return [...active].sort((a, b) => {
    const pa = statusPriority[a.status] ?? 0;
    const pb = statusPriority[b.status] ?? 0;
    if (pb !== pa) return pb - pa;
    return (b.readinessPct ?? 0) - (a.readinessPct ?? 0);
  })[0]!;
}

/** İş paketi JSON'undan veya hibe başlığından proje adı türetir. */
export function deriveGrantProjectTitle(
  workPackagesJson: unknown,
  grantTitle: string,
): string {
  if (Array.isArray(workPackagesJson)) {
    const first = workPackagesJson[0];
    if (first && typeof first === "object" && first !== null && "name" in first) {
      const name = String((first as { name: unknown }).name).trim();
      if (name.length > 0) return name;
    }
  }
  return grantTitle;
}
