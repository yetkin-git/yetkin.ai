import { isSupabaseUserId, type CitizenAuth, type SessionUser } from "@/lib/kernel/auth/ids";
import { createSupabaseCookieClient } from "@/lib/kernel/auth/supabase-server";
import { isV1JsonRequest } from "@/lib/kernel/http/api-v1";

export class AuthRequiredError extends Error {
  readonly status = 401 as const;
  constructor(message = "Oturum gerekli.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

function readBearerToken(request?: Request): string | null {
  if (!request) {
    return null;
  }
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token.trim();
}

async function userFromAccessToken(
  url: string,
  anon: string,
  accessToken: string,
): Promise<SessionUser | null> {
  const citizen = await citizenFromAccessToken(url, anon, accessToken);
  return citizen ? { id: citizen.id, email: citizen.email } : null;
}

async function citizenFromAccessToken(
  url: string,
  anon: string,
  accessToken: string,
): Promise<CitizenAuth | null> {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user?.id || !data.user.email) {
    return null;
  }
  if (!isSupabaseUserId(data.user.id)) {
    return null;
  }
  return { id: data.user.id, email: data.user.email, accessToken };
}

async function userFromCookies(url: string, anon: string): Promise<SessionUser | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const supabase = createSupabaseCookieClient({
    url,
    anon,
    getAll() {
      return cookieStore.getAll();
    },
    setCookie(name, value, options) {
      try {
        cookieStore.set(name, value, options);
      } catch {
        // Server Component cookie yazamaz; oturum okuma yine de geçerlidir.
      }
    },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id || !data.user.email) {
    return null;
  }
  if (!isSupabaseUserId(data.user.id)) {
    return null;
  }
  return { id: data.user.id, email: data.user.email };
}

async function citizenFromCookies(url: string, anon: string): Promise<CitizenAuth | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const supabase = createSupabaseCookieClient({
    url,
    anon,
    getAll() {
      return cookieStore.getAll();
    },
    setCookie(name, value, options) {
      try {
        cookieStore.set(name, value, options);
      } catch {
        // Server Component cookie yazamaz; oturum okuma yine de geçerlidir.
      }
    },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id || !data.user.email) {
    return null;
  }
  if (!isSupabaseUserId(data.user.id)) {
    return null;
  }
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token?.trim();
  if (!accessToken) {
    return null;
  }
  return { id: data.user.id, email: data.user.email, accessToken };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export async function getSession(request?: Request): Promise<SessionUser | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return null;
  }
  const bearer = readBearerToken(request);
  if (bearer) {
    return userFromAccessToken(url, anon, bearer);
  }
  if (request && isV1JsonRequest(request)) {
    return null;
  }
  return userFromCookies(url, anon);
}

export async function requireSession(request?: Request): Promise<SessionUser> {
  const session = await getSession(request);
  if (!session) {
    throw new AuthRequiredError();
  }
  return session;
}

export async function getCitizenAuth(request?: Request): Promise<CitizenAuth | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return null;
  }
  const bearer = readBearerToken(request);
  if (bearer) {
    return citizenFromAccessToken(url, anon, bearer);
  }
  if (request && isV1JsonRequest(request)) {
    return null;
  }
  return citizenFromCookies(url, anon);
}

export async function requireCitizenAuth(request?: Request): Promise<CitizenAuth> {
  const auth = await getCitizenAuth(request);
  if (!auth) {
    throw new AuthRequiredError();
  }
  return auth;
}
