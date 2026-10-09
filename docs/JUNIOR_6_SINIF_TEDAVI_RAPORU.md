# Junior 6. Sınıf Tedavi Raporu

Kaynak: `docs/JUNIOR_6_SINIF_TESPIT_RAPORU.md` ve CEO mühür haritası.
Tarih: 9 Ekim 2026.

Bu tur, 6. sınıf çekirdeğini satılabilir ilan etmek için yapılmadı. Çelişen model adlarını tek kimliğe indirdi, kapak fırın altyapısını kurdu, mühürlü seste robot yedeğini kapattı, seçmeli metni «sen» diline çekti, rumuzu açılışa bağladı ve mobilin okuyacağı tek kart hop'unu açtı. Kasa kapısı açılmadı. Gemini harcaması yapılmadı.

## Adım 1 — Belge ve model haritası

Metin rolü tek ad. `.system_docs/AKADEMI_URETIM_ANAYASASI.md` içinde `TEXT_GEN` yalnız `gemini-3.8-flash`. Denetim satırı (Cursor / Grok) ayrı duruyor. O satır üretim modeli değil. Şema kutusundaki görsel ad `gemini-3.1-flash-image` olarak sabitlendi. Yetişkin görsel mührü duruyor.

Junior kapak ayrı bir mühür. Kod evi `lib/kernel/ai/model-roles.ts` içinde `JUNIOR_COVER_GEN`: `gemini-3.1-flash-lite-image` (Nano Banana 2 Lite). Bu kimlik yetişkin `IMAGE_GEN` yerine yazılmıyor. Canlı yapay zekâ rol tavanı 8 kaldı. Kapak, yeni bir canlı rol değil. Mühürlü medya anahtarı.

Kapak fırını `scripts/bake-junior-covers.ts`. Çekirdek 105 dersi sayar. Çıkış yolu `public/media/junior/covers/{ders}.jpg`. Ölçü 1280×720, JPEG. Harcama anahtarı `--confirm-gemini-spend` yoksa betik kuru çalışır ve dış çağrı açmaz. Bu turda kuru çalışma 105 konuyu listeledi. Jpg üretilmedi.

Kapak bileşeni `components/junior/lesson-covers.tsx`. Diskte jpg varsa resmi gösterir. Resim yüklenmezse veya ders anahtarı geçersizse mevcut SVG yedeğine döner. Raf kartına bu turda bağlanmadı. Jpg henüz yokken her kart boş resim isteği açmasın diye liste metin kartı olarak kaldı. Bileşen, jpg geldikten sonra rafa takılmaya hazır.

Süper yönetici cümlesi `.system_docs/ANAYASA.md` B6 ve `.system_docs/OPS_RUNBOOK.md` içine aynen işlendi: Super Admin (`yapinet360@gmail.com`) kilitli dersi, anlatışı ve testi denetim için izleyebilir. Ders metnini panelden yazamaz. Metin kod dosyasıdır. Kapalı kasayı açamaz.

## Adım 2 — Temizlik

`lib/junior/content` altındaki beş ders dizini (matematik, fen, Türkçe, İngilizce, sosyal) yalnız ders dosyalarını içeri alır ve tek dizi dışarı verir. Aynı senaryoyu bir de tek tek dışarı verme kalktı.

Mühürlü çekirdek ders, ses dosyası yoksa veya dosya bozulursa tarayıcı robot sesine düşmez. Oynatıcı «Ses hazırlanıyor.» der ve bekler. Seçmeli taslakta fırınlanmış kaset yoktur. O rafta tarayıcı konuşması duruyor. Bu, çekirdek mühür yolu değildir.

Seçmeli katalog `lib/junior/elective-catalog.ts` kaynak metinde «sen» dili. «Sevgili çocuklar» ve sınıf hitabı kalktı. Metin üstüne sonradan yama yapan `toJuniorSen` silindi. Sen dili düzeltmesi sırasında ders kimlikleri (`gold`, `trap`, `elective`, `draft`, `jr_06_…`) yanlışlıkla büyük harfe kaymıştı. O kimlikler geri alındı. Katalog yine yükleniyor.

## Adım 3 — Rumuz

Çocuk derse girince profildeki rumuz geçerliyse açılış bir kez «Merhaba {rumuz}, bugün seninle bu konuya bakacağız.» olur. Rumuz yoksa, «Kapalı» ise veya e-posta gibi duruyorsa eski sıcak liste kalır. Rumuz ders dosyasına ve fırınlanmış sese yazılmaz. Mühürlü kasetin zaman çizelgesi bozulmasın diye rumuz, mühürlü derste ekranda bir satır olarak durur. Seçmeli taslakta konuşma metninin başındaki sıcak kalıp bu cümleyle değişir. Kural cümlesi `.system_docs/PEDAGOJI.md` öğretmen hitabına eklendi.

## Adım 4 — Okuma hop'u

