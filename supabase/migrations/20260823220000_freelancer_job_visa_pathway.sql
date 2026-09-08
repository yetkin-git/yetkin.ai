-- Freelancer ilan vize kilidi (06-A). Organik ilan kelime piyangosuna düşmez.
ALTER TABLE public.freelancer_jobs
  ADD COLUMN IF NOT EXISTS visa_pathway_id TEXT NOT NULL DEFAULT 'uiux-urun-freelance';

-- Tohum kapıları Büyüme Beşlisi 1:1 + Açık Deneme. Tek-kapı backfill (ai-agent-entegrasyon) ezilmez.
UPDATE public.freelancer_jobs
SET visa_pathway_id = CASE id
  WHEN 'fj_rail_icon_set' THEN 'excel-veri-otomasyon'
  WHEN 'fj_rail_ql_banners' THEN 'eticaret-pazaryeri'
  WHEN 'fj_rail_seal_social' THEN 'logo-gorsel-sosyal-medya'
  WHEN 'fj_rail_academy_copy' THEN 'chatbot-musteri-hizmetleri'
  WHEN 'fj_rail_devlabs_prompts' THEN 'prompt-uretkenlik'
  WHEN 'fj_yetkin_acik_deneme' THEN 'acik-deneme'
  ELSE visa_pathway_id
END
WHERE id IN (
  'fj_rail_icon_set',
  'fj_rail_ql_banners',
  'fj_rail_seal_social',
  'fj_rail_academy_copy',
  'fj_rail_devlabs_prompts',
  'fj_yetkin_acik_deneme'
);
