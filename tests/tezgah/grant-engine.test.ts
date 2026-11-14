import { beforeEach, describe, expect, it } from "vitest";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";
import { GrantCatalogUnavailableError } from "@/lib/yetkinhibe/grant-catalog-core";
import type { GrantBriefCall } from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import { GRANT_PROJECT_DISCLAIMER } from "@/lib/yetkinhibe/grant-project-notes";
import type { GrantEligibilityCriteria } from "@/lib/yetkinhibe/types";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { generateGrantProject, GRANT_MAX_OUTPUT_TOKENS, GRANT_MODEL_ROLE } from "@/lib/tezgah/grant/engine";
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
    expect(result.eligible).toEqual([]);
    expect(result.closed.map((row) => row.grantId)).toEqual(["kapali"]);
    expect(result.unverified.map((row) => row.grantId)).toEqual(["acik-ham"]);
    expect(result.schedule.every((row) => row.draft && row.windowLabel === null)).toBe(true);
    expect(result.investments.every((row) => row.amountLabel === null)).toBe(true);
    expect(result.remaining).toBe(0);
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
    expect(seen[0]?.billing).toMatchObject({ source: "tezgah", recordUsage: false, userId: null });
    expect(seen[0]?.user).not.toContain(String(closedPool));
    expect(seen[0]?.user).not.toContain(String(openPool));
    expect(seen[0]?.system).not.toContain(String(closedPool));

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
    expect(failedCatalog).toMatchObject({ ok: false, status: 503, error: TEZGAH_FAIL_MESSAGE, remaining: 1 });

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
    expect(leaked).toMatchObject({ ok: false, status: 503, remaining: 1 });
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
    expect(broken).toMatchObject({ ok: false, status: 400, remaining: 1 });
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
});
