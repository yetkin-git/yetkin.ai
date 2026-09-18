#!/usr/bin/env tsx
/**
 * Super Admin — akademi müfredat gövdesi, medya artığı ve öğrenme sicilini kökten siler.
 *
 *   npx tsx scripts/ops-purge-academy-content.ts [--dry-run] [--skip-db]
 *
 * Taze ingest yapılana kadar ders gövdesi, cue, konuşma metni ve bake saati durmaz.
 * Silmez: katalog SKU, sınav havuzu, satın alma, sertifika.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import dotenv from "dotenv";
import { connectOpsDmlClient } from "./ops-pg-direct-client";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

type EmptyModule = {
  folder: string;
  exportPrefix: string;
  moduleCode: string;
  title: string;
  category: string;
  audience: readonly string[];
  methodology: string;
  voice: string;
  voiceGender: "female" | "male";
  voiceStyle: string;
};

const EMPTY_MODULES: readonly EmptyModule[] = [
  {
    folder: "office_ai",
    exportPrefix: "officeAi",
    moduleCode: "CURR-OFFICE-AI-101",
    title: "İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Verimliliği)",
    category: "KATMAN 1.1 — Ekmek Teknesi / Kitlesel Eğitim Serisi (Pazarın %80'i / Temel & Başlangıç Seviyesi)",
    audience: [
      "Beyaz yakalı ofis çalışanları",
      "Muhasebe ve finans uzmanları",
      "İnsan kaynakları uzmanları",
      "Yönetici asistanları",
      "Kamu personeli",
      "KOBİ çalışanları",
      "İş hayatına hazırlanan üniversite öğrencileri",
    ],
    methodology:
      "Canlı diyalog ve sen dili, sakin ve adım adım ekran rehberliği, sıfır kodlama, yüksek verim odaklı pratik ofis çözümleri.",
    voice: "Callirrhoe",
    voiceGender: "female",
    voiceStyle: "Canlı diyalog ve sen dili, sakin ve adım adım ekran rehberliği",
  },
  {
    folder: "ecommerce_ai",
    exportPrefix: "ecommerceAi",
    moduleCode: "CURR-ECOMMERCE-AI-102",
    title: "E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (Trendyol, Hepsiburada, Amazon & Shopify)",
    category: "KATMAN 1.2 — Ekmek Teknesi / Kitlesel Eğitim Serisi (Pazarın %80'i / Temel & Başlangıç Seviyesi)",
    audience: [
      "Pazaryeri satıcıları",
      "KOBİ sahipleri",
      "E-ticaret operasyon sorumluları",
      "Dropshipping girişimcileri",
      "Evden satış yapanlar",
    ],
    methodology:
      "Canlı diyalog ve sen dili, adım adım ekran rehberliği, sıfır kodlama, satış ve verimlilik odaklı pratik çözümler",
    voice: "Kore",
    voiceGender: "female",
    voiceStyle: "Canlı diyalog ve sen dili, sakin ekran rehberliği",
  },
  {
    folder: "social_media_ai",
    exportPrefix: "socialMediaAi",
    moduleCode: "CURR-SOCIAL-MEDIA-AI-103",
    title:
      "Yapay Zekâ ile Sosyal Medya İçerik Üretimi ve Görsel/Video Fabrikası (Midjourney, Runway, Kling & CapCut)",
    category: "KATMAN 1.3 — Sosyal Medya, Görsel ve Video Otomasyonu (Uçtan Uca Dijital İçerik Fabrikası)",
    audience: [
      "İçerik üreticileri",
      "Sosyal medya yöneticileri",
      "KOBİ sahipleri",
      "Dijital pazarlamacılar",
      "E-ticaret markaları",
      "Müşterilerine yeni nesil video içerik hizmeti satmak isteyen ajans girişimcileri",
    ],
    methodology:
      "Canlı diyalog ve sen dili, adım adım iş akışı rehberliği, sıfır kodlama, Midjourney, Canva AI, ElevenLabs, HeyGen, Runway, Kling ve CapCut ile entegre üretim hattı",
    voice: "Zephyr",
    voiceGender: "male",
    voiceStyle: "Genç, pratik, modern ajans ve sosyal medya dili",
  },
  {
    folder: "chatbot_nocode",
    exportPrefix: "chatbotNocode",
    moduleCode: "CURR-CHATBOT-NOCODE-104",
    title: "Müşteri Hizmetleri ve Satış İçin Kodsuz WhatsApp / Web Chatbot Kurulumu (Voiceflow & Botpress)",
    category:
      "KATMAN 1.4 — Dijital Asistanlık ve Müşteri İletişim Otomasyonu (Pazarın En Çok Talep Ettiği Gelir Kapısı)",
    audience: [
      "KOBİ'ye kurulum satacak freelancer adayları",
      "Yeni mezunlar",
      "Ajans çalışanları",
      "Teknik meraklı işletme personeli",
    ],
    methodology:
      "Canlı diyalog ve sen dili, adım adım görsel akış tasarımı, sıfır kodlama, randevu ve teslim seti odaklı uygulamalar",
    voice: "Puck",
    voiceGender: "male",
    voiceStyle: "Teknik, net, otomasyon odaklı erkek sesi; adım adım görsel akış rehberliği",
  },
  {
    folder: "prompt_practice",
    exportPrefix: "promptPractice",
    moduleCode: "CURR-PROMPT-PRACTICE-105",
    title: "Pratik Prompt Mühendisliği ve Günlük Üretkenlik Rehberi (ChatGPT, Claude & Perplexity)",
    category: "KATMAN 1.5 — Pratik Prompt Mühendisliği ve Bilişsel Üretkenlik (Katman 1 Büyük Kapanış Modülü)",
    audience: [
      "Günlük işlerinde yapay zekâyı sistemli kullanmak isteyenler",
      "Öğrenciler",
      "Serbest çalışanlar",
    ],
    methodology:
      "Canlı diyalog ve doğrudan sen hitabı, uygulamalı prompt şablonları, rol + bağlam + format, sıfır kodlama",
    voice: "Callirrhoe",
    voiceGender: "female",
    voiceStyle: "Canlı diyalog ve sen dili, uygulamalı şablon odaklı anlatım",
  },
];

const LESSON_KEYS = [
  "01_office_ai",
  "02_ecommerce_ai",
  "03_social_media_ai",
  "04_chatbot_nocode",
  "05_prompt_practice",
].flatMap((slug) => Array.from({ length: 6 }, (_, index) => `${slug}-${index + 1}`));

const MEDIA_ROOTS = [
  join(ROOT, "public", "media", "academy"),
  join(ROOT, "public", "academy", "cinema"),
];

function fail(message: string): never {
  console.error(`ops:purge-academy-content BAŞARISIZ: ${message}`);
  process.exit(1);
}

function renderEmptyIndex(mod: EmptyModule): string {
  const audience = mod.audience.map((row) => `    ${JSON.stringify(row)},`).join("\n");
  return `import type { CurriculumModule, Section } from "../types";

export const ${mod.exportPrefix}Sections: Section[] = [];

export const ${mod.exportPrefix}MasteryModule: CurriculumModule = {
  moduleCode: ${JSON.stringify(mod.moduleCode)},
  title: ${JSON.stringify(mod.title)},
  instructor: "Eğitmen",
  category: ${JSON.stringify(mod.category)},
  targetAudience: [
${audience}
  ],
  methodology: ${JSON.stringify(mod.methodology)},
  estimatedTotalMinutes: 0,
  voiceConfig: {
    voice: ${JSON.stringify(mod.voice)},
    style: ${JSON.stringify(mod.voiceStyle)},
    gender: ${JSON.stringify(mod.voiceGender)},
  },
  sections: ${mod.exportPrefix}Sections,
};
`;
}

function emptyCurriculumDocs(dryRun: boolean): number {
  const dir = join(ROOT, "docs", "curriculum");
  if (!existsSync(dir)) {
    return 0;
  }
  let count = 0;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".md")) {
      continue;
    }
    count += 1;
    if (!dryRun) {
      writeFileSync(join(dir, name), "", "utf8");
    }
  }
  return count;
}

function deleteGeneratedSections(dryRun: boolean): number {
  const root = join(ROOT, "lib", "academy", "curricula");
  let count = 0;
  for (const mod of EMPTY_MODULES) {
    const dir = join(root, mod.folder);
    if (!existsSync(dir)) {
      continue;
    }
    for (const name of readdirSync(dir)) {
      if (!/^section_\d+\.ts$/u.test(name)) {
        continue;
      }
      count += 1;
      if (!dryRun) {
        unlinkSync(join(dir, name));
      }
    }
    if (!dryRun) {
      writeFileSync(join(dir, "index.ts"), renderEmptyIndex(mod), "utf8");
    }
  }
  return count;
}

function emptyCueAndTimingFiles(dryRun: boolean): number {
  let count = 0;
  for (const lessonKey of LESSON_KEYS) {
    count += 1;
    if (dryRun) {
      continue;
    }
    writeFileSync(join(ROOT, "lib", "academy", "lesson-cues", `${lessonKey}.json`), "[]\n", "utf8");
    writeFileSync(
      join(ROOT, "lib", "academy", "lesson-audio-timings", `${lessonKey}.json`),
      `${JSON.stringify(
        {
          lessonKey,
          pauseSec: 0.4,
          durationSec: 0,
          cacheV: 0,
          pieces: [],
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  }
  return count;
}

function deleteSpokenScripts(dryRun: boolean): number {
  const dir = join(ROOT, "lib", "academy", "spoken-scripts");
  if (!existsSync(dir)) {
    return 0;
  }
  let count = 0;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".md")) {
      continue;
    }
    count += 1;
    if (!dryRun) {
      unlinkSync(join(dir, name));
    }
  }
  return count;
}

function deleteTreeFiles(dir: string, dryRun: boolean): number {
  if (!existsSync(dir)) {
    return 0;
  }
  let count = 0;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      count += deleteTreeFiles(full, dryRun);
      if (!dryRun) {
        try {
          rmSync(full, { recursive: true, force: true });
        } catch {
          // klasör dolu kalabilir
        }
      }
      continue;
    }
    count += 1;
    if (!dryRun) {
      unlinkSync(full);
    }
  }
  return count;
}

function cleanAcademyMedia(dryRun: boolean): number {
  let count = 0;
  for (const root of MEDIA_ROOTS) {
    count += deleteTreeFiles(root, dryRun);
    if (!dryRun) {
      mkdirSync(root, { recursive: true });
    }
  }
  return count;
}

async function purgeDatabase(dryRun: boolean): Promise<string> {
  const { client, via } = await connectOpsDmlClient();
  const tables = [
    "academy_audio_cache",
    "academy_lesson_completions",
    "academy_exam_sittings",
  ] as const;
  try {
    const counts: string[] = [];
    for (const table of tables) {
      const before = await client.query<{ n: string }>(`SELECT COUNT(*)::text AS n FROM ${table}`);
      const n = Number(before.rows[0]?.n ?? 0);
      if (!dryRun) {
        const deleted = await client.query(`DELETE FROM ${table}`);
        counts.push(`${table}=${deleted.rowCount ?? 0} (önce ${n})`);
      } else {
        counts.push(`${table}=${n}`);
      }
    }
    return `via=${via} ${counts.join(", ")}`;
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const skipDb = args.includes("--skip-db");

  const docs = emptyCurriculumDocs(dryRun);
  const sections = deleteGeneratedSections(dryRun);
  const cues = emptyCueAndTimingFiles(dryRun);
  const spoken = deleteSpokenScripts(dryRun);
  const media = cleanAcademyMedia(dryRun);
  const db = skipDb ? "atlandı" : await purgeDatabase(dryRun);

  console.log(
    [
      dryRun ? "ops:purge-academy-content DRY-RUN" : "ops:purge-academy-content OK",
      `docs/curriculum md boşaltılan=${docs}`,
      `section_*.ts silinen=${sections}`,
      `cue/timing sıfırlanan=${cues}`,
      `spoken-scripts silinen=${spoken}`,
      `public medya silinen=${media}`,
      `db ${db}`,
    ].join(" — "),
  );
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
