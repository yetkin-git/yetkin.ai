/**
 * Gerçek Dünya & Isınmalı Pedagoji — her derse sohbet ısınması + isteğe bağlı alıştırma.
 * Müfredat tohumuna `curriculum.ts` mühüründe örülür; cold-start teknik okuma yok.
 *
 * KÜLTÜREL ANALOJİ VE YEREL BENZETME (bkz. pedagogy-doctrine.ts):
 * Isınma ve kilit noktalarda soyut kavramlar Türk günlük yaşam örneğiyle oturtulur.
 * Kanon: çelişen brief → «yan yana iki bilet, ikisi de pencere kenarı» (yz-icerik-1).
 *
 * Dil kuralı: Isınma bildiri / yasak tebliğiyle açılmaz; empati hikâyesi veya saha
 * kafa karışıklığıyla başlar, kavram oradan doğar.
 */

import {
  ACADEMY_GROWTH_PEDAGOGY,
  ACADEMY_GROWTH_PEDAGOGY_ALIAS,
} from "@/archived/lib/academy-studio/growth-pedagogy";

export type AcademyRealWorldPedagogy = {
  /** Bu konu nedir / ne işe yarar / kim nerede kullanır — sohbet tadında. */
  warmup: string;
  /** Ders sonu isteğe bağlı alıştırma; `proofOfWork` değildir ve tamamlamayı kilitlemez. */
  challenge: string;
};

const YZ_BRANDS =
  "ChatGPT, Claude, Gemini, Midjourney veya OpenAI Playground" as const;

