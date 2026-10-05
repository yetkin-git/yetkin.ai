# FAZ 1 (AŞAMA 3) — Kazanım omurgası inşa raporu

| Alan | Değer |
|------|--------|
| Tarih | 5 Ekim 2026 |
| Kime | SUPER_ADMIN |
| Konu | Onaylanan tasarımın Adım A ve Adım B uygulaması, vitrin temizliği |
| Zemin | `docs/FAZ1_KAZANIM_OMURGASI_TASARIMI.md` |
| Kapı | `JUNIOR_PRODUCTION_LOCKED` ve `DRON_JUNIOR_OPEN` değişmedi. Checkout `not_configured`. |

Hukuk metni mühürlenmedi. `JUNIOR_GUARDIAN_NOTICE` null duruyor. Sahte sürüm dizesi yazılmadı. 20 ders ve 30 soru TypeScript arşivinde kaldı.

---

## 1. Şema

`prisma/schema/junior.prisma`

Yeni model `JuniorGuardianConsent`, tablo `junior_guardian_consents`. `updated_at` yok. Her onay yeni satırdır.

| Kolon | Kural |
|-------|--------|
| `guardian_user_id` | Onayı veren hesap. Kullanıcı silinince satır düşmez (`ON DELETE RESTRICT`). |
| `profile_id` | Çocuk profili. Boşalabilir (`ON DELETE SET NULL`). |
| `consent_version` | `junior-notice-YYYY-MM-DD`. 6502 sürümü `2026-09-05` bu kalıba girmez. |
| `notice_sha256` | 64 karakter küçük harf hex. |
| `guardian_declared_adult` | Yalnız `true`. |
| `guardian_birth_year` | Beyan. Kimlik sorgusu yok. |
| `consent_at` / `created_at` | Onay anı ve satırın yazıldığı an. |
| `erased_at` | Çocuk verisi silinince dolar. Doluysa `profile_id` boştur. |

`JuniorProfile` yeni alanları:

| Kolon | Kural |
|-------|--------|
| `active_consent_id` | Güncel rıza. Tekil. Boş olabilir. Eski profiller düşmez. |
| `birth_year` | Dolu profilde yaş aralığı. Kapanışta boş. Boşsa takma ad `Kapalı`, seçim kapalı, seçmeli dizi boş, aktif rıza boş. |

`users` ilişkisi `juniorGuardianConsents`. RLS listesi `lib/kernel/security/rls-policy-registry.ts` içine `junior_guardian_consents` girdi. Sahiplik kolonu zaten `guardian_user_id`. PostgREST yazma politikası yok. FORCE RLS, mevcut olay tetikleyicisi yeni tabloya basar.

Güncelleme tetikleyicisi `yetkin_junior_guardian_consent_append_only` yalnız şuna izin verir: `profile_id` boşalsın, `erased_at` bir kez yazılsın. Silme ve diğer kolon değişiklikleri reddedilir.

`junior_subscriptions` ve `list_price_minor = 549900` kilidi bu migrasyonda durur.

## 2. Migrasyon ve tohum

| Dosya | İş |
|-------|-----|
| `prisma/migrations/20261005160000_junior_guardian_consent/migration.sql` | Rıza tablosu, profil bağı, kapanış `CHECK`, append-only tetikleyici. |
| `supabase/migrations/20261005160000_junior_yearly_price_seed.sql` | `module_key=junior`, `unit_key=yearly`, `amount_minor=549900`, `currency_code=TRY`, `unit_type=MINOR`, bant 1 … 50.000.000. |

Fiyat tohumu Akademi ile aynı korumayı kullanır. `updated_by` doluysa `amount_minor` ezilmez. SQL mühür sayısı on dörtten on beşe çıktı. `scripts/ops-migrate-lib.ts` bu dosyayı da Super Admin tutar korumasına bağlar.

## 3. Profil ve rıza yolu

