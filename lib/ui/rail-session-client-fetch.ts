"use client";

/**
 * Amiral istemci — çerez + isteğe bağlı Bearer.
 * Kenar JWT çerezden okuyamazsa tarayıcı oturum jetonu Authorization ile geçer.
 */
import { createSupabaseBrowserClient } from "@/lib/kernel/auth/supabase-browser";
import { railClientHeaders, withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export async function withRailSession(init?: RequestInit): Promise<RequestInit> {
  const base = withRailApiVersion({
    credentials: "same-origin",
    ...init,
  });
  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token?.trim();
    if (!token) {
      return base;
    }
    const headers = railClientHeaders(base.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return { ...base, headers };
  } catch {
    return base;
  }
}
