import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DRON_KAYIT } from "@/lib/dronlar/kayit";
import {
  auditApiRouteCensus,
  findPublishedHopId,
  RAIL_V1_HOP_META_COUNT,
} from "@/lib/kernel/http/api-route-census";
import { RAIL_V1_CORE_HOP_SENTENCE, RAIL_V1_CORE_HOPS } from "@/lib/kernel/http/v1-core-hops";
import { RAIL_V1_HOPS_META } from "@/lib/kernel/http/v1-hops-meta";
import { decideRailV1HopGate } from "@/lib/kernel/http/v1-hop-gate";
import { FROZEN_PRODUCT_WRITE_KEYS, WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { assertRailIsDay0Path } from "../../apps/rail-is/src/api/hops";
import {
  juniorDelegateViolations,
  juniorSchemaModelGaps,
  RAIL_JUNIOR_CONTEXT,
} from "@/lib/kernel/bounded-contexts";
import { collectAppApiRoutes } from "../../scripts/api-route-census-lib";

const ROOT = process.cwd();

describe("sicil hizası — Junior sahip, hop meta, web-only yazma", () => {
  it("Junior şema modelleri lib/junior sahibine bağlıdır; haritasız delegate ihlaldir", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema/junior.prisma"), "utf8");
    const models = [...schema.matchAll(/^model\s+([A-Za-z0-9_]+)/gm)].map((match) => match[1] ?? "");
    expect(juniorSchemaModelGaps(models)).toEqual([]);
    expect([...RAIL_JUNIOR_CONTEXT.delegates]).toEqual([
      "juniorProfile",
      "juniorGuardianConsent",
      "juniorProgress",
      "juniorXp",
      "juniorSubscription",
    ]);
    expect(juniorDelegateViolations("lib/junior/load.ts", "await tx.juniorProfile.create({})")).toEqual(
      [],
    );
    expect(juniorDelegateViolations("lib/academy/runtime.ts", "await prisma.juniorProfile.findMany({})")).toEqual([
      "prisma.juniorProfile sahibi lib/junior",
    ]);
    expect(juniorDelegateViolations("lib/junior/load.ts", "await tx.juniorNewModel.find({})")).toEqual([
      "prisma.juniorNewModel haritasız Junior delegate",
    ]);
  });

  it("oda hop’u meta’da vardır; akademi okuma hop’ları çekirdek cümleyle oda listesi dışındadır", () => {
    expect(RAIL_V1_HOPS_META).toHaveLength(RAIL_V1_HOP_META_COUNT);
    const metaIds = new Set(RAIL_V1_HOPS_META.map((hop) => hop.id));
    for (const room of DRON_KAYIT) {
      for (const hopId of room.hops) {
        expect(metaIds.has(hopId), `${room.id} ${hopId}`).toBe(true);
      }
    }
    expect(DRON_KAYIT.find((room) => room.id === "academy")?.hops).not.toContain(
      "academy-curriculum-read",
    );
    expect(DRON_KAYIT.find((room) => room.id === "academy")?.hops).not.toContain("academy-exam-read");
    expect(RAIL_V1_CORE_HOPS.map((hop) => hop.id)).toEqual([
      "health",
      "auth-session",
      "wallet-top-up",
      "profile-patch",
      "academy-curriculum-read",
      "academy-exam-read",
    ]);
    for (const hop of RAIL_V1_CORE_HOPS) {
      expect(hop.note.startsWith(RAIL_V1_CORE_HOP_SENTENCE)).toBe(true);
    }
  });

  it("web-only yazmalar hop sicilinden ayrıdır; kasa hop'tur, grade kilitli kalır", () => {
    const locked = WEB_ONLY_WRITE_ROUTES.filter((row) => row.status === "locked-temporary");
    expect(locked.map((row) => `${row.method} ${row.path}`).sort()).toEqual([
      "POST /api/junior-pilot/grade",
    ]);
    expect(findPublishedHopId("POST", "/api/junior-pilot/checkout")).toBe("junior-pilot-checkout");
    expect(findPublishedHopId("POST", "/api/junior-pilot/grade")).toBeNull();
    expect(WEB_ONLY_WRITE_ROUTES.some((row) => row.path === "/api/junior-pilot/checkout")).toBe(false);
    for (const needle of [
      "/api/junior/live-tutor",
      "/api/academy/lesson-assistant",
      "/api/academy/courses/[id]/exemption",
      "/api/academy/courses/[id]/audio-grant",
      "/api/wallet/refund",
      "/api/ai/chat",
      "/api/profile/billing",
      "/api/profile/close",
    ]) {
      expect(WEB_ONLY_WRITE_ROUTES.some((row) => row.path === needle)).toBe(true);
    }
    expect(WEB_ONLY_WRITE_ROUTES.some((row) => row.status === "admin")).toBe(true);
    expect(WEB_ONLY_WRITE_ROUTES.some((row) => row.status === "hmac")).toBe(true);
    expect(WEB_ONLY_WRITE_ROUTES.some((row) => row.status === "inngest")).toBe(true);
    expect(WEB_ONLY_WRITE_ROUTES.some((row) => row.status === "cookie-auth")).toBe(true);
  });

  it("canlı koç ve ders asistanı product-write olarak donduruldu; native allowlist ve v1 sicili dışındadır", () => {
    expect([...FROZEN_PRODUCT_WRITE_KEYS]).toEqual([
      "POST /api/junior/live-tutor",
      "POST /api/academy/lesson-assistant",
    ]);
    for (const key of FROZEN_PRODUCT_WRITE_KEYS) {
      const row = WEB_ONLY_WRITE_ROUTES.find((item) => `${item.method} ${item.path}` === key);
      expect(row?.status).toBe("product-write");
      const space = key.indexOf(" ");
      const method = key.slice(0, space);
      const path = key.slice(space + 1);
      expect(findPublishedHopId(method, path)).toBeNull();
      const gate = decideRailV1HopGate({ pathname: `/api/v1${path.slice(4)}`, method });
      expect(gate.kind).toBe("fail");
      if (gate.kind === "fail") {
        expect(gate.status).toBe(404);
      }
      expect(() => assertRailIsDay0Path(`/api/v1${path.slice(4)}`, method)).toThrow(/allowlist/);
    }
    expect(ROUTE_AUTH_MAP["/api/junior/live-tutor"]).toBe("public");
    // P0 tedavi: anonim ziyaretçi ücretsiz ders önizlemesinde asistanı kullanabilir.
    // Kenarda `public`; kapı handler'dadır (ücretsiz ders + IP bazlı günlük kota).
    expect(ROUTE_AUTH_MAP["/api/academy/lesson-assistant"]).toBe("public");
    const tutor = readFileSync(join(ROOT, "app/api/junior/live-tutor/route.ts"), "utf8");
    expect(tutor).toContain('auth = "public"');
    expect(tutor).toContain("localOnly");
    expect(tutor).toContain("HTTP_RATE_LIMITS.llmIp");
    const assistant = readFileSync(join(ROOT, "app/api/academy/lesson-assistant/route.ts"), "utf8");
    expect(assistant).toContain('auth = "public"');
    // Oturum isteğe bağlıdır: yoksa anonim önizleme kolu koşar.
    expect(assistant).toContain("requireSession");
    expect(assistant).toContain("resolveAcademyEntitlement");
    expect(assistant).toContain("academyCourseOffersFreePreview");
    expect(assistant).toContain("guestId");
    expect(assistant).toContain("HTTP_RATE_LIMITS.llmIp");
    const nativeHops = readFileSync(join(ROOT, "apps/rail-is/src/api/hops.ts"), "utf8");
    expect(nativeHops).not.toContain("/api/junior/live-tutor");
    expect(nativeHops).not.toContain("/api/academy/lesson-assistant");
  });

  it("diskteki her API fiili sicilde ya da web-only listesindedir; yeni rota ikisine de yazılmadan geçmez", () => {
    const routes = collectAppApiRoutes(ROOT);
    expect(auditApiRouteCensus(routes)).toEqual([]);
    const opened = [
      ...routes,
      { file: "app/api/new-surface/route.ts", path: "/api/new-surface", methods: ["POST"] },
    ];
    expect(auditApiRouteCensus(opened).map((row) => row.spec)).toContain(
      "POST /api/new-surface sicil ve web-only listesinde yok",
    );
  });
});