Junior oda kaydı `lib/dronlar/kayit.ts` içinde `junior-lesson-read` hop'unu taşıyor. Oda kapalı değil. Kasa açılmadı.

Hop: `GET /api/v1/junior/lessons/{key}`. Kenar bu yolu `/api/junior/lessons/{key}` adresine çevirir. Kimlik gerekmez. Çerez istenmez. Anlatış metni zarfta yoktur. Kart şunları verir: ders anahtarı, başlık, ders, erişim (`free` veya `locked`), sahne, ses yolu, kapak yolu. Olmayan anahtar 404 ve «Bu ders yok.» döner.

Erişim, raftaki kilit kararıdır. İlk ders açık, sonrası kilitli görünür. Satın alınmış paketin kilidini bu kamu hop'u açmaz. Paket kararı oturum ister. Oturum, bu hop'un kamu kalkanını bozar. Mobil, gövdeyi ikinci bir repoya kopyalamadan bu kartı okuyabilir. Paket kilidi sonraki oturumlu okuma işidir.

Sözleşme 16 kayıttan 17 kayda çıktı. Rota yetki haritası 69 rota. Yeni rota `public`. Açık API belgesi ve dron tip çıktısı yeniden üretildi. Freelancer yolları bu belgede yok. PayTR yüzeyi duruyor.

## Bu turda doğrulananlar

- Kapak fırını kuru çalışmada 105 çekirdek dersi saydı. Dış çağrı açılmadı.
- Ders zinciri, oynatıcı saati, v1 sözleşme, hop kapısı, yetki haritası, çalışma kalkanı ve üretim standardı testleri geçti.
- Tarayıcıda misafir olarak `/junior/ders/jr_06_mat-1` açıldı. Başlık «Üslü ifadede taban ve üs». Fırınlanmış ses ilerledi. «Ses hazırlanıyor.» yazısı çıkmadı, çünkü ses dosyası duruyor. Rumuz satırı çıkmadı, çünkü misafir profili yok.
- `GET /api/v1/junior/lessons/jr_06_mat-1` 200 kart verdi. Erişim `free`. Ses yolu ve kapak yolu kartta. Anlatış metni yok.
- `jr_06_mat-2` kartı `locked`. Olmayan anahtar 404.

## Bu turda yapılmayanlar

- Kapak jpg dosyası üretilmedi. `--confirm-gemini-spend` çalıştırılmadı.
- PayTR ödeme denemesi yapılmadı. Junior kasa kapısı açılmadı.
- Rumuz, mevcut MP3 kasetine gömülmedi.
- 7. sınıf açılmadı. Seçmeli dersler taslak kaldı.
- Raf, kapak bileşenini henüz göstermiyor.

## Bölüm 5 — Eleştirel soruşturma

### 1. Canlı yayın kararlılığı yüzde yüz güvenceye alındı mı?

Alınmadı. PayTR ve kasa bu turda çalıştırılmadı. Satış kapısı kapalı duruyor. İlk matematik dersinin fırınlanmış sesi tarayıcıda ilerledi. Bu, bütün 6. sınıf oynatımının ve ödeme yolunun güvencesi değildir. Kapak resimleri henüz diskte yok. Mühürlü derste robot sese düşme kapatıldı. Ses dosyası duruyorsa çocuk kaseti dinler. Dosya yoksa «Ses hazırlanıyor.» görür.

### 2. Kural temizliği mimariyi daha esnek ve sürdürülebilir yaptı mı?

Tek iş tek evde duruyor. Metin modeli bir ad. Görsel adın yazımı düzeldi. Junior kapak, yetişkin görsel mührünün yerine geçmiyor. Süper yöneticinin izleme sınırı cümle olarak yazıldı. Yetişkin beş katman mührü duruyor. On yedi hop, ek bir okuma kapısı. Bu, bütün evi yeniden esnetmek değildir. Sürdürülebilir olan taraf, aynı kuralın iki belgede iki ayrı ad söylememesidir.

### 3. Sıradaki master plan adımı ne olmalı?

6. sınıfı satışa çıkarmadan önce yasal metin ve PayTR üçlüsü birlikte kapanmalı. Yeşil ışık, bu üçlü bitmeden yanmamalı.

Mobil, ders gövdesini kopyalamamalı. Bu turdaki kart hop'u konu, kilit, sahne, ses yolu ve kapak yolunu verir. Satın alınmış paketin kilidini okuyacak oturumlu hop, gövdeyi taşımadan ayrıca yazılmalı.

7. sınıf, 6. sınıfın bitirme verisi durmadan açılmamalı. Seçmeli ders, mühürlenene kadar taslak kalmalı. Rumuz, sese ancak yeni ve onaylı bir ses fırınıyla girmeli. Yeni bir model eklenmemeli. Kapak jpg'leri, harcama onayı verilince fırınlanmalı ve ancak o zaman raf kartına bağlanmalı.
