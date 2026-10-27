/**
 * Dron hop allowlist — TEK KAYNAK `@yetkin/kernel` `RAIL_V1_HOPS_META`dir (SSOT, Görev Paketi #02).
 * Bu dosyada yol/metot listesi elle yazılmaz; liste metadan türetilir.
 * Meta değişince native liste kendiliğinden değişir; sessiz senkron kayması olmaz.
 * Yazma hop'ları (satın alma, kilit, müfredat, sınav, cüzdan yükleme, portföy, profil)
 * Bearer + Idempotency-Key. Müfredat/sınav GET okuma hop'ları T3 halkası.
 * Native IAP yoktur; cüzdan DEBIT ve PayTR top-up hop'u açıktır.
 * Junior kasa hop'u sicildedir. Satış kapısı `JUNIOR_CHECKOUT_OPEN` boşken kapalıdır.
 */

import {
  RAIL_V1_HOPS_META,
  isRailV1HopMetaDronForbidden,
} from "@yetkin/kernel/http/v1-hops-meta";

export const DRON_FAZ2_FROZEN =
  "Faz 2 Tezgâh hop'u donduruldu. Dron Faz 1 kapanışına kadar donuk laboratuvardır.";

/**
 * Closed Testing T3-only yüzey.
 * true: "Açık işler / İşlerim" sekmesi gizlenir; kilit kartı 410 basmaz;
 * loadHome Tezgâh hop'una HTTP atmaz.
 * Split + hop geri yazımından sonra false yapılır.
 */
export const DRON_TEZGAH_STORE_ISOLATED: boolean = true;

/** Anahtar adlandırma istisnaları: metadaki id, native'de tarihsel anahtarla okunur. Yol/metot buradan gelmez. */
const HOP_KEY_ALIASES: Readonly<Record<string, string>> = {
  "auth-session": "session",
  "junior-practice": "juniorPilotPractice",
};

function hopKey(id: string): string {
  const alias = HOP_KEY_ALIASES[id];
  if (alias) return alias;
  return id.replace(/-([a-z0-9])/g, (_m: string, ch: string) => ch.toUpperCase());
}

type RailIsDay0HopEntry = { method: string; path: string } | { method: string; pathTemplate: string };

/** Yayınlanmış B2C hop'ları — RAIL_V1_HOPS_META'dan türetilir, elle tutulmaz. */
export const RAIL_IS_DAY0_HOPS = Object.fromEntries(
  RAIL_V1_HOPS_META.filter((hop) => !isRailV1HopMetaDronForbidden(hop)).map((hop) => {
    const entry: RailIsDay0HopEntry = hop.v1PathTemplate.includes("{")
      ? { method: hop.method, pathTemplate: hop.v1PathTemplate }
      : { method: hop.method, path: hop.v1PathTemplate };
    return [hopKey(hop.id), entry] as const;
  }),
) as Readonly<
  Record<string, { method: string; path: string; pathTemplate: string }> & {
    session: { method: string; path: string };
    walletStrip: { method: string; path: string };
    walletTopUp: { method: string; path: string };
    academyPulse: { method: string; path: string };
    careerVisas: { method: string; path: string };
  }
>;

/**
 * Faz 2 Tezgâh sicili — canlı allowlist değildir.
 * Kenar 410 / unpublished hop; Dron istemci bu path'lere HTTP atmaz.
 */
export const RAIL_IS_FAZ2_FROZEN_HOPS = {
  jobs: { method: "GET", path: "/api/v1/freelancer/jobs" },
  bid: { method: "POST", pathTemplate: "/api/v1/freelancer/jobs/{id}/bids" },
  ownerBids: { method: "GET", pathTemplate: "/api/v1/client/jobs/{id}/bids" },
  accept: { method: "POST", pathTemplate: "/api/v1/freelancer/jobs/{id}/accept" },
  contracts: { method: "GET", path: "/api/v1/freelancer/contracts" },
  delivery: {
    method: "POST",
    pathTemplate: "/api/v1/freelancer/contracts/{id}/messages",
  },
  release: {
    method: "POST",
    pathTemplate: "/api/v1/freelancer/contracts/{id}/release",
  },
} as const;

/** Tezgâh odak / ön plan anketi. Faz 2 lab; 5 sn altı yasak varsayımı. */
export const RAIL_IS_BENCH_POLL_MS = 30_000;

function compileRailV1PathTemplate(template: string): RegExp {
  const source = template
    .replace(/\{([A-Za-z0-9_]+)\}/g, "\u0000param\u0000")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\u0000param\u0000/g, "[^/]+");
  return new RegExp(`^${source}$`);
}

