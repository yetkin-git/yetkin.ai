import { describe, expect, it } from "vitest";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
import {
  executeCitizenRegister,
  isDevSignupFallbackEnabled,
  registerCitizen,
} from "@/lib/kernel/auth/register-citizen";
import {
  classifySignupAuthError,
  resolveSignupAuthError,
} from "@/lib/kernel/auth/signup-errors";
import { buildSignupAuthMetadata } from "@/lib/kernel/auth/signup-metadata";

describe("kayıt Auth hata metni", () => {
  it("İngilizce Auth mesajını yutmaz; SMTP ve tetikleyiciyi Türkçe basar", () => {
    expect(resolveSignupAuthError("Error sending confirmation email")).toBe(
      AUTH_SEN.register.confirmEmail,
    );
    expect(resolveSignupAuthError("Database error saving new user")).toBe(
      AUTH_SEN.register.database,
    );
    expect(
      resolveSignupAuthError(
        "handle_new_user: public.users e-posta unique kısıtı (users_email_key).",
      ),
    ).toBe(AUTH_SEN.register.database);
    expect(classifySignupAuthError("Database error saving new user")).toBe("database_trigger");
    expect(
      classifySignupAuthError(
        "handle_new_user: public.users e-posta unique kısıtı (users_email_key).",
      ),
    ).toBe("users_email_unique");
    expect(resolveSignupAuthError("User already registered")).toBe(AUTH_SEN.register.duplicate);
    expect(resolveSignupAuthError("Password is known to be leaked and is not allowed.")).toBe(
      "Password is known to be leaked and is not allowed.",
    );
    expect(resolveSignupAuthError("")).toBe(AUTH_SEN.register.fail);
  });
});

describe("kayıt vatandaş motoru", () => {
  it("rıza yoksa signUp gitmez", () => {
    const denied = registerCitizen(
      {
        email: "ayse@example.com",
        password: "rail-test-8",
        fullName: "Ayşe Kaya",
        ageConfirmed: true,
        termsConfirmed: false,
      },
      "http://localhost:3000",
    );
    expect(denied.ok).toBe(false);
    if (!denied.ok) {
      expect(denied.error).toBe(AUTH_SEN.register.termsRequired);
    }
  });

  it("SMTP 500'ünde geliştirme yedeği hesabı açar", async () => {
    const prepared = registerCitizen(
      {
        email: "  Vision@Example.COM ",
        password: "rail-test-8",
        fullName: "Yetkin Vision",
        ageConfirmed: true,
        termsConfirmed: true,
      },
      "http://localhost:3000",
    );
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) {
      return;
    }
    expect(prepared.email).toBe("vision@example.com");
    expect(prepared.metadata).toEqual(
      buildSignupAuthMetadata("Yetkin Vision", true, true, new Date(prepared.metadata.age_confirmed_at)),
    );

    const result = await executeCitizenRegister({
      prepared,
      env: { NODE_ENV: "development" },
      auth: {
        async signUp() {
          return {
            user: null,
            session: null,
            error: { message: "Error sending confirmation email", status: 500 },
          };
        },
        async signInWithPassword() {
          return { session: { access_token: "tok" }, error: null };
        },
      },
      async fallback() {
        return { ok: true };
      },
    });
    expect(result).toEqual({ ok: true, created: true, session: true, fallback: true });
  });

  it("üretimde SMTP yedeği kapalıdır; Auth mesajı istemciye gider", async () => {
    expect(isDevSignupFallbackEnabled({ NODE_ENV: "production" })).toBe(false);
    const prepared = registerCitizen(
      {
        email: "vision@example.com",
        password: "rail-test-8",
        fullName: "Yetkin Vision",
        ageConfirmed: true,
        termsConfirmed: true,
      },
      "https://yetkin.ai",
    );
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) {
      return;
    }
    const result = await executeCitizenRegister({
      prepared,
      env: { NODE_ENV: "production" },
      auth: {
        async signUp() {
          return {
            user: null,
            session: null,
            error: { message: "Error sending confirmation email", status: 500 },
          };
        },
        async signInWithPassword() {
          return { session: null, error: { message: "unused" } };
        },
      },
      async fallback() {
        throw new Error("üretim yedeği çağrılmamalı");
      },
    });
    expect(result).toEqual({
      ok: false,
      status: 400,
      error: AUTH_SEN.register.confirmEmail,
      reason: "auth",
      errorName: "smtp",
    });
  });

  it("kayıt öncesi yetimi temizler, sonra kullanıcı ve cüzdan UPSERT eder", async () => {
    const prepared = registerCitizen(
      {
        email: "vision@example.com",
        password: "rail-test-8",
        fullName: "Yetkin Vision",
        ageConfirmed: true,
        termsConfirmed: true,
      },
      "http://localhost:3000",
    );
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) {
      return;
    }
    const calls: string[] = [];
    const result = await executeCitizenRegister({
      prepared,
      env: { NODE_ENV: "development" },
      async clearOrphans(email) {
        calls.push(`clear:${email}`);
        return { ok: true };
      },
      async upsertProfile(input) {
        calls.push(`upsert:${input.userId}:${input.email}`);
        return { ok: true };
      },
      auth: {
        async signUp() {
          calls.push("signUp");
          return {
            user: { id: "11111111-1111-4111-8111-111111111111", identities: [{ provider: "email" }] },
            session: { access_token: "tok" },
            error: null,
          };
        },
        async signInWithPassword() {
          throw new Error("signIn çağrılmamalı");
        },
      },
    });
    expect(calls).toEqual([
      "clear:vision@example.com",
      "signUp",
      "upsert:11111111-1111-4111-8111-111111111111:vision@example.com",
    ]);
    expect(result).toEqual({ ok: true, created: true, session: true, fallback: false });
  });

  it("yetim temizliği düşerse signUp gitmez", async () => {
    const prepared = registerCitizen(
      {
        email: "vision@example.com",
        password: "rail-test-8",
        fullName: "Yetkin Vision",
        ageConfirmed: true,
        termsConfirmed: true,
      },
      "http://localhost:3000",
    );
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) {
      return;
    }
    let signed = false;
    const result = await executeCitizenRegister({
      prepared,
      async clearOrphans() {
        return { ok: false, errorName: "ledger_restrict" };
      },
      auth: {
        async signUp() {
          signed = true;
          return { user: null, session: null, error: null };
        },
        async signInWithPassword() {
          return { session: null, error: null };
        },
      },
    });
    expect(signed).toBe(false);
    expect(result).toEqual({
      ok: false,
      status: 400,
      error: AUTH_SEN.register.database,
      reason: "auth",
      errorName: "ledger_restrict",
    });
  });
});
