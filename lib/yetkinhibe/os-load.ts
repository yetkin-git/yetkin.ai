import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinorCompact } from "@/lib/kernel/money/format";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { TEZGAH_GRANT_UNIT, TEZGAH_PRO_MODULE, readHibeCatalogAmount } from "@/lib/tezgah/paid-lane";
import { matchAgencyClientsToCatalog, type AgencyCatalogMatch, type AgencyClientCard } from "@/lib/yetkinhibe/agency-match";
import { listHibeApplications, listHibeClients } from "@/lib/yetkinhibe/application-service";
import type { HibeApplicationView } from "@/lib/yetkinhibe/lifecycle-view";
import { GrantCatalogUnavailableError } from "@/lib/yetkinhibe/grant-catalog-core";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";
import type { YetkinhibeGrantCatalogEntry } from "@/lib/yetkinhibe/grant-catalog-core";
import {
  hibeAnalysisToBrief,
  HIBE_BUSINESS_KINDS,
  parseHibeAnalysis,
  type HibeAnalysisInput,
} from "@/lib/yetkinhibe/os-brief";
import {
  isGrantAudience,
  isGrantInvestmentFocus,
  isGrantNaceGroup,
  isGrantRdLevel,
  isProvinceCode,
} from "@/lib/yetkinhibe/grant-brief-axes";
import { buildGrantPrepMasterPlan, type GrantPrepMasterPlan } from "@/lib/yetkinhibe/master-plan";
import {
  highestEligibleCeilingMinor,
  rankGrantProgramFits,
  type GrantProgramFit,
} from "@/lib/yetkinhibe/program-fit";
import type { GrantBriefCall } from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import type { GrantProgramSource } from "@/lib/yetkinhibe/types";

