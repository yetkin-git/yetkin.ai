# .system_docs — dokunulmaz sistem belgeleri

yetkin.ai — mühürlü emek işletim sistemi.

Bu klasör kalıcı anayasa ve sistem belgeleridir. Ürün kodu buradaki markdown’ı import etmez. Ajan, operatör ve prebuild yüzeyi burayı okur.

`/docs` günlük yap-boz ve raporlama alanıdır. `/docs` içindeki her dosya silinse bile `npm run build` ve testler yeşil kalmak zorundadır.

## Beş zorunlu dosya

| Dosya | Neden zorunlu |
|-------|----------------|
| `ANAYASA.md` | Asil sicil 4 oda + 4 sığınak, 410 envanteri, `amountMinor`, `service_role` yasağı ve S43 kırmızı çizgilerinin insan SSOT’u. Yoksa proje anayasasız derlenmiş sayılır. |
| `MANIFESTO.md` | Anayasa’nın *neden* var olduğunu söyler; yerine geçmez. Vizyon sapması 13. oda baskısını doğurur. |
| `OPS_RUNBOOK.md` | Operatör bağlama SSOT’u (env, Direct Port, Super Admin, PayTR, Inngest, Storage CORS). Credential icat edilmez. |
| `STORAGE_CONTRACT.md` | Vatandaş/Studio nesne deposu yok (410). Akademi ders sesi `lesson-audios` dar istisnadır. Beşlinin beşincisi. |
| `README.md` | Bu klasörün kendisini ve `/docs` ayrımını tarif eder. |

İstemci ops (derleme beşlisi değildir): `DRON_CLIENT_SPEC.md` — yetkin.ai İş / Diyar B native ve ikincil istemcinin Bearer, JWT yenileme, Idempotency-Key ve 401/426 kuralları. Yeni auth modeli açmaz. Gün 0 gövde: `apps/rail-is` (paket `yetkin.ai-is`; Amiral `app/` değildir; mutlu yol + İşlerim/Tezgâh ekranları `src/screens`).

Eğitim anlatım anayasası (derleme beşlisi değildir): `PEDAGOJI.md` — iki katman: **Pedagoji Academy** (aktif; Konunun Hakkı / esnek seviye / Koray–Maya çift-AI diyalog / seviye-bazlı tempo / Zero-Cost Streaming yalnız diskte WAV’i olan derslerde / 5 perdeli montaj 18 SKU + 2 düz taslak istisna) ve **Pedagoji Junior** (10–18 yaş; donmuş / gelecek faz; üretim yok). «AI-Checking-AI» CI kapısı yoktur. Müfredat tohumu (`lib/academy/curricula/`) yalnız Bölüm A’ya hizalanır. Çelişkide `.system_docs/ANAYASA.md` bağlayıcıdır.

Kimlik **Supabase Auth** ile mühürlenir, veri **Prisma** üzerinden Postgres’e yazılır, gövde tek **Next.js** App Router uygulamasıdır (**Modüler Monolit + API-First Dron Sözleşmesi**). Çalışan 4 oda aynı kimlik ve defter omurgasını paylaşır; “4 oda” **nakit halkasının döndüğü** anlamına gelmez. Freelancer: ilan/teklif/mesajlaşma çalışır; lisanslı split henüz bağlı değilse accept **503**. Donmuş 8 oda 410 envanteridir.

Zarf tek v1’dir (**üçüncü zarf yasağı**; çift zarf P1 ile kapatıldı). `.system_docs/ANAYASA.md` Kırmızı çizgi 4. Altıncı sistem dosyası açılmaz. Yeni dış tüketici yalnız `/api/v1` konuşur.

PayTR omurga değil, **iki porttur:** Merchant (Akademi/üye işyeri) ve Pazaryeri Split (Freelancer). Ayrıntı Anayasa S43 ve `OPS_RUNBOOK.md` §4.

Omurgayı bağlamak: `.env.example` → `.env.local`, sonra `npm run ops:migrate`. Adımlar `.system_docs/OPS_RUNBOOK.md`. Çelişki hâlinde `.system_docs/ANAYASA.md` bağlayıcıdır.
