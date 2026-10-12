/**
 * Junior quiz üreticileri canlı paketleri ezemez (T-16).
 * `lib/junior/quiz/<ders>/` içinde en az bir `.ts` varsa üretici hiçbir dosya yazmadan durur.
 * Bilinçli yeniden üretim için iki şart birlikte gerekir: `--allow-live-overwrite` bayrağı ve
 * `JUNIOR_QUIZ_ALLOW_LIVE_OVERWRITE=1` ortam değişkeni. Yalnız biri yeterli değildir.
 */

import { existsSync, readdirSync } from "node:fs";

export const JUNIOR_QUIZ_LIVE_OVERWRITE_FLAG = "--allow-live-overwrite";
export const JUNIOR_QUIZ_LIVE_OVERWRITE_ENV = "JUNIOR_QUIZ_ALLOW_LIVE_OVERWRITE";

export type JuniorQuizOverwriteDecision =
  | { ok: true; existing: number }
  | { ok: false; existing: number; reason: string };

/** Saf karar. Dosya sistemi ve süreç girdisi dışarıdan verilir; test edilebilir. */
export function juniorQuizOverwriteDecision(input: {
  existingFiles: readonly string[];
  argv: readonly string[];
  env: Readonly<Record<string, string | undefined>>;
}): JuniorQuizOverwriteDecision {
  const existing = input.existingFiles.length;
  if (existing === 0) {
    return { ok: true, existing };
  }
  const flag = input.argv.includes(JUNIOR_QUIZ_LIVE_OVERWRITE_FLAG);
  const env = input.env[JUNIOR_QUIZ_LIVE_OVERWRITE_ENV]?.trim() === "1";
  if (flag && env) {
    return { ok: true, existing };
  }
  return {
    ok: false,
    existing,
    reason:
      `Junior quiz üretici durdu: hedefte ${existing} canlı .ts dosyası var. ` +
      `Canlı paketi ezmek için ${JUNIOR_QUIZ_LIVE_OVERWRITE_FLAG} bayrağı ve ` +
      `${JUNIOR_QUIZ_LIVE_OVERWRITE_ENV}=1 birlikte verilmelidir.`,
  };
}

/** Üretici yazmadan önce çağrılır. Hedef boşsa veya izin tam ise sessizdir; değilse hata fırlatır. */
export function assertJuniorQuizTargetWritable(
  outDir: string,
  argv: readonly string[] = process.argv,
  env: Readonly<Record<string, string | undefined>> = process.env,
): void {
  const existingFiles = existsSync(outDir)
    ? readdirSync(outDir).filter((name) => name.endsWith(".ts"))
    : [];
  const decision = juniorQuizOverwriteDecision({ existingFiles, argv, env });
  if (!decision.ok) {
    throw new Error(decision.reason);
  }
}
