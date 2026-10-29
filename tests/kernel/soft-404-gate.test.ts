import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import {
  academySlugVerdict,
  certificateHashIsWellFormed,
  missingPublicSurfacePath,
  publicTalentIdIsWellFormed,
} from "@/lib/academy/public-surface-gate";

function request(path: string): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

/**
 * Soft 404 — ölçülmüş davranış (Next 16.3.1):
 * kök `app/loading.tsx` varken `page`/`layout` içinde `notFound()` yanıtı **200** akar.
 * Durum kodu bu yüzden `proxy` içinde, gövde akmadan kesilir.
 */
describe("soft 404 kapısı — dinamik kamu segmentleri", () => {
  it("vitrin slug haritası: yayındaki SKU var, uydurma slug yok, emekli slug yönlenir", () => {
    expect(academySlugVerdict("01_office_ai")).toBe("ok");
    expect(academySlugVerdict("01_office_ai_ileri")).toBe("ok");
    expect(academySlugVerdict("02_ecommerce_ai")).toBe("ok");
    expect(academySlugVerdict("gecersiz-slug")).toBe("missing");
    expect(academySlugVerdict("")).toBe("missing");
    expect(academySlugVerdict("   ")).toBe("missing");
    // Emekli SKU next.config 301 alır; 404 basmak yönlendirmeyi gölgeler.
    expect(academySlugVerdict("python-temel")).toBe("retired");
    expect(academySlugVerdict("siber-guvenlik")).toBe("retired");
  });

  it("/academy statik sayfaları ve geçerli slug'lar kapıya takılmaz", () => {
    for (const path of [
      "/academy",
      "/academy/dogrula",
      "/academy/certificates",
      "/academy/ileri",
      "/academy/01_office_ai",
      "/academy/01_office_ai/oyna",
      "/academy/01_office_ai/cikis-paketi",
      "/academy/python-temel",
      "/career",
      "/vize",
      "/",
    ]) {
      expect(missingPublicSurfacePath(path), path).toBeNull();
    }
  });

  it("uydurma dinamik slug 404 kapısına düşer", () => {
    expect(missingPublicSurfacePath("/academy/gecersiz-slug")).toBe("/academy/gecersiz-slug");
    expect(missingPublicSurfacePath("/academy/gecersiz-slug/")).toBe("/academy/gecersiz-slug");
    // `/vize/gecersiz` on karakterli ve desene uyar; sayfa "bu kayıt yok" gövdesini basar.
    // Biçim kapısı yalnız desen dışı kimliği keser (aşağıdaki test).
    expect(publicTalentIdIsWellFormed("gecersiz")).toBe(true);
    expect(missingPublicSurfacePath("/vize/gecersiz")).toBeNull();
    expect(missingPublicSurfacePath("/academy/dogrula/gecersiz")).toBe("/academy/dogrula/gecersiz");
  });

  it("biçim geçerli kamu kimlikleri sayfaya düşer (varlık sızdırılmaz)", () => {
    expect(publicTalentIdIsWellFormed("stamp_public_1")).toBe(true);
    expect(publicTalentIdIsWellFormed("bad")).toBe(false);
    expect(missingPublicSurfacePath("/vize/stamp_public_1")).toBeNull();

    const hash = "a".repeat(64);
    expect(certificateHashIsWellFormed(hash)).toBe(true);
    expect(certificateHashIsWellFormed("ABCDEF")).toBe(false);
    expect(missingPublicSurfacePath(`/academy/dogrula/${hash}`)).toBeNull();
    // Biçim geçersizse adres hiç var olmamıştır.
    expect(missingPublicSurfacePath("/academy/dogrula/abc")).toBe("/academy/dogrula/abc");
  });

  it("kenar gerçek 404 basar; geçerli adres ve emekli SKU geçer", async () => {
    const bogus = await proxy(request("/academy/gecersiz-slug"));
    expect(bogus.status).toBe(404);
    expect(bogus.headers.get("x-robots-tag")).toBe("noindex");
    expect(bogus.headers.get("content-type")).toContain("text/html");

    const bogusTalent = await proxy(request("/vize/bad"));
    expect(bogusTalent.status).toBe(404);

    const bogusHash = await proxy(request("/academy/dogrula/gecersiz"));
    expect(bogusHash.status).toBe(404);

    // Gerçek sayfalar 404'e düşmez (regresyon kilidi).
    expect((await proxy(request("/academy"))).status).toBe(200);
    expect((await proxy(request("/academy/dogrula"))).status).toBe(200);
    expect((await proxy(request("/academy/01_office_ai"))).status).toBe(200);
    expect((await proxy(request("/vize"))).status).toBe(200);
    // Emekli SKU kenarda 404 yemez; 301'i next.config basar.
    expect(missingPublicSurfacePath("/academy/python-temel")).toBeNull();
  });
});
