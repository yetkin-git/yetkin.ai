#!/usr/bin/env tsx
/**
 * Akademi SQL tohumunu `lib/academy/seed.ts` sicilinden basar.
 * Yedi kilitli SQL listesine yeni dosya eklemez; 20260814090000 üzerine yazar.
 *
 *   npx tsx scripts/render-academy-course-seed-sql.ts
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ACADEMY_COURSE_SEEDS,
  ACADEMY_LEGACY_PURGE_CATALOG_UNITS,
  ACADEMY_LEGACY_PURGE_COURSE_IDS,
  ACADEMY_SEED_COURSE_IDS,
} from "@/lib/academy/seed";
import { serializeAcademyExamQuestions } from "@/lib/academy/exam";

const OUT = resolve("supabase/migrations/20260814090000_academy_course_seed.sql");

const DEFAULT_AT = "2026-08-21 15:00:00";

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function ts(value: string): string {
  return `TIMESTAMP '${value}'`;
}

function at(_id: string): { catalog: string; course: string; exam: string } {
  return { catalog: DEFAULT_AT, course: DEFAULT_AT, exam: DEFAULT_AT };
}

function main(): void {
  const catalogRows = ACADEMY_COURSE_SEEDS.map((row) => {
    const stamp = at(row.id);
    return `  (
    ${sqlString(row.catalogEntryId)},
    'academy',
    ${sqlString(row.catalogUnitKey)},
    'MINOR',
    ${row.seedAmountMinor},
    'TRY',
    true,
    ${row.seedMinMinor},
    ${row.seedMaxMinor},
    ${sqlString(`Akademi kurs birim fiyatı — ${row.title} (S11-A).`)},
    ${ts(stamp.catalog)},
    ${ts(stamp.catalog)}
  )`;
  }).join(",\n");

  const courseRows = ACADEMY_COURSE_SEEDS.map((row) => {
    const stamp = at(row.id);
    return `  (
    ${sqlString(row.id)},
    ${sqlString(row.slug)},
    ${sqlString(row.title)},
    ${sqlString(row.summary)},
    ${sqlString(row.catalogUnitKey)},
    ${row.globalRank},
    ${row.localRank},
    ${row.trendScore},
    true,
    ${ts(stamp.course)},
    ${ts(stamp.course)}
  )`;
  }).join(",\n");

  const examRows = ACADEMY_COURSE_SEEDS.map((row) => {
    const stamp = at(row.id);
    const tag = row.exam.id;
    const blob = serializeAcademyExamQuestions(row.exam.questions);
    if (blob.includes(`$${tag}$`)) {
      throw new Error(`Sınav JSON dollar-quote etiketini içeriyor: ${tag}`);
    }
    return `  (
    ${sqlString(row.exam.id)},
    ${sqlString(row.id)},
    ${sqlString(row.exam.title)},
    ${row.exam.passScore},
    $${tag}$${blob}$${tag}$,
    ${ts(stamp.exam)},
    ${ts(stamp.exam)}
  )`;
  }).join(",\n");

  const sql = `-- [ADIM 8] Akademi kurs + müfredat sınavı + kurs birim fiyatı tohumu.
-- Sıra: prisma migrate deploy → Auth trigger → FORCE RLS → owner SELECT → katalog (40000) → bu dosya.
-- Yeni tablo yok. Sahte kullanıcı / purchase / certificate / visa yok.
-- Kurs tutarı academy_courses satırında değildir; PriceCatalogEntry (S11-A).
-- catalog_unit_key ↔ price_catalog_entries.unit_key mantıksal bağdır (FK yok).
-- Kurs fiyatı Super Admin PATCH ile yazıldıysa (updated_by dolu) amount_minor ezilmez.
-- Müfredat JSON'u hâlâ tohumla hizalanır; katalog tutarı yalnız boş satırda dolar.
-- Sahiplik kolonu yok: academy_courses / academy_exams PostgREST fail-closed (politika üretilmez).
-- Kaynak sicil: lib/academy/seed.ts — ${ACADEMY_COURSE_SEEDS.length} büyüme SKU.
-- HARD RESET: eski RAIL / jenerik tohumlar FK sırasıyla DELETE (kurs + bağımlılar + katalog).

INSERT INTO public.price_catalog_entries (
  id,
  module_key,
  unit_key,
  unit_type,
  amount_minor,
  currency_code,
  is_active,
  min_minor,
  max_minor,
  description,
  created_at,
  updated_at
)
VALUES
${catalogRows}
ON CONFLICT (module_key, unit_key) DO UPDATE
SET
  amount_minor = CASE
    WHEN price_catalog_entries.updated_by IS NOT NULL
      THEN price_catalog_entries.amount_minor
    ELSE EXCLUDED.amount_minor
  END,
  updated_by = price_catalog_entries.updated_by,
  currency_code = EXCLUDED.currency_code,
  is_active = true,
  min_minor = EXCLUDED.min_minor,
  max_minor = EXCLUDED.max_minor,
  description = EXCLUDED.description,
  updated_at = CASE
    WHEN price_catalog_entries.updated_by IS NOT NULL
      THEN price_catalog_entries.updated_at
    ELSE now()
  END;

INSERT INTO public.academy_courses (
  id,
  slug,
  title,
  summary,
  catalog_unit_key,
  global_rank,
  local_rank,
  trend_score,
  is_published,
  created_at,
  updated_at
)
VALUES
${courseRows}
ON CONFLICT (id) DO UPDATE
SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  catalog_unit_key = EXCLUDED.catalog_unit_key,
  global_rank = EXCLUDED.global_rank,
  local_rank = EXCLUDED.local_rank,
  trend_score = EXCLUDED.trend_score,
  is_published = true,
  updated_at = now();

INSERT INTO public.academy_exams (
  id,
  course_id,
  title,
  pass_score,
  questions_json,
  created_at,
  updated_at
)
VALUES
${examRows}
ON CONFLICT (course_id) DO UPDATE
SET
  title = EXCLUDED.title,
  pass_score = EXCLUDED.pass_score,
  questions_json = EXCLUDED.questions_json,
  updated_at = now();

-- HARD RESET: eski RAIL / jenerik tohumları tamamen düşür (büyüme SKU dışı — DELETE/PURGE).
DELETE FROM public.academy_certificates
WHERE course_id IN (${ACADEMY_LEGACY_PURGE_COURSE_IDS.map((id) => sqlString(id)).join(", ")})
   OR course_id NOT IN (${ACADEMY_SEED_COURSE_IDS.map((id) => sqlString(id)).join(", ")});

DELETE FROM public.academy_exam_attempts
WHERE exam_id IN (
  SELECT id FROM public.academy_exams
  WHERE course_id IN (${ACADEMY_LEGACY_PURGE_COURSE_IDS.map((id) => sqlString(id)).join(", ")})
     OR course_id NOT IN (${ACADEMY_SEED_COURSE_IDS.map((id) => sqlString(id)).join(", ")})
);

DELETE FROM public.academy_lesson_completions
WHERE course_id IN (${ACADEMY_LEGACY_PURGE_COURSE_IDS.map((id) => sqlString(id)).join(", ")})
   OR course_id NOT IN (${ACADEMY_SEED_COURSE_IDS.map((id) => sqlString(id)).join(", ")});

DELETE FROM public.academy_purchases
WHERE course_id IN (${ACADEMY_LEGACY_PURGE_COURSE_IDS.map((id) => sqlString(id)).join(", ")})
   OR course_id NOT IN (${ACADEMY_SEED_COURSE_IDS.map((id) => sqlString(id)).join(", ")});

DELETE FROM public.academy_exams
WHERE course_id IN (${ACADEMY_LEGACY_PURGE_COURSE_IDS.map((id) => sqlString(id)).join(", ")})
   OR course_id NOT IN (${ACADEMY_SEED_COURSE_IDS.map((id) => sqlString(id)).join(", ")});

DELETE FROM public.academy_courses
WHERE id IN (${ACADEMY_LEGACY_PURGE_COURSE_IDS.map((id) => sqlString(id)).join(", ")})
   OR id NOT IN (${ACADEMY_SEED_COURSE_IDS.map((id) => sqlString(id)).join(", ")});

DELETE FROM public.price_catalog_entries
WHERE module_key = 'academy'
  AND (
    unit_key IN (${ACADEMY_LEGACY_PURGE_CATALOG_UNITS.map((u) => sqlString(u)).join(", ")})
    OR (
      unit_key LIKE 'course:%'
      AND unit_key NOT IN (${ACADEMY_COURSE_SEEDS.map((row) => sqlString(row.catalogUnitKey)).join(", ")})
    )
  );
`;

  writeFileSync(OUT, sql, "utf8");
  process.stdout.write(`OK ${ACADEMY_COURSE_SEEDS.length} büyüme SKU → ${OUT}\n`);
}

main();
