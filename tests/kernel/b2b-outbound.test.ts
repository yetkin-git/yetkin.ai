import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertB2bOutboundBody,
  B2B_COMMERCIAL_FOOTER,
  B2B_GRANT_URL,
  B2B_OUTBOUND_DAILY_LIMIT,
  B2B_TETKIK_URL,
  b2bSendGate,
  composeB2bReplyDraft,
  composeGrantOffer,
  composeTetkikOffer,
  isCorporateMailbox,
  parseB2bLeadBatch,
  validateB2bLead,
} from "@/lib/kernel/admin/b2b-outbound";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { RLS_FORCE_TABLES } from "@/lib/kernel/security/rls-policy-registry";
import { WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";
import { topOpenTetkikGaps } from "@/lib/tezgah/tetkik/score";
import type { TetkikCheck } from "@/lib/tezgah/tetkik/types";
import { assessB2bGrant, type B2bGrantCall } from "@/lib/yetkinhibe/b2b-sector-match";

const CALL_1507: B2bGrantCall = {
  id: "tubitak-1507-2026-2",
  title: "TÜBİTAK 1507 KOBİ Ar-Ge Başlangıç Destek Programı 2026/2",
  sourceLabel: "TÜBİTAK",
  officialInfoUrl: "https://tubitak.gov.tr/tr/destekler/sanayi/1507",
  status: "CLOSING_SOON",
  remainingDays: 10,
  poolAmountMinor: null,
  maxSupportMinor: 262_500_000,
  supportRatioBps: 7500,
  sourceVerifiedAt: "2026-11-15T09:00:00.000Z",
  applicationDeadline: "2026-11-25T20:59:00.000Z",
  eligibility: {
    eligibleSectorCodes: null,
    minEmployeeCount: null,
    maxEmployeeCount: null,
    minCompanyAgeYears: null,
    maxCompanyAgeYears: null,
    requiresRdActivity: true,
    requiresExportActivity: false,
    requiresKobiStatus: false,
    requiresPatentOrUtilityModel: false,
    eligibleRegionCodes: null,
    audiences: ["yeni_girisimci", "mevcut_kobi"],
    investmentFocus: ["arge"],
    nacePrefixes: null,
  },
};

function gap(id: TetkikCheck["id"], weight: number, earned: number): TetkikCheck {
  return {
    id,
    label: id,
    earned,
    weight,
    passed: earned === weight,
    detail: "",
    opportunity: earned === weight ? "" : `${id} eksik`,
  };
}

describe("B2B fırsat motoru", () => {
  it("anahtar kapalıyken ve 15 dolunca gönderimi kilitler", () => {
    expect(b2bSendGate({ enabled: false, sentToday: 0 })).toEqual({ ok: false, reason: "disabled" });
    expect(b2bSendGate({ enabled: true, sentToday: 14 })).toEqual({ ok: true });
    expect(b2bSendGate({ enabled: true, sentToday: B2B_OUTBOUND_DAILY_LIMIT })).toEqual({
      ok: false,
      reason: "limit",
    });
  });

  it("kurumsal adresi alır, serbest posta kutusunu reddeder", () => {
    expect(isCorporateMailbox("info@ornek.com.tr")).toBe(true);
    expect(isCorporateMailbox("satis@gmail.com")).toBe(false);
    expect(isCorporateMailbox("not-an-email")).toBe(false);
  });

  it("toplu satırı altı alana böler", () => {
    const parsed = parseB2bLeadBatch(
      "Kara Fırın | info@karafirin.com | https://karafirin.com | gıda | İstanbul | WEB_TETKIK\n# not\n",
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.items[0]).toMatchObject({
      companyName: "Kara Fırın",
      email: "info@karafirin.com",
      channel: "WEB_TETKIK",
      websiteUrl: "https://karafirin.com",
    });
    expect(validateB2bLead({ ...parsed.items[0], email: "a@hotmail.com" }).ok).toBe(false);
  });

  it("tetkik taslağı ölçülen skoru, iki eksiği ve RET satırını taşır", () => {
    const draft = composeTetkikOffer({
      companyName: "Kara Fırın",
      url: "https://karafirin.com",
      score: 42,
      gaps: [
        { label: "Başlık", detail: "Başlık kısa." },
        { label: "Çağrı", detail: "Çağrı yok." },
      ],
      disclaimer: "Ölçüm ana sayfanın ilk HTML’idir.",
    });
    expect(draft.body).toContain("42/100");
    expect(draft.body).toContain("Başlık");
    expect(draft.body).toContain("Çağrı");
    expect(draft.body).toContain(B2B_TETKIK_URL);
    expect(draft.body).toContain(B2B_COMMERCIAL_FOOTER);
    expect(draft.body).not.toMatch(/onayland/i);
    expect(assertB2bOutboundBody("WEB_TETKIK", draft.body).ok).toBe(true);
  });

  it("en kritik iki açık tetkik maddesini kaçan puana göre seçer", () => {
    const picked = topOpenTetkikGaps(
      [gap("title", 8, 8), gap("cta", 10, 0), gap("viewport", 10, 4), gap("h1", 8, 0)],
      2,
    );
    expect(picked.map((item) => item.id)).toEqual(["cta", "h1"]);
  });

  it("1507 eşlemesi 25 Kasım 2026 atfını taşır ve uygunluk kararı kurmaz", () => {
    const reading = assessB2bGrant({
      sector: "yazılım",
      city: "İstanbul",
      calls: [CALL_1507],
    });
    expect(reading.axesResolved).toBe(true);
    expect(reading.deadlineLabel).toBe("25 Kasım 2026");
    expect(reading.listedEligible).toBe(true);
    expect(reading.windowOpen).toBe(true);
    const draft = composeGrantOffer({
      companyName: "Ada Yazılım",
      sector: "yazılım",
      city: "İstanbul",
      grantTitle: reading.grantTitle,
      deadlineLabel: reading.deadlineLabel,
      windowOpen: reading.windowOpen,
      listedEligible: reading.listedEligible,
      axesResolved: reading.axesResolved,
      note: reading.note,
    });
    expect(draft.body).toContain("Ada Yazılım");
    expect(draft.body).toContain("25 Kasım 2026");
    expect(draft.body).toContain(B2B_GRANT_URL);
    expect(draft.body).toContain("uygun olduğu anlamına gelmez");
    expect(draft.body).toContain(B2B_COMMERCIAL_FOOTER);
    expect(draft.body).not.toMatch(/kesin hibe/i);
    expect(assertB2bOutboundBody("TUBITAK_HIBE", draft.body).ok).toBe(true);
  });

  it("katalogsatırı olmayan il için eşleştiriciyi çalıştırmaz", () => {
    const reading = assessB2bGrant({
      sector: "yazılım",
      city: "Atlantis",
      calls: [CALL_1507],
    });
    expect(reading.axesResolved).toBe(false);
    expect(reading.listedEligible).toBe(false);
    expect(reading.deadlineLabel).toBe("25 Kasım 2026");
    const draft = composeGrantOffer({
      companyName: "Ada Yazılım",
      sector: "yazılım",
      city: "Atlantis",
      grantTitle: reading.grantTitle,
      deadlineLabel: reading.deadlineLabel,
      windowOpen: reading.windowOpen,
      listedEligible: false,
      axesResolved: false,
      note: reading.note,
    });
    expect(draft.body).toContain("eşleştirici çalışmadı");
  });

  it("yanıt taslağı gelen cümleyi taşır ve onay vaadi kurmaz", () => {
    const draft = composeB2bReplyDraft({
      companyName: "Ada Yazılım",
      channel: "TUBITAK_HIBE",
      inbound: "Fiyatı ne kadar, hibe kesin mi?",
    });
    expect(draft).toContain("Fiyatı ne kadar");
    expect(draft).toContain("bu taslakta yoktur");
    expect(draft).toContain(B2B_GRANT_URL);
    expect(draft).not.toMatch(/onayland/i);
  });

  it("RET satırı silinmiş metin gönderime kapanır", () => {
    const blocked = assertB2bOutboundBody("WEB_TETKIK", `Skor 10. ${B2B_TETKIK_URL}`);
    expect(blocked.ok).toBe(false);
  });

  it("şema FORCE RLS ve admin uçları mühürlüdür", () => {
    const sql = readFileSync(
      join(process.cwd(), "prisma/migrations/20261115213000_b2b_outbound_engine/migration.sql"),
      "utf8",
    );
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).toContain("USING (false)");
    expect(sql).toContain("'B2B_OUTBOUND_ENABLED'");
    expect(sql).toContain("false, 15");
    expect(sql).not.toMatch(/FOR INSERT/);
    expect(sql).not.toMatch(/FOR UPDATE/);
    expect(sql).not.toMatch(/FOR DELETE/);
    for (const table of [
      "b2b_lead_campaign_items",
      "b2b_outbound_daily_counters",
      "b2b_outbound_settings",
    ]) {
      expect(RLS_FORCE_TABLES).toContain(table);
    }
    expect(ROUTE_AUTH_MAP["/api/admin/b2b"]).toBe("admin");
    expect(ROUTE_AUTH_MAP["/api/admin/b2b/send"]).toBe("admin");
    expect(ROUTE_AUTH_MAP["/api/admin/b2b/reply"]).toBe("admin");
    for (const path of ["/api/admin/b2b", "/api/admin/b2b/send", "/api/admin/b2b/reply"]) {
      expect(WEB_ONLY_WRITE_ROUTES.some((row) => row.path === path && row.status === "admin")).toBe(true);
    }
  });
});
