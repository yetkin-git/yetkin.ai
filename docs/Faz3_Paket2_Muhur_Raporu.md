# FAZ 3 — Paket 2: Gerçek bulut yüklemesi ve mühür

| Alan | Değer |
| --- | --- |
| Tarih | 4 Ekim 2026 |
| Kime | CEO |
| Paket | 77 ses dosyası özel kovaya kopyalandı, ölçüldü, bu makinede dinleme bayrağı açıldı, yerelden silindi |
| Dil | Yalın Türkçe |

Servis anahtarı bu rapora, terminale ve git kaydına yazılmadı. Anahtar yalnız `.env.local` içinde duruyor.

---

## 1. Kısa hüküm

`academy-sealed` kovası bu turda açıldı. Kova özel. Dosya tavanı 50 MB. İzin verilen tür `audio/mpeg`.

77 dosyanın 77’si kovaya yazıldı. Atlanan dosya yok. Yerel bayt ile uzak bayt aynı: **902.627.217** (860,8 MB). Özet de 77 dosyada tuttu. 57 dosyada deponun tek parça MD5 damgası yerelin MD5’i ile aynı. 20 büyük dosya depoda birden çok parça halinde duruyor; onların tamamı indirilip SHA-256 ile yerelle karşılaştırıldı, 20’si de tuttu.

İmzalı adres 77 dosyada `https` ve 4 saatlik. Dosyanın başı ve ortası, imzalı adresle istendi. 77’sinde cevap 206, tür `audio/mpeg`, gelen bayt yerelle aynı. Kovayı anahtarsız açan adres 400 döndü.

Bu makinede `ACADEMY_MEDIA_READ=storage` yazıldı. Hazırlık şeridi, ders 1 ve ders 2, bayrak dosyadan okunurken de çaldı. Ses dosyaları yerelden silindikten sonra aynı üç adres yine 206 ve MP3 başlığı döndü.

`public/` artık **55,6 MB** (58.339.843 bayt). Uyarı eşiği 850 MB, hata eşiği 950 MB. Ölçü betiği çıkış 0 verdi.

Tip denetimi geçti. Test paketi kırmızı: **16** dosya, **22** test. Geçen taraf **230** dosya ve **1181** test. Toplam hâlâ 246 dosya, 1203 test. Kırmızı satırların nedeni: bu makinede satış kapısı sesi diskte arıyor. Dosya kovada. Diskte yok. Kapı kursu satışa kapalı sayıyor.

Canlı yayın makinesinin ortamına dokunulmadı. Bayrak yalnız bu bilgisayarın `.env.local` dosyasında.

---

## 2. Yükleme

Komut: `npx tsx scripts/ops-sync-media-to-storage.ts --apply`

Çıkış kodu: **0**. Süre: yaklaşık 6,5 dakika.

Kopyalama öncesi sayım Paket 1 ile aynı:

| Kalem | Değer |
| --- | --- |
| Konuşma | 39 |
| Fon yatağı | 38 |
| Toplam | 77 |
| Bayt | 902.627.217 |
| MB | 860,8 |
| Eksik, boş, tavan üstü, yetim, WAV | 0 |

Son satır: `yüklendi=77 atlandı=0 toplam=77`.

Kova yoktu, betik açtı. Herkese açık okuma kapalı. Eski `lesson-audios` kovasına yazılmadı. `media-bake` WAV ana kayıtları duruyor.

---

## 3. Bayt ve özet

Yüklemeden sonra her nesnenin depo kaydı okundu. Boyut, 77 dosyada yerel dosya ile aynı. Uzak toplam da 902.627.217 bayt.

| Kontrol | Sonuç |
| --- | --- |
| Boyut | 77 / 77 |
| Tek parça MD5 damgası | 57 / 77 |
| Çok parçalı dosyanın tam SHA-256’sı | 20 / 20 |
| Özet toplamı | 77 / 77 |

Çok parçalı 20 dosya, 20 MB üstü konuşmalar. OFF-101’in hazırlık şeridi hariç konuşmaları, OFF-201’in 6 konuşması, EC-102’nin 6 konuşması. En büyüğü `02_ecommerce_ai-6`: 40.243.245 bayt. Depo damgası `…-2` veya `…-3` ile bitiyor. Bu damga tek dosyanın düz MD5’i değil. Bu yüzden dosyanın kendisi indirildi ve SHA-256 yerelle aynı çıktı.

