import { describe, expect, it } from "vitest";
import {
  buildSignupAuthMetadata,
  isDuplicateSignupUser,
  normalizeSignupFullName,
  SIGNUP_LEGAL_CONSENT_VERSION,
} from "@/lib/kernel/auth/signup-metadata";
import { CHECKOUT_LEGAL_CONSENT_VERSION } from "@/lib/kernel/legal/checkout-consent";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/kernel/identity/types";

describe("kayıt Auth metadata", () => {
  it("ad soyadı, 18+ ve kullanım/KVKK rızasını user_metadata olarak mühürler", () => {
    const now = new Date("2026-09-03T12:00:00.000Z");
    expect(buildSignupAuthMetadata("  Ayşe Kaya  ", true, true, now)).toEqual({
      display_name: "Ayşe Kaya",
      full_name: "Ayşe Kaya",
      age_confirmed_at: "2026-09-03T12:00:00.000Z",
      is_adult: true,
      terms_accepted_at: "2026-09-03T12:00:00.000Z",
      consent_version: SIGNUP_LEGAL_CONSENT_VERSION,
      terms_confirmed: true,
      kvkk_confirmed: true,
    });
    expect(SIGNUP_LEGAL_CONSENT_VERSION).toBe(CHECKOUT_LEGAL_CONSENT_VERSION);
    expect(buildSignupAuthMetadata("Ayşe Kaya", false, true, now)).toBeNull();
    expect(buildSignupAuthMetadata("Ayşe Kaya", true, false, now)).toBeNull();
    expect(normalizeSignupFullName("")).toBeNull();
    expect(normalizeSignupFullName("   ")).toBeNull();
    expect(normalizeSignupFullName("a".repeat(DISPLAY_NAME_MAX_LENGTH + 1))).toBeNull();
    expect(normalizeSignupFullName("satır\nsonu")).toBeNull();
    expect(buildSignupAuthMetadata("a".repeat(DISPLAY_NAME_MAX_LENGTH + 1), true, true, now)).toBeNull();
  });

  it("boş identities mevcut e-posta olarak okunur", () => {
    expect(isDuplicateSignupUser({ identities: [] })).toBe(true);
    expect(isDuplicateSignupUser({ identities: [{ id: "1" }] })).toBe(false);
    expect(isDuplicateSignupUser(null)).toBe(false);
  });
});
