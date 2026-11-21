import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

/** Faz 2'de ayrılan stil katmanları. Sıra `globals.css` `@import` sırasıyla aynıdır. */
const STYLE_LAYERS = [
  "app/globals.css",
  "app/styles/tokens.css",
  "app/styles/animations.css",
] as const;

/**
 * Stil katmanlarının birleşik metni.
 *
 * SEO/performans tedavisi (Faz 2): `app/globals.css` 7.013 satırdı; tasarım
 * token'ları `app/styles/tokens.css`, `@keyframes` blokları
 * `app/styles/animations.css` dosyasına taşındı. Tarayıcı bu üç dosyayı tek
 * stillendirme bütünü olarak görür — bu yüzden yüzey testleri de tek bütün
 * olarak okur. Testlerin iddiası ("token var", "sınıf var") değişmez, yalnız
 * dosya adresi katmanlaşır.
 */
export function readStyleBundle(): string {
  return STYLE_LAYERS.filter((relative) => existsSync(join(ROOT, relative)))
    .map((relative) => readFileSync(join(ROOT, relative), "utf8"))
    .join("\n");
}

/** Katman dosyalarının disk yolları — "dosya gerçekten ayrıldı mı" iddiası için. */
export const STYLE_LAYER_PATHS: readonly string[] = STYLE_LAYERS;
