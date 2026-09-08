import { afterEach, describe, expect, it, vi } from "vitest";
import {
  classifyForwardedIp,
  CLOUDFLARE_VERCEL_TRUSTED_PROXY_HOPS,
  DEFAULT_TRUSTED_PROXY_HOPS,
  parseTrustedProxyHops,
  resolveTrustedForwardedIp,
  UNKNOWN_REQUEST_IP,
} from "@/lib/kernel/security/trusted-proxy";

describe("trusted-proxy XFF hop ve user_ip sınıfı", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("boş env varsayılanı 1; Cloudflare+Vercel reçetesi 2", () => {
    expect(parseTrustedProxyHops({})).toBe(DEFAULT_TRUSTED_PROXY_HOPS);
    expect(DEFAULT_TRUSTED_PROXY_HOPS).toBe(1);
    expect(CLOUDFLARE_VERCEL_TRUSTED_PROXY_HOPS).toBe(2);
    expect(parseTrustedProxyHops({ TRUSTED_PROXY_HOPS: "2" })).toBe(2);
  });

  it("sınıf: unknown / private / ipv6 / public_ipv4", () => {
    expect(classifyForwardedIp("")).toBe("unknown");
    expect(classifyForwardedIp(UNKNOWN_REQUEST_IP)).toBe("unknown");
    expect(classifyForwardedIp("127.0.0.1")).toBe("private");
    expect(classifyForwardedIp("10.0.0.1")).toBe("private");
    expect(classifyForwardedIp("2001:db8::1")).toBe("ipv6");
    expect(classifyForwardedIp("85.105.141.10")).toBe("public_ipv4");
  });

  it("iki hop müşteri IPv4; bir hop kenar IPv4", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.50, 104.16.1.1",
    });
    expect(resolveTrustedForwardedIp(headers, { TRUSTED_PROXY_HOPS: "2" })).toBe("203.0.113.50");
    expect(resolveTrustedForwardedIp(headers, { TRUSTED_PROXY_HOPS: "1" })).toBe("104.16.1.1");
  });
});
