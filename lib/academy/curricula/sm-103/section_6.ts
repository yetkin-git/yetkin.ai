import type { Section } from "../types";
import { sm103Section } from "./spoken-body";

/**
 * SM-103 ders 6.
 * Konuşma metni bu dosyanın spokenScript alanındadır.
 * API isteği yok.
 */
const spokenScript = `
Merhaba, ben Selin.

Elinde artık bir künye, beş çekmeceli bir kalıp, bir stil cümlesi, beş karelik bir set ve açıklamasıyla bir video var. Hepsi tek tek iş. Ama sosyal medya tek bir gönderi değil, bir düzen. Pazartesi coşkuyla paylaşıp perşembe sessizleşen bir hesap, kimsenin aklında kalmıyor. Bugün elindeki parçaları bir haftaya yayacağız. Sonra da yayınlamadan önce kendine soracağın soruları konuşacağız, çünkü o sorular senin itibarını koruyor.

## Bir hafta, beş gönderi

Nehir'in haftası şöyle kuruldu. Bu bir tarif değil, bir örnek. Sen kendi işine göre değiştir.

Pazartesi, ürün. Kupa, yakın plan, sakin. Kapak karesi.

Salı, süreç. Kil, fırın, el. Atölyenin içinden bir an. Burada hayali bir sahne değil, gerçek bir fotoğraf iyi olur. Çünkü insanlar gerçek emeği görmek istiyor.

Çarşamba, kullanım. Kahve dökülen kupa, kısa video.

Perşembe, soru. Bir müşterinin sorduğu şeyi cevapla. «Mat sır bulaşıkta solar mı?» gibi. Cevabı sen biliyorsun, kutu sadece düzenlemene yardım eder.

Cuma, hafif bir şey. Atölyede bir köşe, bir kedi, bir fincan çay. Hesabın arkasında bir insan var, bunu hatırlatan bir kare.

Beş gönderi bir haftaya yetiyor. Daha fazla yayın baskısı yaratıyor, baskı da kaliteyi düşürüyor.

## Bir akşamda üretmek

Beş gönderiyi her gün üretmeye kalkma. Bir akşam otur ve hepsini birden hazırla. Önce stil cümlesini aç. Sonra beş sahneyi tek tek yaz. Her sahne için kalıbı doldur, üretim yap, kontrol et. Yayın saatini telefonda ayarla. Hafta boyunca tek yapacağın şey yorumlara bakmak.

Bunu başlangıçta zor sanıyorsun, ben de öyle sandım. İkinci haftada elin alışıyor, üçüncüde kendine ait bir akışın oluyor.

## Yayından önce beş soru

Bu bölüm bugünün asıl işi. Her gönderiyi yayınlamadan önce kendine şu beş soruyu sor.

Birinci soru: görseldeki ürün gerçekte böyle mi? Renk, ölçü, doku, kulp sayısı. Ürünün olmayan bir özelliğini gösteren görsel, yanıltıcı olur. Müşteri kargoyu açınca fark eder. Hem güven kaybolur hem iade gelir.

İkinci soru: içerikte bir insan var mı? Varsa izni var mı? Gerçek bir kişinin yüzünü, sesini ya da fotoğrafını izinsiz yapay zekâya vermiyorsun. Müşterinin gönderdiği fotoğraf da buna dahil. İzin istedin, aldın, o zaman kullanabilirsin.

Üçüncü soru: bir marka, logo ya da tanınmış bir kişi benzerliği var mı? Araç bazen bilinen bir markaya benzeyen bir şey üretiyor. Ürettiği şey sana ait değilse paylaşma.

Dördüncü soru: yapay zekâ ile üretildiğini söylemem gerekir mi? Birçok platform, gerçeğe çok benzeyen yapay zekâ içerikleri için etiket seçeneği sunuyor. Bu seçeneği kendi platformunun ayarlarında bul ve gerektiğinde kullan. Sakladığın şey ortaya çıkarsa kaybedeceğin şey görselin kendisi değil, güvendir.

Beşinci soru: yazıda doğrulamadığım bir bilgi var mı? Fiyat, stok, süre, kampanya. Birini kutu yazdıysa sil, kendin yaz.

Beşine de rahatça cevap veremiyorsan gönderi bekler.

## Yanlış ve doğru

Yanlış hafta: pazartesi bir kupa, salı farklı bir dükkân, çarşamba hayali bir sahnede çalışmayan bir kupa videosu, perşembe aceleyle bir kampanya cümlesi. Tek tek bakınca hepsi fena değil, ama bir bütün olarak tutarsız.

Doğru hafta: aynı stil cümlesi, aynı üç renk, her gönderide tek bir iş, hepsi yayından önce beş sorudan geçmiş.

## Haftanın sonunda ne bakacaksın

Hafta sonu üç şeye bak. Hangi gönderi en çok kaydedildi, hangisi en çok paylaşıldı, hangisine en çok soru geldi. Rakamın kendisinden çok sebebe odaklan. Kaydedilen gönderi insanlara bir şey vermiş demektir. Paylaşılan gönderi bir şey söylemiş demektir. Soru gelen gönderi merak uyandırmış demektir.

Sonra tek bir şey değiştir. Hepsini değil. Bir şeyi değiştirip bir hafta daha dene, çünkü iki şeyi aynı anda değiştirirsen hangisinin işe yaradığını bilemezsin.

## Kalıp

Hafta: beş gönderi, her birinin tek işi.
Üretim: bir akşam, tek stil cümlesi.
Ölçü: kaydetme, paylaşma, soru. Sonra tek değişiklik.

Bugünün işi: kendi haftanı yaz, beş gönderiyi sırala, ilkini beş sorudan geçir. Tutmazsa düzelt, tutarsa yayın saatini ayarla.

## Son söz

Başlarken belki araç senin yerine karar verecek sanıyordun. Şimdi araçla birlikte karar veren biri olarak buradasın. Künyen, kalıbın ve beş sorun var. Yapay zekâ üretir, sen seçersin, sen dürüst kalırsın. Bu üçü yerinde durduğu sürece hesabın senin sesinle konuşur.

Bu seriyi sonuna kadar benimle yürüdüğün için teşekkür ederim.

Zihnine sağlık. Paylaşımlarını görmeyi çok isterim, kendine iyi bak.
`;

export const section6: Section = sm103Section({
  sectionNumber: 6,
  lessonKey: "03_social_media_ai-6",
  title: "Haftalık Akış ve Dürüst Çizgi",
  pedagogicalObjective:
    "Öğrenci elindeki görsel, set ve videoyu beş gönderilik bir haftaya yayar, bir akşamda toplu üretir, her gönderiyi yayından önce beş soruyla denetler ve haftayı kaydetme, paylaşma ve soru sayısıyla okuyup tek şey değiştirir.",
  spokenScript,
});
