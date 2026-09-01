import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CITIZEN_PASSWORD_MIN_LENGTH,
  GENERATED_PASSWORD_LENGTH,
  generateSecurePassword,
  isGeneratedPasswordShape,
  PASSWORD_RECOVERY_PATH,
  PASSWORD_RESET_PATH,
} from "@/lib/kernel/auth/password";
import {
  AUTH_CALLBACK_PATH,
  buildPasswordResetRedirectTo,
  buildSignupEmailRedirectTo,
} from "@/lib/kernel/auth/redirects";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("vatandaş kimlik UX yüzeyi", () => {
  it("üretilen şifre CSPRNG, 16 karakter ve dört sınıf taşır", () => {
    expect(CITIZEN_PASSWORD_MIN_LENGTH).toBe(8);
    expect(GENERATED_PASSWORD_LENGTH).toBe(16);
    const samples = Array.from({ length: 80 }, () => generateSecurePassword());
    for (const sample of samples) {
      expect(sample).toHaveLength(GENERATED_PASSWORD_LENGTH);
      expect(isGeneratedPasswordShape(sample)).toBe(true);
      expect(sample).not.toMatch(/[IlO01]/);
    }
    expect(new Set(samples).size).toBe(samples.length);
    const source = readSrc("lib/kernel/auth/password.ts");
    expect(source).toContain("crypto.getRandomValues");
    expect(source).not.toContain("Math.random");
  });

  it("şifre sıfırlama yönü /auth/callback üzerinden /sifre-yenile'ye düşer", () => {
    expect(PASSWORD_RESET_PATH).toBe("/sifremi-unuttum");
    expect(PASSWORD_RECOVERY_PATH).toBe("/sifre-yenile");
    expect(AUTH_CALLBACK_PATH).toBe("/auth/callback");
    expect(buildPasswordResetRedirectTo("http://localhost:3000")).toBe(
      "http://localhost:3000/auth/callback?next=%2Fsifre-yenile",
    );
    expect(buildPasswordResetRedirectTo("https://rail.example/")).toBe(
      "https://rail.example/auth/callback?next=%2Fsifre-yenile",
    );
    expect(buildSignupEmailRedirectTo("https://rail.example")).toBe(
      "https://rail.example/auth/callback?next=%2Fdashboard",
    );
  });

  it("giriş formu göz ikonu ve Şifremi Unuttum bağlantısı taşır", () => {
    const form = readSrc("components/auth/login-form.tsx");
    const field = readSrc("components/auth/password-input.tsx");
    expect(form).toContain("PasswordInput");
    expect(form).toContain("PASSWORD_RESET_PATH");
    expect(form).toContain("AUTH_SEN");
    expect(form).toContain("signInWithPassword");
    expect(form).toContain("readPostLoginPathFromSearch");
    expect(form).toContain("window.location.search");
    expect(form).toContain("window.location.assign(");
    expect(form).not.toContain("router.push");
    expect(form).not.toContain("router.refresh");
    expect(readSrc("app/(auth)/login/page.tsx")).toContain("searchParams");
    expect(readSrc("app/(auth)/login/page.tsx")).toContain("nextPath");
    expect(readSrc("app/(auth)/login/page.tsx")).toContain("readPostLoginPathFromSearch");
    expect(readSrc("app/(auth)/login/page.tsx")).toContain("LoginForm");
    expect(readSrc("app/(auth)/login/page.tsx")).not.toContain("isSupabaseConfigured");
    expect(readSrc("app/(auth)/login/page.tsx")).not.toContain("copy.unbound");
    expect(form).toContain("createSupabaseBrowserClient");
    expect(form).toContain("describePublicSupabaseBrowserEnv");
    expect(form).toContain("console.log");
    expect(form).toContain("console.error");
    expect(form).toContain("} finally {");
    expect(form).toContain("setPending(false)");
    expect(form).toContain('role="alert"');
    expect(form).toContain("data-testid=\"login-error\"");
    expect(readSrc("lib/copy/sen-voice/auth.ts")).toContain("Tarayıcı kimlik istemcisi yapılandırılmadı");
    expect(readSrc("lib/copy/sen-voice/auth.ts")).toContain("Şifremi Unuttum?");
    expect(field).toContain('type={revealed ? "text" : "password"}');
    expect(field).toContain("IconEye");
    expect(field).toContain("IconEyeOff");
    expect(field).toContain("Şifreyi göster");
    expect(field).toContain("Şifreyi gizle");
  });

  it("kayıt formu güvenli şifre üretir ve kopyalandı bildirimi sunar", () => {
    const form = readSrc("components/auth/register-form.tsx");
    const copy = readSrc("lib/copy/sen-voice/auth.ts");
    const page = readSrc("app/(auth)/register/page.tsx");
    expect(form).toContain("generateSecurePassword");
    expect(form).toContain("AUTH_SEN");
    expect(copy).toContain("Güvenli Şifre Üret");
    expect(copy).toContain("Kopyalandı");
    expect(copy).toContain("Ad soyad");
    expect(form).toContain("copyTextToClipboard");
    expect(form).toContain("PasswordInput");
    expect(form).toContain("CITIZEN_PASSWORD_MIN_LENGTH");
    expect(form).toContain("emailRedirectTo");
    expect(form).toContain("buildSignupEmailRedirectTo");
    expect(form).toContain("buildSignupAuthMetadata");
    expect(form).toContain("readPostLoginPathFromSearch");
    expect(form).toContain("window.location.assign(");
    expect(form).toContain("ageConfirmed");
    expect(form).toContain("register-age-confirm");
    expect(copy).toContain("18 yaşından büyüğüm");
    expect(form).not.toContain("router.push");
    expect(page).toContain("RegisterForm");
    expect(page).toContain("searchParams");
    expect(page).toContain("nextPath");
    expect(page).not.toContain("isSupabaseConfigured");
    expect(page).not.toContain("copy.unbound");
    expect(readSrc("lib/kernel/auth/signup-metadata.ts")).toContain("display_name");
    expect(readSrc("lib/kernel/auth/signup-metadata.ts")).toContain("full_name");
  });

  it("şifremi unuttum sayfası resetPasswordForEmail bağlar; dürüst metin hesap sızdırmaz", () => {
    const page = readSrc("app/(auth)/sifremi-unuttum/page.tsx");
    const form = readSrc("components/auth/forgot-password-form.tsx");
    const recovery = readSrc("app/(auth)/sifre-yenile/page.tsx");
    const copy = readSrc("lib/copy/sen-voice/auth.ts");
    expect(page).toContain("ForgotPasswordForm");
    expect(page).toContain("isSupabaseConfigured");
    expect(page).toContain("SEN_VOICE");
    expect(form).toContain("resetPasswordForEmail");
    expect(form).toContain("buildPasswordResetRedirectTo");
    expect(form).toContain("AUTH_SEN");
    expect(copy).toContain("hesap varlığını burada doğrulamayız");
    expect(copy).toContain("spam");
    expect(copy).toContain("Şifremi Unuttum");
    expect(recovery).toContain("ResetPasswordForm");
    expect(copy).toContain("Şifre Yenile");
  });
});
