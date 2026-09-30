# HOTFIX-EC102 — Yayından kaldırma ve kusur haritası

| Alan | Değer |
|------|--------|
| Tarih | 30 Eylül 2026 |
| Kurs | `02_ecommerce_ai` (EC-102) |
| Karar | Kamu yayını kapalı. Beş katman yeniden doğrulanmadan açılmaz. |
| Veritabanı | `academy_courses.is_published = false`, `price_catalog_entries.is_active = false` |
| Satın alma | 2 kayıt duruyor. Satır silinmedi. Oynatıcı kamuya kapalı. |

---

## 1. Acil müdahale (uygulandı)

EC-102 vitrinde satın alınamaz ve oynatılamaz. Kart, kardeş kabuklarla aynı rozeti taşır: **Çok Yakında / Hazırlanıyor**.

| Kapı | Durum |
|------|--------|
| `academy_courses.is_published` | `false` (canlı satır doğrulandı) |
| `price_catalog_entries.is_active` (`course:02_ecommerce_ai`) | `false` (canlı satır doğrulandı) |
| `ACADEMY_EC102_PUBLIC_RELEASE_OPEN` | `false` — `lib/academy/pilot-sku.ts` |
| Satış | `academyCourseSaleOpen("02_ecommerce_ai")` false |
| Vitrin kartı | `academyCourseIsComingSoon` true. Canlı yayınlı satır gelse de kart satın al demez. |
| Adres | `/academy/02_ecommerce_ai` ve `/oyna` kanon emekli listesinde. 301 ile `/academy` kataloğuna döner. |
| Site haritası ve robots allow | EC-102 yolu çıktı. |
| Katalog cümlesi | E-Ticaret artık «yayında» diye yazılmıyor. Sayaç: 2 yayında, 4 çok yakında. |

Migration: `supabase/migrations/20260930133000_hotfix_ec102_unpublish.sql`. Prisma ile uygulandı.

Kapıyı açmak için hepsi birlikte geri alınır: veritabanı bayrakları, `ACADEMY_EC102_PUBLIC_RELEASE_OPEN`, `lib/academy/retired-storefront.ts` içindeki canlı slug listesi, robots allow ve katalog cümlesi. Bayrak tek başına yetmez.

---

## 2. Ses kimliği

Kadın Deniz sesi atanmış değildir. Mühür bu hotfix'te kadın yuvaya çevrilmedi. Diskteki kaset Puck'tır; mühür başka bir ses iddiasına çekilirse dosya ile sicil ayrılır.

| Katman | Değer |
|--------|--------|
| Konuşan ad | Deniz (`ACADEMY_EC102_DISPLAY_PERSONA`) |
| `courseMasterVoice` | `Puck` |
| Puck sicili | Ad Kaan, cinsiyet erkek, ton pratik |
| Görünen cinsiyet | Persona adı ezer, cinsiyeti ezmez. Hitap yolu «Deniz Bey» kalır. |
| Zephyr | Sicil adı da Deniz'dir ve o yuva da erkektir. Sosyal medya kursuna bağlıdır. |
| Kadın yuvalar | Callirrhoe Gözde, Kore Aylin, Aoede Selin, Leda Ece, Erinome Maya. Hiçbiri Deniz değildir. |

Fırın metni marka ve kısaltmayı heceletir: Trendyol «Trend yol», Hepsiburada «Hepsi burada», Amazon «Ama zon», SEO «Es i o». Tablo `lib/academy/spoken-scripts/phonetics.ts`. Ekrandaki ders metni düz yazımı taşır; duyulan kaset heceli biçimdir.

Sonraki fırın ancak kadın Deniz yuvası seçildikten ve altı ders yeniden mühürlendikten sonra kamu kapısına girebilir.

---

## 3. Görsel

`public/academy/cinema/02_ecommerce_ai-*` altında 31 JPEG var. Hepsi açılıyor. Ölçü 5504×3072. Sahne 16:9 olduğu için kenarlar `object-fit: cover` ile kırpılır.

Dosya adı ile cue indeksi uyumludur (`cue-01` → `…-cue-1.jpg`). Boş kare yok. Bozukluk dosyanın okunmamasından gelmiyor.

Görülen kusurlar:

1. **Yazı sızması.** Ders 1, cue 1 kartında okunabilir saçma İngilizce duruyor («Product-type hmedorn sinn», «description description»). Fırın istemi okunabilir harf istemiyordu (`scripts/bake-ec102-nano-slides.ts`).
2. **Kırık kolaj.** Ders 2, cue 2 sol tarafta yüzen bir dikdörtgen fotoğraf ve üstte kesik ikinci tabak taşıyor. Tek dönüşüm sahnesi değil.
3. **Saat çakışması.** Cue pencereleri iç içe ve sıra dışı. Oynatıcı ilk gelecek `start` değerinde durur ve son cue'nun `end` değerinden sonra sahneyi indirir. Örnek: ders 1'de son pencere 727. saniyede biter, konuşma 869. saniyeye kadar sürer. Ders 4'te cue-05, cue-04'ten önce başlar; 729. saniyeden sonra sahne boşalır, özet karesi hiç seçilmez. Aynı düzen ders 2, 3, 5 ve 6'da da var.
4. **Rozet cümlesi yarım.** Cue metni üç kelimede kesilmiş: «İNSANİ GİRİŞ VE», «GELECEK DERS VE». Kesim `scripts/ingest-ec102-spoken-bodies.ts` içindeki `punchcard` fonksiyonundan geliyor.
5. **Excel perdesi.** `listing` düzeni sahne temasını Excel'e düşürüyordu; kare yüklenmezse ofis masası görünüyordu. Bu hotfix `listing` düzenini `brand` temasına aldı. Ofis karesi EC-102 perdesi değildir.

Kareler yeniden fırınlanmadan ve cue saatleri konuşmanın sonuna kadar sıralanmadan görsel katman onaylanmaz.

---

## 4. Müfredat

Altı ders gövdesi duruyor. Konuşma `lib/academy/spoken-scripts/02_ecommerce_ai-*.md` ve cue JSON'dadır. Slayt iskeleti `lib/academy/curricula/ecommerce_ai/cinema-slides.ts`.

Denetimde kalan iş:

- Cue JSON saatleri, ses zamanlamasının sonuna kadar tek sıra olacak şekilde yeniden kurulacak.
- Yarım kalan rozet cümleleri bölüm başlığının tamamı olacak.
- Sinema kareleri okunabilir saçma yazı ve kırık kolaj olmadan yeniden üretilecek.
- Ses, kadın Deniz yuvasıyla yeniden fırınlanacak. Mevcut Puck kaseti kamu mührü sayılmayacak.
- Metin, ses, video, görsel ve müzik katmanları `assertAcademyProductionSeal` ile birlikte doğrulanacak.

Bu dört iş yapılmadan kapı açılmaz.

---

## 5. Yeniden yayın yasağı

EC-102 bu raporla yayına açılmadı. `ACADEMY_EC102_PUBLIC_RELEASE_OPEN` false kalır. Onay, beş katmanın diskte ve oynatıcıda aynı dersle eşleşmesinden sonra verilir.
