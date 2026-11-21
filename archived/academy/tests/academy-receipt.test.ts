import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildAcademyReceiptSubject,
  buildAcademyReceiptText,
  deliverAcademyReceiptMail,
  formatAcademyReceiptDate,
  type AcademyReceiptPayload,
} from "@/lib/kernel/notice/academy-receipt-mail";
import { lookupCitizenEmail } from "@/lib/kernel/notice/contact";
import { sendNoticeSmtp } from "@/lib/kernel/notice/smtp";

vi.mock("@/lib/kernel/notice/contact", () => ({ lookupCitizenEmail: vi.fn() }));
vi.mock("@/lib/kernel/notice/smtp", () => ({ sendNoticeSmtp: vi.fn() }));

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function receiptPayload(): AcademyReceiptPayload {
  return {
    purchaseId: "purchase-receipt-1",
    userId: "11111111-1111-4111-8111-111111111111",
    courseTitle: "Ofis AI",
    courseSlug: "ofis-ai",
    amountMinor: 25000,
    currencyCode: "TRY",
    settledAt: "2026-09-09T10:30:00.000Z",
    receiptName: "Ayşe Kaya",
    requestId: "req-receipt-1",
  };
}

/** verify:sen-axis siz kaçakları — makbuz metni sen dilidir. */
const SIZ_LEAKS = [
  "hesabınıza",
  "e-postanıza",
  "bakiyenizi",
  "kullanabilirsiniz",
  "yapabilirsiniz",
  "Hoş geldiniz",
] as const;

