import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinorCompact } from "@/lib/kernel/money/format";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { TEZGAH_GRANT_UNIT, TEZGAH_PRO_MODULE } from "@/lib/tezgah/paid-lane";
import { recordSignedTezgahOutput } from "@/lib/tezgah/record-output";
import { GrantCatalogUnavailableError } from "@/lib/yetkinhibe/grant-catalog-core";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";
import type { YetkinhibeGrantCatalogEntry } from "@/lib/yetkinhibe/grant-catalog-core";
import {
  hibeAnalysisToBrief,
  parseHibeAnalysis,
  type HibeAnalysisInput,
} from "@/lib/yetkinhibe/os-brief";
import { buildGrantPrepMasterPlan, type GrantPrepMasterPlan } from "@/lib/yetkinhibe/master-plan";
import { rankGrantProgramFits, sumEligibleCeilingMinor, type GrantProgramFit } from "@/lib/yetkinhibe/program-fit";
import type { GrantBriefCall } from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import type { GrantProgramSource } from "@/lib/yetkinhibe/types";

export type HibePriceBand = {
  priceLabel: string | null;
  proActive: boolean;
};

export type HibeKpis = {
  live: boolean;
  profiles: string;
  matched: string;
  dossiers: string;
  scopeLabel: string;
};

export type HibeProgramCard = {
  id: string;
  source: GrantProgramSource;
  sourceLabel: string;
  title: string;
  summary: string;
  who: string;
  documents: readonly string[];
  officialInfoUrl: string;
  windowLabel: string;
};

export type HibeArchiveRow = {
  id: string;
  toolKey: string;
  title: string;
  inputSummary: string;
  createdAt: string;
  preview: string;
};

export type HibeAnalysisRow = GrantProgramFit & {
  masterPlan: GrantPrepMasterPlan;
};

export type HibeCockpitData = {
  price: HibePriceBand;
  kpis: HibeKpis;
  programs: readonly HibeProgramCard[];
  programsNote: string | null;
  archive: readonly HibeArchiveRow[];
  analysis: readonly HibeAnalysisRow[] | null;
  analysisNote: string | null;
};

const AGENCY_ORDER: readonly GrantProgramSource[] = [
  "KOSGEB",
  "TUBITAK",
  "TICARET_BAKANLIGI",
  "KALKINMA_AJANSI",
  "BOLGESEL_AJANS",
  "RESMI_GAZETE",
];

function toBriefCall(entry: YetkinhibeGrantCatalogEntry): GrantBriefCall {
  return {
    id: entry.id,
    title: entry.title,
    sourceLabel: entry.sourceLabel,
    officialInfoUrl: entry.officialInfoUrl,
    status: entry.status,
    remainingDays: entry.remainingDays,
    poolAmountMinor: entry.poolAmountMinor,
    maxSupportMinor: entry.maxSupportMinor,
    supportRatioBps: entry.supportRatioBps,
    sourceVerifiedAt: entry.sourceVerifiedAt,
    eligibility: entry.eligibility,
  };
}

function whoLabel(entry: YetkinhibeGrantCatalogEntry): string {
  const audiences = entry.eligibility.audiences;
  if (!audiences || audiences.length === 0) {
    return "Bu çağrı kitle kısıtı yazmıyor. Kimlerin başvuracağı ilandadır.";
  }
  const labels = audiences.map((id) => (id === "yeni_girisimci" ? "Yeni girişimci" : "Mevcut KOBİ"));
  return labels.join(", ");
}

function windowLabel(entry: YetkinhibeGrantCatalogEntry): string {
  const deadline = new Date(entry.applicationDeadline);
  if (Number.isNaN(deadline.getTime())) {
    return "Son başvuru kataloğunda okunamadı.";
  }
  const when = deadline.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" });
  if (entry.status === "CLOSED") {
    return `Pencere kapalı. Katalog son tarihi ${when}.`;
  }
  if (entry.status === "UPCOMING") {
    return `Pencere henüz açılmadı. Katalog son tarihi ${when}.`;
  }
  return `Katalog son tarihi ${when}. Kalan gün: ${entry.remainingDays}.`;
}

