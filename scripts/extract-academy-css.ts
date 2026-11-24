#!/usr/bin/env tsx
/**
 * Tek seferlik arşiv ayrıştırıcısı — M-02.
 *
 * `app/globals.css` içindeki `academy` seçicili kural bloklarını (`[data-room="academy"]`
 * dahil) `app/styles/archived-academy.css` dosyasına taşır. Canlı dosyada kalan
 * `academy` kuralı sıfır olana kadar tekrar çalıştırılabilir; ikinci koşu no-op'tur.
 *
 * Kural düzeyinde ayrıştırır: `@media` / `@supports` gövdeleri yinelemeli taranır,
 * academy olmayan alt kurallar canlı dosyada kalır. Boşalan sarmalayıcı düşer.
 * `@keyframes academy-*` adı eşleşirse tamamı arşive gider.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const LIVE = join(ROOT, "app/globals.css");
const ARCHIVE = join(ROOT, "app/styles/archived-academy.css");

const ACADEMY_RE = /academy/i;
const AT_RULE_WITH_BLOCK = /^@(media|supports|layer|container|scope|document)\b/i;

type Chunk = { header: string; body: string | null; raw: string };

/** Üst düzey ifadeleri böler. Header = seçici veya at-kuralı önsözü. */
function splitTopLevel(source: string): Chunk[] {
  const chunks: Chunk[] = [];
  let i = 0;
  let start = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i += 1;
      while (i < source.length && source[i] !== quote) {
        i += source[i] === "\\" ? 2 : 1;
      }
      i += 1;
      continue;
    }
    if (ch === "{") {
      const header = source.slice(start, i);
      let depth = 1;
      let j = i + 1;
      while (j < source.length && depth > 0) {
        const c = source[j];
        if (c === "/" && source[j + 1] === "*") {
          const end = source.indexOf("*/", j + 2);
          j = end === -1 ? source.length : end + 2;
          continue;
        }
        if (c === '"' || c === "'") {
          const quote = c;
          j += 1;
          while (j < source.length && source[j] !== quote) {
            j += source[j] === "\\" ? 2 : 1;
          }
          j += 1;
          continue;
        }
        if (c === "{") depth += 1;
        else if (c === "}") depth -= 1;
        j += 1;
      }
      const body = source.slice(i + 1, j - 1);
      chunks.push({ header, body, raw: source.slice(start, j) });
      i = j;
      start = j;
      continue;
    }
    if (ch === ";") {
      chunks.push({ header: source.slice(start, i), body: null, raw: source.slice(start, i + 1) });
      i += 1;
      start = i;
      continue;
    }
    if (ch === "}") {
      // Eşleşmemiş kapanış — olduğu gibi korunur.
      i += 1;
      continue;
    }
    i += 1;
  }
  if (start < source.length) {
    chunks.push({ header: source.slice(start), body: null, raw: source.slice(start) });
  }
  return chunks;
}

/** `@media` gövdesini academy olmayan alt kurallara indirger; boşsa null. */
function filterAtRuleBody(body: string): { kept: string; removed: string } {
  const children = splitTopLevel(body);
  const keptParts: string[] = [];
  const removedParts: string[] = [];
  for (const child of children) {
    const selector = child.header.trim();
    if (ACADEMY_RE.test(selector)) {
      removedParts.push(child.raw);
      continue;
    }
    if (child.body != null && AT_RULE_WITH_BLOCK.test(selector)) {
      const nested = filterAtRuleBody(child.body);
      if (nested.removed.trim()) {
        removedParts.push(`${child.header}{${nested.removed}}`);
      }
      if (nested.kept.trim()) {
        keptParts.push(`${child.header}{${nested.kept}}`);
      }
      continue;
    }
    keptParts.push(child.raw);
  }
  return { kept: keptParts.join(""), removed: removedParts.join("") };
}

function main(): void {
  const source = readFileSync(LIVE, "utf8");
  const chunks = splitTopLevel(source);
  const kept: string[] = [];
  const moved: string[] = [];

  for (const chunk of chunks) {
    const selector = chunk.header.trim();
    if (chunk.body == null) {
      // Noktalı virgüllü üst düzey ifade (@import, @charset, at-rule tekil).
      if (ACADEMY_RE.test(selector)) {
        moved.push(chunk.raw);
      } else {
        kept.push(chunk.raw);
      }
      continue;
    }
    if (ACADEMY_RE.test(selector)) {
      moved.push(chunk.raw);
      continue;
    }
    if (AT_RULE_WITH_BLOCK.test(selector)) {
      const filtered = filterAtRuleBody(chunk.body);
      if (filtered.removed.trim()) {
        moved.push(`${chunk.header}{${filtered.removed}}`);
      }
      if (filtered.kept.trim()) {
        kept.push(`${chunk.header}{${filtered.kept}}`);
      }
      continue;
    }
    kept.push(chunk.raw);
  }

  const remainingAcademy = (kept.join("").match(/academy/gi) ?? []).length;
  if (remainingAcademy > 0) {
    console.error(`Canlı gövdede ${remainingAcademy} academy eşleşmesi kaldı — ayrıştırma eksik.`);
    process.exit(1);
  }

  const previousArchive = existsSync(ARCHIVE) ? readFileSync(ARCHIVE, "utf8") : "";
  if (!previousArchive) {
    mkdirSync(dirname(ARCHIVE), { recursive: true });
    writeFileSync(
      ARCHIVE,
      [
        "/*",
        " * M-02 arşiv — Akademi odası CSS'i.",
        " *",
        " * `/academy` diskte yok ve kenar 410 basıyor (`proxy.ts`). Bu dosyadaki hiçbir",
        " * kural canlı ağaçta eşleşmez. `app/globals.css` bunu IMPORT ETMEZ; canlı CSS",
        " * yalnız kullanılan sınıfları taşır. Geri dönüş gerekirse bu dosya okunur,",
        " * globals.css'e elle taşınır — otomatik `@import` yazılmaz.",
        " *",
        " * Kaynak: `app/globals.css` (M-02 tedavisi, `scripts/extract-academy-css.ts`).",
        " */",
        "",
      ].join("\n"),
      "utf8",
    );
  }
  writeFileSync(LIVE, kept.join(""), "utf8");
  if (moved.length > 0) {
    writeFileSync(ARCHIVE, `${readFileSync(ARCHIVE, "utf8")}${moved.join("")}\n`, "utf8");
  }

  console.log(
    `globals.css → ${(Buffer.byteLength(kept.join("")) / 1024).toFixed(1)} KB ` +
      `(${moved.length} blok arşive taşındı)`,
  );
}

main();
