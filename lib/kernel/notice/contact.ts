import "server-only";

import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { getPrisma } from "@/lib/kernel/db";
import { resolvePlatformTreasuryUserId } from "@/lib/kernel/escrow/engine";

const MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isNoticeMailAddress(value: string): boolean {
  return MAIL_RE.test(value.trim());
}

export async function lookupCitizenEmail(userId: string): Promise<string | null> {
  const id = userId.trim();
  if (!id || id === resolvePlatformTreasuryUserId()) {
    return null;
  }
  if (!isSupabaseUserId(id) || !process.env.DATABASE_URL?.trim()) {
    return null;
  }
  try {
    const row = await getPrisma().user.findUnique({
      where: { id },
      select: { email: true },
    });
    const email = row?.email?.trim() ?? "";
    return isNoticeMailAddress(email) ? email : null;
  } catch {
    return null;
  }
}
