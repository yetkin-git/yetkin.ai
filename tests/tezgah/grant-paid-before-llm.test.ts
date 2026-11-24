import { beforeEach, describe, expect, it, vi } from "vitest";
import { generatePaidGrantDossier } from "@/lib/tezgah/grant/paid-dossier";
import { generateGrantProject } from "@/lib/tezgah/grant/engine";
import type { GrantGenerateRequest } from "@/lib/tezgah/grant/schema";

const mocks = vi.hoisted(() => ({
  reservationFind: vi.fn(),
  reservationCreate: vi.fn(),
  walletFind: vi.fn(),
  catalogAmount: vi.fn(),
}));

vi.mock("@/lib/kernel/db", () => ({
  getPrisma: () => ({
    paidCommandReservation: {
      findUnique: mocks.reservationFind,
      create: mocks.reservationCreate,
    },
    wallet: { findUnique: mocks.walletFind },
  }),
}));

vi.mock("@/lib/tezgah/paid-lane", async () => {
  const actual = await vi.importActual<typeof import("@/lib/tezgah/paid-lane")>("@/lib/tezgah/paid-lane");
  return {
    ...actual,
    readTezgahCatalogAmount: (...args: unknown[]) => mocks.catalogAmount(...args),
  };
});

vi.mock("@/lib/tezgah/grant/engine", () => ({
  generateGrantProject: vi.fn(),
}));

const REQUEST: GrantGenerateRequest = {
  businessName: "Kahve Dükkanı",
  freelancerName: "Ayşe Kaya",
  provinceCode: "34",
  audience: "mevcut_kobi",
  naceGroup: "47",
  investmentFocus: "makine_techizat",
  employeeCount: "4",
  companyAgeYears: "2",
  rdMaturityLevel: "NONE",
  exportActive: "hayir",
  patent: "hayir",
  project: "Mahallede kafe açılacak.",
  details: {
    targetGrantId: "perakende-2027",
    durationMonths: 12,
    totalBudgetLira: "3000",
    personnelLira: "1000",
    equipmentLira: "1000",
    serviceLira: "1000",
    teamHeadcount: "2",
    teamExpertise: "Servis ve ürün hazırlığı",
    outputGoal: "Günlük servis düzeni kurulur.",
  },
};

describe("YetkinHibe tam dosya bakiye kapısı", () => {
  beforeEach(() => {
    mocks.reservationFind.mockReset();
    mocks.reservationCreate.mockReset();
    mocks.walletFind.mockReset();
    mocks.catalogAmount.mockReset();
    vi.mocked(generateGrantProject).mockReset();
    mocks.catalogAmount.mockResolvedValue(149_000);
    mocks.reservationFind.mockResolvedValue(null);
  });

  it("bakiye yetmezse 402 döner ve LLM çağrılmaz", async () => {
    mocks.walletFind.mockResolvedValue({ amountMinor: 100 });
    const result = await generatePaidGrantDossier({
      userId: "user-1",
      commandKey: "cmd-1",
      request: REQUEST,
    });
    expect(result).toMatchObject({ ok: false, status: 402 });
    expect(generateGrantProject).not.toHaveBeenCalled();
    expect(mocks.reservationCreate).not.toHaveBeenCalled();
  });
});
