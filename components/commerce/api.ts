"use client";

import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export async function commerceMutate<T extends Record<string, unknown>>(
  url: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: Record<string, unknown>,
  idempotent = false,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const headers = new Headers();
  if (body) {
    headers.set("content-type", "application/json");
  }
  if (idempotent) {
    headers.set("Idempotency-Key", crypto.randomUUID());
  }
  try {
    const response = await fetch(
      url,
      withRailApiVersion({
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      }),
    );
    const parsed = parseRailClientJson<T>(await response.json().catch(() => null));
    if (!parsed.ok) {
      return { ok: false, error: parsed.error };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, error: SEN_VOICE.magazam.network };
  }
}
