import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CUZDAN_SEN } from "@/lib/copy/sen-voice/cuzdan";
import { PROFIL_SEN } from "@/lib/copy/sen-voice/profil";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinor } from "@/lib/kernel/money/format";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("hesap kapatma iade bilgilendirme", () => {
  it("başarılı iade, talep ve süre notu mühürlü cümlelerdir", () => {
    const amount = formatMinor(2_500, SETTLEMENT_CURRENCY);
    expect(amount).toBe("₺25,00");
    expect(CUZDAN_SEN.refundDone(amount)).toBe(
      "İade işleminiz PayTR/Bankanıza iletilmiştir. Tutar (₺25,00) 1-3 iş günü içerisinde kartınıza yansıyacaktır. Cüzdan bakiyeniz sıfırlanmıştır.",
    );
    expect(CUZDAN_SEN.refundRequested).toBe(
      "İade talebiniz incelemeye alındı. İşlem tamamlandığında tarafınıza bilgi verilecektir.",
    );
    expect(CUZDAN_SEN.refundFinanceHold(formatMinor(191_000, SETTLEMENT_CURRENCY))).toBe(
      "₺1.910,00 tutarındaki iade talebiniz finans ekibimize iletilmiştir. İnceleme tamamlanıp bakiye sıfırlandığında 'Hesabımı Kapat' adımı aktifleşecektir.",
    );
    expect(CUZDAN_SEN.refundTiming).toBe(
      "İadeler PayTR altyapısıyla kartınıza 1-3 iş gününde aktarılır",
    );
    expect(PROFIL_SEN.close.zeroReady(formatMinor(0, SETTLEMENT_CURRENCY))).toBe(
      "Cüzdan bakiyeniz ₺0,00'dır. Hesabınızı güvenle kapatabilirsiniz.",
    );
    expect(PROFIL_SEN.close.modalBody).toContain("'KAPAT'");
    expect(PROFIL_SEN.close.closedNotice).toBe(
      "Hesabınız başarıyla kapatılmıştır. Yönlendiriliyorsunuz...",
    );
  });

  it("panel iadeyi yerinde yapar, sıfır bakiyede kırmızı kapatma ve onay modalı açar", () => {
    const panel = readSrc("components/kernel/account-close-panel.tsx");
    const prompt = readSrc("components/kernel/use-wallet-refund-prompt.ts");
    expect(prompt).toContain("WALLET_REFUND_PATH");
    expect(panel).toContain("WalletRefundConfirmDialog");
    expect(panel).toContain("refund.ask");
    expect(panel).toContain("refundTiming");
    expect(panel).toContain("zeroReady");
    expect(panel).toContain("financeHoldMinor");
    expect(panel).toContain("refundFinanceHold");
    expect(panel).toContain('variant="danger"');
    expect(panel).toContain('role="dialog"');
    expect(panel).toContain("AUTH_LOGOUT_API_PATH");
    expect(panel).toContain("useActionBridge");
    expect(panel).not.toContain("WALLET_SURFACE_PATH");
  });
});
