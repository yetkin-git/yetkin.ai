# Değerleme ve Pazar Master Planı — Tedavi Raporu

Tarih: 21 Ekim 2026  
Dayanak: `docs/DEGERLEME_VE_MASTER_PLAN_RAPORU.md` ve CEO’nun onayladığı dört kilit karar.  
Sınır: `@yetkin/kernel` paketine dokunulmadı. Yeni tablo ve üçüncü taraf çerez yok.

---

## Uygulanan Tedaviler ve Değiştirilen Dosyalar

İki tedavi uygulandı. Yönetici hunisinin önüne dört pazar adımı yazıldı. EC-102 öğrenim çıktısı doldu; OFF-101 ve EC-102 antresine sonuç, içerik, somut çıktı ve iade aynı sırada basıldı.

| Dosya | Ne değişti |
| --- | --- |
| `lib/kernel/admin/funnel-constants.ts` | Dört pazar adımı önde, altı kazanım adımı yerinde. |
| `lib/kernel/admin/funnel-types.ts` | Gösterim oranı türü eklendi. |
| `lib/kernel/admin/funnel-rates.ts` | İki zincir. Kayıt, satın alma gösterimine bölünmez. |
| `lib/kernel/admin/funnel-query.ts` | Üç sayaç okuması. SETTLED tekil kişi sorgusu ikinci kez yazılmaz. |
| `lib/kernel/admin/funnel-counter.ts` | Günlük anonim sayaç. IP, çerez ve kullanıcı yazılmaz. |
| `lib/kernel/admin/funnel-document-hit.ts` | Sayfa gösterimi. Next ön yüklemesi sayılmaz. |
| `lib/career/public-talent-hit.ts` | `/vize` gösterimi aynı sayaca delege edilir. |
| `lib/copy/sen-voice/admin.ts` | Pano etiketleri. |
| `components/kernel/admin-funnel-board.tsx` | Önce pazar doğrulama, sonra kayıt hunisi. |
| `prisma/schema/kernel.prisma` | Sayaç yorumu. Şema ve migration değişmedi. |
| `app/academy/page.tsx` | Katalog gösterimi `vitrine_visit`. |
| `app/academy/[slug]/page.tsx` | Antre gösterimi ve satış cümleleri. |
| `app/academy/[slug]/oyna/page.tsx` | Lisanssız 1. ders açılışı `free_lesson`. |
| `app/api/(kernel)/wallet/top-up/route.ts` | Akademi kasasında iframe veya pasaport `checkout_intent`. |
| `lib/academy/learning-outcomes.ts` | EC-102 altı çıktı. Diğer kurslar ingest bekler. |
| `lib/academy/focus-sale-pitch.ts` | OFF-101 ve EC-102 dört cümle. |
| `components/academy/focus-sale-pitch.tsx` | Antre bloğu. |
| `tests/kernel/admin-funnel-surface.test.ts` | On adım ve sayaç sözleşmesi. |
| `tests/academy/curriculum-syllabus.test.ts` | Çıktı ve cümle sırası. |

`lib/kernel/sem/conversion.ts` durur. Tarayıcı olayı `yetkin:conversion` yönetim panosuna yazmaz. Pano Postgres sayacından okunur. `gtag` eklenmedi.

---

## 1. Taraf Dönüşüm Hunisi Genişletme Özeti

Okuma yolu değişmedi: `/api/admin/funnel`, yönetici oturumu, pencereler bugün / 7 gün / 30 gün, saat dilimi Europe/Istanbul. Kişi kimliği telde yok.

Pano artık iki bloktur.

**Pazar doğrulama**

| Sıra | Adım | Kimlik | Kaynak |
| --- | --- | --- | --- |
| 1 | Vitrin ziyareti | `vitrine_visit` | Katalog ve kurs antresi gösterimi |
| 2 | Ücretsiz ders | `free_lesson` | Lisansı olmayan 1. ders oynatıcısının açılışı |
| 3 | Ödeme niyeti | `checkout_intent` | Akademi kasasında PayTR iframe veya ödeme pasaportu |
| 4 | Satın alma SETTLED | `settled_purchase` | Ticari `academy_purchases` tekil kişi. Bağış (`sa_grant:`) hariç |

