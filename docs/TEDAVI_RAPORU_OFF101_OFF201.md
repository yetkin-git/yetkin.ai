# TEDAVİ RAPORU — OFF-101 / OFF-201

| Alan | Değer |
|------|--------|
| Tarih | 27 Eylül 2026 |
| Kaynak | `docs/TESPIT_RAPORU_OFF101_OFF201.md` |
| Çalışma dalı | `off-201-stage` |
| Commit | Mühür özeti `docs/SON_ONAY_VE_MUHUR_RAPORU.md` içindedir. Bu dosya tarihî tedavi kaydıdır. |
| Test | `npm run test` — **237 dosya, 1156 test geçti** |

---

## 0. ÖZET

1. OFF-201 satışı bu çalışma ağacında mandalla kapalı: `ACADEMY_OFF201_LAUNCH_SALE_OPEN = false`. Kore fırını bitmeden bu sabit `true` yapılmadan satış açılmaz.
2. İptal OFF-201 MP3’leri `public/media/academy/audio/01_office_ai_ileri/` altından silindi. Kenar, bu ders anahtarlarına imza olsa bile **404** döner.
3. Ücretli ders sesi oturumsuz adreste artık açılmaz. `proxy.ts` imzasız isteğe **403** döner. Satın alan oturum `GET /api/academy/courses/[id]/audio-grant` ile 4 saatlik adres alır.
4. PayTR panel takma adında imzasız veya uyumsuz imza ile dönen `OK` artık `paytr.webhook.silent_ack_alarm` (seviye error) yazar. HTTP 200 davranışı durur; CREDIT yazılmaz.
5. `docs/DURUM.md` yönlendirmesi duruyor. “Üst tavan yoktur” cümlesi Anayasa, Manifesto ve Pedagoji’de TTS bütçesiyle değiştirildi. Pedagoji, mühürlü OFF-101 kasetindeki «Üç Kapı» adını bir sonraki fırına kadar istisna sayar.
6. **Canlı site bu oturumda `main` dalına alınamadı.** Repoda `.vercel/project.json` yok. Vercel kimliği bu ortamda doğrulanamadı. `https://yetkin.ai` şu an hangi commit’ten beslendiği panelden bakılmadan değişmedi.

---

## 1. Canlı yayın ve dal disiplini

### 1.1 Canlı dal

İstenen: üretim `off-201-stage` yerine `main` izlesin.

Yapılan: kod ve git tarafında üretim dalı değiştirilmedi. Yerel CLI kurulumu kimlik döndürmeden kaldı. Üretim dalını `main` yapmak Vercel proje ayarıdır (`Production Branch`). Bu oturum o ayarı yazmadı.

Operatör adımı, bu raporun dışında durur:

1. Vercel projesinde Production Branch = `main`.
2. Yerelden `vercel --prod` basılmasın.
3. Canlı commit, `origin/main` HEAD ile aynı olsun.

`origin/main` üzerinde OFF-201 kodu yoktur. Dal `main` olunca canlı OFF-201 sayfası ve iptal kasetleri o dağıtımdan düşer. Bu çalışma ağacındaki satış mandalı, ses izni ve PayTR alarmı `main`’e birleşmeden canlıya çıkmaz. Sıra: önce üretimi `main`’e bağla, sonra bu tedaviyi yeşil CI ile `main`’e al.

### 1.2 OFF-201 satışı

`lib/academy/pilot-sku.ts`

- `ACADEMY_OFF201_LAUNCH_SALE_OPEN = false`
- `academyCourseSaleOpen("01_office_ai_ileri")` bu mandal kapalıyken `false` döner. İptal listesi kalksa da satış açılmaz.
- Mevcut ses kapısı durur: sınav yolundaki ders mühürlü değilse veya iptal kasetse satış yine kapalıdır.

OFF-101 satışı açık kalır (`academyCourseSaleOpen("01_office_ai")` true).

### 1.3 İptal kasetler

Dizinden çıkarılan dosyalar:

- `public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-1.mp3` … `-6.mp3`

