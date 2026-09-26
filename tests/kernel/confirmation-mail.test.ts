import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { readAuthMailTransport } from "@/lib/kernel/auth/auth-mail-config";
import { buildSignupConfirmationEmail } from "@/lib/kernel/auth/confirmation-template";
import { buildSignupVerifyUrl } from "@/lib/kernel/auth/confirmation-mail";
import { verifyEmailHookSignature } from "@/lib/kernel/auth/email-hook-signature";

describe("auth doğrulama postası", () => {
  it("Resend HTTP, SMTP'den önce gelir; boşsa yapılandırılmamış döner", () => {
    expect(
      readAuthMailTransport({
        AUTH_RESEND_API_KEY: "re_test",
        AUTH_MAIL_FROM: "yetkin.ai <noreply@yetkin.ai>",
        AUTH_SMTP_HOST: "smtp.resend.com",
      })?.kind,
    ).toBe("resend");
    expect(
      readAuthMailTransport({
        AUTH_SMTP_HOST: "smtp.resend.com",
        AUTH_SMTP_PORT: "465",
        AUTH_SMTP_USER: "resend",
        AUTH_SMTP_PASS: "re_test",
        AUTH_MAIL_FROM: "yetkin.ai <noreply@yetkin.ai>",
      }),
    ).toMatchObject({ kind: "smtp", host: "smtp.resend.com", port: 465, user: "resend" });
    expect(readAuthMailTransport({})).toBeNull();
  });

  it("doğrulama şablonu vatandaş cümlesi ve bağlantı taşır", () => {
    const letter = buildSignupConfirmationEmail("https://yetkin.ai/auth/v1/verify?token=abc");
    expect(letter.subject).toContain("yetkin.ai");
    expect(letter.text).toContain("Hesabını açmak için bu bağlantıya tıkla.");
    expect(letter.html).toContain("E-postamı doğrula");
    expect(letter.html).not.toContain("muazzam");
  });

  it("kanca imzası sapınca reddeder", () => {
    const secret = `v1,whsec_${Buffer.from("rail-hook-secret").toString("base64")}`;
    const body = "{}";
    const id = "msg_1";
    const timestamp = "1700000000";
    const key = Buffer.from("rail-hook-secret");
    const signature = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
    expect(
      verifyEmailHookSignature({
        secret,
        body,
        id,
        timestamp,
        signature: `v1,${signature}`,
        nowSec: 1_700_000_000,
      }),
    ).toBe(true);
    expect(
      verifyEmailHookSignature({
        secret,
        body,
        id,
        timestamp,
        signature: "v1,nope",
        nowSec: 1_700_000_000,
      }),
    ).toBe(false);
  });

  it("doğrulama adresi token ve signup tipi taşır", () => {
    const url = buildSignupVerifyUrl({
      supabaseUrl: "https://example.supabase.co/",
      tokenHash: "hash",
      redirectTo: "https://yetkin.ai/auth/callback",
    });
    expect(url).toContain("/auth/v1/verify?");
    expect(url).toContain("type=signup");
    expect(url).toContain("token=hash");
  });
});
