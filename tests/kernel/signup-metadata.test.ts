import { describe, expect, it } from "vitest";
import {
  buildSignupAuthMetadata,
  isDuplicateSignupUser,
  normalizeSignupFullName,
} from "@/lib/kernel/auth/signup-metadata";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/kernel/identity/types";

describe("kayıt Auth metadata", () => {
  it("ad soyadı display_name ve full_name olarak mühürler", () => {
    expect(buildSignupAuthMetadata("  Ayşe Kaya  ")).toEqual({
      display_name: "Ayşe Kaya",
      full_name: "Ayşe Kaya",
    });
    expect(normalizeSignupFullName("")).toBeNull();
    expect(normalizeSignupFullName("   ")).toBeNull();
    expect(normalizeSignupFullName("a".repeat(DISPLAY_NAME_MAX_LENGTH + 1))).toBeNull();
    expect(normalizeSignupFullName("satır\nsonu")).toBeNull();
  });

  it("boş identities mevcut e-posta olarak okunur", () => {
    expect(isDuplicateSignupUser({ identities: [] })).toBe(true);
    expect(isDuplicateSignupUser({ identities: [{ id: "1" }] })).toBe(false);
    expect(isDuplicateSignupUser(null)).toBe(false);
  });
});
