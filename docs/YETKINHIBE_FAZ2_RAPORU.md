# yetkin.ai — YetkinHibe Faz 2 Raporu

**Tarih:** 23 Kasım 2026
**Kapsam:** Faz 2A (kurum şablonları, tablolu DOCX/PDF, mevzuat izi, şartname RAG) zaten ağaçtaydı. Bu tur Faz 2’nin ikinci yarısını bağladı: F2.4, F2.5, F2.6, F2.8, F2.9, F2.10.
**Kural:** Mevcut mühürler ve “sen” aksı bozulmadan. Tutar uydurulmadı. Sahte onay üretilmedi.

---

## 1. Ne tamamlandı

### F2.4 / F2.5 — Başvuru sonrası yaşam döngüsü ve evrak kasası

`hibe_applications` ve `hibe_documents` eklendi. Faz sırası `APPLICATION_APPROVAL → INTERIM_REPORT → INVOICE_SGK → AUDITOR_VISIT → PAYOUT`. Atlama ve geri dönüş reddedilir.

Evrak kategorileri: `VERGI_LEVHASI`, `SGK_HIZMET`, `FATURA_MAKBUZ`, `TEKNIK_RAPOR`, `DIGER`. Durumlar: `approved` (Onaylı), `pending` (Bekliyor), `missing` (Eksik), `rejected` (Red). Durum hesap sahibinin kaydıdır; kurum kararı değildir.

Kritik uyarı yalnız 7, 3 ve 1 İstanbul takvim günü kala üretilir. Aynı bant ikinci mektup açmaz (`last_reminder_days`). Mektup `/panel/hibe?sekme=basvuru` adresine gider.

Rotalar (hepsi `auth = "session"`, yazmalarda `Idempotency-Key`, satır `user_id` ile):

| Rota | İş |
|---|---|
| `GET/POST /api/yetkinhibe/applications` | Liste ve yeni başvuru |
| `PATCH /api/yetkinhibe/applications/[id]/phase` | Sıradaki faz |
| `POST/PATCH /api/yetkinhibe/applications/[id]/documents` | Evrak ekle / durum güncelle |

Günlük iş: Inngest `hibe-lifecycle-reminders`, `TZ=Europe/Istanbul 30 8 * * *`. Kernel `lib/yetkinhibe` import etmez; kanca `register-grant-hooks.ts` içindedir.

### F2.6 / F2.8 — Ajans portföyü ve katalog fiyatı

`hibe_clients` ajans hesabının müşteri kartıdır (`user_id` = ajans). Kokpit **Ajans Modu** sekmesi kart ekler ve `matchAgencyClientsToCatalog` ile açık, doğrulanmış çağrı matrisini basar.

Kartta yatırım odağı ve patent yoktur. Bu eksende kısıt taşıyan çağrı uyum listesine girmez; “eksik” diye işaretlenir. Uydurma odak yazılmaz.

`PriceCatalogEntry` açılabilir birimleri:

| moduleKey | unitKey | Anlam |
|---|---|---|
| `hibe` | `dossier` | YetkinHibe dosya satırı |
| `hibe` | `agency` | YetkinHibe ajans satırı |

Satır yoksa tutar basılmaz. Satın alma düğmesi hâlâ tahsil edilen `tezgah` / `grant-dossier` satırını gösterir. `hibe/dossier` ve `hibe/agency` ayrı etiket olarak okunur; iki tutar birbirinin yerine geçmez.

### F2.9 — Kişiselleştirilmiş haftalık radar

Genel ilk 3 çağrı kalktı. Üyenin `HibeCompanyProfile` kaydı (il, NACE, kitle, ölçek ve kayıtlı diğer eksenler) AND kapısından geçmeyen çağrı mektuba girmez. Profil yoksa “profilin kayıtlı değil” yazar; çağrı uydurulmaz. Bağlantı `HIBE_PANEL_PATH` = `/panel/hibe`.

### F2.10 — E-ticaret köprüsü

Hibe şeridi `sourceVerifiedAt == null` satırı atlar; üstüne açık pencere ve 30 günlük tazelik şartı durur. Mağaza bağlantısı `store` kimliği varken `/panel/hibe?sekme=analiz&store=...` açar. Kategori metni NACE’ye ancak sözlük eşleşirse döner. Ürün sayısı ölçeği esnaf / KOBİ olarak doldurur. Çalışan ve yaş uydurulmaz. Mağaza sahibi değilsen kart okunmaz.

### Kokpit

`/panel/hibe` sekmeleri: Firma analizi, rehber, proje dosyası, arşiv, **Başvurularım & Evraklar** (5 faz çubuğu, son tarih sayacı, evrak durumu), **Ajans Modu** (müşteri formu ve uyum matrisi).

---

## 2. RLS

Yeni tablolar `RLS_FORCE_TABLES` içindedir: `hibe_applications`, `hibe_documents`, `hibe_clients`.

Migration `prisma/migrations/20261123220000_yetkinhibe_faz2_lifecycle/migration.sql` idempotenttir: `ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`, `rls_deny_unscoped` (`USING (false)`), `yetkin_apply_rls_owner_policies`. Yazma politikası (`FOR INSERT` / `UPDATE` / `DELETE`) üretilmez.

Müşteri bağlantısı sütun adı `hibe_client_id`dir. RLS sicilindeki `client_id` bir kullanıcı kimliğidir; müşteri kartı kimliğiyle aynı adı taşıması, o sütunu da sahip politikasına sokardı. Sahip kolonu `user_id`dir.

Bu oturumda migration canlı veritabanına uygulanmadı. `verify:rls-status` sicil ve şema karşılaştırmasıdır.

---

## 3. Kapı kanıtı

| Kapı | Komut | Sonuç |
|---|---|---|
| Tip | `npx tsc --noEmit` | exit 0 |
| Dil aksı | `npm run verify:sen-axis` | OK — 562 dosya, 41 siz kaçağı tarandı |
| Sınır | `npm run verify:boundaries` | OK |
| API auth | `npm run verify:api-auth -- --check` | OK — 164 rota (`session:101, public:27, closed:11, cron:2, admin:15, webhook:8`) |
| RLS | `npm run verify:rls-status` | OK — `hibe_applications`, `hibe_documents`, `hibe_clients` sicilde |
| Giz | `npm run verify:no-secrets` | OK |
| Test | `npx vitest run tests/yetkinhibe-core tests/tezgah tests/commerce` | **70 dosya / 505 test** geçti |
| Derleme | `npx next build` | exit 0 (Next.js 16.3.1, yaklaşık 180 sn). `/panel/hibe` ve yeni YetkinHibe rotaları çıktıda |

Faz 2A kurum şablonu, tablolu DOCX/PDF ve şartname atıfı `tests/yetkinhibe-core/faz2-institution.test.ts` ile duruyor (6 test, bu turda da geçti). Faz 2B akışları `tests/yetkinhibe-core/faz2b-lifecycle.test.ts` ve `tests/commerce/grant-ribbon.test.ts` içindedir.

Tezgâh yüzey testi, hibe raporunun `window.print()` çağırdığını bekliyordu. Ekran Word ve PDF indirme düğmesi basıyor. Beklenti bu düğmelere çekildi.

Oturum açılmış kokpit tarayıcıda tıklanmadı. Derleme ve birim testleri rotaları ve sekme metnini doğruladı; giriş duvarının ardındaki form gönderimi bu oturumda yok.
