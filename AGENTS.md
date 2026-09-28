<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Akademi üretim standardı

Hiçbir eğitim videosu Metin, Ses, Video, Görsel ve Müzik katmanlarından biri eksikken fırınlanamaz ve mühürlenemez.

Zorunlu sıra: (1) Metin — vatandaş dili, tek iş tek cümle, (2) Ses — Gemini 3.8 Flash TTS, `atempo=0.93`, EBU R128, (3) Video — yerel `public/media/academy/micro/*-warmup.mp4` reuse, otomatik Veo 3.1 API iptal, ilk 6–8 sn ısınma klibi, (4) Görsel — Nano Banana 2, 4K canlı uygulama kartları, (5) Müzik — Lyria 3.5, vokalsiz fon müziği yatağı, -22 dB ducking.

3 aşamalı kontrol kapısı: taslak metin (senaryo ve chunking), gözden geçirme (pedagoji, jargon ve aforizma taraması), son kontrol. Beş katman teyit edilmeden `--seal` basılamaz. Kapı `assertAcademyProductionSeal` (`lib/academy/production-standard.ts`). Ayrıntı `.system_docs/PEDAGOJI.md`, `.system_docs/ANAYASA.md` B4 ve `.cursorrules` kilit bölümündedir. Kimlik dizesi `lib/kernel/ai/model-roles.ts` içindedir.
