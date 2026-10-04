# FAZ 3 — Paket 1: Sesin özel kovaya hazırlanması

| Alan | Değer |
| --- | --- |
| Tarih | 4 Ekim 2026 |
| Kime | CEO |
| Paket | Ses sayımı ve adres üreticisi. Dosya yerinden silinmedi. |
| Dil | Yalın Türkçe |

Canlı dinleme bu paketten sonra da bugünkü yoldan gelir. `ACADEMY_MEDIA_READ` boştur. Boş değer `local` demektir. Kimse `--apply` çalıştırmadı. Kovaya bayt yazılmadı. `public/` içindeki ses duruyor.

---

## 1. Kısa hüküm

Kuru sayım **77** ses dosyasını gördü. Konuşma **39**, fon yatağı **38**. Toplam **860,8 MB** (902.627.217 bayt). Tasarım raporundaki 77 dosya ve 860,8 MB ile aynı.

Eksik, boş, tavan üstü, yetim ve WAV yok. `media-bake` listeye girmedi. `lesson-audios` kovasına yazma yolu kapalı.

Tip denetimi geçti. Test paketi geçti: **246** dosya, **1203** test, hepsi yeşil.

---

## 2. Ne değişti

1. `scripts/ops-sync-media-to-storage.ts` sayar. Bayrak yoksa kuru sayım yapar. `--dry-run` aynı işi yapar. `--apply` olmadan kovaya yazmaz.
2. Liste sınav yolu, fon yatağı ve hazırlık şeridinden türer. Dosya adı elle yazılmadı. Hazırlık şeridi `01_office_ai-0.mp3` listenin içindedir. Emekli `01_office_ai-4` yoktur.
3. Nesne yoluna `?v=` damgası yazılır. Örnek: `01_office_ai/01_office_ai-1/v699951.mp3`. Fon yatağı `v699951.bed.mp3` olur. Eski sürüm yeni dosyanın üstüne binmez.
4. `ACADEMY_MEDIA_READ=local` iken adres üretici bugünkü site yoluna 4 saatlik `g` imzasını ekler. Kenar imzasız isteğe 403 demeye devam eder.
5. `ACADEMY_MEDIA_READ=storage` iken satın alma veya ücretsiz ilk ders doğrulandıktan sonra özel `academy-sealed` kovasının 4 saatlik adresi üretilir. Adres `https` olur. Tarayıcı dosyayı doğrudan kovadan çeker. Servis anahtarı tarayıcıya gitmez. Anahtar yalnız sunucu ve `--apply` betiğindedir. Şablon dosyasına yazılmadı.
6. İmza üretilemezse cevap 503 kalır. Eksik sesin yerine başka ders konmaz.
7. Ücretsiz vitrin hâlâ yalnız satış hunisinin ilk dersine adres yazar. Ders 2 ve sonrası bu haritaya girmez. Satın alma kapısı, imza üretilmeden önce durur. Satın alma yoksa 403.

`--apply` şunları yapar, bu turda çalışmadı: kova yoksa özel `academy-sealed` açar, dosya tavanı 50 MB, herkese açık okuma kapalı. Boyut ve özet aynıysa dosyayı atlar. Yereli silmez. Kovadaki fazla nesneyi silmez. Kova herkese açıksa durur.

---

## 3. Kuru sayım çıktısı

Komut: `npx tsx scripts/ops-sync-media-to-storage.ts`

Çıkış kodu: **0**