Klasör boşaldı. Arşiv kopyası `archived/academy-audio-revoked/` altındadır; ona dokunulmadı. Canlıdaki kopya, yeni bir `main` dağıtımı çıkmadan durabilir.

---

## 2. PayTR

### 2.1 Sessiz kabul alarmı

`lib/kernel/payments/paytr/callback-guard.ts` — `shouldAlarmPaytrSilentAck`

Panel yolu `/api/paytr/callback` ve neden şunlardan biri ise alarm düşer:

- `invalid_signature`
- `missing_credentials`
- `production_safety`
- `invalid_payload`

Olay: `paytr.webhook.silent_ack_alarm`, seviye `error`. Gövde yine düz metin `OK` (200). Kanonik yol `/api/payments/webhooks/paytr` resmî IP değilse eski kodları korur: geçersiz imza **403**, diğer doğrulama hataları **400**, `production_safety` **403**. Boş yoklama her iki yolda **200** ve alarm yok.

### 2.2 Belge

`.system_docs/ops/ops-paytr.md` runtime tablosu bu kodlara çekildi. Eski “geçersiz imza her zaman 403 / eksik kimlik her zaman 400” cümlesi panel yolu için yanlıştı; belge artık yolu ayırır.

### 2.3 Inngest mutabakatı

Kod okundu ve birim testleri geçti (`tests/kernel/paytr-reconcile.test.ts`, 12 test).

| Durum | Kod |
|-------|-----|
| Tarama | `paytr-clearing-scan`, `TZ=Europe/Istanbul */30 * * * *` |
| Aday | `PENDING`, `PAID`, son 7 gün `FAILED` |
| `paid` + tutar eşit | CLEARED |
| PSP `failed` ve sipariş PENDING | FAILED |
| PENDING 2 saatten eski, PSP hâlâ belirsiz | FAILED (`pending_timeout`) |
| PSP yok | `psp_unavailable`, sipariş PENDING kalır |
| Port kapalı veya yayın kapatma | tarama DB’ye inmez |

Canlı Inngest paneli, `INNGEST_*` env ve gerçek bir PENDING sipariş bu oturumda görülmedi. Mutabakatın canlıda koştuğu doğrulanmadı. Alarm, yanlış sır yüzünden PayTR’nin yeniden denemeyi bırakması halinde operatöre log bırakır; parayı kendisi yazmaz.

---

## 3. Ders sesi erişimi

| Parça | Dosya |
|-------|--------|
| İmza | `lib/academy/lesson-audio-grant.ts` |
| İstemci adresi (sır yok) | `lib/academy/lesson-audio-grant-path.ts` |
| İzin API | `app/api/academy/courses/[id]/audio-grant/route.ts` (`auth = "session"`) |
| Kenar | `proxy.ts` eşleşmesi `/media/academy/audio/:path*` |
| Oynatıcı | `components/academy/lesson-media-player.tsx` ham adresi `<audio>` etiketine basmaz; izin adresini ister |

Kurallar:

- İmzası yok: **403**, `cache-control: no-store`.
- İptal kaset (`ACADEMY_TTS_REVOKED_CASSETTES`): **404**, imza geçersiz sayılır.
- İzin: oturum + `hasPurchased` (yönetici bypass aynı kapı). Süre 4 saat. Adres kullanıcıya kilitli değildir; süre dolunca paylaşım biter.
- Yatak dosyası (`*.bed.mp3`) aynı ders anahtarıyla ayrı imza alır.
- Hazırlık şeridi (ders 0) aynı satın alma kapısından geçer.
- `ROUTE_AUTH_MAP` uzunluğu 56.

`STORAGE_CONTRACT.md` kamu yolunu “oturumsuz iner” diye yazmıyor; kenar imzasını yazıyor.

Oturumlu tarayıcıda bir dersin çalındığı bu oturumda görülmedi. Kenar kararı `tests/academy/lesson-audio-grant.test.ts` ile doğrulandı (imzasız 403, iptal 404, süresi dolmuş imza reddi).

---

## 4. Belgeler ve testler

