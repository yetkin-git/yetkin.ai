import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Faz 3 okuma hop'ları — **rota seviyesinde** doğrulama.
 *
 * Bu test gerçek handler'ı çağırır (`GET`), oturumu ve veri katmanını sahte ile
 * değiştirir. Amaç iki şeyi kanıtlamak:
 * 1. Oturum varsa gövde v1 zarfına ve hop Zod şemasına **uyar** (jsonOk kapısı geçer).
 * 2. Dürüstlük kuralları korunur: profil yoksa boş tahta, fiyat yoksa `null`.
 *
 * `jsonOk` hop şemasına uymayan gövdeyi 500'e çevirir; yani bu testler geçerse
 * sözleşme ile gövde birebir örtüşüyor demektir.
 *
 * Tam turda Junior katalog importu 5 sn tavanını aşıyordu. Tavan 120 sn;
 * iddia değişmedi, yalnız yük altındaki süre payı genişledi.
 */

const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";

const harness = vi.hoisted(() => ({
  session: {
    id: "905afe38-6b66-42be-acde-461d6e6e68e3",
    email: "yapinet360@gmail.com",
    emailConfirmedAt: "2026-09-26T08:15:30.863Z",
  } as Record<string, unknown> | null,
  home: null as unknown,
  courses: [] as unknown[],
  learnerBoard: { ownedSlugs: [] as string[], statusBySlug: {} as Record<string, string> },
  listProgress: vi.fn(async () => [] as unknown[]),
  getXp: vi.fn(async () => null as unknown),
  listProfiles: vi.fn(async () => [] as unknown[]),
}));

vi.mock("@/lib/kernel/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/kernel/auth/session")>(
    "@/lib/kernel/auth/session",
  );
  return {
    ...actual,
    requireSession: async () => {
      if (!harness.session) {
        throw new actual.AuthRequiredError();
      }
      return harness.session;
    },
    getSession: async () => harness.session,
  };
});

vi.mock("@/lib/junior/load", () => ({
  createPrismaJuniorStore: () => ({
    listProfiles: harness.listProfiles,
    listProgress: harness.listProgress,
    getXp: harness.getXp,
    getSubscription: async () => null,
  }),
}));

vi.mock("@/lib/academy/load-catalog", () => ({
  loadAcademyVitrineCourses: async () => harness.courses,
  loadAcademyCatalogLearnerBoard: async () => harness.learnerBoard,
  publishedLessonCount: (slug: string) =>
    slug === "01_office_ai" ? 8 : slug === "02_ecommerce_ai" ? 6 : 0,
}));

function request(path: string): Request {
  return new Request(new URL(path, "http://localhost:3000"), {
    headers: { "x-rail-api-version": "1", "x-request-id": REQUEST_ID },
  });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}
void ctx;

