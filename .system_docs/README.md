# .system_docs — sistem belgeler

yetkin.ai — mühürlü emek işletim sistemi.

Bu klasör kalıcı anayasa ve sistem belgeleridir. Ürün kodu buradaki markdown’ı import etmez. Ajan, operatör ve prebuild yüzeyi burayı okur.

**Dokunulmaz** yalnız Anayasa **A Katmanı (A1–A5)**tır. B Katmanı, Manifesto, Pedagoji ve Dron spec yaşayan belgelerdir.

`/docs` günlük yap-boz ve raporlama alanıdır. `/docs` içindeki her dosya silinse bile `npm run build` ve testler yeşil kalmak zorundadır.

## Beş zorunlu dosya

| Dosya | Neden zorunlu |
|-------|----------------|
| `ANAYASA.md` | **A Katmanı** (A1–A5) kırmızı çizgi. **B Katmanı** yaşayan mimari. |
| `MANIFESTO.md` | Anayasa’nın *neden* var olduğunu söyler. |
| `OPS_RUNBOOK.md` | Operatör bağlama indeksi; ayrıntı `ops/` altındadır. |
| `STORAGE_CONTRACT.md` | Vatandaş/Studio nesne deposu yok. Akademi mühürlü yayın **9**. |
| `README.md` | Bu klasörün kendisini tarif eder. |

İstemci ops: `DRON_CLIENT_SPEC.md` — Bearer, JWT yenileme, Idempotency-Key, 401/426. Shared Kernel `@yetkin/kernel` paketidir.

Eğitim: `PEDAGOJI.md` — Yayın = Makale + Mühürlü Karaoke. Sayılar `docs/DURUM.md` ve koddadır. Bake SOP `docs/ops/akademi-bake-elkitabi.md` içindedir.

Kimlik **Supabase Auth**, veri **Prisma**, gövde **Next.js** App Router (**B1: Pragmatik Modüler Monolit + API-First**). Dronlar `@yetkin/kernel` ve `/api/v1` zarfını konuşur. Kamu vitrini Panel + Akademi + Kariyer + kanıt URL’si (`/vize`). Freelancer kilitli motordur. Motor 2 keşif fazındadır.

PayTR iki porttur: Merchant (kamu nakit) ve Pazaryeri Split (Faz 2). Ayrıntı `ops/ops-paytr.md`.

Omurgayı bağlamak: `.env.example` → `.env.local`, sonra `npm run ops:migrate`. Çelişki hâlinde `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır.
