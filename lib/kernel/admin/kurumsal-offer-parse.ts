export const KURUMSAL_OFFER_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "WON",
  "LOST",
] as const;

export type KurumsalOfferRequestStatusValue = (typeof KURUMSAL_OFFER_STATUSES)[number];
export type KurumsalOfferStatusFilter = KurumsalOfferRequestStatusValue | "ALL";

export type KurumsalOfferRow = {
  id: string;
  companyName: string;
  email: string;
  packageKey: string;
  packageLabel: string;
  city: string;
  note: string;
  status: KurumsalOfferRequestStatusValue;
  adminNote: string;
  quotedAmountMinor: number | null;
  handledAt: string | null;
  handledBy: string | null;
  createdAt: string;
};

const UPDATABLE = new Set<KurumsalOfferRequestStatusValue>([
  "CONTACTED",
  "QUALIFIED",
  "WON",
  "LOST",
]);

export function parseKurumsalOfferStatusFilter(raw: string | null | undefined): KurumsalOfferStatusFilter {
  if (!raw || raw === "ALL") {
    return "ALL";
  }
  const upper = raw.trim().toUpperCase();
  return (KURUMSAL_OFFER_STATUSES as readonly string[]).includes(upper)
    ? (upper as KurumsalOfferRequestStatusValue)
    : "ALL";
}

export function parseKurumsalOfferPatchBody(
  body: unknown,
): { status: KurumsalOfferRequestStatusValue; adminNote: string } | { error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Güncelleme gövdesi geçersiz." };
  }
  const record = body as Record<string, unknown>;
  const statusRaw = typeof record.status === "string" ? record.status.trim().toUpperCase() : "";
  if (!(KURUMSAL_OFFER_STATUSES as readonly string[]).includes(statusRaw)) {
    return { error: "Durum geçersiz." };
  }
  const status = statusRaw as KurumsalOfferRequestStatusValue;
  if (!UPDATABLE.has(status) && status !== "NEW") {
    return { error: "Durum güncellenemez." };
  }
  if (status === "NEW") {
    return { error: "Durum NEW’e geri alınmaz; CONTACTED / QUALIFIED / WON / LOST seç." };
  }
  const adminNote =
    typeof record.adminNote === "string"
      ? record.adminNote.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 1000)
      : "";
  if (adminNote.length > 0 && adminNote.length < 4) {
    return { error: "Operasyon notu en az 4 karakter olmalı." };
  }
  return { status, adminNote };
}
