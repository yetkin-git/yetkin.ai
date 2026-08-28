import { describe, expect, it } from "vitest";
import {
  isV1CookieSessionBlocked,
  isV1JsonRequest,
  isV1PathRequest,
} from "@/lib/kernel/http/api-v1";
import { RAIL_PATHNAME_HEADER } from "@/lib/kernel/security/edge-guard";

describe("api-v1 çerez oturum kilidi", () => {
  it("amiral /api/... + sürüm başlığı çerez kilitlemez", () => {
    const request = new Request("http://localhost:3000/api/academy/courses/ac_1/exam", {
      headers: {
        "x-rail-api-version": "1",
        [RAIL_PATHNAME_HEADER]: "/api/academy/courses/ac_1/exam",
      },
    });
    expect(isV1JsonRequest(request)).toBe(true);
    expect(isV1PathRequest(request)).toBe(true);
    expect(isV1CookieSessionBlocked(request)).toBe(false);
  });

  it("Dron /api/v1 yolu ve rewrite sonrası x-rail-pathname çerez kilidi açar", () => {
    const rawV1 = new Request("http://localhost:3000/api/v1/auth/session", {
      headers: { "x-rail-api-version": "1" },
    });
    expect(isV1CookieSessionBlocked(rawV1)).toBe(true);

    const rewritten = new Request("http://localhost:3000/api/auth/session", {
      headers: {
        "x-rail-api-version": "1",
        [RAIL_PATHNAME_HEADER]: "/api/v1/auth/session",
      },
    });
    expect(isV1CookieSessionBlocked(rewritten)).toBe(true);
  });
});
