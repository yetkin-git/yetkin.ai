# GMAIL KURTARMA RAPORU — Paket 6

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders | `01_office_ai-g1` — Gmail + Gemini ile Gelen Kutusu ve Aksiyon Listesi (7. ders) |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay | CEO — görsel düzeltme emri |
| Belirti | Ana simülasyon alanı siyah ve boş; sol ChatGPT paneli dururken Gmail satırları, Gemini kenar çubuğu ve aksiyon listesi kayboluyor |

---

## Yönetici özeti

Paket 5 Outlook masasını opak `#0b1220` ve `height: 100%` ile kurtardı. Ders 7 Gmail yüzeyi aynı Outlook ızgarasını paylaştığı için tedavi Gmail’e taşmadı. Canlı sahnede gövde hâlâ klasör + tuval iki kolon bekliyordu; taşıma-su aşamasında klasörler DOM’dan çıkınca dört mail 7 rem’lik sol şeride sıkıştı, sağ taraf simsiyah kaldı. Tuval ayrıca Outlook’un liste + okuma paneli ızgarasını tuttuğu için ikinci kolon boş `#0b1220` oldu. Gemini kenar çubuğunun (`.academy-gmail-copilot`) zemin ve yükseklik kuralı yoktu.

Tedavi: Gmail Word’deki gibi kendi kolon sözleşmesine geçer. Taşıma su tek kolon doldurur. Gelen kutusu satırları tuvali kaplar. Yerleşik sahnede aksiyon kartları ve Gemini paneli aynı yükseklikte, yüksek kontrastlı durur.

---

## Kök neden

1. `.academy-outlook-desk--live .academy-outlook-body:not(.academy-outlook-body--copilot)` klasör sütunu ayırır. Gmail taşıma-su (`GİRİŞ KÖPRÜSÜ`, `TAŞIMA SU`) klasörleri basmaz; tek çocuk dar sol kolona düşer, ana alan siyah kalır.
2. `.academy-outlook-canvas` `grid-template-columns: minmax(14rem, 1fr) minmax(14rem, 1.1fr)` ile liste + okuma bekler. Gmail okuma paneli yok; ikinci kolon boş `#0b1220`.
3. `LessonAiDesk` Gmail’de `academy-gmail-copilot` sınıfı alır. `.academy-outlook-copilot` dolgusu (zemin `#152536`, `height: 100%`) bu sınıfta yoktu — Gemini kenar çubuğu şeffaf/siyah göründü.
4. Gemini yalnızca `pane === "live"` ve `!compact` iken basılıyordu. `YERLEŞİK YOL` / `FARK ORTADA` sağ paneli (`pane === "after"`) yerleşik Gemini’siz kaldı.

`email-workspace.tsx` bu repoda yok; canlı yüzey `components/academy/lesson-gmail-workspace.tsx` + `lib/academy/gmail-workspace.ts`.

---

## Kurtarma

### Pencere — Outlook okuma ızgarasından ayrıl, sahneyi doldur

| Seçici | Kural |
|--------|--------|
| `.academy-gmail-desk .academy-outlook-body--gmail` / `--carry` | `grid-template-columns: minmax(0, 1fr)` — klasör yokken tek kolon |
| Canlı gelen kutusu (klasör açık) | `minmax(6.4rem, 7.4rem) minmax(0, 1fr)` |
| Canlı Gemini | klasör + tuval + `minmax(13rem, 18rem)` kenar çubuğu |
| After / yerleşik Gemini | tuval + `minmax(9.5rem, 13rem)`; kıyaslamada `height: auto` (yüzde yükseklik çökmez) |
| `.academy-gmail-desk .academy-outlook-canvas--compact` | tek kolon flex, `height: 100%`, zemin `#122033` |
| Canlı mail satırı | `flex: 1 1 0`, `min-height: 3.1rem` — dört satır tuvali doldurur |
| Kıyaslama paneli | `flex: 0 0 auto` kilidi durur (taşıma su clip kesilmez) |

PowerPoint slaytı 16:9 `height: auto` sözleşmesini korur. Outlook dump clip kilidi durur.

