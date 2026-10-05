# Ses yüklenemedi — tedavi raporu

| Alan | Değer |
|------|--------|
| Tarih | 5 Ekim 2026 |
| Sayfa | `/academy/03_social_media_ai/oyna` |
| Belirti | Oturumsuz ilk ders çalıyordu. Super Admin ve lisanslı müşteri «Ses yüklenemedi, metin modunda devam et» görüyor, saat `00:00` kalıyordu. |
| Bu tur | Tam oynatıcı sesi sayfa çizilirken gömüyor. Grant kapısı yatak yüzünden susmuyor. |

## Kısa hüküm

Anonim ziyaretçi ilk dersi eskisi gibi sayfanın içindeki 4 saatlik `academy-sealed` adresinden dinler. Ders 2 kilitli kalır.

Super Admin ve lisansı olan müşteri artık tarayıcının grant kapısına muhtaç değildir. Sayfa, açık olan her mühürlü ders için aynı kovadan anlatım ve fon yatağı adresini üretir ve oynatıcıya `grantedSrc` / `grantedBedSrc` olarak verir. Adres doluyken oynatıcı grant kapısını çağırmaz. İlk kare, anonim dersle aynı nesneden çalar.

Fon yatağı üretilemezse anlatım düşmez. Yatak `null` kalır, konuşma çalar.

## Ne değişti

1. **Tam oynatıcı.** `hasAcademyOynaAccess` doğruysa (`yapinet360@gmail.com` veya yürürlükteki lisans) `app/academy/[slug]/oyna/page.tsx` açık derslerin adresini sunucuda üretir. Üretim `loadAcademyOynaAudioGrants` içindedir (`lib/academy/lesson-audio-issue.ts`). Yalnız açık dersler imzalanır. Kapalı dersin adresi sayfaya konmaz. Hazırlık şeridinin sesi mühürlüyse o da aynı haritaya girer.

2. **Oynatıcı.** `components/academy/curriculum-player.tsx` bu adresi yalnız ödeme duvarında değil, tam oynatıcıda da `grantedSrc` olarak bağlar. Adres yoksa eski grant çağrısı durur; süre dolunca yenilemek için kapı yerinde kalır.

3. **Grant kapısı.** `app/api/academy/courses/[id]/audio-grant/route.ts` oturumu çerez veya Bearer ile ister (`requireSession`). Kenar kaydı `session` dir; çerezsiz istek `401` ve «Oturum gerekli.» döner. Doğrulanmış Super Admin satın alma satırı aranmadan geçer (`hasPurchased`). Lisans yoksa ve kişi Super Admin değilse `403`. Anlatım adresi üretilemezse `503`. Fon yatağı boşsa cevap `200` kalır; gövdede `data.src` vardır, `data.bedSrc` boştur.

4. **Saat damgası.** İmza, ders saatindeki `v{cacheV}` nesnesine gider. Sosyal medya ilk dersinde bu `…/03_social_media_ai-1/v355200.mp3` dir. Grant modülü ders saati dosyasını kendi yükler; damgasız yola düşmez. Kovada olmayan damgasız dosya aranmaz.

Üretimde `ACADEMY_MEDIA_READ=local` koyulmadı. Çıplak `/media/academy/audio/…` bağlanmadı. Eski `lesson-audios` kovasına yazılmadı.

## Doğrulama

| Kontrol | Sonuç |
|---------|--------|
| Canlı anonim sayfa `GET /academy/03_social_media_ai/oyna` | `200` |
| Aynı sayfada ses | `academy-sealed` adresi, grant kapısı çağrılmadı, hata cümlesi yok |
| Aynı sayfada saat | Oynatma `00:18 / 05:57` ye geldi, süre ilerledi |
| Aynı sayfada ders 2 | Kilitli. Satın alma çağrısı duruyor |
| Çerezsiz `audio-grant` | `401`, «Oturum gerekli.» |
| Canlı anonim MP3 | `200`, `audio/mpeg`, 14.209.005 bayt |
| Yeni tam oynatıcı imzası, kova | Ders 1, 2, 3 ve 6 anlatım ve yatak `206`, `audio/mpeg` |
| Anonim harita | Yalnız ders 1. Ders 2 yok |
| Yatak boş imza | Anlatım kalır. Katı vitrin yolu yataksız dersi haritaya koymaz |
| Birim test | 7 dosya, 30 test geçti |

Birim dosyalar: `lesson-audio-grant`, `access`, `freemium-contract`, `prep-strip`, `academy-sealed-media-sync`, `curriculum-player-surface`, `office-ai-lesson-1-seal`. Saat dosyası bağlandıktan sonra grant, hazırlık şeridi ve oynatıcı yüzeyi testleri yeniden geçti.

Super Admin oturumu bu turda tarayıcıda açılmadı. Canlı dağıtım henüz bu kodu taşımıyor; bu makinede o kutunun çerezi de yok. Kod yolu, o kutunun girdiği tam oynatıcıdır. O yolun ürettiği adresler kovada ders 1 ve sonraki dersler için `audio/mpeg` döndü. Dağıtımdan sonra aynı oturumda saat `00:00` da kalmamalı, «Ses yüklenemedi» cümlesi basılmamalıdır. Lisansı olmayan oturumlu müşteri ilk dersi anonimle aynı gömülü adresten dinlemeye devam eder; ders 2 duvarda kalır.
