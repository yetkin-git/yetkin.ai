import { afterEach, describe, expect, it } from "vitest";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import {
  requireSuperAdmin,
  resolveSuperAdminAccess,
} from "@/lib/kernel/auth/require-super-admin";
import { assertSuperAdminUserId, isSuperAdminUser } from "@/lib/kernel/auth/super-admin";

const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const CITIZEN_ID = "22222222-2222-4222-8222-222222222222";
const ORIGINAL = process.env.SUPER_ADMIN_USER_ID;

describe("requireSuperAdmin tek merkez", () => {
  afterEach(() => {
    if (ORIGINAL == null) {
      delete process.env.SUPER_ADMIN_USER_ID;
    } else {
      process.env.SUPER_ADMIN_USER_ID = ORIGINAL;
    }
  });

  it("UUID eşitliği; boş env kimseyi admin yapmaz", () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    expect(isSuperAdminUser(ADMIN_ID)).toBe(true);
    expect(isSuperAdminUser(CITIZEN_ID)).toBe(false);
    expect(() => assertSuperAdminUserId(ADMIN_ID)).not.toThrow();
    expect(() => assertSuperAdminUserId(CITIZEN_ID)).toThrow(ForbiddenError);

    process.env.SUPER_ADMIN_USER_ID = "  ";
    expect(isSuperAdminUser(ADMIN_ID)).toBe(false);
    delete process.env.SUPER_ADMIN_USER_ID;
    expect(isSuperAdminUser(ADMIN_ID)).toBe(false);
    expect(() => assertSuperAdminUserId(ADMIN_ID)).toThrow(ForbiddenError);
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
