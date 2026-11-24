/**
 * B2B hibe okuması. Katalog ve eşleştirici burada çalışır.
 * Çalışan sayısı, şirket yaşı ve Ar-Ge kaydı uydurulmaz; varsayım metne yazılır.
 */

import { GRANT_NACE_GROUPS, GRANT_PROVINCES, sectorCodeForNace } from "@/lib/yetkinhibe/grant-brief-axes";
import { matchGrantProgramsForBrief, type GrantBriefCall, type GrantProgramBrief } from "@/lib/yetkinhibe/match-grant-programs-for-brief";

export const B2B_GRANT_ASSUMPTION =
  "Eşleştirme yalnız sektör ve ili kullanır. Çalışan sayısı, şirket yaşı ve Ar-Ge kaydı doğrulanmadı. KOBİ ve Ar-Ge başlangıç odağı soru olarak soruldu. Uygunluk kararı değildir.";

export const TUBITAK_1507_CLOSE_LABEL = "25 Kasım 2026";

export type B2bGrantCall = GrantBriefCall & {
  applicationDeadline: string;
};

export type B2bGrantReading = {
  axesResolved: boolean;
  unresolved: string | null;
  grantTitle: string | null;
  deadlineLabel: string | null;
  windowOpen: boolean;
  listedEligible: boolean;
  assumption: string;
  note: string;
};

const SECTOR_KEYWORDS: readonly { key: string; nace: string }[] = [
  { key: "yazilim", nace: "62" },
  { key: "software", nace: "62" },
  { key: "bilisim", nace: "62" },
  { key: "tekstil", nace: "13" },
  { key: "gida", nace: "10" },
  { key: "plastik", nace: "22" },
  { key: "kimya", nace: "22" },
  { key: "metal", nace: "25" },
  { key: "makine", nace: "28" },
  { key: "insaat", nace: "41" },
  { key: "toptan", nace: "46" },
  { key: "perakende", nace: "47" },
  { key: "ticaret", nace: "46" },
  { key: "kargo", nace: "49" },
  { key: "lojistik", nace: "49" },
  { key: "tasima", nace: "49" },
  { key: "konaklama", nace: "55" },
  { key: "otel", nace: "55" },
  { key: "turizm", nace: "55" },
  { key: "restoran", nace: "56" },
  { key: "yiyecek", nace: "56" },
  { key: "danisman", nace: "70" },
  { key: "muhendislik", nace: "70" },
  { key: "arastirma", nace: "72" },
  { key: "ar-ge", nace: "72" },
  { key: "arge", nace: "72" },
  { key: "saglik", nace: "86" },
  { key: "medikal", nace: "86" },
  { key: "tarim", nace: "01" },
];

function fold(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

export function labelIstanbulDay(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  if (ymd === "2026-11-25") {
    return TUBITAK_1507_CLOSE_LABEL;
  }
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function resolveB2bGrantAxes(input: { sector: string; city: string }):
  | { ok: true; naceGroup: string; provinceCode: string }
  | { ok: false; reason: string } {
  const sectorFold = fold(input.sector);
  const tokens = sectorFold.split(/[^a-z0-9]+/).filter((token) => token.length > 0);
  const byId = GRANT_NACE_GROUPS.find((row) => tokens.includes(row.id));
  const keyword = SECTOR_KEYWORDS.find((row) => sectorFold.includes(row.key));
  const byLabel = GRANT_NACE_GROUPS.find((row) => fold(row.label) === sectorFold);
  const sectorHits = GRANT_NACE_GROUPS.filter((row) => fold(row.sectorCode) === sectorFold);
  const naceGroup = byId?.id ?? keyword?.nace ?? byLabel?.id ?? (sectorHits.length === 1 ? sectorHits[0]?.id : undefined);
  if (!naceGroup || !sectorCodeForNace(naceGroup)) {
    return { ok: false, reason: "Sektör hibe eşleştiricisinin kapalı listesine oturmadı." };
  }
  const cityFold = fold(input.city);
  const province =
    GRANT_PROVINCES.find((row) => row.code === input.city.trim().padStart(2, "0")) ??
    GRANT_PROVINCES.find((row) => fold(row.name) === cityFold);
  if (!province) {
    return { ok: false, reason: "İl, plaka listesine oturmadı." };
  }
  return { ok: true, naceGroup, provinceCode: province.code };
}

function pick1507(calls: readonly B2bGrantCall[]): B2bGrantCall | null {
  const rows = calls.filter(
    (call) => call.id.toLowerCase().includes("1507") || call.title.includes("1507"),
  );
  const open = rows.filter((call) => call.status === "ACTIVE" || call.status === "CLOSING_SOON");
  const pool = open.length > 0 ? open : rows;
  return [...pool].sort((left, right) => right.applicationDeadline.localeCompare(left.applicationDeadline))[0] ?? null;
}

export function assessB2bGrant(input: {
  sector: string;
  city: string;
  calls: readonly B2bGrantCall[] | null;
}): B2bGrantReading {
  if (!input.calls) {
    return {
      axesResolved: false,
      unresolved: "Hibe kataloğu okunamadı. Uygunluk üretilmedi.",
      grantTitle: null,
      deadlineLabel: null,
      windowOpen: false,
      listedEligible: false,
      assumption: B2B_GRANT_ASSUMPTION,
      note: B2B_GRANT_ASSUMPTION,
    };
  }
  const call = pick1507(input.calls);
  const deadlineLabel = call ? labelIstanbulDay(call.applicationDeadline) : null;
  const windowOpen = call?.status === "ACTIVE" || call?.status === "CLOSING_SOON";
  const axes = resolveB2bGrantAxes(input);
  if (!axes.ok) {
    return {
      axesResolved: false,
      unresolved: axes.reason,
      grantTitle: call?.title ?? null,
      deadlineLabel,
      windowOpen,
      listedEligible: false,
      assumption: B2B_GRANT_ASSUMPTION,
      note: `${B2B_GRANT_ASSUMPTION} ${axes.reason}`,
    };
  }
  const brief: GrantProgramBrief = {
    provinceCode: axes.provinceCode,
    audience: "mevcut_kobi",
    naceGroup: axes.naceGroup,
    investmentFocus: "arge",
    employeeCount: 0,
    companyAgeYears: 0,
    rdMaturityLevel: "EARLY",
    exportActive: false,
    hasPatentOrUtilityModel: false,
  };
  const match = matchGrantProgramsForBrief(brief, input.calls);
  const listedEligible = Boolean(call && match.eligible.some((row) => row.grantId === call.id));
  return {
    axesResolved: true,
    unresolved: null,
    grantTitle: call?.title ?? null,
    deadlineLabel,
    windowOpen,
    listedEligible,
    assumption: B2B_GRANT_ASSUMPTION,
    note: B2B_GRANT_ASSUMPTION,
  };
}
