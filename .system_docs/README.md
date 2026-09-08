# .system_docs — dokunulmaz sistem belgeleri

yetkin.ai — mühürlü emek işletim sistemi.

Bu klasör kalıcı anayasa ve sistem belgeleridir. Ürün kodu buradaki markdown’ı import etmez. Ajan, operatör ve prebuild yüzeyi burayı okur.

`/docs` günlük yap-boz ve raporlama alanıdır. `/docs` içindeki her dosya silinse bile `npm run build` ve testler yeşil kalmak zorundadır.

## Beş zorunlu dosya

| Dosya | Neden zorunlu |
|-------|----------------|
| `ANAYASA.md` | **A Katmanı** (A1–A5): `amountMinor`, tek defter, S43, RLS/IDOR, sunucu mühür, dürüst yüzey. **B Katmanı** (B1–B5): modüler monolit, odaklar, prebuild, müfredat, entegrasyon. Yoksa proje anayasasız derlenmiş sayılır. |
| `MANIFESTO.md` | Anayasa’nın *neden* var olduğunu söyler; yerine geçmez. Vizyon sapması odak şişmesini doğurur. |
| `OPS_RUNBOOK.md` | Operatör bağlama SSOT’u (env, Direct Port, Super Admin, PayTR, Inngest, Storage CORS). Credential icat edilmez. |
| `STORAGE_CONTRACT.md` | Vatandaş/Studio nesne deposu yok (410). Akademi mühürlü WAV **2** (`01_office_ai-1`, `01_office_ai-2`). `lesson-audios` yayın vaadi değildir. Beşlinin beşincisi. |
| `README.md` | Bu klasörün kendisini ve `/docs` ayrımını tarif eder. |

İstemci ops (derleme beşlisi değildir): `DRON_CLIENT_SPEC.md` — yetkin.ai İş / Diyar B native ve ikincil istemcinin Bearer, JWT yenileme, Idempotency-Key ve 401/426 kuralları. Yeni auth modeli açmaz. Gün 0 gövde: `apps/rail-is` (paket `yetkin.ai-is`; Amiral `app/` değildir; mutlu yol + İşlerim/Tezgâh ekranları `src/screens`).

Eğitim anlatım ve pedagoji ilkeleri (derleme beşlisi değildir): `PEDAGOJI.md` — Canlı standart **Aşama 1 compact markdown**’dır. Ses mührü ve bake sayıları vizyona yazılmaz; `docs/OPS_STUDYO_SAYILARI.md`. Amiral SKU `01_office_ai`. Sabit 6 bölüm / kelime tavanı makale gövdesini kesmez. Çelişkide `.system_docs/ANAYASA.md` bağlayıcıdır.

Kimlik **Supabase Auth** ile mühürlenir, veri **Prisma** üzerinden Postgres’e yazılır, gövde tek **Next.js** App Router uygulamasıdır (**B1: Pragmatik Modüler Monolit**). Dron ve harici tüketiciler **B1 dış sözleşmesi** ile `/api/v1` JSON zarfını konuşur; Amiral RSC yükler. Çalışan odaklar (`dashboard`, `academy`, `career`, `freelancer`) aynı kimlik ve defter omurgasını paylaşır; “odak” **nakit halkasının döndüğü** anlamına gelmez. Freelancer: ilan/teklif/mesajlaşma çalışır; lisanslı split henüz bağlı değilse accept **503** (A2). Donmuş 8 oda 410 envanteridir. B2, bildirim/yardım/analitik gibi meşru genişlemeyi “13. oda” dogmasına takmadan izin verir.

PayTR omurga değil, **iki porttur:** Merchant (Akademi/üye işyeri) ve Pazaryeri Split (Freelancer). Ayrıntı Anayasa **A2 (S43)** ve `OPS_RUNBOOK.md` §4.

KVKK m.11 (hesap silme / veri indirme) ürün içi self-serve değildir; Super Admin `destek@yetkin.ai` kuyruğundan manuel yürütür. Süreç notu: `OPS_RUNBOOK.md` §18.

Omurgayı bağlamak: `.env.example` → `.env.local`, sonra `npm run ops:migrate`. Adımlar `.system_docs/OPS_RUNBOOK.md`. Çelişki hâlinde `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır; B Katmanı yaşayan ops/mühendislik notudur.
