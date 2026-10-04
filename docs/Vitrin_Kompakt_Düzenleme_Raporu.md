# Vitrin kompakt düzenleme raporu

Tarih: 4 Ekim 2026

Akademi vitrinindeki kart boyu, sol menü adı ve yanıltıcı süre satırı düzeltildi. Oturum açmamış ziyaretçi Anasayfa veya Kariyer’e basınca giriş duvarına düşmüyor; eğitim kataloğunda kalıyor.

## 1. Kart yüksekliği

Vitrin kartı ve katalog satırı `min-h-[40rem]` (640 piksel) tabanıyla zorla uzuyordu. Bu taban kalktı.

Kart artık kapağı, özeti, ders satırı ve düğmeleri kadar yükseliyor. Aynı satırdaki kartlar hâlâ birbirine hizalanır; altta boş bir 640 piksel kuyu kalmaz.

Canlı katalogda ölçülen kart boyu yaklaşık 501–573 piksel. Metin satırı ile düğme arası yaklaşık 78 piksel; bu aralık fiyat ve KDV satırını da tutuyor.

## 2. Anasayfa adı

Sol menüdeki oda adı **Panel** yerine **Anasayfa** oldu. Aynı ad sayfa yolunda (ekmek kırıntısı), Anasayfa kaşında ve hata ekranında da duruyor.

Adres `/dashboard` olarak kaldı. Giriş yapmış kullanıcının kişisel özeti bu adreste açılır.

«Panele geç» ve bazı odalardaki «Panele dön» düğmeleri aynı kaldı. Onlar sol menü başlığı değil, geri dönüş cümlesi.

## 3. Anonim ziyaretçi

Oturum yokken şu adresler giriş sayfasına gitmez:

- `/dashboard` ve sol menüdeki Anasayfa
- `/career` ve sol menüdeki Kariyer
- `/kariyer`

Kenar bunları Akademi kataloğuna alır:

- Anasayfa → `/academy?konuk=anasayfa`
- Kariyer → `/academy?konuk=kariyer`

Katalogda kısa bir cümle görünür. Kişisel özet veya vize listesi açılmaz. İsteyen «Giriş yap» bağlantısından kendi odasına dönebilir. Cüzdan, profil, pasaport ve admin hâlâ giriş ister. Oturum açmış kullanıcı Anasayfa ve Kariyer’i eskisi gibi görür.

## 4. Süre satırı

Katalog kartındaki sabit «12 dk · Sesli Anlatım» kalktı. Kart artık ders adedini ve formatı yazar. Örnek: `8 Ders • Sesli Anlatım`, `6 Ders • Sesli Anlatım`.

Oynatıcıdaki ders satırı, o dersin kendi süresini göstermeye devam eder. Bu, kursun tamamı 12 dakika demek değildir.

## 5. Doğrulama

- `npx tsc --noEmit` temiz bitti.
- `npm test`: 246 dosya, 1203 test geçti.
- Tarayıcıda katalog açıldı. Sol menü Anasayfa diyor. Kartlarda dakika yok. Oturumsuz `/dashboard` ve `/career` kataloğa iniyor; giriş formu çıkmıyor.
