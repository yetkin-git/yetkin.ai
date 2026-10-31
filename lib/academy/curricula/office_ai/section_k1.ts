import { ACADEMY_KVKK_DELETE_BUTTON_SUMMARY } from "@/lib/academy/kvkk-workspace";
import type { Section } from "../types";

export const sectionK1: Section = {
  sectionNumber: 2,
  lessonKey: "01_office_ai-k1",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Kişisel Verileri Maskeleme: Müşteri Verisi AI'a Nasıl Yüklenir?",
  targetDurationMinutes: 3.8,
  estimatedWordCount: 647,
  pedagogicalObjective:
    "Ham T.C. Kimlik No, telefon ve IBAN yapay zekâya gitmez. Excel veya sohbet kutusunda adı ve telefonu beş saniyede maskele. Maskeli tabloyu ataşla; şablonu çıkış paketinden indir.",
  contentMarkdown: `
İlk derste tabloyu A1 kuralıyla düzenledin. Bu dersin sonunda müşteri adını ve telefonunu tek başına maskeleyeceksin. Şimdi mantığı oturtalım. Temiz tablo, yükleme izni değildir. Neden? Çünkü düzgün hücrede bile T.C. Kimlik No, telefon ve IBAN durabilir. Ham kimlik yapay zekâya gitmez. Bu ders madde ezberi değildir. Masada üç hücreyi kapatacaksın.

## ALTIN KURAL

Selamlar, ben Gözde. Bugün KVKK maddesini ezberlemiyoruz. Altın kural şudur: şirket içi hassas müşteri verisini ham haliyle yapay zekâya göndermezsin. T.C. Kimlik No, telefon ve IBAN sohbet kutusunun işi değildir. Neden? Çünkü bir kez giren satır, ekrandan silmekle geri gelmez. Ücretli sohbet de aynı kapıdır. Bu yüzden önce maskelersin, sonra sorarsın.

## HAM SATIR

Masada üç sütun açık durur: Ad, Telefon, IBAN. Örnek satır Ayşe Kaya, açık telefon, açık IBAN. Bu satırı ChatGPT kutusuna yapıştırmazsın. Neden beş saniye yeter? Çünkü değiştireceğin üç hücredir; bütün dosyayı yeniden yazmazsın. Excel'de o hücreye tıkla. Takma değeri yaz. Ürün adı yerinde kalır. Kişi gider, iş kalır.

## MASKELE

Ad hücresine Ayşe Kaya yerine Müşteri A yaz. Telefon hücresine MASKELİ_TELEFON yaz. IBAN hücresine MASKELİ_IBAN yaz. Alt çizgili büyük harf boşluk değildir. Kişi kimliği gider, sütun mantığı kalır. Aynı kural Copilot şeridinde de, Gemini ataşında da durur. Araç değişir, ham ad gitmez. Beş saniye bu üç hücrenin işidir.

## BEŞ SANİYE

Şimdi aynı üç hücreyi sohbet kutusunda da gör. Ham satırı yapıştırma. Maskeli satırı yaz: Müşteri A, MASKELİ_TELEFON, MASKELİ_IBAN. Copilot varsa şeritte bu üç hücreyi değiştir. Yoksa Excel'de kendin yaz, sonra maskeli tabloyu ataşla. Peki neden ham kopya bir saniye sürse de yasaktır? Çünkü model hızlı cevap için kimliği de okur.

Ad ve telefon birlikte durursa satır bir insanı ele verir. IBAN o satıra eklenirse ödeme adresi de açıkta kalır. Maske, silmek değildir. Satırı silersen tablo mantığı da gider. Takma değer hem korur hem öğretir. Gördüğün gibi istem günlük dille durur: ad yok, telefon yok. Sütun adı durur, insan açıkta kalmaz.

## FARK ORTADA

Ekrana bak. Sol tarafta ham yapıştırma durur: Ayşe Kaya ve açık IBAN. Sağ tarafta maskeli satır durur: Müşteri A ve MASKELİ_IBAN. Sol taraf bir saniye sürer ve insanı açıkta bırakır. Sağ tarafı seçiyoruz, çünkü aynı soruyu kimliksiz sorarsın. Fark, hangi aracı açtığında değil, o araca neyin girdiğindedir. Dış sohbete yalnız maskeli kısa özet gider.

## CEBİNE KOY

Maskeli tabloyu yapay zekâya şöyle verirsin. Ürün ve adet kalsın. Ad, telefon ve IBAN takma değerde kalsın. Modele şunu yazabilirsin: Bu üç satır maskelidir. Ad yok, telefon yok. Sütun adları Ürün, Adet, Bölge. Bölge bazında üç maddelik özet iste. Kişi adı üretme. Çıkan metinde açık ad görürsen masaya koyma.

İndirilebilir Excel maskeleme şablonu aynı sütunları taşır. Ad yerine Müşteri A, telefon yerine MASKELİ_TELEFON, IBAN yerine MASKELİ_IBAN. Şablonu çıkış paketinden indir. Kendi listenin üstüne takma değeri yaz. Ham dosyayı sohbete bırakma. Sonra maskeli tabloyu ataşla ve kısa sorunu yaz. Şablon, ezber değil, masadaki sıradır.

## SIRA SENDE

Sıra sende. Masandaki listeyi aç. T.C. Kimlik No, telefon veya IBAN görürsen önce maskele. Şablondaki üç takma değeri kendi satırına yaz. Ham dosyayı ChatGPT kutusuna bırakma. Sıradaki ders rapordur: temiz ve maskeli tablodan üç maddelik yönetim özeti.

## El kitabı (sesin sığdırmadığı)

### Lisans yoksa ne yapılır?
Ham ad, telefon, IBAN, kimlik, maaş sohbete yüklenmez. Ayrıntı şirketinin kuralıdır. Bu ders hukuki danışmanlık değildir. Yerleşik panel veya ataş duruyorsa ham listeyi dış sohbete taşıma.

### Ücretli abonelik
Aboneliğin ücretli (Plus/Pro/Team) olsa bile açık sohbete ham kişisel veri ve şirket sırrı atılamaz. Ücretli üyelik modeli eğitmese de veri sunucuya gider. Yüklemeden önce her zaman maskeliyoruz.

### Kenar durum / dikkat edilecek hata
Açık katalog bilgisi (ürün adı, genel stok cümlesi — kişiye bağlı değil) gidebilir; aynı satırda kişi adı belirdiği anda dur. Müşteri programı (CRM) ekran görüntüsü ham kimlik taşır; sohbete girmez.

### Yapılmaması gereken tuzak
«Sohbeti sonra silerim.» ${ACADEMY_KVKK_DELETE_BUTTON_SUMMARY}
`,
};
