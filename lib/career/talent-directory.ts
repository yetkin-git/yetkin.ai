import {
  aggregateTalentDirectoryCells,
  isDirectorySlicePublished,
  isPublishableProvince,
  publishedDirectoryCells,
  TALENT_DIRECTORY_K_MIN,
} from "@/lib/career/k-anonymity";
import { parsePublicTalentId, publicTalentPath } from "@/lib/career/public-talent";

/** Kamuya açık YetkinCV yetenek vitrini. Freelancer pazarı, emanet ve teklif burada yoktur. */
export const TALENT_DIRECTORY_PATH = "/career/vitrin" as const;
export const TALENT_DIRECTORY_EXAM_HREF = "/career" as const;
export const TALENT_DIRECTORY_EXAM_CTA = "YetkinCV Sınavına Gir" as const;
export const TALENT_DIRECTORY_JOBS_HREF = "/ilan" as const;
export const TALENT_DIRECTORY_JOBS_CTA = "Açık Kurumsal İlanları İncele" as const;
export const TALENT_DIRECTORY_EMPTY_MESSAGE =
  "Henüz kamuya açılabilecek onaylı profil yok. Aynı kırılımda en az 5 YetkinCV mührü olmadan liste basılmaz. Sahte profil üretilmez." as const;
export const TALENT_DIRECTORY_UNAVAILABLE_MESSAGE =
  "Vitrin şu an okunamadı. Liste uydurulmadı." as const;

export const TALENT_DIRECTORY_VERTICALS = [
  { id: "eticaret", label: "E-Ticaret", slugs: ["02_ecommerce_ai", "ecommerce"] },
  { id: "ofis", label: "Ofis & Veri", slugs: ["01_office_ai", "01_office_ai_ileri", "office"] },
  { id: "sosyal", label: "Sosyal Medya", slugs: ["03_social_media_ai", "marketing"] },
  { id: "chatbot", label: "Chatbot", slugs: ["04_chatbot_nocode", "software"] },
  { id: "prompt", label: "Prompt", slugs: ["05_prompt_practice"] },
] as const;

export type TalentVerticalId = (typeof TALENT_DIRECTORY_VERTICALS)[number]["id"];

export const TALENT_DIRECTORY_PROVINCES = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kilis",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şanlıurfa",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
] as const;

export type TalentCityFilter =
  | { kind: "all" }
  | { kind: "province"; name: (typeof TALENT_DIRECTORY_PROVINCES)[number] }
  | { kind: "rejected" };

/** Gruplama anahtarı kamu kartına yazılmaz. */
export type TalentDirectorySource = {
  userKey: string;
  stampId: string;
  displayName: string | null;
  title: string;
  issuedAt: Date;
  courseSlug: string | null;
  portfolioTitle: string | null;
  city: string | null;
  /** Aktif dizin kaynağı YetkinCV mührüdür. */
  sourceKind?: "YETKINCV_SEAL";
};

export type TalentDirectoryExpert = {
  stampId: string;
  href: string;
  displayName: string;
  title: string;
  badgeCount: number;
  portfolioSummary: string;
  verticalLabels: string[];
};

export type TalentDirectoryStat = {
  verticalId: TalentVerticalId;
  label: string;
  count: number;
};

export type TalentDirectoryView =
  | {
      status: "listed";
      experts: TalentDirectoryExpert[];
      stats: TalentDirectoryStat[];
      kMin: typeof TALENT_DIRECTORY_K_MIN;
    }
  | {
      status: "empty";
      reason: "threshold" | "unavailable";
      message: string;
      ctaHref: typeof TALENT_DIRECTORY_EXAM_HREF;
      ctaLabel: typeof TALENT_DIRECTORY_EXAM_CTA;
      kMin: typeof TALENT_DIRECTORY_K_MIN;
    };

const SLUG_VERTICAL = new Map<string, (typeof TALENT_DIRECTORY_VERTICALS)[number]>();
for (const vertical of TALENT_DIRECTORY_VERTICALS) {
  for (const slug of vertical.slugs) {
    SLUG_VERTICAL.set(slug, vertical);
  }
}

export function talentVerticalById(id: string): (typeof TALENT_DIRECTORY_VERTICALS)[number] | null {
  return TALENT_DIRECTORY_VERTICALS.find((vertical) => vertical.id === id) ?? null;
}

export function parseTalentVertical(raw: string | null | undefined): TalentVerticalId | null {
  const id = raw?.trim().toLowerCase() ?? "";
  const vertical = talentVerticalById(id);
  return vertical ? vertical.id : null;
}

export function parseTalentCity(raw: string | null | undefined): TalentCityFilter {
  const value = raw?.trim() ?? "";
  if (!value) {
    return { kind: "all" };
  }
  if (!isPublishableProvince(value)) {
    return { kind: "rejected" };
  }
  const folded = value.toLocaleLowerCase("tr-TR");
  const found = TALENT_DIRECTORY_PROVINCES.find((name) => name.toLocaleLowerCase("tr-TR") === folded);
  return found ? { kind: "province", name: found } : { kind: "rejected" };
}

function publicDisplayName(raw: string | null): string {
  const name = raw?.replace(/\s+/g, " ").trim() ?? "";
  if (name.length < 2 || name.includes("@") || /https?:/i.test(name)) {
    return "Rozet sahibi";
  }
  return name.slice(0, 80);
}

