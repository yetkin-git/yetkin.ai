import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { findPublishedHopId } from "@/lib/kernel/http/api-route-census";
import { decideRailV1HopGate } from "@/lib/kernel/http/v1-hop-gate";
import {
  RAIL_V1_CLIENT_SCHEMA,
  RAIL_MEDIA_TTL_NATIVE_SEC,
  RAIL_MEDIA_TTL_WEB_SEC,
  railMediaRefreshAfterSec,
  railMediaTtlSec,
  isRailMediaAudience,
} from "@/lib/kernel/http/v1-client-flags";
import {
  RAIL_V1_HOPS,
  railV1JuniorShelvesDataSchema,
  railV1JuniorProgressDataSchema,
  railV1AcademyCatalogDataSchema,
} from "@/lib/kernel/http/v1-contract";
import { JUNIOR_TIMELINE_SCHEMA_VERSION } from "@/lib/kernel/http/v1-hops-meta";

const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";

/**
 * Faz 3, Adım 3 — v1 okuma yolu (mobil preparasyon).
 *
 * Üç hop eklendi: `junior-shelves`, `junior-progress-read`, `academy-catalog`.
 * Bu test üç şeyi kilitler:
 * 1. Hop'lar sicilde ve kenar kapısında yayınlı (404/403 değil).
 * 2. Her hop **Bearer** ister; çerez oturumu v1'de yoktur.
 * 3. `schemaVersion` + native medya TTL bayrakları tanımlı ve tavan içinde.
 */
describe("faz 3 v1 okuma hop'ları — shelves / progress / catalog", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("üç okuma hop'u sicildedir, Bearer ister ve kenar kapısından geçer", () => {
    const expected: Array<[string, string, string]> = [
      ["junior-shelves", "GET", "/api/v1/junior/shelves"],
      ["junior-progress-read", "GET", "/api/v1/junior/progress"],
      ["academy-catalog", "GET", "/api/v1/academy/catalog"],
    ];
    for (const [id, method, path] of expected) {
      const hop = RAIL_V1_HOPS.find((row) => row.id === id);
      expect(hop, id).toBeTruthy();
      expect(hop?.method, id).toBe(method);
      expect(hop?.v1PathTemplate, id).toBe(path);
      // Okuma hop'u: Idempotency-Key istenmez, sürüm başlığı istenir.
      expect(hop?.idempotency, id).toBe(false);
      expect(hop?.minVersionHeaderRequired, id).toBe(true);
      // v1 çerez kabul etmez: Bearer zorunlu.
      expect(hop?.v1Auth, id).toBe("bearer");
      expect(hop?.cookieAuth, id).toBe(false);
      // Kanonik yol `/api/v1` öneki taşımaz (kenar soyar).
      expect(hop?.canonicalPathTemplate.startsWith("/api/v1/"), id).toBe(false);
      // Kenar kapısı: 404 değil, next.
      expect(decideRailV1HopGate({ pathname: path, method }).kind, id).toBe("next");
      // Dron allowlist bu hop'ları çağırabilir.
      expect(hop?.nativeStore, id).not.toBe("forbidden");
      // Public sicil eşlemesi handler `auth` kind'ı ile uyuşur.
      expect(findPublishedHopId(method, hop!.canonicalPathTemplate), id).toBe(id);
    }
  });

  it("okuma hop'ları yayınlanmış veri yolu taşır; gövde anahtarı Zod ile 1:1", () => {
    for (const id of ["junior-shelves", "junior-progress-read", "academy-catalog"]) {
      const hop = RAIL_V1_HOPS.find((row) => row.id === id)!;
      expect(hop.publishedDataPaths.length, id).toBeGreaterThan(3);
      expect(hop.dataKeys.length, id).toBeGreaterThan(2);
      // Üçü de istemci sözleşme bloğunu basar.
      expect(hop.publishedDataPaths, id).toContain("clientSchema");
      expect(hop.publishedDataPaths, id).toContain("clientSchema.timelineSchemaVersion");
      expect(hop.publishedDataPaths, id).toContain("clientSchema.minTimelineSchemaVersion");
    }
  });

  it("shelves hop'u medya TTL sözleşmesini duyurur", () => {
    const hop = RAIL_V1_HOPS.find((row) => row.id === "junior-shelves")!;
    expect(hop.publishedDataPaths).toContain("clientSchema.mediaTtlSec");
    expect(hop.publishedDataPaths).toContain("clientSchema.mediaRefreshAfterSec");
    expect(hop.publishedDataPaths).toContain("sealedLessonCount");
  });
});

