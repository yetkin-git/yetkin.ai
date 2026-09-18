# DURUM — yetkin.ai (yaşayan kesit)

Bu dosya yaşayan kesittir. `docs/DURUM.md` test uyumluluk aynasıdır.

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Rol | Haftalık gerçek. Anayasa B ve Manifesto sayıları buraya ve koda bırakır. Build fixture değildir. |
| Kaynak | Çalıştırılabilir kod SSOT. Üretim veritabanına bu kesitte bağlanılmadı. |

Çelişkide `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır. Sayılar Anayasa maddesi değildir.

---

## Amiral SKU `01_office_ai`

| Ölçüt | Kod gerçeği |
|-------|-------------|
| Sınav yolu | **9 ders** — `1`…`6`, `g1`, `w1`, `k1` (`lib/academy/curricula/lesson-index.ts`) |
| Mühürlü kaset | **9/9** — `1`…`6`, `g1`, `w1`, `k1` (`ACADEMY_MEDIA_SEALED_AUDIO`). 420–720 sn bandı dolu; bake kuyruğu boş. |
| Karaoke | **9/9** mühürlü ders `article+karaoke`. «Ses kaseti yoktur» bandı yok. |
| Üç Kapı SSOT | Aktarım: 1. yerleşik panel (Copilot / Gemini şeridi) → 2. ataş (xlsx/docx/pptx) → 3. maskeli kısa özet. Güvenlik sınıfı ayrı: kişisel veri / şirket sırrı / kamu cümlesi. |
| 1. ders | Üç Kapı + A1 hijyeni (`01_office_ai-1`, **571.72 sn**). Karaoke «grafik raporu» vaadi yok. |
| 2. ders | KVKK / maskeleme (`01_office_ai-k1`, **677.56 sn**). Vatandaş dili re-bake. Yükleme alışkanlığından önce. Bant içi mühürlü kaset. |
| 3. ders | PowerPoint Copilot + `.pptx` ataş, sıfır kodlama (`01_office_ai-3`, **527 sn**). |
| 4. ders | E-posta ritüeli (`01_office_ai-4`, **496.12 sn**). |
| 5. ders | Hata avı; sol dip toplam **59.450** ekran + karaoke + TTS (`01_office_ai-5`, **420.713 sn**). |
| 9. ders | **Haftalık Sistem** capstone 10+10+10 (`01_office_ai-6`, **440.393 sn**). Bant içi mühürlü kaset. Sınav kapısı bu dersten sonra açılır. |
| G1 / W1 | Doygun mühürlü kasetler (**529.04 sn** / **521.44 sn**). |
| Kurs süresi SSOT | `academyCourseSealedDurationSec("01_office_ai")` — timings toplamı; `estimatedTotalMinutes` buradan türetilir. |
| Köprüler | Çekirdek 9 kilitli. İleriki fırın: takvim/toplantı, Excel formül/grafik, PDF (`planned.ts` uydu, `lane: satellite`). |
| Kardeş SKU `02`–`05` | Vitrinde **Çok Yakında / Hazırlanıyor.** Satın alma ve hayali oynatıcı yok. |

Yayın ilkesi: makale + mühürlü karaoke. Amiral 9 kaset sesli; sınav 9 ders bitince açılır. Compact makale ve mühür havuzu Üç Kapı kilidine çekildi. k1 mühürlü MP3 vatandaş dilinde 420–720 bandında yeniden fırınlandı (677.56 sn).

---

## Nakit ve kilitler

| Ölçüt | Durum |
|-------|--------|
| PayTR Merchant | Kod üretim kalkanlıdır (HMAC, tutar eşleşmesi, sandbox/mock üretimde yasak). |
| PayTR canlı tanık | **Bu kesitte yok.** En az bir `PaymentOrder.status = CLEARED` + eşleşen `LedgerEntry` CREDIT + cüzdan `amount_minor` operatör teyidi bekler. Yokken «para akıyor» denmez (A5). |
| PayTR Split | **Kilitli.** `MARKETPLACE_SPLIT_LIVE = false`. `beginHold` / `settle` → `not_configured`. Merchant onayı Split izni değildir. |
| Freelancer kamu | **410.** Motor sicilde durur. |
| `LIVE_BROADCAST_SHUTDOWN` | **Kapalı** (varsayılan `false`). |

---

## Dron (native istemci)

| Ölçüt | Durum |
|-------|--------|
| T3 Akademi halkası | **Bağlı.** `publishFrozenUntilFaz1Close: false`. Oynatıcı, sınav, mühür, kasa hop’ları durur. |
| Tezgâh | İzole (`tezgahStoreIsolated: true`). Faz 2 yansıtma. |
| Punchcard saatleri | Web timings JSON’undan türetilir. Elle kopya SSOT değildir. 9 mühürlü kaset türetilir. |
| Sinema masası | Web’dedir. Native «garsonu göster» Excel/Gmail klonu taşımaz; nakit + metin + rozet + sınav taşır. |

---

## Çekirdek paket

`@yetkin/kernel` (`packages/kernel`, v1.0.0) **mevcuttur.** İnce sözleşme: para, katalog kimliği, v1 hop, JSON zarf. Prisma/Supabase taşımaz. «Faz 2’de çıkacak» cümlesi yanlıştır.

v1 hop sicili: `RAIL_V1_HOPS` — **16 kayıt.**

---

## Bu hafta dürüst cümle

Motor (cüzdan, sınav, mühür, hop) ayaktadır. Amiral ürün vatandaşa **9 mühürlü kaset + 9 karaoke akışı + 9 derslik sınav yolu** olarak anlatılır. Üç Kapı tek haritadır (aktarım); güvenlik sınıfı ayrıdır. Canlı nakit tanığı alınmadan gelir iddiası durur. Split ve Freelancer açılmaz.
