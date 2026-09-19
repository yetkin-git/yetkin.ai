# DURUM — yetkin.ai (yaşayan kesit)

Bu dosya yaşayan kesittir. `docs/DURUM.md` test uyumluluk aynasıdır.

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Rol | Haftalık gerçek. Anayasa B ve Manifesto sayıları buraya ve koda bırakır. Build fixture değildir. |
| Kaynak | Çalıştırılabilir kod SSOT. Canlı nakit: Super Admin operatör teyidi (18 Eylül 2026). |

Çelişkide `.system_docs/ANAYASA.md` **A Katmanı** bağlayıcıdır. Sayılar Anayasa maddesi değildir.

---

## Amiral SKU `01_office_ai`

**Tam mühürlü.** Vatandaş sırası (`lib/academy/curricula/lesson-index.ts`): `1 → k1 → 2 → 3 → 5 → 4 → g1 → w1 → 6`. Teknik sonek ders numarası değildir. Süre SSOT: `lib/academy/lesson-audio-timings/*.json` `durationSec`. P0 / P1 / P2 kapalı.

| Ölçüt | Kod gerçeği |
|-------|-------------|
| Sistem mührü | **Tam mühürlü** — 9/9 kaset + 9/9 karaoke + 9 derslik sınav yolu + P0/P1/P2 kapalı (18 Eylül 2026). |
| Sınav yolu | **9 ders** — vatandaş 1…9 (`lib/academy/curricula/lesson-index.ts`) |
| Mühürlü kaset | **9/9** — `1`, `k1`, `2`, `3`, `5`, `4`, `g1`, `w1`, `6` (`ACADEMY_MEDIA_SEALED_AUDIO`). 420–720 sn bandı dolu; bake kuyruğu boş. |
| Karaoke | **9/9** mühürlü ders `article+karaoke`. «Ses kaseti yoktur» bandı yok. |
| Üç Kapı SSOT | Aktarım: 1. yerleşik panel (Copilot / Gemini şeridi) → 2. ataş (Excel tablosu / Word belgesi / PowerPoint sunusu) → 3. maskeli kısa özet. Güvenlik sınıfı ayrı: kişisel veri / şirket sırrı / kamu cümlesi. |
| 1. ders | Üç Kapı + A1 hijyeni (`01_office_ai-1`, **649.36 sn**). Karaoke «grafik raporu» vaadi yok. |
| 2. ders | KVKK / maskeleme (`01_office_ai-k1`, **619.484 sn**). Vatandaş dili. Yükleme alışkanlığından önce. Bant içi mühürlü kaset. |
| 3. ders | Rapor: tablodan yönetim özeti (`01_office_ai-2`, **553.84 sn**). |
| 4. ders | PowerPoint Copilot + PowerPoint sunusu ataş, sıfır kodlama (`01_office_ai-3`, **531.913 sn**). **18 Eylül 2026 — 16:9 contain kamera, Copilot dock çapa ve zoom clamp kilitlendi.** |
| 5. ders | Hata avı; sol dip toplam **59.450** ekran + karaoke + TTS (`01_office_ai-5`, **522.52 sn**). |
| 6. ders | E-posta ritüeli (`01_office_ai-4`, **443.56 sn**). |
| 7. ders | Gmail + Gemini kapısı (`01_office_ai-g1`, **567.2 sn**). |
| 8. ders | Word ataş / uzun doküman (`01_office_ai-w1`, **593.64 sn**). |
| 9. ders | **Haftalık Sistem** capstone 10+10+10 (`01_office_ai-6`, **541.36 sn**). Bant içi mühürlü kaset. Sınav kapısı bu dersten sonra açılır. |
| Kurs süresi SSOT | `academyCourseSealedDurationSec("01_office_ai")` — timings toplamı **5022.877 sn ≈ 83.71 dk**; `estimatedTotalMinutes` buradan türetilir. |
| Köprüler | Çekirdek 9 kilitli. İleriki fırın: takvim/toplantı, Excel formül/grafik, PDF (`planned.ts` uydu, `lane: satellite`). |
| Kardeş SKU `02`–`05` | Vitrinde **Çok Yakında / Hazırlanıyor.** Satın alma ve hayali oynatıcı yok. |

Yayın ilkesi: makale + mühürlü karaoke. Amiral 9 kaset sesli; sınav 9 ders bitince açılır. Compact makale ve mühür havuzu Üç Kapı kilidine çekildi.

---

## Nakit ve kilitler