describe("akademi satın alma makbuzu (E5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("şablon beş zorunlu alanı basar: ad, eğitim, tutar KDV dahil, tarih, işlem no", () => {
    const payload = receiptPayload();
    expect(buildAcademyReceiptSubject(payload.courseTitle)).toBe("Eğitim makbuzun: Ofis AI");
    const text = buildAcademyReceiptText(payload, "https://yetkin.ai");
    expect(text).toContain("Merhaba Ayşe Kaya,");
    expect(text).toContain("Eğitim: Ofis AI");
    expect(text).toContain("Tutar (KDV dahil): ₺250,00");
    expect(text).toContain("İşlem Numarası: purchase-receipt-1");
    expect(text).toContain("09 Eylül 2026");
    expect(text).toContain("13:30");
    expect(text).toContain("TSİ");
  });

  it("şablon dürüst notları basar: 365 gün, e-Arşiv değildir, destek, oyna bağı", () => {
    const text = buildAcademyReceiptText(receiptPayload(), "https://yetkin.ai/");
    expect(text).toContain("365 gün");
    expect(text).toContain("Otomatik e-Arşiv paneli değildir");
    expect(text).toContain("destek@yetkin.ai");
    expect(text).toContain("https://yetkin.ai/academy/ofis-ai/oyna");
    expect(text).toContain("Bu numarayla destekten sorgulayabilirsin.");
  });

  it("şablon sen dilidir; siz kaçağı taşımaz", () => {
    const text = buildAcademyReceiptText(receiptPayload(), "https://yetkin.ai");
    for (const leak of SIZ_LEAKS) {
      expect(text).not.toContain(leak);
    }
    expect(text).toContain("hesabına");
    expect(text).toContain("e-postana");
  });

  it("tarih bozuksa ham metin döner; throw etmez", () => {
    expect(formatAcademyReceiptDate("bozuk-tarih")).toBe("bozuk-tarih");
    expect(formatAcademyReceiptDate("2026-09-09T10:30:00.000Z")).toContain("TSİ");
  });

  it("ad boşsa selamlama generic düşer; makbuz yine kurulur", () => {
    const text = buildAcademyReceiptText(
      { ...receiptPayload(), receiptName: "   " },
      "https://yetkin.ai",
    );
    expect(text.startsWith("Merhaba,")).toBe(true);
    expect(text).toContain("İşlem Numarası: purchase-receipt-1");
  });

  it("SMTP boşsa dürüst atlanır; soket açılmaz, throw yok", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NOTICE_SMTP_HOST", "");
    vi.stubEnv("NOTICE_MAIL_FROM", "");
    const status = await deliverAcademyReceiptMail(receiptPayload());
    expect(status).toBe("skipped");
    expect(lookupCitizenEmail).not.toHaveBeenCalled();
    expect(sendNoticeSmtp).not.toHaveBeenCalled();
  });

  it("SMTP boş logu SMTP skipped der; satın alma kırılmaz", () => {
    const src = readSrc("lib/kernel/notice/academy-receipt-mail.ts");
    expect(src).toContain('ACADEMY_RECEIPT_SMTP_SKIPPED_REASON = "SMTP skipped"');
    expect(src).toContain("reason: ACADEMY_RECEIPT_SMTP_SKIPPED_REASON");
    const route = readSrc("app/api/academy/courses/[id]/purchase/route.ts");
    expect(route).toContain("queueAcademyReceiptMail");
    expect(route).toContain("academy.receipt.direct_failed");
  });

  it("test ortamında gönderim kapalıdır", async () => {
    vi.stubEnv("NOTICE_SMTP_HOST", "smtp.example.test");
    vi.stubEnv("NOTICE_MAIL_FROM", "ops@example.test");
    const status = await deliverAcademyReceiptMail(receiptPayload());
    expect(status).toBe("skipped");
    expect(sendNoticeSmtp).not.toHaveBeenCalled();
  });

  it("e-posta yoksa atlanır; SMTP'ye inilmez", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NOTICE_SMTP_HOST", "smtp.example.test");
    vi.stubEnv("NOTICE_MAIL_FROM", "ops@example.test");
    vi.mocked(lookupCitizenEmail).mockResolvedValue(null);
    const status = await deliverAcademyReceiptMail(receiptPayload());
    expect(status).toBe("skipped");
    expect(sendNoticeSmtp).not.toHaveBeenCalled();
  });

  it("bozuk payload atlanır; throw yok (fail-safe)", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NOTICE_SMTP_HOST", "smtp.example.test");
    vi.stubEnv("NOTICE_MAIL_FROM", "ops@example.test");
    const status = await deliverAcademyReceiptMail({
      ...receiptPayload(),
      purchaseId: "   ",
      settledAt: "bozuk",
    });
    expect(status).toBe("skipped");
    expect(lookupCitizenEmail).not.toHaveBeenCalled();
    expect(sendNoticeSmtp).not.toHaveBeenCalled();
  });

  it("yapılandırılmış SMTP + kayıtlı e-posta → sent; konu ve metin makbuzu taşır", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NOTICE_SMTP_HOST", "smtp.example.test");
    vi.stubEnv("NOTICE_MAIL_FROM", "ops@example.test");
    vi.mocked(lookupCitizenEmail).mockResolvedValue("ayse@example.test");
    vi.mocked(sendNoticeSmtp).mockResolvedValue(undefined);
    const status = await deliverAcademyReceiptMail(receiptPayload());
    expect(status).toBe("sent");
    expect(lookupCitizenEmail).toHaveBeenCalledWith(receiptPayload().userId);
    expect(sendNoticeSmtp).toHaveBeenCalledTimes(1);
    const [, mail] = vi.mocked(sendNoticeSmtp).mock.calls[0] ?? [];
    expect(mail?.to).toBe("ayse@example.test");
    expect(mail?.subject).toBe("Eğitim makbuzun: Ofis AI");
    expect(mail?.fromName).toBe("yetkin.ai");
    expect(mail?.text).toContain("Ayşe Kaya");
    expect(mail?.text).toContain("purchase-receipt-1");
    expect(mail?.text).toContain("₺250,00");
  });

  it("SMTP taşıma hatası throw eder — çağıran yakalar, Inngest retry eder", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NOTICE_SMTP_HOST", "smtp.example.test");
    vi.stubEnv("NOTICE_MAIL_FROM", "ops@example.test");
    vi.mocked(lookupCitizenEmail).mockResolvedValue("ayse@example.test");
    vi.mocked(sendNoticeSmtp).mockRejectedValue(new Error("smtp_timeout"));
    await expect(deliverAcademyReceiptMail(receiptPayload())).rejects.toThrow("smtp_timeout");
  });

  it("yüzey: satın alma rotası applied settlement sonrası makbuzu kuyruğa atar", () => {
    const route = readSrc("app/api/academy/courses/[id]/purchase/route.ts");
    expect(route).toContain("ACADEMY_RECEIPT_REQUESTED");
    expect(route).toContain("queueAcademyReceiptMail");
    expect(route).toContain("if (result.applied)");
    expect(route).toContain("canSendInngestEvents");
    expect(route).toContain("academy.receipt.queued");
    expect(route).toContain("academy.receipt.direct_failed");
    expect(route).not.toContain("merchant_oid");
  });

  it("yüzey: Inngest makbuz fonksiyonu kayıtlı; env + readiness E5 dilini basar", () => {
    const inngest = readSrc("lib/kernel/jobs/inngest.ts");
    expect(inngest).toContain("ACADEMY_RECEIPT_REQUESTED");
    expect(inngest).toContain("academy-receipt-send");
    expect(inngest).toContain("event.data.purchaseId");
    expect(inngest).toContain("academyReceiptSend");
    const envExample = readSrc(".env.example");
    expect(envExample).toContain("NOTICE_SMTP_HOST");
    expect(envExample).toContain("NOTICE_SMTP_PORT");
    expect(envExample).toContain("NOTICE_SMTP_USER");
    expect(envExample).toContain("NOTICE_SMTP_PASS");
    expect(envExample).toContain("NOTICE_MAIL_FROM");
    expect(envExample).toContain("akademi satın alma makbuzu");
    expect(readSrc("lib/kernel/jobs/runtime-readiness.ts")).toContain("deliverAcademyReceiptMail");
    expect(readSrc("scripts/ops-runtime-readiness-lib.ts")).toContain("akademi makbuzu");
  });
});
