import type { Section } from "../types";
import { pr105Section } from "./spoken-body";

/**
 * PR-105 ders 2.
 * Konuşma metni bu dosyanın spokenScript alanındadır.
 * API isteği yok.
 */
const spokenScript = `
Merhaba, ben Oğuz.

Bir sabah düşün. Aynı gecikmiş kargo için iki mesaj yazman gerekiyor. Biri müşteriye gidecek, öteki depodaki vardiya ekibine. İkisini de sohbet kutusuna yaptırmak istiyorsun. İlk akla gelen şey, cevabı bir kez yazdırıp iki yere yapıştırmak. Ben bunu denedim. Müşteriye «ekip olarak bakıyoruz» yazıldı, ekibe de «sayın müşterimiz» diye başlayan bir not gitti. Birkaç dakika sonra ikisinin de gözümüze battığını gördüm. Bugün tam olarak bu karışıklığı konuşacağız.

## Saha

Mesele şu: iki ayrı okuyucu var ve her birinin duymak istediği ayrı. Müşteri kısa, nazik ve net bir cevap bekliyor. Ekip ise tek bakışta okuyabileceği bir not istiyor. Kutuya bunu söylemezsen ikisine de uyan, aslında hiçbirine uymayan bir metin yazar.

Elindeki dört parça yerinde duruyor: rol, görev, biçim, kısıt. Bugün araya bir parça daha giriyor: bağlam. Bağlam, kutunun bilmediği ama senin bildiğin gerçek satırlardır. Kargo kodunu sen yazarsın. Gecikmenin nedenini sen yazarsın. Yazmazsan kutu bilmez. Bilmediği yeri de süslü bir cümleyle doldurur. O cümle de masaya senin sözün gibi çıkar.

Bir kâğıt al, üç bölmeye ayır. En üste alıcının adını yaz: müşteri ya da vardiya ekibi. Ortaya üç gerçek satır yaz. En alta yazılmayacak sözleri koy. Üç bölme dolmadan kutuya geçme. Boş kalan bölmeyi kutu doldurur.

## Yanlış ve doğru

Yanlış istem: «Bunu profesyonel yaz.» Burada rol yok, bağlam yok, biçim yok. Gelen metin herkese uyar ama hiçbir masaya uymaz. Dürüst olayım, ben de uzun zaman «profesyonel» kelimesinin bir ölçü olduğunu sandım. Değilmiş. Uzun cümle profesyonel değil. Kısa ve doğru cümle profesyonel.

Doğru istem şöyle:

Rol: Sen bir mağaza yazışma asistanısın. Alıcı müşteridir.
Bağlam: Sipariş dün çıktı. Kargo firması bugün teslim edemedi. Yeni teslim günü elimizde yok.
Görev: Özür dile ve sonraki adımı yaz.
Biçim: Dört cümle. Hitap siz.
Kısıt: Yeni gün yazma. İndirim yazma. Bilmediğin nedeni uydurma.

Şimdi aynı kalıbın ikinci kopyasını aç. Sadece rol değişiyor. Rol: Sen bir ekip notu asistanısın. Alıcı vardiya ekibidir. Bağlam aynı üç satır: sipariş dün çıktı, kargo bugün teslim edemedi, yeni gün yok. Görev: Ekibin tek bakışta okuyacağı bir not yaz. Biçim: Üç madde, hitap yok. Kısıt aynı kalıyor. Bir de şunu ekle: müşteri cümlesini ekip notuna taşıma, ekip notunu da müşteriye taşıma.

İki çıktıyı yan yana koy. Müşteri metninde «siz» var, ekip metninde yok. Müşteri metni dört cümle, ekip metni üç madde. İkisi de aynı gerçeği anlatıyor ama kendi okuyucusuna göre. Biri ötekinin içine kaçmışsa kaçanı sil.

## Şablon

Rol: [kime yazan asistan].
Bağlam: [elindeki üç gerçek satır].
Görev: [tek iş].
Biçim: [cümle sayısı ya da madde sayısı].
Kısıt: [yazılmayacak söz].

Bağlamı doldururken üç satırdan fazlasını vermeye çalışma. Dördüncü bir satır aklına geliyorsa önce sen ele. Elemek, işe en çok yarayan üç gerçeği seçmek demek. Kutuya yığın verirsen kutu hoşuna giden satırı seçer. O seçim senin seçimin olmaz.

Kişi adı, telefon ve adresi bağlama koyma. Kargo kodu koyabilirsin, kod bir kişi değil. Ama kodu sen yazarsın. Kutunun uydurduğu kodu görürsen sil.

Göndermeden önce beş soruyu parmağınla say. Rol var mı? Alıcı belli mi? Bağlam üç satır mı? Biçim bir sayıyla yazılmış mı? Kısıt yazılı mı? Birine hayır diyorsan gönderme.

Gelen metni alıcıya göre oku. Müşteri metninde «ekip» kelimesi geçiyorsa o cümleyi sil. Ekip notunda «sayın müşterimiz» geçiyorsa o maddeyi sil. Yeni bir gün ya da indirim çıkmışsa onları da sil. Temizse müşteri metni müşteriye, ekip notu ekibe gider. Yerlerini değiştirme.

Öğleden sonra ikinci bir çift deneyelim. Alıcı yine müşteri. Bağlam şu üç satır: iade kutusu depoya bugün girdi, ürün eksiksiz, para iadesi henüz çıkmadı. Görev, bekleme süresini dürüstçe söylemek. Biçim yine dört cümle. Kısıt, gün adı ve tutar yazmamak. Kutu «yarın hesabınızda» yazarsa o cümleyi sil. Yarın diye bir şey bağlamda yok.

## Özet

Bugün role bir alıcı bağladın, bağlamı kendi üç satırınla doldurdun, biçimi sayıyla sabitledin. Müşteri metniyle ekip notunu yan yana koyup ayırmayı da öğrendin. Küçük bir şey gibi duruyor ama müşteriyi yanlış hitapla karşılamamanın yolu bu.

Bir sonraki derste kutudan cevaptan önce adım adım yol göstermesini isteyeceğiz. Kaynağı olmayan adımı da birlikte silmeyi öğreneceğiz.

Zihnine sağlık. Bir sonraki derste görüşürüz, kendine iyi bak.
`;

export const section2: Section = pr105Section({
  sectionNumber: 2,
  lessonKey: "05_prompt_practice-2",
  title: "Rol, Bağlam ve Biçim",
  pedagogicalObjective:
    "Öğrenci role bir alıcı bağlar, bağlamı kendi üç gerçek satırıyla doldurur ve biçimi cümle sayısıyla sabitler.",
  spokenScript,
});