### Kontrast — koyu tema, canlı içerik

Zemin `#0b1220` / `#122033` durur. İçerik opak ve okunur:

| Öğe | Zemin |
|-----|--------|
| Mail satırı | `#163250` / okunmamış `#1b3d63` |
| Seçili satır | `#1f4d4a` + yeşil çerçeve |
| Gemini kolonu | `#152536` + mavi çerçeve |
| ACİL kart | `#3f1a22` |
| BEKLE kart | `#3d3010` |
| ARŞİV kart | `#12382f` |

Gelen kutusu başlığı (`Gelen Kutusu · son 24 saat`) ve Ödeme / Onay / Arşivlik etiketleri DOM’da durur. Aksiyon listesi başlığı: `Aksiyon listesi · kutu yerinde`.

---

## Düzeltilen bileşenler

| Dosya | Değişiklik |
|-------|------------|
| `components/academy/lesson-gmail-workspace.tsx` | Tek kolon tuval, taşıma-su gövde sınıfı, etiketler, liste başlıkları, Gemini after panelde |
| `app/globals.css` | Gmail fill kilidi, Gemini dolgusu, canlı satır yüksekliği, kıyaslama clip kilidi |
| `lib/academy/gmail-workspace.ts` | `ACADEMY_GMAIL_INBOX_HEAD` / `ACADEMY_GMAIL_ACTION_HEAD` SSOT |
| `tests/academy/curriculum-player-surface.test.ts` | Ders 7 Gmail `height` / Gemini / tek kolon kilidi |

---

## Doğrulama

```
npx vitest run tests/academy/curriculum-player-surface.test.ts tests/academy/office-ai-lesson-g1.test.ts tests/academy/office-win-fit.test.ts tests/academy/prompt-console.test.ts
```

Sonuç: 4 dosya, 19 test, geçti (v3.2.7). İstenen kilit: `tests/academy/curriculum-player-surface.test.ts` — 6 test, geçti.

### Sahne kilidi

| Sahne | Görünen |
|-------|---------|
| GİRİŞ KÖPRÜSÜ / TAŞIMA SU | ChatGPT başlığı, TAŞIMA SU rozeti, 4 mail satırı tuvali doldurur; klasör sütunu yok, siyah boş kolon yok |
| HOŞ GELDİN | Klasörler + gelen kutusu satırları, Ödeme/Onay/Arşivlik etiketleri |
| GEMİNİ AÇ | Gelen kutusu + opak Gemini kenar çubuğu (özet kapalı) |
| YERLEŞİK YOL / FARK ORTADA | Sol taşıma su, sağ aksiyon kartları + Gemini paneli |
| CEBİNE KOY | Üç renkli aksiyon kartı + 3 adım overlay |

### Elle bakılacaklar

1. `/academy/01_office_ai/oyna` — 7. ders, canlı Gmail; siyah boş kutu yok.
2. GİRİŞ KÖPRÜSÜ / TAŞIMA SU — taşıma su paneli dolgun, satırlar okunur.
3. GEMİNİ AÇ — sağ Gemini paneli zeminli, istem okunur.
4. YERLEŞİK YOL — sol kopuk yapıştırma, sağ kırmızı/sarı/yeşil kartlar + Gemini.
5. CEBİNE KOY — kartlar + yeşil 3 adım listesi.

Oynatıcı oturum kapısı arkasında olduğu için bu turda tarayıcı tıklama turu yapılmadı; kilit vitest + kaynak sözleşmesi.

---

## Bilinçli sözleşme

Gmail masası koyu kalır; Excel tahsilat PNG’si letterbox’a dönmez. Outlook 142 satır dump’ı ve PowerPoint 16:9 contain kuralı Gmail seçicilerinden ayrı durur. Gmail dört maili DOM’da tutar ve canlı sahnede satırları `flex` ile doldurur; kıyaslama panelinde `flex: 0 0 auto` ile clip ölçeğini şişirmez. `text-overflow: ellipsis` ve `overflow-wrap: anywhere` Outlook/Gmail seçicilerinde yok.
