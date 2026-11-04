# Tedavi Raporu 03 — Admin GA4 Data API

Tarih: 2026-10-31  
Kaynak: `docs/tespit_raporu_03.md`  
Kapsam: süper yönetici `/admin` panosuna salt okunur GA4 kartı. Defter (Postgres hunisi) yerinde durur. Looker çerçevesi eklenmedi. Yeni tablo yok.

Üretim mülk numarası ve servis hesabı bu turda repoya yazılmadı. Vercel paneli açılmadı. Kimlik boşken kart sayı uydurmaz.

## Özet

| İş | Sonuç |
|---|---|
| Bağımlılık | `@google-analytics/data` `^7.3.0`. Yalnız sunucu okuyucusu import eder. |
| Okuyucu | `lib/kernel/telemetry/ga4-data-client.ts`, `server-only`. REST (`fallback: true`). |
| Kimlik | `GA4_PROPERTY_ID` ve servis hesabı (JSON, Base64 veya e-posta + PEM). Dosya yolu okunmaz. |
| Kapalı kimlik | `unavailable`. Uygulama düşmez. Sıfır, yalnız rapor gerçekten sıfırsa. |
| Kart | Huni panosunun altında `AdminGa4Board`. Kapı `isSuperAdminActor`. |
| Kota | Süreç içi önbellek: başarı 3 dakika, hata 1 dakika. Okuma tavanı 8 saniye. |
| CSP | `analyticsdata.googleapis.com` eklenmedi. Tarayıcı Data API çağırmaz. |

---

## ADIM 1 — Bağımlılık ve sunucu istemcisi

Kök `package.json` içine `@google-analytics/data` eklendi. Kilit dosyası aynı paketi taşır. `@google/genai` yerinde durur; o istemci Analytics değildir.

Okuma modülü `lib/kernel/telemetry/ga4-data-client.ts`. İlk satır `import "server-only"`. `@google-analytics/data` bu dosyanın dışında `lib/`, `app/` ve `components/` altında import edilmez. İstemci bileşeni bu modülü çekmez. Pano bileşeni yalnız düz tipleri ve etiketleri alır (`ga4-admin-types.ts`, `ga4-display.ts`).

`next.config.ts` `serverExternalPackages` listesine `@google-analytics/data` ve `google-gax` yazıldı. Next bu paketleri sunucu fonksiyonunda Node `require` ile bırakır; webpack gRPC grafiğini sayfaya gömmez. İstemci `fallback: true` ile HTTP/1.1 REST kullanır. Tarayıcı `analyticsdata.googleapis.com` görmez. CSP’ye bu köken eklenmedi.

### Kimlik

Ölçüm kimliği (`NEXT_PUBLIC_GA_ID`, `G-…`) Data API kimliği değildir. Okuyucu onu kullanmaz.

