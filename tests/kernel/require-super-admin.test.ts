import { afterEach, describe, expect, it } from "vitest";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import {
  requireSuperAdmin,
  resolveSuperAdminAccess,
} from "@/lib/kernel/auth/require-super-admin";
import {
  assertSuperAdminActor,
  isSuperAdminActor,
  isSuperAdminUser,
  resolveCanonicalSuperAdminEmail,
} from "@/lib/kernel/auth/super-admin";
import { hasAcademyAdminBypass } from "@/lib/academy/access";

const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const CITIZEN_ID = "22222222-2222-4222-8222-222222222222";
const ADMIN_EMAIL = "admin@yetkin.test";
const CONFIRMED = "2026-01-01T00:00:00.000Z";
const ORIGINAL = process.env.SUPER_ADMIN_USER_ID;
const ORIGINAL_EMAIL = process.env.CANONICAL_SUPER_ADMIN_EMAIL;

describe("requireSuperAdmin tek merkez", () => {
  afterEach(() => {
    if (ORIGINAL == null) {
      delete process.env.SUPER_ADMIN_USER_ID;
    } else {
      process.env.SUPER_ADMIN_USER_ID = ORIGINAL;
    }
    if (ORIGINAL_EMAIL == null) {
      delete process.env.CANONICAL_SUPER_ADMIN_EMAIL;
    } else {
      process.env.CANONICAL_SUPER_ADMIN_EMAIL = ORIGINAL_EMAIL;
    }
  });

  it("UUID eşitliği; boş env kimseyi admin yapmaz", () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    expect(isSuperAdminUser(ADMIN_ID)).toBe(true);
    expect(isSuperAdminUser(CITIZEN_ID)).toBe(false);

    process.env.SUPER_ADMIN_USER_ID = "  ";
    expect(isSuperAdminUser(ADMIN_ID)).toBe(false);
    delete process.env.SUPER_ADMIN_USER_ID;
    expect(isSuperAdminUser(ADMIN_ID)).toBe(false);
  });

  it("isSuperAdminActor SSOT: doğrulanmış e-posta veya UUID; academy bypass aynı kişiyi tanır", () => {
    delete process.env.SUPER_ADMIN_USER_ID;
    process.env.CANONICAL_SUPER_ADMIN_EMAIL = ADMIN_EMAIL;
    expect(isSuperAdminActor({ id: ADMIN_ID, email: ADMIN_EMAIL, emailConfirmedAt: CONFIRMED })).toBe(
      true,
    );
    expect(isSuperAdminActor({ id: ADMIN_ID, email: ADMIN_EMAIL })).toBe(false);
    expect(isSuperAdminActor({ id: ADMIN_ID, email: "vatandas@yetkin.rail", emailConfirmedAt: CONFIRMED })).toBe(
      false,
    );
    expect(
      hasAcademyAdminBypass({ userId: ADMIN_ID, email: ADMIN_EMAIL, emailConfirmedAt: CONFIRMED }),
    ).toBe(true);
    expect(hasAcademyAdminBypass({ userId: ADMIN_ID, email: "vatandas@yetkin.rail" })).toBe(false);
    expect(() =>
      assertSuperAdminActor({ id: ADMIN_ID, email: ADMIN_EMAIL, emailConfirmedAt: CONFIRMED }),
    ).not.toThrow();
    expect(() =>
      assertSuperAdminActor({ id: ADMIN_ID, email: "vatandas@yetkin.rail", emailConfirmedAt: CONFIRMED }),
    ).toThrow(ForbiddenError);

    delete process.env.CANONICAL_SUPER_ADMIN_EMAIL;
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    expect(
      isSuperAdminActor({ id: ADMIN_ID, email: "vatandas@yetkin.rail", emailConfirmedAt: CONFIRMED }),
    ).toBe(true);
    expect(
      hasAcademyAdminBypass({
        userId: ADMIN_ID,
        email: "vatandas@yetkin.rail",
        emailConfirmedAt: CONFIRMED,
      }),
    ).toBe(true);
  });

  it("üretimde env boşsa admin yoktur; UUID ve e-posta birlikte gerekir", () => {
    const previousNode = process.env.NODE_ENV;
    (process.env as { NODE_ENV?: string }).NODE_ENV = "production";
    delete process.env.CANONICAL_SUPER_ADMIN_EMAIL;
    delete process.env.SUPER_ADMIN_USER_ID;
    try {
      expect(resolveCanonicalSuperAdminEmail()).toBe("");
      expect(
        isSuperAdminActor({
          id: ADMIN_ID,
          email: "yapinet360@gmail.com",
          emailConfirmedAt: CONFIRMED,
        }),
      ).toBe(false);
      process.env.CANONICAL_SUPER_ADMIN_EMAIL = ADMIN_EMAIL;
      expect(
        isSuperAdminActor({ id: ADMIN_ID, email: ADMIN_EMAIL, emailConfirmedAt: CONFIRMED }),
      ).toBe(false);
      process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
      expect(
        isSuperAdminActor({ id: ADMIN_ID, email: ADMIN_EMAIL, emailConfirmedAt: CONFIRMED }),
      ).toBe(true);
      expect(isSuperAdminActor({ id: ADMIN_ID, email: ADMIN_EMAIL })).toBe(false);
    } finally {
      (process.env as { NODE_ENV?: string }).NODE_ENV = previousNode;
    }
  });

  it("oturum yoksa 401; gayri-admin 403 — getSession sahte oturum basmaz", async () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    try {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      await expect(requireSuperAdmin()).rejects.toBeInstanceOf(AuthRequiredError);
      expect(await resolveSuperAdminAccess()).toEqual({ kind: "unauthenticated" });
    } finally {
      if (url == null) {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      } else {
        process.env.NEXT_PUBLIC_SUPABASE_URL = url;
      }
      if (anon == null) {
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      } else {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon;
      }
    }
  });
});