export type HibePriceBand = {
  priceLabel: string | null;
  dossierCatalogLabel: string | null;
  agencyPriceLabel: string | null;
  agencyActive: boolean;
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

export type HibeSavedProfile = HibeAnalysisInput;

export type HibeArchiveRow = {
  id: string;
  title: string;
  createdAt: string;
  markdown: string;
  grantId: string | null;
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
  savedProfile: HibeSavedProfile | null;
  analysis: readonly HibeAnalysisRow[] | null;
  analysisNote: string | null;
  applications: readonly HibeApplicationView[];
  clients: readonly AgencyClientCard[];
  agencyMatrix: readonly AgencyCatalogMatch[];
};

const AGENCY_ORDER: readonly GrantProgramSource[] = [
  "KOSGEB",
  "TUBITAK",
  "TICARET_BAKANLIGI",
  "KALKINMA_AJANSI",
  "TKDK_IPARD",
  "TARIM_BAKANLIGI",
  "SANAYI_BAKANLIGI",
  "ISKUR",
  "AB_FONLARI",
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
    source: entry.source,
    dataVersion: entry.dataVersion,
    specificationText: entry.specificationText,
    rulesJson: entry.rulesJson,
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

/** Katalog tutarı (kuruş). Satır yoksa `null`; tutar uydurulmaz. */
async function catalogAmount(moduleKey: string, unitKey: string): Promise<number | null> {
  try {
    const entry = await createPrismaPriceCatalogStore().findActiveEntry(moduleKey, unitKey);
    if (entry && entry.unitType === "MINOR" && entry.currencyCode === "TRY" && entry.amountMinor > 0) {
      return entry.amountMinor;
    }
  } catch {
    return null;
  }
  return null;
}

async function readPrice(userId: string): Promise<HibePriceBand> {
  // Ş6 / B-09 — tek fiyat kaynağı. `hibe/dossier` satırı varsa o kazanır; yoksa eski
  // `tezgah/grant-dossier` satırına düşer. Vitrin, kokpit ve checkout aynı satırı okur.
  const dossierAmount = await readHibeCatalogAmount("dossier");
  const agencyAmount = await readHibeCatalogAmount("agency");
  const label = (amount: number | null, suffix: string): string | null =>
    amount == null ? null : `${formatMinorCompact(toAmountMinor(amount), SETTLEMENT_CURRENCY)} / ${suffix}`;
  const priceLabel = label(dossierAmount ?? (await catalogAmount(TEZGAH_PRO_MODULE, TEZGAH_GRANT_UNIT)), "Tam Proje Dosyası");
  const dossierCatalogLabel = label(dossierAmount, "YetkinHibe dosya");
  const agencyPriceLabel = label(agencyAmount, "YetkinHibe ajans");
  let proActive = false;
  let agencyActive = false;
  try {
    const prisma = getPrisma();
    const [row, agency] = await Promise.all([
      prisma.tezgahSubscription.findUnique({ where: { userId } }),
      prisma.hibeAgencyPackage.findUnique({ where: { userId } }),
    ]);
    proActive = row?.status === "ACTIVE" && row.expiresAt != null && row.expiresAt.getTime() > Date.now();
    agencyActive = agency?.status === "ACTIVE";
  } catch {
    proActive = false;
    agencyActive = false;
  }
  return { priceLabel, dossierCatalogLabel, agencyPriceLabel, agencyActive, proActive };
}

function shownCount(live: boolean, value: number): string {
  if (!live || !Number.isSafeInteger(value) || value < 0) {
    return "—";
  }
  return String(value);
}

function savedProfileFromRow(profile: {
  businessName: string;
  audience: string;
  provinceCode: string;
  naceGroup: string;
  investmentFocus: string;
  employeeCount: number;
  companyAgeYears: number;
  rdMaturityLevel: string;
  exportActive: boolean;
  hasPatentOrUtilityModel: boolean;
} | null): HibeSavedProfile | null {
  if (!profile) {
    return null;
  }
  if (
    !isGrantAudience(profile.audience) ||
    !isProvinceCode(profile.provinceCode) ||
    !isGrantNaceGroup(profile.naceGroup) ||
    !isGrantInvestmentFocus(profile.investmentFocus) ||
    !isGrantRdLevel(profile.rdMaturityLevel)
  ) {
    return null;
  }
  const businessKind = profile.audience === "yeni_girisimci" ? "startup" : "kobi";
  const kind = HIBE_BUSINESS_KINDS.find((row) => row.id === businessKind);
  if (!kind) {
    return null;
  }
  return {
    businessName: profile.businessName,
    businessKind: kind.id,
    audience: profile.audience,
    provinceCode: profile.provinceCode,
    naceGroup: profile.naceGroup,
    investmentFocus: profile.investmentFocus,
    employeeCount: profile.employeeCount,
    companyAgeYears: profile.companyAgeYears,
    rdMaturityLevel: profile.rdMaturityLevel,
    exportActive: profile.exportActive,
    hasPatentOrUtilityModel: profile.hasPatentOrUtilityModel,
  };
}

async function readArchive(userId: string): Promise<{
  live: boolean;
  profiles: number;
  dossiers: number;
  rows: HibeArchiveRow[];
  savedProfile: HibeSavedProfile | null;
}> {
  try {
    const prisma = getPrisma();
    const [profile, dossiers, rows] = await Promise.all([
      prisma.hibeCompanyProfile.findUnique({ where: { userId } }),
      prisma.hibeDossier.count({ where: { userId } }),
      prisma.hibeDossier.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, title: true, markdown: true, grantId: true, createdAt: true },
      }),
    ]);
    return {
      live: true,
      profiles: profile ? 1 : 0,
      dossiers,
      savedProfile: savedProfileFromRow(profile),
      rows: rows.map((row) => ({
        id: row.id,
        title: row.title,
        createdAt: row.createdAt.toISOString(),
        markdown: row.markdown,
        grantId: row.grantId,
      })),
    };
  } catch {
    return { live: false, profiles: 0, dossiers: 0, rows: [], savedProfile: null };
  }
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
  const archive = await readArchive(userId);
  const now = new Date();
  let programs: HibeProgramCard[] = [];
  let programsNote: string | null = null;
  let calls: GrantBriefCall[] = [];
  let catalogEntries: readonly YetkinhibeGrantCatalogEntry[] = [];
  try {
    const catalog = await loadYetkinhibeGrantCatalog(now);
    catalogEntries = catalog;
    programs = programCards(catalog);
    calls = catalog.map(toBriefCall);
  } catch (error) {
    programsNote =
      error instanceof GrantCatalogUnavailableError
        ? "Hibe kataloğu okunamadı. Tutar, tarih ve belge listesi uydurulmaz."
        : "Hibe kataloğu okunamadı. Tutar, tarih ve belge listesi uydurulmaz.";
  }

  const parsed = parseHibeAnalysis(params) ?? (params.hesap === "1" ? null : archive.savedProfile);
  let analysis: HibeAnalysisRow[] | null = null;
  let analysisNote: string | null = null;
  if (params.hesap === "1" && !parsed) {
    analysisNote = "Firma alanlarını listeden seç. Çalışan ve yaş tam sayı olsun.";
  } else if (parsed && calls.length === 0) {
    analysisNote = programsNote;
  } else if (parsed) {
    const brief = hibeAnalysisToBrief(parsed);
    const byId = new Map(catalogEntries.map((entry) => [entry.id, entry]));
    analysis = rankGrantProgramFits(brief, calls, now)
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
            fitPct: fit.fitPct ?? 0,
          }),
        };
      });
  }

  let applications: HibeApplicationView[] = [];
  let clients: AgencyClientCard[] = [];
  try {
    applications = await listHibeApplications(userId, now);
  } catch {
    applications = [];
  }
  try {
    clients = await listHibeClients(userId);
  } catch {
    clients = [];
  }
  const agencyMatrix = matchAgencyClientsToCatalog(clients, calls, now);

  const ceiling = analysis ? highestEligibleCeilingMinor(analysis) : null;
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
    savedProfile: archive.savedProfile,
    analysis,
    analysisNote,
    applications,
    clients,
    agencyMatrix,
  };
}
