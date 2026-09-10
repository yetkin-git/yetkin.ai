# MAKBUZ RAPORU — Akademi Satın Alma Makbuzu + SMTP (TESPIT E5)

| Alan | Değer |
|------|-------|
| Tarih | 9 Eylül 2026 |
| İş | TESPIT_RAPORU E5: Akademi satın alma makbuzu + SMTP |
| Durum | Tamamlandı — testler yeşil, mühürler yeşil |
| Tetik noktası | `POST /api/academy/courses/[id]/purchase` → settlement (`applied=true`) → Inngest `academy/receipt-requested` → SMTP |

---

## 1. ÖZET — 30 SANİYEDE

Kullanıcı bir eğitimi satın aldığı anda (cüzdan settlement'ı commit edildikten sonra),
kayıtlı e-posta adresine **profesyonel, sade, Vatandaş Lisanı'nda bir bilgilendirme
makbuzu** gider. Makbuz beş zorunlu alanı taşır: ad soyad, eğitim adı, tutar
(KDV dahil), tarih-saat, işlem numarası.

Gönderim **asenkron**dur (Inngest event) ve **fail-safe**dir: SMTP boşsa, e-posta
yoksa veya kuyruk patlarsa satın alma **asla** kırılmaz, makbuz dürüstçe atlanır
ve log düşer. Nakit/satın alma yolu SMTP'ye bağımlı değildir.

---

## 2. MİMARİ KARAR — NEDEN WEBHOOK DEĞİL, SETTLEMENT?

Görev metni "PayTR başarı webhook'u geldiğinde ... kurs tanımlandığında" diyor.
Kod tabanındaki gerçek akış **iki adımlıdır** (TESPIT §1.3):

```
1. PayTR webhook → PaymentOrder CLEARED → cüzdana CREDIT (kurs adı YOKTUR)
2. /purchase → cüzdandan DEBIT + hazineye CREDIT + AcademyPurchase (kurs BURADADIR)
```

Webhook anında hangi kursun alınacağı **bilinemez** (bakiye havuzda bekler).
Bu yüzden makbuz **2. adımın** settlement'ına bağlandı — kurs adı, tutar ve
tarih ancak orada kesindir. Webhook dosyasına dokunulmadı; webhook'un tek işi
(CREDIT) değişmedi.

**İşlem Numarası notu:** Görev `merchant_oid` diyor, ancak `merchant_oid` cüzdan
**yükleme** katmanına aittir; akademi satın alması ayrı bir `AcademyPurchase`
satırıdır ve yüklemeye bire bir bağlı değildir. Makbuzda uydurma bağ kurmak
yerine (Anayasa A5: sahte onay yasağı) **İşlem Numarası = `AcademyPurchase.id`
satın alma referansı** basılır. Destek bu numarayla sorgular. `merchant_oid`
ihtiyacı doğarsa cüzdan yükleme makbuzu ayrı bir iş olarak eklenebilir.

---

## 3. GÜNCELLENEN / YENİ DOSYALAR

### Yeni (3 dosya + bu rapor)

| Dosya | Görev |
|-------|-------|
| `lib/copy/sen-voice/academy-receipt.ts` | Makbuz metin SSOT'u — Vatandaş Lisanı, sen dili (`verify:sen-axis` yeşil) |
| `lib/kernel/notice/academy-receipt-mail.ts` | Şablon kurucu (`buildAcademyReceiptSubject/Text`) + `deliverAcademyReceiptMail` (graceful degradation, `server-only`) |
| `tests/academy/academy-receipt.test.ts` | 13 test: şablon, sen dili, skipped/sent yolları, yüzey mühürleri |
| `docs/MAKBUZ_RAPORU.md` | Bu rapor |

### Güncellenen (5 dosya)

| Dosya | Değişiklik |
|-------|------------|
| `app/api/academy/courses/[id]/purchase/route.ts` | Settlement sonrası `queueAcademyReceiptMail`: Inngest varsa event, yoksa doğrudan fail-safe gönderim. Yalnız `applied=true` makbuz doğurur (replay'de ikinci makbuz yok). Asla throw etmez |
| `lib/kernel/jobs/inngest.ts` | `ACADEMY_RECEIPT_REQUESTED` event + `academyReceiptSend` fonksiyonu (`idempotency: event.data.purchaseId`), `kernelInngestFunctions` kaydı. Payload kendi kendine yeterli — akademi store okunmaz (kernel↛dikey sınırı korunur) |
| `.env.example` | NOTICE_SMTP bloğu yorumu: "beş freelancer olayı + akademi makbuzu (E5)" |
| `lib/kernel/jobs/runtime-readiness.ts` | SMTP satırı + gün-0 uyarısı E5 diline çekildi (`deliverAcademyReceiptMail → skipped`) |
| `scripts/ops-runtime-readiness-lib.ts` | OPS-6 SMTP kontrol listesi + uyarısı "akademi makbuzu"nu açık yazar |

Dokunulmayanlar (bilerek): PayTR webhook + settle, `mail.ts`/`smtp.ts`/`contact.ts`
çekirdeği, Prisma şeması (migration yok), `proxy.ts`, v1 sözleşmesi.

---

## 4. `.env` ANAHTARLARI — TAM LİSTE

`.env.local` (geliştirme) veya **Vercel Production → Environment Variables**'a
eklenecek anahtarlar. Yeni anahtar **yoktur**; mevcut NOTICE_SMTP ailesi kullanılır:

```bash
# Zorunlu ikili — ikisi birlikte dolu olmalı, yoksa makbuz dürüst atlanır.
NOTICE_SMTP_HOST="smtp.saglayici.com"
NOTICE_MAIL_FROM="makbuz@yetkin.ai"

# İsteğe bağlı — boşsa 587 + STARTTLS varsayılır; 465 örtük TLS'dir.
NOTICE_SMTP_PORT="587"

# Kimlikli SMTP gerekiyorsa (çoğu sağlayıcı ister):
NOTICE_SMTP_USER="makbuz@yetkin.ai"
NOTICE_SMTP_PASS="<smtp-sifresi>"
```

Kurallar:

- `NOTICE_SMTP_HOST` + `NOTICE_MAIL_FROM` birlikte dolu = `configured`.
- Yalnız biri dolu = `partial` → makbuz atlanır + readiness uyarısı.
- İkisi de boş = `honest-skip` → makbuz atlanır, **satın alma ve nakit durmaz**.
- `NOTICE_MAIL_FROM` = SMTP zarf gönderenidir; vitrin destek kutusu
  (`destek@yetkin.ai`, `LEGAL_SUPPORT_EMAIL`) ile karıştırılmaz.
- Port geçersizse (`not-a-port`, aralık dışı) konfigürasyon `null` sayılır → atlanır.

Doğrulama: `npm run ops:runtime-readiness` → `noticeSmtp=configured` ve
`SMTP: mode=configured` satırları. Üretimde boş bırakmak **build'i kırmaz**,
yalnız gün-0 uyarısı + `ops.smtp.honest_skip` log'u üretir.

---

## 5. MAKBUZ ŞABLONU

Konu: `Eğitim makbuzun: <Eğitim Adı>`

```text
Merhaba Ayşe Kaya,

Eğitimin hesabına tanımlandı. Makbuzun aşağıda.

Eğitim: Ofis AI
Tutar (KDV dahil): ₺250,00
Tarih: 09 Eylül 2026 13:30 TSİ
İşlem Numarası: purchase-receipt-1
Bu numarayla destekten sorgulayabilirsin.

Lisansın 365 gün geçerli. Eğitime buradan başla:
https://yetkin.ai/academy/ofis-ai/oyna

Fatura kayıtlı e-postana iletilir; bu e-posta bilgilendirme makbuzudur. Otomatik e-Arşiv paneli değildir.

Destek e-posta: destek@yetkin.ai
```

Zorunlu beş alanın tamamı mevcuttur. Tutar `formatMinor` ile kuruş tamsayısından
üretilir (float yok); tarih `tr-TR` + `Europe/Istanbul`. Fatura dili
`/legal/mesafeli-satis` B.6 ile aynıdır — e-Arşiv vaadi verilmez. Metin
`text/plain; charset=UTF-8` gönderilir (mevcut `sendNoticeSmtp` ham SMTP;
konu UTF-8 Base64 kodlanır).

---

## 6. AKIŞ DİYAGRAMI

```
/purchase → purchaseAcademyCourse → applied?
    │ hayır (replay) → makbuz YOK, yanıt 200
    │ evet
    ▼
queueAcademyReceiptMail (try/catch — asla throw)
    ├── Inngest EVENT_KEY var → inngest.send(academy/receipt-requested)
    │       └── academyReceiptSend (idempotency: purchaseId)
    │               └── deliverAcademyReceiptMail → SMTP → sent
    │                    ├── SMTP boş → skipped (smtp_unconfigured)
    │                    ├── e-posta yok → skipped (no_email)
    │                    ├── bozuk payload → skipped (invalid_payload)
    │                    └── SMTP hatası → throw → Inngest retry
    └── Inngest yok (yalnız geliştirme) → deliverAcademyReceiptMail doğrudan
            └── hata → warn log, satın alma yanıtı 200 (kırılmaz)
```

Log olayları (`logEvent`, e-posta basılmaz):
`academy.receipt.queued`, `academy.receipt.queue_skipped`,
`academy.receipt.queue_failed`, `academy.receipt.direct_failed`,
`academy.receipt.mail.sent`, `academy.receipt.mail.skipped`.

---

## 7. TESTLER

Komut:

```bash
npx vitest run tests/academy/academy-receipt.test.ts
```

13 test, tamamı yeşil (9 Eylül 2026 çalışması):

| # | Test | Sonuç |
|---|------|-------|
| 1 | Beş zorunlu alan (ad, eğitim, ₺250,00 KDV dahil, tarih TSİ, işlem no) | ✅ |
| 2 | Dürüst notlar (365 gün, e-Arşiv değildir, destek, oyna bağı) | ✅ |
| 3 | Sen dili — siz kaçağı yok | ✅ |
| 4 | Bozuk tarih ham döner, throw yok | ✅ |
| 5 | Boş ad → generic selamlama, makbuz kurulur | ✅ |
| 6 | SMTP boş → skipped, soket açılmaz | ✅ |
| 7 | Test ortamı → skipped | ✅ |
| 8 | E-posta yok → skipped | ✅ |
| 9 | Bozuk payload → skipped, throw yok | ✅ |
| 10 | Yapılandırılmış SMTP + e-posta → sent, konu/metin doğru | ✅ |
| 11 | SMTP hatası → throw (çağıran yakalar, Inngest retry) | ✅ |
| 12 | Yüzey: rota `applied` + kuyruk + Inngest guard içerir | ✅ |
| 13 | Yüzey: Inngest fonksiyon + env + readiness E5 dili | ✅ |

Komşu suitler (regresyon): `notice-smtp-skip` (1), `runtime-readiness` (12),
`purchase-flow` (7) — toplam 33/33 yeşil.

Mühürler:

| Kontrol | Sonuç |
|---------|-------|
| `verify:boundaries` (kernel↛dikey, oda duvarları) | ✅ |
| `verify:sen-axis` (273 dosya, siz kaçağı) | ✅ |
| `verify:no-secrets` | ✅ |
| `ops:runtime-readiness` (çıkış 0, SMTP E5 satırları) | ✅ |
| `tsc --noEmit` | ✅ |
| `eslint` (E5 dosyaları) | ✅ (hata yok) |

---

## 8. OPERATÖR NOTLARI (CANLIYA ÇIKIŞ)

1. Vercel Production'a 5 NOTICE anahtarını yaz (yukarıda §4). `PAYTR_SANDBOX`
   gibi üretimde **yasak** değildir; boş bırakmak build'i kırmaz, makbuzu kapatır.
2. İlk canlı tanık: ₺10–20 yükleme → kurs satın alma → kutuya makbuz. Log'da
   `academy.receipt.queued` + Inngest run + `academy.receipt.mail.sent` görülmelidir.
3. Inngest Cloud'da `academy-receipt-send` fonksiyonunun göründüğünü doğrula
   (`/api/jobs/inngest` serve listesi).
4. SMTP sağlayıcısı SPF/DKIM kaydı ister — makbuzun spam'a düşmemesi için
   `NOTICE_MAIL_FROM` domainine kayıt aç.
5. Bilinen sınırlar (v1): yalnız `text/plain` (HTML yok); cüzdan yükleme
   makbuzu (`merchant_oid`li) bu işin dışında — istenirse ayrı E-iş olarak eklenir.

---

*E5 kapatıldı. B2C güven zinciri: kasa rızası → settlement → makbuz → sınav → mühür.*
