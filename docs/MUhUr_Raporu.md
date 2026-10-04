# MÜHÜR RAPORU — Yayın paketi, Aşama 3

| Alan | Değer |
|------|--------|
| Tarih | 4 Ekim 2026 |
| Kime | CEO |
| Dil | Yalın Türkçe |
| Dayanak | SEO denetimi, yayın dosyası, canlı vitrin |

---

## 1. Kısa sonuç

Veritabanında üç eğitim satışa açıldı. Fiyatlar istenen tohumda duruyor: SM-103 ₺890, BOT-104 ₺1.290, PR-105 ₺1.290.

Arama kartları koda yazıldı ve yerel kayda alındı. Canlı site bu kaydı henüz göstermiyor. GitHub giriş penceresi kapandığı için yedi yerel kayıt sunucuya gitmedi. Site eski paketi basıyor: üç eğitim yayında, üçü «Çok Yakında».

---

## 2. SEO

Denetim `lib/copy/seo.ts`, eğitim sayfası, `app/sitemap.ts` ve `app/robots.ts` üzerinden yapıldı.

| Kontrol | SM-103 | BOT-104 | PR-105 |
|---------|--------|---------|--------|
| Özgün başlık, açıklama, anahtar kelime | Eksikti, eklendi | Eksikti, eklendi | Eksikti, eklendi |
| Sosyal kart (başlık, açıklama, görsel) | Kapak karesi bağlı | Kapak karesi bağlı | Kapak karesi bağlı |
| Arama şeması (kurs + meslek programı) | Eksikti, eklendi | Eksikti, eklendi | Eksikti, eklendi |
| Site haritası ve robot izni | Kodda vardı | Kodda vardı | Kodda vardı |

Başlıklar:

- SM-103: «Yapay Zekâ ile Sosyal Medya Eğitimi: Görsel ve Kısa Video»
- BOT-104: «Kodsuz Chatbot Eğitimi: WhatsApp ve Web Müşteri Asistanı»
- PR-105: «Yapay Zekâ Prompt Eğitimi: Doğru Talimat Verme»

Açıklamalar 180 karakteri geçmiyor. Sosyal görsel, her eğitimin ilk dersinin ilk karesi. Ayrı bir paylaşım afişi üretilmedi; e-ticaret eğitimi de aynı kareyi kullanıyor.

Site haritası ve robot dosyası bu üç adresi zaten listeliyordu. Canlı site haritasında henüz yoklar, çünkü sunucudaki paket eski.

Kayıt: `80cdbc9` — `feat(seo): give SM-103, BOT-104 and PR-105 their own search cards.`

Kontrol: SEO test dosyası 29 test, hepsi geçti.

---

## 3. Yayın

Dosya: `supabase/migrations/20261003230400_sm103_bot104_pr105_publish.sql`

Bağlantı: `DIRECT_URL` havuz kapısındaydı (port 5432). Aynı projenin doğrudan kapısına çevrildi. Doğrudan adreste IPv4 kaydı yok, IPv6 kaydı var. İlk yoklama yalnız IPv4 aradığı için düştü. İkinci bağlantı doğrudan kapıya girdi. Sunucu portu 5432. Veritabanı adı `postgres`. Laboratuvar adı değil.

| Eğitim | Önce | Sonra | Tutar | Fiyat açık mı | Panelden değiştirilmiş mi |
|--------|------|-------|-------|----------------|---------------------------|
| SM-103 | Yayında değil | Yayında | ₺890 | Evet | Hayır |
| BOT-104 | Yayında değil | Yayında | ₺1.290 | Evet | Hayır |
| PR-105 | Yayında değil | Yayında | ₺1.290 | Evet | Hayır |

Panelden girilmiş bir tutar yoktu. Tohum ezilmedi. `.env.local` dosyasına dokunulmadı; çevirme yalnız bu bağlantı için yapıldı.

---

## 4. Canlı duman

Ölçüm: 4 Ekim 2026, veritabanı açıldıktan sonra, `https://yetkin.ai/academy`.

| Ne bakıldı | Ne göründü |
|------------|------------|
| Katalog üst yazısı | «3 eğitim yayında · 3 eğitim çok yakında» |
| SM-103 kartı | Çok Yakında / Hazırlanıyor. Fiyat etiketi ₺890. Satın al yok |
| BOT-104 kartı | Çok Yakında / Hazırlanıyor. Fiyat etiketi ₺1.290. Satın al yok |
| PR-105 kartı | Çok Yakında / Hazırlanıyor. Fiyat etiketi ₺1.290. Satın al yok |
| Eğitim sayfası | Adres kataloga geri dönüyor |
| Site haritası | Üç yeni adres yok. Ofis ve ileri ofis var |
| İlk ders / ikinci ders | Sayfa açılmadığı için izlenemedi |

Veritabanı satırı açık. Ekran eski kodu okuyor. Satış düğmesi, ilk ders ve kilitli ikinci ders, yedi kayıt sunucuya inip sitenin yeniden kurulmasından sonra görünür.

---

## 5. Git

Dal `main`. Uzak depo `origin`. Yerel dal, uzak dalın 7 kayıt önünde.

Gönderim denendi. GitHub kullanıcı adı sordu. Giriş penceresi kapandı. Kayıtlar bu makinede duruyor, uzak depoda değil. Bu rapor dosyası da aynı yerel dala eklendi; o da gönderilemedi.

Gönderilemeyen kayıtlar:

1. `7544c21` — kullanılmayan belge görselleri
2. `bc4c411` — üç eğitimin konuşma metni ve süre saati
3. `60d69d5` — sinema kareleri ve ders sesleri
4. `4e92cfe` — satış ve ücretsiz ilk ders kilidi
5. `cc2afc1` — altı eğitimli belge hizası
6. `54d5927` — aşama 2 tedavi raporu
7. `80cdbc9` — üç eğitimin arama kartı
8. Bu dosya — mühür raporu