### 4.1 `docs/DURUM.md`

Dosya duruyor ve `docs/ops/DURUM.md` dosyasına yönlendiriyor. Sayı ve nakit tanığı orada değil. `tests/academy/sealed-audio-pilot.test.ts` ve `tests/academy/production-standard.test.ts` bu yönlendirmeyi okuyor ve geçti.

### 4.2 Cümle kilidi

`tests/academy/production-standard.test.ts` artık `.cursorrules` içinde “1 Maç = 1 Hakem” ve “FIFA Kokartlı Hakem” cümlelerini aramıyor. Aynı test `ACADEMY_MATCH_WHISTLE_MAX` (100), `ACADEMY_TTS_LESSON_REQUEST_MIN` (10) ve `ACADEMY_TTS_LESSON_REQUEST_MAX` (12) sabitlerini denetliyor. “Üst süre tavanı yoktur” ve “üst dakika veya üst ders tavanı yoktur” cümleleri belgelerde yok; test bunu da bekliyor.

### 4.3 Kılavuzlar

| Belge | Değişiklik |
|-------|------------|
| `.system_docs/ANAYASA.md` B4 | Kurs başına 100 istek, ders başına 10–12 istek. Üst dakika dayatması yok; metin kırpılmaz. |
| `.system_docs/MANIFESTO.md` §4 | Aynı bütçe, sayıların evi kod. |
| `.system_docs/PEDAGOJI.md` D.1 | “Üst süre tavanı yoktur” kalktı. TTS bütçesi yazıldı. |
| Pedagoji §A.2 ve §C | Yeni cümleye «Kapı» girmez. Mühürlü OFF-101 kasetindeki «Üç Kapı» (panel, ataş, maskeli özet) fırın yenilenmeden durur. |

OFF-101 sesi yeniden fırınlanmadı. 128 istek, 100 tavanını aştığı için bu oturumda metin de kırpılmadı.

---

## 5. Arayüz metni

| Eski | Yeni | Dosya |
|------|------|--------|
| Dron kasa | Güvenli ödeme | `lib/copy/sen-voice/cuzdan.ts` |
| Drona dönüp | Uygulamaya dönüp | `cuzdan.ts` ve `wallet-checkout-passport.ts` (kasa sayfası bu sabiti basar) |
| LedgerEntry satırları | hesap hareketleri | `cuzdan.ts` |
| HMAC pasaportu yeter | kısa ömürlü ödeme bağlantısı yeter | `cuzdan.ts` |
| Kokpite dön | Hesabıma dön | `cuzdan.ts`, `lib/copy/sen-voice/ux.ts` |
| Akademi SKU’su / bu SKU | eğitim | `lib/copy/sen-voice/career.ts` |
| Amiral: 8 mühürlü sesli ders | Bu eğitim: 8 sesli ders | `lib/copy/sen-voice/academy.ts` |

Yerel sunucu kapalıydı. `/kasa` ve oynatıcı tarayıcıda tıklanmadı.

---

## 6. Dokunulmayanlar

- `.cursorrules` içindeki “üst süre tavanı yoktur” ve maç metaforu. Üç kılavuz güncellendi; ajan kilidi bu oturumda gevşetilmedi.
- OFF-101 konuşma metni, «Üç Kapı» sesi, 128 istekli fırın.
- OFF-201 Kore fırını. Kota ve `--seal` açılmadı.
- Canlı veritabanında `01_office_ai_ileri` SETTLED satırı. Sorulmadı.
- Inngest canlı paneli.
- Vercel üretim dalı.

---

## 7. Strateji soruları

### Sen olsaydın ne yapardın?

Zararı önce canlıda keserdim, kodu sonra birleştirirdim.

Kalan riskler:

