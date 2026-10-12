# Hibrit hitap — ders kasetleri (Faz 27)

Tarih: 11 Ekim 2026  
Konu: Junior kasetlerinde topluluk açılışı, birebir ipucu ve birlikte kapanış.

## Ne değişti

105 çekirdek senaryonun açılışı ve ipucu cümlesi hibrit hitaba alındı. Kaynak `lib/junior/content/`, paket `packages/junior-content/topics/`. Pedagoji evi `.system_docs/PEDAGOJI.md` öğretmen hitabı ve `lib/junior/content-rules.ts` bu üç kalıpla hizalandı.

| An | Kalıp |
|---|---|
| Açılış | Tek numaralı ders: «Merhaba sevgili çocuklar!» — 53 ders |
| Açılış | Çift numaralı ders: «Merhaba çocuklar, hepiniz hoş geldiniz!» — 52 ders |
| İpucu | «Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta.» |
| Adım sonu | «Tebrikler çocuklar! Harika bir iş çıkardık.» |

Gövde ve mikrofon cümlesi sen dilinde kaldı. Kapanış, «Şimdi sıra sende» cümlesinin hemen önünde bir kez okunur. On iki oynatıcı adımının her biri aynı cümleyle biter.

Eski sıcak kalıbın («Merhaba güzel arkadaşım» ve dalı) düşmesi dört derste günlük sahne sayısını üçe indirdi. Kapı yeniden tutsun diye şu sahne sözcükleri gövdeye bağlandı: `jr_06_mat-6` defter, `jr_06_mat-10` sofra, `jr_06_mat-21` masa, `jr_06_fen-16` mutfak.

## jr_06_mat-1 doğrulaması

Sayfa: `/junior/ders/jr_06_mat-1` (Üslü ifadede taban ve üs).

- Senaryo girişi «Merhaba sevgili çocuklar!» ile başlıyor.
- Ders notundaki 💡 Dikkat Noktası «Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta.» diye açılıyor.
- Kaset metninde «Tebrikler çocuklar! Harika bir iş çıkardık.» kapanışı duruyor.
- Eski «Merhaba güzel arkadaşım» bu konuda yok.

## Komutlar

| Komut | Sonuç |
|---|---|
| `npm run verify:junior-content` | OK. 105 senaryo eşit, 50 kab, takvim planla aynı. 59 açık kazanım bilgisi derlemeyi kırmaz. |
| `npm run verify:prebuild` | OK. Çıkış kodu 0. Junior içerik ve ses manifesti de geçti: 105 anahtar, SHA-256 eşleşti. |

## SUPER_ADMIN notu

Ekran metni ve derlenmiş kaset değişti. Fırınlanmış MP3 yerinde duruyor; ses dosyası yeniden üretilmedi, manifest bozulmadı. Çocuk hâlâ bir önceki sesi duyar. Yeni hitabın ağızdan da çıkması için kasetlerin yeniden fırınlanması gerekir. Bu fırın harcama onayı olmadan açılmaz.
