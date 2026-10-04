import type { Section } from "../types";
import { bot104Section } from "./spoken-body";

/**
 * BOT-104 ders 1.
 * Konuşma metni bu dosyanın spokenScript alanındadır.
 * API isteği yok.
 */
const spokenScript = `
Merhaba, ben Mert.

Neredeyiz? Kodsuz WhatsApp ve Web Chatbot Kurulumu eğitimindeyiz. Toplam altı ders var, bu da ilk dersimiz. Bu seride ne yapacağız? Müşteri hizmetleri ve satış için çalışan bir sohbet botunu baştan sona kuracağız. Önce müşterilerin gerçekte ne sorduğunu toplayacağız. Sonra Voiceflow ve Botpress üzerinde bunu bir karar ağacına çevireceğiz. Ardından WhatsApp hattına ve web sitene bağlayacağız, yanlış anlamaları yöneteceğiz, işi sahibine teslim edeceğimiz bir dosyaya dökeceğiz ve canlıda ilk denemeyi yapacağız. Tek satır kod yazmayacağız. Bugün elimize ne geçecek? Bir soru defteri geçecek. Son otuz mesajını okuyup beş gruba ayıracaksın, her gruba tek cümlelik bir cevap yazacaksın, bir de botun kendi başına asla cevaplamayacağı konuları işaretleyeceksin. Bu defter, serinin geri kalanında kuracağımız her şeyin hammaddesi olacak.

## Önce şu tablo

Tolga diye bir arkadaşım var, mahallede küçük bir bisiklet atölyesi işletiyor. Gün boyu elleri yağlı, telefonu çalışma masasının köşesinde şarjda duruyor. Akşam dokuzda bir müşteri yazıyor: «Pazar günü açık mısınız?» Tolga o saatte evde, yemekte. Mesajı sabah görüyor. Sabaha kadar müşteri başka bir atölyeye yazmış, orada cevap almış, randevusunu da orada almış.

Buna kaçan mesaj diyorum. Kimse kötü niyetli değil, kimse tembel değil. Sadece bir insan, bir telefon ve gün içinde bitmeyen bir iş var. Ben bunu analitik bakmayı sevdiğim için şöyle özetliyorum: mesaj gelir, cevap gecikir, müşteri bekleyemez. Bot bu zinciri ortadan bölüyor. Tolga uyurken bile ilk cevap yerinde duruyor.

## Bot neyi yapar, insan neyi yapar

Bir ayrım yapmadan hiçbir araca dokunma. Bu ayrım bütün seriyi taşıyacak.

Aynı soru sık sık geliyorsa ve cevap kimin sorduğuna göre değişmiyorsa, bu botun işidir. «Pazar açık mısınız?» böyle bir soru. «Lastik tamiri ne kadar sürer?» de böyle. Cevap bellidir, yazılır, bitmiştir.

Cevap duruma göre değişiyorsa, para kararı gerekiyorsa, müşteri kızgınsa ya da bir istisna varsa, bu insanın işidir. «Kaza yapan bisikletimin çerçevesi çatlamış, ne yapacağım?» sorusuna bot cevap vermez. Bu soruda doğru cevap Tolga'nın bisikleti görmesinden geçer.

Bunu iki kelimeyle tutabilirsin: tekrar eden bota, karar isteyen insana. Elinde iki yığın olacak, her mesaj bunlardan birine düşecek.

## Soru defteri nasıl yazılır

Şimdi bugünün işine geçelim. Aracı açmadan, bir kâğıtla ya da boş bir not dosyasıyla başlıyorsun.

Birinci adım, mesajları topla. WhatsApp'ı, sosyal medya mesajlarını, telefonda not aldığın soruları, hepsini tara. Son otuz mesaj yeter. Fazlası seni yorar, azı da tabloyu eksik gösterir.

İkinci adım, mesajları cevap için değil soru için oku. Çoğu insan buraya yanlış girer, hemen cevap yazmaya başlar. Sen yalnızca soruyu çıkar. Her soruyu ayrı bir satıra yaz.

Üçüncü adım, benzer soruları grupla ve beş grupta dur. Grubun adını da müşterinin kendi cümlesiyle koy, senin iç jargonunla değil. «Açık mısınız?» diye yaz, «çalışma saatleri talebi» diye yazma. Çünkü ileride botun menüsüne de aynı cümleyi koyacağız ve müşteri kendi sözünü görünce tereddüt etmeyecek.

Dördüncü adım, her gruba tek cümlelik bir cevap yaz. Tek cümle, tek bilgi. «Pazartesiden cumaya sabah dokuzdan akşam altıya, cumartesi öğlene kadar açığız.» Böyle. İkinci bilgiyi eklemek istersen yeni bir grup aç.

Beşinci adım, devir listesini yaz. Botun kendi başına yanıtlamayacağı konuları sırala. İade, şikâyet, özel fiyat, pazarlık, hasarlı ürün, garanti tartışması. Bu liste, botun nerede duracağını söyler. Dördüncü derste bu listeyi kullanarak botun sınırlarını çizeceğiz.

## Tolga'nın defteri

Tolga'nın beş grubu şöyle çıktı. Açık mısınız. Lastik tamiri ne kadar sürer. Randevu alabilir miyim. Siparişim geldi mi. Fiyat öğrenmek istiyorum. Beşinci grupta bir sorun fark ettik: fiyat soruları işin türüne göre değişiyordu. Burada bir karar verdik. Bot yalnızca fiyat listesindeki üç sabit işin fiyatını söyleyecek, geri kalan her fiyat sorusu devir listesine girecek.

Gördün mü, defter yazarken bile bir tasarım kararı verdin. Neyi botun sorumluluğuna bırakacağını seçtin. Kendi defterinde de aynı yerde bir karar çıkacak, onu not et.

## Cebine koyacağın kalıp

Grup adı: müşterinin kendi cümlesi.
Cevap: tek cümle, tek bilgi.
Devir: botun kendi başına yanıtlamayacağı konular.

Bugünün işi şu: son otuz mesajını topla, soruları çıkar, beş gruba ayır, her gruba tek cümlelik cevap yaz, devir listeni işaretle. Altıncı bir grup açmaya kalkma. Beş grup mesajların büyük bölümünü karşılar, kalan bölüm zaten insana gidecek.

## Toparlayalım

Bugün aracı açmadan önce, müşterinin ne sorduğuna baktın. Tekrar edeni karar isteyenden ayırdın. Elinde artık beş cevap ve bir devir listesi var. Küçük bir iş gibi duruyor ama kurulumdan sonra çıkacak sorunların çoğu, bu defteri baştan eksik yazmaktan çıkıyor.

Bir sonraki derste bu defteri alıp Voiceflow'da ilk karar ağacını çizeceğiz. Karşılamayı, üç düğmeyi ve randevu dalını kuracağız.

Zihnine sağlık. Bir sonraki derste görüşmek üzere, kendine iyi bak.
`;

export const section1: Section = bot104Section({
  sectionNumber: 1,
  lessonKey: "04_chatbot_nocode-1",
  title: "Kaçan Mesaj",
  pedagogicalObjective:
    "Öğrenci selamdan sonra eğitimin adını, serinin işini ve bugünün çıktısını duyar. Son otuz mesajdan beş gruplu bir soru defteri çıkarır, her gruba tek cümlelik cevap yazar ve botun kendi başına yanıtlamayacağı konuları devir listesine işaretler.",
  spokenScript,
});
