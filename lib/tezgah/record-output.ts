import "server-only";

import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { getPrisma } from "@/lib/kernel/db";

const TITLE_CAP = 160;
const SUMMARY_CAP = 500;
/** Görsel arşivi (base64 PNG + kılavuz) için tavan; metin masaları kısa kalır. */
const BODY_CAP = 3_000_000;

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
  const recorded = await recordSignedTezgahOutputWithMeta(input);
  return recorded.id;
}

/**
 * 4.4 — aktivasyon ölçümü için `firstForUser` bayrağını da döndürür.
 *
 * `firstForUser`, yazma sonrası satır sayısının **1** olmasıdır; ayrı bir sayaç
 * tablosu yok. Bayrak yalnız DB'ye yazılan oturumlu çıktıda `true` olabilir;
 * misafirde her zaman `false` (misafir çıktısı kişiye bağlanamaz).
 */
export async function recordSignedTezgahOutputWithMeta(input: {
  userId: string;
  guest: boolean;
  toolKey: string;
  title: string;
  inputSummary: string;
  outputContent: string;
}): Promise<{ id: string | null; firstForUser: boolean }> {
  if (input.guest || !isSupabaseUserId(input.userId)) {
    return { id: null, firstForUser: false };
  }
  if (!process.env.DATABASE_URL?.trim()) {
    return { id: null, firstForUser: false };
  }
  const outputContent = clip(input.outputContent, BODY_CAP);
  if (!outputContent) {
    return { id: null, firstForUser: false };
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
    // İlk çıktı: satır sayısı 1. Sayaç sorgusu düşerse aktivasyon olayı
    // basılmaz — yanlış "ilk çıktı" iddiası üretmektense ölçümü kaçırmak iyidir.
    let firstForUser = false;
    try {
      const total = await getPrisma().tezgahOutput.count({ where: { userId: input.userId } });
      firstForUser = total === 1;
    } catch {
      firstForUser = false;
    }
    return { id: row.id, firstForUser };
  } catch {
    return { id: null, firstForUser: false };
  }
}
