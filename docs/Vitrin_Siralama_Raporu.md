# Akademi vitrin sırası ve ızgara

`/academy` vitrini artık kayıt defterindeki sırayı gösterir. Masaüstünde kartlar üç eşit kolona oturur. Her kart aynı boydadır.

## Yeni sıra

| Sıra | Kod | Eğitim |
| --- | --- | --- |
| 1 | EC-102 | E-Ticaret ve Pazaryeri Yapay Zekâ (`02_ecommerce_ai`) |
| 2 | SM-103 | Sosyal Medya İçeriği (`03_social_media_ai`) |
| 3 | PR-105 | Prompt Mühendisliği (`05_prompt_practice`) |
| 4 | BOT-104 | Kodsuz Chatbot (`04_chatbot_nocode`) |
| 5 | OFF-101 | Ofiste Yapay Zekâ (`01_office_ai`) |
| 6 | OFF-201 | İleri Ofis Yapay Zekâ (`01_office_ai_ileri`) |

Sayılar `packages/kernel/src/catalog-ids/course-registry.ts` içindeki `vitrineOrder` alanındadır. Vitrin listesi bu alanı okur. Ofis eğitimi artık listenin başına sabitlenmez. Hazırlanmakta olan diğer kabukların vitrin sırası yoktur.

## Izgara

Katalog ızgarası: telefonda bir kolon, tablette iki kolon, masaüstünde üç kolon. Aralık `gap-6`.

Amiral kart iki kolon kaplamaz. Altı kart da tek hücrededir. Satırda üç kart yan yanadır.

Kart yüksekliği `h-full flex flex-col justify-between` ile hizalanır. Taban `min-h-[40rem]` (640 piksel) olduğu için kısa metinli kart da uzun metinli kartla aynı kutudadır. Düğme kartın altında kalır. Yükleme iskeleti aynı ızgarayı kullanır.

## Doğrulama

- `npx tsc --noEmit` — hata yok.
- `npm test` — 246 dosya, 1203 test geçti.
- Sıra ve ızgara testleri yeniden çalıştı — 2 dosya, 10 test geçti.
- `/academy` sayfasında kart sırası EC-102, SM-103, PR-105, BOT-104, OFF-101, OFF-201 olarak göründü.
- Üç kolonlu yerleşimde altı kartın yüksekliği 640 piksel ve genişlikleri eşit ölçüldü.
