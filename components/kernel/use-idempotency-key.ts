"use client";

import { useRef } from "react";
import {
  createClientIdempotencyKey,
  IDEMPOTENCY_KEY_HEADER,
} from "@/lib/kernel/http/idempotency-key";

/** Aynı niyet (çift tıklama / retry) aynı UUID'yi taşır. rotate senkron kalır. */
export function useIdempotencyKey() {
  const keyRef = useRef<string | null>(null);
  if (keyRef.current == null) {
    keyRef.current = createClientIdempotencyKey();
  }

  return {
    headers(): Record<string, string> {
      const key = keyRef.current;
      if (key == null) {
        throw new Error("Idempotency anahtarı yok.");
      }
      return { [IDEMPOTENCY_KEY_HEADER]: key };
    },
    rotate() {
      keyRef.current = createClientIdempotencyKey();
    },
  };
}