describe("GET /api/junior/shelves", { timeout: 120_000 }, () => {
  beforeEach(() => {
    harness.session = {
      id: "905afe38-6b66-42be-acde-461d6e6e68e3",
      email: "yapinet360@gmail.com",
      emailConfirmedAt: "2026-09-26T08:15:30.863Z",
    };
    harness.home = {
      profiles: [
        {
          id: "profile-1",
          nickname: "Deniz",
          grade: 6,
          birthYear: 2014,
          selected: true,
          selectedElectives: [],
          gradeSwitchRights: 1,
        },
      ],
      selected: { id: "profile-1" },
      xp: { points: 42, badges: ["ilk-anlatis"] },
      plan: { status: "NONE", electiveQuota: 3, expiresAt: null, gradeSwitchRights: 0 },
      courses: [
        {
          slug: "jr_06_mat",
          title: "Matematik",
          subject: "Matematik",
          grade: 6,
          track: "core",
          labels: [],
          lessons: [
            {
              key: "jr_06_mat-1",
              title: "Çarpanlar",
              teaser: "Teaser",
              access: "free",
              thisWeek: true,
              status: "fresh",
            },
          ],
        },
      ],
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("oturumlu çağrı v1 zarfına ve hop şemasına uyar", async () => {
    vi.doMock("@/lib/junior/service", () => ({
      readJuniorHome: async () => harness.home,
    }));
    const { GET } = await import("@/app/api/junior/shelves/route");
    const response = await GET(request("/api/v1/junior/shelves"));
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      apiVersion: string;
      data: Record<string, unknown>;
    };
    expect(body.ok).toBe(true);
    expect(body.apiVersion).toBe("1");
    expect(body.data.sealedLessonCount).toBe(1);
    // İstemci sözleşme bloğu basılır: şema sürümü + native TTL.
    const schema = body.data.clientSchema as {
      timelineSchemaVersion: string;
      mediaTtlSec: number;
      mediaRefreshAfterSec: number;
    };
    expect(schema.timelineSchemaVersion).toBe("2.0.0");
    expect(schema.mediaTtlSec).toBe(900);
    expect(schema.mediaRefreshAfterSec).toBeLessThan(schema.mediaTtlSec);
    // Medya adresi bu hop'ta ÜRETİLMEZ; yalnız TTL duyurulur.
    expect(JSON.stringify(body.data)).not.toContain("X-Amz-Signature");
    vi.doUnmock("@/lib/junior/service");
  });

  it("oturum yoksa 401 döner", async () => {
    harness.session = null;
    vi.doMock("@/lib/junior/service", () => ({
      readJuniorHome: async () => harness.home,
    }));
    const { GET } = await import("@/app/api/junior/shelves/route");
    const response = await GET(request("/api/v1/junior/shelves"));
    expect(response.status).toBe(401);
    vi.doUnmock("@/lib/junior/service");
  });
});

describe("GET /api/junior/progress", { timeout: 120_000 }, () => {
  beforeEach(() => {
    harness.session = {
      id: "905afe38-6b66-42be-acde-461d6e6e68e3",
      email: "yapinet360@gmail.com",
      emailConfirmedAt: "2026-09-26T08:15:30.863Z",
    };
    harness.listProfiles.mockResolvedValue([]);
    harness.listProgress.mockResolvedValue([]);
    harness.getXp.mockResolvedValue(null);
  });

  it("profil yoksa dürüst boş tahta basar; uydurma ilerleme yok", async () => {
    const { GET } = await import("@/app/api/junior/progress/route");
    const response = await GET(request("/api/v1/junior/progress"));
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      data: Record<string, unknown>;
    };
    expect(body.ok).toBe(true);
    expect(body.data.profileId).toBeNull();
    expect(body.data.lessons).toEqual([]);
    expect(body.data.weeklyReport).toBeNull();
    expect(body.data.totals).toEqual({ started: 0, done: 0, going: 0 });
  });

  it("oturum yoksa 401 döner", async () => {
    harness.session = null;
    const { GET } = await import("@/app/api/junior/progress/route");
    const response = await GET(request("/api/v1/junior/progress"));
    expect(response.status).toBe(401);
  });
});

describe("GET /api/academy/catalog", { timeout: 120_000 }, () => {
  beforeEach(() => {
    harness.session = {
      id: "905afe38-6b66-42be-acde-461d6e6e68e3",
      email: "yapinet360@gmail.com",
      emailConfirmedAt: "2026-09-26T08:15:30.863Z",
    };
    harness.learnerBoard = { ownedSlugs: [], statusBySlug: {} };
    const now = new Date("2026-10-26T12:00:00.000Z");
    harness.courses = [
      {
        id: "ac_01_office_ai",
        slug: "01_office_ai",
        title: "Ofiste Yapay Zekâ",
        summary: "Özet",
        catalogUnitKey: "course:01_office_ai",
        globalRank: 1,
        localRank: 1,
        trendScore: 0,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
        priceMinor: 89_000,
        currencyCode: "TRY",
        purchasable: true,
      },
      {
        id: "ac_02_ecommerce_ai",
        slug: "02_ecommerce_ai",
        title: "E-Ticaret",
        summary: "Özet",
        catalogUnitKey: "course:02_ecommerce_ai",
        globalRank: 2,
        localRank: 2,
        trendScore: 0,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
        priceMinor: null,
        currencyCode: "TRY",
        purchasable: false,
      },
    ];
  });

  it("kahraman kartı işaretler; fiyatsız kart null basar", async () => {
    const { GET } = await import("@/app/api/academy/catalog/route");
    const response = await GET(request("/api/v1/academy/catalog"));
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      data: {
        heroSlug: string | null;
        courses: Array<{
          slug: string;
          shelf: string;
          priceMinor: number | null;
          currencyCode: string | null;
          lessonCount: number;
          outcomeLead: string | null;
        }>;
        examPassScore: number;
      };
    };
    expect(body.ok).toBe(true);
    expect(body.data.heroSlug).toBe("01_office_ai");
    expect(body.data.examPassScore).toBe(70);
    const hero = body.data.courses.find((row) => row.slug === "01_office_ai");
    expect(hero?.shelf).toBe("hero");
    expect(hero?.priceMinor).toBe(89_000);
    expect(hero?.currencyCode).toBe("TRY");
    expect(hero?.lessonCount).toBe(8);
    // Değer önerisi düğme metnine bağlanır.
    expect(hero?.outcomeLead).toBeTruthy();

    const advanced = body.data.courses.find((row) => row.slug === "02_ecommerce_ai");
    expect(advanced?.shelf).toBe("advanced");
    // Fiyat yoksa tutar ve para birimi birlikte null (yarım çift yok).
    expect(advanced?.priceMinor).toBeNull();
    expect(advanced?.currencyCode).toBeNull();
    // Ders gövdesi katalog hop'unda taşınmaz.
    expect(JSON.stringify(body.data)).not.toContain("lessonBody");
  });

  it("oturum yoksa 401 döner", async () => {
    harness.session = null;
    const { GET } = await import("@/app/api/academy/catalog/route");
    const response = await GET(request("/api/v1/academy/catalog"));
    expect(response.status).toBe(401);
  });
});
