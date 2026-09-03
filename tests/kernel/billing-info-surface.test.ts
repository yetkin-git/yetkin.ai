import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("fatura künyesi checkout yüzeyi", () => {
  it("user_billing_info 1:1 User satırına bağlıdır; tip-özel CHECK durur", () => {
    const schema = readSrc("prisma/schema/kernel.prisma");
    const sql = readSrc("prisma/migrations/20260831140000_user_billing_info/migration.sql");
    expect(schema).toContain("model UserBillingInfo");
    expect(schema).toContain('@@map("user_billing_info")');
    expect(schema).toContain("userBillingInfo          UserBillingInfo?");
    expect(sql).toContain("user_billing_info_fields_by_type");
    expect(sql).toContain("INDIVIDUAL");
    expect(sql).toContain("CORPORATE");
    expect(sql).toContain('REFERENCES "users"("id")');
  });

  it("phone kolonu PayTR user_phone için zorunludur; sahte 05000000000 yazılmaz", () => {
    const schema = readSrc("prisma/schema/kernel.prisma");
    const sql = readSrc("prisma/migrations/20260831190000_user_billing_phone/migration.sql");
    expect(schema).toContain("phone        String             @db.VarChar(16)");
    expect(sql).toContain('ADD COLUMN "phone" VARCHAR(16)');
    expect(sql).toContain('AND length(btrim("phone")) > 0');
    expect(sql).toContain("Sahte 05000000000 yazılmaz");
    expect(sql).not.toMatch(/DEFAULT\s+'05000000000'/);
  });

  it("kasa ve satın alma formları fatura alanlarını taşır; API oturum id ile upsert eder", () => {
    const purchaseUi = readSrc("components/academy/purchase-button.tsx");
    const wallet = readSrc("components/kernel/wallet-top-up-form.tsx");
    const modal = readSrc("components/kernel/quick-top-up-modal.tsx");
    const fields = readSrc("components/legal/checkout-billing-fields.tsx");
    const copy = readSrc("lib/kernel/identity/billing-info.ts");
    const purchaseApi = readSrc("app/api/academy/courses/[id]/purchase/route.ts");
    const topUpApi = readSrc("app/api/(kernel)/wallet/top-up/route.ts");
    const billingRoute = readSrc("app/api/(kernel)/profile/billing/route.ts");
    const prismaStore = readSrc("lib/kernel/identity/prisma-billing-info-store.ts");
    const write = readSrc("lib/kernel/identity/billing-info-write.ts");
    for (const source of [purchaseUi, wallet, modal]) {
      expect(source).toContain("CheckoutBillingFields");
      expect(source).toContain("billing: billingPayload.billing");
    }
    expect(fields).toContain("copy.individual");
    expect(fields).toContain("copy.corporate");
    expect(fields).toContain("copy.tckn");
    expect(fields).toContain("copy.vkn");
    expect(fields).toContain("copy.phone");
    expect(copy).toContain("Bireysel");
    expect(copy).toContain("Kurumsal");
    expect(copy).toContain("TCKN");
    expect(copy).toContain("VKN");
    expect(copy).toContain("Cep telefonu");
    expect(copy).toContain("05000000000");
    expect(purchaseApi).toContain("persistCheckoutBilling");
    expect(topUpApi).toContain("persistCheckoutBilling");
    expect(topUpApi).toContain("paytrUserFromBilling");
    expect(topUpApi).toContain("userPhone: paytrUser.userPhone");
    expect(readSrc("lib/kernel/payments/paytr/checkout.ts")).not.toContain("05000000000");
    expect(readSrc("lib/kernel/payments/paytr/checkout.ts")).not.toContain("Yetkin Kullanıcı");
    expect(billingRoute).toContain('export const auth = "session"');
    expect(billingRoute).toContain("export async function GET");
    expect(billingRoute).toContain("export async function PUT");
    expect(prismaStore).toContain("where: { userId }");
    expect(prismaStore).toContain("where: { userId: input.userId }");
    expect(prismaStore).not.toContain("input.billing.userId");
    expect(write).toContain("actorUserId");
    expect(write).toContain("store.read(actorUserId)");
    expect(write).toContain("userId: actorUserId");
    const profilePage = readSrc("app/(kernel)/profil/page.tsx");
    const profileForm = readSrc("components/kernel/profile-billing-form.tsx");
    expect(profilePage).toContain("ProfileBillingForm");
    expect(profileForm).toContain("CheckoutBillingFields");
    expect(profileForm).toContain("PROFILE_BILLING_PATH");
    expect(profileForm).toContain('method: "PUT"');
  });
});