1. **Canlı hâlâ eski dağıtımda olabilir.** Bu ağaçtaki silme ve mandal, `main`’e alınıp yeni üretim çıkmadan `yetkin.ai` üzerindeki iptal kaseti ve olası satış düğmesini kaldırmaz. `main`’e ani dönüş OFF-201 sayfasını da düşürür; bu, lansman bitene kadar doğru duraktır.
2. **Sessiz `OK` duruyor.** Alarm logdur, ikinci bir ödeme denemesi değildir. PayTR sırı yanlışsa kart çekilir, lisans Inngest’e kalır. Inngest canlıda koşmuyorsa müşteri lisanssız bekler. Bunu bir test siparişiyle panelden görmek gerekir.
3. **Ses adresi 4 saat paylaşılabilir.** Kullanıcı kimliğine bağlı değildir. Satın almadan indirme kapanır; alan kişi bağlantıyı iletirse süre dolana kadar dosya iner.
4. **OFF-101 kendi kuralıyla fırınlanamaz** (128 > 100, dersler 10–12 dışında). Dil düzeltmesi önce paketleme ister.
5. **Mühürlü seste «Üç Kapı» durur.** Kural yeni metne çekildi; kaset eski adı söyler.

### Platform kurgusu kararlı mı?

Hayır. Çekirdek kurgu bozulmadı ve bu tedavi onu yeniden kurmadı.

Duran yapı: tek Next.js uygulaması, `packages/kernel`, `/api/v1` hop’ları, `apps/rail-is` iç kodu import etmiyor. Ses izni yeni bir v1 hop değil; web oturumu ve kenar imzası. Dron bu MP3 yolunu zaten çağırmıyordu.

Kararsız kalanlar: üretim dalı `main` değilse CI’sız kod canlıdadır. `lib/kernel` bazı yerlerde arayüz metnine bağlıdır. `apps/rail-is` workspace üyesi değildir. Bu üçü bu rapordaki yamalarla kapanmaz.

### Gelecek adım

1. Vercel Production Branch = `main`. Canlı commit = `origin/main`. OFF-201 satın alma düğmesi canlıda yok.
2. Veritabanında `01_office_ai_ileri` SETTLED var mı bak. Varsa erişim ve iade ayrı karar.
3. Bu tedaviyi PR ile `main`’e al. `ACADEMY_OFF201_LAUNCH_SALE_OPEN` false kalsın.
4. OFF-201’i Kore ve Gemini 3.1 Flash TTS ile fırınla (plan 71 istek, tavan 100). Cue ve süreyi yeni kasete kilitle. Sonra CEO onayı. Ancak ondan sonra mandal açılır.
5. OFF-101 metnini ders başına 10–12 bloğa indir (toplam ≤ 100). «Üç Kapı» adını o fırında «üç aktarım» yap. Eski kaseti bu paketlenmeden yeniden basma.

### Kılavuzda kalan kısıt

Evet, birkaç tane duruyor.

- **Ders başına 10–12 istek hem alt hem üst sınır.** Kısa ders 10 bloğa zorlanır. “En fazla 12” pedagojiye daha uygun olur; alt sınır maliyet kuralıdır.
- **`.cursorrules` hâlâ “üst süre tavanı yoktur” der** ve maç / hakem dilini kilitler. Üç belge artık bütçeyi yazıyor. İki metin aynı konuda aynı şeyi söylemiyor.
- **Kurs tabanı 45 dakika** yalnız `ACADEMY_AI_COURSE_DURATION_MIN_MINUTES` içindedir. 6 ders × 5 dakika = 30 dakika, belgeye göre geçer, koda göre geçmez.
- **Dört katman:** ajan kilidi her derste dört katman ister. Anayasa B4 satış için mühürlü ses, karaoke ve canlı kartı yeterli sayar.
- **Nefes:** Pedagoji ve yatak yorumu 3–5 saniye boşluktan söz eder. `human-rhythm.ts` en uzun iç boşluğu 1.75 saniyedir.
- **Manifesto §1.1** hâlâ “Mührün kapıyı açsın” der. Kariyer metninde “Teklif Kapısı” durur. Mühürlü kaset istisnası bu sloganı kapsamaz.

Kırmızı çizgiler (Anayasa A1–A5: tamsayı para, tek defter, ödeme kuruluşu değiliz, RLS, sunucu puanı) bu tedavide değiştirilmedi.