function portfolioSummary(raw: string | null): string {
  const title = raw?.replace(/\s+/g, " ").trim() ?? "";
  if (title.length < 2) {
    return "Portföy özeti henüz yok.";
  }
  return title.length <= 180 ? title : `${title.slice(0, 177).trim()}…`;
}

function sameCity(left: string | null, right: string): boolean {
  if (!left || !isPublishableProvince(left)) {
    return false;
  }
  return left.trim().toLocaleLowerCase("tr-TR") === right.toLocaleLowerCase("tr-TR");
}

type GroupedExpert = {
  userKey: string;
  stampId: string;
  displayName: string | null;
  title: string;
  issuedAt: Date;
  portfolioTitle: string | null;
  city: string | null;
  badgeCount: number;
  verticalIds: TalentVerticalId[];
};

function groupSources(sources: readonly TalentDirectorySource[]): GroupedExpert[] {
  const groups = new Map<string, GroupedExpert>();
  for (const source of sources) {
    const stampId = parsePublicTalentId(source.stampId);
    const userKey = source.userKey.trim();
    if (!stampId || !userKey) {
      continue;
    }
    const vertical = source.courseSlug ? SLUG_VERTICAL.get(source.courseSlug) : undefined;
    const existing = groups.get(userKey);
    if (!existing) {
      groups.set(userKey, {
        userKey,
        stampId,
        displayName: source.displayName,
        title: source.title.trim() || "Doğrulanmış rozet",
        issuedAt: source.issuedAt,
        portfolioTitle: source.portfolioTitle,
        city: source.city,
        badgeCount: 1,
        verticalIds: vertical ? [vertical.id] : [],
      });
      continue;
    }
    existing.badgeCount += 1;
    if (source.issuedAt.getTime() > existing.issuedAt.getTime()) {
      existing.stampId = stampId;
      existing.title = source.title.trim() || existing.title;
      existing.issuedAt = source.issuedAt;
      existing.displayName = source.displayName ?? existing.displayName;
    }
    if (!existing.portfolioTitle && source.portfolioTitle) {
      existing.portfolioTitle = source.portfolioTitle;
    }
    if (!existing.city && source.city) {
      existing.city = source.city;
    }
    if (vertical && !existing.verticalIds.includes(vertical.id)) {
      existing.verticalIds.push(vertical.id);
    }
  }
  return [...groups.values()];
}

function toExpert(group: GroupedExpert): TalentDirectoryExpert {
  const labels = TALENT_DIRECTORY_VERTICALS.filter((vertical) =>
    group.verticalIds.includes(vertical.id),
  ).map((vertical) => vertical.label);
  return {
    stampId: group.stampId,
    href: publicTalentPath(group.stampId),
    displayName: publicDisplayName(group.displayName),
    title: group.title,
    badgeCount: group.badgeCount,
    portfolioSummary: portfolioSummary(group.portfolioTitle),
    verticalLabels: labels,
  };
}

export function emptyTalentDirectory(reason: "threshold" | "unavailable"): TalentDirectoryView {
  return {
    status: "empty",
    reason,
    message: reason === "unavailable" ? TALENT_DIRECTORY_UNAVAILABLE_MESSAGE : TALENT_DIRECTORY_EMPTY_MESSAGE,
    ctaHref: TALENT_DIRECTORY_EXAM_HREF,
    ctaLabel: TALENT_DIRECTORY_EXAM_CTA,
    kMin: TALENT_DIRECTORY_K_MIN,
  };
}

/**
 * Canlı mühür satırlarını kamu kartına indirger.
 * Filtre sonucu 5'in altındaysa kart basılmaz. Kimlik anahtarı çıkışa yazılmaz.
 */
export function projectTalentDirectory(
  sources: readonly TalentDirectorySource[],
  filter: { vertical: TalentVerticalId | null; city: TalentCityFilter },
): TalentDirectoryView {
  if (filter.city.kind === "rejected") {
    return emptyTalentDirectory("threshold");
  }
  const grouped = groupSources(sources);
  const matched = grouped.filter((expert) => {
    if (filter.vertical && !expert.verticalIds.includes(filter.vertical)) {
      return false;
    }
    if (filter.city.kind === "province" && !sameCity(expert.city, filter.city.name)) {
      return false;
    }
    return true;
  });
  if (!isDirectorySlicePublished(matched.length)) {
    return emptyTalentDirectory("threshold");
  }
  const experts = matched
    .slice()
    .sort((left, right) => right.issuedAt.getTime() - left.issuedAt.getTime() || left.stampId.localeCompare(right.stampId))
    .map(toExpert);
  const stats =
    filter.vertical || filter.city.kind === "province"
      ? []
      : publishedDirectoryCells(
          aggregateTalentDirectoryCells(
            grouped.flatMap((expert) =>
              expert.verticalIds.map((verticalId) => ({ province: null, verticalId })),
            ),
          ),
        ).flatMap((cell) => {
          const vertical = talentVerticalById(cell.verticalId);
          if (!vertical || cell.province) {
            return [];
          }
          return [{ verticalId: vertical.id, label: vertical.label, count: cell.count }];
        });
  return { status: "listed", experts, stats, kMin: TALENT_DIRECTORY_K_MIN };
}
