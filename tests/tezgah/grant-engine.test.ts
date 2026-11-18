import { beforeEach, describe, expect, it } from "vitest";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";
import { GrantCatalogUnavailableError } from "@/lib/yetkinhibe/grant-catalog-core";
import type { GrantBriefCall } from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import { formatAmountMinorAsWholeTry } from "@/lib/yetkinhibe/format-amount";
import {
  GRANT_DOSSIER_DISCLAIMER,
  GRANT_DOSSIER_NO_ELIGIBLE,
  GRANT_DOSSIER_PROGRAM_MISSING,
  GRANT_PROJECT_DISCLAIMER,
} from "@/lib/yetkinhibe/grant-project-notes";
import type { GrantEligibilityCriteria } from "@/lib/yetkinhibe/types";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { GRANT_DETAILS_BUDGET_MISMATCH } from "@/lib/tezgah/grant/details";
import { generateGrantProject, GRANT_DOSSIER_MAX_OUTPUT_TOKENS, GRANT_MAX_OUTPUT_TOKENS, GRANT_MODEL_ROLE } from "@/lib/tezgah/grant/engine";
import { isGrantDossierPayload } from "@/lib/tezgah/grant/payload";
import { renderGrantProjectText } from "@/lib/tezgah/grant/render";
import { resetTezgahQuotaForTests } from "@/lib/tezgah/quota";

const NOW = new Date("2026-11-15T12:00:00+03:00");

const REQUEST = {
  businessName: "Karaoğlu Soğuk Zincir",
  freelancerName: "Ayşe Yılmaz",
  provinceCode: "34" as const,
  audience: "mevcut_kobi" as const,
  naceGroup: "10" as const,
  investmentFocus: "makine_techizat" as const,
  employeeCount: "10",
  companyAgeYears: "3",
  rdMaturityLevel: "EARLY" as const,
  exportActive: "hayir" as const,
  patent: "hayir" as const,
  project: "Soğuk zincir deposu kendi satış kanalına bağlanacak.",
};

const NARRATIVE = JSON.stringify({
  purpose: "Depo, ürünün bozulmadan kendi kanala ulaşmasını sağlar.",
  market: "Yakın çevredeki marketler soğuk ürün ister. Talep ölçümü bu taslakta yoktur.",
  risk: "Enerji kesintisi akışı durdurabilir. Yedek plan işletmenin kendi kaynağıyla yazılır.",
});

const OPEN_ELIGIBILITY: GrantEligibilityCriteria = {
  eligibleSectorCodes: null,
  minEmployeeCount: null,
  maxEmployeeCount: null,
  minCompanyAgeYears: null,
  maxCompanyAgeYears: null,
  requiresRdActivity: false,
  requiresExportActivity: false,
  requiresKobiStatus: false,
  requiresPatentOrUtilityModel: false,
};

function okText(text: string): LlmGatewayResult {
  return {
    text,
    model: "gemini-3.5-flash-lite",
    provider: "gemini",
    usage: { promptTokens: 12, completionTokens: 40, totalTokens: 52 },
  };
}

function makeCall(overrides: Partial<GrantBriefCall> = {}): GrantBriefCall {
  return {
    id: "cagri",
    title: "Test çağrısı",
    sourceLabel: "KOSGEB",
    officialInfoUrl: "https://www.kosgeb.gov.tr/",
    status: "CLOSED",
    remainingDays: 0,
    poolAmountMinor: 111_111_111_00,
    maxSupportMinor: 222_222_222_00,
    supportRatioBps: 4321,
    sourceVerifiedAt: null,
    eligibility: { ...OPEN_ELIGIBILITY },
    ...overrides,
  };
}

