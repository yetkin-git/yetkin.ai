import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
import { CITIZEN_PASSWORD_MIN_LENGTH } from "@/lib/kernel/auth/password";
import { buildSignupEmailRedirectTo } from "@/lib/kernel/auth/redirects";
import type { AuthMailStatus } from "@/lib/kernel/auth/auth-mail-config";
import {
  classifySignupAuthError,
  isSignupConfirmationEmailFailure,
  resolveSignupAuthError,
} from "@/lib/kernel/auth/signup-errors";
import {
  buildSignupAuthMetadata,
  isDuplicateSignupUser,
  type SignupAuthMetadata,
} from "@/lib/kernel/auth/signup-metadata";

const EMAIL_MAX = 320;
const PASSWORD_MAX = 256;

export type RegisterCitizenInput = {
  email: string;
  password: string;
  fullName: string;
  ageConfirmed: boolean;
  termsConfirmed: boolean;
};

export type RegisterCitizenOk = {
  ok: true;
  created: true;
  /** Doğrulama linki zorunlu değilse true: tarayıcı oturumu açıktır. */
  session: boolean;
  fallback: boolean;
  /** Yalnız posta gerçekten gidince true. Gönderilmediyse arayüz "gönderildi" demez. */
  pendingVerification: boolean;
  mail: AuthMailStatus;
};

export type RegisterCitizenFail = {
  ok: false;
  status: 400 | 409 | 503;
  error: string;
  reason: "validation" | "duplicate" | "auth" | "unconfigured" | "fallback";
  errorName?: string;
};

export type RegisterCitizenResult = RegisterCitizenOk | RegisterCitizenFail;

export type RegisterSignUpResult = {
  user: { id?: string; identities?: unknown[] | null } | null;
  session: { access_token?: string } | null;
  error: { message: string; name?: string; status?: number } | null;
};

export type RegisterCitizenAuthPort = {
  signUp: (input: {
    email: string;
    password: string;
    metadata: SignupAuthMetadata;
    emailRedirectTo: string;
  }) => Promise<RegisterSignUpResult>;
  /** Onaylı hesapta doğrulama beklemesi yoksa şifreyle oturum açar. */
  signIn?: (input: { email: string; password: string }) => Promise<{ ok: boolean }>;
};

export type RegisterCitizenFallbackPort = (input: {
  email: string;
  password: string;
  metadata: SignupAuthMetadata;
}) => Promise<{ ok: true; userId?: string } | { ok: false; error: string }>;

export type RegisterCitizenClearOrphansPort = (
  email: string,
) => Promise<{ ok: true } | { ok: false; errorName: string }>;

export type RegisterCitizenUpsertProfilePort = (input: {
  userId: string;
  email: string;
  displayName: string | null;
}) => Promise<{ ok: true } | { ok: false; errorName: string }>;

export type RegisterCitizenMailPort = (input: {
  email: string;
  emailRedirectTo: string;
  signupAccepted: boolean;
}) => Promise<AuthMailStatus>;

/**
 * Auth SMTP doğrulama postası gidemezse hesap onaylı açılır.
 * `NODE_ENV` kapısı yoktur: canlı Confirm Email açık ve SMTP bağlı değilken kayıt tamamlanır.
 */
export function isSignupSmtpFallbackEnabled(): boolean {
  return true;
}

