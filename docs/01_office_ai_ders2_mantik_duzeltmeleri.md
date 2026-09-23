# 01_office_ai — 2. ders cümle ve mantık düzeltmeleri

| Alan | Değer |
|------|--------|
| Tarih | 22 Eylül 2026 |
| Ders | 2. ders (`01_office_ai-k1`) — KVKK ve maskeleme |
| Sonuç | **Tamamlandı.** Ses fırını çalıştırılmadı. |

Beş ekran cümlesi vatandaş lisanına çekildi. Düzen ile yükleme izni, satırı silmek ile maskelemek, otuz satırın gerekmemesi, model adı ile kural, sohbet kutusu ile kendi bilgisayar ayrıldı.

---

## 1. Cümleler

| Ekran | Eski | Yeni |
|-------|------|------|
| Giriş | O tabloyu temizlemiş olman, onu yapay zekâya yükleyebileceğin anlamına gelmez. | O tabloyu düzenlemiş olman, onu yapay zekâya yükleyebileceğin anlamına gelmez. |
| Maskele | Peki neden silmek yetmez? | Peki neden satırı tamamen silmiyoruz? |
| Üçüncü kapı | Otuz satırlık müşteri dökümü yetmez, çünkü model… | Otuz satırlık müşteri dökümü gerekmez, çünkü model fazladan yirmi yedi gerçek isimle daha iyi özet yazmaz; sen ise yirmi yedi kişiyi daha riske atmış olursun. |
| Fark | Listen değişir; modelin adı değişmez. | Modelin adı değişir, kural değişmez. Gördüğün gibi doğru maske, raporu yavaşlatmaz. |
| Yanlış yapıştırma | sohbet kutusunu kendi arşivin sanırsın | sohbet kutusunu kendi bilgisayarın sanırsın |

Dördüncü cümlede sonraki cümle («Gördüğün gibi doğru maske, raporu yavaşlatmaz.») duruyor; değişen parça «Modelin adı değişir, kural değişmez.»

| Yüzey | Yer |
|-------|-----|
| Ders gövdesi | `section_k1.ts` — giriş, maskele, üçüncü kapı, fark |
| Konuşma metni | `spoken-scripts/01_office_ai-k1.md` — aynı beş cümle |
| Altyazı | `lesson-cues/01_office_ai-k1.json` — aynı paragraflar |
| Kamuya açık özet | `office-ai-guide-preview.tsx` — «Tabloyu düzenlemiş olman…» |

Kelime sayacı 1432 → 1433. Artış, «silmek yetmez» yerine «satırı tamamen silmiyoruz» gelmesinden.

Aynı mantığı taşıyan ama bu beş ekranda durmayan cümleler yerinde kaldı: «Peki neden üç satır yeter de otuz satırlık müşteri dökümü yetmez?», «sohbet kutusu senin arşivin değildir», «Silmek yetmez, çünkü silinen satır mantığı da götürür.»

---

## 2. Ses

Fırın yok. Mühürlü kaset (`01_office_ai-k1`, 627.6 sn) eski kaydı izlemeye devam eder. Fonetik zaman JSON’u eski cümleleri tutar.

Beş cümle tek nefes bloğunda kaldığı için karaoke ekrana yeni metni basar. Ses ile yazı, bir sonraki fırında yeniden örtüşür.

Altyazı saatleri: 10.57–17.54, 216.13–226.96, 468.33–479.68, 535.32–541.77, 541.77–546.47.

---

## 3. Doğrulama

`office-ai-lesson-k1` ve kelime senkronu testleri geçti. Karaoke şeridi beş yeni cümleyi taşıyor; eski beş kalıp şeritte yok.

Kurs sayfası (`/academy/01_office_ai`) kamuya açık özette «Tabloyu düzenlemiş olman…» cümlesini basıyor. Oynatıcı girişi istediği için beş altyazı, oynatıcıda saniye saniye gezilmedi; metin karaoke şeridinden okundu.
