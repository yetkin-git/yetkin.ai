import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { lookupCitizenEmail } from "@/lib/kernel/notice/contact";
import { isNoticeMailConfigured, readNoticeMailConfig } from "@/lib/kernel/notice/mail";
import { sendNoticeSmtp } from "@/lib/kernel/notice/smtp";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  opportunityForInstant,
  opportunityWeekKey,
} from "@/lib/matchmaking/opportunity-pool";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";
import {
  catalogEntryToBriefCall,
  HIBE_PANEL_PATH,
  radarGrantText,
  type RadarCompanyProfile,
} from "@/lib/yetkinhibe/radar-profile";

export type WeeklyRadarResult = {
  weekKey: string;
  considered: number;
  sent: number;
  skipped: number;
  reason: "ok" | "mail-unconfigured" | "no-database";
};

function origin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://yetkin.ai").replace(/\/$/, "");
}

/**
 * Haftalık fırsat radarı. Metin sabittir; model çağrılmaz.
 * Aynı üye ve hafta ikinci kez gitmez.
 */
export async function runWeeklyOpportunityRadar(now = new Date()): Promise<WeeklyRadarResult> {
  const weekKey = opportunityWeekKey(now);
  if (!process.env.DATABASE_URL?.trim()) {
    return { weekKey, considered: 0, sent: 0, skipped: 0, reason: "no-database" };
  }
  if (!isNoticeMailConfigured()) {
    return { weekKey, considered: 0, sent: 0, skipped: 0, reason: "mail-unconfigured" };
  }
  const config = readNoticeMailConfig();
  if (!config) {
    return { weekKey, considered: 0, sent: 0, skipped: 0, reason: "mail-unconfigured" };
  }
  const prisma = getPrisma();
  const opportunity = opportunityForInstant(now);
  const link = `${origin()}${HIBE_PANEL_PATH}`;
  let briefCalls: ReturnType<typeof catalogEntryToBriefCall>[] = [];
  try {
    const catalog = await loadYetkinhibeGrantCatalog(now);
    briefCalls = catalog.map(catalogEntryToBriefCall);
  } catch {
    briefCalls = [];
  }
  const members = await prisma.user.findMany({
    where: {
      OR: [
        { tezgahOutputs: { some: {} } },
        { academyCertificates: { some: {} } },
        { commerceStores: { some: {} } },
        // Ş10 / B-10 — hibe profili doldurmuş üye bu modülün tam hedef kitlesidir.
        // Yalnız bu ürünü kullanan KOBİ radarı hiç almıyordu; kitle artık profili olandır.
        { hibeCompanyProfile: { isNot: null } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: { id: true },
  });
  const profiles = members.length
    ? await prisma.hibeCompanyProfile.findMany({
        where: { userId: { in: members.map((member) => member.id) } },
      })
    : [];
  const profileByUser = new Map(profiles.map((row) => [row.userId, row]));
  let sent = 0;
  let skipped = 0;
  for (const member of members) {
    const email = await lookupCitizenEmail(member.id);
    if (!email) {
      skipped += 1;
      continue;
    }
    try {
      await prisma.weeklyRadarDelivery.create({
        data: { userId: member.id, weekKey, sentAt: now },
      });
    } catch {
      skipped += 1;
      continue;
    }
    const stored = profileByUser.get(member.id);
    const profile: RadarCompanyProfile | null = stored
      ? {
          provinceCode: stored.provinceCode,
          audience: stored.audience,
          naceGroup: stored.naceGroup,
          investmentFocus: stored.investmentFocus,
          employeeCount: stored.employeeCount,
          companyAgeYears: stored.companyAgeYears,
          rdMaturityLevel: stored.rdMaturityLevel,
          exportActive: stored.exportActive,
          hasPatentOrUtilityModel: stored.hasPatentOrUtilityModel,
        }
      : null;
    const grantLines =
      briefCalls.length === 0 && profile
        ? "Hibe kataloğu okunamadı. Uydurma çağrı yazılmaz."
        : radarGrantText(profile, stored != null, briefCalls, now);
    const text = [
      "Haftalık fırsat radarı",
      "",
      "Profiline uyan doğrulanmış açık hibe çağrıları:",
      grantLines,
      "",
      `Haftanın proje fırsatı: ${opportunity.title}`,
      opportunity.summary,
      `Süre ipucu: ${opportunity.durationHint}. Ödül ipucu: ${opportunity.rewardHint}.`,
      "",
      `Hibe masası: ${link}`,
      "",
      "Bu ileti bilgilendirmedir. Hibe sonucu veya iş garantisi değildir.",
    ].join("\n");
    try {
      await sendNoticeSmtp(config, {
        to: email,
        subject: "Haftalık fırsat radarı",
        text,
        fromName: "yetkin.ai",
      });
      sent += 1;
    } catch (error) {
      skipped += 1;
      logEvent({
        level: "warn",
        event: "weekly.radar.mail.failed",
        userId: member.id,
        errorName: error instanceof Error ? error.name : "unknown",
      });
    }
  }
  logEvent({
    level: "info",
    event: "weekly.radar.done",
    reason: weekKey,
    applied: sent > 0,
  });
  return { weekKey, considered: members.length, sent, skipped, reason: "ok" };
}
