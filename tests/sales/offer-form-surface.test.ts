import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { OFFER_FORM_LIMITS, validateOfferForm } from "@/components/kurumsal/offer-form";
import { KURUMSAL_OFFER_PACKAGES } from "@/lib/sales/kurumsal-offer-packages";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

/** Sunucu `clip(value, max)` çağrılarındaki sayı — istemci sınırıyla aynı olmalı. */
function serverClipLimits(): Record<string, number> {
  const route = readSrc("app/api/lead/route.ts");
  const limits: Record<string, number> = {};
  for (const match of route.matchAll(/const (\w+) = clip\([^,]+,\s*(\d+)\)/g)) {
    limits[match[1]!] = Number(match[2]);
  }
  return limits;
}

/**
 * Faz 2 / P3 — kurumsal teklif formu istemci doğrulaması.
 *
 * Tespit #27: formun istemci tarafında hiç doğrulama yoktu; sunucu değerleri
 * sessizce kırpıyordu. Bu testler istemci sınırlarının sunucu sınırlarıyla
 * **birebir** aynı olduğunu ve hataların görünür kaldığını kilitler.
 */
describe("Faz 2 kurumsal teklif formu — sınır uyumu", () => {
  it("istemci maxLength sınırları sunucu clip() sınırlarıyla aynıdır", () => {
    const server = serverClipLimits();
    expect(server.companyName).toBe(OFFER_FORM_LIMITS.companyName);
    expect(server.email).toBe(OFFER_FORM_LIMITS.email);
    expect(server.city).toBe(OFFER_FORM_LIMITS.city);
    expect(server.note).toBe(OFFER_FORM_LIMITS.note);
    expect(OFFER_FORM_LIMITS).toEqual({ companyName: 120, email: 160, city: 80, note: 500 });
  });

  it("form alanları maxLength taşır; sessiz kırpma imkânsız", () => {
    const form = readSrc("components/kurumsal/offer-form.tsx");
    expect(form).toContain("maxLength={OFFER_FORM_LIMITS.companyName}");
    expect(form).toContain("maxLength={OFFER_FORM_LIMITS.email}");
    expect(form).toContain("maxLength={OFFER_FORM_LIMITS.city}");
    expect(form).toContain("maxLength={OFFER_FORM_LIMITS.note}");
    expect(form).toContain("aria-invalid");
    expect(form).toContain('role="alert"');
    expect(form).toContain('role="status"');
  });
});

describe("Faz 2 kurumsal teklif formu — doğrulama davranışı", () => {
  it("geçerli form hatasız geçer", () => {
    expect(
      validateOfferForm({
        companyName: "Örnek Teknoloji A.Ş.",
        email: "satinalma@ornek.com",
        city: "İstanbul",
      }),
    ).toEqual({});
  });

  it("boş ve kısa alanlar sunucu kuralıyla aynı mesajı üretir", () => {
    expect(validateOfferForm({ companyName: "", email: "", city: "" })).toEqual({
      companyName: "Firma adı en az 2 karakter olmalı.",
      email: "E-posta gerekli.",
      city: "İl en az 2 karakter olmalı.",
    });
    expect(validateOfferForm({ companyName: " A ", email: "a@b.co", city: " İ " })).toEqual({
      companyName: "Firma adı en az 2 karakter olmalı.",
      city: "İl en az 2 karakter olmalı.",
    });
  });

  it("geçersiz e-posta reddedilir (sunucu EMAIL_RE ile aynı)", () => {
    for (const email of ["a", "a@", "@b.co", "a b@c.co", "a@b", "a@b.c d"]) {
      const errors = validateOfferForm({ companyName: "Örnek", email, city: "Ankara" });
      expect(errors.email, email).toBeDefined();
    }
    for (const email of ["a@b.co", " ad.soyad@ornek.com.tr "]) {
      const errors = validateOfferForm({ companyName: "Örnek", email, city: "Ankara" });
      expect(errors.email, email).toBeUndefined();
    }
  });

  it("sınırı aşan değer görünür hata verir (kırpılmaz)", () => {
    const long = "a".repeat(OFFER_FORM_LIMITS.companyName + 1);
    expect(validateOfferForm({ companyName: long, email: "a@b.co", city: "Ankara" }).companyName).toBe(
      `Firma adı en fazla ${OFFER_FORM_LIMITS.companyName} karakter olabilir.`,
    );
    const longEmail = `${"a".repeat(OFFER_FORM_LIMITS.email)}@b.co`;
    expect(validateOfferForm({ companyName: "Örnek", email: longEmail, city: "Ankara" }).email).toBe(
      `E-posta en fazla ${OFFER_FORM_LIMITS.email} karakter olabilir.`,
    );
    const longCity = "a".repeat(OFFER_FORM_LIMITS.city + 1);
    expect(validateOfferForm({ companyName: "Örnek", email: "a@b.co", city: longCity }).city).toBe(
      `İl en fazla ${OFFER_FORM_LIMITS.city} karakter olabilir.`,
    );
  });

  it("normalizasyon sunucu clip() davranışını izler (boşluk sadeleşir)", () => {
    // Sunucu `\s+` → tek boşluk + trim: 120 sınırı ölçülen değer üzerindedir.
    const inner = "a".repeat(OFFER_FORM_LIMITS.companyName - 2);
    const padded = `  ${inner}   `;
    expect(validateOfferForm({ companyName: padded, email: "a@b.co", city: "Ankara" })).toEqual({});
  });

  it("paket anahtarları sunucu allowlist'iyle aynı SSOT'tan gelir", () => {
    const form = readSrc("components/kurumsal/offer-form.tsx");
    expect(form).toContain("KURUMSAL_OFFER_PACKAGES");
    // Sunucu allowlist'i aynı listeden doğrular.
    const route = readSrc("app/api/lead/route.ts");
    expect(route).toContain("isKurumsalOfferPackage");
    expect(KURUMSAL_OFFER_PACKAGES.length).toBeGreaterThan(0);
  });
});
