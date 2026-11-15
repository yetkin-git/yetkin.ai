import { SEN_VOICE } from "@/lib/copy/sen-voice";
import {
  academyContinueHref,
  hasIncompleteAcademyPurchase,
} from "@/lib/dashboard/next-best-action";
import type { DashboardPulse } from "@/lib/dashboard/pulse";
import { formatMinor } from "@/lib/kernel/money/format";

/** Kota okunamadıysa `live: false`. Sayı uydurulmaz. */
export type CommandQuotaRead = {
  live: boolean;
  remaining: number;
  limit: number;
};

/** Mağaza özeti. `down` hata veya boş bağdır; kayıtlı mağaza yoktur denmez. */
export type CommandStoreRead =
  | { kind: "ok"; stores: readonly { status: "DRAFT" | "ACTIVE" }[] }
  | { kind: "down" };

export type CommandStat = {
  label: string;
  value: string;
};

export type CommandCardModel = {
  key: "tezgah" | "commerce" | "academy" | "career";
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

function quotaValue(quota: CommandQuotaRead): string {
  const copy = SEN_VOICE.dashboard.command;
  const limit = countOf(quota.limit);
  if (!quota.live || limit <= 0) {
    return copy.unknown;
  }
  const remaining = Math.min(countOf(quota.remaining), limit);
  return `${remaining} / ${limit}`;
}

function tezgahCard(quota: CommandQuotaRead, toolCount: number): CommandCardModel {
  const copy = SEN_VOICE.dashboard.command;
  const tools = countOf(toolCount);
  return {
    key: "tezgah",
    title: copy.tezgahTitle,
    stats: [{ label: copy.tezgahQuota, value: quotaValue(quota) }],
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
      href: "/magazam",
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
      href: "/magazam",
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
    href: "/magazam",
    cta: copy.commerceManageCta,
  };
}

function academyCard(pulse: DashboardPulse): CommandCardModel {
  const copy = SEN_VOICE.dashboard;
  const academy = pulse.academy;
  const continueCourse = hasIncompleteAcademyPurchase(academy);
  let detail: string | null = null;
  if (!academy.live) {
    detail = copy.pulse.unavailable;
  } else if (academy.lastCertificateTitle) {
    detail = academy.lastCertificateTitle;
  } else if (academy.certificatesHeld === 0) {
    detail = copy.pulse.academyEmpty;
  }
  return {
    key: "academy",
    title: copy.pulse.academyTitle,
    stats: [
      { label: copy.pulse.academyPurchase, value: shownCount(academy.live, academy.purchasesCount) },
      {
        label: copy.pulse.academyCertificate,
        value: shownCount(academy.live, academy.certificatesHeld),
      },
    ],
    detail,
    href: continueCourse ? academyContinueHref(academy.lastCourseSlug) : "/academy",
    cta: continueCourse ? copy.nextBestAction.academyContinue.cta : copy.pulse.academyEmptyCta,
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
}): CommandCenterModel {
  return [
    tezgahCard(input.quota, input.toolCount),
    commerceCard(input.stores),
    academyCard(input.pulse),
    careerCard(input.pulse),
  ];
}
