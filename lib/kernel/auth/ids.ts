export type SessionUser = {
  id: string;
  email: string;
};

/** Vatandaş JWT — Storage imzalı PUT/GET. `service_role` değildir. */
export type CitizenAuth = SessionUser & {
  accessToken: string;
};

/** Faz 1.1 — Supabase Auth UUID. Prisma kimlik üretmez. */
export function isSupabaseUserId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}