function programCards(entries: readonly YetkinhibeGrantCatalogEntry[]): HibeProgramCard[] {
  return [...entries]
    .sort((left, right) => AGENCY_ORDER.indexOf(left.source) - AGENCY_ORDER.indexOf(right.source))
    .map((entry) => ({
      id: entry.id,
      source: entry.source,
      sourceLabel: entry.sourceLabel,
      title: entry.title,
      summary: entry.summary,
      who: whoLabel(entry),
      documents: entry.requiredDocuments,
      officialInfoUrl: entry.officialInfoUrl,
      windowLabel: windowLabel(entry),
    }));
}

async function readPrice(userId: string): Promise<HibePriceBand> {
  let priceLabel: string | null = null;
  let proActive = false;
  try {
    const entry = await createPrismaPriceCatalogStore().findActiveEntry(TEZGAH_PRO_MODULE, TEZGAH_GRANT_UNIT);
    if (entry && entry.unitType === "MINOR" && entry.currencyCode === "TRY" && entry.amountMinor > 0) {
      priceLabel = `${formatMinorCompact(entry.amountMinor, SETTLEMENT_CURRENCY)} / Tam Proje Dosyası`;
    }
  } catch {
    priceLabel = null;
  }
  try {
    const row = await getPrisma().tezgahSubscription.findUnique({ where: { userId } });
    proActive = row?.status === "ACTIVE" && row.expiresAt != null && row.expiresAt.getTime() > Date.now();
  } catch {
    proActive = false;
  }
  return { priceLabel, proActive };
}

function shownCount(live: boolean, value: number): string {
  if (!live || !Number.isSafeInteger(value) || value < 0) {
    return "—";
  }
  return String(value);
}

async function readArchive(userId: string): Promise<{
  live: boolean;
  profiles: number;
  dossiers: number;
  rows: HibeArchiveRow[];
}> {
  try {
    const prisma = getPrisma();
    const where = { userId, toolKey: { in: ["grant", "grant-brief"] } };
    const [profiles, dossiers, rows] = await Promise.all([
      prisma.tezgahOutput.count({ where: { userId, toolKey: "grant-brief" } }),
      prisma.tezgahOutput.count({ where: { userId, toolKey: "grant" } }),
      prisma.tezgahOutput.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          toolKey: true,
          title: true,
          inputSummary: true,
          outputContent: true,
          createdAt: true,
        },
      }),
    ]);
    return {
      live: true,
      profiles,
      dossiers,
      rows: rows.map((row) => ({
        id: row.id,
        toolKey: row.toolKey,
        title: row.title,
        inputSummary: row.inputSummary,
        createdAt: row.createdAt.toISOString(),
        preview: row.outputContent.slice(0, 1_200),
      })),
    };
  } catch {
    return { live: false, profiles: 0, dossiers: 0, rows: [] };
  }
}

async function rememberAnalysis(userId: string, input: HibeAnalysisInput, fits: readonly GrantProgramFit[]) {
  const fingerprint = [
    input.businessKind,
    input.provinceCode,
    input.naceGroup,
    input.investmentFocus,
    input.employeeCount,
    input.companyAgeYears,
  ].join("|");
  try {
    const latest = await getPrisma().tezgahOutput.findFirst({
      where: { userId, toolKey: "grant-brief" },
      orderBy: { createdAt: "desc" },
      select: { inputSummary: true },
    });
    if (latest?.inputSummary === fingerprint) {
      return;
    }
  } catch {
    return;
  }
  const lines = fits.slice(0, 8).map((row) => {
    const ceiling = row.ceilingLabel ? ` Katalog tavanı ${row.ceilingLabel}.` : "";
    return `${row.sourceLabel} — ${row.title}. Kriter uyumu %${row.fitPct}.${ceiling} ${row.reasons.join(" ")}`;
  });
  await recordSignedTezgahOutput({
    userId,
    guest: false,
    toolKey: "grant-brief",
    title: input.businessName,
    inputSummary: fingerprint,
    outputContent: lines.join("\n") || "Bu profilde katalog çağrısı listelenmedi.",
  });
}