**Kayıttan vize kartına** — sıra aynı kaldı: kayıt, cüzdan CLEARED, satın alma SETTLED, sınav geçişi, akademi damgası, `/vize` gösterimi.

Dördüncü pazar adımı ile alttaki lisans adımı aynı sayıdır. Ayrı bir satın alma sayacı açılmadı; iki sayaç birbirinden sapmasın diye. Bağış bu sayıya girmez.

Yazma kuralları:

- Sayaç `funnel_daily_counters` satırıdır. Gün ve adım vardır. Hit başına yeni satır açılmaz.
- Çerez, üçüncü taraf script, IP, kullanıcı ve kampanya parametresi yazılmaz.
- Katalog ve antre ön yüklemesi (`prefetch`) sayılmaz. Bot sayfayı gerçekten çekerse sayılır. `/vize` ile aynı aile.
- Ücretsiz ders, dersin bitmesi değildir. Lisanssız oynatıcının açılmasıdır. Lisanslı tekrar sayılmaz.
- Ödeme niyeti, düz cüzdan yüklemesi değildir. İstekte kurs kodu vardır ve iframe veya pasaport dönmüştür. Mock checkout sayılmaz.
- Bakiyesi yeten satın alma PayTR açmaz. O kişi niyet adımında durmaz, SETTLED adımında görünür. Niyetin satın almadan küçük kalması bu yüzden tek başına «kasa kaçtı» demek değildir.
- Vitrin, tekil ziyaretçi değildir. Katalog ve antre aynı adıma yazılır. Bir kişi kataloğu ve bir kursu açarsa iki gösterim olur.
- Sayaç yazılamazsa sayfa düşmez. Adım panoda 0 kalır. Ayrım günlüğündeki `funnel.counter.failed` satırıdır.

Dönüşüm iki zincirdir. Ücretsiz ders vitrine, niyet derse, SETTLED niyete oranlanır. Kayıt, SETTLED gösterimine bölünmez. Payda 0 iken yüzde basılmaz. Pay paydadan büyükse düşüş basılmaz.

«Veri yok» ile «sıfır» ayrımı: dört adım panoda her pencerede durur. Sayının 0 olması, adımın hiç tanımlanmamış olması değildir.

Kanal kodu bu tedavide yok. Sayaç anahtarı gün ve adımdır. Yönlendiren veya kampanya parametresini adıma yazmak kişiyi veya kaynağı aynı satırda çoğaltır. Kanal notu, reklam günlüğünde elle durur. Ürün hunisi onu henüz bölmez.

---

## EC-102 ve OFF-101 İyileştirmeleri

EC-102 öğrenim çıktısı «Taze ingest bekleniyor» cümlesini bırakır. Altı madde, altı dersin kapanışından okunur: ölçülü başlık, beyaz ana görsel, iade kök nedeni, maliyetin üstünde fiyat, toplu şablon, müşteri mesajı. SM-103, BOT-104, PR-105 ve kabuklar ingest cümlesinde kaldı. Bu pencerenin kararı budur.

Antre bloğu yalnız `01_office_ai` ve `02_ecommerce_ai` sayfasında, başlığın hemen altında durur. Sıra kilitlidir:

1. Sonuç
2. İçerik — eğitmen adı bu cümlenin içindedir. OFF-101 Gözde, EC-102 Kaan. Ad, ses mühründen okunur.
3. Somut çıktı
4. İade — ders erişimi açılınca bedel dönmez; harcanmamış cüzdan yüklemesi kendiliğinden karta dönmez; talep destek kanalındandır. 14 gün vaadi yoktur.

Yerel sayfa okumasında sıra ve eğitmen adları bu şekilde durdu. EC-102 çıktı listesinde ingest cümlesi yoktu. SM-103 ingest cümlesini korudu ve bu dört bloğu basmadı.

Aynı sayfada EC-102 için «8 dersin tamamı bitmeden sınav açılmaz» kalkanı da vardı. Kurs 6 derstir. Kalkan yalnız OFF-101 antresinde kaldı. OFF-101 sayfasında kalkan duruyor.

---

## Sözleşme ve Prebuild Kontrol Sonuçları

`npm run verify:prebuild` çıktı kodu 0. Bu komut `verify:v1-contract-artifacts` adımını da çalıştırır. İkisi de yeşil:

