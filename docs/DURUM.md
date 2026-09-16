# DURUM — yetkin.ai (yaşayan kesit)

| Alan | Değer |
|------|--------|
| Tarih | 16 Eylül 2026 |
| Rol | Haftalık gerçek. Anayasa B ve Manifesto sayıları buraya ve koda bırakır. Build fixture değildir. |
| Kaynak | Çalıştırılabilir kod SSOT. Üretim veritabanına bu kesitte bağlanılmadı. |

Çelişkide `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır. Sayılar Anayasa maddesi değildir.

---

## Amiral SKU `01_office_ai`

| Ölçüt | Kod gerçeği |
|-------|-------------|
| Sınav yolu | **9 ders** — `1`…`6`, `g1`, `w1`, `k1` (`lib/academy/curricula/lesson-index.ts`) |
| Mühürlü kaset | **9/9** — `1`…`6`, `g1`, `w1`, `k1` (`ACADEMY_MEDIA_SEALED_AUDIO`). Bake kuyruğu boş. |
| Karaoke | **9/9** mühürlü ders `article+karaoke`. «Ses kaseti yoktur» bandı yok. |
| 1. ders | Üç Kapı + A1 hijyeni + yönetim özeti (`01_office_ai-1`, **571.84 sn**). Karaoke «grafik raporu» vaadi yok. |
| 2. ders | KVKK / maskeleme (`01_office_ai-k1`, **309.713 sn**). Yükleme alışkanlığından önce. Yedek TTS `gemini-2.5-flash-preview-tts` (ana model günlük kota). |
| 3. ders | PowerPoint Copilot + `.pptx` ataş, sıfır kodlama (`01_office_ai-3`, **533.76 sn**). |
| 5. ders | Hata avı; sol dip toplam **59.450** ekran + karaoke + TTS (`01_office_ai-5`, **481.96 sn**). |
| 9. ders | **Haftalık Sistem** capstone 10+10+10 (`01_office_ai-6`, **412.04 sn**). Sınav kapısı bu dersten sonra açılır. |
| G1 / W1 | Doygun mühürlü kasetler (**523.6 sn** / **521.44 sn**). W1 P0 re-bake: «sekiz ders bitti» mühürlü sesten silindi. |
| Kardeş SKU `02`–`05` | Vitrinde **Çok Yakında / Hazırlanıyor.** Satın alma ve hayali oynatıcı yok. |

Yayın ilkesi: makale + mühürlü karaoke. Amiral 9 kaset sesli; sınav 9 ders bitince açılır.

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

Motor (cüzdan, sınav, mühür, hop) ayaktadır. Amiral ürün vatandaşa **9 mühürlü kaset + 9 karaoke akışı + 9 derslik sınav yolu** olarak anlatılır. Canlı nakit tanığı alınmadan gelir iddiası durur. Split ve Freelancer açılmaz.
