import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_BROWSER_FETCH_TIMEOUT_MS,
  describePublicSupabaseBrowserEnv,
  readPublicSupabaseBrowserEnv,
  SupabaseBrowserEnvError,
} from "@/lib/kernel/auth/supabase-browser";

describe("tarayıcı Supabase env mührü", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fetch watchdog 15s; boş veya geçersiz URL fail-closed düşer", () => {
    expect(AUTH_BROWSER_FETCH_TIMEOUT_MS).toBe(15_000);

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(describePublicSupabaseBrowserEnv()).toEqual({
      hasUrl: false,
      hasAnon: false,
      host: null,
    });
    expect(() => readPublicSupabaseBrowserEnv()).toThrow(SupabaseBrowserEnvError);

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-test");
    const invalid = describePublicSupabaseBrowserEnv();
    expect(invalid.hasUrl).toBe(true);
    expect(invalid.hasAnon).toBe(true);
    expect(invalid.host).toBe("invalid");
    expect(() => readPublicSupabaseBrowserEnv()).toThrow(SupabaseBrowserEnvError);

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-test");
    expect(readPublicSupabaseBrowserEnv()).toEqual({
      url: "https://demo.supabase.co",
      anon: "anon-test",
      host: "demo.supabase.co",
    });
  });
});
