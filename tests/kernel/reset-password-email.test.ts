import { describe, expect, it } from "vitest";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
import {
  isPasswordResetEmailFailure,
  preparePasswordResetEmail,
  resolvePasswordResetAuthError,
} from "@/lib/kernel/auth/reset-password-email";

describe("şifre sıfırlama e-posta hatası", () => {
  it("geçersiz e-postayı Auth'a göndermez", () => {
    const denied = preparePasswordResetEmail("not-an-email", "http://localhost:3000");
    expect(denied.ok).toBe(false);
    if (!denied.ok) {
      expect(denied.error).toBe(AUTH_SEN.forgot.invalidEmail);
    }
  });

  it("SMTP 500'ü Türkçe servis kapalı metnine çevirir", () => {
    expect(isPasswordResetEmailFailure({ message: "Error sending recovery email", status: 500 })).toBe(
      true,
    );
    expect(resolvePasswordResetAuthError({ message: "smtp send failed", status: 500 })).toEqual({
      status: 503,
      error: AUTH_SEN.forgot.smtpDown,
      reason: "smtp",
    });
    expect(AUTH_SEN.forgot.smtpDown).toBe(
      "E-posta servisi şu an aktif değil, lütfen destek ile iletişime geçin",
    );
  });

  it("diğer Auth hatalarını hesap sızdırmadan jenerik basar", () => {
    expect(resolvePasswordResetAuthError({ message: "User not found", status: 400 })).toEqual({
      status: 400,
      error: AUTH_SEN.forgot.fail,
      reason: "auth",
    });
  });
});
