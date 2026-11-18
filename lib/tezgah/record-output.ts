import "server-only";

import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { getPrisma } from "@/lib/kernel/db";

const TITLE_CAP = 160;
const SUMMARY_CAP = 500;
const BODY_CAP = 20_000;

function clip(value: string, cap: number): string {
  const clean = value.replace(/\u0000/g, "").trim();
  if (clean.length <= cap) {
    return clean;
  }
  return clean.slice(0, cap).trim();
}

/**
 * Oturumlu üretimi arşive yazar. Misafir ve geçersiz kimlik yazılmaz.
 * Veritabanı yoksa üretim yine döner; arşiv satırı o zaman boş kalır.
 */
export async function recordSignedTezgahOutput(input: {
  userId: string;
  guest: boolean;
  toolKey: string;
  title: string;
  inputSummary: string;
  outputContent: string;
}): Promise<string | null> {
  if (input.guest || !isSupabaseUserId(input.userId)) {
    return null;
  }
  if (!process.env.DATABASE_URL?.trim()) {
    return null;
  }
  const outputContent = clip(input.outputContent, BODY_CAP);
  if (!outputContent) {
    return null;
  }
  try {
    const row = await getPrisma().tezgahOutput.create({
      data: {
        userId: input.userId,
        toolKey: clip(input.toolKey, 40) || "tezgah",
        title: clip(input.title, TITLE_CAP) || "Tezgâh çıktısı",
        inputSummary: clip(input.inputSummary, SUMMARY_CAP),
        outputContent,
      },
      select: { id: true },
    });
    return row.id;
  } catch {
    return null;
  }
}
