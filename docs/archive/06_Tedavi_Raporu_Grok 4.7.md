# Tedavi Raporu (Faz 2)

| Alan | Değer |
|---|---|
| Tarih | 9 Ekim 2026 |
| Kaynak | `docs/TESPIT_RAPORU.md` — CEO ve SUPER_ADMIN onayı |
| Kapsam | P0 medya ve Super Admin hijyeni, seçmeli vaat ve kota, sicil ve arşiv bağı, Anayasa B6, Manifesto, ajan bağlamı |
| Dokunulmayan kilit | `.system_docs/AKADEMI_URETIM_ANAYASASI.md` ve `lib/kernel/ai/model-roles.ts` model haritası |

## Sonuç

Onaylanan tedavi adımları kod ve belgede uygulandı. İstenen doğrulama komutları yeşil bitti. Canlı R2 kovası bu oturumda taşınmadı: yeni yazım `private/junior/` önekine gider, ücretli ses için kamu CDN adresi üretilmez. Kovada duran eski kamu kopyalar operatör silmeden kendiliğinden kaybolmaz.

## 1. P0 satış ve güvenlik

### T-01 medya

- Kilitli Junior ses ve kapak nesne anahtarı `private/junior/` önekine bağlandı (`lib/junior/media-visibility.ts`, `lib/media/r2-plan.ts`).
- `juniorLessonAudioSrc` ücretli ders için kamu veya CDN adresi döndürmez. Ücretsiz ilk konu (`{slug}-1`) kamu yolunda kalır.
- `presignR2GetUrl` yalnız `private/` ile başlayan anahtar imzalar. `media/junior/audio/...` tahmin edilebilir yolu imzalanmaz.
- Geliştirmede kilitli ders yerel dosyadan çalınabilir. Üretimde imza yoksa kamu yola düşülmez.
- R2 eşitleme listesi ücretli sesi kamu anahtarına yazmaz. Isınma kaseti ücretsiz konu için kamu, kilitli konu için imzalı kopya olarak iki anahtar taşır.

Operatör: `npx tsx scripts/sync-media-to-r2.ts --apply` sonrası kovadaki eski `media/junior/audio/` ücretli nesneleri ayrıca silinmelidir. Bu turda `--apply` çalıştırılmadı.

### S-1, S-2, S-8

- Üretim kuralı değişmedi: `SUPER_ADMIN_USER_ID` boşsa hiçbir hesap, yerleşik kutu dahil, admin olmaz.
- `.env.example` ve `require-super-admin.ts` yorumu bu fail-closed kuralına çekildi. Eski “boşsa kurtarma kapısı açılır” cümlesi kaldırıldı.
- Kamu iletişim yüzeyi yalnız `destek@yetkin.ai` gösterir. `yapinet360@gmail.com` `/iletisim` ve `LEGAL_ENTITY` kartından çıktı.
- Yönetim kutusu tek ev: `CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT` (`lib/kernel/auth/super-admin.ts`).

## 2. Seçmeli ders ve kota

- Altı taslak kart (`jr_06_ing`, `jr_06_alm`, `jr_06_fra`, `jr_06_siyer`, `jr_06_kod`, `jr_06_arp`) vitrinde **Yakında · Geliştirme Aşamasında** rozeti taşır. Hazır ders düğmesi basılmaz.
- “En fazla üç ders” cümleleri `JUNIOR_ELECTIVE_QUOTA` sabitinden türer (`limits.ts` yardımcıları; `plan.ts`, `checkout.ts`, `service.ts`, kota penceresi, kasa metni).

## 3. Sicil, arşiv, temizlik

- `JUNIOR_BAKED_AUDIO_KEYS` elle liste değildir. Anahtarlar `audio-manifest.generated.ts` kaydından okunur. Mühür, kamu adresine değil bu anahtara bakar.
- Çekirdek ısınma tablosu `JUNIOR_PILOT_SLUGS` ile tiplenir.
- Canlı Vitest, donmuş oda kodunu `archived/` altına takma adla bağlama. Bu testler `vitest.frozen.config.ts` (`npm run test:frozen`) içindedir.
- `scripts/ops-storage-cors-check.ts` arşiv import etmez. CORS sözleşmesi `scripts/ops-storage-cors-lib.ts` içindedir.
- `.tmp/` silindi.
- Tek seferlik fırın ve mühür betikleri `scripts/archive/` altına taşındı (19 dosya). Yardımcı importlar `scripts/` kökündeki canlı betiklere bağlandı.

İçerik dosyalarındaki ders anahtarı (`content/*/N.ts`) konunun kendi kimliğidir. Katalog bu dosyaları toplar. Anahtarlar dosyadan silinmedi; ikinci ses listesi kaldırıldı.

## 4. Belgeler

- `ANAYASA.md` B6: yaş ve slug sayıları koda bırakıldı. “Super Admin metin yazamaz” cümlesi, içerik yazımının maker-checker denetim iziyle yürüyeceği ve kasa ile fiyat yetkisinin ayrı kalacağı biçimde güncellendi. Tarih 9 Ekim 2026.
- `MANIFESTO.md`: veli kitlesi ve Motor 4 (Junior B2C yıllık paket) eklendi.
- `.cursorrules` ve `AGENTS.md`: tekrar eden beş katman tablosu ev işaretine indirildi. Kilitli model haritası durur.

Maker-checker bu turda belge ilkesidir. Yayın ve fiyat için ikinci onay kodu yazılmadı.

## 5. Doğrulama

| Komut | Sonuç |
|---|---|
| `npm run verify:junior-audio-manifest` | OK — 105 anahtar, yerel SHA-256 eşleşti |
| `npm run verify:junior-pilot-seals` | OK |
| İstenen Vitest beş dosyası | 5 dosya geçti (require-super-admin, closed-beta, elective-seal-gate, checkout, lesson-chain) |
| `npm run verify:prebuild` | Çıkış 0 |

Ek olarak medya, hukuk yüzeyi ve imza testleri de geçti (`junior-faz3-media-play`, `public-media-cdn`, `legal-launch-surface`).

## SUPER_ADMIN notu

1. Üretimde `SUPER_ADMIN_USER_ID` bu hesabın UUID’si olmalıdır. Boşsa panel açılmaz.
2. `CANONICAL_SUPER_ADMIN_EMAIL` üretimde dolu ve yerleşik kutu ile aynı olmalıdır. Kamu sayfasında bu adres yok.
3. Ücretli Junior sesinin eski CDN kopyası, eşitleme ve silme yapılmadan hâlâ tahmin edilebilir yolda duruyor olabilir. Kod yeni adresi üretmiyor; kova temizliği ayrı operasyon.
4. `JUNIOR_CHECKOUT_OPEN` bu turda açılmadı.