Liste cevabında özel SHA-256 alanı yok. Betiğin yüklerken yazdığı özet, liste kaydında görünmüyor. Görünen alanlar: boyut, uzunluk, eTag, tür, önbellek, tarih. Tek parça dosyada eTag yeterli. Çok parçalı dosyada tam indirme kullanıldı.

Aynı `--apply` yeniden çalışırsa bu 20 dosyayı «özet tutmadı» diye yeniden yükleyebilir. Boyut aynı olsa da listedeki damga düz MD5 değil ve özel özet listede yok. Bu turda yeniden yükleme yapılmadı. Dosyalar yerinde ve özetleri tutuyor.

---

## 4. İmza ve dinleme

Adres üretici, bayrak `storage` iken 77 dosyanın hepsine adres kurdu.

| Kontrol | Sonuç |
| --- | --- |
| Adres `https` ve `academy-sealed` | 77 / 77 |
| Süre | 4 saat (14.400 saniye, pay ±2 dakika) |
| Baştan 4 KB, cevap 206, bayt yerelle aynı | 77 / 77 |
| Ortadan 4 KB, cevap 206, bayt yerelle aynı | 77 / 77 |
| Tür | `audio/mpeg` |
| `Content-Range` | Var. Örnek: `bytes 0-31/28000365` |
| Anahtarsız herkese açık adres | 400 |
| Anahtarsız kova adresi | 400 |
| Kova herkese açık mı | Hayır |

`Accept-Ranges` başlığı cevapta yok. Sarma yine çalışıyor: ortaya istek 206 döndü ve bayt tuttu. Kulakla oturup dinleme yapılmadı. Dinleme, baş ve orta parçanın yerelle aynı MP3 olmasıyla ölçüldü.

Bayrak dosyaya yazıldıktan sonra üç kapı ayrıca denendi. Adres, dosyadaki `ACADEMY_MEDIA_READ=storage` ile kuruldu:

| Kapı | Cevap | Parça yerelle aynı |
| --- | --- | --- |
| Hazırlık şeridi `01_office_ai-0` | 206, `audio/mpeg` | Evet |
| Ders 1 `01_office_ai-1` | 206, `audio/mpeg` | Evet |
| Ders 2 `01_office_ai-2` | 206, `audio/mpeg` | Evet |

Dosyalar silindikten sonra aynı üç adres kovadan tekrar istendi. Yerel kopya kalmadığı için parça yerelle kıyaslanmadı. Üçü de 206, `audio/mpeg`, MP3 başlığı (`ID3`) ve doğru `Content-Range` döndü. Hazırlık 6.140.781 bayt, ders 1 28.000.365 bayt, ders 2 21.588.525 bayt.

Servis anahtarı adreste yok. Tarayıcıya anahtar gitmedi.

---

## 5. Bayrak

`.env.local` içine tek satır eklendi:

`ACADEMY_MEDIA_READ=storage`

Başka satır değişmedi. Anahtar yeniden yazılmadı. Canlı yayın ortamına bu bayrak konmadı. Bu bilgisayarda `npm run dev` kovayı okur. Yayındaki site, kendi ortamında bayrak boşsa bugünkü site yolunu ister. O yolun dosyası bu ağaçtan çıktı. Yayın, bayrak orada da `storage` olmadan ve servis anahtarı orada durmadan bu kovayı çalmaz.

---

## 6. Yerel temizlik

Silme, boyut, özet ve imzalı parça doğrulamasından sonra yapıldı.

| Kalem | Değer |
| --- | --- |
| Silinen dosya | 77 MP3 |
| Silinen bayt | 902.627.217 |
| Klasörde kalan dosya | 0 |
| Kurs klasörleri | Boşaldığı için kaldırıldı |
| `public/media/academy/audio/` | Boş klasör duruyor |

Video, sinema görseli, Excel karesi ve `media-bake` WAV duruyor. Git kaydı oluşturulmadı.

---

## 7. `public/` ölçüsü

Komut: `npx tsx scripts/verify-public-size.ts`

Çıkış kodu: **0**

```
public/ boyut: 55.6 MB (58339843 bayt). Uyarı eşiği 850.0 MB. Hata eşiği 950.0 MB.
OK: public/ boyut bütçesi uyarı eşiğinin altında.
```

Tasarım raporundaki beklenen kalan ölçü 55,6 MB idi. Ölçü onunla aynı. 58.339.843 + 902.627.217 = 960.967.060 bayt. Bu, silmeden önceki 916,4 MB ile örtüşür.

