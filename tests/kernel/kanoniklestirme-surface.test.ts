import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  RAIL_BOUNDED_CONTEXT_IDS,
  RAIL_CONTEXT_FORBIDDEN,
  RAIL_CONTEXT_PRISMA_ALLOWLIST,
  RAIL_PHASE1_ROOM_CONTEXT,
  contextOfPrismaModel,
} from "@/lib/kernel/bounded-contexts";
import { GENERIC_INTERNAL_ERROR, jsonOk } from "@/lib/kernel/http/json";
import {
  isRailV1HopForbiddenOnDron,
  parseRailV1Envelope,
  RAIL_V1_DRON_FORBIDDEN_HOP_IDS,
  RAIL_V1_HOPS,
} from "@/lib/kernel/http/v1-contract";
import { RAIL_V1_HOP_GATES } from "@/lib/kernel/http/v1-hop-gate";
import { guardRailV1OkData } from "@/lib/kernel/http/v1-response-guard";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { RAIL_IS_DAY0_HOPS } from "../../apps/rail-is/src/api/hops";

const ROOT = process.cwd();
const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function v1Request(path: string): Request {
  return new Request(new URL(path, "http://localhost:3000"), {
    headers: { "x-rail-api-version": "1", "x-request-id": REQUEST_ID },
  });
}

