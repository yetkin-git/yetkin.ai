# .system_docs — sistem belgeler

yetkin.ai — küçük ve orta ölçekli işletmenin günlük işini yapay zekâ ile hızlandıran çalışma masası.

Bu klasör kalıcı anayasa ve sistem belgeleridir. Ürün kodu buradaki markdown’ı import etmez. Ajan, operatör ve prebuild yüzeyi burayı okur.

**Dokunulmaz** yalnız Anayasa **A Katmanı (A1–A5)**tır. B Katmanı ve diğer belgeler ürünle birlikte güncellenir.

`/docs` günlük yap-boz ve raporlama alanıdır. `/docs` içindeki her dosya silinse bile `npm run build` ve testler yeşil kalmak zorundadır.

## Zorunlu belgeler

| Dosya | Ne yazar | Kod evi |
|-------|----------|---------|
| `ANAYASA.md` | **A Katmanı** (A1–A5) kırmızı çizgi. **B Katmanı** yaşayan mimari. | `lib/kernel`, `lib/academy`, `lib/junior` |
| `MANIFESTO.md` | Neden varız, pazar, kitle, gelir motorları. Gün 0 kahramanı AI Tezgâh’tır. | `lib/copy` |
| `URUN_VITRINI.md` | Canlı vitrin: 2 aktif oda + askıdaki Akademi. AI Tezgâh canlı. Dil kuralları. | `lib/tezgah/catalog.ts`, `lib/dronlar/kayit.ts` |
| `AI_MODEL_YONETIMI.md` | Super Admin 6 yuvalı ürün modeli. Akademi mühürlerine dokunmaz. | `lib/kernel/ai/product-models.ts` |
| `TEZGAH_KOTA.md` | Maliyet sınıfı kota havuzları ve çift kilitli domain. | `lib/tezgah/quota.ts`, `lib/tezgah/catalog.ts` |
| `PEDAGOJI.md` | İnsani dil felsefesi ve Ek-J Junior kuralları. | `lib/academy/lesson-text-standard.ts`, `lib/junior` |
| `AKADEMI_URETIM_ANAYASASI.md` | Kilitli model haritası, 0–5 aşama, stüdyo üretim rejimi. Silinemez. | `lib/kernel/ai/model-roles.ts` |
| `OPS_RUNBOOK.md` | Operatör indeksi (§1–§12). Ayrıntı `ops/` altındadır. | `scripts/ops-migrate-lib.ts`, `scripts/dron-new.ts` |
| `DRON_CLIENT_SPEC.md` | Native `/api/v1` sözleşmesi. AI Tezgâh web-only. | `packages/kernel`, `apps/rail-is` |
| `README.md` | Bu klasörün kendisini ve bilgi evlerini tarif eder. | — |
| `ops/ops-db.md` | Env, migrate, Super Admin, depolama, kota ve model tabloları. | `prisma/schema` |
| `ops/ops-dron.md` | Native CORS, hop sicili, 426. `**33 kayıt**` sayacı burada da durur. | `scripts/dron-new.ts` |
| `ops/ops-paytr.md` | Merchant ≠ Split, HMAC, canlı tanık. | `app/api/(kernel)/cron/paytr-reconcile` |
| `ops/ops-inngest.md` | Çift anahtar, valör, 503 çıkış. | `app/api/inngest` |

Geçmiş değerleme ve tur raporları `archived/docs_history/` içindedir. Canlı rapor dizisi `docs/` altındadır.
Klasörde mükerrer ev tutulmaz: aynı bilgiyi ikinci kez yazan dosya açılmaz, var olan kısaltılır.

Kimlik **Supabase Auth**, veri **Prisma**, gövde **Next.js** App Router (**B1: Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci**). Dronlar `@yetkin/kernel` ve `/api/v1` zarfını konuşur. Kamu vitrini 2 aktif oda + askıdaki Akademi ve kanıt URL’si (`/vize`). AI Tezgâh canlıdır. Freelancer kilitli motordur. Motor 2 keşif fazındadır.

PayTR iki porttur: Merchant (kamu nakit) ve Pazaryeri Split (Faz 2). Ayrıntı `ops/ops-paytr.md`.

Omurgayı bağlamak: `.env.example` → `.env.local`, sonra `npm run ops:migrate`. Çelişki hâlinde `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır.
