import { describe, expect, it } from "vitest";
import {
  buildSignupAuthMetadata,
  deriveSignupDisplayName,
  normalizeSignupFullName,
} from "@/lib/kernel/auth/signup-metadata";
import { registerCitizen } from "@/lib/kernel/auth/register-citizen";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";

/**
 * Kayıt üç adımdır: e-posta, şifre, yaş beyanı.
 * Kullanım/KVKK kabulü kayıt ekranındaki açık cümle + düğmedir; kasa rızası
 * (mesafeli satış + anında ifa) Ödeme sayfasında ayrı tiklerle toplanır.
 * Bu dosya ikisinin karışmadığını kilitler.
 */
describe("üç adımlı kayıt", () => {
  it("ad soyad istemez; sicil adı e-posta yerelinden türetilir", () => {
    expect(deriveSignupDisplayName("ayse.kaya@example.com")).toBe("Ayse Kaya");
    expect(deriveSignupDisplayName("  vision+test@example.com ")).toBe("Vision Test");
    expect(deriveSignupDisplayName("a_b-c@example.com")).toBe("A B C");
    // Türetilemezse null; kayıt bloklanmaz, display_name boş kalır.
    expect(deriveSignupDisplayName("@example.com")).toBeNull();
    expect(registerCitizen(
      {
        email: "ayse.kaya@example.com",
        password: "rail-test-8",
        ageConfirmed: true,
        termsConfirmed: true,
      },
      "https://yetkin.ai",
    )).toMatchObject({ ok: true });
  });

  it("metadata ad alanı boşken de mühürlenir; 18+ yoksa signUp gitmez", () => {
    const now = new Date("2026-10-29T00:00:00.000Z");
    const sealed = buildSignupAuthMetadata(null, true, true, now);
    expect(sealed).not.toBeNull();
    expect(sealed?.display_name).toBe("");
    expect(sealed?.age_confirmed_at).toBe("2026-10-29T00:00:00.000Z");
    expect(sealed?.terms_accepted_at).toBe("2026-10-29T00:00:00.000Z");

    expect(buildSignupAuthMetadata(null, false, true, now)).toBeNull();
    // Geçersiz ad (fazla uzun / satır sonu) gevşetilmez.
    expect(buildSignupAuthMetadata("a".repeat(200), true, true, now)).toBeNull();
    expect(normalizeSignupFullName("satır\nsonu")).toBeNull();
  });

  it("yaş beyanı yoksa kayıt reddedilir ve hata metni yaşı söyler", () => {
    const denied = registerCitizen(
      {
        email: "ayse@example.com",
        password: "rail-test-8",
        ageConfirmed: false,
        termsConfirmed: true,
      },
      "https://yetkin.ai",
    );
    expect(denied.ok).toBe(false);
    if (!denied.ok) {
      expect(denied.error).toBe(AUTH_SEN.register.ageRequired);
      expect(denied.reason).toBe("validation");
    }
  });

  it("kayıt ekranı yasal tik taşımaz; kasa rızası ayrı sözlüktedir", () => {
    expect(AUTH_SEN.register.signupConsentLead).toBe("Hesap oluşturarak");
    expect(AUTH_SEN.register.signupConsentTail).toContain("Ödeme sayfasında ayrıca alınır");
    expect(AUTH_SEN.register.description).toContain("e-posta, şifre, yaş beyanı");
  });
});