describe("Faz 1 kanonikleştirme yüzeyi", () => {
  it("üç bounded context ilan edilir; çalışan oda tavanı 4 durur", () => {
    expect([...RAIL_BOUNDED_CONTEXT_IDS]).toEqual(["proof", "marketplace", "payments"]);
    expect(RAIL_PHASE1_ROOM_CONTEXT).toEqual({
      academy: "proof",
      career: "proof",
      freelancer: "marketplace",
    });
    expect("pazaryeri" in RAIL_PHASE1_ROOM_CONTEXT).toBe(false);
    expect(contextOfPrismaModel("academyCertificate")).toBe("proof");
    expect(contextOfPrismaModel("freelancerContract")).toBe("marketplace");
    expect(contextOfPrismaModel("escrowHold")).toBe("payments");
    expect(contextOfPrismaModel("careerVisaStamp")).toBe("proof");
    expect(RAIL_CONTEXT_PRISMA_ALLOWLIST).toEqual([
      "archived/lib/social/prisma-proofs.ts",
      "archived/lib/studio/load.ts",
      "lib/kernel/passport/load.ts",
    ]);
    expect(RAIL_CONTEXT_FORBIDDEN.marketplaceMustNotSellHashAsSignature).toMatch(/imza/);
    expect(RAIL_CONTEXT_FORBIDDEN.paymentsMustNotInventIbanPayout).toMatch(/IBAN/);
    expect(existsSync(join(ROOT, "app/api/v1"))).toBe(false);
  });

  it("v1 hop sicili 16 kayıt ve kenar kapısı 1:1 kilitler", () => {
    expect(RAIL_V1_HOPS.map((hop) => hop.id)).toEqual(RAIL_V1_HOP_GATES.map((hop) => hop.id));
    expect(RAIL_V1_HOPS).toHaveLength(16);
    expect(RAIL_V1_HOPS.map((hop) => hop.id)).toEqual([
      "health",
      "academy-certificate",
      "academy-pulse",
      "academy-purchase",
      "auth-session",
      "wallet-strip",
      "freelancer-jobs",
      "client-job-bids",
      "freelancer-bid",
      "freelancer-accept",
      "freelancer-contracts",
      "freelancer-delivery",
      "freelancer-release",
      "freelancer-refund",
      "career-pulse",
      "career-visas",
    ]);
    expect(Object.keys(RAIL_IS_DAY0_HOPS)).toHaveLength(9);
    expect(RAIL_V1_HOPS.some((hop) => hop.id === "freelancer-refund")).toBe(true);
    expect(JSON.stringify(RAIL_IS_DAY0_HOPS)).not.toContain("refund");
    expect(JSON.stringify(RAIL_IS_DAY0_HOPS)).not.toContain("/api/v1/academy");
    expect(JSON.stringify(RAIL_IS_DAY0_HOPS)).not.toContain("/api/v1/career");
    expect(RAIL_V1_DRON_FORBIDDEN_HOP_IDS).toEqual(["academy-purchase"]);
    expect(isRailV1HopForbiddenOnDron("academy-purchase")).toBe(true);
    expect(RAIL_V1_HOPS.find((hop) => hop.id === "academy-purchase")?.nativeStore).toBe("forbidden");
    expect(readSrc("app/api/academy/courses/[id]/purchase/route.ts")).toContain(
      "isV1CookieSessionBlocked",
    );
    expect(readSrc("app/api/academy/courses/[id]/purchase/route.ts")).toContain(
      "ACADEMY_PURCHASE_DRON_FORBIDDEN",
    );
    expect(readSrc("lib/kernel/http/v1-hop-gate.ts")).toContain("RAIL_V1_HOP_DRON_FORBIDDEN");
    expect(readSrc("lib/kernel/http/v1-hop-gate.ts")).toContain("v1-hops-meta");
    expect(readSrc("lib/kernel/http/v1-hop-gate.ts")).not.toContain("v1PathTemplate: \"/api/v1/health\"");
    expect(readSrc("lib/kernel/http/v1-contract.ts")).toContain("v1-hops-meta");
    expect(readSrc("lib/kernel/http/v1-contract.ts")).not.toContain("v1PathTemplate: \"/api/v1/health\"");
    expect(readSrc("lib/academy/index.ts")).not.toContain("loadPublicAcademyExam");
    expect(readSrc("lib/academy/exam-engine.ts")).not.toContain("loadPublicAcademyExam");
  });

  it("v1 jsonOk hop şemasına uymayan gövdeyi 500 jenerik hataya çevirir", async () => {
    const guarded = guardRailV1OkData({
      pathname: "/api/v1/freelancer/jobs",
      method: "GET",
      data: { jobs: [{ id: "fj_1" }] },
    });
    expect(guarded).toEqual({ ok: false, hopId: "freelancer-jobs" });

    const response = jsonOk(
      { jobs: [{ id: "fj_1" }] },
      200,
      REQUEST_ID,
      v1Request("/api/v1/freelancer/jobs"),
    );
    expect(response.status).toBe(500);
    expect(parseRailV1Envelope(await response.json())).toMatchObject({
      ok: false,
      error: GENERIC_INTERNAL_ERROR,
      requestId: REQUEST_ID,
      apiVersion: "1",
      data: null,
    });
  });

  it("web v1 parser yalnız data alanını T'ye indirir; versiyonsuz kök parse fail'dir", () => {
    const v1 = parseRailClientJson<{ strip: { live: boolean } }>({
      ok: true,
      error: null,
      requestId: REQUEST_ID,
      apiVersion: "1",
      data: { strip: { live: true } },
    });
    expect(v1).toEqual({
      ok: true,
      data: { strip: { live: true } },
      envelope: "v1",
    });

    const unversioned = parseRailClientJson<{ strip: { live: boolean } }>({
      ok: true,
      strip: { live: true },
    });
    expect(unversioned).toEqual({
      ok: false,
      error: "v1 zarfı okunamadı.",
      envelope: "unknown",
    });

    expect(readSrc("lib/kernel/http/unversioned-sunset.ts")).not.toContain("2026-11-20");
    expect(readSrc("lib/kernel/http/json.ts")).not.toContain("unversionedSunsetHeaders");
    expect(readSrc("lib/kernel/http/json.ts")).not.toMatch(/from ["']next\/dist/);
    expect(readSrc("lib/kernel/http/json.ts")).toContain("peekRailHttpContextRequestId");
    expect(readSrc("lib/kernel/http/request-context.ts")).toContain("AsyncLocalStorage");
    expect(readSrc("lib/career/prisma-proofs.ts")).toContain("createPrismaProofReadPort");
    expect(readSrc("lib/career/prisma-proofs.ts")).not.toContain("@/lib/academy");
    expect(readSrc("lib/career/prisma-proofs.ts")).not.toContain("@/lib/freelancer");
    expect(readSrc("components/kernel/fetch-wallet-strip.ts")).toContain("withRailApiVersion");
    expect(readSrc("components/shell/header-wallet-chip.tsx")).not.toContain("withRailApiVersion");
    expect(readSrc("lib/ui/parse-rail-json.ts")).toContain("x-rail-api-version");
    expect(readSrc("lib/kernel/http/api-v1.ts")).toContain("P1 kapandı");
    expect(readSrc("lib/kernel/http/api-v1.ts")).toContain("yayın yüzeyi değildir");
  });

  it("OpenAPI ve dron tipleri generate --check zincirindedir; elle DTO sicili yok", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["generate:openapi-v1"]).toContain("scripts/generate-openapi-v1.ts");
    expect(pkg.scripts["generate:v1-client"]).toContain("scripts/generate-rail-v1-dron-types.ts");
    expect(pkg.scripts.build).toContain("generate:v1-client");
    expect(pkg.scripts["verify:v1-contract-artifacts"]).toContain("--check");
    expect(pkg.scripts["verify:prebuild"]).toContain("verify:v1-contract-artifacts");

    const contract = readSrc("apps/rail-is/src/contract/v1.ts");
    expect(contract).toContain('from "../generated/v1"');
    expect(contract).not.toMatch(/export type RailV1Job = \{/);
    expect(existsSync(join(ROOT, "apps/rail-is/src/generated/v1.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "lib/kernel/http/openapi-v1.json"))).toBe(true);
    expect(readSrc("apps/rail-is/src/generated/v1.ts")).toContain("AUTO-GENERATED");
    expect(readSrc("lib/kernel/http/openapi-v1.json")).toContain("sha256-content-digest");
  });

  it("ürün kopyası SHA-256'yı kriptografik imza diye satmaz", () => {
    const academy = readSrc("lib/copy/sen-voice/academy.ts");
    const career = readSrc("lib/copy/sen-voice/career.ts");
    const publicCopy = readSrc("lib/copy/sen-voice/public.ts");
    expect(academy).toContain("SHA-256 içerik özeti");
    expect(academy).toContain("Kriptografik imza değildir");
    expect(career).toContain("imza değildir");
    expect(publicCopy).not.toContain("imzalı sertifika");
    expect(publicCopy).not.toContain("kriptografik imza");
    expect(readSrc("lib/academy/certificate-verify.ts")).toContain("sha256-content-digest");
    expect(readSrc("lib/academy/certificate-lifecycle.ts")).toContain("HTTP yüzeyi bu fazda yok");
    expect(academy).not.toContain("imzalı sertifika");
    expect(career).not.toContain("kriptografik imza basılır");
  });
});
