import { describe, expect, it } from "vitest";
import {
  buildSignupAuthMetadata,
  isDuplicateSignupUser,
  normalizeSignupFullName,
} from "@/lib/kernel/auth/signup-metadata";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/kernel/identity/types";

describe("kayıt Auth metadata", () => {
  it("ad soyadı ve 18+ onayını display_name / age_confirmed_at olarak mühürler", () => {
    const now = new Date("2026-09-03T12:00:00.000Z");
    expect(buildSignupAuthMetadata("  Ayşe Kaya  ", true, now)).toEqual({
      display_name: "Ayşe Kaya",
      full_name: "Ayşe Kaya",
      age_confirmed_at: "2026-09-03T12:00:00.000Z",
      is_adult: true,
    });
    expect(buildSignupAuthMetadata("Ayşe Kaya", false, now)).toBeNull();
    expect(normalizeSignupFullName("")).toBeNull();
    expect(normalizeSignupFullName("   ")).toBeNull();
    expect(normalizeSignupFullName("a".repeat(DISPLAY_NAME_MAX_LENGTH + 1))).toBeNull();
    expect(normalizeSignupFullName("satır\nsonu")).toBeNull();
    expect(buildSignupAuthMetadata("a".repeat(DISPLAY_NAME_MAX_LENGTH + 1), true, now)).toBeNull();
  });

  it("boş identities mevcut e-posta olarak okunur", () => {
    expect(isDuplicateSignupUser({ identities: [] })).toBe(true);
    expect(isDuplicateSignupUser({ identities: [{ id: "1" }] })).toBe(false);
    expect(isDuplicateSignupUser(null)).toBe(false);
  });
});
