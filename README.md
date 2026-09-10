# yetkin.ai

Yetkinliğini kanıtlayan yapay zekâ eğitimleri. Öğrendiğini mühürle. Mührün kapıyı açsın. İşin güvende olsun.

Vatandaş ve dış dünya markası **yetkin.ai**. npm paketi `yetkin.ai`. Lab veritabanı (`yetkin_rail_lab`), Inngest app id (`yetkin-rail`) ve dizin yolu `apps/rail-is` operasyonel kimlik olarak durur.

## Faz 1 kamu vitrini — 3 oda

| Oda | Yol | Ne işe yarar |
|-----|-----|----------------|
| Panel | `/dashboard` | Kabuk, cüzdan şeridi, pasaport |
| Akademi | `/academy` | Kurs, müfredat, sınav, SHA-256 belge — **Faz 1 nakit** |
| Kariyer | `/career` | Akademi mühründen vize; nakit taşımaz |

**Motor 4 / Kamu Vitrini 3 Oda.** Freelancer (`/freelancer`) sicilde durur, kamu **410 Gone**; nakit iddiası taşımaz. Lisanslı Split bağlı değilken accept **503**. Junior (`/junior`) 18 yaş altı / veli odasıdır, üretim kilitli **410**. Sahte bakiye veya sahte CREDIT yazılmaz (fail-closed). Faz 1 tek nakit kanalı **PayTR Merchant** (B2C eğitim satışı).

Kimlik Supabase Auth, nakit tek `amountMinor` defteri, dış sözleşme `/api/v1`. Gövde **Modüler Monolit + API-First Dron Sözleşmesi**dir; Shared Kernel paketi veya mikroservis platformu değildir.

## Bağlama

Kalıcı belgeler `.system_docs/` altındadır (`ANAYASA.md`, `MANIFESTO.md`, `OPS_RUNBOOK.md`, `STORAGE_CONTRACT.md`). Günlük rapor `/docs` — build fixture değildir.

```
cp .env.example .env.local
npm install
npm run ops:migrate
npm run dev
```

Dron (Diyar B, `apps/rail-is`, paket `yetkin.ai-is`) mağaza ve vatandaş yüzünde **yetkin.ai** yazar. Faz 1 kapanana kadar yayın hattı donuktur.
