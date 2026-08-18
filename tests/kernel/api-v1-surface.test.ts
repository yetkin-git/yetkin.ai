import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { jsonFail, jsonOk } from "@/lib/kernel/http/json";
import {
  applyRailV1Cors,
  buildV1FailBody,
  canonicalApiPathname,
  decideRailApiVersion,
  isApiV1Pathname,
  parseRailDronOrigins,
  RAIL_API_MIN_VERSION,
  RAIL_API_VERSION,
  RAIL_VERSION_CLIENT_STALE,
  RAIL_VERSION_HEADER_INVALID,
  RAIL_VERSION_HEADER_REQUIRED,
  RAIL_VERSION_SERVER_STALE,
} from "@/lib/kernel/http/api-v1";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createMemoryHttpIdempotencyStore } from "@/lib/kernel/http/memory-idempotency-store";
import { matchApiAuthKind } from "@/lib/kernel/security/api-auth";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";

const ROOT = process.cwd();
const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function v1Request(path: string, init?: HeadersInit): Request {
  return new Request(new URL(path, "http://localhost:3000"), {
    headers: { "x-rail-api-version": "1", "x-request-id": REQUEST_ID, ...init },
  });
}

describe("/api/v1 sürüm kapısı ve zarf", () => {
  it("kopya app/api/v1 handler ağacı açılmaz; kenar soyar ve rewrite eder", () => {
    expect(existsSync(join(ROOT, "app/api/v1"))).toBe(false);
    const proxy = readSrc("proxy.ts");
    expect(proxy).toContain("NextResponse.rewrite");
    expect(proxy).toContain("canonicalApiPathname");
    expect(proxy).toContain("decideRailApiVersion");
    expect(proxy).toContain("decideRailV1HopGate");
    expect(proxy).toContain("RAIL_API_VERSION_REQUEST_HEADER");
    expect(proxy).not.toContain("Access-Control-Allow-Origin");
    expect(canonicalApiPathname("/api/v1/freelancer/jobs")).toBe("/api/freelancer/jobs");
    expect(canonicalApiPathname("/api/freelancer/jobs")).toBe("/api/freelancer/jobs");
    expect(isApiV1Pathname("/api/v10/jobs")).toBe(false);
    expect(
      matchApiAuthKind("/api/v1/freelancer/jobs", ROUTE_AUTH_MAP as Record<string, string>),
    ).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/freelancer/contracts"]).toBe("session");
    expect(readSrc("app/api/freelancer/contracts/route.ts")).toContain("listFreelancerContractViews");
  });

  it("sürüm başlığı eksik/geçersiz 400; eski ve gelecek istemci 426 data:null", () => {
    expect(
      decideRailApiVersion({ pathname: "/api/v1/freelancer/jobs", minVersionHeader: null }),
    ).toEqual({ kind: "fail", status: 400, error: RAIL_VERSION_HEADER_REQUIRED });
    expect(
      decideRailApiVersion({ pathname: "/api/v1/freelancer/jobs", minVersionHeader: "abc" }),
    ).toEqual({ kind: "fail", status: 400, error: RAIL_VERSION_HEADER_INVALID });
    expect(
      decideRailApiVersion({ pathname: "/api/v1/freelancer/jobs", minVersionHeader: "0" }),
    ).toEqual({ kind: "fail", status: 400, error: RAIL_VERSION_HEADER_INVALID });
    expect(
      decideRailApiVersion({
        pathname: "/api/v1/freelancer/jobs",
        minVersionHeader: "1",
        minVersion: 2,
        apiVersion: 2,
      }),
    ).toEqual({ kind: "fail", status: 426, error: RAIL_VERSION_CLIENT_STALE });
    expect(
      decideRailApiVersion({ pathname: "/api/v1/freelancer/jobs", minVersionHeader: "2" }),
    ).toEqual({ kind: "fail", status: 426, error: RAIL_VERSION_SERVER_STALE });
    expect(
      decideRailApiVersion({
        pathname: "/api/v1/health",
        method: "GET",
        minVersionHeader: null,
      }).kind,
    ).toBe("next");
    expect(
      decideRailApiVersion({
        pathname: "/api/v1/freelancer/jobs",
        method: "OPTIONS",
        minVersionHeader: null,
      }).kind,
    ).toBe("skip");
    expect(RAIL_API_VERSION).toBe(1);
    expect(RAIL_API_MIN_VERSION).toBe(1);
    expect(buildV1FailBody(RAIL_VERSION_CLIENT_STALE, REQUEST_ID)).toEqual({
      ok: false,
      error: RAIL_VERSION_CLIENT_STALE,
      requestId: REQUEST_ID,
      apiVersion: "1",
      data: null,
    });
  });

  it("jsonOk v1'de data.jobs zarflar; versiyonsuz kök serer", async () => {
    const unversioned = jsonOk({ jobs: [{ id: "fj_1" }] });
    expect(await unversioned.json()).toEqual({ ok: true, jobs: [{ id: "fj_1" }] });
    expect(unversioned.headers.get("x-request-id")).toBeNull();

    const enveloped = jsonOk({ jobs: [{ id: "fj_1" }] }, 200, REQUEST_ID, v1Request("/api/v1/freelancer/jobs"));
    expect(enveloped.status).toBe(200);
    expect(await enveloped.json()).toEqual({
      ok: true,
      error: null,
      requestId: REQUEST_ID,
      apiVersion: "1",
      data: { jobs: [{ id: "fj_1" }] },
    });
    expect(enveloped.headers.get("x-request-id")).toBe(REQUEST_ID);

    const denied = jsonFail("Oturum gerekli.", 401, REQUEST_ID, v1Request("/api/v1/freelancer/jobs"));
    expect(denied.status).toBe(401);
    expect(await denied.json()).toEqual({
      ok: false,
      error: "Oturum gerekli.",
      requestId: REQUEST_ID,
      apiVersion: "1",
      data: null,
    });
  });

  it("aynı Idempotency-Key v1 ve versiyonsuz ikinci debit doğurmaz", async () => {
    const store = createMemoryHttpIdempotencyStore();
    let runs = 0;
    const base = {
      store,
      userId: "user-1",
      route: "/api/freelancer/jobs",
      key: REQUEST_ID,
      requestHash: hashIdempotencyPayload({ title: "ilan" }),
      requestId: REQUEST_ID,
    };
    const first = await settleHttpIdempotency(base, async () => {
      runs += 1;
      return { status: 201, body: { job: { id: "fj_1" } } };
    });
    const second = await settleHttpIdempotency(
      { ...base, request: v1Request("/api/v1/freelancer/jobs") },
      async () => {
        runs += 1;
        return { status: 201, body: { job: { id: "should-not-run" } } };
      },
    );
    expect(runs).toBe(1);
    expect(await first.json()).toEqual({ ok: true, job: { id: "fj_1" }, requestId: REQUEST_ID });
    expect(await second.json()).toEqual({
      ok: true,
      error: null,
      requestId: REQUEST_ID,
      apiVersion: "1",
      data: { job: { id: "fj_1" } },
    });
  });

  it("dron CORS allowlist yansıtır; joker ve yabancı origin yansımaz", () => {
    expect(parseRailDronOrigins("")).toEqual([]);
    expect(parseRailDronOrigins("*")).toEqual([]);
    expect(parseRailDronOrigins("*,https://app.yetkin.rail")).toEqual(["https://app.yetkin.rail"]);
    const env = { RAIL_DRON_ORIGINS: "https://app.yetkin.rail,https://expo.yetkin.rail" };
    const allowed = new Headers();
    applyRailV1Cors(
      { headers: allowed },
      {
        url: "http://localhost:3000/api/v1/freelancer/jobs",
        headers: new Headers({ origin: "https://app.yetkin.rail" }),
      },
      env,
    );
    expect(allowed.get("Access-Control-Allow-Origin")).toBe("https://app.yetkin.rail");
    expect(allowed.get("Access-Control-Allow-Origin")).not.toBe("*");
    expect(allowed.get("Access-Control-Allow-Credentials")).not.toBe("true");

    const foreign = new Headers();
    applyRailV1Cors(
      { headers: foreign },
      {
        url: "http://localhost:3000/api/v1/freelancer/jobs",
        headers: new Headers({ origin: "https://evil.example" }),
      },
      env,
    );
    expect(foreign.get("Access-Control-Allow-Origin")).toBeNull();

    const unversioned = new Headers();
    applyRailV1Cors(
      { headers: unversioned },
      {
        url: "http://localhost:3000/api/freelancer/jobs",
        headers: new Headers({ origin: "https://app.yetkin.rail" }),
      },
      env,
    );
    expect(unversioned.get("Access-Control-Allow-Origin")).toBeNull();

    const emptyNative = new Headers();
    applyRailV1Cors(
      { headers: emptyNative },
      {
        url: "http://localhost:3000/api/v1/freelancer/jobs",
        headers: new Headers({ origin: "https://lab.yetkin.rail" }),
      },
      { RAIL_DRON_ORIGINS: "" },
    );
    expect(emptyNative.get("Access-Control-Allow-Origin")).toBeNull();
    expect(emptyNative.get("Access-Control-Allow-Credentials")).toBeNull();

    const example = readSrc(".env.example");
    const envTs = readSrc("lib/kernel/env.ts");
    const cors = readSrc("lib/kernel/http/api-v1.ts");
    expect(example).toContain("RAIL_DRON_ORIGINS=\"\"");
    expect(envTs).toContain("RAIL_DRON_ORIGINS");
    expect(cors).toContain("Access-Control-Allow-Origin");
    expect(cors).not.toContain('Access-Control-Allow-Origin", "*"');
    expect(cors).not.toContain("Allow-Origin: *");
  });
});
