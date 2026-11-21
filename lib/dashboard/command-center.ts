import { SEN_VOICE } from "@/lib/copy/sen-voice";
import type { DashboardPulse } from "@/lib/dashboard/pulse";
import { formatMinor } from "@/lib/kernel/money/format";

/**
 * Tezgâh kotasının panel dili.
 * `FREE_DAILY` günlük ücretsiz haktır. `CREDIT_PACK` üretim kredisidir.
 * `PRO` sınırsız erişimdir. `CLOSED` ücretsiz hak bitmiş, kredi ve Pro yoktur.
 */
export type CommandQuotaLane = "FREE_DAILY" | "CREDIT_PACK" | "PRO" | "CLOSED";

/** Kota okunamadıysa `live: false`. Sayı uydurulmaz. `lane` düşmez. */
export type CommandQuotaRead = {
  live: boolean;
  remaining: number;
  limit: number;
  lane: CommandQuotaLane;
};

/** `peekTezgahQuota` şeridini panel etiketine çevirir. Kredi, günlük hak olmaz. */
export function commandQuotaLane(
  lane: "free" | "pro" | "credit" | "prepaid" | "closed",
): CommandQuotaLane {
  if (lane === "pro") {
    return "PRO";
  }
  if (lane === "credit" || lane === "prepaid") {
    return "CREDIT_PACK";
  }
  if (lane === "free") {
    return "FREE_DAILY";
  }
  return "CLOSED";
}

/** Mağaza özeti. `down` hata veya boş bağdır; kayıtlı mağaza yoktur denmez. */
export type CommandStoreRead =
  | { kind: "ok"; stores: readonly { status: "DRAFT" | "ACTIVE" }[] }
  | { kind: "down" };

export type CommandStat = {
  label: string;
  value: string;
};

export type CommandHibeRead = {
  live: boolean;
  profiles: number;
  dossiers: number;
};

export type CommandCardModel = {
  key: "tezgah" | "commerce" | "hibe" | "career";
  eyebrow?: string;
  title: string;
  stats: readonly CommandStat[];
  detail: string | null;
  href: string;
  cta: string;
};

export type CommandCenterModel = readonly [
  CommandCardModel,
  CommandCardModel,
  CommandCardModel,
  CommandCardModel,
];

function countOf(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.trunc(value);
}

function shownCount(live: boolean, value: number): string {
  const copy = SEN_VOICE.dashboard.command;
  if (!live) {
    return copy.unknown;
  }
  return String(countOf(value));
}

function tezgahQuotaStat(quota: CommandQuotaRead): CommandStat {
  const copy = SEN_VOICE.dashboard.command;
  if (!quota.live) {
    return { label: copy.tezgahQuotaFree, value: copy.unknown };
  }
  if (quota.lane === "PRO") {
    return { label: copy.tezgahQuotaPro, value: copy.tezgahQuotaUnlimited };
  }
  if (quota.lane === "CREDIT_PACK") {
    return { label: copy.tezgahQuotaCredit, value: String(countOf(quota.remaining)) };
  }
  const limit = countOf(quota.limit);
  if (limit <= 0) {
    return { label: copy.tezgahQuotaFree, value: copy.unknown };
  }
  const remaining = Math.min(countOf(quota.remaining), limit);
  return { label: copy.tezgahQuotaFree, value: `${remaining}/${limit}` };
}

function tezgahCard(quota: CommandQuotaRead, toolCount: number): CommandCardModel {
  const copy = SEN_VOICE.dashboard.command;
  const tools = countOf(toolCount);
  return {
    key: "tezgah",
    title: copy.tezgahTitle,
    stats: [tezgahQuotaStat(quota)],
    detail: copy.tezgahToolsReady(tools),
    href: "/tezgah",
    cta: copy.tezgahCta,
  };
}

