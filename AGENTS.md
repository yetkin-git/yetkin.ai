<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Akademi üretim standardı

Hiçbir eğitim videosu Metin, Ses, Video, Görsel ve Müzik katmanlarından biri eksikken fırınlanamaz ve mühürlenemez.

Zorunlu sıra: (1) Metin — vatandaş dili, tek iş tek cümle, (2) Ses — `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS`, (3) Video — yerel `public/media/academy/micro/*-warmup.mp4`, (4) Görsel — `ACADEMY_SEALED_MEDIA_MODEL.IMAGE_GEN`, (5) Müzik — `ACADEMY_SEALED_MEDIA_MODEL.MUSIC_GEN`. Model kimliği, tempo ve ducking bu dosyada tekrarlanmaz. Ev `lib/kernel/ai/model-roles.ts` ve `lib/academy/production-standard.ts`.

3 aşamalı kontrol kapısı: taslak metin, gözden geçirme, son kontrol. Beş katman teyit edilmeden `--seal` basılamaz. Kapı `assertAcademyProductionSeal` (`lib/academy/production-standard.ts`). Ayrıntı `.system_docs/PEDAGOJI.md` ve `.system_docs/ANAYASA.md` B4. Kimlik dizesi `lib/kernel/ai/model-roles.ts` içindedir.
