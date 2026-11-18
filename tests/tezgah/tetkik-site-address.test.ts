import { describe, expect, it } from "vitest";
import { normalizeTetkikSiteAddress } from "@/lib/tezgah/tetkik/site-address";

describe("tetkik site adresi", () => {
  it("https adresini ve yalın alan adını kabul eder", () => {
    expect(normalizeTetkikSiteAddress("https://ornek-dukkan.com")).toBe("https://ornek-dukkan.com/");
    expect(normalizeTetkikSiteAddress("  ornek-dukkan.com ")).toBe("https://ornek-dukkan.com/");
    expect(normalizeTetkikSiteAddress("http://ornek-dukkan.com/menu")).toBe("https://ornek-dukkan.com/menu");
    expect(normalizeTetkikSiteAddress("www.ornek-dukkan.com")).toBe("https://www.ornek-dukkan.com/");
  });

  it("boş, sistem adı ve özel adresi reddeder", () => {
    expect(normalizeTetkikSiteAddress("")).toBeNull();
    expect(normalizeTetkikSiteAddress("SUPER_ADMIN")).toBeNull();
    expect(normalizeTetkikSiteAddress("localhost")).toBeNull();
    expect(normalizeTetkikSiteAddress("https://127.0.0.1/")).toBeNull();
    expect(normalizeTetkikSiteAddress("javascript:alert(1)")).toBeNull();
    expect(normalizeTetkikSiteAddress("https://user:pass@ornek-dukkan.com")).toBeNull();
  });
});