describe("hibe proje dosyası motoru", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("açık doğrulanmış çağrı yokken liste boş kalır, tutar sızmaz ve hak düşer", async () => {
    const seen: InvokeLlmInput[] = [];
    const closedPool = 111_111_111_00;
    const openPool = 222_222_222_00;
    const result = await generateGrantProject(
      { actorId: "guest:203.0.113.40", guest: true, request: REQUEST },
      {
        now: () => NOW,
        loadCatalog: async () => [
          makeCall({ id: "kapali", title: "Kapalı kayıt", poolAmountMinor: closedPool, supportRatioBps: 1111 }),
          makeCall({
            id: "acik-ham",
            title: "Doğrulanmamış açık",
            status: "ACTIVE",
            remainingDays: 12,
            poolAmountMinor: openPool,
            supportRatioBps: 2222,
          }),
        ],
        invoke: async (input) => {
          seen.push(input);
          return okText(NARRATIVE);
        },
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.disclaimer).toBe(GRANT_PROJECT_DISCLAIMER);
    expect(result.dossier).toBeNull();
    expect(result.eligible).toEqual([]);
    expect(result.closed.map((row) => row.grantId)).toEqual(["kapali"]);
    expect(result.unverified.map((row) => row.grantId)).toEqual(["acik-ham"]);
    expect(result.schedule.every((row) => row.draft && row.windowLabel === null)).toBe(true);
    expect(result.investments.every((row) => row.amountLabel === null)).toBe(true);
    expect(result.remaining).toBe(2);
    const dumped = JSON.stringify(result);
    expect(dumped).not.toContain(String(closedPool));
    expect(dumped).not.toContain(String(openPool));
    expect(dumped).not.toContain("1111");
    expect(dumped).not.toContain("2222");
    expect(dumped).not.toContain("poolAmountMinor");
    expect(dumped).not.toContain("supportRatioBps");
    expect(renderGrantProjectText(result)).not.toMatch(/₺|%/u);
    expect(seen[0]?.role).toBe(GRANT_MODEL_ROLE);
    expect(seen[0]?.maxOutputTokens).toBe(GRANT_MAX_OUTPUT_TOKENS);
    expect(seen[0]?.billing).toMatchObject({ source: "tezgah", recordUsage: true, userId: null });
    expect(seen[0]?.user).not.toContain(String(closedPool));
    expect(seen[0]?.user).not.toContain(String(openPool));
    expect(seen[0]?.system).not.toContain(String(closedPool));

    for (let extra = 0; extra < 2; extra += 1) {
      const mid = await generateGrantProject(
        { actorId: "guest:203.0.113.40", guest: true, request: REQUEST },
        {
          now: () => NOW,
          loadCatalog: async () => [makeCall()],
          invoke: async () => okText(NARRATIVE),
        },
      );
      expect(mid.ok).toBe(true);
    }
    const again = await generateGrantProject(
      { actorId: "guest:203.0.113.40", guest: true, request: REQUEST },
      {
        now: () => NOW,
        loadCatalog: async () => [makeCall()],
        invoke: async () => okText(NARRATIVE),
      },
    );
    expect(again).toMatchObject({ ok: false, status: 429, error: TEZGAH_GUEST_QUOTA_MESSAGE });
  });

  it("katalog okunamazsa veya model tutar yazarsa hakkı iade eder", async () => {
    let invoked = false;
    const failedCatalog = await generateGrantProject(
      { actorId: "guest:203.0.113.41", guest: true, request: REQUEST },
      {
        now: () => NOW,
        loadCatalog: async () => {
          throw new GrantCatalogUnavailableError("empty");
        },
        invoke: async () => {
          invoked = true;
          return okText(NARRATIVE);
        },
      },
    );
    expect(invoked).toBe(false);
    expect(failedCatalog).toMatchObject({ ok: false, status: 503, error: TEZGAH_FAIL_MESSAGE, remaining: 3 });

    const leaked = await generateGrantProject(
      { actorId: "guest:203.0.113.41", guest: true, request: REQUEST },
      {
        now: () => NOW,
        loadCatalog: async () => [makeCall({ id: "kapali", title: "Kapalı" })],
        invoke: async () =>
          okText(
            JSON.stringify({
              purpose: "Destek 15000 TL olarak yazıldı ve oran uyduruldu.",
              market: "Yakın çevredeki marketler soğuk ürün ister. Talep ölçümü bu taslakta yoktur.",
              risk: "Enerji kesintisi akışı durdurabilir. Yedek plan işletmenin kendi kaynağıyla yazılır.",
            }),
          ),
      },
    );
    expect(leaked).toMatchObject({ ok: false, status: 503, remaining: 3 });
  });

  it("bozuk takvim hak düşürmez; doğrulanmış çağrı katalog oranını basar", async () => {
    let loaded = false;
    const broken = await generateGrantProject(
      {
        actorId: "guest:203.0.113.42",
        guest: true,
        request: { ...REQUEST, scheduleWindows: "hazirlik 9-1" },
      },
      {
        now: () => NOW,
        loadCatalog: async () => {
          loaded = true;
          return [makeCall()];
        },
        invoke: async () => okText(NARRATIVE),
      },
    );
    expect(broken).toMatchObject({ ok: false, status: 400, remaining: 3 });
    expect(loaded).toBe(false);

    const verified = await generateGrantProject(
      { actorId: "guest:203.0.113.42", guest: true, request: REQUEST },
      {
        now: () => NOW,
        loadCatalog: async () => [
          makeCall({
            id: "acik",
            title: "Doğrulanmış açık",
            status: "ACTIVE",
            remainingDays: 20,
            sourceVerifiedAt: "2026-11-01T00:00:00.000Z",
            poolAmountMinor: 300_000,
            maxSupportMinor: 150_000,
            supportRatioBps: 5000,
          }),
        ],
        invoke: async () => okText(NARRATIVE),
      },
    );
    expect(verified.ok).toBe(true);
    if (!verified.ok) {
      return;
    }
    expect(verified.eligible).toHaveLength(1);
    expect(verified.eligible[0]?.ratioLabel).toBe("Katalog destek oranı %50");
    expect(verified.eligible[0]?.poolLabel).toContain("₺");
    const dumped = JSON.stringify(verified);
    expect(dumped).not.toContain("300000");
    expect(dumped).not.toContain("supportRatioBps");
    expect(renderGrantProjectText(verified)).toContain("Katalog destek oranı %50");
  });

  it("ilan edilmemiş havuzu sıfır lira diye basmaz", async () => {
    const result = await generateGrantProject(
      { actorId: "guest:203.0.113.43", guest: true, request: REQUEST },
      {
        now: () => NOW,
        loadCatalog: async () => [
          makeCall({
            id: "havuzsuz",
            title: "Havuzu ilan edilmemiş",
            status: "CLOSING_SOON",
            remainingDays: 11,
            sourceVerifiedAt: "2026-11-15T09:00:00.000Z",
            poolAmountMinor: null,
            maxSupportMinor: 262_500_000,
            supportRatioBps: 7500,
          }),
        ],
        invoke: async () => okText(NARRATIVE),
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.eligible[0]?.poolLabel).toBe("Havuz ilan edilmedi");
    expect(result.eligible[0]?.ceilingLabel).toContain("₺");
  });

  const DETAILS = {
    targetGrantId: "acik-derin",
    durationMonths: 18 as const,
    totalBudgetLira: "180000",
    personnelLira: "80000",
    equipmentLira: "70000",
    serviceLira: "30000",
    teamHeadcount: "6",
    teamExpertise: "Soğuk zincir 4\nSatış kanalı 2",
    outputGoal: "Depo kendi satış kanalına bağlanır ve bölgesel dağıtım başlar.",
  };

  const DOSSIER_NARRATIVE = JSON.stringify({
    purpose: "Depo, ürünün bozulmadan kendi kanala ulaşmasını sağlar.",
    market: "Yakın çevredeki marketler soğuk ürün ister. Talep ölçümü bu taslakta yoktur.",
    risk: "Enerji kesintisi akışı durdurabilir. Yedek plan işletmenin kendi kaynağıyla yazılır.",
    summary: "Seçilen programın geçen koşulları proje özetine bağlanır. Yeni koşul eklenmez.",
    budgetRationale: "Personel üretimi yürütür. Makine hattı kurulur. Yazılım kanalı bağlanır.",
    competencyNote: "Ekip işletmenin kendi uzmanlık cümlesine dayanır. Yeni unvan eklenmez.",
    commercialization: "Çıktı işletmenin yazdığı hedefe göre pazara taşınır. Rakam üretilmez.",
  });

  it("uyumsuz kalem toplamı hak düşürmez", async () => {
    let loaded = false;
    const broken = await generateGrantProject(
      {
        actorId: "guest:203.0.113.50",
        guest: true,
        request: {
          ...REQUEST,
          details: { ...DETAILS, totalBudgetLira: "1000" },
        },
      },
      {
        now: () => NOW,
        loadCatalog: async () => {
          loaded = true;
          return [makeCall()];
        },
        invoke: async () => okText(DOSSIER_NARRATIVE),
      },
    );
    expect(loaded).toBe(false);
    expect(broken).toMatchObject({ ok: false, status: 400, error: GRANT_DETAILS_BUDGET_MISMATCH, remaining: 3 });
  });

  it("uygun listede olmayan program hakkı iade eder ve model çağırmaz", async () => {
    let invoked = false;
    const missing = await generateGrantProject(
      {
        actorId: "guest:203.0.113.51",
        guest: true,
        request: { ...REQUEST, details: { ...DETAILS, targetGrantId: "yok-boyle" } },
      },
      {
        now: () => NOW,
        loadCatalog: async () => [
          makeCall({
            id: "acik-derin",
            title: "Doğrulanmış açık",
            status: "ACTIVE",
            remainingDays: 20,
            sourceVerifiedAt: "2026-11-01T00:00:00.000Z",
          }),
        ],
        invoke: async () => {
          invoked = true;
          return okText(DOSSIER_NARRATIVE);
        },
      },
    );
    expect(invoked).toBe(false);
    expect(missing).toMatchObject({ ok: false, status: 400, error: GRANT_DOSSIER_PROGRAM_MISSING, remaining: 3 });

    const empty = await generateGrantProject(
      {
        actorId: "guest:203.0.113.51",
        guest: true,
        request: { ...REQUEST, details: DETAILS },
      },
      {
        now: () => NOW,
        loadCatalog: async () => [makeCall({ id: "kapali", title: "Kapalı kayıt" })],
        invoke: async () => {
          invoked = true;
          return okText(DOSSIER_NARRATIVE);
        },
      },
    );
    expect(invoked).toBe(false);
    expect(empty).toMatchObject({ ok: false, status: 400, error: GRANT_DOSSIER_NO_ELIGIBLE, remaining: 3 });
  });

  it("seçilen programa göre tam dosyayı girilen tutar ve süreyle basar", async () => {
    const seen: InvokeLlmInput[] = [];
    const ceilingMinor = 888_800;
    const result = await generateGrantProject(
      { actorId: "guest:203.0.113.52", guest: true, request: { ...REQUEST, details: DETAILS } },
      {
        now: () => NOW,
        loadCatalog: async () => [
          makeCall({
            id: "acik-derin",
            title: "Doğrulanmış açık",
            status: "ACTIVE",
            remainingDays: 20,
            sourceVerifiedAt: "2026-11-01T00:00:00.000Z",
            poolAmountMinor: 999_900,
            maxSupportMinor: ceilingMinor,
            supportRatioBps: 5000,
          }),
        ],
        invoke: async (input) => {
          seen.push(input);
          return okText(DOSSIER_NARRATIVE);
        },
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok || !result.dossier) {
      return;
    }
    const totalLabel = formatAmountMinorAsWholeTry(18_000_000);
    expect(result.dossier.disclaimer).toBe(GRANT_DOSSIER_DISCLAIMER);
    expect(result.dossier.durationMonths).toBe(18);
    expect(result.dossier.workPackages.map((row) => row.windowLabel)).toEqual(["1-3", "4-12", "13-16", "17-18"]);
    expect(result.dossier.budgetTotalLabel).toBe(totalLabel);
    expect(result.dossier.budgetRows.map((row) => row.label)).toEqual([
      "Personel",
      "Makine-Teçhizat",
      "Yazılım/Hizmet Alımı",
    ]);
    expect(result.dossier.teamHeadcount).toBe(6);
    expect(result.dossier.summary).toContain("geçen koşullar");
    expect("grantId" in result.dossier).toBe(false);
    expect(isGrantDossierPayload(result.dossier)).toBe(true);
    expect(isGrantDossierPayload({ ...result.dossier, callCode: "2026/9" })).toBe(false);
    const rendered = renderGrantProjectText(result);
    expect(rendered).toContain("Tam Proje Başvuru Dosyası");
    expect(rendered).toContain("İş Paketleri Takvimi");
    expect(rendered).toContain("Bütçe Gerekçelendirme Tablosu");
    expect(rendered).toContain("Ekip Yetkinlik Matrisi");
    expect(rendered).toContain("Ticarileşme Planı");
    expect(rendered).toContain(totalLabel);
    expect(rendered).not.toContain("acik-derin");
    expect(rendered).not.toContain(String(ceilingMinor));
    expect(seen[0]?.maxOutputTokens).toBe(GRANT_DOSSIER_MAX_OUTPUT_TOKENS);
    expect(seen[0]?.system).toContain("çağrı kodu");
    expect(seen[0]?.user).not.toContain("180000");
    expect(seen[0]?.user).not.toContain("80000");
    expect(seen[0]?.user).toContain("Soğuk zincir");
    expect(seen[0]?.user).not.toContain(String(ceilingMinor));
  });

  it("tam dosyada uydurma onay veya tutar hakkı iade eder", async () => {
    const leaked = await generateGrantProject(
      { actorId: "guest:203.0.113.53", guest: true, request: { ...REQUEST, details: DETAILS } },
      {
        now: () => NOW,
        loadCatalog: async () => [
          makeCall({
            id: "acik-derin",
            title: "Doğrulanmış açık",
            status: "ACTIVE",
            remainingDays: 12,
            sourceVerifiedAt: "2026-11-01T00:00:00.000Z",
          }),
        ],
        invoke: async () =>
          okText(
            JSON.stringify({
              purpose: "Depo, ürünün bozulmadan kendi kanala ulaşmasını sağlar.",
              market: "Yakın çevredeki marketler soğuk ürün ister. Talep ölçümü bu taslakta yoktur.",
              risk: "Enerji kesintisi akışı durdurabilir. Yedek plan işletmenin kendi kaynağıyla yazılır.",
              summary: "Bu proje onaylanır ve çağrı kodu 2026/3 ile kesin destek alır.",
              budgetRationale: "Personel üretimi yürütür. Makine hattı kurulur. Yazılım kanalı bağlanır.",
              competencyNote: "Ekip işletmenin kendi uzmanlık cümlesine dayanır. Yeni unvan eklenmez.",
              commercialization: "Çıktı işletmenin yazdığı hedefe göre pazara taşınır. Rakam üretilmez.",
            }),
          ),
      },
    );
    expect(leaked).toMatchObject({ ok: false, status: 503, error: TEZGAH_FAIL_MESSAGE, remaining: 3 });
  });
});
