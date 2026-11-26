import "server-only";

import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { isSuperAdminActor, type SuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { getPrisma } from "@/lib/kernel/db";
import {
  parseKurumsalOfferStatusFilter,
  type KurumsalOfferRow,
  type KurumsalOfferStatusFilter,
} from "@/lib/kernel/admin/kurumsal-offer-parse";

export {
  KURUMSAL_OFFER_STATUSES,
  parseKurumsalOfferStatusFilter,
  type KurumsalOfferRow,
  type KurumsalOfferStatusFilter,
} from "@/lib/kernel/admin/kurumsal-offer-parse";

const PACKAGE_LABEL: Record<string, string> = {
  "team-seat": "KOBİ ekip rozeti",
  agency: "E-ticaret ajans paketi",
  "job-screening-pack": "İlan ve aday eleme",
  "iso-auditor": "ISO ve kalite denetçisi (ön talep)",
  "company-brain": "Şirket beyni (ön talep)",
};

export const KURUMSAL_OFFER_PAGE_SIZE = 50 as const;

export type KurumsalOfferBoardResult =
  | { access: "forbidden" }
  | { access: "unavailable" }
  | {
      access: "ok";
      rows: KurumsalOfferRow[];
      page: number;
      pageSize: number;
      total: number;
      status: KurumsalOfferStatusFilter;
    };

export async function loadKurumsalOfferBoard(
  actor: SuperAdminActor,
  input?: { page?: number; status?: KurumsalOfferStatusFilter },
): Promise<KurumsalOfferBoardResult> {
  if (!isSupabaseUserId(actor.id) || !isSuperAdminActor(actor)) {
    return { access: "forbidden" };
  }
  const page = Math.max(1, Math.floor(input?.page ?? 1));
  const status = input?.status ?? "ALL";
  try {
    const where = status === "ALL" ? {} : { status };
    const prisma = getPrisma();
    const [total, rows] = await Promise.all([
      prisma.kurumsalOfferRequest.count({ where }),
      prisma.kurumsalOfferRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * KURUMSAL_OFFER_PAGE_SIZE,
        take: KURUMSAL_OFFER_PAGE_SIZE,
      }),
    ]);
    return {
      access: "ok",
      page,
      pageSize: KURUMSAL_OFFER_PAGE_SIZE,
      total,
      status,
      rows: rows.map((row) => ({
        id: row.id,
        companyName: row.companyName,
        email: row.email,
        packageKey: row.packageKey,
        packageLabel: PACKAGE_LABEL[row.packageKey] ?? row.packageKey,
        city: row.city,
        note: row.note,
        status: row.status,
        adminNote: row.adminNote,
        quotedAmountMinor: row.quotedAmountMinor,
        handledAt: row.handledAt?.toISOString() ?? null,
        handledBy: row.handledBy,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  } catch {
    return { access: "unavailable" };
  }
}