export async function readHibeCommandCounts(userId: string): Promise<{
  live: boolean;
  profiles: number;
  dossiers: number;
}> {
  const id = userId.trim();
  if (!id) {
    return { live: false, profiles: 0, dossiers: 0 };
  }
  const archive = await readArchive(id);
  return { live: archive.live, profiles: archive.profiles, dossiers: archive.dossiers };
}

export async function loadHibeCockpit(
  userId: string,
  params: {
    isletme?: string;
    nace?: string;
    il?: string;
    yatirim?: string;
    calisan?: string;
    yas?: string;
    arge?: string;
    ihracat?: string;
    patent?: string;
    ad?: string;
    hesap?: string;
  },
): Promise<HibeCockpitData> {
  const price = await readPrice(userId);
  let archive = await readArchive(userId);
  let programs: HibeProgramCard[] = [];
  let programsNote: string | null = null;
  let calls: GrantBriefCall[] = [];
  let catalogEntries: readonly YetkinhibeGrantCatalogEntry[] = [];
  try {
    const catalog = await loadYetkinhibeGrantCatalog(new Date());
    catalogEntries = catalog;
    programs = programCards(catalog);
    calls = catalog.map(toBriefCall);
  } catch (error) {
    programsNote =
      error instanceof GrantCatalogUnavailableError
        ? "Hibe kataloğu okunamadı. Tutar, tarih ve belge listesi uydurulmaz."
        : "Hibe kataloğu okunamadı. Tutar, tarih ve belge listesi uydurulmaz.";
  }

  const parsed = parseHibeAnalysis(params);
  let analysis: HibeAnalysisRow[] | null = null;
  let analysisNote: string | null = null;
  if (params.hesap === "1" && !parsed) {
    analysisNote = "Firma alanlarını listeden seç. Çalışan ve yaş tam sayı olsun.";
  } else if (parsed && calls.length === 0) {
    analysisNote = programsNote;
  } else if (parsed) {
    const brief = hibeAnalysisToBrief(parsed);
    const byId = new Map(catalogEntries.map((entry) => [entry.id, entry]));
    analysis = rankGrantProgramFits(brief, calls)
      .slice(0, 8)
      .map((fit) => {
        const entry = byId.get(fit.grantId);
        return {
          ...fit,
          masterPlan: buildGrantPrepMasterPlan({
            brief,
            grantId: fit.grantId,
            title: fit.title,
            sourceLabel: fit.sourceLabel,
            businessName: parsed.businessName,
            eligibility: entry?.eligibility ?? null,
            requiredDocuments: entry?.requiredDocuments ?? [],
            applicationDeadline: entry?.applicationDeadline ?? null,
            remainingDays: entry?.remainingDays ?? null,
            status: entry?.status ?? null,
            fitPct: fit.fitPct,
          }),
        };
      });
    await rememberAnalysis(userId, parsed, analysis);
    archive = await readArchive(userId);
  }

  const ceiling = analysis ? sumEligibleCeilingMinor(analysis) : null;
  const matchedCount = analysis ? analysis.filter((row) => row.eligible).length : null;
  const kpis: HibeKpis = {
    live: archive.live,
    profiles: shownCount(archive.live, archive.profiles),
    dossiers: shownCount(archive.live, archive.dossiers),
    matched: matchedCount === null ? "—" : String(matchedCount),
    scopeLabel: ceiling === null ? "—" : formatMinorCompact(toAmountMinor(ceiling), SETTLEMENT_CURRENCY),
  };

  return {
    price,
    kpis,
    programs,
    programsNote,
    archive: archive.rows,
    analysis,
    analysisNote,
  };
}
