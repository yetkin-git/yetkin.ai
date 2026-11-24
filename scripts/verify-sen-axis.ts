#!/usr/bin/env tsx
/**
 * Tarama: app + components + lib/copy + lib/tezgah + lib/yetkinhibe (yetkin_muze yok; 410 sen-voice hariç).
 * Yasak: siz kaçakları (hesabınız, cüzdanınız, hoş geldiniz, Bakiyeniz…) ve
 * `seçiniz/yazın/adınızı/freelancer` gibi ikinci tekil şahıs kılıklı emir kipleri.
 *
 * Ş9 / B-07 — `lib/tezgah` kapsam dışı kaldığı için hibe sihirbazının alan
 * tanımlarındaki `"yazınız"` / `"seçiniz"` metinleri kapıdan kaçıyordu. Aynı
 * gerekçe `lib/yetkinhibe` için de geçerlidir: başlık, not ve kopya metinleri orada.
 *
 *   npm run verify:sen-axis
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const FILE_RE = /\.(ts|tsx)$/;
const SCAN_DIRS = ["app", "components", "lib/copy", "lib/tezgah", "lib/yetkinhibe"] as const;

/** 410 envanteri — canlı `lib/copy/sen-voice` tavanında yoktur. Kaynak `archived/`. */
const FROZEN_SEN_VOICE = new Set([
  "archived/lib/copy/sen-voice/arena.ts",
  "archived/lib/copy/sen-voice/devlabs.ts",
  "archived/lib/copy/sen-voice/hibe.ts",
  "archived/lib/copy/sen-voice/junior.ts",
  "archived/lib/copy/sen-voice/kurumsal.ts",
  "archived/lib/copy/sen-voice/pazaryeri.ts",
  "archived/lib/copy/sen-voice/social.ts",
  "archived/lib/copy/sen-voice/studio.ts",
]);

/**
 * M-01 — bilinçli `siz` istisnası: **mühürlü hukuki metin**.
 *
 * `lib/copy/junior-guardian-notice.ts` 6698 sayılı KVKK kapsamında **veliye**
 * sunulan resmî aydınlatma metnidir. Üç nedenle `sen` aksına çevrilmez:
 *
 * 1. **Hukuki dil**: KVKK aydınlatması resmî muhatap dilidir; "siz" burada marka
 *    aksı değil hukuk dilidir. "sen" aksına çevirmek metni hukuken zayıflatır.
 * 2. **Mühür**: gövdenin SHA-256 özeti `lib/junior/guardian-notice.ts` içinde
 *    sabittir ve **veli onayı bu sürüme bağlıdır**. Metin değişirse sürüm artar,
 *    tüm velilerin yeniden onayı gerekir (yürürlükteki Junior pilotu kapanır).
 * 3. **Native istemci**: `apps/rail-is/.../JuniorProfileScreen.tsx` sürüm dizesini
 *    sabit taşır; sunucu sürümü artsa da istemci güncellenene kadar uyumsuz kalır.
 *
 * Bu yüzden dosya tarama dışında tutulur — **gizlenmez**, sicile yazılır. Metin
 * gerçekten değişecekse sıra: yeni sürüm + yeni özet + native istemci sürümü +
 * veli yeniden onayı. Marka kopyası değişikliği bu sırayı atlayamaz.
 */
const FROZEN_LEGAL_SEN_EXCEPTIONS = new Set(["lib/copy/junior-guardian-notice.ts"]);

const SIZ_LEAKS = [
  "hesabınız",
  "cüzdanınız",
  "hoş geldiniz",
  "Hoş geldiniz",
  "Bakiyeniz",
  "kullanabilirsiniz",
  "Kimliğiniz",
  "hesabınıza",
  "yapabilirsiniz",
  "dönebilirsiniz",
  "kutunuzu",
  "e-postanıza",
  "profilinizi",
  "rehberleriniz",
  "bakiyenizi",
  "Paranız",
  "üretiminiz",
  "korunursunuz",
  "kopyalayın",
  "unutmayın",
  "kilitleyin",
  "dağıtın",
  "Hesap açın",
  "mühürleyin",
  "sizi buraya",
  // E-Ticaret Faz 1 (O-01) — commerce yüzeyindeki siz kaçakları.
  "hakkınız",
  "yazınız",
];

