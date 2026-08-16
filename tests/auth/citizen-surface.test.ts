import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SIZ_LEAKS = [
  "hesabınız",
  "cüzdanınız",
  "hoş geldiniz",
  "Hoş geldiniz",
  "Kimliğiniz",
  "hesabınıza",
  "yapabilirsiniz",
  "kutunuzu",
  "e-postanıza",
  "kopyalayın",
  "unutmayın",
];

const SEN_SURFACES = [
  "app/(auth)/login/page.tsx",
  "app/(auth)/register/page.tsx",
  "app/(auth)/sifremi-unuttum/page.tsx",
  "app/(auth)/sifre-yenile/page.tsx",
  "components/auth/login-form.tsx",
  "components/auth/register-form.tsx",
  "components/auth/forgot-password-form.tsx",
  "components/auth/reset-password-form.tsx",
  "lib/copy/sen-voice/auth.ts",
];

describe("kimlik yüzeyi SEN aksı", () => {
  it("auth loading.tsx iskeleti izomorftur (CLS)", () => {
    const files = ["app/(auth)/loading.tsx", "components/auth/auth-page-skeleton.tsx"];
    for (const file of files) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
    expect(readSrc("app/(auth)/loading.tsx")).toContain("AuthPageSkeleton");
    expect(readSrc("app/(auth)/loading.tsx")).not.toContain("use client");
    expect(readSrc("components/auth/auth-page-skeleton.tsx")).not.toContain("use client");
    expect(readSrc("components/auth/auth-page-skeleton.tsx")).toContain("min-h-screen");
    expect(readSrc("components/auth/auth-page-skeleton.tsx")).toContain("max-w-md");
  });

  it("giriş/kayıt/şifre siz kaçakları taşımaz; SEN_VOICE bağlar", () => {
    expect(SEN_VOICE.auth.login.description).toContain("Kimliğin hesabına");
    expect(SEN_VOICE.auth.register.description).toContain("cüzdanın");
    expect(SEN_VOICE.auth.register.description).not.toContain("cüzdanınız");
    expect(SEN_VOICE.auth.forgot.sent).toContain("hesap varlığını burada doğrulamayız");
    expect(SEN_VOICE.auth.reset.success).toBe("Şifre güncellendi. Şimdi giriş yap.");

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("app/(auth)/login/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/(auth)/register/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("components/auth/login-form.tsx")).toContain("AUTH_SEN");
    expect(readSrc("components/auth/register-form.tsx")).toContain("AUTH_SEN");
  });
});
