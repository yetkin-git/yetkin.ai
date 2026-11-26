/**
 * Kamuya açık sözlük. Müzedeki platform sözlüğünden ticari arama değeri
 * yüksek 30 terim, canlı ürüne uyarlandı. Kapalı freelancer odası ve
 * emanet vaadi bu sayfalarda açılmaz.
 */

export const GLOSSARY_PATH = "/sozluk" as const;

export type GlossaryTerm = {
  slug: string;
  term: string;
  definition: string;
  tezgahExample: string;
  toolHref: string;
  toolLabel: string;
  examHref: string;
  examLabel: string;
};

export const GLOSSARY_TERMS: readonly GlossaryTerm[] = [
  {
    slug: "muhur",
    term: "Mühür",
    definition:
      "Bir dersin, sınavın veya belgenin sunucuda onaylandığını gösteren kalıcı damga. Satın alma mühür basmaz; barajı geçen sınav basar.",
    tezgahExample:
      "AI Tezgâh'ta ürettiğin ürün kartını portföye eklersin. Mühür, aynı işi sınavda gösterdiğinde Kariyer Kartına işlenir.",
    toolHref: "/tezgah",
    toolLabel: "AI Tezgâhı aç",
    examHref: "/career",
    examLabel: "Kariyer kartını aç",
  },
  {
    slug: "vize",
    term: "Vize",
    definition:
      "Doğrulanmış rozetin kamu adıdır. Eski aramalarda kariyer vizesi diye geçer. Kimlik numarası ve e-posta kartta yoktur.",
    tezgahExample:
      "Tezgâh çıktısını sınavla mühürlediğinde kart /vize adresinde açılır. İşveren bu bağdan belgenin durduğunu görür.",
    toolHref: "/tezgah",
    toolLabel: "Tezgâhta örnek üret",
    examHref: "/career",
    examLabel: "Kariyer kartını aç",
  },
  {
    slug: "vize-muhru",
    term: "Vize Mührü",
    definition:
      "Vizenin üzerindeki tek damga. İptal edilen sertifikanın mühürü kamu kartında durmaz.",
    tezgahExample:
      "Tezgâh taslağı mühür değildir. Mühür, uygulamalı testi geçtiğinde Kariyer Kartına işlenir.",
    toolHref: "/tezgah?tool=proposal",
    toolLabel: "Teklif taslağı üret",
    examHref: "/career",
    examLabel: "YetkinCV'yi İncele",
  },
  {
    slug: "liyakat",
    term: "Liyakat",
    definition:
      "İşin ölçüldüğü yetkinlik. Puan satın alınmaz; uygulamalı test sonucundan okunur.",
    tezgahExample:
      "Tezgâhta yazdığın metin pratiktir. Liyakat, aynı beceriyi YetkinCV testinde gösterdiğinde rozete dönüşür.",
    toolHref: "/tezgah",
    toolLabel: "Pratik üret",
    examHref: "/career",
    examLabel: "YetkinCV'yi İncele",
  },
  {
    slug: "liyakat-pasaportu",
    term: "Liyakat Pasaportu",
    definition:
      "Rozetlerin ve doğrulama bağlarının toplandığı kimlik defteri. Vatandaşlık belgesi değildir.",
    tezgahExample:
      "Her tezgâh aracı bir pratik bırakır. Pasaporttaki damga, o pratiğin sınav karşılığıdır.",
    toolHref: "/tezgah",
    toolLabel: "AI Tezgâhı aç",
    examHref: "/career",
    examLabel: "Kariyer kartını aç",
  },
  {
    slug: "dijital-pasaport",
    term: "Dijital Pasaport",
    definition:
      "Liyakat pasaportunun kamu dilindeki adıdır. Paylaşılan bağ /vize kartıdır; hesap şifresi bu bağda yoktur.",
    tezgahExample:
      "Ürettiğin teklif veya ürün kartını portföy özetine eklersin. Kartı açan kişi damgayı ve kısa kanıtı görür.",
    toolHref: "/tezgah?tool=proposal",
    toolLabel: "Teklif yaz",
    examHref: "/career",
    examLabel: "Kariyer kartını aç",
  },
  {
    slug: "kanit-yolu",
    term: "Kanıt yolu",
    definition:
      "Bir uzmanlık paketinin ders sırası. Yol bitince sınav açılır. Yolun kendisi belge basmaz.",
    tezgahExample:
      "Tezgâh, kanıt yolundaki işi masada dener. Örneğin e-ticaret yolunda ürün açıklamasını pazaryeri aracıyla yazarsın.",
    toolHref: "/tezgah?tool=pazaryeri",
    toolLabel: "Ürün kartı yaz",
    examHref: "/career",
    examLabel: "Kariyer kartını aç",
  },
  {
    slug: "durak",
    term: "Durak",
    definition: "Kanıt yolundaki tek ders. Durağı bitirmek o dersin kaydını düşer; sertifika ayrı sınavdadır.",
    tezgahExample:
      "Durakta gördüğün tabloyu veya e-postayı Tezgâh'ta kendi cümlenle yeniden üretirsin. Hazır cevap ezberi değildir.",
    toolHref: "/tezgah",
    toolLabel: "Dersi tezgâhta dene",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "baraj",
    term: "Baraj",
    definition: "Yetkinlik testinin geçme eşiği. Altında kalan sonuç belgelenmez.",
    tezgahExample:
      "Tezgâh pratiği barajı geçirmez. Baraj, YetkinCV veya ilgili testteki sunucu puanıdır.",
    toolHref: "/tezgah",
    toolLabel: "Tezgâhta pratik yap",
    examHref: "/career",
    examLabel: "YetkinCV'yi İncele",
  },
  {
    slug: "tezgah",
    term: "Tezgâh",
    definition:
      "AI Tezgâh, ürün kartı, teklif, hibe dosyası, reklam metni ve web site analizi üreten çalışma masasıdır. Ücretli ilan tahtası değildir.",
    tezgahExample:
      "Misafir günde üç üretim yapar. Çıktıyı kaydetmek için ücretsiz hesap yeter. Cüzdan bu masada zorunlu değildir.",
    toolHref: "/tezgah",
    toolLabel: "Tezgâhı aç",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "vitrin",
    term: "Vitrin",
    definition:
      "Herkese açık ürün veya uzman yüzü. Uzman vitrini rozet kartıdır. Mağaza vitrini dijital dükkân sayfasıdır. İkisi de ödeme kasası değildir.",
    tezgahExample:
      "Dijital dükkân aracı tek sayfalık vitrin basar. YetkinCV yetenek vitrini ise /career/vitrin dizininde, en az beş kişi varken açılır.",
    toolHref: "/tezgah?tool=dukkan",
    toolLabel: "Dükkân vitrini üret",
    examHref: "/career",
    examLabel: "Kariyer kartını aç",
  },
  {
    slug: "kosgeb",
    term: "KOSGEB",
    definition:
      "Küçük ve orta ölçekli işletmelere destek programı açan kamu kurumu. Uygunluk, çağrı metninden okunur; platform onay vermez.",
    tezgahExample:
      "Hibe aracı, yazdığın iş fikrine göre katalogdaki çağrıyı eşler ve proje dosyası taslağı üretir. Karar kurumundur.",
    toolHref: "/tezgah?tool=grant",
    toolLabel: "Hibe dosyası taslağı",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "tubitak",
    term: "TÜBİTAK",
    definition:
      "Araştırma ve teknoloji projelerine destek veren ulusal kurum. Çağrı şartı her programda ayrıdır.",
    tezgahExample:
      "Tezgâh, Ar-Ge fikrini proje diline çevirmene yardım eder. Destek tutarını ve kabulü uydurmaz.",
    toolHref: "/tezgah?tool=grant",
    toolLabel: "Proje taslağı yaz",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "teydeb",
    term: "TEYDEB",
    definition: "TÜBİTAK'ın sanayi Ar-Ge projelerini değerlendiren birimi. Başvuru, kurumun kendi çağrı takvimine bağlıdır.",
    tezgahExample:
      "İş paketini ve adam-ay gerekçesini Tezgâh'ta düzgün cümleye dökersin. Hakem puanı burada hesaplanmaz.",
    toolHref: "/tezgah?tool=grant",
    toolLabel: "Ar-Ge taslağı üret",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "kobigel",
    term: "KOBİGEL",
    definition: "KOSGEB'in KOBİ gelişim destek programı ailesi. Şartname program yılında değişir.",
    tezgahExample:
      "Dijitalleşme veya üretim fikrini hibe aracına yazarsın. Araç katalog eşleşmesi yapar, kabul mektubu basmaz.",
    toolHref: "/tezgah?tool=grant",
    toolLabel: "KOBİGEL taslağı",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "turquality",
    term: "Turquality",
    definition:
      "Ticaret Bakanlığı'nın markaların yurt dışında büyümesi için açtığı destek programı. Marka tescili ve ihracat şartı programa bağlıdır.",
    tezgahExample:
      "Pazaryeri aracı yurt dışı ürün metnini düzenler. Turquality kabulünü veya destek tutarını yazmaz.",
    toolHref: "/tezgah?tool=pazaryeri",
    toolLabel: "Ürün metnini hazırla",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "adam-ay",
    term: "Adam-ay",
    definition:
      "Bir kişinin bir ay tam zamanlı çalışmasına denk iş gücü birimi. Hibe bütçesinde personel kalemi çoğu zaman böyle yazılır.",
    tezgahExample:
      "Proje dosyasında iki kişi yarım dönem çalışacaksa bunu adam-ay cümlesine çevirirsin. Tutar uydurulmaz.",
    toolHref: "/tezgah?tool=grant",
    toolLabel: "Personel gerekçesi yaz",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "api-anahtarlari",
    term: "API Anahtarları",
    definition:
      "Bir yazılımın başka bir hizmete kendi adına bağlanması için verilen gizli kod. Anahtar sayfaya, sohbete ve tezgâh çıktısına yapıştırılmaz.",
    tezgahExample:
      "SaaS iskelet aracı ekran ve akış taslağı üretir. Anahtarı senin kasanda tutar; çıktıya gömmez.",
    toolHref: "/tezgah?tool=saas-builder",
    toolLabel: "İskelet taslağı üret",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "deneme-tezgahi",
    term: "Deneme Tezgâhı",
    definition:
      "Canlı müşteri verisi olmadan denenen çalışma yüzeyi. AI Tezgâh misafir kotası bu denemenin kendisidir.",
    tezgahExample:
      "Üç ücretsiz üretimde metni görürsün. Beğenmezsen kaydetmezsin. Deneme, rozet basmaz.",
    toolHref: "/tezgah",
    toolLabel: "Denemeyi başlat",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "iki-adimli-dogrulama",
    term: "İki Adımlı Doğrulama",
    definition:
      "Şifrenin yanına ikinci bir kod isteyen kilit. Hesap güvenliğidir; rozet veya ödeme yerine geçmez.",
    tezgahExample:
      "Tezgâh çıktısını müşteriye göndermeden önce hesabının ikinci kilidi açık olsun. Araç bu kodu üretmez ve istemez.",
    toolHref: "/tezgah",
    toolLabel: "Çıktıyı üret",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "kimlik-dogrulama",
    term: "Kimlik Doğrulama",
    definition:
      "Fatura için yazdığın ad ve vergi bilgisi. Nüfus müdürlüğü sorgusu değildir. TCKN kamu kartında gösterilmez.",
    tezgahExample:
      "Tezgâh metni kimlik belgesi istemez. Fatura bilgisi yalnız satın alma kasasında, ayrı alanda durur.",
    toolHref: "/tezgah",
    toolLabel: "Tezgâhı aç",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "yetenek-radari",
    term: "Yetenek Radarı",
    definition:
      "Hangi dikeyde kaç doğrulanmış rozet olduğunu gösteren kamu sayımı. Beşten az kişide sayı ve liste basılmaz.",
    tezgahExample:
      "Radar skor uydurmaz. Tezgâhta üretim yapar, sınavı geçersen kartın dizine ancak eşik dolunca düşer.",
    toolHref: "/tezgah",
    toolLabel: "Tezgâhta pratik yap",
    examHref: "/career",
    examLabel: "Kariyer kartını aç",
  },
  {
    slug: "profil",
    term: "Profil",
    definition:
      "Kamuya açılan yüz, /vize kartıdır. Hesap ayarı, e-posta ve fatura bu kartta yoktur.",
    tezgahExample:
      "Portföy başlığın kartta kısa özet olarak durur. Tezgâh gövdesinin tamamı kamu kartına dökülmez.",
    toolHref: "/tezgah",
    toolLabel: "Portföy parçası üret",
    examHref: "/career",
    examLabel: "Kariyer kartını aç",
  },
  {
    slug: "liyakat-karnesi",
    term: "Liyakat Karnesi",
    definition: "Rozetlerinin ve sınav barajının sakin özeti. Okul karnesi değildir; iş garantisi yazmaz.",
    tezgahExample:
      "Karnede gördüğün boş satır, o dersin sınavının henüz geçilmediğini söyler. Tezgâh o satırı kendiliğinden doldurmaz.",
    toolHref: "/tezgah",
    toolLabel: "Eksik pratiği üret",
    examHref: "/career",
    examLabel: "Kariyer kartını aç",
  },
  {
    slug: "one-cikarma",
    term: "Öne çıkarma",
    definition:
      "Bir içeriğin aramada daha görünür olması. yetkin.ai sıralama satmaz. Metni sen yazarsın; sıra pazaryerinindir.",
    tezgahExample:
      "Reklam aracı başlık ve açıklama üretir. Öne çıkarma ücreti veya vitrin sırası bu metne eklenmez.",
    toolHref: "/tezgah?tool=reklam",
    toolLabel: "Reklam metni yaz",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "telif",
    term: "Telif",
    definition:
      "Metnin ve görselin kullanım hakkı. Tezgâh çıktısını kendi işinde kullanırsın; başkasının marka metnini kopyalamak telif hakkı doğurmaz.",
    tezgahExample:
      "Ürün açıklamasını kendi ürünün için yazdırırsın. Rakip sayfanın cümlesini olduğu gibi taşımazsın.",
    toolHref: "/tezgah?tool=pazaryeri",
    toolLabel: "Kendi ürün metnini yaz",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "yayinlama-hakki",
    term: "Yayınlama ve Kullanım Hakkı",
    definition:
      "Ürettiğin metni kendi mağazanda, teklifinde veya reklamında kullanma izni. Platform bu metni başkasına satmaz.",
    tezgahExample:
      "Tezgâh çıktısını indirip kendi kanalında yayınlarsın. Çıktının altında üretim kredisi durur; bu bir satış ortaklığı değildir.",
    toolHref: "/tezgah?tool=dukkan",
    toolLabel: "Yayınlanacak sayfayı üret",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "guvenlik-siginagi",
    term: "Güvenlik Sığınağı",
    definition: "Hesap güvenliğinin durduğu yer: şifre ve oturum. Kamu vitrini bu odaya açılmaz.",
    tezgahExample:
      "Web Site Analizi herkese açık ana sayfayı okur. Yönetici paneline, çereze ve şifreye girmez.",
    toolHref: "/tetkik",
    toolLabel: "Açık sayfayı analiz et",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
  {
    slug: "cirak-karnesi",
    term: "Çırak Karnesi",
    definition:
      "Genç öğrenme odasının ilerleme özeti. Yetişkin uzmanlık rozetiyle aynı belge değildir.",
    tezgahExample:
      "Yetişkin tezgâhı çırak karnesine puan yazmaz. Yetkinlik için YetkinCV testi ayrıdır.",
    toolHref: "/tezgah",
    toolLabel: "Yetişkin tezgâhı aç",
    examHref: "/career",
    examLabel: "Kariyer kartını aç",
  },
  {
    slug: "xp",
    term: "XP",
    definition:
      "Genç odada biriken gelişim puanı. Yetişkin sertifikası XP ile açılmaz. Puan satın alınmaz.",
    tezgahExample:
      "Tezgâh üretimi XP basmaz. Yetişkinde karşılığı, sınavı geçen doğrulanmış rozettir.",
    toolHref: "/tezgah",
    toolLabel: "Yetişkin üretim yap",
    examHref: "/tezgah",
    examLabel: "AI Tezgâh'ta devam et",
  },
] as const;

export function glossaryPath(slug: string): string {
  return `${GLOSSARY_PATH}/${slug}`;
}

export function glossaryTerm(slug: string): GlossaryTerm | null {
  return GLOSSARY_TERMS.find((term) => term.slug === slug) ?? null;
}