| Dosya | İş |
|-------|-----|
| `lib/junior/guardian-notice.ts` | Mühür sabiti null. Veli doğum yılı penceresi: içinde bulunulan yıl eksi 100 ile eksi 18. Ders kapısı kararı. |
| `lib/junior/profile-rules.ts` | Mühür yokken `consentVersion` ve `guardianBirthYear` reddedilir. `consent: true` yolu durur. |
| `lib/junior/service.ts` | `createJuniorProfile`, `confirmJuniorGuardianConsent`, `eraseJuniorChildProfile`. |
| `lib/junior/memory-port.ts` ve `lib/junior/load.ts` | Aynı yazma ve silme sınırı. Prisma yolu tek işlemde biter. |
| `app/api/junior-pilot/profiles/route.ts` | `PUT` rıza teyidi, `DELETE` çocuk silme. İkisi de `juniorLockedResponse` ardından çalışır. Kapı kilitliyken 503. |

Mühür null iken profil bugünkü kutuyla açılır. Rıza tablosuna satır yazılmaz. `active_consent_id` boş kalır. Ders kapısı `consent_at` ile durur.

Mühür dolunca oluşturma ve teyit, sunucudaki sürüm ve hash ile kanıt satırı yazar ve `active_consent_id` bağlar. Hash istemciden okunmaz. Eski satırın metni ve hash'i değişmez. Yeni onay yeni satırdır. Sürüm, mühürlü metinle aynı değilse mikrofon ve konu testi açılmaz.

## 4. KVKK m.11 silme sınırı

`.system_docs/ops/ops-db.md` §18'e Junior istisnası işlendi. Bu istisna olmadan silme koda girmedi.

Oturumdaki veli, kendi profilini siler. Başka hesabın profili 404 döner.

Bir işlemde silinenler: `junior_progress` (içinde `mode=quiz` denemeleri), `junior_xp`.

Profil kapanır: takma ad `Kapalı`, doğum yılı boş, seçim kapalı, seçmeli dersler boş, `active_consent_id` boş.

Rıza satırında `profile_id` boşalır, `erased_at` yazılır. `guardian_user_id` ve `notice_sha256` durur.

Durur: `junior_subscriptions`, fatura künyesi, `payment_orders`, `ledger_entries`. Ayrı `junior_quiz_attempts` tablosu bu adımda yok. Quiz denemesi bugün ilerleme satırıdır.

Kapı kilitliyken HTTP silme 503 verir. Destek yolu `destek@yetkin.ai` durur.

## 5. Vitrin

| Yer | Karar |
|-----|--------|
| `components/junior/maarif-seal.tsx` | "%100 Uygun", "Maarif Mührü" ve "5.000 TL bandında" kalktı. |
| `components/junior/junior-room.tsx` | Mühür etiketi basılmıyor. |
| `components/junior/profile-switcher.tsx` | "Raf, yeni sınıfa göre açılır" kalktı. |

Yerine `lib/junior/limits.ts` içindeki cümle durur: "Şu anda 6. sınıf pilot dersleri aktif. Seçtiğin sınıf başlığı değiştirmez. Bu raftaki metin 6. sınıf dersidir."

Ders kartındaki üç etiket (`Sözlü Anlatım Odaklı`, `Beceri Temelli Öğrenme`, `AI Destekli Birebir Dönüt`) katalogda duruyor. Onlar mühür rozeti değildir. Ölçülmemiş iki etiketin karttan inmesi, müfredat satırı yayınlanırken ayrı bir vitrin işidir.

## 6. Doğrulama

| Komut | Sonuç |
|-------|--------|
| `npx tsc --noEmit -p tsconfig.json` | Hata yok |
| `npm run verify:boundaries` | OK |
| `npm run verify:atomic-seals` | OK |
| `npm run verify:junior-pilot-seals` | OK |
| `npm run test:all` | 345 dosya, 1601 test geçti |

Yeni test `tests/kernel/junior-guardian-consent.test.ts`: migrasyon ve tohum metni, mühürsüz `consent: true` yolu, sürüm alanının reddi, mühürlü yazma ve eski satırın bozulmaması, silme sınırı, vitrin cümleleri, silme rotasının kilitten sonra gelmesi.

Canlı veritabanına migrasyon uygulanmadı. `ops:migrate` bu rapordan çalıştırılmadı.

## 7. Bu adımda yapılmayanlar

