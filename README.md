# yetkin.ai

Güvenli kariyer ve iş platformu. Öğrendiğini mühürle. Mührün kapıyı açsın. İşin emanette dursun.

Vatandaş ve dış dünya markası **yetkin.ai**. npm paketi `yetkin.ai`. Lab veritabanı (`yetkin_rail_lab`), Inngest app id (`yetkin-rail`) ve dizin yolu `apps/rail-is` operasyonel kimlik olarak durur.

## Dört çalışan oda

| Oda | Yol | Ne işe yarar |
|-----|-----|----------------|
| Anasayfa | `/dashboard` | Kabuk, cüzdan şeridi, pasaport |
| Akademi | `/academy` | Kurs, müfredat, sınav, SHA-256 belge |
| Kariyer | `/career` | Akademi mühründen vize |
| Freelancer | `/freelancer` | İlan, teklif, mesajlaşma; kabul/emanet henüz bağlı değil |

“Çalışan 4 oda” **nakit iddiası taşımaz.** Freelancer: ilan, teklif, mesajlaşma çalışır; lisanslı split henüz bağlı olmadığından iş kabulü/emanet (accept) **503 Service Unavailable** döner. Sahte bakiye veya sahte CREDIT yazılmaz (fail-closed).

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
