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

/** Beş faz sırası. Atlama ve geri dönüş yoktur. */
export const GRANT_LIFECYCLE_PHASE_ORDER = [
  "APPLICATION_APPROVAL",
  "INTERIM_REPORT",
  "INVOICE_SGK",
  "AUDITOR_VISIT",
  "PAYOUT",
] as const satisfies readonly GrantLifecyclePhaseKey[];

export const GRANT_PHASE_LABEL: Record<GrantLifecyclePhaseKey, string> = {
  APPLICATION_APPROVAL: "Başvuru onayı",
  INTERIM_REPORT: "Ara rapor",
  INVOICE_SGK: "Fatura ve SGK",
  AUDITOR_VISIT: "Denetçi ziyareti",
  PAYOUT: "Ödeme",
};

export const HIBE_DOCUMENT_CATEGORIES = [
  "VERGI_LEVHASI",
  "SGK_HIZMET",
  "FATURA_MAKBUZ",
  "TEKNIK_RAPOR",
  "DIGER",
] as const;

export type HibeDocumentCategory = (typeof HIBE_DOCUMENT_CATEGORIES)[number];

export const HIBE_DOCUMENT_STATUSES = ["approved", "pending", "missing", "rejected"] as const;

export type HibeDocumentStatus = (typeof HIBE_DOCUMENT_STATUSES)[number];

export const DEADLINE_REMINDER_DAYS = [7, 3, 1] as const;

export type DeadlineReminderDay = (typeof DEADLINE_REMINDER_DAYS)[number];

export type DeadlineReminder = {
  days: DeadlineReminderDay;
  severity: "info" | "warning" | "critical";
  message: string;
};

const ISTANBUL = "Europe/Istanbul";

function istanbulDayNumber(value: Date): number | null {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ISTANBUL,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function isGrantLifecyclePhase(value: string): value is GrantLifecyclePhaseKey {
  return (GRANT_LIFECYCLE_PHASE_ORDER as readonly string[]).includes(value);
}

export function grantPhaseLabel(phase: GrantLifecyclePhaseKey): string {
  return GRANT_PHASE_LABEL[phase];
}

export function nextGrantLifecyclePhase(current: GrantLifecyclePhaseKey): GrantLifecyclePhaseKey | null {
  const index = GRANT_LIFECYCLE_PHASE_ORDER.indexOf(current);
  if (index < 0 || index >= GRANT_LIFECYCLE_PHASE_ORDER.length - 1) {
    return null;
  }
  return GRANT_LIFECYCLE_PHASE_ORDER[index + 1] ?? null;
}

/** Sıradaki faz değilse Türkçe hata. Geçerliyse null. */
export function phaseAdvanceError(current: string, requested: string): string | null {
  if (!isGrantLifecyclePhase(current) || !isGrantLifecyclePhase(requested)) {
    return "Faz kaydı okunamadı.";
  }
  const next = nextGrantLifecyclePhase(current);
  if (next === null) {
    return "Ödeme fazından sonra geçiş yok.";
  }
  if (requested !== next) {
    return "Faz sırası atlanamaz. Sıradaki faza geçersin.";
  }
  return null;
}

/** İstanbul takvim günü. Negatif değer gecikmedir. Tarih bozuksa null. */
export function daysUntilDeadline(deadline: Date, now: Date): number | null {
  if (Number.isNaN(deadline.getTime()) || Number.isNaN(now.getTime())) {
    return null;
  }
  const target = istanbulDayNumber(deadline);
  const today = istanbulDayNumber(now);
  if (target === null || today === null) {
    return null;
  }
  return target - today;
}

/** Yalnız 7, 3 ve 1 gün kala uyarı. Diğer günler sessizdir. */
export function deadlineReminder(deadline: Date, now: Date): DeadlineReminder | null {
  const days = daysUntilDeadline(deadline, now);
  if (days !== 7 && days !== 3 && days !== 1) {
    return null;
  }
  const severity = days === 1 ? "critical" : days === 3 ? "warning" : "info";
  return {
    days,
    severity,
    message: `Son tarihe ${days} gün kaldı. Başvuru satırını sen kontrol edersin.`,
  };
}

export function isHibeDocumentCategory(value: string): value is HibeDocumentCategory {
  return (HIBE_DOCUMENT_CATEGORIES as readonly string[]).includes(value);
}

export function isHibeDocumentStatus(value: string): value is HibeDocumentStatus {
  return (HIBE_DOCUMENT_STATUSES as readonly string[]).includes(value);
}

export function hibeDocumentStatusLabel(status: HibeDocumentStatus): "Onaylı" | "Bekliyor" | "Eksik" | "Red" {
  if (status === "approved") return "Onaylı";
  if (status === "pending") return "Bekliyor";
  if (status === "missing") return "Eksik";
  return "Red";
}

export function hibeDocumentCategoryLabel(category: HibeDocumentCategory): string {
  if (category === "VERGI_LEVHASI") return "Vergi levhası";
  if (category === "SGK_HIZMET") return "SGK hizmet dökümü";
  if (category === "FATURA_MAKBUZ") return "Fatura / makbuz";
  if (category === "TEKNIK_RAPOR") return "Teknik rapor";
  return "Diğer";
}
