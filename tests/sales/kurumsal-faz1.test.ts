import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  decideEdgeApiAuth,
  EDGE_API_SESSION_ERROR,
  isFrozenRoomApi,
} from "@/lib/kernel/security/edge-api-auth";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { FROZEN_DISK_ROOMS } from "@/lib/dronlar/kayit";
import {
  assertKurumsalAccountCloseable,
  KURUMSAL_ACCOUNT_CLOSE_ACTIVE_JOB_BLOCK,
} from "@/lib/sales/kurumsal-account-close-guard";
import {
  isKurumsalJobPastRetention,
  KURUMSAL_APPLICATION_RETENTION_DAYS,
  KURUMSAL_RETENTION_ANON_EMAIL,
  KURUMSAL_RETENTION_ANON_NAME,
  KURUMSAL_RETENTION_ANON_SUMMARY,
} from "@/lib/sales/kurumsal-retention";
import { buildKurumsalShortlistCsv } from "@/lib/sales/kurumsal-shortlist-csv";
import { ConflictError } from "@/lib/kernel/http/errors";

function src(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Kurumsal Faz 1 tedavisi (F1.1–F1.6)", () => {
  it("F1.1 — kurumsal donmuş odadan çıktı; satin-al kenarda next", () => {
    expect(FROZEN_DISK_ROOMS).not.toContain("kurumsal");
    expect(isFrozenRoomApi("/api/kurumsal/satin-al")).toBe(false);
    expect(
      decideEdgeApiAuth({
        pathname: "/api/kurumsal/satin-al",
        method: "POST",
        sessionHint: true,
        sessionUserId: "employer-1",
        map: ROUTE_AUTH_MAP,
      }),
    ).toEqual({ kind: "next" });
    expect(
      decideEdgeApiAuth({
        pathname: "/api/kurumsal/satin-al",
        method: "POST",
        sessionHint: false,
        map: ROUTE_AUTH_MAP,
      }),
    ).toEqual({ kind: "deny", status: 401, error: EDGE_API_SESSION_ERROR });
  });

  it("F1.2 — kokpit satin-al çağırır (rıza + Idempotency-Key)", () => {
    const cockpit = src("components/kurumsal/screening-cockpit.tsx");
    expect(cockpit).toContain("/api/kurumsal/satin-al");
    expect(cockpit).toContain("Idempotency-Key");
    expect(cockpit).toContain("CHECKOUT_LEGAL_CONSENT_PAYLOAD");
    expect(cockpit).toContain("PaytrCheckoutIframe");
  });

  it("F1.3 — /ilan dizini ve sitemap yalnız doğrulanmış ilanı yazar", () => {
    expect(src("app/(public)/ilan/page.tsx")).toContain("listPublicOpenKurumsalJobs");
    const sitemap = src("app/sitemap.ts");
    expect(sitemap).toContain("listSitemapKurumsalJobSlugs");
    expect(sitemap).toContain("verifiedEmployerAt");
    const load = src("lib/sales/kurumsal-screening-load.ts");
    expect(load).toContain("verifiedEmployerAt: { not: null }");
  });

  it("F1.4 — bilinmeyen slug notFound() ile 404", () => {
    const page = src("app/(public)/ilan/[slug]/page.tsx");
    expect(page).toContain("notFound()");
    expect(src("app/(public)/ilan/not-found.tsx")).toContain("İlan bulunamadı");
  });

  it("F1.5 — PATCH kapat/aç + CSV export (cvSummary yok)", () => {
    const cockpit = src("components/kurumsal/screening-cockpit.tsx");
    expect(cockpit).toContain("İlanı kapat");
    expect(cockpit).toContain("Yeniden aç");
    expect(cockpit).toContain("Kısa listeyi CSV indir");
    expect(cockpit).toContain("/export?format=csv");
    const csv = buildKurumsalShortlistCsv([
      {
        candidateName: "Ada",
        candidateEmail: "ada@yetkin.test",
        weightedScore: 91,
        band: "SHORTLISTED",
        certificateCode: "b".repeat(64),
        appliedAt: new Date("2026-11-02T12:00:00.000Z"),
      },
    ]);
    expect(csv).not.toMatch(/cvSummary|CV özeti|kişisel veri/i);
    expect(csv.startsWith("\uFEFF")).toBe(true);
  });

  it("F1.6 — açık ilan hesap kapanışını 409 yapar", () => {
    expect(() => assertKurumsalAccountCloseable({ activeJobs: 1 })).toThrow(ConflictError);
    try {
      assertKurumsalAccountCloseable({ activeJobs: 2 });
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictError);
      expect((error as ConflictError).message).toBe(KURUMSAL_ACCOUNT_CLOSE_ACTIVE_JOB_BLOCK);
      expect((error as ConflictError).status).toBe(409);
    }
    expect(() => assertKurumsalAccountCloseable({ activeJobs: 0 })).not.toThrow();
    expect(src("app/api/(kernel)/profile/close/route.ts")).toContain(
      "registerKurumsalAccountCloseGuard()",
    );
  });

  it("F1.6 — 90 günlük saklama eşiği ve anonim sabitler", () => {
    expect(KURUMSAL_APPLICATION_RETENTION_DAYS).toBe(90);
    expect(KURUMSAL_RETENTION_ANON_NAME).toBe("Anonim aday");
    expect(KURUMSAL_RETENTION_ANON_EMAIL).toBe("anonim@yetkin.local");
    expect(KURUMSAL_RETENTION_ANON_SUMMARY).toBe("");
    const now = new Date("2026-11-25T12:00:00.000Z");
    expect(
      isKurumsalJobPastRetention(
        {
          deadlineAt: new Date("2026-08-01T00:00:00.000Z"),
          isActive: false,
          createdAt: new Date("2026-07-01T00:00:00.000Z"),
        },
        now,
      ),
    ).toBe(true);
    expect(
      isKurumsalJobPastRetention(
        {
          deadlineAt: new Date("2026-11-20T00:00:00.000Z"),
          isActive: true,
          createdAt: new Date("2026-11-01T00:00:00.000Z"),
        },
        now,
      ),
    ).toBe(false);
    const inngest = src("lib/kernel/jobs/inngest.ts");
    expect(inngest).toContain("kurumsalApplicationRetention");
    expect(inngest).toContain("anonymizeExpiredKurumsalApplications");
  });
});