const DAY0_MATCHERS = RAIL_V1_HOPS_META.filter((hop) => !isRailV1HopMetaDronForbidden(hop)).map(
  (hop) => ({
    method: hop.method,
    re: compileRailV1PathTemplate(hop.v1PathTemplate),
  }),
);

function normalizeMethod(method: string): string {
  return method.trim().toUpperCase();
}

function assertSafeId(value: string, label: string): string {
  const id = value.trim();
  if (!id || id.includes("/") || id.includes("?") || id.includes("#")) {
    throw new Error(`${label} kimliği geçersiz.`);
  }
  return id;
}

export function juniorLessonPath(lessonKey: string): string {
  return `/api/v1/junior/lessons/${assertSafeId(lessonKey, "Ders")}`;
}

export function juniorLessonPlayPath(lessonKey: string, profileId?: string | null): string {
  const path = `${juniorLessonPath(lessonKey)}/play`;
  const id = profileId?.trim() ?? "";
  if (!id) {
    return path;
  }
  return `${path}?profileId=${encodeURIComponent(assertSafeId(id, "Profil"))}`;
}

export function juniorLessonProgressPath(lessonKey: string): string {
  return `${juniorLessonPath(lessonKey)}/progress`;
}

export function juniorLessonPracticePath(lessonKey: string): string {
  return `${juniorLessonPath(lessonKey)}/practice`;
}

export function juniorPilotProfilesPath(): string {
  return "/api/v1/junior-pilot/profiles";
}

export function juniorPilotElectivesPath(): string {
  return "/api/v1/junior-pilot/electives";
}

export function juniorPilotTellPath(): string {
  return "/api/v1/junior-pilot/tell";
}

export function juniorPilotPracticePath(): string {
  return "/api/v1/junior-pilot/practice";
}

export function juniorPilotQuizPath(): string {
  return "/api/v1/junior-pilot/quiz";
}

export function academyCertificatePath(hash: string): string {
  return `/api/v1/academy/certificates/${assertSafeId(hash, "Mühür")}`;
}

export function academyCourseWritePath(
  courseId: string,
  leaf: "purchase" | "lock" | "curriculum" | "exam",
): string {
  return `/api/v1/academy/courses/${assertSafeId(courseId, "Kurs")}/${leaf}`;
}

/** Faz 2 sicil path üreticisi — canlı allowlist'e girmez. */
export function freelancerBidPath(jobId: string): string {
  return `/api/v1/freelancer/jobs/${assertSafeId(jobId, "İş")}/bids`;
}

export function clientJobBidsPath(jobId: string): string {
  return `/api/v1/client/jobs/${assertSafeId(jobId, "İş")}/bids`;
}

export function freelancerAcceptPath(jobId: string): string {
  return `/api/v1/freelancer/jobs/${assertSafeId(jobId, "İş")}/accept`;
}

export function freelancerDeliveryPath(contractId: string): string {
  return `/api/v1/freelancer/contracts/${assertSafeId(contractId, "Sözleşme")}/messages`;
}

export function freelancerReleasePath(contractId: string): string {
  return `/api/v1/freelancer/contracts/${assertSafeId(contractId, "Sözleşme")}/release`;
}

export function isRailIsDay0Path(path: string, method = "GET"): boolean {
  const pathname = path.split("?")[0] ?? path;
  const verb = normalizeMethod(method);
  return DAY0_MATCHERS.some((row) => row.method === verb && row.re.test(pathname));
}

function safeProfileQuery(raw: string): string {
  if (raw.includes("#")) {
    throw new Error("Dron yolu parça taşımaz.");
  }
  const mark = raw.indexOf("?");
  if (mark < 0) {
    return "";
  }
  const query = raw.slice(mark + 1);
  const params = new URLSearchParams(query);
  const keys = [...params.keys()];
  if (keys.length !== 1 || keys[0] !== "profileId") {
    throw new Error("Dron sorgu dizisi yalnız profileId taşır.");
  }
  const value = params.get("profileId") ?? "";
  return `?profileId=${encodeURIComponent(assertSafeId(value, "Profil"))}`;
}

export function assertRailIsDay0Path(path: string, method = "GET"): string {
  const raw = path.trim();
  const pathname = (raw.split("?")[0] ?? raw).trim();
  if (!pathname.startsWith("/api/v1/")) {
    throw new Error("Dron yalnız /api/v1 konuşur.");
  }
  if (!isRailIsDay0Path(pathname, method)) {
    throw new Error(`Gün 0 allowlist dışı hop: ${pathname}`);
  }
  return `${pathname}${safeProfileQuery(raw)}`;
}