```
ops:sync-media-to-storage KURU SAYIM
Kova: academy-sealed (özel). Yerel dosya silinmedi. Kovadan silme yok.
Konuşma: 39
Fon yatağı: 38
Toplam: 77
Bayt: 902627217
MB: 860.8
Eksik: 0
Boş: 0
Tavan üstü: 0
Yetim (dışarıda): 0
Red (wav / media-bake): 0
Yok sayılan: 0
ses	01_office_ai/01_office_ai-1/v699951.mp3	public/media/academy/audio/01_office_ai/01_office_ai-1.mp3
yatak	01_office_ai/01_office_ai-1/v699951.bed.mp3	public/media/academy/audio/01_office_ai/01_office_ai-1.bed.mp3
ses	01_office_ai/01_office_ai-k1/v737865.mp3	public/media/academy/audio/01_office_ai/01_office_ai-k1.mp3
yatak	01_office_ai/01_office_ai-k1/v737865.bed.mp3	public/media/academy/audio/01_office_ai/01_office_ai-k1.bed.mp3
ses	01_office_ai/01_office_ai-2/v539659.mp3	public/media/academy/audio/01_office_ai/01_office_ai-2.mp3
yatak	01_office_ai/01_office_ai-2/v539659.bed.mp3	public/media/academy/audio/01_office_ai/01_office_ai-2.bed.mp3
ses	01_office_ai/01_office_ai-3/v570761.mp3	public/media/academy/audio/01_office_ai/01_office_ai-3.mp3
yatak	01_office_ai/01_office_ai-3/v570761.bed.mp3	public/media/academy/audio/01_office_ai/01_office_ai-3.bed.mp3
ses	01_office_ai/01_office_ai-5/v592220.mp3	public/media/academy/audio/01_office_ai/01_office_ai-5.mp3
yatak	01_office_ai/01_office_ai-5/v592220.bed.mp3	public/media/academy/audio/01_office_ai/01_office_ai-5.bed.mp3
ses	01_office_ai/01_office_ai-g1/v640634.mp3	public/media/academy/audio/01_office_ai/01_office_ai-g1.mp3
yatak	01_office_ai/01_office_ai-g1/v640634.bed.mp3	public/media/academy/audio/01_office_ai/01_office_ai-g1.bed.mp3
ses	01_office_ai/01_office_ai-w1/v583984.mp3	public/media/academy/audio/01_office_ai/01_office_ai-w1.mp3
yatak	01_office_ai/01_office_ai-w1/v583984.bed.mp3	public/media/academy/audio/01_office_ai/01_office_ai-w1.bed.mp3
ses	01_office_ai/01_office_ai-6/v529723.mp3	public/media/academy/audio/01_office_ai/01_office_ai-6.mp3
yatak	01_office_ai/01_office_ai-6/v529723.bed.mp3	public/media/academy/audio/01_office_ai/01_office_ai-6.bed.mp3
ses	01_office_ai/01_office_ai-0/v255800.mp3	public/media/academy/audio/01_office_ai/01_office_ai-0.mp3
ses	01_office_ai_ileri/01_office_ai_ileri-1/v508249.mp3	public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-1.mp3
yatak	01_office_ai_ileri/01_office_ai_ileri-1/v508249.bed.mp3	public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-1.bed.mp3
ses	01_office_ai_ileri/01_office_ai_ileri-2/v609618.mp3	public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-2.mp3
yatak	01_office_ai_ileri/01_office_ai_ileri-2/v609618.bed.mp3	public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-2.bed.mp3
ses	01_office_ai_ileri/01_office_ai_ileri-3/v662323.mp3	public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-3.mp3
yatak	01_office_ai_ileri/01_office_ai_ileri-3/v662323.bed.mp3	public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-3.bed.mp3
ses	01_office_ai_ileri/01_office_ai_ileri-4/v755895.mp3	public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-4.mp3
yatak	01_office_ai_ileri/01_office_ai_ileri-4/v755895.bed.mp3	public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-4.bed.mp3
ses	01_office_ai_ileri/01_office_ai_ileri-5/v847653.mp3	public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-5.mp3
yatak	01_office_ai_ileri/01_office_ai_ileri-5/v847653.bed.mp3	public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-5.bed.mp3
ses	01_office_ai_ileri/01_office_ai_ileri-6/v718382.mp3	public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-6.mp3
yatak	01_office_ai_ileri/01_office_ai_ileri-6/v718382.bed.mp3	public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-6.bed.mp3
ses	02_ecommerce_ai/02_ecommerce_ai-1/v900136.mp3	public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-1.mp3
yatak	02_ecommerce_ai/02_ecommerce_ai-1/v900136.bed.mp3	public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-1.bed.mp3
ses	02_ecommerce_ai/02_ecommerce_ai-2/v892088.mp3	public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-2.mp3
yatak	02_ecommerce_ai/02_ecommerce_ai-2/v892088.bed.mp3	public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-2.bed.mp3
ses	02_ecommerce_ai/02_ecommerce_ai-3/v577536.mp3	public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-3.mp3
yatak	02_ecommerce_ai/02_ecommerce_ai-3/v577536.bed.mp3	public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-3.bed.mp3
ses	02_ecommerce_ai/02_ecommerce_ai-4/v811728.mp3	public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-4.mp3
yatak	02_ecommerce_ai/02_ecommerce_ai-4/v811728.bed.mp3	public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-4.bed.mp3
ses	02_ecommerce_ai/02_ecommerce_ai-5/v819052.mp3	public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-5.mp3
yatak	02_ecommerce_ai/02_ecommerce_ai-5/v819052.bed.mp3	public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-5.bed.mp3
ses	02_ecommerce_ai/02_ecommerce_ai-6/v1006012.mp3	public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-6.mp3
yatak	02_ecommerce_ai/02_ecommerce_ai-6/v1006012.bed.mp3	public/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-6.bed.mp3
ses	03_social_media_ai/03_social_media_ai-1/v355200.mp3	public/media/academy/audio/03_social_media_ai/03_social_media_ai-1.mp3
yatak	03_social_media_ai/03_social_media_ai-1/v355200.bed.mp3	public/media/academy/audio/03_social_media_ai/03_social_media_ai-1.bed.mp3
ses	03_social_media_ai/03_social_media_ai-2/v373610.mp3	public/media/academy/audio/03_social_media_ai/03_social_media_ai-2.mp3
yatak	03_social_media_ai/03_social_media_ai-2/v373610.bed.mp3	public/media/academy/audio/03_social_media_ai/03_social_media_ai-2.bed.mp3
ses	03_social_media_ai/03_social_media_ai-3/v339020.mp3	public/media/academy/audio/03_social_media_ai/03_social_media_ai-3.mp3
yatak	03_social_media_ai/03_social_media_ai-3/v339020.bed.mp3	public/media/academy/audio/03_social_media_ai/03_social_media_ai-3.bed.mp3
ses	03_social_media_ai/03_social_media_ai-4/v337630.mp3	public/media/academy/audio/03_social_media_ai/03_social_media_ai-4.mp3
yatak	03_social_media_ai/03_social_media_ai-4/v337630.bed.mp3	public/media/academy/audio/03_social_media_ai/03_social_media_ai-4.bed.mp3
ses	03_social_media_ai/03_social_media_ai-5/v362860.mp3	public/media/academy/audio/03_social_media_ai/03_social_media_ai-5.mp3
yatak	03_social_media_ai/03_social_media_ai-5/v362860.bed.mp3	public/media/academy/audio/03_social_media_ai/03_social_media_ai-5.bed.mp3
ses	03_social_media_ai/03_social_media_ai-6/v337700.mp3	public/media/academy/audio/03_social_media_ai/03_social_media_ai-6.mp3
yatak	03_social_media_ai/03_social_media_ai-6/v337700.bed.mp3	public/media/academy/audio/03_social_media_ai/03_social_media_ai-6.bed.mp3
ses	04_chatbot_nocode/04_chatbot_nocode-1/v348000.mp3	public/media/academy/audio/04_chatbot_nocode/04_chatbot_nocode-1.mp3
yatak	04_chatbot_nocode/04_chatbot_nocode-1/v348000.bed.mp3	public/media/academy/audio/04_chatbot_nocode/04_chatbot_nocode-1.bed.mp3
ses	04_chatbot_nocode/04_chatbot_nocode-2/v338110.mp3	public/media/academy/audio/04_chatbot_nocode/04_chatbot_nocode-2.mp3
yatak	04_chatbot_nocode/04_chatbot_nocode-2/v338110.bed.mp3	public/media/academy/audio/04_chatbot_nocode/04_chatbot_nocode-2.bed.mp3
ses	04_chatbot_nocode/04_chatbot_nocode-3/v313750.mp3	public/media/academy/audio/04_chatbot_nocode/04_chatbot_nocode-3.mp3
yatak	04_chatbot_nocode/04_chatbot_nocode-3/v313750.bed.mp3	public/media/academy/audio/04_chatbot_nocode/04_chatbot_nocode-3.bed.mp3
ses	04_chatbot_nocode/04_chatbot_nocode-4/v308380.mp3	public/media/academy/audio/04_chatbot_nocode/04_chatbot_nocode-4.mp3
yatak	04_chatbot_nocode/04_chatbot_nocode-4/v308380.bed.mp3	public/media/academy/audio/04_chatbot_nocode/04_chatbot_nocode-4.bed.mp3
ses	04_chatbot_nocode/04_chatbot_nocode-5/v308230.mp3	public/media/academy/audio/04_chatbot_nocode/04_chatbot_nocode-5.mp3
yatak	04_chatbot_nocode/04_chatbot_nocode-5/v308230.bed.mp3	public/media/academy/audio/04_chatbot_nocode/04_chatbot_nocode-5.bed.mp3
ses	04_chatbot_nocode/04_chatbot_nocode-6/v332020.mp3	public/media/academy/audio/04_chatbot_nocode/04_chatbot_nocode-6.mp3
yatak	04_chatbot_nocode/04_chatbot_nocode-6/v332020.bed.mp3	public/media/academy/audio/04_chatbot_nocode/04_chatbot_nocode-6.bed.mp3
ses	05_prompt_practice/05_prompt_practice-1/v353344.mp3	public/media/academy/audio/05_prompt_practice/05_prompt_practice-1.mp3
yatak	05_prompt_practice/05_prompt_practice-1/v353344.bed.mp3	public/media/academy/audio/05_prompt_practice/05_prompt_practice-1.bed.mp3
ses	05_prompt_practice/05_prompt_practice-2/v342318.mp3	public/media/academy/audio/05_prompt_practice/05_prompt_practice-2.mp3
yatak	05_prompt_practice/05_prompt_practice-2/v342318.bed.mp3	public/media/academy/audio/05_prompt_practice/05_prompt_practice-2.bed.mp3
ses	05_prompt_practice/05_prompt_practice-3/v362448.mp3	public/media/academy/audio/05_prompt_practice/05_prompt_practice-3.mp3
yatak	05_prompt_practice/05_prompt_practice-3/v362448.bed.mp3	public/media/academy/audio/05_prompt_practice/05_prompt_practice-3.bed.mp3
ses	05_prompt_practice/05_prompt_practice-4/v379101.mp3	public/media/academy/audio/05_prompt_practice/05_prompt_practice-4.mp3
yatak	05_prompt_practice/05_prompt_practice-4/v379101.bed.mp3	public/media/academy/audio/05_prompt_practice/05_prompt_practice-4.bed.mp3
ses	05_prompt_practice/05_prompt_practice-5/v394984.mp3	public/media/academy/audio/05_prompt_practice/05_prompt_practice-5.mp3
yatak	05_prompt_practice/05_prompt_practice-5/v394984.bed.mp3	public/media/academy/audio/05_prompt_practice/05_prompt_practice-5.bed.mp3
ses	05_prompt_practice/05_prompt_practice-6/v406882.mp3	public/media/academy/audio/05_prompt_practice/05_prompt_practice-6.mp3
yatak	05_prompt_practice/05_prompt_practice-6/v406882.bed.mp3	public/media/academy/audio/05_prompt_practice/05_prompt_practice-6.bed.mp3
ops:sync-media-to-storage KURU SAYIM TAMAM — kovaya yazılmadı.
```

