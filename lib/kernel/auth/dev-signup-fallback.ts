import "server-only";

import { AUTH_REGISTER_API_PATH } from "@/lib/kernel/auth/redirects";
import { getPrisma, prismaErrorLabel } from "@/lib/kernel/db";
import type { SignupAuthMetadata } from "@/lib/kernel/auth/signup-metadata";
import { logEvent } from "@/lib/kernel/observability/log";

type ProvisionResult = { ok: true; userId: string } | { ok: false; error: string };

/**
 * GoTrue Confirm Email + Auth SMTP 500'ünde onaylı hesap.
 * Geliştirme ve üretim aynı kapı: doğrulama postası gidemezse kayıt düşmez.
 * Var olan satırda yalnız `email_confirmed_at` dolar; şifre ezilmez.
 * Yoksa auth.users INSERT `handle_new_user` tetikler (users + TRY wallet).
 * Doğrulama postası gitmezse hesap onaylıdır; kayıt rotası oturumu signIn ile basar.
 */
export async function provisionConfirmedAuthUser(input: {
  email: string;
  password: string;
  metadata: SignupAuthMetadata;
}): Promise<ProvisionResult> {
  const prisma = getPrisma();
  const appMeta = JSON.stringify({ provider: "email", providers: ["email"] });
  const userMeta = JSON.stringify(input.metadata);
  try {
    const existing = await prisma.$queryRaw<{ user_id: string }[]>`
      UPDATE auth.users
      SET
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
      WHERE lower(email) = lower(${input.email})
      RETURNING id::text AS user_id
    `;
    if (existing[0]?.user_id) {
      return { ok: true, userId: existing[0].user_id };
    }
    const rows = await prisma.$queryRaw<{ user_id: string }[]>`
      WITH created AS (
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at,
          confirmation_token,
          email_change,
          email_change_token_new,
          recovery_token
        )
        VALUES (
          '00000000-0000-0000-0000-000000000000'::uuid,
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          ${input.email},
          extensions.crypt(${input.password}, extensions.gen_salt('bf', 10)),
          NOW(),
          ${appMeta}::jsonb,
          ${userMeta}::jsonb,
          NOW(),
          NOW(),
          '',
          '',
          '',
          ''
        )
        RETURNING id, email
      )
      INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      )
      SELECT
        gen_random_uuid(),
        created.id,
        created.id::text,
        jsonb_build_object(
          'sub', created.id::text,
          'email', created.email,
          'email_verified', true
        ),
        'email',
        NOW(),
        NOW(),
        NOW()
      FROM created
      RETURNING user_id::text AS user_id
    `;
    if (!rows[0]?.user_id) {
      return { ok: false, error: "provision_empty" };
    }
    return { ok: true, userId: rows[0].user_id };
  } catch (error) {
    logEvent({
      level: "error",
      event: "auth.register",
      reason: "provision_failed",
      errorName: prismaErrorLabel(error),
      route: AUTH_REGISTER_API_PATH,
    });
    return { ok: false, error: "provision_failed" };
  }
}
