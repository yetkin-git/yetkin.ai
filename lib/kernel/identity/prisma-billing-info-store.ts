import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { normalizeTrMobilePhone, type CheckoutBillingInfo } from "@/lib/kernel/identity/billing-info";
import type { BillingInfoStore } from "@/lib/kernel/identity/billing-info-write";

type BillingInvoiceType = "INDIVIDUAL" | "CORPORATE";

type BillingRow = {
  invoiceType: BillingInvoiceType;
  fullName: string | null;
  tckn: string | null;
  companyTitle: string | null;
  taxOffice: string | null;
  vkn: string | null;
  phone: string;
  address: string;
};

function toRowData(billing: CheckoutBillingInfo): BillingRow {
  if (billing.invoiceType === "individual") {
    return {
      invoiceType: "INDIVIDUAL",
      fullName: billing.fullName,
      tckn: billing.tckn,
      companyTitle: null,
      taxOffice: null,
      vkn: null,
      phone: billing.phone,
      address: billing.address,
    };
  }
  return {
    invoiceType: "CORPORATE",
    fullName: null,
    tckn: null,
    companyTitle: billing.companyTitle,
    taxOffice: billing.taxOffice,
    vkn: billing.vkn,
    phone: billing.phone,
    address: billing.address,
  };
}

function fromRow(row: BillingRow): CheckoutBillingInfo | null {
  const phone = normalizeTrMobilePhone(row.phone);
  if (!phone) {
    return null;
  }
  if (row.invoiceType === "INDIVIDUAL") {
    const fullName = row.fullName?.trim() ?? "";
    if (!fullName) {
      return null;
    }
    return {
      invoiceType: "individual",
      fullName,
      tckn: row.tckn,
      phone,
      address: row.address,
    };
  }
  const companyTitle = row.companyTitle?.trim() ?? "";
  const taxOffice = row.taxOffice?.trim() ?? "";
  const vkn = row.vkn?.trim() ?? "";
  if (!companyTitle || !taxOffice || !vkn) {
    return null;
  }
  return {
    invoiceType: "corporate",
    companyTitle,
    taxOffice,
    vkn,
    phone,
    address: row.address,
  };
}

export function createPrismaBillingInfoStore(): BillingInfoStore {
  const prisma = getPrisma();
  return {
    async read(userId) {
      const row = await prisma.userBillingInfo.findUnique({
        where: { userId },
        select: {
          invoiceType: true,
          fullName: true,
          tckn: true,
          companyTitle: true,
          taxOffice: true,
          vkn: true,
          phone: true,
          address: true,
        },
      });
      return row ? fromRow(row) : null;
    },
    async upsert(input) {
      const data = toRowData(input.billing);
      const row = await prisma.userBillingInfo.upsert({
        where: { userId: input.userId },
        create: { userId: input.userId, ...data },
        update: data,
        select: {
          invoiceType: true,
          fullName: true,
          tckn: true,
          companyTitle: true,
          taxOffice: true,
          vkn: true,
          phone: true,
          address: true,
        },
      });
      return fromRow(row) ?? input.billing;
    },
  };
}