| Değişken | İş |
|---|---|
| `GA4_PROPERTY_ID` | Sayısal mülk. `properties/` öneki soyulur. `G-` ve boş değer reddedilir. |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Tek satır JSON. Doluysa diğer sır biçimleri okunmaz. Bozuk JSON, alttaki Base64’e düşmez. |
| `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` | JSON boşsa Base64 gövde. |
| `GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | İkisi de boş değilse. PEM içindeki `\n` kaçışı açılır. |

`GOOGLE_APPLICATION_CREDENTIALS` dosya yolu okunmaz. JSON diske yazılmaz. Ayrıştırılan hesapta yalnız `client_email` ve `private_key` istemciye verilir. Anahtar günlük satırına ve karta yazılmaz. 64 bin karakteri aşan gövde reddedilir.

Eksik, boş veya biçimsiz kimlik `unavailable` döner. İstisna sayfayı 500 yapmaz. `lib/kernel/env.ts` şemasına aynı anahtarlar isteğe bağlı dizge olarak eklendi; `.env.example` boş atama taşır. Şablon ile şema anahtar listesi birebirdir.

---

## ADIM 2 — Anlık ziyaretçi, kaynak, ülke

İki dışa aktarılan okuma vardır.

**`runRealtimeReport`.** `activeUsers`, `minuteRanges` 29 dakikadan 0’a (son 30 dakika). Boyut yok. Bu kart canlı soket değildir. `client_id` ve `user_id` seçilmez.

**`runReport`.** Aralık huni ile aynı üç penceredir: `today`, `7d`, `30d`. Sınırlar `Europe/Istanbul` takvim günüdür; bitiş günü dahildir. İki çağrı vardır, ikisi de `sessions` metriğidir:

- `sessionDefaultChannelGroup`
- `country`

Her çağrı en fazla 8 satır, oturuma göre azalan, boş satır istemez. Kota gövdesi istenmez. İkinci tur boyutları (sayfa yolu, cihaz, açılış) yoktur.

Boş satır listesi gerçek sıfırdır: kart “bu pencerede oturum yok” der, kanal adı uydurmaz. Metrik sayıya dönmezse (`12.5` gibi) kart kapanır; o değer sıfır diye basılmaz. `"0"` ise sıfır basılır.

### Önbellek

Süreç içi `Map`. Anahtar mülk, servis hesabı e-postası ve penceredir. Başarı 3 dakika, hata 1 dakika. Aynı anda gelen ikinci anlık okuma tek isteğe iner. Postgres’e GA satırı yazılmaz. Sunucusuzda her izolatın kendi kovası vardır; bu, Google kotasını sıfırlamaz, aynı süreçteki tekrarı keser.

Okuma 8 saniyede dönmezse kart `unavailable` olur. Huni sorgusu bu çağrıyı beklemez: GA yuvası `Suspense` içindedir.

---

## ADIM 3 — `/admin` kartı

Sayfa hâlâ `resolveSuperAdminAccess` ile açılır. Katalog ve huni yüklemesi eskisi gibidir. GA yuvası onların `Promise.all` listesinde değildir.

`loadAdminGa4Board` aktörü `isSupabaseUserId` ve `isSuperAdminActor` ile yoklar. Eşleşmezse API çağrılmaz, sonuç `forbidden`. Bileşen bu sonucu sayıya çevirmez. Oturumsuz istek kenarda eskisi gibi girişe döner (`next=/admin/catalog`). Yeni bir “analytics admin” rolü yok.

Kart huninin hemen altındadır, katalog listesinin üstündedir. Başlık: **GA4 Canlı Trafik ve Kaynak Analizi**. Üç parça:

| Kart | Ne |
|---|---|
| Şu an | Son 30 dakika aktif kullanıcı |
| Kaynak | Kanal grubu × oturum |
| Ülke | Ülke × oturum |

Metin, bu sayıların huni gösterimi ve SETTLED kişi olmadığını söyler. İkisi birbirine bölünmez. Satış kararı defterde kalır.

Kimlik yoksa, API düşünce veya her iki okuma da kapanırsa kartta sayı yoktur. Cümle: **Ölçüm yapılamadı / Yapılandırma bekleniyor.** Yüklenirken **Ölçüm okunuyor.** Anlık okuma düşüp kaynak okuması durursa yalnız düşen kart kapanır; duran kart kendi sayısını basar.

Bilinen kanal adları Türkçe etikete çevrilir (`Organic Search` → Organik arama). Bilinmeyen ad olduğu gibi kalır. Ülke adı çevrilmez. `(not set)` “Belirsiz”dir.

Yeni HTTP rotası açılmadı. Huni sayfası da kendi BFF’ini çağırmaz; ikisi de sunucuda okur. Ayrı bir GA rotası yetki haritasını genişletmeden durur. `verify:api-auth --check` hâlâ 77 rota, `admin` 3.

---

## ADIM 4 — Doğrulama

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit` | Geçti. |
| `npx eslint` (dokunulan dosyalar) | Geçti. |
| `npx vitest run` | 1957 geçti, 10 kaldı. Kalan 10 test Akademi mühürlü ses süreleridir (`01_office_ai` timings). GA4, env şablonu ve huni yüzey testleri geçti. |
| `npm run verify:boundaries` | Geçti. |
| `npm run verify:no-secrets` | Geçti. PEM, `service_role` JWT ve dolu yasaklı örnek anahtar yok. |
| `npm run verify:api-auth -- --check` | Geçti. 77 rota. |

Tarayıcı: oturumsuz `http://localhost:3000/admin` giriş sayfasına düşer (`/login?next=/admin/catalog`). O ekranda GA kartı ve trafik sayısı yoktur. Süper yönetici oturumu bu turda açılmadı; kartın sayı basması birim testte, sahte sıfırın basılmaması aynı testte durur.

---

## Güvenlik

- Sır repoda yok. `.env.example` değerleri boş.
- Servis hesabı dosyası (`serviceAccount.json`) oluşturulmadı ve okunmadı.
- İstemci paketine Analytics Data istemcisi girmez.
- Ziyaretçi kimliği istenmez ve saklanmaz.
- Hata gövdesi karta ve yapılandırılmış günlük satırına yazılmaz.
- Çocuk profiline oturum veya `user_id` eşlemesi eklenmedi.
- Huni defteri (`funnel_daily_counters` ve iş tabloları) bu okumayla birleşmez.