---

## 4. Doğrulama

| Kontrol | Sonuç |
| --- | --- |
| `npx tsx scripts/ops-sync-media-to-storage.ts` | Çıkış 0. 77 dosya, 860,8 MB. Kovaya yazılmadı. |
| `npx tsc --noEmit` | Çıkış 0. |
| `npm test` | Çıkış 0. 246 dosya, 1203 test geçti. |

---

## 5. Bilerek yapılmayanlar

- `--apply` çalışmadı. Kova bu turda açılmadı, dosya kopyalanmadı.
- `public/` içinden ses silinmedi. Git kaydına dokunulmadı.
- Üretim bayrağı `storage` yapılmadı. Canlı oturum bugünkü site yolunu çalar.
- Video ve görsel yerinde kaldı.
- `media-bake` WAV ana kayıtları kopyalanmadı ve silinmedi.
- Eski `lesson-audios` kovasına yazılmadı.
- Dinleme kapısı genişletilmedi ve daraltılmadı. Ücretsiz adres hâlâ ders 1 içindir. Satın alınan ders hâlâ satın alma sorusundan sonra açılır.

Sıradaki onay, tasarım raporundaki elle dinleme adımıdır: önce `--apply`, sonra bir önizleme ortamında bayrağı `storage` yapmak. O turda anonim ders 1, hazırlık şeridi, satın alınmış bir ders 2, imzasız adresin 403 vermesi ve dosyanın ortasından devam dinlenir. Bu paket o dinlemeyi açmadı. Baytlar hâlâ sitede durduğu için geri dönüş, bayrağı boş bırakmaktır.
