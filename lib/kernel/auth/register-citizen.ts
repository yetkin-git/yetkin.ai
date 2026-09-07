import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
import { CITIZEN_PASSWORD_MIN_LENGTH } from "@/lib/kernel/auth/password";
import { buildSignupEmailRedirectTo } from "@/lib/kernel/auth/redirects";
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
  session: boolean;
  fallback: boolean;
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
  signInWithPassword: (input: {
    email: string;
    password: string;
  }) => Promise<{ session: { access_token?: string } | null; error: { message: string } | null }>;
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

export function isDevSignupFallbackEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV !== "production";
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
  env?: NodeJS.ProcessEnv;
}): Promise<RegisterCitizenResult> {
  const { prepared, auth } = input;
  const env = input.env ?? process.env;
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
      isDevSignupFallbackEnabled(env) &&
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
      const signedIn = await auth.signInWithPassword({
        email: prepared.email,
        password: prepared.password,
      });
      if (signedIn.error || !signedIn.session) {
        return {
          ok: true,
          created: true,
          session: false,
          fallback: true,
        };
      }
      return { ok: true, created: true, session: true, fallback: true };
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
  return {
    ok: true,
    created: true,
    session: Boolean(signed.session),
    fallback: false,
  };
}
