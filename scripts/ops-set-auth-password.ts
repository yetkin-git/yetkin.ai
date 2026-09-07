#!/usr/bin/env tsx
/**
 * GoTrue Admin API ile şifre yazar — Postgres `encrypted_password` dokunulmaz.
 *
 *   npx tsx scripts/ops-set-auth-password.ts --email=user@example.com --password='…'
 *   npx tsx scripts/ops-set-auth-password.ts --email=user@example.com --password='…' --service-role=…
 *
 * `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` .env.local'den veya `--service-role=` ile.
 * Şifre loglanmaz. email_confirm korunur. Anon key ile giriş doğrulanır.
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:set-auth-password BAŞARISIZ: ${message}`);
  process.exit(1);
}

function readArg(name: string): string | null {
  const prefix = `--${name}=`;
  const hit = process.argv.find((item) => item.startsWith(prefix));
  if (!hit) {
    return null;
  }
  return hit.slice(prefix.length);
}

type AuthAdminLister = {
  auth: {
    admin: {
      listUsers: (opts: { page: number; perPage: number }) => Promise<{
        data: { users: Array<{ id?: string; email?: string | null }> };
        error: { message: string } | null;
      }>;
    };
  };
};

async function findAuthUserIdByEmail(
  admin: AuthAdminLister,
  email: string,
): Promise<string | null> {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      fail(`kullanıcı listesi: ${error.message}`);
    }
    const hit = data.users.find((user) => user.email?.trim().toLowerCase() === email);
    if (hit?.id) {
      return hit.id;
    }
    if (data.users.length < 200) {
      return null;
    }
  }
  return null;
}

async function main(): Promise<void> {
  const email = readArg("email")?.trim().toLowerCase() ?? "";
  const password = readArg("password") ?? "";
  if (!email || !email.includes("@")) {
    fail("--email= gerekli.");
  }
  if (password.length < 8) {
    fail("--password= en az 8 karakter.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const service =
    readArg("service-role")?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    "";
  if (!url) {
    fail("NEXT_PUBLIC_SUPABASE_URL boş.");
  }
  if (!service) {
    fail(
      "SUPABASE_SERVICE_ROLE_KEY boş. Dashboard → Settings → API → service_role değerini --service-role= ile ver veya .env.local'e yaz (git'e koyma).",
    );
  }
  if (!anon) {
    fail("NEXT_PUBLIC_SUPABASE_ANON_KEY boş; giriş doğrulanamaz.");
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const userId = await findAuthUserIdByEmail(admin, email);
  if (!userId) {
    fail(`${email} Auth'ta yok.`);
  }

  const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  });
  if (updateError) {
    fail(`updateUserById: ${updateError.message}`);
  }

  const confirmed = Boolean(updated.user.email_confirmed_at);
  console.log(
    JSON.stringify({
      ok: true,
      userId,
      email: updated.user.email ?? email,
      emailConfirmed: confirmed,
    }),
  );

  const citizen = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: session, error: signError } = await citizen.auth.signInWithPassword({
    email,
    password,
  });
  if (signError || !session.session?.access_token) {
    fail(`şifre yazıldı ama giriş doğrulanamadı: ${signError?.message ?? "oturum yok"}`);
  }
  console.log(
    JSON.stringify({
      ok: true,
      verified: true,
      userId: session.user.id,
    }),
  );
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : "bilinmeyen hata");
});