| Ölçüt | Durum |
|-------|--------|
| PayTR Merchant | Kod üretim kalkanlıdır (HMAC, tutar eşleşmesi, sandbox/mock üretimde yasak). |
| PayTR canlı tanık | **P0-1 Canlı Nakit Tanığı Başarıyla Alındı — PayTR CLEARED Teyit Edildi (18 Eylül 2026).** **18 Eylül 2026 — ₺15,00 PayTR CLEARED canlı kart tanığı alındı (Bakiye ₺10,00 -> ₺25,00, CREDIT defter kaydı oluşturuldu).** Super Admin, canlı PayTR iframe + 3D Secure. `amount_minor` 1000 → 2500; CLEARED 1500. Tam `merchant_oid` bu kesite basılmaz. Kalıcı sicil ve prosedür: `.system_docs/ops/ops-paytr.md` (§ Canlı nakit tanığı). |
| PayTR Split | **Kilitli.** `MARKETPLACE_SPLIT_LIVE = false`. `beginHold` / `settle` → `not_configured`. Merchant onayı Split izni değildir. |
| Freelancer kamu | **410.** Motor sicilde durur. |
| `LIVE_BROADCAST_SHUTDOWN` | **Kapalı** (varsayılan `false`). |

---

## P0 / P1 / P2 kapanış (18 Eylül 2026)

Amiral tespit ve tedavi maddeleri kapandı; geçici raporlar `/docs` masasından boşaltıldı. Açık P-maddesi yoktur.

| ID | Konu | Durum |
|----|------|--------|
| P0-1 | Canlı nakit tanığı (`CLEARED` + CREDIT + cüzdan artışı) | **Kapandı** — Super Admin teyidi, 18 Eylül 2026 |
| P0-2 | `docs/ops/DURUM.md` silinmesi | **Kapandı** |
| P1 U2 | Ders numarası / eksik satır | **Kapandı** |
| P1 U3 | Süre tablosu sapması + ders-5 518 | **Kapandı** |
| P1 U4 | `targetDurationMinutes` | **Kapandı** |
| P1 Y2 | k1 hukuk cümlesi | **Kapandı** |
| P2 Y1 / Y4 | Model dili + slogan | **Kapandı** |
| P2 Y3 | Başlık «Otomasyonu» → «Verimliliği» | **Kapandı** |

Sonraki iş P-maddesi değildir: **19 Eylül 2026** hedefli re-bake kapandı (`01_office_ai-5` / `w1` / `6`). Açık kalan: amiral SETTLED satın alma + anonim `/dogrula`, reklam kopyası (CEO). Split ve Freelancer açılmaz.

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

## Pedagoji kilit arşivi (Eylül 2026)

`.system_docs/PEDAGOJI.md` yalın kural belgesidir; tarihli kilit notları burada yaşar (20 Eylül 2026 tedavisi, S1):

- **18 Eylül 2026 (§A.2)** — Ders 4 ve genel müfredattaki ham dosya uzantıları (pptx, docx, xlsx) Vatandaş Lisanı ilkelerine uygun olarak Türkçe açıklamalara dönüştürüldü.
- **19 Eylül 2026 (§A.2)** — Ders 8 (01_office_ai-w1) açılış köprüsü 'Word belgesini doğrudan Gemini sohbetine yüklersin' şeklinde jilet gibi Vatandaş Lisanı ile kilitlendi.
- **19 Eylül 2026 (§A.2)** — Ders 8 ve tüm görsel stage yüzeylerinde ham `.docx` uzantısı kaldırıldı; ataş / titlebar / punchcard etiketi `Sözleşme Belgesi (Word)` olarak kilitlendi.
- **20 Eylül 2026 (§A.2)** — Ham `xlsx` / `docx` / `pptx` seste, altyazıda, makalede ve titlebar’da yasak; karşılıklar Excel tablosu / Word belgesi / PowerPoint sunusu. Ders 2 ve Ders 4 kasetleri bu dil ile yeniden mühürlendi.
- **19 Eylül 2026 (§A.2)** — Ders 8 ve tüm müfredatta aforizma, ajans sloganı ve tekerleme dili söküldü; punchcard / rozet işin net tanımına çevrildi.
- **19 Eylül 2026 (§A.2 + §E.2)** — Ders 8 (01_office_ai-w1) senaryosu tekerleme ve slogan jargonundan tamamen arındırılarak duru insan dili ve öğretmen anlatımı ile %100 baştan yazılıp kilitlendi.
- **18 Eylül 2026 (§A.3)** — Ders 3 (Metinden Slayta) 16:9 contain kamera, Copilot dock çapa ve zoom clamp düzeltmesi kilitlendi.
- **19 Eylül 2026 (§D)** — Ders 1 ile Ders 2 arasındaki pedagojik akış hizalandı; Ders 1 ataş adımlarına erken KVKK/maskeleme uyarısı ve temiz örnek dosya vurgusu eklendi.
- **19 Eylül 2026 (§D.1)** — Vitrin karması, teknik slug ve ürün SKU kodları birebir sayısal sıraya kilitlendi (OFF-101, EC-102, SM-103, BOT-104, PR-105).

---

## Bu hafta dürüst cümle

Motor (cüzdan, sınav, mühür, hop) ayaktadır. Amiral gemisi `01_office_ai` **tam mühürlüdür:** 9 mühürlü kaset + 9 karaoke akışı + 9 derslik sınav yolu + P0/P1/P2 kapalı. Canlı nakit hattında PayTR `CLEARED` tanığı vardır (₺15,00; 18 Eylül 2026). Split ve Freelancer açılmaz. Reklam ve ikinci SKU fırını ayrı CEO kararıdır.
