import "server-only";

import {
  ACADEMY_RECEIPT_SEN,
  academyReceiptGreeting,
  academyReceiptSubject,
} from "@/lib/copy/sen-voice/academy-receipt";
import { lookupCitizenEmail } from "@/lib/kernel/notice/contact";
import { readNoticeMailConfig } from "@/lib/kernel/notice/mail";
import { sendNoticeSmtp } from "@/lib/kernel/notice/smtp";
import { isCurrencyCode, type CurrencyCode } from "@/lib/kernel/money/currency";
import { formatMinor } from "@/lib/kernel/money/format";
import { logEvent } from "@/lib/kernel/observability/log";

/**
 * Akademi satın alma makbuzu — TESPIT E5.
 * Tetik noktası akademi settlement'tır (`purchaseAcademyCourse` applied=true):
 * PayTR webhook'u yalnız ön ödemeli bakiyeyi doldurur (CLEARED→CREDIT), kurs
 * adağı ayrı adımda cüzdandan düşer. Bu yüzden makbuzdaki İşlem Numarası
 * `AcademyPurchase.id` satın alma referansıdır; PayTR `merchant_oid` cüzdan
 * yükleme katmanına aittir ve burada uydurulmaz.
 * SMTP boşsa dürüst atlanır (`SMTP skipped`); nakit/satın alma durmaz. SMTP taşıma hatası
 * throw eder — çağıran (satın alma rotası) yakalar, Inngest retry eder.
 */

export type AcademyReceiptPayload = {
  purchaseId: string;
  userId: string;
  courseTitle: string;
  courseSlug: string;
  amountMinor: number;
  currencyCode: CurrencyCode;
  /** ISO-8601 settlement anı. */
  settledAt: string;
  /** Fatura künyesinden: bireyselde ad soyad, kurumsalda unvan. */
  receiptName: string;
  requestId?: string;
};

export function formatAcademyReceiptDate(settledAt: string): string {
  const date = new Date(settledAt);
  if (Number.isNaN(date.getTime())) {
    return settledAt;
  }
  try {
    const formatted = date.toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${formatted} TSİ`;
  } catch {
    return date.toISOString();
  }
}

export function buildAcademyReceiptSubject(courseTitle: string): string {
  return academyReceiptSubject(courseTitle);
}

function receiptAppOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
}

export function buildAcademyReceiptText(
  payload: AcademyReceiptPayload,
  origin: string = receiptAppOrigin(),
): string {
  const amount = formatMinor(payload.amountMinor, payload.currencyCode);
  const date = formatAcademyReceiptDate(payload.settledAt);
  const cleanOrigin = origin.replace(/\/$/, "");
  const lines = [
    academyReceiptGreeting(payload.receiptName),
    "",
    ACADEMY_RECEIPT_SEN.settledLine,
    "",
    `${ACADEMY_RECEIPT_SEN.fieldCourse}: ${payload.courseTitle.trim()}`,
    `${ACADEMY_RECEIPT_SEN.fieldAmount}: ${amount}`,
    `${ACADEMY_RECEIPT_SEN.fieldDate}: ${date}`,
    `${ACADEMY_RECEIPT_SEN.fieldReference}: ${payload.purchaseId.trim()}`,
    ACADEMY_RECEIPT_SEN.queryHint,
    "",
    ACADEMY_RECEIPT_SEN.licenseLead,
    `${cleanOrigin}/academy/${payload.courseSlug.trim()}/oyna`,
    "",
    ACADEMY_RECEIPT_SEN.invoiceNote,
    "",
    ACADEMY_RECEIPT_SEN.footer,
    "",
  ];
  return lines.join("\n");
}

function isReceiptPayloadValid(payload: AcademyReceiptPayload): boolean {
  return (
    payload.purchaseId.trim().length > 0 &&
    payload.userId.trim().length > 0 &&
    payload.courseTitle.trim().length > 0 &&
    payload.courseSlug.trim().length > 0 &&
    Number.isInteger(payload.amountMinor) &&
    payload.amountMinor >= 0 &&
    isCurrencyCode(payload.currencyCode) &&
    !Number.isNaN(new Date(payload.settledAt).getTime())
  );
}

export const ACADEMY_RECEIPT_SMTP_SKIPPED_REASON = "SMTP skipped" as const;

export async function deliverAcademyReceiptMail(
  payload: AcademyReceiptPayload,
): Promise<"sent" | "skipped"> {
  if (process.env.NODE_ENV === "test") {
    return "skipped";
  }
  const config = readNoticeMailConfig();
  if (!config) {
    logEvent({
      level: "info",
      event: "academy.receipt.mail.skipped",
      userId: payload.userId,
      action: "academy_receipt",
      reason: ACADEMY_RECEIPT_SMTP_SKIPPED_REASON,
      amountMinor: payload.amountMinor,
      applied: true,
      requestId: payload.requestId,
    });
    return "skipped";
  }
  if (!isReceiptPayloadValid(payload)) {
    logEvent({
      level: "warn",
      event: "academy.receipt.mail.skipped",
      userId: payload.userId,
      action: "academy_receipt",
      reason: "invalid_payload",
      applied: true,
      requestId: payload.requestId,
    });
    return "skipped";
  }
  const to = await lookupCitizenEmail(payload.userId);
  if (!to) {
    logEvent({
      level: "info",
      event: "academy.receipt.mail.skipped",
      userId: payload.userId,
      action: "academy_receipt",
      reason: "no_email",
      amountMinor: payload.amountMinor,
      applied: true,
      requestId: payload.requestId,
    });
    return "skipped";
  }
  await sendNoticeSmtp(config, {
    to,
    subject: buildAcademyReceiptSubject(payload.courseTitle),
    text: buildAcademyReceiptText(payload),
    fromName: ACADEMY_RECEIPT_SEN.fromName,
  });
  logEvent({
    level: "info",
    event: "academy.receipt.mail.sent",
    userId: payload.userId,
    action: "academy_receipt",
    amountMinor: payload.amountMinor,
    applied: true,
    requestId: payload.requestId,
  });
  return "sent";
}
