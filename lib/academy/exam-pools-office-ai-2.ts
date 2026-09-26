import type { AcademyExamQuestion } from "@/lib/academy/types";
import { mcq } from "@/lib/academy/exam-pools-growth";

/**
 * OFF-201 kurs sonu havuzu — slug `01_office_ai_ileri`.
 * 36 özgün kök. Ders mini sınavı (`q_off201_l*`) gömülmez.
 * Baraj `ACADEMY_EXAM_PASS_SCORE` (A4, 70). Puan sunucuda hesaplanır.
 * Bu sürümde yoktur: XLOOKUP, özet tablo, OCR, belge birleştirme.
 */
export const OFFICE_AI_2_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  mcq(
    "q_off201_1",
    "Saat 10'daki toplantıdan önce üç bölgenin notunu özetlemen isteniyor. Sohbet kutusuna yazacağın istemde dört parça hangisidir?",
    [
      "Rol, görev, biçim ve kısıt",
      "Renk, punto, logo ve slayt sayısı",
      "Konu, selamlama, imza ve ek dosya",
      "Tarih, saat, salon ve katılımcı listesi",
    ],
    0,
  ),
  mcq(
    "q_off201_2",
    "Masanda Marmara 120 sipariş, Ege 80 sipariş ve eksik bir İç Anadolu satırı duruyor. Kutuya yalnız «Bunu güzelce özetle» yazarsan ne olur?",
    [
      "Sohbet kutusu yalnız nottaki 120 ve 80 ile üç madde döndürür",
      "Şekil ve sınır olmadığı için notta olmayan bir sayı veya fazla iş eklenebilir",
      "Eksik satır kendiliğinden doğru adede tamamlanır",
      "Kişi adı notta olsa bile cevaba asla taşınmaz",
    ],
    1,
  ),
  mcq(
    "q_off201_3",
    "Notun son satırında Ayşe Yılmaz ve bir telefon duruyor. Ürün adı ile kişiye bağlı olmayan sipariş sayısı da var. Kutuya ne koyarsın?",
    [
      "Adı ve telefonu bırakırsın; sipariş sayılarını silersin",
      "Dört satırın hepsini olduğu gibi yapıştırırsın",
      "Adı ve telefonu çıkarırsın; ürün adı ve kişiye bağlı olmayan sipariş sayısı kalabilir",
      "Telefonu son dört haneye indirip adı baş harfle yazarsın",
    ],
    2,
  ),
  mcq(
    "q_off201_4",
    "Şirketin onayladığı araç yok. Üç bölgenin notunu nereye koymazsın?",
    [
      "Kişisel sohbet hesabına",
      "Onaylı iş panelinin içine",
      "Maskeli kısa özet olarak, ad ve telefon çıkmış halde",
      "İş hesabındaki yerleşik panele",
    ],
    0,
  ),
  mcq(
    "q_off201_5",
    "İç Anadolu satırı eksik. Yönetici bu nottan sayı okumanı istemiyor. Cevapta ne yaparsın?",
    [
      "Eksik satırı 120 ile 80'in ortası olan bir adede çevirirsin",
      "Eksik satıra sıfır yazıp toplamı ona göre kilitlersin",
      "Eksik satırı Marmara'nın kopyası sayarsın",
      "Eksik satırı sayıya çevirmezsin; notta sayı yoksa cevapta da sayı durmaz",
    ],
    3,
  ),
  mcq(
    "q_off201_6",
    "Yönetici özeti bitince «bir de e-posta yaz» diyor. Aynı kutuya ne eklersin?",
    [
      "Özet, slayt ve e-postayı tek görevde birleştirirsin",
      "Özet bitmiştir; e-posta yeni istemdir ve onda da rol, görev, biçim, kısıt durur",
      "Eski cevabın üstüne «gönder» yazarsın",
      "Ham notu kişisel hesaba taşıyıp oradan mail açarsın",
    ],
    1,
  ),
  mcq(
    "q_off201_7",
    "İki depo daveti aynı Perşembe saat 10:00'ı tutuyor. Not, kimin kayacağını yazmıyor. Eylem listesinde ne yaparsın?",
    [
      "İki daveti tek randevuya indirir, çakışmayı silersin",
      "Saat 10:00'ı 11:00 yapıp takvime yazarsın",
      "Çakışmayı ayrı satırda işaretlersin; iki daveti tek randevuya indirmez, yeni saat uydurmazsın",
      "Notta olmayan bir Perşembe tarihi seçip tek davet bırakırsın",
    ],
    2,
  ),
  mcq(
    "q_off201_8",
    "Toplantı notunda «Perşembe 10:00» var, ayın kaçı yok. Cevaba tarih nasıl girer?",
    [
      "Sohbet kutusunun seçtiği ilk boş Perşembe yazılır",
      "Gelecek ayın ilk Perşembe günü yazılır",
      "Notta ayın kaçı yoksa cevapta da tarih durmaz",
      "Bugünün tarihi yazılır",
    ],
    2,
  ),
  mcq(
    "q_off201_9",
    "Eylem listesi geldi. Çakışma satırı duruyor. Listeyi takvime ne zaman işlersin?",
    [
      "Cevap akıcıysa hemen",
      "Satırları nottaki saatlerle karşılaştırdıktan sonra, yönetici yaz dediğinde",
      "Çakışmayı silip tek saati kilitleyince",
      "Sohbet kutusu «takvime işlendi» yazınca",
    ],
    1,
  ),
  mcq(
    "q_off201_10",
    "Çakışma satırı duruyor. Yönetici «takvime de işle» diyor. Saati ne yaparsın?",
    [
      "İki aracı aynı saate koyarsın",
      "Çakışan saati kilitlemezsin; takvime işlemek yeni istemdir",
      "Notta olmayan bir saat yazıp çakışmayı kapatırsın",
      "Kişisel takvime ham notu yapıştırırsın",
    ],
    1,
  ),
  mcq(
    "q_off201_11",
    "Toplantı notunda Selin Korkmaz ve telefonu var. Depo adı ve saat de var. Maskeli notta ne kalır?",
    [
      "Ad ve telefon kalır; depo adı silinir",
      "Ad ve telefon çıkar; depo adı ve saat kalabilir",
      "Telefonun son dört hanesi ve adın baş harfi kalır",
      "Ham not olduğu gibi kalır",
    ],
    1,
  ),
  mcq(
    "q_off201_12",
    "Şirketin onayladığı takvim aracı yok. Ham toplantı notunu nereye koymazsın?",
    [
      "İş hesabındaki onaylı panele",
      "Maskeli kısa özete, ad ve telefon çıkmış halde",
      "Kişisel hesaba",
      "Yerleşik takvim paneline, iş hesabındaysa",
    ],
    2,
  ),
  mcq(
    "q_off201_13",
    "Tabloda Marmara 120 ve Ege 80 duruyor. Toplam hücresi boş. Toplantıdan önce toplamı nasıl kilitlersin?",
    [
      "200 yazıp hücreyi düz sayı bırakırsın",
      "Toplama formülünü hücreye yazarsın; düz sayı masaya konmaz",
      "İki sayının ortasını alıp hücreye yazarsın",
      "Sohbet kutusunun yazdığı toplamı kontrol etmeden grafiğe bağlarsın",
    ],
    1,
  ),
  mcq(
    "q_off201_14",
    "Formülü B4'e yazdın. Hücre henüz 120 ile 80'in toplamını göstermiyor. Grafiği ne zaman seçersin?",
    [
      "Hücre doğru toplamı göstermeden grafik seçmezsin",
      "Sohbet kutusu grafik istediği anda",
      "Düz 200 yazdıktan hemen sonra",
      "Üçüncü bir dilim ekledikten sonra",
    ],
    0,
  ),
  mcq(
    "q_off201_15",
    "Yönetici yüzde istemedi. Notta yalnız 120 ve 80 var. Cevapta yüzde ve üçüncü bir dilim görürsen ne yaparsın?",
    [
      "Yüzdeyi toplantıda okursun",
      "Üçüncü dilimi sıfır kabul edersin",
      "İkisini toplayıp grafiğe düz sayı olarak yazarsın",
      "Yüzdeyi ve üçüncü dilimi silersin; kaynakta yoksa masaya konmaz",
    ],
    3,
  ),
  mcq(
    "q_off201_16",
    "Tablo satırında bir ad ve IBAN duruyor. Bölge adı ve adet de duruyor. Onaylı araca ne gider?",
    [
      "Ad, IBAN, bölge ve adet birlikte",
      "Yalnız IBAN'ın son dört hanesi",
      "Ad ve IBAN çıkar; bölge adı ve adet kalabilir",
      "Tablo kişisel hesaba, özet iş paneline",
    ],
    2,
  ),
  mcq(
    "q_off201_17",
    "Toplama formülünü hücreye sen yazdın. Formülün durduğunu nasıl görürsün?",
    [
      "Hücrenin rengini değiştirirsin",
      "Hücreye tıklayıp F2 ile formülü açar, iki adedi kendin toplarsın",
      "Düz sayıyı kalın yazarsın",
      "Grafiği önce seçer, formüle sonra bakarsın",
    ],
    1,
  ),
  mcq(
    "q_off201_18",
    "Şirketin onayladığı tablo aracı yok. Ham tabloyu nereye koymazsın?",
    [
      "Kişisel hesaba",
      "İş hesabındaki yerleşik tablo paneline",
      "Ad ve IBAN çıkmış maskeli kısa özete",
      "Onaylı dosya ataşına, iş hesabında",
    ],
    0,
  ),
  mcq(
    "q_off201_19",
    "Uzun belgede ödeme günü, gecikme oranı, fesih süresi ve gizlilik süresi var. Madde listesini nasıl denetlersin?",
    [
      "«Tam analiz» cümlesi yeter; sayfa açılmaz",
      "Her satırın sayfasını açarsın; sayfada yoksa o satır durmaz",
      "İlk sayfayı okuyup kalanını sohbet kutusue bırakırsın",
      "Sayfa numarası uydurup listeyi kapatırsın",
    ],
    1,
  ),
  mcq(
    "q_off201_20",
    "Sohbet kutusu gecikme oranını yüzde 10 yazdı. O sayfayı açtın; sayfada oran yok. Ne yaparsın?",
    [
      "Yüzde 10'u listede bırakırsın",
      "Oranı yüzde 5'e indirip kaydedersin",
      "Sayfada yoksa o satırı silersin",
      "«Tam analiz» yazıp satırı kapatırsın",
    ],
    2,
  ),
  mcq(
    "q_off201_21",
    "Sohbet kutusu «tam analiz edildi» diyor. Listede olmayan bir iş de var. Ne yaparsın?",
    [
      "«Tam analiz» cümlesi sayfa kontrolünün yerini tutmaz; o sayfayı sen açarsın",
      "Cümle varsa liste kapanır",
      "Olmayan işi de madde diye eklersin",
      "Belgeyi kişisel hesaba taşıyıp yeniden yüklersin",
    ],
    0,
  ),
  mcq(
    "q_off201_22",
    "Sözleşme taslağında taraf adı, kimlik numarası ve IBAN duruyor. Onaylı araca ne gider?",
    [
      "Taraf adı kalır, kimlik ve IBAN gider",
      "Kimlik numarası kalır, ad maskelenir",
      "Üçü de ham haliyle gider",
      "Taraf adı, kimlik numarası ve IBAN çıkar; dört işin adı kalabilir",
    ],
    3,
  ),
  mcq(
    "q_off201_23",
    "Cevapta «sayfa 22» yazıyor. Dosyada sayfa 22 yok. O satırı ne yaparsın?",
    [
      "Sayfa 22 diye bırakırsın",
      "O satırı silersin",
      "Sayfa 2 olarak düzeltirsin",
      "«Tam analiz» ile kapatırsın",
    ],
    1,
  ),
  mcq(
    "q_off201_24",
    "Şirketin onayladığı belge aracı yok. Sözleşmeyi nereye koymazsın?",
    [
      "İş hesabındaki yerleşik belge paneline",
      "Kimlik ve IBAN çıkmış maskeli kısa özete",
      "Kişisel hesaba",
      "Onaylı ataş yoluna, iş hesabında",
    ],
    2,
  ),
  mcq(
    "q_off201_25",
    "Tek postada stok bilgisi, gecikme şikayeti ve kimlik talebi duruyor. Üç sınıf hangisidir?",
    [
      "Bilgi, şikayet ve kişisel veri talebi",
      "Acil, normal ve reklam",
      "Gelen, giden ve taslak",
      "Satış, finans ve hukuk",
    ],
    0,
  ),
  mcq(
    "q_off201_26",
    "Üç iş tek postada. Taslak nasıl durur?",
    [
      "Üç iş tek paragrafta birleşir",
      "Her iş ayrı satırdadır",
      "Yalnız şikayet yazılır, diğerleri silinir",
      "Sohbet kutusu «nazikçe cevapla» deyince tek cümle yeter",
    ],
    1,
  ),
  mcq(
    "q_off201_27",
    "Taslağın üstünde «Gönderildi» yazıyor. Gönder düğmesine sen basmadın. Ne yaparsın?",
    [
      "Yazı varsa posta gitmiş sayılır",
      "Taslağı olduğu gibi iletirsin",
      "«Gönderildi» düğmenin yerini tutmaz; gönder düğmesine basmazsın",
      "Kişisel kutudan yeniden gönderirsin",
    ],
    2,
  ),
  mcq(
    "q_off201_28",
    "Taslakta Mehmet Kaya, telefon, IBAN ve kimlik numarası belirdi. Ne yaparsın?",
    [
      "Ad kalsın, diğerlerini sil",
      "IBAN'ın son dört hanesi kalsın",
      "Akıcıysa olduğu gibi gönder",
      "Ad, telefon, IBAN ve kimlik numarasını taslaktan silersin",
    ],
    3,
  ),
  mcq(
    "q_off201_29",
    "Notta stok 120 koli. Sohbet kutusu 200 koli ve yüzde 10 tazminat yazdı. Şirket kuralında bu tazminat yok. Ne yaparsın?",
    [
      "200 ve yüzde 10'u bırakırsın",
      "Notta olmayan sayıyı ve kuralda olmayan tazminatı silersin; 120'yi sen yazarsın",
      "İkisinin ortasını alırsın",
      "Yüzde 10'u finansa iletirsin",
    ],
    1,
  ),
  mcq(
    "q_off201_30",
    "Şirketin onayladığı posta aracı yok. İş postasını nereye koymazsın?",
    [
      "Kişisel hesaba",
      "İş hesabındaki yerleşik posta paneline",
      "Ad, telefon ve IBAN çıkmış maskeli kısa özete",
      "Onaylı iş kutusunun içine",
    ],
    0,
  ),
  mcq(
    "q_off201_31",
    "Tabloda B2 hücresi 120. Yazılı not 150 diyor. Karar notuna hangi sayı girer?",
    [
      "150, çünkü yazılı not daha yeni",
      "135, çünkü ikisinin ortası",
      "150 karar notuna girmez; hücre 120 ise uyuşmayan 150 yazılmaz",
      "İkisi de yazılır, yönetici seçer",
    ],
    2,
  ),
  mcq(
    "q_off201_32",
    "120 ile 150 uyuşmuyor. Sohbet kutusu 135 yazıp «uzlaştırdım» diyor. 135 neyin sayısıdır?",
    [
      "İki sayının ortasıdır; hiçbir dosyada yoktur, karar notuna girmez",
      "Tablonun yeni toplamıdır",
      "Sayfa 4'teki resmi adettir",
      "Satın almanın bakacağı sayıdır",
    ],
    0,
  ),
  mcq(
    "q_off201_33",
    "Sohbet kutusu «kaynaklar uyumlu» diye tek paragraf döndürdü. Tablo ile not hâlâ ayrı. Ne yaparsın?",
    [
      "Paragraf varsa denetim biter",
      "«Kaynaklar uyumlu» denetimin yerini tutmaz; hücreyi ve sayfayı sen açarsın",
      "135'i karar notuna yazarsın",
      "Üç dosyayı kişisel hesaba taşırsın",
    ],
    1,
  ),
  mcq(
    "q_off201_34",
    "Üç dosyada ad, telefon, kimlik numarası ve IBAN duruyor. Karar notuna ne girmez?",
    [
      "Marmara adedi, hücreyle aynıysa",
      "Ödeme günü, sayfadaki günse",
      "Gecikme oranı, sayfadaki oran ise",
      "Ad, telefon, kimlik numarası ve IBAN",
    ],
    3,
  ),
  mcq(
    "q_off201_35",
    "Yazılı nottaki sayı ne hücrede ne de açık sayfada var. Karar notuna ne yazarsın?",
    [
      "O sayıyı da eklersin; üç dosya birden okunmuş olur",
      "Uyuşmayan sayıyı karar notuna koymazsın",
      "İki dosyanın ortasını yeni sayı diye yazarsın",
      "«Kaynaklar uyumlu» yazıp kapatırsın",
    ],
    1,
  ),
  mcq(
    "q_off201_36",
    "Şirketin onayladığı araç yok. Tablo, yazılı not ve uzun belgeyi nereye koymazsın?",
    [
      "İş hesabındaki yerleşik panele",
      "Ad ve IBAN çıkmış maskeli kısa özete",
      "Kişisel hesaba",
      "Onaylı ataş yoluna, iş hesabında",
    ],
    2,
  ),
];
