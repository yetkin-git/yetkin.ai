import { isSupabaseUserId, type CitizenAuth, type SessionUser } from "@/lib/kernel/auth/ids";
import type { AuthCookieWriteOptions } from "@/lib/kernel/auth/cookie-options";
import { createSupabaseCookieClient } from "@/lib/kernel/auth/supabase-server";
import { isV1CookieSessionBlocked } from "@/lib/kernel/http/api-v1";

export class AuthRequiredError extends Error {
  readonly status = 401 as const;
  constructor(message = "Oturum gerekli.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

/** Auth UUID var, `public.users` satırı yok — handle_new_user / seed kaçmış. */
export const SESSION_USER_NOT_IN_DATABASE =
  "Oturumdaki hesap henüz veritabanında yok. Çıkış yapıp yeniden giriş yap.";

export function sessionUserNotInDatabaseMessage(
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (env.NODE_ENV === "production") {
    return SESSION_USER_NOT_IN_DATABASE;
  }
  return `${SESSION_USER_NOT_IN_DATABASE} Geliştirme: public.users satırı yok; handle_new_user tetikleyicisini veya seed'i kontrol et.`;
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

function parseCookieHeader(header: string | null | undefined): { name: string; value: string }[] {
  if (!header) {
    return [];
  }
  const cookies: { name: string; value: string }[] = [];
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const name = part.slice(0, separator).trim();
    if (!name) {
      continue;
    }
    cookies.push({ name, value: part.slice(separator + 1).trim() });
  }
  return cookies;
}

function mergeCookieLists(
  primary: ReadonlyArray<{ name: string; value: string }>,
  fallback: ReadonlyArray<{ name: string; value: string }>,
): { name: string; value: string }[] {
  if (fallback.length === 0) {
    return [...primary];
  }
  const byName = new Map<string, string>();
  for (const cookie of fallback) {
    byName.set(cookie.name, cookie.value);
  }
  for (const cookie of primary) {
    byName.set(cookie.name, cookie.value);
  }
  return [...byName.entries()].map(([name, value]) => ({ name, value }));
}

function requestUrlOf(request?: Request): URL | undefined {
  if (!request) {
    return undefined;
  }
  try {
    return new URL(request.url);
  } catch {
    return undefined;
  }
}

async function readIncomingCookies(request?: Request): Promise<{
  list: { name: string; value: string }[];
  setCookie: (name: string, value: string, options: AuthCookieWriteOptions) => void;
}> {
  const fromRequest = parseCookieHeader(request?.headers.get("cookie"));
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return {
      list: mergeCookieLists(cookieStore.getAll(), fromRequest),
      setCookie(name, value, options) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Server Component cookie yazamaz; oturum okuma yine de geçerlidir.
        }
      },
    };
  } catch {
    return {
      list: fromRequest,
      setCookie() {},
    };
  }
}

async function userFromCookies(
  url: string,
  anon: string,
  request?: Request,
): Promise<SessionUser | null> {
  const incoming = await readIncomingCookies(request);
  const supabase = createSupabaseCookieClient({
    url,
    anon,
    requestUrl: requestUrlOf(request),
    getAll() {
      return incoming.list;
    },
    setCookie: incoming.setCookie,
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

async function citizenFromCookies(
  url: string,
  anon: string,
  request?: Request,
): Promise<CitizenAuth | null> {
  const incoming = await readIncomingCookies(request);
  const supabase = createSupabaseCookieClient({
    url,
    anon,
    requestUrl: requestUrlOf(request),
    getAll() {
      return incoming.list;
    },
    setCookie: incoming.setCookie,
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
  if (request && isV1CookieSessionBlocked(request)) {
    return null;
  }
  return userFromCookies(url, anon, request);
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
  if (request && isV1CookieSessionBlocked(request)) {
    return null;
  }
  return citizenFromCookies(url, anon, request);
}

export async function requireCitizenAuth(request?: Request): Promise<CitizenAuth> {
  const auth = await getCitizenAuth(request);
  if (!auth) {
    throw new AuthRequiredError();
  }
  return auth;
}
