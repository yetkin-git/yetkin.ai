/**
 * Ders 0 — Yapay Zekâyla Tanışma.
 * lesson-index ve 101 sınav yoluna girmez. Oynatıcıda «Başlamadan Önce» rozeti.
 */

import type { AcademyPrepStrip } from "@/lib/academy/prep-strip";

export const OFFICE_AI_PREP_STRIP_KEY = "01_office_ai-0" as const;

export const OFFICE_AI_PREP_STRIP = {
  key: OFFICE_AI_PREP_STRIP_KEY,
  slug: "01_office_ai",
  title: "Yapay Zekâyla Tanışma",
  badge: "Başlamadan Önce",
  estimatedMinutes: 8,
  contentMarkdown: `
Selamlar, ben Gözde. Bu şerit bir sınav dersi değildir. Sekiz mühürlü dersin önünde durur; barajı, mührü ve vize kartını etkilemez. Bu şeridin sonunda bir yapay zekâ hesabı açmayı, ücretsiz ile ücretli farkını görmeyi, sohbet ekranını tanımayı, ilk istemi yazmayı ve Türkçe mi İngilizce mi yazacağına karar vermeyi tek başına yapacaksın. Hazırsan masaya oturalım.

## HESAP

ChatGPT, Claude, Gemini, Grok, Kimi, Muse Spark vb. — hangisi masanda duruyorsa onu aç. Bunlar büyük dil modelleridir (sohbet yapay zekâları); ücretsiz hesapla bu kursun işini görürler. Şirket paneli (kurumsal model) varsa onu kullan; evdeki gizlilik kuralı oraya yazılır. Hesap açmak beş dakikadır: e-posta, onay, sohbet kutusu. Telefon numarası isteyen ekrana gelirsen numaranı girmek zorunda değilsin, o adımı atlayabilirsin; bu şerit için zorunlu bir adım değildir. Copilot lisansın yoksa üzülme. Sekiz dersin her biri «lisans yoksa» yolunu yazar.

## ÜCRETSİZ VE ÜCRETLİ

Ücretsiz model yavaşlar, kuyrukta bekletir, uzun dosyada nefesini keser. Ücretli model daha hızlı döner, daha uzun metni taşır. Sihirli değildir. Bu kursta öğrettiğimiz şey kapı sırasıdır: yerleşik panel, ataş, maskeli kısa özet. O sıra ücretsiz hesapta da durur. İlk hafta ücretli plana geçmek zorunda değilsin. Kota dolduysa yeni sohbet aç; işi böl. En pahalı yapay zekâyı da satın alsan, başlığı olmayan bozuk tabloyu düzeltemez. Önce tabloyu temizlersin.

## SOHBET EKRANI

Ekranın ortası konuşma alanıdır. Altta bir kutu durur: burası istem kutusudur. Ataş simgesi dosya yükler. Yeni sohbet, yeni iş demektir; eski işi karıştırmaz. Modelin cevabı akıcı durabilir; akıcı olmak doğru olmak değildir. Gönder tuşu sendedir. Bu şeritte henüz müşteri listesi yükleme. Ham Excel tablosu, ham sözleşme, açık IBAN bu kutuya girmez. O kural 2. derste kilitlenir.

## İLK İSTEM

İstem, modele verdiğin iş emridir. Sihirli cümle yoktur. Dört parça yeter: rol, görev, biçim, kısıt. Örnek: «Rol: ofis asistanı. Görev: bu üç satırlık tabloyu sütun adına göre özetle. Biçim: üç madde. Kısıt: uydurma sayı ekleme.» Görüyorsun: günlük dil. Kod yok. İngilizce jargon yok. İlk denemende kutu boş dönerse cümleyi uzatma; görevi küçült. Bir iş, bir istem. Üç işi tek kutuya yığmak, üç cevabı birbirine bulaştırır.

## TÜRKÇE Mİ İNGİLİZCE Mİ

Belgen Türkçeyse istemi Türkçe yaz. Belgen İngilizceyse istemi İngilizce yaz. Model her iki dili de okur; karışık dil, karışık cevap doğurur. Teknik bir terimi belgede nasıl duruyorsa öyle bırak: IBAN, KVKK, Excel. Cümlenin omurgası senin dilindir. «İngilizce yazarsam daha zeki olur» bir efsanedir. Net görev, net kısıt, doğru dil. Bu üçü ücretsiz modelde de yeter.

## CEBİNE KOY

Üç kural. 1. Hesabı aç, kutuyu tanı, ataşı gör; şirketinin paralı lisansı yoksa takılma, ücretsiz panelle devam et. 2. İstemi dört parçayla yaz: rol, görev, biçim, kısıt. 3. Belgenin dilinde yaz; ham kişisel veriyi bu kutuya koyma. Bu üçü oturunca 1. dersin A1 hücresi korkutmaz.

## SIRA SENDE

Şimdi kendi hesabını aç. Yeni bir sohbet başlat. İstem kutusuna şunu yaz: «Bana üç maddelik bir ofis sabah rutini öner. Kişisel veri isteme.» Cevabı oku. Beğenmediysen kısıtı ekle: «On dakikayı geçmesin.» Bu alıştırmanın notu yok, barajı yok. Yalnızca kutunun cevap verdiğini kendi gözünle gör. Hazırsan 1. derse geç: A1 Düzeni ve Temiz Veri.
`,
} as const satisfies AcademyPrepStrip;
