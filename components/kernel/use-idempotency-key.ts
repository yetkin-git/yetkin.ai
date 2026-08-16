"use client";

import { useRef } from "react";
import {
  createClientIdempotencyKey,
  IDEMPOTENCY_KEY_HEADER,
} from "@/lib/kernel/http/idempotency-key";

/** Aynı niyet (çift tıklama / retry) aynı UUID'yi taşır. */
export function useIdempotencyKey() {
  const keyRef = useRef<string>("");
  if (!keyRef.current) {
    keyRef.current = createClientIdempotencyKey();
  }

  return {
    headers(): Record<string, string> {
      return { [IDEMPOTENCY_KEY_HEADER]: keyRef.current };
    },
    rotate() {
      keyRef.current = createClientIdempotencyKey();
    },
  };
}
