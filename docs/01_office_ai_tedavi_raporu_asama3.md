# 01_office_ai — Tedavi Raporu, Aşama 3

| Alan | Değer |
|------|--------|
| Tarih | 22 Eylül 2026 (gece fırını) |
| Dayanak | Onaylı Aşama 2 (`docs/01_office_ai_tedavi_raporu_asama2.md`) |
| Kapsam | Konuşma metni süs temizliği, allowlist fırını, cue ve zaman JSON |
| Allowlist dışı | `01_office_ai-4`. Eski ritüel kaseti yeniden kaydedilmedi. Süresi 493.8 sn durur; toplama girmez. |

Vatandaş yolu **8 ana ders + hazırlık şeridi**. Hazırlık şeridi ders sayısına girmez. Sınav kapısı 8. ders bitince açılır. Baraj 70 durur.

---

## 1. Konuşma metni — makale gövdesiyle hiza

1, 2, 3, KVKK ve yoldaki diğer kasetlerin konuşma gövdesi, makalenin «El kitabı» öncesi kaset şeridiyle eşitlendi. Kahve yudumu, «harika bir iş çıkardın», soğuk ter, yüzde seksen, algoritma, kâbus ve «tablonun konuşması» konuşma metninden silindi. KVKK’da kaymış paragraflar makale sırasına oturdu. Ekranda `KVKK` durur; seste fonetik katman `Kavekaka` der. Ham metne `Kavekaka` yazılmaz.

Kapanış dersi (`01_office_ai-6`) zaten eşitti; gövdesi yeniden yazılmadı.

Makalede olmayan tek ses kilidi, kapanış dersi dışındaki kasetlerin son cümlesidir:

> Sınav, 8. ders bitince açılır. Baraj 70 puandır.

Bu cümle Aşama 2’de seste kalsın diye yazılmıştı. Makale gövdesine geri konmadı.

Hazırlık şeridinde makale ve konuşma metni hâlâ «dokuz mühürlü ders» diyordu. Onaylı yol 8 derstir. İkisi de **sekiz** oldu; aksi halde fırın yanlış sayıyı mühürlerdi.

5. ders ara başlığı konuşma notunda, cue `text` / `section` alanında ve sinema sahnesinde **ÇAPRAZ KONTROL**. Karşılaştırma etiketi **ÇAPRAZ KONTROL (KİLİTLİ SAYI)**. Karaoke şeridi «AI DEDEKTİF» demez.

6. ders (`01_office_ai-g1`) konuşması 18 paragraf. Cue’nun karşılama bloğuna ritüel paragrafı eklendi (17 → 18 nefes). Ritüel ayrı kaset değildir; bu dersin açılışındadır.

---

## 2. Fırın

Allowlist, dry-run çıktısı:

| Anahtar | Paragraf | İstek | Model |
|---------|----------|-------|--------|
| `01_office_ai-1` | 15 | 15 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-k1` | 14 | 15 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-2` | 14 | 14 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-3` | 14 | 14 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-5` | 14 | 14 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-g1` | 18 | 18 | `gemini-3.1-flash-tts-preview` |
| `01_office_ai-w1` | 19 | 19 | birincil kota doldu → `gemini-2.5-flash-preview-tts` |
| `01_office_ai-6` | 18 | 18 | birincil kota doldu → `gemini-2.5-flash-preview-tts` |
| `01_office_ai-0` | 8 | 8 | birincil kota doldu → `gemini-2.5-flash-preview-tts` |

`01_office_ai-4` kuyruğa girmedi. Ses adı istekte Callirrhoe kaldı. Word, Cuma ve hazırlık şeridi birincil modelin günlük kotasına takıldı; fırın yedek TTS modeline düştü ve o üç kaseti baştan üretti.

Cue `start` / `end` ve `lib/academy/lesson-audio-timings/*.json` yeni MP3 sürelerine kilitlendi. `docs/curriculum/01_office_ai_*_cue.json` aynı saatleri taşır.

---

## 3. Süre bandı

Band 7–12 dk (420–720 sn). 8 ana dersin hiçbiri bandın dışına çıkmadı.

| Vatandaş | Anahtar | Saniye | Dakika |
|----------|---------|--------|--------|
| Hazırlık | `01_office_ai-0` | 233.368 | 3.89 |
| 1 | `01_office_ai-1` | 653.880 | 10.90 |
| 2 | `01_office_ai-k1` | 623.040 | 10.38 |
| 3 | `01_office_ai-2` | 530.160 | 8.84 |
| 4 | `01_office_ai-3` | 540.520 | 9.01 |
| 5 | `01_office_ai-5` | 551.920 | 9.20 |
| 6 | `01_office_ai-g1` | 571.720 | 9.53 |
| 7 | `01_office_ai-w1` | 495.168 | 8.25 |
| 8 | `01_office_ai-6` | 462.837 | 7.71 |

8 ders toplamı: **4429.245 sn ≈ 73.82 dk**. Eski toplam 4526.260 sn (75.44 dk) idi. Hazırlık şeridi bu toplama girmez. Şerit 3.89 dk’dır; 7–12 bandı numaralı ders içindir, şerit için değil.

En kısa numaralı ders Cuma (7.71 dk). En uzun ders A1 (10.90 dk). Birleşik e-posta 9.53 dk; 12 dk tavanının altında.

`targetDurationMinutes` ve `docs/DURUM.md` / `docs/ops/DURUM.md` bu toplama çekildi.

---

## 4. Sen olsaydın ne yapardın?

Senaryo mühürü bu turda tamam. Süs seste yok. Çapraz kontrol başlığı cue’da. 8 ders 7–12 bandında. `-4` allowlist’te değil.

**Ses mühürünü bugün %100 basmam.** Üç kaset birincil TTS modelinde değil:

1. `01_office_ai-w1`
2. `01_office_ai-6`
3. `01_office_ai-0`

Birincil model `gemini-3.1-flash-tts-preview` günlük kotayı Word kasetinde doldurdu. Yedek `gemini-2.5-flash-preview-tts` aynı Callirrhoe adını istedi; model aynı değil. Amiral gemisinde kulağın duyduğu tını tek model olsun. Kota yenilenince yalnız bu üç anahtarı birincil modelde yeniden kaydet. Metni açma. `-4`’ü kuyruğa yazma. 1, KVKK, 2, 3, 5 ve birleşik e-posta kasetine dokunma; onlar birincil modelde ve bandın içinde.

Hazırlık şeridini 7 dakikaya şişirme. Şerit ders değildir. 3.89 dk, hesabı açıp ilk istemi yazmak için yeter.

İstek sayısı 6 ve 7. derste 18 ve 19. Hedef 10–12, tavan 15. Mühürlü kaset bu tavanı eziyor; süre bandı tuttuğu için metni fırından sonra kısaltmam. Kısaltma, ritüel paragrafını veya Word’ün SEN/SIZ kilidini keser.

Mühür cümlesi («Sınav, 8. ders bitince açılır. Baraj 70 puandır.») makalede yok, seste var. Onu silmem. Antre ve 8. ders kapıyı anlatır; ara kasetler kapının henüz kapalı olduğunu bir cümleyle söyler.

Son mühür sırası: kota → yalnız w1, 6 ve hazırlık şeridini birincil modelde yeniden fırınla → süre bandını bir kez daha oku → o üçü de 7–12 içindeyse (şerit hariç) ses mühürünü bas. Senaryo mühürü şimdiden duruyor.
