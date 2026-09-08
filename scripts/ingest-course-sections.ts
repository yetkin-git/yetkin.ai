#!/usr/bin/env tsx
/**
 * Genel müfredat ingest hattı — `docs/curriculum/` master metnini kanon SKU slug'ına
 * kilitler ve `lib/academy/curricula/<klasör>/` altına `section_*.ts` + `index.ts` basar.
 *
 *   tsx scripts/ingest-course-sections.ts \
 *     --slug 04_chatbot_nocode \
 *     --src docs/curriculum/04_chatbot_mastery.md \
 *     [--out chatbot_nocode] [--export chatbotNocode] \
 *     [--expected-sections 6] [--dry-run]
 *
 * Kurallar (TESPIT_RAPORU_PHASE2 §2.3 reçetesi):
 * - `--slug` kanon `ACADEMY_CANON_SKU_SLUGS` üyesi olmak zorundadır; orphan master
 *   metin (örn. 03_ecommerce_advanced) reddedilir — kanona ekle ya da arşivle
 *   kararı ürün sahibinindir, script sessizce geçirmez.
 * - Modül metası önce MD'nin YAML frontmatter'ından okunur (02_ecommerce_ai_mastery.md
 *   şekli); frontmatter yoksa `--module-code/--title/--instructor/--category/
 *   --audience "a;b;c"/--methodology/--minutes` argümanları zorunludur.
 * - Bölüm metası (süre/kelime) önce frontmatter `sections` listesinden, yoksa gövdedeki
 *   `**Tahmini Okuma ...**` satırından okunur. `pedagogicalObjective` daima gövdedeki
 *   `**Pedagojik Amaç:**` satırından alınır — kodda hardcoded META kopyası tutulmaz;
 *   master metin tek gerçektir.
 * - Modül başlığı kanon `ACADEMY_COURSE_TITLES[slug]` ile birebir eşleşmelidir.
 * - `--dry-run` dosya yazmaz; parse raporu basar. 03–06 taslak hazırlık denetimi bu
 *   kiple yapılır.
 *
 * İngest sonrası wiring (script dokunmaz, raporda hatırlatır):
 *   ① `CURRICULUM_DRAFTS_BY_SLUG` + `curricula/index.ts`  ② `lesson-index` yenile
 *   ③ 30–50 soruluk havuz + `POOL_BY_SLUG`  ④ `ACADEMY_GROWTH_SKU_SLUGS`'a ekle
 *   ⑤ `render-academy-course-seed-sql.ts` + migrate  ⑥ katalog/canon/exam testleri
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ACADEMY_CANON_SKU_SLUGS,
  ACADEMY_COURSE_TITLES,
  type AcademyCourseTitleSlug,
} from "@/lib/kernel/catalog-ids/course-slugs";

const ROOT = process.cwd();

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export type IngestCliArgs = Record<string, string | boolean>;

export function parseIngestCliArgs(argv: readonly string[]): IngestCliArgs {
  const out: IngestCliArgs = {};
  const FLAGS = new Set(["dry-run", "help"]);
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]!;
    if (!token.startsWith("--")) {
      throw new Error(`Bilinmeyen argüman: ${token} (yalnız --anahtar değer çiftleri)`);
    }
    const key = token.slice(2);
    if (FLAGS.has(key)) {
      out[key] = true;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`--${key} değer ister`);
    }
    out[key] = value;
    i += 1;
  }
  return out;
}

function str(args: IngestCliArgs, key: string): string | undefined {
  const value = args[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

// ---------------------------------------------------------------------------
// Frontmatter (bilinen alt küme — bağımlılıksız, katı ayrıştırıcı)
// ---------------------------------------------------------------------------

export type FrontmatterSectionRow = {
  sectionNumber: number;
  title: string;
  targetDurationMinutes?: number;
  estimatedWordCount?: number;
};

export type CurriculumFrontmatter = {
  slug?: string;
  moduleCode?: string;
  title?: string;
  instructor?: string;
  category?: string;
  methodology?: string;
  estimatedTotalMinutes?: number;
  status?: string;
  targetAudience: string[];
  voice?: string;
  voiceGender?: string;
  voiceStyle?: string;
  sections: FrontmatterSectionRow[];
};

const FM_SCALAR_RE = /^([a-zA-Z]+):\s*(.+?)\s*$/u;
const FM_NESTED_RE = /^([a-zA-Z]+):\s*$/u;
const FM_LIST_ITEM_RE = /^-\s*"((?:[^"\\]|\\.)*)"\s*$/u;
const FM_FLOW_SECTION_RE = /^-\s*\{(.+)\}\s*$/u;
const FM_FLOW_PAIR_RE = /([a-zA-Z]+):\s*(?:"((?:[^"\\]|\\.)*)"|([\d.]+))/gu;

function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return JSON.parse(trimmed) as string;
  }
  return trimmed;
}

/** `---` çitileri arasındaki bilinen YAML alt kümesini okur; bilinmeyen yapıda patlar. */
export function parseCurriculumFrontmatter(raw: string): {
  frontmatter: CurriculumFrontmatter | null;
  body: string;
} {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { frontmatter: null, body: normalized };
  }
  const close = normalized.indexOf("\n---\n", 4);
  if (close === -1) {
    throw new Error("Frontmatter açıldı ama kapanmadı (--- çitisi eksik).");
  }
  const block = normalized.slice(4, close);
  const body = normalized.slice(close + 5);

  const fm: CurriculumFrontmatter = { targetAudience: [], sections: [] };
  let listKey: "targetAudience" | "sections" | null = null;
  let nestedKey: "voiceConfig" | "exam" | null = null;

  for (const line of block.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }
    const indented = /^\s+/u.test(line);
    const trimmed = line.trim();

    if (indented && listKey === "targetAudience") {
      const item = trimmed.match(FM_LIST_ITEM_RE);
      if (!item) {
        throw new Error(`targetAudience liste satırı okunamadı: ${trimmed}`);
      }
      fm.targetAudience.push(JSON.parse(`"${item[1]}"`) as string);
      continue;
    }
    if (indented && listKey === "sections") {
      const flow = trimmed.match(FM_FLOW_SECTION_RE);
      if (!flow) {
        throw new Error(`sections akış satırı okunamadı: ${trimmed}`);
      }
      const row: FrontmatterSectionRow = { sectionNumber: 0, title: "" };
      for (const pair of flow[1]!.matchAll(FM_FLOW_PAIR_RE)) {
        const [, key, quoted, numeric] = pair;
        const value = quoted !== undefined ? (JSON.parse(`"${quoted}"`) as string) : numeric!;
        if (key === "sectionNumber") row.sectionNumber = Number(value);
        else if (key === "title") row.title = value;
        else if (key === "targetDurationMinutes") row.targetDurationMinutes = Number(value);
        else if (key === "estimatedWordCount") row.estimatedWordCount = Number(value);
        // key (s1..s6) bilinçli atlanır — ders anahtarı slug'dan türetilir.
      }
      if (!row.sectionNumber || !row.title) {
        throw new Error(`sections satırında sectionNumber/title eksik: ${trimmed}`);
      }
      fm.sections.push(row);
      continue;
    }
    if (indented && nestedKey === "voiceConfig") {
      const pair = trimmed.match(FM_SCALAR_RE);
      if (!pair) {
        throw new Error(`voiceConfig satırı okunamadı: ${trimmed}`);
      }
      const [, key, value] = pair;
      if (key === "voice") fm.voice = unquote(value!);
      else if (key === "gender") fm.voiceGender = unquote(value!);
      else if (key === "style") fm.voiceStyle = unquote(value!);
      continue;
    }
    if (indented && nestedKey === "exam") {
      // Sınav havuzu ayrı wiring adımıdır; blok bilgi amaçlı taşınır, üretime girmez.
      continue;
    }

    listKey = null;
    nestedKey = null;
    const scalar = trimmed.match(FM_SCALAR_RE);
    if (scalar) {
      const [, key, value] = scalar;
      const unquoted = unquote(value!);
      if (key === "estimatedTotalMinutes" || key === "layer") {
        if (key === "estimatedTotalMinutes") fm.estimatedTotalMinutes = Number(unquoted);
      } else if (key === "slug") fm.slug = unquoted;
      else if (key === "moduleCode") fm.moduleCode = unquoted;
      else if (key === "title") fm.title = unquoted;
      else if (key === "instructor") fm.instructor = unquoted;
      else if (key === "category") fm.category = unquoted;
      else if (key === "methodology") fm.methodology = unquoted;
      else if (key === "status") fm.status = unquoted;
      // format/mediaSeal/version/lang bilgi alanıdır; üretim bunlardan okumaz.
      continue;
    }
    const nested = trimmed.match(FM_NESTED_RE);
    if (nested) {
      const key = nested[1]!;
      if (key === "targetAudience") listKey = "targetAudience";
      else if (key === "sections") listKey = "sections";
      else if (key === "voiceConfig") nestedKey = "voiceConfig";
      else if (key === "exam") nestedKey = "exam";
      else throw new Error(`Bilinmeyen frontmatter bloğu: ${key}`);
      continue;
    }
    throw new Error(`Frontmatter satırı okunamadı: ${trimmed}`);
  }

  return { frontmatter: fm, body };
}

