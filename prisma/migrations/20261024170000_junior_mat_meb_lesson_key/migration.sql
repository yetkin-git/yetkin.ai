-- MEB 2026-2027 matematik şeridi. Tek cümle, tek geçiş.
-- CASE zincirlenmez: jr_06_mat-5 çarpan satırı jr_06_mat-1 olur,
-- jr_06_mat-26 kesir satırı jr_06_mat-5 olur. İkisi birbirine yazılmaz.
-- Bu dosya ikinci kez çalıştırılmaz. Prisma migration kaydı bunu bir kez uygular.
-- Yeniden uygulamak canlı jr_06_mat-5 satırını jr_06_mat-1 sanır.

UPDATE "junior_progress"
SET "lesson_key" = CASE "lesson_key"
  WHEN 'jr_06_mat-5' THEN 'jr_06_mat-1'
  WHEN 'jr_06_mat-6' THEN 'jr_06_mat-2'
  WHEN 'jr_06_mat-7' THEN 'jr_06_mat-3'
  WHEN 'jr_06_mat-14' THEN 'jr_06_mat-4'
  WHEN 'jr_06_mat-26' THEN 'jr_06_mat-5'
  WHEN 'jr_06_mat-27' THEN 'jr_06_mat-6'
  WHEN 'jr_06_mat-11' THEN 'jr_06_mat-7'
  WHEN 'jr_06_mat-12' THEN 'jr_06_mat-8'
  WHEN 'jr_06_mat-13' THEN 'jr_06_mat-9'
  WHEN 'jr_06_mat-15' THEN 'jr_06_mat-10'
  WHEN 'jr_06_mat-17' THEN 'jr_06_mat-11'
  WHEN 'jr_06_mat-28' THEN 'jr_06_mat-12'
  WHEN 'jr_06_mat-29' THEN 'jr_06_mat-13'
  WHEN 'jr_06_mat-30' THEN 'jr_06_mat-14'
  WHEN 'jr_06_mat-31' THEN 'jr_06_mat-15'
  WHEN 'jr_06_mat-32' THEN 'jr_06_mat-16'
  WHEN 'jr_06_mat-33' THEN 'jr_06_mat-17'
  WHEN 'jr_06_mat-22' THEN 'jr_06_mat-18'
  WHEN 'jr_06_mat-21' THEN 'jr_06_mat-19'
  WHEN 'jr_06_mat-34' THEN 'jr_06_mat-20'
  WHEN 'jr_06_mat-35' THEN 'jr_06_mat-21'
  WHEN 'jr_06_mat-36' THEN 'jr_06_mat-22'
  WHEN 'jr_06_mat-18' THEN 'jr_06_mat-23'
  WHEN 'jr_06_mat-19' THEN 'jr_06_mat-24'
  WHEN 'jr_06_mat-37' THEN 'jr_06_mat-25'
  WHEN 'jr_06_mat-38' THEN 'jr_06_mat-26'
  ELSE "lesson_key"
END
WHERE "lesson_key" IN (
  'jr_06_mat-5',
  'jr_06_mat-6',
  'jr_06_mat-7',
  'jr_06_mat-11',
  'jr_06_mat-12',
  'jr_06_mat-13',
  'jr_06_mat-14',
  'jr_06_mat-15',
  'jr_06_mat-17',
  'jr_06_mat-18',
  'jr_06_mat-19',
  'jr_06_mat-21',
  'jr_06_mat-22',
  'jr_06_mat-26',
  'jr_06_mat-27',
  'jr_06_mat-28',
  'jr_06_mat-29',
  'jr_06_mat-30',
  'jr_06_mat-31',
  'jr_06_mat-32',
  'jr_06_mat-33',
  'jr_06_mat-34',
  'jr_06_mat-35',
  'jr_06_mat-36',
  'jr_06_mat-37',
  'jr_06_mat-38'
);
