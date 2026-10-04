# FAZ 2 — Paket 2 Sonuç Raporu

Tarih: 4 Ekim 2026  
Durum: Süper Admin yayın anahtarı eklendi. SQL sıra listesi klasörden türer.  
İlke: Fiyat tutarı ve mühür kilitleri yerinde kaldı. Yayın hükmü veritabanı satırıdır.

---

## 1. Ne yapıldı

### 1.1 Yayında / Pasif anahtarı

Süper Admin kapısında `setAcademyCoursePublished({ slug, published, reason })` durur. Başka rol bu komutu çağırmaz.

Yazılan yerler:

| Yer | Ne değişir |
| --- | --- |
| `academy_courses.is_published` | Açık «Yayında», kapalı «Pasif». Satır yoksa karttan bir kez doğar. |
| `price_catalog_entries.is_active` | Aynı slug’ın `course:<slug>` satırı varsa aynı yöne çekilir. Satır yoksa fiyat uydurulmaz. |
| `price_catalog_decision_ledger` | Gerekçe yazılır. Eski tutar ve yeni tutar aynı sayıdır. |

Dokunulmayanlar: `amount_minor`, `updated_by`, disk mührü, model haritası, yeni tablo, yeni SQL dosyası.

Panel: Admin katalog tablosunda her kurs satırının yanında anahtar durur. Kurs olmayan birimlerde anahtar yoktur. Anahtar gerekçe ister. Gerekçe, fiyat defterinin yanında aynı süper admin oturumuna düşer.

Kod bayrakları kalktı: `ACADEMY_EC102_PUBLIC_RELEASE_OPEN`, `ACADEMY_SM103_PUBLIC_RELEASE_OPEN`, `ACADEMY_BOT104_PUBLIC_RELEASE_OPEN`, `ACADEMY_PR105_PUBLIC_RELEASE_OPEN`, `ACADEMY_OFF201_LAUNCH_SALE_OPEN`. Antre, vitrin ve satış bu sabitleri okumaz. Satın alma hâlâ üçü birden ister: satır yayında, aktif fiyat, diskte beş katman.

Pasif kursun antresi, lisansı olmayan ziyaretçiye 404 döner. Lisansı olan vatandaş dersine girmeye devam eder. Satır silinmez.

Site haritası istek anında «kartta var ve satır yayında» diye bakar. Veritabanı okunamazsa kart listesi kalır; harita boşalmaz.

### 1.2 SQL sıra kilidi

`scripts/ops-migrate-lib.ts` içindeki elle `EXPECTED_SQL` dizisi kalktı.

Kaynak, `supabase/migrations` klasörüdür. Dosya adı `14 haneli damga + alt çizgi + küçük harf, rakam veya alt çizgi + .sql` kalıbına uyar. Sıra, bu adların alfabetik sırasıdır. Damga başta durduğu için zaman sırası ile aynı kapıya çıkar. Kalıba uymayan dosya apply’i durdurur.

Anlam iğneleri durur. `assertSqlSealPlanComplete` hâlâ «bu SQL’in içinde şu hüküm var mı» der. Dosya listesiyle karıştırılmaz.

Bugünkü klasör 14 dosyadır. Türetilen liste, silinen diziyle aynıdır.

---

## 2. Güncellenen dosyalar

| Dosya | Ne değişti |
| --- | --- |
| `lib/kernel/admin/course-publish.ts` | Yayın komutu ve gövde denetimi. |
| `lib/kernel/admin/prisma-course-publish.ts` | Satır yazımı. Tutar kolonu güncellenmez. |
| `app/api/(kernel)/admin/catalog/publish/route.ts` | Süper Admin `PATCH`. |
| `lib/kernel/security/route-auth-map.ts` | Yeni yol `admin` kilidinde. |
| `components/kernel/admin-course-publish-switch.tsx` | Yayında / Pasif anahtarı. |
| `components/kernel/admin-catalog-list.tsx` | Kurs satırının yanında anahtar. |
| `app/(kernel)/admin/page.tsx` | Yayın satırlarını listeye verir. |
| `lib/kernel/admin/load.ts` | Kurs yayın durumunu okur. Yazmaz. |
| `lib/academy/pilot-sku.ts` | Kod bayrakları kalktı. |
| `lib/academy/published-catalog.ts` | Vitrin, satırdaki `is_published` değerini okur. |
| `lib/academy/course-cover.ts` | Yakında kabuğu kod bayrağına bakmaz. |
| `app/academy/[slug]/page.tsx` | Pasif kurs, lisanssız ziyaretçiye 404. |
| `app/academy/[slug]/oyna/page.tsx` | Pasif kursta ücretsiz önizleme kapalı. Lisans durur. |
| `app/sitemap.ts` | Yayınlı satırları istek anında süzer. |
| `app/api/(kernel)/wallet/top-up/route.ts` | Pasif kurs için nakit niyeti açılmaz. |
| `scripts/ops-migrate-lib.ts` | Elle SQL dizisi kalktı. Ad kalıbı ve iğneler durur. |
| `scripts/ops-migrate.ts` | Apply sırası klasörden gelir. |
| `scripts/ops-hosted-apply-preflight.ts` | Disk planı türetilen listeyi basar. |

---

## 3. Bilerek yerinde bırakılanlar

- Beş katman mühür kapısı ve model haritası.
- Canlı fiyat tutarı. Anahtar yalnız yayın ve katalog aktifliğini çevirir.
- `dynamicParams = false`. Vitrinde olmayan slug (eski adres, hazırlık kabuğu) yine 404’tür. Altı canlı kartın yolu derlemede durur. Pasif kararı istek anında okunur.
- Prisma migrasyon ikiz listesi. Bu paketin kilidi SQL klasörüdür.
- Kimlik kartı. Yeni eğitim hâlâ karta bir obje ister. Bu paket o işi yeniden yazmadı.

---

## 4. Doğrulama

| Kapı | Sonuç |
| --- | --- |
| `npx tsc --noEmit` | Geçti |
| `npx tsx scripts/verify-api-auth.ts --check` | Geçti. 61 yol. Yayın yolu `admin`. |
| `npm test` | 245 dosya, 1200 test, hepsi geçti |

1200, önceki 1196’ya yayın komutunun dört testinin eklenmiş halidir. Eski testler durur. SQL yüzeyi artık elle diziyi değil, klasör kalıbını arar.

Tarayıcıda anahtar tıklanmadı. Bu makinede `http://127.0.0.1:3000` ayakta değildi. Admin kapısı süper admin oturumu ister. Anahtarın davranışı birim testte ve tip denetiminde durur.

---

## 5. Hüküm

Yayın, süper admin oturumuyla `is_published` güncellemesidir. SQL sıra kilidi, klasörün kendisidir. Disk mührü parayı tutmaya devam eder. Anahtar, mührü olmayan kursu satışa çıkarmaz.