- `verify:no-secrets` OK
- `verify:amount-minor` OK
- `verify:rls-status` OK — `funnel_daily_counters` listede
- `verify:openapi-v1` OK
- `verify:v1-client` OK
- `verify:kernel-package` OK — `@yetkin/kernel` saf
- `verify:idor-seals` OK
- `verify:api-auth --check` OK — 73 route
- `verify:public-size` OK
- `verify:academy-curriculum` OK
- `verify:junior-content` OK
- `verify:junior-audio-manifest` OK

Huni yüzeyi ve müfredat özeti testleri de geçti (`admin-funnel-surface`, `curriculum-syllabus`).

Prebuild içindeki laboratuvar okuması üretim kapısı değildir. Bu makinede PayTR üçlüsü dolu, sandbox bayrağı açık, mock kapalı, hız tavanı süreç içi bellek. Canlı gizli deposu bu raporda okunmadı.

---

## SEN OLSAYDIN NE YAPARDIN?

Hayır. Bu tedavi, platformu ilk müşteriyi ölçebilir hale getirir. İlk müşteriyi almaya hazır hale getirmez.

Ölçü hazırdır: ziyaret, ücretsiz ders, PayTR niyeti ve SETTLED artık aynı panoda durur. İki odak kursun antresi iş çıktısını, içeriği, elde kalanı ve iadeyi aynı sırada söyler. Bu, doksan günün ilk kod işidir. Talep kanıtı değildir.

Hazır saymamın dört gerekçesi var.

1. Tahsilat kapısı bu tedavide kanıtlanmadı. Laboratuvar okuması sandbox bayrağını açık gördü. CEO kilidi, üretimde PayTR kipinin `live`, sandbox ve mock’un boş olmasıydı. Bu rapor o kapıyı üretimde görmedi.
2. Huni, trafik gelmeden boştur. Boş pano «kimse ödemedi» demek için önce bir gerçek ziyaretin sayaca düştüğü görülmelidir. Sayaç yazısı sessizce düşerse adım 0 kalır.
3. Niyet adımı PayTR açılışıdır. Bakiyesi yeten alım bu adımı atlar. İlk pencerede niyet ile SETTLED yan yana okunmadan reklam hükmü verilmez.
4. Diğer dört vitrin kartı satışta durur ve hâlâ özellik cümlesi taşır. Reklam onlara giderse ölçü, odak kursun ölçüsü olmaktan çıkar.

Ben olsam yarın bütçe açmam. Önce bu sürümü yayına alır, dört adımın bir elle yapılan gezintide hareket ettiğini görür, üretim PayTR ve Redis çiftini kapı listesinden okur, ancak ondan sonra küçük ve tarihli trafiği yalnız EC-102 ve OFF-101’e veririm.

## Bir Sonraki Aşamada Ne Yapılmalı?

Son mühürden sonraki ilk üç pazar adımı:

1. **Bir elle gezinti, sonra pano.** Yayında katalogu aç, EC-102 veya OFF-101 birinci dersini lisanssız aç, akademi kasasında PayTR iframe’inin geldiği yere kadar git, satın almayı tamamlamak zorunda değilsin. Aynı gün yönetici hunisinde vitrin, ders ve niyet sıfırdan büyük mü bak. Bir adım yerinde kalırsa reklam yok. Sayaç günlüğü `funnel.counter.failed` ise önce o yazılır.
2. **Üretim kapısını sır değeri basmadan işaretle.** PayTR kipi `live` mi, sandbox ve mock boş mu, Redis adresi ve jetonu birlikte dolu veya birlikte boş mu, Junior kasa kilitli mi. Yarı dolu Redis çifti kabul edilmez. Bu kontrol kodda yeni bir ekran değildir. Açık olmayan kapıyla tahsilat denemesi yapılmaz.
3. **Küçük ve tarihli trafik, yalnız iki kurs.** Bütçe EC-102 ve OFF-101 dışına çıkmaz. Kanal adı reklam günlüğüne yazılır; huni henüz kanal bölmez. Haftalık tek soru şudur: boş olan adım vitrin mi, ücretsiz ders mi, ödeme niyeti mi, tahsilat mı. Freelancer, Young, Junior kasa ve `06_`–`13_` bu üç adımdan sonra da kapalı kalır.
