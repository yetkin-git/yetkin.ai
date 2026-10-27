"use client";

import { useEffect, useState } from "react";

export const ADMIN_CATALOG_FLASH_KEY = "yetkin-admin-catalog-flash";

export function rememberAdminCatalogFlash(message: string): void {
  sessionStorage.setItem(ADMIN_CATALOG_FLASH_KEY, message);
}

export function AdminCatalogFlash() {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const value = sessionStorage.getItem(ADMIN_CATALOG_FLASH_KEY);
    if (!value) {
      return;
    }
    sessionStorage.removeItem(ADMIN_CATALOG_FLASH_KEY);
    setText(value);
  }, []);
  if (!text) {
    return null;
  }
  return (
    <p
      role="status"
      data-admin-catalog-flash=""
      className="rounded-2xl border border-[var(--emerald)]/40 bg-[color-mix(in_srgb,var(--emerald)_10%,var(--surface))] px-4 py-3 text-sm font-medium text-[var(--foreground)]"
    >
      {text}
    </p>
  );
}