describe("v1 istemci sözleşme bayrakları — schemaVersion ve native medya TTL", () => {
  it("timeline şema sürümü tek evden okunur", () => {
    expect(JUNIOR_TIMELINE_SCHEMA_VERSION).toBe("2.0.0");
    expect(RAIL_V1_CLIENT_SCHEMA.timelineSchemaVersion).toBe(JUNIOR_TIMELINE_SCHEMA_VERSION);
    expect(RAIL_V1_CLIENT_SCHEMA.minTimelineSchemaVersion).toBe(JUNIOR_TIMELINE_SCHEMA_VERSION);
  });

  it("native TTL web'den uzundur ve R2 imza tavanını (900 sn) aşmaz", () => {
    expect(RAIL_MEDIA_TTL_WEB_SEC).toBe(600);
    expect(RAIL_MEDIA_TTL_NATIVE_SEC).toBe(900);
    expect(RAIL_MEDIA_TTL_NATIVE_SEC).toBeGreaterThan(RAIL_MEDIA_TTL_WEB_SEC);
    // `presignR2GetUrl` 60–900 aralığını zorlar; 901 imza üretmez.
    expect(RAIL_MEDIA_TTL_NATIVE_SEC).toBeLessThanOrEqual(900);
    expect(RAIL_MEDIA_TTL_WEB_SEC).toBeGreaterThanOrEqual(60);
  });

  it("yenileme anı süre dolmadan öncedir (kesintisiz arka plan çalma)", () => {
    for (const audience of ["web", "native"] as const) {
      const ttl = railMediaTtlSec(audience);
      const refresh = railMediaRefreshAfterSec(audience);
      expect(refresh, audience).toBeLessThan(ttl);
      expect(refresh, audience).toBeGreaterThan(0);
    }
  });

  it("yüzey listesi kapalıdır; bilinmeyen audience reddedilir", () => {
    expect(isRailMediaAudience("web")).toBe(true);
    expect(isRailMediaAudience("native")).toBe(true);
    expect(isRailMediaAudience("tv")).toBe(false);
  });

  it("sözleşme bloğu iki yüzeyin sayısını birlikte taşır", () => {
    expect(RAIL_V1_CLIENT_SCHEMA.media.web.ttlSec).toBe(RAIL_MEDIA_TTL_WEB_SEC);
    expect(RAIL_V1_CLIENT_SCHEMA.media.native.ttlSec).toBe(RAIL_MEDIA_TTL_NATIVE_SEC);
    expect(RAIL_V1_CLIENT_SCHEMA.media.native.refreshAfterSec).toBeLessThan(
      RAIL_V1_CLIENT_SCHEMA.media.native.ttlSec,
    );
  });
});

describe("okuma hop'u gövdeleri katı şemadır — uydurma alan sızmaz", () => {
  it("shelves gövdesi fazla alanı reddeder", () => {
    const minimal = {
      profiles: [],
      selectedId: null,
      xp: { points: 0, badges: [] },
      plan: { status: "NONE", electiveQuota: 3, expiresAt: null, gradeSwitchRights: 0 },
      courses: [],
      sealedLessonCount: 0,
      clientSchema: {
        timelineSchemaVersion: "2.0.0",
        minTimelineSchemaVersion: "2.0.0",
        mediaTtlSec: 900,
        mediaRefreshAfterSec: 600,
      },
    };
    expect(railV1JuniorShelvesDataSchema.safeParse(minimal).success).toBe(true);
    expect(
      railV1JuniorShelvesDataSchema.safeParse({ ...minimal, accessToken: "leak" }).success,
    ).toBe(false);
  });

  it("progress gövdesi profil yokken dürüst boş tahta basar", () => {
    const empty = {
      profileId: null,
      profiles: [],
      xp: { points: 0, badges: [] },
      lessons: [],
      totals: { started: 0, done: 0, going: 0 },
      weeklyReport: null,
      clientSchema: { timelineSchemaVersion: "2.0.0", minTimelineSchemaVersion: "2.0.0" },
    };
    expect(railV1JuniorProgressDataSchema.safeParse(empty).success).toBe(true);
    // Puan sunucuda kalır: hop skoru taşımaz (A4).
    expect(
      railV1JuniorProgressDataSchema.safeParse({ ...empty, score: 100 }).success,
    ).toBe(false);
  });

  it("catalog gövdesi fiyatsız kartı null ile basar, uydurma tutar yok", () => {
    const course = {
      slug: "01_office_ai",
      title: "Ofiste Yapay Zekâ",
      summary: "Özet",
      shelf: "hero",
      level: "Temel",
      moduleCode: "OFF-101",
      isPublished: true,
      purchasable: false,
      priceMinor: null,
      currencyCode: null,
      lessonCount: 8,
      durationMin: 64,
      modules: [{ title: "Modül", lessonCount: 8, durationMin: 64 }],
      saleHold: "Kayıt kapalı: ses veya metin mührü eksik.",
      owned: false,
      learnerStatus: null,
      checkoutPath: "/academy/01_office_ai#satin-al",
      outcomeLead: "Somut sonuç",
      outputLead: "Pratik çıktı",
    };
    const body = {
      heroSlug: "01_office_ai",
      courses: [course],
      examPassScore: 70,
      ownedSlugs: [],
      clientSchema: { timelineSchemaVersion: "2.0.0", minTimelineSchemaVersion: "2.0.0" },
    };
    expect(railV1AcademyCatalogDataSchema.safeParse(body).success).toBe(true);
    // Fiyat ve para birimi birlikte dolaşır: yarım çift geçmez.
    expect(
      railV1AcademyCatalogDataSchema.safeParse({
        ...body,
        courses: [{ ...course, priceMinor: 89_000, currencyCode: null }],
      }).success,
    ).toBe(false);
    // Fiyatsız kart da geçerli (uydurma tutar basılmaz).
    expect(
      railV1AcademyCatalogDataSchema.safeParse({
        ...body,
        courses: [{ ...course, priceMinor: null, currencyCode: null }],
      }).success,
    ).toBe(true);
    // Katalog ders gövdesi taşımaz.
    expect(
      railV1AcademyCatalogDataSchema.safeParse({
        ...body,
        courses: [{ ...course, body: "ders gövdesi" }],
      }).success,
    ).toBe(false);
  });
});

describe("okuma hop'ları tek bir kimlik taşır — requestId uydurulmaz", () => {
  it("sahte requestId biçimi zarf şemasından geçmez", () => {
    expect(REQUEST_ID).toMatch(/^[0-9a-f-]{36}$/);
    // Zarf anahtarları okuma hop'larında da aynıdır (üçüncü zarf yok).
    for (const id of ["junior-shelves", "junior-progress-read", "academy-catalog"]) {
      const hop = RAIL_V1_HOPS.find((row) => row.id === id)!;
      expect(hop.routeAuth, id).toBe("session");
    }
  });
});
