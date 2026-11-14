import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ACADEMY_QUERY_OMITS_JUNIOR,
  JUNIOR_ALLOWED_EMAILS,
  canAccessJunior,
  isJuniorCatalogSlug,
  resolveJuniorAllowedEmails,
} from "@/lib/access";

describe("canAccessJunior", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("boş env iki yerleşik kutuya düşer; harf ve boşluk duyarsızdır", () => {
    vi.stubEnv("JUNIOR_ALLOWED_EMAILS", "");
    expect(resolveJuniorAllowedEmails()).toEqual([...JUNIOR_ALLOWED_EMAILS]);
    expect(canAccessJunior("  Yapinet360@gmail.com ")).toBe(true);
    expect(canAccessJunior("USTADERS.PROJE@GMAIL.COM")).toBe(true);
    expect(canAccessJunior("veli@yetkin.ai")).toBe(false);
    expect(canAccessJunior(null)).toBe(false);
    expect(canAccessJunior("   ")).toBe(false);
  });

  it("JUNIOR_ALLOWED_EMAILS doluysa yerleşik listenin yerine geçer", () => {
    vi.stubEnv("JUNIOR_ALLOWED_EMAILS", "veli@yetkin.ai, USTADERS.proje@gmail.com");
    expect(canAccessJunior("veli@yetkin.ai")).toBe(true);
    expect(canAccessJunior("ustaders.proje@gmail.com")).toBe(true);
    expect(canAccessJunior("yapinet360@gmail.com")).toBe(false);
  });

  it("akademi sorgusu Junior slug önekini dışarıda bırakır", () => {
    expect(isJuniorCatalogSlug("jr_06_mat")).toBe(true);
    expect(isJuniorCatalogSlug("01_office_ai")).toBe(false);
    expect(ACADEMY_QUERY_OMITS_JUNIOR).toEqual({
      NOT: { slug: { startsWith: "jr_" } },
    });
  });
});