function commerceCard(stores: CommandStoreRead): CommandCardModel {
  const copy = SEN_VOICE.dashboard.command;
  const pulse = SEN_VOICE.dashboard.pulse;
  if (stores.kind !== "ok") {
    return {
      key: "commerce",
      eyebrow: copy.commerceEyebrow,
      title: copy.commerceTitle,
      stats: [{ label: copy.commerceCount, value: copy.unknown }],
      detail: pulse.unavailable,
      href: "/e-ticaret",
      cta: copy.commerceManageCta,
    };
  }
  const storeCount = stores.stores.length;
  const activeCount = stores.stores.filter((store) => store.status === "ACTIVE").length;
  if (storeCount === 0) {
    return {
      key: "commerce",
      eyebrow: copy.commerceEyebrow,
      title: copy.commerceTitle,
      stats: [{ label: copy.commerceCount, value: "0" }],
      detail: copy.commerceNone,
      href: "/e-ticaret",
      cta: copy.commerceOpenCta,
    };
  }
  return {
    key: "commerce",
    eyebrow: copy.commerceEyebrow,
    title: copy.commerceTitle,
    stats: [
      { label: copy.commerceCount, value: String(storeCount) },
      { label: copy.commerceActive, value: String(activeCount) },
    ],
    detail: activeCount === 0 ? copy.commerceDraft : null,
    href: "/e-ticaret",
    cta: copy.commerceManageCta,
  };
}

function hibeCard(hibe: CommandHibeRead | undefined): CommandCardModel {
  const copy = SEN_VOICE.dashboard.command;
  if (!hibe?.live) {
    return {
      key: "hibe",
      eyebrow: "YetkinHibe",
      title: "Hibe dosyası",
      stats: [{ label: "Dosya", value: copy.unknown }],
      detail: "Uygunluk ve proje dosyası YetkinHibe’de açılır.",
      href: "/hibe",
      cta: "YetkinHibe’yi aç",
    };
  }
  return {
    key: "hibe",
    eyebrow: "YetkinHibe",
    title: "Hibe dosyası",
    stats: [
      { label: "Analiz", value: String(countOf(hibe.profiles)) },
      { label: "Dosya", value: String(countOf(hibe.dossiers)) },
    ],
    detail: countOf(hibe.dossiers) === 0 ? "Henüz proje dosyası yok." : null,
    href: "/hibe",
    cta: "YetkinHibe’yi aç",
  };
}

function careerCard(pulse: DashboardPulse): CommandCardModel {
  const copy = SEN_VOICE.dashboard.command;
  const voice = SEN_VOICE.dashboard;
  const career = pulse.career;
  const wallet = pulse.wallet;
  let status: string;
  if (!career.live) {
    status = voice.pulse.unavailable;
  } else if (countOf(career.visaCount) > 0) {
    status = career.lastVisaTitle
      ? `${career.lastVisaTitle}. ${copy.careerPlanReady}`
      : copy.careerPlanReady;
  } else {
    status = copy.careerPlanEmpty;
  }
  const balance = wallet.live
    ? formatMinor(wallet.amountMinor, wallet.currencyCode)
    : copy.unknown;
  return {
    key: "career",
    title: copy.careerTitle,
    stats: [
      { label: voice.pulse.careerVisa, value: shownCount(career.live, career.visaCount) },
      { label: copy.careerWallet, value: balance },
    ],
    detail: status,
    href: "/career",
    cta: copy.careerCta,
  };
}

/**
 * Dört kartın görünen hali. Yazma yok.
 * Okunamayan oda "—" ve yüklenemedi der; bilinen boşluk 0 ve boş cümledir.
 */
export function projectCommandCenter(input: {
  pulse: DashboardPulse;
  stores: CommandStoreRead;
  quota: CommandQuotaRead;
  toolCount: number;
  hibe?: CommandHibeRead;
}): CommandCenterModel {
  return [
    commerceCard(input.stores),
    hibeCard(input.hibe),
    tezgahCard(input.quota, input.toolCount),
    careerCard(input.pulse),
  ];
}
