import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CHECKOUT_LEGAL_CONSENT_VERSION } from "@/lib/kernel/legal/checkout-consent";
import {
  classifyGoogleOAuthFailure,
  googleOauthCallbackReason,
  googleOauthReasonMessage,
} from "@/lib/kernel/auth/google-oauth";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
import { buildAuthCallbackRedirectTo } from "@/lib/kernel/auth/redirects";

const ROOT = process.cwd();

describe("Google OAuth tek tık", () => {
  it("kapalı sağlayıcı ve rıza hatalarını Türkçe koda indirger", () => {
    expect(classifyGoogleOAuthFailure("Unsupported provider: provider is not enabled")).toBe("unavailable");
    expect(classifyGoogleOAuthFailure("Provider google is not enabled")).toBe("unavailable");
    expect(classifyGoogleOAuthFailure("handle_new_user: 18 yaş onayı yok. age_confirmed_at zorunludur.")).toBe(
      "consent",
    );
    expect(classifyGoogleOAuthFailure("access_denied")).toBe("generic");
    expect(googleOauthCallbackReason("unavailable")).toBe("google_unavailable");
    expect(googleOauthReasonMessage("google_unavailable")).toBe(AUTH_SEN.google.unavailable);
    expect(googleOauthReasonMessage("google_consent")).toBe(AUTH_SEN.google.consent);
    expect(googleOauthReasonMessage("auth_callback")).toBe(AUTH_SEN.google.fail);
    expect(googleOauthReasonMessage(null)).toBeNull();
  });

  it("dönüş adresi next parametresini callback üzerinde korur", () => {
    expect(buildAuthCallbackRedirectTo("https://rail.example", "/academy/01_office_ai/seviye")).toBe(
      "https://rail.example/auth/callback?next=%2Facademy%2F01_office_ai%2Fseviye",
    );
    expect(buildAuthCallbackRedirectTo("https://rail.example", "https://evil.example")).toBe(
      "https://rail.example/auth/callback",
    );
  });

  it("giriş ve kayıt düğmesi OAuth bağlar; kayıt e-posta API'si durur", () => {
    const button = readFileSync(join(ROOT, "components/auth/google-continue-button.tsx"), "utf8");
    const login = readFileSync(join(ROOT, "components/auth/login-form.tsx"), "utf8");
    const register = readFileSync(join(ROOT, "components/auth/register-form.tsx"), "utf8");
    const callback = readFileSync(join(ROOT, "app/auth/callback/route.ts"), "utf8");
    expect(button).toContain('provider: "google"');
    expect(button).toContain("signInWithOAuth");
    expect(button).toContain("buildAuthCallbackRedirectTo");
    expect(button).toContain("skipBrowserRedirect: true");
    expect(button).toContain("copy.cta");
    expect(AUTH_SEN.google.cta).toBe("Google ile Devam Et");
    expect(login).toContain("GoogleContinueButton");
    expect(login).toContain("signInWithPassword");
    expect(register).toContain("GoogleContinueButton");
    expect(register).toContain("AUTH_REGISTER_API_PATH");
    expect(register).not.toContain("createSupabaseBrowserClient");
    expect(callback).toContain("exchangeCodeForSession");
    expect(callback).toContain("resolveAuthCallbackNext");
    expect(callback).toContain("googleOauthCallbackReason");
  });

  it("Google mühürü e-posta kaydını gevşetmez ve kasa rıza sürümünü taşır", () => {
    const sql = readFileSync(
      join(ROOT, "supabase/migrations/20261114043000_google_oauth_signup_consent.sql"),
      "utf8",
    );
    expect(sql).toContain("raw_app_meta_data->>'provider', '') = 'google'");
    expect(sql).toContain("accounts.google.com");
    expect(sql).toContain(CHECKOUT_LEGAL_CONSENT_VERSION);
    expect(sql).toContain("18 yaş onayı yok");
    expect(sql).toContain("kullanım/KVKK rızası yok");
    expect(sql).toContain("BEFORE INSERT ON auth.users");
    expect(sql).toContain("INSERT INTO public.wallets");
    expect(sql).toContain("'TRY'");
  });
});
