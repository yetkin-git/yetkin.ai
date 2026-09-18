/** Vatandaş Ders 6/9 — dosya adı teknik sonektir (`section_4` / `01_office_ai-4`); sıra `lib/academy/curricula/lesson-index.ts` içindedir. */
import type { Section } from "../types";

export const section4: Section = {
  sectionNumber: 6,
  lessonKey: "01_office_ai-4",
  title: "E-Posta Akışı: Gelen Kutusu Sıfırlama",
  targetDurationMinutes: 9.6,
  estimatedWordCount: 683,
  pedagogicalObjective:
    "Gelen kutusunu önem sırası, taslak yanıt, insan onayı ve arşiv ritüeliyle sıfırlamayı göstermek. Gelen kutu neden şişer? Her satır aynı yığında durur. Mail triyajı nedir? Açmadan önce acil, aksiyon veya arşivlik diye ayırmaktır. Yapay zekâya neden taslak yazdırılır ve insan onayı olmadan gönderilmez? Model nezaket üretir, taahhüt üretemez. Yerleşik panel (Gmail Gemini / Outlook Copilot) sonraki G1 dersindedir.",
  contentMarkdown: `
Hata avı dersinde rapordaki uydurma sayıyı yakaladın. Satır toplamına baktın, genel toplama baktın, kırmızı işareti gördün. O refleks duruyor. Peki neden hâlâ Gmail kapısına geçmiyoruz? Çünkü gelen kutu sıfırlanmadan yerleşik paneli ezberlemek, aynı yığını daha hızlı açmak demektir. Şimdi aynı disiplini gelen kutuya taşıyoruz: etiket, taslak, insan onayı, arşiv. Bu ders ritüeldir. Yerleşik paneli nasıl açacağını G1 dersinde göreceksin.

Selamlar, ben Gözde. İş Hayatında ve Ofiste Yapay Zekâ eğitimimizin e-posta ritüeli dersine hoş geldin. Bugün Gelen Kutusu Sıfırlama alışkanlığını kuracağız. Amaç panel ezberi değil: her yeni iletiyi önem sırasına göre ayırmak, yanıt taslağını insana bırakmak, işi biten iletiyi arşive almak. Peki neden gelen kutu şişer? Çünkü her yeni satır aynı yığında durur; ödeme, bülten ve davet birbirine girer. Sabah yüzünü asan yığın, akşam seni takip etmesin.

Çoğu kişi sorunu bildirim sesi sanır. Asıl sorun, hangi iletinin bugün eylem istediğini ayırt edememektir. Yüzlerce okunmamış satır aynı listede durunca Kaya Gıda tahsilatı Haftalık Bülten'in altında kaybolur. Peki neden bu yığın odak yer? Çünkü etiket yoksa her satır acil gibi durur; acil gibi duran her satır da aslında hiçbirini acil bırakmaz.

## INBOX KAOSU

Sabah yüzlerce okunmamış satır omuzdaki baskıyı artırır. Hangisi ödeme, hangisi bülten, hangisi sadece bilgi? Tek tek açmak günü yer. Peki mail triyajı nedir? Gelen her iletiyi açmadan önce acil, aksiyon veya arşivlik diye ayırmaktır. Etiket yoksa taslak yalandır. Taslak insan onayı olmadan gitmez. Ritüel şudur: önce etiket, sonra taslak, sonra insan, en son arşiv.

Gelen iletileri tek tek okuyup cümle kurmak zaman kaybıdır. Yapay zekâ süzgeçtir, gönderen değil. Bu derste komutu yerleşik panele nasıl yapıştıracağını ezberlemiyoruz. Komutun ne istediğini ezberliyoruz: acil, aksiyon, arşivlik. Neden? Çünkü model sınıflandırır; sen karar verirsin.

## TASLAK YAZ

Ritüelin ikinci adımı taslaktır. Peki yapay zekâya neden taslak yanıt yazdırılır? Çünkü boş ekrana bakıp cümle kurmak dakikaları yer; model tonu ve talebi çözer, sen tarihi ve vaadi kilitlersin. Çıktı gönderilmeye hazır metin değildir; senin üslubunla doğrulanacak taslaktır. Tarih, vaat, fiyat insanındadır. Model nezaket üretir, taahhüt üretemez.

Peki taslak insan onayı verilmeden neden gönderilmez? Çünkü yanlış tarih, yanlış fiyat veya yanlış vaat şirketi bağlar. Karmaşık bir iş teklifinde önce etiket iste: ödeme, onay, bilgi. Sonra taslak iste. Taslağı göndermeden oku. Yanlış tarih varsa sil. Bu adım Gmail veya Outlook fark etmez; ritüel aynıdır. Panel ayrı derstedir.

## SIFIR KUTU

Sol tarafta 142 okunmamış yığın durur. Hangisi acil belirsiz; Kaya Gıda tahsilatı bültenin altında kaybolabilir. Sağ tarafta sıfır kutu durur çünkü her ileti bir etikete ve bir karara bağlanmıştır. Sıfır kutu sihir değildir. Arşiv, silmek değildir. İş biten satır görünmez olur; aradığın eski yazışma durur.

## FARK ORTADA

142 okunmamış satır odak yer. Sıfır kutu bir buçuk saatlik net alan bırakır. Peki neden fark bu kadar belirgin? Çünkü etiket yoksa taslak kördür. İnsan onayı yoksa taslak şirketi bağlar. Fark panel markası değil, ritüeldir.

## CEBİNE KOY

Bu dersten üç adım çıkar. 1. Her yeni iletiyi acil, aksiyon veya bilgi diye etiketle. Çünkü etiket yoksa her satır acil gibi durur ve gerçek ödeme kaybolur. 2. Aksiyon gereken ileti için taslak iste; göndermeden oku. Çünkü model nezaket üretir, taahhüt üretemez. 3. İş biten iletiyi arşive al. Çünkü arşiv silmek değildir; işi biten satır ana ekrandan iner, eski yazışma durur. Gelen kutu gün boyu temiz kalsın.

## SIRA SENDE

Sıra sende. Kendi kutundan en az beş ileti seç. Önce etiket iste, sonra iki taslak doğrula, işi biteni arşive al. Taslağı göndermeden oku. Yerleşik paneli henüz ezberleme. Bir sonraki derste Gmail Gemini ve Outlook Copilot ile aynı ritüeli yerinde basacağız. Çıktı aksiyon listesidir: kim, ne, ne zaman. İnsan onayı olmadan kutu sıfırlanmaz.

## El kitabı (kasetin sığdırmadığı)

### Lisans yoksa ne yapılır?
Outlook Copilot yoksa ritüeli Gmail Gemini’ye taşı. Gemini eklentisi de yoksa maili dış sohbete taşıma; G1 dersinde bunun neden atlanmış kapı olduğunu göreceksin. Son çare 3. Kapı: isim ve hesap maskeli, üç satırlık özet.

### Kenar durum / dikkat edilecek hata
Otomatik gönderim. Taslak «gönder» değildir. İkinci kenar: bülteni acil etiketlemek. Model her ödeme kelimesini kırmızıya boyar; sen tarih ve tutarı kilitle.

### Yapılmaması gereken tuzak
Gelen kutusunu dış sohbete yapıştırmak. İkinci tuzak: bu dersi G1 ile aynı sanmak. Burada ritüel durur. Asıl kapı, aksiyon tablosu ve yerleşik panel bir sonraki derstedir.
`,
};