// ---------------------------------------------------------------------------
// Bölüm gövdesi ayrıştırma
// ---------------------------------------------------------------------------

export type ParsedSection = {
  sectionNumber: number;
  title: string;
  targetDurationMinutes: number;
  estimatedWordCount: number;
  pedagogicalObjective: string;
  contentMarkdown: string;
};

const SECTION_HEADING_RE = /^# BÖLÜM (\d+):\s*(.+)$/gm;
const DURATION_RE = /\*\*Tahmini Okuma[^*]*:\*\*\s*(\d+(?:[.,]\d+)?)\s*(?:[-–]\s*(\d+(?:[.,]\d+)?))?\s*Dakika/iu;
const WORDS_RE = /\(~?\s*([\d.,]+)\s*Kelime\)/iu;
const OBJECTIVE_RE = /^\*\*Pedagojik Amaç:\*\*\s*(.+?)\s*$/mu;

/** Türkçe binlik ayracı: "1.450" / "1,450" → 1450. */
export function parseTurkishWordCount(value: string): number {
  const digits = value.replace(/[.\s]/gu, "").replace(/,/gu, "");
  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Kelime sayısı okunamadı: ${value}`);
  }
  return parsed;
}

/** "8-9" → 8.5, "7-9" → 8, "8" → 8. */
export function parseDurationRangeMinutes(low: string, high?: string): number {
  const a = Number(low.replace(",", "."));
  const b = high ? Number(high.replace(",", ".")) : a;
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b < a) {
    throw new Error(`Süre aralığı okunamadı: ${low}-${high ?? low}`);
  }
  return Math.round(((a + b) / 2) * 10) / 10;
}

/** Meta satırlarını (Tahmini Okuma / Eğitmen / Pedagojik Amaç) ve `---` ayraçlarını gövdeden söker. */
export function stripSectionMetaLines(body: string): string {
  let current = body.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  let previous = "";
  while (previous !== current) {
    previous = current;
    current = current
      .replace(/^\*\*Tahmini Okuma[^\n]*(\n|$)/u, "")
      .replace(/^\*\*Eğitmen:[^\n]*(\n|$)/u, "")
      .replace(/^\*\*Pedagojik Amaç:[^\n]*(\n|$)/u, "")
      .replace(/^(?:\s*---\s*\n)+/u, "")
      .trimStart();
  }
  return current.trim();
}

export function parseCurriculumSections(
  body: string,
  expectedSections: number,
  frontmatterRows: readonly FrontmatterSectionRow[],
): ParsedSection[] {
  const matches = [...body.matchAll(SECTION_HEADING_RE)];
  if (matches.length !== expectedSections) {
    throw new Error(`Beklenen ${expectedSections} bölüm, bulunan ${matches.length}`);
  }
  const sections: ParsedSection[] = [];
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i]!;
    const n = Number(match[1]);
    if (n !== i + 1) {
      throw new Error(`Bölüm numarası sırasız: ${i + 1}. konumda BÖLÜM ${n}`);
    }
    const title = match[2]!.trim();
    const start = match.index! + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1]!.index! : body.length;
    const rawBody = body.slice(start, end);

    const objective = rawBody.match(OBJECTIVE_RE)?.[1]?.trim();
    if (!objective) {
      throw new Error(`BÖLÜM ${n}: **Pedagojik Amaç:** satırı eksik — master metin tamamlanmalı.`);
    }

    const fmRow = frontmatterRows.find((row) => row.sectionNumber === n);
    if (fmRow && fmRow.title !== title) {
      process.stderr.write(
        `UYARI: BÖLÜM ${n} başlığı frontmatter ile gövde arasında farklı:\n` +
          `  frontmatter: ${fmRow.title}\n  gövde:       ${title}\n  (gövde başlığı kullanılır)\n`,
      );
    }

    let duration = fmRow?.targetDurationMinutes;
    if (duration === undefined) {
      const durationMatch = rawBody.match(DURATION_RE);
      if (!durationMatch) {
        throw new Error(`BÖLÜM ${n}: süre satırı (**Tahmini Okuma ... Dakika**) okunamadı.`);
      }
      duration = parseDurationRangeMinutes(durationMatch[1]!, durationMatch[2]);
    }

    let words = fmRow?.estimatedWordCount;
    if (words === undefined) {
      const wordsMatch = rawBody.match(WORDS_RE);
      if (!wordsMatch) {
        throw new Error(`BÖLÜM ${n}: kelime sayısı ((~1.450 Kelime)) okunamadı.`);
      }
      words = parseTurkishWordCount(wordsMatch[1]!);
    }

    sections.push({
      sectionNumber: n,
      title,
      targetDurationMinutes: duration,
      estimatedWordCount: words,
      pedagogicalObjective: objective,
      contentMarkdown: stripSectionMetaLines(rawBody),
    });
  }
  return sections;
}

// ---------------------------------------------------------------------------
// Kod üretimi
// ---------------------------------------------------------------------------

export type IngestModuleMeta = {
  moduleCode: string;
  title: string;
  instructor: string;
  category: string;
  targetAudience: string[];
  methodology: string;
  estimatedTotalMinutes: number;
  voice: string;
  voiceStyle: string;
  voiceGender: string;
};

export type IngestCourseSectionsConfig = {
  slug: string;
  srcPath: string;
  outDir: string;
  exportPrefix: string;
  expectedSections: number;
  dryRun: boolean;
  module: Partial<IngestModuleMeta>;
};

export type IngestCourseSectionsResult = {
  slug: string;
  outDir: string;
  sectionNumbers: number[];
  files: string[];
  dryRun: boolean;
  report: string;
};

export function renderSectionFile(section: ParsedSection): string {
  return `import type { Section } from "../types";

export const section${section.sectionNumber}: Section = {
  sectionNumber: ${section.sectionNumber},
  title: ${JSON.stringify(section.title)},
  targetDurationMinutes: ${section.targetDurationMinutes},
  estimatedWordCount: ${section.estimatedWordCount},
  pedagogicalObjective: ${JSON.stringify(section.pedagogicalObjective)},
  contentMarkdown: ${JSON.stringify(`\n${section.contentMarkdown}\n`)},
};
`;
}

export function renderIndexFile(
  exportPrefix: string,
  meta: IngestModuleMeta,
  sections: readonly ParsedSection[],
): string {
  const names = sections.map((s) => `section${s.sectionNumber}`);
  const imports = names.map((name, i) => `import { ${name} } from "./section_${i + 1}";`).join("\n");
  return `import type { CurriculumModule, Section } from "../types";
${imports}

export { ${names.join(", ")} };

export const ${exportPrefix}Sections: Section[] = [
  ${names.join(",\n  ")},
];

export const ${exportPrefix}MasteryModule: CurriculumModule = {
  moduleCode: ${JSON.stringify(meta.moduleCode)},
  title: ${JSON.stringify(meta.title)},
  instructor: ${JSON.stringify(meta.instructor)},
  category: ${JSON.stringify(meta.category)},
  targetAudience: [
${meta.targetAudience.map((row) => `    ${JSON.stringify(row)},`).join("\n")}
  ],
  methodology: ${JSON.stringify(meta.methodology)},
  estimatedTotalMinutes: ${meta.estimatedTotalMinutes},
  voiceConfig: {
    voice: ${JSON.stringify(meta.voice)},
    style: ${JSON.stringify(meta.voiceStyle)},
    gender: ${JSON.stringify(meta.voiceGender)},
  },
  sections: ${exportPrefix}Sections,
};
`;
}

/** `04_chatbot_nocode` → `chatbot_nocode` (klasör) → `chatbotNocode` (export öneki). */
export function defaultOutFolderForSlug(slug: string): string {
  return slug.replace(/^\d+_/, "");
}

export function camelCaseExportPrefix(folder: string): string {
  const parts = folder.split("_").filter(Boolean);
  return parts
    .map((part, index) => (index === 0 ? part : part[0]!.toUpperCase() + part.slice(1)))
    .join("");
}

function resolveModuleMeta(
  config: IngestCourseSectionsConfig,
  fm: CurriculumFrontmatter | null,
  sections: readonly ParsedSection[],
): IngestModuleMeta {
  const minutesFallback = Math.round(
    sections.reduce((sum, row) => sum + row.targetDurationMinutes, 0),
  );
  const meta: IngestModuleMeta = {
    moduleCode: config.module.moduleCode ?? fm?.moduleCode ?? "",
    title: config.module.title ?? fm?.title ?? "",
    instructor: config.module.instructor ?? fm?.instructor ?? "",
    category: config.module.category ?? fm?.category ?? "",
    targetAudience:
      config.module.targetAudience && config.module.targetAudience.length > 0
        ? config.module.targetAudience
        : (fm?.targetAudience ?? []),
    methodology: config.module.methodology ?? fm?.methodology ?? "",
    estimatedTotalMinutes:
      config.module.estimatedTotalMinutes ?? fm?.estimatedTotalMinutes ?? minutesFallback,
    voice: config.module.voice ?? fm?.voice ?? "Callirrhoe",
    voiceStyle: config.module.voiceStyle ?? fm?.voiceStyle ?? "",
    voiceGender: config.module.voiceGender ?? fm?.voiceGender ?? "female",
  };
  const missing: string[] = [];
  if (!meta.moduleCode) missing.push("moduleCode (--module-code veya frontmatter)");
  if (!meta.title) missing.push("title (--title veya frontmatter)");
  if (!meta.instructor) missing.push("instructor (--instructor veya frontmatter)");
  if (!meta.category) missing.push("category (--category veya frontmatter)");
  if (meta.targetAudience.length === 0) missing.push('targetAudience (--audience "a;b;c" veya frontmatter)');
  if (!meta.methodology) missing.push("methodology (--methodology veya frontmatter)");
  if (!meta.voiceStyle) missing.push("voiceConfig.style (--voice-style veya frontmatter)");
  if (missing.length > 0) {
    throw new Error(`Modül metası eksik:\n- ${missing.join("\n- ")}`);
  }
  return meta;
}

export function ingestCourseSections(config: IngestCourseSectionsConfig): IngestCourseSectionsResult {
  if (!(ACADEMY_CANON_SKU_SLUGS as readonly string[]).includes(config.slug)) {
    throw new Error(
      `--slug ${config.slug} kanon dışı. Kanon: ${ACADEMY_CANON_SKU_SLUGS.join(", ")}. ` +
        "Orphan master metin için önce kanon kararı (ekle ya da arşivle) gerekir.",
    );
  }
  const canonTitle = ACADEMY_COURSE_TITLES[config.slug as AcademyCourseTitleSlug];

  const raw = readFileSync(config.srcPath, "utf8");
  const { frontmatter, body } = parseCurriculumFrontmatter(raw);
  if (frontmatter?.slug && frontmatter.slug !== config.slug) {
    throw new Error(
      `Frontmatter slug (${frontmatter.slug}) ile --slug (${config.slug}) çelişiyor — doc↔slug kilidi kırık.`,
    );
  }

  const sections = parseCurriculumSections(
    body,
    config.expectedSections,
    frontmatter?.sections ?? [],
  );
  const meta = resolveModuleMeta(config, frontmatter, sections);
  if (meta.title !== canonTitle) {
    throw new Error(
      `Modül başlığı kanon ile eşleşmiyor.\n  kanon:  ${canonTitle}\n  modül:  ${meta.title}`,
    );
  }

  const files = [
    ...sections.map((section) => join(config.outDir, `section_${section.sectionNumber}.ts`)),
    join(config.outDir, "index.ts"),
  ];
  const reportLines = [
    `slug=${config.slug} src=${config.srcPath}`,
    `out=${config.outDir} export=${config.exportPrefix} dryRun=${config.dryRun ? "evet" : "hayır"}`,
    `moduleCode=${meta.moduleCode} minutes=${meta.estimatedTotalMinutes}`,
    ...sections.map(
      (section) =>
        `  BÖLÜM ${section.sectionNumber}: ${section.title} ` +
        `(~${section.targetDurationMinutes} dk, ~${section.estimatedWordCount} kelime, amaç ${section.pedagogicalObjective.length} kr, gövde ${section.contentMarkdown.length} kr)`,
    ),
  ];

  if (!config.dryRun) {
    mkdirSync(config.outDir, { recursive: true });
    for (const section of sections) {
      writeFileSync(
        join(config.outDir, `section_${section.sectionNumber}.ts`),
        renderSectionFile(section),
        "utf8",
      );
    }
    writeFileSync(join(config.outDir, "index.ts"), renderIndexFile(config.exportPrefix, meta, sections), "utf8");
  }

  return {
    slug: config.slug,
    outDir: config.outDir,
    sectionNumbers: sections.map((section) => section.sectionNumber),
    files,
    dryRun: config.dryRun,
    report: reportLines.join("\n"),
  };
}

// ---------------------------------------------------------------------------
// CLI girişi
// ---------------------------------------------------------------------------

export const WIRING_REMINDER = `Sonraki wiring adımları (script dokunmaz):
  ① lib/academy/curricula/index.ts → CURRICULUM_DRAFTS_BY_SLUG kaydı
  ② scripts/generate-curriculum-lesson-index.ts → lesson-index yenile
  ③ 30–50 soruluk havuz + POOL_BY_SLUG (exam-pools*.ts)
  ④ ACADEMY_GROWTH_SKU_SLUGS'a ekle (lib/academy/pilot-sku.ts)
  ⑤ render-academy-course-seed-sql.ts + migrate
  ⑥ tests/academy/catalog-canon-ingest + exam mühürleri yeşil`;

export function ingestCourseSectionsCli(argv: readonly string[]): void {
  const args = parseIngestCliArgs(argv);
  if (args.help) {
    process.stdout.write(`${__filename.replace(/^.*[\\/]/, "")} --slug <kanon-sku> --src <master.md> [--out <klasör>] [--export <camelPrefix>] [--expected-sections 6] [--dry-run]\n`);
    return;
  }
  const slug = str(args, "slug");
  const src = str(args, "src");
  if (!slug || !src) {
    throw new Error("--slug ve --src zorunludur. --help ile kullanımı gör.");
  }
  const outFolder = str(args, "out") ?? defaultOutFolderForSlug(slug);
  const exportPrefix = str(args, "export") ?? camelCaseExportPrefix(outFolder);
  const expectedSections = Number(str(args, "expected-sections") ?? "6");
  if (!Number.isInteger(expectedSections) || expectedSections <= 0) {
    throw new Error("--expected-sections pozitif tamsayı ister");
  }
  const audience = str(args, "audience")
    ?.split(";")
    .map((row) => row.trim())
    .filter(Boolean);

  const result = ingestCourseSections({
    slug,
    srcPath: isAbsolute(src) ? src : resolve(ROOT, src),
    outDir: isAbsolute(outFolder) ? outFolder : join(ROOT, "lib", "academy", "curricula", outFolder),
    exportPrefix,
    expectedSections,
    dryRun: args["dry-run"] === true,
    module: {
      moduleCode: str(args, "module-code"),
      title: str(args, "title"),
      instructor: str(args, "instructor"),
      category: str(args, "category"),
      targetAudience: audience,
      methodology: str(args, "methodology"),
      estimatedTotalMinutes: str(args, "minutes") ? Number(str(args, "minutes")) : undefined,
      voice: str(args, "voice"),
      voiceStyle: str(args, "voice-style"),
      voiceGender: str(args, "voice-gender"),
    },
  });

  process.stdout.write(`${result.report}\n`);
  if (result.dryRun) {
    process.stdout.write("DRY-RUN: dosya yazılmadı.\n");
  } else {
    process.stdout.write(`OK ${result.slug} ingest: ${result.sectionNumbers.join(",")}\n${WIRING_REMINDER}\n`);
  }
}

const invokedAs = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedAs && fileURLToPath(import.meta.url).toLowerCase() === invokedAs.toLowerCase()) {
  ingestCourseSectionsCli(process.argv.slice(2));
}