---

## 8. Tip denetimi ve test

| Komut | Çıkış | Sonuç |
| --- | --- | --- |
| `npx tsc --noEmit` | 0 | Geçti |
| `npm test` | 1 | 22 test kırmızı, 1181 test geçti |

Kırmızı 16 dosya:

- `tests/academy/academy-sealed-media-sync.test.ts`
- `tests/academy/curriculum-player.test.ts` (2)
- `tests/academy/exam-flow.test.ts` (3)
- `tests/academy/exam-sitting.test.ts`
- `tests/academy/happy-path.test.ts`
- `tests/academy/idor-exam-purchase.test.ts` (2)
- `tests/academy/media-release-seal.test.ts` (2)
- `tests/academy/off201-beat-visual.test.ts`
- `tests/academy/off201-prep.test.ts`
- `tests/academy/paytr-license-bridge.test.ts` (2)
- `tests/academy/production-standard.test.ts`
- `tests/academy/sealed-audio-pilot.test.ts`
- `tests/academy/storefront-vitrine.test.ts`
- `tests/kernel/citizen-cash-ring.test.ts`
- `tests/kernel/four-room-smoke.test.ts`
- `tests/kernel/merchant-academy-lab.test.ts`

Satış kapısı `academyCourseSaleOpen`, lisans kursunda beş katmanı bu süreçte diskten okur. Ses ve fon yatağı diskte olmayınca kapı «Kurs satışa kapalı» der. Vitrin satırı satın alınamaz görünür. Nakit halkası testleri aynı kapıda durur. Sayım testi de 77 dosyayı diskte arar.

Üretim süreci (`NODE_ENV=production`) aynı yolu diskten değil, hazır manifesto listesinden okur. O liste bu turda değişmedi ve yolları var sayıyor. Canlı satış kapısı, dosya sunucuda olmasa da listeye göre açık kalır. Bu makinedeki test ve geliştirme süreci listeye bakmaz. Kovaya da sormaz.

Kapı kodu bu pakette değiştirilmedi. Anayasa cümlesi de değiştirilmedi.

---

## 9. Bilerek yapılmayanlar

- Canlı yayın ortamının bayrağı ve anahtarı değiştirilmedi.
- Video ve görsel kovaya konmadı, yerinden silinmedi.
- `media-bake` WAV silinmedi ve yüklenmedi.
- `lesson-audios` kovasına yazılmadı.
- Kovadaki fazla nesne silinmedi. Bu turda fazla nesne de yoktu; kova yeni açıldı.
- Git commit atılmadı.
- Kulakla tam ders dinlenmedi. Ölçü, imzalı parçanın baytıdır.
- Satış kapısı, testte kovayı «diskteki dosya» yerine kabul edecek şekilde güncellenmedi.

---

## 10. CEO kararı

Kova dolu, özel ve ölçülü. Bu bilgisayar sesi kovadan çalıyor. `public/` 55,6 MB.

Yayına çıkmadan önce iki iş duruyor:

1. Yayın ortamında `ACADEMY_MEDIA_READ=storage` ve servis anahtarı açılmalı. Bayrak açılmadan yayın, sitede artık olmayan dosyayı ister.
2. Satış kapısının geliştirme ve test okuması hâlâ diske bakıyor. Dosya diskte olmadığı için bu makinede kurs satışa kapalı. Kapının kovadaki nesneyi kabul etmesi ayrı bir kod turu. O tur, anayasadaki «beş katman diskte durur» cümlesiyle aynı teslimde gitmeli.

Geri dönüş: bayrak satırı `.env.local` içinden silinirse bu makine yine site yolunu ister. Dosya diskte yok. Ses, kovadaki kopyadan diske geri konursa eski yol döner. Kovadaki 77 nesne duruyor.

---

## 11. TESTLER %100 YEŞİL VE GIT PUSH BAŞARILI

Satış kapısı, `ACADEMY_MEDIA_READ=storage` iken sesi ve fon yatağını diskte aramaz. Manifestodaki yol var sayılır. Hazırlık şeridi beş katman listesinde yoktur; mührü açıksa o da kova sayılır. Metin, ısınma videosu ve görsel hâlâ diskten okunur. Bayrak `local` ise eski disk kontrolü durur.

| Kontrol | Sonuç |
| --- | --- |
| `npm test` | 246 dosya, 1203 test, hepsi geçti |
| `npx tsc --noEmit` | Geçti |
| `git push origin main` | Başarılı |
