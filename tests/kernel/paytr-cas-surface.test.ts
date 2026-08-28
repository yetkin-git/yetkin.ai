import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("PayTR sipariş CAS ve geç paid recovery yüzeyi", () => {
  it("Prisma store durum geçişlerini updateMany CAS ile mühürler", () => {
    const store = readSrc("lib/kernel/payments/prisma-order-store.ts");
    expect(store).toContain("updateMany");
    expect(store).toContain('status: { in: ["PENDING", "FAILED"] }');
    expect(store).toContain('where: { id, status: "PENDING" }');
    expect(store).toContain('where: { id, status: "PAID" }');
    expect(store).toContain("PaymentOrderCasError");
    expect(store).toContain("result.count !== 1");
    expect(store).not.toContain("paymentOrder.update({");
  });

  it("clearing FAILED satırı revive eder; failPaymentOrder PAID/CLEARED ezmez", () => {
    const clearing = readSrc("lib/kernel/payments/clearing.ts");
    expect(clearing).toContain("PaymentOrderCasError");
    expect(clearing).toContain("geç paid recovery");
    expect(clearing).toContain("PSP tutarı olmadan");
    expect(clearing).toContain('if (order.status !== "PENDING")');
    expect(clearing).not.toContain("Başarısız ödeme emri temizlenemez.");
    expect(clearing).not.toContain("Temizlenmiş ödeme emri başarısız işaretlenemez.");
  });

  it("reconcile FAILED görünce PSP sorar; late_paid_recovery CREDIT yazar", () => {
    const reconcile = readSrc("lib/kernel/payments/paytr/reconcile.ts");
    expect(reconcile).toContain("late_paid_recovery");
    const fn = reconcile.slice(reconcile.indexOf("export async function reconcilePaytrPaymentOrder"));
    const inquireCall = fn.indexOf("ports.inquireStatus ?? queryPaytrOrderStatus");
    const alreadyFailed = fn.indexOf("already_failed");
    expect(inquireCall).toBeGreaterThan(-1);
    expect(alreadyFailed).toBeGreaterThan(inquireCall);
  });
});