- PayTR `junior` öneki, lisans kancası, fatura kolonlarının düşmesi.
- `JuniorCurriculum` ve altı tablolar. 30 sorunun `junior_question_bank` içine taşınması.
- `JuniorQuizAttempt` ve `JuniorResponse`.
- Kapının açılması. Sınıf değiştir düğmesinin gizlenmesi. O sınıf için yayınlanmış ders satırı henüz yok. Düğme duruyor. Metin, rafın değişmeyeceğini söylüyor.

---

## 8. Sen olsaydın ne yapardın?

Otuz soru ve yirmi dersi tablolara, çalışma zamanı hâlâ TypeScript arşivini okurken taşırdım. Okuyucuyu ilk migrasyonda değiştirmezdim. Boş tabloya geçen bir raf, kapı kapalı olsa da bir sonraki açılışta boş ders basar.

Sıra şöyle olurdu. Her adım kendi migrasyonu ve kendi parite testidir. Biri kırmızıysa sonrakine geçilmez.

1. **Taslak sürüm.** `JuniorCurriculum` satırı `pilot-6-2026-10`, durum `DRAFT`, `maarif_model_version` boş. Yayın anı boş. Bu satır ekrana mühür basmaz.

2. **Ders kabuğu.** On kurs: dört çekirdek, altı seçmeli. `slug` bugünkü `jr_06_mat` ailesi. Sınıf kolonu 6. Profil sınıfı bu kolonu yeniden adlandırmaz.

3. **Ünite.** Tasarımın 4.2 tohumu: Matematik Kesirler, Fen Kuvvet, Türkçe Ana fikir, ana İngilizce iki ünite, seçmelide ders başına bir ünite. Resmî tema adı yoksa alan boş kalır. Uydurma tema yazılmaz.

4. **Konu.** Yirmi dersin metni, sahnesi, dokuz adımı ve erişimi (`free` / `licensed`) bugünkü fonksiyonla aynı düşer. `JUNIOR_FREE_LESSON_KEYS` ikinci liste olarak silinmez. Silinmesi, tablodaki erişim bayrağı o fonksiyonla birebir tutunca olur.

5. **Kazanım.** Her cümle bir `JuniorOutcome` satırı. `official_code` boş. `MAT.6.1.1` üretilmez. Kaynak cümlesi ve `verified_at` yoksa kod kolonu boş kalır.

6. **Soru, aynı tabloya.** İkinci soru tablosu açılmaz. `junior_question_bank` dolar. Köprü `outcome_code`. Eşleşmeyen kod tohumu düşürür. Şık sayısı 3. `CHECK` genişlemez. Zorluk ve yanlış kavram boş. Otomatik "Bilmiyorum" şıkkı yok.

7. **Parite.** Aynı ders anahtarı için tablo ile `JUNIOR_QUESTION_ARCHIVE` aynı `item_id`, aynı doğru şık, aynı açıklama. İngilizce ilk konu ve seçmeli ilk konuların sorusu yoktur. Tohum bunu gizlemez. O konularda test "konu testi yok" der.

8. **Okuyucu geçişi.** Parite sürekli yeşil olunca `assembleJuniorQuestionSet` tabloyu okur. Arşiv tohum kaynağı olarak kalır, ikinci çalışma zamanı listesi olarak kalmaz. Tablo boşsa arşive sessiz düşülmez. Yayınlanmış sürüm yoksa okuyucu arşivde kalır ve bunu test kilitler.

9. **Cevap satırı en sonda.** `JuniorQuizAttempt` ve `JuniorResponse`, soru kopyasından ayrı bir adımdır. Skor, XP ve madde madde cevap tek işlemde yazılır. Cevap yazılır da XP yazılmazsa deneme geri alınır. İlerleme satırı ders mührü olarak kalır. Puan iki kez verilmez.

Fatura kolonunu düşürmek ve `junior` sipariş önekini bağlamak bu zincirin içine girmez. Onlar ayrı migrasyonlardır. Kapı o işler yeşil olsa da bu sıranın sonunda açılmaz. Açılış ayrı bir SUPER_ADMIN kararıdır.
