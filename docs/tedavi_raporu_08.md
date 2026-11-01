# Tedavi Raporu 08 — Junior ders kartı tıklanır ve düğme ekranda kalır

Tarih: 2026-11-01
Kapsam: `/junior` raflarındaki 6. sınıf ders kartı. Açık kartın yalnız pembe «Başla» / «Ücretsiz Başla» düğmesi dersi açıyordu; kısa pencerede düğme ekran altına kayıyordu.

Ölçüm `localhost:3000/junior` üzerinde, 1366×640 pencerede, matematik açılış kartı (`jr_06_mat-1`).

---

## Özet

| Soru | Cevap |
|---|---|
| Kartın neresi dersi açıyordu? | Yalnız alttaki pembe düğme bir linkti. Kapak, başlık ve açıklama tıklanmıyordu. |
| Şimdi ne açıyor? | Açık ders kartının tamamı tek link: `/junior/ders/{anahtar}`. İmleç `pointer`. Üzerine gelince kart 2px yükselir, safir kenar ve `--shadow-lift` alır. |
| Kilitli kart? | Kartın tamamı paket bilgi penceresini açar. Ders adresine gitmez. |
| Düğme neden taşıyordu? | Kapak 2/1 oranında 121px kalıyordu. Kart 318px olunca düğmenin tabanı 659px’te, 640px pencerenin 19px altında kalıyordu. |
| Düğme şimdi nerede? | `mt-auto shrink-0` altlık. Kapak 8/3 ve en çok 96px. 1366×640 ölçümünde düğme 32px, kartın 9px içinde, pencerenin 21px üstünde. Kart yüksekliği 277px. |

---

## ADIM 1 — Kartın tamamı link

`components/junior/visual-course-cards.tsx`

Açık ders (`face.action` dolu) kartı saran `Link`. Görsel düğme `span` (`data-junior-card-action`, `pointer-events-none`); iç içe ikinci link yok. Hazırlık kartında aksiyon yok, o kart link değil.

Kilitli kart düğmedir ve aynı kabuğu kullanır: `cursor-pointer`, `hover:-translate-y-0.5`, `hover:border-[var(--safir)]`, `hover:shadow-[var(--shadow-lift)]`.

`components/junior/elective-grid.tsx` aynı kabuğu ve kapağı kullanır. Açık seçmeli kart ve denetçinin «Admin İncele» kartı ders adresine gider. Denetimsiz kilitli seçmeli kartta düğme yoktur.

Tarayıcı: kart gövdesine (düğmenin üstüne) tıklanınca adres `http://localhost:3000/junior/ders/jr_06_mat-1`, başlık «Çarpanlar, Katlar ve Bölünebilme - 6. Sınıf Matematik». Kilitli «Asal sayılar» kartı paket penceresini açar; adres `/junior` kalır.

---

## ADIM 2 — Dikey sıkılaştırma ve altlık

| Parça | Önce | Sonra |
|---|---|---|
| Kapak | `aspect-[2/1]`, 4 sütunda 121px | `aspect-[8/3] max-h-24`, ölçülen 91px |
| Gövde aralığı | `gap-1`, `pt-1.5` | `gap-0.5`, `pt-1` |
| Başlık satırı | iki satır, `leading-tight` | aynı, iki satırda kesilir |
| Tanıtım | `leading-snug`, iki satır | aynı |
| İlerleme şeridi | compact `gap-0.5` | aynı |
| Pembe düğme | `mt-auto shrink-0 px-3 pb-2 pt-1` | aynı; düğme metni tıklamayı karta bırakır |
| Raf ızgarası | `gap-2 pb-3` | aynı |

1366×640, `jr_06_mat-1`, kaydırma 0:

| | Ölçü |
|---|---|
| Kart | 277px, `cursor: pointer` |
| Kapak | 91px |
| Düğme | 32px, «Ücretsiz Başla» |
| Düğme tabanı | 619px (pencere 640px, pay 21px) |
| Kart tabanı | 627px (düğmenin 9px altında) |
| Altlık | `mt-auto shrink-0`; serbest yükseklik yokken hesaplanan üst boşluk 0 |

---

## ADIM 3 — Kapılar

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | temiz |
| Değişen dosyaların linteri | temiz |
| `npx vitest run` | 1968 geçti, 10 kaldı. Onu da akademi süre mührü (`01_office_ai` timings); bu görevden önce de kırıktı. Junior kart testleri geçti. |
| `tests/ui/junior-elective-admin-review.test.ts` | 6/6 geçti |
| `tests/kernel/junior-meb-calendar.test.ts` | 10/10 geçti |
| `verify:junior-content` | OK — 111 senaryo |
| `verify:junior-sync` | OK |
| `verify:junior-visual-ops` | OK |
| `verify:boundaries` | OK |
| `verify:api-auth --check` | OK — 77 rota |

---

## Dokunulan dosyalar

| Dosya | Ne |
|---|---|
| `components/junior/visual-course-cards.tsx` | Açık kart tek link; kilitli kart hover kabuğu; kapak 8/3; gövde `gap-0.5`; düğme `mt-auto shrink-0` |
| `components/junior/elective-grid.tsx` | Seçmeli kart aynı kabuk, kapak ve ders linki |
| `components/junior/lesson-completion-bar.tsx` | Compact şerit aralığı `gap-0.5` |
| `tests/ui/junior-elective-admin-review.test.ts` | Aksiyon metni kart linkinin içinde aranır |
