# SOZLUK — yetkin.ai İç Terimler (Tek Sayfa)

Yeni geliştirici için: kodda geçen iç adların kısa karşılıkları. Kamu markası `yetkin.ai`; aşağıdaki adlar kod/operasyon dilidir, kullanıcı arayüzüne sızmaz.

## Platform

| Terim | Kısa tanım |
|-------|------------|
| **Rail / yetkin-rail** | Platform çekirdeğinin kodu adı. Tek Next.js modüler monoliti (`app/` + `lib/` + `prisma/`). |
| **Amiral** | Web uygulaması (`app/`). Veriyi RSC `load` ile çeker, oturumu çerezle taşır. |
| **Dron** | Mobil istemci (`apps/rail-is`, Expo). Yalnız Bearer JWT ile `/api/v1` konuşur; bugün **donuk** (`publishFrozenUntilFaz1Close`), mağaza yayını yok. |
| **Sürü Dron** | Vizyon cümlesi: gelecekte çoklu dron. Bugün kâğıt üzerinde — tek dron bile uçmuyor. |
| **Diyar A** | Akademi pedagoji dünyası (sınav, ders, dinleme). Bilinçli **web-only**; v1 hop değildir. |
| **Diyar B** | Rail İş dünyası (ilan, teklif, emanet). Eski v1 lab hop'larının adı; PayTR B2C ile sicilden düştü. |
| **Tezgâh** | Ustanın "İşlerim" çalışma alanı: sözleşme listesi + teslim şeridi (`deliveredAt` türevi). |

## Odalar ve yüzeyler

| Terim | Kısa tanım |
|-------|------------|
| **Oda (Room)** | Dikey ürün alanı. SSOT: `VERTICAL_ROOMS` — 4 kayıt: Panel, Akademi, Kariyer, Freelancer. |
| **Sığınak** | Çekirdek yüzey (`KERNEL_SURFACES`): Profil, Cüzdan, Pasaport, Admin. Sağ üst hub'dadır. |
| **Donmuş oda** | 410 dönen arşiv oda (8 kayıt: Studio, DevLabs, Kurumsal, Hibe, Arena, Yetkinİlan, Junior, Social). Disk: `archived/`. |
| **410** | "Gone" — donmuş/kilitli yüzeyin dürüst cevabı. Ölü linkten iyidir; envanteri kenar + `archived/` tutar. |
| **Amiral SKU** | `01_office_ai` — vitrin kahramanı kurs; 6/6 mühürlü ses. |
| **Compact SKU** | Satıştaki 5 kurs (`01`…`05`). Kanon 13 başlık yol haritasıdır, vitrin değil. |

## Para ve güven

| Terim | Kısa tanım |
|-------|------------|
| **Mühür (Seal)** | Sunucu-tarafı bütünlük kaydı (SHA-256 sınav sertifikası, müfredat özeti, WAV ses). **Kriptografik imza değildir.** |
| **Vize** | Kariyer vizesi: akademi sertifikasından türeyen nitelikli-ilana-teklif izni. Yoksa teklif **403**. |
| **Pasaport** | Vize damgaları sicili (`/pasaport`). Uydurma damga basılmaz. |
| **Merchant Port** | PayTR B2C kapısı: iFrame tahsilat → ön ödemeli bakiye → kurs. Canlı yol budur. |
| **Split Port** | PayTR Pazaryeri emanet kapısı. **Kapalı** (`MARKETPLACE_SPLIT_LIVE=false`); kabul **503**. |
| **Emanet (Escrow)** | İş bedeli kilidi (`escrow_holds`). Cüzdan-fonlu hold **yasak**; dağıtım Split'indir. |
| **Defter (Ledger)** | Append-only finans kaydı. Tutar yalnız `amountMinor` (kuruş, tamsayı); float para yasak. |
| **Cüzdan** | Kapalı devre ön ödemeli bakiye. Dışa transfer ve nakit çekim **yok** (S43). |
| **Hazine** | Şirket geliri sentineli (`PLATFORM_TREASURY_USER_ID`). Akademi DEBIT'i buraya akar. |
| **Valör** | PayTR clearing taraması: PENDING sipariş PSP doğrulamasıyla CREDIT'e döner. |
| **Idempotency-Key** | Yazma tekrar kalkanı (UUID). Aynı anahtar ikinci debit/credit doğurmaz. |

## Sözleşme ve kapılar

| Terim | Kısa tanım |
|-------|------------|
| **Hop** | v1 sözleşmesinde tek uç (method + path + Zod). SSOT: `RAIL_V1_HOPS` — **8 kayıt** (PayTR B2C). |
| **Zarf (Envelope)** | v1 JSON şekli: `{ ok, error, requestId, apiVersion, data }`. Versiyonsuz serim kapalı. |
| **426** | Dron sürüm kilidi: "Lütfen uygulamayı güncelleyiniz." Eski binary kilit ekranı alır. |
| **IAP yasağı** | Dron cüzdan yüklemez; yükleme sistem tarayıcısında `/cuzdan` köprüsüdür. |
| **Motor 1/2/3** | Manifesto gelir motorları: Akademi B2C (gün 0) / Kurumsal B2B (Faz 2+) / Pazaryeri komisyonu (Split sonrası). |
| **T3 / T4** | Lab nakit-halka koşucuları: T3 akademi satış halkası, T4 freelancer kazanç halkası (Split yoksa 503). |
| **SEN aksı** | Marka sesi: platform kullanıcıyla "sen" diye konuşur (`lib/copy/sen-voice`). |
| **Super Admin** | Fiyat kataloğunu yazan tek rol (`SUPER_ADMIN_USER_ID`). Kodda sabit fiyat yok. |

## Nereden başlanır

1. `.system_docs/ANAYASA.md` (A katmanı kırmızı çizgiler) → `.system_docs/OPS_RUNBOOK.md` (canlıya çıkış).
2. Bu rapor dizisi: `docs/TESPIT_RAPORU.md` (bulgular) → `docs/TEDAVI_RAPORU.md` (uygulanan düzeltmeler).
3. Dron istemcisi kuralı: `.system_docs/DRON_CLIENT_SPEC.md` (donuk paket, salt okuma niyetiyle).