/** Eski ad. Üretim dahil SMTP yedeği açıktır. */
export function isDevSignupFallbackEnabled(_env: NodeJS.ProcessEnv = process.env): boolean {
  return isSignupSmtpFallbackEnabled();
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isEmailShape(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function registerCitizen(input: RegisterCitizenInput, origin: string): RegisterCitizenFail | {
  ok: true;
  email: string;
  password: string;
  metadata: SignupAuthMetadata;
  emailRedirectTo: string;
} {
  const email = normalizeEmail(input.email);
  const password = input.password;
  if (!email || email.length > EMAIL_MAX || !isEmailShape(email)) {
    return { ok: false, status: 400, error: AUTH_SEN.register.fail, reason: "validation" };
  }
  if (password.length < CITIZEN_PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX) {
    return { ok: false, status: 400, error: AUTH_SEN.register.fail, reason: "validation" };
  }
  const metadata = buildSignupAuthMetadata(input.fullName, input.ageConfirmed, input.termsConfirmed);
  if (!metadata) {
    if (!input.termsConfirmed) {
      return { ok: false, status: 400, error: AUTH_SEN.register.termsRequired, reason: "validation" };
    }
    return {
      ok: false,
      status: 400,
      error: input.ageConfirmed ? AUTH_SEN.register.fullNameInvalid : AUTH_SEN.register.ageRequired,
      reason: "validation",
    };
  }
  return {
    ok: true,
    email,
    password,
    metadata,
    emailRedirectTo: buildSignupEmailRedirectTo(origin),
  };
}

async function resolveMail(
  deliverMail: RegisterCitizenMailPort | undefined,
  email: string,
  emailRedirectTo: string,
  signupAccepted: boolean,
): Promise<AuthMailStatus> {
  if (!deliverMail) {
    return "unconfigured";
  }
  try {
    return await deliverMail({ email, emailRedirectTo, signupAccepted });
  } catch {
    return "failed";
  }
}

async function openAutoSession(
  auth: RegisterCitizenAuthPort,
  email: string,
  password: string,
): Promise<boolean> {
  if (!auth.signIn) {
    return false;
  }
  const signed = await auth.signIn({ email, password });
  return signed.ok;
}

async function upsertRegisteredProfile(
  upsertProfile: RegisterCitizenUpsertProfilePort | undefined,
  userId: string | undefined,
  email: string,
  displayName: string | null,
): Promise<void> {
  if (!upsertProfile || !userId) {
    return;
  }
  await upsertProfile({ userId, email, displayName });
}

export async function executeCitizenRegister(input: {
  prepared: Exclude<ReturnType<typeof registerCitizen>, RegisterCitizenFail>;
  auth: RegisterCitizenAuthPort;
  fallback?: RegisterCitizenFallbackPort;
  clearOrphans?: RegisterCitizenClearOrphansPort;
  upsertProfile?: RegisterCitizenUpsertProfilePort;
  deliverMail?: RegisterCitizenMailPort;
  env?: NodeJS.ProcessEnv;
}): Promise<RegisterCitizenResult> {
  const { prepared, auth } = input;
  if (input.clearOrphans) {
    const cleared = await input.clearOrphans(prepared.email);
    if (!cleared.ok) {
      return {
        ok: false,
        status: 400,
        error: AUTH_SEN.register.database,
        reason: "auth",
        errorName: cleared.errorName,
      };
    }
  }
  const signed = await auth.signUp({
    email: prepared.email,
    password: prepared.password,
    metadata: prepared.metadata,
    emailRedirectTo: prepared.emailRedirectTo,
  });
  if (signed.error) {
    const mapped = resolveSignupAuthError(signed.error.message);
    const errorName = classifySignupAuthError(signed.error.message);
    if (
      isSignupConfirmationEmailFailure(signed.error.message) &&
      isSignupSmtpFallbackEnabled() &&
      input.fallback
    ) {
      const provisioned = await input.fallback({
        email: prepared.email,
        password: prepared.password,
        metadata: prepared.metadata,
      });
      if (!provisioned.ok) {
        return {
          ok: false,
          status: 503,
          error: mapped,
          reason: "fallback",
          errorName: "provision_failed",
        };
      }
      await upsertRegisteredProfile(
        input.upsertProfile,
        provisioned.userId,
        prepared.email,
        prepared.metadata.display_name,
      );
      const mail = await resolveMail(input.deliverMail, prepared.email, prepared.emailRedirectTo, false);
      const session =
        mail === "sent" ? false : await openAutoSession(auth, prepared.email, prepared.password);
      return {
        ok: true,
        created: true,
        session,
        fallback: true,
        pendingVerification: mail === "sent",
        mail,
      };
    }
    const duplicate = isDuplicateSignupUser(signed.user) || mapped === AUTH_SEN.register.duplicate;
    return {
      ok: false,
      status: duplicate ? 409 : 400,
      error: mapped,
      reason: duplicate ? "duplicate" : "auth",
      errorName: duplicate ? "duplicate" : errorName,
    };
  }
  if (isDuplicateSignupUser(signed.user)) {
    return {
      ok: false,
      status: 409,
      error: AUTH_SEN.register.duplicate,
      reason: "duplicate",
      errorName: "duplicate",
    };
  }
  await upsertRegisteredProfile(
    input.upsertProfile,
    signed.user?.id,
    prepared.email,
    prepared.metadata.display_name,
  );
  const mail = await resolveMail(input.deliverMail, prepared.email, prepared.emailRedirectTo, true);
  if (signed.session) {
    return {
      ok: true,
      created: true,
      session: true,
      fallback: false,
      pendingVerification: false,
      mail,
    };
  }
  return {
    ok: true,
    created: true,
    session: false,
    fallback: false,
    pendingVerification: mail === "sent",
    mail,
  };
}
