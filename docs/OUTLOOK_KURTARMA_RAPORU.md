# OUTLOOK KURTARMA RAPORU — Paket 5

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ders | `01_office_ai-4` — E-Posta Akışı (6. ders) |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin (Saha Gözlemcisi) |
| Onay | CEO — derhal düzeltme emri |
| Belirti | Outlook penceresinin içi tamamen siyah ve boş; gelen kutusu, okunmamış satırlar ve aksiyon kartları kayıp |

---

## Yönetici özeti

Paket 4 letterbox’tan Excel tahsilat karesini temizlerken Outlook masasını opak `#0b1220` yaptı. Aynı anda PowerPoint’in `height: auto` contain kuralı Outlook penceresine de bağlandı. 142 satırlık gelen kutusu `office-win-fit` tarafından pul kadar küçültüldü; kalan alan simsiyah kutu olarak kaldı. Kıyaslama panellerindeki kırmızı/turuncu çerçeveler “layout kırılma çizgisi” gibi göründü.

Tedavi: Outlook penceresi sahneyi doldurur (`height: 100%`). Dump listesi çerçeve içinde kırpılır, ölçeklenmez. Mail satırları ve SIFIR KUTU kartları kontrastlı zeminle geri gelir. Copilot kolonu aynı yükseklikte okunur.

`email-workspace.tsx` bu repoda yok; canlı yüzey `components/academy/lesson-outlook-workspace.tsx` + `lib/academy/outlook-workspace.ts`.

---

## Kök neden

1. `.academy-player-waiter .academy-outlook-win` PowerPoint ile birlikte `height: auto; min-height: 0` aldı.
2. `.academy-outlook-body` `flex: 1 1 0` + `min-height: 0` ile intrinsik yükseklik vermedi; tuval `#0b1220` boş kutu oldu.
3. `ACADEMY_OUTLOOK_DUMP_MAILS` (142 satır) `office-win-fit` `scrollHeight` ölçüsünü şişirdi → `scale ≈ 0`; pencere sol üstte pul, geri kalan masa siyah.
4. Grup kartı zemini `rgba(8, 16, 32, 0.72)` opak `#0b1220` üzerinde kayboldu.

---

## Kurtarma

### Pencere — sahneyi doldur, dump’ı pul yapma

| Seçici | Kural |
|--------|--------|
| `.academy-outlook-desk > .academy-office-win-fit` | `height: 100%`, `overflow: hidden` — 142 satır fit kutusunu büyütmez |
| `.academy-player-waiter .academy-outlook-win` | `height: 100%` (PowerPoint `height: auto` kuralından ayrıldı) |
| `.academy-outlook-body` | `grid-template-rows: minmax(0, 1fr)` |
| `.academy-outlook-canvas-wrap` / `.academy-outlook-canvas` | `height: 100%`, `overflow: hidden` |
| Dump listesi | çerçeve içinde kırpılır; okunmamış yığın dolgun durur |
| SIFIR KUTU | üç grup kartı tuvali doldurur |

PowerPoint slaytı 16:9 `height: auto` sözleşmesini korur.

### Kontrast — koyu tema, canlı içerik

Zemin `#0b1220` / `#101820` durur. İçerik opak ve okunur:

| Öğe | Zemin |
|-----|--------|
| Mail satırı | `#163250` / okunmamış `#1b3d63` |
| Seçili satır | `#1f4d4a` + yeşil çerçeve |
| Okuma paneli | `#122033` |
| Copilot kolonu | `#152536` |
| ACİL kart | `#3f1a22` |
| BEKLE kart | `#3d3010` |
| ARŞİV kart | `#12382f` |

Gelen kutusu başlığı (`Gelen Kutusu · 142 okunmamış`) ve Kaya / Yıldız / Bülten etiketleri (Acil, Bekle, Arşiv) DOM’da durur.

---

## Düzeltilen bileşenler

| Dosya | Değişiklik |
|-------|------------|
| `components/academy/lesson-outlook-workspace.tsx` | Liste başlığı, aksiyon etiketleri, okuma paneli etiketi |
| `app/globals.css` | Outlook fill kilidi, dump clip, kontrast, Copilot dolgusu |
| `tests/academy/outlook-workspace.test.ts` | Fill / dump / etiket sözleşmesi |
| `tests/academy/curriculum-player-surface.test.ts` | Ders 6 Outlook `height: 100%` + dump map kilidi |
| `lib/academy/outlook-workspace.ts` | İçerik SSOT — değişmedi (142 dump, 3 reset grubu) |

---

## Doğrulama

```
npx vitest run tests/academy/outlook-workspace.test.ts tests/academy/curriculum-player-surface.test.ts
```

Sonuç: 2 dosya, 8 test, geçti (v3.2.7).

### Sahne kilidi

| Sahne | Görünen |
|-------|---------|
| INBOX KAOSU / HOŞ GELDİN | 142 okunmamış yığın, Kaya/Yıldız/Bülten etiketli, okuma paneli |
| TASLAK YAZ | Aynı dump + Copilot sağ kolon |
| SIFIR KUTU / FARK ORTADA | Sol dump, sağ ACİL / BEKLE / ARŞİV kartları |
| CEBİNE KOY | Sıfır kutu kartları + 3 adım overlay |

### Elle bakılacaklar

1. `/academy/01_office_ai/oyna` — 6. ders, canlı Outlook; siyah boş kutu yok.
2. INBOX KAOSU — gelen kutusu dolu, satırlar okunur.
3. SIFIR KUTU — üç renkli aksiyon kartı dolgun.
4. CEBİNE KOY — kartlar + yeşil 3 adım listesi.
5. Copilot şeridi ve sağ panel metni net.

Oynatıcı oturum kapısı arkasında olduğu için bu turda tarayıcı tıklama turu yapılmadı; kilit vitest + kaynak sözleşmesi.

---

## Bilinçli sözleşme

Outlook masası koyu kalır; Excel tahsilat PNG’si letterbox’a dönmez. Gelen kutusu 142 satırı DOM’da tutar ama pencereyi `scale` ile küçültmez — yığın çerçevede kırpılır. SIFIR KUTU üç karttır, 142 satırın tekrarı değildir. `text-overflow: ellipsis` ve `overflow-wrap: anywhere` Outlook seçicilerinde yok.