export const ACADEMY_REAL_WORLD_PEDAGOGY: Record<string, AcademyRealWorldPedagogy> = {
  "rail-temel-1": {
    warmup:
      "Markette etikette 250,00 ₺ görüp kasada 249,00 ₺ duymak insanın içini burkar; «hangi rakam gerçek?» diye bakakalırız. Eğitim kartında da aynı his yaşanır: ekranda bir tutar, profilde başka bir satır. Bu derste o kafa karışıklığını kesmek için kuruşu tek cüzdan satırına yazmayı konuşuyoruz — market fişindeki kuruş gibi, tek satır, tek gerçek.",
    challenge:
      "İsteğe bağlı: Kendi eğitim kartındaki fiyatı kuruş tamsayı + TRY olarak tek satıra yaz. İkinci bir «bonus bakiye» satırı uydurma.",
  },
  "rail-temel-2": {
    warmup:
      "Süpermarkette etiket değişirken kasadaki tutarın bir anlığına tutulduğunu fark etmişsindir; yoksa sıradaki herkes «az önce kaçtıydı» der. «Eğitimi Başlat»a basınca da aynı pencere açılır: fiyat kısa süre donar. Bu derste o 15 dakikalık kilidin neden güven verdiğini konuşuyoruz — etiket kayarken kasanın dürüst kalması gibi.",
    challenge:
      "İsteğe bağlı: Ekranda 15 dk kilit gördüğünü varsay; süre dolmuş 249,00 ₺ ile ödemeyi reddeden tek cümle yaz.",
  },
  "rail-temel-3": {
    warmup:
      "Konser bileti alınca hatıra fotoğrafı mı beklenir, yoksa önce salona mı girilir? Birçok kişi «ödedim» deyince PDF belgenin de düşeceğini sanıyor. Bu derste ödeme ile belgenin neden aynı kapı olmadığını konuşuyoruz: kart dersleri açar; ustalık belgesi sınav barajından sonra gelir — bileti alıp konserden önce hatıra istememek gibi.",
    challenge:
      "İsteğe bağlı: «Ödedim, belge nerede?» sorusuna üç kelimelik dürüst cevap yaz (ipucu: sınav / baraj).",
  },
  "ray-sinyal-1": {
    warmup:
      "Sepete ürün eklerken ekranın aynı anda hem «Yükleniyor...» hem «Hata!» demesi insanın içini burkar; hangisi gerçek, diye bakakalırız. İki ayrı bayrak (yükleniyor + hata) unutulunca UI iki gerçeklik basar. Bu derste React’te durumu tek SSOT state makinesine indiriyoruz — Shopping Cart’ta phase tek kaynak; trafikte yeşil ve kırmızı aynı anda yanmaz.",
    challenge:
      "İsteğe bağlı: isSubmitting + isError aynı anda true olsun diyen UI isteğini tek cümlede reddet; phase makinesini gerekçe göster.",
  },
  "ray-sinyal-2": {
    warmup:
      "Metro turnikesinde kartı okutmadan geçmeye çalışan yolcu «ben içerideyim» sanır; turnike açılmadan geçiş sayılmaz. Postman’de yeşil 200 görüp gövdesi şemasız kalan yanıt da aynı tuzağı kurar — dışarıdan her şey yolunda sanılır. Bu derste Express kapısında Zod/Joi şeması olmadan 200’ün neden emniyet sayılmadığını konuşuyoruz; Fail-safe (Hata Anında Emniyet): şüphede reddet.",
    challenge:
      "İsteğe bağlı: Postman veya cURL ile bozuk qty gövdesine 400 bekleyen tek satırlık test notu yaz.",
  },
  "ray-sinyal-3": {
    warmup:
      "Biri Türkçe, diğeri İngilizce konuşan iki insan anlaşmaya çalışırsa herkes «anladım» der ama masada iki farklı söz kalır. React «eklendi», Express 503 dediğinde de aynı sahne kurulur — vatandaş ortada kalır. Bu derste fetch ile sözleşmeli zinciri ve dürüst 4xx/5xx yansımasını konuşuyoruz; sahte yeşil tik düşer.",
    challenge:
      "İsteğe bağlı: Mock 503’te UI’nın basacağı tek dürüst cümleyi yaz; yeşil tik kullanma.",
  },
  "yz-icerik-1": {
    warmup: `Ajans masasında müşteri bir yandan «tek sade kare yeter» der, bir yandan «on iki rengin hepsi ayrı dursun» ister; Midjourney’e basmadan önce herkesin içi sıkılır. Bu konu işte o çelişen briefi durdurmaktır: jeton yanmadan «tek kare mi, on iki renk mi?» netleşir. Kim nerede kullanır? Sosyal medya veya ajans yöneticisi ${YZ_BRANDS} ekranında prompt yazarken — otobüs gişesinde «yan yana iki bilet, ikisi de pencere kenarı» istememek gibi.`,
    challenge: `İsteğe bağlı: ChatGPT veya Midjourney’e gitmeden, «tek kare yeter + 12 renk» briefini tek cümlelik çelişki notuna çevir ve müşteriye sorulacak soruyu yaz.`,
  },
  "yz-icerik-2": {
    warmup: `Kiralamada süre ve bölge yazılmadan anahtar teslim edilmez; «sonra bakarız» dipnotu kapıyı açmaz. Freelancer da OpenAI Playground’da denemeden önce ticari kullanım / coğrafya / süre satırını arar. Bu derste hak belirsizken üretimin neden durduğunu konuşuyoruz — anahtarsız kapı açmamak gibi.`,
    challenge: `İsteğe bağlı: «Ayakkabı karesi, ticari, süre yok» isteğini ChatGPT’ye yapıştırmadan önce hangi üç satırın eksik olduğunu listele.`,
  },
  "yz-icerik-3": {
    warmup: `Terziye «şık bir şey dik» demek beden, kumaş ve ceza ölçüsü vermemek gibidir; prova başlamaz. «Güzel yap» cümlesi Midjourney’de de paket açmaz. Bu derste hedef + istenmeyen + ızgara + palet satırlarını konuşuyoruz — ChatGPT’ye yapıştırılacak Türkçe cümlenin neden net olması gerektiğini oradan göreceksin.`,
    challenge: `İsteğe bağlı: OpenAI Playground veya ChatGPT için dört satırlık tarif yaz: hedef, istenmeyen, ızgara, palet. «Güzel olsun» yerine ölçülebilir satır kullan.`,
  },
  "yz-icerik-4": {
    warmup: `Terzi prova turunda «biraz daha şık» derse iğne işlemez; santim ve kumaş netleşmeden tur yanar. Müşterinin «daha pop / daha lüks» cümlesi Midjourney varyasyonunda da aynı tuzağı kurar. Bu derste ölçülemeyen isteği tur saymamayı konuşuyoruz — ChatGPT’den somut hata gelmeden iş emri açmamak gibi.`,
    challenge: `İsteğe bağlı: Müşterinin «daha pop» cümlesini Claude veya ChatGPT’ye vermeden önce ölçülemeyen isteği iki ölçülebilir satıra çevir.`,
  },
  "yz-icerik-5": {
    warmup: `Kargo takip numarası tek başına «elden teslim» demez; paketi kapıda görmeden iş bitmiş sayılmaz. Midjourney linki veya ChatGPT çıktısı da dosya adı + SHA-256 olmadan paket sayılmaz. Bu derste DELIVERY mesajında özet istemeyi konuşuyoruz — sohbet balonunu teslim sanmamak gibi.`,
    challenge: `İsteğe bağlı: kosu-ayakkabi-on.avif için sahte bir SHA-256 satırı ve tek cümlelik teslim özeti yaz; «dosyalar chat’te» deme.`,
  },
  "ileri-prompt-1": {
    warmup: `Mutfağa menü ve alerjen yazmadan sipariş açılmaz; «güzel bir yemek yap» cümlesi ocağı yakmaz. Prompt masasında da ChatGPT, Claude veya Gemini çağrılmadan hedef / istenmeyen / biçim / kabul yazılır. Bu derste yazılı iş tarifini konuşuyoruz — OpenAI Playground’da sistem + kullanıcı katmanını ayırırken aynı disiplini tutarsın.`,
    challenge: `İsteğe bağlı: «Tabloyu çıkar, gerekirse özetle» cümlesini ChatGPT’ye vermeden dört satırlık iş tarifine çevir (biçim: JSON veya Markdown seç).`,
  },
  "ileri-prompt-2": {
    warmup: `Uzun bir sözleşmeyi klasöre anahtar bırakır gibi ChatGPT’ye yapıştırmak insanın içini ürpertir; kaynaklı alıntı kalır, uydurma özet düşer. Bu derste bağlam penceresine sır ve kimliğin neden girmediğini konuşuyoruz — Claude veya Gemini’ye bölerken klasöre anahtar bırakmamak gibi.`,
    challenge: `İsteğe bağlı: 80 sayfalık metni OpenAI Playground’a sıkıştırmadan önce kesilen bölümleri listeleyen bir «kaynak notu» taslağı yaz.`,
  },
  "ileri-prompt-3": {
    warmup: `Kalkmayan asansörde «çıktık» demek yalandır; kapı kapalıysa dürüstçe beklenir. ChatGPT’ye «kur çek» demek yerine araç kapalıysa Gemini veya Claude’un durması aynı dürüstlüktür. Bu derste araç yoksa durmayı konuşuyoruz — uydurma yanıtın neden emniyet sayılmadığını oradan göreceksin.`,
    challenge: `İsteğe bağlı: Araç kapalıyken güncel kur isteyen bir ChatGPT promptunu Fail-closed (Hata Anında Kapalı) tek cümlelik yanıta çevir.`,
  },
  "ileri-prompt-4": {
    warmup: `Prova listesi olmadan sahneye çıkmak alkış değil risk doğurur; «daha iyi» ölçüsüz kalır. Prompt’u üretime almadan önce Playground’da kenar durum koşturmak aynı listedir. Bu derste örnek + kenar durum + regresyonu konuşuyoruz — Claude’da «daha iyi»nin neden teste bağlandığını oradan göreceksin.`,
    challenge: `İsteğe bağlı: Tek bir kenar durum cümlesi yaz ve ChatGPT’den beklediğin kabul / ret ölçütünü iki satırda belirt.`,
  },
  "ileri-prompt-5": {
    warmup: `Noter senedi imzasız yürürlüğe girmez; sessizce Gemini sistem promptunu değiştirmek de aynı boşluğu açar. Canlıya alan ekip ChatGPT tarifini mühürler, fark kaydı yazar. Bu derste üretim kapısını konuşuyoruz — onaylı tarif olmadan canlıya çıkmamak gibi.`,
    challenge: `İsteğe bağlı: Onaysız tarif farkını Midjourney/ChatGPT’ye basmadan önce yazılacak tek satırlık «fark kaydı» örneği üret.`,
  },
  "bim-iso-1": {
    warmup:
      "Restoranda «ucuza bak» demek menü fiyatı yazılmadan sipariş almak gibidir; garson da, mutfak da ortada kalır. BIM/ISO masasında da «ucuza hallederim» cümlesi teklif sanılır. Bu derste kapsam + süre + fiyat satırını konuşuyoruz — menü fiyatı yazılmadan iş açmamak gibi.",
    challenge:
      "İsteğe bağlı: «Ucuza bak» mailini kapsam / süre / fiyat isteyen üç satırlık cevap taslağına çevir.",
  },
  "bim-iso-2": {
    warmup:
      "Kargo fişi olmadan «yolda» demek, WhatsApp’a PDF atıp «teslim ettim» demeye benzer; alıcı paketi nerede arayacağını bilmez. Bu derste DELIVERY + SHA-256’nın neden istendiğini konuşuyoruz — sohbet ekini teslim sanmamak gibi.",
    challenge:
      "İsteğe bağlı: WhatsApp’a atılmış bir PDF’yi teslim saymama gerekçesini tek cümlede yaz.",
  },
  "bim-iso-3": {
    warmup:
      "Noter defteri yerine sohbet notu tutmak, iş bitince «tamamdır» yazıp sicili unutmak gibidir; sonra kim neyi kabul etti bilinmez. Bu derste pazaryeri tek kapı ve durum satırını konuşuyoruz — chat’i teslim sicili saymamak gibi.",
    challenge:
      "İsteğe bağlı: Chat’teki «tamamdır» yazısını sicile çevirmeden hangi durum satırının eksik olduğunu söyle.",
  },
  "bim-iso-4": {
    warmup:
      "Tadilat sırasında «küçük bir ek kat» istemek yeni iş doğurur; sessizce şişen kapsam da aynı tuzağı kurar. Bu derste fark kaydı + sınav kapısını konuşuyoruz — briefe girmeyen ek isteği yeni iş saymak gibi.",
    challenge:
      "İsteğe bağlı: Briefe girmeyen bir «küçük ek» isteğini yeni iş olarak işaretleyen tek cümle yaz.",
  },
  "siber-kvkk-1": {
    warmup:
      "Kapıya «güvenli» yazmak kilit yerine geçmez; «güven bana» tabelasıyla da kimse içeri alınmaz. Uyum brifinginde ESG’siz «güvenliyiz» iddiası aynı boşluğu açar. Bu derste siber + uyumun aynı masada durmasını konuşuyoruz — kanıt satırı olmadan iddia basmamak gibi.",
    challenge:
      "İsteğe bağlı: ESG’siz güvenlik iddiasını kesen tek soruyu yaz.",
  },
  "siber-kvkk-2": {
    warmup:
      "Rızasız kapıya girmek, form veya CRM’e sebepsiz e-posta yazmaya benzer; kişi «ben bunu istemedim» der. Bu derste hukuki sebep yoksa kişisel verinin neden durduğunu konuşuyoruz — KVKK yaşam döngüsünün dürüst kalması için.",
    challenge:
      "İsteğe bağlı: Sebepsiz saklanan bir e-posta alanı için durma gerekçesini bir satırda yaz.",
  },
  "siber-kvkk-3": {
    warmup:
      "Trafik levhası tek başına hız kesmez; raftaki politika PDF’i de tek başına kontrol sayılmaz. Denetçi masaya oturunca «politikamız var» cümlesi yetmez. Bu derste ISO 27001’de kanıtın neden metinden ayrı durduğunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: «Politikamız var» cümlesini kontrol saymama gerekçesini tek cümlede yaz.",
  },
  "siber-kvkk-4": {
    warmup:
      "Kaza tutanağını yırtmak olayı bitirmez; log silmek de aynı illüzyonu kurar. Olay anında kayıt tutan ekip ESG rapor satırını taşır. Bu derste ihlalin neden sessiz kapanmadığını konuşuyoruz — tutanak yırtmamak gibi.",
    challenge:
      "İsteğe bağlı: Log silerek «bitti» diyen bir yanıtı reddeden tek cümle yaz.",
  },
  "python-bi-1": {
    warmup:
      "Tartısız malzemeyle yemek yazmak, tipi belirsiz kolonda ortalama basmaya benzer; fiş yanlış çıkar. Pandas / Excel masasında da UNSET sütun aynı tuzağı kurar. Bu derste tip + birim + boşluk disiplinini konuşuyoruz — tartıda kg ile g karıştırmamak gibi.",
    challenge:
      "İsteğe bağlı: Tipi UNSET olan bir kolonda ortalama isteyen talebi tek cümlede reddet.",
  },
  "python-bi-2": {
    warmup:
      "Yanlış anahtarla dolap karıştırmak, iki tabloyu paydasız birleştirmeye benzer; satırlar sessiz şişer. Bu derste seç-grupla-birleştir disiplini konuşuyoruz — yüzde satırının neden payda istediğini oradan göreceksin.",
    challenge:
      "İsteğe bağlı: Paydası belirsiz bir yüzde satırını yayımlamama gerekçesini yaz.",
  },
  "python-bi-3": {
    warmup:
      "Tarifsiz pasta dilimi sunmak, «başarı skoru» diye tanımsız sayı basmaya benzer; herkes başka dilim sanır. Bu derste metrik tanımı ad + formül + dönem + filtreyi konuşuyoruz — iş zekâsı panelinde KPI yazarken aynı tarifi tutarsın.",
    challenge:
      "İsteğe bağlı: Tanımsız bir «başarı skoru»nu düşüren dört satırlık metrik şablonu taslağı yaz.",
  },
  "python-bi-4": {
    warmup:
      "Vitrin mankenini tanık göstermek, 3D pastayı kanıt sanmaya benzer; süs iddia taşımaz. Sunuma grafik koyan analist de aynı tuzağa düşer. Bu derste görselleştirmenin neden kanıt grafik olduğunu konuşuyoruz — mankeni tanık saymamak gibi.",
    challenge:
      "İsteğe bağlı: 3D pastayı kanıt saymama gerekçesini tek cümlede yaz.",
  },
  "python-bi-5": {
    warmup:
      "Fotoğrafla muhasebe tutmak, ekran görüntüsünü rapor sanmaya benzer; ay değişince yeniden üretilemez. Bu derste betik + özet + belge kapısını konuşuyoruz — PNG’yi kanıt saymamak gibi.",
    challenge:
      "İsteğe bağlı: Screenshot’ı kanıt saymayan tek cümlelik teslim cümlesi yaz.",
  },
  "python-temel-1": {
    warmup:
      "Bakkal defterinin ilk satırı boşken kalem elde durursun; bu duraksama kapının eşiğidir. Bu derste print ile ekrana seslenmeyi konuşuyoruz — ilk geri bildirimin çıktı satırıdır, sihir değil.",
    challenge: "İsteğe bağlı: Kendi adınla bir print satırı yazıp çalıştır.",
  },
  "python-temel-2": {
    warmup:
      "Çarşıda etiketsiz kavanoza el uzatıp geri çekilmek gibi: cinsini bilmeden karıştırmazsın. Bu derste değişken adı ve tipi konuşuyoruz — kutunun üstü dürüst durur.",
    challenge: "İsteğe bağlı: Bir tutarı kuruş tamsayı olarak adlandırıp type() ile doğrula.",
  },
  "python-temel-3": {
    warmup:
      "Otobüste zil çaldıysa durur, çalmadıysa geçer; şoför her durakta aynı hareketi yapmaz. Bu derste if ve else ile kararı konuşuyoruz — ışık yazılıysa kavga bitmez.",
    challenge: "İsteğe bağlı: 70 barajına göre «geçti/tekrar» yazan üç satırlık kod taslağı yaz.",
  },
  "python-temel-4": {
    warmup:
      "Çay ocağında aynı bardağı yüz kez elde yıkamak övünç değildir. Bu derste for ve while ile tekrarı tek yerde tutmayı konuşuyoruz — tarif bir, iş yüz.",
    challenge: "İsteğe bağlı: 1’den 5’e toplamı for ile hesaplayan kod yaz.",
  },
  "python-temel-5": {
    warmup:
      "Esnafın standart poşeti vardır: kilo gelir, poşet çıkar, tarife her seferinde bakılmaz. Bu derste def ve return’ü konuşuyoruz — ismi olan iş yeniden yazılmaz.",
    challenge: "İsteğe bağlı: Lirayı kuruşa çeviren kısa bir fonksiyon yaz.",
  },
  "python-temel-6": {
    warmup:
      "Gişede «kaç bilet?» diye sorup biri «üç» deyince kızmazsın; sayı istersin. Bu derste etkileşimli mini projeyi konuşuyoruz — çökmek nezaket değildir.",
    challenge: "İsteğe bağlı: try/except ile tamsayı isteyen kısa bir döngü yaz.",
  },
  "python-orta-1": {
    warmup:
      "Pazarda tartısız tezgâha «üç kilo» deyip para uzatmazsın. Bu derste Pandas tablo sözleşmesini konuşuyoruz — cins yazılı değilse ortalama yalandır.",
    challenge: "İsteğe bağlı: amount_kurus için int64 kuralını tek cümlede yaz.",
  },
  "python-orta-2": {
    warmup:
      "Dolabın tamamını mutfağa dökmek açlığın değil telaşın cümlesidir. Bu derste seç-süz-türet’i konuşuyoruz — ihtiyacın olan rafı al, gerisini kapalı tut.",
    challenge: "İsteğe bağlı: status==done süzgecini tek satırda yaz.",
  },
  "python-orta-3": {
    warmup:
      "Komşunun anahtarı senin kilidi açmaz; zorlarsan kapı şişer. Bu derste grupla-birleştir’i konuşuyoruz — payda yazılı, bir-e-bir doğrulanır.",
    challenge: "İsteğe bağlı: Belirsiz paydayla yüzde yayımlamama gerekçesini yaz.",
  },
  "python-orta-4": {
    warmup:
      "Kapıdaki görevliye kimliğini bağırarak söylemek yerine fiş uzatırsın. Bu derste parametreli Yapılandırılmış Sorgu Dili köprüsünü konuşuyoruz — değer ayrı, cümle ayrı.",
    challenge: "İsteğe bağlı: f-string sorguyu reddeden tek cümle yaz.",
  },
  "python-orta-5": {
    warmup:
      "Orijinal faturayı silip fotokopi bırakmak geri dönüşü zorlaştırır. Bu derste pathlib disiplinini konuşuyoruz — kaynak ayrı, çıktı ayrı, teslim atomik.",
    challenge: "İsteğe bağlı: Atomik yazım (geçici→rename) adımlarını iki maddeyle yaz.",
  },
  "python-orta-6": {
    warmup:
      "Kirli tabloyla güzel grafik, yanlış kararın süslü hâlidir. Bu derste temizliği konuşuyoruz — sıfır yokluğu iddia eder, boşluk cehaleti itiraf eder.",
    challenge: "İsteğe bağlı: Boş tutarı 0 yapmama gerekçesini yaz.",
  },
  "python-orta-7": {
    warmup:
      "Mahalle kahvesini referandum sanmak gibi: n=8 iken yüzde yetmiş asılmaz. Bu derste metrik tanımı ve kanıt grafiği konuşuyoruz — süs değil ölçü.",
    challenge: "İsteğe bağlı: Bir anahtar performans göstergesi için ad+formül+payda satırı taslağı yaz.",
  },
  "python-orta-8": {
    warmup:
      "Yarın aynı yemeği yapmak için tarif defteri gerekir; ekran görüntüsü yetmez. Bu derste uçtan uca betiği konuşuyoruz — yeniden koşmayan rapor ölür.",
    challenge: "İsteğe bağlı: oku→temizle→metrik→yaz sırasını dört maddeyle yaz.",
  },
  "python-ileri-1": {
    warmup:
      "Gişede «bilet» deyince fiş formatı sabittir; her sefere ayrı kâğıt uydurulmaz. Bu derste FastAPI ilk sağlık ucunu konuşuyoruz — sözleşmeli ceyson, rastgele dize değil.",
    challenge: "İsteğe bağlı: ok=true ceyson dönen Get taslağını yaz.",
  },
  "python-ileri-2": {
    warmup:
      "Kapıdaki görevli eksik kimliği kibarca reddeder; yok sayıp içeri almaz. Bu derste Pydantic şema doğrulamayı konuşuyoruz — yanlış tip dört yüz yirmi iki ile kesilir.",
    challenge: "İsteğe bağlı: amount_kurus: int alanlı kısa BaseModel yaz.",
  },
  "python-ileri-3": {
    warmup:
      "Her siparişte mutfağı salona taşımak düzeni bozar. Bu derste Depends ve katmanları konuşuyoruz — garson çevirir, mutfak pişirir.",
    challenge: "İsteğe bağlı: İş kuralını rotaya gömmeme gerekçesini yaz.",
  },
  "python-ileri-4": {
    warmup:
      "Üç kuryeyi sırayla beklemek üç kez kapıda dikilmektir. Bu derste gather ile eşzamansız bekleyişi konuşuyoruz — sihirli hız değil, kuyruk aklı.",
    challenge: "İsteğe bağlı: time.sleep’i eşzamansız rotada kullanmama gerekçesini yaz.",
  },
  "python-ileri-5": {
    warmup:
      "Kapı şifresini kapıya yapıştırmak her geçene okutmaktır. Bu derste jeton ve sır yönetimini konuşuyoruz — sır koda gömülmez, log’a düşmez.",
    challenge: "İsteğe bağlı: 401 dönen kısa bir jeton kontrolü taslağı yaz.",
  },
  "python-ileri-6": {
    warmup:
      "Kasada «sistem hatası, fiş yok» demek dürüstlüktür; yeşil tikle yalan söylemek değildir. Bu derste dürüst durum kodlarını konuşuyoruz — iki yüz zafer değildir.",
    challenge: "İsteğe bağlı: Bulunamayan kayıt için 404 fırlatan iki satır yaz.",
  },
  "python-ileri-7": {
    warmup:
      "Yangın tatbikatı yapmadan «çıkış var» demek kapıyı kilitlemektir. Bu derste TestClient ile sözleşmeyi sabitlemeyi konuşuyoruz — mutlu yol bekçiyi uyutur.",
    challenge: "İsteğe bağlı: 422 senaryosunu neden yazacağını tek cümlede anlat.",
  },
  "python-ileri-8": {
    warmup:
      "Tarifi donduran kutu «benim makinem» cümlesini kapatır. Bu derste Docker paketlemeyi konuşuyoruz — sır koliye girmez, latest tarifi öldürür.",
    challenge: "İsteğe bağlı: .env’i imaja kopyalamama gerekçesini yaz.",
  },
  "python-ileri-9": {
    warmup:
      "Kargo takip numarası olmadan «yolda» demek körlüktür. Bu derste yapısal log ve istek kimliğini konuşuyoruz — kişisel veri log’a girmez.",
    challenge: "İsteğe bağlı: Log’a kişisel gizli veri yazmama kuralını tek cümlede yaz.",
  },
  "python-ileri-10": {
    warmup:
      "Parçaları aynı kutuda teslim etmek gibi: şema, kilit, test ve konteyner birlikte ustalıktır. Bu derste kapanış paketini konuşuyoruz — ekran görüntüsü teslim değildir.",
    challenge: "İsteğe bağlı: Dört maddelik teslim kontrol listesi yaz (şema/kilit/test/Docker).",
  },
  "ai-temel-1": {
    warmup:
      "Kütüphane masasına sığmayan kitap yığını gibi: modele de sınırsız metin sığmaz. Bu derste token ve bağlam penceresini konuşuyoruz.",
    challenge: "İsteğe bağlı: Bağlam aşımında sessiz özet uydurmama kuralını tek cümlede yaz.",
  },
  "ai-temel-2": {
    warmup:
      "Orkestra partisyonu, solist notası ve dinleyici beklentisi ayrı kâğıtlardadır. Üretim tarifinde de sistem, kullanıcı ve biçim ayrılır. Bu derste katmanları konuşuyoruz.",
    challenge: "İsteğe bağlı: Üç katmanlı kısa bir tarif iskeleti yaz.",
  },
  "ai-temel-3": {
    warmup:
      "Noter formunda boş kutu bırakılmaz; makine de şemasız ceyson’u kabul etmez. Bu derste yapılandırılmış çıktıyı konuşuyoruz.",
    challenge: "İsteğe bağlı: Zorunlu iki alanlı mini ceyson şeması yaz.",
  },
  "ai-temel-4": {
    warmup:
      "Trafik polisinin el işareti örneği gibi: few-shot davranışı sabitler. Bu derste örnek ve kabul satırını konuşuyoruz.",
    challenge: "İsteğe bağlı: Bir few-shot örneği ve bir red cümlesi yaz.",
  },
  "ai-temel-5": {
    warmup:
      "Hastane kimlik fotokopisini herkese dağıtmamak gibi: sır ve kişisel tanımlayıcı bilgi tarife girmez. Bu derste hata anında kapalı üretimi konuşuyoruz.",
    challenge: "İsteğe bağlı: Tarife anahtar yapıştırmama gerekçesini yaz.",
  },
  "ai-temel-6": {
    warmup:
      "Mutfakta tartıp pişirmek gibi: betik girdi alır, şemayı doğrular, sonucu yazar. Bu derste etkileşimli üretim tarifi laboratuvarını konuşuyoruz.",
    challenge: "İsteğe bağlı: Geçersiz ceyson’da yeniden soran üç adımlık akış yaz.",
  },
  "ai-orta-1": {
    warmup:
      "Arşivde önce dosyayı bulup sonra özet yazmak gibi: Artırılmış Geri Çapraz Sorgulama aramayı üretimden ayırır. Bu derste kaynaklı getiri disiplinini konuşuyoruz.",
    challenge: "İsteğe bağlı: Getirici boşken neden cevap basılmayacağını yaz.",
  },
  "ai-orta-2": {
    warmup:
      "Gazete makalesini ortadan kesmek anlamı bozar; parçalama örtüşme ister. Bu derste parçalamayı konuşuyoruz.",
    challenge: "İsteğe bağlı: 512 token ve 64 örtüşme tercihini tek cümlede gerekçelendir.",
  },
  "ai-orta-3": {
    warmup:
      "Haritada kuş uçuşu mesafe gibi: gömme vektörleri yakın anlamı sayıya çevirir. Bu derste vektör uzayını konuşuyoruz.",
    challenge: "İsteğe bağlı: Kosinüs benzerliğin neyi ölçtüğünü bir cümlede yaz.",
  },
  "ai-orta-4": {
    warmup:
      "Kütüphane kart indeksine kitap eklemek gibi: ChromaDB kimlik ve metadata ister. Bu derste koleksiyonu konuşuyoruz.",
    challenge: "İsteğe bağlı: Aynı gömme modeli kuralını neden mühürlediğini yaz.",
  },
  "ai-orta-5": {
    warmup:
      "Tez dipnotu gibi: getirici skor ve kaynak satırı olmadan iddia basılmaz. Bu derste ilk k sonuç ve eşiği konuşuyoruz.",
    challenge: "İsteğe bağlı: Eşik altı skor için hata anında kapalı cümlesi yaz.",
  },
  "ai-orta-6": {
    warmup:
      "Mutfak hattı sırası gibi: yükle, böl, göm, getir, üret. Bu derste Artırılmış Geri Çapraz Sorgulama hattını konuşuyoruz.",
    challenge: "İsteğe bağlı: Beş adımlık hat listesini sırayla yaz.",
  },
  "ai-orta-7": {
    warmup:
      "Kaynaksız manşet güvenmez; kaynaklı cevap da alıntısız basılmaz. Bu derste halüsinasyon kontrolünü konuşuyoruz.",
    challenge: "İsteğe bağlı: «Belgede yok» dürüst cevabını ne zaman verdiğini yaz.",
  },
  "ai-orta-8": {
    warmup:
      "Arşiv memurunun evrak numarasıyla cevap vermesi gibi: taşınabilir belge asistanı kaynaklı konuşur. Bu derste kapanış projesini konuşuyoruz.",
    challenge: "İsteğe bağlı: Taşınabilir belge asistanı kabul ölçütlerinden üçünü listele.",
  },
  "ai-ileri-1": {
    warmup:
      "Bankamatik kaydı olmadan «para verdim» denmez; araç çağrısı şemasız çalışmaz. Bu derste araç şemasını konuşuyoruz.",
    challenge: "İsteğe bağlı: Tek argümanlı bir araç ceyson şeması yaz.",
  },
  "ai-ileri-2": {
    warmup:
      "Tamircinin musluğu açıp kontrol etmesi gibi: ajan düşün, araç, gözlem döngüsüdür. Bu derste ajan döngüsünü konuşuyoruz.",
    challenge: "İsteğe bağlı: max_iterations neden gerektiğini tek cümlede yaz.",
  },
  "ai-ileri-3": {
    warmup:
      "Günlük plan defteri ile arşiv dolabı ayrıdır; durum kısa, bellek uzun tutulur. Bu derste belleği konuşuyoruz.",
    challenge: "İsteğe bağlı: Kişisel tanımlayıcı bilginin uzun belleğe girmeme kuralını yaz.",
  },
  "ai-ileri-4": {
    warmup:
      "Metro aktarma haritası gibi: LangGraph düğüm ve kenarları çizer. Bu derste durum makinesini konuşuyoruz.",
    challenge: "İsteğe bağlı: Hata düğümü olmayan çizge riskini yaz.",
  },
  "ai-ileri-5": {
    warmup:
      "Gazete odasında muhabir, editör, korrektör ayrıdır; CrewAI rolleri ayırır. Bu derste rol ve görev ayrımını konuşuyoruz.",
    challenge: "İsteğe bağlı: Writer–Reviewer el sıkışmasında neyin zorunlu olduğunu yaz.",
  },
  "ai-ileri-6": {
    warmup:
      "Liman konteyner numarası standardı gibi: ajanlar aynı sözleşme diliyle konuşur. Bu derste çoklu ajan mesajını konuşuyoruz.",
    challenge: "İsteğe bağlı: Eksik ceyson ile yürütücünün neden başlamayacağını yaz.",
  },
  "ai-ileri-7": {
    warmup:
      "Ameliyat onam formu gibi: riskli araç insan imzası ister. Bu derste onay kapısını konuşuyoruz.",
    challenge: "İsteğe bağlı: delete_database için zorunlu insan onayı cümlesi yaz.",
  },
  "ai-ileri-8": {
    warmup:
      "Kalkış öncesi kontrol listesi gibi: değerlendirmesi kırılmış ajan üretime basılmaz. Bu derste değerlendirmeyi konuşuyoruz.",
    challenge: "İsteğe bağlı: Altın küme kırılınca ne yapılacağını yaz.",
  },
  "ai-ileri-9": {
    warmup:
      "Taksi fişinde kilometre ve süre yazması gibi: iz maliyet ve gecikme taşır. Bu derste gözlemi konuşuyoruz.",
    challenge: "İsteğe bağlı: İze kişisel kayıt yazmama kuralını yaz.",
  },
  "ai-ileri-10": {
    warmup:
      "Senfoni partisyonu gibi: çoklu ajan paket şema, değerlendirme ve iz ile teslim edilir. Bu derste ustalık kapanışını konuşuyoruz.",
    challenge: "İsteğe bağlı: Teslim paketinde olması gereken dört maddeyi yaz.",
  },
  "fullstack-temel-1": {
    warmup:
      "Restoranda garson siparişi alır, mutfak pişirir; fiş dönmeden «yemek geldi» denmez. Tarayıcıdaki düğme de odur: istemci ister, sunucu yanıt basar. Bu derste istemci-sunucu ve Hipermetin Aktarım Protokolü istek-yanıt sözleşmesini konuşuyoruz — kasa fişi gibi durum kodu ve gövde birlikte okunur.",
    challenge:
      "İsteğe bağlı: Bir Get isteğinin durum kodunu ağ sekmesinden oku; iki yüzler ile beş yüzler farkını tek cümlede yaz.",
  },
  "fullstack-temel-2": {
    warmup:
      "Sipariş fişindeki «üç» yazısı üç porsiyon değildir; etiketsiz kavanozu karıştırmak gibi. Bu derste JavaScript değişken, tip ve fonksiyonu konuşuyoruz — metro kartındaki bakiye sayı, uyarı yazısı metindir.",
    challenge:
      "İsteğe bağlı: adet = \"3\" iken çarpım tuzağını yaz; Number ile düzeltilmiş tek satır ekle.",
  },
  "fullstack-temel-3": {
    warmup:
      "Menüde çorba yazıp mutfağa sütlaç gitmek gibi; TypeScript derlemede sözleşmeyi mühürler. «as any» ile susturmak kapıyı açmaz, hatayı erteler. Bu derste tip sözleşmesi ve derleme kapısını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: CartItem için qty: number zorunlu interface yaz; string qty’yi reddeden not düş.",
  },
  "fullstack-temel-4": {
    warmup:
      "Garson salona hem «pişiyor» hem «afiyet» diye bağırmaz; trafik ışığında sarı ve kırmızı birden yanmaz. Bu derste Belge Nesne Modeli, olay ve dürüst kullanıcı arayüzü geri bildirimini konuşuyoruz — meşgulken ikinci tıklama yutulur.",
    challenge:
      "İsteğe bağlı: loading iken button.disabled = true yapan ve hata metni basan mini akış yaz.",
  },
  "fullstack-temel-5": {
    warmup:
      "Kargo takip «yolda» iken «teslim edildi» yazmak alıcıyı kandırır; beş yüz üçte «sepete eklendi» de öyle. Bu derste fetch ile Uygulama Programlama Arayüzü çağrısı ve hata yansıtmayı konuşuyoruz — res.ok false iken yeşil basılmaz.",
    challenge:
      "İsteğe bağlı: Sahte beş yüz üçte basılacak tek dürüst cümleyi yaz; yeşil bildirim kullanma.",
  },
  "fullstack-temel-6": {
    warmup:
      "Kasada barkod okutulmadan fiş basılmaz; tip, Belge Nesne Modeli ve fetch birleşmeden tik yoktur. Bu derste tip güvenli istemci laboratuvarını konuşuyoruz — Sayı Değil adet ile istek atılmaz.",
    challenge:
      "İsteğe bağlı: qty boşken istek atmayan ve !res.ok’ta durum kodu yazan akış iskeleti çıkar.",
  },
  "fullstack-orta-1": {
    warmup:
      "Restoran menü kartındaki fiyat kutunun içinden uydurulmaz; ebeveyn verir, çocuk okur. Bu derste React bileşen ve props sözleşmesini konuşuyoruz — tek yönlü veri, gizli yan kapı yok.",
    challenge:
      "İsteğe bağlı: ProductCard Props tipini yaz; çocukta title mutasyonu yapmama kuralını not et.",
  },
  "fullstack-orta-2": {
    warmup:
      "Aynı masada hem «ödeme alındı» hem «kart reddedildi» fişi basılmaz; iki ışık birden yanmaz. Bu derste useState tuzakları ve çelişen bayrakları konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Üç doğru-yanlış bayrağının hangi birleşiminin yasak olduğunu tek cümlede reddet.",
  },
  "fullstack-orta-3": {
    warmup:
      "Sipariş fişinde tek kutu durur: boş, alındı, pişti, iptal. Hem pişti hem iptal yazılmaz. Bu derste useReducer ile Tek Gerçek Kaynak faz makinesini konuşuyoruz — idle | submitting | success | error.",
    challenge:
      "İsteğe bağlı: SUBMIT’in yalnız idle’dan çıkacağını reducer kuralı olarak yaz.",
  },
  "fullstack-orta-4": {
    warmup:
      "Fişte satır numarası değil yemek adı kimliktir; sıra değişince mercimek çorbası kaybolmaz. Bu derste liste, anahtar ve kontrollü formu konuşuyoruz — boş qty’de istek atılmaz.",
    challenge:
      "İsteğe bağlı: key={item.id} gerekçesini ve kontrollü qty input satırını yaz.",
  },
  "fullstack-orta-5": {
    warmup:
      "Bütün salonu tek hoparlörden yönetmek gürültü üretir; her durum Context değildir. Bu derste Context sınırını konuşuyoruz — tema evet, her tuş vuruşu hayır.",
    challenge:
      "İsteğe bağlı: qty’nin neden yerel durumda kalacağını tek cümlede gerekçelendir.",
  },
  "fullstack-orta-6": {
    warmup:
      "Eski kargo takip numarası yeni paketin etiketini ezmemeli; geç gelen fetch yanıtı da yeni aramayı ezmemeli. Bu derste useEffect, temizlik ve yarış koşulunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: cancelled bayrağı veya AbortController ile yarışı kesen temizlik notu yaz.",
  },
  "fullstack-orta-7": {
    warmup:
      "Masa numarası adrestir; «aşağıdayım» iddiası bilet değildir. Bu derste yönlendirme ve sayfa sözleşmesini konuşuyoruz — adres çubuğu + dürüst boş ve hata.",
    challenge:
      "İsteğe bağlı: /cart boşken «ödeme başarılı» iskeletini neden reddettiğini yaz.",
  },
  "fullstack-orta-8": {
    warmup:
      "Kasada fiş basılmadan poşet verilmez; faz success olmadan yeşil tik basılmaz. Bu derste alışveriş sepeti Tek Gerçek Kaynak arayüzünü konuşuyoruz — çift tıklamada ikinci Post yutulur.",
    challenge:
      "İsteğe bağlı: submitting iken disabled + beş yüz üçte error mesajı kuralını kontrol listesine dök.",
  },
  "fullstack-ileri-1": {
    warmup:
      "Mutfakta fiş önce, ocak sonra gelir; sıra tersine çevrilirse tencere boş kalır. Bu derste Express iskelet ve ara katman sırasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: json → validate → handler sırasını yaz; ters sıranın boş gövde ürettiğini not et.",
  },
  "fullstack-ileri-2": {
    warmup:
      "Eksik sipariş fişi mutfağa girmez; şemasız iki yüz açık kapıdır. Bu derste Zod gövde doğrulama ve hata anında emniyet dört yüzü konuşuyoruz — şüphede reddet.",
    challenge:
      "İsteğe bağlı: qty: -1 gövdesine dört yüz + issues bekleyen tek satırlık test notu yaz.",
  },
  "fullstack-ileri-3": {
    warmup:
      "Tarif ayrı, malzeme ayrı durur: etiket metni komut, okunan kod parametredir. Dizgi birleştirmeli Yapılandırılmış Sorgu Dili enjeksiyon kapısı açar. Bu derste PostgreSQL şema ve parametreli sorguyu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: WHERE user_id = $1 örnek satırı yaz; birleştirmeli sorguyu tek cümlede reddet.",
  },
  "fullstack-ileri-4": {
    warmup:
      "Hesabı mutfak tezgâhında kesmek düzeni bozar; rotaya ham sorgu yapıştırmak aynı tuzağı kurar. Bu derste repository katmanı ve sorgu sızıntısı yasağını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: addItem’ı repo imzasına taşıyan iskelet yaz; rotada Yapılandırılmış Sorgu Dili olmasın.",
  },
  "fullstack-ileri-5": {
    warmup:
      "Gişe numarası adres, işlem türü fiildir; /addItem gömülü fiil haritayı bulandırır. Bu derste Temsili Durum Transferi kaynak tasarımı ve oluştur-oku-güncelle-sil sözleşmesini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Post /api/cart/items için iki yüz bir beklentisini ve yanlış /addToCart örneğini yaz.",
  },
  "fullstack-ileri-6": {
    warmup:
      "Turnike kartı yoksa platforma inilmez; «ben personelim» sözü yetmez. Düğmeyi gizlemek yetki değildir. Bu derste taşıyıcı jeton ve JavaScript Nesne Gösterimi Web Jetonu kimlik kapısını konuşuyoruz — jetonsuz dört yüz bir.",
    challenge:
      "İsteğe bağlı: Authorization başlığı yokken beklenen durum kodunu ve gerekçeyi yaz.",
  },
  "fullstack-ileri-7": {
    warmup:
      "Kasada «sistem hatası, fiş yok» demek dürüstlüktür; beş yüzde ok:true basmak yalandır. Bu derste dürüst Hipermetin Aktarım Protokolü hata gövdelerini konuşuyoruz — yığın üretimde sızmaz.",
    challenge:
      "İsteğe bağlı: VALIDATION_FAILED zarfını ceyson olarak yaz; tablo adı koyma.",
  },
  "fullstack-ileri-8": {
    warmup:
      "Ödeme alındı ama stok düşmedi fişi defteri bozar; iki yazma ya hep ya hiç ister. Bu derste işlem birimi ve tutarlılığı konuşuyoruz — BEGIN, COMMIT, ROLLBACK.",
    challenge:
      "İsteğe bağlı: UPDATE + INSERT’in aynı işlem biriminde kalma gerekçesini yaz.",
  },
  "fullstack-ileri-9": {
    warmup:
      "Turnike testinin her sabah aynı kartla koşması gibidir; «benim makinemde geçti» sürekli entegrasyon değildir. Bu derste TestClient ve göç disiplinini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: dört yüz / dört yüz bir / iki yüz bir üç doğrulamasını test planına dök.",
  },
  "fullstack-ileri-10": {
    warmup:
      "Marketin kasa, stok ve fişi aynı defterde kapanmadan «sattık» denmez. Bu derste üretime hazır sepet Temsili Durum Transferi ustalık projesini konuşuyoruz — Zod, jeton, işlem birimi, test yeşil.",
    challenge:
      "İsteğe bağlı: Auth → validate → repo işlem birimi zincirini kontrol listesine çevir; çift Post için benzersiz/upsert notu ekle.",
  },

  "esg-1": {
    warmup:
      "İzinsiz komşu bahçesine girmek «bahçe kontrolü» olmaz; «bir bakayım» demek de pentest sayılmaz. ESG / güvenlik masasında yazılı kapsam, süre ve hedef ister. Bu derste yetkili taramayı konuşuyoruz — izinsiz eve girmemek gibi.",
    challenge:
      "İsteğe bağlı: Kapsamsız tarama isteğini kesen tek soruyu yaz.",
  },
  "esg-2": {
    warmup:
      "Prova ile galayı karıştırmak, demoyu Done saymaya benzer; alkış kapanış değildir. Sprint sonunda kabul ölçütü arayan ekip aynı ayrımı tutar. Bu derste Product Owner sırası ve yazılı Done’u konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Demoyu Done saymama gerekçesini bir satırda yaz.",
  },
  "esg-3": {
    warmup:
      "İmzasız tutanak dosya açmaz; «halloldu» sözü de bulgu kapanışı değildir. Denetim kapanışında kanıt yükleyen taraf aynı disiplini tutar. Bu derste bulgu kapanışının neden kanıt istediğini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kanıtsız bulgu kapanışını reddeden tek cümle yaz.",
  },
  "agile-scrum-1": {
    warmup:
      "Kapıya dayanan yabancı «acil kargo» dese de zinciri açmazsın; göndereni okursun. Gelen kutusunda «acil ödeme» postası da aynı tuzağı kurar. Bu derste kimlik avı link ve parola tuzağını konuşuyoruz — ilk kestığın yer gönderen ve link olur.",
    challenge:
      "İsteğe bağlı: Acil ödeme mailinde ilk kestğin üç kontrolü listele.",
  },
  "agile-scrum-2": {
    warmup:
      "Tek anahtarlı kasa bırakmak, ortak parola ile yetinmeye benzer; biri kaybedince herkes içeride kalır. Hesap ayarında ikinci faktör açmak aynı kapıyı güçlendirir. Bu derste MFA’nın neden kapı olduğunu konuşuyoruz — tek faktörün neden yetmediğini oradan göreceksin.",
    challenge:
      "İsteğe bağlı: Ortak parola önerisini MFA isteyerek reddeden tek cümle yaz.",
  },
  "agile-scrum-3": {
    warmup:
      "Açık kapıdan evi bırakmak, kafe Wi‑Fi’sinde iş işlemi yapmaya benzer; sınır bilinmez. Bu derste açık Wi‑Fi varsayılanını ve temel ağ disiplinini konuşuyoruz — güncelleme ve sınır olmadan iş bırakmamak gibi.",
    challenge:
      "İsteğe bağlı: Açık Wi‑Fi’de iş işlemini durduran tek cümle yaz.",
  },
  "agile-scrum-4": {
    warmup:
      "Yangında asansöre binmemek, şüpheli oturumda «sonra bakarım» dememek gibidir; önce kapalı kalınır. Bu derste şüphe anında kilitle / bildir / kaydet adımlarını konuşuyoruz — sessizce beklemenin neden risk olduğunu oradan göreceksin.",
    challenge:
      "İsteğe bağlı: Şüphe anında yapılacak üç adımı (kilitle / bildir / kaydet) sırala.",
  },
  "bulut-devops-1": {
    warmup:
      "Ameliyathaneye sokak ayakkabısıyla girmek, dizüstünden üretime basmaya benzer; ortamlar karışır. Cloud konsolunda prod’a dokunan mühendis aynı ayrımı tutar. Bu derste hesap + sır + üretim ayrımını konuşuyoruz — ev anahtarıyla banka kasasını açmamak gibi.",
    challenge:
      "İsteğe bağlı: Dizüstünden prod basma isteğini kesen tek cümle yaz.",
  },
  "bulut-devops-2": {
    warmup:
      "Anahtarı Git’e yapıştırmak, kapı şifresini apartman panosuna asmaya benzer; herkes görür. PR açan DevOps fark + gözden geçirme ister. Bu derste altyapı kodunda sırın neden depoya girmediğini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Repoya yapıştırılmış bir API anahtarını reddeden kontrol listesi maddesi yaz.",
  },
  "bulut-devops-3": {
    warmup:
      "Bozuk asansörle çıkmak, testi kırmış paketi ilerletmeye benzer; üst katta mahsur kalınır. Pipeline kırığını görmezden gelmeyen ekip fail-closed kapıyı tutar. Bu derste CI’nin derle + test + özet disiplinini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Testi kırmış paketi ilerletmeme gerekçesini tek satırda yaz.",
  },
  "bulut-devops-4": {
    warmup:
      "Geri vitessiz araba sürmek, rollback yazılmadan prod’a basmaya benzer; virajda kaçış yok. Bu derste CD kapısında onay + iz + geri almayı konuşuyoruz — release notunda rollback satırı aramak gibi.",
    challenge:
      "İsteğe bağlı: Rollback satırı olmayan bir release notunu durduran cümleyi yaz.",
  },
  "bulut-devops-5": {
    warmup:
      "Hız göstergesi olmadan araç kullanmak, iz yokken kör işletmeye benzer; alarm gelince geç kalınır. Nöbetçi log + metrik + iz bakar, sırları redakte eder. Bu derste gözlemi konuşuyoruz — göstergesiz yola çıkmamak gibi.",
    challenge:
      "İsteğe bağlı: Logda görünen bir sırrı redakte etme kuralını tek cümlede yaz.",
  },
  "uiux-ds-1": {
    warmup:
      "Vitrin ışığı yanıyor diye mağaza açık sayılmaz; kapı gerçekten açılır. Figma’da animasyon da görevi gizleyebilir: «güzel dursun» diye sepete ekle çalışmaz. Bu derste görev tamamlamayı konuşuyoruz — süsün yolu kapatmaması gibi.",
    challenge:
      "İsteğe bağlı: Görevi gizleyen bir süs animasyonunu kesen kabul cümlesi yaz.",
  },
  "uiux-ds-2": {
    warmup:
      "Silik etiketle satmak, kontrastı düşük «249,00 ₺» basmaya benzer; müşteri tutarı okuyamaz. Checkout ekranı çizen tasarımcı ızgara, tipo ve kontrastı tutar. Bu derste okunur fiyatı konuşuyoruz — silik etiketle satmamak gibi.",
    challenge:
      "İsteğe bağlı: Kontrastı düşük fiyat satırını teslim saymama gerekçesini yaz.",
  },
  "uiux-ds-3": {
    warmup:
      "Her odada ayrı priz standardı uydurmak, tek seferlik hex’i sistem sanmaya benzer; fiş uymaz. Design system bakıcısı token ve bileşenle rastgele rengi keser. Bu derste tasarım token’ını konuşuyoruz — prizi odaya göre uydurmamak gibi.",
    challenge:
      "İsteğe bağlı: Token’sız rastgele bir rengi sistem saymama gerekçesini tek cümlede yaz.",
  },
  "uiux-ds-4": {
    warmup:
      "Alkışla muayene bitirmek, «beğendim»i kabul ölçütü saymaya benzer; görev bitmiş sanılır. Sprint demoda PO ölçü arar. Bu derste görev + ölçü + belge kapısını konuşuyoruz — alkışı kabul saymamak gibi.",
    challenge:
      "İsteğe bağlı: «Beğendim»i kabul ölçütü saymayan iki satırlık ölçüt taslağı yaz.",
  },
  "fintek-ob-1": {
    warmup:
      "«Yol bozuk» demek belediye iş emri değildir; kilometre ve kabul yazılır. Açık bankacılık backlog’unda «güzelleştir» de aynı boşluğu açar. Bu derste sorun + paydaş + ölçülebilir gereksinimi konuşuyoruz — tarifsiz sipariş açmamak gibi.",
    challenge:
      "İsteğe bağlı: «Güzelleştir» isteğini ölçülebilir üç gereksinim satırına çevir.",
  },
  "fintek-ob-2": {
    warmup:
      "Sırayı kırıp kasa açmak, kıdemlinin To Do’yu ezmesine benzer; değer akışı bozulur. Product Owner sprint sırasında önceliği korur. Bu derste değer sırası ve kapsam kilidini konuşuyoruz — sırayı kırmamak gibi.",
    challenge:
      "İsteğe bağlı: Kıdemlinin sırayı ezme isteğini PO kilidine bağlayan tek cümle yaz.",
  },
  "fintek-ob-3": {
    warmup:
      "Prova ile yayın gecesini karıştırmak, demoyu Done saymaya benzer; beğeni barajı belgesiz kapatır. Fintek tesliminde ekip kabul ölçütü arar. Bu derste yazılı Bitti Tanımı’nı konuşuyoruz — prova ile yayını ayırmak gibi.",
    challenge:
      "İsteğe bağlı: Demoyu Done saymayan kabul ölçütü cümlesini yaz.",
  },
  "devops-temel-1": {
    warmup:
      "Santral odasına girince ışıklar yanıyor, «her şey içeride» hissi geliyor; sonra kiralık depodaki kasanın kilidinin sende kaldığını fark edersin. Bu derste hizmet katmanları ve paylaşılan sorumluluğu konuşuyoruz — oda ısındı diye kasa açık kalmaz.",
    challenge:
      "İsteğe bağlı: Hizmet Olarak Yazılım hesabında müşteri tarafında kalan üç kontrolü yaz (ipucu: çok faktörlü kimlik, erişim, veri).",
  },
  "devops-temel-2": {
    warmup:
      "Mutfakta etiketsiz kavanoz duruyor; kapağı çevirip «içinde ne varsa çalıştır» demek kör uçuştur. Bu derste Linux işletim sistemi kabuk, dosya sistemi ve izinleri konuşuyoruz — ev anahtarı ile kasa anahtarı ayrıdır.",
    challenge:
      "İsteğe bağlı: 644 dosya / 755 dizin kalıbını yaz; 777’yi neden reddettiğini tek cümlede belirt.",
  },
  "devops-temel-3": {
    warmup:
      "Fabrika ışıkları yanıyor, «hat ayakta» deniyor; bant durmuş, vardiya defteri boş. Bu derste kullanıcı, süreç ve sistem yöneticisi servisini konuşuyoruz — kök kullanıcı varsayılan değildir.",
    challenge:
      "İsteğe bağlı: Bir birim dosyasında User= alanının ne işe yaradığını tek cümlede yaz.",
  },
  "devops-temel-4": {
    warmup:
      "Nöbetçi kulübesinde yanlış daire açılınca yabancı bir yüz çıkar; ping yeşil diye servis sağlıklı sanılmaz. Bu derste Alan Adı Sistemi, port ve güvenlik duvarı temellerini konuşuyoruz — varsayılan red.",
    challenge:
      "İsteğe bağlı: Yirmi iki kapısını herkese açık bırakmanın riskini ve sıçrama sunucusu alternatifini bir cümlede yaz.",
  },
  "devops-temel-5": {
    warmup:
      "Kiralık kasanın yedek anahtarını cafe panosuna asmak gibi; özel anahtar depoya yapışınca herkes kapıyı açar. Bu derste Güvenli Kabuk Protokolü, anahtar ve güvenli erişimi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: PasswordAuthentication no ve paylaşılan kök anahtar yasağını iki satır kural olarak yaz.",
  },
  "devops-temel-6": {
    warmup:
      "Depo sayımında raf numarası yoksa kutu «vardır» diye kapanmaz; boş satır kırmızı sayılır. Bu derste Linux envanter ve bulut hesap haritasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Konak, kullanıcı, port, bulut katmanı, ortam için tek satırlık örnek tablo satırı yaz.",
  },
  "devops-orta-1": {
    warmup:
      "Paylaşımlı ofiste oda kiralayıp müstakil villa sanmak gibi; konteyner çekirdeği paylaşır, sanal makine ayrıdır. Bu derste konteyner ile sanal makine farkını konuşuyoruz — ayrıcalıklı kip kapalı kalır.",
    challenge:
      "İsteğe bağlı: privileged:true isteğini tek cümlede reddet; gerekçe yaz.",
  },
  "devops-orta-2": {
    warmup:
      "Yemek tarifine kasa şifresi yazmak gibi; imaja sır gömmek sonra her kopyada sızar. Bu derste Docker tarif dosyası, kullanıcı ve sır yasağını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: FROM pin + kök olmayan kullanıcı + sır yasağı üç kuralını yaz.",
  },
  "devops-orta-3": {
    warmup:
      "Fabrika bant hattında her istasyon «ben hazırım» derse ürün yarım çıkar; parola partisyona yazılmaz. Bu derste Compose çok servis orkestrasyonunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: compose’da parola yaml’da tutmama kuralını tek cümlede yaz.",
  },
  "devops-orta-4": {
    warmup:
      "Markette «süt» yazan mühürsüz koliyi raftan almak gibi; en son etiket ve imzasız imaj tanıma kapısı açmaz. Bu derste imaj deposu, imza ve yazılım malzeme listesini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: özet + imza + tarama üçlüsünü tanıma kapısı olarak sırala.",
  },
  "devops-orta-5": {
    warmup:
      "Uçak check-list’inde kırmızı madde varken «kalkışa geç» demek gibi; kararsız yeşil paket tanımaz. Bu derste sürekli entegrasyon hata anında kapalı kapısını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: zorunlu kontrol kırmızıyken birleştirmeyi reddeden tek cümle yaz.",
  },
  "devops-orta-6": {
    warmup:
      "Geri vitessiz araba sürmek gibi; geri alma yazılmadan yayım kördür. Bu derste sürekli teslimat, onay, iz ve geri almayı konuşuyoruz — asansör bakım kapağından kaçak inilmez.",
    challenge:
      "İsteğe bağlı: Güvenli Kabuk gece acil yamasını neden aynı borudan geçirmen gerektiğini yaz.",
  },
  "devops-orta-7": {
    warmup:
      "Trafik ışığı her zaman yeşil yanıyorsa sensör bozulmuştur; «ayakta» lambası uygulama beş yüz basıyor olabilir. Bu derste sağlık kontrolü ve gözlemi konuşuyoruz — kişisel gizli veri maske.",
    challenge:
      "İsteğe bağlı: canlılık ile hazırlık farkını tek cümlede ayır.",
  },
  "devops-orta-8": {
    warmup:
      "Fabrika hattında kalite istasyonu atlanarak koli sevk edilmez; demo yeşili kanıt değildir. Bu derste konteynerize boru laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kapanış borusunda eksik bir adım seçip neden kırmızı olduğunu yaz.",
  },
  "devops-ileri-1": {
    warmup:
      "Ev sigortasında «evdeyiz, güvendeyiz» poliçe değildir; web uygulama duvarı kutusu tek başına model sayılmaz. Bu derste tehdit modeli ve güven sınırını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bir varlık → sınır → tehdit → kapı satırı yaz.",
  },
  "devops-ileri-2": {
    warmup:
      "Kiralık kasa şifresini sohbet grubuna yazmak gibi; .env.example değer taşımaz. Bu derste sır kasası ve döndürmeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Sızan anahtar için döndür + iptal adımlarını iki madde yaz.",
  },
  "devops-ileri-3": {
    warmup:
      "Gıda etiketinde alerjeni sarıya boyamak malzeme listesini yalanlar; bastırma yazılı olmalıdır. Bu derste statik-dinamik tarama ve malzeme listesi kapısını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kritik açıklıkta birleştirmeyi durduran kuralı tek cümlede yaz.",
  },
  "devops-ileri-4": {
    warmup:
      "Otel oda kartını resepsiyonda herkese dağıtmak gibi; hesap yöneticisi sürekli entegrasyonda durmaz. Bu derste Kimlik ve Erişim Yönetimi en az ayrıcalığı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Dar rol + çok faktörlü kimlik + geçici kimlik üçlüsünü yaz.",
  },
  "devops-ileri-5": {
    warmup:
      "Hastanede ziyaretçi holü ile ameliyathane aynı kapıdan girmez; yangın kapısı her odaya açık bırakılmaz. Bu derste ağ dilimlemeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Genel giriş / özel veri ayrımını tek cümlede yaz.",
  },
  "devops-ileri-6": {
    warmup:
      "Yangın afişi asmak tatbikat tutanağı değildir; uygulanabilirlik beyanı + kontrol + tarihli kanıt ister. Bu derste bilgi güvenliği yönetim sistemi kanıtını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Politika belgesinin neden tek başına kanıt olmadığını yaz.",
  },
  "devops-ileri-7": {
    warmup:
      "Nüfus cüzdanı fotokopisini her masaya bırakmak gibi; maskesiz döküm kanunda düşer. Bu derste Kişisel Verilerin Korunması Kanunu envanter ve ihlal kaydını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Envanter satırında olması gereken üç alanı yaz (veri, sebep, bildirim).",
  },
  "devops-ileri-8": {
    warmup:
      "Yangında herkes kendi merdiveninden koşmaz; anlık Güvenli Kabuk yaması tutanak değildir. Bu derste olay müdahalesini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Tespit → çevre → toparlanma → olay sonrası inceleme sırasını yaz.",
  },
  "devops-ileri-9": {
    warmup:
      "Ruhsatsız ek kat sonra «zaten duruyor» diye kalıcı sayılmaz; tıklama operasyonu sapma üretir. Bu derste politika kodu ve altyapı kodu güvenliğini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Sürekli entegrasyonda politika kırığının birleştirmeyi neden kestiğini yaz.",
  },
  "devops-ileri-10": {
    warmup:
      "Bina iskan dosyasında proje var yangın tutanağı yoksa ruhsat çıkmaz; model, kapılar ve kanıt birleşmeden «uyumlu» denmez. Bu derste Geliştirme-Güvenlik-İşletme uyumlu mimari laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kapanış paketinde zorunlu beş kanıt başlığını listele.",
  },
  "flutter-temel-1": {
    warmup:
      "Kargo adres satırı boşken kapıcı «bir şekilde buluruz» demez; koli geri döner. «Çalışıyor» ile «tür güvenli» aynı kapı değildir. Bu derste Dart tip, boş değer güvenliği ve dürüst derlemeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Boş olabilen yazı için ünlem yerine boş birleşimi veya boş kontrolü kullanan tek satır yaz.",
  },
  "flutter-temel-2": {
    warmup:
      "Lego tuğlasında çivi sayısı yazmazsa çocuk neyi neye takacağını bilemez; ortak deftere herkes silgiyle yazarsa kim ne ekledi bilinmez. Bu derste fonksiyon, sınıf ve değişmezliği konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yayma ile kopya liste üreten tek satırlık örnek yaz.",
  },
  "flutter-temel-3": {
    warmup:
      "Mimari büroda çizilen kat planı ev midir? Planı oturmak sanmak çatıyı kâğıttan sanmaktır. Bileşen tarif, öğe şantiye, boyama nesnesi duvardır. Bu derste bileşen ağacı mimarisini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bileşen, öğe ve boyama nesnesi farkını tek cümlede ayır.",
  },
  "flutter-temel-4": {
    warmup:
      "Asansör kat yazısı ile tuş takımı aynı şey midir? Tabela durağandır, tuş her basışta değişir; her satır durumlu olmaz. Bu derste durumsuz ve durumlu bileşen ayrımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Tema rengini temadan okuma kuralını tek cümlede yaz.",
  },
  "flutter-temel-5": {
    warmup:
      "Oturma odasına kamyon lastiği sığar mı? Kapı ölçüsü kısıttır; sarı şerit kısıt ihlalidir, gizleme çözüm değildir. Bu derste satır, sütun, genişletilmiş alan ve kısıtları konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Sütun içinde kaydırılabilir liste hatasını genişletilmiş alan ile çözme kuralını yaz.",
  },
  "flutter-temel-6": {
    warmup:
      "Mağaza vitrinindeki manken askısız, etiketsiz durur mu? Askı, etiket ve sayaçlı stok birlikte durmalıdır. Bu derste ilk Flutter uygulaması laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Malzeme iskeleti, iskele ve yüzen eylem düğmesi sayaç laboratuvarında üç zorunlu parçayı listele.",
  },
  "flutter-orta-1": {
    warmup:
      "Her odada ayrı termostat ısınma kavgası çıkarır; kardeş bileşenler aynı listeyi ayrı tutunca Tek Gerçek Kaynak kırılır. Bu derste setState sınırları ve durumu yukarı taşımayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Paylaşılan durumu ata bileşene taşıma kuralını tek cümlede yaz.",
  },
  "flutter-orta-2": {
    warmup:
      "Her oda kendi jeneratörünü merdivenden sürüklemez; kat panosundan beslenir. Bu derste miras bileşen ve sağlayıcı ile bağımlılığı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: dinle ile bir kerelik oku farkını tek cümlede ayır.",
  },
  "flutter-orta-3": {
    warmup:
      "Tren sinyalinde aynı anda yeşil ve kırmızı yanmaz; yükleniyor ve hata birlikte doğru olmaz. Bu derste Riverpod veya Bloc ile Tek Gerçek Kaynak durum makinesini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: boşta, yükleniyor, veri, hata fazını dört madde olarak yaz.",
  },
  "flutter-orta-4": {
    warmup:
      "Kargo paketine etiket yapışmadan «çıktı» denir mi? Barkod okunmadan «geldi» sahte yeşildir. Bu derste Hipermetin Aktarım Protokolü istemcisi, Veri Transfer Nesnesi ve hata modelini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Beş yüz yanıtında hata durumu gösterme kuralını tek cümlede yaz.",
  },
  "flutter-orta-5": {
    warmup:
      "Market vitrininde «yok» ile «depo yandı» aynı tabela olur mu? Boş ile hata aynı bileşen değildir. Bu derste Temsili Durum Transferi oluştur-oku-güncelle-sil ve yükleme-hata-boş kullanıcı arayüzünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Sil düğmesinde çift tıklamayı kesen meşgul faz kuralını yaz.",
  },
  "flutter-orta-6": {
    warmup:
      "Yerel hafıza kartına hem buzdolabı notu hem kasa şifresi yazılır mı? Jeton tercihte değil güvenli kasada durur. Bu derste paylaşılan tercihler ve güvenli yerel anahtarları konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Tema tercihte, taşıyıcı jeton güvenli kasada — iki satır kural yaz.",
  },
  "flutter-orta-7": {
    warmup:
      "Ev arşivinde etiket ve tarih yoksa dosya bulunur ama güvenilmez; göçsüz şema değişikliği sahada çöker. Bu derste yerel veritabanı ve şema göçünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Parametreli Yapılandırılmış Sorgu Dili kullanma gerekçesini tek cümlede yaz.",
  },
  "flutter-orta-8": {
    warmup:
      "Spor salonu kartında giriş kaydı, dolap notu ve kasa anahtarı ayrı durur; laboratuvar durum, ağ ve önbelleği birleştirir. Bu derste Temsili Durum Transferi ve yerel önbellek alışkanlık takip laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kapanış paketinde eksik hata yüzeyi veya gömülü sır neden kapıyı kırmızı yapar — tek cümle yaz.",
  },
  "flutter-ileri-1": {
    warmup:
      "İki dil konuşan tercüman sözlüğü bilmezse «anladım» yalandır; yöntem kanalı sözleşmesi net olmalıdır. Bu derste yerel platform kanalı köprüsünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Platform istisnasını hata durumuna çevirme kuralını yaz.",
  },
  "flutter-ileri-2": {
    warmup:
      "Yedek parça kataloğunda standart arayüz yoksa her araç için özel anahtar taşınır. Bu derste eklenti yazımı ve paket sınırını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Platform arayüzü ile taklit ve sınama yolunu tek cümlede yaz.",
  },
  "flutter-ileri-3": {
    warmup:
      "Sahne kostümü ile gala kıyafeti aynı askıda karışırsa yanlış geceye çıkarsın; üretim adresi hata ayıklamada koda gömülmez. Bu derste ürün çeşidi, ortam ve sırları konuşuyoruz.",
    challenge:
      "İsteğe bağlı: ortam dosyası işleme yasağı ve döndürme prosedürünü iki madde yaz.",
  },
  "flutter-ileri-4": {
    warmup:
      "Fabrika bandında ölçü kontrolü atlanırsa parti geri çağrılır; «benim makinemde yeşil» sürekli entegrasyon kanıtı değildir. Bu derste sürekli entegrasyon analiz, sınama ve yapı paketi borusunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kırmızı sınamada birleştirmeyi reddeden zorunlu kontrol kuralını yaz.",
  },
  "flutter-ileri-5": {
    warmup:
      "Noter mührü kaybolursa aynı dükkân tabelasını yenileyemezsin; anahtar deposu sohbette durmaz. Bu derste Android imzalama ve Android Uygulama Paketini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Hata ayıklama anahtar deposu ile Google Play’e çıkma yasağını tek cümlede yaz.",
  },
  "flutter-ileri-6": {
    warmup:
      "Pasaport, vize ve mühür üçü birden gerekir; profil ile paket kimliği uyuşmazlığı arşivde patlar. Bu derste iOS sertifika, profil ve iOS uygulama paketini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Uygulama mağazası dışa aktarma ile ad-hoc farkını tek cümlede ayır.",
  },
  "flutter-ileri-7": {
    warmup:
      "Mağaza vitrinindeki etiket depodaki kutudan farklıysa müfettiş raftan indirir; veri güvenliği kodla çelişmemeli. Bu derste Google Play Konsolu liste ve incelemeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: iç → kapalı → üretim yolunu üç kelimeyle sırala.",
  },
  "flutter-ileri-8": {
    warmup:
      "Gümrük beyannamesinde çantada ne varsa formda o yazılır; deneme hesabı vermeden giriş zorunlu uygulama red yer. Bu derste Apple Uygulama Mağazası Bağlantısı üst veri ve kılavuzu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: İnceleme notlarında deneme hesabı ve iki faktör talimatı zorunluluğunu yaz.",
  },
  "flutter-ileri-9": {
    warmup:
      "Uçak kara kutusu yoksa kaza spekülasyondur; mağazaya çıktık bitti demek çöküşü görmemektir. Bu derste çöküş raporu, gözlem ve özellik bayrağını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sembol dosyası ve eşleme yüklemeden yığın okunmaz — tek cümle yaz.",
  },
  "flutter-ileri-10": {
    warmup:
      "Gemi motoru çalışıyor diye limanı terk etmezsin; can yeleği ve manifesto da vardır. iOS uygulama paketi oluştu teslim değildir. Bu derste sürekli entegrasyon, sürekli teslimat ve mağaza yayın kapısı laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Yayın laboratuvarı kontrol listesinde zorunlu beş kapı başlığını listele.",
  },
  "ds-temel-1": {
    warmup:
      "Pazarda «ucuz olsun» demek sipariş değildir; tezgâhtar hangi ürün, kaç kilo, hangi para birimi diye sorar. Veride de soru net değilse tablo boş kalır. Bu derste veri sözleşmesi ve soru tanımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bir iş sorusunu metrik, birim ve zaman aralığıyla tek cümlede yaz.",
  },
  "ds-temel-2": {
    warmup:
      "Market poşetinde yumurta üst üste kırılır; düzenli tepside her hücre yerini bilir. Dizilerde de şekil ve eksen bozulursa hesap kayar. Bu derste NumPy dizilerini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: 3×4 rastgele dizi oluşturup shape ve dtype’ı yazdır.",
  },
  "ds-temel-3": {
    warmup:
      "Defterde satır kişi, sütun özellik gibi; karışık not kâğıdından kim kimi bulamaz. Tablo düzeni soruyu hızlandırır. Bu derste Pandas DataFrame’i konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Küçük bir CSV’yi oku, head() ve dtypes’ı kontrol et.",
  },
  "ds-temel-4": {
    warmup:
      "Mutfakta bozuk yumurta tencerede hepsini bozar; eksik tarih veya çifte kayıt da ortalamayı zehirler. Temizlik yemek öncesi yıkamaktır. Bu derste veri temizliğini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Eksik ve yinelenen satır için iki satırlık bir temizlik planı yaz.",
  },
  "ds-temel-5": {
    warmup:
      "Misafir gelmeden evi gezip bozuk lamba ve boş rafı fark etmek gibi; grafiğe bakmadan model kurmak karanlıkta koşmaktır. Bu derste keşifsel veri analizini (EDA) konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bir sayısal kolon için dağılım ve aykırı uç gözlemini tek cümlede yaz.",
  },
  "ds-temel-6": {
    warmup:
      "Tarifi okuyup mutfağa girmeden yemek çıkmaz; EDA laboratuvarında soru, temizlik ve grafik aynı masada biter. Bu derste EDA laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Lab checklist’te soru → temizlik → görselleştirme sırasını üç kelimeyle yaz.",
  },
  "ds-orta-1": {
    warmup:
      "Etiketli kutularla raflamak ile «benzerleri yan yana koy» oynamak farklıdır; biri öğretmenli, biri keşiftir. Bu derste supervised ve unsupervised ayrımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Etiketli ve etiketsiz birer sahne örneği yaz.",
  },
  "ds-orta-2": {
    warmup:
      "Sınav sorularını ezberleyip aynı kâğıdı tekrar çözmek başarı değildir; gelecek kâğıdı görmeden çalışmak gerekir. Veride de sızıntı yalan skor üretir. Bu derste train/test split ve leakage’ı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Leakage’a yol açan bir kolon örneğini tek cümlede yaz.",
  },
  "ds-orta-3": {
    warmup:
      "Terzi önce ölçü alır, sonra kumaşı keser; ölçek ve dönüşüm sıra bozulursa elbise tutmaz. Pipeline aynı sırayı herkese uygular. Bu derste Pipeline ve ölçeklemeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: fit’i yalnız train’de tutma gerekçesini tek cümlede yaz.",
  },
  "ds-orta-4": {
    warmup:
      "Terazi ibresi düz çizgiye yakınken tahmin kolaydır; kapı aç/kapa gibi iki sonuçta eğri başka dil konuşur. Bu derste doğrusal ve lojistik modelleri konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Regresyon ile sınıflandırma için birer hedef örneği yaz.",
  },
  "ds-orta-5": {
    warmup:
      "Ormanda her ağaç bir oy verir; tek ağaç rüzgârda sallanır, topluluk daha dengeli durur. Boosting de zayıf oyuncuları sırayla güçlendirir. Bu derste ağaçlar ve boosting’i konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Tek ağaç ile ensemble farkını tek cümlede ayır.",
  },
  "ds-orta-6": {
    warmup:
      "Futbolda sadece gol saymak yetmez; kaçırılan net fırsat da skoru anlatır. Modelde de accuracy tek başına her hikâyeyi örtmez. Bu derste değerlendirme metriklerini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Dengesiz sınıfta neden F1/recall’a bakıldığını tek cümlede yaz.",
  },
  "ds-orta-7": {
    warmup:
      "Tek prova ile tiyatroya çıkmak risklidir; birkaç gece prova, seyirciye daha dürüst hazırlar. Çapraz doğrulama ve arama da şansa güvenmez. Bu derste CV ve hiperparametre aramasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Grid/Random search’ün neyi denediğini tek cümlede yaz.",
  },
  "ds-orta-8": {
    warmup:
      "Tariften sofraya kadar ölçü, pişirme ve tadım bir masada biter; sklearn capstone da split’ten metriğe kadar tek akıştır. Bu derste sklearn capstone laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Capstone’da zorunlu dört adımı (split → pipeline → fit → metric) listele.",
  },
  "ds-ileri-1": {
    warmup:
      "Hesap makinesinde her tuş iz bırakırsa geriye dönüp hatayı bulursun; tensör ve autograd da gradyanı böyle taşır. Bu derste tensör ve autograd’ı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: requires_grad=True olan bir tensörde backward sonrası ne okunduğunu yaz.",
  },
  "ds-ileri-2": {
    warmup:
      "Lego kutusunda her blokun girişi ve çıkışı bellidir; dağınık tuğla kule yıkılır. nn.Module katmanları aynı sözleşmeyle birleşir. Bu derste nn.Module’ü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: forward içinde iki katmanı zincirleyen minik bir iskelet yaz.",
  },
  "ds-ileri-3": {
    warmup:
      "Fırın bandı tepsi tepsi getirir; bütün un çuvalını birden fırına tıkamazsın. DataLoader da batch ve shuffle ile masayı besler. Bu derste DataLoader’ı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: batch_size ve shuffle’ın eğitimde ne işe yaradığını iki kısa madde yaz.",
  },
  "ds-ileri-4": {
    warmup:
      "Spor salonunda tekrar: ısın, kaldır, nefes al, kaydı tut; set atlamak sakatlık riskidir. MLP döngüsü de forward–loss–backward–step ritmidir. Bu derste MLP eğitim döngüsünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bir epoch’ta dört adımı sırayla yaz.",
  },
  "ds-ileri-5": {
    warmup:
      "Fotoğrafta yüzü tanımak için her pikseli tek tek ezberlemek yerine kenar ve desen yakalanır; filtreler yerel komşuluğa bakar. Bu derste CNN’i konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Konvolüsyonun neden tam bağlantıdan daha az parametre taşıyabildiğini tek cümlede yaz.",
  },
  "ds-ileri-6": {
    warmup:
      "Usta aşçının elini öğrenmiş çırak yeni mutfakta sosu uyarlar; sıfırdan her şeyi yeniden pişirmez. Transfer öğrenme de önceden öğrenilmiş özellikleri taşır. Bu derste transfer learning’i konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Donmuş gövde + yeni kafa senaryosunu tek cümlede anlat.",
  },
  "ds-ileri-7": {
    warmup:
      "Kitap sayfalarını ezberleyip sınavda aynı paragrafı yazmak öğrenmek değildir; yedek kopya olmadan da gece yarısı iş kaybolur. Bu derste checkpoint ve aşırı öğrenmeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Erken durdurma veya checkpoint kaydetme gerekçesini tek cümlede yaz.",
  },
  "ds-ileri-8": {
    warmup:
      "Dükkânın vitrini geçen yılın ürünüyle doluysa bugünkü müşteri şaşırır; model de dağılım kayınca eski skor yalan olur. Bu derste değerlendirme ve drift’i konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Production’da drift şüphesinde bakılacak iki sinyali yaz.",
  },
  "ds-ileri-9": {
    warmup:
      "Tarifi mutfaktan paket servise taşımak ayrı iştir; fırındaki tencere sokakta taşınmaz. ONNX ve serve modeli kapıya çıkarır. Bu derste ONNX ve model servisini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Eğitim ortamı ile inference ortamı farkını tek cümlede yaz.",
  },
  "ds-ileri-10": {
    warmup:
      "Yemek fotoğrafı çekildi diye restoran açılmış sayılmaz; menü, mutfak ve servis birlikte denetlenir. DL deploy lab da modelden uç noktaya kadar kapı ister. Bu derste derin öğrenme deploy laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Deploy lab checklist’te model, metrik ve uç nokta üçlüsünü yaz.",
  },
  "sec-temel-1": {
    warmup:
      "Bina girişindeki turnike kartsız açılmaz; «ben buradayım» sözü yetmez. Komşunun zilini çalmadan evine girmek de merak sayılmaz. Bu derste etik sınır ve gizlilik-bütünlük-erişilebilirlik üçlüsünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Etkileşim kurallarında hedef, süre ve bir yasak satırını üç maddede yaz.",
  },
  "sec-temel-2": {
    warmup:
      "Mühürlü zarfın üzerindeki kapı numarası daireyi anlatmaz; numara açık olsa da kilit ayrıdır. Port ve protokol de aynı adrestir. Bu derste İletim Kontrol Protokolü / İnternet Protokolü, port ve protokol okuryazarlığını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: 22, 80 ve 443 için tipik servis satırını yaz.",
  },
  "sec-temel-3": {
    warmup:
      "Çilingir muayenesinde kilit markası yetmez; kim anahtar taşıyor, deftere yazılı mı. 777 izin kapıyı açık bırakır. Bu derste Linux kullanıcı, izin ve süreç güvenliğini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: 644/755 kalıbı ile 777 yasağını iki satır kural olarak yaz.",
  },
  "sec-temel-4": {
    warmup:
      "Vitrinden bakmak ile depoya el uzatmak farklıdır; pasif açık kaynak istihbaratı dokunmadan okur. Bu derste yetkili pasif keşif ve açık kaynak istihbaratı disiplinini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bir bulguya kaynak + tarih + kapsam içi/dışı satırı ekle.",
  },
  "sec-temel-5": {
    warmup:
      "Yangın tatbikatında alarm basmak ile gerçek binada izinsiz siren çalmak aynı değildir. Bu derste yalnız laboratuvarda aktif keşif ve port-servis envanterini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: İzin listesi tek İnternet Protokolü + iki örnek port satırı yaz; üretim tarama isteğini reddet.",
  },
  "sec-temel-6": {
    warmup:
      "Ev güvenlik turunda kapı-pencere yazılmazsa tur gezinti kalır. Haritasız ağda sertleştirme kontrol listesi boş kalır. Bu derste laboratuvar ağ haritası ve sertleştirme kontrol listesi laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Üç makine satırı ve Güvenli Kabuk / izin / güvenlik duvarı üç sertleştirme maddesi yaz.",
  },
  "sec-orta-1": {
    warmup:
      "Bina yangın denetiminde müfettiş fotoğraf ve rapor mühürler; yangın çıkarmaz. Bu derste sızma testi metodolojisi ve rapor disiplinini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Plan → test → rapor → yeniden test fazlarını dört satırda yaz.",
  },
  "sec-orta-2": {
    warmup:
      "Market rafında etiket yoksa ürün kaybolur; Açık Web Uygulaması Güvenlik Projesi sınıfları bulguyu rafa dizer. Bu derste Açık Web Uygulaması Güvenlik Projesi En Kritik On haritasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Üç Açık Web Uygulaması Güvenlik Projesi sınıfına birer tespit/önleme satırı bağla.",
  },
  "sec-orta-3": {
    warmup:
      "Formdaki adı muhasebe fişine ham yapıştırmak defteri bozar; kullanıcı metnini Yapılandırılmış Sorgu Dili’ne yapıştırmak mutfağı yakar. Bu derste enjeksiyon tespitini ve parametreli sorguyu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Dizgi birleştirmeyi reddeden ve yer tutucu kullanan tek örnek satır yaz.",
  },
  "sec-orta-4": {
    warmup:
      "Mektubu zarfa koymadan sahneye mikrofonla okutmak izinsiz aktör sokar; ham işaretleme Siteler Arası Komut Çalıştırma kapısı açar. Bu derste çıktı kodlama ve İçerik Güvenliği Politikası fikrini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: html_escape mantığını iki kaçış kuralıyla özetle; saldırı yükü yazma.",
  },
  "sec-orta-5": {
    warmup:
      "Otel anahtar kartı süre, iptal ve kopya ister; resepsiyon «kart verdim» deyip defteri tutmazsa kapı açık kalır. Bu derste kimlik doğrulama ve oturum sertleştirmesini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Yalnız tarayıcıya kapalı, Güvenli, aynı site ve çok faktörlü kimlik maddelerini kontrol listesine yaz.",
  },
  "sec-orta-6": {
    warmup:
      "Otel odası numarasını bilmek anahtar değildir; güvensiz doğrudan nesne referansı aynı tuzağı kurar. Bu derste erişim kontrolü ve güvensiz doğrudan nesne referansını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Sunucu tarafı sahiplik kontrolünü tek if ile anlat; arayüz gizlemeyi yetki sayma.",
  },
  "sec-orta-7": {
    warmup:
      "Kasa çelik, anahtar paspasın altındaysa tabela «güvenli» yalan söyler. Taşıma Katmanı Güvenliği ve başlıklar gerçek kilit satırıdır. Bu derste yanlış yapılandırma, güvenlik başlıkları ve Taşıma Katmanı Güvenliği’ni konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Taşıma Katmanı Güvenliği 1.2+, sıkı taşıma ve iki güvenlik başlığını kontrol listesine yaz.",
  },
  "sec-orta-8": {
    warmup:
      "Gemi denetiminde «delik var» yetmez; risk, termin ve sorumlu yazılır. Bu derste yetkili web değerlendirme raporu laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Yönetici özeti + bir kanıtlı bulgu + düzeltme/yeniden test satırı yaz.",
  },
  "sec-ileri-1": {
    warmup:
      "Ofis dosya dolabı üst üste, depo koridoru rastgele; yanlış raf etiketi arşivi karıştırır. Bu derste bellek düzeni ve uygulama ikili arayüzü kavramını konuşuyoruz — silahlı kavram kanıtı yok.",
    challenge:
      "İsteğe bağlı: Yığın, küme ve metin bölümlerini üç satırlık şema olarak etiketle.",
  },
  "sec-ileri-2": {
    warmup:
      "Emniyet kemeri kazayı kutlamaz; hastalık adını bilmek ilaç yazmak değildir. Bu derste bellek bozulması sınıflarını tespit ve azaltma odaklı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: İki bozulma sınıfına birer tespit/azaltma satırı yaz; kavram kanıtı isteme.",
  },
  "sec-ileri-3": {
    warmup:
      "Kapalı kutuyu röntgenle incelemek, başkasının kasasını izinsiz açmak değildir. Bu derste tersine mühendislikte durağan analiz temellerini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Laboratuvar örneği için sha256 + bir dizgi bulgusu satırı yaz.",
  },
  "sec-ileri-4": {
    warmup:
      "Tehlikeli kimyasalı çeker ocakta incelemek ile mutfak tezgâhında denemek aynı değildir. Bu derste dinamik analiz ve güvenli kum havuzunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Ağ kesik + anlık görüntü geri alma + kişisel bilgisayar yasağı üçlüsünü yaz.",
  },
  "sec-ileri-5": {
    warmup:
      "Yangın kapıları olan binada bir daire yanınca tüm blok alev almamalı. Bu derste ağ sızma simülasyonunda bölütleme ve yanal hareket kavramını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Tampon bölge / uygulama / veritabanı allow_from satırlarını üç satırda yaz.",
  },
  "sec-ileri-6": {
    warmup:
      "Stajyer kartıyla müdür odasına girmek, kapı açık bırakılmışsa kilit tasarımıdır. Bu derste yetki yükseltme sınıfları ve tespiti konuşuyoruz — sömürü zinciri yok.",
    challenge:
      "İsteğe bağlı: sudoers ve herkese yazılabilir servis için iki tespit maddesi yaz.",
  },
  "sec-ileri-7": {
    warmup:
      "Fabrika güvenlik kamerası kaydı silinince olay bitmiş sayılmaz; mavi takım günce ve ele geçirme göstergesi ile bakar. Bu derste günce, ele geçirme göstergesi ve tespiti konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Sahte güncede kaba kuvvet şüphesi için eşik kuralını tek cümlede yaz.",
  },
  "sec-ileri-8": {
    warmup:
      "Yangın tatbikatında hem senaryo hem itfaiye geri bildirimi yoksa alkış tiyatrodur. Bu derste mor takım ve senaryo yazımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kırmızı hedefi + mavi tespit kuralı + ortalama tespit süresi ölçütünü üç satırda yaz.",
  },
  "sec-ileri-9": {
    warmup:
      "Köprü çatlağını sınıflamak bombayı kurmak değildir; sömürü disiplini sınıf ve yama önceliğidir. Bu derste sömürü geliştirme disiplinini kavramsal olarak konuşuyoruz — silahlı kavram kanıtı yok.",
    challenge:
      "İsteğe bağlı: Zafiyet sınıfı + varlık + yama önceliği satırını yaz; kavram kanıtı yasak notu ekle.",
  },
  "sec-ileri-10": {
    warmup:
      "Afet tatbikatı bitti diye kahramanlık videosu yetmez; uçtan uca laboratuvar etkileşim kurallarından yeniden teste kanıt ister. Bu derste uçtan uca laboratuvar simülasyon raporu laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Etkileşim kuralları, bulgu, mavi tespit, düzeltme ve yeniden test satırlarını kontrol listesine yaz.",
  },
  "db-temel-1": {
    warmup:
      "Kütüphanede indeks kartı yoksa isim yetmez; aynı addan üç kişi durur. Bu derste ilişkisel model, tablo, birincil ve yabancı anahtarı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bir varlık için birincil anahtar, bir ilişki için yabancı anahtar satırını yaz.",
  },
  "db-temel-2": {
    warmup:
      "Arşiv odasında aynı adresi on klasöre yapıştırmak, taşınınca on yanlış mektup üretir. Bu derste Varlık İlişki Modeli ve normalizasyonu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Birinci-üçüncü normal form için birer ihlal örneği ve düzeltme satırı yaz.",
  },
  "db-temel-3": {
    warmup:
      "Noter kayıt defterinde sınır maddesi yoksa tapu neyi korur? Bu derste Veri Tanımlama Dili ve kısıtları konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Tablo oluşturmada birincil anahtar, yabancı anahtar ve bir denetim satırı tasarla.",
  },
  "db-temel-4": {
    warmup:
      "İki klasörü vatandaş numarası olmadan üst üste koymak çapraz çarpım üretir. Bu derste Veri İşleme Dili, birleştirme ve gruplamayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: İç birleştirme artı gruplama içeren üç satırlık sorgu iskeleti yaz.",
  },
  "db-temel-5": {
    warmup:
      "Banka gişesinde gönderen düşer, alıcı artmazsa para havada kalır. Bu derste işlem birimi, Atomiklik-Tutarlılık-İzolasyon-Dayanıklılık ve izolasyonu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Başla / onayla / geri al üçlüsünü bir vaka cümlesiyle bağla.",
  },
  "db-temel-6": {
    warmup:
      "Süpermarket kasası fiş basmadan poşet vermez; vitrin fotoğrafı mağaza açmaz. Bu derste e-ticaret şema ve sorgu laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: müşteriler / siparişler / sipariş kalemleri üçlüsü ve bir rapor sorgusu yaz.",
  },
  "db-orta-1": {
    warmup:
      "Haritasız şehirde taksi sürmek gibi; sorgu planı dökümü olmadan «yavaş» teşhis spekülasyondur. Bu derste PostgreSQL mimarisi ve sorgu planı dökümünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Dökümde sıralı tarama / dizin tarama ayrımını iki satırda yaz.",
  },
  "db-orta-2": {
    warmup:
      "Her kelimeye ayrı kütüphane fişi basmak rafta yer bırakmaz; seçiciliği düşük dizin yazmayı yavaşlatabilir. Bu derste B-ağacı dizin ve seçiciliği konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Yüksek seçicilikli bir sütun için dizin oluşturma satırı yaz.",
  },
  "db-orta-3": {
    warmup:
      "Tüm katalog yerine yalnız açık rafları etiketlemek gibi; kısmi dizin hedefi daraltır. Bu derste kısmi ve ifade dizinini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Yalnız durumu açık satırlar için kısmi dizin örneği yaz.",
  },
  "db-orta-4": {
    warmup:
      "Eski yol tarifine güvenmek gibi; bayat istatistik yanlış birleştirme planı seçtirir. Bu derste planlayıcı, birleştirme ve istatistiği konuşuyoruz.",
    challenge:
      "İsteğe bağlı: İç döngü / karma birleştirme için birer tipik koşul notu yaz.",
  },
  "db-orta-5": {
    warmup:
      "Depoda boş kutular koridoru tıkar; vakumlama ve çözümleme bakım ritmidir. Bu derste vakumlama, çözümleme ve şişkinliği konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Çözümleme sonrası neyin tazelendiğini tek cümlede yaz.",
  },
  "db-orta-6": {
    warmup:
      "Her müşteri için yeni kasa açmak gibi; havuz bağlantı maliyetini paylaşır. Bu derste bağlantı havuzu ve hazırlanmış deyimi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Parametreli sorgu ile dizgi birleştirmeyi yan yana reddet/kabul yaz.",
  },
  "db-orta-7": {
    warmup:
      "İki kişi aynı kapıyı ters yönden itince sıkışır; kilitlenme de öyle. Bu derste Çok Sürümlü Eşzamanlılık Denetimi, kilit ve kilitlenmeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kilitlenmede geri al artı yeniden deneme kuralını iki satırda yaz.",
  },
  "db-orta-8": {
    warmup:
      "Kronometresiz pit stop rekor sayılmaz; ayar laboratuvarı ölçü ile kanıt ister. Bu derste yavaş sorgu ayarı laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Önce/sonra plan dökümü satırı ve eklenen dizini listeye yaz.",
  },
  "db-ileri-1": {
    warmup:
      "Tek aletle her tamiri yapmak gibi; Tutarlılık-Erişilebilirlik-Bölünme Toleransı ödünleşimi depo seçimini zorlar. Bu derste çok dilli kalıcılık ve ödünleşimi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bir iş kuralı için Yapılandırılmış Sorgu Dili ile Redis tercihi ve gerekçesini yaz.",
  },
  "db-ileri-2": {
    warmup:
      "Vitrindeki fiyat etiketi depo fiyatı değildir; kenar önbelleği kaynak gerçek sayılmaz. Bu derste Redis veri yapıları ve kenar önbelleğini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yana-koyma yaz/oku artı süre ve geçersiz kılma üç satır yaz.",
  },
  "db-ileri-3": {
    warmup:
      "Mesaj panosuna yazılan anons, dinleyen yoksa kaybolur; yayın-abone kalıcı günce değildir. Bu derste Redis akışları ve yayın-abone ayrımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: akışa ekle / oku grup fikrini iki satırda özetle.",
  },
  "db-ileri-4": {
    warmup:
      "Zarfın içinde fiş dururken etiket yoksa arama yavaşlar; Mongo’da dizin aynı işi görür. Bu derste MongoDB belge modeli ve toplama borusunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: eşleştir → grupla boru iskeleti yaz.",
  },
  "db-ileri-5": {
    warmup:
      "Tüm evi tek çantaya tıkmak gibi; her şeyi gömmek belgeyi şişirir. Bu derste MongoDB modelleme ve tutarlılığı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Gömme ve referans için birer uygun vaka yaz.",
  },
  "db-ileri-6": {
    warmup:
      "Hızlı kargo dağıtım merkezinde barkod, hangi banda gideceğini söyler; bölüm anahtarı sıra ve ölçeği belirler. Bu derste Apache Kafka konu, bölüm ve tüketici grubunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: konu + bölüm anahtarı + tüketici grubu üç satır sözleşmesi yaz.",
  },
  "db-ileri-7": {
    warmup:
      "Noter onaylı mektup deftere işlenmeden postaya verilmez; çıkış kutusu çift yazımı mühürler. Bu derste olay güdümlü tasarım ve çıkış kutusunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Aynı işlem biriminde iş satırı artı çıkış kutusu fikrini yaz.",
  },
  "db-ileri-8": {
    warmup:
      "Aynı kargo barkodunu iki kez okutmak ikinci teslim sayılmaz; eşgüçlülük anahtarı tekrarı düşürür. Bu derste akış işleme ve eşgüçlülüğü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: olay kimliği ile «bir kez işle» kuralını tek koşulla anlat.",
  },
  "db-ileri-9": {
    warmup:
      "Posta kuyruğu uzunluğu nabızdır; gecikme ve ofset gözlemdir. Bu derste gecikme, ofset ve tam-bir-kez uyarısını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tüketici gecikmesi alarm eşiği ve ofset onay notunu yaz.",
  },
  "db-ileri-10": {
    warmup:
      "Tezgâh, kargo bandı ve vitrin etiketi aynı sipariş numarasını konuşmadan sevk edilmez. Bu derste Apache Kafka → Redis/Mongo boru laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üretici → Apache Kafka → tüketici → depo listesini dört satır yaz.",
  },
  "arch-temel-1": {
    warmup:
      "Kasa çekmecesi açık bırakılırsa para sayılmaz; sınıf da public yığın kalır. Bu derste OOP dört sütununu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: encapsulation / polymorphism için birer cümlelik örnek yaz.",
  },
  "arch-temel-2": {
    warmup:
      "Aynı tezgâhta muhasebe, kargo ve reklam yapan kişi gibidir; biri hastalanınca üç iş durur. Bu derste SRP ve OCP’yi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: God method’tan iki değişme nedeni ayırıp satır satır yaz.",
  },
  "arch-temel-3": {
    warmup:
      "Bisiklete depo kamyonu yükü yüklemek gibidir; tekerlek var diye sözleşme aynı değildir. Bu derste LSP ve ISP’yi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: şişman arayüzü iki ince arayüze bölen isim taslağı yaz.",
  },
  "arch-temel-4": {
    warmup:
      "Lamba duvara lehimlenmez, fişle takılır; marka değişince kablo kesilmez. Bu derste DIP ve DI temelini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: concrete new yerine port + constructor inject iskeleti yaz.",
  },
  "arch-temel-5": {
    warmup:
      "Rafta «ürün A-17» etiketi gibidir; müşteri adıyla bulamaz, personel de kaybolur. Bu derste Clean Code ve kod kokularını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Long Method veya Magic Number için bir koku + Extract satırı yaz.",
  },
  "arch-temel-6": {
    warmup:
      "Tek tezgâhtarlı bakkalı reyonlara ayırmak gibidir; vitrin fotoğrafı yetmez. Bu derste God class → SOLID refactor laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Calculator / Repository / Notifier üç ayrımını checklist’e yaz.",
  },
  "arch-orta-1": {
    warmup:
      "Her çiviye balyoz gibi; her soruna kalıp şart değildir, kalıpsız kaos da borçtur. Bu derste tasarım kalıpları haritasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir sorun için «kalıp uygula / uygulama» gerekçesini iki satır yaz.",
  },
  "arch-orta-2": {
    warmup:
      "Mutfakta her siparişe ayrı ocak kurmak gibi; new ormanı üretim disiplinini bozar. Bu derste Factory, Abstract Factory ve Builder’ı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir ürün ailesi için Factory Method iskeleti yaz.",
  },
  "arch-orta-3": {
    warmup:
      "Tek anahtarı her kapıya kopyalamak gibi; global singleton testi ve değişimi öldürür. Bu derste Singleton tuzağı ve DI tercihini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: getInstance yerine inject edilen bağımlılık satırı yaz.",
  },
  "arch-orta-4": {
    warmup:
      "Eski prize yeni fiş adaptörü gibidir; yama değil, uyum katmanı gerekir. Bu derste Adapter, Facade ve Decorator’ı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yabancı API için Adapter sarmalayıcı iskeleti yaz.",
  },
  "arch-orta-5": {
    warmup:
      "Aynı düğmeye nakit/kart basmak gibi; davranış değişir, düğme aynı kalır. Bu derste Strategy, Observer ve Command’ı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: if-tipi ormanını Strategy arayüzüne çeviren iki satır yaz.",
  },
  "arch-orta-6": {
    warmup:
      "Sipariş durumuna göre kapı değiştirmek gibidir; bayrak ormanı State değildir. Bu derste State, Template Method ve Chain’i konuşuyoruz.",
    challenge:
      "İsteğe bağlı: draft → paid → shipped için State geçiş satırları yaz.",
  },
  "arch-orta-7": {
    warmup:
      "Mutfak ile servis ayrı kapı gibidir; framework domain’e sızmamalı. Bu derste katmanlı ve hexagonal ports & adapters’ı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir use-case için inbound port + outbound adapter satırı yaz.",
  },
  "arch-orta-8": {
    warmup:
      "Sepeti süslemek yetmez; kalıp ismi yapıştırmak refactor sayılmaz. Bu derste sipariş/sepet pattern refactor laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sepet domain’inde uygulanan üç kalıp + gerekçe checklist’i yaz.",
  },
  "arch-ileri-1": {
    warmup:
      "Her odayı ayrı bina yapmak gibi; mikroservis sayısı ölçek kanıtı değildir. Bu derste monolith vs microservices bölme kriterini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: böl / bölme için birer maliyet gerekçesi yaz.",
  },
  "arch-ileri-2": {
    warmup:
      "Aynı kelimeyi iki mahallede farklı anlamda kullanmak gibidir; context karışır. Bu derste ubiquitous language ve bounded context’i konuşuyoruz.",
    challenge:
      "İsteğe bağlı: «Order» için iki context’te farklı anlam satırı yaz.",
  },
  "arch-ileri-3": {
    warmup:
      "Kasa çekmecesini tek işlemde kilitlemek gibi; aggregate tutarlılık sınırıdır. Bu derste aggregate, entity ve value object’i konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir aggregate kökü + bir VO örneği yaz.",
  },
  "arch-ileri-4": {
    warmup:
      "Posta kutusu anında teslim vaat etmez; eventual consistency de öyle. Bu derste domain events ve eventual consistency’yi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir domain event adı + tüketicisi satırı yaz.",
  },
  "arch-ileri-5": {
    warmup:
      "Yazı defteri ile okuma rafını ayırmak gibi; her CRUD’a CQRS şart değildir. Bu derste CQRS okuma/yazma ayrımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir command ve bir query modeli için iki satır yaz.",
  },
  "arch-ileri-6": {
    warmup:
      "İki deftere ayrı yazıp birini unutmak gibi; outbox çift yazımı mühürler. Bu derste transactional outbox ve idempotency’yi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: TX + outbox + idempotency anahtarı üç satır yaz.",
  },
  "arch-ileri-7": {
    warmup:
      "Orkestra şefi olmadan her çalgıcı kendi temposunda çalar; saga da telafi ister. Bu derste saga orchestration vs choreography’yi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç adımlı saga + bir compensating aksiyon yaz.",
  },
  "arch-ileri-8": {
    warmup:
      "Kapı zilini sonsuza basmak gibi; retry fırtınası komşuyu da düşürür. Bu derste retry, circuit breaker ve bulkhead’i konuşuyoruz.",
    challenge:
      "İsteğe bağlı: timeout + CB açık durumu için iki satır kural yaz.",
  },
  "arch-ileri-9": {
    warmup:
      "Sözleşmesiz kira artışı gibi; versiyonsuz API istemciyi sessiz kırar. Bu derste sözleşme testi, versiyonlama ve observability’yi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: contract test + versiyon + bir metrik/alarm satırı yaz.",
  },
  "arch-ileri-10": {
    warmup:
      "Fabrika bandı uçtan uca denetlenmeden ürün sevk edilmez; event-driven sipariş de öyle. Bu derste event-driven mikroservis capstone laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: olay → servis → saga → gözlem checklist’ini dört satır yaz.",
  },
  "pm-temel-1": {
    warmup:
      "Restoran mutfağında sipariş listesi kimin elinde? Şef, garson ve kasiyer karışınca aynı tabak üç kez pişer. Bu derste ürün yönetimi rollerini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: ürün yöneticisi / ürün sahibi / iş analisti için birer «yapmaz» cümlesi yaz.",
  },
  "pm-temel-2": {
    warmup:
      "Çaydanlık taşınca ocak ıslanıyor; «yeni tencere» demek bu acıyı çözmez. Bu derste problem keşfi ve problem ifadesini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kim + acı + ölçü boşluğu üç satırlık ifade yaz.",
  },
  "pm-temel-3": {
    warmup:
      "Düğün menüsünde herkes her şeyi isteyince sipariş verilmez; olmazsa olmaz yazılır. Bu derste gereksinim toplama ve paydaş görüşmesini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç paydaş için birer açık uçlu soru yaz.",
  },
  "pm-temel-4": {
    warmup:
      "Pazarda «bir şeyler» demek tartıyı işletmez; iki kilo domates fişte durur. Bu derste kullanıcı hikayesi yazımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: rol / istek / değer üçlüsünü bir briften doldur.",
  },
  "pm-temel-5": {
    warmup:
      "Terzi «güzel duruyor» deyince elbise bitti sayılmaz; bel, boy, düğme işaretlenir. Bu derste kabul ölçütleri, INVEST ilkesi ve önceliği konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir hikâye için üç Verildiğinde / Olduğunda / O zaman satırı yaz.",
  },
  "pm-temel-6": {
    warmup:
      "Davetiye fotoğrafı menü ve alışveriş listesi değildir; brif sözleşmeye döner. Bu derste briften kullanıcı hikayesi biriktirme listesi laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: briften üç hikâye + kabul ölçütü + öncelik kontrol listesi yaz.",
  },
  "pm-orta-1": {
    warmup:
      "Fabrika üretim panosuna «çevik olduk» afişi asmak hattı değiştirmez. Bu derste çevik manifesto ve çerçeve seçimini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Scrum / Kanban / hibrit için birer gerekçe satırı yaz.",
  },
  "pm-orta-2": {
    warmup:
      "Maçta hakem, teknik direktör ve oyuncu yeleği değişince skor kimin? Bu derste Scrum omurgasını — roller, artefaktlar ve olayları — konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç rol için birer «yapmaz» maddesi yaz.",
  },
  "pm-orta-3": {
    warmup:
      "Mahalle maçında düdük çalmadan süre tutulmaz; plan, mola, skor ve soyunma odası ayrı durur. Bu derste sprint ritmini — planlama, günlük, inceleme, retrospektif — konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tek cümlelik sprint hedefi + günlük engel satırı yaz.",
  },
  "pm-orta-4": {
    warmup:
      "Fırından ekmek alırken maya ve poşet bakılır; «beğendi» damgası bitti değildir. Bu derste hazır tanımı ve bitti tanımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: hazır tanımı ve bitti tanımı için dörder maddelik kontrol listesi yaz.",
  },
  "pm-orta-5": {
    warmup:
      "Döner tezgâhında üç şişi birden yakmak hız değil tıkanıklıktır. Bu derste Kanban akışını — devam eden iş limiti ve süreyi — konuşuyoruz.",
    challenge:
      "İsteğe bağlı: devam eden iş limiti üç kuralı + örnek teslim / çevrim hesabı yaz.",
  },
  "pm-orta-6": {
    warmup:
      "Kargo takip numarasını her kutuya «kutu» yazmak sevkiyatı kaybettirir. Bu derste JIRA iş takip panosunu — tema, hikâye, görevi — konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir tema altına iki hikâye ve iki görev iskeleti yaz.",
  },
  "pm-orta-7": {
    warmup:
      "Market tartısında eli basılı tutmak kilo yeşil gösterir; torba eksik çıkar. Bu derste JIRA dürüstlüğünü — filtre, sprint panosu ve kalan iş grafiğini — konuşuyoruz.",
    challenge:
      "İsteğe bağlı: açık sprint hikâye sorgusu + dürüst kalan iş grafiği kuralı yaz.",
  },
  "pm-orta-8": {
    warmup:
      "Düğün gününde nikâh, yemek ve pasta üç kapıda birden başlamaz; sıra yazılı durur. Bu derste Scrum, Kanban ve JIRA sprint laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: hedef + devam eden iş limiti + tema ağacı + hazır / bitti kontrol listesini yaz.",
  },
  "pm-ileri-1": {
    warmup:
      "Yol haritası pusulası olmadan «kalabalıktık» demek rota değildir. Bu derste ürün analitiğini — huni ve geri dönüşü — konuşuyoruz.",
    challenge:
      "İsteğe bağlı: dört adımlı huni olay listesi + yedinci gün geri dönüş tanımı yaz.",
  },
  "pm-ileri-2": {
    warmup:
      "Vitrin ışığı yanıyor diye mağaza kârlı sanılmaz; kaç tabak satıldı sorulur. Bu derste süs metrik ile eyleme götüren metrik ayrımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: iki süs ve iki eyleme götüren metrik tablosu yaz.",
  },
  "pm-ileri-3": {
    warmup:
      "«Formda kalayım» ayakkabı almak değildir; kilometre taşı ister. Bu derste hedefler ve anahtar sonuçlar yazımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir hedef + üç ölçülebilir anahtar sonuç yaz.",
  },
  "pm-ileri-4": {
    warmup:
      "Pusulasız gemide her rüzgâr doğru yön sanılır; kuzey yıldızı net olmalı. Bu derste Temel Performans Göstergeleri ağacı ve kuzey yıldızını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kuzey yıldızı + iki girdi + bir gecikmeli gösterge satırı yaz.",
  },
  "pm-ileri-5": {
    warmup:
      "Çayı üç dakika demlemeden «acı düştü» ilan edilmez; tarif laboratuvarda durur. Bu derste hipotez yazımı ve deney tasarımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: eğer / o zaman / çünkü + birincil metrik + süre yaz.",
  },
  "pm-ileri-6": {
    warmup:
      "Kör tadımda «şu köşedeki daha güzel» diye bardak seçilmez. Bu derste ikili karşılaştırma testini — rastgele atama, örneklem, anlamlılığı — konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kontrol / varyant + örneklem + anlamlılık / güç satırı yaz.",
  },
  "pm-ileri-7": {
    warmup:
      "Düdüklüde basınç yükselince «biraz daha pişsin» denmez; vana tartışmayı beklemez. Bu derste koruma rayı metrikleri ve öldürme anahtarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: iki koruma rayı eşiği + öldürme anahtarı eylemi yaz.",
  },
  "pm-ileri-8": {
    warmup:
      "Maç istatistiğinde toplam gol ile ev sahibi ilk yarı aynı cümle değildir. Bu derste kohort, huni ve pano okumayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kohort tanımı + cihaz kırılımlı huni notu yaz.",
  },
  "pm-ileri-9": {
    warmup:
      "«O zaman şöyle demiştik» düğün defterinin yerini tutmaz. Bu derste veriye dayalı karar kaydını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: karar + kanıt + alternatif + özet değeri satırı yaz.",
  },
  "pm-ileri-10": {
    warmup:
      "Yolculukta yalnız harita fotoğrafı yetmez; varış, kilometre, lastik ve yağmur molası birlikte durur. Bu derste hedefler, ikili karşılaştırma ve öldürme anahtarı laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: hedefler + deney speki + öldürme + karar kaydı kontrol listesini yaz.",
  },
  "ux-temel-1": {
    warmup:
      "Lokantada menüyü boyamak ile yemeği pişirmek aynı iş değildir; Kullanıcı Arayüzü ile Kullanıcı Deneyimi de öyle. Bu derste Kullanıcı Deneyimi ile Kullanıcı Arayüzü ayrımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kullanıcı Deneyimi ve Kullanıcı Arayüzü için birer «yapmaz» cümlesi yaz.",
  },
  "ux-temel-2": {
    warmup:
      "Pazarda kimseye sormadan «herkes bunu ister» demek gibi; kanıt yoksa keşif yoktur. Bu derste Kullanıcı Deneyimi araştırmasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir araştırma sorusu + iki görüşme sorusu yaz.",
  },
  "ux-temel-3": {
    warmup:
      "Haritasız şehir turu gibi; kişi ve yol net değilse rota uydurulur. Bu derste persona ve kullanıcı yolculuğunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir persona + üç adımlı yolculuk + bir acı noktası yaz.",
  },
  "ux-temel-4": {
    warmup:
      "Kütüphanede kitapları rastgele rafta tutmak gibi; etiket bozulursa yol kaybolur. Bu derste bilgi mimarisini ve kart sıralamayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: beş etiketlik site haritası iskeleti yaz.",
  },
  "ux-temel-5": {
    warmup:
      "Mimari taslak durmadan boya sürmek gibidir; renk erken gelirse akış kaybolur. Bu derste düşük sadakat tel çerçeveyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç ekranlı gri iskelet akışını madde madde yaz.",
  },
  "ux-temel-6": {
    warmup:
      "Atölyede aletleri masaya savurmak gibi; çerçeve düzensizse iş kaybolur. Bu derste Figma temellerini — çerçeve, otomatik yerleşim, bileşen — konuşuyoruz.",
    challenge:
      "İsteğe bağlı: çerçeve / bileşen / otomatik yerleşim için birer kural satırı yaz.",
  },
  "ux-temel-7": {
    warmup:
      "Keşifsiz, haritasız, iskeletsiz vitrin açmak gibi; laboratuvar uçtan uca kanıt ister. Bu derste araştırma → bilgi mimarisi → tel çerçeve Figma laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bulgu → bilgi mimarisi → tel çerçeve → Figma kontrol listesini yaz.",
  },
  "ux-orta-1": {
    warmup:
      "Kavşakta her tabelayı neon yakmak gibi; göz nereye bakacağını bilmez. Bu derste görsel hiyerarşi ve sekiz piksel ızgarayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir ekranda birincil / ikincil / üçüncül vurgu satırı yaz.",
  },
  "ux-orta-2": {
    warmup:
      "Silik etiketle satmak gibi; tipo ve renk okunmazsa fiyat düşer. Bu derste tipografi ve renk sistemini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: iki tipo ölçeği + bir kontrast eşiği satırı yaz.",
  },
  "ux-orta-3": {
    warmup:
      "Her dolaba ayrı menteşe uydurmak gibi; bileşen yoksa bakım patlar. Bu derste Kullanıcı Arayüzü bileşen anatomisini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Düğme / Girdi / Kart için birer kullanım kuralı yaz.",
  },
  "ux-orta-4": {
    warmup:
      "Fabrika kalıp makinesi her parçayı ayrı milimle keserse seri üretim dağılır. Bu derste tasarım jetonunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: renk / boşluk / tipo için üç jeton adı yaz.",
  },
  "ux-orta-5": {
    warmup:
      "Aynı kapının kilitli / açık / bozuk hallerini ayrı kapı sanmak gibi; varyant tek bileşendir. Bu derste bileşen kütüphanesi ve varyantları konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir bileşen için boyut + durum özellik seti yaz.",
  },
  "ux-orta-6": {
    warmup:
      "Haritayı duvara asıp yolu yürümüş saymak gibi; tıklanmayan akış test edilmez. Bu derste prototiplemeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç ekranlı tıklanır akış senaryosu yaz.",
  },
  "ux-orta-7": {
    warmup:
      "Kapıyı yalnız görenler için yapmak gibi; kontrast ve odak yoksa erişim kapanır. Bu derste Web İçeriği Erişilebilirlik Kılavuzu’nu tasarımda konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kontrast + odak + etiket için üç kontrol maddesi yaz.",
  },
  "ux-orta-8": {
    warmup:
      "Jeton, bileşen ve prototip aynı rafta durmadan sistem kurulmaz. Bu derste Tasarım Sistemi laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: jeton → bileşen → varyant → prototip kontrol listesini yaz.",
  },
  "ux-ileri-1": {
    warmup:
      "Marangoz teslim tutanağı olmadan mobilya bitmiş sayılmaz; ölçü yoksa atölye tahmin eder. Bu derste Figma’dan koda el teslimini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: aralık / tipografi / durum notu üç satırlık el teslimi yaz.",
  },
  "ux-ileri-2": {
    warmup:
      "Her ampul için ayrı kablo çekmek gibi; stil değişkeni yoksa tema kırılır. Bu derste Basamaklı Stil Sayfaları değişkenlerini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç jetonu stil değişkeni satırına eşle.",
  },
  "ux-ileri-3": {
    warmup:
      "Fiş olmadan priz uydurmak gibi; özellik sözleşmesi yoksa React kırılır. Bu derste React bileşen sözleşmesini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir bileşen için özellik + zorunlu durum listesi yaz.",
  },
  "ux-ileri-4": {
    warmup:
      "Her çiviye ayrı çekiç uydurmak gibi; serbest sınıf yığını sistem değildir. Bu derste Tailwind jeton eşlemesini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç jetonu Tailwind yardımcısına eşle.",
  },
  "ux-ileri-5": {
    warmup:
      "Fotoğrafı küçültüp çerçeveye sığdırmak gibi; içerik yeniden düzenlenmeden duyarlı olmaz. Bu derste duyarlı kırılımları konuşuyoruz.",
    challenge:
      "İsteğe bağlı: küçük / orta / büyük için birer düzen kuralı yaz.",
  },
  "ux-ileri-6": {
    warmup:
      "Kapıyı boyamak yetmez; tutamak ve zil de çalışmalı. Bu derste kodda erişilebilirliği konuşuyoruz.",
    challenge:
      "İsteğe bağlı: semantik etiket + erişilebilir ad + klavye için üç satır yaz.",
  },
  "ux-ileri-7": {
    warmup:
      "Laboratuvar test odasında senaryo yokken «denedik» tutanak değildir. Bu derste kullanılabilirlik testi planını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç görev + başarı ölçütü + katılımcı sayısı yaz.",
  },
  "ux-ileri-8": {
    warmup:
      "Alkışla maç skoru tutmak gibi; beğeni Sistem Kullanılabilirlik Ölçeği yerine geçmez. Bu derste görev metrikleri ve Sistem Kullanılabilirlik Ölçeği’ni konuşuyoruz.",
    challenge:
      "İsteğe bağlı: görev süresi + hata + ölçek satırı yaz.",
  },
  "ux-ileri-9": {
    warmup:
      "Terzi prova yapmadan «tam oturdu» demek gibi; fark listesi yoksa kalite güvencesi yoktur. Bu derste tasarım kalite güvencesini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç görsel fark + kabul / ret gerekçesi yaz.",
  },
  "ux-ileri-10": {
    warmup:
      "El teslimi, kod ve test aynı masada bitmeden ürün sevk edilmez. Bu derste el teslimi + erişilebilir kod + kullanılabilirlik kapanış laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: el teslimi → stil / React → erişilebilirlik → ölçek kontrol listesini yaz.",
  },
  "w3-temel-1": {
    warmup:
      "Mahalle bakkal defterinin tek kopyada durması ile her dükkânın aynı sayfayı tutması farklıdır; «blockchain» afişi tek Postgres’e yapıştırılmaz. Bu derste dağıtık defter, blok ve özet zincirini konuşuyoruz — ortak noter defterinde her sayfaya önceki mührün özeti yazmak gibi.",
    challenge:
      "İsteğe bağlı: Tek sunucu + «decentralized» iddiasını reddeden tek cümle yaz.",
  },
  "w3-temel-2": {
    warmup:
      "Kargo mührü kırıksa içerik şüpheli sayılır; özet fonksiyonu ve dijital imza da zincirde aynı disiplindir. Bu derste özet, dijital imza ve Merkle ağacını konuşuyoruz — anahtarı sohbete yapıştırmamak gibi.",
    challenge:
      "İsteğe bağlı: Tohum cümlesini Slack’e yapıştırmadan önce hangi üç risk satırı eksik kalır?",
  },
  "w3-temel-3": {
    warmup:
      "Otoban gişesinde yol açık olsa da ücret ödemeden geçiş yazılmaz; gas ve işlem sırası aynı kapıdır. Bu derste cüzdan, gas, işlem sırası ve Ethereum Sanal Makinesi’ni konuşuyoruz — yanlış zincire imza atmamak gibi.",
    challenge:
      "İsteğe bağlı: zincir kimliği kontrolsüz sendTransaction riskini tek cümlede yaz.",
  },
  "w3-temel-4": {
    warmup:
      "Apartman yönetmelik tarihi bilinmeden imza tartışılmaz; pragma sürüm bağı da öyledir. Bu derste Solidity sözleşme iskeletini konuşuyoruz — uyarı yutmadan derlemek gibi.",
    challenge:
      "İsteğe bağlı: pragma ^x.y.z + contract + constructor iskeletini üç satırda yaz.",
  },
  "w3-temel-5": {
    warmup:
      "Kasa defteri ile tezgâh üstü not farklıdır; saklama kalıcı, bellek geçicidir. Bu derste tipler, saklama / bellek ve eşlemeyi konuşuyoruz — notu kasaya yazmadan kapanış yapılmaz.",
    challenge:
      "İsteğe bağlı: eşlemede «kayıt yok» ile «bakiye 0» ayrımını tek cümlede yaz.",
  },
  "w3-temel-6": {
    warmup:
      "Kapı kilidi ile zil kaydı ayrıdır; olay çaldı diye kasa açılmaz. Bu derste fonksiyon görünürlüğü, view / pure ve olayı konuşuyoruz — her fonksiyonu public bırakmamak gibi.",
    challenge:
      "İsteğe bağlı: public withdraw + kimlik yok senaryosunu tek cümlede reddet.",
  },
  "w3-temel-7": {
    warmup:
      "İlk anahtar tesliminde kilit, yedek ve kayıt olmadan kapı sahibi olunmaz; SimpleStorage laboratuvarı da set / get / olay / require birleştirir. Bu derste SimpleStorage Solidity laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Laboratuvar tesliminde kaynak + uygulama ikili arayüzü özeti + işlem özeti kontrol listesini yaz.",
  },
  "w3-orta-1": {
    warmup:
      "Ortak bina yönetmeliği ile kapı kartı kuralı ayrıdır; değiştirici ve kütüphane tekrarı tek kaynakta toplar. Bu derste kalıtım, değiştirici ve kütüphaneyi konuşuyoruz — iki Ownable çakışmasını kesmek gibi.",
    challenge:
      "İsteğe bağlı: onlyOwner değiştirici iskeletini ve neden tek erişim katmanı gerektiğini yaz.",
  },
  "w3-orta-2": {
    warmup:
      "Boş çek vermek tüm hesabı açar; sınırsız onay aynı tuzağı kurar. Bu derste Ethereum Yorum Talebi yirmi jeton standardını konuşuyoruz — transfer / approve olayları ile.",
    challenge:
      "İsteğe bağlı: transfer false döndü yutulunca ne kırılır — tek cümle yaz.",
  },
  "w3-orta-3": {
    warmup:
      "Tapu kaydı ev değildir; JPEG dosyası değiştirilemez jeton değildir, sahiplik sicil zincirdedir. Bu derste Ethereum Yorum Talebi yedi yüz yirmi bir standardını konuşuyoruz — safeTransferFrom ile kör transferi kesmek gibi.",
    challenge:
      "İsteğe bağlı: transfer ile safeTransferFrom farkını tek cümlede yaz.",
  },
  "w3-orta-4": {
    warmup:
      "Kasa kapısı, kamera ve imza yetkisi aynı kişide toplanmaz; tehdit modeli aynı ayrımı ister. Bu derste akıllı sözleşme güvenlik modelini konuşuyoruz — «denetim sonra» ana ağ iddiasını kesmek gibi.",
    challenge:
      "İsteğe bağlı: güven sınırı için güvenilir / güvenilmez birer örnek yaz.",
  },
  "w3-orta-5": {
    warmup:
      "Gişede para vermeden fiş basmak gibidir; yeniden giriş çağrı öncesi etki sırasını bozar. Bu derste yeniden giriş ve Kontrol-Etki-Etkileşim’i konuşuyoruz.",
    challenge:
      "İsteğe bağlı: withdraw’da etkiler önce, etkileşim sonra kuralını iki satırda yaz.",
  },
  "w3-orta-6": {
    warmup:
      "Tek tezgahtan «piyasa fiyatı» almak manipüle edilebilir; anlık fiyat kahini teminat olmaz. Bu derste erişim denetimi, taşma ve fiyat kahini risklerini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tx.origin ile kimlik neden yasak — tek cümle yaz.",
  },
  "w3-orta-7": {
    warmup:
      "Yangın tatbikatı alarm hiç çalmadıysa sistem kanıtlanmamış sayılır; «Remix’te bir kez» denetim değildir. Bu derste Foundry / Hardhat test disiplinini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: mutlu yol dışında bir geri alma test senaryosu yaz.",
  },
  "w3-orta-8": {
    warmup:
      "Uçak kalkış öncesi kontrol listesi gibidir; OpenZeppelin içe aktarmak liste yerine geçmez. Bu derste güvenli Ethereum Yorum Talebi yirmi ve güvenlik kontrol listesi laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kontrol-Etki-Etkileşim + erişim + yeniden giriş testi + kontrol listesi dörtlüsünü yaz.",
  },
  "w3-ileri-1": {
    warmup:
      "Bankamatik ekranı bakiyeyi uyduramaz; arayüz önbelleği zincir Tek Gerçek Kaynağı değildir. Bu derste Dağıtık Uygulama mimarisi ve uygulama ikili arayüzü sınırını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: zincir kimliği + uzak yordam + sözleşme adresi yapılandırma üçlüsünü yaz.",
  },
  "w3-ileri-2": {
    warmup:
      "Noter imza atar, kütüphane fişi atmaz; imzacı yokken yazma hata anında kapalı kalır. Bu derste Ethers.js sağlayıcı, imzacı ve Contract’ı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kullanıcı reddi ile uzak yordam geri alımı ayrımını tek cümlede yaz.",
  },
  "w3-ileri-3": {
    warmup:
      "İki dilde aynı sözleşmenin çevirisinde madde kayarsa anlam kayar; uygulama ikili arayüzü sapması sessiz felakettir. Bu derste Web3.js karşılaştırması ve uygulama ikili arayüzü disiplinini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: uygulama ikili arayüzünü derleme çıktısından içe aktarma kuralını yaz.",
  },
  "w3-ileri-4": {
    warmup:
      "Kasa fişi muhasebe defterinin yerine geçmez ama kanıttır; olay arayüzün kulağıdır. Bu derste olay dinleme ve indekslemeyi konuşuyoruz — sıfır onaylı kredi açmamak gibi.",
    challenge:
      "İsteğe bağlı: N onay beklenmeden «kesin ödeme» dememe gerekçesini yaz.",
  },
  "w3-ileri-5": {
    warmup:
      "Kapı zili çalmak satış değildir; cüzdanı bağla harcama izni değildir. Bu derste MetaMask / cüzdan bağlantısı ve izin kullanıcı deneyimini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sınırsız onay yerine açık miktar + red yolu kuralını yaz.",
  },
  "w3-ileri-6": {
    warmup:
      "İki kovalı terazide bir kovadan alınca diğeri yükselir; Otomatik Piyasa Yapıcı sabit çarpımı aynı matematiği taşır. Bu derste Otomatik Piyasa Yapıcı ve likidite havuzunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: minOut=0 takas riskini tek cümlede reddet.",
  },
  "w3-ileri-7": {
    warmup:
      "Rehinli kredide fiyat düşünce rehin satılır; sağlık faktörü kırmızıysa pozisyon yaşamaz. Bu derste borç verme, teminat ve tasfiye modelini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yalnız yıllık yüzde gösterip tasfiyeyi gizlemenin riskini yaz.",
  },
  "w3-ileri-8": {
    warmup:
      "Üç gün önceki kur tabelasıyla satış yapılmaz; bayat fiyat kahini aynı hatadır. Bu derste fiyat kahini ve fiyat beslemesi mimarisini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kalp atışı aşımında bayat geri alımı kuralını tek cümlede yaz.",
  },
  "w3-ileri-9": {
    warmup:
      "Kargo «yolda» iken «teslim» demek gibidir; beklerken Takas tamam bildirimi yalandır. Bu derste hata anında kapalı Dağıtık Uygulama hata yüzeyini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: idle → signing → pending → confirmed | reverted durumlarını sırala.",
  },
  "w3-ileri-10": {
    warmup:
      "Uçuş simülatörü gerçek yolcu olmadan kontrol listesi biter; ana ağ anahtarı kapanış sayılmaz. Bu derste mini Dağıtık Uygulama ve Merkeziyetsiz Finans iskelet kapanış laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yapılandırma → bağlan → oku / yaz → olay → hata anında kapalı arayüz kontrol listesini yaz.",
  },
  "ex-temel-1": {
    warmup:
      "Bakkal veresiye defterinde alışveriş ile fişi aynı sayfaya karıştırmak gibidir; sonra hangi satır doğru bilinmez. Bu derste Excel çalışma kitabı, sayfa ve adlandırma disiplinini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: ham / hesap / sunum için üç sayfa adı ve tek Tek Gerçek Kaynak cümlesi yaz.",
  },
  "ex-temel-2": {
    warmup:
      "Bakkal tezgâhında fişi parmakla saymak yerine kasa bandına yazmak gibidir; fiş değişince yeniden basarsın. Bu derste SUM, IF ve göreli referansı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: elle basılmış toplamı reddeden tek cümle ve bir SUM örneği yaz.",
  },
  "ex-temel-3": {
    warmup:
      "Fırın tabelasındaki tek fiyata bakmak, her poşete fiyat yazmaktan iyidir. Bu derste mutlak referans ($) ve Excel Tablo yapısını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kur hücresini $ ile kilitleyen formül satırını yaz.",
  },
  "ex-temel-4": {
    warmup:
      "Bakkal reyonlarını raflara göre saymak, poşetleri karıştırmadan kategori toplamı çıkarır. Bu derste Özet Tablo, gruplama ve dilimleyiciyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir Özet Tablo için satır boyutu + değer ölçüsü çiftini yaz.",
  },
  "ex-temel-5": {
    warmup:
      "Tartının sıfırını kaydırıp «kilo aldın» demek gibidir; ibre yalan söyler. Bu derste grafik seçimi, dürüst eksen ve birim etiketini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: manipülatif 99–103 eksenini reddeden tek cümle yaz.",
  },
  "ex-temel-6": {
    warmup:
      "Pazardan gelen sebzeyi yıkamadan yemeğe atmamak gibidir; kirli veri Özet Tablo’yu zehirler. Bu derste veri temizleme + Özet Tablo + grafik laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: önce/sonra satır sayısı ve üç temizleme kuralı yaz.",
  },
  "ex-orta-1": {
    warmup:
      "Otomatik kargo bant sisteminde poşetleri ayıklamadan raf yapmak gibidir; etiket yoksa stok yalan söyler. Bu derste Power Query alma, birleştirme ve Veri Dönüştürme ve Yükleme İşlemini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Applied Steps’ten üç adım adı yaz (ör. ChangeType, Merge).",
  },
  "ex-orta-2": {
    warmup:
      "Fişe ürün kataloğunun tamamını yapıştırmak poşeti şişirir; olay tablosu ile boyut ayrıdır. Bu derste yıldız şema ve veri modelini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir olay tablosu tane cümlesi ve iki boyut adı yaz.",
  },
  "ex-orta-3": {
    warmup:
      "Terazi tarifini raflara değil tartım anına yazmak gibidir; ölçü bağlama göre hesaplanır. Bu derste Veri Çözümleme İfadeleri, SUM ve CALCULATE’i konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir ölçü adı + SUM ifadesi taslağı yaz.",
  },
  "ex-orta-4": {
    warmup:
      "Fabrika gösterge panosunu afişle kaplamak gözü yorar; tek mesaj kaybolur. Bu derste Power BI kart, matris ve görsel etkileşimi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç Temel Performans Göstergesi kartı ve birimlerini listele.",
  },
  "ex-orta-5": {
    warmup:
      "İki anahtarlı kapıya aynı anahtarı çoğaltmak gibidir; kim girdi belli olmaz. Bu derste 1:* ilişkiler ve çapraz filtre yönünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir many:1 ilişkiyi from→to olarak yaz.",
  },
  "ex-orta-6": {
    warmup:
      "Noter tasdik mühürü gibidir: şube müdürü yalnız kendi kasa defterini görür. Bu derste Satır Düzeyi Güvenlik girişini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir rol adı + filtre cümlesi taslağı yaz.",
  },
  "ex-orta-7": {
    warmup:
      "Vitrine dünkü ekmeği «taze» yazmak gibidir; yenileme kırmızıyken bugün demek yalandır. Bu derste çalışma alanı, yayın ve planlı yenilemeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kişisel ağ geçidini üretim saymama gerekçesini tek cümlede yaz.",
  },
  "ex-orta-8": {
    warmup:
      "Fabrika mutfağından servise kadar adımları yazmak gibidir; yalnız sunum fotoğrafı yetmez. Bu derste sorgudan yönetici gösterge panosu laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sorgu → model → Veri Çözümleme İfadeleri → Satır Düzeyi Güvenlik → yayın kontrol listesini beş madde yaz.",
  },
  "ex-ileri-1": {
    warmup:
      "Otomatik kargo bant sisteminde her sayfayı tek tek basmak yerine toplu iş vermek gibidir. Bu derste dizi formülü ve dinamik aralığı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sürükleme yerine dizi formülü kullanan bir örnek satır yaz.",
  },
  "ex-ileri-2": {
    warmup:
      "Arşiv indeksinden «şu tarih, şu şehir» diye dosya istemek gibidir; tüm klasörü masaya dökmezsin. Bu derste sorgulama işlevi ile seç-süz-grupla’yı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: boş sorgulama sonucunu sıfır satış sanmama kuralını yaz.",
  },
  "ex-ileri-3": {
    warmup:
      "Noter tasdik mühürü gibidir: depo rafına rastgele kutu yazmak yerine barkod okutmak. Bu derste veri doğrulama, koruma ve adlandırılmış aralığı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: «bağlantısı olan herkes düzenlesin» riskini tek cümlede yaz.",
  },
  "ex-ileri-4": {
    warmup:
      "Makro otomasyon çarkı gibidir: menü düğmesi programı başlatır, her seferinde hortum takılmaz. Bu derste Uygulama Senaryosu fonksiyon, kayıt defteri ve özel menüyü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: onOpen menü + bir fonksiyon adı iskeleti yaz.",
  },
  "ex-ileri-5": {
    warmup:
      "Çalar saat ile kapı zilini aynı koliye bağlarsan çift düşer. Bu derste zaman ve olay tetikleyicilerini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tek tetikleyici sahibi kuralını ve bir zamana bağlı saat yaz.",
  },
  "ex-ileri-6": {
    warmup:
      "Kargo takip numarası aranmadan «geldi» demek gibidir; dört yüz dört varken yeşil basılmaz. Bu derste UrlFetchApp, durum kodu ve dürüst hatayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Hipermetin Aktarım Protokolü iki yüz değilken ne yapılacağını tek cümlede yaz.",
  },
  "ex-ileri-7": {
    warmup:
      "Otomatik kargo bant sistemi gibidir: sipariş → mutfak → servis → fiş; servis atlanıp fiş kesilmez. Bu derste uçtan uca otomasyon iş akışını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: eşgüçlü anahtar ile kör yeniden deneme farkını yaz.",
  },
  "ex-ileri-8": {
    warmup:
      "Ev anahtarını kapıya bantlamak gibidir; komşu güvenilir olsa da kapı açık sayılır. Bu derste hata anında kapalı sırlar ve Özellikler Hizmetini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Uygulama Programlama Arayüzü anahtarını hücrede tutmama + Özellikler kuralını yaz.",
  },
  "ex-ileri-9": {
    warmup:
      "Asansör sıkışınca kapıyı zorlamak yerine acil düğme ve kayıt gibidir. Bu derste try/catch, yeniden deneme ve izlenebilir kaydı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: boş catch + OK bildirimini reddeden kuralı yaz.",
  },
  "ex-ileri-10": {
    warmup:
      "Makro otomasyon çarkının prova gecesi gibidir: ışık, ses, yedek; seyirci (üretim anahtarı) yoktur. Bu derste E-Tablolar + Uygulama Senaryosu otomasyon kapanış çalışması laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: girdi → sorgulama → senaryo → Özellikler → kayıt + ikinci koşu testi kontrol listesini yaz.",
  },
  "mnt-temel-1": {
    warmup:
      "Gazete bayii «her manşeti basarım» deyince kim durur, kim geçer; niş vaat ister. Bu derste niş seçimi ve kanal konumlandırmayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kim + sorun + tek cümlelik kanal vaadi yaz.",
  },
  "mnt-temel-2": {
    warmup:
      "Film fragmanı olmadan salona girmek gibi; senaryo iskeletsiz video dağılır. Bu derste senaryo iskeleti — kanca, gövde, eyleme çağrıyı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kanca / üç gövde noktası / tek eyleme çağrı yaz.",
  },
  "mnt-temel-3": {
    warmup:
      "Vitrinde taze balık yazıp dondurulmuş satmak gibi; yalan küçük resim güven yakar. Bu derste küçük resim ve tıklama dürüstlüğünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç-beş kelimelik dürüst kapak metni + vaat eşlemesi yaz.",
  },
  "mnt-temel-4": {
    warmup:
      "Gazete künyesine her manşeti yığıp haberi mutfağa koymak gibidir; spam etiket arama motoru optimizasyonu değildir. Bu derste YouTube Arama Motoru Optimizasyonu — başlık, açıklama, etiketi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: başlık + açıklama ilk satır + beş ilgili etiket yaz.",
  },
  "mnt-temel-5": {
    warmup:
      "Mağaza kapısından girip hemen çıkanı «başarı» saymak gibidir; tıklama oranı yetmez, ortalama izlenme süresi ister. Bu derste analitik — tıklama oranı, ortalama izlenme süresi, tutmayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tıklama oranı / ortalama izlenme süresi / tutma tanımları + bir düşüş hipotezi yaz.",
  },
  "mnt-temel-6": {
    warmup:
      "Restoran açılışında yalnız neon yakmak yetmez; menü, vitrin ve kasa birlikte. Bu derste kanal büyüme paketi laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: niş→senaryo→küçük resim→arama motoru optimizasyonu→metrik kontrol listesini yaz.",
  },
  "mnt-orta-1": {
    warmup:
      "Makas-kurgu masasına bütün ruloları yığıp «sonra bakarız» demek montaj değildir; dağınık medya ile kurgu da öyle. Bu derste kurgu iş akışı ve zaman çizelgesi disiplinini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: içe aktarma→adlandırma→kaba/ince kesim sırasını yaz.",
  },
  "mnt-orta-2": {
    warmup:
      "Her cümlede el çırpmak gibi; anlamsız kesme temposu öldürür. Bu derste kesim, tempo ve destek görüntüsünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir sahne tempo notu + destek görüntüsü gerekçesi yaz.",
  },
  "mnt-orta-3": {
    warmup:
      "Düğünde lisanssız şarkı coşku getirir, sonra kapı açılır; müzik hakkı da öyle. Bu derste ses, müzik hakları ve altyazıyı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: diyalog önceliği + lisans kaynağı + altyazı düzeltme kuralı yaz.",
  },
  "mnt-orta-4": {
    warmup:
      "Çayı her beş dakikada boşaltıp yeniden koymak gibi; ritimsiz kısa dikey video spam demlenmez. Bu derste kısa dikey video formatı ve yayın ritmini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: dokuz’a on altı güvenli alan + haftalık yayın ritmi taslağı yaz.",
  },
  "mnt-orta-5": {
    warmup:
      "Film fragmanı jenerikle açılırsa kapı kapanır; kısa dikey video kancası da öyle. Bu derste kanca — ilk üç saniye disiplinini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sıfır-üç saniye kanca metni + selamsız varyant yaz.",
  },
  "mnt-orta-6": {
    warmup:
      "Kıyafeti yanlış beden kutusuna koymak gibi; yanlış en-boy dışa aktarma kırılır. Bu derste renk, dışa aktarma ve platform belirtimini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: hedef platform için çözünürlük / kare hızı / kodlayıcı satırı yaz.",
  },
  "mnt-orta-7": {
    warmup:
      "Haftalık yemek hazırlığı olmadan her akşam market koşusu sürdürülemez; içerik toplu üretimi de öyle. Bu derste yayın takvimi ve toplu üretimi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yedi günlük tema takvimi + toplu üretim günü yaz.",
  },
  "mnt-orta-8": {
    warmup:
      "Kısa sipariş mutfağında fiş, hazırlık ve servis süresi birlikte; yalnız tabak fotoğrafı yetmez. Bu derste kısa dikey video prodüksiyon laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kanca + kurgu + altyazı + dokuz’a on altı + yayın ritmi kontrol listesini yaz.",
  },
  "mnt-ileri-1": {
    warmup:
      "Kalabalık tezgâha bakıp aynı malı almak kâr kanıtı değildir; talep doğrulanır. Bu derste ürün araştırması ve talep doğrulamayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sinyal + rakip boşluğu + marj hipotezi yaz.",
  },
  "mnt-ileri-2": {
    warmup:
      "Toptancıdan görmeden çuval almak gibi; numunesiz tedarik kumardır. Bu derste tedarikçi seçimi ve ilan dürüstlüğünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: numune / hizmet seviyesi kontrol listesi + dürüst ilan kuralı yaz.",
  },
  "mnt-ileri-3": {
    warmup:
      "Etikette el yapımı yazıp fabrika barkodu basmak gibi; yalan ürün detay sayfası güven yakar. Bu derste ürün detay sayfası ve dönüşüm kopyasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: fayda + belirtim + dürüst kargo hizmet seviyesi satırı yaz.",
  },
  "mnt-ileri-4": {
    warmup:
      "Üç kapıdan giren dükkânda sayaç yoksa «vitrin sattı» iddiası boştur; atıf ister. Bu derste reklam, trafik ve atfı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kampanya izleme parametresi + üç olay adı + kör harcama yasağı yaz.",
  },
  "mnt-ileri-5": {
    warmup:
      "Kasa yazıcısı bozukken «müşteri istemedi» demek gibi; kırık ödeme reklamı yakar. Bu derste huni ve ödeme operasyonunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: huni adımları + ödeme hatası koruma rayı yaz.",
  },
  "mnt-ileri-6": {
    warmup:
      "Yemek «yolda» iken soğuk gelince puan düşer; takipsiz kargo da öyle. Bu derste sipariş karşılama, depo operasyonu ve müşteri hizmetini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: hizmet seviyesi + takip zorunluluğu + iade yanıt süresi yaz.",
  },
  "mnt-ileri-7": {
    warmup:
      "Lokantada ciroyu sayıp kirayı unutmak gibi; ciro kâr değildir. Bu derste birim ekonomi — satılan malın maliyeti, müşteri edinim maliyeti, marjı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: ortalama sipariş değeri / satılan malın maliyeti / müşteri edinim maliyeti / katkı satırlı mini tablo yaz.",
  },
  "mnt-ileri-8": {
    warmup:
      "Emniyet kemeri ceza yemeden önce takılır; «hızlıyız» uyumu ertelemez. Bu derste yasal ve vergi dürüstlüğünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: fatura / iade / iddia kontrol listesi (hukuk tavsiyesi değil) yaz.",
  },
  "mnt-ileri-9": {
    warmup:
      "Lotarya biletini yatırım diye satmak gibi; garanti gelir vaadi tuzaktır. Bu derste sahte gelir vaadi — hata anında kapalı gelir iddiasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç yasak gelir cümlesi + bir izinli süreç satırı yaz.",
  },
  "mnt-ileri-10": {
    warmup:
      "Mağaza açılışında yalnız vitrin ışığı yetmez; ruhsat, kasa, depo ve fiyat birlikte. Bu derste e-ticaret operasyon kapanış laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: doğrulama→hizmet seviyesi→marj→gelir-vaadi yasağı kontrol listesini yaz.",
  },
  "mkt-temel-1": {
    warmup:
      "Kasada barkod okunmadan «satış oldu» denmez; piksel yoksa Reklam Harcamasının Geri Dönüşü de konuşulmaz. Bu derste Meta Piksel, Olay Yöneticisi ve olay sözlüğünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Sayfa Görüntüleme → Satın Alma olay zincirini dört satırda yaz.",
  },
  "mkt-temel-2": {
    warmup:
      "Dükkân vitrinini, reyonu ve fiyat etiketini tek rafa yığmak kaos çıkarır; Kampanya, Reklam Seti ve Reklam da öyle. Bu derste kampanya yapısını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir brif için kampanya → reklam seti → reklam ağacını üç satırda yaz.",
  },
  "mkt-temel-3": {
    warmup:
      "Caddede aynı broşürü komşuya, eski müşteriye ve rastgele sokağa vermek gibidir; kim tepki verdi bilinmez. Bu derste ilgi, benzer kitle ve yeniden hedeflemeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: boş listeden benzer kitleyi reddeden tek cümle yaz.",
  },
  "mkt-temel-4": {
    warmup:
      "Pazarda iki tezgâh aynı elmayı farklı tabelayla satar; hangisi tuttu bilinmeden «tabela değişti» yetmez. Bu derste kreatif ikili karşılaştırma disiplinini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tek değişkenli ikili karşılaştırma spekini üç satırda yaz.",
  },
  "mkt-temel-5": {
    warmup:
      "Tezgâh kirası (bütçe) ile «şu fiyattan sat» (teklif) ayrıdır; müşteri yokken tavan boş konuşmadır. Bu derste teklif ve bütçe kontrolünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Satın Alma yokken Hedef Reklam Harcamasının Geri Dönüşü açmamayı tek cümlede gerekçele.",
  },
  "mkt-temel-6": {
    warmup:
      "Market kasa raporunda fiş, iade ve dönem olmadan «iyi gün» denmez. Bu derste Meta Reklamları performans raporu laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: harcama + Edinme Başına Maliyet + paydasız geri dönüş reddi checklist’ini yaz.",
  },
  "mkt-orta-1": {
    warmup:
      "Gazete ilanı, otobüs afişi ve kapı zili satışını aynı «reklam» saymak kanalları karıştırır. Bu derste Google Reklamları kampanya türleri haritasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Arama / Görüntülü / YouTube / Performans Maksimumu için birer huni notu yaz.",
  },
  "mkt-orta-2": {
    warmup:
      "«Elma» diye bağırınca «armut» müşterisini de çekmek tezgâhı bozar; olumsuz kelime aynı kapıdır. Bu derste anahtar kelime ve eşlemeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: beş olumsuz sorgu + gerekçe satırı yaz.",
  },
  "mkt-orta-3": {
    warmup:
      "Menü güzel, yemek gelmezse puan düşer; reklam–açılış hizası Kalite Skoru’dur. Bu derste Kalite Skoru, Duyarlı Arama Ağı Reklamı ve uzantıları konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kalite Skoru üç bileşenini ve bir açılış uyumsuzluğunu yaz.",
  },
  "mkt-orta-4": {
    warmup:
      "Afişi her duvara yapıştırmak itibarı düşürebilir; Görüntülü ağda yerleşim ve marka güvenliği şarttır. Bu derste Görüntülü ağı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: frekans tavanı + üç hariç tutma kategorisi yaz.",
  },
  "mkt-orta-5": {
    warmup:
      "Televizyon reklamında ilk saniye kapı zili gibidir; kimse bakmazsa mesaj yetmez. Bu derste YouTube formatı ve huni hizasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: beş saniye kanca + hedef–format hizası cümlesi yaz.",
  },
  "mkt-orta-6": {
    warmup:
      "İki kasada aynı fişi iki kez yazmak ciroyu şişirir; çift sayım Reklamlarda aynı tuzağı kurar. Bu derste etiket, açık rıza ve atıfı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: açık rıza reddi + test sipariş filtresi kuralını yaz.",
  },
  "mkt-orta-7": {
    warmup:
      "Reyona her saat yeni fiyat yazmak ritmi bozar; agresif Hedef Reklam Harcamasının Geri Dönüşü veri eşiği olmadan aynıdır. Bu derste bütçe ve teklif disiplinini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: haftalık dönüşüm eşiği + hedef geri dönüş kapı cümlesi yaz.",
  },
  "mkt-orta-8": {
    warmup:
      "Gazete ve afiş kampanyası tek kasada birleşir ama kanal ayrımı silinmez. Bu derste Google Reklamları Arama ve Görüntülü laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Arama + Görüntülü + etiket + paydalı rapor checklist’ini yaz.",
  },
  "mkt-ileri-1": {
    warmup:
      "«En iyi kahve makinesi» ile «yedek parça» aynı rafla cevaplanmaz; niyet Arama Motoru Optimizasyonu’nun kapısıdır. Bu derste arama niyeti ve sonuç sayfası okumayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir sorguyu niyet türüne etiketleyip format öner.",
  },
  "mkt-ileri-2": {
    warmup:
      "Pazar listesinde her sebzeyi yazmak menü ve bütçe yoksa süs olur; kümesiz kelime listesi de öyle. Bu derste anahtar kelime fırsat haritasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: 6 kelimeyi 2 kümeye ayırıp P1 seç.",
  },
  "mkt-ileri-3": {
    warmup:
      "Vitrin tabelası ile içerideki ürün uyumsuzsa müşteri çıkar; başlık–gövde hizası sayfa içidir. Bu derste başlık, içerik ve dahili bağı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Başlık + birinci başlık + iki dahili bağ hedefi yaz.",
  },
  "mkt-ileri-4": {
    warmup:
      "Dükkân tabelası açık, kapı kilitliyse vitrin süs boşa gider; dizine kapalı adres aynı kapıdır. Bu derste tarama, dizin ve Temel Web Canlılıkları’nı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üretimde dizin yasağı riskini tek cümlede reddet.",
  },
  "mkt-ileri-5": {
    warmup:
      "Reçetesiz her gün farklı yemek açmak fireyi artırır; brifsiz içerik yağmuru da öyle. Bu derste içerik sistemi ve yeniden kullanımı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: niyet + eylem çağrısı + başarı metriği brif satırlarını yaz.",
  },
  "mkt-ileri-6": {
    warmup:
      "Son satıcıya tüm komisyonu vermek vitrini unutturur; son tıklama körlüğü de öyle. Bu derste analitik huni ve atıf dürüstlüğünü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç adımlı huni + payda satırı yaz.",
  },
  "mkt-ileri-7": {
    warmup:
      "İki menüyü aynı masaya karışık sunup «hangisi tuttu» demek deney değildir. Bu derste hipotez, ikili karşılaştırma ve koruma rayını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: birincil metrik + bir koruma rayı + öldürme anahtarı kuralı yaz.",
  },
  "mkt-ileri-8": {
    warmup:
      "Yemek kötüyse afiş yetmez; aktivasyon kırıkken tavsiye boşa akar. Bu derste büyüme çarkını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: edin → etkinleştir → tavsiye döngüsünü üç satırda çiz.",
  },
  "mkt-ileri-9": {
    warmup:
      "Brüt ciroyu yazıp kirayı unutmak kârı yalandırır; paydasız Reklam Harcamasının Geri Dönüşü aynı tuzağı kurar. Bu derste geri dönüş ve edinim maliyeti ölçüm kapısını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: net geri dönüş formülü + iade notunu yaz.",
  },
  "mkt-ileri-10": {
    warmup:
      "Dükkân açılışında tabela, stok, kasa ve tavsiye birlikte checklist ister. Bu derste Arama Motoru Optimizasyonu, içerik ve büyüme kapanış laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yedi kapılı kapanış checklist’ini yaz.",
  },
  "pd-temel-1": {
    warmup:
      "Pazarda tartıyı bozmak ile ürünü dürüstçe anlatmak farklıdır; «garantili ikna» tartı hilesidir. Bu derste ikna etiğini — rıza, şeffaflık ve hata anında kapalı — konuşuyoruz.",
    challenge:
      "İsteğe bağlı: rıza + şeffaflık + çıkar kontrol listesini üç satır yaz.",
  },
  "pd-temel-2": {
    warmup:
      "Köprü iskeleti olmadan tahta çakmak geçit değildir; amaç, kanıt ve çağrı kiriş gibi durur. Bu derste mesaj iskeletini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tek amaç + iki kanıt + bir çağrı cümlesi yaz.",
  },
  "pd-temel-3": {
    warmup:
      "Aynı yemek tarifini çocuğa ve şefe anlatmak gibidir; ölçü değişir, yalan değişmez. Bu derste dinleyici haritası ve ortak dili konuşuyoruz.",
    challenge:
      "İsteğe bağlı: rol / ön bilgi / itiraz yüzeyi üçlüsünü doldur.",
  },
  "pd-temel-4": {
    warmup:
      "Sahne perdesi kapalıyken alkış oyunun yerini tutmaz; varlık okunabilirliktir, ego şovu değil. Bu derste ses, tempo ve beden varlığını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: doksan saniye prova için ses / tempo / durak notunu yaz.",
  },
  "pd-temel-5": {
    warmup:
      "Terzi «dar mı?» diye sorar; müşteri hayır derse kumaş zorlanmaz. Bu derste soru, itiraz ve netliği konuşuyoruz — sahte aciliyet yok.",
    challenge:
      "İsteğe bağlı: bir itiraz için özet → ayır → seçim bırak üçlüsünü yaz.",
  },
  "pd-temel-6": {
    warmup:
      "Düğün konuşması kim dinliyor, ne isteniyor yazılmadan sahneye çıkılmaz. Bu derste beş dakikalık etik ikna sunumu laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: etik + iskelet + harita + itiraz cevabı kontrol listesini yaz.",
  },
  "pd-orta-1": {
    warmup:
      "Fırtına pusulası olmadan «ben sakinim» demek rota değildir; duygu adlandırılmadan yönetilmez. Bu derste duygusal zekâ haritası ve öz farkındalığı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: olay → duygu → düşünce → dürtü satırı yaz.",
  },
  "pd-orta-2": {
    warmup:
      "Komşunun evindeki gürültüyü dinlemek empatidir; kapıyı zorla açmak değildir. Bu derste empati ve perspektif almayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir yansıtma cümlesi + etiketli varsayım yaz.",
  },
  "pd-orta-3": {
    warmup:
      "Hakemin faulü «kötü oyuncu» diye değil pozisyon + hareket + sonuç diye yazılır. Bu derste Durum-Davranış-Etki geri bildirimi ve netliği konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Durum / Davranış / Etki / istek dört satırını doldur.",
  },
  "pd-orta-4": {
    warmup:
      "Yangın vanası kapalıyken odaya dalmak söndürme değildir. Bu derste zor konuşma hazırlığını konuşuyoruz — asansör baskısı yok.",
    challenge:
      "İsteğe bağlı: amaç + kanıt + hayır-sonrası plan kartını yaz.",
  },
  "pd-orta-5": {
    warmup:
      "İki kardeş «ben pencereyi istiyorum» der; asıl çıkar ışık veya sessizlik olabilir. Bu derste çatışmada çıkar ve pozisyonu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: iki taraf için pozisyon ve çıkar satırı yaz.",
  },
  "pd-orta-6": {
    warmup:
      "Kaptan rota anlatır; mürettebat soru soramazsa rota düzelmez. Bu derste liderlik iletişiminde yön ve psikolojik güvenliği konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yön cümlesi + bir güvenlik davranış örneği yaz.",
  },
  "pd-orta-7": {
    warmup:
      "Sofrada korku varsa yemek yenir ama konu konuşulmaz. Bu derste takım iklimi ve psikolojik güvenlik sinyallerini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç iklim sinyali listele; sahte yeşil geriye bakışı reddet.",
  },
  "pd-orta-8": {
    warmup:
      "Yangın tatbikatında alarm, çıkış, toplanma afişle bitmez. Bu derste geri bildirim ve çatışma kontrol listesi laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Durum-Davranış-Etki + hazırlık kartı + çıkar haritası üçlüsünü yaz.",
  },
  "pd-ileri-1": {
    warmup:
      "Mutfak bıçağı yemek de keser zarar da; Nöro-Dilsel Programlama’da niyet ve rıza ayırır. Bu derste etik girişi konuşuyoruz — manipülasyon kültü yok.",
    challenge:
      "İsteğe bağlı: rıza / şeffaflık / zarar vermeme sınır kartını yaz.",
  },
  "pd-ileri-2": {
    warmup:
      "Evi su basmışken «şükret» demek yardım değil gerçek inkârıdır. Bu derste yeniden çerçeveleme ve etik sınırları konuşuyoruz.",
    challenge:
      "İsteğe bağlı: inkârsız bir yeniden çerçeve + etik test üçlüsü yaz.",
  },
  "pd-ileri-3": {
    warmup:
      "«Herkes biliyor» yerine «kim, ne zaman?» demek netliktir; sorgu odası değildir. Bu derste dil kalıpları ve netleştirmeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç netleştirme sorusu yaz; örtük onayı reddet.",
  },
  "pd-ileri-4": {
    warmup:
      "Maç öncesi ısınma rakibi uyuşturmak değil kendini hazırlamaktır. Bu derste durum yönetimi ve dürüst kaynak durumu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: altmış saniye nefes + durak + niyet protokolünü yaz.",
  },
  "pd-ileri-5": {
    warmup:
      "Zaman kum saati ters çevrilmeden «müsait olunca» sistem değildir. Bu derste zaman kutusu ve odak kutusunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kırk beş dakika zaman kutusu — amaç + yeterli tanımı yaz.",
  },
  "pd-ileri-6": {
    warmup:
      "Ajanda düzeni olmadan her bildirim acil değildir; duman alarmı sigortanın yerini tutmaz. Bu derste Eisenhower Öncelik Matrisi’ni konuşuyoruz.",
    challenge:
      "İsteğe bağlı: dört kadrana birer madde koy; ikinci kadran bloğu ayır.",
  },
  "pd-ileri-7": {
    warmup:
      "Diş fırçasını lavaboya koymak tetiki görünür kılar; rutin kolaylaşır. Bu derste alışkanlık sistemlerini — tetik, rutin, ödül — konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bir alışkanlık döngüsü yaz; yirmi bir gün garantisini reddet.",
  },
  "pd-ileri-8": {
    warmup:
      "Ameliyathane «girme» tabelası gibidir; herkes girerse ameliyat bozulur. Bu derste derin çalışma ve dikkat bütçesini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: günlük blok bütçesi + acil kesinti tanımı yaz.",
  },
  "pd-ileri-9": {
    warmup:
      "Mutfak + alışveriş listesi + öğün saati kopunca yemek düşer. Bu derste iletişim ve zaman sistemi entegrasyonunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: haftalık ritim maddelerini dört satır yaz.",
  },
  "pd-ileri-10": {
    warmup:
      "Ev işletim panosu afişle bitmez; gün gün işler. Bu derste kişisel işletim sistemi Kapanış Uygulaması laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: etik + Eisenhower Öncelik Matrisi / zaman kutusu + alışkanlık + ritim kontrol listesini yaz.",
  },
  "cld-temel-1": {
    warmup:
      "Sayaç tikliyor, lamba yanıyor; sözleşme kimin adına kimse söylemiyor. Bu derste bulut hesabını elektrik aboneliği gibi konuşuyoruz: kim öder, kim keser.",
    challenge:
      "İsteğe bağlı: fatura sahibi, kök kullanıcı ve günlük iş kimliğini üç satıra ayır.",
  },
  "cld-temel-2": {
    warmup:
      "Bankada kiralık kasaya tek yedek anahtar asıldı mı kopya çoğalır. Bu derste Kimlik ve Erişim Yönetimi’ni anahtarlı kiralık kasa gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kişi, rol ve politika satırını yaz; paylaşılan yönetici kullanıcısını reddet.",
  },
  "cld-temel-3": {
    warmup:
      "Parsel çiti çizilmeden bahçeye garaj kurulursa herkes geçer. Bu derste Sanallaştırılmış Özel Ağ’ı arsa çiti gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: genel/özel alt ağ ve varsayılan red güvenlik grubunu iki satırda yaz.",
  },
  "cld-temel-4": {
    warmup:
      "Garaj kiralandı, anahtar cafe panosunda; kim teslim aldı deftere geçmedi. Bu derste Esnek Bilgi İşlem Bulutu’nu kiralık sunucu garajı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: durdur / sonlandır farkını ve silme korumasını tek cümlede yaz.",
  },
  "cld-temel-5": {
    warmup:
      "Emanet deposuna koli bırakıldı, vitrin «herkese okuma» açık. Bu derste Basit Depolama Servisi’ni emanet deposu gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: genel erişim bloğu, sürümleme ve günlüklü erişimi yeşil satır yap.",
  },
  "cld-temel-6": {
    warmup:
      "Ay sonu fiş geldi; prizler açık, sayaç kimseye ait değil. Bu derste fatura disiplinini ay sonu elektrik faturası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sahip, ortam, örnek, kova, bütçe eşiği ve alarm hedefini tabloya yaz.",
  },
  "cld-orta-1": {
    warmup:
      "Gişe yok; her araba kendi şeridinden içeri dalıyor. Bu derste Esnek Yük Dengeleyici’yi trafik polisi ve gişe geçişi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: dinleyici, hedef grup ve sağlık yolunu üç satıra ayır.",
  },
  "cld-orta-2": {
    warmup:
      "Gişede kırmızı lamba yanıyor, kuyruk hâlâ o kabine akıyor. Bu derste hedef grup ve sağlık kontrolünü kırmızı lamba gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sağlık eşiği, kayıt sökme gecikmesi ve sahte iki yüz yasağını yaz.",
  },
  "cld-orta-3": {
    warmup:
      "Bayramda tek otobüs, gece boş koltuk. Bu derste otomatik ölçeklemeyi esneyen otobüs filosu gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: min, istenen, max ve gişeye kayıt kuralını dört satır yaz.",
  },
  "cld-orta-4": {
    warmup:
      "Gece boş otobüsler mahallede dolaşıyor. Bu derste soğuma ve ölçek politikasını yakıt disiplini gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: soğuma, hedef izleme ve gece düşüş satırını yaz.",
  },
  "cld-orta-5": {
    warmup:
      "Ana kasa stajyerin dizüstünde. Bu derste İlişkisel Veritabanı Servisi’ni kiralık mahzen gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: motor, özel alt ağ, sır kasası ve genel erişim yasağını yaz.",
  },
  "cld-orta-6": {
    warmup:
      "Yangında tek mahzen kül; «kopyam var» hangi şubede? Bu derste yedek ve çoklu bölgeyi ikinci kasa gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: saklama penceresi, silme koruması ve okuma kopyası / çoklu bölge ayrımını yaz.",
  },
  "cld-orta-7": {
    warmup:
      "Sipariş yok, ocak gece açık. Bu derste Sunucusuz Mantık’ı sipariş ışığı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tetik, süre tavanı, rol ve sır yasağını dört satır yaz.",
  },
  "cld-orta-8": {
    warmup:
      "Gişe afişi asılı, filo boş, mahzen caddeye açık. Bu derste orta mimari laboratuvarını dört yeşil satır gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: gişe, filo, mahzen ve mutfak kontrol listesini yaz.",
  },
  "cld-ileri-1": {
    warmup:
      "Limanda kutu yığılı, vinç şefsiz. Bu derste Kubernetes’i orkestra şefi ve konteyner limanı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kule, rıhtım ve pod satırını üç satıra ayır.",
  },
  "cld-ileri-2": {
    warmup:
      "Kutu yeri değişti, kamyon eski iskeleye gidiyor. Bu derste pod, Servis ve Dağıtım’ı liman adresi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: etiket, seçici ve kopya sayısını yaz.",
  },
  "cld-ileri-3": {
    warmup:
      "Vinç tonajsız «hepsini yükle» diyor. Bu derste kaynak limiti ve sondayı aşırı yük gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: istek, tavan ve hazırlık sondasını üç satır yaz.",
  },
  "cld-ileri-4": {
    warmup:
      "Şantiye «aklımızda plan var» diye tuğla diziyor. Bu derste Terraform’u mimari yapı projesi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: plan, uygula ve sır yasağını yaz.",
  },
  "cld-ileri-5": {
    warmup:
      "Kolon kaymış, planda düz. Bu derste durum dosyası ve sapmayı şantiye uyuşmazlığı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: uzak kasa, kilit ve sapma yanıtını yaz.",
  },
  "cld-ileri-6": {
    warmup:
      "Üç arsaya tek tapu. Bu derste modül ve ortamı üç şantiye gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: ayrı backend, ayrı değişken, pinli sürüm satırını yaz.",
  },
  "cld-ileri-7": {
    warmup:
      "Usta tezgâhta vida sıkıyor, tarife rafta. Bu derste GitOps’u fabrika bandı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: çekme modeli, git birincil ve tıklama yasağını yaz.",
  },
  "cld-ileri-8": {
    warmup:
      "Kırmızı kutu bantta ilerliyor, «sonra bakarız». Bu derste bildirim ve kırmızı kapıyı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: pinli özet, inceleme ve latest yasağını yaz.",
  },
  "cld-ileri-9": {
    warmup:
      "Kule karanlık, kasa kapağı rıhtımda. Bu derste gözlem ve sırrı kule-kasa gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: ölçü eşiği, sır kasası ve döndürme satırını yaz.",
  },
  "cld-ileri-10": {
    warmup:
      "Liman afişi asılı, bant durmuş. Bu derste ileri kapanış laboratuvarını orkestra-proje-bant gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tavan, uzak durum, çekme modeli ve sır kasası kontrol listesini yaz.",
  },
  "eng-temel-1": {
    warmup:
      "Kamyon kapıda, tartı yok; «rapor hazır» deniyor, çuvalın içi yazılmamış. Bu derste veri hattını ham madde kamyonu gibi konuşuyoruz: irsaliye, tartı, kapı fişi.",
    challenge:
      "İsteğe bağlı: kaynak, tane ve paydayı üç satıra ayır; ham tabloyu panele bağlama yasağını yaz.",
  },
  "eng-temel-2": {
    warmup:
      "Kamyon kapıda, rapor da isteniyor; ham çuvalı vitrine koymak teslim değilmiş. Bu derste Ayıkla-Dönüştür-Yükle ve Ayıkla-Yükle-Dönüştür farkını kamyon ve arıtma tesisi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: hangi adımın kamyonda, hangisinin tesiste olduğunu iki satırda yaz.",
  },
  "eng-temel-3": {
    warmup:
      "Ham çuval ile paketli un aynı rafa konursa fırın yalan söyler. Bu derste Veri Gölü ve Veri Ambarı’nı hububat deposu ile un ambarı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: göl, ambar ve pazar modeli üç satırına tane notu ekle; paneli göle bağlama.",
  },
  "eng-temel-4": {
    warmup:
      "Çuval açık, herkes kendi dilimini kesiyor; ölçü şablonu yok. Bu derste boyut modellemeyi marangoz ölçü şablonu gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: olgu, boyut ve tane cümlesini yaz; adresi olguya gömmeyi reddet.",
  },
  "eng-temel-5": {
    warmup:
      "Cetvel duruyor, tartı damgasız; herkes «benim gramajım doğru» diyor. Bu derste Veri Dönüştürme Aracı’nı terazi damgası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kaynak, model ve şema testi satırını yaz; kırmızı testi yeşil boyama.",
  },
  "eng-temel-6": {
    warmup:
      "Ham tablo, göl, şablon ve damga aynı masada; payda hâlâ «bana göre». Bu derste ham kaynaktan dürüst pazar modele geçişi payda yazılı kapatıyoruz.",
    challenge:
      "İsteğe bağlı: ham kaynak, tane, payda, test ve pazar model satırını aynı tabloya yaz.",
  },
  "eng-orta-1": {
    warmup:
      "Makas kulesi karanlık, sefer «ben çalıştırdım» diyor; vagon hangisine girdi yazılmamış. Bu derste Hava Akışı Orkestratörü’nü otomatik tren makas kontrol merkezi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kule, görev listesi ve sefer kimliğini üç satıra yaz; dizüstü seferi teslim sayma.",
  },
  "eng-orta-2": {
    warmup:
      "Vagon A, B’yi bekliyor, B de A’yı; sefer kilitlendi. Bu derste Yönlü Devirsel Olmayan Graf’ı makas grafı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç düğümlü yönlü ok çiz; döngüyü reddet, graf kimliğini yaz.",
  },
  "eng-orta-3": {
    warmup:
      "Graf duruyor, saat yok; «ne zaman kalktı?» kavgası. Bu derste zamanlayıcı saati sefer tarifesi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: aralık, dilim ve yakalama tavanını üç satıra yaz.",
  },
  "eng-orta-4": {
    warmup:
      "Saat tikliyor, vagonlar üst üste; «hepsi aynı anda» deniyor. Bu derste görev ve bağımlılığı raydaki vagon sırası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: ayıklama, test ve yükü üç vagon satırına ayır; zaman aşımını yaz.",
  },
  "eng-orta-5": {
    warmup:
      "Kaynak geç geldi, kule «yoksa patlat» diyor. Bu derste sensör ve yeniden denemeyi makasta bekleme lambası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: lamba, poke aralığı ve deneme tavanını yaz; sessiz tamamı reddet.",
  },
  "eng-orta-6": {
    warmup:
      "Çuval tartısız vitrine gidiyor; «gözüme doğru geldi». Bu derste veri kalitesini fabrika kalite kontrol masası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: eşsizlik, boş değil ve kabul listesini üç kurala yaz; kırmızı numuneyi yeşil boyama.",
  },
  "eng-orta-7": {
    warmup:
      "Laboratuvar kırmızı, vana açık; zehir un vitrine gidiyor. Bu derste hat durdurma vanasını ve Hizmet Seviyesi Anlaşması’nı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: taze pencere, vana ve uyarı sahibini üç satıra yaz.",
  },
  "eng-orta-8": {
    warmup:
      "Kule afişi asılı, saat durmuş, laboratuvar boş. Bu derste orta kapanış laboratuvarını makas-saat-laboratuvar-vana gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: graf, tik, numune ve vana kontrol listesini yaz; afişi teslim sayma.",
  },
  "eng-ileri-1": {
    warmup:
      "Ham cevher, yıkanmış taş ve külçe aynı rafa konmuş. Bu derste madalya mimarisini dev arıtma ve maden ayrıştırma tesisi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bronz, Gümüş ve Altın’ı üç satıra ayır; paneli ham rafa bağlama.",
  },
  "eng-ileri-2": {
    warmup:
      "Kamyon boşaltıyor, tartı yok; «Bronz bitti» deniyor. Bu derste Bronz katmanı ham cevher bunkerı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: irsaliye, eklemeli yazım ve silme yasağını üç satıra yaz.",
  },
  "eng-ileri-3": {
    warmup:
      "Ham bunker dolu, elek yok; çamurlu taş külçe sayılıyor. Bu derste Gümüş katmanı yıkanmış cevher gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tane, şema ve kalite testini yaz; kırmızıda Altın’a geçme.",
  },
  "eng-ileri-4": {
    warmup:
      "Yıkanmış taş vitrine konmuş; müdür «külçe» diyor. Bu derste Altın katmanı külçe ve pazar modeli gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: payda, taze pencere ve soy ağacını yaz; paneli Gümüş’e bağlama.",
  },
  "eng-ileri-5": {
    warmup:
      "«Şu bulut ucuz» deniyor, iki kasa karışmış. Bu derste Veri Tuğlaları ve Kar Tanesi’ni iki tesis, iki fatura gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tavan, otomatik kapanış ve fatura sahibini üç satıra yaz.",
  },
  "eng-ileri-6": {
    warmup:
      "Tek dizüstü «ben küme» diyor; yüz vagon tek hatta. Bu derste Kıvılcım Veri İşleme Motoru’nu çok hatlı yüksek hızlı tren gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sürücü, işçi ve bölüm anahtarını yaz; yerel kipi üretim sayma.",
  },
  "eng-ileri-7": {
    warmup:
      "«Hepsi anlık» deniyor; aslında gece tarifesi. Bu derste parti ve canlı akışı sefer tarifesi ile canlı hat gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tür, filigran ve kontrol noktasını üç satıra yaz.",
  },
  "eng-ileri-8": {
    warmup:
      "Bütün vagonlar tek makasta kuyruk. Bu derste karışım ve bölümlemeyi makas yoğunluğu gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bölüm anahtarı, çarpıklık ve gerekçeli karışımı yaz.",
  },
  "eng-ileri-9": {
    warmup:
      "Bütün meyve vitrinde, soğuk oda boş; kira şişiyor. Bu derste sıcak-soğuk maliyeti taze hali ve soğuk hava deposu gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sıcak / ılık / soğuk satırını ve geri getirme fişini yaz.",
  },
  "eng-ileri-10": {
    warmup:
      "Tesis afişi asılı, dizüstü küme, hali gece yanıyor. Bu derste ileri kapanış laboratuvarını madalya-hat-depo gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: katman, kıvılcım tavanı ve sıcak-soğuk kontrol listesini yaz.",
  },
  "qa-temel-1": {
    warmup:
      "Koli kapıda, damga yok; «çalışıyor» deniyor. Bu derste Kalite Güvencesi’ni fabrika kalite kontrol damgası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: beklenen, kanıt ve kabulü üç satıra yaz; ekranı tek başına mühür sayma.",
  },
  "qa-temel-2": {
    warmup:
      "Her koli tavan katında tartılıyor; gece yanıyor. Bu derste test piramidini ürün kabul kantar terazisi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: birim, bütünleştirme ve uçtan uca katmanını yaz; hepsini tepeye taşıma.",
  },
  "qa-temel-3": {
    warmup:
      "Çuvalın içi yazılmamış; «fonksiyon çalıştı» deniyor. Bu derste birim ve bütünleştirmeyi reçete doğrulama gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: birimde sahte kapı, bütünleştirmede sözleşme satırını yaz.",
  },
  "qa-temel-4": {
    warmup:
      "Koli «beğenildi» diye çıkıyor; imza yok. Bu derste manuel kabulü noter onay tutanağı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: senaryo, kanıt, imza ve kenar durum satırını yaz; alkışı tutanak sayma.",
  },
  "qa-temel-5": {
    warmup:
      "Kırık «bir şeyler olmuyor» diye kayboluyor. Bu derste hata raporunu damgasız koli yasağı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: adımlar, beklenen, gerçekleşen, ortam ve kanıtı yaz.",
  },
  "qa-temel-6": {
    warmup:
      "Damga, terazi, reçete ve tutanak aynı masada; koli hâlâ «gözüme doğru». Bu derste temel kapanış laboratuvarını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: dört satırı aynı tabloya yaz; afişi teslim sayma.",
  },
  "qa-orta-1": {
    warmup:
      "Gece her koliye el uzatmak teslim değilmiş. Bu derste uçtan uca testi otomatik robotik kollar gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yol, beklenen ve kayıt satırını yaz; el kahramanlığını teslim sayma.",
  },
  "qa-orta-2": {
    warmup:
      "Tek tarayıcıda on yol; çerez karışıyor. Bu derste Playwright sahnesini tarayıcı fabrikası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yalıtılmış bağlam ve tarayıcı listesini yaz.",
  },
  "qa-orta-3": {
    warmup:
      "Kol rastgele pikseli sıkıyor; düğme kayınca kırılıyor. Bu derste seçici ve beklemeyi kolun tutuşu gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: rol seçici ve görünür beklemeyi yaz; sabit uykuyu reddet.",
  },
  "qa-orta-4": {
    warmup:
      "Aynı koli bazen yeşil bazen kırmızı; «yeniden koş» deniyor. Bu derste kararsız testi sahte montaj hattı yasağı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: karantina ve kök neden satırını yaz; üç kez koşmayı reddet.",
  },
  "qa-orta-5": {
    warmup:
      "Kırmızı paket yine ana hatta giriyor. Bu derste sürekli entegrasyonu kırmızı ışıklı otomatik bariyer gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bariyer, sahip ve kırmızı dur satırını yaz.",
  },
  "qa-orta-6": {
    warmup:
      "Kırmızı paket yine vitrine çıkıyor. Bu derste sürekli teslimatı sevkiyat kapısı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: ortam, geri alma ve elle basma yasağını yaz.",
  },
  "qa-orta-7": {
    warmup:
      "Vitrin kaymış; «bana düz göründü» deniyor. Bu derste görsel ve erişilebilirliği vitrin kontrolü gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: eşik, kontrast ve klavye yolunu yaz.",
  },
  "qa-orta-8": {
    warmup:
      "Kol afişi asılı, zar atan hat, açık bariyer. Bu derste orta kapanış laboratuvarını kol-yasak-bariyer gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kol, karantina, bariyer ve kapı kontrol listesini yaz.",
  },
  "qa-ileri-1": {
    warmup:
      "İki fabrika «bizim uç çalışıyor» diyor, kamyon ortada. Bu derste sözleşme testini iki fabrika protokolü gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: paylaşılan fiş ve sürüm satırını yaz; tek taraf yeşilini protokol sayma.",
  },
  "qa-ileri-2": {
    warmup:
      "Tüketen «bana böyle gelir» demeden kamyon kalkıyor. Bu derste tüketici sözleşmesini sipariş fişi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tüketici fişi ve sahte sağlayıcı satırını yaz.",
  },
  "qa-ileri-3": {
    warmup:
      "Sağlayan alanı sessiz siliyor; eski uygulama kırılıyor. Bu derste sağlayıcı sözleşmesini irsaliye gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: irsaliye vaadi ve sürüm penceresini yaz; sessiz silmeyi reddet.",
  },
  "qa-ileri-4": {
    warmup:
      "Ortalama hızlı, kuyruk şişiyor. Bu derste performans bütçesini yüzde doksan beş gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yüzde doksan beş, hata oranı ve paydayı yaz.",
  },
  "qa-ileri-5": {
    warmup:
      "Kapak «elle tıklayarak stres yaptık» diyor. Bu derste Performans Test Aracı’nı baraj kapakları gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: senaryo, eşik ve rapor satırını yaz; elle tıklamayı tezgâh sayma.",
  },
  "qa-ileri-6": {
    warmup:
      "Yük ile stres aynı cümlede; taşkın her gün. Bu derste yük ve stresi suyun basıncı gibi ayırıyoruz.",
    challenge:
      "İsteğe bağlı: yük ve stresi iki satırda ayır; tavanı yaz.",
  },
  "qa-ileri-7": {
    warmup:
      "Beş dakikalık yeşil «dayandı» sayılıyor. Bu derste dayanıklılık ve sivri yükü gece taşkını gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: uzun pencere, sivri senaryo ve sızıntı izini yaz.",
  },
  "qa-ileri-8": {
    warmup:
      "Kuyruk şişmiş, pano süs. Bu derste gözlem ve bütçe ihlalini kırmızı baraj gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: eşik, sahip ve durma eylemini yaz.",
  },
  "qa-ileri-9": {
    warmup:
      "Fiş, tezgâh ve lamba ayrı odada. Bu derste kalite kapısı orkestrasyonunu sözleşme ve basınç gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kapı sırasını yaz; tek yeşili sevk sayma.",
  },
  "qa-ileri-10": {
    warmup:
      "Protokol afişi, boş tezgâh, süs lamba. Bu derste ileri kapanış laboratuvarını protokol-baraj-bütçe gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: fiş, eşik ve lamba kontrol listesini yaz; afişi teslim sayma.",
  },
  "jav-temel-1": {
    warmup:
      "Kaynak dosya duruyor, «çalıştı» deniyor; hangi odada yazılmamış. Bu derste Java Sanal Makinesi’ni fabrika motor odası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yığın, hol ve tavanı yaz; dizüstü yeşilini motor sayma.",
  },
  "jav-temel-2": {
    warmup:
      "Motor odası duruyor, vida rastgele sıkılıyor. Bu derste Nesne Yönelimli Programlama’yı kalıp ve vida gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kalıp, vida ve parça satırını yaz; hepsini public sayma.",
  },
  "jav-temel-3": {
    warmup:
      "Kalıp duruyor, «ben elle derledim» deniyor. Bu derste Maven ve Gradle’ı fabrika derleme makinesi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tarif, kilit ve kırmızıda koli yok satırını yaz.",
  },
  "jav-temel-4": {
    warmup:
      "Makine duruyor, damga yok; koli «gözüme doğru» çıkıyor. Bu derste JUnit’i garanti belgesi ve çıkış damgası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: girdi, beklenen ve yeşil damgayı yaz; konsol yazdırmayı mühür sayma.",
  },
  "jav-temel-5": {
    warmup:
      "Damga duruyor, koliye yabancı vida düşüyor. Bu derste paket ve bağımlılığı koli irsaliyesi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: ad, sürüm ve kilit satırını yaz; sohbeti irsaliye sayma.",
  },
  "jav-temel-6": {
    warmup:
      "Motor, kalıp, makine ve damga aynı masada; koli hâlâ «gözüme doğru». Bu derste temel kapanış laboratuvarını dört satır gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: motor, kalıp, makine ve damga listesini yaz; afişi koli sayma.",
  },
  "jav-orta-1": {
    warmup:
      "Motor ve damga duruyor, koli kapıda «kim karşılayacak» yazılmamış. Bu derste Spring Boot’u fabrika resepsiyonu gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: iskelet, profil ve kapı satırını yaz; konsol yeşilini lobi sayma.",
  },
  "jav-orta-2": {
    warmup:
      "Resepsiyon duruyor, usta her şeyi new ile kuruyor. Bu derste bağımlılık enjeksiyonunu vardiya kartı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tezgâh ve kart satırını yaz; gizli new’i kart sayma.",
  },
  "jav-orta-3": {
    warmup:
      "Kart duruyor, koli «şu metoda git» diye koridorda kayboluyor. Bu derste Temsili Durum Transferi’ni sipariş gişesi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kaynak, yöntem ve durum kodunu yaz; tek servlet’i gişe sayma.",
  },
  "jav-orta-4": {
    warmup:
      "Gişe duruyor, şemasız koli içeri itiliyor. Bu derste doğrulamayı şema dışı paket yasağı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: şema ve dört yüz satırını yaz; bozuk gövdeye iki yüz basma.",
  },
  "jav-orta-5": {
    warmup:
      "Yasak duruyor, bahçe kapısı «herkes girsin» diye açık. Bu derste Spring Security’yi şifreli fabrika giriş kapısı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kimlik ve yetki satırını yaz; düğme gizlemeyi bekçi sayma.",
  },
  "jav-orta-6": {
    warmup:
      "Kapı duruyor, koli holde «tabloya bir şekilde yaz» diye kayboluyor. Bu derste Java Kalıcılık rafını depo sözleşmesi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: varlık, işlem ve getiri satırını yaz; n artı biri gece holü sayma.",
  },
  "jav-orta-7": {
    warmup:
      "Raf duruyor, varlık sınıfı caddeye basılıyor. Bu derste Veri Transfer Nesnesi’ni koli etiketi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: etiket ve gizli alan satırını yaz; ham varlığı gişeden basma.",
  },
  "jav-orta-8": {
    warmup:
      "Resepsiyon, kapı ve yasak aynı masada; koli hâlâ «herkes girsin». Bu derste orta kapanış laboratuvarını üç kilit gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: resepsiyon, dört yüz ve şifreli kapı listesini yaz; afişi lobi sayma.",
  },
  "jav-ileri-1": {
    warmup:
      "Kapı ve gişe duruyor, para bir raftan düşüp diğerine yazılmadan kayboluyor. Bu derste veritabanı işlem birimini kasa mühürü gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: iki yazı, bir mühür ve geri almayı yaz; ardışık iki yazıyı kasa sayma.",
  },
  "jav-ileri-2": {
    warmup:
      "Kasa mühürü duruyor; bir banka «gördüm» diyor, öbürü «gelmedi» diyor. Bu derste Outbox’u iki banka transfer odası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kasa yazısı ve çıkış fişini aynı mühürde yaz; kuyruğa ayrı basma.",
  },
  "jav-ileri-3": {
    warmup:
      "Oda duruyor, iki deftere ayrı mühür basılıyor. Bu derste çift yazıcı yasağını tek gerçek gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tek defter satırını yaz; ikinci noteri gerçek sayma.",
  },
  "jav-ileri-4": {
    warmup:
      "Yasak duruyor, koli «hemen şimdi» diye tezgâha yığılıyor. Bu derste mesaj kuyruğunu üretim hattı sır kasası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bant, işçi ve ölü raf satırını yaz; bandı atlayıp senkron arama.",
  },
  "jav-ileri-5": {
    warmup:
      "Bant duruyor, parola depoda düz yazılıyor. Bu derste sır yönetimini kasa anahtarı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kasa, dönüş ve günlük yasağını yaz; depoya düz parola basma.",
  },
  "jav-ileri-6": {
    warmup:
      "Anahtar duruyor, pano süslü, kırmızı lamba yok. Bu derste merkezi izlemeyi izleme kulesi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: eşik, sahip ve eylem satırını yaz; manzara fotoğrafını kule sayma.",
  },
  "jav-ileri-7": {
    warmup:
      "Kule duruyor, aynı para iki kez düşüyor. Bu derste eşgüçlülüğü aynı fiş yasağı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: fiş kimliği ve tavan satırını yaz; kör tekrarı kahramanlık sayma.",
  },
  "jav-ileri-8": {
    warmup:
      "Fiş duruyor, kırmızı paket «acil» diye üretime giriyor. Bu derste Sürekli Entegrasyon’u üretim hattı kapısı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: test, damga ve geri alma satırını yaz; yerel yeşili kapı sayma.",
  },
  "jav-ileri-9": {
    warmup:
      "Kapı duruyor; oda, kasa ve kule ayrı koridor. Bu derste orkestrasyonu aynı gişe gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: oda, kasa ve kule sırasını yaz; tek yeşili sevk sayma.",
  },
  "jav-ileri-10": {
    warmup:
      "Transfer afişi, boş kasa, süs kule. Bu derste ileri kapanış laboratuvarını oda-kasa-kule gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: mühür, fiş ve lamba kontrol listesini yaz; afişi teslim sayma.",
  },
  "rn-temel-1": {
    warmup:
      "İki gümrük, iki kuyruk; yolcu «ben vatandaşım» diyor. Bu derste çapraz platform pasaportunu iki ülkeye tek belge gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: ortak gövde ve iki yerel kabuk satırını yaz; tarayıcı damgasını pasaport sayma.",
  },
  "rn-temel-2": {
    warmup:
      "Pasaport damgası duruyor, fiyat etiketi boş. Bu derste Tip Güvenlikli Yazılım’ı vitrin etiket sözleşmesi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yazı, sayı ve boş işaret satırını yaz; any’yi etiket sayma.",
  },
  "rn-temel-3": {
    warmup:
      "Etiket duruyor, askısız manken vitrine dikiliyor. Bu derste bileşen ve özelliği manken-askı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: ebeveyn özellik ve tek yön satırını yaz; çocuğun gerçeği çalmasına izin verme.",
  },
  "rn-temel-4": {
    warmup:
      "Manken duruyor, ayakkabı rafı tavanı deliyor. Bu derste esnek kutuyu standart vitrin dizilimi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sıra, boşluk ve taşma yasağını yaz; lastiği cama sıkıştırma.",
  },
  "rn-temel-5": {
    warmup:
      "Dizilim duruyor, iki yüz çift tek cama yığılıyor. Bu derste kaydırma bandını düz liste ve sonsuz raf gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: anahtar ve görünen pencere satırını yaz; depoyu vitrine boşaltma.",
  },
  "rn-temel-6": {
    warmup:
      "Pasaport afişi, boş vitrin, süs bant. Bu derste temel kapanış laboratuvarını pasaport-vitrin-bant gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: beş yeşil satır kontrol listesini yaz; «hepsi var» afişini teslim sayma.",
  },
  "rn-orta-1": {
    warmup:
      "Vitrin duruyor, müşteri hangi kapıdan girdiğini yazmamış. Bu derste ekran koridorunu yığın gezinme gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yığın, geri tuşu ve üst vitrin satırını yaz; ışık yakmayı kat planı sayma.",
  },
  "rn-orta-2": {
    warmup:
      "Koridor tabelası duruyor, her cam kendi fiyatını tutuyor. Bu derste durumu tek vitrin gerçeği gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yükleniyor, veri ve hata satırını yaz; iki kalemi tek gerçek sayma.",
  },
  "rn-orta-3": {
    warmup:
      "Tabela duruyor, koli «şu metoda git» diye kayboluyor. Bu derste Temsili Durum Transferi’ni kurye fişi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: adres, barkod ve teslim satırını yaz; barkodsuz çıktıyı yeşil sayma.",
  },
  "rn-orta-4": {
    warmup:
      "Fiş duruyor, ağ kesilince vitrin boşalıyor. Bu derste çevrimdışı emanet kasasını önbellek ve kuyruk gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kasa ve kuyruk satırını yaz; «ezberledim» demeyi kasa sayma.",
  },
  "rn-orta-5": {
    warmup:
      "Kasa duruyor, anten yokken ekran «gönderildi» basıyor. Bu derste çekmeyen telefonu sahte yeşil yasağı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: dürüst kırmızı ve kuyruk satırını yaz; tik’i teslim sayma.",
  },
  "rn-orta-6": {
    warmup:
      "Yasak duruyor, jeton düz metin çekmecede. Bu derste şifreli yerel depoyu kiralık kasa gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kasa ve düz metin yasağını yaz; anahtarı kapıya bantlama.",
  },
  "rn-orta-7": {
    warmup:
      "Depo duruyor, tema ile jeton aynı kutuda. Bu derste paylaşılan çekmece ve kasa anahtarı ayrımını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tema kutusu ve jeton kasası satırını yaz; ikisini aynı çekmeceye koyma.",
  },
  "rn-orta-8": {
    warmup:
      "Emanet afişi, sahte yeşil, boş kasa. Bu derste orta kapanış laboratuvarını emanet-yasak-kasa gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç kilit kontrol listesini yaz; «gönderildi» afişini teslim sayma.",
  },
  "rn-ileri-1": {
    warmup:
      "Emanet kasası duruyor, iki gişede «anladım» deniyor. Bu derste yerel köprüyü gümrük tercümanı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: yöntem adı, argüman ve hata kodunu yaz; boş dönüşü yeşil sayma.",
  },
  "rn-ileri-2": {
    warmup:
      "Gümrük tercümanı duruyor, her kelime kâğıda yazılıyor. Bu derste Turbo Modül ve JavaScript Arayüzü’nü hızlı gişe gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sözleşme ve arka plan satırını yaz; kâğıt kuyruğunu tır sayma.",
  },
  "rn-ileri-3": {
    warmup:
      "Hızlı gişe duruyor, vitrin her dokunuşta titriyor. Bu derste yeni mimariyi kumaş ve eşzamanlı boyama gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kumaş ve eşzamanlı boya satırını yaz; titremeyi teslim sayma.",
  },
  "rn-ileri-4": {
    warmup:
      "Kumaş duruyor, kaydırma takılıyor. Bu derste kare bütçesini jank yasağı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: milisaniye ve profil satırını yaz; «bana akıcı geldi» demeyi bütçe sayma.",
  },
  "rn-ileri-5": {
    warmup:
      "Bütçe duruyor, JavaScript kolisi uçaktan düşüyor. Bu derste Havadan Güncelleme’yi koli ve gümrük sınırı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: koli ve kabuk sınırını yaz; motoru havadan değiştirme.",
  },
  "rn-ileri-6": {
    warmup:
      "Koli duruyor, kırmızı paket «acil» diye üretime giriyor. Bu derste Sürekli Entegrasyon’u teslimat kapısı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: test, damga ve kırmızı dur satırını yaz; yerel yeşili kapı sayma.",
  },
  "rn-ileri-7": {
    warmup:
      "Kapı duruyor, ekip «paket oluştu» diyor. Bu derste mağaza onayını gişe gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: paket, imza ve izin satırını yaz; kamyona koymayı teslim sayma.",
  },
  "rn-ileri-8": {
    warmup:
      "Gişe duruyor, koli geri gelmiş, ekip «haksızlar» diyor. Bu derste red metnini analiz tutanağı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: madde, çanta ve düzeltme satırını yaz; bağırmayı tutanak sayma.",
  },
  "rn-ileri-9": {
    warmup:
      "Tutanak duruyor, üretim çöküyor, «bende açıldı» deniyor. Bu derste kara kutu ve uzaktan kapatmayı nöbet gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kayıt, eşik ve kapatma satırını yaz; hissi nöbet sayma.",
  },
  "rn-ileri-10": {
    warmup:
      "Tercüman afişi, boş gişe, Slack tutanak. Bu derste ileri kapanış laboratuvarını tercüman-gişe-tutanak gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç kilit kontrol listesini yaz; «paket oluştu» afişini teslim sayma.",
  },
  "gam-temel-1": {
    warmup:
      "Perde kapalı, sahne boş; stajyer «ekran açıldı» diyor. Bu derste Unity editörünü tiyatro sahnesi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: hiyerarşi, denetçi ve sahne satırını yaz; oyun görünümünü sahne sayma.",
  },
  "gam-temel-2": {
    warmup:
      "Sahne duruyor, kukla yerde. Bu derste C Sharp oyun döngüsünü kukla ipleri gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kare ve sabit fizik adımı satırını yaz; fiziği kareye tıkma.",
  },
  "gam-temel-3": {
    warmup:
      "İpler duruyor, figüranın adı yok. Bu derste oyun nesnesini sahne figüranı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: nesne, yerel duruş ve ebeveyn satırını yaz; isimsiz kuklayı prova sayma.",
  },
  "gam-temel-4": {
    warmup:
      "Figüran duruyor, kukla yerden geçiyor. Bu derste fizik motorunu yerçekimi ipleri gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: sert cisim ve çarpışma gövdesi satırını yaz; görüntüyü fizik sayma.",
  },
  "gam-temel-5": {
    warmup:
      "Yerçekimi duruyor, tuş kareye gömülüyor. Bu derste girdi haritasını oyuncu ipleri gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: eylem ve kamera hedefi satırını yaz; GetKey gömmeyi harita sayma.",
  },
  "gam-temel-6": {
    warmup:
      "Sahne afişi, boş ip, süs gövde. Bu derste temel kapanış laboratuvarını sahne-ip-prototip gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: beş yeşil satır kontrol listesini yaz; Play tuşunu teslim sayma.",
  },
  "gam-orta-1": {
    warmup:
      "Sahne duruyor, can yazısı dünyaya yapışık. Bu derste Kullanıcı Arayüzü tuvalini sahne üstü afiş gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: tuval, ölçek ve olay satırını yaz; dünya yazısını afiş sayma.",
  },
  "gam-orta-2": {
    warmup:
      "Afiş duruyor, her kukla kendi tuşunu dinliyor. Bu derste eylem haritasını kumanda kablosu gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: eylem ve cihaz satırını yaz; gömülü tuşu harita sayma.",
  },
  "gam-orta-3": {
    warmup:
      "Kablo duruyor, salon uğulduyor. Bu derste ses kaynağını perde arkası orkestra gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: klip, karışım ve tavan satırını yaz; yığını orkestra sayma.",
  },
  "gam-orta-4": {
    warmup:
      "Orkestra duruyor, koli «iki boyut yeter» diyor. Bu derste yayın iskeletini montaj hattı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: İki Boyutlu ve Üç Boyutlu hedef satırını yaz; kopya sahneyi iskelet sayma.",
  },
  "gam-orta-5": {
    warmup:
      "İskelet duruyor, otomat fişsiz yeşil basıyor. Bu derste Uygulama İçi Satın Alma’yı jeton otomatı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kimlik, fiş ve hak satırını yaz; yerel tiki teslim sayma.",
  },
  "gam-orta-6": {
    warmup:
      "Otomat duruyor, Play klasörü kamyona binmek istiyor. Bu derste derleme paketini montaj hattı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: hedef, damga ve imza satırını yaz; Play çıktısını paket sayma.",
  },
  "gam-orta-7": {
    warmup:
      "Hat duruyor, koli «paket oluştu» diyor. Bu derste izin metnini kutu etiketi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: izin, gizlilik ve sürüm notu satırını yaz; paketi teslim sayma.",
  },
  "gam-orta-8": {
    warmup:
      "Jeton afişi, boş damga, Slack izin. Bu derste orta kapanış laboratuvarını otomat-hat-kutu gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç kilit kontrol listesini yaz; «yayında» afişini teslim sayma.",
  },
  "gam-ileri-1": {
    warmup:
      "Paketleme kutusu duruyor, dekor «bir şekilde gelir» diyor. Bu derste adreslenebilir varlığı canlı tiyatro dekor değişimi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: adres, etiket ve serbest bırakma satırını yaz; kaynak yığınını dekor sayma.",
  },
  "gam-ileri-2": {
    warmup:
      "Dekor duruyor, etiket yok. Bu derste kataloğu sahne malzeme listesi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: etiket, bağımlılık ve sürüm satırını yaz; tek etiketi liste sayma.",
  },
  "gam-ileri-3": {
    warmup:
      "Liste duruyor, kamyon imzasız. Bu derste uzaktan paketi kamyon dekoru gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: indirme, imza ve geri alma satırını yaz; imzasız koliyi dekor sayma.",
  },
  "gam-ileri-4": {
    warmup:
      "Kamyon duruyor, «bana akıcı geldi» deniyor. Bu derste canlı operasyonu gece nöbeti gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: olay, eşik ve sahip satırını yaz; hissi nöbet sayma.",
  },
  "gam-ileri-5": {
    warmup:
      "Nöbet duruyor, not kasa eziyor. Bu derste uzaktan yapılandırmayı sahne notu gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: bayrak, tavan ve geri alma satırını yaz; kasayı notla ezme.",
  },
  "gam-ileri-6": {
    warmup:
      "Not duruyor, gişe şans çarkı satıyor. Bu derste etik para tasarımını dürüst bilet gişesi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: fiyat, içerik ve tavan satırını yaz; çarkı gişe sayma.",
  },
  "gam-ileri-7": {
    warmup:
      "Gişe duruyor, «jeton geldi» deniyor. Bu derste Uygulama İçi Satın Alma vaadini yazılı sözleşme gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: vaat, içerik ve iade satırını yaz; jetonu teslim sayma.",
  },
  "gam-ileri-8": {
    warmup:
      "Sözleşme duruyor, çark Slack’te. Bu derste kumar yasağını analiz tutanağı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: madde, kanıt ve düzeltme satırını yaz; bağırmayı tutanak sayma.",
  },
  "gam-ileri-9": {
    warmup:
      "Tutanak duruyor, üretim çöküyor. Bu derste gözlem ve geri almayı emniyet ipi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: iz, eşik ve öldürme anahtarı satırını yaz; hissi ip sayma.",
  },
  "gam-ileri-10": {
    warmup:
      "Dekor afişi, boş gişe, Slack tutanak. Bu derste ileri kapanış laboratuvarını dekor-gişe-tutanak gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: üç kilit kontrol listesini yaz; «önce basalım» afişini teslim sayma.",
  },
  "mlo-temel-1": {
    warmup:
      "Fırın kapalı, tepsi boş; stajyer «notebook çalışıyor» diyor. Bu derste yapay zekâ model işletmesini fırın parti defteri gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: un, derece ve süre satırını yaz; notebook alkışını defter sayma.",
  },
  "mlo-temel-2": {
    warmup:
      "Defter duruyor, tepsi yerde. Bu derste deney takibini fırın parti defteri gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: koşu, parametre ve metrik satırını yaz; konsolu parti sayma.",
  },
  "mlo-temel-3": {
    warmup:
      "Parti duruyor, çuvalın tarihi yok. Bu derste Veri Sürüm Kontrolü’nü reçete kağıdı gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: çuval, tarih ve özet satırını yaz; masaüstü kopyayı reçete sayma.",
  },
  "mlo-temel-4": {
    warmup:
      "Reçete duruyor, koli damgasız. Bu derste Model Sicili’ni TSE damgası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: damga ve irsaliye satırını yaz; notebook kopyayı sevk sayma.",
  },
  "mlo-temel-5": {
    warmup:
      "Damga duruyor, süt ekşiyor. Bu derste veri sapmasını süt tarihi gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: eşik ve son kullanma satırını yaz; tadına bakmayı tahlil sayma.",
  },
  "mlo-temel-6": {
    warmup:
      "Defter afişi, boş reçete, süs damga. Bu derste temel kapanış laboratuvarını defter-reçete-damga gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: dört yeşil satır kontrol listesini yaz; notebook’u teslim sayma.",
  },
  "sys-temel-1": {
    warmup:
      "Kavşak kapalı, lamba sönük; stajyer «sunucu açıldı» diyor. Bu derste yüksek debili dağıtık sistem tasarımını kavşak defteri gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: istek, gecikme ve bellek satırını yaz; ping alkışını defter sayma.",
  },
  "sys-temel-2": {
    warmup:
      "Defter duruyor, tek şerit tıkalı. Bu derste yük dengelemeyi kavşak lambası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: şerit, lamba ve sağlık satırını yaz; tek kutuyu kavşak sayma.",
  },
  "sys-temel-3": {
    warmup:
      "Lamba duruyor, her müşteri depoya iniyor. Bu derste önbelleği büfe vitrini gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: vitrin, süre ve depo satırını yaz; depo turunu tezgâh sayma.",
  },
  "sys-temel-4": {
    warmup:
      "Vitrin duruyor, tüm şehir tek gişede. Bu derste parçalamayı mahalle PTT gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: şube ve anahtar satırını yaz; tek gişeyi şehir sayma.",
  },
  "sys-temel-5": {
    warmup:
      "Şube duruyor, hortum açık. Bu derste hız sınırını cami musluğu gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: kova ve eşik satırını yaz; hortumu musluk sayma.",
  },
  "sys-temel-6": {
    warmup:
      "Lamba afişi, boş vitrin, süs şube. Bu derste temel kapanış laboratuvarını lamba-vitrin-şube gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: dört yeşil satır kontrol listesini yaz; ping’i teslim sayma.",
  },
  "canva-temel-1": {
    warmup:
      "Komşu düğün salonu kiraladı; «bir afiş yapiver» yazıyor. Boş beyaz sayfa sihirli fırça mıdır? Bu derste şablonu evdeki hazır mobilya gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bu hafta gerçekten asacağın tek işi bir cümlede yaz (kim görecek, nerede asılacak, hangi tarih). Canva’yı henüz açma.",
  },
  "canva-temel-2": {
    warmup:
      "Çorabı tencere rafına koymak yemek midir? Yazı, fotoğraf ve zemin üst üste gelince hangisi önde anlaşılmaz. Bu derste çekmeceleri konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Aynı şablonda yazıyı bir çekmeceye al; fotoğrafı kapatıp yalnız yazının durduğunu gör.",
  },
  "canva-temel-3": {
    warmup:
      "Nüfus cüzdanı fotoğrafına manzara sığdırmak vesikalık mıdır? Hikâye boyu kare bakkal camına yapışınca yüz kesilir. Bu derste ölçüyü konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Yüz ortada sade zemin ve kare vitrin için iki ayrı dosya adı yaz: vitrin-kare / hikaye-dikey.",
  },
  "canva-temel-4": {
    warmup:
      "Camdaki yazıda on cümle, kimse fiyatı göremez. Güzel görünsün diye cümleyi uzatmak panoyu doldurur. Bu derste bakkal panosunu konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kendi kare metnini on iki kelimeye indir; bir kelime tarih veya fiyat olsun.",
  },
  "canva-temel-5": {
    warmup:
      "Ekranda kenar boşken kâğıtta yazı kesilir. Telefonda güzel duran A4’te kulak kesilir. Bu derste matbaa kapısını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Aynı işi ekran resmi ve kâğıt dosyası diye iki kez indir; dosya adına ekran / kagit yaz.",
  },
  "canva-temel-6": {
    warmup:
      "Beş kare, beş iş, yarın. Vitrin kalabalık olunca kimse saati okuyamaz. Bu derste tek iş, tek kare, tarihli kopyayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Gerçek bir iş seç (dükkân, okul, site). Tek kare üret. Yanına bir satır yaz: kim asacak, nereye, hangi gün.",
  },
  "linkedin-temel-1": {
    warmup:
      "İş ilanı açıldı; «LinkedIn’e bir bakayım» denir. Fotoğraf tatil, başlık boş. Kapıda isimlik yokken zil çalmak mıdır? Bu derste profili kapı tabelası gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Aynanın karşısında on saniye dur. Bu profil kime kapı açacak (iş, müşteri, ağ)? Tek kelime yaz; üçünü birden seçme.",
  },
  "linkedin-temel-2": {
    warmup:
      "Selfie ile vesikalık aynı kare midir? Düğün masası panoraması kapıda asılı. Bu derste yüzü ve kapağı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Telefonda bir kare çek; kırpma «yüz çerçevede». Eski tatil karesini kullanma.",
  },
  "linkedin-temel-3": {
    warmup:
      "Başlıkta beş unvan, camda on kalem. Bakkala söyleyemediğin cümle kapıya yazılır mı? Bu derste bakkal camını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Başlığı on iki kelimeye indir; bir meslek, bir bağlam (kim, nerede).",
  },
  "linkedin-temel-4": {
    warmup:
      "Hakkında’ya roman yazmak ev turu mudur, depo mu? Kırk satır slogan, sıfır tarih. Bu derste üç çekmeceyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Hakkında’yı komşuya sesli oku; nefes yetmezse kes. Üç deneyim kutusuna tarih koy.",
  },
  "linkedin-temel-5": {
    warmup:
      "Her gün paylaşmak bakkal camını her saat değiştirmek midir? Alkış avı vitrin değildir. Bu derste haftalık bir cümleyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bu hafta bir cümle taslağı yaz (iş, örnek, sade teşekkür). Gönderme zorunlu değil.",
  },
  "linkedin-temel-6": {
    warmup:
      "Profilim var, yarın kâğıt. Ekran kaydırma kâğıt değildir. Bu derste tarihli özgeçmiş kopyasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Fotoğraf, başlık, hakkında, üç deneyim. Kâğıt yüzünü tarihli kaydet. Güvendiğin kişiye «kapıda ne okudun?» diye sor.",
  },
  "cad-temel-1": {
    warmup:
      "Usta elinde kâğıt: çizgiler, oklar. «Şurayı yıkalım» diyorsun, o «bu kolon» diyor. Tablo resmi midir? Bu derste kuşbakışı ev haritasını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bir kat planında üç şeyi parmakla göster (giriş kapısı, bir pencere, bir oda adı). Gösteremiyorsan dur, büyüt, bak.",
  },
  "cad-temel-2": {
    warmup:
      "Her şey açıkken kâğıt karıncaya dönüyor. Çorabı tencere rafına koymak yemek midir? Bu derste duvar, yazı ve eşya çekmecesini konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bir çekmeceyi kapat; neyin kaybolduğunu bir cümlede yaz (duvar, yazı veya eşya).",
  },
  "cad-temel-3": {
    warmup:
      "Kâğıtta kısa görünen koridor evde uzun. Gözle «büyük oda» demek vesikalığı ezmek midir? Bu derste ölçek ve ölçü yazısını konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Planda bir duvarın metre yazısını oku (göz değil, yazı). Tahmin etme.",
  },
  "cad-temel-4": {
    warmup:
      "Yay gibi çizgi ne, taralı kutu ne? Bakkal camındaki küçük işaret okunmadan mal alınır mı? Bu derste kapı, pencere ve kuzeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bir kapıyı hayalen aç; nereye çarpar, söyle (dolap, duvar, yürüyüş).",
  },
  "cad-temel-5": {
    warmup:
      "Usta kadar çizmek mi şart, dikdörtgen yeter mi? Süslü kanepe oda mıdır? Bu derste tek oda çizmeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Kendi odanı adımla veya şeritle ölç; kâğıda dikdörtgen, kapı boşluğu ve oda adı yaz.",
  },
  "cad-temel-6": {
    warmup:
      "Bulanık WhatsApp karesi usta için plan mıdır? Matbaa kâğıdı kenara bakar. Bu derste okunan plan, tek oda ve tarihli kopyayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Tek sayfa kâğıt yaz (bu duvar, bu kapı, bu ölçü). WhatsApp bulanık fotoğraf yok.",
  },
  "pra-temel-1": {
    warmup:
      "Okul grubuna uzun bir yazı düştü; kimse anlamadı. «Bunu sadeleştir» demek istersin. ChatGPT, Gemini veya Claude hızlı komşudur. Bu derste asistanı komşu gibi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bugün gerçekten sıkıştığın bir yazı işini cümleyle yaz. Makineye henüz yapıştırma.",
  },
  "pra-temel-2": {
    warmup:
      "«Sadeleştir» boş camdır. Benim anladığım kadarıyla üç şey lazım: ne istiyorsun, kim okuyacak, ne kadar kısa. Bu derste bakkal panosu gibi isteği konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bir istek yaz: ne + kim + uzunluk. Üçü yoksa gönderme.",
  },
  "pra-temel-3": {
    warmup:
      "Kimlik numarasını sohbete yazmak vesikalığı caddeye asmak mıdır? Fatura kâğıdının tamamı yapıştırılınca sır caddeye düşer. Bu derste yapıştırılmayacakları konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Son yazdığın bir metinden silinecek üç sırrı işaretle.",
  },
  "pra-temel-4": {
    warmup:
      "Dünkü pasta tarifi bugünkü site dilekçesine karışır mı? Eski çekmece eski koku taşır. Bu derste her işi ayrı sohbette tutmayı konuşuyoruz.",
    challenge:
      "İsteğe bağlı: İki ayrı iş için iki başlık yaz; tek kutuya sıkıştırma.",
  },
  "pra-temel-5": {
    warmup:
      "Taslağı olduğu gibi kurumun gişesine vermek provasız baskı mıdır? Uydurma madde, uydurma «yasal hak» kâğıtta durabilir. Bu derste okuyup düzeltmeyi konuşuyoruz.",
    challenge:
      "İsteğe bağlı: Bir taslakta en az bir şeyi düzelt; hiç düzeltmeden göndermeme kuralı.",
  },
  "pra-temel-6": {
    warmup:
      "Üç günlük iş: duyuru, ilan, dilekçe taslağı. Put yok; ChatGPT veya Gemini veya Claude. Bu derste üç çıktıyı prova ile kapatıyoruz.",
    challenge:
      "İsteğe bağlı: Üç çıktıyı kendi klasörüne tarihli kaydet. Resmî gönderim yoksa gönderme.",
  },
};

export function academyRealWorldPedagogyForLesson(
  lessonKey: string,
): AcademyRealWorldPedagogy {
  const aliased = ACADEMY_GROWTH_PEDAGOGY_ALIAS[lessonKey];
  const row = ACADEMY_GROWTH_PEDAGOGY[lessonKey] ?? ACADEMY_REAL_WORLD_PEDAGOGY[aliased ?? lessonKey];
  if (!row) {
    throw new Error(`Gerçek dünya pedagojisi yok: ${lessonKey}`);
  }
  return row;
}
