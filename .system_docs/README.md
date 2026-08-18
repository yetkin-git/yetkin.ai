# .system_docs — dokunulmaz sistem belgeleri

Yetkin Rail — mühürlü emek işletim sistemi.

Bu klasör kalıcı anayasa ve sistem belgeleridir. Ürün kodu buradaki markdown’ı import etmez. Ajan, operatör ve prebuild yüzeyi burayı okur.

`/docs` günlük yap-boz ve raporlama alanıdır. `/docs` içindeki her dosya silinse bile `npm run build` ve testler yeşil kalmak zorundadır.

## Beş zorunlu dosya

| Dosya | Neden zorunlu |
|-------|----------------|
| `ANAYASA.md` | 12 oda tavanı, `amountMinor`, `service_role` yasağı ve S43 kırmızı çizgilerinin insan SSOT’u. Yoksa proje anayasasız derlenmiş sayılır. |
| `MANIFESTO.md` | Anayasa’nın *neden* var olduğunu söyler; yerine geçmez. Vizyon sapması 13. oda baskısını doğurur. |
| `OPS_RUNBOOK.md` | Operatör bağlama SSOT’u (env, Direct Port, Super Admin, PayTR, Inngest, Storage CORS). Credential icat edilmez. |
| `STORAGE_CONTRACT.md` | Studio nesne depo, imzalı PUT, CORS ve `service_role` yok sözleşmesi. Kör `data_base64` DROP yoktur. |
| `README.md` | Bu klasörün kendisini ve `/docs` ayrımını tarif eder. |

İstemci ops (derleme beşlisi değildir): `DRON_CLIENT_SPEC.md` — Rail İş / Diyar B native ve ikincil istemcinin Bearer, JWT yenileme, Idempotency-Key ve 401/426 kuralları. Yeni auth modeli açmaz. Gün 0 gövde: `apps/rail-is` (Amiral `app/` değildir; mutlu yol + İşlerim/Tezgâh ekranları `src/screens`).

Kimlik **Supabase Auth** ile mühürlenir, veri **Prisma** üzerinden Postgres’e yazılır, gövde tek **Next.js** App Router uygulamasıdır. On iki oda aynı nakit defteri ve aynı LLM gümrüğünü paylaşır.

Teknik borç (çift zarf, **üçüncü zarf yasağı**) `.system_docs/ANAYASA.md` Kırmızı çizgi 4 altındadır. Altıncı sistem dosyası açılmaz. Yeni dış tüketici yalnız `/api/v1` konuşur.

Omurgayı bağlamak: `.env.example` → `.env.local`, sonra `npm run ops:migrate`. Adımlar `.system_docs/OPS_RUNBOOK.md`. Çelişki hâlinde `.system_docs/ANAYASA.md` bağlayıcıdır.
