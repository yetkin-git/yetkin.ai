# Ürün vitrini — yetkin.ai

yetkin.ai, küçük ve orta ölçekli işletmenin günlük işini yapay zekâ ile hızlandıran bir çalışma masasıdır. Kayıt olmadan denersiniz; işiniz büyüdükçe paket alırsınız.

Bu belge canlı vitrini tarif eder. Satış cümlesi burada dürüsttür: askıdaki ürün fiyat ve ses vaadi taşımaz.

## Vitrin

| Yol | Ne satar | Erişim | Kasa | Bayrak |
|-----|----------|--------|------|--------|
| `/tezgah` | AI Tezgâh. Yedi iş aracı ve üç Pro Studio aracı. | Misafir dener; üye arşivler. | PayTR Merchant. Pro abonelik ve üretim kredisi. | `DronBayrakları.isKapali("tezgah") === false`. AI Tezgâh canlı. |
| `/tetkik` | Web Site Analizi. Deterministik skor ve paylaşılabilir rapor. | Misafir. Ömür boyu 1 ücretsiz hak. | Kota bitince Pro veya kredi. | Tezgâh `tetkik` havuzu. |
| `/e-ticaret` | E-ticaret ürün kartı ve işletim yüzeyi. | Üye. | Tezgâh `lite` kotası, sonra Pro/kredi. | Canlı. |
| `/hibe` | Hibe Bulucu ve proje dosyası. | Üye. | Dosya üretimi kota; yazdırma ücretsiz hat değildir. | Kabuk açık. Eski `hibe` disk odası donuk listesindedir; ürün yüzeyi Tezgâh grant aracıdır. |
| `/career` | YetkinCV. Doğrulanabilir yetkinlik kartı. | Kabuk üyeye; `/vize` herkese. | Belge satışı yok. Kanıt URL’si ücretsizdir. | Çalışan oda. |
| `/dashboard` | Panel. İşin özeti. | Üye. | Yok. | Çalışan oda. |
| `/academy` | Akademi. Askıya alınmış motor. | Kenar 410. | Satış kapalı. Fiyat ve ses vaadi basılmaz. | `kapali: true`. Kod ve mühür durur. |
| `/junior` | Yetkin Junior. 6. sınıf pilotu. | Rota ziyaretçiye açık. Sol menü izin listesine bağlı. | `JUNIOR_CHECKOUT_OPEN` boşken kasa kapalı. | Açık beta. |
| `/freelancer` | Freelancer emaneti. | Kenar 410. | Split bağlı değilken nakit yok. | Kilitli motor. |

Kabukta iki aktif oda vardır: Panel ve Kariyer (`WORKING_SHELL_NAV_ROOM_IDS`). Buna 2 aktif oda + askıdaki Akademi denir.

### AI Tezgâh — yedi iş aracı

Kaynak `lib/tezgah/catalog.ts` (`TEZGAH_TOOL_POOL`).

| Araç | Havuz | Ne işe yarar |
|------|-------|----------------|
| `tetkik` | `tetkik` | Web Site Analizi |
| `proposal` | `lite` | Müşteri teklif yazıcı |
| `reklam` | `lite` | Reklam paketi |
| `pazaryeri` | `lite` | Pazaryeri katalog fabrikası |
| `grant` | `lite` | Hibe proje dosyası |
| `ecommerce` | `lite` | E-ticaret ürün kartı |
| `dukkan` | `free_template` | Sektörel dijital dükkân. Sayaç düşmez. |

Pro Studio araçları istemcidedir (`local`): görsel stüdyo, teknik çizim, mini SaaS. Kota düşmez. Ayrıntı `TEZGAH_KOTA.md`.

## Dil kuralları

Satış ve vatandaş yüzeyi sade, ajans jargonsuz ticari Türkçe kullanır.

* B2C’de hitap «sen»dir. B2B ve resmî belgede hitap «siz»dir.
* Satış cümlesinde şu kelimeler durmaz: OS, kokpit, mühür, sicil, basılmaz, uydurma, SHA-256, fixture.
* Karşılıkları: çalışma masası, panel, doğrulanabilir belge, kayıt, gösterilmez.
* Akademi için «hazırlanıyor» denir. Fiyat, ses ve «yayında» vaadi basılmaz.
* Freelancer için satış cümlesi basılmaz. Young bu vitrinde yoktur.

## Kasa

Tahsilat PayTR Merchant portudur. Pazaryeri Split bağlı değilse sahte onay yoktur; sistem 503 / `not_configured` der. Ayrıntı `ops/ops-paytr.md` ve Anayasa A2.
