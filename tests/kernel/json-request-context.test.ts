import { describe, expect, it } from "vitest";
import { GENERIC_INTERNAL_ERROR, jsonFail, jsonOk } from "@/lib/kernel/http/json";
import {
  peekRailHttpContextRequestId,
  railHttpContextFromRequest,
  runWithRailHttpContext,
} from "@/lib/kernel/http/request-context";
import { parseRailV1Envelope } from "@/lib/kernel/http/v1-contract";

const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("Rail HTTP ALS bağlamı", () => {
  it("Request yokken ALS requestId zarfa girer", async () => {
    const response = runWithRailHttpContext(
      {
        requestId: REQUEST_ID,
        pathname: null,
        method: "GET",
      },
      () => jsonFail("Kapı kilitli.", 403),
    );
    expect(response.status).toBe(403);
    expect(response.headers.get("x-request-id")).toBe(REQUEST_ID);
    expect(parseRailV1Envelope(await response.json())).toMatchObject({
      ok: false,
      error: "Kapı kilitli.",
      requestId: REQUEST_ID,
      apiVersion: "1",
      data: null,
    });
  });

  it("ALS dışındaki jsonOk rastgele requestId basar; hop yoksa şema kilidi atlanmaz", async () => {
    expect(peekRailHttpContextRequestId()).toBeNull();
    const response = jsonOk({ ping: true }, 200);
    const body = parseRailV1Envelope(await response.json());
    expect(body.ok).toBe(true);
    expect(body.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(body.requestId).not.toBe(REQUEST_ID);
  });

  it("kanonik Request başlığından snapshot üretir", () => {
    const request = new Request("http://localhost/api/career/pulse", {
      method: "GET",
      headers: {
        "x-request-id": REQUEST_ID,
        "x-rail-pathname": "/api/v1/career/pulse",
        "x-rail-request-method": "GET",
      },
    });
    expect(railHttpContextFromRequest(request)).toEqual({
      requestId: REQUEST_ID,
      pathname: "/api/v1/career/pulse",
      method: "GET",
    });
  });

  it("json.ts Next iç ALS import etmez", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const source = readFileSync(join(process.cwd(), "lib/kernel/http/json.ts"), "utf8");
    expect(source).not.toMatch(/from ["']next\/dist/);
    expect(source).not.toContain("workUnitAsyncStorage");
    expect(source).toContain(GENERIC_INTERNAL_ERROR);
  });
});
