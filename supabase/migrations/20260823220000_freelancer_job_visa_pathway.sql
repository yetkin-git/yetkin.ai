-- Freelancer ilan vize kilidi (06-A). Organik ilan kelime piyangosuna düşmez.
ALTER TABLE public.freelancer_jobs
  ADD COLUMN IF NOT EXISTS visa_pathway_id TEXT NOT NULL DEFAULT 'uiux-urun-freelance';

UPDATE public.freelancer_jobs
SET visa_pathway_id = 'ai-agent-entegrasyon'
WHERE id IN (
  'fj_rail_icon_set',
  'fj_rail_ql_banners',
  'fj_rail_academy_copy',
  'fj_rail_devlabs_prompts',
  'fj_rail_seal_social'
);
