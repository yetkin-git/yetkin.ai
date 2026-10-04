import type { Section } from "../types";
import { bot104Section } from "./spoken-body";

/**
 * BOT-104 ders 5.
 * Konuşma metni bu dosyanın spokenScript alanındadır.
 * API isteği yok.
 */
const spokenScript = `
Merhaba, ben Mert.

Tolga'nın botu artık iki kapıdan müşteri alıyor, anlamadığı yerde iki denemeden sonra insana dönüyor ve fren balatası sorusunda uydurma fiyat vermiyor. Çalışan bir sistemin var. Ama çalışan bir sistem ile teslim edilmiş bir sistem aynı şey değil. Bugün işi sahibinin eline, tek bir klasörde, kimseye ihtiyaç duymadan yürüyecek şekilde nasıl bırakacağını konuşacağız.

## Teslim neden ayrı bir iş

İşi kuran kişi genelde en son kendi ekranını kapatır ve kurulumu bitmiş sayar. Üç hafta sonra işletme sahibi bir cevabı değiştirmek istiyor ve nereden değişeceğini bilmiyor. Seni arıyor, sen müsait değilsin, cevap eski kalıyor. Fiyat güncellenmemiş bir bot müşteriye yanlış bilgi vermeye devam ediyor.

Ben bunu kendi işlerimde yaşadım. O günden sonra bir kural koydum: bir bot, sahibi onu sensiz yönetemiyorsa teslim edilmiş sayılmaz. Bu kuralı beş parçalı bir listeye çevirdim. Bugün onu birlikte kuracağız.

## Birinci parça: tek sayfalık akış haritası

Kâğıtta çizdiğin karar ağacını temizle ve tek bir sayfaya sığdır. Kutular, oklar, her kutunun altında botun söylediği cümle. Sahibi bu sayfaya baktığında botun müşteriye ne dediğini görüyor.

Bu sayfa şunu sağlıyor: ekran açmadan botun mantığını anlatabiliyorsun. Sahibi bir şey değiştirmek istediğinde, önce kâğıtta hangi kutu olduğunu gösteriyor, sonra ekranda o bloğa gidiyor.

## İkinci parça: son hali yazılmış soru defteri

Soru defterini ilk günkü haliyle bırakma. Kurulum sırasında iki cevabı değiştirdiysen, defterde de değiştir. Bot ile defter aynı şeyi söylemeli. Sahibi bir cevabı güncellemek isterse, önce defteri düzeltecek, sonra botu.

## Üçüncü parça: devir kuralı ve anahtar kelime kartı

Dördüncü derste hazırladığın iki kez kuralını, anahtar kelime kartını ve devir notunun üç satırını tek bir kâğıda yaz. Bu kâğıt, botun insana ne zaman döneceğini söylüyor. Sahibi için şu soruyu da cevaplıyor: «Bot ne zaman bana yazıyor?» Cevabı kâğıtta görürse, telefonuna düşen bir bildirimi şaşkınlıkla karşılamıyor.

## Dördüncü parça: erişim

Bu parça en sık atlanan ve en çok sorun çıkaran parça. Botun bulunduğu platform hesabı, WhatsApp hattının bağlı olduğu Meta hesabı, web sitesindeki kod parçası, hepsi sahibinin adına olmalı. Sen onlara ortak yönetici olarak eklensin. Şifre paylaşmak yerine platformların kendi davet ve yetki ekranlarını kullan. Sohbet mesajıyla şifre isteme.

Neden önemli? Çünkü bir gün sen yoksan, sahibi kendi hesabına girebilmeli. Senin adına açılmış bir hesabı sahibine geri vermek, sanıldığından zor oluyor. Tolga'nın hesabında ilk günden onun adı yazıyordu, ben yalnızca ortak yöneticiydim.

## Beşinci parça: deneme kaydı ve kısa kullanım notu

Üçüncü ve dördüncü derste yaptığın denemeleri bir kâğıda yaz. Hangi mesajı yazdın, bot ne cevap verdi, doğru muydu. Bu kayıt, sahibine botun hangi denemelerden geçtiğini gösteriyor.

Yanına bir sayfalık kullanım notu ekle. İçinde yalnızca üç şey olsun: bir cevap nasıl değiştirilir, botu geçici olarak nasıl durdururum, bir sorun çıkarsa kime yazarım. Üç madde, her biri üç adım. Daha fazlası okunmuyor.

## Müşteriye karşı dürüstlük

Teslimin içinde açıkça söylenmesi gereken bir konu daha var: müşteri botla konuştuğunu bilmeli. İkinci derste karşılama mesajının kim konuştuğunu söylemesi gerektiğini konuşmuştuk. Burada bunun bir adım ötesi var.

Botun topladığı kişisel bilgiyi en aza indir. Adı al, gerekiyorsa konuyu al. Kimlik numarası, banka bilgisi, kart numarası gibi şeyleri sohbetten isteme. Müşteriye bilgisinin neden istendiğini kısa bir cümleyle söyle: «Randevu talebini iletmek için adını alıyorum.» Bu konuda bağlayıcı olan, kişisel verilerin korunması kanunu. Kanunun ayrıntısı için işletmenin kendi danışmanına ya da resmî kurumun yayımladığı rehberlere bak. Ben burada hukuki öneri vermiyorum, sadece şunu söylüyorum: bilgi toplamayı küçük tut, söylediğin kadarını topla.

## Bakım için tek cümle

Teslimin son adımı, sahibine bir bakım ritmi bırakmak. Ayda bir kez, on beş dakika. Konuşma kayıtlarına bak, botun anlamadığı soruları say, defterine ekle. Fiyat ya da çalışma saati değiştiyse botu güncelle. Bu on beş dakikayı takvime yazmasını öner. Yazılmayan bakım, yapılmayan bakımdır.

## Toparlayalım

Bugün çalışan botu teslim edilebilir hale getirdin. Akış haritası, güncel defter, devir kâğıdı, sahibine ait erişim, bir de deneme kaydıyla kısa kullanım notu. Bunlarla sahibi, sen olmadan da botu yönetebilir. Müşteriye karşı dürüstlük ve kişisel veriyi küçük tutma kuralı da listenin parçası oldu.

Bir sonraki derste teslimden sonraki ilk haftaya bakacağız. Botu canlıya alıp ne olduğunu sayacağız ve haftada tek bir değişiklikle iyileştireceğiz.

Zihnine sağlık. Bir sonraki derste görüşmek üzere, kendine iyi bak.
`;

export const section5: Section = bot104Section({
  sectionNumber: 5,
  lessonKey: "04_chatbot_nocode-5",
  title: "Teslim Listesi",
  pedagogicalObjective:
    "Öğrenci botu beş parçalı bir teslim klasörüne çevirir: tek sayfalık akış haritası, güncel soru defteri, devir kâğıdı, sahibine ait erişim, deneme kaydı ve kısa kullanım notu. Müşteriye karşı dürüstlük ve kişisel veriyi küçük tutma kuralını uygular.",
  spokenScript,
});
