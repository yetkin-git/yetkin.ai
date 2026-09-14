import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_GRANT_LOCK_PREFIX } from "@/lib/academy/enrolment";
import {
  FUNNEL_CLEARED_STATUS,
  FUNNEL_COHORT_BUCKET_IDS,
  FUNNEL_DEFAULT_RANGE,
  FUNNEL_EXCLUDED_VISA_SOURCE_KIND,
  FUNNEL_FAILED_STATUS,
  FUNNEL_GRANT_LOCK_LIKE,
  FUNNEL_GRANT_LOCK_PREFIX,
  FUNNEL_PAID_STATUS,
  FUNNEL_PENDING_STATUS,
  FUNNEL_RANGE_INVALID,
  FUNNEL_RANGES,
  FUNNEL_STEP_IDS,
  FUNNEL_TIME_ZONE,
  FUNNEL_VISA_SOURCE_KIND,
  FUNNEL_VIZE_HIT_STEP,
  FUNNEL_WALLET_PURPOSE,
  PAYTR_PENDING_TIMEOUT_MS,
  isAcademyFunnelVisaSource,
  isCommercialFunnelPriceLockId,
} from "@/lib/kernel/admin/funnel-constants";
import {
  formatFunnelCashLeak,
  formatFunnelConversion,
  formatFunnelCount,
  formatFunnelDropOff,
  formatFunnelHours,
  formatLeakPercent,
} from "@/lib/kernel/admin/funnel-display";
import { buildCohortMetrics, buildFunnelStepMetrics, buildLeakMetrics } from "@/lib/kernel/admin/funnel-rates";
import { FUNNEL_READ_PATH } from "@/lib/kernel/admin/types";
import {
  addIstanbulDays,
  coerceFunnelRange,
  istanbulYmd,
  parseFunnelRangeParam,
  resolveFunnelWindow,
} from "@/lib/kernel/admin/funnel-window";
import { queryFunnelSnapshot, type FunnelQueryPort } from "@/lib/kernel/admin/funnel-query";
import { toFunnelBoardWire } from "@/lib/kernel/admin/funnel-display";
import { WALLET_TOP_UP_PURPOSE } from "@/lib/kernel/payments/clearing";
import { PAYTR_PENDING_TIMEOUT_MS as PAYTR_RECONCILE_TIMEOUT_MS } from "@/lib/kernel/payments/paytr/reconcile";
import { ADMIN_UNSET_LABEL } from "@/lib/kernel/admin/display";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { BadRequestError } from "@/lib/kernel/http/errors";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("admin B2C kazanım hunisi", () => {
  it("sa_grant bağışı ve freelancer damgası ticari huniden çıkarılır", () => {
    expect(FUNNEL_GRANT_LOCK_PREFIX).toBe("sa_grant:");
    expect(FUNNEL_GRANT_LOCK_PREFIX).toBe(ACADEMY_GRANT_LOCK_PREFIX);
    expect(FUNNEL_GRANT_LOCK_LIKE).toBe("sa_grant:%");
    expect(isCommercialFunnelPriceLockId("lock_live_1")).toBe(true);
    expect(isCommercialFunnelPriceLockId(`${FUNNEL_GRANT_LOCK_PREFIX}u:c1`)).toBe(false);
    expect(FUNNEL_VISA_SOURCE_KIND).toBe("ACADEMY_CERTIFICATE");
    expect(FUNNEL_EXCLUDED_VISA_SOURCE_KIND).toBe("FREELANCER_RELEASE");
    expect(isAcademyFunnelVisaSource("ACADEMY_CERTIFICATE")).toBe(true);
    expect(isAcademyFunnelVisaSource("FREELANCER_RELEASE")).toBe(false);
    expect(FUNNEL_WALLET_PURPOSE).toBe(WALLET_TOP_UP_PURPOSE);
    expect(FUNNEL_CLEARED_STATUS).toBe("CLEARED");
    expect(FUNNEL_PENDING_STATUS).toBe("PENDING");
    expect(FUNNEL_PAID_STATUS).toBe("PAID");
    expect(FUNNEL_FAILED_STATUS).toBe("FAILED");
    expect(PAYTR_PENDING_TIMEOUT_MS).toBe(2 * 60 * 60 * 1000);
    expect(PAYTR_PENDING_TIMEOUT_MS).toBe(PAYTR_RECONCILE_TIMEOUT_MS);

    const query = readSrc("lib/kernel/admin/funnel-query.ts");
    expect(query).toContain("COUNT(DISTINCT");
    expect(query).toContain("NOT LIKE");
    expect(query).toContain("FUNNEL_GRANT_LOCK_LIKE");
    expect(query).toContain("AT TIME ZONE");
    expect(query).toContain("FUNNEL_TIME_ZONE");
    expect(query).toContain("source_kind = ${visaKind}");
    expect(query).toContain("FUNNEL_VISA_SOURCE_KIND");
    expect(query).not.toContain("FREELANCER_RELEASE");
    expect(query).not.toContain("lib/academy");
    expect(query).toContain('import "server-only"');
    expect(query).toContain("cohort_users");
    expect(query).toContain("percentile_cont");
    expect(query).toContain("CROSS JOIN");
    expect(query).toContain("PAYTR_PENDING_TIMEOUT_MS");
    expect(query).toContain("pending_in_flight");
    expect(query).toContain("pending_stale");
    expect(query).not.toContain("email");
    expect(query).not.toContain("merchant_oid");
    expect(query).not.toContain("merchantOid");
    expect(query).not.toContain("$executeRaw");
  });

  it("grant satırı SETTLED sayacını şişirmez; bağış süzgeci SQL'e gider", async () => {
    const captured: { sql: string; values: unknown[] }[] = [];
    const db: FunnelQueryPort = {
      $queryRaw: async <T,>(strings: TemplateStringsArray, ...values: unknown[]) => {
        captured.push({ sql: strings.join("?"), values });
        return [{ n: 2n }] as T;
      },
    };
    const snapshot = await queryFunnelSnapshot("7d", new Date("2026-09-12T12:00:00.000Z"), db);
    expect(captured).toHaveLength(7);
    const purchaseSql = captured.find((row) => row.sql.includes("academy_purchases"));
    expect(purchaseSql?.values).toContain(FUNNEL_GRANT_LOCK_LIKE);
    expect(purchaseSql?.sql).toContain("NOT LIKE");
    const examSql = captured.find((row) => row.sql.includes("academy_exam_attempts"));
    expect(examSql?.values).toContain(FUNNEL_GRANT_LOCK_LIKE);
    const visaSql = captured.find((row) => row.sql.includes("career_visa_stamps"));
    expect(visaSql?.values).toContain(FUNNEL_VISA_SOURCE_KIND);
    expect(visaSql?.values).not.toContain(FUNNEL_EXCLUDED_VISA_SOURCE_KIND);
    expect(snapshot.steps.find((step) => step.id === "purchase_settled")?.count).toBe(2);
  });

  it("metadata /vize sayacını tetiklemez; hit yalnız found gövdesindedir", () => {
    const page = readSrc("app/(public)/vize/[id]/page.tsx");
    const load = readSrc("lib/career/public-talent-load.ts");
    const hit = readSrc("lib/career/public-talent-hit.ts");
    const alias = readSrc("app/(public)/p/[id]/page.tsx");
    const generateBlock = page.slice(
      page.indexOf("export async function generateMetadata"),
      page.indexOf("export default async function PublicTalentPage"),
    );
    const bodyBlock = page.slice(page.indexOf("export default async function PublicTalentPage"));
    expect(generateBlock).not.toContain("recordPublicTalentCardHit");
    expect(generateBlock).toContain("loadPublicTalentCard");
    expect(bodyBlock).toContain("recordPublicTalentCardHit");
    expect(bodyBlock).toContain('status === "missing"');
    expect(load).not.toContain("recordPublicTalentCardHit");
    expect(load).not.toContain("funnel_daily_counters");
    expect(hit).toContain("funnel_daily_counters");
    expect(hit).toContain("ON CONFLICT");
    expect(hit).toContain("counter_failed");
    expect(hit).not.toContain("source_ip");
    expect(hit).not.toContain("userAgent");
    expect(alias).toContain("permanentRedirect");
    expect(alias).not.toContain("recordPublicTalentCardHit");
  });

  it("gtag / GTM huninin parçası değildir", () => {
    const files = [
      "lib/kernel/sem/conversion.ts",
      "lib/kernel/admin/funnel-query.ts",
      "lib/kernel/admin/funnel-load.ts",
      "lib/kernel/admin/funnel-rates.ts",
      "lib/kernel/admin/funnel-display.ts",
      "lib/kernel/admin/funnel-constants.ts",
      "components/kernel/admin-funnel-board.tsx",
      "app/api/(kernel)/admin/funnel/route.ts",
      "app/(kernel)/admin/page.tsx",
    ];
    for (const relative of files) {
      const source = readSrc(relative);
      expect(source, relative).not.toContain("gtag.js");
      expect(source, relative).not.toContain("googletagmanager");
      expect(source, relative).not.toContain("google-analytics");
      expect(source, relative).not.toContain("GTM-");
      expect(source, relative).not.toContain("recharts");
      expect(source, relative).not.toContain("from \"d3\"");
      expect(source, relative).not.toContain("from 'd3'");
    }
    const schema = readSrc("prisma/schema/kernel.prisma");
    expect(schema).toContain("model FunnelDailyCounter");
    expect(schema).not.toContain("model FunnelEvent");
    expect(readSrc("apps/rail-is/src/api/hops.ts")).not.toContain("/api/admin/funnel");
  });

  it("Super Admin tahtası ve BFF PII taşımaz; kota ve no-store durur", () => {
    const page = readSrc("app/(kernel)/admin/page.tsx");
    const route = readSrc("app/api/(kernel)/admin/funnel/route.ts");
    const load = readSrc("lib/kernel/admin/funnel-load.ts");
    const board = readSrc("components/kernel/admin-funnel-board.tsx");
    const sen = readSrc("lib/copy/sen-voice/admin.ts");
    expect(page).toContain("loadAdminFunnelBoard");
    expect(page).toContain("<AdminFunnelBoard");
    expect(page.indexOf("<AdminFunnelBoard")).toBeLessThan(page.indexOf("<AdminCatalogList"));
    expect(route).toContain('export const auth = "admin"');
    expect(route).toContain("requireSuperAdmin");
    expect(route).toContain("private, no-store");
    expect(route).toContain("HTTP_RATE_LIMITS.adminIp");
    expect(route).not.toContain("$executeRaw");
    expect(route).not.toContain("userId");
    expect(route).not.toContain("email");
    expect(load).toContain("isSuperAdminActor");
    expect(load).toContain("isSupabaseUserId");
    expect(load).toContain("unavailable");
    expect(board).toContain("vizeHint");
    expect(board).toContain("leakTitle");
    expect(board).toContain("columns={2}");
    expect(board).toContain("width:");
    expect(board).not.toContain("getPrisma");
    expect(board).not.toContain("userId");
    expect(board).not.toContain("merchantOid");
    expect(sen).toContain("Kart gösterimi");
    expect(sen).toContain("Checkout kaçağı");
    expect(sen).toContain("Nakit kaçak yok");
    expect(sen).toContain("Uçuştaki PENDING kaçak sayılmaz");
    expect(sen).toContain("30 günlük gözlemi henüz dolmadı");
    expect(ADMIN_SEN.funnel.vizeHint).toContain("Tekil işveren değildir");
    expect(ADMIN_SEN.funnel.inFlightHint).toContain("kaçak sayılmaz");
    expect(FUNNEL_READ_PATH).toBe("/api/admin/funnel");
    expect(FUNNEL_STEP_IDS).toHaveLength(6);
    expect(FUNNEL_COHORT_BUCKET_IDS).toEqual([
      "same_day",
      "d1_3",
      "d4_7",
      "d8_30",
      "after_30",
      "still_open",
    ]);
    expect(FUNNEL_VIZE_HIT_STEP).toBe("vize_hit");
    expect(FUNNEL_TIME_ZONE).toBe("Europe/Istanbul");
    expect(FUNNEL_RANGES).toEqual(["today", "7d", "30d"]);
    expect(FUNNEL_DEFAULT_RANGE).toBe("7d");
  });

  it("İstanbul takvim penceresi UTC gece yarısını kaydırmaz; payda 0 iken sahte %100 yok", () => {
    expect(istanbulYmd(new Date("2026-09-11T21:30:00.000Z"))).toBe("2026-09-12");
    expect(istanbulYmd(new Date("2026-09-11T20:59:59.000Z"))).toBe("2026-09-11");
    expect(addIstanbulDays("2026-09-12", 1)).toBe("2026-09-13");
    const week = resolveFunnelWindow("7d", new Date("2026-09-12T12:00:00.000Z"));
    expect(week.fromYmd).toBe("2026-09-06");
    expect(week.toYmdExclusive).toBe("2026-09-13");
    expect(week.timeZone).toBe("Europe/Istanbul");
    expect(parseFunnelRangeParam(null)).toBe("7d");
    expect(coerceFunnelRange("nope")).toBe("7d");
    expect(() => parseFunnelRangeParam("nope")).toThrow(BadRequestError);
    expect(() => parseFunnelRangeParam("nope")).toThrow(FUNNEL_RANGE_INVALID);

    const metrics = buildFunnelStepMetrics({
      register: 10,
      wallet_cleared: 4,
      purchase_settled: 0,
      exam_pass: 0,
      visa_stamp: 2,
      vize_hit: 5,
    });
    expect(metrics[0]?.conversionFromPrevious).toBeNull();
    expect(metrics[1]?.conversionFromPrevious).toBe(0.4);
    expect(metrics[1]?.dropOffFromPrevious).toBe(0.6);
    expect(metrics[2]?.conversionFromPrevious).toBe(0);
    expect(metrics[2]?.dropOffFromPrevious).toBe(1);
    expect(metrics[3]?.conversionFromPrevious).toBeNull();
    expect(metrics[3]?.dropOffFromPrevious).toBeNull();
    const vize = metrics.find((row) => row.id === "vize_hit");
    expect(vize?.unit).toBe("impressions");
    expect(vize?.conversionKind).toBe("impressions_per_stamp");
    expect(vize?.conversionFromPrevious).toBe(2.5);
    expect(vize?.dropOffFromPrevious).toBeNull();
    expect(formatFunnelCount(12)).toBe("12");
    expect(formatFunnelConversion(metrics[1]!)).toBe("%40");
    expect(formatFunnelDropOff(metrics[1]!)).toBe("%60");
    expect(formatFunnelConversion(vize!)).toContain("×");

    const emptyLeak = buildLeakMetrics({
      opened: 0,
      pendingInFlight: 4,
      pendingStale: 0,
      paid: 0,
      failed: 0,
      cleared: 0,
      cashLeakMinor: 0,
    });
    expect(emptyLeak.checkoutLeak).toBeNull();
    expect(emptyLeak.clearedRate).toBeNull();
    expect(formatLeakPercent(emptyLeak.checkoutLeak)).toBe(ADMIN_UNSET_LABEL);
    expect(formatFunnelHours(null)).toBe(ADMIN_UNSET_LABEL);
    expect(formatFunnelHours(4.2)).toBe("4,2 saat");
    expect(formatFunnelHours(48)).toBe("2 gün");
    expect(formatFunnelCashLeak(0)).toBe("₺0");

    const emptyCohort = buildCohortMetrics(
      {
        registrants: 0,
        converted: 0,
        stillOpen: 0,
        sameDay: 0,
        d1_3: 0,
        d4_7: 0,
        d8_30: 0,
        after30: 0,
        medianHours: null,
      },
      "today",
    );
    expect(emptyCohort.cumulative.withinSameDay).toBeNull();
    expect(emptyCohort.cumulative.within30d).toBeNull();
    expect(emptyCohort.observationIncomplete).toBe(true);
    expect(
      buildCohortMetrics(
        {
          registrants: 8,
          converted: 3,
          stillOpen: 5,
          sameDay: 1,
          d1_3: 1,
          d4_7: 1,
          d8_30: 0,
          after30: 0,
          medianHours: 11,
        },
        "30d",
      ).observationIncomplete,
    ).toBe(false);

    const wire = toFunnelBoardWire({
      window: week,
      steps: metrics,
      cohort: emptyCohort,
      leak: emptyLeak,
      generatedAt: new Date("2026-09-12T12:00:00.000Z"),
    });
    expect(wire.cohort).toEqual(emptyCohort);
    expect(wire.leak).toEqual(emptyLeak);
    expect(JSON.stringify(wire)).not.toMatch(/userId|e-posta|email|merchantOid|stampId/i);
    expect(wire.window.from).toMatch(/Z$/);
  });

  it("uçuştaki PENDING kaçak sayılmaz; CTE PII basmaz; JSON additive kalır", async () => {
    const now = new Date("2026-09-12T12:00:00.000Z");
    const staleBefore = new Date(now.getTime() - PAYTR_PENDING_TIMEOUT_MS);
    const captured: { sql: string; values: unknown[] }[] = [];
    const db: FunnelQueryPort = {
      $queryRaw: async <T,>(strings: TemplateStringsArray, ...values: unknown[]) => {
        const sql = strings.join("?");
        captured.push({ sql, values });
        if (sql.includes("cohort_users")) {
          return [
            {
              registrants: 10n,
              converted: 4n,
              still_open: 6n,
              same_day: 1n,
              d1_3: 2n,
              d4_7: 1n,
              d8_30: 0n,
              after_30: 0n,
              median_hours: 11,
              opened: 10n,
              pending_in_flight: 3n,
              pending_stale: 1n,
              paid: 0n,
              failed: 2n,
              cleared: 4n,
              cash_leak_minor: 0n,
            },
          ] as T;
        }
        return [{ n: 2n }] as T;
      },
    };

    const snapshot = await queryFunnelSnapshot("7d", now, db);
    const cte = captured.find((row) => row.sql.includes("cohort_users"));
    expect(cte).toBeDefined();
    expect(cte?.sql).toContain("percentile_cont");
    expect(cte?.sql).toContain("CROSS JOIN");
    expect(cte?.sql).toContain("MIN(");
    expect(cte?.sql).toContain("created_at >= ?");
    expect(cte?.sql).toContain("created_at < ?");
    expect(cte?.values).toContain(FUNNEL_WALLET_PURPOSE);
    expect(cte?.values).toContain(FUNNEL_CLEARED_STATUS);
    expect(cte?.values).toContain(FUNNEL_PENDING_STATUS);
    expect(cte?.values).toContain(FUNNEL_PAID_STATUS);
    expect(cte?.values).toContain(FUNNEL_FAILED_STATUS);
    expect(cte?.values).toContainEqual(staleBefore);
    expect(cte?.sql).not.toMatch(/email|merchant_oid|merchantOid/i);
    expect(JSON.stringify(cte?.sql)).not.toMatch(/gtag|googletagmanager/i);

    expect(snapshot.steps.map((step) => step.id)).toEqual([...FUNNEL_STEP_IDS]);
    expect(snapshot.leak.pendingInFlight).toBe(3);
    expect(snapshot.leak.pendingStale).toBe(1);
    expect(snapshot.leak.failed).toBe(2);
    expect(snapshot.leak.opened).toBe(10);
    expect(snapshot.leak.checkoutLeak).toBe(0.3);
    expect(snapshot.leak.clearedRate).toBe(0.4);
    expect(snapshot.leak.cashLeakMinor).toBe(0);
    expect(snapshot.cohort.registrants).toBe(10);
    expect(snapshot.cohort.converted).toBe(4);
    expect(snapshot.cohort.stillOpen).toBe(6);
    expect(snapshot.cohort.cumulative.within7d).toBe(0.4);
    expect(snapshot.cohort.medianHours).toBe(11);
    expect(snapshot.cohort.observationIncomplete).toBe(true);

    const naivePendingShare = (3 + 1 + 2) / 10;
    expect(snapshot.leak.checkoutLeak).not.toBe(naivePendingShare);

    const wire = toFunnelBoardWire(snapshot);
    expect(wire.cohort.buckets).toHaveLength(6);
    expect(wire.leak.pendingInFlight).toBe(3);
    expect(JSON.stringify(wire)).not.toMatch(/userId|e-posta|email|merchantOid|stampId/i);
    expect(JSON.stringify(wire)).not.toContain("gtag");

    const paidLeak = buildLeakMetrics({
      opened: 5,
      pendingInFlight: 1,
      pendingStale: 0,
      paid: 2,
      failed: 0,
      cleared: 2,
      cashLeakMinor: 1500,
    });
    expect(paidLeak.checkoutLeak).toBe(0);
    expect(paidLeak.cashLeakMinor).toBe(1500);
    expect(paidLeak.clearedRate).toBe(0.4);
  });
});