/**
 * M-01 (Tedavi) — mühür kapsamı genişletildi.
 *
 * Önceki liste 21 kalıptı ve **en görünür ihlali görmüyordu**: ana sayfa H1'i
 * "İşinizi Büyüten…" idi, listede "İşinizi" yoktu.
 *
 * Düz `includes` yerine **kelime sınırlı regex**: "görün" gibi kısa kalıplar
 * "görünür", "görünüm" içinde de eşleşip yüzlerce yanlış alarm üretiyordu.
 * Yeni kalıplar Türkçe sonek taşıyabilir (`açın` → `açınca` hariç tutulur),
 * bu yüzden sınır `(?<![A-Za-zÇĞİÖŞÜçğıöşü])` / `(?![A-Za-zÇĞİÖŞÜçğıöşü])`.
 */
const SIZ_LEAK_WORDS = [
  "İşinizi",
  "işletmenize",
  "siparişlerinizi",
  "stoklarınızı",
  "bakiyenize",
  "dönüş yapıyoruz",
  "anlayın",
  "açın",
  "görün",
  "seçiniz",
  "yazınız",
  // Kelime sınırlı: CSS `box-sizing` gibi teknik dizgiler yanlış alarm üretmez.
  "sizin",
  "Adınızı",
  "dönersiniz",
  "fikrinizi",
  "işletmenizin",
  "ürünlerinizi",
] as const;

/**
 * Ş9 / B-07 — çok kelimeli kalıplar. `Freelancer` tek başına yasaklanmaz: oda ve
 * meslek adıdır. Yasak olan, bireysel KOBİ'ye "freelancer" diyen **alan etiketi**dir.
 */
const SIZ_LEAK_PHRASES = ["Freelancer adı", "Freelancer adınız"] as const;

const TR_LETTERS = "A-Za-zÇĞİÖŞÜçğıöşü";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SIZ_LEAK_PATTERNS: readonly { needle: string; re: RegExp }[] = SIZ_LEAK_WORDS.map(
  (needle) => ({
    needle,
    re: new RegExp(`(?<![${TR_LETTERS}])${escapeRegExp(needle)}(?![${TR_LETTERS}])`, "u"),
  }),
);

const LIVE_FROZEN_SEN_VOICE = [
  "arena.ts",
  "devlabs.ts",
  "hibe.ts",
  "junior.ts",
  "kurumsal.ts",
  "pazaryeri.ts",
  "social.ts",
  "studio.ts",
] as const;

const issues: string[] = [];

for (const name of LIVE_FROZEN_SEN_VOICE) {
  const live = join(ROOT, "lib/copy/sen-voice", name);
  if (existsSync(live)) {
    issues.push(`canlı sen-voice donmuş oda — arşive çek: lib/copy/sen-voice/${name}`);
  }
}

function rel(file: string): string {
  return relative(ROOT, file).replace(/\\/g, "/");
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "yetkin_muze" || entry === "yetkin.ai") {
        continue;
      }
      files.push(...walk(fullPath));
    } else if (FILE_RE.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = SCAN_DIRS.flatMap((dir) => walk(join(ROOT, dir))).filter((file) => {
  const path = rel(file);
  return !FROZEN_SEN_VOICE.has(path) && !FROZEN_LEGAL_SEN_EXCEPTIONS.has(path);
});

/** Metin dosyası yorum satırlarını da taşır; yorumda kaçak da kaçaktır. */
for (const file of files) {
  const source = readFileSync(file, "utf8");
  const path = rel(file);
  for (const leak of SIZ_LEAKS) {
    if (source.includes(leak)) {
      issues.push(`${path}: siz kaçağı — \`${leak}\``);
    }
  }
  for (const pattern of SIZ_LEAK_PATTERNS) {
    if (pattern.re.test(source)) {
      issues.push(`${path}: siz kaçağı — \`${pattern.needle}\``);
    }
  }
  for (const phrase of SIZ_LEAK_PHRASES) {
    if (source.includes(phrase)) {
      issues.push(`${path}: siz kaçağı — \`${phrase}\``);
    }
  }
}

if (issues.length > 0) {
  console.error(["verify:sen-axis BAŞARISIZ:", ...issues.map((row) => `  ✗ ${row}`)].join("\n"));
  process.exit(1);
}

console.log(
  `verify:sen-axis OK — ${files.length} dosya, ${
    SIZ_LEAKS.length + SIZ_LEAK_WORDS.length + SIZ_LEAK_PHRASES.length
  } siz kaçağı tarandı (app + components + lib/copy + lib/tezgah + lib/yetkinhibe; 410 sen-voice hariç).`,
);
