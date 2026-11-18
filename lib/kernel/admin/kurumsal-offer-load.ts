import "server-only";

import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { isSuperAdminActor, type SuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { getPrisma } from "@/lib/kernel/db";

const PACKAGE_LABEL: Record<string, string> = {
  "team-seat": "KOBİ ekip rozeti",
  agency: "E-ticaret ajans paketi",
  "job-screening-pack": "İlan ve aday eleme",
  "iso-auditor": "ISO ve kalite denetçisi (ön talep)",
  "company-brain": "Şirket beyni (ön talep)",
};

export type KurumsalOfferRow = {
  id: string;
  companyName: string;
  email: string;
  packageKey: string;
  packageLabel: string;
  city: string;
  note: string;
  createdAt: string;
};

export type KurumsalOfferBoardResult =
  | { access: "forbidden" }
  | { access: "unavailable" }
  | { access: "ok"; rows: KurumsalOfferRow[] };

export async function loadKurumsalOfferBoard(actor: SuperAdminActor): Promise<KurumsalOfferBoardResult> {
  if (!isSupabaseUserId(actor.id) || !isSuperAdminActor(actor)) {
    return { access: "forbidden" };
  }
  try {
    const rows = await getPrisma().kurumsalOfferRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return {
      access: "ok",
      rows: rows.map((row) => ({
        id: row.id,
        companyName: row.companyName,
        email: row.email,
        packageKey: row.packageKey,
        packageLabel: PACKAGE_LABEL[row.packageKey] ?? row.packageKey,
        city: row.city,
        note: row.note,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  } catch {
    return { access: "unavailable" };
  }
}
